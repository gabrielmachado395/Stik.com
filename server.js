require('dotenv').config();
const express = require('express');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const fetch = require('node-fetch');
const nodemailer = require('nodemailer');
const app = express();

const TRUST_PROXY_CONFIGURED = Boolean(process.env.TRUST_PROXY);

if (TRUST_PROXY_CONFIGURED) {
  app.set('trust proxy', process.env.TRUST_PROXY === 'true' ? 1 : process.env.TRUST_PROXY);
}

const PORT = process.env.PORT || 3000;
const ANALYTICS_DIR = path.join(__dirname, '.stik-analytics');
const ANALYTICS_FILE = path.join(ANALYTICS_DIR, 'analytics.json');
const RATE_LIMIT_MAX_BUCKETS = 10000;
const rateLimitBuckets = new Map();
const RECAPTCHA_TIMEOUT_MS = getPositiveIntEnv('RECAPTCHA_TIMEOUT_MS', 6000);
const EMAIL_API_TIMEOUT_MS = getPositiveIntEnv('EMAIL_API_TIMEOUT_MS', 12000);
const ALLOWED_ORIGIN_HOSTS = getConfiguredAllowedOriginHosts();

function getPositiveIntEnv(name, fallback) {
  const value = Number.parseInt(process.env[name], 10);
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

const ANALYTICS_LIMITS = {
  users: getPositiveIntEnv('ANALYTICS_MAX_USERS', 10000),
  contacts: getPositiveIntEnv('ANALYTICS_MAX_CONTACTS', 10000),
  productInterests: getPositiveIntEnv('ANALYTICS_MAX_PRODUCT_INTERESTS', 2000),
  devices: getPositiveIntEnv('ANALYTICS_MAX_DEVICES', 2000),
  locations: getPositiveIntEnv('ANALYTICS_MAX_LOCATIONS', 3000),
  productsPerUser: getPositiveIntEnv('ANALYTICS_MAX_PRODUCTS_PER_USER', 200),
  eventsPerRequest: getPositiveIntEnv('ANALYTICS_MAX_EVENTS_PER_REQUEST', 20)
};

// Middlewares de protecao antes dos arquivos estaticos.
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(self), camera=(), microphone=(), payment=(), usb=(), fullscreen=(self)');
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=15552000; includeSubDomains');
  }
  next();
});

app.use((req, res, next) => {
  if (req.method !== 'POST') return next();
  const origin = req.get('origin');
  if (!origin) {
    if (isLocalRequest(req)) return next();
    return res.status(403).json({ message: 'Origem da requisicao obrigatoria.' });
  }

  let originHost = '';
  try {
    originHost = new URL(origin).host.toLowerCase();
  } catch (error) {
    return res.status(403).json({ message: 'Origem da requisicao invalida.' });
  }

  if (!isRequestOriginAllowed(req, originHost)) {
    return res.status(403).json({ message: 'Origem da requisicao nao permitida.' });
  }

  return next();
});

app.use(express.json({ limit: '1mb' }));

app.use((err, req, res, next) => {
  if (err?.type === 'entity.too.large') {
    return res.status(413).json({ message: 'Payload muito grande.' });
  }
  if (err instanceof SyntaxError && 'body' in err) {
    return res.status(400).json({ message: 'JSON invalido.' });
  }
  return next(err);
});

function createRateLimiter({ windowMs, max, message }) {
  return (req, res, next) => {
    const key = `${req.method}:${req.path}:${getClientIp(req) || 'unknown'}`;
    const now = Date.now();
    pruneRateLimitBuckets(now);

    const bucket = rateLimitBuckets.get(key) || { count: 0, resetAt: now + windowMs };

    if (bucket.resetAt <= now) {
      bucket.count = 0;
      bucket.resetAt = now + windowMs;
    }

    bucket.count += 1;
    rateLimitBuckets.set(key, bucket);

    if (bucket.count > max) {
      return res.status(429).json({ message });
    }

    return next();
  };
}

function pruneRateLimitBuckets(now = Date.now()) {
  if (rateLimitBuckets.size <= RATE_LIMIT_MAX_BUCKETS) return;

  for (const [bucketKey, bucketValue] of rateLimitBuckets.entries()) {
    if (bucketValue.resetAt <= now) rateLimitBuckets.delete(bucketKey);
  }

  if (rateLimitBuckets.size <= RATE_LIMIT_MAX_BUCKETS) return;

  const overflow = rateLimitBuckets.size - RATE_LIMIT_MAX_BUCKETS;
  Array.from(rateLimitBuckets.entries())
    .sort((a, b) => a[1].resetAt - b[1].resetAt)
    .slice(0, overflow)
    .forEach(([bucketKey]) => rateLimitBuckets.delete(bucketKey));
}

function getComparableRequestHosts(req) {
  const hosts = [asString(req.get('host'), 255).toLowerCase()];
  if (TRUST_PROXY_CONFIGURED) {
    const forwardedHost = asString(req.get('x-forwarded-host'), 255).toLowerCase();
    if (forwardedHost) hosts.push(forwardedHost.split(',')[0].trim());
  }
  return hosts.filter(Boolean);
}

function normalizeOriginHost(value) {
  const raw = asString(value, 2000).trim();
  if (!raw) return '';
  try {
    const url = new URL(/^[a-z][a-z0-9+.-]*:\/\//i.test(raw) ? raw : `https://${raw}`);
    return url.host.toLowerCase();
  } catch (error) {
    return '';
  }
}

function getConfiguredAllowedOriginHosts() {
  const rawValues = [
    process.env.ALLOWED_ORIGINS,
    process.env.STIK_ALLOWED_ORIGINS,
    process.env.PUBLIC_SITE_URL,
    process.env.SITE_URL,
    process.env.APP_URL
  ];

  return new Set(rawValues
    .flatMap(value => asString(value, 4000).split(','))
    .map(normalizeOriginHost)
    .filter(Boolean));
}

function isRequestOriginAllowed(req, originHost) {
  if (ALLOWED_ORIGIN_HOSTS.size > 0) {
    return ALLOWED_ORIGIN_HOSTS.has(originHost);
  }
  return getComparableRequestHosts(req).includes(originHost);
}

function normalizeRequestPathForAccess(req) {
  const rawPath = String(req.path || '').replace(/\/+$/, '');
  let decodedPath = rawPath;
  try {
    decodedPath = decodeURIComponent(rawPath);
  } catch (error) {
    decodedPath = rawPath;
  }
  const normalized = path.posix.normalize(decodedPath.replace(/\\/g, '/'));
  return normalized.startsWith('/') ? normalized.toLowerCase() : `/${normalized.toLowerCase()}`;
}

function safeStringEquals(left, right) {
  const leftBuffer = Buffer.from(String(left || ''));
  const rightBuffer = Buffer.from(String(right || ''));
  return leftBuffer.length === rightBuffer.length && crypto.timingSafeEqual(leftBuffer, rightBuffer);
}

function hasDebugAccess(req) {
  if (isLocalRequest(req)) return true;
  const token = process.env.ANALYTICS_DEBUG_TOKEN;
  if (!token) return false;
  const provided = req.get('x-analytics-debug-token');
  return safeStringEquals(provided, token);
}

function shouldExposeApiDetails(req) {
  return process.env.DEBUG_API === 'true' && isLocalRequest(req);
}

app.use((req, res, next) => {
  const normalizedPath = normalizeRequestPathForAccess(req);
  if (/^\/(?:server\.js|package(?:-lock)?\.json|node_modules(?:\/|$)|\.stik-analytics(?:\/|$)|\.agents(?:\/|$)|\.artifacts(?:\/|$)|\.bg-shell(?:\/|$)|\.gsd(?:\/|$)|\.vscode(?:\/|$)|.*\.(?:md|lock|log|bak|old|tmp|map|config|ps1|sh|pem|key|crt|pfx|db|sqlite))$/i.test(normalizedPath)
    || normalizedPath.startsWith('/node_modules/')) {
    return res.status(404).send('Not found');
  }

  if (normalizedPath === '/dados_capturados' || normalizedPath === '/dados_capturados.html') {
    if (!hasDebugAccess(req)) {
      return res.status(403).send('Painel de insights de visitantes disponivel apenas em ambiente local ou com token de debug.');
    }
    res.setHeader('Cache-Control', 'no-store');
  }

  if ((normalizedPath === '/admin' || normalizedPath === '/admin.html' || normalizedPath === '/create-article' || normalizedPath === '/create-article.html')
    && !isLocalRequest(req)) {
    return res.status(403).send('Preview administrativo disponivel apenas em ambiente local.');
  }

  return next();
});

app.use('/api/analytics/collect', createRateLimiter({
  windowMs: 60 * 1000,
  max: 120,
  message: 'Limite de coleta temporaria atingido. Tente novamente em instantes.'
}));
app.use('/api/analytics/debug', createRateLimiter({
  windowMs: 60 * 1000,
  max: 30,
  message: 'Muitas consultas ao painel de dados. Tente novamente em instantes.'
}));
app.use('/api/send-contact', createRateLimiter({
  windowMs: 10 * 60 * 1000,
  max: 5,
  message: 'Muitas tentativas de contato. Tente novamente mais tarde.'
}));
app.use('/api/send-catalog', createRateLimiter({
  windowMs: 10 * 60 * 1000,
  max: 5,
  message: 'Muitas tentativas de envio de catalogo. Tente novamente mais tarde.'
}));
app.use('/api/send-location', createRateLimiter({
  windowMs: 10 * 60 * 1000,
  max: 10,
  message: 'Muitas tentativas de localizacao. Tente novamente mais tarde.'
}));

app.use(express.static(path.join(__dirname), { dotfiles: 'deny' }));

// helper para escapar HTML simples (proteção básica ao montar HTML)
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// cria transporter nodemailer se variáveis SMTP estiverem configuradas
function ensureAnalyticsStore() {
  if (!fs.existsSync(ANALYTICS_DIR)) {
    fs.mkdirSync(ANALYTICS_DIR, { recursive: true });
  }

  if (!fs.existsSync(ANALYTICS_FILE)) {
    const now = new Date().toISOString();
    const initialStore = {
      meta: {
        version: 'temporary-json-v4-limited',
        createdAt: now,
        updatedAt: now,
        note: 'Armazenamento temporario minimizado: cidade/estado, produto de interesse, email informado e dispositivo.',
        limits: ANALYTICS_LIMITS
      },
      users: [],
      contacts: [],
      productInterests: [],
      devices: [],
      locations: []
    };
    fs.writeFileSync(ANALYTICS_FILE, JSON.stringify(initialStore, null, 2), { encoding: 'utf8', mode: 0o600 });
    return initialStore;
  }

  const raw = fs.readFileSync(ANALYTICS_FILE, 'utf8');
  return JSON.parse(raw);
}

function writeAnalyticsStore(store) {
  store.meta.updatedAt = new Date().toISOString();
  const tempPath = `${ANALYTICS_FILE}.tmp`;
  fs.writeFileSync(tempPath, JSON.stringify(store, null, 2), { encoding: 'utf8', mode: 0o600 });
  fs.renameSync(tempPath, ANALYTICS_FILE);
}

function cleanValue(value, maxLength = 1200, depth = 0) {
  if (value === null || value === undefined) return null;
  if (typeof value === 'string') return value.trim().slice(0, maxLength);
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  if (typeof value === 'boolean') return value;
  if (depth > 4) return '[truncated]';
  if (Array.isArray(value)) {
    return value.slice(0, 50).map(item => cleanValue(item, maxLength, depth + 1));
  }
  if (typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).slice(0, 80).map(([key, item]) => [
      String(key).slice(0, 80),
      cleanValue(item, maxLength, depth + 1)
    ]));
  }
  return String(value).slice(0, maxLength);
}

function asString(value, maxLength = 255) {
  if (value === null || value === undefined) return '';
  return String(value).trim().slice(0, maxLength);
}

function normalizeEmail(value) {
  const email = asString(value, 320).toLowerCase();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : '';
}

function normalizeEmailList(value) {
  return String(value || '')
    .split(',')
    .map(item => normalizeEmail(item))
    .filter(Boolean);
}

function hasConfiguredEmailTransport() {
  return Boolean(
    (process.env.SMTP_HOST && process.env.SMTP_PORT && process.env.SMTP_USER && process.env.SMTP_PASS)
    || process.env.BREVO_API_KEY
  );
}

function sanitizeMailHeader(value, maxLength = 160) {
  return asString(value, maxLength).replace(/[\r\n]+/g, ' ');
}

function normalizePublicUrl(value, fallback = '/') {
  const raw = asString(value, 2000).trim();
  if (!raw || /[\u0000-\u001f\u007f]/.test(raw)) return fallback;
  if (/^(javascript|vbscript|data):/i.test(raw)) return fallback;
  if (/^(https?:)?\/\//i.test(raw)) {
    try {
      const url = new URL(raw, 'https://stik.local');
      return /^https?:$/i.test(url.protocol) ? raw : fallback;
    } catch (error) {
      return fallback;
    }
  }
  if (/^\/(?!\/)[^\s]*$/i.test(raw)) return raw;
  return fallback;
}

async function fetchWithTimeout(url, options = {}, timeoutMs = 8000) {
  if (typeof AbortController === 'undefined') {
    return fetch(url, { ...options, timeout: timeoutMs });
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

function normalizePlaceName(value, maxLength = 120) {
  const name = asString(value, maxLength).replace(/\s+/g, ' ');
  if (!name) return '';
  if (/[<>{}[\]\\/@=]|https?:/i.test(name)) return '';
  return name;
}

function isInvalidProvidedPlaceName(value) {
  const raw = asString(value, 120);
  return Boolean(raw && !normalizePlaceName(raw));
}

function detectBrowser(userAgent = '') {
  const ua = asString(userAgent, 500);
  if (/edg/i.test(ua)) return 'Edge';
  if (/opr|opera/i.test(ua)) return 'Opera';
  if (/firefox/i.test(ua)) return 'Firefox';
  if (/safari/i.test(ua) && !/chrome|chromium/i.test(ua)) return 'Safari';
  if (/chrome|chromium/i.test(ua)) return 'Chrome';
  return 'Nao informado';
}

function summarizeDevice(device = {}) {
  const viewport = device.viewport || {};
  const screen = device.screen || {};
  const width = Number(viewport.width || screen.width || 0);
  const type = width && width <= 768 ? 'Mobile' : width && width <= 1024 ? 'Tablet' : 'Desktop';

  return {
    type,
    platform: asString(device.platform || 'Nao informado', 80),
    browser: detectBrowser(device.userAgent),
    language: asString(device.language || device.languages?.[0] || 'Nao informado', 40),
    screen: {
      width: Number(screen.width) || null,
      height: Number(screen.height) || null
    },
    viewport: {
      width: Number(viewport.width) || null,
      height: Number(viewport.height) || null
    }
  };
}

function getDeviceKey(device) {
  return [
    device.type,
    device.platform,
    device.browser,
    device.language,
    device.screen.width,
    device.screen.height
  ].join('|');
}

function normalizeProductInterestItem(product = {}, now = new Date().toISOString()) {
  const productName = asString(product.productName, 180);
  if (!productName) return null;
  const views = Number(product.views) || 0;
  const clicks = Number(product.clicks) || 0;
  return {
    id: product.id || crypto.randomUUID(),
    productId: asString(product.productId || productName, 80),
    productName,
    category: asString(product.category, 120) || null,
    interestCount: Number(product.interestCount) || Math.max(views, clicks, 1),
    firstInterestedAt: product.firstInterestedAt || product.firstSeenAt || now,
    lastInterestedAt: product.lastInterestedAt || product.lastSeenAt || now
  };
}

function normalizeUserItem(user = {}, now = new Date().toISOString()) {
  const anonymousId = asString(user.anonymousId, 120);
  if (!anonymousId) return null;
  const products = Array.isArray(user.productInterests)
    ? user.productInterests.map(product => normalizeProductInterestItem(product, now)).filter(Boolean)
    : [];
  return {
    id: user.id || crypto.randomUUID(),
    anonymousId,
    email: normalizeEmail(user.email) || null,
    city: normalizePlaceName(user.city) || null,
    state: normalizePlaceName(user.state) || null,
    device: user.device ? summarizeDevice(user.device) : null,
    productInterests: products,
    firstSeenAt: user.firstSeenAt || now,
    lastSeenAt: user.lastSeenAt || now
  };
}

function getClientIp(req) {
  return req.ip || req.socket?.remoteAddress || req.connection?.remoteAddress || '';
}

function normalizeHostname(value) {
  const host = asString(value, 255).toLowerCase();
  if (!host) return '';
  if (host.startsWith('[')) {
    const end = host.indexOf(']');
    return end >= 0 ? host.slice(1, end) : host;
  }
  return host.split(':')[0];
}

function getRequestHostnames(req) {
  const hosts = [normalizeHostname(req.get('host'))];
  const forwardedHost = asString(req.get('x-forwarded-host'), 255);
  if (forwardedHost) {
    hosts.push(normalizeHostname(forwardedHost.split(',')[0]));
  }
  return hosts.filter(Boolean);
}

function isLocalHostname(hostname) {
  return !hostname || hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1';
}

function isLocalRequest(req) {
  if (process.env.NODE_ENV === 'production') return false;
  const ip = getClientIp(req);
  const isLocalIp = !ip || ip === '::1' || ip === '127.0.0.1' || ip === '::ffff:127.0.0.1';
  const hostnames = getRequestHostnames(req);
  return isLocalIp && hostnames.length > 0 && hostnames.every(isLocalHostname);
}

function upsertBy(store, collectionName, predicate, createItem, updateItem) {
  let item = store[collectionName].find(predicate);
  if (!item) {
    item = createItem();
    store[collectionName].push(item);
  }
  updateItem(item);
  return item;
}

function timestampOf(item, fields) {
  for (const field of fields) {
    const time = Date.parse(item?.[field] || '');
    if (!Number.isNaN(time)) return time;
  }
  return 0;
}

function normalizeIsoDate(value, fallback) {
  const time = Date.parse(asString(value, 80));
  return Number.isNaN(time) ? fallback : new Date(time).toISOString();
}

function limitCollection(items, maxItems, dateFields, scoreField = null) {
  if (!Array.isArray(items)) return [];
  return items
    .slice()
    .sort((a, b) => {
      if (scoreField) {
        const scoreDiff = (Number(b?.[scoreField]) || 0) - (Number(a?.[scoreField]) || 0);
        if (scoreDiff) return scoreDiff;
      }
      return timestampOf(b, dateFields) - timestampOf(a, dateFields);
    })
    .slice(0, maxItems);
}

function applyAnalyticsStoreLimits(store) {
  store.users = limitCollection(store.users, ANALYTICS_LIMITS.users, ['lastSeenAt', 'firstSeenAt']);
  store.contacts = limitCollection(store.contacts, ANALYTICS_LIMITS.contacts, ['lastSubmittedAt', 'firstSubmittedAt']);
  store.productInterests = limitCollection(store.productInterests, ANALYTICS_LIMITS.productInterests, ['lastInterestedAt', 'firstInterestedAt'], 'interestCount');
  store.devices = limitCollection(store.devices, ANALYTICS_LIMITS.devices, ['lastSeenAt', 'firstSeenAt'], 'count');
  store.locations = limitCollection(store.locations, ANALYTICS_LIMITS.locations, ['lastCollectedAt', 'firstCollectedAt'], 'count');

  store.users.forEach(user => {
    user.productInterests = limitCollection(
      user.productInterests,
      ANALYTICS_LIMITS.productsPerUser,
      ['lastInterestedAt', 'firstInterestedAt'],
      'interestCount'
    );
  });

  store.meta.limits = ANALYTICS_LIMITS;
  return store;
}

function normalizeTemporaryAnalyticsStore(store) {
  const now = new Date().toISOString();
  const next = {
    meta: {
      version: 'temporary-json-v4-limited',
      createdAt: store?.meta?.createdAt || now,
      updatedAt: store?.meta?.updatedAt || now,
      note: 'Armazenamento temporario minimizado com visao por usuario: cidade/estado, produto de interesse, email informado e dispositivo.',
      limits: ANALYTICS_LIMITS
    },
    users: Array.isArray(store?.users) ? store.users.map(user => normalizeUserItem(user, now)).filter(Boolean) : [],
    contacts: [],
    productInterests: [],
    devices: Array.isArray(store?.devices) ? store.devices : [],
    locations: Array.isArray(store?.locations) ? store.locations : []
  };

  const contactSources = Array.isArray(store?.contacts)
    ? store.contacts
    : (Array.isArray(store?.leads) ? store.leads : []);
  contactSources.forEach(contact => {
    const email = normalizeEmail(contact.email);
    if (!email) return;
    upsertBy(
      next,
      'contacts',
      item => item.email === email,
      () => ({
        id: contact.id || crypto.randomUUID(),
        email,
        firstSubmittedAt: contact.firstSubmittedAt || contact.lastSubmittedAt || now,
        lastSubmittedAt: contact.lastSubmittedAt || contact.firstSubmittedAt || now
      }),
      item => {
        item.lastSubmittedAt = contact.lastSubmittedAt || contact.firstSubmittedAt || item.lastSubmittedAt || now;
      }
    );
  });

  if (Array.isArray(store?.productInterests)) {
    store.productInterests.forEach(product => {
      const productName = asString(product.productName, 180);
      if (!productName) return;
      const views = Number(product.views) || 0;
      const clicks = Number(product.clicks) || 0;
      const interestCount = Number(product.interestCount) || Math.max(views, clicks, 1);
      const productId = asString(product.productId || productName, 80);
      const category = asString(product.category, 120) || null;
      upsertBy(
        next,
        'productInterests',
        item => item.productId === productId && item.productName === productName && item.category === category,
        () => ({
          id: product.id || crypto.randomUUID(),
          productId,
          productName,
          category,
          interestCount: 0,
          firstInterestedAt: product.firstInterestedAt || product.firstSeenAt || now,
          lastInterestedAt: product.lastInterestedAt || product.lastSeenAt || now
        }),
        item => {
          item.interestCount += interestCount;
          item.lastInterestedAt = product.lastInterestedAt || product.lastSeenAt || item.lastInterestedAt || now;
        }
      );
    });
  }

  if (!next.productInterests.length && Array.isArray(store?.events)) {
    store.events.forEach(event => {
      if (event.eventName !== 'product_view') return;
      const productName = asString(event.productName || event.metadata?.productName, 180);
      if (!productName) return;
      const productId = asString(event.productId || event.metadata?.productId || productName, 80);
      const category = asString(event.category || event.metadata?.category || '', 120);
      const occurredAt = normalizeIsoDate(event.occurredAt, now);
      upsertBy(
        next,
        'productInterests',
        item => item.productId === productId && item.productName === productName && item.category === (category || null),
        () => ({
          id: crypto.randomUUID(),
          productId,
          productName,
          category: category || null,
          interestCount: 0,
          firstInterestedAt: occurredAt,
          lastInterestedAt: occurredAt
        }),
        item => {
          item.interestCount += 1;
          item.lastInterestedAt = occurredAt;
        }
      );
    });
  }

  if (!next.devices.length) {
    const legacyDevices = [
      ...(Array.isArray(store?.sessions) ? store.sessions.map(session => session.device) : []),
      ...(Array.isArray(store?.visitors) ? store.visitors.map(visitor => visitor.lastDevice) : [])
    ].filter(Boolean);

    legacyDevices.forEach(devicePayload => {
      const device = summarizeDevice(devicePayload);
      const key = getDeviceKey(device);
      upsertBy(
        next,
        'devices',
        item => item.key === key,
        () => ({
          id: crypto.randomUUID(),
          key,
          ...device,
          count: 0,
          firstSeenAt: now,
          lastSeenAt: now
        }),
        item => {
          item.count += 1;
          item.lastSeenAt = now;
        }
      );
    });
  }

  next.locations = next.locations
    .map(location => ({
      id: location.id || crypto.randomUUID(),
      city: normalizePlaceName(location.city) || null,
      state: normalizePlaceName(location.state) || null,
      count: Number(location.count) || 1,
      firstCollectedAt: location.firstCollectedAt || location.collectedAt || now,
      lastCollectedAt: location.lastCollectedAt || location.collectedAt || now
    }))
    .filter(location => location.city || location.state);

  return applyAnalyticsStoreLimits(next);
}

function recordTemporaryAnalytics(req, payload = {}, options = {}) {
  const store = normalizeTemporaryAnalyticsStore(ensureAnalyticsStore());
  const now = new Date().toISOString();
  const allowLead = options.allowLead === true;
  const allowLocation = options.allowLocation === true;
  const analytics = cleanValue(payload.analytics || {});
  const visitorPayload = cleanValue(payload.visitor || {});
  const anonymousId = asString(
    visitorPayload.anonymousId || visitorPayload.anonymous_id || analytics.visitorId || analytics.anonymousId,
    120
  );

  let user = null;
  if (anonymousId) {
    user = upsertBy(
      store,
      'users',
      item => item.anonymousId === anonymousId,
      () => ({
        id: crypto.randomUUID(),
        anonymousId,
        email: null,
        city: null,
        state: null,
        device: null,
        productInterests: [],
        firstSeenAt: now,
        lastSeenAt: now
      }),
      item => {
        item.lastSeenAt = now;
      }
    );
  }

  if (analytics.device) {
    const device = summarizeDevice(analytics.device);
    const key = getDeviceKey(device);
    if (user) user.device = device;
    upsertBy(
      store,
      'devices',
      item => item.key === key,
      () => ({
        id: crypto.randomUUID(),
        key,
        ...device,
        count: 0,
        firstSeenAt: now,
        lastSeenAt: now
      }),
      item => {
        item.count += 1;
        item.lastSeenAt = now;
      }
    );
  }

  if (allowLead) {
    const leadPayload = cleanValue(payload.lead || {});
    const email = normalizeEmail(leadPayload.email);
    if (email) {
      if (user) {
        user.email = email;
        user.lastSeenAt = now;
      }
      upsertBy(
        store,
        'contacts',
        item => item.email === email,
        () => ({
          id: crypto.randomUUID(),
          email,
          firstSubmittedAt: now,
          lastSubmittedAt: now
        }),
        item => {
          item.lastSubmittedAt = now;
        }
      );
    }
  }

  const events = (Array.isArray(payload.events) ? payload.events : [payload.event].filter(Boolean))
    .slice(0, ANALYTICS_LIMITS.eventsPerRequest);
  events.forEach(item => {
    const event = cleanValue(item || {});
    const eventName = asString(event.eventName || event.event_name || event.name, 120);
    if (eventName !== 'product_view') return;
    const occurredAt = normalizeIsoDate(event.occurredAt, now);
    const productName = asString(event.productName || event.product_name, 180);
    if (!productName) return;
    const productId = asString(event.productId || event.product_id || productName, 80);
    const category = asString(event.category, 120);
    if (user) {
      upsertBy(
        user,
        'productInterests',
        item => item.productId === productId && item.productName === productName && item.category === (category || null),
        () => ({
          id: crypto.randomUUID(),
          productId,
          productName,
          category: category || null,
          interestCount: 0,
          firstInterestedAt: occurredAt,
          lastInterestedAt: occurredAt
        }),
        product => {
          product.interestCount += 1;
          product.lastInterestedAt = occurredAt;
        }
      );
      user.lastSeenAt = occurredAt;
    }

    upsertBy(
      store,
      'productInterests',
      item => item.productId === productId && item.productName === productName && item.category === (category || null),
      () => ({
        id: crypto.randomUUID(),
        productId,
        productName,
        category: category || null,
        interestCount: 0,
        firstInterestedAt: occurredAt,
        lastInterestedAt: occurredAt
      }),
      product => {
        product.interestCount += 1;
        product.lastInterestedAt = occurredAt;
      }
    );
  });

  if (allowLocation && payload.location) {
    const location = cleanValue(payload.location);
    const city = normalizePlaceName(location.city);
    const state = normalizePlaceName(location.state);
    if (city || state) {
      if (user) {
        user.city = city || user.city || null;
        user.state = state || user.state || null;
        user.lastSeenAt = now;
      }
      upsertBy(
        store,
        'locations',
        item => item.city === (city || null) && item.state === (state || null),
        () => ({
          id: crypto.randomUUID(),
          city: city || null,
          state: state || null,
          count: 0,
          firstCollectedAt: now,
          lastCollectedAt: now
        }),
        item => {
          item.count += 1;
          item.lastCollectedAt = now;
        }
      );
    }
  }

  applyAnalyticsStoreLimits(store);
  writeAnalyticsStore(store);
  return {
    counts: {
      users: store.users.length,
      contacts: store.contacts.length,
      productInterests: store.productInterests.length,
      devices: store.devices.length,
      locations: store.locations.length
    },
    limits: ANALYTICS_LIMITS
  };
}

app.post('/api/analytics/collect', (req, res) => {
  try {
    recordTemporaryAnalytics(req, req.body || {});
    return res.json({ ok: true });
  } catch (err) {
    console.error('Falha ao salvar analytics temporario:', err);
    return res.status(500).json({ ok: false, message: 'Erro ao salvar analytics temporario.' });
  }
});

app.get('/api/analytics/debug', (req, res) => {
  if (!hasDebugAccess(req)) {
    return res.status(403).json({ message: 'Debug de analytics disponivel apenas em ambiente local ou com token.' });
  }

  try {
    const store = normalizeTemporaryAnalyticsStore(ensureAnalyticsStore());
    res.setHeader('Cache-Control', 'no-store');
    return res.json(store);
  } catch (err) {
    console.error('Falha ao ler analytics temporario:', err);
    return res.status(500).json({ message: 'Erro ao ler analytics temporario.' });
  }
});

function createSmtpTransporter() {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : undefined;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!host || !port || !user || !pass) return null;

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465, // true for 465, false for other ports
    auth: {
      user,
      pass
    }
  });
}

// função utilitária para enviar e-mail, decide entre SMTP (nodemailer) e Brevo API
async function sendEmail({ from, to, subject, html }) {
  const toList = normalizeEmailList(Array.isArray(to) ? to.join(',') : to);
  const fromEmail = normalizeEmail(from?.email || process.env.FROM_EMAIL || 'no-reply@stik.com');
  const fromName = sanitizeMailHeader(from?.name || 'Stik', 80);
  const safeSubject = sanitizeMailHeader(subject || 'Mensagem Stik');

  if (!toList.length) {
    const err = new Error('Nenhum destinatario valido configurado.');
    err.status = 500;
    throw err;
  }

  if (!fromEmail) {
    const err = new Error('Remetente invalido ou nao configurado.');
    err.status = 500;
    throw err;
  }

  // tenta SMTP primeiro se configurado
  const transporter = createSmtpTransporter();
  if (transporter) {
    try {
      const info = await transporter.sendMail({
        from: `${fromName} <${fromEmail}>`,
        to: toList.join(','),
        subject: safeSubject,
        html
      });
      console.log('E-mail enviado via SMTP:', info && info.messageId);
      return { ok: true, via: 'smtp', info };
    } catch (err) {
      console.error('Erro ao enviar via SMTP, fallback para Brevo API se disponível:', err);
      // continua e tenta Brevo se configurado
    }
  }

  // fallback para Brevo API (REST) se chave presente
  const BREVO_API_KEY = process.env.BREVO_API_KEY;
  if (!BREVO_API_KEY) {
    throw new Error('Nenhum método de envio configurado (SMTP or BREVO_API_KEY).');
  }

  const payload = {
    sender: { name: fromName, email: fromEmail },
    to: toList.map(email => ({ email })),
    subject: safeSubject,
    htmlContent: html
  };

  const response = await fetchWithTimeout('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-key': BREVO_API_KEY
    },
    body: JSON.stringify(payload)
  }, EMAIL_API_TIMEOUT_MS);

  const text = await response.text();
  let json = null;
  try { json = JSON.parse(text); } catch (e) { }

  if (!response.ok) {
    const err = new Error('Falha no envio via Brevo API');
    err.status = response.status;
    err.detail = json || text;
    throw err;
  }

  console.log('E-mail enviado via Brevo API:', text);
  return { ok: true, via: 'brevo', detail: json || text };
}

function publicEmailResult(result, extra = {}) {
  return {
    ok: Boolean(result?.ok),
    via: result?.via || 'email',
    ...extra
  };
}

// Rota para enviar mensagem do formulário "Fale Conosco"
app.post('/api/send-contact', async (req, res) => {
  const cleanName = asString(req.body?.name, 120);
  const cleanEmail = normalizeEmail(req.body?.email);
  const cleanMessage = asString(req.body?.message, 5000);

  if (!cleanName || !cleanEmail || !cleanMessage) {
    return res.status(400).json({ message: 'Por favor preencha nome, e-mail valido e mensagem.' });
  }

  // valida reCAPTCHA se configurado
  const recaptchaToken = req.body.recaptchaToken;
  if (process.env.RECAPTCHA_SECRET) {
    if (!recaptchaToken) {
      return res.status(400).json({ message: 'reCAPTCHA não provido.' });
    }
    try {
      const params = new URLSearchParams();
      params.append('secret', process.env.RECAPTCHA_SECRET);
      params.append('response', recaptchaToken);

      const r = await fetchWithTimeout('https://www.google.com/recaptcha/api/siteverify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString()
      }, RECAPTCHA_TIMEOUT_MS);
      const verification = await r.json();
      if (!verification.success || (verification.score !== undefined && verification.score < 0.3)) {
        console.error('reCAPTCHA falhou:', verification);
        return res.status(403).json({ message: 'Falha na verificação reCAPTCHA.' });
      }
    } catch (err) {
      console.error('Erro ao verificar reCAPTCHA:', err);
      return res.status(500).json({ message: 'Erro ao verificar reCAPTCHA.' });
    }
  }

  if (!hasConfiguredEmailTransport()) {
    return res.status(500).json({ message: 'Servidor nao configurado para envio de e-mail.' });
  }

  try {
    const receiver = normalizeEmailList(process.env.CONTACT_RECEIVER || process.env.FROM_EMAIL);
    if (!receiver.length) {
      return res.status(500).json({ message: 'Destinatario de contato nao configurado.' });
    }
    const html = `
        <p>Você recebeu uma nova mensagem pelo formulário Fale Conosco:</p>
        <p><strong>Nome:</strong> ${escapeHtml(cleanName)}</p>
        <p><strong>E-mail:</strong> ${escapeHtml(cleanEmail)}</p>
        <p><strong>Mensagem:</strong><br/>${escapeHtml(cleanMessage).replace(/\n/g, '<br/>')}</p>
      `;

    const result = await sendEmail({
      from: { name: 'Stik', email: process.env.FROM_EMAIL || 'no-reply@stik.com' },
      to: receiver,
      subject: `Contato via site: ${cleanName}`,
      html
    });

    try {
      recordTemporaryAnalytics(req, {
        analytics: req.body.analytics,
        lead: {
          email: cleanEmail
        }
      }, { allowLead: true });
    } catch (err) {
      console.error('Falha ao salvar contato no analytics temporario:', err);
    }

    return res.json({
      message: 'Mensagem enviada com sucesso. Entraremos em contato em breve.',
      result: publicEmailResult(result)
    });
  } catch (err) {
    console.error('Erro ao enviar e-mail via contact route:', err);
    const status = err.status || 500;
    const message = status === 500 ? 'Erro interno ao enviar mensagem.' : 'Falha ao enviar mensagem.';
    if (shouldExposeApiDetails(req)) {
      return res.status(status).json({ message, detail: err.detail || err.message });
    }
    return res.status(status).json({ message });
  }
});


// Rota para enviar catálogo
app.post('/api/send-catalog', async (req, res) => {
    const cleanEmail = normalizeEmail(req.body?.email);
  const consent = req.body && (req.body.consent === true || req.body.consent === 'true');
    if (!cleanEmail) {
        return res.status(400).json({ message: 'E-mail inválido.' });
    }

  // valida consentimento explícito
  if (!consent) {
    return res.status(400).json({ message: 'Consentimento obrigatório para envio do catálogo. Marque a caixa de consentimento.' });
  }

    // valida reCAPTCHA se configurado
    const recaptchaToken = req.body.recaptchaToken;
    if (process.env.RECAPTCHA_SECRET) {
        if (!recaptchaToken) {
            return res.status(400).json({ message: 'reCAPTCHA não provido.' });
        }

        // valida com a API do Google
        try {
            const params = new URLSearchParams();
            params.append('secret', process.env.RECAPTCHA_SECRET);
            params.append('response', recaptchaToken);

            const r = await fetchWithTimeout('https://www.google.com/recaptcha/api/siteverify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: params.toString()
            }, RECAPTCHA_TIMEOUT_MS);
            const verification = await r.json();
            if (!verification.success || (verification.score !== undefined && verification.score < 0.3)) {
                console.error('reCAPTCHA falhou:', verification);
                return res.status(403).json({ message: 'Falha na verificação reCAPTCHA.' });
            }
        } catch (err) {
            console.error('Erro ao verificar reCAPTCHA:', err);
            return res.status(500).json({ message: 'Erro ao verificar reCAPTCHA.' });
        }
    }

    if (!hasConfiguredEmailTransport()) {
        return res.status(500).json({ message: 'Servidor nao configurado para envio de e-mail.' });
    }

    try {
    const catalogUrl = escapeHtml(normalizePublicUrl(process.env.CATALOG_URL || '/catalogo.html', '/catalogo.html'));
    const html = `<p>Olá,</p><p>Obrigado pelo interesse. Clique no link abaixo para baixar nosso catálogo.</p><p><a href="${catalogUrl}">Baixar Catálogo</a></p><p>Atenciosamente,<br/>Stik</p>`;

    const result = await sendEmail({
      from: { name: 'Stik', email: process.env.FROM_EMAIL || 'no-reply@stik.com' },
      to: cleanEmail,
      subject: 'Seu catálogo Stik',
      html
    });

    try {
      recordTemporaryAnalytics(req, {
        analytics: req.body.analytics,
        lead: {
          email: cleanEmail
        }
      }, { allowLead: true });
    } catch (err) {
      console.error('Falha ao salvar catalogo no analytics temporario:', err);
    }

    return res.json({
      message: 'E-mail enviado com sucesso.',
      result: publicEmailResult(result)
    });
    } catch (err) {
    console.error('Erro ao enviar e-mail via catalog route:', err);
    const status = err.status || 500;
    const message = status === 500 ? 'Erro interno ao enviar e-mail.' : 'Falha ao enviar e-mail.';
    if (shouldExposeApiDetails(req)) {
      return res.status(status).json({ message, detail: err.detail || err.message });
    }
    return res.status(status).json({ message });
    }
});

// Rota para enviar localização do usuário
app.post('/api/send-location', async (req, res) => {
  if (isInvalidProvidedPlaceName(req.body?.city) || isInvalidProvidedPlaceName(req.body?.state)) {
    return res.status(400).json({ message: 'Dados de localizacao invalidos.' });
  }

  const city = normalizePlaceName(req.body?.city);
  const state = normalizePlaceName(req.body?.state);
  const hasApproximateLocation = Boolean(city || state);

  if (!hasApproximateLocation) {
    return res.status(400).json({ message: 'Dados de localização inválidos.' });
  }

  try {
    recordTemporaryAnalytics(req, {
      analytics: req.body.analytics,
      location: {
        city,
        state
      }
    }, { allowLocation: true });
  } catch (err) {
    console.error('Falha ao salvar localizacao no analytics temporario:', err);
  }
  if (!hasConfiguredEmailTransport()) {
    return res.json({
      message: 'Localizacao registrada no JSON temporario. Envio por e-mail ignorado porque o servidor nao esta configurado para envio.',
      result: { stored: true, emailSent: false }
    });
  }

  try {
    const receiver = normalizeEmailList(process.env.LOCATION_RECEIVER || process.env.CONTACT_RECEIVER || process.env.FROM_EMAIL);
    if (!receiver.length) {
      return res.json({
        message: 'Localizacao registrada no JSON temporario. Nenhum destinatario configurado para envio por e-mail.',
        result: { stored: true, emailSent: false }
      });
    }

    const subject = 'Localização do usuário - Stik';
    const htmlContent = `
      <p>Recebemos dados de localização do usuário:</p>
      <ul>
        ${city ? `<li><strong>Cidade:</strong> ${escapeHtml(city)}</li>` : ''}
        ${state ? `<li><strong>Estado:</strong> ${escapeHtml(state)}</li>` : ''}
      </ul>
    `;

    console.log('Enviando localização, tentando enviar via sendEmail (SMTP/Brevo)');
    try {
      const result = await sendEmail({
        from: { name: 'Stik', email: process.env.FROM_EMAIL || 'no-reply@stik.com' },
        to: receiver,
        subject,
        html: htmlContent
      });

      return res.json({
        message: 'Localizacao enviada com sucesso.',
        result: publicEmailResult(result, { stored: true, emailSent: true })
      });
    } catch (err) {
      console.error('Erro ao enviar localização via sendEmail:', err);
      const status = err.status || 500;
      const message = status === 500 ? 'Erro interno ao enviar e-mail de localização.' : 'Falha ao enviar e-mail de localização.';
      if (shouldExposeApiDetails(req)) {
        return res.status(status).json({ message, detail: err.detail || err.message });
      }
      return res.status(status).json({ message });
    }
  } catch (err) {
    console.error('Erro ao enviar e-mail via Brevo (location):', err);
    return res.status(500).json({ message: 'Erro interno ao enviar e-mail de localização.' });
  }
});

// rota para expor configurações públicas (ex.: site key do reCAPTCHA)
app.get('/api/config', (req, res) => {
  res.json({
    recaptchaSiteKey: process.env.RECAPTCHA_SITE_KEY || null
  });
});

app.listen(PORT, () => {
    console.log(`Server rodando na porta ${PORT}`);
});

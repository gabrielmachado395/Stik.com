require('dotenv').config();
const express = require('express');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const fetch = require('node-fetch');
const nodemailer = require('nodemailer');
const app = express();

const PORT = process.env.PORT || 3000;
const ANALYTICS_DIR = path.join(__dirname, '.stik-analytics');
const ANALYTICS_FILE = path.join(ANALYTICS_DIR, 'analytics.json');

app.use(express.json({ limit: '1mb' }));

// Serve arquivos estáticos (site)
app.use(express.static(path.join(__dirname)));

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
        version: 'temporary-json-v1',
        createdAt: now,
        updatedAt: now,
        note: 'Armazenamento temporario minimizado: cidade/estado, produto de interesse, email informado e dispositivo.'
      },
      users: [],
      contacts: [],
      productInterests: [],
      devices: [],
      locations: []
    };
    fs.writeFileSync(ANALYTICS_FILE, JSON.stringify(initialStore, null, 2), 'utf8');
    return initialStore;
  }

  const raw = fs.readFileSync(ANALYTICS_FILE, 'utf8');
  return JSON.parse(raw);
}

function writeAnalyticsStore(store) {
  store.meta.updatedAt = new Date().toISOString();
  const tempPath = `${ANALYTICS_FILE}.tmp`;
  fs.writeFileSync(tempPath, JSON.stringify(store, null, 2), 'utf8');
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
    city: asString(user.city, 120) || null,
    state: asString(user.state, 120) || null,
    device: user.device ? summarizeDevice(user.device) : null,
    productInterests: products,
    firstSeenAt: user.firstSeenAt || now,
    lastSeenAt: user.lastSeenAt || now
  };
}

function getClientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) return String(forwarded).split(',')[0].trim();
  return req.socket?.remoteAddress || req.connection?.remoteAddress || req.ip || '';
}

function isLocalRequest(req) {
  const ip = getClientIp(req);
  return !ip || ip === '::1' || ip === '127.0.0.1' || ip === '::ffff:127.0.0.1';
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

function normalizeTemporaryAnalyticsStore(store) {
  const now = new Date().toISOString();
  const next = {
    meta: {
      version: 'temporary-json-v3-users',
      createdAt: store?.meta?.createdAt || now,
      updatedAt: store?.meta?.updatedAt || now,
      note: 'Armazenamento temporario minimizado com visao por usuario: cidade/estado, produto de interesse, email informado e dispositivo.'
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
          firstInterestedAt: event.occurredAt || now,
          lastInterestedAt: event.occurredAt || now
        }),
        item => {
          item.interestCount += 1;
          item.lastInterestedAt = event.occurredAt || item.lastInterestedAt;
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
      city: asString(location.city, 120) || null,
      state: asString(location.state, 120) || null,
      count: Number(location.count) || 1,
      firstCollectedAt: location.firstCollectedAt || location.collectedAt || now,
      lastCollectedAt: location.lastCollectedAt || location.collectedAt || now
    }))
    .filter(location => location.city || location.state);

  return next;
}

function recordTemporaryAnalytics(req, payload = {}) {
  const store = normalizeTemporaryAnalyticsStore(ensureAnalyticsStore());
  const now = new Date().toISOString();
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

  const events = Array.isArray(payload.events) ? payload.events : [payload.event].filter(Boolean);
  events.forEach(item => {
    const event = cleanValue(item || {});
    const eventName = asString(event.eventName || event.event_name || event.name, 120);
    if (eventName !== 'product_view') return;
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
          firstInterestedAt: event.occurredAt || now,
          lastInterestedAt: event.occurredAt || now
        }),
        product => {
          product.interestCount += 1;
          product.lastInterestedAt = event.occurredAt || now;
        }
      );
      user.lastSeenAt = event.occurredAt || now;
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
        firstInterestedAt: event.occurredAt || now,
        lastInterestedAt: event.occurredAt || now
      }),
      product => {
        product.interestCount += 1;
        product.lastInterestedAt = event.occurredAt || now;
      }
    );
  });

  if (payload.location) {
    const location = cleanValue(payload.location);
    const city = asString(location.city, 120);
    const state = asString(location.state, 120);
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

  writeAnalyticsStore(store);
  return {
    file: ANALYTICS_FILE,
    counts: {
      users: store.users.length,
      contacts: store.contacts.length,
      productInterests: store.productInterests.length,
      devices: store.devices.length,
      locations: store.locations.length
    }
  };
}

app.post('/api/analytics/collect', (req, res) => {
  try {
    const result = recordTemporaryAnalytics(req, req.body || {});
    return res.json({ ok: true, result });
  } catch (err) {
    console.error('Falha ao salvar analytics temporario:', err);
    return res.status(500).json({ ok: false, message: 'Erro ao salvar analytics temporario.' });
  }
});

app.get('/api/analytics/debug', (req, res) => {
  if (process.env.NODE_ENV === 'production' && process.env.DEBUG_ANALYTICS !== 'true' && !isLocalRequest(req)) {
    return res.status(403).json({ message: 'Debug de analytics desabilitado em producao.' });
  }

  try {
    const store = normalizeTemporaryAnalyticsStore(ensureAnalyticsStore());
    writeAnalyticsStore(store);
    return res.json({ file: ANALYTICS_FILE, ...store });
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
  // to can be array of addresses or single address
  const toList = Array.isArray(to) ? to : [to];

  // tenta SMTP primeiro se configurado
  const transporter = createSmtpTransporter();
  if (transporter) {
    try {
      const info = await transporter.sendMail({
        from: `${from.name || ''} <${from.email}>`,
        to: toList.map(t => (typeof t === 'object' ? t.email || t : t)).join(','),
        subject,
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
    sender: { name: from.name || 'Stik', email: from.email || process.env.FROM_EMAIL || 'no-reply@stik.com' },
    to: toList.map(t => (typeof t === 'object' ? { email: t.email || t } : { email: t })),
    subject,
    htmlContent: html
  };

  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-key': BREVO_API_KEY
    },
    body: JSON.stringify(payload)
  });

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

// Rota para enviar mensagem do formulário "Fale Conosco"
app.post('/api/send-contact', async (req, res) => {
  const { name, email, message } = req.body || {};
  if (!name || !email || !message) {
    return res.status(400).json({ message: 'Por favor preencha nome, e-mail e mensagem.' });
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

      const r = await fetch('https://www.google.com/recaptcha/api/siteverify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString()
      });
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

  try {
    recordTemporaryAnalytics(req, {
      analytics: req.body.analytics,
      lead: {
        email
      }
    });
  } catch (err) {
    console.error('Falha ao salvar contato no analytics temporario:', err);
  }

  const BREVO_API_KEY = process.env.BREVO_API_KEY;
  if (!BREVO_API_KEY) {
    return res.status(500).json({ message: 'Servidor não configurado (falta BREVO_API_KEY).' });
  }

  try {
    const receiver = process.env.CONTACT_RECEIVER || process.env.FROM_EMAIL;
    const html = `
        <p>Você recebeu uma nova mensagem pelo formulário Fale Conosco:</p>
        <p><strong>Nome:</strong> ${escapeHtml(name)}</p>
        <p><strong>E-mail:</strong> ${escapeHtml(email)}</p>
        <p><strong>Mensagem:</strong><br/>${escapeHtml(message).replace(/\n/g, '<br/>')}</p>
      `;

    const result = await sendEmail({
      from: { name: 'Stik', email: process.env.FROM_EMAIL || 'no-reply@stik.com' },
      to: receiver,
      subject: `Contato via site: ${escapeHtml(name)}`,
      html
    });

    return res.json({ message: 'Mensagem enviada com sucesso. Entraremos em contato em breve.', result });
  } catch (err) {
    console.error('Erro ao enviar e-mail via contact route:', err);
    const status = err.status || 500;
    const message = status === 500 ? 'Erro interno ao enviar mensagem.' : 'Falha ao enviar mensagem.';
    if (process.env.DEBUG_API === 'true') {
      return res.status(status).json({ message, detail: err.detail || err.message });
    }
    return res.status(status).json({ message });
  }
});


// Rota para enviar catálogo
app.post('/api/send-catalog', async (req, res) => {
    const { email } = req.body || {};
  const consent = req.body && (req.body.consent === true || req.body.consent === 'true');
    if (!email || typeof email !== 'string') {
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

            const r = await fetch('https://www.google.com/recaptcha/api/siteverify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: params.toString()
            });
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

    try {
      recordTemporaryAnalytics(req, {
        analytics: req.body.analytics,
        lead: {
          email
        }
      });
    } catch (err) {
      console.error('Falha ao salvar catalogo no analytics temporario:', err);
    }

    const BREVO_API_KEY = process.env.BREVO_API_KEY;
    if (!BREVO_API_KEY) {
        return res.status(500).json({ message: 'Servidor nao configurado (falta BREVO_API_KEY).' });
    }

    try {
        // Monta payload para a API de SMTP transactional (senders) da Brevo
        // Usamos a endpoint /smtp/email da Brevo (REST)
        const payload = {
            sender: { name: 'Stik', email: process.env.FROM_EMAIL || 'no-reply@stik.com' },
            to: [{ email }],
            subject: 'Seu catálogo Stik',
            htmlContent: `<p>Olá,</p><p>Obrigado pelo interesse. Clique no link abaixo para baixar nosso catálogo.</p><p><a href="${process.env.CATALOG_URL || '/catalogo.html'}">Baixar Catálogo</a></p><p>Atenciosamente,<br/>Stik</p>`
        };

    const html = `<p>Olá,</p><p>Obrigado pelo interesse. Clique no link abaixo para baixar nosso catálogo.</p><p><a href="${process.env.CATALOG_URL || '/catalogo.html'}">Baixar Catálogo</a></p><p>Atenciosamente,<br/>Stik</p>`;

    const result = await sendEmail({
      from: { name: 'Stik', email: process.env.FROM_EMAIL || 'no-reply@stik.com' },
      to: email,
      subject: 'Seu catálogo Stik',
      html
    });

    return res.json({ message: 'E-mail enviado com sucesso.', result });
    } catch (err) {
    console.error('Erro ao enviar e-mail via catalog route:', err);
    const status = err.status || 500;
    const message = status === 500 ? 'Erro interno ao enviar e-mail.' : 'Falha ao enviar e-mail.';
    if (process.env.DEBUG_API === 'true') {
      return res.status(status).json({ message, detail: err.detail || err.message });
    }
    return res.status(status).json({ message });
    }
});

// Rota para enviar localização do usuário
app.post('/api/send-location', async (req, res) => {
  const { city, state, to } = req.body || {};
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
    });
  } catch (err) {
    console.error('Falha ao salvar localizacao no analytics temporario:', err);
  }
  const BREVO_API_KEY = process.env.BREVO_API_KEY;
  if (!BREVO_API_KEY) {
    return res.json({
      message: 'Localizacao registrada no JSON temporario. Envio por e-mail ignorado porque BREVO_API_KEY nao esta configurada.',
      result: { stored: true, emailSent: false }
    });
  }

  try {
    const receiver = to || process.env.LOCATION_RECEIVER || process.env.CONTACT_RECEIVER || process.env.FROM_EMAIL;
    if (!receiver) {
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

    const payload = {
      sender: { name: 'Stik', email: process.env.FROM_EMAIL || 'no-reply@stik.com' },
      to: [{ email: receiver }],
      subject,
      htmlContent: htmlContent
    };

    console.log('Enviando localização, tentando enviar via sendEmail (SMTP/Brevo)');
    try {
      const result = await sendEmail({
        from: { name: 'Stik', email: process.env.FROM_EMAIL || 'no-reply@stik.com' },
        to: receiver,
        subject,
        html: htmlContent
      });

      return res.json({ message: 'Localização enviada com sucesso.', result });
    } catch (err) {
      console.error('Erro ao enviar localização via sendEmail:', err);
      const status = err.status || 500;
      const message = status === 500 ? 'Erro interno ao enviar e-mail de localização.' : 'Falha ao enviar e-mail de localização.';
      if (process.env.DEBUG_API === 'true') {
        return res.status(status).json({ message, detail: err.detail || err.message });
      }
      return res.status(status).json({ message });
    }
  } catch (err) {
    console.error('Erro ao enviar e-mail via Brevo (location):', err);
    return res.status(500).json({ message: 'Erro interno ao enviar e-mail de localização.' });
  }
});

app.listen(PORT, () => {
    console.log(`Server rodando na porta ${PORT}`);
});

// rota para expor configurações públicas (ex.: site key do reCAPTCHA)
app.get('/api/config', (req, res) => {
  const smtpConfigured = !!(process.env.SMTP_HOST && process.env.SMTP_PORT && process.env.SMTP_USER && process.env.SMTP_PASS);
  res.json({
    recaptchaSiteKey: process.env.RECAPTCHA_SITE_KEY || null,
    smtpConfigured,
    smtpHost: process.env.SMTP_HOST || null
  });
});

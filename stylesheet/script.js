const THEME_STORAGE_KEY = 'stik-theme';
const STIK_ANALYTICS_VISITOR_KEY = 'stik-analytics-visitor-id';
const STIK_ANALYTICS_SESSION_KEY = 'stik-analytics-session-id';
const STIK_DATA_CONSENT_KEY = 'stik-data-consent';
const STIK_DATA_NOTICE_VERSION = 'data-notice-2026-08-10';
const STIK_LOCATION_REQUEST_SESSION_KEY = 'stik-location-requested-this-session';
const STIK_LANGUAGE_STORAGE_KEY = 'stik-language';
const STIK_DYNAMIC_TRANSLATION_STORAGE_KEY = 'stik-dynamic-translations-v1';
const STIK_CATEGORY_TRANSLATION_STATUS_STORAGE_KEY = 'stik-category-translation-statuses-v1';
const STIK_DEFAULT_LANGUAGE = 'pt';
const STIK_SUPPORTED_LANGUAGES = ['pt', 'en', 'es', 'fr'];
const STIK_SITE_MEDIA_DB_NAME = 'stik-site-media-preview';
const STIK_SITE_MEDIA_STORE_NAME = 'media';
const STIK_SITE_MEDIA_REF_PREFIX = 'stik-media:';
const STIK_WHATSAPP_PHONE = '558532025400';
const STIK_DEFAULT_WHATSAPP_MESSAGE = 'Olá! Tenho interesse nas soluções da STIK.';
const STIK_PRODUCT_WHATSAPP_MESSAGE = 'Olá! Tenho interesse no produto {product} ({category}) e gostaria de conversar sobre aplicação, volume e acabamento.';
const STIK_TRACKABLE_EVENT_NAMES = new Set([
    'page_view',
    'product_view',
    'category_view',
    'search_performed',
    'whatsapp_click',
    'catalog_request',
    'contact_form_submit',
    'location_shared',
    'data_consent_update'
]);
const STIK_I18N_TEXT_ORIGINALS = new WeakMap();
const STIK_SITE_MEDIA_URL_CACHE = new Map();
let stikCurrentLanguage = STIK_DEFAULT_LANGUAGE;
let stikCurrentMessages = null;

function buildStikWhatsappUrl(message = '') {
    const baseUrl = `https://api.whatsapp.com/send/?phone=${STIK_WHATSAPP_PHONE}`;
    const cleanMessage = String(message || '').trim();
    return cleanMessage ? `${baseUrl}&text=${encodeURIComponent(cleanMessage)}` : baseUrl;
}

function getStikWhatsappSourceMessage(link) {
    if (link?.dataset?.stikWhatsappMessage) return link.dataset.stikWhatsappMessage;

    try {
        const url = new URL(link.href, window.location.href);
        return url.searchParams.get('text') || STIK_DEFAULT_WHATSAPP_MESSAGE;
    } catch (error) {
        return STIK_DEFAULT_WHATSAPP_MESSAGE;
    }
}

function getStikWhatsappMessageVariables(link) {
    try {
        return JSON.parse(link?.dataset?.stikWhatsappVariables || '{}') || {};
    } catch (error) {
        return {};
    }
}

function formatStikWhatsappVariable(name, value) {
    const text = String(value || '');
    return name === 'category' ? translateStikPhrase(text) : text;
}

function translateStikWhatsappMessage(message, variables = {}) {
    const template = translateStikPhrase(message);
    return template.replace(/\{([a-zA-Z0-9_]+)\}/g, (_, name) => {
        return formatStikWhatsappVariable(name, variables[name]);
    });
}

function refreshStikWhatsappLinks(root = document) {
    root.querySelectorAll?.('a[href*="whatsapp"], a[href*="wa.me"]').forEach(link => {
        const sourceMessage = getStikWhatsappSourceMessage(link);
        link.dataset.stikWhatsappMessage = sourceMessage;
        link.href = buildStikWhatsappUrl(translateStikWhatsappMessage(sourceMessage, getStikWhatsappMessageVariables(link)));
    });
}

function setStikWhatsappLinksMessage(message, root = document, variables = {}) {
    root.querySelectorAll?.('a[href*="whatsapp"], a[href*="wa.me"]').forEach(link => {
        link.dataset.stikWhatsappMessage = message;
        link.dataset.stikWhatsappVariables = JSON.stringify(variables || {});
        link.href = buildStikWhatsappUrl(translateStikWhatsappMessage(message, variables));
    });
}

function detectStikLanguage(language) {
    const lang = String(language || '').toLowerCase();
    if (lang.startsWith('pt')) return 'pt';
    if (lang.startsWith('en')) return 'en';
    if (lang.startsWith('es')) return 'es';
    if (lang.startsWith('fr')) return 'fr';
    return null;
}

function normalizeStikLanguage(language) {
    return detectStikLanguage(language) || STIK_DEFAULT_LANGUAGE;
}

function getBrowserStikLanguage() {
    const browserLanguages = [
        ...Array.from(navigator.languages || []),
        navigator.language
    ];

    for (const language of browserLanguages) {
        const detected = detectStikLanguage(language);
        if (detected) return detected;
    }

    return STIK_DEFAULT_LANGUAGE;
}

function getStoredStikLanguage() {
    try {
        const stored = localStorage.getItem(STIK_LANGUAGE_STORAGE_KEY);
        return STIK_SUPPORTED_LANGUAGES.includes(stored) ? stored : null;
    } catch (error) {
        return null;
    }
}

function getInitialStikLanguage() {
    const params = new URLSearchParams(window.location.search);
    const fromUrl = params.get('lang');
    if (fromUrl) return normalizeStikLanguage(fromUrl);
    return getStoredStikLanguage() || getBrowserStikLanguage();
}

async function loadStikMessages(language) {
    const normalized = normalizeStikLanguage(language);
    try {
        const response = await fetch(`locales/${normalized}.json`, { cache: 'no-store' });
        if (!response.ok) throw new Error(`Locale ${normalized} indisponivel`);
        return await response.json();
    } catch (error) {
        if (normalized !== STIK_DEFAULT_LANGUAGE) {
            return loadStikMessages(STIK_DEFAULT_LANGUAGE);
        }
        console.warn('Não foi possível carregar traduções:', error);
        return { meta: { htmlLang: 'pt-BR' }, cookies: {}, phrases: {}, attrs: {} };
    }
}

function getStikMessage(path, fallback = '') {
    const parts = String(path || '').split('.');
    let value = stikCurrentMessages;
    for (const part of parts) {
        value = value?.[part];
    }
    return typeof value === 'string' ? value : fallback;
}

function translateStikPhrase(text) {
    return stikCurrentMessages?.phrases?.[text] || text;
}

function setStikRawText(element, text) {
    if (!element) return;
    element.textContent = text;
    if (element.firstChild) {
        STIK_I18N_TEXT_ORIGINALS.set(element.firstChild, text);
    }
}

function getStikProductCountLabel(count) {
    const total = Number(count) || 0;
    const language = stikCurrentLanguage;
    if (language === 'en') return `${total} ${total === 1 ? 'product found' : 'products found'}`;
    if (language === 'es') return `${total} ${total === 1 ? 'producto encontrado' : 'productos encontrados'}`;
    if (language === 'fr') return `${total} ${total === 1 ? 'produit trouvé' : 'produits trouvés'}`;
    return `${total} ${total === 1 ? 'produto encontrado' : 'produtos encontrados'}`;
}

function setStikLanguagePreference(language) {
    stikCurrentLanguage = normalizeStikLanguage(language);
    try {
        localStorage.setItem(STIK_LANGUAGE_STORAGE_KEY, stikCurrentLanguage);
    } catch (error) {
        /* Preferencia de idioma e apenas uma melhoria local. */
    }
}

function getStikTranslationTargets() {
    return STIK_SUPPORTED_LANGUAGES.filter(language => language !== STIK_DEFAULT_LANGUAGE);
}

function getStikTextHash(value) {
    const text = String(value || '');
    let hash = 2166136261;
    for (let index = 0; index < text.length; index += 1) {
        hash ^= text.charCodeAt(index);
        hash = Math.imul(hash, 16777619);
    }
    return (hash >>> 0).toString(36);
}

function getStikDynamicTranslationKey(from, to, format, text) {
    return [from, to, format, getStikTextHash(text), String(text || '').length].join('|');
}

function readStikDynamicTranslationMemory() {
    try {
        const value = localStorage.getItem(STIK_DYNAMIC_TRANSLATION_STORAGE_KEY);
        const parsed = value ? JSON.parse(value) : {};
        return parsed && typeof parsed === 'object' ? parsed : {};
    } catch (error) {
        return {};
    }
}

function writeStikDynamicTranslationMemory(memory) {
    try {
        const entries = Object.entries(memory || {});
        const limited = Object.fromEntries(entries.slice(Math.max(entries.length - 500, 0)));
        localStorage.setItem(STIK_DYNAMIC_TRANSLATION_STORAGE_KEY, JSON.stringify(limited));
    } catch (error) {
        /* O backend continua com a memoria principal. */
    }
}

function rememberStikDynamicTranslation({ from = STIK_DEFAULT_LANGUAGE, to, format = 'plain', source, translated }) {
    const cleanSource = String(source || '').trim();
    const cleanTranslated = String(translated || '').trim();
    if (!to || !cleanSource || !cleanTranslated) return;
    const memory = readStikDynamicTranslationMemory();
    memory[getStikDynamicTranslationKey(from, to, format, cleanSource)] = {
        from,
        to,
        format,
        source: cleanSource,
        translated: cleanTranslated,
        updatedAt: new Date().toISOString()
    };
    writeStikDynamicTranslationMemory(memory);
}

function getStikDynamicTranslation(source, format = 'plain', language = stikCurrentLanguage) {
    const cleanSource = String(source || '').trim();
    const targetLanguage = normalizeStikLanguage(language);
    if (!cleanSource || targetLanguage === STIK_DEFAULT_LANGUAGE) return '';
    const memory = readStikDynamicTranslationMemory();
    const item = memory[getStikDynamicTranslationKey(STIK_DEFAULT_LANGUAGE, targetLanguage, format, cleanSource)];
    return item && item.source === cleanSource ? item.translated : '';
}

function translateStikDynamicText(source, format = 'plain', language = stikCurrentLanguage) {
    return getStikDynamicTranslation(source, format, language) || translateStikPhrase(source) || source;
}

function getStikI18nField(source, i18n, field, format = 'plain') {
    if (stikCurrentLanguage === STIK_DEFAULT_LANGUAGE) return source;
    const translated = i18n?.[stikCurrentLanguage]?.[field];
    return translated || translateStikDynamicText(source, format);
}

function mergeStikI18n(existing, translations) {
    const next = { ...(existing || {}) };
    Object.entries(translations || {}).forEach(([language, fields]) => {
        next[language] = { ...(next[language] || {}) };
        Object.entries(fields || {}).forEach(([field, value]) => {
            if (value) {
                next[language][field] = value;
            }
        });
    });
    return next;
}

function hasCompleteStikI18n(i18n, fields) {
    const requiredFields = (fields || []).filter(Boolean);
    if (!requiredFields.length) return true;
    return getStikTranslationTargets().every(language => (
        requiredFields.every(field => String(i18n?.[language]?.[field] || '').trim())
    ));
}

function getStikAdminStatusMeta({ publicationStatus = '', translationStatus = '', i18n = null, fields = [], forcePending = false } = {}) {
    const cleanPublicationStatus = String(publicationStatus || '').toLowerCase();
    const cleanTranslationStatus = String(translationStatus || '').toLowerCase();

    if (['error', 'erro', 'failed', 'publish_error', 'publication_error'].includes(cleanPublicationStatus)) {
        return { key: 'publication-error', label: 'Erro na publicação', icon: 'fa-exclamation-triangle' };
    }

    if (['error', 'erro', 'failed', 'translation_error'].includes(cleanTranslationStatus)) {
        return { key: 'translation-error', label: 'Erro na tradução', icon: 'fa-language' };
    }

    if (forcePending || ['pending', 'queued', 'translating'].includes(cleanTranslationStatus)) {
        return { key: 'pending', label: 'Pendente', icon: 'fa-clock' };
    }

    if (cleanTranslationStatus && !hasCompleteStikI18n(i18n, fields)) {
        return { key: 'pending', label: 'Pendente', icon: 'fa-clock' };
    }

    return { key: 'published', label: 'Publicado', icon: 'fa-check' };
}

function renderAdminStatusBadge(statusMeta) {
    const meta = statusMeta || getStikAdminStatusMeta();
    return `
        <span class="admin-status-badge admin-status-badge--${escapeAttribute(meta.key)}">
            <i class="fas ${escapeAttribute(meta.icon)}" aria-hidden="true"></i>
            ${escapeHtml(meta.label)}
        </span>
    `;
}

function getStikCategoryStatusKey(category) {
    return normalizeBlogSearch(normalizeCategoria(category));
}

function readStikCategoryTranslationStatuses() {
    try {
        const value = localStorage.getItem(STIK_CATEGORY_TRANSLATION_STATUS_STORAGE_KEY);
        const parsed = value ? JSON.parse(value) : {};
        return parsed && typeof parsed === 'object' ? parsed : {};
    } catch (error) {
        return {};
    }
}

function writeStikCategoryTranslationStatuses(statuses) {
    try {
        localStorage.setItem(STIK_CATEGORY_TRANSLATION_STATUS_STORAGE_KEY, JSON.stringify(statuses || {}));
    } catch (error) {
        console.warn('Nao foi possivel salvar status de traducao das categorias:', error);
    }
}

function setStikCategoryTranslationStatus(category, status) {
    const key = getStikCategoryStatusKey(category);
    if (!key) return;
    const statuses = readStikCategoryTranslationStatuses();
    if (!status) {
        delete statuses[key];
    } else {
        statuses[key] = {
            status,
            updatedAt: new Date().toISOString()
        };
    }
    writeStikCategoryTranslationStatuses(statuses);
}

function getStikCategoryTranslationStatus(category) {
    const statuses = readStikCategoryTranslationStatuses();
    return statuses[getStikCategoryStatusKey(category)]?.status || '';
}

async function requestStikDynamicTranslations(entries, options = {}) {
    const normalizedEntries = (entries || [])
        .map(entry => ({
            id: String(entry.id || '').trim(),
            text: String(entry.text || '').trim(),
            format: entry.format === 'html' ? 'html' : 'plain'
        }))
        .filter(entry => entry.id && entry.text);

    if (!normalizedEntries.length) return {};

    const sourceLanguage = normalizeStikLanguage(options.sourceLanguage || STIK_DEFAULT_LANGUAGE);
    const targetLanguages = (options.targetLanguages || getStikTranslationTargets())
        .map(normalizeStikLanguage)
        .filter(language => language !== sourceLanguage)
        .filter((language, index, list) => list.indexOf(language) === index);

    if (!targetLanguages.length) return {};

    const response = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            sourceLanguage,
            targetLanguages,
            entries: normalizedEntries
        })
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || 'Nao foi possivel traduzir o conteudo.');
    }

    const data = await response.json();
    const output = {};

    Object.entries(data.translations || {}).forEach(([language, fields]) => {
        output[language] = {};
        Object.entries(fields || {}).forEach(([id, item]) => {
            const entry = normalizedEntries.find(candidate => candidate.id === id);
            const translated = String(item?.text || '').trim();
            if (!entry || !translated) return;
            output[language][id] = translated;
            rememberStikDynamicTranslation({
                from: sourceLanguage,
                to: language,
                format: entry.format,
                source: entry.text,
                translated
            });
        });
    });

    return output;
}

async function translateStikCrudFields(fieldMap, existingI18n = null, options = {}) {
    const sourceLanguage = normalizeStikLanguage(options.sourceLanguage || STIK_DEFAULT_LANGUAGE);
    const targetLanguages = (options.targetLanguages || getStikTranslationTargets())
        .map(normalizeStikLanguage)
        .filter(language => language !== sourceLanguage)
        .filter((language, index, list) => list.indexOf(language) === index);
    const existingTranslations = existingI18n && typeof existingI18n === 'object' ? existingI18n : {};
    const hasExistingTranslationForAllTargets = (field) => targetLanguages.every(language => (
        String(existingTranslations?.[language]?.[field] || '').trim()
    ));
    const entries = Object.entries(fieldMap || {})
        .map(([id, config]) => {
            const value = typeof config === 'object' ? config.text : config;
            const format = typeof config === 'object' ? config.format : 'plain';
            return { id, text: value, format };
        })
        .filter(entry => String(entry.text || '').trim())
        .filter(entry => options.skipExisting === true ? !hasExistingTranslationForAllTargets(entry.id) : true);

    if (!entries.length) return existingI18n || {};

    try {
        const translations = await requestStikDynamicTranslations(entries, {
            sourceLanguage,
            targetLanguages
        });
        return mergeStikI18n(existingI18n, translations);
    } catch (error) {
        console.warn('Traducao dinamica indisponivel:', error);
        if (options.throwOnFailure === true) throw error;
        if (options.showFailureFeedback !== false) {
            showEditorFeedback?.('Conteudo salvo. Traducao automatica indisponivel agora.');
        }
        return {};
    }
}

function isStikManagedMediaRef(value) {
    return new RegExp(`^${STIK_SITE_MEDIA_REF_PREFIX}[a-z0-9-]+$`, 'i').test(String(value || '').trim());
}

function openStikSiteMediaDb() {
    return new Promise((resolve, reject) => {
        if (!('indexedDB' in window)) {
            reject(new Error('IndexedDB indisponivel.'));
            return;
        }

        const request = indexedDB.open(STIK_SITE_MEDIA_DB_NAME, 1);
        request.onupgradeneeded = () => {
            const db = request.result;
            if (!db.objectStoreNames.contains(STIK_SITE_MEDIA_STORE_NAME)) {
                db.createObjectStore(STIK_SITE_MEDIA_STORE_NAME, { keyPath: 'id' });
            }
        };
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error || new Error('Falha ao abrir IndexedDB.'));
    });
}

function transactStikSiteMedia(mode, callback) {
    return openStikSiteMediaDb().then(db => new Promise((resolve, reject) => {
        const transaction = db.transaction(STIK_SITE_MEDIA_STORE_NAME, mode);
        const store = transaction.objectStore(STIK_SITE_MEDIA_STORE_NAME);
        let callbackResult;
        transaction.oncomplete = () => {
            db.close();
            resolve(callbackResult);
        };
        transaction.onerror = () => {
            db.close();
            reject(transaction.error || new Error('Falha ao acessar midia local.'));
        };
        callbackResult = callback(store);
    }));
}

async function saveStikSiteMediaFile(file) {
    const id = `${Date.now().toString(36)}-${crypto.randomUUID?.() || Math.random().toString(36).slice(2)}`;
    const record = {
        id,
        blob: file,
        name: file.name || 'arquivo',
        type: file.type || '',
        size: file.size || 0,
        createdAt: new Date().toISOString()
    };

    await transactStikSiteMedia('readwrite', store => store.put(record));
    return `${STIK_SITE_MEDIA_REF_PREFIX}${id}`;
}

async function getStikSiteMediaRecord(ref) {
    if (!isStikManagedMediaRef(ref)) return null;
    const id = String(ref).slice(STIK_SITE_MEDIA_REF_PREFIX.length);
    return transactStikSiteMedia('readonly', store => new Promise((resolve, reject) => {
        const request = store.get(id);
        request.onsuccess = () => resolve(request.result || null);
        request.onerror = () => reject(request.error || new Error('Falha ao ler midia local.'));
    }));
}

async function resolveStikManagedMediaUrl(ref) {
    if (!isStikManagedMediaRef(ref)) return '';
    if (STIK_SITE_MEDIA_URL_CACHE.has(ref)) return STIK_SITE_MEDIA_URL_CACHE.get(ref);

    const record = await getStikSiteMediaRecord(ref);
    if (!record?.blob) return '';

    const url = URL.createObjectURL(record.blob);
    STIK_SITE_MEDIA_URL_CACHE.set(ref, url);
    return url;
}

async function resolveStikAssetUrl(value, fallback = '') {
    const raw = String(value || '').trim();
    if (isStikManagedMediaRef(raw)) {
        try {
            return await resolveStikManagedMediaUrl(raw) || fallback;
        } catch (error) {
            console.warn('Nao foi possivel carregar midia local:', error);
            return fallback;
        }
    }
    return normalizeStikAssetUrl(raw, fallback);
}

function translateStikTextNode(textNode, phrases) {
    if (!textNode || !textNode.nodeValue || !phrases) return;
    const original = STIK_I18N_TEXT_ORIGINALS.get(textNode) || textNode.nodeValue;
    STIK_I18N_TEXT_ORIGINALS.set(textNode, original);

    const trimmed = original.trim();
    if (!trimmed || !phrases[trimmed]) {
        textNode.nodeValue = original;
        return;
    }

    const leading = original.match(/^\s*/)?.[0] || '';
    const trailing = original.match(/\s*$/)?.[0] || '';
    textNode.nodeValue = `${leading}${phrases[trimmed]}${trailing}`;
}

function translateStikAttributes(root, messages) {
    const attrs = messages?.attrs || {};
    ['placeholder', 'aria-label', 'title', 'alt'].forEach(attr => {
        const translations = attrs[attr];
        if (!translations) return;

        root.querySelectorAll?.(`[${attr}]`).forEach(element => {
            const storedKey = `i18nOriginal${attr.replace(/(^|-)([a-z])/g, (_, __, char) => char.toUpperCase())}`;
            const original = element.dataset[storedKey] || element.getAttribute(attr);
            if (!original) return;
            element.dataset[storedKey] = original;
            element.setAttribute(attr, translations[original] || original);
        });
    });
}

function applyStikTranslations(root = document) {
    const messages = stikCurrentMessages;
    if (!messages) return;

    document.documentElement.lang = messages.meta?.htmlLang || 'pt-BR';
    document.querySelectorAll('#languageSelect').forEach(select => {
        select.value = stikCurrentLanguage;
    });

    const phrases = messages.phrases || {};
    const walkerRoot = root.nodeType === Node.DOCUMENT_NODE ? root.body : root;
    if (walkerRoot) {
        const walker = document.createTreeWalker(walkerRoot, NodeFilter.SHOW_TEXT, {
            acceptNode(node) {
                const parent = node.parentElement;
                if (!parent || ['SCRIPT', 'STYLE', 'NOSCRIPT', 'TEXTAREA'].includes(parent.tagName)) {
                    return NodeFilter.FILTER_REJECT;
                }
                return node.nodeValue.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
            }
        });

        const nodes = [];
        while (walker.nextNode()) nodes.push(walker.currentNode);
        nodes.forEach(node => translateStikTextNode(node, phrases));
    }

    translateStikAttributes(root, messages);
    refreshStikWhatsappLinks(root);
}

function bindStikLanguageControls() {
    document.querySelectorAll('#languageSelect:not([data-i18n-bound])').forEach(select => {
        select.dataset.i18nBound = 'true';
        select.value = stikCurrentLanguage;
        select.addEventListener('change', async () => {
            setStikLanguagePreference(select.value);
            stikCurrentMessages = await loadStikMessages(stikCurrentLanguage);
            const bannerWasOpen = Boolean(document.querySelector('.data-consent-banner'));
            refreshStikDynamicTranslations();
            applyStikTranslations(document);
            updateThemeToggle(document.documentElement.dataset.theme || getPreferredTheme());
            if (bannerWasOpen) {
                closeStikDataBanner();
                initStikDataBanner({ force: true });
            }
        });
    });
}

function refreshStikDynamicTranslations() {
    const pathname = window.location.pathname.replace(/\/+$/, '');
    if (pathname === '' || pathname === '/' || pathname.endsWith('index.html')) {
        exibirCategorias(produtos);
        applySiteContent(document);
    } else if (/\/categoria(\.html)?$/.test(pathname)) {
        renderCategoriaPage();
    } else if (/\/produto(\.html)?$/.test(pathname)) {
        carregarDetalhesDoProduto();
    } else if (/\/blog(\.html)?$/.test(pathname)) {
        displayArticles();
    } else if (/\/artigo(\.html)?$/.test(pathname)) {
        carregarArtigo();
    } else if (/\/institucional(\.html)?$/.test(pathname)) {
        applySiteContent(document);
    }
    renderDynamicSidebarCategories();
}

async function initializeStikI18n() {
    if (isStikInternalPreviewPage()) {
        document.documentElement.lang = 'pt-BR';
        document.querySelectorAll('.language-switcher').forEach(element => element.remove());
        return;
    }

    setStikLanguagePreference(getInitialStikLanguage());
    stikCurrentMessages = await loadStikMessages(stikCurrentLanguage);
    applyStikTranslations(document);
    bindStikLanguageControls();
}

function getDefaultStikConsent() {
    return {
        necessary: true,
        analytics: false,
        marketing: false,
        location: false,
        decidedAt: null,
        noticeVersion: STIK_DATA_NOTICE_VERSION
    };
}

function isStikAnalyticsPage() {
    return /\/(?:dados_capturados|dados-capturados)(\.html)?$/.test(window.location.pathname.replace(/\/+$/, ''));
}

function isStikAdminPage() {
    return /\/admin(\.html)?$/.test(window.location.pathname.replace(/\/+$/, ''));
}

function isStikCreateArticlePage() {
    return /\/create-article(\.html)?$/.test(window.location.pathname.replace(/\/+$/, ''));
}

function isStikInternalPreviewPage() {
    return isStikAdminPage() || isStikCreateArticlePage();
}

function isStikLocalPreviewHost() {
    return ['localhost', '127.0.0.1', '::1', ''].includes(window.location.hostname);
}

function removeStikAdminLinksOnPublicHost(root = document) {
    if (isStikLocalPreviewHost()) return;
    root.querySelectorAll?.('a[href="admin.html"], a[href="/admin"], .footer-admin-link').forEach(link => link.remove());
}

function guardStikInternalPreviewPage() {
    if (!isStikInternalPreviewPage() || isStikLocalPreviewHost()) return false;
    try {
        localStorage.removeItem('stik.admin.session');
    } catch (error) {
        /* Preview interno nao deve depender de storage fora do ambiente local. */
    }

    const main = document.querySelector('main') || document.body;
    main.innerHTML = `
        <section class="admin-page">
            <div class="admin-login-card">
                <span class="admin-eyebrow">Preview local</span>
                <h1>Acesso indisponivel</h1>
                <p>Esta tela interna e apenas um preview local. O backend definitivo precisa autenticar o CRUD antes de uso em producao.</p>
            </div>
        </section>
    `;
    return true;
}

function getStikConsent() {
    try {
        const stored = localStorage.getItem(STIK_DATA_CONSENT_KEY);
        if (!stored) return getDefaultStikConsent();
        const parsed = JSON.parse(stored);
        if (parsed.noticeVersion !== STIK_DATA_NOTICE_VERSION) return getDefaultStikConsent();
        return {
            ...getDefaultStikConsent(),
            ...parsed
        };
    } catch (error) {
        return getDefaultStikConsent();
    }
}

function hasStikConsent(type) {
    const consent = getStikConsent();
    if (type === 'necessary') return true;
    return Boolean(consent.decidedAt && consent[type]);
}

function saveStikConsent(nextConsent) {
    const consent = {
        ...getDefaultStikConsent(),
        ...nextConsent,
        necessary: true,
        decidedAt: new Date().toISOString(),
        noticeVersion: STIK_DATA_NOTICE_VERSION
    };

    try {
        localStorage.setItem(STIK_DATA_CONSENT_KEY, JSON.stringify(consent));
    } catch (error) {
        /* O banner segue funcional mesmo sem persistencia local. */
    }

    return consent;
}

function createStikId(prefix) {
    const randomId = window.crypto?.randomUUID
        ? window.crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    return `${prefix}-${randomId}`;
}

function getStikStoredId(storage, key, prefix) {
    try {
        let id = storage.getItem(key);
        if (!id) {
            id = createStikId(prefix);
            storage.setItem(key, id);
        }
        return id;
    } catch (error) {
        return createStikId(prefix);
    }
}

function getStikVisitorId() {
    return getStikStoredId(localStorage, STIK_ANALYTICS_VISITOR_KEY, 'visitor');
}

function getStikSessionId() {
    return getStikStoredId(sessionStorage, STIK_ANALYTICS_SESSION_KEY, 'session');
}

function getStikUtmParams() {
    const params = new URLSearchParams(window.location.search);
    return ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'].reduce((acc, key) => {
        const value = params.get(key);
        if (value) acc[key] = value;
        return acc;
    }, {});
}

function getStikDeviceContext() {
    return {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language,
        languages: Array.from(navigator.languages || []),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || null,
        screen: {
            width: window.screen?.width || null,
            height: window.screen?.height || null,
            pixelRatio: window.devicePixelRatio || 1
        },
        viewport: {
            width: window.innerWidth,
            height: window.innerHeight
        }
    };
}

function buildStikAnalyticsSnapshot(extra = {}) {
    return {
        visitorId: getStikVisitorId(),
        sessionId: getStikSessionId(),
        source: extra.source || 'site',
        device: getStikDeviceContext(),
        ...extra
    };
}

function buildStikSubmissionAnalyticsSnapshot(extra = {}) {
    if (hasStikConsent('analytics') || hasStikConsent('marketing')) {
        return buildStikAnalyticsSnapshot(extra);
    }

    return {
        source: extra.source || 'form_submission',
        consentState: {
            analytics: false,
            marketing: false,
            noticeVersion: STIK_DATA_NOTICE_VERSION
        }
    };
}

function sendStikAnalytics(payload) {
    const body = {
        ...payload,
        analytics: buildStikAnalyticsSnapshot(payload.analytics || {}),
        visitor: { anonymousId: getStikVisitorId() },
        session: { sessionId: getStikSessionId() }
    };

    return fetch('/api/analytics/collect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        keepalive: true
    }).catch(error => {
        console.warn('Falha ao enviar analytics temporario:', error);
    });
}

function trackStikEvent(eventName, metadata = {}, options = {}) {
    if (!eventName) return Promise.resolve();
    if (!STIK_TRACKABLE_EVENT_NAMES.has(eventName)) return Promise.resolve();
    const purpose = options.purpose || 'analytics';
    if (!hasStikConsent(purpose)) return Promise.resolve();
    const { productId, productName, category, ...eventMetadata } = metadata || {};
    return sendStikAnalytics({
        event: {
            eventName,
            productId,
            productName,
            category,
            metadata: eventMetadata,
            occurredAt: new Date().toISOString()
        }
    });
}

function recordStikConsentDecision(consent) {
    return sendStikAnalytics({
        event: {
            eventName: 'data_consent_update',
            occurredAt: consent.decidedAt || new Date().toISOString()
        }
    });
}

function findProductById(productId) {
    const id = Number(productId);
    return produtos.find(product => Number(product.id) === id) || null;
}

function getProductAnalyticsPayload(product) {
    if (!product) return {};
    return {
        productId: product.id,
        productName: formatNome(product.nome),
        category: normalizeCategoria(product.categoria),
        material: product.material || null
    };
}

function sendInitialStikPageView() {
    if (window.__stikInitialPageViewSent) return;
    window.__stikInitialPageViewSent = true;
    if (!hasStikConsent('analytics')) return;
    sendStikAnalytics({
        event: {
            eventName: 'page_view',
            path: window.location.pathname,
            occurredAt: new Date().toISOString()
        }
    });
}

function sendCurrentPageMarketingEvent() {
    if (!hasStikConsent('marketing')) return;
    const pathname = window.location.pathname.replace(/\/+$/, '');

    if (/\/produto(\.html)?$/.test(pathname)) {
        const params = new URLSearchParams(window.location.search);
        const product = findProductById(params.get('id'));
        if (product) {
            trackStikEvent('product_view', {
                ...getProductAnalyticsPayload(product),
                source: 'post_consent_current_page'
            }, { purpose: 'marketing' });
        }
    } else if (/\/categoria(\.html)?$/.test(pathname)) {
        const params = new URLSearchParams(window.location.search);
        let category = params.get('categoria') || '';
        try { category = decodeURIComponent(category); } catch (error) {}
        const normalizedCategory = normalizeCategoria(category);
        const productCount = produtos.filter(product => normalizeCategoria(product.categoria) === normalizedCategory).length;
        trackStikEvent('category_view', {
            category: normalizedCategory,
            productCount,
            source: 'post_consent_current_page'
        }, { purpose: 'marketing' });
    }
}

async function requestStikLocationIfAllowed() {
    if (!hasStikConsent('location')) return;

    try {
        if (sessionStorage.getItem(STIK_LOCATION_REQUEST_SESSION_KEY) === 'true') return;
        sessionStorage.setItem(STIK_LOCATION_REQUEST_SESSION_KEY, 'true');
    } catch (error) {
        /* Se sessionStorage falhar, ainda tentamos uma vez nesta execucao. */
    }

    if (typeof collectAndSendLocation !== 'function') return;

    try {
        await collectAndSendLocation();
    } catch (error) {
        console.warn('Não foi possível coletar localização:', error);
    }
}

function closeStikDataBanner() {
    document.querySelector('.data-consent-banner')?.remove();
}

function resetStikConsentPreferences() {
    try {
        localStorage.removeItem(STIK_DATA_CONSENT_KEY);
    } catch (error) {
        /* Sem persistencia local, apenas reabre o banner. */
    }
    window.__stikInitialPageViewSent = false;
    closeStikDataBanner();
    initStikDataBanner({ force: true });
}

function applyStikConsentChoice(nextConsent) {
    const consent = saveStikConsent(nextConsent);
    closeStikDataBanner();
    recordStikConsentDecision(consent);
    sendInitialStikPageView();
    sendCurrentPageMarketingEvent();
    requestStikLocationIfAllowed();
}

function initStikDataBanner(options = {}) {
    if (isStikInternalPreviewPage() || isStikAnalyticsPage()) return;

    const consent = getStikConsent();
    if (consent.decidedAt && !options.force) {
        sendInitialStikPageView();
        requestStikLocationIfAllowed();
        return;
    }

    if (document.querySelector('.data-consent-banner')) return;

    const banner = document.createElement('section');
    banner.className = 'data-consent-banner';
    banner.setAttribute('aria-label', getStikMessage('cookies.aria', 'Preferências de uso de dados'));
    banner.innerHTML = `
        <div class="data-consent-copy">
            <strong>${getStikMessage('cookies.title', 'Uso de cookies')}</strong>
            <p>${getStikMessage('cookies.bodyHtml', 'Usamos cookies e tecnologias semelhantes para melhorar sua experiência. Mais informações podem ser encontradas em nossa <a href="/politica-de-privacidade">Política de Privacidade</a>.')}</p>
        </div>
        <div class="data-consent-actions">
            <button type="button" class="data-consent-primary" data-consent-action="accept">${getStikMessage('cookies.accept', 'Prosseguir')}</button>
        </div>
    `;

    banner.addEventListener('click', event => {
        const button = event.target.closest('[data-consent-action]');
        if (!button) return;

        const action = button.dataset.consentAction;
        if (action === 'accept') {
            applyStikConsentChoice({ analytics: true, marketing: true, location: true });
        }
    });

    document.body.appendChild(banner);
}

function initTemporaryAnalytics() {
    if (isStikAnalyticsPage() || isStikInternalPreviewPage()) return;

    try {
        if (!sessionStorage.getItem('stik-analytics-landing-page')) {
            sessionStorage.setItem('stik-analytics-landing-page', window.location.href);
        }
    } catch (error) {
        /* Analytics temporario continua mesmo sem sessionStorage. */
    }

    initStikDataBanner();
    requestStikLocationIfAllowed();

    if (window.__stikAnalyticsClickBound) return;
    window.__stikAnalyticsClickBound = true;

    document.addEventListener('click', event => {
        const link = event.target.closest('a[href]');
        if (!link) return;

        const href = link.getAttribute('href') || '';
        if (/whatsapp|wa\.me/i.test(href)) {
            trackStikEvent('whatsapp_click', {
                href,
                label: link.getAttribute('aria-label') || link.textContent.trim().slice(0, 120)
            }, { purpose: 'marketing' });
        }
    });

    document.addEventListener('click', event => {
        const resetButton = event.target.closest('#data-consent-reset');
        if (!resetButton) return;
        resetStikConsentPreferences();
    });
}

function getStoredTheme() {
    try {
        const theme = localStorage.getItem(THEME_STORAGE_KEY);
        return theme === 'dark' || theme === 'light' ? theme : null;
    } catch (error) {
        return null;
    }
}

function getPreferredTheme() {
    const storedTheme = getStoredTheme();
    if (storedTheme) return storedTheme;
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function updateThemeToggle(theme) {
    const isDark = theme === 'dark';
    document.querySelectorAll('.theme-toggle').forEach((button) => {
        const icon = button.querySelector('i');
        button.classList.toggle('is-dark', isDark);
        button.setAttribute('aria-label', isDark ? translateStikPhrase('Alternar para tema claro') : translateStikPhrase('Alternar para tema escuro'));
        button.setAttribute('title', isDark ? translateStikPhrase('Tema claro') : translateStikPhrase('Tema escuro'));
        if (icon) {
            icon.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
        }
    });
}

function applyTheme(theme) {
    const normalizedTheme = theme === 'dark' ? 'dark' : 'light';
    document.documentElement.dataset.theme = normalizedTheme;
    document.documentElement.style.colorScheme = normalizedTheme;
    updateThemeToggle(normalizedTheme);
}

function setThemePreference(theme) {
    try {
        localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch (error) {
        /* Preferencia de tema e apenas uma melhoria local. */
    }
    applyTheme(theme);
}

function inicializarTema() {
    applyTheme(getPreferredTheme());

    document.querySelectorAll('.theme-toggle:not([data-theme-bound])').forEach((button) => {
        button.dataset.themeBound = 'true';
        button.addEventListener('click', () => {
            const currentTheme = document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
            setThemePreference(currentTheme === 'dark' ? 'light' : 'dark');
        });
    });

    if (!window.__stikThemeSystemListenerBound && window.matchMedia) {
        window.__stikThemeSystemListenerBound = true;
        const themePreference = window.matchMedia('(prefers-color-scheme: dark)');
        const syncSystemTheme = (event) => {
            if (!getStoredTheme()) {
                applyTheme(event.matches ? 'dark' : 'light');
            }
        };
        if (themePreference.addEventListener) {
            themePreference.addEventListener('change', syncSystemTheme);
        } else if (themePreference.addListener) {
            themePreference.addListener(syncSystemTheme);
        }
    }
}

applyTheme(getPreferredTheme());

const produtos = [
    {
        id: 2,
        nome: "Canoa",
        categoria: "Elásticos Crus",
        imagem: "img - Copia/Elásticos Crus/canoa-stik.png",
        descricao: "Desbloqueie o potencial máximo da sua linha de produção industrial e garanta um desempenho superior na confecção.",
        details: "O Canoa é o nosso elástico cru de altíssima resistência e robustez, projetado para durar por um longo ciclo de vida. Sua superfície, propositalmente levemente áspera, proporciona uma aderência superior e maior firmeza no processo de costura industrial, garantindo que o acabamento seja sempre firme, seguro e profissional. Ele oferece máxima durabilidade e excelente estabilidade dimensional, sendo a base ideal e robusta para projetos exigentes, onde a qualidade técnica e a autenticidade do material em seu estado natural são a principal prioridade do seu vestuário.",
        material: "Elástico",
        i18n: {
            "en": {
                "categoria": "Raw Elastics",
                "material": "Elastic",
                "descricao": "Unlock the maximum potential of your industrial production line and ensure superior manufacturing performance.",
                "details": "Canoa is our raw elastic of very high strength and robustness, designed to last for a long life cycle. Its surface, purposely slightly rough, provides superior adhesion and greater firmness in the industrial sewing process, ensuring that the finish is always firm, safe and professional. It offers maximum durability and excellent dimensional stability, being the ideal and robust base for demanding projects, where the technical quality and authenticity of the material in its natural state are the main priority of your garment."
            },
            "es": {
                "categoria": "Elásticos en bruto",
                "material": "Elástico",
                "descricao": "Desbloquea el máximo potencial de tu línea de producción industrial y asegura un rendimiento de fabricación superior.",
                "details": "La canoa es nuestro elástico en bruto, de muy alta resistencia y robustez, diseñado para durar un ciclo de vida prolongado. Su superficie, deliberadamente ligeramente rugosa, proporciona una adherencia superior y mayor firmeza en el proceso de costura industrial, asegurando que el acabado sea siempre firme, seguro y profesional. Ofrece la máxima durabilidad y una excelente estabilidad dimensional, siendo la base ideal y robusta para proyectos exigentes, donde la calidad técnica y la autenticidad del material en su estado natural son la prioridad principal de tu prenda."
            },
            "fr": {
                "categoria": "Élastiques bruts",
                "material": "Élastique",
                "descricao": "Libérez le potentiel maximal de votre chaîne de production industrielle et assurez-vous de meilleures performances de fabrication.",
                "details": "Le canoa est notre élastique brut d’une très grande résistance et robustesse, conçu pour durer un long cycle de vie. Sa surface, volontairement légèrement rugueuse, offre une adhérence supérieure et une plus grande fermeté dans le processus de couture industrielle, garantissant une finition toujours ferme, sûre et professionnelle. Elle offre une durabilité maximale et une excellente stabilité dimensionnelle, étant la base idéale et robuste pour des projets exigeants, où la qualité technique et l’authenticité du matériau dans son état naturel sont la priorité principale de votre vêtement."
            }
        },
        translationStatus: "published",
        translationUpdatedAt: "2026-09-10T18:33:57.599Z",
        translationSourceSignature: "1kdf4vg",
        translationLastError: ""
    },
    {
        id: 3,
        nome: "Cinta",
        categoria: "Modeladores",
        imagem: "./img/Modeladores/cinta-stik.png",
        descricao: "Crie peças que modelam com conforto e segurança inigualáveis, redefinindo o padrão de vestuário de compressão.",
        details: "O elástico Cinta foi desenvolvido especificamente para modeladores e vestuário de compressão, oferecendo uma compressão controlada que esculpe e valoriza a silhueta sem sacrificar o bem-estar do usuário. Sua excelente recuperação elástica e alta resistência ao uso contínuo garantem que a peça jamais perca a forma ou sua capacidade de compressão, mesmo após muitas lavagens. É a escolha definitiva para roupas que buscam um ajuste firme, sustentação localizada e um toque sofisticado de alto padrão, assegurando que o produto final seja valorizado pela performance, durabilidade e caimento.",
        material: "Políester",
        i18n: {
            "en": {
                "categoria": "Shapewear",
                "material": "Polyester",
                "descricao": "Create pieces that shape with unmatched comfort and safety, redefining the standard for compression garments.",
                "details": "The Cinta elastic was developed specifically for shapewear and compression garments, offering a controlled compression that sculpts and enhances the silhouette without sacrificing the user's well-being. Its excellent elastic recovery and high resistance to continuous use ensure that the garment never loses its shape or compression capacity, even after many washes. It is the definitive choice for garments looking for a firm fit, localized support and a sophisticated touch of high standard, ensuring that the final product is valued for its performance, durability and fit."
            },
            "es": {
                "categoria": "Prendas moldeadoras",
                "material": "Poliéster",
                "descricao": "Crea prendas que tengan forma con una comodidad y seguridad inigualables, redefiniendo el estándar para las prendas de compresión.",
                "details": "El elástico Cinta fue desarrollado específicamente para prendas moldeadoras y de compresión, ofreciendo una compresión controlada que esculpe y realza la silueta sin sacrificar el bienestar del usuario. Su excelente recuperación elástica y alta resistencia al uso continuo aseguran que la prenda nunca pierda su forma ni capacidad de compresión, incluso tras muchos lavados. Es la elección definitiva para prendas que buscan un ajuste firme, un soporte localizado y un toque sofisticado de alto nivel, asegurando que el producto final sea valorado por su rendimiento, durabilidad y corte."
            },
            "fr": {
                "categoria": "Vêtements shapewear",
                "material": "Polyester",
                "descricao": "Créez des pièces qui s’adaptent à un confort et une sécurité inégalés, redéfinissant la norme des vêtements de compression.",
                "details": "L’élastique Cinta a été développé spécifiquement pour les vêtements shapewear et de compression, offrant une compression contrôlée qui sculpte et met en valeur la silhouette sans sacrifier le bien-être de l’utilisateur. Son excellente récupération élastique et sa forte résistance à un usage continu garantissent que le vêtement ne perd jamais sa forme ni sa capacité de compression, même après de nombreux lavages. C’est le choix définitif pour les vêtements recherchant un ajustement ferme, un soutien localisé et une touche sophistiquée de haute qualité, garantissant que le produit final est valorisé pour ses performances, sa durabilité et sa coupe."
            }
        },
        translationStatus: "published",
        translationUpdatedAt: "2026-09-10T18:33:57.603Z",
        translationSourceSignature: "19lelok",
        translationLastError: ""
    },
    {
        id: 4,
        nome: "Alça Atena",
        categoria: "Personalizados",
        imagem: "./img/Personalizados/alcaatena-stik.png",
        descricao: "Dê vida à sua marca e a eleve a um novo patamar de exclusividade, requinte e sofisticação.",
        details: "Alça Atena é a solução de acabamento premium totalmente personalizada para atender e materializar o seu design e identidade visual. Por ser sob demanda, pode ser desenvolvida em uma ampla variedade de cores, padrões, texturas e larguras, adaptando-se perfeitamente a qualquer necessidade da sua coleção. Este produto não apenas oferece alta resistência e um toque extremamente refinado, mas também se torna um diferencial estético poderoso, capaz de capturar olhares e agregar valor inestimável à sua coleção de moda íntima e vestuário de luxo, fortalecendo o branding.",
        material: "Elástico",
        i18n: {
            "en": {
                "categoria": "Personalized",
                "material": "Elastic",
                "descricao": "Bring your brand to life and take it to a new level of exclusivity, refinement and sophistication.",
                "details": "Atena Handle is the premium finishing solution fully customized to meet and materialize your design and visual identity. Because it is on demand, it can be developed in a wide variety of colors, patterns, textures and widths, adapting perfectly to any need of your collection. This product not only offers high resistance and an extremely refined touch, but also becomes a powerful aesthetic differential, capable of capturing glances and adding inestimable value to your collection of luxury underwear and apparel, strengthening branding."
            },
            "es": {
                "categoria": "Personalizado",
                "material": "Elástico",
                "descricao": "Da vida a tu marca y llévala a un nuevo nivel de exclusividad, refinamiento y sofisticación.",
                "details": "Atena Handle es la solución de acabado premium totalmente personalizada para adaptarse y materializar tu diseño e identidad visual. Al estar bajo demanda, puede desarrollarse en una amplia variedad de colores, patrones, texturas y anchuras, adaptándose perfectamente a cualquier necesidad de tu colección. Este producto no solo ofrece alta resistencia y un toque extremadamente refinado, sino que también se convierte en un diferencial estético potente, capaz de captar miradas y añadir un valor incalculable a tu colección de ropa interior y ropa de lujo, reforzando la marca."
            },
            "fr": {
                "categoria": "Personnalisé",
                "material": "Élastique",
                "descricao": "Faites vivre votre marque et portez-la à un nouveau niveau d’exclusivité, de raffinement et de sophistication.",
                "details": "Atena Handle est la solution de finition premium entièrement personnalisée pour correspondre et matérialiser votre design et votre identité visuelle. Parce qu’elle est à la demande, elle peut être développée dans une grande variété de couleurs, motifs, textures et largeurs, s’adaptant parfaitement à tous les besoins de votre collection. Ce produit offre non seulement une grande résistance et une touche extrêmement raffinée, mais devient aussi un puissant différentiel esthétique, capable de capter les regards et d’ajouter une valeur inestimable à votre collection de sous-vêtements et vêtements de luxe, renforçant ainsi votre image de marque."
            }
        },
        translationStatus: "published",
        translationUpdatedAt: "2026-09-10T18:33:57.603Z",
        translationSourceSignature: "1nls0ty",
        translationLastError: ""
    },
    {
        id: 5,
        nome: "Belly",
        categoria: "Premium",
        imagem: "./img/Premium/belly-stik.png",
        descricao: "Sinta o luxo, a maciez e a excelência em cada detalhe de suas criações de alto padrão.",
        details: "O Belly é a materialização do elástico premium, destacando-se notavelmente por seu toque acetinado e uma resistência incomparável ao desgaste diário, atrito e à tensão. Essencial para peças de alta-costura, coleções exclusivas e linhas de luxo, ele entrega não apenas uma aparência sofisticada e visualmente rica que encanta o consumidor, mas também um desempenho elástico funcional, consistente e uma durabilidade notável, confirmando a alta qualidade e o valor agregado da sua produção.",
        material: "Elástico",
        i18n: {
            "en": {
                "categoria": "Premium",
                "material": "Elastic",
                "descricao": "Feel the luxury, softness and excellence in every detail of your high-end creations.",
                "details": "Belly is the embodiment of premium elastic, notably standing out for its satin feel and unrivalled resistance to daily wear, friction and tension. Essential for couture pieces, exclusive collections and luxury lines, it delivers not only a sophisticated and visually rich appearance that delights the consumer, but also functional, consistent elastic performance and remarkable durability, confirming the high quality and added value of its production."
            },
            "es": {
                "categoria": "Premium",
                "material": "Elástico",
                "descricao": "Siente el lujo, la suavidad y la excelencia en cada detalle de tus creaciones de alta gama.",
                "details": "Belly es la encarnación de la elástica premium, destacando especialmente por su sensación satinada y su resistencia inigualable al uso diario, la fricción y la tensión. Esencial para piezas de alta costura, colecciones exclusivas y líneas de lujo, ofrece no solo un aspecto sofisticado y visualmente rico que deleita al consumidor, sino también un rendimiento elástico funcional y constante y una durabilidad notable, confirmando la alta calidad y el valor añadido de su producción."
            },
            "fr": {
                "categoria": "Premium",
                "material": "Élastique",
                "descricao": "Ressentez le luxe, la douceur et l’excellence dans chaque détail de vos créations haut de gamme.",
                "details": "Belly incarne l’élastique premium, se démarquant notamment par sa sensation satinée et sa résistance inégalée au port quotidien, aux frictions et à la tension. Indispensable pour les pièces de haute couture, les collections exclusives et les lignes de luxe, il offre non seulement une apparence sophistiquée et visuellement riche qui rait le consommateur, mais aussi une performance élastique fonctionnelle et constante ainsi qu’une durabilité remarquable, confirmant la haute qualité et la valeur ajoutée de sa production."
            }
        },
        translationStatus: "published",
        translationUpdatedAt: "2026-09-10T18:33:57.603Z",
        translationSourceSignature: "h471n0",
        translationLastError: ""
    },
    {
        id: 6,
        nome: "Ana",
        categoria: "Rendas",
        imagem: "img - Copia/Rendas/ana-stik.png",
        descricao: "Inspire delicadeza e garanta a longevidade e a beleza da sua lingerie por um ciclo de vida estendido.",
        details: "A renda Ana possui alta estabilidade dimensional e um acabamento técnico que facilita e otimiza o processo de costura em larga escala industrial. Ela garante que a elegância, o charme e o design vazado da sua peça permaneçam inalterados e vibrantes, mesmo após diversas lavagens e uso contínuo, sem deformar. É o produto ideal para quem busca combinar a beleza, a sensibilidade e o apelo estético da renda com a funcionalidade e a durabilidade exigidas pelo rigoroso mercado de moda íntima e vestuário fino.",
        material: "Elástico",
        i18n: {
            "en": {
                "categoria": "Rents",
                "material": "Elastic",
                "descricao": "Inspire delicacy and ensure the longevity and beauty of your lingerie for an extended life cycle.",
                "details": "Ana lace has high dimensional stability and a technical finish that facilitates and optimizes the sewing process on a large industrial scale. It ensures that the elegance, charm and openwork design of your piece remain unchanged and vibrant, even after several washes and continuous use, without deforming. It is the ideal product for those looking to combine the beauty, sensitivity and aesthetic appeal of lace with the functionality and durability required by the rigorous underwear and fine apparel market."
            },
            "es": {
                "categoria": "Alquileres",
                "material": "Elástico",
                "descricao": "Inspira delicadeza y asegura la longevidad y belleza de tu lencería durante un ciclo de vida prolongado.",
                "details": "El encaje Ana tiene una alta estabilidad dimensional y un acabado técnico que facilita y optimiza el proceso de costura a gran escala industrial. Garantiza que la elegancia, el encanto y el diseño calado de tu pieza permanezcan inalterados y vibrantes, incluso tras varios lavados y uso continuo, sin deformarse. Es el producto ideal para quienes buscan combinar la belleza, sensibilidad y atractivo estético del encaje con la funcionalidad y durabilidad requeridas por el riguroso mercado de ropa interior y ropa fina."
            },
            "fr": {
                "categoria": "Loyers",
                "material": "Élastique",
                "descricao": "Inspirez la délicatesse et assurez la longévité et la beauté de votre lingerie pendant un long cycle de vie.",
                "details": "La dentelle Ana offre une grande stabilité dimensionnelle et une finition technique qui facilite et optimise le processus de couture à grande échelle industrielle. Elle garantit que l’élégance, le charme et le design en travail ouvert de votre pièce restent inchangés et éclatants, même après plusieurs lavages et une utilisation continue, sans se déformer. C’est le produit idéal pour ceux qui souhaitent combiner la beauté, la sensibilité et l’attrait esthétique de la dentelle avec la fonctionnalité et la durabilité requises par le marché rigoureux des sous-vêtements et des vêtements fins."
            }
        },
        translationStatus: "published",
        translationUpdatedAt: "2026-09-10T18:33:57.603Z",
        translationSourceSignature: "1c9ug56",
        translationLastError: ""
    },
    {
        id: 7,
        nome: "Magno",
        categoria: "Alça",
        imagem: "./img/Alças/magno-stik.png",
        descricao: "Desenvolva peças que oferecem segurança, suporte inabalável e conforto de uso prolongado.",
        details: "Magno é uma alça robusta e extremamente confortável, especialmente formulada com alta tecnologia para suportar grandes tensões, peso e tração sem ceder, esticar ou perder sua forma original. Com bordas reforçadas, toque agradável e construção densa, é a escolha definitiva e de confiança para peças que exigem máxima sustentação, como sutiãs de tamanhos maiores, tops de alta performance ou vestuário técnico, sem abrir mão do conforto ideal para o usuário.",
        material: "Elástico",
        i18n: {
            "en": {
                "categoria": "Handle",
                "material": "Elastic",
                "descricao": "Develop parts that offer safety, unwavering support, and long-term wearing comfort.",
                "details": "Magno is a robust and extremely comfortable strap, specially formulated with high technology to withstand great tensions, weight and traction without giving way, stretching or losing its original shape. With reinforced edges, a pleasant touch and dense construction, it is the definitive and reliable choice for pieces that require maximum support, such as larger size bras, high-performance tops or technical clothing, without giving up optimal comfort for the user."
            },
            "es": {
                "categoria": "Empuñadura",
                "material": "Elástico",
                "descricao": "Desarrolla piezas que ofrezcan seguridad, soporte inquebrantable y comodidad a largo plazo.",
                "details": "Magno es una correa robusta y extremadamente cómoda, especialmente formulada con alta tecnología para soportar grandes tensiones, peso y tracción sin ceder, estirarse o perder su forma original. Con bordes reforzados, un tacto agradable y una construcción densa, es la opción definitiva y fiable para prendas que requieren el máximo soporte, como sujetadores de talla mayor, tops de alto rendimiento o ropa técnica, sin renunciar a una comodidad óptima para el usuario."
            },
            "fr": {
                "categoria": "Poignée",
                "material": "Élastique",
                "descricao": "Développez des pièces qui offrent sécurité, un soutien inébranlable et un confort de port durable.",
                "details": "Magno est une sangle robuste et extrêmement confortable, spécialement formulée avec une technologie avancée pour supporter de fortes tensions, poids et traction sans céder, étirer ou perdre sa forme d’origine. Avec ses bords renforcés, un toucher agréable et une construction dense, c’est le choix définitif et fiable pour les pièces nécessitant un soutien maximal, comme des soutiens-gorge de taille plus grande, des hauts haute performance ou des vêtements techniques, sans renoncer au confort optimal pour l’utilisateur."
            }
        },
        translationStatus: "published",
        translationUpdatedAt: "2026-09-10T18:33:57.603Z",
        translationSourceSignature: "ioihvp",
        translationLastError: ""
    },
    {
        id: 11,
        nome: "Ágda",
        categoria: "Viés",
        imagem: "img/agda-stik.png",
        descricao: "Obtenha acabamentos profissionais, impecáveis e de longa duração com o viés Agda.",
        details: "Este produto é notavelmente flexível, extremamente resistente e ideal para ser aplicado em bordas e reforços de costuras, oferecendo um fechamento limpo e seguro. Sua maleabilidade superior facilita o trabalho em curvas, contornos complexos e detalhes arredondados, sendo um aliado crucial na produção em escala. Garante um resultado final elegante, duradouro e com aquele toque profissional que é crucial para elevar a percepção de qualidade do seu vestuário, assegurando a integridade e o visual da peça por mais tempo.",
        material: "Elástico",
        i18n: {
            "en": {
                "categoria": "Bias",
                "material": "Elastic",
                "descricao": "Get professional, flawless, long-lasting finishes with Agda bias.",
                "details": "This product is remarkably flexible, extremely resistant and ideal for applying to edges and seam reinforcements, offering a clean and secure closure. Its superior malleability makes it easy to work with curves, complex contours and rounded details, being a crucial ally in scale production. It guarantees an elegant, long-lasting final result with that professional touch that is crucial to elevate the perception of quality of your garment, ensuring the integrity and look of the garment for longer."
            },
            "es": {
                "categoria": "Sesgo",
                "material": "Elástico",
                "descricao": "Consigue acabados profesionales, impecables y duraderos con el sesgo de Agda.",
                "details": "Este producto es notablemente flexible, extremadamente resistente y ideal para aplicarse en bordes y refuerzos de costura, ofreciendo un cierre limpio y seguro. Su superior maleabilidad facilita trabajar con curvas, contornos complejos y detalles redondeados, siendo un aliado crucial en la producción a escala. Garantiza un resultado final elegante y duradero con ese toque profesional crucial para elevar la percepción de calidad de tu prenda, asegurando la integridad y el aspecto durante más tiempo."
            },
            "fr": {
                "categoria": "Biais",
                "material": "Élastique",
                "descricao": "Obtenez des finitions professionnelles, impeccables, durables avec Agda bias.",
                "details": "Ce produit est remarquablement flexible, extrêmement résistant et idéal pour être appliqué sur les bords et les renforts de couture, offrant une fermeture propre et sécurisée. Sa malléabilité supérieure facilite le travail avec des courbes, des contours complexes et des détails arrondis, étant un allié crucial dans la production à l’échelle. Il garantit un résultat final élégant et durable avec cette touche professionnelle essentielle pour améliorer la perception de qualité de votre vêtement, garantissant l’intégrité et l’apparence du vêtement plus longtemps."
            }
        },
        translationStatus: "published",
        translationUpdatedAt: "2026-09-10T18:33:57.603Z",
        translationSourceSignature: "x35obo",
        translationLastError: ""
    },
    {
        id: 12,
        nome: "Atlas",
        categoria: "Viés Com Arco",
        imagem: "img/atlas-stik.png",
        descricao: "Inove o design dos seus modeladores e peças íntimas com suporte técnico superior e discreto embutido.",
        details: "Atlas é o nosso elástico que já possui o arco integrado, sendo projetado especificamente para dar uma estrutura extra e localizada a corsets, sutiãs e modeladores. Ele consegue unir a firmeza necessária e essencial para a modelagem perfeita com o conforto para o uso diário, proporcionando liberdade. É um produto ideal para peças que exigem um suporte técnico localizado, garantindo que a forma original e o visual refinado da roupa sejam mantidos com excelência, valorizando a silhueta de maneira eficaz.",
        material: "Elástico",
        i18n: {
            "en": {
                "categoria": "Bias with arch",
                "material": "Elastic",
                "descricao": "Innovate the design of your shapewear and underwear with superior and discreet built-in technical support.",
                "details": "Atlas is our elastic band that already has the integrated arch, being specifically designed to give an extra and localized structure to corsets, bras and shapewear. It manages to unite the necessary and essential firmness for perfect modeling with the comfort for daily use, providing freedom. It is an ideal product for pieces that require localized technical support, ensuring that the original shape and refined look of the clothing are maintained with excellence, enhancing the silhouette effectively."
            },
            "es": {
                "categoria": "Sesgo con arco",
                "material": "Elástico",
                "descricao": "Innova el diseño de tu modeladora y ropa interior con soporte técnico integrado superior y discreto.",
                "details": "Atlas es nuestra banda elástica que ya tiene el arco integrado, diseñada específicamente para dar una estructura extra y localizada a corsés, sujetadores y prendas moldeadoras. Consigue unir la firmeza necesaria y esencial para un modelado perfecto con la comodidad para el uso diario, proporcionando libertad. Es un producto ideal para piezas que requieren soporte técnico local, asegurando que la forma original y el aspecto refinado de la ropa se mantengan con excelencia, realzando la silueta de manera eficaz."
            },
            "fr": {
                "categoria": "Biais avec l’arche",
                "material": "Élastique",
                "descricao": "Innovez dans le design de vos vêtements shapewear et sous-vêtements grâce à un support technique intégré supérieur et discret.",
                "details": "Atlas est notre élastique qui possède déjà la voûte plantaire intégrée, conçue spécifiquement pour offrir une structure supplémentaire et localisée aux corsets, soutiens-gorge et vêtements shapewear. Elle parvient à unir la fermeté nécessaire et essentielle pour un mannequinat parfait avec le confort pour un usage quotidien, offrant ainsi de la liberté. C’est un produit idéal pour les pièces nécessitant un support technique localisé, garantissant que la forme originale et l’aspect raffiné des vêtements soient maintenus avec excellence, mettant en valeur la silhouette de manière efficace."
            }
        },
        translationStatus: "published",
        translationUpdatedAt: "2026-09-10T18:33:57.603Z",
        translationSourceSignature: "qfs8fv",
        translationLastError: ""
    },
    {
        id: 14,
        nome: "Chll",
        categoria: "Premium",
        imagem: "img/chll-stik.png",
        descricao: "Crie coleções com um visual moderno, caimento impecável e um desempenho de elite que se destaca no mercado.",
        details: "O Chll é parte fundamental da nossa linha premium, destacando-se pela resistência superior à deformação, ao estiramento e por um caimento estruturado e elegante. É o material ideal para marcas que buscam peças com um estilo contemporâneo, alta durabilidade e excelente apresentação visual. Ele garante que a sofisticação e o design inovador permaneçam intactos por muito mais tempo, reforçando a qualidade e o alto padrão dos seus produtos premium, assegurando a fidelidade da forma.",
        material: "Elástico",
        i18n: {
            "en": {
                "categoria": "Premium",
                "material": "Elastic",
                "descricao": "Create collections with a modern look, impeccable fit and elite performance that stands out in the market.",
                "details": "Chll is a fundamental part of our premium line, standing out for its superior resistance to deformation, stretching and a structured and elegant fit. It is the ideal material for brands looking for pieces with a contemporary style, high durability and excellent visual presentation. It ensures that sophistication and innovative design remain intact for much longer, reinforcing the quality and high standard of its premium products, ensuring shape fidelity."
            },
            "es": {
                "categoria": "Premium",
                "material": "Elástico",
                "descricao": "Crea colecciones con un aspecto moderno, un ajuste impecable y un rendimiento de élite que destaquen en el mercado.",
                "details": "Chll es una parte fundamental de nuestra línea premium, destacando por su superior resistencia a la deformación, el estiramiento y un ajuste estructurado y elegante. Es el material ideal para marcas que buscan piezas con un estilo contemporáneo, alta durabilidad y excelente presentación visual. Garantiza que la sofisticación y el diseño innovador se mantengan durante mucho más tiempo, reforzando la calidad y el alto estándar de sus productos premium, asegurando la fidelidad de las formas."
            },
            "fr": {
                "categoria": "Premium",
                "material": "Élastique",
                "descricao": "Créez des collections au look moderne, à la coupe impeccable et à la performance d’élite qui se démarquent sur le marché.",
                "details": "Le Chll est un élément fondamental de notre gamme haut de gamme, se distinguant par sa résistance supérieure à la déformation, à l’étirement et à sa coupe structurée et élégante. C’est le matériau idéal pour les marques recherchant des pièces au style contemporain, à la grande durabilité et à la présentation visuelle excellente. Il garantit que la sophistication et le design innovant restent intacts bien plus longtemps, renforçant la qualité et le haut niveau de ses produits haut de gamme et garantissant la fidélité des formes."
            }
        },
        translationStatus: "published",
        translationUpdatedAt: "2026-09-10T18:33:57.603Z",
        translationSourceSignature: "1impv17",
        translationLastError: ""
    },
    {
        id: 16,
        nome: "Dayane",
        categoria: "Alças",
        imagem: "img - Copia/Alças/dayane-stik.png",
        descricao: "Proporcione segurança e leveza essenciais para o uso diário e prolongado em peças de base.",
        details: "Dayane é a alça desenvolvida com elasticidade perfeitamente balanceada, pensada para o máximo conforto e um suporte seguro que acompanha cada movimento do corpo. É o material ideal para sutiãs, tops e vestuário que necessitam de um suporte confiável e discreto, garantindo o ajuste sem comprometer a leveza e a sensação de bem-estar ao longo do dia. Sua composição evita o excesso de pressão, valorizando a experiência do usuário.",
        material: "Elástico",
        i18n: {
            "en": {
                "categoria": "Handles",
                "material": "Elastic",
                "descricao": "Provide essential safety and lightness for daily and extended use in base pieces.",
                "details": "Dayane is the strap developed with perfectly balanced elasticity, designed for maximum comfort and a secure support that accompanies every movement of the body. It is the ideal material for bras, tops and clothing that need reliable and discreet support, ensuring the fit without compromising lightness and the feeling of well-being throughout the day. Its composition avoids excess pressure, enhancing the user experience."
            },
            "es": {
                "categoria": "Asas",
                "material": "Elástico",
                "descricao": "Proporciona la seguridad y la ligereza esenciales para el uso diario y prolongado en las piezas base.",
                "details": "Dayane es el tirante desarrollado con una elasticidad perfectamente equilibrada, diseñado para máxima comodidad y un soporte seguro que acompaña cada movimiento del cuerpo. Es el material ideal para sujetadores, tops y ropa que necesitan un soporte fiable y discreto, asegurando el ajuste sin comprometer la ligereza ni la sensación de bienestar durante todo el día. Su composición evita la presión excesiva, mejorando la experiencia del usuario."
            },
            "fr": {
                "categoria": "Poignées",
                "material": "Élastique",
                "descricao": "Assurez la sécurité et la légèreté essentielles pour une utilisation quotidienne et prolongée dans les bases.",
                "details": "Dayane est une sangle conçue avec une élasticité parfaitement équilibrée, conçue pour un confort maximal et un soutien sécurisé qui accompagne chaque mouvement du corps. C’est le matériau idéal pour les soutiens-gorge, hauts et vêtements nécessitant un soutien fiable et discret, garantissant l’ajustement sans compromettre la légèreté et le bien-être tout au long de la journée. Sa composition évite la pression excessive, améliorant ainsi l’expérience utilisateur."
            }
        },
        translationStatus: "published",
        translationUpdatedAt: "2026-09-10T18:33:57.603Z",
        translationSourceSignature: "1f6fyqx",
        translationLastError: ""
    },
    {
        id: 17,
        nome: "Íris",
        categoria: "Alças",
        imagem: "img - Copia/Alças/Iris-stik.png",
        descricao: "A durabilidade técnica que suas peças íntimas merecem, garantindo um ciclo de vida estendido e maior satisfação.",
        details: "Iris é a alça macia ao toque e altamente resistente ao desgaste, ao atrito e à fadiga do material, perfeita para lingeries de uso contínuo. Sua construção robusta permite uma fixação eficiente em reguladores, o que garante um ajuste preciso, duradouro e confortável, acompanhando a forma do corpo em todos os momentos com consistência e segurança, sem escorregar ou afrouxar.",
        material: "Elástico",
        i18n: {
            "en": {
                "categoria": "Handles",
                "material": "Elastic",
                "descricao": "The technical durability your underwear deserves, ensuring an extended life cycle and greater satisfaction.",
                "details": "Iris is the soft-to-the-touch strap that is highly resistant to wear, friction and material fatigue, perfect for lingerie of continuous use. Its robust construction allows for efficient attachment to regulators, which ensures a precise, long-lasting and comfortable fit, following the shape of the body at all times with consistency and safety, without slipping or loosening."
            },
            "es": {
                "categoria": "Asas",
                "material": "Elástico",
                "descricao": "La durabilidad técnica que tu ropa interior merece, asegurando un ciclo de vida prolongado y una mayor satisfacción.",
                "details": "El iris es la correa suave al tacto, altamente resistente al desgaste, la fricción y la fatiga del material, perfecta para lencería de uso continuo. Su construcción robusta permite una fijación eficiente a los reguladores, lo que garantiza un ajuste preciso, duradero y cómodo, siguiendo la forma del cuerpo en todo momento con consistencia y seguridad, sin resbalar ni aflojarse."
            },
            "fr": {
                "categoria": "Poignées",
                "material": "Élastique",
                "descricao": "La durabilité technique que votre sous-vêtement mérite, garantissant un cycle de vie prolongé et une plus grande satisfaction.",
                "details": "Iris est une sangle douce au toucher, très résistante à l’usure, au frottement et à la fatigue des matériaux, parfaite pour la lingerie en usage continu. Sa construction robuste permet une fixation efficace sur des détendeurs, garantissant un ajustement précis, durable et confortable, suivant la forme du corps en permanence avec constance et sécurité, sans glisser ni se desserrer."
            }
        },
        translationStatus: "published",
        translationUpdatedAt: "2026-09-10T18:33:57.604Z",
        translationSourceSignature: "ytm2xo",
        translationLastError: ""
    },
    {
        id: 19,
        nome: "Mirela",
        categoria: "Alças",
        imagem: "img - Copia/Alças/mirela-stik.png",
        descricao: "Adicione um toque de requinte, brilho sutil e suavidade em suas coleções que definem o luxo.",
        details: "Mirela é a alça com acabamento acetinado e toque excepcionalmente delicado, sendo a escolha ideal para lingeries e vestuário que se enquadram na categoria premium e de alta-costura. Ela une um visual incrivelmente refinado e elegante com um desempenho elástico funcional e superior, elevando o valor percebido das suas criações e solidificando sua posição no mercado de luxo pela qualidade estética e técnica.",
        material: "Elástico",
        i18n: {
            "en": {
                "categoria": "Handles",
                "material": "Elastic",
                "descricao": "Add a touch of refinement, subtle sparkle and softness to your luxury-defining collections.",
                "details": "Mirela is the satin-finished strap with an exceptionally delicate touch, making it an ideal choice for lingerie and apparel that fall into the premium and haute couture category. It combines an incredibly refined and elegant look with a functional and superior elastic performance, elevating the perceived value of your creations and solidifying your position in the luxury market for aesthetic and technical quality."
            },
            "es": {
                "categoria": "Asas",
                "material": "Elástico",
                "descricao": "Añade un toque de refinamiento, brillo sutil y suavidad a tus colecciones que definen el lujo.",
                "details": "Mirela es el tirante acabado satinado con un toque excepcionalmente delicado, lo que lo convierte en una elección ideal para lencería y prendas que entran en la categoría premium y alta costura. Combina un aspecto increíblemente refinado y elegante con un rendimiento elástico funcional y superior, elevando el valor percibido de tus creaciones y consolidando tu posición en el mercado del lujo en calidad estética y técnica."
            },
            "fr": {
                "categoria": "Poignées",
                "material": "Élastique",
                "descricao": "Ajoutez une touche de raffinement, de scintillements subtils et de douceur à vos collections qui définissent le luxe.",
                "details": "Mirela est une bretelle satinée avec une touche exceptionnellement délicate, ce qui en fait un choix idéal pour la lingerie et les vêtements relevant de la catégorie haute couture et haute couture. Elle allie un look incroyablement raffiné et élégant à une performance élastique fonctionnelle et supérieure, rehaussant la valeur perçue de vos créations et consolidant votre position sur le marché du luxe en matière de qualité esthétique et technique."
            }
        },
        translationStatus: "published",
        translationUpdatedAt: "2026-09-10T18:33:57.604Z",
        translationSourceSignature: "xmkb3w",
        translationLastError: ""
    },
    {
        id: 20,
        nome: "Nádia",
        categoria: "Alças",
        imagem: "img - Copia/Alças/nadia-stik.png",
        descricao: "Busque máxima versatilidade e confiança estrutural para diversos designs de vestuário.",
        details: "Nadia é a alça que se destaca por ser altamente durável e versátil, pronta para ser aplicada desde moda íntima de base e sutiãs, até acessórios de vestuário que exigem mais resistência e tração. Sua construção robusta garante a combinação perfeita entre resistência estrutural e flexibilidade ideal, adaptando-se a diferentes estilos e necessidades de costura com grande facilidade e consistência, oferecendo um excelente custo-benefício.",
        material: "Elástico",
        i18n: {
            "en": {
                "categoria": "Handles",
                "material": "Elastic",
                "descricao": "Strive for maximum versatility and structural reliability for diverse apparel designs.",
                "details": "Nadia is the strap that stands out for being highly durable and versatile, ready to be applied from base underwear and bras, to clothing accessories that require more strength and traction. Its robust construction ensures the perfect combination of structural strength and optimal flexibility, adapting to different styles and sewing needs with great ease and consistency, offering excellent value for money."
            },
            "es": {
                "categoria": "Asas",
                "material": "Elástico",
                "descricao": "Procura la máxima versatilidad y fiabilidad estructural para diseños de ropa diversos.",
                "details": "Nadia es la tirante que destaca por ser muy duradera y versátil, lista para aplicarse desde ropa interior base y sujetadores, hasta accesorios de ropa que requieren más resistencia y tracción. Su construcción robusta garantiza la combinación perfecta de resistencia estructural y flexibilidad óptima, adaptándose a diferentes estilos y necesidades de costura con gran facilidad y consistencia, ofreciendo una excelente relación calidad-precio."
            },
            "fr": {
                "categoria": "Poignées",
                "material": "Élastique",
                "descricao": "Visez une polyvalence maximale et une fiabilité structurelle pour la diversité des designs de vêtements.",
                "details": "Nadia est la sangle qui se distingue par sa grande durabilité et polyvalence, prête à être appliquée depuis les sous-vêtements de base et soutiens-gorge jusqu’aux accessoires de vêtements nécessitant plus de résistance et d’adhérence. Sa construction robuste assure la combinaison parfaite de solidité structurelle et de flexibilité optimale, s’adaptant facilement et à la coin aux besoins de couture différents, offrant un excellent rapport qualité-prix."
            }
        },
        translationStatus: "published",
        translationUpdatedAt: "2026-09-10T18:33:57.604Z",
        translationSourceSignature: "sv1wb7",
        translationLastError: ""
    },
    {
        id: 21,
        nome: "Carícia",
        categoria: "Bases",
        imagem: "img - Copia/Bases/caricia-stik.png",
        descricao: "Confeccione bases e cós com conforto superior e maleabilidade que abraçam o corpo de forma suave.",
        details: "Carícia é a base macia ideal para cós e acabamentos internos, graças ao seu toque suave na pele e excelente capacidade de recuperação elástica. Ela é a garantia de conforto absoluto para peças que estão em contato direto com a pele, proporcionando uma experiência agradável e de bem-estar a cada uso, sem perder a capacidade de ajuste e de manter a forma do vestuário com discrição e leveza.",
        material: "Elástico",
        i18n: {
            "en": {
                "categoria": "Bases",
                "material": "Elastic",
                "descricao": "Make bases and waistbands with superior comfort and suppleness that hug the body gently.",
                "details": "Caress is the ideal soft base for waistbands and internal finishes, thanks to its soft touch on the skin and excellent elastic recovery capacity. It is the guarantee of absolute comfort for garments that are in direct contact with the skin, providing a pleasant and well-being experience with each use, without losing the ability to adjust and maintain the shape of the garment with discretion and lightness."
            },
            "es": {
                "categoria": "Bases",
                "material": "Elástico",
                "descricao": "Haz bases y cinturas con mayor comodidad y flexibilidad que se ajusten suavemente al cuerpo.",
                "details": "Caress es la base blanda ideal para cinturas y acabados internos, gracias a su tacto suave sobre la piel y su excelente capacidad de recuperación elástica. Garantiza una comodidad absoluta para prendas que están en contacto directo con la piel, proporcionando una experiencia agradable y de bienestar en cada uso, sin perder la capacidad de ajustar y mantener la forma de la prenda con discreción y ligereza."
            },
            "fr": {
                "categoria": "Bases",
                "material": "Élastique",
                "descricao": "Fabriquez des socles et des ceintures avec un confort et une souplesse supérieurs qui éprouvent doucement le corps.",
                "details": "Caress est la base douce idéale pour les ceintures et les finitions internes, grâce à sa douceur sur la peau et son excellente capacité de récupération élastique. Elle garantit un confort absolu pour les vêtements en contact direct avec la peau, offrant une expérience agréable et bien-être à chaque utilisation, sans perdre la capacité d’ajuster et de maintenir la forme du vêtement avec discrétion et légèreté."
            }
        },
        translationStatus: "published",
        translationUpdatedAt: "2026-09-10T18:33:57.604Z",
        translationSourceSignature: "1do19kq",
        translationLastError: ""
    },
    {
        id: 22,
        nome: "Cintra",
        categoria: "Bases",
        imagem: "img - Copia/Bases/cintra-stik.png",
        descricao: "Estrutura e suporte firme sem a sensação incômoda de rigidez, garantindo caimento.",
        details: "Cintra é a base com estabilidade dimensional superior e comprovada, o que a torna perfeita para estruturar cós, bustos e barras de forma eficaz. Oferece o suporte técnico necessário com uma flexibilidade ideal para o movimento, garantindo peças que são seguras, confortáveis e com um caimento que se mantém impecável ao longo do tempo de uso e ciclos de lavagens. Ideal para bases de sutiãs e tops que precisam de sustentação.",
        material: "Elástico",
        i18n: {
            "en": {
                "categoria": "Bases",
                "material": "Elastic",
                "descricao": "Structure and firm support without the uncomfortable feeling of rigidity, ensuring fit.",
                "details": "Cintra is the base with superior and proven dimensional stability, which makes it perfect for structuring waistbands, busts and hems effectively. It offers the necessary technical support with optimal flexibility for movement, ensuring pieces that are safe, comfortable and with a fit that remains impeccable over time of use and wash cycles. Ideal for bra bases and tops that need support."
            },
            "es": {
                "categoria": "Bases",
                "material": "Elástico",
                "descricao": "Estructura y soporte firme sin la incómoda sensación de rigidez, asegurando el ajuste.",
                "details": "Cintra es la base con una estabilidad dimensional superior y probada, lo que la hace perfecta para estructurar de forma eficaz cinturas, pechos y dobladillos. Ofrece el soporte técnico necesario con flexibilidad óptima para el movimiento, asegurando prendas seguras, cómodas y con un ajuste impecable a lo largo del tiempo de uso y los ciclos de lavado. Ideal para bases de sujetadores y tops que necesitan soporte."
            },
            "fr": {
                "categoria": "Bases",
                "material": "Élastique",
                "descricao": "Structure et soutien ferme sans la sensation désagréable de rigidité, garantissant un ajustement.",
                "details": "Cintra est la base dotée d’une stabilité dimensionnelle supérieure et éprouvée, ce qui la rend parfaite pour structurer efficacement les ceintures, la poitrine et les ourlets. Elle offre le soutien technique nécessaire avec une flexibilité optimale pour les mouvements, garantissant des pièces sûres, confortables et avec un ajustement irréprochable au fil du temps et des cycles de lavage. Idéal pour les bases de soutiens-gorge et les hauts nécessitant un soutien-gorge."
            }
        },
        translationStatus: "published",
        translationUpdatedAt: "2026-09-10T18:33:57.604Z",
        translationSourceSignature: "12kifxw",
        translationLastError: ""
    },
    {
        id: 23,
        nome: "Diana",
        categoria: "Bases",
        imagem: "img - Copia/Bases/diana-stik (1).png",
        descricao: "Encontre o equilíbrio perfeito entre compressão leve e liberdade de movimento total para suas peças.",
        details: "Diana oferece um suporte balanceado e uma recuperação elástica excepcional, tornando-a a escolha ideal para peças que precisam de uma leve compressão e estabilidade duradoura. Sua composição técnica assegura que a forma e o conforto da roupa sejam mantidos com consistência, mesmo após ser usada e lavada repetidas vezes, garantindo um produto de alta qualidade e longevidade para o dia a dia.",
        material: "Elástico",
        i18n: {
            "en": {
                "categoria": "Bases",
                "material": "Elastic",
                "descricao": "Find the perfect balance between lightweight compression and total freedom of movement for your pieces.",
                "details": "Diana offers balanced support and exceptional elastic recovery, making it an ideal choice for garments that need light compression and long-lasting stability. Its technical composition ensures that the shape and comfort of the garment are maintained consistently, even after being worn and washed repeatedly, ensuring a high-quality product and longevity for everyday life."
            },
            "es": {
                "categoria": "Bases",
                "material": "Elástico",
                "descricao": "Encuentra el equilibrio perfecto entre compresión ligera y total libertad de movimiento para tus piezas.",
                "details": "Diana ofrece un soporte equilibrado y una recuperación elástica excepcional, lo que la convierte en una opción ideal para prendas que requieren una compresión ligera y estabilidad duradera. Su composición técnica garantiza que la forma y la comodidad de la prenda se mantengan de forma constante, incluso después de ser usada y lavada repetidamente, asegurando un producto de alta calidad y longevidad en la vida diaria."
            },
            "fr": {
                "categoria": "Bases",
                "material": "Élastique",
                "descricao": "Trouvez l’équilibre parfait entre compression légère et liberté totale de mouvement pour vos pièces.",
                "details": "Diana offre un soutien équilibré et une récupération élastique exceptionnelle, ce qui en fait un choix idéal pour les vêtements nécessitant une compression légère et une stabilité durable. Sa composition technique garantit que la forme et le confort du vêtement sont maintenus de manière constante, même après port et lavage répétés, garantissant un produit de haute qualité et une longévité au quotidien."
            }
        },
        translationStatus: "published",
        translationUpdatedAt: "2026-09-10T18:33:57.604Z",
        translationSourceSignature: "1ellr2i",
        translationLastError: ""
    },
    {
        id: 24,
        nome: "Lady",
        categoria: "Bases",
        imagem: "img - Copia/Bases/lady-stik.png",
        descricao: "Sofisticação e performance garantidas para suas coleções de alto padrão de luxo.",
        details: "Lady é a base com acabamento premium e um toque extremamente agradável, sedoso e macio, além de alta resistência ao estiramento e à fadiga do material. É desenvolvida especificamente para coleções de luxo, oferecendo conforto prolongado, durabilidade superior e elevando instantaneamente o nível de sofisticação e o valor percebido de cada peça produzida, do cós ao busto, com um visual refinado e elegante.",
        material: "Elástico",
        i18n: {
            "en": {
                "categoria": "Bases",
                "material": "Elastic",
                "descricao": "Sophistication and performance guaranteed for your high-end luxury collections.",
                "details": "Lady is the base with a premium finish and an extremely pleasant, silky and soft touch, as well as high resistance to stretch and material fatigue. It is developed specifically for luxury collections, offering extended comfort, superior durability and instantly raising the level of sophistication and perceived value of each piece produced, from the waistband to the bust, with a refined and elegant look."
            },
            "es": {
                "categoria": "Bases",
                "material": "Elástico",
                "descricao": "Sofisticación y rendimiento garantizados para tus colecciones de lujo de alta gama.",
                "details": "Lady es la base con un acabado premium y un tacto extremadamente agradable, sedoso y suave, además de alta resistencia al estiramiento y la fatiga del material. Está desarrollado específicamente para colecciones de lujo, ofreciendo comodidad prolongada, durabilidad superior y elevando instantáneamente el nivel de sofisticación y valor percibido de cada prenda producida, desde la cintura hasta el busto, con un aspecto refinado y elegante."
            },
            "fr": {
                "categoria": "Bases",
                "material": "Élastique",
                "descricao": "Sophistication et performance garanties pour vos collections de luxe haut de gamme.",
                "details": "La dame est la base avec une finition premium et un toucher extrêmement agréable, soyeux et doux, ainsi qu’une grande résistance à l’élasticité et à la fatigue des tissus. Elle est conçue spécifiquement pour les collections de luxe, offrant un confort prolongé, une durabilité supérieure et rehaussant instantanément le niveau de sophistication et la valeur perçue de chaque pièce produite, de la ceinture à la poitrine, avec un look raffiné et élégant."
            }
        },
        translationStatus: "published",
        translationUpdatedAt: "2026-09-10T18:33:57.604Z",
        translationSourceSignature: "1s6fq4c",
        translationLastError: ""
    },
    {
        id: 25,
        nome: "Leno",
        categoria: "Bases",
        imagem: "img - Copia/Bases/leno-stik.png",
        descricao: "Obtenha a firmeza e a flexibilidade ideais e controladas para o seu design estruturado e exigente.",
        details: "Leno é a base robusta para peças que exigem firmeza superior e flexibilidade controlada, como vestuário esportivo de alta compressão e modeladores. É a solução perfeita para cós e barras que precisam manter a forma e a estrutura mesmo sob uso e tensão intensa, garantindo qualidade técnica, resistência e longevidade em cada aplicação industrial, com excelente retorno elástico.",
        material: "Elástico",
        i18n: {
            "en": {
                "categoria": "Bases",
                "material": "Elastic",
                "descricao": "Get the optimal, controlled firmness and flexibility for your structured, demanding design.",
                "details": "Leno is the robust base for garments that require superior firmness and controlled flexibility, such as high-compression sportswear and shapewear. It is the perfect solution for waistbands and bars that need to maintain shape and structure even under intense use and stress, ensuring technical quality, strength and longevity in every industrial application, with excellent elastic return."
            },
            "es": {
                "categoria": "Bases",
                "material": "Elástico",
                "descricao": "Consigue la firmeza y flexibilidad óptimas y controladas para tu diseño estructurado y exigente.",
                "details": "Leno es la base sólida para prendas que requieren una firmeza superior y una flexibilidad controlada, como la ropa deportiva de alta compresión y la modeladora. Es la solución perfecta para cinturas y barras que necesitan mantener la forma y la estructura incluso bajo uso intenso y estrés, asegurando calidad técnica, resistencia y longevidad en cualquier aplicación industrial, con un excelente retorno elástico."
            },
            "fr": {
                "categoria": "Bases",
                "material": "Élastique",
                "descricao": "Obtenez la fermeté et la flexibilité optimales et contrôlées pour votre conception structurée et exigeante.",
                "details": "Le Leno est la base solide pour les vêtements nécessitant une fermeté supérieure et une flexibilité contrôlée, tels que les vêtements de sport à haute compression et les vêtements shapewear. C’est la solution parfaite pour les ceintures et barres qui doivent maintenir forme et structure même sous une utilisation intense et des contraintes, garantissant la qualité technique, la solidité et la longévité dans chaque application industrielle, avec un excellent retour élastique."
            }
        },
        translationStatus: "published",
        translationUpdatedAt: "2026-09-10T18:33:57.604Z",
        translationSourceSignature: "sxa3kt",
        translationLastError: ""
    },
    {
        id: 26,
        nome: "Nayane",
        categoria: "Bases",
        imagem: "img - Copia/Bases/nayane-stik.png",
        descricao: "Consistência de alta performance garantida para a sua produção em grande escala e alta demanda.",
        details: "Nayane é a base que garante um padrão de qualidade consistente e uniforme em todas as tiragens, com acabamento impecável e alta fidelidade ao design original. Sua composição técnica garante durabilidade e mantém a integridade estrutural da peça após diversas lavagens e ciclos de uso, sendo um material confiável que valoriza cada detalhe final da sua produção, otimizando o processo de costura.",
        material: "Elástico",
        i18n: {
            "en": {
                "categoria": "Bases",
                "material": "Elastic",
                "descricao": "Guaranteed high-performance consistency for your large-scale production and high demand.",
                "details": "Nayane is the base that guarantees a consistent and uniform quality standard in all print runs, with impeccable finishing and high fidelity to the original design. Its technical composition guarantees durability and maintains the structural integrity of the piece after several washes and cycles of use, being a reliable material that values every final detail of its production, optimizing the sewing process."
            },
            "es": {
                "categoria": "Bases",
                "material": "Elástico",
                "descricao": "Garantizado una alta eficiencia de alta calidad para tu producción a gran escala y alta demanda.",
                "details": "Nayane es la base que garantiza un estándar de calidad consistente y uniforme en todas las tiradas, con acabados impecables y alta fidelidad al diseño original. Su composición técnica garantiza durabilidad y mantiene la integridad estructural de la pieza tras varios lavados y ciclos de uso, siendo un material fiable que valora cada detalle final de su producción y optimiza el proceso de costura."
            },
            "fr": {
                "categoria": "Bases",
                "material": "Élastique",
                "descricao": "Garantie de la cohérence haute performance pour votre production à grande échelle et une forte demande.",
                "details": "Nayane est la base qui garantit une qualité constante et uniforme dans tous les tirages, avec une finition impeccable et une haute fidélité au design original. Sa composition technique garantit la durabilité et maintient l’intégrité structurelle de la pièce après plusieurs lavages et cycles d’utilisation, étant un matériau fiable qui valorise chaque détail final de sa production, optimisant le processus de couture."
            }
        },
        translationStatus: "published",
        translationUpdatedAt: "2026-09-10T18:33:57.604Z",
        translationSourceSignature: "1x6i57l",
        translationLastError: ""
    },
    {
        id: 27,
        nome: "Beta",
        categoria: "Elásticos Crus",
        imagem: "img - Copia/Elásticos Crus/beta-stik (1).png",
        descricao: "O ponto de partida essencial para a qualidade, robustez e alta performance na sua linha de produção.",
        details: "Beta é o elástico cru projetado para máxima durabilidade e estabilidade dimensional na sua forma mais pura e natural. É a matéria-prima ideal para ser utilizada em processos industriais que demandam material extremamente resistente, sem tingimento, e com um desempenho técnico superior garantido em todas as etapas da sua linha de produção, estando pronto para tingimento e acabamento final sem surpresas ou deformações.",
        material: "Elástico",
        i18n: {
            "en": {
                "categoria": "Raw Elastics",
                "material": "Elastic",
                "descricao": "The essential starting point for quality, robustness and high performance on your production line.",
                "details": "Beta is the raw elastic designed for maximum durability and dimensional stability in its purest and most natural form. It is the ideal raw material to be used in industrial processes that demand extremely resistant material, without dyeing, and with a superior technical performance guaranteed in all stages of its production line, being ready for dyeing and final finishing without surprises or deformations."
            },
            "es": {
                "categoria": "Elásticos en bruto",
                "material": "Elástico",
                "descricao": "El punto de partida esencial para la calidad, la robustez y el alto rendimiento en tu línea de producción.",
                "details": "El beta es el elástico en bruto diseñado para la máxima durabilidad y estabilidad dimensional en su forma más pura y natural. Es la materia prima ideal para ser utilizada en procesos industriales que exigen material extremadamente resistente, sin teñir, y con un rendimiento técnico superior garantizado en todas las etapas de su línea de producción, listo para el teñido y el acabado final sin sorpresas ni deformaciones."
            },
            "fr": {
                "categoria": "Élastiques bruts",
                "material": "Élastique",
                "descricao": "Le point de départ essentiel pour la qualité, la robustesse et la haute performance sur votre chaîne de production.",
                "details": "Le bêta est l’élastique brut conçu pour une durabilité maximale et une stabilité dimensionnelle dans sa forme la plus pure et naturelle. C’est la matière première idéale pour être utilisée dans des procédés industriels nécessitant un matériau extrêmement résistant, sans teinture, et avec une performance technique supérieure garantie à toutes les étapes de sa chaîne de production, prêt pour la teinture et la finition finale sans surprises ni déformations."
            }
        },
        translationStatus: "published",
        translationUpdatedAt: "2026-09-10T18:33:57.604Z",
        translationSourceSignature: "qa0b12",
        translationLastError: ""
    },
    {
        id: 30,
        nome: "Flor",
        categoria: "Elásticos Crus",
        imagem: "img - Copia/Elásticos Crus/flor-stik (2).png",
        descricao: "Flexibilidade essencial e versatilidade para inovar em seus designs de moda íntima e vestuário.",
        details: "Flor é o elástico cru versátil, que se destaca pela sua excelente capacidade de recuperação elástica e toque macio. É indicado para múltiplas aplicações onde a flexibilidade é o fator crucial, garantindo um desempenho de base sólido e adaptável antes de receber o tingimento ou acabamento final, mantendo a integridade da fibra e a elasticidade de forma consistente para diferentes tipos de peças.",
        material: "Elástico",
        i18n: {
            "en": {
                "categoria": "Raw Elastics",
                "material": "Elastic",
                "descricao": "Essential flexibility and versatility to innovate in your underwear and apparel designs.",
                "details": "Flor is the versatile raw elastic, which stands out for its excellent elastic recovery capacity and soft touch. It is suitable for multiple applications where flexibility is the crucial factor, ensuring a solid and adaptable base performance before receiving the dye or final finish, maintaining fiber integrity and elasticity consistently for different types of garments."
            },
            "es": {
                "categoria": "Elásticos en bruto",
                "material": "Elástico",
                "descricao": "Flexibilidad y versatilidad esenciales para innovar en el diseño de tu ropa interior y ropa.",
                "details": "Flor es el elástico versátil en bruto, que destaca por su excelente capacidad de recuperación elástica y su tacto suave. Es adecuado para múltiples aplicaciones donde la flexibilidad es el factor crucial, asegurando un rendimiento base sólido y adaptable antes de recibir el tinte o el acabado final, manteniendo la integridad y elasticidad de la fibra de forma constante para diferentes tipos de prendas."
            },
            "fr": {
                "categoria": "Élastiques bruts",
                "material": "Élastique",
                "descricao": "Flexibilité et polyvalence essentielles pour innover dans vos sous-vêtements et vos vêtements.",
                "details": "Le flor est l’élastique brut polyvalent, qui se distingue par son excellente capacité de récupération élastique et sa douceur au toucher. Il convient à plusieurs applications où la flexibilité est le facteur crucial, garantissant une base solide et adaptable avant la teinture ou la finition finale, en maintenant l’intégrité et l’élasticité des fibres de façon constante pour différents types de vêtements."
            }
        },
        translationStatus: "published",
        translationUpdatedAt: "2026-09-10T18:33:57.604Z",
        translationSourceSignature: "1st1huv",
        translationLastError: ""
    },
    {
        id: 31,
        nome: "Fortim",
        categoria: "Elásticos Crus",
        imagem: "img - Copia/Elásticos Crus/fortim-stik.png",
        descricao: "A base inabalável da sua resistência estrutural, confiabilidade e alta compressão.",
        details: "Fortim é o elástico cru de altíssima robustez e construção densa, desenvolvido para ser aplicado em peças que exigem máxima firmeza e resistência à tensão e ao estiramento. Ele é a garantia de durabilidade e fornece uma estrutura sólida e confiável para o vestuário que será submetido a um uso intenso e prolongado, como uniformes, equipamentos técnicos ou modeladores, mantendo a forma e a função.",
        material: "Elástico",
        i18n: {
            "en": {
                "categoria": "Raw Elastics",
                "material": "Elastic",
                "descricao": "The unshakable foundation of its structural strength, reliability and high compression.",
                "details": "Fortim is the raw elastic of very high robustness and dense construction, developed to be applied to garments that require maximum firmness and resistance to tension and stretch. It is the guarantee of durability and provides a solid and reliable structure for clothing that will be subjected to intense and prolonged use, such as uniforms, technical equipment or shapewear, maintaining form and function."
            },
            "es": {
                "categoria": "Elásticos en bruto",
                "material": "Elástico",
                "descricao": "La base inquebrantable de su resistencia estructural, fiabilidad y alta compresión.",
                "details": "El fortim es el elástico en bruto de muy alta robustez y construcción densa, desarrollado para aplicarse a prendas que requieren máxima firmeza y resistencia a la tensión y el estiramiento. Garantiza durabilidad y proporciona una estructura sólida y fiable para prendas que serán sometidas a un uso intenso y prolongado, como uniformes, equipos técnicos o prendas moldeadoras, manteniendo la forma y la función."
            },
            "fr": {
                "categoria": "Élastiques bruts",
                "material": "Élastique",
                "descricao": "La base inébranlable de sa solidité structurelle, de sa fiabilité et de sa forte compression.",
                "details": "Le fortim est l’élastique brut d’une très grande robustesse et d’une construction dense, développé pour être appliqué aux vêtements nécessitant une fermeté et une résistance maximales à la tension et à l’élasticité. Il garantit la durabilité et offre une structure solide et fiable pour des vêtements soumis à un usage intense et prolongé, tels que les uniformes, équipements techniques ou les vêtements shapewear, maintenant la forme et la fonction."
            }
        },
        translationStatus: "published",
        translationUpdatedAt: "2026-09-10T18:33:57.604Z",
        translationSourceSignature: "1ibmmb2",
        translationLastError: ""
    },
    {
        id: 32,
        nome: "Iracema",
        categoria: "Elásticos Crus",
        imagem: "img - Copia/Elásticos Crus/iracema-stik.png",
        descricao: "O preparo perfeito e técnico para receber a cor com fidelidade, vivacidade e consistência.",
        details: "Iracema é o elástico cru que entrega um desempenho elástico consistente e uniforme, sendo a base ideal para produtos que precisam de estabilidade e estão prontos para entrar em processos de coloração e tingimento. Ele mantém a qualidade e a elasticidade essenciais antes de receber o toque final e se transformar em um produto acabado de alta qualidade, sem alteração dimensional indesejada, otimizando o processo produtivo de cores.",
        material: "Elástico",
        i18n: {
            "en": {
                "categoria": "Raw Elastics",
                "material": "Elastic",
                "descricao": "The perfect and technical preparation to receive the color with fidelity, vividness and consistency.",
                "details": "Iracema is the raw elastic that delivers consistent and uniform elastic performance, being the ideal base for products that need stability and are ready to enter coloring and dyeing processes. It maintains essential quality and elasticity before receiving the final touch and transforming into a high-quality finished product, without unwanted dimensional alteration, optimizing the color production process."
            },
            "es": {
                "categoria": "Elásticos en bruto",
                "material": "Elástico",
                "descricao": "La preparación perfecta y técnica para recibir el color con fidelidad, viveza y consistencia.",
                "details": "El iracema es el elástico en bruto que ofrece un rendimiento elástico consistente y uniforme, siendo la base ideal para productos que necesitan estabilidad y están listos para entrar en procesos de coloración y teñido. Mantiene la calidad y elasticidad esenciales antes de recibir el toque final y transformarse en un producto final de alta calidad, sin alteraciones dimensionales no deseadas, optimizando el proceso de producción del color."
            },
            "fr": {
                "categoria": "Élastiques bruts",
                "material": "Élastique",
                "descricao": "La préparation parfaite et technique pour recevoir la couleur avec fidélité, vivacité et constance.",
                "details": "L’iracema est l’élastique brut qui offre des performances élastiques constantes et uniformes, étant la base idéale pour les produits nécessitant de stabilité et prêts à entrer dans les processus de coloration et de teinture. Il maintient la qualité et l’élasticité essentielles avant de recevoir la touche finale et de se transformer en un produit fini de haute qualité, sans modifications dimensionnelles indésirables, optimisant ainsi le processus de production des couleurs."
            }
        },
        translationStatus: "published",
        translationUpdatedAt: "2026-09-10T18:33:57.604Z",
        translationSourceSignature: "130cz4p",
        translationLastError: ""
    },
    {
        id: 33,
        nome: "Jeri",
        categoria: "Elásticos Crus",
        imagem: "img - Copia/Elásticos Crus/jeri-stik.png",
        descricao: "Ganhe agilidade e mantenha a qualidade na sua linha de produção industrial com excelência e facilidade.",
        details: "Jeri é o elástico cru que se destaca por ser de fácil manuseio e costura e por possuir excelente resistência ao rasgo e ao atrito. É ideal para confecções que valorizam a praticidade, a rapidez na montagem e a otimização de tempo, garantindo uma estrutura sólida e de qualidade em cada etapa do processo produtivo, entregando um produto final robusto e bem acabado.",
        material: "Elástico",
        i18n: {
            "en": {
                "categoria": "Raw Elastics",
                "material": "Elastic",
                "descricao": "Gain agility and maintain quality in your industrial production line with excellence and ease.",
                "details": "Jeri is the raw elastic that stands out for being easy to handle and sew and for having excellent resistance to tearing and friction. It is ideal for clothing companies that value practicality, speed in assembly and time optimization, ensuring a solid and quality structure at each stage of the production process, delivering a robust and well-finished final product."
            },
            "es": {
                "categoria": "Elásticos en bruto",
                "material": "Elástico",
                "descricao": "Gana agilidad y mantén la calidad en tu línea de producción industrial con excelencia y facilidad.",
                "details": "Jeri es el elástico en bruto que destaca por ser fácil de manipular y coser, y por tener una excelente resistencia al desgarro y la fricción. Es ideal para empresas de confección que valoran la practicidad, la rapidez en el montaje y la optimización del tiempo, asegurando una estructura sólida y de calidad en cada etapa del proceso de producción, ofreciendo un producto final robusto y bien acabado."
            },
            "fr": {
                "categoria": "Élastiques bruts",
                "material": "Élastique",
                "descricao": "Gagnez en agilité et maintenez la qualité dans votre chaîne de production industrielle avec excellence et aisance.",
                "details": "Jeri est l’élastique brut qui se distingue par sa facilité de manipulation et de couture, et par son excellente résistance aux déchirures et aux frottements. Il est idéal pour les entreprises de vêtements qui valorisent la praticité, la rapidité d’assemblage et l’optimisation du temps, garantissant une structure solide et de qualité à chaque étape du processus de production, offrant un produit final robuste et bien fini."
            }
        },
        translationStatus: "published",
        translationUpdatedAt: "2026-09-10T18:33:57.604Z",
        translationSourceSignature: "wv7vtt",
        translationLastError: ""
    },
    {
        id: 34,
        nome: "Plla",
        categoria: "Elásticos Crus",
        imagem: "img - Copia/Elásticos Crus/plla-stik.png",
        descricao: "Alto desempenho técnico para as maiores demandas e exigências do mercado de vestuário.",
        details: "Plla é o elástico cru técnico, perfeito para processos industriais exigentes, de grande volume de produção e que necessitam de máxima performance. Ele oferece a firmeza, a durabilidade e o desempenho superior necessários para o uso em larga escala, com uma garantia de qualidade que assegura a padronização e a consistência do seu produto final em todas as remessas, sendo ideal para peças estruturadas.",
        material: "Elástico",
        i18n: {
            "en": {
                "categoria": "Raw Elastics",
                "material": "Elastic",
                "descricao": "High technical performance for the highest demands and requirements of the clothing market.",
                "details": "Plla is the technical raw elastic, perfect for demanding, high-volume industrial processes that require maximum performance. It offers the firmness, durability and superior performance required for large-scale use, with a quality assurance that ensures the standardization and consistency of your final product in all shipments, and is ideal for structured parts."
            },
            "es": {
                "categoria": "Elásticos en bruto",
                "material": "Elástico",
                "descricao": "Alto rendimiento técnico para las mayores demandas y requisitos del mercado de la confección.",
                "details": "Plla es el elástico técnico en bruto, perfecto para procesos industriales exigentes y de alto volumen que requieren el máximo rendimiento. Ofrece la firmeza, durabilidad y rendimiento superior necesarios para un uso a gran escala, con un control de calidad que garantiza la estandarización y consistencia de tu producto final en todos los envíos, y es ideal para piezas estructuradas."
            },
            "fr": {
                "categoria": "Élastiques bruts",
                "material": "Élastique",
                "descricao": "Haute performance technique pour répondre aux exigences et exigences les plus élevées du marché de l’habillement.",
                "details": "Le PLLA est l’élastique technique brut, parfait pour des processus industriels exigeants et à fort volume qui exigent des performances maximales. Il offre la fermeté, la durabilité et les performances supérieures requises pour une utilisation à grande échelle, avec une assurance qualité garantissant la standardisation et la cohérence de votre produit final dans tous les livraisons, et est idéal pour les pièces structurées."
            }
        },
        translationStatus: "published",
        translationUpdatedAt: "2026-09-10T18:33:57.604Z",
        translationSourceSignature: "1535le0",
        translationLastError: ""
    },
    {
        id: 35,
        nome: "Plus II",
        categoria: "Elásticos Crus",
        imagem: "img - Copia/Elásticos Crus/plusii-stik.png",
        descricao: "A garantia técnica de que o ajuste será mantido, sempre com a máxima precisão dimensional.",
        details: "Plus II é o elástico cru que possui estabilidade dimensional excepcional, o que minimiza o risco de encolhimento ou alargamento indesejado após processos. É um material essencial para garantir que as medidas das peças sejam preservadas e não se alterem, mesmo após os processos de tingimento e acabamento, mantendo a qualidade e o encaixe perfeito da roupa, fundamental para o controle de qualidade.",
        material: "Elástico",
        i18n: {
            "en": {
                "categoria": "Raw Elastics",
                "material": "Elastic",
                "descricao": "The technical guarantee that the fit will be maintained, always with maximum dimensional precision.",
                "details": "Plus II is the raw elastic that has exceptional dimensional stability, which minimizes the risk of shrinkage or unwanted enlargement after processes. It is an essential material to ensure that the measurements of the pieces are preserved and do not change, even after the dyeing and finishing processes, maintaining the quality and perfect fit of the garment, which is essential for quality control."
            },
            "es": {
                "categoria": "Elásticos en bruto",
                "material": "Elástico",
                "descricao": "La garantía técnica de que el ajuste se mantendrá, siempre con máxima precisión dimensional.",
                "details": "El Plus II es el elástico en bruto que tiene una estabilidad dimensional excepcional, lo que minimiza el riesgo de encogimiento o agrandamiento no deseado tras los procesos. Es un material esencial para asegurar que las medidas de las piezas se conserven y no cambien, incluso después de los procesos de teñido y acabado, manteniendo la calidad y el ajuste perfecto de la prenda, lo cual es esencial para el control de calidad."
            },
            "fr": {
                "categoria": "Élastiques bruts",
                "material": "Élastique",
                "descricao": "La garantie technique que l’ajustement sera maintenu, toujours avec une précision dimensionnelle maximale.",
                "details": "Le plus II est l’élastique brut qui offre une stabilité dimensionnelle exceptionnelle, ce qui minimise le risque de rétrécissement ou d’agrandissement indésirable après les procédés. C’est un matériau essentiel pour garantir que les mesures des pièces sont conservées et ne changent pas, même après les processus de teinture et de finition, tout en maintenant la qualité et l’ajustement parfait du vêtement, ce qui est essentiel au contrôle qualité."
            }
        },
        translationStatus: "published",
        translationUpdatedAt: "2026-09-10T18:33:57.604Z",
        translationSourceSignature: "85r8vv",
        translationLastError: ""
    },
    {
        id: 36,
        nome: "Grécia",
        categoria: "Alças",
        imagem: "img - Copia/Alças/grecia-stik (1).png",
        descricao: "Uma alça técnica que garante a precisão do ajuste final e a integridade dimensional da peça.",
        details: "Grecia é a solução técnica para manter a integridade dimensional de suas peças, especialmente em ambientes de alta tensão e uso contínuo. Sua formulação e construção garantem que as medidas da roupa sejam mantidas e estáveis mesmo após passarem por todos os processos de tingimento e acabamento, entregando um resultado final que veste perfeitamente, agrada o consumidor e mantém a durabilidade e o suporte essencial.",
        material: "Elástico",
        i18n: {
            "en": {
                "categoria": "Handles",
                "material": "Elastic",
                "descricao": "A technical handle that guarantees the accuracy of the final fit and the dimensional integrity of the part.",
                "details": "Greece is the technical solution to maintain the dimensional integrity of your garments, especially in high-stress environments and continuous use. Its formulation and construction ensure that the measurements of the garment are maintained and stable even after going through all the dyeing and finishing processes, delivering a final result that fits perfectly, pleases the consumer and maintains durability and essential support."
            },
            "es": {
                "categoria": "Asas",
                "material": "Elástico",
                "descricao": "Un mango técnico que garantice la precisión del ajuste final y la integridad dimensional de la pieza.",
                "details": "Grecia es la solución técnica para mantener la integridad dimensional de tus prendas, especialmente en entornos de alto estrés y uso continuo. Su formulación y construcción aseguran que las medidas de la prenda se mantengan y sean estables incluso después de pasar por todos los procesos de teñido y acabado, ofreciendo un resultado final que encaja perfectamente, satisface al consumidor y mantiene la durabilidad y el soporte esencial."
            },
            "fr": {
                "categoria": "Poignées",
                "material": "Élastique",
                "descricao": "Une poignée technique garantissant la précision de l’ajustement final et l’intégrité dimensionnelle de la pièce.",
                "details": "La Grèce est la solution technique pour maintenir l’intégrité dimensionnelle de vos vêtements, en particulier dans des environnements à forte tension et une utilisation continue. Sa formulation et sa fabrication garantissent que les mesures du vêtement sont maintenues et stables même après tous les processus de teinture et de finition, offrant un résultat final parfaitement ajusté, satisfait le consommateur et conserve la durabilité ainsi que le soutien essentiel."
            }
        },
        translationStatus: "published",
        translationUpdatedAt: "2026-09-10T18:33:57.604Z",
        translationSourceSignature: "k385u9",
        translationLastError: ""
    },
    {
        id: 37,
        nome: "Cintarela",
        categoria: "Modeladores",
        imagem: "img - Copia/Modeladores/cintarela2-stik (1).png",
        descricao: "Desenvolva modeladores com definição de silhueta, conforto e durabilidade inigualáveis para o mercado premium.",
        details: "Cintarela é o elástico que proporciona um suporte firme e um ajuste preciso em peças que demandam compressão controlada e modelagem. Sua construção robusta e tecnológica garante que o vestuário mantenha a forma e a compressão necessária por um longo período de tempo, valorizando a silhueta, o design e garantindo a satisfação do usuário. Ideal para cós de alta sustentação e peças que precisam de alta recuperação elástica.",
        material: "Elástico",
        i18n: {
            "en": {
                "categoria": "Shapewear",
                "material": "Elastic",
                "descricao": "Develop shapewear with silhouette definition, comfort and durability unmatched for the premium market.",
                "details": "Cintarela is the elastic band that provides firm support and a precise fit in pieces that require controlled compression and shaping. Its robust and technological construction ensures that the garment maintains the shape and compression required for a long period of time, enhancing the silhouette, design and ensuring user satisfaction. Ideal for high support waistbands and pieces that need high elastic recovery."
            },
            "es": {
                "categoria": "Prendas moldeadoras",
                "material": "Elástico",
                "descricao": "Desarrolla prendas moldeadoras con definición de silueta, comodidad y durabilidad inigualables para el mercado premium.",
                "details": "Cintarela es la goma elástica que proporciona un soporte firme y un ajuste preciso en piezas que requieren compresión y modelado controlados. Su construcción robusta y tecnológica garantiza que la prenda mantenga la forma y compresión requeridas durante un largo periodo de tiempo, realzando la silueta, el diseño y asegurando la satisfacción del usuario. Ideal para cinturas de alto soporte y piezas que requieren alta recuperación elástica."
            },
            "fr": {
                "categoria": "Vêtements shapewear",
                "material": "Élastique",
                "descricao": "Développez des vêtements shapewear avec une définition de silhouette, un confort et une durabilité inégalés pour le marché haut de gamme.",
                "details": "La Cintarela est l’élastique qui offre un soutien solide et un ajustement précis dans les pièces nécessitant une compression et une forme contrôlées. Sa construction robuste et technologique garantit que le vêtement conserve la forme et la compression requises sur une longue période, améliorant ainsi la silhouette, le design et garantissant la satisfaction de l’utilisateur. Idéal pour les ceintures à fort soutien et les pièces nécessitant une grande récupération élastique."
            }
        },
        translationStatus: "published",
        translationUpdatedAt: "2026-09-10T18:33:57.604Z",
        translationSourceSignature: "8ei5oa",
        translationLastError: ""
    },
    {
        id: 39,
        nome: "Belly",
        categoria: "Personalizados",
        imagem: "img - Copia/Personalizados/bellypersonalisados-stik.png",
        descricao: "Adicione um toque de luxo, sofisticação e personalidade à sua linha premium de vestuário.",
        details: "Esta é a versão customizada do elástico Belly, apresentando um acabamento diferenciado, toque acetinado e resistência superior ao desgaste e à tensão. O produto adiciona um toque exclusivo e visualmente rico às suas peças, mantendo o alto desempenho elástico e a qualidade que são esperados de um material premium, levando a sua marca para o destaque no acabamento.",
        material: "Elástico",
        i18n: {
            "en": {
                "categoria": "Personalized",
                "material": "Elastic",
                "descricao": "Add a touch of luxury, sophistication and personality to your premium line of apparel.",
                "details": "This is the customized version of the Belly elastic, featuring a distinctive finish, satin feel and superior resistance to wear and tension. The product adds an exclusive and visually rich touch to your pieces, while maintaining the high elastic performance and quality that are expected from a premium material, taking your brand to the forefront in the finish."
            },
            "es": {
                "categoria": "Personalizado",
                "material": "Elástico",
                "descricao": "Añade un toque de lujo, sofisticación y personalidad a tu línea de ropa premium.",
                "details": "Esta es la versión personalizada del elástico Belly, con un acabado distintivo, sensación satinada y una resistencia superior al desgaste y la tensión. El producto aporta un toque exclusivo y visualmente rico a tus piezas, manteniendo al tiempo el alto rendimiento elástico y la calidad que se espera de un material premium, llevando tu marca al primer plano en el acabado."
            },
            "fr": {
                "categoria": "Personnalisé",
                "material": "Élastique",
                "descricao": "Ajoutez une touche de luxe, de sophistication et de personnalité à votre gamme de vêtements haut de gamme.",
                "details": "Il s’agit de la version personnalisée de l’élastique Belly, avec une finition distinctive, une sensation satinée et une résistance supérieure à l’usure et à la tension. Le produit apporte une touche exclusive et visuellement riche à vos pièces, tout en conservant les hautes performances élastiques et la qualité attendues d’un matériau premium, mettant votre marque au premier plan dans la finition."
            }
        },
        translationStatus: "published",
        translationUpdatedAt: "2026-09-10T18:33:57.604Z",
        translationSourceSignature: "okdqpe",
        translationLastError: ""
    },
    {
        id: 40,
        nome: "Fênix",
        categoria: "Personalizados",
        imagem: "img - Copia/Personalizados/fenix-stik.png",
        descricao: "A sua identidade em destaque com performance técnica e confiável em cada detalhe de costura.",
        details: "Fenix é o elástico que possui um design exclusivo e desempenho comprovado, desenvolvido sob medida para as necessidades e padrões de design da sua marca. Ele garante que a integridade da estampa ou padrão personalizado se mantenha impecável, reforçando a comunicação visual da sua coleção e assegurando a durabilidade do design mesmo após o uso e lavagem frequentes, com alta fidelidade de cor.",
        material: "Elástico",
        i18n: {
            "en": {
                "categoria": "Personalized",
                "material": "Elastic",
                "descricao": "Your identity stands out with technical and reliable performance in every sewing detail.",
                "details": "Fenix is the elastic band that has a unique design and proven performance, tailored to your brand's needs and design standards. It ensures that the integrity of the print or custom pattern remains impeccable, reinforcing the visual communication of your collection and ensuring the durability of the design even after frequent use and washing, with high color fidelity."
            },
            "es": {
                "categoria": "Personalizado",
                "material": "Elástico",
                "descricao": "Tu identidad destaca por su rendimiento técnico y fiable en cada detalle de costura.",
                "details": "Fenix es la goma elástica con un diseño único y un rendimiento probado, adaptado a las necesidades y estándares de diseño de tu marca. Garantiza que la integridad del estampado o patrón personalizado se mantenga impecable, reforzando la comunicación visual de tu colección y asegurando la durabilidad del diseño incluso tras un uso y lavado frecuentes, con alta fidelidad de color."
            },
            "fr": {
                "categoria": "Personnalisé",
                "material": "Élastique",
                "descricao": "Votre identité se démarque par une performance technique et fiable dans chaque détail de couture.",
                "details": "Fenix est l’élastique qui possède un design unique et des performances éprouvées, adaptée aux besoins et standards de votre marque. Elle garantit que l’intégrité de l’imprimé ou du motif personnalisé reste impeccable, renforçant la communication visuelle de votre collection et garantissant la durabilité du design même après une utilisation et un lavage fréquents, avec une grande fidélité des couleurs."
            }
        },
        translationStatus: "published",
        translationUpdatedAt: "2026-09-10T18:33:57.604Z",
        translationSourceSignature: "m8wug7",
        translationLastError: ""
    },
    {
        id: 41,
        nome: "Fox",
        categoria: "Personalizados",
        imagem: "img - Copia/Personalizados/fox-stik.png",
        descricao: "Maximize o apelo visual customizado para todas as suas peças e garanta um impacto visual forte e memorável.",
        details: "Fox é o elástico personalizado e versátil, que oferece uma excelente área de impressão para a sua marca, logotipos ou padrões decorativos. Ele combina a funcionalidade e o desempenho técnico do elástico com um forte apelo visual customizado e marcante, elevando o design da sua linha de vestuário e garantindo a identidade da sua coleção em cada detalhe do cós.",
        material: "Elástico",
        i18n: {
            "en": {
                "categoria": "Personalized",
                "material": "Elastic",
                "descricao": "Maximize the custom visual appeal for all your pieces and ensure a strong and memorable visual impact.",
                "details": "Fox is the personalized and versatile elastic band, which offers an excellent printing area for your brand, logos or decorative patterns. It combines the functionality and technical performance of the elastic with a strong customized and striking visual appeal, elevating the design of your clothing line and ensuring the identity of your collection in every detail of the waistband."
            },
            "es": {
                "categoria": "Personalizado",
                "material": "Elástico",
                "descricao": "Maximiza el atractivo visual personalizado de todas tus piezas y asegura un impacto visual fuerte e inolvidable.",
                "details": "Fox es la goma elástica personalizada y versátil, que ofrece una excelente zona de impresión para tu marca, logotipos o patrones decorativos. Combina la funcionalidad y el rendimiento técnico de la goma con un atractivo visual personalizado y llamativo, elevando el diseño de tu línea de ropa y asegurando la identidad de tu colección en cada detalle de la cintura."
            },
            "fr": {
                "categoria": "Personnalisé",
                "material": "Élastique",
                "descricao": "Maximisez l’attrait visuel personnalisé de toutes vos pièces et assurez-vous d’un impact visuel fort et mémorable.",
                "details": "Fox est un élastique personnalisé et polyvalent, qui offre un excellent espace d’impression pour votre marque, vos logos ou vos motifs décoratifs. Il allie la fonctionnalité et la performance technique de l’élastique à un attrait visuel personnalisé et frappant, sublimant le design de votre ligne de vêtements et garantissant l’identité de votre collection dans chaque détail de la ceinture."
            }
        },
        translationStatus: "published",
        translationUpdatedAt: "2026-09-10T18:33:57.604Z",
        translationSourceSignature: "11dgq2x",
        translationLastError: ""
    },
    {
        id: 42,
        nome: "Gym",
        categoria: "Personalizados",
        imagem: "img - Copia/Personalizados/gym-stik.png",
        descricao: "Conquiste o mercado esportivo e fitness com estilo, alta performance e funcionalidade garantida.",
        details: "Gym é o elástico personalizado ideal para aplicações fitness e esportivas de alto rendimento. Ele combina alta elasticidade e uma notável resistência ao suor, umidade, cloro e ciclos de lavagens frequentes, garantindo que a personalização da sua marca permaneça intacta, independentemente da intensidade do exercício e da rotina do atleta, oferecendo durabilidade extrema.",
        material: "Elástico",
        i18n: {
            "en": {
                "categoria": "Personalized",
                "material": "Elastic",
                "descricao": "Conquer the sports and fitness market with style, high performance and guaranteed functionality.",
                "details": "Gym is the ideal custom elastic band for high-performance fitness and sports applications. It combines high elasticity and a remarkable resistance to sweat, moisture, chlorine and frequent wash cycles, ensuring that your brand customization remains intact regardless of the intensity of the exercise and the athlete's routine, offering extreme durability."
            },
            "es": {
                "categoria": "Personalizado",
                "material": "Elástico",
                "descricao": "Conquista el mercado del deporte y el fitness con estilo, alto rendimiento y funcionalidad garantizada.",
                "details": "El gimnasio es la banda elástica personalizada ideal para aplicaciones de fitness y deportes de alto rendimiento. Combina alta elasticidad y una resistencia notable al sudor, la humedad, el cloro y ciclos frecuentes de lavado, asegurando que la personalización de tu marca se mantenga intacta independientemente de la intensidad del ejercicio y la rutina del atleta, ofreciendo una durabilidad extrema."
            },
            "fr": {
                "categoria": "Personnalisé",
                "material": "Élastique",
                "descricao": "Conquérez le marché du sport et du fitness avec style, haute performance et fonctionnalité garantie.",
                "details": "La salle de sport est l’élastique sur mesure idéale pour les applications sportives et de fitness haute performance. Elle allie une grande élasticité et une résistance remarquable à la transpiration, à l’humidité, au chlore et aux cycles de lavage fréquents, garantissant que la personnalisation de votre marque reste intacte, quelle que soit l’intensité de l’exercice et la routine de l’athlète, offrant une durabilité extrême."
            }
        },
        translationStatus: "published",
        translationUpdatedAt: "2026-09-10T18:33:57.605Z",
        translationSourceSignature: "6j8fj4",
        translationLastError: ""
    },
    {
        id: 43,
        nome: "Jana",
        categoria: "Personalizados",
        imagem: "img - Copia/Personalizados/jana-stik.png",
        descricao: "Conforto e estilo pensados sob medida para o seu público mais exigente em moda íntima.",
        details: "Jana é o elástico que harmoniza um toque agradável e extremamente suave com um design que pode ser totalmente customizado e exclusivo. É perfeito para linhas de moda íntima que buscam detalhes personalizados e o máximo de bem-estar para o uso prolongado, oferecendo um ajuste suave, discreto e duradouro, com a marca em evidência.",
        material: "Elástico",
        i18n: {
            "en": {
                "categoria": "Personalized",
                "material": "Elastic",
                "descricao": "Comfort and style tailored to your most demanding audience in underwear.",
                "details": "Jana is the elastic that harmonizes a pleasant and extremely soft touch with a design that can be fully customized and exclusive. It is perfect for underwear lines that seek personalized details and maximum well-being for prolonged use, offering a soft, discreet and long-lasting fit, with the brand in evidence."
            },
            "es": {
                "categoria": "Personalizado",
                "material": "Elástico",
                "descricao": "Comodidad y estilo adaptados a tu público más exigente en ropa interior.",
                "details": "Jana es la goma que armoniza un toque agradable y extremadamente suave con un diseño que puede personalizarse completamente y ser exclusivo. Es perfecta para líneas de ropa interior que buscan detalles personalizados y el máximo bienestar para un uso prolongado, ofreciendo un ajuste suave, discreto y duradero, con la marca en la marca."
            },
            "fr": {
                "categoria": "Personnalisé",
                "material": "Élastique",
                "descricao": "Confort et style adaptés à votre public le plus exigeant en sous-vêtements.",
                "details": "Jana est l’élastique qui harmonise un toucher agréable et extrêmement doux avec un design entièrement personnalisé et exclusif. Il est parfait pour les gammes de sous-vêtements qui recherchent des détails personnalisés et un bien-être maximal pour un usage prolongé, offrant une coupe douce, discrète et durable, avec la marque en présentie."
            }
        },
        translationStatus: "published",
        translationUpdatedAt: "2026-09-10T18:33:57.605Z",
        translationSourceSignature: "e3yfwb",
        translationLastError: ""
    },
    {
        id: 44,
        nome: "Kiss",
        categoria: "Personalizados",
        imagem: "img - Copia/Personalizados/kiss-stik.png",
        descricao: "A delicadeza do toque que dura e resiste ao tempo e ao desgaste do uso diário.",
        details: "Kiss é o elástico personalizado com toque suave e resistência ideal para o uso diário em peças delicadas. Permite a criação de designs delicados e esteticamente agradáveis, sem abrir mão da durabilidade e da resistência necessárias para peças de uso contínuo, tornando-o funcional e visualmente atraente para o consumidor final.",
        material: "Elástico",
        i18n: {
            "en": {
                "categoria": "Personalized",
                "material": "Elastic",
                "descricao": "The delicacy of the touch that lasts and resists the time and wear and tear of daily use.",
                "details": "Kiss is the custom elastic with a soft touch and resistance ideal for daily use in delicate pieces. It allows the creation of delicate and aesthetically pleasing designs, without giving up the durability and resistance necessary for pieces of continuous use, making it functional and visually appealing to the end consumer."
            },
            "es": {
                "categoria": "Personalizado",
                "material": "Elástico",
                "descricao": "La delicadeza del tacto que perdura y resiste el tiempo y el desgaste del uso diario.",
                "details": "Kiss es el elástico personalizado con un tacto suave y resistencia, ideal para el uso diario en piezas delicadas. Permite crear diseños delicados y estéticamente agradables, sin renunciar a la durabilidad y resistencia necesarias para piezas de uso continuo, haciéndolo funcional y visualmente atractivo para el consumidor final."
            },
            "fr": {
                "categoria": "Personnalisé",
                "material": "Élastique",
                "descricao": "La délicatesse du contact qui dure et résiste au temps et à l’usure de l’usage quotidien.",
                "details": "Kiss est un élastique sur mesure avec une douceur et une résistance, idéal pour un usage quotidien dans des pièces délicates. Il permet de créer des motifs délicats et esthétiquement agréables, sans renoncer à la durabilité et à la résistance nécessaires pour des pièces à usage continu, le rendant fonctionnel et visuellement attrayant pour le consommateur final."
            }
        },
        translationStatus: "published",
        translationUpdatedAt: "2026-09-10T18:33:57.605Z",
        translationSourceSignature: "1yeyyl6",
        translationLastError: ""
    },
    {
        id: 45,
        nome: "Léxia",
        categoria: "Personalizados",
        imagem: "img - Copia/Personalizados/lexia-stik.png",
        descricao: "Design moderno com um caimento e ajuste perfeitos e duradouros, elevando a peça.",
        details: "Lexia é o elástico de visual contemporâneo e ótimo caimento, que oferece total possibilidade de customização com a sua marca e padrão. É a escolha ideal para coleções que priorizam um ajuste perfeito, durável e um forte apelo de design na cintura ou em acabamentos, garantindo que a peça vista de forma impecável e estruturada no corpo.",
        material: "Elástico",
        i18n: {
            "en": {
                "categoria": "Personalized",
                "material": "Elastic",
                "descricao": "Modern design with a perfect and durable fit and fit, elevating the piece.",
                "details": "Lexia is the elastic with a contemporary look and great fit, which offers full customization with your brand and pattern. It is the ideal choice for collections that prioritize a perfect, durable fit and a strong design appeal at the waist or finishes, ensuring that the piece is worn impeccably and structured on the body."
            },
            "es": {
                "categoria": "Personalizado",
                "material": "Elástico",
                "descricao": "Diseño moderno con un ajuste perfecto y duradero, que eleva la pieza.",
                "details": "Lexia es el elástico con un aspecto contemporáneo y un ajuste excelente, que ofrece personalización total según tu marca y tu patrón. Es la elección ideal para colecciones que priorizan un ajuste perfecto y duradero y un fuerte atractivo de diseño en la cintura o los acabados, asegurando que la prenda se lleve impecable y estructurada en el cuerpo."
            },
            "fr": {
                "categoria": "Personnalisé",
                "material": "Élastique",
                "descricao": "Design moderne avec un ajustement parfait et durable, qui sublime la pièce.",
                "details": "Lexia est l’élastique au look contemporain et à la coupe parfaite, qui offre une personnalisation totale selon votre marque et votre patron. C’est le choix idéal pour les collections qui privilégient un ajustement parfait et durable ainsi qu’un fort attrait de design à la taille ou aux finitions, garantissant que la pièce soit portée de manière impeccable et structurée sur le corps."
            }
        },
        translationStatus: "published",
        translationUpdatedAt: "2026-09-10T18:33:57.605Z",
        translationSourceSignature: "11r98ti",
        translationLastError: ""
    },
    {
        id: 46,
        nome: "Lion",
        categoria: "Personalizados",
        imagem: "img - Copia/Personalizados/lion-stik.png",
        descricao: "Força, resistência e exclusividade em suas peças mais estruturadas e de alta compressão.",
        details: "Lion é o elástico personalizado indicado para vestuário mais robusto, pesado ou que exige maior sustentação e compressão. Ele combina a firmeza estrutural inquestionável do material com a visibilidade e a exclusividade da sua personalização, sendo ideal para cós de alta pressão, roupas de trabalho e vestuário esportivo de impacto, garantindo suporte máximo.",
        material: "Elástico",
        i18n: {
            "en": {
                "categoria": "Personalized",
                "material": "Elastic",
                "descricao": "Strength, resistance and exclusivity in its most structured and high compression pieces.",
                "details": "Lion is the custom elastic indicated for more robust, heavy clothing or that requires greater support and compression. It combines the unquestionable structural firmness of the material with the visibility and exclusivity of its customization, being ideal for high-pressure waistbands, workwear and impact sportswear, ensuring maximum support."
            },
            "es": {
                "categoria": "Personalizado",
                "material": "Elástico",
                "descricao": "Fuerza, resistencia y exclusividad en sus piezas más estructuradas y de alta compresión.",
                "details": "Lion es el elástico personalizado indicado para prendas más robustas y pesadas o que requieren mayor soporte y compresión. Combina la indiscutible firmeza estructural del material con la visibilidad y exclusividad de su personalización, siendo ideal para cinturas de alta presión, ropa de trabajo y ropa deportiva de impacto, asegurando el máximo soporte."
            },
            "fr": {
                "categoria": "Personnalisé",
                "material": "Élastique",
                "descricao": "Force, résistance et exclusivité dans ses pièces les plus structurées et à haute compression.",
                "details": "Lion est l’élastique sur mesure destiné aux vêtements plus robustes et lourds ou nécessitant un meilleur soutien et une compression. Il combine la fermeté structurelle incontestable du matériau avec la visibilité et l’exclusivité de sa personnalisation, étant idéal pour les ceintures à haute pression, les vêtements de travail et les vêtements de sport à impact, garantissant un soutien maximal."
            }
        },
        translationStatus: "published",
        translationUpdatedAt: "2026-09-10T18:33:57.605Z",
        translationSourceSignature: "qm7tyx",
        translationLastError: ""
    },
    {
        id: 47,
        nome: "Liptus",
        categoria: "Personalizados",
        imagem: "img - Copia/Personalizados/liptus-stik.png",
        descricao: "Padrão consistente, confiabilidade técnica e estética garantida em larga escala industrial.",
        details: "Liptus é o elástico personalizado que oferece um acabamento confiável, estável e com alta fidelidade de cor e padrão em todas as tiragens. Sua consistência técnica o torna o material perfeito para tiragens industriais que exigem uma padronização rigorosa e sem falhas, garantindo a uniformidade e a qualidade do seu produto em grandes volumes de produção.",
        material: "Elástico",
        i18n: {
            "en": {
                "categoria": "Personalized",
                "material": "Elastic",
                "descricao": "Consistent standard, technical reliability and aesthetics guaranteed on a large industrial scale.",
                "details": "Liptus is the custom elastic that offers a reliable, stable finish with high color fidelity and pattern in all runs. Its technical consistency makes it the perfect material for industrial runs that require rigorous and flawless standardization, ensuring the uniformity and quality of your product in large production volumes."
            },
            "es": {
                "categoria": "Personalizado",
                "material": "Elástico",
                "descricao": "Estándar consistente, fiabilidad técnica y estética garantizados a gran escala industrial.",
                "details": "Liptus es el elástico personalizado que ofrece un acabado fiable y estable con alta fidelidad de color y patrón en todas las tiradas. Su consistencia técnica lo convierte en el material perfecto para tiradas industriales que requieren una estandarización rigurosa e impecable, asegurando la uniformidad y calidad de tu producto en grandes volúmenes de producción."
            },
            "fr": {
                "categoria": "Personnalisé",
                "material": "Élastique",
                "descricao": "Une standardisation constante, une fiabilité technique et une esthétique garanties à grande échelle industrielle.",
                "details": "Liptus est l’élastique sur mesure qui offre une finition fiable et stable, avec une haute fidélité des couleurs et des motifs dans toutes les séries. Sa cohérence technique en fait le matériau parfait pour les séries industrielles nécessitant une standardisation rigoureuse et sans défaut, garantissant l’uniformité et la qualité de votre produit en grande quantité."
            }
        },
        translationStatus: "published",
        translationUpdatedAt: "2026-09-10T18:33:57.605Z",
        translationSourceSignature: "pot2d",
        translationLastError: ""
    },
    {
        id: 48,
        nome: "Lisboa",
        categoria: "Personalizados",
        imagem: "img - Copia/Personalizados/lisboa-stik.png",
        descricao: "Elegância, estética refinada e alta resistência para o seu segmento de luxo e alta-costura.",
        details: "Lisboa é um elástico de estética refinada e alta resistência ao estiramento e ao desgaste, com amplas opções de customização e personalização de cor. É perfeito para agregar valor, exclusividade e um acabamento de alto padrão em peças de luxo, onde a qualidade técnica e o detalhe visual são inegociáveis, proporcionando um toque sedoso.",
        material: "Elástico",
        i18n: {
            "en": {
                "categoria": "Personalized",
                "material": "Elastic",
                "descricao": "Elegance, refined aesthetics and high resistance for its luxury and haute couture segment.",
                "details": "Lisboa is an elastic band with refined aesthetics and high resistance to stretch and wear, with wide options for customization and color customization. It is perfect for adding value, exclusivity and a high-end finish to luxury pieces, where technical quality and visual detail are non-negotiable, providing a silky touch."
            },
            "es": {
                "categoria": "Personalizado",
                "material": "Elástico",
                "descricao": "Elegancia, estética refinada y alta resistencia para su segmento de lujo y alta costura.",
                "details": "Lisboa es una goma elástica con una estética refinada y alta resistencia al estiramiento y al desgaste, con amplias opciones de personalización y color. Es perfecta para añadir valor, exclusividad y un acabado de alta gama a piezas de lujo, donde la calidad técnica y el detalle visual son innegociables, proporcionando un toque sedoso."
            },
            "fr": {
                "categoria": "Personnalisé",
                "material": "Élastique",
                "descricao": "Élégance, esthétique raffinée et haute résistance pour son segment luxe et haute couture.",
                "details": "Lisboa est un élastique à l’esthétique raffinée et à une grande résistance à l’étirement et à l’usure, avec de larges options de personnalisation et de personnalisation des couleurs. Il est parfait pour apporter de la valeur, de l’exclusivité et une finition haut de gamme aux pièces de luxe, où la qualité technique et le détail visuel sont non négociables, offrant une touche soyeuse."
            }
        },
        translationStatus: "published",
        translationUpdatedAt: "2026-09-10T18:33:57.605Z",
        translationSourceSignature: "cquxzd",
        translationLastError: ""
    },
    {
        id: 50,
        nome: "Master",
        categoria: "Personalizados",
        imagem: "img - Copia/Personalizados/masterpersonalisado-stik.png",
        descricao: "A durabilidade e a resistência Master com a forte e marcante identidade da sua marca.",
        details: "Esta é a versão customizada do elástico Master, com personalização de alta durabilidade e integridade visual. Ele combina a resistência estrutural inquestionável e o suporte técnico do material com a forte e marcante identidade visual da sua marca, sendo ideal para peças que serão submetidas a uso intenso e lavagens frequentes, garantindo longevidade.",
        material: "Elástico",
        i18n: {
            "en": {
                "categoria": "Personalized",
                "material": "Elastic",
                "descricao": "The durability and resistance Master with the strong and striking identity of its brand.",
                "details": "This is the customized version of the Master elastic, with high durability customization and visual integrity. It combines the unquestionable structural strength and technical support of the material with the strong and striking visual identity of its brand, being ideal for pieces that will be subjected to intense use and frequent washing, ensuring longevity."
            },
            "es": {
                "categoria": "Personalizado",
                "material": "Elástico",
                "descricao": "El Maestro de la durabilidad y la resistencia con la identidad fuerte y llamativa de su marca.",
                "details": "Esta es la versión personalizada del elástico Master, con alta durabilidad e integridad visual. Combina la indiscutible resistencia estructural y el soporte técnico del material con la identidad visual fuerte y llamativa de su marca, siendo ideal para piezas que serán sometidas a un uso intenso y lavados frecuentes, garantizando su durabilidad."
            },
            "fr": {
                "categoria": "Personnalisé",
                "material": "Élastique",
                "descricao": "Le Maître de la durabilité et de la résistance avec l’identité forte et frappante de sa marque.",
                "details": "Il s’agit de la version personnalisée de l’élastique Master, avec une grande durabilité et une grande intégrité visuelle. Il combine la solidité structurelle incontestable et le soutien technique du matériau à l’identité visuelle forte et frappante de sa marque, étant idéal pour les pièces soumises à un usage intense et à des lavages fréquents, assurant ainsi leur longévité."
            }
        },
        translationStatus: "published",
        translationUpdatedAt: "2026-09-10T18:33:57.605Z",
        translationSourceSignature: "1e1a4ql",
        translationLastError: ""
    },
    {
        id: 51,
        nome: "Plus II",
        categoria: "Personalizados",
        imagem: "img - Copia/Personalizados/pluspesonalisados-stik.png",
        descricao: "Firmeza, conforto no ajuste e a sua assinatura em destaque no acabamento final.",
        details: "Este elástico equilibra sustentação e elasticidade de forma ideal, agora em uma versão totalmente customizada e fiel ao seu design. É a solução perfeita para quem busca um ajuste confortável, durável e deseja manter a marca em evidência no cós, barra ou alça, unindo qualidade técnica e estabilidade dimensional à comunicação visual com o consumidor.",
        material: "Elástico",
        i18n: {
            "en": {
                "categoria": "Personalized",
                "material": "Elastic",
                "descricao": "Firmness, comfort in the fit and your signature highlighted in the final finish.",
                "details": "This elastic balances support and elasticity in an ideal way, now in a fully customized version and faithful to its design. It is the perfect solution for those looking for a comfortable, durable fit and want to keep the brand in evidence on the waistband, hem or strap, combining technical quality and dimensional stability with visual communication with the consumer."
            },
            "es": {
                "categoria": "Personalizado",
                "material": "Elástico",
                "descricao": "Firmeza, comodidad en el ajuste y tu firma resaltada en el acabado final.",
                "details": "Este elástico equilibra el soporte y la elasticidad de forma ideal, ahora en una versión totalmente personalizada y fiel a su diseño. Es la solución perfecta para quienes buscan un ajuste cómodo y duradero y quieren mantener la marca visible en la cintura, el bajo o la correa, combinando calidad técnica y estabilidad dimensional con comunicación visual con el consumidor."
            },
            "fr": {
                "categoria": "Personnalisé",
                "material": "Élastique",
                "descricao": "Fermeté, confort dans la coupe et votre signature mise en valeur dans la finition finale.",
                "details": "Cet élastique équilibre soutien et élasticité de manière idéale, désormais en version entièrement personnalisée et fidèle à son design. C’est la solution idéale pour ceux qui recherchent une coupe confortable et durable et souhaitent garder la marque bien visible sur la ceinture, l’ourlet ou la sangle, alliant qualité technique et stabilité dimensionnelle avec une communication visuelle avec le consommateur."
            }
        },
        translationStatus: "published",
        translationUpdatedAt: "2026-09-10T18:33:57.605Z",
        translationSourceSignature: "10qj9q1",
        translationLastError: ""
    },
    {
        id: 52,
        nome: "Puma",
        categoria: "Personalizados",
        imagem: "img - Copia/Personalizados/puma-foto.png",
        descricao: "Força, visual robusto e um estilo marcante que se destacam no vestuário esportivo e casual.",
        details: "Puma é o elástico com visual robusto e uma construção resistente, que permite uma customização de alto impacto e grande visibilidade da marca. É perfeito para a moda esportiva e peças que exigem um forte apelo visual, sem comprometer a durabilidade, a elasticidade e a performance do material em situações de tensão e movimento intenso, garantindo suporte e design.",
        material: "Elástico",
        i18n: {
            "en": {
                "categoria": "Personalized",
                "material": "Elastic",
                "descricao": "Strength, rugged looks, and a striking style that stand out in sportswear and casual wear.",
                "details": "Puma is the elastic band with a robust look and a resistant construction, which allows for high-impact customization and great brand visibility. It is perfect for sportswear and pieces that require a strong visual appeal, without compromising the durability, elasticity and performance of the material in situations of tension and intense movement, ensuring support and design."
            },
            "es": {
                "categoria": "Personalizado",
                "material": "Elástico",
                "descricao": "Fuerza, aspecto robusto y un estilo llamativo que destacan tanto en ropa deportiva como casual.",
                "details": "Puma es la goma elástica con un aspecto robusto y una construcción resistente, que permite una personalización de alto impacto y una gran visibilidad de marca. Es perfecta para ropa deportiva y prendas que requieren un atractivo visual fuerte, sin comprometer la durabilidad, elasticidad y rendimiento del material en situaciones de tensión y movimientos intensos, asegurando soporte y diseño."
            },
            "fr": {
                "categoria": "Personnalisé",
                "material": "Élastique",
                "descricao": "Force, looks robustes et un style frappant qui ressortent dans les vêtements de sport et décontractés.",
                "details": "Puma est un élastique à l’allure robuste et à la construction résistante, qui permet une personnalisation à fort impact et une grande visibilité de marque. Il est parfait pour les vêtements de sport et les pièces nécessitant un fort attrait visuel, sans compromettre la durabilité, l’élasticité et la performance du matériau dans des situations de tension et de mouvements intenses, garantissant ainsi un soutien et un design."
            }
        },
        translationStatus: "published",
        translationUpdatedAt: "2026-09-10T18:33:57.605Z",
        translationSourceSignature: "iteg8j",
        translationLastError: ""
    },
    {
        id: 53,
        nome: "Senna",
        categoria: "Personalizados",
        imagem: "img - Copia/Personalizados/senna-stik.png",
        descricao: "Durabilidade técnica e a visibilidade da marca que resistem ao tempo, atrito e uso intenso.",
        details: "Senna é o elástico personalizado com excelente resistência ao desgaste, ao atrito e à fadiga do material. É ideal para aplicações em que a durabilidade do material e a visibilidade da marca são cruciais e precisam ser mantidas em condições de uso intenso e lavagens frequentes, como cós de calças e peças esportivas de alta frequência de uso, mantendo o acabamento impecável.",
        material: "Elástico",
        i18n: {
            "en": {
                "categoria": "Personalized",
                "material": "Elastic",
                "descricao": "Technical durability and brand visibility that stand up to time, friction and heavy use.",
                "details": "Senna is the custom elastic band with excellent resistance to material wear, friction and fatigue. It is ideal for applications where material durability and brand visibility are crucial and need to be maintained in conditions of heavy use and frequent washing, such as pant waistbands and high-frequency sports garments, while maintaining the impeccable finish."
            },
            "es": {
                "categoria": "Personalizado",
                "material": "Elástico",
                "descricao": "Durabilidad técnica y visibilidad de marca que resisten el tiempo, la fricción y el uso intenso.",
                "details": "Senna es la banda elástica personalizada con excelente resistencia al desgaste del material, la fricción y la fatiga. Es ideal para aplicaciones donde la durabilidad del material y la visibilidad de la marca son cruciales y deben mantenerse en condiciones de uso intensivo y lavados frecuentes, como cinturas de pantalones y prendas deportivas de alta frecuencia, manteniendo el acabado impecable."
            },
            "fr": {
                "categoria": "Personnalisé",
                "material": "Élastique",
                "descricao": "Durabilité technique et visibilité de marque qui résistent au temps, aux frictions et à une utilisation intensive.",
                "details": "Le Senna est un élastique sur mesure offrant une excellente résistance à l’usure des matériaux, à la friction et à la fatigue. Il est idéal pour les applications où la durabilité du matériau et la visibilité de la marque sont cruciales et doivent être maintenues dans des conditions d’utilisation intensive et de lavages fréquents, comme les ceintures de pantalons et les vêtements de sport à haute fréquence, tout en maintenant une finition impeccable."
            }
        },
        translationStatus: "published",
        translationUpdatedAt: "2026-09-10T18:33:57.605Z",
        translationSourceSignature: "1vopded",
        translationLastError: ""
    },
    {
        id: 54,
        nome: "Vênus",
        categoria: "Personalizados",
        imagem: "img - Copia/Personalizados/venus-stik.png",
        descricao: "O toque de luxo e a suavidade em um acabamento premium e totalmente customizado.",
        details: "Venus é o elástico personalizado com toque suave, sedoso e acabamento superior, ideal para contato direto com a pele em peças íntimas. Ele adiciona um detalhe de luxo e conforto imediato às peças, valorizando instantaneamente a identidade e o cuidado da sua marca com o produto e a experiência do consumidor, com excelente recuperação elástica e caimento.",
        material: "Elástico",
        i18n: {
            "en": {
                "categoria": "Personalized",
                "material": "Elastic",
                "descricao": "The touch of luxury and softness in a premium and fully customized finish.",
                "details": "Venus is the custom elastic with a soft, silky touch and superior finish, ideal for direct skin contact in intimate pieces. It adds a detail of luxury and immediate comfort to the pieces, instantly enhancing your brand's identity and care for the product and the consumer experience, with excellent elastic recovery and fit."
            },
            "es": {
                "categoria": "Personalizado",
                "material": "Elástico",
                "descricao": "El toque de lujo y suavidad en un acabado premium y totalmente personalizado.",
                "details": "Venus es la goma elástica personalizada con un toque suave, sedoso y un acabado superior, ideal para el contacto directo de la piel en piezas íntimas. Añade un detalle de lujo y comodidad inmediata a las piezas, realzando instantáneamente la identidad de tu marca y el cuidado del producto y la experiencia del consumidor, con excelente recuperación y ajuste elástico."
            },
            "fr": {
                "categoria": "Personnalisé",
                "material": "Élastique",
                "descricao": "La touche de luxe et de douceur dans une finition premium et entièrement personnalisée.",
                "details": "Venus est un élastique sur mesure avec une toucher douce et soyeuse et une finition supérieure, idéal pour un contact direct de la peau dans des pièces intimes. Il ajoute un détail de luxe et un confort immédiat aux pièces, sublimant instantanément l’identité de votre marque et le soin de votre produit ainsi que de l’expérience consommateur, avec une excellente récupération élastique et ajustement."
            }
        },
        translationStatus: "published",
        translationUpdatedAt: "2026-09-10T18:33:57.605Z",
        translationSourceSignature: "184h509",
        translationLastError: ""
    },
    {
        id: 55,
        nome: "Virtus",
        categoria: "Personalizados",
        imagem: "img - Copia/Personalizados/virtus-stik.png",
        descricao: "Confiabilidade técnica, padrão consistente e estética premium para todas as suas criações.",
        details: "Virtus é o elástico personalizado que oferece consistência de alto nível e um visual sofisticado e marcante, com alta fidelidade de cor. Sua construção garante um encaixe perfeito e duradouro, sendo um material de alta qualidade e ótimo caimento para peças de vestuário que exigem acabamento diferenciado e a visibilidade da marca em cós ou alças.",
        material: "Elástico",
        i18n: {
            "en": {
                "categoria": "Personalized",
                "material": "Elastic",
                "descricao": "Technical reliability, consistent standard and premium aesthetics for all your creations.",
                "details": "Virtus is the custom elastic band that offers high-level consistency and a sophisticated and striking look, with high color fidelity. Its construction guarantees a perfect and long-lasting fit, being a high-quality material and great fit for garments that require a differentiated finish and brand visibility in waistbands or straps."
            },
            "es": {
                "categoria": "Personalizado",
                "material": "Elástico",
                "descricao": "Fiabilidad técnica, estética estándar y premium consistente para todas tus creaciones.",
                "details": "Virtus es la goma elástica personalizada que ofrece una consistencia de alto nivel y un aspecto sofisticado y llamativo, con alta fidelidad de color. Su construcción garantiza un ajuste perfecto y duradero, siendo un material de alta calidad y un ajuste excelente para prendas que requieren un acabado diferenciado y visibilidad de marca en cinturas o tirantes."
            },
            "fr": {
                "categoria": "Personnalisé",
                "material": "Élastique",
                "descricao": "Fiabilité technique, standardisation cohérente et esthétique premium pour toutes vos créations.",
                "details": "Virtus est un élastique sur mesure qui offre une cohérence de haut niveau et un look sophistiqué et frappant, avec une grande fidélité des couleurs. Sa construction garantit un ajustement parfait et durable, étant un matériau de haute qualité et un excellent ajustement pour des vêtements nécessitant une finition différenciée et une visibilité de marque dans les ceintures ou les bretelles."
            }
        },
        translationStatus: "published",
        translationUpdatedAt: "2026-09-10T18:33:57.605Z",
        translationSourceSignature: "h526lb",
        translationLastError: ""
    },
    {
        id: 56,
        nome: "X Nillo",
        categoria: "Personalizados",
        imagem: "img - Copia/Personalizados/xnillo-stik.png",
        descricao: "O elástico versátil, personalizado e de alta qualidade para qualquer desafio de design e costura.",
        details: "X Nillo é um produto com alto nível de acabamento e grande versatilidade em sua aplicação em diversos tipos de vestuário. Adapta-se com excelência a diferentes tipos de peças e métodos de costura, assegurando um resultado de alta qualidade, resistência e a visibilidade da sua marca no acabamento, desde moda íntima a roupas esportivas e de base, com durabilidade garantida.",
        material: "Elástico",
        i18n: {
            "en": {
                "categoria": "Personalized",
                "material": "Elastic",
                "descricao": "The versatile, custom, high-quality elastic band for any design and sewing challenge.",
                "details": "X Nillo is a product with a high level of finish and great versatility in its application in various types of clothing. It adapts with excellence to different types of garments and sewing methods, ensuring a result of high quality, resistance and the visibility of your brand in the finish, from underwear to sportswear and basewear, with guaranteed durability."
            },
            "es": {
                "categoria": "Personalizado",
                "material": "Elástico",
                "descricao": "La goma elástica versátil, personalizada y de alta calidad para cualquier reto de diseño y costura.",
                "details": "X Nillo es un producto con un alto nivel de acabado y gran versatilidad en su aplicación en diversos tipos de ropa. Se adapta con excelencia a diferentes tipos de prendas y métodos de costura, asegurando un resultado de alta calidad, resistencia y la visibilidad de tu marca en el acabado, desde ropa interior hasta ropa deportiva y base, con durabilidad garantizada."
            },
            "fr": {
                "categoria": "Personnalisé",
                "material": "Élastique",
                "descricao": "L’élastique polyvalent, sur mesure et de haute qualité pour tout défi de design et de couture.",
                "details": "X Nillo est un produit à la finition élevée et à la grande polyvalence dans son application sur divers types de vêtements. Il s’adapte avec excellence à différents types de vêtements et de méthodes de couture, garantissant un résultat de haute qualité, de résistance et la visibilité de votre marque dans la finition, des sous-vêtements aux vêtements de sport et basewears, avec une durabilité garantie."
            }
        },
        translationStatus: "published",
        translationUpdatedAt: "2026-09-10T18:33:57.605Z",
        translationSourceSignature: "1xrfa6g",
        translationLastError: ""
    },
    {
        id: 58,
        nome: "Camila",
        categoria: "Premium",
        imagem: "img - Copia/Premium/camila-stik.png",
        descricao: "Elegância superior e resistência inabalável que definem o padrão premium para suas coleções.",
        details: "Camila é o elástico que combina estilo, toque sedoso e uma durabilidade superior, ideal para peças de luxo. Sua textura e brilho são ideais para peças que buscam um diferencial estético marcante no acabamento e a garantia de uma longa vida útil do vestuário, confirmando o alto valor percebido da sua coleção pela excelência do material e sua capacidade de manter o design original.",
        material: "Elástico",
        i18n: {
            "en": {
                "categoria": "Premium",
                "material": "Elastic",
                "descricao": "Superior elegance and unwavering strength that set the premium standard for its collections.",
                "details": "Camila is the elastic band that combines style, silky touch and superior durability, ideal for luxury pieces. Its texture and shine are ideal for pieces that seek a striking aesthetic differential in the finish and the guarantee of a long useful life of the garment, confirming the high perceived value of its collection for the excellence of the material and its ability to maintain the original design."
            },
            "es": {
                "categoria": "Premium",
                "material": "Elástico",
                "descricao": "Elegancia superior y fuerza inquebrantable que marcaron el estándar premium para sus colecciones.",
                "details": "Camila es la goma elástica que combina estilo, toque sedoso y durabilidad superior, ideal para piezas de lujo. Su textura y brillo son ideales para piezas que buscan una llamativa diferencia estética en el acabado y la garantía de una larga vida útil de la prenda, confirmando el alto valor percibido de su colección por la excelencia del material y su capacidad para mantener el diseño original."
            },
            "fr": {
                "categoria": "Premium",
                "material": "Élastique",
                "descricao": "Une élégance supérieure et une force inébranlable qui ont établi la norme haut de gamme pour ses collections.",
                "details": "Camila est l’élastique qui allie style, touche soyeuse et durabilité supérieure, idéale pour les pièces de luxe. Sa texture et son éclat sont idéales pour les pièces recherchant une différence esthétique frappante dans la finition et la garantie d’une longue durée de vie utile du vêtement, confirmant la grande valeur perçue de sa collection pour l’excellence du matériau et sa capacité à conserver le design original."
            }
        },
        translationStatus: "published",
        translationUpdatedAt: "2026-09-10T18:33:57.605Z",
        translationSourceSignature: "1a33s6k",
        translationLastError: ""
    },
    {
        id: 59,
        nome: "Listras",
        categoria: "Premium",
        imagem: "img - Copia/Premium/listras-stik.png",
        descricao: "Um detalhe sofisticado, moderno e durável que perdura no tempo com notável elegância.",
        details: "Listras é o elástico premium que apresenta um visual listrado diferenciado e resistente ao desgaste e à deformação. Adiciona um toque de design moderno, sofisticado e discreto, mantendo a qualidade técnica e o desempenho elástico superior esperado da linha premium em cós e acabamentos, com um excelente retorno elástico e estabilidade dimensional, garantindo a forma da peça.",
        material: "Elástico",
        i18n: {
            "en": {
                "categoria": "Premium",
                "material": "Elastic",
                "descricao": "A sophisticated, modern and durable detail that lasts over time with remarkable elegance.",
                "details": "Stripes is the premium elastic band that presents a distinctive striped look that is resistant to wear and tear and deformation. It adds a touch of modern, sophisticated and discreet design, while maintaining the technical quality and superior elastic performance expected from the premium line in waistbands and finishes, with an excellent elastic return and dimensional stability, ensuring the shape of the piece."
            },
            "es": {
                "categoria": "Premium",
                "material": "Elástico",
                "descricao": "Un detalle sofisticado, moderno y duradero que perdura con el tiempo con una elegancia notable.",
                "details": "Stripes es la banda elástica premium que presenta un aspecto distintivo de rayas resistente al desgaste y deformaciones. Añade un toque de diseño moderno, sofisticado y discreto, manteniendo la calidad técnica y el rendimiento elástico superior esperados de la línea premium en cinturas y acabados, con un excelente retorno elástico y estabilidad dimensional, asegurando la forma de la pieza."
            },
            "fr": {
                "categoria": "Premium",
                "material": "Élastique",
                "descricao": "Un détail sophistiqué, moderne et durable qui perdure dans le temps avec une élégance remarquable.",
                "details": "Stripes est la bande élastique premium qui présente un aspect rayé distinctif, résistant à l’usure et à la déformation. Elle ajoute une touche de design moderne, sophistiqué et discret, tout en conservant la qualité technique et les performances élastiques supérieures attendues de la gamme premium pour les ceintures et les finitions, avec un excellent retour élastique et une stabilité dimensionnelle, assurant la forme de la pièce."
            }
        },
        translationStatus: "published",
        translationUpdatedAt: "2026-09-10T18:33:57.605Z",
        translationSourceSignature: "697s7f",
        translationLastError: ""
    },
    {
        id: 61,
        nome: "Ana Bicolor",
        categoria: "Rendas",
        imagem: "img - Copia/Rendas/anabivolor-stik.png",
        descricao: "Contraste visual marcante, sofisticação e elegância em cada centímetro da peça.",
        details: "Ana Bicolor é a renda que apresenta uma padronagem em duas cores, oferecendo um contraste estético elegante, um visual profundo e um caimento excelente. É a escolha perfeita para peças que desejam um toque de cor sofisticado e um design inconfundível, unindo a delicadeza da renda à resistência técnica necessária para a produção e o uso contínuo, mantendo a integridade do desenho.",
        material: "Elástico",
        i18n: {
            "en": {
                "categoria": "Rents",
                "material": "Elastic",
                "descricao": "Striking visual contrast, sophistication and elegance in every inch of the piece.",
                "details": "Ana Bicolor is lace that features a two-color pattern, offering an elegant aesthetic contrast, a deep look and an excellent fit. It is the perfect choice for pieces that want a sophisticated touch of color and an unmistakable design, combining the delicacy of lace with the technical resistance necessary for production and continuous use, while maintaining the integrity of the design."
            },
            "es": {
                "categoria": "Alquileres",
                "material": "Elástico",
                "descricao": "Contraste visual impactante, sofisticación y elegancia en cada centímetro de la pieza.",
                "details": "Ana Bicolor es un encaje que presenta un patrón bicolor, ofreciendo un contraste estético elegante, un aspecto profundo y un ajuste excelente. Es la elección perfecta para piezas que buscan un toque sofisticado de color y un diseño inconfundible, combinando la delicadeza del encaje con la resistencia técnica necesaria para la producción y el uso continuo, manteniendo la integridad del diseño."
            },
            "fr": {
                "categoria": "Loyers",
                "material": "Élastique",
                "descricao": "Un contraste visuel frappant, une sophistication et une élégance dans chaque centimètre de la pièce.",
                "details": "Ana Bicolor est une dentelle qui présente un motif bicolore, offrant un contraste esthétique élégant, un look profond et une coupe parfaite. C’est le choix idéal pour les pièces qui recherchent une touche de couleur sophistiquée et un design inimitable, alliant la délicatesse de la dentelle à la résistance technique nécessaire à la production et à l’utilisation continue, tout en conservant l’intégrité du design."
            }
        },
        translationStatus: "published",
        translationUpdatedAt: "2026-09-10T18:33:57.605Z",
        translationSourceSignature: "any7hk",
        translationLastError: ""
    },
    {
        id: 62,
        nome: "Capi",
        categoria: "Rendas",
        imagem: "img - Copia/Rendas/capi-stik.png",
        descricao: "A versatilidade do material para compor peças elegantes e detalhes decorativos ricos e duradouros.",
        details: "Capi é a renda cuja estrutura técnica garante durabilidade e mantém a delicadeza do desenho original intacta, mesmo após o uso contínuo e diversas lavagens industriais. É um material confiável e de alta performance para criar composições sofisticadas, valorizando o design da lingerie e oferecendo um toque suave, com excelente maleabilidade na aplicação.",
        material: "Elástico",
        i18n: {
            "en": {
                "categoria": "Rents",
                "material": "Elastic",
                "descricao": "The versatility of the material to compose elegant pieces and rich, long-lasting decorative details.",
                "details": "Capi is the lace whose technical structure guarantees durability and keeps the delicacy of the original design intact, even after continuous use and several industrial washes. It is a reliable and high-performance material to create sophisticated compositions, enhancing the design of the lingerie and offering a soft touch, with excellent malleability in application."
            },
            "es": {
                "categoria": "Alquileres",
                "material": "Elástico",
                "descricao": "La versatilidad del material para componer piezas elegantes y detalles decorativos ricos y duraderos.",
                "details": "El capi es el encaje cuya estructura técnica garantiza durabilidad y mantiene intacta la delicadeza del diseño original, incluso tras un uso continuo y varios lavados industriales. Es un material fiable y de alto rendimiento para crear composiciones sofisticadas, realzando el diseño de la lencería y ofreciendo un toque suave, con excelente maleabilidad en su aplicación."
            },
            "fr": {
                "categoria": "Loyers",
                "material": "Élastique",
                "descricao": "La polyvalence du matériau pour composer des pièces élégantes et des détails décoratifs riches et durables.",
                "details": "Le capi est la dentelle dont la structure technique garantit la durabilité et conserve la délicatesse du design original, même après une utilisation continue et plusieurs lavages industriels. C’est un matériau fiable et performant pour créer des compositions sophistiquées, mettant en valeur le design de la lingerie et offrant une touche douce, avec une excellente malléabilité dans l’application."
            }
        },
        translationStatus: "published",
        translationUpdatedAt: "2026-09-10T18:33:57.605Z",
        translationSourceSignature: "1r8xlgl",
        translationLastError: ""
    },
    {
        id: 63,
        nome: "Eva",
        categoria: "Rendas",
        imagem: "img - Copia/Rendas/eva-stik.png",
        descricao: "O máximo de conforto e suavidade extrema para áreas sensíveis e delicadas da pele.",
        details: "Eva é a renda de toque macio, com acabamento suave e maleável, sendo ideal para aplicações em áreas da pele que demandam maior delicadeza e bem-estar. Proporciona um conforto extremo ao vestir e um visual delicado ao produto final, garantindo a satisfação do usuário em peças de uso diário e com a leveza e beleza estética da renda.",
        material: "Elástico",
        i18n: {
            "en": {
                "categoria": "Rents",
                "material": "Elastic",
                "descricao": "Maximum comfort and extreme softness for sensitive and delicate areas of the skin.",
                "details": "Eva is the lace with a soft touch, with a smooth and malleable finish, being ideal for applications in areas of the skin that demand greater delicacy and well-being. It provides extreme comfort when wearing and a delicate look to the final product, ensuring user satisfaction in everyday items and with the lightness and aesthetic beauty of lace."
            },
            "es": {
                "categoria": "Alquileres",
                "material": "Elástico",
                "descricao": "Máxima comodidad y suavidad extrema para zonas sensibles y delicadas de la piel.",
                "details": "Eva es el encaje con un toque suave, con un acabado liso y maleable, ideal para aplicaciones en zonas de la piel que requieren mayor delicadeza y bienestar. Proporciona un confort extremo al llevarlo y un aspecto delicado al producto final, asegurando la satisfacción del usuario con objetos cotidianos y con la ligereza y belleza estética del encaje."
            },
            "fr": {
                "categoria": "Loyers",
                "material": "Élastique",
                "descricao": "Confort maximal et extrême douceur pour les zones sensibles et délicates de la peau.",
                "details": "Eva est la dentelle au toucher doux, avec une finition lisse et malléable, idéale pour les applications dans les zones de la peau qui exigent plus de délicatesse et de bien-être. Elle offre un confort extrême lors du port et un aspect délicat au produit final, garantissant la satisfaction de l’utilisateur dans les articles du quotidien ainsi que la légèreté et la beauté esthétique de la dentelle."
            }
        },
        translationStatus: "published",
        translationUpdatedAt: "2026-09-10T18:33:57.605Z",
        translationSourceSignature: "1fyb67y",
        translationLastError: ""
    },
    {
        id: 64,
        nome: "Ina",
        categoria: "Rendas",
        imagem: "img - Copia/Rendas/ina-stik.png",
        descricao: "Leveza, discrição e acabamento perfeito para a criação de detalhes finos e delicados.",
        details: "Ina é a renda que combina um visual leve e delicado com alta maleabilidade e adaptabilidade a contornos. É a escolha perfeita para aplicações em peças femininas que buscam leveza, um caimento suave e um acabamento discreto, porém elegante e sofisticado, sem comprometer a resistência e durabilidade do material no uso frequente.",
        material: "Elástico",
        i18n: {
            "en": {
                "categoria": "Rents",
                "material": "Elastic",
                "descricao": "Lightness, discretion and perfect finish for the creation of fine and delicate details.",
                "details": "Ina is lace that combines a light and delicate look with high malleability and adaptability to contours. It is the perfect choice for applications in women's pieces that seek lightness, a soft fit and a discreet, yet elegant and sophisticated finish, without compromising the strength and durability of the material in frequent use."
            },
            "es": {
                "categoria": "Alquileres",
                "material": "Elástico",
                "descricao": "Ligereza, discreción y un acabado perfecto para crear detalles finos y delicados.",
                "details": "El encaje es un encaje que combina un aspecto ligero y delicado con alta maleabilidad y adaptabilidad a los contornos. Es la elección perfecta para aplicaciones en piezas femeninas que buscan ligereza, un ajuste suave y un acabado discreto, pero elegante y sofisticado, sin comprometer la resistencia y durabilidad del material en uso frecuente."
            },
            "fr": {
                "categoria": "Loyers",
                "material": "Élastique",
                "descricao": "Légèreté, discrétion et finition parfaite pour créer des détails fins et délicats.",
                "details": "L’ina est une dentelle qui allie un look léger et délicat à une grande malléabilité et adaptabilité aux contours. C’est le choix parfait pour les pièces féminines recherchant la légèreté, une coupe douce et une finition discrète, élégante et sophistiquée, sans compromettre la solidité et la durabilité du matériau utilisé fréquemment."
            }
        },
        translationStatus: "published",
        translationUpdatedAt: "2026-09-10T18:33:57.605Z",
        translationSourceSignature: "g1rbyi",
        translationLastError: ""
    },
    {
        id: 65,
        nome: "Lara",
        categoria: "Rendas",
        imagem: "img - Copia/Rendas/lara-stik.png",
        descricao: "Beleza estética, resistência e ajuste confortável sem apertar ou causar incômodo.",
        details: "Lara é a renda que combina leveza e resistência, ideal para ser utilizada em acabamentos de cós e pernas de calcinhas e sutiãs. Oferece um bom nível de ajuste e conforto, mantendo a beleza do padrão e garantindo que a peça fique no lugar sem causar incômodo ou compressão excessiva, valorizando a experiência do consumidor com o caimento suave e seguro.",
        material: "Elástico",
        i18n: {
            "en": {
                "categoria": "Rents",
                "material": "Elastic",
                "descricao": "Aesthetic beauty, resistance and comfortable fit without tightening or causing discomfort.",
                "details": "Lara is the lace that combines lightness and resistance, ideal to be used in waistband and leg finishes of panties and bras. It offers a good level of fit and comfort, maintaining the beauty of the pattern and ensuring that the piece stays in place without causing discomfort or excessive compression, enhancing the consumer experience with the smooth and secure fit."
            },
            "es": {
                "categoria": "Alquileres",
                "material": "Elástico",
                "descricao": "Belleza estética, resistencia y ajuste cómodo sin apretarlos ni causar incomodidad.",
                "details": "Lara es el encaje que combina ligereza y resistencia, ideal para usarse en acabados de cintura y piernas de braguitas y sujetadores. Ofrece un buen ajuste y comodidad, manteniendo la belleza del patrón y asegurando que la pieza se mantenga en su lugar sin causar molestias ni compresión excesiva, mejorando la experiencia del consumidor con un ajuste suave y seguro."
            },
            "fr": {
                "categoria": "Loyers",
                "material": "Élastique",
                "descricao": "Beauté esthétique, résistance et ajustement confortable sans serrer ni causer d’inconfort.",
                "details": "La dentelle est la dentelle qui allie légèreté et résistance, idéale pour les finitions de la ceinture et des jambes de culottes et soutiens-gorge. Elle offre un bon niveau d’ajustement et de confort, conservant la beauté du patron et garantissant que la pièce reste en place sans inconfort ni compression excessive, améliorant l’expérience du consommateur grâce à un ajustement fluide et sécurisé."
            }
        },
        translationStatus: "published",
        translationUpdatedAt: "2026-09-10T18:33:57.605Z",
        translationSourceSignature: "1wy9ua9",
        translationLastError: ""
    },
    {
        id: 66,
        nome: "Luna",
        categoria: "Rendas",
        imagem: "img - Copia/Rendas/luna-stik.png",
        descricao: "O material chave para composições elegantes, sofisticadas e luxuosas no segmento de moda íntima.",
        details: "Luna é a renda que possui uma aparência sofisticada, um design de alto padrão e toque suave, perfeita para coleções que exigem excelência. Sua construção técnica a torna uma excelente escolha para agregar um valor percebido alto aos seus produtos, garantindo beleza duradoura, caimento impecável e excelente recuperação elástica, ideal para peças de destaque.",
        material: "Elástico",
        i18n: {
            "en": {
                "categoria": "Rents",
                "material": "Elastic",
                "descricao": "The key material for elegant, sophisticated and luxurious compositions in the underwear segment.",
                "details": "Luna is lace that has a sophisticated appearance, a high-end design and a soft touch, perfect for collections that demand excellence. Its technical construction makes it an excellent choice to add a high perceived value to your products, ensuring long-lasting beauty, impeccable fit and excellent elastic recovery, ideal for highlight pieces."
            },
            "es": {
                "categoria": "Alquileres",
                "material": "Elástico",
                "descricao": "El material clave para composiciones elegantes, sofisticadas y lujosas en el segmento de la ropa interior.",
                "details": "Luna es un encaje con un aspecto sofisticado, un diseño de alta gama y un toque suave, perfecto para colecciones que exigen excelencia. Su construcción técnica la convierte en una excelente opción para añadir un alto valor percibido a tus productos, asegurando belleza duradera, ajuste impecable y excelente recuperación elástica, ideal para prendas destacadas."
            },
            "fr": {
                "categoria": "Loyers",
                "material": "Élastique",
                "descricao": "Le matériau clé pour des compositions élégantes, sophistiquées et luxueuses dans le segment des sous-vêtements.",
                "details": "Luna est une dentelle à l’apparence sophistiquée, au design haut de gamme et au toucher doux, parfaite pour les collections qui exigent l’excellence. Sa construction technique en fait un excellent choix pour ajouter une grande valeur perçue à vos produits, garantissant une beauté durable, un ajustement impeccable et une excellente récupération élastique, idéale pour les pièces en relief."
            }
        },
        translationStatus: "published",
        translationUpdatedAt: "2026-09-10T18:33:57.605Z",
        translationSourceSignature: "14e01ek",
        translationLastError: ""
    },
    {
        id: 67,
        nome: "Mirra",
        categoria: "Rendas",
        imagem: "img - Copia/Rendas/mirra-stik.png",
        descricao: "Acabamento primoroso para peças finas e delicadas com durabilidade e resistência garantidas.",
        details: "Mirra é a renda ideal para detalhes delicados e bordas de peças íntimas, unindo leveza e firmeza na medida certa. A sua delicadeza visual é complementada pela resistência necessária para o uso contínuo e lavagens, tornando-a funcional, bela e uma escolha confiável para a produção industrial que busca excelência em acabamentos rendados.",
        material: "Elástico",
        i18n: {
            "en": {
                "categoria": "Rents",
                "material": "Elastic",
                "descricao": "Exquisite finish for fine and delicate pieces with guaranteed durability and resistance.",
                "details": "Mirra is the ideal lace for delicate details and edges of intimate pieces, combining lightness and firmness in the right measure. Its visual delicacy is complemented by the resistance necessary for continuous use and washing, making it functional, beautiful and a reliable choice for industrial production that seeks excellence in lacy finishes."
            },
            "es": {
                "categoria": "Alquileres",
                "material": "Elástico",
                "descricao": "Acabado exquisito para piezas finas y delicadas con durabilidad y resistencia garantizadas.",
                "details": "Mirra es el encaje ideal para detalles delicados y bordes de piezas íntimas, combinando ligereza y firmeza en la medida adecuada. Su delicadeza visual se complementa con la resistencia necesaria para un uso y lavado continuos, lo que la convierte en funcional, hermosa y una opción fiable para la producción industrial que busca la excelencia en acabados de encaje."
            },
            "fr": {
                "categoria": "Loyers",
                "material": "Élastique",
                "descricao": "Finition exquise pour des pièces fines et délicates, avec une durabilité et une résistance garanties.",
                "details": "Mirra est la dentelle idéale pour les détails délicats et les bords des pièces intimes, alliant légèreté et fermeté dans la bonne mesure. Sa délicatesse visuelle est complétée par la résistance nécessaire à une utilisation et un lavage continus, ce qui en fait un usage fonctionnel, beau et un choix fiable pour la production industrielle recherchant l’excellence dans les finitions dentelles."
            }
        },
        translationStatus: "published",
        translationUpdatedAt: "2026-09-10T18:33:57.605Z",
        translationSourceSignature: "1vyc15v",
        translationLastError: ""
    },
    {
        id: 68,
        nome: "Sofia",
        categoria: "Rendas",
        imagem: "img - Copia/Rendas/sofia-stik.png",
        descricao: "Estética e funcionalidade técnica em perfeita harmonia para um resultado superior e duradouro.",
        details: "Sofia é a renda que equilibra a beleza do design com o desempenho técnico. Oferece um excelente nível de elasticidade e estabilidade dimensional, sendo ideal para aplicações em que o conforto, a durabilidade do material e a manutenção da forma são essenciais para a qualidade final da peça, especialmente em sutiãs e modeladores leves, garantindo caimento e ajuste.",
        material: "Elástico",
        i18n: {
            "en": {
                "categoria": "Rents",
                "material": "Elastic",
                "descricao": "Aesthetics and technical functionality in perfect harmony for a superior and long-lasting result.",
                "details": "Sofia is the lace that balances the beauty of design with technical performance. It offers an excellent level of elasticity and dimensional stability, being ideal for applications where comfort, material durability and shape maintenance are essential for the final quality of the piece, especially in light bras and shapewear, ensuring fit and fit."
            },
            "es": {
                "categoria": "Alquileres",
                "material": "Elástico",
                "descricao": "Estética y funcionalidad técnica en perfecta armonía para un resultado superior y duradero.",
                "details": "Sofia es el encaje que equilibra la belleza del diseño con el rendimiento técnico. Ofrece un excelente nivel de elasticidad y estabilidad dimensional, siendo ideal para aplicaciones donde la comodidad, la durabilidad del material y el mantenimiento de la forma son esenciales para la calidad final de la pieza, especialmente en sujetadores ligeros y shapewears, asegurando el ajuste y el ajuste."
            },
            "fr": {
                "categoria": "Loyers",
                "material": "Élastique",
                "descricao": "Esthétique et fonctionnalité technique en parfaite harmonie pour un résultat supérieur et durable.",
                "details": "Sofia est la dentelle qui équilibre la beauté du design et la performance technique. Elle offre un excellent niveau d’élasticité et de stabilité dimensionnelle, idéale pour les applications où le confort, la durabilité du matériau et le maintien de la forme sont essentiels à la qualité finale de la pièce, notamment en soutiens-gorge légers et en shapewear, garantissant ainsi l’ajustement et l’ajustement."
            }
        },
        translationStatus: "published",
        translationUpdatedAt: "2026-09-10T18:33:57.605Z",
        translationSourceSignature: "1k0hjx5",
        translationLastError: ""
    },
    {
        id: 70,
        nome: "Atlas",
        categoria: "Viés",
        imagem: "img - Copia/Viés/atlas-stik (1).png",
        descricao: "Estrutura firme, estabilidade dimensional e bom caimento sem adicionar volume indesejado à peça.",
        details: "Atlas é o viés com estrutura sólida e bom caimento, ideal para o reforço de costuras e contornos em tecidos leves e médios. Proporciona estabilidade técnica ao acabamento, garantindo que seja robusto, elegante e não comprometa a leveza do tecido ou o caimento final do vestuário, sendo de fácil aplicação industrial em grandes volumes e mantendo a uniformidade.",
        material: "Elástico",
        i18n: {
            "en": {
                "categoria": "Bias",
                "material": "Elastic",
                "descricao": "Firm structure, dimensional stability and good fit without adding unwanted bulk to the piece.",
                "details": "Atlas is the bias with a solid structure and good fit, ideal for reinforcing seams and contours in light and medium fabrics. It provides technical stability to the finish, ensuring that it is robust, elegant and does not compromise the lightness of the fabric or the final fit of the garment, being easy to apply industrially in large volumes and maintaining uniformity."
            },
            "es": {
                "categoria": "Sesgo",
                "material": "Elástico",
                "descricao": "Estructura firme, estabilidad dimensional y buen ajuste sin añadir volumen innecesario a la pieza.",
                "details": "Atlas es el bies con estructura sólida y buen ajuste, ideal para reforzar costuras y contornos en tejidos ligeros y medios. Proporciona estabilidad técnica al acabado, asegurando que sea robusto, elegante y no comprometa la ligereza del tejido ni el ajuste final de la prenda, siendo fácil de aplicar industrialmente en grandes volúmenes y manteniendo la uniformidad."
            },
            "fr": {
                "categoria": "Biais",
                "material": "Élastique",
                "descricao": "Structure ferme, stabilité dimensionnelle et bon ajustement sans ajouter de volume indésirable à la pièce.",
                "details": "L’Atlas est un biais avec une structure solide et un bon ajustement, idéal pour renforcer les coutures et les contours dans des tissus légers et moyens. Il apporte une stabilité technique à la finition, garantissant une robustesse, une élégance et ne compromet pas la légèreté du tissu ni la coupe finale du vêtement, étant facile à appliquer industriellement en grand volume et maintenant l’uniformité."
            }
        },
        translationStatus: "published",
        translationUpdatedAt: "2026-09-10T18:33:57.605Z",
        translationSourceSignature: "y6ioav",
        translationLastError: ""
    },
    {
        id: 71,
        nome: "Eros",
        categoria: "Viés Com Arco",
        imagem: "img - Copia/Viés/eros-stik (1).png",
        descricao: "Refinamento estético e resistência invisível para um acabamento suave e superior nas peças.",
        details: "Eros é o viés de toque refinado, com acabamento discreto e notável resistência a atrito e desgaste. É excelente para aplicações que exigem durabilidade e uma transição suave, praticamente imperceptível, entre os tecidos, sendo ideal para peças íntimas e de alta-costura que valorizam o conforto e a estética discreta, com alta maleabilidade para encaixes.",
        material: "Elástico",
        i18n: {
            "en": {
                "categoria": "Bias with arch",
                "material": "Elastic",
                "descricao": "Aesthetic refinement and invisible resistance for a smooth and superior finish on the pieces.",
                "details": "Eros is the refined touch bias, with a discreet finish and remarkable resistance to friction and wear. It is excellent for applications that require durability and a smooth, practically imperceptible transition between fabrics, being ideal for underwear and haute couture pieces that value comfort and discreet aesthetics, with high malleability for fittings."
            },
            "es": {
                "categoria": "Sesgo con arco",
                "material": "Elástico",
                "descricao": "Refinamiento estético y resistencia invisible para un acabado liso y superior en las piezas.",
                "details": "Eros es el sesgo de tacto refinado, con un acabado discreto y una resistencia notable a la fricción y al desgaste. Es excelente para aplicaciones que requieren durabilidad y una transición suave y prácticamente imperceptible entre tejidos, siendo ideal para ropa interior y prendas de alta costura que valoran la comodidad y una estética discreta, con alta maleabilidad para las pruebas."
            },
            "fr": {
                "categoria": "Biais avec l’arche",
                "material": "Élastique",
                "descricao": "Raffinement esthétique et résistance invisible pour une finition lisse et supérieure sur les pièces.",
                "details": "L’Eros est le biais tactile raffiné, avec une finition discrète et une résistance remarquable à la friction et à l’usure. Il est excellent pour les applications nécessitant durabilité et une transition fluide et presque imperceptible entre les tissus, étant idéal pour les sous-vêtements et les pièces haute couture qui valorisent le confort et l’esthétique discrète, avec une grande malléabilité pour les essayages."
            }
        },
        translationStatus: "published",
        translationUpdatedAt: "2026-09-10T18:33:57.605Z",
        translationSourceSignature: "y97szq",
        translationLastError: ""
    },
    {
        id: 72,
        nome: "Nud",
        categoria: "Viés Com Arco",
        imagem: "img - Copia/Viés/nudvies-stik.png",
        descricao: "Conforto extremo e discrição visual para peças que exigem máximo bem-estar e leveza.",
        details: "Nud é o viés com toque suave e alta maleabilidade e adaptabilidade ao corpo em movimento. É ideal para ser usado em acabamentos de peças íntimas, moda praia e vestuário esportivo, onde o conforto na pele e a discrição visual no design são a prioridade absoluta da sua coleção e a resistência ao cloro e umidade é essencial, garantindo um resultado limpo.",
        material: "Elástico",
        i18n: {
            "en": {
                "categoria": "Bias with arch",
                "material": "Elastic",
                "descricao": "Extreme comfort and visual discretion for garments that require maximum well-being and lightness.",
                "details": "Nud is the bias with a soft touch and high malleability and adaptability to the body in motion. It is ideal to be used in finishes of underwear, beachwear and sportswear, where comfort on the skin and visual discretion in design are the absolute priority of your collection and resistance to chlorine and moisture is essential, ensuring a clean result."
            },
            "es": {
                "categoria": "Sesgo con arco",
                "material": "Elástico",
                "descricao": "Comodidad extrema y discreción visual para prendas que requieren el máximo bienestar y ligereza.",
                "details": "Nud es el sesgo con un tacto suave y alta maleabilidad y adaptabilidad al cuerpo en movimiento. Es ideal para usarse en acabados de ropa interior, ropa de playa y ropa deportiva, donde la comodidad en la piel y la discreción visual en el diseño son la prioridad absoluta de tu colección y la resistencia al cloro y la humedad es esencial, asegurando un resultado limpio."
            },
            "fr": {
                "categoria": "Biais avec l’arche",
                "material": "Élastique",
                "descricao": "Un confort extrême et une discrétion visuelle pour des vêtements nécessitant un bien-être et une légèreté maximales.",
                "details": "Le nud est le biais avec un toucher doux et une grande malléabilité et adaptabilité au corps en mouvement. Il est idéal pour être utilisé dans les finitions de sous-vêtements, vêtements de plage et sportswear, où le confort sur la peau et la discrétion visuelle dans le design sont la priorité absolue de votre collection, et où la résistance au chlore et à l’humidité est essentielle, garantissant un résultat propre."
            }
        },
        translationStatus: "published",
        translationUpdatedAt: "2026-09-10T18:33:57.605Z",
        translationSourceSignature: "abi7m0",
        translationLastError: ""
    },
    {
        id: 73,
        nome: "Senna",
        categoria: "Viés",
        imagem: "img - Copia/Viés/sennavies-stik.png",
        descricao: "A elegância de um reforço que dura, oferece segurança à costura e valoriza o acabamento.",
        details: "Senna é o viés especialmente indicado para o reforço de costuras e bordas, unindo um visual elegante com alta funcionalidade. Sua construção robusta garante que o acabamento resista ao uso contínuo, à tensão e à lavagem sem perder a forma ou a integridade, oferecendo um resultado duradouro e profissional para peças que demandam maior sustentação nas bordas.",
        material: "Elástico",
        i18n: {
            "en": {
                "categoria": "Bias",
                "material": "Elastic",
                "descricao": "The elegance of a reinforcement that lasts, offers security to the seam and enhances the finish.",
                "details": "Senna is the bias especially suitable for reinforcing seams and edges, combining an elegant look with high functionality. Its robust construction ensures that the finish withstands continuous use, tension and washing without losing shape or integrity, offering a long-lasting and professional result for pieces that require greater support at the edges."
            },
            "es": {
                "categoria": "Sesgo",
                "material": "Elástico",
                "descricao": "La elegancia de un refuerzo que perdura ofrece seguridad a la costura y realza el acabado.",
                "details": "El sesgo de Senna es especialmente adecuado para reforzar costuras y bordes, combinando un aspecto elegante con alta funcionalidad. Su construcción robusta garantiza que el acabado resista el uso, tensión y lavado continuos sin perder forma o integridad, ofreciendo un resultado duradero y profesional para piezas que requieren mayor soporte en los bordes."
            },
            "fr": {
                "categoria": "Biais",
                "material": "Élastique",
                "descricao": "L’élégance d’un renfort durable offre de la sécurité à la couture et met en valeur la finition.",
                "details": "Le Senna est le biais particulièrement adapté pour renforcer les coutures et les bords, alliant un look élégant à une grande fonctionnalité. Sa construction robuste garantit que la finition résiste à une utilisation, une tension et un lavage continus sans perdre forme ni intégrité, offrant un résultat durable et professionnel pour les pièces nécessitant un meilleur soutien sur les bords."
            }
        },
        translationStatus: "published",
        translationUpdatedAt: "2026-09-10T18:33:57.605Z",
        translationSourceSignature: "313pi",
        translationLastError: ""
    },
    {
        id: 74,
        nome: "Sud",
        categoria: "Viés Com Arco",
        imagem: "img - Copia/Viés/sud-stik.png",
        descricao: "Acabamento profissional impecável e adaptável em curvas e contornos complexos do design.",
        details: "Sud é o viés flexível e confiável, perfeito para ser aplicado em áreas com curvas, contornos e encaixes difíceis. Garante um acabamento limpo, profissional e se adapta perfeitamente ao formato da peça, mantendo a forma do design e oferecendo um excelente resultado estético e funcional em larga escala, otimizando o processo de confecção em detalhes arredondados.",
        material: "Elástico",
        i18n: {
            "en": {
                "categoria": "Bias with arch",
                "material": "Elastic",
                "descricao": "Impeccable professional finish that adapts to complex curves and contours of the design.",
                "details": "Sud is the flexible and reliable bias, perfect to be applied in areas with difficult curves, contours and fittings. It guarantees a clean, professional finish and adapts perfectly to the shape of the piece, maintaining the shape of the design and offering an excellent aesthetic and functional result on a large scale, optimizing the manufacturing process in rounded details."
            },
            "es": {
                "categoria": "Sesgo con arco",
                "material": "Elástico",
                "descricao": "Acabado profesional impecable que se adapta a curvas y contornos complejos del diseño.",
                "details": "El sesgo es flexible y fiable, perfecto para aplicarse en zonas con curvas, contornos y accesorios difíciles. Garantiza un acabado limpio y profesional y se adapta perfectamente a la forma de la pieza, manteniendo la forma del diseño y ofreciendo un excelente resultado estético y funcional a gran escala, optimizando el proceso de fabricación con detalles redondeados."
            },
            "fr": {
                "categoria": "Biais avec l’arche",
                "material": "Élastique",
                "descricao": "Finition professionnelle impeccable qui s’adapte aux courbes et contours complexes du design.",
                "details": "Le Sud est le biais flexible et fiable, parfait pour être appliqué dans les zones aux courbes, contours et ajustements difficiles. Il garantit une finition propre et professionnelle et s’adapte parfaitement à la forme de la pièce, conservant la forme du design et offrant un excellent résultat esthétique et fonctionnel à grande échelle, optimisant le processus de fabrication avec des détails arrondis."
            }
        },
        translationStatus: "published",
        translationUpdatedAt: "2026-09-10T18:33:57.605Z",
        translationSourceSignature: "6raya0",
        translationLastError: ""
    },
    {
        id: 75,
        nome: "X Nillo",
        categoria: "Viés",
        imagem: "img - Copia/Viés/xnillovies-stik.png",
        descricao: "Viés versátil com acabamento profissional e resistência para qualquer desafio de design e costura.",
        details: "X Nillo é um produto com alto nível de acabamento e grande versatilidade em sua aplicação em diversos tipos de vestuário. Adapta-se com excelência a diferentes tipos de peças e métodos de costura, assegurando um resultado de alta qualidade, resistência e durabilidade garantida, desde moda íntima a roupas esportivas e de base, sendo um material confiável para bordas e bainhas.",
        material: "Elástico",
        i18n: {
            "en": {
                "categoria": "Bias",
                "material": "Elastic",
                "descricao": "Versatile bias with professional finish and resistance for any design and sewing challenge.",
                "details": "X Nillo is a product with a high level of finish and great versatility in its application in different types of clothing. It adapts with excellence to different types of garments and sewing methods, ensuring a result of high quality, resistance and guaranteed durability, from underwear to sportswear and basewear, being a reliable material for borders and hems."
            },
            "es": {
                "categoria": "Sesgo",
                "material": "Elástico",
                "descricao": "Sesgo versátil con acabado profesional y resistencia para cualquier reto de diseño y costura.",
                "details": "X Nillo es un producto con un alto nivel de acabado y gran versatilidad en su aplicación en diferentes tipos de ropa. Se adapta con excelencia a distintos tipos de prendas y métodos de costura, asegurando un resultado de alta calidad, resistencia y durabilidad garantizada, desde ropa interior hasta ropa deportiva y base, siendo un material fiable para bordes y bajos."
            },
            "fr": {
                "categoria": "Biais",
                "material": "Élastique",
                "descricao": "Biais polyvalent avec finition professionnelle et résistance pour tout défi de design et de couture.",
                "details": "X Nillo est un produit à la finition élevée et à une grande polyvalence dans son application sur différents types de vêtements. Il s’adapte avec excellence à différents types de vêtements et de méthodes de couture, garantissant un résultat de haute qualité, résistance et durabilité garantie, des sous-vêtements aux vêtements de sport et basewears, étant un matériau fiable pour les bordures et les ourlets."
            }
        },
        translationStatus: "published",
        translationUpdatedAt: "2026-09-10T18:33:57.606Z",
        translationSourceSignature: "18aur1l",
        translationLastError: ""
    },
    {
        id: 76,
        nome: "Cleide",
        categoria: "Personalizados",
        imagem: "img - Copia/Personalizados/cleide-stik.png",
        descricao: "O equilíbrio perfeito entre suporte estrutural e conforto em uma peça totalmente personalizada para sua marca.",
        details: "Cleide é um elástico customizado com elasticidade cuidadosamente balanceada e uniforme, projetada para oferecer segurança inabalável e bem-estar durante o uso prolongado. É ideal para uso em sutiãs e vestuário que exigem um suporte confiável e um ajuste que se mantenha estável, com a forte e marcante identidade visual da sua marca em evidência no acabamento, garantindo qualidade técnica, estilo e longevidade do design.",
        material: "Elástico",
        i18n: {
            "en": {
                "categoria": "Personalized",
                "material": "Elastic",
                "descricao": "The perfect balance of structural support and comfort in a piece that's fully customized for your brand.",
                "details": "Cleide is a custom elastic band with carefully balanced and uniform elasticity, designed to offer unwavering safety and well-being during prolonged use. It is ideal for use in bras and apparel that require reliable support and a fit that remains stable, with the strong and striking visual identity of your brand in evidence in the finish, ensuring technical quality, style and longevity of the design."
            },
            "es": {
                "categoria": "Personalizado",
                "material": "Elástico",
                "descricao": "El equilibrio perfecto entre soporte estructural y comodidad en una pieza totalmente personalizada para tu marca.",
                "details": "Cleide es una goma elástica personalizada con una elasticidad cuidadosamente equilibrada y uniforme, diseñada para ofrecer seguridad y bienestar inquebrantables durante un uso prolongado. Es ideal para su uso en sujetadores y prendas que requieren un soporte fiable y un ajuste estable, con la identidad visual fuerte y llamativa de tu marca reflejada en el acabado, garantizando la calidad técnica, el estilo y la longevidad del diseño."
            },
            "fr": {
                "categoria": "Personnalisé",
                "material": "Élastique",
                "descricao": "Le parfait équilibre entre soutien structurel et confort dans une pièce entièrement personnalisée pour votre marque.",
                "details": "Cleide est un élastique sur mesure avec une élasticité soigneusement équilibrée et uniforme, conçu pour offrir une sécurité et un bien-être inébranlables lors d’un usage prolongé. Il est idéal pour les soutiens-gorge et vêtements nécessitant un soutien fiable et un ajustement stable, avec l’identité visuelle forte et frappante de votre marque visible dans la finition, garantissant la qualité technique, le style et la longévité du design."
            }
        },
        translationStatus: "published",
        translationUpdatedAt: "2026-09-10T18:33:57.606Z",
        translationSourceSignature: "ddz5v1",
        translationLastError: ""
    },
    {
        id: 77,
        nome: "Dila",
        categoria: "Personalizados",
        imagem: "img - Copia/Personalizados/dila-stik.png",
        descricao: "Personalização macia, toque suave e alta resistência para o desgaste do dia a dia.",
        details: "Dila é o elástico personalizado, macio e extremamente resistente ao desgaste, ao atrito e à fadiga do material, perfeito para peças íntimas de uso contínuo. Apresenta excelente fixação em reguladores, o que garante um ajuste preciso, duradouro e confortável, acompanhando o movimento do corpo sem ceder. É a escolha técnica para quem busca unir conforto suave, alta performance e a exclusividade da sua marca na alça de sustentação.",
        material: "Elástico",
        i18n: {
            "en": {
                "categoria": "Personalized",
                "material": "Elastic",
                "descricao": "Soft customization, soft touch and high resistance for daily wear.",
                "details": "Dila is the custom elastic, soft and extremely resistant to wear, friction and fatigue of the material, perfect for underwear of continuous use. It has excellent fixation in regulators, which guarantees a precise, long-lasting and comfortable fit, following the movement of the body without giving in. It is the technical choice for those looking to combine soft comfort, high performance and the exclusivity of their brand in the support strap."
            },
            "es": {
                "categoria": "Personalizado",
                "material": "Elástico",
                "descricao": "Personalización suave, tacto suave y alta resistencia para el uso diario.",
                "details": "Dila es el elástico personalizado, suave y extremadamente resistente al desgaste, la fricción y la fatiga del material, perfecto para ropa interior de uso continuo. Tiene una excelente fijación en reguladores, lo que garantiza un ajuste preciso, duradero y cómodo, siguiendo el movimiento del cuerpo sin ceder. Es la opción técnica para quienes buscan combinar confort suave, alto rendimiento y la exclusividad de su marca en la correa de soporte."
            },
            "fr": {
                "categoria": "Personnalisé",
                "material": "Élastique",
                "descricao": "Personnalisation douce, toucher doux et haute résistance au quotidien.",
                "details": "Dila est un élastique sur mesure, doux et extrêmement résistant à l’usure, à la friction et à la fatigue du matériau, parfait pour des sous-vêtements à usage continu. Il possède une excellente fixation dans les régulateurs, garantissant un ajustement précis, durable et confortable, suivant le mouvement du corps sans céder. C’est le choix technique pour ceux qui souhaitent combiner confort doux, haute performance et exclusivité de leur marque dans la sangle de soutien."
            }
        },
        translationStatus: "published",
        translationUpdatedAt: "2026-09-10T18:33:57.606Z",
        translationSourceSignature: "1g875i0",
        translationLastError: ""
    },
    {
        id: 78,
        nome: "Listras",
        categoria: "Personalizados",
        imagem: "img - Copia/Personalizados/listraspersoanlisada-stik.png",
        descricao: "Seu design listrado exclusivo com a nossa inquestionável qualidade técnica, durabilidade e sofisticação.",
        details: "Este é o elástico totalmente personalizado com um visual listrado diferenciado, moderno e com alta durabilidade de padrão e cor. Ele adiciona um toque de design sofisticado e único aos cós e acabamentos, mantendo o desempenho elástico superior, a resistência e a qualidade esperada da linha premium, garantindo que a peça se destaque pela estética, longevidade do material e excelente retorno elástico.",
        material: "Elástico",
        i18n: {
            "en": {
                "categoria": "Personalized",
                "material": "Elastic",
                "descricao": "Its exclusive striped design with our unquestionable technical quality, durability and sophistication.",
                "details": "This is the fully customized elastic band with a differentiated, modern striped look and with high pattern and color durability. It adds a touch of sophisticated and unique design to the waistbands and finishes, maintaining the superior elastic performance, resistance and quality expected from the premium line, ensuring that the piece stands out for its aesthetics, longevity of the material and excellent elastic return."
            },
            "es": {
                "categoria": "Personalizado",
                "material": "Elástico",
                "descricao": "Su diseño exclusivo a rayas con nuestra indiscutible calidad técnica, durabilidad y sofisticación.",
                "details": "Esta es la banda elástica totalmente personalizada con un aspecto diferenciado y moderno a rayas y alta durabilidad en patrones y colores. Añade un toque de diseño sofisticado y único a las cinturas y acabados, manteniendo el rendimiento elástico superior, la resistencia y la calidad esperados de la línea premium, asegurando que la pieza destaque por su estética, longevidad del material y excelente retorno elástico."
            },
            "fr": {
                "categoria": "Personnalisé",
                "material": "Élastique",
                "descricao": "Son design rayé exclusif avec notre qualité technique, durabilité et sophistication incontestables.",
                "details": "Il s’agit d’un élastique entièrement personnalisé, avec un look rayé moderne et différencié, et une grande durabilité en motifs et couleurs. Il ajoute une touche de design sophistiqué et unique aux ceintures et finitions, conservant la performance élastique supérieure, la résistance et la qualité attendues de la gamme premium, garantissant que la pièce se démarque par son esthétique, sa longévité du matériau et son excellent retour élastique."
            }
        },
        translationStatus: "published",
        translationUpdatedAt: "2026-09-10T18:33:57.606Z",
        translationSourceSignature: "1jovq9q",
        translationLastError: ""
    },
    {
        id: 79,
        nome: "Cintarela",
        categoria: "Personalizados",
        imagem: "img - Copia/Personalizados/cintarelapremium-stik.png",
        descricao: "Modelagem precisa, alta compressão e a identidade da sua marca em destaque e total exclusividade.",
        details: "A versão personalizada do Cintarela garante suporte firme, conforto e um ajuste preciso em modeladores e vestuário de compressão. Sua construção robusta e de alta tecnologia mantém a compressão necessária e a forma da peça por um longo período de tempo, com um toque exclusivo da sua personalização, valorizando a silhueta, o design com excelência e a durabilidade estrutural da roupa.",
        material: "Elástico",
        i18n: {
            "en": {
                "categoria": "Personalized",
                "material": "Elastic",
                "descricao": "Precise modeling, high compression and your brand identity in the spotlight and total exclusivity.",
                "details": "The customized version of the Cintarela guarantees firm support, comfort and a precise fit in shapewear and compression garments. Its robust and high-tech construction maintains the necessary compression and the shape of the garment for a long period of time, with an exclusive touch of its customization, enhancing the silhouette, the design with excellence and the structural durability of the garment."
            },
            "es": {
                "categoria": "Personalizado",
                "material": "Elástico",
                "descricao": "Modelado preciso, alta compresión y tu identidad de marca en el centro de atención y total exclusividad.",
                "details": "La versión personalizada de la Cintarela garantiza un soporte firme, comodidad y un ajuste preciso en prendas modeladas y de compresión. Su construcción robusta y de alta tecnología mantiene la compresión y la forma necesarias durante mucho tiempo, con un toque exclusivo de personalización, realzando la silueta, el diseño con excelencia y la durabilidad estructural de la prenda."
            },
            "fr": {
                "categoria": "Personnalisé",
                "material": "Élastique",
                "descricao": "Mannequinat précis, forte compression, votre identité de marque sous les projecteurs et exclusivité totale.",
                "details": "La version personnalisée de la Cintarela garantit un soutien ferme, du confort et un ajustement précis dans les vêtements shapewear et compression. Sa construction robuste et high-tech maintient la compression nécessaire et la forme du vêtement sur une longue période, avec une touche exclusive de personnalisation, mettant en valeur la silhouette, le design avec excellence et la durabilité structurelle du vêtement."
            }
        },
        translationStatus: "published",
        translationUpdatedAt: "2026-09-10T18:33:57.606Z",
        translationSourceSignature: "124gkbv",
        translationLastError: ""
    }
];
const produtosPadrao = produtos.map(produto => ({ ...produto }));

const productStore = (() => {
    const STORAGE_KEYS = {
        products: 'stik.catalog.products',
        categories: 'stik.catalog.categories'
    };

    const readStorage = (key, fallback) => {
        try {
            const value = localStorage.getItem(key);
            return value ? JSON.parse(value) : fallback;
        } catch (error) {
            return fallback;
        }
    };

    const writeStorage = (key, value) => {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.warn('Nao foi possivel salvar produtos/categorias no localStorage:', error);
            return false;
        }
    };

    const normalizeKey = (value) => String(value || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim();

    const limitText = (value, maxLength) => String(value || '').trim().slice(0, maxLength);
    const cleanCategory = (value) => normalizeCategoria(String(value || '').trim());

    const normalizeProductI18n = (i18n) => {
        const source = i18n && typeof i18n === 'object' ? i18n : {};
        return Object.fromEntries(STIK_SUPPORTED_LANGUAGES
            .filter(language => language !== STIK_DEFAULT_LANGUAGE)
            .map(language => {
                const values = source[language] && typeof source[language] === 'object' ? source[language] : {};
                return [language, {
                    categoria: limitText(values.categoria, 120),
                    material: limitText(values.material, 120),
                    descricao: limitText(values.descricao, 5000),
                    details: limitText(values.details || values.detalhes, 2000)
                }];
            })
            .filter(([, values]) => Object.values(values).some(Boolean)));
    };

    const normalizeProductImageItem = (item) => {
        const source = typeof item === 'string' ? { url: item } : (item || {});
        const url = normalizeStikAssetUrl(source.url || source.src || source.imagem || source.image || '');
        const titulo = String(source.titulo || source.title || source.label || '').trim();
        const alt = String(source.alt || source.filename || source.name || titulo || '').trim();

        return { url, titulo, alt };
    };

    const normalizeProductImages = (items) => {
        const source = Array.isArray(items) ? items : [items];
        const map = new Map();

        source
            .map(normalizeProductImageItem)
            .filter(item => item.url)
            .forEach(item => {
                const current = map.get(item.url);
                map.set(item.url, {
                    url: item.url,
                    titulo: item.titulo || current?.titulo || '',
                    alt: item.alt || current?.alt || item.titulo || ''
                });
            });

        return Array.from(map.values());
    };

    const normalizeProduct = (payload) => {
        const imagens = normalizeProductImages([
            payload.imagem || payload.image || '',
            ...(Array.isArray(payload.imagens || payload.images) ? (payload.imagens || payload.images) : [])
        ]);

        return {
        id: Number(payload.id) || Date.now(),
        nome: limitText(payload.nome || payload.name || '', 120),
        categoria: limitText(cleanCategory(payload.categoria || payload.category || ''), 120),
        imagem: imagens[0]?.url || '',
        imagens,
        descricao: limitText(payload.descricao || payload.description || '', 5000),
        details: limitText(payload.details || payload.detalhes || payload.productDetails || payload.product_details || '', 2000),
        material: limitText(payload.material || '', 120) || 'Elástico',
        publicationStatus: limitText(payload.publicationStatus || payload.publication_status || '', 40),
        translationStatus: limitText(payload.translationStatus || payload.translation_status || '', 40),
        translationUpdatedAt: payload.translationUpdatedAt || payload.translation_updated_at || null,
        translationAttemptedAt: payload.translationAttemptedAt || payload.translation_attempted_at || null,
        translationFailedAt: payload.translationFailedAt || payload.translation_failed_at || null,
        translationSourceSignature: limitText(payload.translationSourceSignature || payload.translation_source_signature || '', 80),
        translationLastError: limitText(payload.translationLastError || payload.translation_last_error || '', 500),
        i18n: normalizeProductI18n(payload.i18n)
        };
    };

    const uniqueCategories = (categories) => {
        const map = new Map();
        categories
            .map(cleanCategory)
            .filter(Boolean)
            .forEach(category => {
                const key = normalizeKey(category);
                if (!map.has(key)) map.set(key, category);
            });
        return Array.from(map.values()).sort((a, b) => a.localeCompare(b, 'pt-BR'));
    };

    const getStoredProducts = () => {
        const stored = readStorage(STORAGE_KEYS.products, null);
        return Array.isArray(stored)
            ? stored.map(normalizeProduct).filter(product => product.nome && product.categoria)
            : produtosPadrao.map(normalizeProduct);
    };

    const getStoredCategories = () => {
        const stored = readStorage(STORAGE_KEYS.categories, null);
        const source = Array.isArray(stored) ? stored : [];
        return uniqueCategories([
            ...source,
            ...getStoredProducts().map(product => product.categoria)
        ]);
    };

    const saveProducts = (items) => {
        const normalized = items.map(normalizeProduct).filter(product => product.nome && product.categoria);
        writeStorage(STORAGE_KEYS.products, normalized);
        hydrate();
        window.dispatchEvent(new CustomEvent('stik:products-updated', { detail: normalized }));
        return normalized;
    };

    const saveCategories = (items) => {
        const categories = uniqueCategories(items);
        writeStorage(STORAGE_KEYS.categories, categories);
        window.dispatchEvent(new CustomEvent('stik:categories-updated', { detail: categories }));
        return categories;
    };

    function hydrate() {
        const activeProducts = getStoredProducts();
        produtos.splice(0, produtos.length, ...activeProducts);
        return activeProducts;
    }

    const listProducts = () => getStoredProducts();
    const listCategories = () => getStoredCategories();
    const getProduct = (id) => listProducts().find(product => String(product.id) === String(id)) || null;
    const countProductsByCategory = (category) => {
        const target = normalizeKey(cleanCategory(category));
        return listProducts().filter(product => normalizeKey(cleanCategory(product.categoria)) === target).length;
    };

    const createProduct = (payload) => {
        const items = listProducts();
        const product = normalizeProduct({ ...payload, id: Date.now() });
        saveCategories([...listCategories(), product.categoria]);
        saveProducts([product, ...items]);
        return product;
    };

    const updateProduct = (id, payload) => {
        const items = listProducts();
        const index = items.findIndex(product => String(product.id) === String(id));
        if (index < 0) return null;
        const updated = normalizeProduct({ ...items[index], ...payload, id: items[index].id });
        items[index] = updated;
        saveCategories([...listCategories(), updated.categoria]);
        saveProducts(items);
        return updated;
    };

    const deleteProduct = (id) => {
        const items = listProducts().filter(product => String(product.id) !== String(id));
        saveProducts(items);
        return { ok: true };
    };

    const createCategory = (name) => {
        const category = cleanCategory(name);
        if (!category) return null;
        saveCategories([...listCategories(), category]);
        return category;
    };

    const renameCategory = (oldName, nextName) => {
        const oldCategory = cleanCategory(oldName);
        const nextCategory = cleanCategory(nextName);
        if (!oldCategory || !nextCategory) return null;
        const oldKey = normalizeKey(oldCategory);
        const products = listProducts().map(product => (
            normalizeKey(cleanCategory(product.categoria)) === oldKey
                ? { ...product, categoria: nextCategory }
                : product
        ));
        const categories = listCategories().map(category => (
            normalizeKey(category) === oldKey ? nextCategory : category
        ));
        saveCategories(categories);
        saveProducts(products);
        return nextCategory;
    };

    const deleteCategory = (name) => {
        const category = cleanCategory(name);
        const target = normalizeKey(category);
        if (countProductsByCategory(category) > 0) {
            return { ok: false, reason: 'category-in-use' };
        }
        saveCategories(listCategories().filter(item => normalizeKey(item) !== target));
        return { ok: true };
    };

    return {
        hydrate,
        listProducts,
        listCategories,
        getProduct,
        createProduct,
        updateProduct,
        deleteProduct,
        createCategory,
        renameCategory,
        deleteCategory,
        countProductsByCategory,
        normalizeProduct
    };
})();

const siteContentStore = (() => {
    const STORAGE_KEY = 'stik.site.content';
    const HERO_SLIDESHOW_DURATION = 10000;
    const HERO_BANNER_IMAGES = [
        { image: 'img/optimized/imagens-novas/banners-01.jpg', mobileImage: 'img/optimized/imagens-novas/banners-01-mobile.jpg', alt: 'Banner institucional STIK 01' },
        { image: 'img/optimized/imagens-novas/banners-02.jpg', mobileImage: 'img/optimized/imagens-novas/banners-02-mobile.jpg', alt: 'Banner institucional STIK 02' },
        { image: 'img/optimized/imagens-novas/banners-03.jpg', mobileImage: 'img/optimized/imagens-novas/banners-03-mobile.jpg', alt: 'Banner institucional STIK 03' }
    ];
    const localizedHeroBannerImageGroups = HERO_BANNER_IMAGES.map((item, index) => {
        const bannerNumber = String(index + 1).padStart(2, '0');
        return {
            pt: { ...item },
            en: { image: `img/optimized/imagens-novas/banners-${bannerNumber}-en.jpg`, mobileImage: `img/optimized/imagens-novas/banners-${bannerNumber}-en-mobile.jpg`, alt: `STIK institutional banner ${bannerNumber}` },
            es: { image: `img/optimized/imagens-novas/banners-${bannerNumber}-es.jpg`, mobileImage: `img/optimized/imagens-novas/banners-${bannerNumber}-es-mobile.jpg`, alt: `Banner institucional STIK ${bannerNumber}` },
            fr: { image: `img/optimized/imagens-novas/banners-${bannerNumber}-fr.jpg`, mobileImage: `img/optimized/imagens-novas/banners-${bannerNumber}-fr-mobile.jpg`, alt: `Banniere institutionnelle STIK ${bannerNumber}` }
        };
    });
    const localizedHeroBannerImagesByPath = localizedHeroBannerImageGroups.reduce((map, group) => {
        Object.values(group).forEach(item => {
            if (item.image) map[item.image] = group;
            if (item.mobileImage) map[item.mobileImage] = group;
        });
        return map;
    }, {});
    const HERO_BANNER_IMAGE_ALIASES = {
        'img/Imagens novas/banners-01.jpg': 'img/optimized/imagens-novas/banners-01.jpg',
        'img/Imagens novas/banners-01-ingles.jpg': 'img/optimized/imagens-novas/banners-01-en.jpg',
        'img/Imagens novas/banners-01-espanhol.jpg': 'img/optimized/imagens-novas/banners-01-es.jpg',
        'img/Imagens novas/banners-01-frances.jpg': 'img/optimized/imagens-novas/banners-01-fr.jpg',
        'img/Imagens novas/banners-01-mobile.png': 'img/optimized/imagens-novas/banners-01-mobile.jpg',
        'img/Imagens novas/banners-01-mobile-ingles.png': 'img/optimized/imagens-novas/banners-01-en-mobile.jpg',
        'img/Imagens novas/banners-01-mobile-espanhol.png': 'img/optimized/imagens-novas/banners-01-es-mobile.jpg',
        'img/Imagens novas/banners-01-mobile-frances.png': 'img/optimized/imagens-novas/banners-01-fr-mobile.jpg',
        'img/Imagens novas/banners-02.jpg': 'img/optimized/imagens-novas/banners-02.jpg',
        'img/Imagens novas/banners-02-ingles.png': 'img/optimized/imagens-novas/banners-02-en.jpg',
        'img/Imagens novas/banners-02-espanhol.png': 'img/optimized/imagens-novas/banners-02-es.jpg',
        'img/Imagens novas/banners-02-frances.png': 'img/optimized/imagens-novas/banners-02-fr.jpg',
        'img/Imagens novas/banners-02-mobile.png': 'img/optimized/imagens-novas/banners-02-mobile.jpg',
        'img/Imagens novas/banners-02-mobile-ingles.png': 'img/optimized/imagens-novas/banners-02-en-mobile.jpg',
        'img/Imagens novas/banners-02-mobile-espanhol.png': 'img/optimized/imagens-novas/banners-02-es-mobile.jpg',
        'img/Imagens novas/banners-02-mobile-frances.png': 'img/optimized/imagens-novas/banners-02-fr-mobile.jpg',
        'img/Imagens novas/banners-03.jpg': 'img/optimized/imagens-novas/banners-03.jpg',
        'img/Imagens novas/banners-03-ingles.png': 'img/optimized/imagens-novas/banners-03-en.jpg',
        'img/Imagens novas/banners-03-espanhol.png': 'img/optimized/imagens-novas/banners-03-es.jpg',
        'img/Imagens novas/banners-03-frances.png': 'img/optimized/imagens-novas/banners-03-fr.jpg',
        'img/Imagens novas/banners-03-mobile.png': 'img/optimized/imagens-novas/banners-03-mobile.jpg',
        'img/Imagens novas/banners-03-mobile-ingles.png': 'img/optimized/imagens-novas/banners-03-en-mobile.jpg',
        'img/Imagens novas/banners-03-mobile-espanhol.png': 'img/optimized/imagens-novas/banners-03-es-mobile.jpg',
        'img/Imagens novas/banners-03-mobile-frances.png': 'img/optimized/imagens-novas/banners-03-fr-mobile.jpg',
        'img/optimized/hero-banner-01.jpg': 'img/optimized/imagens-novas/banners-01.jpg',
        'img/optimized/hero-banner-02.jpg': 'img/optimized/imagens-novas/banners-02.jpg',
        'img/optimized/hero-banner-03.jpg': 'img/optimized/imagens-novas/banners-03.jpg'
    };
    const LEGACY_HERO_VIDEO = {
        poster: 'img/optimized/hero-poster.jpg',
        desktopVideo: 'img/optimized/hero-desktop.mp4',
        mobileVideo: 'img/optimized/hero-mobile.mp4'
    };
    const gridSlots = ['small-top-left', 'large-center', 'small-top-right', 'small-bottom-left', 'small-bottom-right'];
    const HOME_GRID_IMAGES = [
        { image: 'img/optimized/imagens-novas/moda-intima.jpg', mobileImage: 'img/optimized/imagens-novas/moda-intima-mobile.jpg', alt: 'MODA INTIMA' },
        { image: 'img/optimized/imagens-novas/universo-masculino.jpg', mobileImage: 'img/optimized/imagens-novas/universo-masculino-mobile.jpg', alt: 'UNIVERSO MASCULINO' },
        { image: 'img/optimized/imagens-novas/moda-esportiva.jpg', mobileImage: 'img/optimized/imagens-novas/moda-esportiva-mobile.jpg', alt: 'MODA ESPORTIVA' },
        { image: 'img/optimized/imagens-novas/moda-praia.jpg', mobileImage: 'img/optimized/imagens-novas/moda-praia-mobile.jpg', alt: 'MODA PRAIA' },
        { image: 'img/optimized/imagens-novas/moda-infantil.jpg', mobileImage: 'img/optimized/imagens-novas/moda-infantil-mobile.jpg', alt: 'MODA INFANTIL' }
    ];
    const legacyHighlightImages = new Set([
        'img/optimized/home-grid-geral.jpg',
        'img/optimized/home-grid-rendas.jpg',
        'img/optimized/home-grid-elasticos.jpg',
        'img/optimized/home-grid-alcas.jpg',
        'img/optimized/home-grid-premium.jpg',
        'img/Imagens novas/fotos site/MODA ESPORTIVA.png',
        'img/Imagens novas/MODA INTIMA.png',
        'img/Imagens novas/UNIVERSO MASCULINO.png',
        'img/Imagens novas/MODA ESPORTIVA.png',
        'img/Imagens novas/MODA PRAIA.png',
        'img/Imagens novas/MODA INFANTIL.png'
    ]);
    const highlightImagesByText = {
        'moda intima': HOME_GRID_IMAGES[0].image,
        'universo masculino': HOME_GRID_IMAGES[1].image,
        'moda esportiva': HOME_GRID_IMAGES[2].image,
        'moda praia': HOME_GRID_IMAGES[3].image,
        'moda infantil': HOME_GRID_IMAGES[4].image
    };
    const optimizedMobileImagesByDesktop = {
        'img/optimized/imagens-novas/banners-01.jpg': 'img/optimized/imagens-novas/banners-01-mobile.jpg',
        'img/optimized/imagens-novas/banners-01-en.jpg': 'img/optimized/imagens-novas/banners-01-en-mobile.jpg',
        'img/optimized/imagens-novas/banners-01-es.jpg': 'img/optimized/imagens-novas/banners-01-es-mobile.jpg',
        'img/optimized/imagens-novas/banners-01-fr.jpg': 'img/optimized/imagens-novas/banners-01-fr-mobile.jpg',
        'img/optimized/imagens-novas/banners-02.jpg': 'img/optimized/imagens-novas/banners-02-mobile.jpg',
        'img/optimized/imagens-novas/banners-02-en.jpg': 'img/optimized/imagens-novas/banners-02-en-mobile.jpg',
        'img/optimized/imagens-novas/banners-02-es.jpg': 'img/optimized/imagens-novas/banners-02-es-mobile.jpg',
        'img/optimized/imagens-novas/banners-02-fr.jpg': 'img/optimized/imagens-novas/banners-02-fr-mobile.jpg',
        'img/optimized/imagens-novas/banners-03.jpg': 'img/optimized/imagens-novas/banners-03-mobile.jpg',
        'img/optimized/imagens-novas/banners-03-en.jpg': 'img/optimized/imagens-novas/banners-03-en-mobile.jpg',
        'img/optimized/imagens-novas/banners-03-es.jpg': 'img/optimized/imagens-novas/banners-03-es-mobile.jpg',
        'img/optimized/imagens-novas/banners-03-fr.jpg': 'img/optimized/imagens-novas/banners-03-fr-mobile.jpg',
        'img/optimized/imagens-novas/moda-intima.jpg': 'img/optimized/imagens-novas/moda-intima-mobile.jpg',
        'img/optimized/imagens-novas/universo-masculino.jpg': 'img/optimized/imagens-novas/universo-masculino-mobile.jpg',
        'img/optimized/imagens-novas/moda-esportiva.jpg': 'img/optimized/imagens-novas/moda-esportiva-mobile.jpg',
        'img/optimized/imagens-novas/moda-praia.jpg': 'img/optimized/imagens-novas/moda-praia-mobile.jpg',
        'img/optimized/imagens-novas/moda-infantil.jpg': 'img/optimized/imagens-novas/moda-infantil-mobile.jpg',
        'img/optimized/imagens-novas/fotos-site-03.jpg': 'img/optimized/imagens-novas/fotos-site-03-mobile.jpg',
        'img/optimized/imagens-novas/fotos-site-05.jpg': 'img/optimized/imagens-novas/fotos-site-05-mobile.jpg',
        'img/optimized/imagens-novas/fotos-site-06.jpg': 'img/optimized/imagens-novas/fotos-site-06-mobile.jpg'
    };
    const optimizedImageAliases = {
        'img/Imagens novas/MODA INTIMA.png': HOME_GRID_IMAGES[0].image,
        'img/Imagens novas/UNIVERSO MASCULINO.png': HOME_GRID_IMAGES[1].image,
        'img/Imagens novas/MODA ESPORTIVA.png': HOME_GRID_IMAGES[2].image,
        'img/Imagens novas/MODA PRAIA.png': HOME_GRID_IMAGES[3].image,
        'img/Imagens novas/MODA INFANTIL.png': HOME_GRID_IMAGES[4].image,
        'img/Imagens novas/fotos site-03.jpg': 'img/optimized/imagens-novas/fotos-site-03.jpg',
        'img/Imagens novas/fotos site-05.jpg': 'img/optimized/imagens-novas/fotos-site-05.jpg',
        'img/Imagens novas/fotos site-06.jpg': 'img/optimized/imagens-novas/fotos-site-06.jpg'
    };
    const legacyCatalogCarouselImages = [
        'img/optimized/catalog-carousel-01.jpg',
        'img/optimized/catalog-carousel-02.jpg',
        'img/optimized/catalog-carousel-03.jpg',
        'img/optimized/catalog-carousel-04.jpg',
        'img/optimized/catalog-carousel-05.jpg'
    ];

    function defaults() {
        return {
            home: {
                hero: {
                    mode: 'slideshow',
                    poster: HERO_BANNER_IMAGES[0].image,
                    desktopVideo: LEGACY_HERO_VIDEO.desktopVideo,
                    mobileVideo: LEGACY_HERO_VIDEO.mobileVideo,
                    desktopKind: 'image',
                    mobileKind: 'image',
                    slideshow: {
                        duration: HERO_SLIDESHOW_DURATION,
                        transition: 'fade',
                        images: HERO_BANNER_IMAGES
                    }
                },
                highlights: {
                    title: 'SEGMENTOS',
                    items: [
                        { slot: 'small-top-left', ...HOME_GRID_IMAGES[0], text: 'MODA INTIMA' },
                        { slot: 'large-center', ...HOME_GRID_IMAGES[1], text: 'UNIVERSO MASCULINO' },
                        { slot: 'small-top-right', ...HOME_GRID_IMAGES[2], text: 'MODA ESPORTIVA' },
                        { slot: 'small-bottom-left', ...HOME_GRID_IMAGES[3], text: 'MODA PRAIA' },
                        { slot: 'small-bottom-right', ...HOME_GRID_IMAGES[4], text: 'MODA INFANTIL' }
                    ]
                },
                catalog: {
                    title: 'BAIXE NOSSO CATÁLOGO',
                    carouselImages: HOME_GRID_IMAGES
                }
            },
            about: {
                title: 'Stik Elásticos',
                paragraphs: [
                    'Na década de 1960 o empresário Francisco Aragão Fontenelle visualizou a oportunidade de investir no setor de confecções e criou a Confecções Royale S/A. A linha produtiva da nova empresa se voltava à produção de peças íntimas, direcionadas ao mercado nacional, setor no qual o Ceará começava a se destacar e a experiência da empresa tomou evidente a necessidade de fornecedores qualificados a oferecer tecidos e elásticos especiais.',
                    'A STIK inicia suas atividades em 1968 na cidade de Fortaleza, no estado do Ceará. A Passamanaria do Nordeste S/A através da família Fontenele, é uma empresa cearense, que surgiu do desejo de solucionar uma deficiência no seguimento de moda íntima, com o objetivo de crescer o mercado local com uma matéria-prima de qualidade, preços justos e atendimento diferenciado.'
                ],
                mainImage: 'img/optimized/home-grid-elasticos-removebg-preview.png',
                mainImageAlt: 'Onda de inovação',
                statement: 'Com espírito empreendedor, a STIK nasce da vontade de promover soluções ágeis em sintonia, com um atendimento customizado, acreditando no potencial criativo, e sobretudo, assegurando qualidade em tudo que faz.',
                galleryImages: [
                    { image: 'img/optimized/imagens-novas/fotos-site-03.jpg', mobileImage: 'img/optimized/imagens-novas/fotos-site-03-mobile.jpg', alt: 'Máquina 1' },
                    { image: 'img/optimized/imagens-novas/fotos-site-05.jpg', mobileImage: 'img/optimized/imagens-novas/fotos-site-05-mobile.jpg', alt: 'Máquina 2' },
                    { image: 'img/optimized/imagens-novas/fotos-site-06.jpg', mobileImage: 'img/optimized/imagens-novas/fotos-site-06-mobile.jpg', alt: 'Máquina 3' },
                    { image: 'img - Copia/stik-inst1.png', alt: 'Máquina 4' }
                ],
                evolutionImages: [
                    { image: 'img/optimized/institutional-evolution-01.jpg', alt: 'Bobinas coloridas no parque fabril da STIK' },
                    { image: 'img/optimized/institutional-evolution-02.jpg', alt: 'Operador acompanhando equipamento industrial da STIK' },
                    { image: 'img/optimized/institutional-evolution-03.jpg', alt: 'Cartela de cores e amostras de elásticos STIK' }
                ],
                bottomText: 'A Passamanaria do Nordeste S.A continua escrevendo sua história em colaboração com todos os nossos clientes internos e externos, acreditando sempre na parceria contínua e entendendo que é preciso INOVAR para AVANÇAR.',
                bottomImage: '',
                bottomImageAlt: 'Visão e inovação'
            }
        };
    }

    const cleanText = (value, maxLength = 500) => String(value || '').trim().slice(0, maxLength);
    const cleanAsset = (value, fallback = '') => normalizeStikAssetUrl(value, fallback);
    const normalizeSiteContentI18n = (i18n) => {
        const source = i18n && typeof i18n === 'object' ? i18n : {};
        return Object.fromEntries(STIK_SUPPORTED_LANGUAGES
            .filter(language => language !== STIK_DEFAULT_LANGUAGE)
            .map(language => {
                const values = source[language] && typeof source[language] === 'object' ? source[language] : {};
                const cleaned = Object.fromEntries(Object.entries(values)
                    .map(([key, value]) => [String(key).slice(0, 160), cleanText(value, 1600)])
                    .filter(([key, value]) => key && value));
                return [language, cleaned];
            })
            .filter(([, values]) => Object.keys(values).length));
    };
    const normalizeHighlightTextKey = (value) => String(value || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/\s+/g, ' ')
        .trim();
    const getHighlightImageByText = (value) => highlightImagesByText[normalizeHighlightTextKey(value)] || '';

    function normalizeImageItem(item = {}, fallback = {}) {
        const rawImage = item.image || item.src || fallback.image || '';
        const image = HERO_BANNER_IMAGE_ALIASES[rawImage] || optimizedImageAliases[rawImage] || rawImage;
        const rawMobileImage = item.mobileImage || item.mobileSrc || fallback.mobileImage || optimizedMobileImagesByDesktop[image] || '';
        const mobileImage = HERO_BANNER_IMAGE_ALIASES[rawMobileImage] || optimizedImageAliases[rawMobileImage] || rawMobileImage;
        return {
            image: cleanAsset(image, fallback.image || ''),
            mobileImage: cleanAsset(mobileImage, ''),
            alt: cleanText(item.alt || fallback.alt || 'Imagem Stik', 120)
        };
    }

    function normalizeHeroBannerImageItem(item = {}, fallback = {}) {
        const rawImage = item.image || item.src || fallback.image || '';
        const image = HERO_BANNER_IMAGE_ALIASES[rawImage] || optimizedImageAliases[rawImage] || rawImage;
        const rawMobileImage = item.mobileImage || item.mobileSrc || fallback.mobileImage || optimizedMobileImagesByDesktop[image] || '';
        const mobileImage = HERO_BANNER_IMAGE_ALIASES[rawMobileImage] || optimizedImageAliases[rawMobileImage] || rawMobileImage;
        return normalizeImageItem({
            ...item,
            image,
            mobileImage
        }, fallback);
    }

    function localizeHeroBannerImageItem(item = {}) {
        const group = localizedHeroBannerImagesByPath[item.image] || localizedHeroBannerImagesByPath[item.mobileImage];
        if (!group) return item;
        const localized = group[normalizeStikLanguage(stikCurrentLanguage)] || group[STIK_DEFAULT_LANGUAGE];
        return {
            ...item,
            image: localized.image,
            mobileImage: localized.mobileImage,
            alt: localized.alt || item.alt
        };
    }

    function normalizeCatalogCarouselImageItem(item = {}, fallback = {}, index = 0) {
        const rawImage = item.image || item.src || fallback.image || '';
        const legacyIndex = legacyCatalogCarouselImages.indexOf(rawImage);
        const gridFallback = HOME_GRID_IMAGES[index % HOME_GRID_IMAGES.length] || fallback;
        return normalizeImageItem({
            ...item,
            image: legacyIndex >= 0 ? HOME_GRID_IMAGES[legacyIndex % HOME_GRID_IMAGES.length].image : rawImage
        }, gridFallback);
    }

    function normalizeHeroMode(value) {
        return value === 'slideshow' ? 'slideshow' : 'video';
    }

    function inferHeroMode(hero = {}) {
        if (hero.mode === 'video' || hero.mode === 'slideshow') return hero.mode;
        if (Array.isArray(hero.slideshow?.images) && hero.slideshow.images.length) return 'slideshow';
        const desktopKind = normalizeStikHeroMediaKind(hero.desktopKind) || inferStikMediaKind(hero.desktopVideo || hero.desktopSrc, 'video');
        const mobileKind = normalizeStikHeroMediaKind(hero.mobileKind) || inferStikMediaKind(hero.mobileVideo || hero.mobileSrc, 'video');
        return desktopKind === 'image' || mobileKind === 'image' ? 'slideshow' : 'video';
    }

    function normalize(data) {
        const base = defaults();
        const source = data && typeof data === 'object' ? data : {};
        const home = source.home || {};
        const about = source.about || {};
        const hero = home.hero || {};
        const highlights = home.highlights || {};
        const catalog = home.catalog || {};

        const highlightSource = Array.isArray(highlights.items) ? highlights.items : [];
        const highlightItems = base.home.highlights.items.map((fallback, index) => {
            const item = highlightSource[index] || {};
            const text = cleanText(item.text || item.label || fallback.text, 80);
            const rawImage = item.image || item.src || '';
            const relatedImage = getHighlightImageByText(text);
            const image = relatedImage && (!rawImage || legacyHighlightImages.has(rawImage))
                ? relatedImage
                : rawImage || fallback.image;
            return {
                slot: gridSlots[index],
                image: cleanAsset(image, fallback.image),
                mobileImage: cleanAsset(item.mobileImage || item.mobileSrc || fallback.mobileImage || optimizedMobileImagesByDesktop[image], ''),
                alt: cleanText(item.alt || text || fallback.alt, 120),
                text
            };
        });

        const catalogImages = (Array.isArray(catalog.carouselImages) && catalog.carouselImages.length
            ? catalog.carouselImages
            : base.home.catalog.carouselImages)
            .map((item, index) => normalizeCatalogCarouselImageItem(item, base.home.catalog.carouselImages[index] || base.home.catalog.carouselImages[0], index))
            .filter(item => item.image)
            .slice(0, 12);

        const aboutGallery = (Array.isArray(about.galleryImages) && about.galleryImages.length
            ? about.galleryImages
            : base.about.galleryImages)
            .map((item, index) => normalizeImageItem(item, base.about.galleryImages[index] || base.about.galleryImages[0]))
            .filter(item => item.image)
            .slice(0, 8);
        const aboutEvolutionImages = (Array.isArray(about.evolutionImages) && about.evolutionImages.length
            ? about.evolutionImages
            : base.about.evolutionImages)
            .map((item, index) => normalizeImageItem(item, base.about.evolutionImages[index] || base.about.evolutionImages[0]))
            .filter(item => item.image)
            .slice(0, 3);
        const legacyHeroSlides = [
            normalizeStikHeroMediaKind(hero.desktopKind) === 'image' || inferStikMediaKind(hero.desktopVideo || hero.desktopSrc, 'video') === 'image'
                ? { image: hero.desktopVideo || hero.desktopSrc, alt: 'Imagem desktop do hero' }
                : null,
            normalizeStikHeroMediaKind(hero.mobileKind) === 'image' || inferStikMediaKind(hero.mobileVideo || hero.mobileSrc, 'video') === 'image'
                ? { image: hero.mobileVideo || hero.mobileSrc, alt: 'Imagem mobile do hero' }
                : null
        ].filter(Boolean);
        const usesLegacyHeroVideo = (
            hero.mode === 'video'
            && (!hero.poster || hero.poster === LEGACY_HERO_VIDEO.poster)
            && (!hero.desktopVideo || hero.desktopVideo === LEGACY_HERO_VIDEO.desktopVideo || hero.desktopSrc === LEGACY_HERO_VIDEO.desktopVideo)
            && (!hero.mobileVideo || hero.mobileVideo === LEGACY_HERO_VIDEO.mobileVideo || hero.mobileSrc === LEGACY_HERO_VIDEO.mobileVideo)
        );
        const slideshowSource = Array.isArray(hero.slideshow?.images) && hero.slideshow.images.length && !usesLegacyHeroVideo
            ? hero.slideshow.images
            : legacyHeroSlides.length
                ? legacyHeroSlides
                : HERO_BANNER_IMAGES;
        const slideshowImages = slideshowSource
            .map((item, index) => normalizeHeroBannerImageItem(item, HERO_BANNER_IMAGES[index] || HERO_BANNER_IMAGES[0]))
            .map(localizeHeroBannerImageItem)
            .filter(item => item.image)
            .slice(0, 12);
        const hasHeroConfig = Boolean(home.hero && Object.keys(hero).length);
        const heroMode = usesLegacyHeroVideo || !hasHeroConfig
            ? 'slideshow'
            : normalizeHeroMode(inferHeroMode(hero));

        return {
            home: {
                hero: {
                    mode: heroMode,
                    poster: cleanAsset(HERO_BANNER_IMAGE_ALIASES[hero.poster] || (usesLegacyHeroVideo ? base.home.hero.poster : hero.poster), base.home.hero.poster),
                    desktopVideo: cleanAsset(hero.desktopVideo || hero.desktopSrc, base.home.hero.desktopVideo),
                    mobileVideo: cleanAsset(hero.mobileVideo || hero.mobileSrc, base.home.hero.mobileVideo),
                    desktopKind: normalizeStikHeroMediaKind(hero.desktopKind) || inferStikMediaKind(hero.desktopVideo || hero.desktopSrc, 'video'),
                    mobileKind: normalizeStikHeroMediaKind(hero.mobileKind) || inferStikMediaKind(hero.mobileVideo || hero.mobileSrc, 'video'),
                    slideshow: {
                        duration: HERO_SLIDESHOW_DURATION,
                        transition: 'fade',
                        images: slideshowImages.length ? slideshowImages : base.home.hero.slideshow.images
                    }
                },
                highlights: {
                    title: cleanText(highlights.title, 80) || base.home.highlights.title,
                    items: highlightItems
                },
                catalog: {
                    title: cleanText(catalog.title, 100) || base.home.catalog.title,
                    carouselImages: catalogImages.length ? catalogImages : base.home.catalog.carouselImages
                }
            },
            about: {
                title: cleanText(about.title, 120) || base.about.title,
                paragraphs: (Array.isArray(about.paragraphs) ? about.paragraphs : base.about.paragraphs)
                    .map((item, index) => cleanText(item, 1200) || base.about.paragraphs[index] || '')
                    .filter(Boolean)
                    .slice(0, 3),
                mainImage: cleanAsset(about.mainImage, base.about.mainImage),
                mainImageAlt: cleanText(about.mainImageAlt, 120) || base.about.mainImageAlt,
                statement: cleanText(about.statement, 800) || base.about.statement,
                galleryImages: aboutGallery.length ? aboutGallery : base.about.galleryImages,
                evolutionImages: aboutEvolutionImages.length ? aboutEvolutionImages : base.about.evolutionImages,
                bottomText: cleanText(about.bottomText, 900) || base.about.bottomText,
                bottomImage: cleanAsset(about.bottomImage, base.about.bottomImage),
                bottomImageAlt: cleanText(about.bottomImageAlt, 120) || base.about.bottomImageAlt
            },
            i18n: normalizeSiteContentI18n(source.i18n)
        };
    }

    function read() {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            return normalize(stored ? JSON.parse(stored) : null);
        } catch (error) {
            return normalize(null);
        }
    }

    function write(content) {
        const normalized = normalize(content);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
        window.dispatchEvent(new CustomEvent('stik:site-content-updated', { detail: normalized }));
        return normalized;
    }

    function reset() {
        localStorage.removeItem(STORAGE_KEY);
        const content = normalize(null);
        window.dispatchEvent(new CustomEvent('stik:site-content-updated', { detail: content }));
        return content;
    }

    return { read, write, reset, defaults: () => normalize(null), gridSlots };
})();

async function applySiteContent(root = document) {
    const content = localizeStikSiteContent(siteContentStore.read());
    await Promise.all([
        applyHomeSiteContent(root, content.home),
        applyAboutSiteContent(root, content.about)
    ]);
}

function setStikResponsiveImage(img, item = {}, sizes = '100vw') {
    if (!img || !item.image) return;
    img.src = item.image;
    if (item.mobileImage && item.mobileImage !== item.image) {
        img.srcset = `${item.mobileImage} 820w, ${item.image} 1800w`;
        img.sizes = sizes;
    } else {
        img.removeAttribute('srcset');
        img.removeAttribute('sizes');
    }
}

async function applyHomeSiteContent(root, home) {
    const heroContainer = root.querySelector?.('.video-container') || document.querySelector('.video-container');
    if (heroContainer && home?.hero) {
        const heroMode = home.hero.mode === 'slideshow' ? 'slideshow' : 'video';
        const [posterSrc, desktopSrc, mobileSrc, slideshowImages] = await Promise.all([
            resolveStikAssetUrl(home.hero.poster),
            resolveStikAssetUrl(home.hero.desktopVideo),
            resolveStikAssetUrl(home.hero.mobileVideo),
            Promise.all((home.hero.slideshow?.images || []).map(async item => ({
                ...item,
                image: await resolveStikAssetUrl(item.image),
                mobileImage: await resolveStikAssetUrl(item.mobileImage)
            })))
        ]);
        heroContainer.dataset.heroMode = heroMode;
        heroContainer.dataset.poster = posterSrc;
        heroContainer.dataset.desktopSrc = desktopSrc;
        heroContainer.dataset.mobileSrc = mobileSrc;
        heroContainer.dataset.desktopKind = heroMode === 'video' ? 'video' : (home.hero.desktopKind || inferStikMediaKind(home.hero.desktopVideo, 'video'));
        heroContainer.dataset.mobileKind = heroMode === 'video' ? 'video' : (home.hero.mobileKind || inferStikMediaKind(home.hero.mobileVideo, 'video'));
        heroContainer.dataset.slideshowDuration = String(home.hero.slideshow?.duration || 10000);
        heroContainer.dataset.slideshowImages = JSON.stringify(slideshowImages.filter(item => item.image));
        if (posterSrc) {
            heroContainer.style.backgroundImage = `url("${posterSrc.replace(/"/g, '\\"')}")`;
        }
        renderStikHeroMedia(heroContainer, heroContainer.dataset.heroMediaReady === 'true');
    }

    const highlightsTitle = root.querySelector?.('.product-highlights h2');
    if (highlightsTitle && home?.highlights?.title) {
        setStikRawText(highlightsTitle, home.highlights.title);
    }

    root.querySelectorAll?.('.highlights-grid .highlight-item').forEach((item, index) => {
        const data = home?.highlights?.items?.[index];
        if (!data) return;
        const img = item.querySelector('img');
        const label = item.querySelector('span');
        if (img) {
            Promise.all([
                resolveStikAssetUrl(data.image),
                resolveStikAssetUrl(data.mobileImage)
            ]).then(([src, mobileSrc]) => {
                if (src) setStikResponsiveImage(img, { image: src, mobileImage: mobileSrc }, '(max-width: 768px) 100vw, 33vw');
            });
            img.alt = data.alt;
        }
        if (label) setStikRawText(label, data.text);
    });

    const highlightsSection = root.querySelector?.('.product-highlights');
    if (highlightsSection) {
        applyStikTranslations(highlightsSection);
    }

    const catalogTitle = root.querySelector?.('.newsletter-content h2');
    if (catalogTitle && home?.catalog?.title) {
        setStikRawText(catalogTitle, home.catalog.title);
    }

    const catalogTrack = root.querySelector?.('.carousel-bg .carousel-track');
    if (catalogTrack && Array.isArray(home?.catalog?.carouselImages)) {
        const carouselImages = await Promise.all(home.catalog.carouselImages.map(async item => ({
            ...item,
            image: await resolveStikAssetUrl(item.image),
            mobileImage: await resolveStikAssetUrl(item.mobileImage)
        })));
        const carouselMarkup = carouselImages.filter(item => item.image).map(item => `
            <img src="${escapeAttribute(item.image)}" ${item.mobileImage ? `srcset="${escapeAttribute(item.mobileImage)} 820w, ${escapeAttribute(item.image)} 1800w" sizes="(max-width: 768px) 42vw, 240px"` : ''} alt="${escapeAttribute(item.alt)}" loading="lazy" decoding="async">
        `).join('');
        catalogTrack.innerHTML = carouselMarkup;
        catalogTrack.dataset.originalMarkup = carouselMarkup;
        if (carouselMarkup && typeof setupInfiniteNewsletterCarousel === 'function') {
            setupInfiniteNewsletterCarousel(catalogTrack, { force: true, refreshMarkup: true });
        }
    }
}

function getStikHeroMediaConfig(container) {
    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    const src = isMobile ? container.dataset.mobileSrc : container.dataset.desktopSrc;
    const explicitKind = isMobile ? container.dataset.mobileKind : container.dataset.desktopKind;
    return {
        src,
        kind: normalizeStikHeroMediaKind(explicitKind) || inferStikMediaKind(src, 'video'),
        poster: container.dataset.poster || ''
    };
}

function clearStikHeroSlideshow(container) {
    if (container.__stikHeroSlideshowTimer) {
        window.clearInterval(container.__stikHeroSlideshowTimer);
        container.__stikHeroSlideshowTimer = 0;
    }
}

function getStikHeroSlideshowImages(container) {
    try {
        const images = JSON.parse(container.dataset.slideshowImages || '[]');
        if (Array.isArray(images)) {
            return images
                .map(item => ({
                    image: normalizeStikAssetUrl(item?.image || ''),
                    mobileImage: normalizeStikAssetUrl(item?.mobileImage || ''),
                    alt: item?.alt || 'Imagem principal Stik'
                }))
                .filter(item => item.image);
        }
    } catch (error) {
        console.warn('Nao foi possivel carregar os slides do hero.', error);
    }
    const poster = normalizeStikAssetUrl(container.dataset.poster || '');
    return poster ? [{ image: poster, alt: 'Imagem principal Stik' }] : [];
}

function renderStikHeroSlideshow(container, shouldPlay = false) {
    const slides = getStikHeroSlideshowImages(container);
    if (!slides.length) return null;
    const isMobile = window.matchMedia('(max-width: 768px)').matches;

    clearStikHeroSlideshow(container);
    container.querySelector('#institutionalVideo, #institutionalHeroImage')?.remove();

    let slideshow = container.querySelector('#institutionalHeroSlideshow');
    if (!slideshow) {
        slideshow = document.createElement('div');
        slideshow.id = 'institutionalHeroSlideshow';
        slideshow.className = 'hero-slideshow hero-media-element';
        container.appendChild(slideshow);
    }

    const slidesKey = JSON.stringify(slides.map(item => [
        isMobile && item.mobileImage ? item.mobileImage : item.image,
        isMobile ? 'mobile' : 'desktop'
    ]));
    if (slideshow.dataset.slidesKey !== slidesKey) {
        slideshow.innerHTML = slides.map((item, index) => {
            const selectedImage = isMobile && item.mobileImage ? item.mobileImage : item.image;
            const image = document.createElement('img');
            image.src = selectedImage;
            if (isMobile && item.mobileImage) {
                image.srcset = `${item.mobileImage} 1200w`;
                image.sizes = '100vw';
            } else if (item.image) {
                image.srcset = `${item.image} 2400w`;
                image.sizes = '100vw';
            }
            image.dataset.desktopSrc = item.image;
            image.dataset.mobileSrc = item.mobileImage || '';
            image.alt = item.alt;
            image.decoding = 'async';
            image.loading = index === 0 ? 'eager' : 'lazy';
            if (index === 0) image.fetchPriority = 'high';
            image.className = index === 0 ? 'is-active' : '';
            return image.outerHTML;
        }).join('');
        slideshow.dataset.slidesKey = slidesKey;
        slideshow.dataset.activeIndex = '0';
    }

    container.closest('.video-hero-section')?.classList.add('video-ready');
    const images = Array.from(slideshow.querySelectorAll('img'));
    const duration = Math.max(3200, Number(container.dataset.slideshowDuration) || 10000);
    if (shouldPlay && images.length > 1) {
        container.__stikHeroSlideshowTimer = window.setInterval(() => {
            if (document.hidden) return;
            const currentIndex = Number(slideshow.dataset.activeIndex || 0);
            const nextIndex = (currentIndex + 1) % images.length;
            const nextImage = images[nextIndex];
            if (!nextImage) return;

            images[currentIndex]?.classList.remove('is-active');
            nextImage.classList.add('is-active');
            slideshow.dataset.activeIndex = String(nextIndex);
        }, duration);
    }

    return slideshow;
}

function renderStikHeroMedia(container, shouldPlay = false) {
    if ((container.dataset.heroMode || 'video') === 'slideshow') {
        return renderStikHeroSlideshow(container, shouldPlay);
    }

    clearStikHeroSlideshow(container);
    container.querySelector('#institutionalHeroSlideshow')?.remove();

    const { src, kind, poster } = getStikHeroMediaConfig(container);
    if (!src) return null;

    const current = container.querySelector('#institutionalVideo, #institutionalHeroImage');
    if (kind === 'image') {
        let image = current?.id === 'institutionalHeroImage' ? current : null;
        if (!image) {
            image = document.createElement('img');
            image.id = 'institutionalHeroImage';
            image.className = 'hero-media-element';
            image.decoding = 'async';
            image.loading = 'eager';
            current?.replaceWith(image) || container.appendChild(image);
        }
        if (image.getAttribute('src') !== src) image.src = src;
        image.alt = 'Imagem principal Stik';
        container.closest('.video-hero-section')?.classList.add('video-ready');
        return image;
    }

    let video = current?.id === 'institutionalVideo' ? current : null;
    if (!video) {
        video = document.createElement('video');
        video.id = 'institutionalVideo';
        video.className = 'hero-media-element';
        video.autoplay = true;
        video.muted = true;
        video.loop = true;
        video.playsInline = true;
        video.setAttribute('webkit-playsinline', '');
        video.preload = 'metadata';
        current?.replaceWith(video) || container.appendChild(video);
    }

    video.poster = poster;
    video.dataset.desktopSrc = container.dataset.desktopSrc || '';
    video.dataset.mobileSrc = container.dataset.mobileSrc || '';
    if (video.getAttribute('src') !== src) {
        video.setAttribute('src', src);
        video.load();
    }
    if (shouldPlay) playStikHeroVideo(video);
    return video;
}

function playStikHeroVideo(video) {
    if (!video) return;
    video.muted = true;
    video.defaultMuted = true;
    video.setAttribute('muted', '');
    video.setAttribute('playsinline', '');
    video.setAttribute('webkit-playsinline', '');
    video.play?.().catch(() => {
        video.closest('.video-hero-section')?.classList.add('video-autoplay-blocked');
    });
}

async function applyAboutSiteContent(root, about) {
    const page = root.querySelector?.('.institutional-page') || (root.classList?.contains('institutional-page') ? root : null);
    if (!page || !about) return;

    const title = page.querySelector('.institutional-story-title, .institucional-section:first-of-type .title-section');
    if (title) setStikRawText(title, about.title);

    const paragraphs = page.querySelectorAll('.institucional-section:first-of-type .text-block p');
    paragraphs.forEach((paragraph, index) => {
        if (about.paragraphs[index]) setStikRawText(paragraph, about.paragraphs[index]);
    });

    const mainImage = page.querySelector('.institucional-section:first-of-type .image-block img');
    if (mainImage) {
        const mainImageSrc = await resolveStikAssetUrl(about.mainImage);
        if (mainImageSrc) mainImage.src = mainImageSrc;
        mainImage.alt = about.mainImageAlt;
    }

    const statement = page.querySelector('.institutional-story-quote, .institucional-section:first-of-type .values-block h3');
    if (statement) setStikRawText(statement, about.statement);

    const topPhotos = page.querySelectorAll('.institutional-top-photo img');
    if (topPhotos.length && Array.isArray(about.galleryImages)) {
        const topImages = await Promise.all(about.galleryImages.slice(0, topPhotos.length).map(async item => ({
            ...item,
            image: await resolveStikAssetUrl(item.image),
            mobileImage: await resolveStikAssetUrl(item.mobileImage)
        })));
        topPhotos.forEach((image, index) => {
            const item = topImages[index];
            if (!item?.image) return;
            setStikResponsiveImage(image, item, '(max-width: 768px) 58vw, 420px');
            image.alt = item.alt;
        });
    }

    const galleryGrid = page.querySelector('.gallery-grid');
    if (galleryGrid && Array.isArray(about.galleryImages)) {
        const galleryImages = await Promise.all(about.galleryImages.map(async item => ({
            ...item,
            image: await resolveStikAssetUrl(item.image)
        })));
        galleryGrid.innerHTML = galleryImages.filter(item => item.image).map(item => `
            <div class="gallery-item"><img src="${escapeAttribute(item.image)}" alt="${escapeAttribute(item.alt)}" loading="lazy" decoding="async"></div>
        `).join('');
    }

    const bottomText = page.querySelector('.institucional-stacked .stacked-text p');
    if (bottomText) setStikRawText(bottomText, about.bottomText);

    const evolutionImages = page.querySelectorAll('.institutional-evolution-media img');
    const evolutionMediaSource = Array.isArray(about.evolutionImages) && about.evolutionImages.length
        ? about.evolutionImages
        : (Array.isArray(about.galleryImages) ? about.galleryImages.slice(2, 2 + evolutionImages.length) : []);
    if (evolutionImages.length && evolutionMediaSource.length) {
        const mediaImages = await Promise.all(evolutionMediaSource.slice(0, evolutionImages.length).map(async item => ({
            ...item,
            image: await resolveStikAssetUrl(item.image)
        })));
        evolutionImages.forEach((image, index) => {
            const item = mediaImages[index] || mediaImages[0];
            if (!item?.image) return;
            image.src = item.image;
            image.alt = item.alt;
        });
    }

    const bottomImage = page.querySelector('.institucional-stacked .stacked-image img');
    if (bottomImage) {
        const bottomImageSrc = await resolveStikAssetUrl(about.bottomImage);
        const bottomImageWrapper = bottomImage.closest('.stacked-image');
        if (bottomImageSrc) {
            bottomImage.src = bottomImageSrc;
            if (bottomImageWrapper) bottomImageWrapper.hidden = false;
        } else if (bottomImageWrapper) {
            bottomImageWrapper.hidden = true;
        }
        bottomImage.alt = about.bottomImageAlt;
    }

    initInstitutionalTopImagesAnimation();
    initInstitutionalPrinciplesAnimation();
}

productStore.hydrate();
window.productStore = productStore;
window.siteContentStore = siteContentStore;
let artigos = null;

function localizeStikSiteContent(content) {
    if (!content || stikCurrentLanguage === STIK_DEFAULT_LANGUAGE) return content;
    const translations = content.i18n?.[stikCurrentLanguage];
    if (!translations || typeof translations !== 'object') return content;

    const localized = JSON.parse(JSON.stringify(content));
    Object.entries(translations).forEach(([path, value]) => {
        if (value) setSiteContentPathValue(localized, path, value);
    });
    return localized;
}

function mediaMatches(query) {
    return typeof window !== 'undefined' && 'matchMedia' in window && window.matchMedia(query).matches;
}

function getPerformanceProfile() {
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    const memory = Number(navigator.deviceMemory) || 8;
    const cores = Number(navigator.hardwareConcurrency) || 8;
    const saveData = Boolean(connection && connection.saveData);
    const smallViewport = mediaMatches('(max-width: 768px)');
    const coarsePointer = mediaMatches('(pointer: coarse)');
    const anyCoarsePointer = mediaMatches('(any-pointer: coarse)');
    const touchCapable = anyCoarsePointer || Number(navigator.maxTouchPoints) > 0;
    const reducedMotion = mediaMatches('(prefers-reduced-motion: reduce)');
    const lowMemory = memory <= 4;
    const lowCpu = cores <= 4;

    return {
        saveData,
        smallViewport,
        coarsePointer,
        anyCoarsePointer,
        touchCapable,
        reducedMotion,
        lowPower: saveData || lowMemory || lowCpu || (smallViewport && (coarsePointer || touchCapable))
    };
}

function shouldUseLightMotion() {
    const profile = getPerformanceProfile();
    return profile.lowPower || profile.reducedMotion;
}

function hasFineHover() {
    return mediaMatches('(hover: hover) and (pointer: fine)');
}

function shouldUseLimitedCatalogCarousel() {
    const profile = getPerformanceProfile();
    const fineHover = hasFineHover();

    if (profile.reducedMotion || profile.saveData) return true;
    if (profile.smallViewport || profile.coarsePointer || profile.touchCapable || !fineHover) return true;

    return profile.lowMemory && profile.lowCpu;
}

function escapeAttribute(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

function decodeStikUrlPath(value, maxPasses = 3) {
    const raw = String(value ?? '').trim();
    let decoded = raw;
    for (let index = 0; index < maxPasses; index += 1) {
        try {
            const next = decodeURI(decoded);
            if (next === decoded) break;
            decoded = next;
        } catch (error) {
            break;
        }
    }
    return decoded;
}

function decodeStikUrlSchemeProbe(value, maxPasses = 3) {
    const raw = String(value ?? '').trim();
    let decoded = raw;
    for (let index = 0; index < maxPasses; index += 1) {
        try {
            const next = decodeURIComponent(decoded);
            if (next === decoded) break;
            decoded = next;
        } catch (error) {
            break;
        }
    }
    return decoded;
}

function encodeStikUrlPath(value) {
    return encodeURI(decodeStikUrlPath(value));
}

function encodeStikUrlPreservingEscapes(value) {
    return encodeURI(String(value ?? '').trim()).replace(/%25([0-9a-f]{2})/gi, '%$1');
}

function normalizeStikAssetUrl(value, fallback = '') {
    const original = String(value ?? '').trim();
    if (isStikManagedMediaRef(original)) return original;
    const raw = decodeStikUrlPath(original);
    const schemeProbe = decodeStikUrlSchemeProbe(original);
    if (!raw || /[\u0000-\u001f\u007f]/.test(raw)) return fallback;
    if (/^(javascript|vbscript):/i.test(schemeProbe)) return fallback;
    if (/^data:image\/(?:png|jpe?g|gif|webp|avif);base64,/i.test(raw)) return raw;
    if (/^data:/i.test(raw)) return fallback;
    if (/^blob:/i.test(raw)) return raw;
    if (/^(https?:)?\/\//i.test(original)) {
        try {
            const url = new URL(original, window.location.origin);
            return /^https?:$/i.test(url.protocol) ? url.href : fallback;
        } catch (error) {
            return fallback;
        }
    }
    if (/^(\/(?!\/)|\.\/|\.\.\/|#|[^:?#]+(?:[/?#]|$))/i.test(raw)) {
        return encodeStikUrlPath(raw);
    }
    return fallback;
}

function normalizeStikHeroMediaKind(value) {
    return ['image', 'video'].includes(value) ? value : '';
}

function inferStikMediaKind(value, fallback = 'image') {
    const raw = String(value || '').split(/[?#]/)[0].toLowerCase();
    if (/\.(mp4|webm|ogg)$/.test(raw)) return 'video';
    if (/\.(jpe?g|png|webp|gif|avif)$/.test(raw)) return 'image';
    return normalizeStikHeroMediaKind(fallback) || 'image';
}

function normalizeStikLinkUrl(value, fallback = '#') {
    const raw = String(value ?? '').trim();
    const decodedForScheme = decodeStikUrlSchemeProbe(raw);
    if (!raw || /[\u0000-\u001f\u007f]/.test(raw)) return fallback;
    if (/^(javascript|vbscript|data):/i.test(decodedForScheme)) return fallback;
    if (/^(mailto|tel):/i.test(raw)) return raw;
    if (/^(https?:)?\/\//i.test(raw)) {
        try {
            const url = new URL(raw, window.location.origin);
            return /^https?:$/i.test(url.protocol) ? url.href : fallback;
        } catch (error) {
            return fallback;
        }
    }
    if (/^(\/(?!\/)|\.\/|\.\.\/|#|[^:?#]+(?:[/?#]|$))/i.test(raw)) {
        return encodeStikUrlPreservingEscapes(raw);
    }
    return fallback;
}

const STIK_ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif']);
const STIK_MAX_IMAGE_FILE_SIZE = 5 * 1024 * 1024;

function validateStikImageFile(file) {
    if (!file) return 'Arquivo invalido.';
    if (!STIK_ALLOWED_IMAGE_TYPES.has(file.type)) {
        return 'Escolha uma imagem JPG, PNG, WebP, GIF ou AVIF.';
    }
    if (file.size > STIK_MAX_IMAGE_FILE_SIZE) {
        return 'A imagem deve ter no maximo 5 MB.';
    }
    return '';
}

function optimizedImageMarkup(src, alt, options = {}) {
    const loading = options.loading || 'lazy';
    const fetchPriority = options.fetchPriority ? ` fetchpriority="${escapeAttribute(options.fetchPriority)}"` : '';
    return `<img src="${escapeAttribute(normalizeStikAssetUrl(src))}" alt="${escapeAttribute(alt)}" loading="${loading}" decoding="async"${fetchPriority}>`;
}

function optimizeImageElement(img, options = {}) {
    if (!img) return;
    img.loading = options.loading || 'lazy';
    img.decoding = 'async';
    if (options.fetchPriority) img.fetchPriority = options.fetchPriority;
}

/**
 * Carrega artigos de forma lazy a partir de um arquivo JSON (crie data/artigos.json).
 * Reduz o tempo de parsing do script principal.
 */
async function loadArtigos() {
    if (artigos) return artigos;
    try {
        const res = await fetch('./artigos.json');

        if (!res.ok) throw new Error('status ' + res.status);
        artigos = await res.json();
        return artigos;
    } catch (err) {
        console.error('Erro ao carregar artigos:', err);
        artigos = [];
        return artigos;
    }
}
 

// utilitário para adiar inicializações não-críticas
function deferInit(fn) {
    if (typeof fn !== 'function') return;
    if ('requestIdleCallback' in window) {
        requestIdleCallback(fn, { timeout: 800 });
    } else {
        setTimeout(fn, 200);
    }
}

// Funções para carregar e inicializar componentes
async function carregarComponente(id, url, callback) {
    const placeholder = document.getElementById(id);
    if (!placeholder) return;

    try {
        const response = await fetch(url);
        const html = await response.text();
        placeholder.innerHTML = html;
        applyStikTranslations(placeholder);
        
        if (callback && typeof callback === 'function') {
            callback();
        }
    } catch (error) {
        console.error(`Erro ao carregar o componente ${url}:`, error);
    }
}

async function carregarConteudoPrincipal(url) {
    const mainContentPlaceholder = document.getElementById('main-content-placeholder');
    if (!mainContentPlaceholder) return;

    try {
        const response = await fetch(url);
        const html = await response.text();
        mainContentPlaceholder.innerHTML = html;

        history.pushState(null, '', url);
        
        if (url.includes('blog.html')) {
            displayArticles();
            const createBtn = document.getElementById('create-article-btn');
            if (createBtn) {
                createBtn.addEventListener('click', createNewArticle);
            }
        } else if (url.includes('produto.html')) {
            carregarDetalhesDoProduto();
        }
        applySiteContent(mainContentPlaceholder);
        inicializarAnimateOnScroll();
        applyStikTranslations(mainContentPlaceholder);
        inicializarNewsletterCarousel();

    } catch (error) {
        console.error(`Erro ao carregar o conteúdo ${url}:`, error);
    }
}

// --- Funções de persistência unificadas ---
function saveSidebarState() {
    const sidebar = document.querySelector('.sidebar');
    if (!sidebar) return;

    try {
        localStorage.setItem('sidebarActive', sidebar.classList.contains('active'));

        const submenusAtivos = [];
        document.querySelectorAll('.submenu, .submenu-aninhado, .submenu-terceiro-nivel').forEach((submenu, index) => {
            if (submenu.classList.contains('active')) {
                submenusAtivos.push(index);
            }
        });
        localStorage.setItem('submenusAtivos', JSON.stringify(submenusAtivos));
    } catch (error) {
        /* A sidebar continua funcional mesmo sem persistencia local. */
    }
}

function restoreSidebarState() {
    const sidebar = document.querySelector('.sidebar');
    if (!sidebar) return;

    let sidebarActive = false;
    let submenusAtivos = [];
    try {
        sidebarActive = localStorage.getItem('sidebarActive') === 'true';
        submenusAtivos = JSON.parse(localStorage.getItem('submenusAtivos')) || [];
        if (!Array.isArray(submenusAtivos)) submenusAtivos = [];
    } catch (error) {
        sidebarActive = false;
        submenusAtivos = [];
    }
    const overlay = document.getElementById('overlay');

    if (sidebarActive) {
        sidebar.classList.add('active');
        document.body.classList.add('sidebar-open');

        // só bloqueia scroll e mostra overlay em telas pequenas
        if (window.matchMedia('(max-width: 768px)').matches) {
            if (overlay) overlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        } else {
            if (overlay) overlay.classList.remove('active');
            document.body.style.overflow = '';
        }
    } else {
        sidebar.classList.remove('active');
        document.body.classList.remove('sidebar-open');
        if (overlay) overlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    document.querySelectorAll('.submenu, .submenu-aninhado, .submenu-terceiro-nivel').forEach((submenu, index) => {
        if (submenusAtivos.includes(index)) submenu.classList.add('active');
        else submenu.classList.remove('active');
    });

    // sincroniza ícones de chevron
    document.querySelectorAll('.has-submenu > .sidebar-link, .has-submenu-hover > .sidebar-link, .has-submenu > a, .has-submenu-hover > a').forEach(trigger => {
        const submenu = trigger.nextElementSibling;
        const icon = trigger.querySelector('.fas.fa-chevron-down, .fas.fa-chevron-right');
        if (submenu?.classList.contains('active') && icon) {
            if (icon.classList.contains('fa-chevron-down')) icon.classList.add('fa-rotate-180');
            else icon.classList.add('fa-rotate-90');
        } else if (icon) {
            icon.classList.remove('fa-rotate-180', 'fa-rotate-90');
        }
    });

    highlightCurrentSidebarLink();
}
// ------------------------------------------

function highlightCurrentSidebarLink() {
    const sidebar = document.getElementById('sidebar');
    if (!sidebar) return;

    const pathname = window.location.pathname.replace(/\/+$/, '');
    const params = new URLSearchParams(window.location.search);
    const currentHash = window.location.hash;

    const clearCurrent = () => {
        sidebar.querySelectorAll('.sidebar-link.is-current').forEach(link => {
            link.classList.remove('is-current');
        });
    };

    const activateLink = (selector) => {
        const link = sidebar.querySelector(selector);
        if (!link) return null;
        link.classList.add('is-current');
        return link;
    };

    const normalizeSidebarCategory = (value) => {
        if (!value) return '';
        const decoded = decodeURIComponent(value).trim();
        return normalizeCategoria(decoded).toLocaleLowerCase('pt-BR');
    };

    clearCurrent();

    let activeRoute = 'home';
    if (/\/blog(\.html)?$/.test(pathname) || /\/artigo(\.html)?$/.test(pathname) || /\/create-article(\.html)?$/.test(pathname)) {
        activeRoute = 'blog';
    } else if (/\/institucional(\.html)?$/.test(pathname)) {
        activeRoute = 'institucional';
    } else if (/\/(?:fale_conosco|fale-conosco)(\.html)?$/.test(pathname)) {
        activeRoute = 'contato';
    } else if (
        (pathname === '' || pathname === '/' || pathname.endsWith('index.html')) &&
        (currentHash === '#catalogo' || currentHash === '#newsletter')
    ) {
        activeRoute = 'catalogo';
    } else if (/\/categoria(\.html)?$/.test(pathname) || /\/produto(\.html)?$/.test(pathname)) {
        activeRoute = 'produtos';
    }

    const activeMainLink = activateLink(`.sidebar-link[data-sidebar-route="${activeRoute}"]`);

    if (activeRoute === 'produtos') {
        const submenu = sidebar.querySelector('.has-submenu > .submenu');
        const chevron = sidebar.querySelector('.has-submenu > .sidebar-link .fa-chevron-down');
        if (submenu) submenu.classList.add('active');
        if (chevron) chevron.classList.add('fa-rotate-180');

        let activeCategory = params.get('categoria');

        if (!activeCategory && /\/produto(\.html)?$/.test(pathname)) {
            const productId = parseInt(params.get('id'), 10);
            const currentProduct = Array.isArray(produtos) ? produtos.find(produto => produto.id === productId) : null;
            activeCategory = currentProduct?.categoria || '';
        }

        const normalizedActiveCategory = normalizeSidebarCategory(activeCategory);
        if (normalizedActiveCategory) {
            const categoryLink = Array.from(sidebar.querySelectorAll('.submenu .sidebar-link')).find(link => {
                return normalizeSidebarCategory(link.dataset.sidebarCategory) === normalizedActiveCategory;
            });
            if (categoryLink) categoryLink.classList.add('is-current');
        }
    }

    if (activeMainLink && activeRoute !== 'produtos') {
        const submenu = sidebar.querySelector('.has-submenu > .submenu');
        const chevron = sidebar.querySelector('.has-submenu > .sidebar-link .fa-chevron-down');
        if (submenu) submenu.classList.remove('active');
        if (chevron) chevron.classList.remove('fa-rotate-180');
    }
}

function inicializarMenu() {
    const menuToggle = document.querySelector('.menu-toggle');
    const closeSidebar = document.querySelector('.close-sidebar');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('overlay');
    // aceita tanto <a> como .sidebar-link, pra cobrir estruturas diferentes
    const submenuLinks = document.querySelectorAll('.has-submenu > .sidebar-link, .has-submenu-hover > .sidebar-link, .has-submenu > a, .has-submenu-hover > a');
    const allLinks = document.querySelectorAll('.sidebar-nav a');

    if (!sidebar) return;

    highlightCurrentSidebarLink();

    if (!sidebar.dataset.hashSyncBound) {
        window.addEventListener('hashchange', highlightCurrentSidebarLink);
        sidebar.dataset.hashSyncBound = 'true';
    }

    const isMobile = () => window.matchMedia('(max-width: 768px)').matches;

    // abre a sidebar (usa overlay somente no mobile)
    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            sidebar.classList.add('active');
            document.body.classList.add('sidebar-open'); // <-- importante para empurrar conteúdo

            if (overlay) {
                if (isMobile()) {
                    overlay.classList.add('active');
                    document.body.style.overflow = 'hidden'; // bloqueia scroll só no mobile
                } else {
                    overlay.classList.remove('active');
                    document.body.style.overflow = '';
                }
            }

            highlightCurrentSidebarLink();
            saveSidebarState();
        });
    }

    // fecha a sidebar (limpa localStorage e estado)
    const closeSidebarFn = () => {
        sidebar.classList.remove('active');
        document.body.classList.remove('sidebar-open');

        if (overlay) overlay.classList.remove('active');

        document.body.style.overflow = '';

        // limpa o estado salvo (o usuário fechou manualmente)
        try {
            localStorage.removeItem('sidebarActive');
            localStorage.removeItem('submenusAtivos');
        } catch (error) {
            /* Sem storage, apenas fecha visualmente. */
        }

        // remove classes visuais
        document.querySelectorAll('.submenu.active, .submenu-aninhado.active, .submenu-terceiro-nivel.active').forEach(s => s.classList.remove('active'));
        document.querySelectorAll('.fa-rotate-180, .fa-rotate-90').forEach(ic => ic.classList.remove('fa-rotate-180', 'fa-rotate-90'));
    };

    if (closeSidebar) closeSidebar.addEventListener('click', closeSidebarFn);
    if (overlay) overlay.addEventListener('click', closeSidebarFn);

    // abrir/fechar submenus (só previne o link se realmente houver submenu)
    submenuLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const submenu = link.nextElementSibling;
            if (!submenu) return; // se não tiver submenu, segue o link normalmente

            // evita navegação do link pai (se for '#') e alterna submenu
            e.preventDefault();

            submenu.classList.toggle('active');

            const icon = link.querySelector('.fas.fa-chevron-down, .fas.fa-chevron-right');
            if (icon) {
                if (icon.classList.contains('fa-chevron-down')) {
                    icon.classList.toggle('fa-rotate-180');
                } else {
                    icon.classList.toggle('fa-rotate-90');
                }
            }

            saveSidebarState();
        });
    });

    // salva estado ao clicar em qualquer link (útil para navegação)
    allLinks.forEach(link => {
        link.addEventListener('click', () => {
            saveSidebarState();
        });
    });

    document.addEventListener('click', (e) => {
        const sidebar = document.getElementById('sidebar');
        const menuToggle = document.querySelector('.menu-toggle');

        if (sidebar && menuToggle && !sidebar.contains(e.target) && !menuToggle.contains(e.target)) {
            if (sidebar.classList.contains('active')){
                closeSidebarFn();
            }
        }
    })

    // também re-ativa o comportamento ao redimensionar (ex.: abrir no desktop, reduzir para mobile)
    window.addEventListener('resize', () => {
        // se a sidebar está aberta e o usuário redimensionou para desktop, garante overflow correto
        if (sidebar.classList.contains('active')) {
            if (!isMobile()) {
                document.body.style.overflow = '';
                if (overlay) overlay.classList.remove('active');
            } else {
                if (overlay) overlay.classList.add('active');
                document.body.style.overflow = 'hidden';
            }
        }
    });
}



// Funções para a página inicial
// Helpers de apresentação
function normalizeCategoria(cat) {
    const map = { 'Alças': 'Alça', 'Bases': 'Base' };
    return map[cat] || cat;
}

function formatNome(nome) {
    if (!nome) return '';
    return nome
        .trim()
        .split(/\s+/)
        .map(word => {
            const first = word.charAt(0).toLocaleUpperCase('pt-BR');
            const rest = word.slice(1).toLocaleLowerCase('pt-BR');
            return first + rest;
        })
        .join(' ');
}

function getLocalizedCategoryName(category, productList = produtos) {
    const source = normalizeCategoria(category);
    if (stikCurrentLanguage === STIK_DEFAULT_LANGUAGE) return source;
    const productWithTranslation = (productList || []).find(product => (
        normalizeCategoria(product.categoria) === source
        && product.i18n?.[stikCurrentLanguage]?.categoria
    ));
    return productWithTranslation?.i18n?.[stikCurrentLanguage]?.categoria
        || translateStikDynamicText(source);
}

function getLocalizedProduct(product) {
    if (!product) return product;
    const sourceName = formatNome(product.nome);
    const sourceCategory = normalizeCategoria(product.categoria);
    return {
        ...product,
        displayNome: sourceName,
        displayCategoria: getStikI18nField(sourceCategory, product.i18n, 'categoria'),
        displayMaterial: getStikI18nField(product.material || 'Elástico', product.i18n, 'material'),
        displayDescricao: getStikI18nField(product.descricao || '', product.i18n, 'descricao'),
        displayDetails: getStikI18nField(getProductDetailsSourceText(product), product.i18n, 'details')
    };
}

function criarProdutoCard(produto) {
    const produtoCard = document.createElement('a'); 
    produtoCard.classList.add('produto-card');
    produtoCard.href = `/produto?id=${encodeURIComponent(produto.id)}`;
    const categoryName = getLocalizedCategoryName(produto.categoria);
    produtoCard.innerHTML = `
        ${optimizedImageMarkup(produto.imagem, categoryName)}
        <h3>${escapeHtml(categoryName)}</h3>
    `;
    return produtoCard;
}

function criarCategoriaCard(categoria, imagemRepresentativa) {
    const card = document.createElement('a');
    const displayCategory = getLocalizedCategoryName(categoria);
    card.classList.add('produto-card');
    card.href = `/categoria?categoria=${encodeURIComponent(categoria)}`;
    card.innerHTML = `
        ${optimizedImageMarkup(imagemRepresentativa, displayCategory)}
        <h3>${escapeHtml(displayCategory)}</h3>
    `;
    return card;
}

function exibirCategorias(produtosParaExibir) {
    const listaProdutosContainer = document.getElementById('lista-produtos');
    if (!listaProdutosContainer) return;
    listaProdutosContainer.innerHTML = '';

    if (!Array.isArray(produtosParaExibir) || produtosParaExibir.length === 0) {
        listaProdutosContainer.innerHTML = `<p class="no-results">${escapeHtml(translateStikPhrase('Nenhum produto encontrado.'))}</p>`;
        return;
    }

    // Agrupa por categoria normalizada e pega o primeiro item como imagem representativa
    const porCategoria = new Map();
    produtosParaExibir.forEach(p => {
        const cat = normalizeCategoria(p.categoria);
        if (!porCategoria.has(cat)) porCategoria.set(cat, p);
    });

    porCategoria.forEach((produtoRepresentativo, cat) => {
        const card = criarCategoriaCard(cat, produtoRepresentativo.imagem);
        listaProdutosContainer.appendChild(card);
    });
    applyStikTranslations(listaProdutosContainer);
}

function renderAdminSelectedCategoryProducts() {
    const container = document.getElementById('admin-category-selected-products');
    const title = document.getElementById('admin-selected-category-title');
    if (!container || !window.productStore) return;

    const categories = productStore.listCategories();
    if (!adminSelectedCategory || !categories.some(category => normalizeBlogSearch(category) === normalizeBlogSearch(adminSelectedCategory))) {
        adminSelectedCategory = categories[0] || '';
    }

    if (title) {
        title.textContent = adminSelectedCategory ? `Produtos em ${adminSelectedCategory}` : 'Produtos da categoria';
    }

    if (!adminSelectedCategory) {
        container.innerHTML = '<p class="admin-empty">Cadastre uma categoria para visualizar seus produtos.</p>';
        return;
    }

    const products = productStore.listProducts()
        .filter(product => normalizeBlogSearch(product.categoria) === normalizeBlogSearch(adminSelectedCategory))
        .sort((a, b) => formatNome(a.nome).localeCompare(formatNome(b.nome), 'pt-BR'));

    if (!products.length) {
        container.innerHTML = '<p class="admin-empty">Nenhum produto nesta categoria.</p>';
        return;
    }

    container.innerHTML = products
        .map(product => {
            const statusMeta = getStikAdminStatusMeta({
                publicationStatus: product.publicationStatus,
                translationStatus: product.translationStatus,
                i18n: product.i18n,
                fields: getProductTranslationFields(product),
                forcePending: !hasCompleteStikI18n(product.i18n, getProductTranslationFields(product))
            });
            return `
            <article class="admin-category-selected-product">
                <img src="${escapeAttribute(normalizeStikAssetUrl(product.imagem))}" alt="${escapeAttribute(formatNome(product.nome))}" loading="lazy" decoding="async">
                <div>
                    <strong>${escapeHtml(formatNome(product.nome))}</strong>
                    <span class="admin-item-subtitle">${escapeHtml(product.material || 'Material não informado')}</span>
                    <div class="admin-item-meta">${renderAdminStatusBadge(statusMeta)}</div>
                </div>
                <div class="admin-list-actions">
                    <a class="admin-icon-btn" href="/produto?id=${escapeAttribute(encodeURIComponent(product.id))}" target="_blank" rel="noopener" aria-label="Abrir produto">
                        <i class="fas fa-external-link-alt"></i>
                    </a>
                    <button type="button" class="admin-icon-btn" data-admin-edit-product-from-category="${escapeAttribute(product.id)}" aria-label="Editar produto">
                        <i class="fas fa-pen"></i>
                    </button>
                </div>
            </article>
        `;
        })
        .join('');

    container.querySelectorAll('[data-admin-edit-product-from-category]').forEach(button => {
        button.addEventListener('click', () => {
            loadAdminProductIntoForm(button.dataset.adminEditProductFromCategory);
        });
    });

}

async function renameAdminCategory(oldName, nextName) {
    if (!nextName || normalizeBlogSearch(oldName) === normalizeBlogSearch(nextName)) {
        adminEditingCategory = '';
        renderAdminCategoryList();
        return;
    }

    const alreadyExists = productStore.listCategories()
        .some(category => normalizeBlogSearch(category) === normalizeBlogSearch(nextName) && normalizeBlogSearch(category) !== normalizeBlogSearch(oldName));
    if (alreadyExists) {
        showEditorFeedback('Essa categoria já existe.');
        renderAdminCategoryList();
        return;
    }

    const count = productStore.countProductsByCategory(oldName);
    const action = await showBlogTagImpactDialog({
        title: count > 0 ? 'Alterar categoria em uso' : 'Alterar categoria',
        message: count > 0
            ? `Esta categoria está vinculada a ${count} produto${count === 1 ? '' : 's'}. A alteração também será aplicada nesses produtos.`
            : `Deseja renomear a categoria "${oldName}"?`,
        actions: [
            { value: 'rename', label: 'Alterar categoria', className: 'blog-editor-btn-primary' },
            { value: 'cancel', label: 'Cancelar', className: 'blog-editor-btn-light' }
        ]
    });
    if (action !== 'rename') {
        adminEditingCategory = '';
        renderAdminCategoryList();
        return;
    }

    setStikCategoryTranslationStatus(oldName, '');
    productStore.renameCategory(oldName, nextName);
    translateStikCategoryInBackground(nextName);
    if (normalizeBlogSearch(adminSelectedCategory) === normalizeBlogSearch(oldName)) {
        adminSelectedCategory = nextName;
    }
    adminEditingCategory = '';
    refreshAdminProductsUI();
    renderDynamicSidebarCategories();
    showEditorFeedback('Categoria atualizada.');
}

function loadAdminProductIntoForm(productId) {
    const product = productStore.getProduct(productId);
    if (!product) return;

    activateAdminTab('products');
    document.getElementById('admin-product-id').value = product.id;
    document.getElementById('admin-product-name').value = product.nome;
    setAdminProductImages(product.imagens && product.imagens.length ? product.imagens : [product.imagem], formatNome(product.nome));
    document.getElementById('admin-product-material').value = product.material || 'Elástico';
    document.getElementById('admin-product-description').value = product.descricao || '';
    document.getElementById('admin-product-details').value = product.details || '';
    refreshAdminCategoryOptions();
    setAdminProductCategory(normalizeCategoria(product.categoria));
    document.getElementById('admin-product-form-title').textContent = 'Editar produto';
    document.getElementById('admin-product-name').focus();
}

function renderDynamicSidebarCategories() {
    const submenu = document.querySelector('[data-sidebar-route="produtos"] + .submenu');
    if (!submenu || !window.productStore) return;

    submenu.innerHTML = productStore.listCategories()
        .map(category => {
            const displayCategory = getLocalizedCategoryName(category, productStore.listProducts());
            return `
            <li>
                <a href="/categoria?categoria=${encodeURIComponent(category)}" class="sidebar-link" data-sidebar-category="${escapeAttribute(category)}">
                    ${escapeHtml(displayCategory)}
                </a>
            </li>
        `;
        })
        .join('');
}

// Lógica de pesquisa
function inicializarPesquisa() {
    const searchToggle = document.querySelector('.search-toggle');
    const searchBox = document.querySelector('.search-box');
    const searchInput = document.getElementById('searchInput');
    const searchResultsList = document.getElementById('searchResultsList');

    if (!searchToggle || !searchBox || !searchInput || !searchResultsList) {
        console.error("Um ou mais elementos de pesquisa não foram encontrados.");
        return;
    }

    // Toggle abre/fecha caixa de pesquisa
    searchToggle.addEventListener('click', (e) => {
        e.preventDefault();
        const header = document.getElementById('mainHeader') || document.querySelector('.top-header');
        const opening = !searchBox.classList.contains('is-active');
        searchBox.classList.toggle('is-active');
        if (opening) {
            if (header) header.classList.add('search-open');
            searchInput.focus();
        } else {
            if (header) header.classList.remove('search-open');
            limparPesquisa();
        }
    });

    let searchAnalyticsTimer = 0;

    // Busca em tempo real
    searchInput.addEventListener('input', (e) => {
        const rawTerm = e.target.value.trim();
        const termoBusca = e.target.value.toLowerCase()
            .normalize("NFD") // Normaliza a string para decompor os caracteres
            .replace(/[\u0300-\u036f]/g, ""); // Remove os diacríticos (acentos)

        const termoBuscaNoSpaces = termoBusca.replace(/\s+/g, '')
        searchResultsList.innerHTML = '';

        if (termoBusca.length > 1) {
            const produtosFiltrados = produtos.filter(produto => {
                const displayProduct = getLocalizedProduct(produto);
                // Normaliza e remove acentos dos nomes e categorias dos produtos
                const nomeNormalizado = [produto.nome, displayProduct.displayNome].join(' ').toLowerCase()
                    .normalize("NFD")
                    .replace(/[\u0300-\u036f]/g, "");
                const nomeSemEspacos = nomeNormalizado.replace(/\s+/g, '');
                const categoriaNormalizada = [normalizeCategoria(produto.categoria), displayProduct.displayCategoria].join(' ').toLowerCase()
                    .normalize("NFD")
                    .replace(/[\u0300-\u036f]/g, "");
                const categoriaSemEspacos = categoriaNormalizada.replace(/\s+/g, '');

                const matchesNome = nomeNormalizado.includes(termoBusca) || nomeSemEspacos.includes(termoBuscaNoSpaces);
                const matchesCategoria = categoriaNormalizada.includes(termoBusca) || categoriaSemEspacos.includes(termoBuscaNoSpaces);
                return matchesNome || matchesCategoria
            });

            if (produtosFiltrados.length > 0) {
                produtosFiltrados.forEach(produto => {
                    const displayProduct = getLocalizedProduct(produto);
                    const item = document.createElement('a');
                    item.href = `/produto?id=${encodeURIComponent(produto.id)}`;
                    item.classList.add('search-result-item');
                    item.innerHTML = `
                        ${optimizedImageMarkup(produto.imagem, displayProduct.displayNome)}
                        <span>${escapeHtml(displayProduct.displayNome)} <small>(${escapeHtml(displayProduct.displayCategoria)})</small></span>
                    `;
                    searchResultsList.appendChild(item);
                });
                searchBox.classList.add('has-results');
            } else {
                searchBox.classList.remove('has-results');
                searchResultsList.innerHTML = '<p class="no-results-msg">Nenhum resultado encontrado.</p>';
            }

            window.clearTimeout(searchAnalyticsTimer);
            searchAnalyticsTimer = window.setTimeout(() => {
                trackStikEvent('search_performed', {
                    query: rawTerm,
                    normalizedQuery: termoBusca,
                    resultsCount: produtosFiltrados.length
                }, { purpose: 'marketing' });
            }, 700);
        } else {
            window.clearTimeout(searchAnalyticsTimer);
            searchResultsList.innerHTML = '';
            searchBox.classList.remove('has-results');
        }
    });

    // Fecha a pesquisa ao clicar fora
    document.addEventListener('click', (e) => {
        if (!searchBox.contains(e.target) && !searchToggle.contains(e.target)) {
            const header = document.getElementById('mainHeader') || document.querySelector('.top-header');
            searchBox.classList.remove('is-active');
            if (header) header.classList.remove('search-open');
            limparPesquisa();
        }
    });

    function limparPesquisa() {
        searchResultsList.innerHTML = '';
        searchInput.value = '';
        searchBox.classList.remove('has-results');
        const header = document.getElementById('mainHeader') || document.querySelector('.top-header');
        if (header) header.classList.remove('search-open');
    }
    (function setupSearchKeyboardNavigation() {
  const searchBox = document.querySelector('.search-box');
  if (!searchBox) return;

  const input = searchBox.querySelector('input');
  const dropdown = searchBox.querySelector('.search-results-dropdown');

  let currentIndex = -1;

  function items() {
    return dropdown ? Array.from(dropdown.querySelectorAll('.search-result-item')) : [];
  }

  function clearSelection() {
    const it = items();
    it.forEach(el => el.classList.remove('keyboard-selected'));
    currentIndex = -1;
  }

  function updateSelection(idx) {
    const it = items();
    if (it.length === 0) return;
    if (idx < 0) idx = 0;
    if (idx >= it.length) idx = it.length - 1;
    // remove previous
    it.forEach(el => el.classList.remove('keyboard-selected'));
    const sel = it[idx];
    if (!sel) return;
    sel.classList.add('keyboard-selected');
    currentIndex = idx;
    // garantir que o item esteja visível no dropdown
    sel.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }

  function activateSelected() {
    const it = items();
    if (currentIndex >= 0 && it[currentIndex]) {
      // simula clique (abre link / seleciona)
      it[currentIndex].click();
      return true;
    }
    return false;
  }

  // Observa alterações na classe .is-active para focar o input ao abrir
  const mo = new MutationObserver(mutations => {
    for (const m of mutations) {
      if (m.attributeName === 'class') {
        const isActive = searchBox.classList.contains('is-active');
        if (isActive && input) {
          // aguarda micro-tick para garantir que o input esteja visível
          setTimeout(() => input.focus({preventScroll: true}), 50);
        } else {
          clearSelection();
        }
      }
    }
  });
  mo.observe(searchBox, { attributes: true, attributeFilter: ['class'] });

  // Reset quando conteúdo do dropdown mudar (novos resultados)
  if (dropdown) {
    const ro = new MutationObserver(() => {
      clearSelection();
    });
    ro.observe(dropdown, { childList: true, subtree: true, characterData: true });
  }

  // Key handlers no input
  if (input) {
    input.addEventListener('keydown', (e) => {
      const it = items();
      if (!it || it.length === 0) {
        if (e.key === 'Enter') return; // permitir comportamento padrão (submit/pesquisa)
        return;
      }

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        // se nada selecionado, seleciona o primeiro
        if (currentIndex < 0) updateSelection(0);
        else updateSelection(Math.min(currentIndex + 1, it.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (currentIndex < 0) updateSelection(it.length - 1);
        else updateSelection(Math.max(currentIndex - 1, 0));
      } else if (e.key === 'Enter') {
        // Se há um item selecionado via teclado, ativa-o. Caso contrário, permite o comportamento normal.
        if (currentIndex >= 0) {
          e.preventDefault();
          activateSelected();
        }
      } else if (e.key === 'Escape') {
        // fecha a search-box se existir lógica (remoção de classe)
        searchBox.classList.remove('is-active');
        clearSelection();
        input.blur();
      }
    });
  }

  // Permite usar também as setas quando o foco estiver no dropdown (opcional)
  if (dropdown) {
    dropdown.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter') {
        // encaminha para o input handler (mantém a mesma lógica)
        input.dispatchEvent(new KeyboardEvent('keydown', e));
      }
    });
    // garantir que cliques com mouse resetem a seleção do teclado
    dropdown.addEventListener('mousedown', () => clearSelection());
  }
})();

}

// Função para suavizar a rolagem na parte "Catálogo" no mobile e desktop
function setupDraggableCarousel(carouselElement) {
    if (!carouselElement) return;
    if (carouselElement.dataset.dragReady === 'true') return;
    carouselElement.dataset.dragReady = 'true';

    let isDown = false;
    let startX;
    let scrollLeft;
    let velocity = 0;
    let lastPointerX = 0;
    let lastPointerTime = 0;
    let inertiaFrame = null;
    const useNativeTouchScroll = getPerformanceProfile().touchCapable;
    const INERTIA_DECAY = 0.972;
    const INERTIA_START_VELOCITY = 0.015;
    const INERTIA_STOP_VELOCITY = 0.003;
    const INERTIA_MAX_DELTA_TIME = 32;

    const stopInertia = () => {
        if (inertiaFrame !== null) {
            cancelAnimationFrame(inertiaFrame);
            inertiaFrame = null;
        }
    };
    
    const startDrag = (e) => {
        stopInertia();
        isDown = true;
        carouselElement.classList.add('active');
        // usa touches quando disponível
        startX = (e.pageX !== undefined) ? e.pageX : (e.touches && e.touches[0] && e.touches[0].pageX);
        scrollLeft = carouselElement.scrollLeft;
        lastPointerX = startX;
        lastPointerTime = performance.now();
        velocity = 0;
    };

    const endDrag = () => {
        if (!isDown) return;
        isDown = false;
        carouselElement.classList.remove('active');

        if (Math.abs(velocity) < INERTIA_START_VELOCITY) return;

        let inertiaLastTime = performance.now();
        const animateInertia = (now) => {
            const deltaTime = Math.min(Math.max(now - inertiaLastTime, 1), INERTIA_MAX_DELTA_TIME);
            inertiaLastTime = now;

            carouselElement.scrollLeft += velocity * deltaTime;
            velocity *= Math.pow(INERTIA_DECAY, deltaTime / 16.67);

            if (Math.abs(velocity) < INERTIA_STOP_VELOCITY) {
                stopInertia();
                return;
            }

            inertiaFrame = requestAnimationFrame(animateInertia);
        };

        inertiaFrame = requestAnimationFrame(animateInertia);
    };

    const drag = (e) => {
        if (!isDown) return;
        // NÃO chama preventDefault() — permite o comportamento nativo/momentum no touch
        const x = (e.pageX !== undefined) ? e.pageX : (e.touches && e.touches[0] && e.touches[0].pageX);
        if (typeof x !== 'number') return;
        const walk = x - startX;
        carouselElement.scrollLeft = scrollLeft - walk;
        const now = performance.now();
        const deltaX = x - lastPointerX;
        const deltaTime = Math.max(now - lastPointerTime, 1);
        const nextVelocity = -deltaX / deltaTime;
        velocity = velocity * 0.75 + nextVelocity * 0.25;
        lastPointerX = x;
        lastPointerTime = now;
    };
    
    // mouse (desktop) — mantém drag por mouse
    carouselElement.addEventListener('mousedown', startDrag);
    carouselElement.addEventListener('mouseleave', endDrag);
    carouselElement.addEventListener('mouseup', endDrag);
    carouselElement.addEventListener('mousemove', drag);
    
    // No touch, o scroll nativo do browser é mais leve e mantém momentum.
    if (!useNativeTouchScroll) {
        carouselElement.addEventListener('touchstart', startDrag, { passive: true });
        carouselElement.addEventListener('touchend', endDrag, { passive: true });
        carouselElement.addEventListener('touchcancel', endDrag, { passive: true });
        carouselElement.addEventListener('touchmove', drag, { passive: true });
    }
}

function setupInfiniteCatalogCarousel(carouselElement) {
    if (!carouselElement || carouselElement.dataset.infiniteReady === 'true') return;

    const originalCards = Array.from(carouselElement.children);
    if (originalCards.length === 0) return;
    carouselElement.dataset.infiniteReady = 'true';

    if (originalCards.length === 1) {
        setupDraggableCarousel(carouselElement);
        return;
    }

    if (shouldUseLimitedCatalogCarousel()) {
        carouselElement.classList.add('catalogo-grid--native');
        if (hasFineHover()) {
            setupDraggableCarousel(carouselElement);
        }
        return;
    }

    carouselElement.classList.add('catalogo-grid--infinite');

    const createClone = (card) => {
        const clone = card.cloneNode(true);
        clone.dataset.clone = 'true';
        clone.setAttribute('aria-hidden', 'true');
        clone.tabIndex = -1;
        return clone;
    };

    const beforeClones = originalCards.map(createClone);
    const afterClones = originalCards.map(createClone);
    carouselElement.replaceChildren(...beforeClones, ...originalCards, ...afterClones);

    let segmentWidth = 0;
    let isAdjusting = false;
    let isMouseDown = false;
    let startX = 0;
    let startScrollLeft = 0;
    let didDrag = false;
    let velocity = 0;
    let lastPointerX = 0;
    let lastPointerTime = 0;
    let inertiaFrame = null;
    let inertiaLastTime = 0;
    let rebalanceFrame = null;
    const INERTIA_DECAY = 0.972;
    const INERTIA_START_VELOCITY = 0.015;
    const INERTIA_STOP_VELOCITY = 0.003;
    const INERTIA_MAX_DELTA_TIME = 32;

    const updateSegmentWidth = () => {
        segmentWidth = carouselElement.scrollWidth / 3;
    };

    const stopInertia = () => {
        if (inertiaFrame !== null) {
            cancelAnimationFrame(inertiaFrame);
            inertiaFrame = null;
        }
    };

    const jumpToMiddle = (preserveOffset = 0) => {
        updateSegmentWidth();
        if (!segmentWidth) return;
        carouselElement.scrollLeft = segmentWidth + preserveOffset;
    };

    jumpToMiddle();

    const rebalanceScroll = () => {
        if (!segmentWidth || isAdjusting) return;

        if (carouselElement.scrollLeft < segmentWidth * 0.5) {
            isAdjusting = true;
            carouselElement.scrollLeft += segmentWidth;
            isAdjusting = false;
        } else if (carouselElement.scrollLeft > segmentWidth * 1.5) {
            isAdjusting = true;
            carouselElement.scrollLeft -= segmentWidth;
            isAdjusting = false;
        }
    };

    const startMouseDrag = (pageX) => {
        stopInertia();
        isMouseDown = true;
        didDrag = false;
        startX = pageX;
        startScrollLeft = carouselElement.scrollLeft;
        lastPointerX = pageX;
        lastPointerTime = performance.now();
        velocity = 0;
        carouselElement.classList.add('active');
        window.addEventListener('mousemove', onWindowMouseMove, { passive: true });
        window.addEventListener('mouseup', onWindowMouseUp, { once: true });
    };

    const moveMouseDrag = (pageX) => {
        if (!isMouseDown) return;
        const now = performance.now();
        const walk = pageX - startX;
        if (Math.abs(walk) > 6) didDrag = true;
        carouselElement.scrollLeft = startScrollLeft - walk;

        const deltaX = pageX - lastPointerX;
        const deltaTime = Math.max(now - lastPointerTime, 1);
        const nextVelocity = -deltaX / deltaTime;
        velocity = velocity * 0.75 + nextVelocity * 0.25;
        lastPointerX = pageX;
        lastPointerTime = now;
    };

    const endMouseDrag = () => {
        if (!isMouseDown) return;
        isMouseDown = false;
        carouselElement.classList.remove('active');
        window.removeEventListener('mousemove', onWindowMouseMove);

        if (Math.abs(velocity) < INERTIA_START_VELOCITY) return;

        inertiaLastTime = performance.now();
        const animateInertia = (now) => {
            const deltaTime = Math.min(Math.max(now - inertiaLastTime, 1), INERTIA_MAX_DELTA_TIME);
            inertiaLastTime = now;

            carouselElement.scrollLeft += velocity * deltaTime;
            velocity *= Math.pow(INERTIA_DECAY, deltaTime / 16.67);

            if (Math.abs(velocity) < INERTIA_STOP_VELOCITY) {
                stopInertia();
                return;
            }

            inertiaFrame = requestAnimationFrame(animateInertia);
        };

        inertiaFrame = requestAnimationFrame(animateInertia);
    };

    const requestRebalanceScroll = () => {
        if (rebalanceFrame !== null) return;
        rebalanceFrame = requestAnimationFrame(() => {
            rebalanceFrame = null;
            rebalanceScroll();
        });
    };

    const onWindowMouseMove = (event) => {
        moveMouseDrag(event.pageX);
    };

    const onWindowMouseUp = () => {
        endMouseDrag();
    };

    carouselElement.addEventListener('scroll', requestRebalanceScroll, { passive: true });

    carouselElement.addEventListener('wheel', (event) => {
        const hasNativeHorizontal = Math.abs(event.deltaX) > 0;
        const hasShiftWheel = event.shiftKey && Math.abs(event.deltaY) > 0;
        if (!hasNativeHorizontal && !hasShiftWheel) return;

        const horizontalDelta = hasNativeHorizontal ? event.deltaX : event.deltaY;
        event.preventDefault();
        carouselElement.scrollLeft += horizontalDelta;
    }, { passive: false });

    carouselElement.addEventListener('mousedown', (event) => {
        if (event.button !== 0) return;
        startMouseDrag(event.pageX);
    });
    carouselElement.addEventListener('dragstart', (event) => event.preventDefault());

    carouselElement.addEventListener('click', (event) => {
        if (!didDrag) return;
        event.preventDefault();
        event.stopPropagation();
        didDrag = false;
    }, true);

    let resizeFrame = null;
    window.addEventListener('resize', () => {
        if (resizeFrame !== null) cancelAnimationFrame(resizeFrame);
        resizeFrame = requestAnimationFrame(() => {
            resizeFrame = null;
            stopInertia();
            const previousSegmentWidth = segmentWidth;
            updateSegmentWidth();
            if (!previousSegmentWidth || !segmentWidth) return;
            const offsetFromMiddle = carouselElement.scrollLeft - previousSegmentWidth;
            carouselElement.scrollLeft = segmentWidth + offsetFromMiddle;
        });
    }, { passive: true });
}

function getNewsletterCarouselOriginalImages(trackElement) {
    const directImages = Array.from(trackElement.children).filter((image) => image.matches?.('img'));
    if (directImages.length) return directImages;

    const firstSegment = trackElement.querySelector('.newsletter-carousel-segment');
    return firstSegment ? Array.from(firstSegment.querySelectorAll('img:not([data-clone])')) : [];
}

function waitForNewsletterCarouselImages(images, timeoutMs = 2500) {
    const pending = images.filter(image => image && (!image.complete || !image.naturalWidth));
    if (!pending.length) return Promise.resolve();

    return new Promise(resolve => {
        let remaining = pending.length;
        const finishOne = () => {
            remaining -= 1;
            if (remaining <= 0) resolve();
        };
        const timer = window.setTimeout(resolve, timeoutMs);
        pending.forEach(image => {
            const done = () => {
                image.removeEventListener('load', done);
                image.removeEventListener('error', done);
                finishOne();
            };
            image.addEventListener('load', done, { once: true });
            image.addEventListener('error', done, { once: true });
        });
        Promise.allSettled(pending.map(image => image.decode ? image.decode() : Promise.resolve()))
            .then(() => {
                window.clearTimeout(timer);
                resolve();
            });
    });
}

function setupInfiniteNewsletterCarousel(trackElement, options = {}) {
    if (!trackElement) return;
    if (trackElement.dataset.infiniteReady === 'true' && !options.force) return;

    if (typeof trackElement.__stikNewsletterCarouselCleanup === 'function') {
        trackElement.__stikNewsletterCarouselCleanup();
    }

    const setupId = (Number(trackElement.__stikNewsletterCarouselSetupId) || 0) + 1;
    trackElement.__stikNewsletterCarouselSetupId = setupId;
    trackElement.dataset.infiniteReady = 'false';

    const originalImages = getNewsletterCarouselOriginalImages(trackElement);
    if (options.refreshMarkup || !trackElement.dataset.originalMarkup) {
        if (originalImages.length === 0) return;
        trackElement.dataset.originalMarkup = originalImages.map((image) => image.outerHTML).join('');
    }

    const lightMotion = shouldUseLightMotion();
    const SPEED_PX_PER_SECOND = lightMotion ? 18 : 26;
    const FRAME_INTERVAL = lightMotion ? 1000 / 45 : 0;
    let offset = 0;
    let segmentWidth = 0;
    let frameId = null;
    let lastTimestamp = 0;
    let isRunning = false;
    let isInViewport = !('IntersectionObserver' in window);
    let observer = null;
    let resizeTimer = null;

    const stopAnimation = () => {
        if (frameId !== null) {
            cancelAnimationFrame(frameId);
            frameId = null;
        }
    };

    const createSegment = (isClone = false) => {
        const segment = document.createElement('div');
        segment.className = 'newsletter-carousel-segment';
        segment.innerHTML = trackElement.dataset.originalMarkup;

        if (isClone) {
            segment.setAttribute('aria-hidden', 'true');
            segment.querySelectorAll('img').forEach((image) => {
                image.dataset.clone = 'true';
                image.setAttribute('aria-hidden', 'true');
            });
        }

        return segment;
    };

    const buildTrack = () => {
        isRunning = false;
        stopAnimation();
        trackElement.replaceChildren();

        const firstSegment = createSegment(false);
        trackElement.appendChild(firstSegment);
        segmentWidth = firstSegment.scrollWidth;

        const viewportWidth = trackElement.parentElement ? trackElement.parentElement.clientWidth : window.innerWidth;
        const viewportMultiplier = lightMotion ? 1.25 : 2;
        const minSegments = lightMotion ? 2 : 3;
        const segmentCount = Math.max(minSegments, Math.ceil((viewportWidth * viewportMultiplier) / Math.max(segmentWidth, 1)) + 1);

        for (let index = 1; index < segmentCount; index++) {
            trackElement.appendChild(createSegment(true));
        }

        offset = 0;
        trackElement.style.transform = 'translate3d(0, 0, 0)';
    };

    const shouldRunAnimation = () => isInViewport && !document.hidden;

    const animate = (timestamp) => {
        frameId = null;
        if (!isRunning || !shouldRunAnimation()) {
            isRunning = false;
            return;
        }

        if (!lastTimestamp) {
            lastTimestamp = timestamp;
        }

        const elapsed = timestamp - lastTimestamp;
        if (FRAME_INTERVAL && elapsed < FRAME_INTERVAL) {
            frameId = requestAnimationFrame(animate);
            return;
        }

        const deltaSeconds = Math.min(elapsed / 1000, 0.08);
        lastTimestamp = timestamp;
        offset -= SPEED_PX_PER_SECOND * deltaSeconds;

        if (segmentWidth > 0 && Math.abs(offset) >= segmentWidth) {
            offset += segmentWidth;
        }

        trackElement.style.transform = `translate3d(${offset}px, 0, 0)`;
        frameId = requestAnimationFrame(animate);
    };

    const playAnimation = () => {
        if (!shouldRunAnimation() || isRunning) return;
        isRunning = true;
        lastTimestamp = 0;
        if (frameId === null) {
            frameId = requestAnimationFrame(animate);
        }
    };

    const pauseAnimation = () => {
        isRunning = false;
        stopAnimation();
    };

    const handleResize = () => {
        if (resizeTimer) {
            clearTimeout(resizeTimer);
        }

        resizeTimer = setTimeout(() => {
            lastTimestamp = 0;
            buildTrack();
            playAnimation();
        }, 120);
    };

    const handleVisibilityChange = () => {
        if (document.hidden) {
            pauseAnimation();
        } else {
            playAnimation();
        }
    };

    trackElement.__stikNewsletterCarouselCleanup = () => {
        pauseAnimation();
        if (resizeTimer) {
            clearTimeout(resizeTimer);
            resizeTimer = null;
        }
        window.removeEventListener('resize', handleResize);
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        if (observer) {
            observer.disconnect();
            observer = null;
        }
        trackElement.dataset.infiniteReady = 'false';
    };

    waitForNewsletterCarouselImages(originalImages).then(() => {
        if (trackElement.__stikNewsletterCarouselSetupId !== setupId) return;
        if (!trackElement.isConnected) return;
        buildTrack();

        window.addEventListener('resize', handleResize, { passive: true });

        if ('IntersectionObserver' in window) {
            const section = trackElement.closest('.newsletter-section') || trackElement;
            observer = new IntersectionObserver((entries) => {
                isInViewport = entries.some((entry) => entry.isIntersecting);
                if (isInViewport) {
                    playAnimation();
                } else {
                    pauseAnimation();
                }
            }, { rootMargin: '160px 0px' });
            observer.observe(section);
        } else {
            playAnimation();
        }

        document.addEventListener('visibilitychange', handleVisibilityChange);
        trackElement.dataset.infiniteReady = 'true';
    });
}

function initNewsletterCarouselEffects(options = {}) {
    const carousel = document.querySelector('.newsletter-section .carousel-bg .carousel-track');
    if (!carousel) return;

    setupInfiniteNewsletterCarousel(carousel, options);
}

// Função que inicia o carrosel infinito na área da Newsletter
function initBannerCarousel() {
    const bannerImages = [
        { src: "./img/banner/banner-site-8_Prancheta-1-scaled (1).jpg", alt: 'Elásticos para a sua confecção de moda fitness' },
        { src: "./img/banner/banner-site-10_Prancheta-1-scaled.jpg", alt: 'Renda-se aos nossos encantos!' },
        { src: "./img/banner/banner-site-11_Prancheta-1-scaled.jpg", alt: 'Catálogo Virtual' },
    ];
    
    const mainBannerTrack = document.getElementById('mainBannerTrack');
    const bannerPrevBtn = document.getElementById('bannerPrevBtn');
    const bannerNextBtn = document.getElementById('bannerNextBtn');

    if (!mainBannerTrack) return;

    bannerImages.forEach(img => {
        const item = document.createElement('div');
        item.classList.add('carousel-item');
        item.innerHTML = optimizedImageMarkup(img.src, img.alt);
        mainBannerTrack.appendChild(item);
    });

    let currentIndex = 0;
    const totalItems = bannerImages.length;
    
    function moveToSlide(index) {
        if (index < 0) {
            index = totalItems - 1;
        } else if (index >= totalItems) {
            index = 0;
        }
        mainBannerTrack.style.transform = `translateX(-${index * 100}%)`;
        currentIndex = index;
    }

    if (bannerNextBtn) {
        bannerNextBtn.addEventListener('click', () => moveToSlide(currentIndex + 1));
    }
    if (bannerPrevBtn) {
        bannerPrevBtn.addEventListener('click', () => moveToSlide(currentIndex - 1));
    }
    
    setInterval(() => {
        moveToSlide(currentIndex + 1);
    }, 5000);
    
    setupDraggableCarousel(mainBannerTrack);
}

// Função que faz com que os cards tenham mini animações ao passar o mouse
function initMicroInteractions() {
    const canUsePointerEffects = hasFineHover() && !shouldUseLightMotion();

    // staggered reveal for highlight items on scroll (small delay between them)
    const highlights = Array.from(document.querySelectorAll('.highlight-item'));
    if (highlights.length) {
        highlights.forEach((item) => item.classList.add('staggered'));

        if ('IntersectionObserver' in window) {
            const io = new IntersectionObserver((entries, obs) => {
                entries.forEach(entry => {
                    if (!entry.isIntersecting) return;
                    const index = highlights.indexOf(entry.target);
                    setTimeout(() => entry.target.classList.add('in'), Math.max(index, 0) * 85);
                    obs.unobserve(entry.target);
                });
            }, { threshold: 0.18 });

            highlights.forEach(item => io.observe(item));
        } else {
            highlights.forEach(item => item.classList.add('in'));
        }
    }

    if (!canUsePointerEffects) {
        initNewsletterCarouselEffects();
        return;
    }

    // parallax on hero (based on mouse move) - subtle
    const hero = document.querySelector('.video-hero-section');
    if (hero && hero.dataset.parallaxReady !== 'true') {
        hero.dataset.parallaxReady = 'true';
        hero.classList.add('video-hero-inner');
        const layers = Array.from(hero.querySelectorAll('img, video'));
        let frameId = null;
        let lastEvent = null;

        hero.addEventListener('mousemove', (e) => {
            lastEvent = e;
            if (frameId !== null) return;

            frameId = requestAnimationFrame(() => {
                frameId = null;
                if (!lastEvent) return;

                const rect = hero.getBoundingClientRect();
                const px = (lastEvent.clientX - rect.left) / rect.width - 0.5;
                const py = (lastEvent.clientY - rect.top) / rect.height - 0.5;

                layers.forEach(el => {
                    const depth = 8;
                    const tx = px * depth;
                    const ty = py * depth;
                    el.style.transform = `translate3d(${tx}px, ${ty}px, 0) scale(1.015)`;
                });
            });
        });

        hero.addEventListener('mouseleave', () => {
            lastEvent = null;
            layers.forEach(el => el.style.transform = 'translate3d(0,0,0) scale(1)');
        });
    }

    // subtle tilt on produto cards
    const produtoCards = Array.from(document.querySelectorAll('.produto-card, .article-card'))
        .filter(card => !card.closest('.catalogo-grid'));
    produtoCards.forEach(card => {
        if (card.dataset.tiltReady === 'true') return;
        card.dataset.tiltReady = 'true';
        let frameId = null;
        let lastEvent = null;

        card.addEventListener('mousemove', (e) => {
            lastEvent = e;
            if (frameId !== null) return;

            frameId = requestAnimationFrame(() => {
                frameId = null;
                if (!lastEvent) return;

                const rect = card.getBoundingClientRect();
                const cx = rect.left + rect.width / 2;
                const cy = rect.top + rect.height / 2;
                const dx = (lastEvent.clientX - cx) / rect.width;
                const dy = (lastEvent.clientY - cy) / rect.height;
                const rotX = (dy * 5).toFixed(2);
                const rotY = (-dx * 5).toFixed(2);
                card.style.transform = `perspective(900px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateZ(6px)`;
            });
        });

        card.addEventListener('mouseleave', () => {
            lastEvent = null;
            card.style.transform = '';
        });
    });

    initNewsletterCarouselEffects();
}

// Função que direciona para a tela de criação de artigos do blog.
function createNewArticle() {
    window.location.href = '/create-article';
}

const BLOG_SCREEN_ARTICLES = [
    {
        id: 101,
        slug: 'tendencia-loungewear-elasticos-indicados',
        titulo: 'Tendência loungewear e elásticos indicados',
        resumo: 'Do sofá para as ruas, explore a tendência loungewear e confira dicas valiosas para acertar nas suas coleções.',
        imagem: 'img - Copia/thumb-blog-17-1.jpg',
        data: '29 maio, 2026',
        autor: 'Equipe Stik',
        leitura: '7 min',
        tags: ['Dicas', 'Produtos', 'Tendências'],
        destaque: true,
        blocos: [
            { tipo: 'lead', html: 'Do sofá para as ruas, explore a tendência loungewear e confira algumas dicas valiosas para acertar nas suas coleções!' },
            { tipo: 'paragrafo', html: 'Por muito tempo, a tendência loungewear ficou restrita ao conforto íntimo da vida doméstica. No entanto, esse cenário mudou nos últimos anos.' },
            { tipo: 'paragrafo', html: 'Com um foco renovado no conforto, no bem-estar e na versatilidade, o <a href="/blog">loungewear</a> evoluiu para abraçar a moda casual, tornando-se um pilar fundamental no guarda-roupa moderno.' },
            { tipo: 'titulo', nivel: 2, texto: 'A ascensão da tendência loungewear' },
            { tipo: 'imagem', src: 'img - Copia/thumb-blog-09-1024x683.jpg', alt: 'Referência de moda confortável', legenda: 'Ref: Envato' },
            { tipo: 'paragrafo', html: 'A crescente adoção do <a href="/blog">trabalho remoto</a> e a valorização do bem-estar têm redefinido o que as pessoas buscam em suas vestimentas diárias.' },
            { tipo: 'titulo', nivel: 2, texto: 'Tendências atuais em loungewear' },
            { tipo: 'imagem', src: 'img - Copia/thumb-blog-19.jpg', alt: 'Paleta de tons suaves para moda íntima', legenda: 'Ref: Envato' },
            { tipo: 'titulo', nivel: 3, texto: 'Estilos híbridos e adaptação ao home office' },
            { tipo: 'paragrafo', html: 'Com o aumento do trabalho remoto, essa tendência responde à necessidade de peças apropriadas para videoconferências, mas confortáveis o suficiente para relaxar em casa.' },
            { tipo: 'titulo', nivel: 3, texto: 'Tecidos sustentáveis e confortáveis' },
            { tipo: 'paragrafo', html: 'Materiais sustentáveis estão cada vez mais em voga. Além de oferecer conforto, reforçam práticas de moda consciente e valorizam a percepção da coleção.' },
            { tipo: 'titulo', nivel: 3, texto: 'Detalhes e acabamentos' },
            { tipo: 'paragrafo', html: 'Acabamentos de alta qualidade, botões decorativos e <a href="/produto?id=1">elásticos</a> estilizados melhoram a aparência das peças e elevam a experiência geral de uso.' },
            { tipo: 'titulo', nivel: 2, texto: 'A importância do conforto' },
            { tipo: 'imagem', src: 'img - Copia/thumb-blog-20-01-1024x480.jpg', alt: 'Peça confortável com acabamento macio', legenda: 'Ref: Envato' },
            { tipo: 'paragrafo', html: 'A escolha do elástico é decisiva para garantir conforto e estética. Elásticos bem escolhidos ajudam no caimento e mantêm a forma da peça após uso e lavagens frequentes.' },
            { tipo: 'titulo', nivel: 2, texto: 'Tipos de elásticos recomendados' },
            { tipo: 'lista', itens: ['Elásticos embutidos para cós, shorts e saias.', 'Bases macias para peças de contato direto com a pele.', 'Elásticos com boa recuperação para coleções de uso prolongado.'] }
        ]
    },
    {
        id: 102,
        slug: 'melhores-aviamentos-roupas-esportivas',
        titulo: 'Os melhores aviamentos para roupas esportivas',
        resumo: 'Funcionalidade, resistência e conforto para coleções fitness de alta performance.',
        imagem: 'img/tumb-blog-01.jpg',
        data: '12 junho, 2026',
        autor: 'Equipe Stik',
        leitura: '5 min',
        tags: ['Produtos'],
        destaque: true
    },
    {
        id: 103,
        slug: 'analise-coloracao-pessoal',
        titulo: 'Análise de coloração pessoal: o que é e como funciona',
        resumo: 'Como as cartelas de cor influenciam moda, produto e comunicação visual.',
        imagem: 'img - Copia/IMG_9257-Editar-1024x683.jpg',
        data: '06 junho, 2026',
        autor: 'Equipe Stik',
        leitura: '4 min',
        tags: ['Dicas', 'Moda']
    },
    {
        id: 104,
        slug: 'elasticos-de-bico-zanotti',
        titulo: 'Elásticos de bico Zanotti: adicione charme à sua coleção!',
        resumo: 'Acabamento delicado para peças com mais identidade e valor percebido.',
        imagem: 'img - Copia/thumb-blog-09-1024x683.jpg',
        data: '21 maio, 2026',
        autor: 'Equipe Stik',
        leitura: '3 min',
        tags: ['Produtos']
    },
    {
        id: 105,
        slug: 'moda-nos-anos-70',
        titulo: 'Moda nos anos 70',
        resumo: 'Referências de cor, forma e expressão para coleções contemporâneas.',
        imagem: 'img - Copia/thumb-blog-03-300x200.jpg',
        data: '18 abril, 2026',
        autor: 'Equipe Stik',
        leitura: '6 min',
        tags: ['Estilo', 'Moda', 'Tendências']
    },
    {
        id: 106,
        slug: 'glossario-de-moda',
        titulo: 'Glossário de moda: termos mais usados e seus significados',
        resumo: 'Vocabulário essencial para criação, comunicação e desenvolvimento de produto.',
        imagem: 'img - Copia/thumb-blog-14-300x200.jpg',
        data: '09 abril, 2026',
        autor: 'Equipe Stik',
        leitura: '8 min',
        tags: ['Dicas', 'Moda', 'Tendências']
    },
    {
        id: 107,
        slug: 'gola-em-destaque',
        titulo: 'Gola em destaque: tendência inverno 2027',
        resumo: 'Volumes, textura e acabamento ganham força nas coleções de inverno.',
        imagem: 'img - Copia/thumb-blog-19.jpg',
        data: '02 abril, 2026',
        autor: 'Equipe Stik',
        leitura: '5 min',
        tags: ['Moda', 'Tendências']
    },
    {
        id: 108,
        slug: 'footballcore-tendencia-moda',
        titulo: 'Footballcore: o futebol como tendência de moda',
        resumo: 'Uma leitura esportiva e urbana para cores, elásticos e acabamentos.',
        imagem: 'img - Copia/tumb-blog-01.jpg',
        data: '25 março, 2026',
        autor: 'Equipe Stik',
        leitura: '4 min',
        tags: ['Dicas', 'Tendências']
    },
    {
        id: 109,
        slug: 'brownie-nova-cor-cartela',
        titulo: 'Brownie: conheça a nova cor na cartela da Stik',
        resumo: 'Uma tonalidade elegante para bases, alças, rendas e detalhes.',
        imagem: 'img - Copia/thumb-blog-20-01-1024x480.jpg',
        data: '16 março, 2026',
        autor: 'Equipe Stik',
        leitura: '4 min',
        tags: ['Lançamentos']
    },
    {
        id: 110,
        slug: 'maximalismo-moda-intima',
        titulo: 'Maximalismo: das passarelas à moda íntima!',
        resumo: 'Como excesso controlado, textura e cor entram no desenvolvimento de peças.',
        imagem: 'img - Copia/thumb-blog-11-300x200.jpg',
        data: '03 março, 2026',
        autor: 'Equipe Stik',
        leitura: '6 min',
        tags: ['Lançamentos']
    },
    {
        id: 111,
        slug: 'ampliar-vendas-foco-cliente',
        titulo: 'Quer ampliar suas vendas? Confira estratégias com foco no cliente',
        resumo: 'Caminhos para conectar produto, atendimento e coleção de forma consistente.',
        imagem: 'img - Copia/thumb-blog-10-300x200.jpg',
        data: '20 fevereiro, 2026',
        autor: 'Equipe Stik',
        leitura: '5 min',
        tags: ['Lançamentos', 'Negócios']
    },
    {
        id: 112,
        slug: 'tendencias-fitness-inverno',
        titulo: '3 tendências fitness confirmadas para o Inverno 2027',
        resumo: 'Cores, modelagens e aviamentos que fortalecem o visual esportivo.',
        imagem: 'img - Copia/thumb-blog-17-1.jpg',
        data: '08 fevereiro, 2026',
        autor: 'Equipe Stik',
        leitura: '5 min',
        tags: ['Lançamentos', 'Produtos']
    }
];

const BLOG_SCREEN_CATEGORIES = [
    'Consumidor',
    'Dicas',
    'E-book Grátis',
    'Estilo',
    'Institucional',
    'Lançamentos',
    'Moda',
    'Negócios',
    'Notícia',
    'Produtos',
    'Tendências',
    'Tutoriais'
];

function escapeHtml(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function sanitizeArticleHtml(html) {
    const template = document.createElement('template');
    template.innerHTML = String(html || '');
    template.content.querySelectorAll('script, style, link, meta, base, noscript, iframe, object, embed, form, input, button, video, audio, canvas, svg').forEach(element => element.remove());

    template.content.querySelectorAll('*').forEach(element => {
        Array.from(element.attributes).forEach(attr => {
            const name = attr.name.toLowerCase();
            const value = attr.value.trim();

            if (name.startsWith('on') || name === 'srcdoc' || name === 'style' || ['srcset', 'ping', 'formaction', 'poster'].includes(name)) {
                element.removeAttribute(attr.name);
                return;
            }

            if (['href', 'action', 'xlink:href'].includes(name)) {
                const safeLink = normalizeStikLinkUrl(value, '');
                if (safeLink) element.setAttribute(attr.name, safeLink);
                else element.removeAttribute(attr.name);
                return;
            }

            if (name === 'src') {
                const safeAsset = normalizeStikAssetUrl(value, '');
                if (safeAsset) element.setAttribute(attr.name, safeAsset);
                else element.removeAttribute(attr.name);
            }
        });

        if (element.tagName === 'A') {
            const href = element.getAttribute('href') || '';
            if (element.getAttribute('target') === '_blank' || /^(https?:)?\/\//i.test(href)) {
                element.setAttribute('rel', 'noopener noreferrer');
            }
        }
    });

    return template.innerHTML;
}

function getBlogScreenArticles() {
    return BLOG_SCREEN_ARTICLES;
}

function normalizeBlogArticle(article) {
    if (!article) return null;

    return {
        id: article.id,
        slug: article.slug,
        titulo: article.titulo || article.title || 'Artigo sem título',
        resumo: article.resumo || article.summary || '',
        imagem: article.imagem || article.coverUrl || article.cover_url || 'img - Copia/thumb-blog-17-1.jpg',
        data: article.data || article.publishedAt || article.published_at || article.createdAt || article.created_at || '',
        autor: article.autor || article.author || 'Equipe Stik',
        leitura: article.leitura || `${article.readingTime || article.reading_time || 1} min`,
        tags: getBlogTags(article),
        destaque: article.destaque || false,
        blocos: article.blocos,
        contentHtml: article.contentHtml || article.content_html || article.conteudoCompleto || '',
        contentJson: article.contentJson || article.content_json || null,
        status: article.status || 'published',
        publicationStatus: article.publicationStatus || article.publication_status || '',
        translationStatus: article.translationStatus || article.translation_status || '',
        translationUpdatedAt: article.translationUpdatedAt || article.translation_updated_at || null,
        translationAttemptedAt: article.translationAttemptedAt || article.translation_attempted_at || null,
        translationFailedAt: article.translationFailedAt || article.translation_failed_at || null,
        translationSourceSignature: article.translationSourceSignature || article.translation_source_signature || '',
        translationLastError: article.translationLastError || article.translation_last_error || '',
        i18n: article.i18n && typeof article.i18n === 'object' ? article.i18n : {}
    };
}

function getLocalizedBlogArticle(article) {
    if (!article || stikCurrentLanguage === STIK_DEFAULT_LANGUAGE) return article;
    const i18n = article.i18n?.[stikCurrentLanguage] || {};
    const tags = getBlogTags(article);
    const translatedTags = tags.map((tag, index) => (
        i18n[`tag:${index}`] || translateStikDynamicText(tag)
    ));

    return {
        ...article,
        titulo: i18n.title || translateStikDynamicText(article.titulo) || article.titulo,
        resumo: i18n.summary || translateStikDynamicText(article.resumo) || article.resumo,
        tags: translatedTags,
        contentHtml: i18n.contentHtml || getStikDynamicTranslation(article.contentHtml, 'html') || article.contentHtml
    };
}

async function getBlogArticlesForScreen() {
    const savedArticles = window.blogApi
        ? await window.blogApi.listArticles().catch(() => [])
        : [];

    const normalizedSaved = (savedArticles || []).map(normalizeBlogArticle).filter(Boolean);
    const normalizedSeed = getBlogScreenArticles().map(normalizeBlogArticle).filter(Boolean);
    const savedIds = new Set(normalizedSaved.map(article => String(article.id)));
    const savedSlugs = new Set(normalizedSaved.map(article => article.slug).filter(Boolean));

    return [
        ...normalizedSaved,
        ...normalizedSeed.filter(article => !savedIds.has(String(article.id)) && !savedSlugs.has(article.slug))
    ];
}

function getBlogTags(article) {
    if (Array.isArray(article.tags)) return article.tags;
    if (typeof article.tags === 'string') {
        return article.tags.split(',').map(tag => tag.trim()).filter(Boolean);
    }
    return [];
}

function normalizeBlogSearch(value) {
    return String(value ?? '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim();
}

function formatBlogDate(value) {
    if (!value) return '';

    const rawDate = String(value).trim();
    const parsedDate = new Date(rawDate);

    if (!Number.isNaN(parsedDate.getTime())) {
        return new Intl.DateTimeFormat('pt-BR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
            timeZone: 'America/Sao_Paulo'
        }).format(parsedDate);
    }

    const writtenDate = rawDate.match(/^(\d{1,2})\s+([^,]+),?\s+(\d{4})$/);
    if (writtenDate) {
        const [, day, month, year] = writtenDate;
        return `${day.padStart(2, '0')} de ${month.trim()} de ${year}`;
    }

    return rawDate;
}

function renderBlogTags(tags) {
    return tags.map(tag => `<span class="blog-card-tag">${escapeHtml(tag)}</span>`).join('');
}

function renderBlogCard(article, options = {}) {
    if (!article) return '';
    const allowedCardClasses = new Set(['blog-mini-card', 'blog-category-card is-medium', 'blog-category-card is-tall', 'blog-result-card', 'blog-feature-card is-large', 'blog-feature-card']);
    const className = allowedCardClasses.has(options.className) ? options.className : 'blog-mini-card';
    const headingTag = /^h[2-4]$/i.test(options.headingTag || '') ? options.headingTag.toLowerCase() : 'h3';
    const loading = options.loading || 'lazy';
    const title = escapeHtml(article.titulo);
    const tags = renderBlogTags(getBlogTags(article));

    return `
        <a class="${escapeAttribute(className)}" href="/artigo?id=${encodeURIComponent(article.id)}">
            ${optimizedImageMarkup(article.imagem, article.titulo, { loading })}
            <div class="blog-card-content">
                <div class="blog-card-tags">${tags}</div>
                <${headingTag}>${title}</${headingTag}>
            </div>
        </a>
    `;
}

function renderBlogPagination(totalItems, currentPage, itemsPerPage) {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    if (totalPages <= 1) return '';

    const pages = new Set([1, totalPages]);
    for (let page = currentPage - 1; page <= currentPage + 1; page += 1) {
        if (page > 1 && page < totalPages) pages.add(page);
    }

    const orderedPages = Array.from(pages).sort((a, b) => a - b);
    const items = [];
    let previousPage = 0;

    orderedPages.forEach(page => {
        if (page - previousPage > 1) {
            items.push('<span class="blog-results-pagination-gap">...</span>');
        }

        items.push(`
            <button type="button" data-results-page="${page}" ${page === currentPage ? 'class="is-active" aria-current="page"' : ''}>
                ${page}
            </button>
        `);
        previousPage = page;
    });

    if (currentPage < totalPages) {
        items.push(`
            <button type="button" data-results-page="${currentPage + 1}" aria-label="Próxima página">
                »
            </button>
        `);
    }

    return `<nav class="blog-results-pagination" aria-label="Paginação dos resultados">${items.join('')}</nav>`;
}

function getExistingBlogCategories(articles) {
    const tagMap = new Map();

    articles.forEach(article => {
        getBlogTags(article).forEach(tag => {
            const normalizedTag = normalizeBlogSearch(tag);
            if (!normalizedTag || tagMap.has(normalizedTag)) return;
            tagMap.set(normalizedTag, tag);
        });
    });

    const preferredCategories = BLOG_SCREEN_CATEGORIES
        .map(category => {
            const normalizedCategory = normalizeBlogSearch(category);
            return tagMap.get(normalizedCategory) || null;
        })
        .filter(Boolean);
    const preferredSet = new Set(preferredCategories.map(normalizeBlogSearch));
    const remainingCategories = Array.from(tagMap.values())
        .filter(tag => !preferredSet.has(normalizeBlogSearch(tag)))
        .sort((a, b) => a.localeCompare(b, 'pt-BR'));

    return [...preferredCategories, ...remainingCategories];
}

function renderBlogNewsletterCard() {
    return `
        <aside class="blog-newsletter-card">
            <span>Newsletter</span>
            <h3>Receba nossas atualizações</h3>
            <form>
                <input type="text" placeholder="Nome completo" aria-label="Nome completo">
                <input type="email" placeholder="E-mail" aria-label="E-mail">
                <input type="text" placeholder="Profissão / Empresa" aria-label="Profissão ou empresa">
                <label>
                    <input type="checkbox">
                    <span>Eu concordo com o uso dos meus dados para envio de novidades, informações sobre produtos e comunicações personalizadas da Stik.</span>
                </label>
                <button type="button">Fazer meu cadastro</button>
            </form>
        </aside>
    `;
}

function renderBlogCategorySection(category, articles, includeNewsletter = false) {
    const uniqueArticles = [];
    const seenArticles = new Set();

    (articles || []).forEach(article => {
        const key = String(article?.id || article?.slug || article?.titulo || '');
        if (!article || !key || seenArticles.has(key)) return;
        seenArticles.add(key);
        uniqueArticles.push(article);
    });

    if (!uniqueArticles.length) return '';

    const [first, second, third, fourth] = uniqueArticles;
    const stackCards = [second, third]
        .filter(Boolean)
        .map(article => renderBlogCard(article, { className: 'blog-category-card is-medium' }))
        .join('');
    const sideCard = includeNewsletter
        ? renderBlogNewsletterCard()
        : (fourth ? renderBlogCard(fourth, { className: 'blog-category-card is-tall' }) : '');

    return `
        <section class="blog-category-block" data-blog-category="${escapeAttribute(category)}">
            <div class="blog-container">
                <h2 class="blog-category-title">${escapeHtml(category)}</h2>
                <div class="blog-category-layout ${includeNewsletter ? 'has-newsletter' : ''}">
                    ${renderBlogCard(first, { className: 'blog-category-card is-tall' })}
                    ${stackCards ? `<div class="blog-category-stack">${stackCards}</div>` : ''}
                    ${sideCard}
                </div>
            </div>
        </section>
    `;
}

function filterBlogArticles(articles, searchTerm = '', activeCategory = '') {
    const term = normalizeBlogSearch(searchTerm);
    const category = normalizeBlogSearch(activeCategory);

    return articles.filter(article => {
        const tags = getBlogTags(article);
        const text = normalizeBlogSearch([
            article.titulo,
            article.resumo,
            article.autor,
            tags.join(' ')
        ].join(' '));
        const matchesTerm = !term || text.includes(term);
        const matchesCategory = !category || tags.some(tag => normalizeBlogSearch(tag) === category);
        return matchesTerm && matchesCategory;
    });
}

function sortBlogSearchResults(articles, searchTerm) {
    const term = normalizeBlogSearch(searchTerm);
    if (!term) return articles;

    const scoreArticle = (article) => {
        const title = normalizeBlogSearch(article.titulo);
        const tags = normalizeBlogSearch(getBlogTags(article).join(' '));
        const summary = normalizeBlogSearch(article.resumo);

        if (title.includes(term)) return 0;
        if (tags.includes(term)) return 1;
        if (summary.includes(term)) return 2;
        return 3;
    };

    return [...articles].sort((a, b) => scoreArticle(a) - scoreArticle(b));
}

async function displayArticles() {
    const featuredGrid = document.getElementById('blog-featured-grid');
    const mostReadGrid = document.getElementById('blog-most-read-grid');
    const chipsContainer = document.getElementById('blog-category-chips');
    const categorySections = document.getElementById('blog-category-sections');
    const searchForm = document.getElementById('blog-search-form');
    const searchInput = document.getElementById('blog-search-input');
    const mostReadSection = mostReadGrid ? mostReadGrid.closest('.blog-most-read-section') : null;
    const categoryFilterSection = chipsContainer ? chipsContainer.closest('.blog-category-filter-section') : null;
    const blogHero = document.querySelector('.blog-showcase-hero');
    const blogTitleLabel = document.querySelector('.blog-title-group span');
    const blogTitle = document.querySelector('.blog-title-group h1');
    const blogIntro = document.querySelector('.blog-hero-grid p');
    const blogBreadcrumb = document.querySelector('.blog-showcase-hero .blog-breadcrumb');

    if (!featuredGrid || !mostReadGrid || !chipsContainer || !categorySections) return;

    const articles = (await getBlogArticlesForScreen())
        .filter(article => article.status !== 'draft')
        .map(getLocalizedBlogArticle);
    const existingCategories = getExistingBlogCategories(articles);
    let activeCategory = '';
    let submittedSearchTerm = '';
    let currentResultsPage = 1;
    const resultsPerPage = 10;

    const setBlogHeroMode = (mode, searchTerm = '') => {
        const isSearchMode = mode === 'search';
        blogHero?.classList.toggle('is-search-results', isSearchMode);
        featuredGrid.classList.toggle('blog-results-grid', isSearchMode);

        if (blogTitleLabel) blogTitleLabel.textContent = isSearchMode ? 'Blog' : 'Conteúdo';
        if (blogTitle) {
            blogTitle.textContent = isSearchMode
                ? `Resultado da busca por: "${searchTerm}"`
                : 'Blog';
        }
        if (blogIntro) {
            blogIntro.hidden = isSearchMode;
        }
        if (blogBreadcrumb) {
            blogBreadcrumb.innerHTML = isSearchMode
                ? `
                    <a href="/">Home</a>
                    <a href="/blog">Blog</a>
                    <span>Busca</span>
                    <strong>${escapeHtml(searchTerm)}</strong>
                `
                : `
                    <a href="/">Home</a>
                    <span>Blog</span>
                `;
        }
    };

    const renderSearchResults = () => {
        const filtered = sortBlogSearchResults(
            filterBlogArticles(articles, submittedSearchTerm, ''),
            submittedSearchTerm
        );
        setBlogHeroMode('search', submittedSearchTerm);
        activeCategory = '';

        if (mostReadSection) mostReadSection.hidden = true;
        if (categoryFilterSection) categoryFilterSection.hidden = true;
        categorySections.innerHTML = '';

        if (!filtered.length) {
            featuredGrid.innerHTML = '<p class="blog-empty-state">Nenhum artigo encontrado.</p>';
            return;
        }

        const totalPages = Math.ceil(filtered.length / resultsPerPage);
        currentResultsPage = Math.min(Math.max(currentResultsPage, 1), totalPages);
        const pageStart = (currentResultsPage - 1) * resultsPerPage;
        const pageArticles = filtered.slice(pageStart, pageStart + resultsPerPage);

        featuredGrid.innerHTML = `
            ${pageArticles.map(article => renderBlogCard(article, { className: 'blog-result-card' })).join('')}
            ${renderBlogPagination(filtered.length, currentResultsPage, resultsPerPage)}
        `;
    };

    const render = () => {
        if (submittedSearchTerm) {
            renderSearchResults();
            return;
        }

        setBlogHeroMode('default');
        if (categoryFilterSection) categoryFilterSection.hidden = false;

        const filtered = filterBlogArticles(articles, '', activeCategory);

        if (!filtered.length) {
            featuredGrid.innerHTML = '<p class="blog-empty-state">Nenhum artigo encontrado.</p>';
            mostReadGrid.innerHTML = '';
            if (mostReadSection) mostReadSection.hidden = true;
            categorySections.innerHTML = '';
            return;
        }

        const [featured, sideOne, sideTwo] = filtered;
        featuredGrid.innerHTML = `
            ${renderBlogCard(featured, { className: 'blog-feature-card is-large', headingTag: 'h2', loading: 'eager' })}
            ${sideOne || sideTwo ? `
                <div class="blog-feature-side">
                    ${renderBlogCard(sideOne, { className: 'blog-feature-card' })}
                    ${renderBlogCard(sideTwo, { className: 'blog-feature-card' })}
                </div>
            ` : ''}
        `;

        const mostReadArticles = filtered.slice(3, 7);
        if (mostReadSection) mostReadSection.hidden = !mostReadArticles.length;
        mostReadGrid.innerHTML = mostReadArticles
            .map(article => renderBlogCard(article, { className: 'blog-mini-card' }))
            .join('');

        chipsContainer.querySelectorAll('button').forEach(button => {
            button.classList.toggle('is-active', normalizeBlogSearch(button.dataset.category) === normalizeBlogSearch(activeCategory));
        });

        if (activeCategory) {
            categorySections.innerHTML = '';
            return;
        }

        const sectionCategories = existingCategories.slice(0, 3);
        categorySections.innerHTML = sectionCategories.map((category, index) => {
            const sectionArticles = filterBlogArticles(articles, '', category);
            return renderBlogCategorySection(category, sectionArticles, index === 0 && !activeCategory);
        }).join('');
    };

    if (!chipsContainer.dataset.bound) {
        chipsContainer.dataset.bound = 'true';
        chipsContainer.innerHTML = existingCategories.map(category => `
            <button type="button" data-category="${escapeAttribute(category)}">${escapeHtml(category)}</button>
        `).join('');

        chipsContainer.addEventListener('click', (event) => {
            const button = event.target.closest('button[data-category]');
            if (!button) return;
            submittedSearchTerm = '';
            currentResultsPage = 1;
            const nextCategory = button.dataset.category || '';
            activeCategory = normalizeBlogSearch(activeCategory) === normalizeBlogSearch(nextCategory) ? '' : nextCategory;
            render();
        });
    }

    if (!featuredGrid.dataset.paginationBound) {
        featuredGrid.dataset.paginationBound = 'true';
        featuredGrid.addEventListener('click', (event) => {
            const button = event.target.closest('[data-results-page]');
            if (!button) return;
            currentResultsPage = Number(button.dataset.resultsPage) || 1;
            renderSearchResults();
            blogHero?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    }

    if (searchForm && !searchForm.dataset.bound) {
        searchForm.dataset.bound = 'true';
        searchForm.addEventListener('submit', (event) => {
            event.preventDefault();
            submittedSearchTerm = searchInput ? searchInput.value.trim() : '';
            currentResultsPage = 1;
            activeCategory = '';
            render();
        });
    }

    if (searchInput && !searchInput.dataset.bound) {
        searchInput.dataset.bound = 'true';
        searchInput.addEventListener('input', () => {
            if (searchInput.value.trim()) return;
            submittedSearchTerm = '';
            currentResultsPage = 1;
            render();
        });
    }

    render();
}

function renderArticleContent(article) {
    if (article.contentHtml) {
        return sanitizeArticleHtml(article.contentHtml);
    }

    if (Array.isArray(article.blocos)) {
        return article.blocos.map(block => {
            if (block.tipo === 'lead') {
                return `<p class="is-lead">${sanitizeArticleHtml(block.html)}</p>`;
            }
            if (block.tipo === 'paragrafo') {
                return `<p>${sanitizeArticleHtml(block.html)}</p>`;
            }
            if (block.tipo === 'titulo') {
                const level = block.nivel === 3 ? 3 : 2;
                return `<h${level}>${escapeHtml(block.texto)}</h${level}>`;
            }
            if (block.tipo === 'imagem') {
                return `
                    <figure>
                        ${optimizedImageMarkup(block.src, block.alt || article.titulo)}
                        ${block.legenda ? `<figcaption>${escapeHtml(block.legenda)}</figcaption>` : ''}
                    </figure>
                `;
            }
            if (block.tipo === 'lista') {
                return `<ul>${(block.itens || []).map(item => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`;
            }
            if (block.tipo === 'citacao') {
                return `<blockquote>${escapeHtml(block.texto)}</blockquote>`;
            }
            return '';
        }).join('');
    }

    return article.conteudoCompleto ? sanitizeArticleHtml(article.conteudoCompleto) : `<p>${escapeHtml(article.resumo || '')}</p>`;
}

async function carregarArtigo() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    const slug = params.get('slug');
    const screenArticles = await getBlogArticlesForScreen();
    const sourceArticle = screenArticles.find(item => (
        (id && String(item.id) === String(id)) || (slug && item.slug === slug)
    ));
    const artigo = getLocalizedBlogArticle(sourceArticle);

    const articleTitleEl = document.getElementById('article-title');
    const articleMetaEl = document.getElementById('article-meta');
    const articleImageEl = document.getElementById('article-image');
    const articleContentEl = document.getElementById('article-content');
    const articleTagsEl = document.getElementById('article-tags');
    const breadcrumbTitleEl = document.getElementById('article-breadcrumb-title');
    const relatedGrid = document.getElementById('blog-related-grid');

    if (!artigo) {
        document.title = 'Artigo não encontrado - Stik';
        if (articleTitleEl) articleTitleEl.textContent = 'Artigo não encontrado';
        if (breadcrumbTitleEl) breadcrumbTitleEl.textContent = 'Artigo não encontrado';
        if (articleMetaEl) articleMetaEl.innerHTML = '';
        if (articleTagsEl) articleTagsEl.innerHTML = '';
        if (articleImageEl) {
            const cover = articleImageEl.closest('.blog-article-cover');
            if (cover) cover.hidden = true;
        }
        if (relatedGrid) relatedGrid.innerHTML = '';
        if (articleContentEl) {
            articleContentEl.innerHTML = `
                <p>Este artigo não está mais disponível ou foi removido.</p>
                <p><a href="/blog">Voltar para o blog</a></p>
            `;
        }
        return;
    }

    document.title = `${artigo.titulo} - Stik`;

    if (articleTitleEl) articleTitleEl.textContent = artigo.titulo;
    if (breadcrumbTitleEl) breadcrumbTitleEl.textContent = artigo.titulo;
    if (articleTagsEl) {
        articleTagsEl.innerHTML = getBlogTags(artigo)
            .map(tag => `<span>${escapeHtml(tag)}</span>`)
            .join('');
    }
    if (articleMetaEl) {
        articleMetaEl.innerHTML = `
            <span>${escapeHtml(formatBlogDate(artigo.data))}</span>
            <span><i class="far fa-clock"></i> ${escapeHtml(artigo.leitura || '5 min')} (tempo estimado de leitura)</span>
        `;
    }
    if (articleImageEl) {
        optimizeImageElement(articleImageEl, { loading: 'eager', fetchPriority: 'high' });
        articleImageEl.src = normalizeStikAssetUrl(artigo.imagem);
        articleImageEl.alt = artigo.titulo;
        if (articleImageEl.decode) articleImageEl.decode().catch(() => {/* ignore */});
    }
    if (articleContentEl) articleContentEl.innerHTML = renderArticleContent(artigo);

    if (relatedGrid) {
        const currentTags = getBlogTags(artigo).map(normalizeBlogSearch);
        const relatedCandidates = screenArticles
            .filter(item => String(item.id) !== String(artigo.id) && item.status !== 'draft')
            .map(getLocalizedBlogArticle);
        const relatedByTag = relatedCandidates
            .filter(item => getBlogTags(item).some(tag => currentTags.includes(normalizeBlogSearch(tag))));
        const fallbackArticles = relatedCandidates
            .filter(item => !relatedByTag.some(related => String(related.id) === String(item.id)));

        relatedGrid.innerHTML = [...relatedByTag, ...fallbackArticles]
            .slice(0, 3)
            .map(item => renderBlogCard(item, { className: 'blog-mini-card' }))
            .join('');
    }

    deferInit(() => {
        if (typeof inicializarAnimateOnScroll === 'function') inicializarAnimateOnScroll();
    });
}

function createEditorBlock(type) {
    const blockLabels = {
        paragraph: 'Parágrafo',
        heading: 'Subtítulo',
        image: 'Imagem',
        quote: 'Citação',
        list: 'Lista'
    };
    const label = blockLabels[type] || 'Bloco';
    const controls = `
        <div class="blog-block-controls">
            <span>${label}</span>
            <button type="button" data-move-block="up" aria-label="Mover bloco para cima"><i class="fas fa-arrow-up"></i></button>
            <button type="button" data-move-block="down" aria-label="Mover bloco para baixo"><i class="fas fa-arrow-down"></i></button>
            <button type="button" data-remove-block aria-label="Remover bloco"><i class="fas fa-times"></i></button>
        </div>
    `;

    if (type === 'heading') {
        return `<article class="blog-content-block" data-block-type="heading">${controls}<input class="blog-block-heading-input" type="text" value="Novo subtítulo"></article>`;
    }
    if (type === 'image') {
        return `
            <article class="blog-content-block blog-content-block-image" data-block-type="image">
                ${controls}
                <figure>${optimizedImageMarkup('img - Copia/thumb-blog-14-300x200.jpg', 'Imagem do artigo')}</figure>
                <div class="blog-image-meta">
                    <input type="text" value="Crédito" aria-label="Crédito da imagem">
                </div>
            </article>
        `;
    }
    if (type === 'quote') {
        return `<article class="blog-content-block" data-block-type="quote">${controls}<div class="blog-rich-text" contenteditable="true">Uma citação ou destaque editorial para o artigo.</div></article>`;
    }
    if (type === 'list') {
        return `<article class="blog-content-block" data-block-type="list">${controls}<ul class="blog-editable-list" contenteditable="true"><li>Novo item da lista.</li></ul></article>`;
    }

    return `<article class="blog-content-block" data-block-type="paragraph">${controls}<div class="blog-rich-text" contenteditable="true">Novo parágrafo do artigo.</div></article>`;
}

function updateEditorBlockCount() {
    const countEl = document.getElementById('blog-block-count');
    const blockList = document.getElementById('article-blocks');
    if (!countEl || !blockList) return;
    const count = blockList.querySelectorAll('.blog-content-block').length;
    countEl.textContent = `${count} ${count === 1 ? 'bloco' : 'blocos'}`;
}

function showEditorFeedback(message) {
    let toast = document.querySelector('.blog-editor-toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.className = 'blog-editor-toast';
        document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.remove('is-progress');
    toast.classList.add('is-visible');
    window.clearTimeout(showEditorFeedback.timeout);
    showEditorFeedback.timeout = window.setTimeout(() => {
        toast.classList.remove('is-visible');
    }, 2200);
}

function showEditorProgress(message, progress = 8) {
    let toast = document.querySelector('.blog-editor-toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.className = 'blog-editor-toast';
        document.body.appendChild(toast);
    }

    const setProgress = (nextMessage, nextProgress = progress) => {
        const percent = Math.max(4, Math.min(100, Number(nextProgress) || 4));
        toast.classList.add('is-visible', 'is-progress');
        toast.innerHTML = `
            <div class="blog-editor-progress-head">
                <i class="fas fa-spinner" aria-hidden="true"></i>
                <span>${escapeHtml(nextMessage)}</span>
            </div>
            <div class="blog-editor-progress-track" aria-hidden="true">
                <span style="width: ${percent}%"></span>
            </div>
        `;
        toast.setAttribute('role', 'status');
        toast.setAttribute('aria-live', 'polite');
    };

    window.clearTimeout(showEditorFeedback.timeout);
    setProgress(message, progress);

    return {
        update: setProgress,
        done(finalMessage) {
            toast.classList.remove('is-progress');
            toast.textContent = finalMessage;
            toast.classList.add('is-visible');
            window.clearTimeout(showEditorFeedback.timeout);
            showEditorFeedback.timeout = window.setTimeout(() => {
                toast.classList.remove('is-visible');
            }, 2200);
        },
        fail(finalMessage) {
            toast.classList.remove('is-progress');
            toast.textContent = finalMessage;
            toast.classList.add('is-visible');
            window.clearTimeout(showEditorFeedback.timeout);
            showEditorFeedback.timeout = window.setTimeout(() => {
                toast.classList.remove('is-visible');
            }, 3200);
        }
    };
}

// Mostra as decisões quando uma alteração de tag pode afetar outros artigos.
function showBlogTagImpactDialog({ title, message, actions }) {
    return new Promise(resolve => {
        const previousModal = document.querySelector('.blog-tag-impact-modal');
        if (previousModal) previousModal.remove();

        const modal = document.createElement('div');
        modal.className = 'blog-tag-impact-modal';
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-modal', 'true');
        modal.innerHTML = `
            <div class="blog-tag-impact-card">
                <h2>${escapeHtml(title)}</h2>
                <p>${escapeHtml(message)}</p>
                <div class="blog-tag-impact-actions">
                    ${actions.map(action => `
                        <button type="button" class="blog-editor-btn ${escapeAttribute(action.className || 'blog-editor-btn-light')}" data-modal-action="${escapeAttribute(action.value)}">
                            ${escapeHtml(action.label)}
                        </button>
                    `).join('')}
                </div>
            </div>
        `;

        let isClosed = false;
        let handleKeydown;
        const close = (value) => {
            if (isClosed) return;
            isClosed = true;
            document.removeEventListener('keydown', handleKeydown);
            modal.remove();
            resolve(value);
        };

        modal.addEventListener('click', (event) => {
            if (event.target === modal) close('cancel');

            const actionButton = event.target.closest('[data-modal-action]');
            if (actionButton) close(actionButton.dataset.modalAction);
        });

        handleKeydown = (event) => {
            if (event.key === 'Escape') close('cancel');
        };

        document.addEventListener('keydown', handleKeydown);
        document.body.appendChild(modal);
        modal.querySelector('button')?.focus();
    });
}

// Inicializa o editor visual de criação de artigo.
async function createTipTapArticleEditor(element) {
    const initialContent = element.innerHTML;

    try {
        const [
            coreModule,
            starterKitModule,
            linkModule,
            imageModule,
            placeholderModule
        ] = await Promise.all([
            import('https://esm.sh/@tiptap/core@2'),
            import('https://esm.sh/@tiptap/starter-kit@2'),
            import('https://esm.sh/@tiptap/extension-link@2'),
            import('https://esm.sh/@tiptap/extension-image@2'),
            import('https://esm.sh/@tiptap/extension-placeholder@2')
        ]);

        const editor = new coreModule.Editor({
            element,
            content: initialContent,
            extensions: [
                starterKitModule.default,
                linkModule.default.configure({
                    autolink: true,
                    openOnClick: false,
                    HTMLAttributes: {
                        rel: 'noopener noreferrer'
                    }
                }),
                imageModule.default.configure({
                    inline: false,
                    allowBase64: false
                }),
                placeholderModule.default.configure({
                    placeholder: 'Escreva o artigo aqui...'
                })
            ]
        });

        element.classList.add('is-tiptap-ready');

        return {
            type: 'tiptap',
            focus: () => editor.chain().focus().run(),
            getHTML: () => editor.getHTML(),
            getJSON: () => editor.getJSON(),
            setHTML: (html) => editor.commands.setContent(sanitizeArticleHtml(html || '')),
            setFormat: (format) => {
                const chain = editor.chain().focus();
                if (format === 'h2') return chain.toggleHeading({ level: 2 }).run();
                if (format === 'h3') return chain.toggleHeading({ level: 3 }).run();
                return chain.setParagraph().run();
            },
            runCommand: (command) => {
                const chain = editor.chain().focus();
                if (command === 'bold') return chain.toggleBold().run();
                if (command === 'italic') return chain.toggleItalic().run();
                if (command === 'insertUnorderedList') return chain.toggleBulletList().run();
                return false;
            },
            setLink: (href) => {
                const safeHref = normalizeStikLinkUrl(href, '');
                return safeHref ? editor.chain().focus().extendMarkRange('link').setLink({ href: safeHref }).run() : false;
            },
            insertImage: ({ src, alt, title }) => {
                const safeSrc = normalizeStikAssetUrl(src, '');
                return safeSrc ? editor.chain().focus().setImage({ src: safeSrc, alt, title }).run() : false;
            }
        };
    } catch (error) {
        console.warn('TipTap não carregou. Usando editor nativo como fallback.', error);
        element.setAttribute('contenteditable', 'true');

        return {
            type: 'fallback',
            focus: () => element.focus(),
            getHTML: () => element.innerHTML,
            getJSON: () => ({ type: 'html', html: element.innerHTML }),
            setHTML: (html) => {
                element.innerHTML = sanitizeArticleHtml(html || '');
            },
            setFormat: (format) => {
                element.focus();
                document.execCommand('formatBlock', false, format);
            },
            runCommand: (command) => {
                element.focus();
                document.execCommand(command, false, null);
            },
            setLink: (href) => {
                element.focus();
                const safeHref = normalizeStikLinkUrl(href, '');
                if (safeHref) document.execCommand('createLink', false, safeHref);
            },
            insertImage: ({ src, alt }) => {
                element.focus();
                document.execCommand('insertHTML', false, `
                    <figure>
                        <img src="${escapeAttribute(normalizeStikAssetUrl(src))}" alt="${escapeAttribute(alt || 'Imagem do artigo')}" loading="lazy" decoding="async">
                        <figcaption>Crédito ou legenda</figcaption>
                    </figure>
                `);
            }
        };
    }
}

function collectSelectedTags(selectedTags) {
    if (!selectedTags) return [];
    return Array.from(selectedTags.querySelectorAll('[data-tag]'))
        .map(button => button.dataset.tag)
        .filter(Boolean);
}

function buildArticlePayload(editorController, status = 'draft', coverState = {}) {
    const titleInput = document.getElementById('article-title');
    const summaryInput = document.getElementById('article-summary');
    const coverImage = document.querySelector('.blog-cover-editor img');
    const title = titleInput ? titleInput.value.trim() : '';

    return {
        title,
        summary: summaryInput ? summaryInput.value.trim() : '',
        coverUrl: normalizeStikAssetUrl(coverState.url || (coverImage ? coverImage.getAttribute('src') : '')),
        tags: collectSelectedTags(document.getElementById('selected-tags')),
        status,
        contentJson: editorController.getJSON(),
        contentHtml: sanitizeArticleHtml(editorController.getHTML())
    };
}

async function translateStikArticlePayload(payload, existingI18n = null) {
    return translateStikCrudFields(getArticleTranslationSourceFields(payload), existingI18n, {
        showFailureFeedback: false,
        throwOnFailure: true,
        skipExisting: true
    });
}

function getArticleTranslationSourceFields(article) {
    const fieldMap = {
        title: article?.title || article?.titulo || '',
        summary: article?.summary || article?.resumo || '',
        contentHtml: {
            text: article?.contentHtml || article?.content_html || article?.conteudoCompleto || '',
            format: 'html'
        }
    };

    getBlogTags(article || {}).forEach((tag, index) => {
        fieldMap[`tag:${index}`] = tag;
    });

    return fieldMap;
}

function getArticleTranslationFields(article) {
    return Object.entries(getArticleTranslationSourceFields(article))
        .filter(([, config]) => {
            const value = typeof config === 'object' ? config.text : config;
            return String(value || '').trim();
        })
        .map(([field]) => field);
}

function hasArticleTranslatableContent(article) {
    return getArticleTranslationFields(article).length > 0;
}

function getArticleTranslationSignature(article) {
    return getStikTextHash(JSON.stringify(getArticleTranslationSourceFields(article)));
}

function getArticleTranslationStatus(article, i18n = article?.i18n) {
    if (!hasArticleTranslatableContent(article)) return 'published';
    return hasCompleteStikI18n(i18n, getArticleTranslationFields(article)) ? 'published' : 'pending';
}

function getArticleI18nWithoutChangedSourceFields(existingArticle, nextArticle) {
    const existingI18n = existingArticle?.i18n || {};
    if (!existingArticle) return {};

    const getValue = (config) => typeof config === 'object' ? config.text : config;
    const previousSources = getArticleTranslationSourceFields(existingArticle);
    const nextSources = getArticleTranslationSourceFields(nextArticle);
    const changedFields = new Set(Object.keys(nextSources).filter(field => (
        String(getValue(previousSources[field]) || '').trim() !== String(getValue(nextSources[field]) || '').trim()
    )));

    if (!changedFields.size) return existingI18n;

    return Object.fromEntries(Object.entries(existingI18n)
        .map(([language, values]) => {
            const nextValues = { ...(values || {}) };
            changedFields.forEach(field => {
                delete nextValues[field];
            });
            return [language, nextValues];
        })
        .filter(([, values]) => Object.values(values || {}).some(value => String(value || '').trim())));
}

function shouldTranslateArticleAfterSave(existingArticle, nextArticle, i18n) {
    if (!hasArticleTranslatableContent(nextArticle)) return false;
    const nextSignature = getArticleTranslationSignature(nextArticle);
    if (!existingArticle) return true;
    if (getArticleTranslationSignature(existingArticle) !== nextSignature) return true;
    const existingTranslationStatus = String(existingArticle.translationStatus || '').toLowerCase();
    const hasSameTranslationSource = String(existingArticle.translationSourceSignature || '') === nextSignature;
    if (['pending', 'error'].includes(existingTranslationStatus) && hasSameTranslationSource) {
        return false;
    }
    if (existingTranslationStatus === 'error') {
        return String(existingArticle.translationSourceSignature || '') !== nextSignature;
    }
    return !hasCompleteStikI18n(i18n, getArticleTranslationFields(nextArticle));
}

// Versão final para testes locais: rascunho, visualização e publicação usam localStorage via blogApi.
async function setupArticleForm() {
    const form = document.getElementById('article-form');
    const freeEditor = document.getElementById('article-free-content');
    if (!form || !freeEditor || form.dataset.articleFormReady === 'true') return;
    form.dataset.articleFormReady = 'true';

    const selectedTags = document.getElementById('selected-tags');
    const availableTags = document.getElementById('available-tags');
    const tagInput = document.getElementById('tag-input');
    const addTagBtn = document.getElementById('add-tag-btn');
    const coverFileInput = document.getElementById('cover-file-input');
    const inlineImageInput = document.getElementById('article-inline-image-input');
    const formatSelect = document.getElementById('article-format-select');
    const statusPill = document.getElementById('article-status-pill');
    const coverFigure = document.querySelector('.blog-cover-editor figure');
    let coverImage = document.querySelector('.blog-cover-editor img');
    const coverState = {
        url: coverImage ? coverImage.getAttribute('src') : ''
    };
    let currentArticleId = null;
    let currentStatus = 'draft';
    let availableTagCache = [];
    let isArticleSaving = false;

    const editorController = await createTipTapArticleEditor(freeEditor);

    const setArticleSavingState = (isSaving, message = 'Publicando...') => {
        isArticleSaving = Boolean(isSaving);
        form.classList.toggle('is-saving', isArticleSaving);
        form.setAttribute('aria-busy', String(isArticleSaving));
        const editorActions = document.querySelectorAll('[data-editor-action], button[type="submit"][form="article-form"], #article-form button[type="submit"]');

        editorActions.forEach(button => {
            if (isArticleSaving) {
                button.dataset.previousDisabled = button.disabled ? 'true' : 'false';
                button.disabled = true;
                button.classList.add('is-loading');

                if (button.type === 'submit') {
                    button.dataset.previousLabel = button.innerHTML;
                    button.innerHTML = `<i class="fas fa-spinner" aria-hidden="true"></i> ${escapeHtml(message)}`;
                }
                return;
            }

            button.disabled = button.dataset.previousDisabled === 'true';
            button.classList.remove('is-loading');
            if (button.type === 'submit' && button.dataset.previousLabel) {
                button.innerHTML = button.dataset.previousLabel;
            }
            delete button.dataset.previousDisabled;
            delete button.dataset.previousLabel;
        });
    };

    const updateStatusPill = (status) => {
        currentStatus = status || currentStatus;
        if (!statusPill) return;
        statusPill.textContent = currentStatus === 'published' ? 'Publicado' : 'Rascunho';
        statusPill.dataset.status = currentStatus;
    };

    const translateArticleInBackground = (article, existingI18n = null) => {
        if (!article?.id || !window.blogApi) return;
        if (!hasArticleTranslatableContent(article)) return;
        const sourceSignature = getArticleTranslationSignature(article);
        const attemptedAt = new Date().toISOString();

        Promise.resolve()
            .then(async () => {
                const i18n = await translateStikArticlePayload(article, existingI18n);
                const latestArticle = await window.blogApi.getArticle(article.id).catch(() => null);
                if (!latestArticle || getArticleTranslationSignature(latestArticle) !== sourceSignature) return;
                const mergedI18n = mergeStikI18n(latestArticle.i18n, i18n);

                const translatedArticle = await window.blogApi.updateArticle(article.id, {
                    ...latestArticle,
                    i18n: mergedI18n,
                    translationStatus: getArticleTranslationStatus(latestArticle, mergedI18n),
                    translationUpdatedAt: new Date().toISOString(),
                    translationAttemptedAt: attemptedAt,
                    translationFailedAt: null,
                    translationSourceSignature: sourceSignature,
                    translationLastError: ''
                });

                window.dispatchEvent(new CustomEvent('stik:article-saved', { detail: translatedArticle }));
                showEditorFeedback('Traduções do artigo concluídas.');
            })
            .catch(error => {
                console.warn('Traducao do artigo em segundo plano indisponivel:', error);
                window.blogApi.getArticle(article.id)
                    .then(latestArticle => {
                        if (!latestArticle || getArticleTranslationSignature(latestArticle) !== sourceSignature) return null;
                        return window.blogApi.updateArticle(article.id, {
                            ...latestArticle,
                            translationStatus: 'error',
                            translationAttemptedAt: attemptedAt,
                            translationFailedAt: new Date().toISOString(),
                            translationSourceSignature: sourceSignature,
                            translationLastError: String(error?.message || error || 'Falha ao traduzir artigo.').slice(0, 500)
                        });
                    })
                    .then(updatedArticle => {
                        if (updatedArticle) {
                            window.dispatchEvent(new CustomEvent('stik:article-saved', { detail: updatedArticle }));
                        }
                    })
                    .catch(updateError => console.warn('Nao foi possivel registrar erro de traducao do artigo:', updateError));
                showEditorFeedback('Artigo salvo. Tradução automática indisponível agora.');
            });
    };

    const saveArticle = async (status) => {
        if (isArticleSaving) return null;
        const titleInput = document.getElementById('article-title');
        if (!titleInput || !titleInput.value.trim()) {
            showEditorFeedback('Preencha o título antes de salvar.');
            titleInput?.focus();
            return null;
        }

        const progress = showEditorProgress(status === 'published'
            ? 'Preparando publicação...'
            : 'Preparando rascunho...', 12);
        setArticleSavingState(true, status === 'published' ? 'Publicando...' : 'Salvando...');

        try {
            progress.update('Organizando conteúdo do artigo...', 24);
            const payload = buildArticlePayload(editorController, status, coverState);
            progress.update(status === 'published'
                ? 'Salvando artigo publicado...'
                : 'Salvando rascunho...', 58);
            const existingArticle = currentArticleId && window.blogApi
                ? await window.blogApi.getArticle(currentArticleId).catch(() => null)
                : null;
            payload.i18n = getArticleI18nWithoutChangedSourceFields(existingArticle, payload);
            payload.publicationStatus = status === 'published' ? 'published' : '';
            const shouldTranslateArticle = shouldTranslateArticleAfterSave(existingArticle, payload, payload.i18n);
            const articleSourceSignature = getArticleTranslationSignature(payload);
            const existingTranslationStatus = String(existingArticle?.translationStatus || '').toLowerCase();
            const hasSameFailedTranslationSource = existingTranslationStatus === 'error'
                && String(existingArticle?.translationSourceSignature || '') === articleSourceSignature;
            payload.translationStatus = shouldTranslateArticle
                ? 'pending'
                : hasSameFailedTranslationSource
                    ? 'error'
                    : getArticleTranslationStatus(payload, payload.i18n);
            payload.translationSourceSignature = shouldTranslateArticle
                ? articleSourceSignature
                : existingArticle?.translationSourceSignature || articleSourceSignature;
            payload.translationAttemptedAt = shouldTranslateArticle
                ? new Date().toISOString()
                : existingArticle?.translationAttemptedAt || null;
            payload.translationFailedAt = shouldTranslateArticle
                ? null
                : existingArticle?.translationFailedAt || null;
            payload.translationLastError = shouldTranslateArticle
                ? ''
                : existingArticle?.translationLastError || '';
            progress.update(status === 'published'
                ? 'Finalizando publicação...'
                : 'Finalizando rascunho...', 84);
            const saved = window.blogApi
                ? (currentArticleId
                    ? await window.blogApi.updateArticle(currentArticleId, payload)
                    : await window.blogApi.createArticle(payload))
                : { ...payload, id: currentArticleId || Date.now() };

            currentArticleId = saved.id || currentArticleId;
            updateStatusPill(saved.status || status);
            window.dispatchEvent(new CustomEvent('stik:article-saved', { detail: saved }));
            progress.done(status === 'published'
                ? 'Artigo publicado. Tradução automática em segundo plano.'
                : 'Rascunho salvo. Tradução automática em segundo plano.');
            if (shouldTranslateArticle) {
                translateArticleInBackground(saved, payload.i18n);
            }

            return saved;
        } catch (error) {
            console.error('Erro ao salvar artigo localmente:', error);
            progress.fail('Não foi possível salvar. Tente remover imagens muito grandes e salvar novamente.');
            return null;
        } finally {
            setArticleSavingState(false);
        }
    };

    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        await saveArticle('published');
    });

    document.querySelectorAll('[data-editor-action]').forEach(button => {
        button.addEventListener('click', async () => {
            const action = button.dataset.editorAction;

            if (action === 'preview') {
                const saved = await saveArticle(currentStatus);
                if (saved && saved.id) {
                    window.open(`/artigo?id=${encodeURIComponent(saved.id)}`, '_blank', 'noopener');
                }
                return;
            }

            if (action === 'draft') {
                await saveArticle('draft');
            }
        });
    });

    if (formatSelect) {
        formatSelect.addEventListener('change', () => {
            editorController.setFormat(formatSelect.value);
            formatSelect.value = 'p';
        });
    }

    document.querySelectorAll('[data-editor-command]').forEach(button => {
        button.addEventListener('click', () => {
            const command = button.dataset.editorCommand;

            if (command === 'createLink') {
                const url = window.prompt('Cole o link que será aplicado ao texto selecionado:');
                if (url) editorController.setLink(url);
                return;
            }

            if (command === 'insertImage') {
                inlineImageInput?.click();
                return;
            }

            editorController.runCommand(command);
        });
    });

    if (inlineImageInput) {
        inlineImageInput.addEventListener('change', async () => {
            const file = inlineImageInput.files && inlineImageInput.files[0];
            if (!file) return;
            const validationMessage = validateStikImageFile(file);
            if (validationMessage) {
                showEditorFeedback(validationMessage);
                inlineImageInput.value = '';
                return;
            }

            try {
                const media = window.blogApi
                    ? await window.blogApi.uploadBlogImage(file)
                    : { url: URL.createObjectURL(file) };
                editorController.insertImage({ src: media.url, alt: file.name, title: file.name });
                inlineImageInput.value = '';
                showEditorFeedback('Imagem inserida no conteúdo.');
            } catch (error) {
                showEditorFeedback('Não foi possível inserir a imagem.');
            }
        });
    }

    const applyCoverMedia = (media, fallbackName = 'Imagem de capa') => {
        if (!media || !media.url || !coverFigure) return;
        const safeUrl = normalizeStikAssetUrl(media.url);
        if (!safeUrl) {
            showEditorFeedback('A URL da imagem de capa nao e valida.');
            return;
        }
        if (!coverImage) {
            coverImage = document.createElement('img');
            coverImage.loading = 'lazy';
            coverImage.decoding = 'async';
            coverFigure.prepend(coverImage);
        }
        coverImage.src = safeUrl;
        coverImage.alt = media.filename || fallbackName;
        coverFigure.classList.remove('is-empty');
        coverFigure.setAttribute('aria-label', `Imagem de capa selecionada: ${media.filename || fallbackName}. Clique ou arraste para trocar.`);
        coverState.mediaId = media.id || null;
        coverState.url = safeUrl;
    };

    const uploadCoverFile = async (file) => {
        if (!file) return;

        const validationMessage = validateStikImageFile(file);
        if (validationMessage) {
            showEditorFeedback(validationMessage);
            return;
        }

        try {
            coverFigure?.classList.add('is-uploading');
            const media = window.blogApi
                ? await window.blogApi.uploadBlogImage(file)
                : { id: Date.now(), filename: file.name, url: URL.createObjectURL(file) };
            applyCoverMedia(media, file.name);
            showEditorFeedback('Imagem de capa adicionada.');
        } catch (error) {
            showEditorFeedback('Não foi possível enviar a imagem de capa.');
        } finally {
            coverFigure?.classList.remove('is-uploading');
        }
    };

    if (coverFigure && coverFileInput) {
        coverFigure.addEventListener('click', () => coverFileInput.click());
        coverFigure.addEventListener('keydown', (event) => {
            if (event.key !== 'Enter' && event.key !== ' ') return;
            event.preventDefault();
            coverFileInput.click();
        });

        coverFigure.addEventListener('dragover', (event) => {
            event.preventDefault();
            coverFigure.classList.add('is-dragover');
        });

        coverFigure.addEventListener('dragleave', (event) => {
            if (!coverFigure.contains(event.relatedTarget)) {
                coverFigure.classList.remove('is-dragover');
            }
        });

        coverFigure.addEventListener('drop', async (event) => {
            event.preventDefault();
            coverFigure.classList.remove('is-dragover');
            const file = event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files[0];
            await uploadCoverFile(file);
        });

        coverFileInput.addEventListener('change', async () => {
            const file = coverFileInput.files && coverFileInput.files[0];
            await uploadCoverFile(file);
            coverFileInput.value = '';
        });
    }

    const addSelectedTag = (tag) => {
        if (!selectedTags || !tag) return;
        const exists = Array.from(selectedTags.querySelectorAll('[data-tag]'))
            .some(button => normalizeBlogSearch(button.dataset.tag) === normalizeBlogSearch(tag));
        if (exists) return;
        selectedTags.insertAdjacentHTML('beforeend', `<button type="button" data-tag="${escapeAttribute(tag)}">${escapeHtml(tag)} <i class="fas fa-times"></i></button>`);
        renderAvailableTags(availableTagCache);
    };

    const removeSelectedTag = (tag) => {
        if (!selectedTags || !tag) return;
        selectedTags.querySelectorAll('[data-tag]').forEach(button => {
            if (normalizeBlogSearch(button.dataset.tag) === normalizeBlogSearch(tag)) button.remove();
        });
        renderAvailableTags(availableTagCache);
    };

    const replaceSelectedTag = (oldTag, nextTag) => {
        if (!selectedTags || !oldTag || !nextTag) return;
        let replaced = false;
        selectedTags.querySelectorAll('[data-tag]').forEach(button => {
            if (normalizeBlogSearch(button.dataset.tag) !== normalizeBlogSearch(oldTag)) return;
            button.dataset.tag = nextTag;
            button.innerHTML = `${escapeHtml(nextTag)} <i class="fas fa-times"></i>`;
            replaced = true;
        });
        if (!replaced) addSelectedTag(nextTag);
    };

    const getTagDisplayName = (tag) => typeof tag === 'string' ? tag : (tag && (tag.name || tag.title)) || '';
    const getTagKey = (tag) => {
        const name = getTagDisplayName(tag);
        return typeof tag === 'string' ? name : (tag && (tag.id || tag.slug || name)) || name;
    };

    const renderAvailableTag = (tag) => {
        const name = getTagDisplayName(tag).trim();
        if (!name) return '';
        const key = getTagKey(tag);

        return `
            <span class="blog-tag-item" data-tag-item="${escapeAttribute(name)}" data-tag-key="${escapeAttribute(key)}">
                <button type="button" class="blog-tag-name" data-tag="${escapeAttribute(name)}">${escapeHtml(name)}</button>
                <span class="blog-tag-item-actions" aria-label="Ações da tag ${escapeAttribute(name)}">
                    <button type="button" data-tag-action="rename" data-tag-name="${escapeAttribute(name)}" data-tag-key="${escapeAttribute(key)}" aria-label="Editar tag ${escapeAttribute(name)}">
                        <i class="fas fa-pen"></i>
                    </button>
                    <button type="button" class="blog-tag-remove" data-tag-action="delete" data-tag-name="${escapeAttribute(name)}" data-tag-key="${escapeAttribute(key)}" aria-label="Excluir tag ${escapeAttribute(name)}">
                        <span aria-hidden="true">×</span>
                    </button>
                </span>
            </span>
        `;
    };

    const renderAvailableTags = (tags) => {
        if (!availableTags) return;
        const selectedTagNames = selectedTags
            ? Array.from(selectedTags.querySelectorAll('[data-tag]')).map(button => normalizeBlogSearch(button.dataset.tag))
            : [];
        availableTags.innerHTML = (tags || [])
            .filter(tag => !selectedTagNames.includes(normalizeBlogSearch(getTagDisplayName(tag))))
            .map(renderAvailableTag)
            .join('');
    };

    const loadAvailableTags = async () => {
        if (!availableTags || !window.blogApi) return;
        const tags = await window.blogApi.listTags().catch(() => []);
        availableTagCache = tags;
        if (tags.length) renderAvailableTags(availableTagCache);
    };

    const resetArticleEditor = () => {
        currentArticleId = null;
        updateStatusPill('draft');

        const titleInput = document.getElementById('article-title');
        const summaryInput = document.getElementById('article-summary');
        if (titleInput) titleInput.value = '';
        if (summaryInput) summaryInput.value = '';
        if (selectedTags) selectedTags.innerHTML = '';
        editorController.setHTML('');

        coverState.url = '';
        coverState.mediaId = null;
        if (coverImage) {
            coverImage.remove();
            coverImage = null;
        }
        if (coverFigure) {
            coverFigure.classList.add('is-empty');
            coverFigure.setAttribute('aria-label', 'Selecionar imagem de capa');
        }

        renderAvailableTags(availableTagCache);
        titleInput?.focus();
    };

    const loadArticleIntoEditor = async (articleOrId) => {
        const article = typeof articleOrId === 'object'
            ? articleOrId
            : (window.blogApi ? await window.blogApi.getArticle(articleOrId).catch(() => null) : null);
        if (!article) {
            showEditorFeedback('Não foi possível carregar o artigo.');
            return false;
        }

        resetArticleEditor();
        currentArticleId = article.id;
        updateStatusPill(article.status || 'draft');

        const titleInput = document.getElementById('article-title');
        const summaryInput = document.getElementById('article-summary');
        if (titleInput) titleInput.value = article.title || article.titulo || '';
        if (summaryInput) summaryInput.value = article.summary || article.resumo || '';
        editorController.setHTML(renderArticleContent(article));

        if (Array.isArray(article.tags)) {
            article.tags.forEach(addSelectedTag);
        }

        if (article.coverUrl || article.imagem) {
            applyCoverMedia({
                id: article.coverMediaId || null,
                filename: article.title || 'Imagem de capa',
                url: article.coverUrl || article.imagem
            });
        }

        showEditorFeedback('Artigo carregado para edição.');
        return true;
    };

    window.stikArticleEditor = {
        reset: resetArticleEditor,
        load: loadArticleIntoEditor
    };

    const addAvailableTag = (tag) => {
        if (!availableTags || !tag) return;
        const name = getTagDisplayName(tag).trim();
        if (!name) return;

        const exists = availableTagCache
            .some(item => normalizeBlogSearch(getTagDisplayName(item)) === normalizeBlogSearch(name));
        if (!exists) availableTagCache.push(tag);
        renderAvailableTags(availableTagCache);
    };

    const removeAvailableTag = (tag) => {
        if (!availableTags || !tag) return;
        availableTagCache = availableTagCache
            .filter(item => normalizeBlogSearch(getTagDisplayName(item)) !== normalizeBlogSearch(tag));
        renderAvailableTags(availableTagCache);
    };

    const replaceAvailableTag = (oldTag, nextTag) => {
        if (!availableTags || !oldTag || !nextTag) return;
        let didReplace = false;
        availableTagCache = availableTagCache.map(item => {
            if (normalizeBlogSearch(getTagDisplayName(item)) !== normalizeBlogSearch(oldTag)) return item;
            didReplace = true;
            return nextTag;
        });

        if (!didReplace) availableTagCache.push(nextTag);
        renderAvailableTags(availableTagCache);
    };

    const getTagUsage = async (tag) => {
        if (!window.blogApi || !window.blogApi.getTagUsage) {
            return { count: 0, articles: [] };
        }
        return window.blogApi.getTagUsage(tag).catch(() => ({ count: 0, articles: [] }));
    };

    const commitTagRename = async (oldTag, nextTag, tagKey = oldTag) => {
        if (!oldTag || !nextTag || normalizeBlogSearch(nextTag) === normalizeBlogSearch(oldTag)) return false;
        const usage = await getTagUsage(tagKey);
        let scope = 'global';

        if (usage.count > 0) {
            scope = await showBlogTagImpactDialog({
                title: 'Tag em uso',
                message: `A tag "${oldTag}" está sendo usada em ${usage.count} artigo${usage.count === 1 ? '' : 's'}.`,
                actions: [
                    { value: 'global', label: 'Alterar em todos', className: 'blog-editor-btn-primary' },
                    { value: 'current', label: 'Criar só neste artigo', className: 'blog-editor-btn-outline' },
                    { value: 'cancel', label: 'Cancelar', className: 'blog-editor-btn-light' }
                ]
            });
        }

        if (!scope || scope === 'cancel') return false;

        if (scope === 'current') {
            const createdTag = window.blogApi ? await window.blogApi.createTag(nextTag).catch(() => null) : null;
            replaceSelectedTag(oldTag, nextTag);
            addAvailableTag(createdTag || nextTag);
            showEditorFeedback('Nova tag criada para este artigo. Os artigos existentes foram mantidos.');
            return true;
        }

        let updatedTag = null;
        if (window.blogApi && window.blogApi.updateTag) {
            updatedTag = await window.blogApi.updateTag(tagKey, { name: nextTag, scope: 'global' }).catch(() => null);
        }

        replaceAvailableTag(oldTag, updatedTag || nextTag);
        replaceSelectedTag(oldTag, nextTag);
        showEditorFeedback('Tag alterada nos artigos existentes.');
        return true;
    };

    const renameExistingTag = (oldTag, tagKey = oldTag, tagItem = null) => {
        if (!oldTag || !tagItem) return;

        const nameButton = tagItem.querySelector('.blog-tag-name');
        if (!nameButton || tagItem.querySelector('.blog-tag-inline-input')) return;

        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'blog-tag-inline-input';
        input.value = oldTag;
        input.setAttribute('aria-label', `Editar tag ${oldTag}`);

        let isFinishing = false;
        const restoreTag = () => {
            if (!tagItem.isConnected) return;
            tagItem.outerHTML = renderAvailableTag({ id: tagKey, name: oldTag });
        };

        const finish = async (shouldSave) => {
            if (isFinishing) return;
            isFinishing = true;

            const nextTag = input.value.trim();
            if (!shouldSave || !nextTag || normalizeBlogSearch(nextTag) === normalizeBlogSearch(oldTag)) {
                restoreTag();
                return;
            }

            const didCommit = await commitTagRename(oldTag, nextTag, tagKey);
            if (!didCommit) restoreTag();
        };

        input.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                finish(true);
            }

            if (event.key === 'Escape') {
                event.preventDefault();
                finish(false);
            }
        });

        input.addEventListener('blur', () => finish(false));

        nameButton.replaceWith(input);
        input.focus();
        input.select();
    };

    const deleteExistingTag = async (tag, tagKey = tag) => {
        if (!tag) return;
        const usage = await getTagUsage(tagKey);
        const scope = await showBlogTagImpactDialog({
            title: usage.count > 0 ? 'Excluir tag em uso' : 'Excluir tag',
            message: usage.count > 0
                ? `A tag "${tag}" está sendo usada em ${usage.count} artigo${usage.count === 1 ? '' : 's'}.`
                : `Deseja excluir a tag "${tag}" da biblioteca?`,
            actions: usage.count > 0
                ? [
                    { value: 'catalog', label: 'Deixar nos artigos existentes', className: 'blog-editor-btn-outline' },
                    { value: 'global', label: 'Remover de todos', className: 'blog-editor-btn-primary' },
                    { value: 'cancel', label: 'Cancelar', className: 'blog-editor-btn-light' }
                ]
                : [
                    { value: 'catalog', label: 'Excluir tag', className: 'blog-editor-btn-primary' },
                    { value: 'cancel', label: 'Cancelar', className: 'blog-editor-btn-light' }
                ]
        });

        if (!scope || scope === 'cancel') return;

        if (window.blogApi) await window.blogApi.deleteTag(tagKey, { scope }).catch(() => null);
        removeAvailableTag(tag);

        if (scope === 'global') {
            removeSelectedTag(tag);
            showEditorFeedback('Tag removida de todos os artigos.');
            return;
        }

        showEditorFeedback('Tag removida da biblioteca. Artigos existentes foram mantidos.');
    };

    if (availableTags) {
        await loadAvailableTags();

        availableTags.addEventListener('click', (event) => {
            const actionButton = event.target.closest('[data-tag-action]');
            if (actionButton) {
                const tag = actionButton.dataset.tagName;
                const tagKey = actionButton.dataset.tagKey || tag;
                const tagItem = actionButton.closest('[data-tag-item]');
                if (actionButton.dataset.tagAction === 'rename') renameExistingTag(tag, tagKey, tagItem);
                if (actionButton.dataset.tagAction === 'delete') deleteExistingTag(tag, tagKey);
                return;
            }

            const button = event.target.closest('[data-tag]');
            if (!button) return;
            addSelectedTag(button.dataset.tag);
        });
    }

    if (selectedTags) {
        selectedTags.addEventListener('click', (event) => {
            const button = event.target.closest('[data-tag]');
            if (!button) return;

            removeSelectedTag(button.dataset.tag);
        });
    }

    if (addTagBtn && tagInput) {
        const createAndSelectTag = async () => {
            const tag = tagInput.value.trim();
            if (!tag) return;

            const createdTag = window.blogApi ? await window.blogApi.createTag(tag).catch(() => null) : null;
            addAvailableTag(createdTag || tag);
            addSelectedTag(tag);

            tagInput.value = '';
            tagInput.focus();
        };

        addTagBtn.addEventListener('click', createAndSelectTag);
        tagInput.addEventListener('keydown', (event) => {
            if (event.key !== 'Enter') return;
            event.preventDefault();
            createAndSelectTag();
        });
    }

    updateStatusPill(currentStatus);
}

function getProductGalleryImages(produto, fallbackLabel = 'Imagem do produto') {
    const rawImages = [
        produto?.imagem || '',
        ...(Array.isArray(produto?.imagens) ? produto.imagens : [])
    ];
    const map = new Map();

    rawImages
        .map(item => {
            const source = typeof item === 'string' ? { url: item } : (item || {});
            const titulo = String(source.titulo || source.title || source.label || '').trim();
            const alt = String(source.alt || source.filename || source.name || titulo || fallbackLabel).trim();
            return {
                url: normalizeStikAssetUrl(source.url || source.src || source.imagem || source.image || ''),
                titulo,
                alt
            };
        })
        .filter(item => item.url)
        .forEach(item => {
            const current = map.get(item.url);
            map.set(item.url, {
                url: item.url,
                titulo: item.titulo || current?.titulo || '',
                alt: item.alt || current?.alt || fallbackLabel
            });
        });

    return Array.from(map.values()).map((item, index) => ({
        ...item,
        label: item.titulo || (index === 0 ? 'Principal' : `Imagem ${index + 1}`)
    }));
}

function setupProductImageGallery(images, productName) {
    const galleryImages = Array.isArray(images) && images.length ? images : [];
    const imageCard = document.querySelector('.product-image-card');
    const mainProductImage = document.getElementById('main-product-image');
    const productThumbnails = document.querySelector('.product-thumbnails');
    const variationOptions = document.querySelector('.variation-options');
    if (!mainProductImage || !imageCard || !productThumbnails || !variationOptions) return;

    let activeIndex = 0;

    const renderState = () => {
        const activeImage = galleryImages[activeIndex] || galleryImages[0];
        if (!activeImage) return;

        mainProductImage.src = normalizeStikAssetUrl(activeImage.url);
        mainProductImage.alt = activeImage.alt || productName;
        imageCard.setAttribute('aria-label', `Abrir imagem ${activeIndex + 1} de ${galleryImages.length} do produto ${productName}`);

        variationOptions.querySelectorAll('[data-product-gallery-index]').forEach(button => {
            const isActive = Number(button.dataset.productGalleryIndex) === activeIndex;
            button.classList.toggle('is-active', isActive);
            button.setAttribute('aria-current', String(isActive));
        });

        productThumbnails.querySelectorAll('[data-product-gallery-dot]').forEach(button => {
            const isActive = Number(button.dataset.productGalleryDot) === activeIndex;
            button.classList.toggle('is-active', isActive);
            button.setAttribute('aria-label', `${isActive ? 'Imagem atual' : 'Ver imagem'} ${Number(button.dataset.productGalleryDot) + 1}`);
        });
    };

    imageCard.setAttribute('role', 'button');
    imageCard.setAttribute('tabindex', '0');
    imageCard.addEventListener('click', () => {
        const activeImage = galleryImages[activeIndex] || galleryImages[0];
        if (activeImage) openProductImageViewer(activeImage.url, activeImage.alt || productName);
    });
    imageCard.addEventListener('keydown', (event) => {
        if (event.key !== 'Enter' && event.key !== ' ') return;
        event.preventDefault();
        imageCard.click();
    });

    if (galleryImages.length <= 1) {
        productThumbnails.classList.remove('is-visible');
        variationOptions.innerHTML = '';
        productThumbnails.querySelector('.product-gallery-dots')?.remove();
        renderState();
        return;
    }

    productThumbnails.classList.add('is-visible');
    variationOptions.innerHTML = galleryImages
        .map((image, index) => `
            <button type="button" class="product-thumb-option" data-product-gallery-index="${index}" aria-label="Ver imagem ${index + 1}">
                <img src="${escapeAttribute(normalizeStikAssetUrl(image.url))}" alt="${escapeAttribute(image.alt || productName)}" loading="lazy" decoding="async">
                <span>${escapeHtml(image.label || `Imagem ${index + 1}`)}</span>
            </button>
        `)
        .join('');

    let dots = productThumbnails.querySelector('.product-gallery-dots');
    if (!dots) {
        dots = document.createElement('div');
        dots.className = 'product-gallery-dots';
        productThumbnails.appendChild(dots);
    }
    dots.innerHTML = galleryImages
        .map((_, index) => `<button type="button" data-product-gallery-dot="${index}" aria-label="Ver imagem ${index + 1}"></button>`)
        .join('');

    variationOptions.querySelectorAll('[data-product-gallery-index]').forEach(button => {
        button.addEventListener('click', () => {
            activeIndex = Number(button.dataset.productGalleryIndex);
            renderState();
        });
    });

    dots.querySelectorAll('[data-product-gallery-dot]').forEach(button => {
        button.addEventListener('click', () => {
            activeIndex = Number(button.dataset.productGalleryDot);
            renderState();
        });
    });

    renderState();
}

function openProductImageViewer(src, alt) {
    if (!src) return;
    let viewer = document.querySelector('.product-image-viewer');

    if (!viewer) {
        viewer = document.createElement('div');
        viewer.className = 'product-image-viewer';
        viewer.innerHTML = `
            <button type="button" class="product-image-viewer-close" aria-label="Fechar imagem">×</button>
            <img src="" alt="">
        `;
        document.body.appendChild(viewer);

        viewer.addEventListener('click', (event) => {
            if (event.target === viewer || event.target.closest('.product-image-viewer-close')) {
                viewer.classList.remove('is-open');
            }
        });

        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') viewer.classList.remove('is-open');
        });
    }

    const image = viewer.querySelector('img');
    image.src = normalizeStikAssetUrl(src);
    image.alt = alt || 'Imagem do produto';
    viewer.classList.add('is-open');
}

function carregarDetalhesDoProduto() {
    const params = new URLSearchParams(window.location.search);
    const produtoId = parseInt(params.get('id'));
    const produto = produtos.find(p => p.id === produtoId);

    if (produto) {
        const produtoLocalizado = getLocalizedProduct(produto);
        const nomeFormatado = produtoLocalizado.displayNome;
        const categoriaFormatada = produtoLocalizado.displayCategoria;
        const categoriaOriginal = normalizeCategoria(produto.categoria);
        const materialFormatado = produtoLocalizado.displayMaterial || translateStikPhrase('Não informado');
        const descricaoLocalizada = produtoLocalizado.displayDescricao || produto.descricao || '';
        const detalhesLocalizados = produtoLocalizado.displayDetails || produto.details || '';
        const imagensProduto = getProductGalleryImages(produto, nomeFormatado);
        const mainProductImage = document.getElementById('main-product-image');
        if (mainProductImage) {
            optimizeImageElement(mainProductImage, { loading: 'eager', fetchPriority: 'high' });
            mainProductImage.src = normalizeStikAssetUrl(imagensProduto[0]?.url || produto.imagem);
            mainProductImage.alt = nomeFormatado;
        }
        setupProductImageGallery(imagensProduto, nomeFormatado);
        const productNameEl = document.querySelector('.product-name');
        if (productNameEl) productNameEl.textContent = nomeFormatado;

        const categoryLabel = document.querySelector('.product-category-label');
        if (categoryLabel) categoryLabel.textContent = categoriaFormatada;

        const breadcrumbCategory = document.querySelector('.product-breadcrumb-category');
        if (breadcrumbCategory) {
            breadcrumbCategory.textContent = categoriaFormatada;
            breadcrumbCategory.href = `/categoria?categoria=${encodeURIComponent(categoriaOriginal)}`;
        }

        const breadcrumbCurrent = document.querySelector('.product-breadcrumb-current');
        if (breadcrumbCurrent) breadcrumbCurrent.textContent = nomeFormatado;

        const categoryValue = document.querySelector('.product-category-value');
        if (categoryValue) categoryValue.textContent = categoriaFormatada;

        const materialValue = document.querySelector('.product-material-value');
        if (materialValue) materialValue.textContent = materialFormatado;

        const subEl = document.querySelector('.product-subtitle');
        if (subEl) subEl.textContent = descricaoLocalizada;

        // Linha meta (Material | Categoria)
        const metaEl = document.querySelector('.product-meta');
        if (metaEl) {
            metaEl.textContent = detalhesLocalizados
                || getProductDetailsSourceText(produto);
        }

        // Renderiza cards 'Veja também' (produtos da mesma categoria, exceto o atual)
        setStikWhatsappLinksMessage(STIK_PRODUCT_WHATSAPP_MESSAGE, document, {
            product: nomeFormatado,
            category: categoriaFormatada
        });

        const grid = document.querySelector('.veja-tambem-grid');
        if (grid) {
            grid.innerHTML = '';
            const mesmaCategoria = produtos
                .filter(p => normalizeCategoria(p.categoria) === categoriaOriginal && p.id !== produto.id);
            const outrasCategorias = produtos
                .filter(p => normalizeCategoria(p.categoria) !== categoriaOriginal && p.id !== produto.id);

            [...mesmaCategoria, ...outrasCategorias].slice(0, 3).forEach(p => {
                const relatedProduct = getLocalizedProduct(p);
                const card = document.createElement('a');
                card.classList.add('produto-card');
                card.href = `/produto?id=${encodeURIComponent(p.id)}`;
                card.innerHTML = `${optimizedImageMarkup(p.imagem, relatedProduct.displayNome)}<h3>${escapeHtml(relatedProduct.displayNome)}</h3>`;
                grid.appendChild(card);
            });
        }

        trackStikEvent('product_view', {
            ...getProductAnalyticsPayload(produto),
            imageCount: imagensProduto.length
        }, { purpose: 'marketing' });

    } else {
        console.error("Produto não encontrado.");
    }
}

async function inicializarNewsletterCarousel() {
    const placeholder = document.getElementById('catalogo-placeholder');
    if (!placeholder) return;
    if (placeholder.dataset.catalogLoaded === 'true') {
        await applySiteContent(placeholder);
        applyStikTranslations(placeholder);
        return;
    }
    placeholder.dataset.catalogLoaded = 'true';

    fetch('catalogo.html')
        .then(response => response.text())
        .then(async html => {
            placeholder.innerHTML = html; 
            await applySiteContent(placeholder);
            applyStikTranslations(placeholder);
            inicializarAnimateOnScroll();
            initNewsletterCarouselEffects({ force: true });
            // re-bind do form do catálogo quando o HTML for injetado
            bindCatalogForm();
        })
        .catch(error => console.error('Erro ao carregar catálogo:', error));
}

// Bind do formulário que envia o catálogo via backend
function bindCatalogForm() {
    const form = document.getElementById('catalog-form');
    const input = document.getElementById('catalog-email');
    const feedback = document.getElementById('catalog-feedback');
    if (!form || !input || !feedback) return;
    prepareLazyRecaptcha(form);

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = input.value.trim();
        const consentCheckbox = document.getElementById('catalog-consent') || form.querySelector('.catalog-consent');
        const consent = !!(consentCheckbox && consentCheckbox.checked);
        feedback.style.color = '#fff';
        if (!email) {
            feedback.textContent = 'Por favor digite um e-mail válido.';
            return;
        }
        if (!consent) {
            feedback.textContent = 'Por favor aceite receber comunicações marcando a caixa de consentimento.';
            return;
        }

        feedback.textContent = 'Enviando catálogo...';
        try {
            await initRecaptcha();

            // tenta obter token reCAPTCHA se o widget estiver disponível
            let recaptchaToken = null;
            if (window.RECAPTCHA_SITE_KEY) {
                try {
                    recaptchaToken = await getRecaptchaToken('send_catalog', 6000);
                } catch (err) {
                    console.warn('Falha ao executar grecaptcha:', err);
                }
            }

            const payload = {
                email,
                consent,
                analytics: buildStikSubmissionAnalyticsSnapshot({ source: 'catalog_form' })
            };
            if (recaptchaToken) payload.recaptchaToken = recaptchaToken;

            const res = await fetch('/api/send-catalog', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                const data = await res.json();
                feedback.style.color = '#b3ffd9';
                feedback.textContent = data.message || 'Catálogo enviado! Verifique seu e-mail.';
                input.value = '';
            } else {
                const err = await res.json().catch(()=>({ message: 'Erro desconhecido' }));
                feedback.style.color = '#ffd1d1';
                feedback.textContent = err.message || 'Falha ao enviar. Tente novamente mais tarde.';
            }
        } catch (error) {
            console.error('Erro ao chamar API local:', error);
            feedback.style.color = '#ffd1d1';
            feedback.textContent = 'Erro de conexão. Tente novamente.';
        }
    });
}

// Animações ao rolar a página de 'surgir de baixo para cima'
function initDiferenciaisSequence() {
    const section = document.querySelector('.diferenciais-section');
    if (!section || section.dataset.sequenceReady === 'true') return;

    const items = Array.from(section.querySelectorAll('.diferencial-item'));
    if (!items.length) return;

    section.dataset.sequenceReady = 'true';
    section.classList.add('diferenciais-ready');

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const finishInstantly = () => {
        items.forEach(item => {
            item.classList.add('is-image-visible', 'is-title-visible', 'is-text-visible');
        });
    };

    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
        finishInstantly();
        return;
    }

    const animateItem = (item, onComplete) => {
        item.classList.add('is-image-visible');

        window.setTimeout(() => {
            item.classList.add('is-title-visible');

            window.setTimeout(() => {
                item.classList.add('is-text-visible');

                window.setTimeout(() => {
                    if (typeof onComplete === 'function') onComplete();
                }, 120);
            }, 130);
        }, 140);
    };

    const animateNextItem = (index = 0) => {
        const item = items[index];
        if (!item) return;
        animateItem(item, () => animateNextItem(index + 1));
    };

    let started = false;
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting || started) return;
            started = true;
            animateNextItem();
            observer.unobserve(entry.target);
        });
    }, { threshold: 0.3 });

    observer.observe(section);
}

function initInstitutionalPrinciplesAnimation() {
    const section = document.querySelector('.institutional-principles-section');
    if (!section || section.dataset.principlesAnimationReady === 'true') return;

    const cards = Array.from(section.querySelectorAll('.institutional-principle-card'));
    if (!cards.length) return;

    section.dataset.principlesAnimationReady = 'true';
    section.classList.add('principles-ready');

    const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    const finishInstantly = () => {
        cards.forEach(card => {
            card.classList.add('is-icon-visible', 'is-title-visible', 'is-text-visible');
        });
    };

    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
        finishInstantly();
        return;
    }

    const revealCard = (card, onComplete) => {
        card.classList.add('is-icon-visible');
        window.setTimeout(() => card.classList.add('is-title-visible'), 520);
        window.setTimeout(() => card.classList.add('is-text-visible'), 1220);
        window.setTimeout(() => {
            if (typeof onComplete === 'function') onComplete();
        }, 1700);
    };

    const revealNextCard = (index = 0) => {
        const card = cards[index];
        if (!card) return;
        revealCard(card, () => revealNextCard(index + 1));
    };

    let started = false;
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting || started) return;
            started = true;
            revealNextCard();
            observer.unobserve(entry.target);
        });
    }, { threshold: 0.24 });

    observer.observe(section);
}

function initInstitutionalTopImagesAnimation() {
    const section = document.querySelector('.institutional-story-hero');
    if (!section || section.dataset.topImagesAnimationReady === 'true') return;

    const photos = Array.from(section.querySelectorAll('.institutional-top-photo'));
    if (photos.length !== 3) return;

    section.dataset.topImagesAnimationReady = 'true';

    const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || !Element.prototype.animate) {
        section.classList.add('photos-waapi-ready');
        photos.forEach(photo => {
            photo.style.opacity = '1';
        });
        return;
    }

    const rotations = [-4, -3, 7];
    const verticalDrift = [-8, 10, -6];
    const entryOffsets = [-620, -560, -700];
    const entryRotations = [rotations[0] - 320, rotations[1] - 300, rotations[2] - 340];
    const revealPhoto = () => {
        section.classList.add('photos-waapi-ready');

        const revealAnimations = photos.map((photo, index) => photo.animate([
            {
                opacity: 0,
                transform: `translate3d(${entryOffsets[index]}px, 30px, 0) rotate(${entryRotations[index]}deg) scale(0.9)`
            },
            {
                opacity: 0.92,
                transform: `translate3d(${entryOffsets[index] * 0.32}px, 8px, 0) rotate(${rotations[index] - 74}deg) scale(0.98)`
            },
            {
                opacity: 1,
                transform: `translate3d(0, 0, 0) rotate(${rotations[index]}deg) scale(1)`
            }
        ], {
            duration: 1350,
            delay: index * 170,
            easing: 'cubic-bezier(.2, .9, .18, 1)',
            fill: 'both'
        }));

        Promise.all(revealAnimations.map(animation => animation.finished.catch(() => null))).then(() => {
            photos.forEach((photo, index) => {
                photo.animate([
                    { transform: `translate3d(0, 0, 0) rotate(${rotations[index]}deg)` },
                    { transform: `translate3d(0, ${verticalDrift[index]}px, 0) rotate(${rotations[index] + (index === 1 ? -1 : 1)}deg)` }
                ], {
                    duration: 4200 + index * 520,
                    delay: index * 220,
                    easing: 'ease-in-out',
                    iterations: Infinity,
                    direction: 'alternate'
                });
            });
        });
    };

    if (!('IntersectionObserver' in window)) {
        revealPhoto();
        return;
    }

    let started = false;
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting || started) return;
            started = true;
            revealPhoto();
            observer.unobserve(entry.target);
        });
    }, { threshold: 0.22 });

    observer.observe(section);
}

function inicializarAnimateOnScroll() {
    const elementosAnimar = Array.from(document.querySelectorAll('.animate-on-scroll'))
        .filter(elemento => elemento.dataset.scrollAnimationReady !== 'true' && !elemento.classList.contains('is-visible'));

    if (!elementosAnimar.length) {
        initDiferenciaisSequence();
        initInstitutionalTopImagesAnimation();
        initInstitutionalPrinciplesAnimation();
        return;
    }

    if (!('IntersectionObserver' in window)) {
        elementosAnimar.forEach(elemento => {
            elemento.dataset.scrollAnimationReady = 'true';
            elemento.classList.add('is-visible');
        });
        initDiferenciaisSequence();
        initInstitutionalTopImagesAnimation();
        initInstitutionalPrinciplesAnimation();
        return;
    }

    const isSmallViewport = window.matchMedia?.('(max-width: 768px)').matches;
    const observerOptions = {
        threshold: isSmallViewport ? 0.02 : 0.12,
        rootMargin: isSmallViewport ? '0px 0px 12% 0px' : '0px 0px -8% 0px'
    };

    const revealElement = (elemento) => {
        elemento.classList.add('is-visible');
        elemento.dataset.scrollAnimationReady = 'true';
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                revealElement(entry.target);
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    elementosAnimar.forEach(elemento => {
        elemento.dataset.scrollAnimationReady = 'true';
        observer.observe(elemento);
    });

    requestAnimationFrame(() => {
        elementosAnimar.forEach(elemento => {
            if (elemento.classList.contains('is-visible')) return;
            const rect = elemento.getBoundingClientRect();
            const preloadOffset = isSmallViewport ? window.innerHeight * 0.12 : 0;
            const isAlreadyInView = rect.top < window.innerHeight + preloadOffset && rect.bottom > 0;
            if (isAlreadyInView) {
                revealElement(elemento);
                observer.unobserve(elemento);
            }
        });
    });

    initDiferenciaisSequence();
    initInstitutionalTopImagesAnimation();
    initInstitutionalPrinciplesAnimation();

    // Reaproveita aqui para observar o hero e alternar a visibilidade do FAB
    const hero = document.querySelector('.video-hero-section');
    if (hero && 'IntersectionObserver' in window) {
        const heroObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                // ajuste o threshold conforme preferir (aqui 5% visível)
                if (entry.isIntersecting && entry.intersectionRatio > 0.05) {
                    document.body.classList.add('hero-in-view');
                } else {
                    document.body.classList.remove('hero-in-view');
                }
            });
        }, { threshold: [0, 0.05, 0.25] });
        heroObserver.observe(hero);
    }
}

// Função principal da área do Vídeo, ela quem deixa o vídeo como um espaço exclusivo para o vídeo
function inicializarHeaderIndex() {
    const topHeader = document.getElementById('mainHeader');
    const videoHeroSection = document.querySelector('.video-hero-section');
    const headerHoverArea = document.getElementById('header-hover-area');
    
    if (!topHeader || !videoHeroSection || !headerHoverArea) {
        return;
    }

    let videoHeroHeight = videoHeroSection.clientHeight;
    let isHeaderVisible = null;
    let isHeaderScrolled = null;
    let ticking = false;

    const showHeader = () => {
        if (isHeaderVisible === true) return;
        isHeaderVisible = true;
        topHeader.classList.remove('is-hidden');
        topHeader.classList.add('is-visible');
    };

    const hideHeader = () => {
        if (isHeaderVisible === false) return;
        isHeaderVisible = false;
        topHeader.classList.remove('is-visible');
        topHeader.classList.add('is-hidden');
    };

    const setScrolled = (scrolled) => {
        if (isHeaderScrolled === scrolled) return;
        isHeaderScrolled = scrolled;
        topHeader.classList.toggle('scrolled', scrolled);
    };

    const updateHeaderOnScroll = () => {
        if (window.scrollY > (videoHeroHeight - 100)) {
            showHeader();
            setScrolled(true);
        } else {
            setScrolled(false);
            if (!headerHoverArea.matches(':hover')) {
                hideHeader();
            }
        }
    };

    headerHoverArea.addEventListener('mouseenter', showHeader);

    window.addEventListener('scroll', () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => {
            ticking = false;
            updateHeaderOnScroll();
        });
    }, { passive: true });

    window.addEventListener('resize', () => {
        videoHeroHeight = videoHeroSection.clientHeight;
        updateHeaderOnScroll();
    }, { passive: true });

    updateHeaderOnScroll();
}

function inicializarHeaderPaginaSecundaria() {
    const topHeader = document.getElementById('mainHeader');
    if (topHeader) {
        topHeader.classList.add('is-visible', 'scrolled');
        topHeader.classList.remove('is-hidden');
    }
}


function inicializarPaginaFaq() {
    console.log("Página FAQ inicializada.");
}

function inicializarPaginaPolitica() {
    console.log("Página de Política de Privacidade inicializada.");
}

function inicializarPaginaTermos() {
    console.log("Página de Termos de Uso inicializada.");
}

function inicializarPaginaFaleConosco() {
    console.log("Página Fale Conosco inicializada.");
}

function inicializarHeroVideo() {
    const container = document.querySelector('.video-container');
    if (!container || container.dataset.heroMediaReady === 'true') return;
    container.dataset.heroMediaReady = 'true';

    const bindVideoEvents = media => {
        if (!media || media.tagName !== 'VIDEO' || media.dataset.heroVideoEventsReady === 'true') return;
        media.dataset.heroVideoEventsReady = 'true';
        media.addEventListener('loadeddata', () => {
            media.closest('.video-hero-section')?.classList.add('video-ready');
        }, { once: true });
        media.addEventListener('error', () => {
            media.closest('.video-hero-section')?.classList.add('video-autoplay-blocked');
        });
    };

    const applyHeroMedia = () => {
        const media = renderStikHeroMedia(container, true);
        bindVideoEvents(media);
    };

    applyHeroMedia();

    document.addEventListener('touchstart', () => {
        playStikHeroVideo(container.querySelector('#institutionalVideo'));
    }, { once: true, passive: true });
    document.addEventListener('visibilitychange', () => {
        if (!document.hidden) playStikHeroVideo(container.querySelector('#institutionalVideo'));
    });

    let resizeTimer = 0;
    window.addEventListener('resize', () => {
        window.clearTimeout(resizeTimer);
        resizeTimer = window.setTimeout(() => {
            const previousVideo = container.querySelector('#institutionalVideo');
            const currentTime = previousVideo?.currentTime || 0;
            applyHeroMedia();
            const nextVideo = container.querySelector('#institutionalVideo');
            if (nextVideo) nextVideo.currentTime = Math.min(currentTime, nextVideo.duration || currentTime);
            playStikHeroVideo(nextVideo);
        }, 180);
    });
}


// Função principal de inicialização da página
async function inicializarPagina() {
    if (window.STIK_ADMIN_FRONTEND_BLOCKED) return;

    // Carrega todos os componentes em paralelo e espera que todos terminem
    await Promise.all([
        carregarComponente('header-placeholder', 'header.html'),
        carregarComponente('sidebar-placeholder', 'sidebar.html'),
        carregarComponente('footer-placeholder', 'footer.html')
    ]);
    removeStikAdminLinksOnPublicHost();
    await initializeStikI18n();
    renderDynamicSidebarCategories();
    inicializarTema();
    inicializarPesquisa();
    inicializarMenu();
    restoreSidebarState();

    // AGORA, com os componentes carregados, executa a lógica da página
    const pathname = window.location.pathname.replace(/\/+$/, ''); // sem trailing slash
    const isIndexPage = pathname === '' || pathname === '/' || pathname.endsWith('index.html');
    const isCategoryPage = /\/categoria(\.html)?$/.test(pathname);
    const isProductPage = /\/produto(\.html)?$/.test(pathname);
    const isBlogPage = /\/blog(\.html)?$/.test(pathname);
    const isArticlePage = /\/artigo(\.html)?$/.test(pathname);
    const isCreateArticlePage = /\/create-article(\.html)?$/.test(pathname);
    const isAdminPage = /\/admin(\.html)?$/.test(pathname);
    document.body.classList.toggle('admin-active', isAdminPage);
    const isFaqPage = /\/faq(\.html)?$/.test(pathname);
    const isPoliticaPage = /\/(?:politica_de_privacidade|politica-de-privacidade)(\.html)?$/.test(pathname);
    const isTermosPage = /\/(?:termos_de_uso|termos-de-uso)(\.html)?$/.test(pathname);
    const isFaleConoscoPage = /\/(?:fale_conosco|fale-conosco)(\.html)?$/.test(pathname);
    const isDadosCapturadosPage = /\/(?:dados_capturados|dados-capturados)(\.html)?$/.test(pathname);
    if (guardStikInternalPreviewPage()) return;

    // Função utilitária que injeta o template da página caso ainda não esteja presente
    async function ensurePageTemplate(templateUrl) {
        const mainPlaceholder = document.getElementById('main-content-placeholder');
        if (!mainPlaceholder) return;
        // detecta presença de marcações específicas simples para decidir se já foi injetado
        const hasTemplate = mainPlaceholder.querySelector('.page-ready, .product-container, .blog-list, .article-detail, .category-page, .catalogo-section');
        if (!hasTemplate) {
            await carregarConteudoPrincipal(templateUrl + window.location.search);
            // carregarConteudoPrincipal já chama inicializarAnimateOnScroll etc.
            return true;
        }
        return false;
    }
    
    if (isIndexPage) {
        applySiteContent(document);
        inicializarHeroVideo();
        inicializarHeaderIndex();
        exibirCategorias(produtos);
        initBannerCarousel();
        setupInfiniteCatalogCarousel(document.getElementById('lista-produtos'));
    } else {
        inicializarHeaderPaginaSecundaria();
    }

    if (isProductPage) {
        carregarDetalhesDoProduto();
    } else if (isBlogPage) {
        await displayArticles(); // Adicionado await para garantir que os artigos sejam carregados
    } else if (isArticlePage) {
        await carregarArtigo(); // Adicionado await
    } else if (isCreateArticlePage) {
        setupArticleForm();
    } else if (isAdminPage) {
        await setupAdminPage();
    } else if (isFaqPage) {
        inicializarPaginaFaq();
    } else if (isPoliticaPage) {
        inicializarPaginaPolitica();
    } else if (isTermosPage) {
        inicializarPaginaTermos();
    } else if (isFaleConoscoPage) {
        inicializarPaginaFaleConosco();
    } else if (isDadosCapturadosPage) {
        inicializarPaginaDadosCapturados();
    } else if (isCategoryPage) {
        renderCategoriaPage();
    }

    if (!isStikInternalPreviewPage()) {
        applySiteContent(document);
        applyStikTranslations(document);
    }
    
    // Funções que podem rodar por último
    deferInit(() => {
        inicializarNewsletterCarousel();
        prepareLazyRecaptcha();
        inicializarAnimateOnScroll();
    });

    const linkIntitucional = document.getElementById('link-institucional');
    if (linkIntitucional) {
        linkIntitucional.addEventListener('click', (event) => {
            event.preventDefault();
            carregarComponente('main-content-placeholder', 'institucional.html');
        });
    }
}


let recaptchaInitPromise = null;

function prepareLazyRecaptcha(scope = document) {
    const root = scope && scope.querySelectorAll ? scope : document;
    const forms = root.matches && root.matches('#catalog-form, .contact-form')
        ? [root]
        : Array.from(root.querySelectorAll('#catalog-form, .contact-form'));

    forms.forEach(form => {
        if (form.dataset.recaptchaLazyReady === 'true') return;
        form.dataset.recaptchaLazyReady = 'true';

        const warmUp = () => {
            initRecaptcha();
        };

        form.addEventListener('focusin', warmUp, { once: true });
        form.addEventListener('pointerenter', warmUp, { once: true });
    });
}

async function getRecaptchaToken(action = 'contact', timeout = 6000) {
  if (!window.RECAPTCHA_SITE_KEY) return null;
  const start = Date.now();
  while (!window.grecaptcha) {
    if (Date.now() - start > timeout) return null;
    await new Promise(r => setTimeout(r, 150));
  }
  try {
    await new Promise(resolve => window.grecaptcha.ready(resolve));
    const token = await window.grecaptcha.execute(window.RECAPTCHA_SITE_KEY, { action });
    return token || null;
  } catch (err) {
    console.warn('getRecaptchaToken falhou:', err);
    return null;
  }
}

// Bind para o formulário "Fale Conosco"
function bindContactForm() {
  const form = document.querySelector('.contact-form');
  if (!form) return;
  prepareLazyRecaptcha(form);

  // cria feedback se não houver
  let feedback = document.getElementById('contact-feedback');
  if (!feedback) {
    feedback = document.createElement('div');
    feedback.id = 'contact-feedback';
    feedback.style.marginTop = '10px';
    form.appendChild(feedback);
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const nameInput = form.querySelector('#name');
    const emailInput = form.querySelector('#email');
    const messageInput = form.querySelector('#message');

    const name = nameInput ? nameInput.value.trim() : '';
    const email = emailInput ? emailInput.value.trim() : '';
    const message = messageInput ? messageInput.value.trim() : '';

    feedback.style.color = '';
    if (!name || !email || !message) {
      feedback.textContent = 'Por favor preencha nome, e-mail e mensagem.';
      feedback.style.color = 'red';
      return;
    }

    feedback.textContent = 'Enviando mensagem...';

    try {
      await initRecaptcha();

      // tenta obter token reCAPTCHA se disponível
      let recaptchaToken = null;
      if (window.RECAPTCHA_SITE_KEY) {
        recaptchaToken = await getRecaptchaToken('contact', 6000);
        if (!recaptchaToken) console.warn('recaptchaToken não obtido para contact');
      }

      const payload = {
        name,
        email,
        message,
        analytics: buildStikSubmissionAnalyticsSnapshot({ source: 'contact_form' })
      };
      if (recaptchaToken) payload.recaptchaToken = recaptchaToken;

      const res = await fetch('/api/send-contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        feedback.style.color = '#b3ffd9';
        feedback.textContent = data.message || 'Mensagem enviada com sucesso.';
        form.reset();
      } else {
        feedback.style.color = '#ffd1d1';
        feedback.textContent = data.message || 'Erro ao enviar. Tente novamente mais tarde.';
        console.warn('send-contact erro:', res.status, data);
      }
    } catch (err) {
      console.error('Erro ao chamar /api/send-contact:', err);
      feedback.style.color = '#ffd1d1';
      feedback.textContent = 'Erro de conexão. Tente novamente.';
    }
  });
}

// chama bindContactForm quando inicializa a página de "Fale Conosco"
function inicializarPaginaFaleConosco() {
  console.log("Página Fale Conosco inicializada.");
  bindContactForm();
}


// Inicializa reCAPTCHA v3 se a site key estiver disponível via /api/config
async function initRecaptcha() {
    if (window.grecaptcha && window.RECAPTCHA_SITE_KEY) return true;
    if (recaptchaInitPromise) return recaptchaInitPromise;

    recaptchaInitPromise = (async () => {
        try {
            if (!window.RECAPTCHA_SITE_KEY) {
                const res = await fetch('/api/config');
                const cfg = await res.json();
                if (cfg && cfg.recaptchaSiteKey) {
                    window.RECAPTCHA_SITE_KEY = cfg.recaptchaSiteKey;
                }
            }

            if (!window.RECAPTCHA_SITE_KEY) return false;

            const existingScript = document.querySelector('script[src*="recaptcha/api.js"]');
            if (existingScript) {
                return true;
            }

            await new Promise((resolve, reject) => {
                const script = document.createElement('script');
                script.src = `https://www.google.com/recaptcha/api.js?render=${encodeURIComponent(window.RECAPTCHA_SITE_KEY)}`;
                script.async = true;
                script.defer = true;
                script.onload = () => resolve();
                script.onerror = () => reject(new Error('Falha ao carregar reCAPTCHA'));
                document.head.appendChild(script);
            });

            return true;
        } catch (err) {
            recaptchaInitPromise = null;
            console.warn('Não foi possível inicializar reCAPTCHA:', err);
            return false;
        }
    })();

    return recaptchaInitPromise;
}

(function handleNewsletterSidebarLinks() {
  document.addEventListener('click', function (e) {
    const link = e.target.closest('a[href="#catalogo"], a[href="#newsletter"], a[data-sidebar-route="catalogo"]');
    if (!link) return;

    e.preventDefault();

    const target = document.getElementById('catalogo') || document.getElementById('newsletter');
    if (target) {
      // rolar suavemente até a seção existente e atualizar o hash sem pular
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      try {
        history.replaceState(null, '', '#catalogo');
        if (typeof highlightCurrentSidebarLink === 'function') {
            highlightCurrentSidebarLink();
        }
      } catch (err) { /* ignore */ }
    } else {
      // não existe na página atual -> redireciona para /#catalogo
      // ajuste o caminho se seu index estiver em outra rota
      window.location.href = '/#catalogo';
    }
  }, false);
})();

/**
 * Scroll suave avançado: mantém a velocidade inicial do scroll,
 * mas suaviza a desaceleração no final, para uma sensação mais natural.
 * Chame esta função para rolar até targetY (em px) com duração e easing customizados.
 */
function scrollToTargetEasingCustom(targetY, duration = 200, easing = 'easeInOutCubic') {
    const startY = window.scrollY;
    const distance = targetY - startY;
    const startTime = performance.now();

    const easings = {
        linear: t => t,
        easeInCubic: t => t * t * t,
        easeOutCubic: t => 1 - Math.pow(1 - t, 3),
        easeInOutCubic: t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
    };

    const easeFn = easings[easing] || easings.easeInOutCubic;

    function animate(now) {
        const elapsed = now - startTime;
        const t = Math.min(1, elapsed / duration);
        const eased = easeFn(t);
        window.scrollTo(0, startY + distance * eased);
        if (t < 1) {
            requestAnimationFrame(animate);
        }
    }
    requestAnimationFrame(animate);
}

// Aplica o scroll suave em todos os links âncora internos (ex: <a href="#secao">)
document.addEventListener('DOMContentLoaded', async () => {
    await inicializarPagina();
    initTemporaryAnalytics();

    // ativa micro-interações depois que a página foi inicializada
    try { initMicroInteractions(); } catch (e) { console.warn('initMicroInteractions falhou:', e); }

    document.querySelectorAll("a[href^='#']:not([href='#'])").forEach(link => {
        link.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href').slice(1);
            const target = document.getElementById(targetId);
            if (target) {
                e.preventDefault();
                // Calcula a posição do topo do elemento
                const rect = target.getBoundingClientRect();
                const targetY = rect.top + window.scrollY;
                scrollToTargetEasingCustom(targetY, 200, 'easeInOutCubic');
                // Atualiza o hash na URL sem pular
                history.replaceState(null, '', `#${targetId}`);
            }
        });
    });
});

// ---------- Funções de cookies e geolocalização (adicionadas) ----------

function setCookie(name, value, days = 30) {
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    const secure = window.location.protocol === 'https:' ? '; Secure' : '';
    document.cookie = name + '=' + encodeURIComponent(value) + '; expires=' + expires + '; path=/; SameSite=Lax' + secure;
}

function getCookie(name) {
    return document.cookie.split('; ').reduce((r, v) => {
        const parts = v.split('=');
        return parts[0] === name ? decodeURIComponent(parts.slice(1).join('=')) : r;
    }, null);
}

function fetchStikWithTimeout(url, options = {}, timeoutMs = 8000) {
    if (typeof AbortController === 'undefined') {
        return fetch(url, options);
    }

    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), timeoutMs);
    return fetch(url, {
        ...options,
        signal: controller.signal
    }).finally(() => window.clearTimeout(timer));
}

async function reverseGeocode(lat, lon) {
    try {
        // Use Nominatim (OpenStreetMap) para reverse geocoding sem chave
        const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}&addressdetails=1`;
        const res = await fetchStikWithTimeout(url, { headers: { 'Accept-Language': 'pt-BR' } }, 6000);
        if (!res.ok) throw new Error('status ' + res.status);
        const data = await res.json();
        const address = data.address || {};
        const city = address.city
            || address.town
            || address.village
            || address.municipality
            || address.city_district
            || address.suburb
            || address.county
            || null;
        const state = address.state || address.region || address.state_district || null;
        return { city, state, raw: data };
    } catch (err) {
        console.warn('reverseGeocode falhou:', err);
        return { city: null, state: null, raw: null };
    }
}

function hasUsableLocation(location) {
    if (!location || typeof location !== 'object') return false;
    const hasCoordinateValues = location.lat !== undefined
        && location.lat !== null
        && location.lon !== undefined
        && location.lon !== null
        && String(location.lat).trim() !== ''
        && String(location.lon).trim() !== '';
    const hasCoordinates = hasCoordinateValues && Number.isFinite(Number(location.lat)) && Number.isFinite(Number(location.lon));
    return hasCoordinates || Boolean(location.city || location.state);
}

function hasUsableCoordinates(location) {
    if (!location || typeof location !== 'object') return false;
    return location.lat !== undefined
        && location.lat !== null
        && location.lon !== undefined
        && location.lon !== null
        && String(location.lat).trim() !== ''
        && String(location.lon).trim() !== ''
        && Number.isFinite(Number(location.lat))
        && Number.isFinite(Number(location.lon));
}

async function collectLocation() {
    // retorna {city, state}; coordenadas sao usadas apenas no navegador para reverse geocoding.
    // primeiro tenta cookies/localStorage
    const cached = getCookie('stik_location');
    if (cached) {
        try {
            const parsed = JSON.parse(cached);
            if (hasUsableCoordinates(parsed) && (!parsed.city || !parsed.state)) {
                const geo = await reverseGeocode(parsed.lat, parsed.lon);
                const enriched = {
                    city: parsed.city || geo.city,
                    state: parsed.state || geo.state
                };
                try { setCookie('stik_location', JSON.stringify(enriched), 7); } catch(e) { /* ignore */ }
                return enriched;
            }
            return parsed;
        } catch(e) { /* ignore */ }
    }

    // tenta geolocation do browser
    if (!('geolocation' in navigator)) {
        return { lat: null, lon: null, city: null, state: null };
    }

    return new Promise((resolve) => {
        const timer = setTimeout(() => {
            // timeout -> retorna vazio
            resolve({ lat: null, lon: null, city: null, state: null });
        }, 10000);

        navigator.geolocation.getCurrentPosition(async (pos) => {
            clearTimeout(timer);
            const lat = pos.coords.latitude;
            const lon = pos.coords.longitude;
            const geo = await reverseGeocode(lat, lon);
            const payload = { city: geo.city, state: geo.state };
            try { setCookie('stik_location', JSON.stringify(payload), 7); } catch(e) { /* ignore */ }
            resolve(payload);
        }, (err) => {
            clearTimeout(timer);
            console.warn('geolocation error:', err);
            resolve({ lat: null, lon: null, city: null, state: null });
        }, { enableHighAccuracy: false, timeout: 8000, maximumAge: 600000 });
    });
}

async function sendLocationToServer({ city, state }) {
    try {
        const payload = {
            city,
            state,
            analytics: buildStikSubmissionAnalyticsSnapshot({ source: 'send_location' })
        };
        const res = await fetchStikWithTimeout('/api/send-location', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        }, 8000);
        const data = await res.json().catch(()=>({}));
        if (!res.ok) {
            console.warn('send-location falhou:', res.status, data);
            return { ok: false, status: res.status, data };
        }
        return { ok: true, status: res.status, data };
    } catch (err) {
        console.error('Erro ao enviar localização ao servidor:', err);
        return { ok: false, error: err };
    }
}

/**
 * collectAndSendLocation()
 * - pede permissao de geolocalizacao, faz reverse-geocode e envia apenas cidade/estado ao servidor
 */
async function collectAndSendLocation() {
    if (!hasStikConsent('location')) {
        return {
            loc: null,
            result: {
                ok: false,
                status: 403,
                data: { message: 'Localizacao nao autorizada pelo banner de dados.' }
            }
        };
    }

    const loc = await collectLocation();
    if (!hasUsableLocation(loc) || (!loc.city && !loc.state)) {
        return {
            loc,
            result: {
                ok: false,
                status: 400,
                data: { message: 'Cidade/estado nao autorizado ou indisponivel.' }
            }
        };
    }
    const result = await sendLocationToServer(loc);
    return { loc, result };
}

// expõe a função globalmente para uso em console ou botões
window.collectAndSendLocation = collectAndSendLocation;

// ---------- Fim das funções de localização ----------

// -------- Página de Categoria: lista produtos por categoria --------
function renderCategoriaPage() {
    const params = new URLSearchParams(window.location.search);
    let categoria = params.get('categoria') || '';
    try { categoria = decodeURIComponent(categoria); } catch (_) {}

    const catNorm = normalizeCategoria(categoria);
    const categoryName = catNorm || 'Categoria';
    const displayCategoryName = getLocalizedCategoryName(categoryName);
    const container = document.getElementById('categoria-container');

    if (!container) return;

    const titulo = document.getElementById('categoria-title');
    if (titulo) setStikRawText(titulo, displayCategoryName);

    const breadcrumbCurrent = document.getElementById('categoria-breadcrumb-current');
    if (breadcrumbCurrent) setStikRawText(breadcrumbCurrent, displayCategoryName);

    const countEl = document.getElementById('categoria-count');
    const sortEl = document.getElementById('categoria-sort');
    const sortDropdown = document.getElementById('categoria-sort-dropdown');
    const sortTrigger = document.getElementById('categoria-sort-trigger');
    const sortCurrent = document.getElementById('categoria-sort-current');
    const sortMenu = document.getElementById('categoria-sort-menu');
    const showMoreButton = document.getElementById('categoria-show-more');
    const itensBase = produtos.filter(produto => normalizeCategoria(produto.categoria) === catNorm);
    const INITIAL_VISIBLE_ITEMS = 9;
    let visibleItemsCount = INITIAL_VISIBLE_ITEMS;

    if (countEl) {
        countEl.textContent = getStikProductCountLabel(itensBase.length);
    }

    const sortItems = (items, sortValue) => {
        const ordered = [...items];

        if (sortValue === 'name-asc') {
            ordered.sort((a, b) => getLocalizedProduct(a).displayNome.localeCompare(getLocalizedProduct(b).displayNome, stikCurrentLanguage === 'pt' ? 'pt-BR' : stikCurrentLanguage));
        } else if (sortValue === 'name-desc') {
            ordered.sort((a, b) => getLocalizedProduct(b).displayNome.localeCompare(getLocalizedProduct(a).displayNome, stikCurrentLanguage === 'pt' ? 'pt-BR' : stikCurrentLanguage));
        }

        return ordered;
    };

    const renderItems = (sortValue = 'relevance') => {
        const itens = sortItems(itensBase, sortValue);
        container.innerHTML = '';

        if (!itens.length) {
            container.innerHTML = `<p class="no-results">${escapeHtml(translateStikPhrase('Nenhum produto nesta categoria.'))}</p>`;
            if (showMoreButton) showMoreButton.hidden = true;
            return;
        }

        const frag = document.createDocumentFragment();
        itens.slice(0, visibleItemsCount).forEach(produto => {
            const displayProduct = getLocalizedProduct(produto);
            const card = document.createElement('a');
            card.href = `/produto?id=${encodeURIComponent(produto.id)}`;
            card.classList.add('produto-card');

            card.innerHTML = `
                ${optimizedImageMarkup(produto.imagem, displayProduct.displayNome)}
                <h3>${escapeHtml(displayProduct.displayNome)}</h3>
            `;

            frag.appendChild(card);
        });

        container.appendChild(frag);

        if (showMoreButton) {
            showMoreButton.hidden = itens.length <= visibleItemsCount;
        }
    };

    const closeSortMenu = () => {
        if (!sortDropdown) return;
        sortDropdown.removeAttribute('open');
    };

    const syncSortUI = (value) => {
        if (sortEl) sortEl.value = value;
        if (sortCurrent && sortEl) {
            const option = Array.from(sortEl.options).find(item => item.value === value);
            sortCurrent.textContent = option ? translateStikPhrase(option.textContent) : translateStikPhrase('Relevância');
        }

        if (sortMenu) {
            sortMenu.querySelectorAll('.category-sort-option').forEach(button => {
                const isSelected = button.dataset.value === value;
                button.classList.toggle('is-selected', isSelected);
                button.setAttribute('aria-selected', String(isSelected));
            });
        }
    };

    if (sortEl && sortMenu) {
        sortMenu.innerHTML = '';
        Array.from(sortEl.options).forEach(option => {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'category-sort-option';
            button.dataset.value = option.value;
            button.setAttribute('role', 'option');
            button.textContent = translateStikPhrase(option.textContent);
            button.addEventListener('click', () => {
                syncSortUI(option.value);
                closeSortMenu();
                renderItems(option.value);
            });
            sortMenu.appendChild(button);
        });
    }

    if (sortEl && sortDropdown && sortMenu && !sortDropdown.dataset.customBound) {
        sortDropdown.dataset.customBound = 'true';

        document.addEventListener('click', (event) => {
            if (!sortDropdown.contains(event.target)) {
                closeSortMenu();
            }
        });

        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                closeSortMenu();
            }
        });
    }

    if (sortEl) {
        sortEl.value = 'relevance';
        sortEl.addEventListener('change', () => {
            visibleItemsCount = INITIAL_VISIBLE_ITEMS;
            syncSortUI(sortEl.value);
            renderItems(sortEl.value);
        });
    }

    if (showMoreButton && !showMoreButton.dataset.bound) {
        showMoreButton.dataset.bound = 'true';
        showMoreButton.addEventListener('click', () => {
            visibleItemsCount += INITIAL_VISIBLE_ITEMS;
            renderItems(sortEl ? sortEl.value : 'relevance');
        });
    }

    syncSortUI(sortEl ? sortEl.value : 'relevance');
    renderItems(sortEl ? sortEl.value : 'relevance');
    trackStikEvent('category_view', {
        category: categoryName,
        productCount: itensBase.length
    }, { purpose: 'marketing' });
}

function formatAnalyticsDate(value) {
    if (!value) return 'Sem data';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'Data inválida';
    return new Intl.DateTimeFormat('pt-BR', {
        dateStyle: 'short',
        timeStyle: 'short'
    }).format(date);
}

function getAnalyticsValue(value, fallback = 'Não informado') {
    if (value === null || value === undefined || value === '') return fallback;
    return String(value);
}

function getAnalyticsEventLabel(eventName) {
    const labels = {
        page_view: 'Página visualizada',
        product_view: 'Produto visualizado',
        product_click: 'Clique em produto',
        category_view: 'Categoria visualizada',
        search_performed: 'Busca realizada',
        whatsapp_click: 'Clique no WhatsApp',
        catalog_request: 'Catálogo solicitado',
        contact_form_submit: 'Formulário enviado',
        data_consent_update: 'Consentimento atualizado',
        location_shared: 'Localização enviada'
    };
    return labels[eventName] || eventName || 'Evento';
}

function countBy(items, getKey) {
    const counts = new Map();
    items.forEach(item => {
        const key = getKey(item);
        if (!key) return;
        counts.set(key, (counts.get(key) || 0) + 1);
    });
    return Array.from(counts.entries())
        .map(([label, count]) => ({ label, count }))
        .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label, 'pt-BR'));
}

function buildEventStats(events = []) {
    const stats = new Map();

    events.forEach(event => {
        const eventName = event.eventName || event.name;
        if (!STIK_TRACKABLE_EVENT_NAMES.has(eventName)) return;
        const occurredAt = event.occurredAt || event.lastOccurredAt || event.firstOccurredAt || null;
        const current = stats.get(eventName) || {
            eventName,
            count: 0,
            firstOccurredAt: occurredAt,
            lastOccurredAt: occurredAt
        };
        current.count += Number(event.count) || 1;
        if (occurredAt && (!current.firstOccurredAt || new Date(occurredAt) < new Date(current.firstOccurredAt))) {
            current.firstOccurredAt = occurredAt;
        }
        if (occurredAt && (!current.lastOccurredAt || new Date(occurredAt) > new Date(current.lastOccurredAt))) {
            current.lastOccurredAt = occurredAt;
        }
        stats.set(eventName, current);
    });

    return Array.from(stats.values())
        .sort((a, b) => (Number(b.count) || 0) - (Number(a.count) || 0) || getAnalyticsEventLabel(a.eventName).localeCompare(getAnalyticsEventLabel(b.eventName), 'pt-BR'));
}

function buildProductInterest(events = []) {
    const products = new Map();

    events.forEach(event => {
        if (event.eventName !== 'product_view') return;
        const productName = event.productName || event.metadata?.productName;
        const productId = event.productId || event.metadata?.productId || productName || 'sem-produto';
        if (!productName) return;

        const key = productId || productName;
        const current = products.get(key) || {
            productName,
            category: event.category || event.metadata?.category || 'Sem categoria',
            interestCount: 0,
            firstInterestedAt: event.occurredAt,
            lastInterestedAt: event.occurredAt
        };

        current.interestCount += 1;
        current.lastInterestedAt = event.occurredAt || current.lastInterestedAt;
        products.set(key, current);
    });

    return Array.from(products.values())
        .sort((a, b) => b.interestCount - a.interestCount || new Date(b.lastInterestedAt || 0) - new Date(a.lastInterestedAt || 0));
}

async function loadCapturedAnalytics() {
    const status = document.getElementById('analytics-status');
    if (status) {
        status.textContent = 'Carregando insights de visitantes...';
        status.classList.remove('is-error');
    }

    try {
        const response = await fetch('/api/analytics/debug', {
            cache: 'no-store'
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || 'Não foi possível carregar os dados.');
        }

        window.__stikCapturedAnalyticsData = data;
        renderCapturedAnalytics(data);

        if (status) {
            const updatedAt = data.meta?.updatedAt ? formatAnalyticsDate(data.meta.updatedAt) : 'sem data';
            status.textContent = `Insights carregados. Última atualização do arquivo: ${updatedAt}.`;
        }
    } catch (error) {
        console.error('Falha ao carregar insights de visitantes:', error);
        if (status) {
            status.textContent = 'Não foi possível carregar os insights de visitantes. Verifique se o servidor local está rodando.';
            status.classList.add('is-error');
        }
    }
}

async function requestCapturedAnalyticsLocation() {
    const status = document.getElementById('analytics-status');
    if (status) {
        status.textContent = 'Solicitando permissão de localização no navegador...';
        status.classList.remove('is-error');
    }

    if (typeof collectAndSendLocation !== 'function') {
        if (status) {
            status.textContent = 'A função de localização não está disponível nesta página.';
            status.classList.add('is-error');
        }
        return;
    }

    const { loc, result } = await collectAndSendLocation();
    if (!result?.ok) {
        if (status) {
            status.textContent = 'Não foi possível registrar a localização. Verifique se a permissão foi concedida no navegador.';
            status.classList.add('is-error');
        }
        return;
    }

    if (status) {
        const place = [loc.city, loc.state].filter(Boolean).join(' / ') || 'cidade/estado registrado';
        status.textContent = `Cidade/estado registrado: ${place}.`;
    }
    await loadCapturedAnalytics();
}

const STIK_ANALYTICS_PAGE_SIZE = 20;
const STIK_ANALYTICS_USERS_PAGE_SIZE = 10;

function normalizeMinimizedAnalyticsData(data = {}) {
    const users = Array.isArray(data.users)
        ? data.users.map(user => ({
            ...user,
            id: user.id || user.anonymousId || null,
            email: user.email || null,
            city: user.city || null,
            state: user.state || null,
            device: user.device || null,
            productInterests: Array.isArray(user.productInterests)
                ? user.productInterests.map(product => ({
                    ...product,
                    interestCount: Number(product.interestCount) || Math.max(Number(product.views) || 0, Number(product.clicks) || 0, 1),
                    firstInterestedAt: product.firstInterestedAt || product.firstSeenAt,
                    lastInterestedAt: product.lastInterestedAt || product.lastSeenAt
                }))
                : []
        }))
        : [];

    const contacts = Array.isArray(data.contacts)
        ? data.contacts
        : (Array.isArray(data.leads) ? data.leads.map(lead => ({
            email: lead.email || null,
            firstSubmittedAt: lead.firstSubmittedAt,
            lastSubmittedAt: lead.lastSubmittedAt
        })) : []);

    const productInterests = Array.isArray(data.productInterests)
        ? data.productInterests.map(product => ({
            ...product,
            interestCount: Number(product.interestCount) || Math.max(Number(product.views) || 0, Number(product.clicks) || 0, 1),
            firstInterestedAt: product.firstInterestedAt || product.firstSeenAt,
            lastInterestedAt: product.lastInterestedAt || product.lastSeenAt
        }))
        : buildProductInterest(Array.isArray(data.events) ? data.events : []);

    const devices = Array.isArray(data.devices)
        ? data.devices
        : countBy(Array.isArray(data.sessions) ? data.sessions : [], session => {
            const device = session.device || {};
            const platform = device.platform || 'Nao informado';
            const language = device.language || device.languages?.[0] || 'Nao informado';
            return `${platform} / ${language}`;
        }).map(item => ({
            type: 'Dispositivo',
            platform: item.label,
            browser: 'Nao informado',
            screen: {},
            count: item.count,
            lastSeenAt: null
        }));

    const locations = (Array.isArray(data.locations) ? data.locations : [])
        .map(location => ({
            city: location.city || null,
            state: location.state || null,
            count: Number(location.count) || 1,
            firstCollectedAt: location.firstCollectedAt || location.collectedAt,
            lastCollectedAt: location.lastCollectedAt || location.collectedAt
        }))
        .filter(location => location.city || location.state);

    const eventStats = Array.isArray(data.eventStats)
        ? data.eventStats.map(eventStat => ({
            ...eventStat,
            eventName: eventStat.eventName || eventStat.name,
            count: Number(eventStat.count) || 1,
            firstOccurredAt: eventStat.firstOccurredAt || eventStat.occurredAt,
            lastOccurredAt: eventStat.lastOccurredAt || eventStat.occurredAt
        })).filter(eventStat => STIK_TRACKABLE_EVENT_NAMES.has(eventStat.eventName))
        : buildEventStats(Array.isArray(data.events) ? data.events : []);

    return { users, contacts, productInterests, devices, locations, eventStats };
}

function getAnalyticsPageSize(key) {
    return key === 'users' ? STIK_ANALYTICS_USERS_PAGE_SIZE : STIK_ANALYTICS_PAGE_SIZE;
}

function getAnalyticsPage(key, totalItems) {
    window.__stikAnalyticsPages = window.__stikAnalyticsPages || {};
    const pageSize = getAnalyticsPageSize(key);
    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
    const page = Math.min(Math.max(Number(window.__stikAnalyticsPages[key]) || 1, 1), totalPages);
    window.__stikAnalyticsPages[key] = page;
    return { page, totalPages };
}

function getAnalyticsPageSlice(key, items) {
    const { page, totalPages } = getAnalyticsPage(key, items.length);
    const pageSize = getAnalyticsPageSize(key);
    const start = (page - 1) * pageSize;
    return {
        page,
        totalPages,
        items: items.slice(start, start + pageSize)
    };
}

function getAnalyticsVisiblePages(currentPage, totalPages) {
    if (totalPages <= 7) {
        return Array.from({ length: totalPages }, (_, index) => index + 1);
    }

    const pages = new Set([1, totalPages, currentPage, currentPage - 1, currentPage + 1]);
    return Array.from(pages)
        .filter(page => page >= 1 && page <= totalPages)
        .sort((a, b) => a - b);
}

function renderAnalyticsPagination(paginationId, key, page, totalPages) {
    const pagination = document.getElementById(paginationId);
    if (!pagination) return;

    if (totalPages <= 1) {
        pagination.innerHTML = '';
        return;
    }

    let previousPage = 0;
    pagination.innerHTML = getAnalyticsVisiblePages(page, totalPages).map(pageNumber => {
        const gap = previousPage && pageNumber - previousPage > 1 ? '<span class="analytics-page-gap">...</span>' : '';
        previousPage = pageNumber;
        return `${gap}<button type="button" class="analytics-page-tab ${pageNumber === page ? 'is-active' : ''}" data-analytics-page-key="${escapeAttribute(key)}" data-analytics-page="${pageNumber}">${pageNumber}</button>`;
    }).join('');
}

function renderAnalyticsMetricCards(data) {
    const metricsEl = document.getElementById('analytics-metrics');
    if (!metricsEl) return;

    const scopedData = getScopedAnalyticsData(data);
    const metrics = [
        { label: 'Usuários', value: scopedData.isUserScoped ? 1 : scopedData.users.length, icon: 'fa-user-friends' },
        { label: 'Contatos', value: scopedData.contacts.length, icon: 'fa-envelope-open-text' },
        { label: 'Produtos', value: scopedData.productInterests.length, icon: 'fa-tags' },
        { label: 'Dispositivos', value: scopedData.devices.length, icon: 'fa-laptop' },
        { label: 'Cidade/estado', value: scopedData.locations.length, icon: 'fa-map-marker-alt' },
        { label: 'Eventos', value: scopedData.eventStats.length, icon: 'fa-chart-line' }
    ];

    metricsEl.innerHTML = metrics.map(metric => `
        <article class="analytics-metric">
            <span><i class="fas ${metric.icon}" aria-hidden="true"></i></span>
            <strong>${metric.value}</strong>
            <small>${escapeHtml(metric.label)}</small>
        </article>
    `).join('');
}

function renderAnalyticsRows(tbodyId, rows, emptyMessage, colSpan = 5) {
    const tbody = document.getElementById(tbodyId);
    if (!tbody) return;

    if (!rows.length) {
        tbody.innerHTML = `<tr><td colspan="${colSpan}" class="analytics-empty-cell">${escapeHtml(emptyMessage || 'Nenhuma informação registrada ainda.')}</td></tr>`;
        return;
    }

    tbody.innerHTML = rows.join('');
}

function getAnalyticsPlace(user) {
    return [user.city, user.state].filter(Boolean).join(' / ') || 'Nao informado';
}

function isAnalyticsKnownValue(value) {
    const normalized = String(value || '').trim().toLowerCase();
    return normalized && !['nao informado', 'não informado', 'unknown', 'undefined', 'null'].includes(normalized);
}

function getAnalyticsDeviceLabel(device) {
    if (!device) return 'Nao informado';
    return [device.type, device.platform]
        .filter(isAnalyticsKnownValue)
        .join(' / ') || 'Nao informado';
}

function getAnalyticsBrowserLabel(device) {
    return isAnalyticsKnownValue(device?.browser) ? device.browser : 'Nao informado';
}

function getAnalyticsScreenLabel(device) {
    return device?.screen?.width && device?.screen?.height
        ? `${device.screen.width} x ${device.screen.height}`
        : 'Nao informado';
}

function getAnalyticsUserLabel(user, index = 0) {
    return `Usuário #${String(index + 1).padStart(3, '0')}`;
}

function sortAnalyticsUsers(users = []) {
    return users.slice().sort((a, b) => new Date(b.lastSeenAt || 0) - new Date(a.lastSeenAt || 0));
}

function getSelectedAnalyticsUserId() {
    return String(window.__stikSelectedAnalyticsUserId || '');
}

function setSelectedAnalyticsUserId(userId = '') {
    window.__stikSelectedAnalyticsUserId = String(userId || '');
}

function resetAnalyticsDetailPages() {
    window.__stikAnalyticsPages = window.__stikAnalyticsPages || {};
    ['contacts', 'products', 'devices', 'locations', 'events'].forEach(key => {
        window.__stikAnalyticsPages[key] = 1;
    });
}

function ensureSelectedAnalyticsUserExists(users = []) {
    const selectedId = getSelectedAnalyticsUserId();
    if (selectedId && !users.some(user => String(user.id) === selectedId)) {
        setSelectedAnalyticsUserId('');
    }
}

function populateAnalyticsUserScope(users) {
    const select = document.getElementById('analytics-user-scope');
    if (!select) return;

    const currentValue = select.value;
    const sortedUsers = sortAnalyticsUsers(users).map((user, index) => ({
        ...user,
        __label: getAnalyticsUserLabel(user, index)
    }));

    select.innerHTML = '<option value="">Todos os usuários</option>' + sortedUsers.map(user => {
        const place = getAnalyticsPlace(user);
        const pieces = [user.__label, user.email, place !== 'Nao informado' ? place : ''].filter(Boolean);
        return `<option value="${escapeAttribute(user.id)}">${escapeHtml(pieces.join(' - '))}</option>`;
    }).join('');

    select.value = sortedUsers.some(user => String(user.id) === String(currentValue)) ? currentValue : '';
    renderAnalyticsUserScopePicker();
}

function renderAnalyticsUserScopePicker() {
    const select = document.getElementById('analytics-user-scope');
    const label = document.getElementById('analytics-user-scope-label');
    const menu = document.getElementById('analytics-user-scope-menu');
    if (!select || !label || !menu) return;

    const options = Array.from(select.options);
    const selectedOption = options.find(option => option.value === select.value) || options[0];
    label.textContent = selectedOption?.textContent || 'Todos os usuários';

    menu.innerHTML = options.map(option => `
        <button type="button" class="analytics-select-option" role="option" data-value="${escapeAttribute(option.value)}" aria-selected="${option.value === select.value ? 'true' : 'false'}">
            ${escapeHtml(option.textContent || '')}
        </button>
    `).join('');
}

function closeAnalyticsUserScopePicker() {
    const wrap = document.querySelector('.analytics-select-wrap');
    const button = document.getElementById('analytics-user-scope-button');
    wrap?.classList.remove('is-open');
    button?.setAttribute('aria-expanded', 'false');
}

function toggleAnalyticsUserScopePicker() {
    const wrap = document.querySelector('.analytics-select-wrap');
    const button = document.getElementById('analytics-user-scope-button');
    const menu = document.getElementById('analytics-user-scope-menu');
    if (!wrap || !button) return;

    const willOpen = !wrap.classList.contains('is-open');
    wrap.classList.toggle('is-open', willOpen);
    button.setAttribute('aria-expanded', String(willOpen));

    if (willOpen && menu) {
        window.requestAnimationFrame(() => {
            const selected = menu.querySelector('[aria-selected="true"]');
            const first = menu.querySelector('.analytics-select-option');
            (selected || first)?.focus();
        });
    }
}

function initializeAnalyticsUserScopePicker() {
    const select = document.getElementById('analytics-user-scope');
    const button = document.getElementById('analytics-user-scope-button');
    const menu = document.getElementById('analytics-user-scope-menu');
    if (!select || !button || !menu) return;

    button.addEventListener('click', event => {
        event.preventDefault();
        toggleAnalyticsUserScopePicker();
    });

    button.addEventListener('keydown', event => {
        if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            toggleAnalyticsUserScopePicker();
        }

        if (event.key === 'Escape') {
            closeAnalyticsUserScopePicker();
        }
    });

    menu.addEventListener('click', event => {
        const option = event.target.closest('.analytics-select-option');
        if (!option) return;

        select.value = option.dataset.value || '';
        renderAnalyticsUserScopePicker();
        closeAnalyticsUserScopePicker();
        select.dispatchEvent(new Event('change', { bubbles: true }));
    });

    menu.addEventListener('keydown', event => {
        const options = Array.from(menu.querySelectorAll('.analytics-select-option'));
        const currentIndex = options.indexOf(document.activeElement);

        if (event.key === 'Escape') {
            closeAnalyticsUserScopePicker();
            button.focus();
            return;
        }

        if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            event.preventDefault();
            const direction = event.key === 'ArrowDown' ? 1 : -1;
            const nextIndex = currentIndex < 0
                ? 0
                : (currentIndex + direction + options.length) % options.length;
            options[nextIndex]?.focus();
        }
    });

    document.addEventListener('click', event => {
        if (event.target.closest('.analytics-select-wrap')) return;
        closeAnalyticsUserScopePicker();
    });
}

function getSelectedAnalyticsUser(data) {
    const normalized = normalizeMinimizedAnalyticsData(data);
    const selectedId = getSelectedAnalyticsUserId();
    return normalized.users.find(user => String(user.id) === String(selectedId)) || null;
}

function mergeAnalyticsProductInterestsFromUsers(users = []) {
    const products = new Map();
    users.forEach(user => {
        (Array.isArray(user.productInterests) ? user.productInterests : []).forEach(product => {
            const productName = product.productName || '';
            if (!productName) return;
            const key = [product.productId || productName, productName, product.category || ''].join('|');
            const current = products.get(key) || {
                id: key,
                productId: product.productId || productName,
                productName,
                category: product.category || null,
                interestCount: 0,
                firstInterestedAt: product.firstInterestedAt || product.lastInterestedAt,
                lastInterestedAt: product.lastInterestedAt || product.firstInterestedAt
            };
            current.interestCount += Number(product.interestCount) || 1;
            if (!current.firstInterestedAt || new Date(product.firstInterestedAt || 0) < new Date(current.firstInterestedAt || 0)) {
                current.firstInterestedAt = product.firstInterestedAt || current.firstInterestedAt;
            }
            if (!current.lastInterestedAt || new Date(product.lastInterestedAt || 0) > new Date(current.lastInterestedAt || 0)) {
                current.lastInterestedAt = product.lastInterestedAt || current.lastInterestedAt;
            }
            products.set(key, current);
        });
    });
    return Array.from(products.values());
}

function mergeAnalyticsDevicesFromUsers(users = []) {
    const devices = new Map();
    users.forEach(user => {
        if (!user.device) return;
        const device = user.device;
        const key = [
            device.type || '',
            device.browser || '',
            device.platform || '',
            device.screen?.width || '',
            device.screen?.height || ''
        ].join('|');
        const current = devices.get(key) || {
            id: key,
            ...device,
            count: 0,
            firstSeenAt: user.firstSeenAt,
            lastSeenAt: user.lastSeenAt
        };
        current.count += 1;
        if (!current.firstSeenAt || new Date(user.firstSeenAt || 0) < new Date(current.firstSeenAt || 0)) {
            current.firstSeenAt = user.firstSeenAt || current.firstSeenAt;
        }
        if (!current.lastSeenAt || new Date(user.lastSeenAt || 0) > new Date(current.lastSeenAt || 0)) {
            current.lastSeenAt = user.lastSeenAt || current.lastSeenAt;
        }
        devices.set(key, current);
    });
    return Array.from(devices.values());
}

function mergeAnalyticsLocationsFromUsers(users = []) {
    const locations = new Map();
    users.forEach(user => {
        if (!user.city && !user.state) return;
        const key = [user.city || '', user.state || ''].join('|');
        const current = locations.get(key) || {
            id: key,
            city: user.city || null,
            state: user.state || null,
            count: 0,
            firstCollectedAt: user.firstSeenAt,
            lastCollectedAt: user.lastSeenAt
        };
        current.count += 1;
        if (!current.firstCollectedAt || new Date(user.firstSeenAt || 0) < new Date(current.firstCollectedAt || 0)) {
            current.firstCollectedAt = user.firstSeenAt || current.firstCollectedAt;
        }
        if (!current.lastCollectedAt || new Date(user.lastSeenAt || 0) > new Date(current.lastCollectedAt || 0)) {
            current.lastCollectedAt = user.lastSeenAt || current.lastCollectedAt;
        }
        locations.set(key, current);
    });
    return Array.from(locations.values());
}

function getUserDerivedAnalyticsData(normalized) {
    return {
        users: normalized.users,
        contacts: normalized.users
            .filter(user => user.email)
            .map(user => ({
                id: `${user.id}-email`,
                email: user.email,
                firstSubmittedAt: user.firstSeenAt,
                lastSubmittedAt: user.lastSeenAt
            })),
        productInterests: mergeAnalyticsProductInterestsFromUsers(normalized.users),
        devices: mergeAnalyticsDevicesFromUsers(normalized.users),
        locations: mergeAnalyticsLocationsFromUsers(normalized.users),
        eventStats: normalized.eventStats
    };
}

function getScopedAnalyticsData(data) {
    const normalized = normalizeMinimizedAnalyticsData(data);
    const selectedUser = getSelectedAnalyticsUser(data);

    if (!selectedUser) {
        return {
            ...getUserDerivedAnalyticsData(normalized),
            selectedUser: null,
            isUserScoped: false
        };
    }

    return {
        users: normalized.users,
        contacts: selectedUser.email ? [{
            id: `${selectedUser.id}-email`,
            email: selectedUser.email,
            firstSubmittedAt: selectedUser.firstSeenAt,
            lastSubmittedAt: selectedUser.lastSeenAt
        }] : [],
        productInterests: Array.isArray(selectedUser.productInterests) ? selectedUser.productInterests : [],
        devices: selectedUser.device ? [{
            id: `${selectedUser.id}-device`,
            ...selectedUser.device,
            count: 1,
            firstSeenAt: selectedUser.firstSeenAt,
            lastSeenAt: selectedUser.lastSeenAt
        }] : [],
        locations: (selectedUser.city || selectedUser.state) ? [{
            id: `${selectedUser.id}-location`,
            city: selectedUser.city || null,
            state: selectedUser.state || null,
            count: 1,
            firstCollectedAt: selectedUser.firstSeenAt,
            lastCollectedAt: selectedUser.lastSeenAt
        }] : [],
        eventStats: [],
        selectedUser,
        isUserScoped: true
    };
}

function renderAnalyticsScopeSummary(scopedData) {
    const summary = document.getElementById('analytics-scope-summary');
    if (!summary) return;

    summary.classList.toggle('is-user', Boolean(scopedData.isUserScoped));
    summary.classList.toggle('is-general', !scopedData.isUserScoped);

    if (!scopedData.isUserScoped) {
        summary.textContent = 'Visão geral selecionada. Os blocos abaixo mostram os dados consolidados de todos os usuários.';
        return;
    }

    const user = scopedData.selectedUser;
    const details = [
        user.email || 'sem e-mail',
        getAnalyticsPlace(user),
        getAnalyticsDeviceLabel(user.device)
    ].filter(Boolean).join(' - ');
    summary.textContent = `Usuário selecionado. Os blocos abaixo foram filtrados para: ${details}.`;
}

function renderAnalyticsUsersTable(users = []) {
    const sortedUsers = sortAnalyticsUsers(users).map((user, index) => ({
        ...user,
        __label: getAnalyticsUserLabel(user, index)
    }));
    const selectedId = getSelectedAnalyticsUserId();
    const userCountEl = document.getElementById('analytics-user-count');
    const allUsersButton = document.getElementById('analytics-all-users');

    if (userCountEl) userCountEl.textContent = `${sortedUsers.length} ${sortedUsers.length === 1 ? 'visitante' : 'visitantes'}`;
    if (allUsersButton) {
        const isGeneral = !selectedId;
        allUsersButton.classList.toggle('is-active', isGeneral);
        allUsersButton.setAttribute('aria-pressed', String(isGeneral));
    }

    const userPage = getAnalyticsPageSlice('users', sortedUsers);
    renderAnalyticsRows('analytics-users', userPage.items.map(user => {
        const isSelected = String(user.id) === selectedId;
        return `
            <tr class="analytics-user-row ${isSelected ? 'is-selected' : ''}" data-analytics-user-id="${escapeAttribute(user.id)}">
                <td>
                    <button type="button" class="analytics-user-row-button" data-analytics-user-id="${escapeAttribute(user.id)}">
                        ${escapeHtml(user.__label)}
                    </button>
                </td>
                <td>${escapeHtml(getAnalyticsValue(user.email))}</td>
                <td>${escapeHtml(getAnalyticsPlace(user))}</td>
                <td>${escapeHtml(getAnalyticsDeviceLabel(user.device))}</td>
                <td>${escapeHtml(getAnalyticsBrowserLabel(user.device))}</td>
                <td>${escapeHtml(formatAnalyticsDate(user.lastSeenAt || user.firstSeenAt))}</td>
            </tr>
        `;
    }), 'Nenhum visitante registrado ainda.', 6);
    renderAnalyticsPagination('analytics-users-pagination', 'users', userPage.page, userPage.totalPages);
}

function showAnalyticsScopeFeedback() {
    const scopedData = getScopedAnalyticsData(window.__stikCapturedAnalyticsData || {});
    const message = scopedData.isUserScoped
        ? 'Filtro aplicado: exibindo apenas as informações do visitante selecionado.'
        : 'Filtro removido: exibindo a visão geral de todos os visitantes.';

    if (typeof showEditorFeedback === 'function') {
        showEditorFeedback(message);
        return;
    }

    const status = document.getElementById('analytics-status');
    if (!status || status.classList.contains('is-error')) return;
    status.textContent = message;
}

function renderCapturedAnalytics(data) {
    const normalized = normalizeMinimizedAnalyticsData(data);
    ensureSelectedAnalyticsUserExists(normalized.users);
    const scopedData = getScopedAnalyticsData(data);
    renderAnalyticsScopeSummary(scopedData);
    renderAnalyticsUsersTable(normalized.users);

    const contacts = scopedData.contacts
        .slice()
        .sort((a, b) => new Date(b.lastSubmittedAt || 0) - new Date(a.lastSubmittedAt || 0));
    const productInterests = scopedData.productInterests
        .slice()
        .sort((a, b) => (Number(b.interestCount) || 0) - (Number(a.interestCount) || 0) || new Date(b.lastInterestedAt || 0) - new Date(a.lastInterestedAt || 0));
    const devices = scopedData.devices
        .slice()
        .sort((a, b) => (Number(b.count) || 0) - (Number(a.count) || 0) || new Date(b.lastSeenAt || 0) - new Date(a.lastSeenAt || 0));
    const locations = scopedData.locations
        .slice()
        .sort((a, b) => (Number(b.count) || 0) - (Number(a.count) || 0) || new Date(b.lastCollectedAt || 0) - new Date(a.lastCollectedAt || 0));
    const eventStats = scopedData.eventStats
        .slice()
        .sort((a, b) => (Number(b.count) || 0) - (Number(a.count) || 0) || new Date(b.lastOccurredAt || 0) - new Date(a.lastOccurredAt || 0));

    renderAnalyticsMetricCards(data);

    const contactPage = getAnalyticsPageSlice('contacts', contacts);
    const contactCountEl = document.getElementById('analytics-contact-count');
    if (contactCountEl) contactCountEl.textContent = `${contacts.length} ${contacts.length === 1 ? 'contato' : 'contatos'}`;
    renderAnalyticsRows('analytics-contacts', contactPage.items.map(contact => `
        <tr>
            <td><strong>${escapeHtml(getAnalyticsValue(contact.email))}</strong></td>
            <td>${escapeHtml(formatAnalyticsDate(contact.lastSubmittedAt || contact.firstSubmittedAt))}</td>
        </tr>
    `), 'Nenhum contato informado.', 2);
    renderAnalyticsPagination('analytics-contacts-pagination', 'contacts', contactPage.page, contactPage.totalPages);

    const productPage = getAnalyticsPageSlice('products', productInterests);
    const productCountEl = document.getElementById('analytics-product-count');
    if (productCountEl) productCountEl.textContent = `${productInterests.length} ${productInterests.length === 1 ? 'item' : 'itens'}`;
    renderAnalyticsRows('analytics-products', productPage.items.map(product => `
        <tr>
            <td><strong>${escapeHtml(getAnalyticsValue(product.productName))}</strong></td>
            <td>${escapeHtml(getAnalyticsValue(product.category))}</td>
            <td>${escapeHtml(String(Number(product.interestCount) || 0))}</td>
            <td>${escapeHtml(formatAnalyticsDate(product.lastInterestedAt || product.firstInterestedAt))}</td>
        </tr>
    `), 'Nenhum produto de interesse registrado.', 4);
    renderAnalyticsPagination('analytics-products-pagination', 'products', productPage.page, productPage.totalPages);

    const devicePage = getAnalyticsPageSlice('devices', devices);
    const deviceCountEl = document.getElementById('analytics-device-count');
    if (deviceCountEl) deviceCountEl.textContent = `${devices.length} ${devices.length === 1 ? 'dispositivo' : 'dispositivos'}`;
    renderAnalyticsRows('analytics-devices', devicePage.items.map(device => {
        const screen = device.screen?.width && device.screen?.height
            ? `${device.screen.width} x ${device.screen.height}`
            : 'Nao informado';
        return `
            <tr>
                <td><strong>${escapeHtml(getAnalyticsValue(device.type))}</strong></td>
                <td>${escapeHtml(getAnalyticsValue(device.platform))}</td>
                <td>${escapeHtml(getAnalyticsValue(device.browser))}</td>
                <td>${escapeHtml(screen)}</td>
                <td>${escapeHtml(String(Number(device.count) || 1))}</td>
            </tr>
        `;
    }), 'Nenhum dispositivo registrado.', 5);
    renderAnalyticsPagination('analytics-devices-pagination', 'devices', devicePage.page, devicePage.totalPages);

    const locationPage = getAnalyticsPageSlice('locations', locations);
    const locationCountEl = document.getElementById('analytics-location-count');
    if (locationCountEl) locationCountEl.textContent = `${locations.length} ${locations.length === 1 ? 'local' : 'locais'}`;
    renderAnalyticsRows('analytics-locations', locationPage.items.map(location => `
        <tr>
            <td><strong>${escapeHtml(getAnalyticsValue(location.city))}</strong></td>
            <td>${escapeHtml(getAnalyticsValue(location.state))}</td>
            <td>${escapeHtml(String(Number(location.count) || 1))}</td>
            <td>${escapeHtml(formatAnalyticsDate(location.lastCollectedAt || location.firstCollectedAt))}</td>
        </tr>
    `), 'Nenhuma cidade/estado registrada. Para aparecer aqui, o usuario precisa permitir localizacao no navegador.', 4);
    renderAnalyticsPagination('analytics-locations-pagination', 'locations', locationPage.page, locationPage.totalPages);

    const eventPage = getAnalyticsPageSlice('events', eventStats);
    const eventCountEl = document.getElementById('analytics-event-count');
    if (eventCountEl) eventCountEl.textContent = `${eventStats.length} ${eventStats.length === 1 ? 'evento' : 'eventos'}`;
    renderAnalyticsRows('analytics-events', eventPage.items.map(eventStat => `
        <tr>
            <td><strong>${escapeHtml(getAnalyticsEventLabel(eventStat.eventName))}</strong></td>
            <td>${escapeHtml(String(Number(eventStat.count) || 1))}</td>
            <td>${escapeHtml(formatAnalyticsDate(eventStat.lastOccurredAt || eventStat.firstOccurredAt))}</td>
        </tr>
    `), scopedData.isUserScoped ? 'Eventos agregados ficam disponiveis na visao geral.' : 'Nenhum evento agregado registrado.', 3);
    renderAnalyticsPagination('analytics-events-pagination', 'events', eventPage.page, eventPage.totalPages);
}

function inicializarPaginaDadosCapturados() {
    document.getElementById('analytics-refresh')?.addEventListener('click', loadCapturedAnalytics);

    document.getElementById('analytics-all-users')?.addEventListener('click', () => {
        setSelectedAnalyticsUserId('');
        resetAnalyticsDetailPages();
        renderCapturedAnalytics(window.__stikCapturedAnalyticsData || {});
        showAnalyticsScopeFeedback();
    });

    document.addEventListener('click', event => {
        const userButton = event.target.closest('[data-analytics-user-id]');
        if (userButton) {
            setSelectedAnalyticsUserId(userButton.dataset.analyticsUserId || '');
            resetAnalyticsDetailPages();
            renderCapturedAnalytics(window.__stikCapturedAnalyticsData || {});
            showAnalyticsScopeFeedback();
            return;
        }

        const button = event.target.closest('[data-analytics-page-key][data-analytics-page]');
        if (!button) return;
        window.__stikAnalyticsPages = window.__stikAnalyticsPages || {};
        window.__stikAnalyticsPages[button.dataset.analyticsPageKey] = Number(button.dataset.analyticsPage) || 1;
        renderCapturedAnalytics(window.__stikCapturedAnalyticsData || {});
    });
    loadCapturedAnalytics();
}

function activateAdminTab(tab) {
    if (!tab) return;
    document.querySelectorAll('[data-admin-tab]').forEach(item => {
        item.classList.toggle('is-active', item.dataset.adminTab === tab);
    });
    document.querySelectorAll('.admin-panel').forEach(panel => {
        panel.classList.toggle('is-active', panel.id === `admin-tab-${tab}`);
    });
}

function setAdminArticleEditorOpen(isOpen, mode = 'create') {
    const layout = document.getElementById('admin-articles-layout');
    const editorPanel = document.getElementById('admin-article-editor-panel');
    const editorTitle = document.getElementById('admin-article-editor-title');

    layout?.classList.toggle('is-editor-open', Boolean(isOpen));
    if (editorPanel) editorPanel.hidden = !isOpen;
    if (editorTitle) editorTitle.textContent = mode === 'edit' ? 'Editar artigo' : 'Criar artigo';
}

function getSiteContentPathValue(source, path) {
    return String(path || '').split('.').reduce((value, part) => value?.[part], source);
}

function setSiteContentPathValue(source, path, value) {
    const parts = String(path || '').split('.');
    let target = source;
    parts.slice(0, -1).forEach(part => {
        if (target && typeof target === 'object') target = target[part];
    });
    if (target && typeof target === 'object') {
        target[parts[parts.length - 1]] = value;
    }
}

function renderAdminContentField({ path, label, value, type = 'text', rows = 3, help = '' }) {
    const id = `site-content-${path.replace(/[^a-z0-9]+/gi, '-')}`;
    const commonAttrs = `id="${escapeAttribute(id)}" data-site-content-path="${escapeAttribute(path)}"`;
    return `
        <label class="admin-site-field" for="${escapeAttribute(id)}">
            <span>${escapeHtml(label)}</span>
            ${type === 'textarea'
                ? `<textarea ${commonAttrs} rows="${rows}">${escapeHtml(value)}</textarea>`
                : `<input ${commonAttrs} type="${escapeAttribute(type)}" value="${escapeAttribute(value)}">`
            }
            ${help ? `<small>${escapeHtml(help)}</small>` : ''}
        </label>
    `;
}

function renderAdminImagePreview(image, alt = 'Preview') {
    return `
        <figure class="admin-site-image-preview">
            <img src="${escapeAttribute(normalizeStikAssetUrl(image))}" alt="${escapeAttribute(alt)}" loading="lazy" decoding="async">
        </figure>
    `;
}

function renderAdminSiteImageRows(items, basePath, options = {}) {
    const canRemove = options.canRemove === true;
    const canMove = options.canMove === true;
    return `
        <div class="admin-site-repeatable">
            ${items.map((item, index) => `
                <article class="admin-site-image-row">
                    ${renderAdminImagePreview(item.image, item.alt)}
                    <div class="admin-site-image-fields">
                        ${renderAdminContentField({
                            path: `${basePath}.${index}.image`,
                            label: 'Imagem',
                            value: item.image,
                            help: 'Use um caminho do projeto, como img/arquivo.jpg, ou uma URL https.'
                        })}
                    </div>
                    ${(canRemove || canMove) ? `
                        <div class="admin-site-row-actions">
                            ${canMove ? `
                                <button type="button" class="admin-icon-btn" data-site-content-move="${escapeAttribute(basePath)}" data-site-content-index="${index}" data-site-content-direction="-1" aria-label="Mover imagem para cima">
                                    <i class="fas fa-arrow-up"></i>
                                </button>
                                <button type="button" class="admin-icon-btn" data-site-content-move="${escapeAttribute(basePath)}" data-site-content-index="${index}" data-site-content-direction="1" aria-label="Mover imagem para baixo">
                                    <i class="fas fa-arrow-down"></i>
                                </button>
                            ` : ''}
                            ${canRemove ? `
                                <button type="button" class="admin-icon-btn admin-icon-btn-danger" data-site-content-remove="${escapeAttribute(basePath)}" data-site-content-index="${index}" aria-label="Remover imagem">
                                    <i class="fas fa-trash"></i>
                                </button>
                            ` : ''}
                        </div>
                    ` : ''}
                </article>
            `).join('')}
        </div>
    `;
}

function collectAdminSiteContentForm(root) {
    const content = siteContentStore.read();
    root.querySelectorAll('[data-site-content-path]').forEach(field => {
        setSiteContentPathValue(content, field.dataset.siteContentPath, field.value);
    });
    return content;
}

function updateAdminSiteContentPreviews(root) {
    root.querySelectorAll('.admin-site-image-row').forEach(row => {
        const imageInput = row.querySelector('[data-site-content-path$=".image"]');
        const altInput = row.querySelector('[data-site-content-path$=".alt"]');
        const preview = row.querySelector('img');
        if (preview && imageInput) preview.src = normalizeStikAssetUrl(imageInput.value);
        if (preview && altInput) preview.alt = altInput.value || 'Preview';
    });
}

function renderAdminSiteContent() {
    const root = document.getElementById('admin-site-content-root');
    if (!root) return;
    const content = siteContentStore.read();

    root.innerHTML = `
        <form class="admin-site-content-form" id="admin-site-content-form">
            <section class="admin-card admin-site-content-card">
                <div class="admin-list-head">
                    <h2>Home - Hero inicial</h2>
                    <a class="blog-editor-btn blog-editor-btn-outline" href="/" target="_blank" rel="noopener">
                        <i class="fas fa-external-link-alt"></i>
                        Ver Home
                    </a>
                </div>
                <div class="admin-site-grid">
                    ${renderAdminContentField({ path: 'home.hero.poster', label: 'Poster do vídeo', value: content.home.hero.poster })}
                    ${renderAdminContentField({ path: 'home.hero.desktopVideo', label: 'Vídeo desktop', value: content.home.hero.desktopVideo })}
                    ${renderAdminContentField({ path: 'home.hero.mobileVideo', label: 'Vídeo mobile', value: content.home.hero.mobileVideo })}
                </div>
            </section>

            <section class="admin-card admin-site-content-card">
                <div class="admin-list-head">
                    <h2>Home - Grid de produtos</h2>
                </div>
                ${renderAdminContentField({ path: 'home.highlights.title', label: 'Título da seção', value: content.home.highlights.title })}
                <div class="admin-site-highlight-list">
                    ${content.home.highlights.items.map((item, index) => `
                        <article class="admin-site-highlight-row">
                            <div class="admin-site-slot">${escapeHtml(item.slot)}</div>
                            ${renderAdminImagePreview(item.image, item.alt)}
                            <div class="admin-site-image-fields">
                                ${renderAdminContentField({ path: `home.highlights.items.${index}.image`, label: 'Imagem', value: item.image })}
                                ${renderAdminContentField({ path: `home.highlights.items.${index}.text`, label: 'Texto sobre a imagem', value: item.text })}
                            </div>
                        </article>
                    `).join('')}
                </div>
            </section>

            <section class="admin-card admin-site-content-card">
                <div class="admin-list-head">
                    <h2>Catálogo - Carrossel infinito</h2>
                    <button type="button" class="blog-editor-btn blog-editor-btn-outline" data-site-content-add="home.catalog.carouselImages">
                        <i class="fas fa-plus"></i>
                        Adicionar imagem
                    </button>
                </div>
                ${renderAdminContentField({ path: 'home.catalog.title', label: 'Título do bloco', value: content.home.catalog.title })}
                ${renderAdminSiteImageRows(content.home.catalog.carouselImages, 'home.catalog.carouselImages', { canRemove: true, canMove: true })}
            </section>

            <section class="admin-card admin-site-content-card">
                <div class="admin-list-head">
                    <h2>Sobre a Stik</h2>
                    <a class="blog-editor-btn blog-editor-btn-outline" href="/institucional" target="_blank" rel="noopener">
                        <i class="fas fa-external-link-alt"></i>
                        Ver Sobre
                    </a>
                </div>
                <div class="admin-site-grid">
                    ${renderAdminContentField({ path: 'about.title', label: 'Título principal', value: content.about.title })}
                    ${renderAdminContentField({ path: 'about.mainImage', label: 'Imagem principal', value: content.about.mainImage })}
                    ${renderAdminContentField({ path: 'about.mainImageAlt', label: 'Alt da imagem principal', value: content.about.mainImageAlt })}
                </div>
                ${renderAdminContentField({ path: 'about.paragraphs.0', label: 'Primeiro texto', value: content.about.paragraphs[0] || '', type: 'textarea', rows: 5 })}
                ${renderAdminContentField({ path: 'about.paragraphs.1', label: 'Segundo texto', value: content.about.paragraphs[1] || '', type: 'textarea', rows: 5 })}
                ${renderAdminContentField({ path: 'about.statement', label: 'Frase de destaque', value: content.about.statement, type: 'textarea', rows: 4 })}
            </section>

            <section class="admin-card admin-site-content-card">
                <div class="admin-list-head">
                    <h2>Sobre - Galeria</h2>
                    <button type="button" class="blog-editor-btn blog-editor-btn-outline" data-site-content-add="about.galleryImages">
                        <i class="fas fa-plus"></i>
                        Adicionar imagem
                    </button>
                </div>
                ${renderAdminSiteImageRows(content.about.galleryImages, 'about.galleryImages', { canRemove: true, canMove: true })}
            </section>

            <section class="admin-card admin-site-content-card">
                <div class="admin-list-head">
                    <h2>Sobre - Bloco final</h2>
                </div>
                ${renderAdminContentField({ path: 'about.bottomText', label: 'Texto final', value: content.about.bottomText, type: 'textarea', rows: 4 })}
                <div class="admin-site-grid">
                    ${renderAdminContentField({ path: 'about.bottomImage', label: 'Imagem final', value: content.about.bottomImage })}
                    ${renderAdminContentField({ path: 'about.bottomImageAlt', label: 'Alt da imagem final', value: content.about.bottomImageAlt })}
                </div>
            </section>

            <div class="admin-site-actions">
                <button type="button" class="blog-editor-btn blog-editor-btn-light" id="admin-site-content-reset">
                    <i class="fas fa-undo"></i>
                    Restaurar padrão
                </button>
                <button type="submit" class="blog-editor-btn blog-editor-btn-primary">
                    <i class="fas fa-save"></i>
                    Salvar conteúdo
                </button>
            </div>
        </form>
    `;

    updateAdminSiteContentPreviews(root);
}

function setupAdminSiteContent() {
    const root = document.getElementById('admin-site-content-root');
    if (!root || root.dataset.siteContentReady === 'true') return;
    root.dataset.siteContentReady = 'true';
    renderAdminSiteContent();

    root.addEventListener('input', event => {
        if (event.target.matches('[data-site-content-path]')) {
            updateAdminSiteContentPreviews(root);
        }
    });

    root.addEventListener('submit', event => {
        event.preventDefault();
        const content = collectAdminSiteContentForm(root);
        siteContentStore.write(content);
        renderAdminSiteContent();
        applySiteContent(document);
        showEditorFeedback('Conteúdo do site salvo.');
    });

    root.addEventListener('click', event => {
        const addButton = event.target.closest('[data-site-content-add]');
        const removeButton = event.target.closest('[data-site-content-remove]');
        const moveButton = event.target.closest('[data-site-content-move]');
        const resetButton = event.target.closest('#admin-site-content-reset');

        if (addButton) {
            const content = collectAdminSiteContentForm(root);
            const list = getSiteContentPathValue(content, addButton.dataset.siteContentAdd);
            if (Array.isArray(list)) {
                list.push({ image: HOME_GRID_IMAGES[0].image, mobileImage: HOME_GRID_IMAGES[0].mobileImage, alt: 'Nova imagem Stik' });
                siteContentStore.write(content);
                renderAdminSiteContent();
                showEditorFeedback('Imagem adicionada.');
            }
            return;
        }

        if (removeButton) {
            const content = collectAdminSiteContentForm(root);
            const list = getSiteContentPathValue(content, removeButton.dataset.siteContentRemove);
            const index = Number(removeButton.dataset.siteContentIndex);
            if (Array.isArray(list) && list.length > 1 && index >= 0) {
                list.splice(index, 1);
                siteContentStore.write(content);
                renderAdminSiteContent();
                showEditorFeedback('Imagem removida.');
            } else {
                showEditorFeedback('Mantenha pelo menos uma imagem.');
            }
            return;
        }

        if (moveButton) {
            const content = collectAdminSiteContentForm(root);
            const list = getSiteContentPathValue(content, moveButton.dataset.siteContentMove);
            const index = Number(moveButton.dataset.siteContentIndex);
            const direction = Number(moveButton.dataset.siteContentDirection);
            const nextIndex = index + direction;
            if (Array.isArray(list) && index >= 0 && nextIndex >= 0 && nextIndex < list.length) {
                const [item] = list.splice(index, 1);
                list.splice(nextIndex, 0, item);
                siteContentStore.write(content);
                renderAdminSiteContent();
                showEditorFeedback('Ordem atualizada.');
            }
            return;
        }

        if (resetButton) {
            const confirmed = window.confirm('Restaurar o conteúdo visual padrão da Home e da página Sobre?');
            if (!confirmed) return;
            siteContentStore.reset();
            renderAdminSiteContent();
            applySiteContent(document);
            showEditorFeedback('Conteúdo padrão restaurado.');
        }
    });
}

function getAdminSiteContentDraftV2(root) {
    if (!root.__stikSiteContentDraft) {
        root.__stikSiteContentDraft = siteContentStore.read();
    }
    return root.__stikSiteContentDraft;
}

function setAdminSiteContentDraftV2(root, content) {
    root.__stikSiteContentDraft = content;
    return content;
}

function getAdminSiteSectionV2(root) {
    return root.dataset.siteContentSection || 'home';
}

function getAdminSiteMediaKindV2(path) {
    return /video/i.test(path || '') ? 'video' : 'image';
}

function validateAdminSiteMediaFileV2(file, kind = 'image') {
    if (!file) return 'Arquivo invalido.';
    if (kind === 'media') {
        if (file.type?.startsWith('image/')) return validateStikImageFile(file);
        if (file.type?.startsWith('video/')) return validateAdminSiteMediaFileV2(file, 'video');
        return 'Escolha uma imagem ou video valido.';
    }
    if (kind === 'video') {
        const allowedVideoTypes = new Set(['video/mp4', 'video/webm', 'video/ogg']);
        if (!allowedVideoTypes.has(file.type)) return 'Escolha um video MP4, WebM ou OGG.';
        if (file.size > 40 * 1024 * 1024) return 'O video deve ter no maximo 40 MB.';
        return '';
    }
    return validateStikImageFile(file);
}

function getAdminSiteResolvedMediaKindV2(value, kind = 'image', mediaKind = '') {
    if (kind === 'media') return normalizeStikHeroMediaKind(mediaKind) || inferStikMediaKind(value, 'image');
    return kind;
}

function getAdminSiteHeroKindPathV2(path) {
    if (path === 'home.hero.desktopVideo') return 'home.hero.desktopKind';
    if (path === 'home.hero.mobileVideo') return 'home.hero.mobileKind';
    return '';
}

function getAdminSiteHeroStoredKindV2(path) {
    const root = document.getElementById('admin-site-content-root');
    const content = root ? getAdminSiteContentDraftV2(root) : null;
    if (path === 'home.hero.desktopVideo') return content?.home?.hero?.desktopKind || '';
    if (path === 'home.hero.mobileVideo') return content?.home?.hero?.mobileKind || '';
    return '';
}

function getAdminSiteHeroLabelV2(path, fallback) {
    if (path === 'home.hero.poster') return 'Imagem de capa do hero';
    if (path === 'home.hero.desktopVideo') return 'Vídeo desktop';
    if (path === 'home.hero.mobileVideo') return 'Vídeo mobile';
    return fallback;
}

function renderAdminSiteMediaPreviewV2(value, alt = 'Preview', kind = 'image', mediaKind = '') {
    const safeValue = normalizeStikAssetUrl(value);
    const resolvedKind = getAdminSiteResolvedMediaKindV2(safeValue, kind, mediaKind);
    if (resolvedKind === 'video') {
        return `
            <figure class="admin-site-media-preview">
                <video src="${escapeAttribute(safeValue)}" muted playsinline controls preload="metadata"></video>
            </figure>
        `;
    }
    return `
        <figure class="admin-site-media-preview">
            <img src="${escapeAttribute(safeValue)}" alt="${escapeAttribute(alt)}" loading="lazy" decoding="async">
        </figure>
    `;
}

function renderAdminSiteMediaCardV2({
    path,
    label,
    value,
    altPath = '',
    altValue = '',
    textPath = '',
    textValue = '',
    slot = '',
    basePath = '',
    index = 0,
    canMove = false,
    canRemove = false,
    cardClass = '',
    kind = getAdminSiteMediaKindV2(path),
    mediaKind = ''
}) {
    const heroKindPath = getAdminSiteHeroKindPathV2(path);
    const effectiveKind = kind === 'media' ? 'media' : kind;
    const effectiveMediaKind = mediaKind || (effectiveKind === 'media' ? getAdminSiteHeroStoredKindV2(path) : '');
    const displayLabel = getAdminSiteHeroLabelV2(path, label);
    const inputId = `site-content-file-${path.replace(/[^a-z0-9]+/gi, '-')}`;
    const resolvedKind = getAdminSiteResolvedMediaKindV2(value, effectiveKind, effectiveMediaKind);
    const accept = effectiveKind === 'media'
        ? 'image/jpeg,image/png,image/webp,image/gif,image/avif,video/mp4,video/webm,video/ogg'
        : effectiveKind === 'video'
        ? 'video/mp4,video/webm,video/ogg'
        : 'image/jpeg,image/png,image/webp,image/gif,image/avif';
    const currentFileLabel = String(value || '').split(/[\\/]/).pop() || 'Arquivo atual';
    const mediaLabel = effectiveKind === 'media' ? 'mídia' : effectiveKind === 'video' ? 'vídeo' : 'imagem';

    return `
        <article class="admin-site-media-card ${escapeAttribute(cardClass)}" data-site-content-media-card ${canMove ? `data-site-content-v2-sort-base="${escapeAttribute(basePath)}" data-site-content-index="${index}"` : ''}>
            <div class="admin-site-media-head">
                <div>
                    ${slot ? `<span class="admin-site-slot">${escapeHtml(slot)}</span>` : ''}
                    <h3>${escapeHtml(displayLabel)}</h3>
                </div>
                ${canRemove ? `
                    <div class="admin-site-row-actions">
                        <button type="button" class="admin-icon-btn admin-icon-btn-danger" data-site-content-v2-remove="${escapeAttribute(basePath)}" data-site-content-index="${index}" aria-label="Remover item">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                ` : ''}
            </div>
            <div class="admin-site-media-dropzone ${resolvedKind === 'video' ? 'has-video-preview' : ''}" data-site-content-v2-drop-path="${escapeAttribute(path)}" data-site-content-v2-kind="${escapeAttribute(effectiveKind)}" role="button" tabindex="0" aria-label="Trocar arquivo">
                ${renderAdminSiteMediaPreviewV2(value, altValue, effectiveKind, effectiveMediaKind)}
                <div class="admin-site-media-overlay">
                    <i class="fas fa-cloud-upload-alt" aria-hidden="true"></i>
                    <strong>Trocar ${mediaLabel}</strong>
                    <small>Arraste aqui ou clique para escolher</small>
                </div>
            </div>
            <input type="file" id="${escapeAttribute(inputId)}" accept="${escapeAttribute(accept)}" data-site-content-v2-upload-path="${escapeAttribute(path)}" data-site-content-v2-kind="${escapeAttribute(effectiveKind)}" hidden>
            <input type="hidden" data-site-content-path="${escapeAttribute(path)}" value="${escapeAttribute(value)}">
            <div class="admin-site-image-fields">
                <p class="admin-site-media-current">${escapeHtml(currentFileLabel)}</p>
                ${textPath ? renderAdminContentField({ path: textPath, label: 'Texto exibido', value: textValue }) : ''}
            </div>
            ${canMove ? `
                <button type="button" class="admin-site-drag-handle" draggable="true" data-site-content-v2-drag-handle="${escapeAttribute(basePath)}" data-site-content-index="${index}" aria-label="Arrastar para reordenar">
                    <i class="fas fa-grip-lines" aria-hidden="true"></i>
                </button>
            ` : ''}
        </article>
    `;
}

function renderAdminSiteMediaGridV2(items, basePath, options = {}) {
    return `
        <div class="admin-site-media-grid ${options.variant ? `admin-site-media-grid-${escapeAttribute(options.variant)}` : ''}">
            ${items.map((item, index) => renderAdminSiteMediaCardV2({
                path: `${basePath}.${index}.image`,
                label: `${options.labelPrefix || 'Imagem'} ${index + 1}`,
                value: item.image,
                altPath: `${basePath}.${index}.alt`,
                altValue: item.alt,
                basePath,
                index,
                canMove: options.canMove === true,
                canRemove: options.canRemove === true
            })).join('')}
        </div>
    `;
}

function updateAdminSiteContentPreviewsV2(root) {
    root.querySelectorAll('[data-site-content-media-card]').forEach(async card => {
        const mediaInput = card.querySelector('[data-site-content-path]');
        const altInput = card.querySelector('[data-site-content-path$=".alt"]');
        const image = card.querySelector('.admin-site-media-preview img');
        const video = card.querySelector('.admin-site-media-preview video');
        const mediaSrc = mediaInput ? await resolveStikAssetUrl(mediaInput.value) : '';
        if (image && mediaInput && mediaSrc) image.src = mediaSrc;
        if (image && altInput) image.alt = altInput.value || 'Preview';
        if (video && mediaInput && mediaSrc) video.src = mediaSrc;
    });
}

function collectAdminSiteContentFormV2(root) {
    const content = getAdminSiteContentDraftV2(root);
    root.querySelectorAll('[data-site-content-path]').forEach(field => {
        setSiteContentPathValue(content, field.dataset.siteContentPath, field.value);
    });
    return setAdminSiteContentDraftV2(root, content);
}

function shouldTranslateSiteContentPath(path, value) {
    const text = String(value || '').trim();
    if (!text) return false;
    if (/\.?(image|mobileImage|poster|desktopVideo|mobileVideo|desktopKind|mobileKind|mode|transition)$/i.test(path)) return false;
    if (/^(https?:)?\/\//i.test(text) || /^stik-media:/i.test(text) || /^img[\\/]/i.test(text)) return false;
    return true;
}

function collectStikSiteContentTranslationEntries(source, basePath = '') {
    if (!source || typeof source !== 'object') return [];
    return Object.entries(source).flatMap(([key, value]) => {
        if (key === 'i18n') return [];
        const path = basePath ? `${basePath}.${key}` : key;
        if (typeof value === 'string') {
            return shouldTranslateSiteContentPath(path, value)
                ? [{ id: path, text: value, format: 'plain' }]
                : [];
        }
        if (Array.isArray(value)) {
            return value.flatMap((item, index) => collectStikSiteContentTranslationEntries(item, `${path}.${index}`));
        }
        if (value && typeof value === 'object') {
            return collectStikSiteContentTranslationEntries(value, path);
        }
        return [];
    });
}

async function translateStikSiteContentPayload(content) {
    const entries = collectStikSiteContentTranslationEntries(content);
    const translations = await requestStikDynamicTranslations(entries);
    return {
        ...content,
        i18n: mergeStikI18n(content.i18n, translations)
    };
}

function isAdminSiteSortDragEventV2(event, root) {
    const types = Array.from(event.dataTransfer?.types || []);
    return types.includes('application/x-stik-site-content-sort') || Boolean(root?.dataset.siteContentDragBase);
}

function clearAdminSiteSortStateV2(root) {
    delete root.dataset.siteContentDragBase;
    delete root.dataset.siteContentDragIndex;
    root.querySelectorAll('.admin-site-media-card.is-dragging, .admin-site-media-card.is-drop-before, .admin-site-media-card.is-drop-after')
        .forEach(card => card.classList.remove('is-dragging', 'is-drop-before', 'is-drop-after'));
}

function markAdminSiteDropTargetV2(card, event) {
    card.parentElement?.querySelectorAll('.is-drop-before, .is-drop-after')
        .forEach(item => item.classList.remove('is-drop-before', 'is-drop-after'));

    const rect = card.getBoundingClientRect();
    const isHorizontal = card.parentElement && getComputedStyle(card.parentElement).gridTemplateColumns.split(' ').length > 1;
    const after = isHorizontal
        ? event.clientX > rect.left + rect.width / 2
        : event.clientY > rect.top + rect.height / 2;
    card.classList.toggle('is-drop-before', !after);
    card.classList.toggle('is-drop-after', after);
}

function reorderAdminSiteContentListV2(root, targetCard) {
    const basePath = root.dataset.siteContentDragBase;
    const fromIndex = Number(root.dataset.siteContentDragIndex);
    const targetIndex = Number(targetCard.dataset.siteContentIndex);
    if (!basePath || !Number.isFinite(fromIndex) || !Number.isFinite(targetIndex) || fromIndex === targetIndex) return false;

    const content = collectAdminSiteContentFormV2(root);
    const list = getSiteContentPathValue(content, basePath);
    if (!Array.isArray(list) || fromIndex < 0 || fromIndex >= list.length || targetIndex < 0 || targetIndex >= list.length) return false;

    const insertAfter = targetCard.classList.contains('is-drop-after');
    const [item] = list.splice(fromIndex, 1);
    let nextIndex = targetIndex + (insertAfter ? 1 : 0);
    if (fromIndex < nextIndex) nextIndex -= 1;
    nextIndex = Math.max(0, Math.min(nextIndex, list.length));
    list.splice(nextIndex, 0, item);
    setAdminSiteContentDraftV2(root, content);
    return true;
}

function renderAdminHeroModePanelV2(hero) {
    const mode = hero?.mode === 'slideshow' ? 'slideshow' : 'video';
    return `
        <div class="admin-hero-mode-panel">
            <input type="hidden" data-site-content-path="home.hero.mode" value="${escapeAttribute(mode)}">
            <div class="admin-hero-mode-control" role="group" aria-label="Formato do hero inicial">
                <button type="button" class="admin-hero-mode-button ${mode === 'video' ? 'is-active' : ''}" data-site-content-v2-hero-mode="video">
                    <i class="fas fa-play-circle" aria-hidden="true"></i>
                    <span>Vídeo único</span>
                </button>
                <button type="button" class="admin-hero-mode-button ${mode === 'slideshow' ? 'is-active' : ''}" data-site-content-v2-hero-mode="slideshow">
                    <i class="fas fa-images" aria-hidden="true"></i>
                    <span>Slides de imagens</span>
                </button>
            </div>
            <p class="admin-hero-mode-note">
                ${mode === 'video'
                    ? 'Use um vídeo para desktop e, se quiser, outro mais leve para mobile. A imagem de capa aparece antes do carregamento.'
                    : 'Adicione as imagens do hero e arraste pela alça inferior para definir a ordem. A troca acontece automaticamente a cada 7 segundos.'}
            </p>
        </div>
    `;
}

function renderAdminSiteContentV2() {
    const root = document.getElementById('admin-site-content-root');
    if (!root) return;
    const content = getAdminSiteContentDraftV2(root);
    const section = getAdminSiteSectionV2(root);
    const heroMode = content.home.hero.mode === 'slideshow' ? 'slideshow' : 'video';

    root.innerHTML = `
        <form class="admin-site-content-form" id="admin-site-content-form">
            <input type="file" accept="image/jpeg,image/png,image/webp,image/gif,image/avif" data-site-content-v2-add-file hidden>
            <nav class="admin-site-subtabs" aria-label="Seções editáveis">
                <button type="button" class="${section === 'home' ? 'is-active' : ''}" data-site-content-v2-section-tab="home">
                    <i class="fas fa-home" aria-hidden="true"></i>
                    Home
                </button>
                <button type="button" class="${section === 'institutional' ? 'is-active' : ''}" data-site-content-v2-section-tab="institutional">
                    <i class="fas fa-building" aria-hidden="true"></i>
                    Institucional
                </button>
            </nav>

            <div class="admin-site-section ${section === 'home' ? 'is-active' : ''}" data-site-content-v2-section="home">
                <section class="admin-card admin-site-content-card">
                    <div class="admin-list-head">
                        <h2>Hero inicial</h2>
                        <a class="blog-editor-btn blog-editor-btn-outline" href="/" target="_blank" rel="noopener">
                            <i class="fas fa-external-link-alt"></i>
                            Ver Home
                        </a>
                    </div>
                    ${renderAdminHeroModePanelV2(content.home.hero)}
                    ${heroMode === 'video' ? `
                        <div class="admin-site-media-grid admin-site-media-grid-hero">
                            ${renderAdminSiteMediaCardV2({ path: 'home.hero.poster', label: 'Poster do vídeo', value: content.home.hero.poster, kind: 'image' })}
                            ${renderAdminSiteMediaCardV2({ path: 'home.hero.desktopVideo', label: 'Vídeo desktop', value: content.home.hero.desktopVideo, kind: 'video' })}
                            ${renderAdminSiteMediaCardV2({ path: 'home.hero.mobileVideo', label: 'Vídeo mobile', value: content.home.hero.mobileVideo, kind: 'video' })}
                        </div>
                    ` : `
                        <div class="admin-list-head admin-site-nested-head">
                            <div>
                                <h3>Imagens do slide</h3>
                                <p>O primeiro card será exibido primeiro no hero.</p>
                            </div>
                            <button type="button" class="blog-editor-btn blog-editor-btn-outline" data-site-content-v2-add="home.hero.slideshow.images">
                                <i class="fas fa-plus"></i>
                                Adicionar imagem
                            </button>
                        </div>
                        ${renderAdminSiteMediaGridV2(content.home.hero.slideshow.images, 'home.hero.slideshow.images', { labelPrefix: 'Slide', canMove: true, canRemove: true, variant: 'hero-slideshow' })}
                    `}
                </section>

                <section class="admin-card admin-site-content-card">
                    <div class="admin-list-head">
                        <h2>Grid de produtos</h2>
                    </div>
                    ${renderAdminContentField({ path: 'home.highlights.title', label: 'Título da seção', value: content.home.highlights.title })}
                    <div class="admin-site-media-grid admin-site-media-grid-home">
                        ${content.home.highlights.items.map((item, index) => renderAdminSiteMediaCardV2({
                            path: `home.highlights.items.${index}.image`,
                            label: `Card ${index + 1}`,
                            value: item.image,
                            altPath: `home.highlights.items.${index}.alt`,
                            altValue: item.alt,
                            textPath: `home.highlights.items.${index}.text`,
                            textValue: item.text,
                            cardClass: `admin-site-home-card-${item.slot}`
                        })).join('')}
                    </div>
                </section>

                <section class="admin-card admin-site-content-card">
                    <div class="admin-list-head">
                        <h2>Carrossel do catálogo</h2>
                        <button type="button" class="blog-editor-btn blog-editor-btn-outline" data-site-content-v2-add="home.catalog.carouselImages">
                            <i class="fas fa-plus"></i>
                            Adicionar imagem
                        </button>
                    </div>
                    ${renderAdminContentField({ path: 'home.catalog.title', label: 'Título do bloco', value: content.home.catalog.title })}
                    ${renderAdminSiteMediaGridV2(content.home.catalog.carouselImages, 'home.catalog.carouselImages', { labelPrefix: 'Imagem', canMove: true, canRemove: true, variant: 'carousel' })}
                </section>
            </div>

            <div class="admin-site-section ${section === 'institutional' ? 'is-active' : ''}" data-site-content-v2-section="institutional">
                <section class="admin-card admin-site-content-card">
                    <div class="admin-list-head">
                        <h2>Sobre a Stik</h2>
                        <a class="blog-editor-btn blog-editor-btn-outline" href="/institucional" target="_blank" rel="noopener">
                            <i class="fas fa-external-link-alt"></i>
                            Ver Institucional
                        </a>
                    </div>
                    ${renderAdminContentField({ path: 'about.title', label: 'Título principal', value: content.about.title })}
                    <div class="admin-site-media-grid admin-site-media-grid-hero">
                        ${renderAdminSiteMediaCardV2({
                            path: 'about.mainImage',
                            label: 'Imagem principal',
                            value: content.about.mainImage,
                            altPath: 'about.mainImageAlt',
                            altValue: content.about.mainImageAlt
                        })}
                    </div>
                    ${renderAdminContentField({ path: 'about.paragraphs.0', label: 'Primeiro texto', value: content.about.paragraphs[0] || '', type: 'textarea', rows: 5 })}
                    ${renderAdminContentField({ path: 'about.paragraphs.1', label: 'Segundo texto', value: content.about.paragraphs[1] || '', type: 'textarea', rows: 5 })}
                    ${renderAdminContentField({ path: 'about.statement', label: 'Frase de destaque', value: content.about.statement, type: 'textarea', rows: 4 })}
                </section>

                <section class="admin-card admin-site-content-card">
                    <div class="admin-list-head">
                        <h2>Galeria institucional</h2>
                        <button type="button" class="blog-editor-btn blog-editor-btn-outline" data-site-content-v2-add="about.galleryImages">
                            <i class="fas fa-plus"></i>
                            Adicionar imagem
                        </button>
                    </div>
                    ${renderAdminSiteMediaGridV2(content.about.galleryImages, 'about.galleryImages', { labelPrefix: 'Imagem', canMove: true, canRemove: true, variant: 'institutional' })}
                </section>

                <section class="admin-card admin-site-content-card">
                    <div class="admin-list-head">
                        <h2>Bloco final</h2>
                    </div>
                    ${renderAdminContentField({ path: 'about.bottomText', label: 'Texto final', value: content.about.bottomText, type: 'textarea', rows: 4 })}
                    <div class="admin-site-media-grid admin-site-media-grid-hero">
                        ${renderAdminSiteMediaCardV2({
                            path: 'about.bottomImage',
                            label: 'Imagem final',
                            value: content.about.bottomImage,
                            altPath: 'about.bottomImageAlt',
                            altValue: content.about.bottomImageAlt
                        })}
                    </div>
                </section>
            </div>

            <div class="admin-site-actions">
                <button type="button" class="blog-editor-btn blog-editor-btn-light" id="admin-site-content-v2-reset">
                    <i class="fas fa-undo"></i>
                    Restaurar padrão
                </button>
                <button type="submit" class="blog-editor-btn blog-editor-btn-primary">
                    <i class="fas fa-save"></i>
                    Salvar conteúdo
                </button>
            </div>
        </form>
    `;

    updateAdminSiteContentPreviewsV2(root);
}

async function setAdminSiteMediaFromFileV2(root, path, file, kind) {
    const validationMessage = validateAdminSiteMediaFileV2(file, kind);
    if (validationMessage) {
        showEditorFeedback(validationMessage);
        return;
    }

    const content = collectAdminSiteContentFormV2(root);
    let mediaRef = '';
    try {
        mediaRef = await saveStikSiteMediaFile(file);
    } catch (error) {
        console.warn('Nao foi possivel salvar midia local:', error);
        showEditorFeedback('Nao foi possivel salvar o arquivo localmente para preview.');
        return;
    }

    setSiteContentPathValue(content, path, mediaRef);
    const heroKindPath = getAdminSiteHeroKindPathV2(path);
    if (kind === 'media' && heroKindPath) {
        setSiteContentPathValue(content, heroKindPath, file.type?.startsWith('video/') ? 'video' : 'image');
    }
    setAdminSiteContentDraftV2(root, content);
    renderAdminSiteContentV2();
    if (kind === 'media') {
        showEditorFeedback(`${file.type?.startsWith('video/') ? 'Video' : 'Imagem'} carregado para preview.`);
        return;
    }
    showEditorFeedback(`${kind === 'video' ? 'Vídeo' : 'Imagem'} carregado para preview.`);
}

async function addAdminSiteImageFromFileV2(root, path, file) {
    const validationMessage = validateAdminSiteMediaFileV2(file, 'image');
    if (validationMessage) {
        showEditorFeedback(validationMessage);
        return;
    }

    const content = collectAdminSiteContentFormV2(root);
    const list = getSiteContentPathValue(content, path);
    if (!Array.isArray(list)) {
        showEditorFeedback('Nao foi possivel adicionar a imagem.');
        return;
    }

    const fileName = file.name || 'Nova imagem Stik';
    const altText = fileName.replace(/\.[^.]+$/, '') || 'Nova imagem Stik';
    let mediaRef = '';
    try {
        mediaRef = await saveStikSiteMediaFile(file);
    } catch (error) {
        console.warn('Nao foi possivel salvar imagem local:', error);
        showEditorFeedback('Nao foi possivel salvar a imagem localmente para preview.');
        return;
    }

    list.push({ image: mediaRef, alt: altText });
    setAdminSiteContentDraftV2(root, content);
    renderAdminSiteContentV2();
    showEditorFeedback('Imagem adicionada.');
}

function setupAdminSiteContentV2() {
    const root = document.getElementById('admin-site-content-root');
    if (!root || root.dataset.siteContentReady === 'true') return;
    root.dataset.siteContentReady = 'true';
    root.dataset.siteContentSection = 'home';
    setAdminSiteContentDraftV2(root, siteContentStore.read());
    renderAdminSiteContentV2();

    root.addEventListener('input', event => {
        if (!event.target.matches('[data-site-content-path]')) return;
        collectAdminSiteContentFormV2(root);
        updateAdminSiteContentPreviewsV2(root);
    });

    root.addEventListener('change', async event => {
        const addInput = event.target.closest('[data-site-content-v2-add-file]');
        if (addInput) {
            const file = addInput.files && addInput.files[0];
            const path = root.dataset.siteContentPendingAddPath;
            delete root.dataset.siteContentPendingAddPath;
            if (!file) return;
            await addAdminSiteImageFromFileV2(root, path, file);
            return;
        }

        const input = event.target.closest('[data-site-content-v2-upload-path]');
        if (!input) return;
        const file = input.files && input.files[0];
        if (!file) return;
        await setAdminSiteMediaFromFileV2(root, input.dataset.siteContentV2UploadPath, file, input.dataset.siteContentV2Kind || 'image');
    });

    root.addEventListener('dragstart', event => {
        const handle = event.target.closest('[data-site-content-v2-drag-handle]');
        if (!handle) return;
        collectAdminSiteContentFormV2(root);
        root.dataset.siteContentDragBase = handle.dataset.siteContentV2DragHandle;
        root.dataset.siteContentDragIndex = handle.dataset.siteContentIndex;
        event.dataTransfer?.setData('application/x-stik-site-content-sort', '1');
        if (event.dataTransfer) event.dataTransfer.effectAllowed = 'move';
        handle.closest('[data-site-content-media-card]')?.classList.add('is-dragging');
    });

    root.addEventListener('dragover', event => {
        const sortableCard = event.target.closest('[data-site-content-v2-sort-base]');
        if (sortableCard && root.dataset.siteContentDragBase === sortableCard.dataset.siteContentV2SortBase) {
            event.preventDefault();
            if (event.dataTransfer) event.dataTransfer.dropEffect = 'move';
            markAdminSiteDropTargetV2(sortableCard, event);
            return;
        }

        const dropzone = event.target.closest('[data-site-content-v2-drop-path]');
        if (!dropzone || isAdminSiteSortDragEventV2(event, root)) return;
        event.preventDefault();
        dropzone.classList.add('is-dragging');
    });

    root.addEventListener('dragleave', event => {
        const sortableCard = event.target.closest('[data-site-content-v2-sort-base]');
        if (sortableCard && !sortableCard.contains(event.relatedTarget)) {
            sortableCard.classList.remove('is-drop-before', 'is-drop-after');
        }

        const dropzone = event.target.closest('[data-site-content-v2-drop-path]');
        if (!dropzone || dropzone.contains(event.relatedTarget)) return;
        dropzone.classList.remove('is-dragging');
    });

    root.addEventListener('drop', async event => {
        const sortableCard = event.target.closest('[data-site-content-v2-sort-base]');
        if (sortableCard && root.dataset.siteContentDragBase === sortableCard.dataset.siteContentV2SortBase) {
            event.preventDefault();
            const changed = reorderAdminSiteContentListV2(root, sortableCard);
            clearAdminSiteSortStateV2(root);
            if (changed) {
                renderAdminSiteContentV2();
                showEditorFeedback('Ordem atualizada.');
            }
            return;
        }

        const dropzone = event.target.closest('[data-site-content-v2-drop-path]');
        if (!dropzone || isAdminSiteSortDragEventV2(event, root)) return;
        event.preventDefault();
        dropzone.classList.remove('is-dragging');
        const file = event.dataTransfer?.files?.[0];
        if (!file) return;
        await setAdminSiteMediaFromFileV2(root, dropzone.dataset.siteContentV2DropPath, file, dropzone.dataset.siteContentV2Kind || 'image');
    });

    root.addEventListener('dragend', () => {
        clearAdminSiteSortStateV2(root);
    });

    root.addEventListener('submit', async event => {
        event.preventDefault();
        let content = collectAdminSiteContentFormV2(root);
        try {
            content = await translateStikSiteContentPayload(content);
        } catch (error) {
            console.warn('Traducao de conteudo do site indisponivel:', error);
            showEditorFeedback('Conteudo salvo. Traducao automatica indisponivel agora.');
        }
        const savedContent = siteContentStore.write(content);
        setAdminSiteContentDraftV2(root, savedContent);
        renderAdminSiteContentV2();
        applySiteContent(document);
        showEditorFeedback('Conteúdo do site salvo.');
    });

    root.addEventListener('click', event => {
        const sectionButton = event.target.closest('[data-site-content-v2-section-tab]');
        const heroModeButton = event.target.closest('[data-site-content-v2-hero-mode]');
        const dropzone = event.target.closest('[data-site-content-v2-drop-path]');
        const addButton = event.target.closest('[data-site-content-v2-add]');
        const removeButton = event.target.closest('[data-site-content-v2-remove]');
        const resetButton = event.target.closest('#admin-site-content-v2-reset');

        if (sectionButton) {
            collectAdminSiteContentFormV2(root);
            root.dataset.siteContentSection = sectionButton.dataset.siteContentV2SectionTab;
            renderAdminSiteContentV2();
            return;
        }

        if (heroModeButton) {
            const nextMode = heroModeButton.dataset.siteContentV2HeroMode === 'slideshow' ? 'slideshow' : 'video';
            const content = collectAdminSiteContentFormV2(root);
            setSiteContentPathValue(content, 'home.hero.mode', nextMode);
            setAdminSiteContentDraftV2(root, content);
            renderAdminSiteContentV2();
            showEditorFeedback(nextMode === 'slideshow' ? 'Hero configurado para slides de imagens.' : 'Hero configurado para vídeo.');
            return;
        }

        if (dropzone) {
            if (event.target.closest('video')) return;
            const input = Array.from(root.querySelectorAll('[data-site-content-v2-upload-path]'))
                .find(item => item.dataset.siteContentV2UploadPath === dropzone.dataset.siteContentV2DropPath);
            input?.click();
            return;
        }

        if (addButton) {
            collectAdminSiteContentFormV2(root);
            root.dataset.siteContentPendingAddPath = addButton.dataset.siteContentV2Add;
            const input = root.querySelector('[data-site-content-v2-add-file]');
            if (!input) {
                showEditorFeedback('Nao foi possivel abrir o upload.');
                return;
            }
            input.value = '';
            input.click();
            return;
        }

        if (removeButton) {
            const content = collectAdminSiteContentFormV2(root);
            const list = getSiteContentPathValue(content, removeButton.dataset.siteContentV2Remove);
            const index = Number(removeButton.dataset.siteContentIndex);
            if (Array.isArray(list) && list.length > 1 && index >= 0) {
                list.splice(index, 1);
                setAdminSiteContentDraftV2(root, content);
                renderAdminSiteContentV2();
                showEditorFeedback('Imagem removida.');
            } else {
                showEditorFeedback('Mantenha pelo menos uma imagem.');
            }
            return;
        }

        if (resetButton) {
            const confirmed = window.confirm('Restaurar o conteúdo visual padrão da Home e da página Institucional?');
            if (!confirmed) return;
            const content = siteContentStore.reset();
            setAdminSiteContentDraftV2(root, content);
            renderAdminSiteContentV2();
            applySiteContent(document);
            showEditorFeedback('Conteúdo padrão restaurado.');
        }
    });
}

async function setupAdminPage() {
    const loginView = document.getElementById('admin-login-view');
    const dashboardView = document.getElementById('admin-dashboard-view');
    if (!loginView || !dashboardView || dashboardView.dataset.adminReady === 'true') return;
    dashboardView.dataset.adminReady = 'true';

    const SESSION_KEY = 'stik.admin.session';
    const loginForm = document.getElementById('admin-login-form');
    const logoutButton = document.getElementById('admin-logout');
    const isLocalPreview = isStikLocalPreviewHost();

    if (!isLocalPreview) {
        try {
            localStorage.removeItem(SESSION_KEY);
        } catch (error) {
            /* Admin preview nao deve depender de storage fora do ambiente local. */
        }
        dashboardView.hidden = true;
        loginView.hidden = false;
        if (loginForm) loginForm.hidden = true;
        const description = loginView.querySelector('p');
        if (description) {
            description.textContent = 'Este painel administrativo e apenas um preview local. O CRUD definitivo precisa de backend autenticado antes de uso em producao.';
        }
        return;
    }

    const showDashboard = async () => {
        loginView.hidden = true;
        dashboardView.hidden = false;
        setAdminArticleEditorOpen(false);
        await setupArticleForm();
        await refreshAdminArticles();
        setupAdminProducts();
        setupAdminSiteContentV2();
    };

    const showLogin = () => {
        dashboardView.hidden = true;
        loginView.hidden = false;
    };

    loginForm?.addEventListener('submit', async (event) => {
        event.preventDefault();
        localStorage.setItem(SESSION_KEY, JSON.stringify({ loggedAt: new Date().toISOString() }));
        await showDashboard();
    });

    logoutButton?.addEventListener('click', () => {
        localStorage.removeItem(SESSION_KEY);
        showLogin();
    });

    document.querySelectorAll('[data-admin-tab]').forEach(button => {
        button.addEventListener('click', () => {
            activateAdminTab(button.dataset.adminTab);
        });
    });

    const newArticleButton = document.getElementById('admin-new-article');
    newArticleButton?.addEventListener('click', () => {
        setAdminArticleEditorOpen(true, 'create');
        window.stikArticleEditor?.reset();
        showEditorFeedback('Editor pronto para um novo artigo.');
    });

    document.getElementById('admin-close-article-editor')?.addEventListener('click', () => {
        setAdminArticleEditorOpen(false);
    });

    window.addEventListener('stik:article-saved', refreshAdminArticles);

    if (localStorage.getItem(SESSION_KEY)) {
        await showDashboard();
    } else {
        showLogin();
    }
}

async function refreshAdminArticles() {
    const list = document.getElementById('admin-article-list');
    if (!list || !window.blogApi) return;

    const localArticles = await window.blogApi.listArticles().catch(() => []);
    const localIds = new Set(localArticles.map(article => String(article.id)));
    const articles = await getBlogArticlesForScreen();
    if (!articles.length) {
        list.innerHTML = '<p class="admin-empty">Nenhum artigo local cadastrado ainda.</p>';
        return;
    }

    const articleMap = new Map(articles.map(article => [String(article.id), article]));

    list.innerHTML = articles
        .map(article => {
            const isLocal = localIds.has(String(article.id));
            const statusMeta = getStikAdminStatusMeta({
                publicationStatus: article.publicationStatus,
                translationStatus: article.translationStatus,
                i18n: article.i18n,
                fields: getArticleTranslationFields(article),
                forcePending: isLocal && article.status !== 'published'
            });
            return `
            <article class="admin-list-item">
                <div>
                    <strong>${escapeHtml(article.titulo || article.title || 'Artigo sem título')}</strong>
                    <span class="admin-item-subtitle">${escapeHtml(isLocal ? (article.status === 'published' ? 'Publicado local' : 'Rascunho local') : 'Artigo inicial')}</span>
                    <div class="admin-item-meta">${renderAdminStatusBadge(statusMeta)}</div>
                </div>
                <div class="admin-list-actions">
                    <button type="button" class="admin-icon-btn" data-admin-edit-article="${escapeAttribute(article.id)}" aria-label="Editar artigo">
                        <i class="fas fa-pen"></i>
                    </button>
                    <button type="button" class="admin-icon-btn admin-icon-btn-danger" data-admin-delete-article="${escapeAttribute(article.id)}" aria-label="Excluir artigo"${isLocal ? '' : ' disabled'}>
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </article>
        `;
        })
        .join('');

    list.querySelectorAll('[data-admin-edit-article]').forEach(button => {
        button.addEventListener('click', async () => {
            const article = articleMap.get(String(button.dataset.adminEditArticle));
            setAdminArticleEditorOpen(true, 'edit');
            await window.stikArticleEditor?.load(article || button.dataset.adminEditArticle);
        });
    });

    list.querySelectorAll('[data-admin-delete-article]:not([disabled])').forEach(button => {
        button.addEventListener('click', async () => {
            const action = await showBlogTagImpactDialog({
                title: 'Excluir artigo',
                message: 'Esta ação remove o artigo salvo localmente no painel administrativo.',
                actions: [
                    { value: 'delete', label: 'Excluir artigo', className: 'blog-editor-btn-primary' },
                    { value: 'cancel', label: 'Cancelar', className: 'blog-editor-btn-light' }
                ]
            });
            if (action !== 'delete') return;
            try {
                await window.blogApi.deleteArticle(button.dataset.adminDeleteArticle);
                window.stikArticleEditor?.reset();
                setAdminArticleEditorOpen(false);
                await refreshAdminArticles();
                showEditorFeedback('Artigo excluído.');
            } catch (error) {
                console.warn('Nao foi possivel excluir o artigo:', error);
                showEditorFeedback('Não foi possível excluir o artigo.');
            }
        });
    });
}

async function translateStikProductPayload(payload, existingI18n = null) {
    return translateStikCrudFields(getProductTranslationSourceFields(payload), existingI18n, {
        showFailureFeedback: false,
        throwOnFailure: true,
        skipExisting: true
    });
}

function getProductDetailsSourceText(product) {
    const customDetails = String(product?.details || product?.detalhes || '').trim();
    if (customDetails) return customDetails;

    const name = formatNome(product?.nome || '');
    const material = String(product?.material || 'Elástico').trim();
    const category = normalizeCategoria(product?.categoria);
    if (!name && !material && !category) return '';
    return `${name} combina material ${material} com aplicação na categoria ${category}.`;
}

function getProductTranslationSourceFields(product) {
    return {
        categoria: normalizeCategoria(product?.categoria),
        material: product?.material || '',
        descricao: product?.descricao || '',
        details: getProductDetailsSourceText(product)
    };
}

function getProductTranslationFields(product) {
    return Object.entries(getProductTranslationSourceFields(product))
        .filter(([, value]) => String(value || '').trim())
        .map(([field]) => field);
}

function hasProductTranslatableContent(product) {
    return getProductTranslationFields(product).length > 0;
}

function getProductTranslationSignature(product) {
    return getStikTextHash(JSON.stringify(getProductTranslationSourceFields(product)));
}

function getProductTranslationStatus(product, i18n = product?.i18n) {
    if (!hasProductTranslatableContent(product)) return 'published';
    return hasCompleteStikI18n(i18n, getProductTranslationFields(product)) ? 'published' : 'pending';
}

function getProductI18nWithoutChangedSourceFields(existingProduct, nextProduct) {
    const existingI18n = existingProduct?.i18n || {};
    if (!existingProduct) return {};

    const previousSources = getProductTranslationSourceFields(existingProduct);
    const nextSources = getProductTranslationSourceFields(nextProduct);
    const changedFields = new Set(Object.keys(nextSources).filter(field => (
        String(previousSources[field] || '').trim() !== String(nextSources[field] || '').trim()
    )));

    if (!changedFields.size) return existingI18n;

    return Object.fromEntries(Object.entries(existingI18n)
        .map(([language, values]) => {
            const nextValues = { ...(values || {}) };
            changedFields.forEach(field => {
                delete nextValues[field];
            });
            return [language, nextValues];
        })
        .filter(([, values]) => Object.values(values || {}).some(value => String(value || '').trim())));
}

function shouldTranslateProductAfterSave(existingProduct, nextProduct, i18n) {
    if (!hasProductTranslatableContent(nextProduct)) return false;
    const nextSignature = getProductTranslationSignature(nextProduct);
    if (!existingProduct) return true;
    if (getProductTranslationSignature(existingProduct) !== nextSignature) return true;
    const existingTranslationStatus = String(existingProduct.translationStatus || '').toLowerCase();
    const hasSameTranslationSource = String(existingProduct.translationSourceSignature || '') === nextSignature;
    if (['pending', 'error'].includes(existingTranslationStatus) && hasSameTranslationSource) {
        return false;
    }
    if (existingTranslationStatus === 'error') {
        return String(existingProduct.translationSourceSignature || '') !== nextSignature;
    }
    return !hasCompleteStikI18n(i18n, getProductTranslationFields(nextProduct));
}

function getAdminProductFormPayload() {
    return {
        nome: document.getElementById('admin-product-name')?.value || '',
        categoria: document.getElementById('admin-product-category')?.value || '',
        imagem: document.getElementById('admin-product-image')?.value || '',
        imagens: getAdminProductImages(),
        material: document.getElementById('admin-product-material')?.value || '',
        descricao: document.getElementById('admin-product-description')?.value || '',
        details: document.getElementById('admin-product-details')?.value || ''
    };
}

function translateStikProductInBackground(product, existingI18n = null) {
    if (!product?.id || !window.productStore || !hasProductTranslatableContent(product)) return;
    const sourceSignature = getProductTranslationSignature(product);
    const attemptedAt = new Date().toISOString();

    Promise.resolve()
        .then(async () => {
            const i18n = await translateStikProductPayload(product, existingI18n);
            const latestProduct = productStore.getProduct(product.id);
            if (!latestProduct || getProductTranslationSignature(latestProduct) !== sourceSignature) return;
            const mergedI18n = mergeStikI18n(latestProduct.i18n, i18n);

            productStore.updateProduct(product.id, {
                ...latestProduct,
                i18n: mergedI18n,
                translationStatus: getProductTranslationStatus(latestProduct, mergedI18n),
                translationUpdatedAt: new Date().toISOString(),
                translationAttemptedAt: attemptedAt,
                translationFailedAt: null,
                translationSourceSignature: sourceSignature,
                translationLastError: ''
            });
            refreshAdminProductsUI();
            renderDynamicSidebarCategories();
            showEditorFeedback('Traduções do produto concluídas.');
        })
        .catch(error => {
            console.warn('Traducao do produto em segundo plano indisponivel:', error);
            const latestProduct = productStore.getProduct(product.id);
            if (latestProduct && getProductTranslationSignature(latestProduct) === sourceSignature) {
                productStore.updateProduct(product.id, {
                    ...latestProduct,
                    translationStatus: 'error',
                    translationAttemptedAt: attemptedAt,
                    translationFailedAt: new Date().toISOString(),
                    translationSourceSignature: sourceSignature,
                    translationLastError: String(error?.message || error || 'Falha ao traduzir produto.').slice(0, 500)
                });
                refreshAdminProductsUI();
            }
            showEditorFeedback('Produto salvo. Tradução automática indisponível agora.');
        });
}

async function translateStikCategoryText(category) {
    const sourceCategory = normalizeCategoria(category);
    if (!sourceCategory) return;
    await requestStikDynamicTranslations([
        { id: 'category', text: sourceCategory, format: 'plain' }
    ]);
}

function hasCategoryDynamicTranslations(category) {
    const sourceCategory = normalizeCategoria(category);
    if (!sourceCategory) return true;
    return getStikTranslationTargets().every(language => (
        Boolean(getStikDynamicTranslation(sourceCategory, 'plain', language))
    ));
}

function translateStikCategoryInBackground(category) {
    const sourceCategory = normalizeCategoria(category);
    if (!sourceCategory) return;
    setStikCategoryTranslationStatus(sourceCategory, 'pending');
    refreshAdminProductsUI();

    Promise.resolve()
        .then(async () => {
            await translateStikCategoryText(sourceCategory);
            setStikCategoryTranslationStatus(sourceCategory, 'published');
            refreshAdminProductsUI();
            renderDynamicSidebarCategories();
            showEditorFeedback('Traduções da categoria concluídas.');
        })
        .catch(error => {
            console.warn('Traducao de categoria indisponivel:', error);
            setStikCategoryTranslationStatus(sourceCategory, 'error');
            refreshAdminProductsUI();
            showEditorFeedback('Categoria salva. Tradução automática indisponível agora.');
        });
}

function setupAdminProducts() {
    const form = document.getElementById('admin-product-form');
    const categoryForm = document.getElementById('admin-category-form');
    if (!form || !categoryForm || form.dataset.adminProductsReady === 'true') {
        refreshAdminProductsUI();
        return;
    }
    form.dataset.adminProductsReady = 'true';

    const imageDropzone = document.getElementById('admin-product-image-dropzone');
    const imageFileInput = document.getElementById('admin-product-image-file');
    const imageAddButton = document.getElementById('admin-product-image-add');
    const imageInput = document.getElementById('admin-product-image');
    const imagePreview = document.getElementById('admin-product-image-preview');

    const clearAdminProductImage = () => {
        setAdminProductImages([]);
        if (imageFileInput) imageFileInput.value = '';
    };

    const uploadAdminProductImages = async (files) => {
        const selectedFiles = Array.from(files || []);
        if (!selectedFiles.length) return;

        const invalidFileMessage = selectedFiles.map(validateStikImageFile).find(Boolean);
        if (invalidFileMessage) {
            showEditorFeedback(invalidFileMessage);
            return;
        }

        try {
            imageDropzone?.classList.add('is-uploading');
            const uploadedImages = [];

            for (const file of selectedFiles) {
                const media = window.blogApi
                    ? await window.blogApi.uploadBlogImage(file)
                    : { id: Date.now(), filename: file.name, url: URL.createObjectURL(file) };
                uploadedImages.push({ url: media.url, alt: media.filename || file.name });
            }

            addAdminProductImages(uploadedImages);
            showEditorFeedback(selectedFiles.length === 1 ? 'Imagem do produto adicionada.' : 'Imagens do produto adicionadas.');
        } catch (error) {
            showEditorFeedback('Não foi possível enviar a imagem do produto.');
        } finally {
            imageDropzone?.classList.remove('is-uploading');
        }
    };

    const resetProductForm = () => {
        document.getElementById('admin-product-id').value = '';
        document.getElementById('admin-product-name').value = '';
        clearAdminProductImage();
        document.getElementById('admin-product-material').value = '';
        document.getElementById('admin-product-description').value = '';
        document.getElementById('admin-product-details').value = '';
        document.getElementById('admin-product-form-title').textContent = 'Cadastrar produto';
        refreshAdminCategoryOptions();
        setAdminProductCategory('');
    };

    document.getElementById('admin-new-product')?.addEventListener('click', resetProductForm);
    document.getElementById('admin-product-cancel')?.addEventListener('click', resetProductForm);
    document.getElementById('admin-product-search')?.addEventListener('input', renderAdminProductList);
    setupAdminCategorySelect();

    if (imageDropzone && imageFileInput) {
        imageDropzone.addEventListener('click', () => imageFileInput.click());
        imageAddButton?.addEventListener('click', () => imageFileInput.click());
        imageDropzone.addEventListener('keydown', (event) => {
            if (event.key !== 'Enter' && event.key !== ' ') return;
            event.preventDefault();
            imageFileInput.click();
        });
        imageDropzone.addEventListener('dragover', (event) => {
            event.preventDefault();
            imageDropzone.classList.add('is-dragover');
        });
        imageDropzone.addEventListener('dragleave', (event) => {
            if (!imageDropzone.contains(event.relatedTarget)) {
                imageDropzone.classList.remove('is-dragover');
            }
        });
        imageDropzone.addEventListener('drop', async (event) => {
            event.preventDefault();
            imageDropzone.classList.remove('is-dragover');
            await uploadAdminProductImages(event.dataTransfer && event.dataTransfer.files);
        });
        imageFileInput.addEventListener('change', async () => {
            await uploadAdminProductImages(imageFileInput.files);
            imageFileInput.value = '';
        });
    }

    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        const id = document.getElementById('admin-product-id').value;
        const existingProduct = id ? productStore.getProduct(id) : null;
        const payload = getAdminProductFormPayload();

        if (!payload.imagem) {
            showEditorFeedback('Adicione uma imagem para o produto.');
            imageDropzone?.focus();
            return;
        }

        payload.i18n = getProductI18nWithoutChangedSourceFields(existingProduct, payload);
        payload.publicationStatus = 'published';
        const shouldTranslateProduct = shouldTranslateProductAfterSave(existingProduct, payload, payload.i18n);
        const productSourceSignature = getProductTranslationSignature(payload);
        const existingTranslationStatus = String(existingProduct?.translationStatus || '').toLowerCase();
        const hasSameFailedTranslationSource = existingTranslationStatus === 'error'
            && String(existingProduct?.translationSourceSignature || '') === productSourceSignature;
        payload.translationStatus = shouldTranslateProduct
            ? 'pending'
            : hasSameFailedTranslationSource
                ? 'error'
            : getProductTranslationStatus(payload, payload.i18n);
        payload.translationSourceSignature = shouldTranslateProduct
            ? productSourceSignature
            : existingProduct?.translationSourceSignature || productSourceSignature;
        payload.translationAttemptedAt = shouldTranslateProduct
            ? new Date().toISOString()
            : existingProduct?.translationAttemptedAt || null;
        payload.translationFailedAt = shouldTranslateProduct
            ? null
            : existingProduct?.translationFailedAt || null;
        payload.translationLastError = shouldTranslateProduct
            ? ''
            : existingProduct?.translationLastError || '';
        let savedProduct = null;

        if (id) {
            savedProduct = productStore.updateProduct(id, payload);
            showEditorFeedback('Produto atualizado.');
        } else {
            savedProduct = productStore.createProduct(payload);
            showEditorFeedback('Produto criado.');
        }

        resetProductForm();
        refreshAdminProductsUI();
        renderDynamicSidebarCategories();
        if (shouldTranslateProduct) {
            translateStikProductInBackground(savedProduct, payload.i18n);
        }
    });

    categoryForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const originalInput = document.getElementById('admin-category-original');
        const nameInput = document.getElementById('admin-category-name');
        const original = originalInput.value;
        const nextName = nameInput.value.trim();
        if (!nextName) return;

        if (!original) {
            const alreadyExists = productStore.listCategories()
                .some(category => normalizeBlogSearch(category) === normalizeBlogSearch(nextName));
            if (alreadyExists) {
                showEditorFeedback('Essa categoria já existe.');
                nameInput.focus();
                return;
            }
            const createdCategory = productStore.createCategory(nextName);
            if (createdCategory) adminSelectedCategory = createdCategory;
            showEditorFeedback('Categoria criada.');
            translateStikCategoryInBackground(createdCategory || nextName);
        } else if (normalizeBlogSearch(original) !== normalizeBlogSearch(nextName)) {
            const count = productStore.countProductsByCategory(original);
            const action = await showBlogTagImpactDialog({
                title: count > 0 ? 'Alterar categoria em uso' : 'Alterar categoria',
                message: count > 0
                    ? `Esta categoria está vinculada a ${count} produto${count === 1 ? '' : 's'}. A alteração também será aplicada nesses produtos.`
                    : `Deseja renomear a categoria "${original}"?`,
                actions: [
                    { value: 'rename', label: 'Alterar categoria', className: 'blog-editor-btn-primary' },
                    { value: 'cancel', label: 'Cancelar', className: 'blog-editor-btn-light' }
                ]
            });
            if (action !== 'rename') return;
            setStikCategoryTranslationStatus(original, '');
            productStore.renameCategory(original, nextName);
            showEditorFeedback('Categoria atualizada.');
            translateStikCategoryInBackground(nextName);
        }

        originalInput.value = '';
        nameInput.value = '';
        refreshAdminProductsUI();
        renderDynamicSidebarCategories();
    });

    resetProductForm();
    refreshAdminProductsUI();
}

function normalizeAdminProductImageItem(item, fallbackLabel = 'Imagem do produto') {
    const source = typeof item === 'string' ? { url: item } : (item || {});
    const url = normalizeStikAssetUrl(source.url || source.src || source.imagem || source.image || '');
    const titulo = source.titulo || source.title || '';
    const alt = source.alt || source.label || source.filename || source.name || titulo || fallbackLabel;

    return {
        url,
        titulo: String(titulo || '').trim(),
        alt: String(alt || fallbackLabel).trim()
    };
}

function getAdminProductImages() {
    const imageInput = document.getElementById('admin-product-image');
    const imagesInput = document.getElementById('admin-product-images');
    let images = [];

    try {
        images = JSON.parse(imagesInput?.value || '[]');
    } catch (error) {
        images = [];
    }

    if (!Array.isArray(images)) images = [];
    if (imageInput?.value && !images.some(item => normalizeAdminProductImageItem(item).url === imageInput.value)) {
        images.unshift({ url: imageInput.value, alt: 'Imagem principal do produto' });
    }

    return images
        .map(item => normalizeAdminProductImageItem(item))
        .filter(item => item.url);
}

let adminProductImageDragState = null;
let adminProductImageSuppressClick = false;
let adminProductSelectedImageUrl = '';

function formatAdminProductImageLabel(image, index) {
    const title = String(image?.titulo || '').trim();
    if (title) return title;

    const rawLabel = String(image?.alt || '').trim();
    const rawUrl = String(image?.url || '').trim();
    const genericLabels = new Set([
        '',
        'imagem do produto',
        'imagem principal do produto'
    ]);
    const source = genericLabels.has(rawLabel.toLowerCase()) ? rawUrl : rawLabel;
    const filename = source.split(/[\\/]/).pop() || '';
    const cleaned = filename
        .replace(/\.[a-z0-9]+$/i, '')
        .replace(/\bstik\b/ig, '')
        .replace(/[-_]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

    return cleaned || (index === 0 ? 'Principal' : `Imagem ${index + 1}`);
}

function renderAdminProductImageList(images) {
    const list = document.getElementById('admin-product-image-list');
    if (!list) return;
    const strip = list.closest('.admin-product-image-strip');
    const selectedUrl = getAdminProductSelectedImage(images)?.url || '';

    strip?.classList.toggle('is-empty', !images.length);
    list.classList.toggle('has-scroll', images.length >= 3);
    list.classList.toggle('is-empty', !images.length);
    list.innerHTML = images
        .map((image, index) => `
            <article class="admin-product-image-item ${image.url === selectedUrl ? 'is-selected' : ''}" data-product-image-index="${index}">
                <button type="button" class="admin-product-image-thumb" data-product-image-select="${index}" aria-label="Mostrar imagem ${index + 1} no bloco principal">
                    <img src="${escapeAttribute(image.url)}" alt="${escapeAttribute(image.alt || `Imagem ${index + 1}`)}" loading="lazy" decoding="async" draggable="false">
                    <span>${escapeHtml(formatAdminProductImageLabel(image, index))}</span>
                </button>
                <label class="admin-product-image-title">
                    <span>Título</span>
                    <input type="text" value="${escapeAttribute(image.titulo || '')}" placeholder="${escapeAttribute(formatAdminProductImageLabel(image, index))}" maxlength="40" data-product-image-title="${index}" aria-label="Título da imagem ${index + 1}">
                </label>
                <button type="button" class="admin-product-image-handle" data-product-image-handle="${index}" aria-label="Arrastar para reordenar imagem ${index + 1}">
                    <span aria-hidden="true">⋮⋮</span>
                </button>
                <button type="button" class="admin-product-image-remove" data-product-image-remove="${index}" aria-label="Remover imagem ${index + 1}">
                    <span aria-hidden="true">×</span>
                </button>
            </article>
        `)
        .join('');

    list.querySelectorAll('[data-product-image-index]').forEach(item => {
        item.addEventListener('click', (event) => {
            if (event.target.closest('[data-product-image-remove]')) return;
            if (event.target.closest('[data-product-image-handle]')) return;
            if (event.target.closest('.admin-product-image-title')) return;
            if (adminProductImageSuppressClick) {
                event.preventDefault();
                return;
            }
            selectAdminProductImage(Number(item.dataset.productImageIndex));
        });
    });

    list.querySelectorAll('[data-product-image-remove]').forEach(button => {
        button.addEventListener('click', () => {
            removeAdminProductImage(Number(button.dataset.productImageRemove));
        });
    });

    list.querySelectorAll('[data-product-image-title]').forEach(input => {
        input.addEventListener('input', () => {
            updateAdminProductImageTitle(Number(input.dataset.productImageTitle), input.value);
        });
    });

    setupAdminProductImageReorder(list);
}

function getAdminProductImageDragTargetIndex(state) {
    const images = getAdminProductImages();
    const listStyles = window.getComputedStyle(state.list);
    const gap = parseFloat(listStyles.columnGap || listStyles.gap) || 0;
    const itemWidth = state.item.getBoundingClientRect().width + gap;
    const stepSize = Math.max(itemWidth, 1);
    const steps = Math.round((state.deltaX || 0) / stepSize);
    const targetIndex = state.startIndex + steps;

    return Math.max(0, Math.min(images.length - 1, targetIndex));
}

function moveAdminProductImage(fromIndex, toIndex) {
    const images = getAdminProductImages();
    if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0 || fromIndex >= images.length || toIndex >= images.length) {
        return;
    }

    const [selected] = images.splice(fromIndex, 1);
    images.splice(toIndex, 0, selected);
    setAdminProductImages(images);
}

function setupAdminProductImageReorder(list) {
    list.querySelectorAll('[data-product-image-index]').forEach(item => {
        const handle = item.querySelector('[data-product-image-handle]');
        if (!handle) return;

        const beginReorder = (event, usePointerEvents) => {
            if (adminProductImageDragState) return;
            if (event.button !== undefined && event.button !== 0) return;
            if (event.target.closest('[data-product-image-remove]')) return;
            if (!event.target.closest('[data-product-image-handle]')) return;
            event.preventDefault();

            const startIndex = Number(item.dataset.productImageIndex);
            if (!Number.isFinite(startIndex)) return;

            const moveEventName = usePointerEvents ? 'pointermove' : 'mousemove';
            const endEventName = usePointerEvents ? 'pointerup' : 'mouseup';
            const cancelEventName = usePointerEvents ? 'pointercancel' : 'mouseleave';
            const isTouchPointer = usePointerEvents && event.pointerType === 'touch';
            const state = {
                list,
                item,
                handle,
                pointerId: usePointerEvents ? event.pointerId : null,
                startIndex,
                startX: event.clientX,
                startY: event.clientY,
                deltaX: 0,
                ready: !isTouchPointer,
                dragging: false,
                holdTimer: 0
            };
            adminProductImageDragState = state;

            const cleanup = () => {
                window.clearTimeout(state.holdTimer);
                state.item.classList.remove('is-dragging');
                state.list.classList.remove('is-reordering');
                state.list.classList.remove('is-drop-ready');
                state.item.style.transform = '';
                document.removeEventListener(moveEventName, handleMove);
                document.removeEventListener(endEventName, handleEnd);
                document.removeEventListener(cancelEventName, handleCancel);
                if (usePointerEvents) {
                    document.removeEventListener('mousemove', handleMove);
                    document.removeEventListener('mouseup', handleEnd);
                    document.removeEventListener('mouseleave', handleCancel);
                }
                if (usePointerEvents && state.pointerId !== null) {
                    try {
                        state.handle.releasePointerCapture(state.pointerId);
                    } catch (error) {
                        /* Pointer may already be released by the browser. */
                    }
                }
                if (adminProductImageDragState === state) adminProductImageDragState = null;
            };

            const handleMove = (moveEvent) => {
                if (adminProductImageDragState !== state) return;

                const deltaX = moveEvent.clientX - state.startX;
                const deltaY = moveEvent.clientY - state.startY;
                const distance = Math.hypot(deltaX, deltaY);
                state.deltaX = deltaX;

                if (!state.ready) {
                    if (Math.abs(deltaY) > 16 && Math.abs(deltaY) > Math.abs(deltaX)) {
                        cleanup();
                    }
                    if (Math.abs(deltaX) > 12) {
                        state.ready = true;
                        state.list.classList.add('is-drop-ready');
                    }
                    return;
                }

                if (!state.dragging && Math.abs(deltaX) > 6) {
                    state.dragging = true;
                    state.list.classList.add('is-reordering');
                    state.item.classList.add('is-dragging');
                }

                if (!state.dragging) return;

                moveEvent.preventDefault();
                state.item.style.transform = `translateX(${deltaX}px)`;
            };

            const handleEnd = (endEvent) => {
                const wasDragging = state.dragging;
                const targetIndex = wasDragging
                    ? getAdminProductImageDragTargetIndex(state)
                    : state.startIndex;

                cleanup();

                if (!wasDragging) return;

                adminProductImageSuppressClick = true;
                window.setTimeout(() => {
                    adminProductImageSuppressClick = false;
                }, 120);
                moveAdminProductImage(state.startIndex, targetIndex);
            };

            const handleCancel = () => {
                cleanup();
            };

            state.holdTimer = window.setTimeout(() => {
                if (adminProductImageDragState === state) {
                    state.ready = true;
                    state.list.classList.add('is-drop-ready');
                }
            }, isTouchPointer ? 160 : 0);

            document.addEventListener(moveEventName, handleMove);
            document.addEventListener(endEventName, handleEnd);
            document.addEventListener(cancelEventName, handleCancel);
            if (usePointerEvents) {
                document.addEventListener('mousemove', handleMove);
                document.addEventListener('mouseup', handleEnd);
                document.addEventListener('mouseleave', handleCancel);
            }
            if (usePointerEvents && event.pointerId !== undefined) {
                try {
                    handle.setPointerCapture(event.pointerId);
                } catch (error) {
                    /* Some browsers skip capture for synthetic pointer events. */
                }
            }
        };

        handle.addEventListener('pointerdown', event => beginReorder(event, true));
        handle.addEventListener('mousedown', event => beginReorder(event, false));
        handle.addEventListener('contextmenu', event => event.preventDefault());
    });
}

function getAdminProductSelectedImage(images) {
    const selected = images.find(image => image.url === adminProductSelectedImageUrl);
    if (selected) return selected;
    adminProductSelectedImageUrl = images[0]?.url || '';
    return images[0] || null;
}

function updateAdminProductPreview(image, imagesLength, fallbackLabel = 'Imagem do produto') {
    const imageDropzone = document.getElementById('admin-product-image-dropzone');
    const imagePreview = document.getElementById('admin-product-image-preview');
    if (!imagePreview || !imageDropzone) return;

    if (image) {
        imagePreview.src = image.url;
        imagePreview.alt = image.alt || fallbackLabel;
        imageDropzone.classList.remove('is-empty');
        imageDropzone.setAttribute('aria-label', `${imagesLength} imagem${imagesLength === 1 ? '' : 's'} adicionada${imagesLength === 1 ? '' : 's'}. Clique ou arraste para adicionar mais.`);
        return;
    }

    imagePreview.removeAttribute('src');
    imagePreview.alt = '';
    imageDropzone.classList.add('is-empty');
    imageDropzone.classList.remove('is-dragover', 'is-uploading');
    imageDropzone.setAttribute('aria-label', 'Selecionar imagens do produto');
}

function selectAdminProductImage(index) {
    const images = getAdminProductImages();
    const selected = images[index];
    if (!selected) return;
    adminProductSelectedImageUrl = selected.url;
    setAdminProductImages(images);
}

function setAdminProductImages(items, fallbackLabel = 'Imagem do produto') {
    const imageInput = document.getElementById('admin-product-image');
    const imagesInput = document.getElementById('admin-product-images');
    const seen = new Set();
    const images = (Array.isArray(items) ? items : [items])
        .map(item => normalizeAdminProductImageItem(item, fallbackLabel))
        .filter(item => item.url)
        .filter(item => {
            if (seen.has(item.url)) return false;
            seen.add(item.url);
            return true;
        });

    if (imageInput) imageInput.value = images[0]?.url || '';
    if (imagesInput) imagesInput.value = JSON.stringify(images);
    updateAdminProductPreview(getAdminProductSelectedImage(images), images.length, fallbackLabel);

    renderAdminProductImageList(images);
}

function addAdminProductImages(items) {
    setAdminProductImages([...getAdminProductImages(), ...(Array.isArray(items) ? items : [items])]);
}

function updateAdminProductImageTitle(index, title) {
    const imageInput = document.getElementById('admin-product-image');
    const imagesInput = document.getElementById('admin-product-images');
    const images = getAdminProductImages();
    const image = images[index];
    if (!image) return;

    image.titulo = String(title || '').trim();
    if (imageInput) imageInput.value = images[0]?.url || '';
    if (imagesInput) imagesInput.value = JSON.stringify(images);
    updateAdminProductPreview(getAdminProductSelectedImage(images), images.length);

    const titleInput = document.querySelector(`[data-product-image-title="${index}"]`);
    const label = titleInput?.closest('[data-product-image-index]')?.querySelector('.admin-product-image-thumb span');
    if (label) label.textContent = formatAdminProductImageLabel(image, index);
}

function removeAdminProductImage(index) {
    const images = getAdminProductImages();
    images.splice(index, 1);
    setAdminProductImages(images);
}

function getAdminCategorySelectParts() {
    const shell = document.querySelector('[data-admin-category-select]');
    const select = document.getElementById('admin-product-category');
    const trigger = shell ? shell.querySelector('.admin-category-select-trigger') : null;
    const current = document.getElementById('admin-product-category-current');
    const menu = document.getElementById('admin-product-category-menu');
    return { shell, select, trigger, current, menu };
}

function syncAdminCategorySelectLabel() {
    const { select, current, menu } = getAdminCategorySelectParts();
    if (!select || !current) return;

    const selectedOption = select.options[select.selectedIndex];
    current.textContent = selectedOption ? selectedOption.textContent : 'Selecione uma categoria';

    if (menu) {
        menu.querySelectorAll('[data-admin-category-option]').forEach(button => {
            const isSelected = button.dataset.adminCategoryOption === select.value;
            button.classList.toggle('is-selected', isSelected);
            button.setAttribute('aria-selected', String(isSelected));
        });
    }
}

function setAdminProductCategory(value) {
    const { select } = getAdminCategorySelectParts();
    if (!select) return;
    select.value = value;
    syncAdminCategorySelectLabel();
}

function closeAdminCategorySelect() {
    const { shell, trigger } = getAdminCategorySelectParts();
    if (!shell || !trigger) return;
    shell.classList.remove('is-open');
    trigger.setAttribute('aria-expanded', 'false');
}

function renderAdminCategorySelectMenu() {
    const { select, menu } = getAdminCategorySelectParts();
    if (!select || !menu) return;

    menu.innerHTML = Array.from(select.options)
        .filter(option => option.value)
        .map(option => `
            <button type="button" class="admin-category-select-option" role="option" data-admin-category-option="${escapeAttribute(option.value)}">
                ${escapeHtml(option.textContent)}
            </button>
        `)
        .join('');

    syncAdminCategorySelectLabel();
}

function setupAdminCategorySelect() {
    const { shell, select, trigger, menu } = getAdminCategorySelectParts();
    if (!shell || !select || !trigger || !menu || shell.dataset.ready === 'true') return;
    shell.dataset.ready = 'true';

    trigger.addEventListener('click', () => {
        const isOpen = shell.classList.toggle('is-open');
        trigger.setAttribute('aria-expanded', String(isOpen));
    });

    trigger.addEventListener('keydown', (event) => {
        if (!['ArrowDown', 'Enter', ' '].includes(event.key)) return;
        event.preventDefault();
        shell.classList.add('is-open');
        trigger.setAttribute('aria-expanded', 'true');
        menu.querySelector('.is-selected, .admin-category-select-option')?.focus();
    });

    menu.addEventListener('click', (event) => {
        const option = event.target.closest('[data-admin-category-option]');
        if (!option) return;
        setAdminProductCategory(option.dataset.adminCategoryOption);
        closeAdminCategorySelect();
        trigger.focus();
    });

    menu.addEventListener('keydown', (event) => {
        const options = Array.from(menu.querySelectorAll('[data-admin-category-option]'));
        const currentIndex = options.indexOf(document.activeElement);

        if (event.key === 'Escape') {
            closeAdminCategorySelect();
            trigger.focus();
            return;
        }

        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            document.activeElement?.click();
            return;
        }

        if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
        event.preventDefault();
        const direction = event.key === 'ArrowDown' ? 1 : -1;
        const nextIndex = (currentIndex + direction + options.length) % options.length;
        options[nextIndex]?.focus();
    });

    select.addEventListener('change', syncAdminCategorySelectLabel);

    document.addEventListener('click', (event) => {
        if (!shell.contains(event.target)) closeAdminCategorySelect();
    });
}

function refreshAdminCategoryOptions() {
    const select = document.getElementById('admin-product-category');
    if (!select || !window.productStore) return;
    const currentValue = select.value;
    const categories = productStore.listCategories();

    select.innerHTML = '<option value="" disabled selected hidden>Selecione uma categoria</option>' + categories
        .map(category => `<option value="${escapeAttribute(category)}">${escapeHtml(category)}</option>`)
        .join('');
    select.value = categories.includes(currentValue) ? currentValue : '';
    renderAdminCategorySelectMenu();
}

function refreshAdminProductsUI() {
    if (!window.productStore) return;
    refreshAdminCategoryOptions();
    renderAdminProductList();
    renderAdminCategoryList();
    renderAdminSelectedCategoryProducts();
}

function renderAdminProductList() {
    const list = document.getElementById('admin-product-list');
    if (!list) return;
    const searchTerm = normalizeBlogSearch(document.getElementById('admin-product-search')?.value || '');
    const products = productStore.listProducts()
        .filter(product => {
            if (!searchTerm) return true;
            return [
                product.nome,
                product.categoria,
                product.material,
                product.descricao,
                product.details
            ].some(value => normalizeBlogSearch(value).includes(searchTerm));
        });

    if (!products.length) {
        list.innerHTML = `<p class="admin-empty">${searchTerm ? 'Nenhum produto encontrado para a pesquisa.' : 'Nenhum produto cadastrado.'}</p>`;
        return;
    }

    list.innerHTML = products
        .map(product => {
            const statusMeta = getStikAdminStatusMeta({
                publicationStatus: product.publicationStatus,
                translationStatus: product.translationStatus,
                i18n: product.i18n,
                fields: getProductTranslationFields(product),
                forcePending: !hasCompleteStikI18n(product.i18n, getProductTranslationFields(product))
            });
            return `
            <article class="admin-list-item admin-product-row">
                <img src="${escapeAttribute(normalizeStikAssetUrl(product.imagem))}" alt="${escapeAttribute(formatNome(product.nome))}" loading="lazy" decoding="async">
                <div>
                    <strong>${escapeHtml(formatNome(product.nome))}</strong>
                    <span class="admin-item-subtitle">${escapeHtml(normalizeCategoria(product.categoria))}</span>
                    <div class="admin-item-meta">${renderAdminStatusBadge(statusMeta)}</div>
                </div>
                <div class="admin-list-actions">
                    <button type="button" class="admin-icon-btn" data-admin-edit-product="${escapeAttribute(product.id)}" aria-label="Editar produto">
                        <i class="fas fa-pen"></i>
                    </button>
                    <button type="button" class="admin-icon-btn admin-icon-btn-danger" data-admin-delete-product="${escapeAttribute(product.id)}" aria-label="Excluir produto">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </article>
        `;
        })
        .join('');

    list.querySelectorAll('[data-admin-edit-product]').forEach(button => {
        button.addEventListener('click', () => {
            const product = productStore.getProduct(button.dataset.adminEditProduct);
            if (!product) return;
            document.getElementById('admin-product-id').value = product.id;
            document.getElementById('admin-product-name').value = product.nome;
            setAdminProductImages(product.imagens && product.imagens.length ? product.imagens : [product.imagem], formatNome(product.nome));
            document.getElementById('admin-product-material').value = product.material || 'Elástico';
            document.getElementById('admin-product-description').value = product.descricao || '';
            document.getElementById('admin-product-details').value = product.details || '';
            refreshAdminCategoryOptions();
            setAdminProductCategory(normalizeCategoria(product.categoria));
            document.getElementById('admin-product-form-title').textContent = 'Editar produto';
        });
    });

    list.querySelectorAll('[data-admin-delete-product]').forEach(button => {
        button.addEventListener('click', async () => {
            const action = await showBlogTagImpactDialog({
                title: 'Remover produto',
                message: 'Remover este produto também remove sua exibição da home, categorias, busca e cards relacionados.',
                actions: [
                    { value: 'delete', label: 'Remover produto', className: 'blog-editor-btn-primary' },
                    { value: 'cancel', label: 'Cancelar', className: 'blog-editor-btn-light' }
                ]
            });
            if (action !== 'delete') return;
            productStore.deleteProduct(button.dataset.adminDeleteProduct);
            refreshAdminProductsUI();
            showEditorFeedback('Produto removido.');
        });
    });
}

let adminSelectedCategory = '';
let adminEditingCategory = '';

function renderAdminCategoryList() {
    const list = document.getElementById('admin-category-list');
    if (!list) return;
    const categories = productStore.listCategories();
    const products = productStore.listProducts();
    if (!adminSelectedCategory || !categories.some(category => normalizeBlogSearch(category) === normalizeBlogSearch(adminSelectedCategory))) {
        adminSelectedCategory = categories[0] || '';
    }

    list.innerHTML = categories
        .map(category => {
            const count = products.filter(product => normalizeBlogSearch(product.categoria) === normalizeBlogSearch(category)).length;
            const isSelected = normalizeBlogSearch(category) === normalizeBlogSearch(adminSelectedCategory);
            const isEditing = normalizeBlogSearch(category) === normalizeBlogSearch(adminEditingCategory);
            const categoryTranslationStatus = getStikCategoryTranslationStatus(category);
            const statusMeta = getStikAdminStatusMeta({
                translationStatus: categoryTranslationStatus,
                forcePending: categoryTranslationStatus === '' ? false : !hasCategoryDynamicTranslations(category)
            });
            const mainContent = isEditing
                ? `
                    <form class="admin-category-inline-edit" data-admin-category-inline-form="${escapeAttribute(category)}">
                        <input type="text" value="${escapeAttribute(category)}" placeholder="Novo nome da categoria" aria-label="Editar categoria ${escapeAttribute(category)}">
                        <button type="submit" class="admin-icon-btn" aria-label="Salvar categoria">
                            <i class="fas fa-check"></i>
                        </button>
                    </form>
                `
                : `
                    <button type="button" class="admin-category-open" data-admin-category-open="${escapeAttribute(category)}">
                        <strong>${escapeHtml(category)}</strong>
                        <span class="admin-item-subtitle">${count} produto${count === 1 ? '' : 's'}</span>
                        <span class="admin-item-meta">${renderAdminStatusBadge(statusMeta)}</span>
                    </button>
                `;

            return `
                <article class="admin-category-item ${isSelected ? 'is-selected' : ''}">
                    <div>${mainContent}</div>
                    <div class="admin-list-actions">
                        <button type="button" class="admin-icon-btn" data-admin-edit-category="${escapeAttribute(category)}" aria-label="Editar categoria">
                            <i class="fas fa-pen"></i>
                        </button>
                        <button type="button" class="admin-icon-btn admin-icon-btn-danger" data-admin-delete-category="${escapeAttribute(category)}" aria-label="Remover categoria">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </article>
            `;
        })
        .join('');

    list.querySelectorAll('[data-admin-category-open]').forEach(button => {
        button.addEventListener('click', () => {
            adminSelectedCategory = button.dataset.adminCategoryOpen;
            adminEditingCategory = '';
            renderAdminCategoryList();
            renderAdminSelectedCategoryProducts();
        });
    });

    list.querySelectorAll('[data-admin-category-inline-form]').forEach(form => {
        const input = form.querySelector('input');
        input?.focus();
        input?.select();

        input?.addEventListener('keydown', (event) => {
            if (event.key !== 'Escape') return;
            adminEditingCategory = '';
            renderAdminCategoryList();
        });

        form.addEventListener('submit', async (event) => {
            event.preventDefault();
            await renameAdminCategory(form.dataset.adminCategoryInlineForm, input.value.trim());
        });
    });

    list.querySelectorAll('[data-admin-edit-category]').forEach(button => {
        button.addEventListener('click', () => {
            adminEditingCategory = button.dataset.adminEditCategory;
            renderAdminCategoryList();
        });
    });

    list.querySelectorAll('[data-admin-delete-category]').forEach(button => {
        button.addEventListener('click', async () => {
            const category = button.dataset.adminDeleteCategory;
            const count = productStore.countProductsByCategory(category);

            if (count > 0) {
                await showBlogTagImpactDialog({
                    title: 'Categoria em uso',
                    message: `Esta categoria está vinculada a ${count} produto${count === 1 ? '' : 's'}. Remova ou mova esses produtos antes de excluir a categoria.`,
                    actions: [
                        { value: 'ok', label: 'Entendi', className: 'blog-editor-btn-primary' }
                    ]
                });
                return;
            }

            const action = await showBlogTagImpactDialog({
                title: 'Remover categoria',
                message: `Deseja remover a categoria "${category}"?`,
                actions: [
                    { value: 'delete', label: 'Remover categoria', className: 'blog-editor-btn-primary' },
                    { value: 'cancel', label: 'Cancelar', className: 'blog-editor-btn-light' }
                ]
            });
            if (action !== 'delete') return;
            setStikCategoryTranslationStatus(category, '');
            productStore.deleteCategory(category);
            refreshAdminProductsUI();
            renderDynamicSidebarCategories();
            showEditorFeedback('Categoria removida.');
        });
    });
}

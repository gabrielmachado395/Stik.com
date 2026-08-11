(function () {
    const STORAGE_KEYS = {
        articles: 'stik.blog.mock.articles',
        tags: 'stik.blog.mock.tags',
        media: 'stik.blog.mock.media'
    };

    const DEFAULT_TAGS = [
        'Dicas',
        'Produtos',
        'Tendências',
        'Moda',
        'Lançamentos',
        'Negócios',
        'Consumidor'
    ];

    const API_BASE = window.STIK_BLOG_API_BASE || '/api';
    const USE_MOCKS = window.STIK_USE_BLOG_MOCKS !== false;
    const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif']);
    const MAX_IMAGE_FILE_SIZE = 5 * 1024 * 1024;

    function readStorage(key, fallback) {
        try {
            const value = localStorage.getItem(key);
            return value ? JSON.parse(value) : fallback;
        } catch (error) {
            return fallback;
        }
    }

    function writeStorage(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            if (error && (error.name === 'QuotaExceededError' || error.code === 22)) {
                localStorage.removeItem(STORAGE_KEYS.media);
            }

            try {
                localStorage.setItem(key, JSON.stringify(value));
                return true;
            } catch (retryError) {
                console.warn('Não foi possível salvar dados mock no localStorage:', retryError);
                if (key === STORAGE_KEYS.media) return false;
                throw retryError;
            }
        }
    }

    function slugify(value) {
        return String(value || '')
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '') || `artigo-${Date.now()}`;
    }

    function normalizeTag(value) {
        return String(value || '')
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase()
            .trim();
    }

    function cleanTagName(value) {
        return limitText(getTagName(value), 60);
    }

    function getTagName(tag) {
        return typeof tag === 'string' ? tag : (tag && (tag.name || tag.title)) || '';
    }

    function extractReadableText(html) {
        const cleanHtml = removeEmbeddedImageData(html);

        if (typeof document !== 'undefined') {
            const container = document.createElement('div');
            container.innerHTML = cleanHtml;
            container.querySelectorAll('script, style, noscript, svg, img, iframe, video, audio, canvas').forEach(element => element.remove());
            return container.textContent || '';
        }

        return cleanHtml
            .replace(/<script[\s\S]*?<\/script>/gi, ' ')
            .replace(/<style[\s\S]*?<\/style>/gi, ' ')
            .replace(/<[^>]+>/g, ' ');
    }

    function estimateReadingTime(html) {
        const text = extractReadableText(html);
        const words = text.match(/[A-Za-zÀ-ÖØ-öø-ÿ0-9]+(?:[-'][A-Za-zÀ-ÖØ-öø-ÿ0-9]+)*/g) || [];
        const wordCount = words.length;
        return Math.max(1, Math.ceil(wordCount / 220));
    }

    function removeEmbeddedImageData(value) {
        return String(value || '').replace(/data:image\/[^"'\s>)]+/g, '');
    }

    function limitText(value, maxLength) {
        return String(value || '').trim().slice(0, maxLength);
    }

    function compactContentJson(contentJson) {
        if (!contentJson) return null;
        try {
            return JSON.parse(removeEmbeddedImageData(JSON.stringify(contentJson)));
        } catch (error) {
            return null;
        }
    }

    async function request(path, options = {}) {
        const response = await fetch(`${API_BASE}${path}`, {
            headers: {
                'Content-Type': 'application/json',
                ...(options.headers || {})
            },
            credentials: 'include',
            ...options
        });

        if (!response.ok) {
            const detail = await response.text().catch(() => '');
            throw new Error(detail || `Erro ${response.status}`);
        }

        if (response.status === 204) return null;
        return response.json();
    }

    function normalizeArticlePayload(payload) {
        const now = new Date().toISOString();
        const contentHtml = limitText(removeEmbeddedImageData(payload.contentHtml || payload.content_html || ''), 50000);
        const title = limitText(payload.title || payload.titulo || 'Novo artigo', 140);
        const readingTime = estimateReadingTime(contentHtml);

        return {
            id: payload.id || Date.now(),
            slug: payload.slug || slugify(title),
            title,
            summary: limitText(payload.summary || payload.resumo || '', 500),
            coverUrl: limitText(removeEmbeddedImageData(payload.coverUrl || payload.cover_url || payload.imagem || 'img - Copia/thumb-blog-17-1.jpg'), 2000),
            tags: Array.isArray(payload.tags) ? payload.tags.map(tag => limitText(tag, 60)).filter(Boolean).slice(0, 12) : [],
            status: payload.status || 'draft',
            contentJson: compactContentJson(payload.contentJson || payload.content_json || null),
            contentHtml,
            readingTime,
            createdAt: payload.createdAt || payload.created_at || now,
            updatedAt: now,
            publishedAt: payload.status === 'published' ? (payload.publishedAt || payload.published_at || now) : (payload.publishedAt || payload.published_at || null)
        };
    }

    function listMockArticles() {
        return readStorage(STORAGE_KEYS.articles, []);
    }

    function withEstimatedReadingTime(article) {
        if (!article) return article;
        const contentHtml = limitText(removeEmbeddedImageData(article.contentHtml || article.content_html || ''), 50000);

        return {
            ...article,
            contentHtml,
            readingTime: estimateReadingTime(contentHtml)
        };
    }

    function saveMockArticle(payload) {
        const articles = listMockArticles()
            .map(normalizeArticlePayload)
            .slice(0, 20);
        const article = normalizeArticlePayload(payload);
        const index = articles.findIndex(item => String(item.id) === String(article.id));

        if (index >= 0) {
            articles[index] = {
                ...articles[index],
                ...article,
                createdAt: articles[index].createdAt || article.createdAt
            };
        } else {
            articles.unshift(article);
        }

        writeStorage(STORAGE_KEYS.articles, articles);
        return article;
    }

    async function listArticles(params = {}) {
        if (!USE_MOCKS) {
            const query = new URLSearchParams(params).toString();
            return request(`/articles${query ? `?${query}` : ''}`);
        }

        return listMockArticles().map(withEstimatedReadingTime);
    }

    async function getArticle(idOrSlug) {
        if (!USE_MOCKS) {
            return request(`/articles/${encodeURIComponent(idOrSlug)}`);
        }

        const article = listMockArticles().find(item => String(item.id) === String(idOrSlug) || item.slug === idOrSlug) || null;
        return withEstimatedReadingTime(article);
    }

    async function createArticle(payload) {
        if (!USE_MOCKS) {
            return request('/articles', {
                method: 'POST',
                body: JSON.stringify(payload)
            });
        }

        return saveMockArticle(payload);
    }

    async function updateArticle(id, payload) {
        if (!USE_MOCKS) {
            return request(`/articles/${encodeURIComponent(id)}`, {
                method: 'PUT',
                body: JSON.stringify(payload)
            });
        }

        return saveMockArticle({ ...payload, id });
    }

    async function publishArticle(id) {
        if (!USE_MOCKS) {
            return request(`/articles/${encodeURIComponent(id)}/status`, {
                method: 'PATCH',
                body: JSON.stringify({ status: 'published' })
            });
        }

        const article = listMockArticles().find(item => String(item.id) === String(id));
        if (!article) return null;
        return saveMockArticle({ ...article, status: 'published', publishedAt: new Date().toISOString() });
    }

    async function deleteArticle(id) {
        if (!USE_MOCKS) {
            return request(`/articles/${encodeURIComponent(id)}`, { method: 'DELETE' });
        }

        writeStorage(STORAGE_KEYS.articles, listMockArticles().filter(item => String(item.id) !== String(id)));
        return { ok: true };
    }

    async function listTags() {
        if (!USE_MOCKS) return request('/tags');
        return readStorage(STORAGE_KEYS.tags, DEFAULT_TAGS)
            .map(cleanTagName)
            .filter(Boolean)
            .slice(0, 50);
    }

    async function createTag(name) {
        const cleanName = cleanTagName(name);
        if (!cleanName) throw new Error('Nome da tag invalido.');

        if (!USE_MOCKS) {
            return request('/tags', {
                method: 'POST',
                body: JSON.stringify({ name: cleanName })
            });
        }

        const tags = await listTags();
        if (!tags.some(tag => normalizeTag(tag) === normalizeTag(cleanName))) {
            tags.push(cleanName);
            writeStorage(STORAGE_KEYS.tags, tags);
        }
        return { id: slugify(cleanName), name: cleanName };
    }

    async function getTagUsage(idOrName) {
        if (!USE_MOCKS) return request(`/tags/${encodeURIComponent(idOrName)}/usage`);

        const normalizedTag = normalizeTag(idOrName);
        const articles = listMockArticles()
            .filter(article => Array.isArray(article.tags) && article.tags.some(tag => normalizeTag(tag) === normalizedTag))
            .map(article => ({
                id: article.id,
                title: article.title || article.titulo || 'Artigo sem título',
                status: article.status || 'draft'
            }));

        return {
            id: slugify(idOrName),
            name: idOrName,
            count: articles.length,
            articles
        };
    }

    async function updateTag(idOrName, payload = {}) {
        const nextName = cleanTagName(payload.name);
        if (!nextName) throw new Error('Nome da tag inválido.');

        if (!USE_MOCKS) {
            return request(`/tags/${encodeURIComponent(idOrName)}`, {
                method: 'PATCH',
                body: JSON.stringify({ ...payload, name: nextName })
            });
        }

        const normalizedOld = normalizeTag(idOrName);
        const normalizedNext = normalizeTag(nextName);
        const tags = await listTags();
        const nextTags = tags
            .map(tag => normalizeTag(getTagName(tag)) === normalizedOld ? nextName : tag)
            .filter((tag, index, list) => list.findIndex(item => normalizeTag(getTagName(item)) === normalizeTag(getTagName(tag))) === index);

        if (!nextTags.some(tag => normalizeTag(getTagName(tag)) === normalizedNext)) nextTags.push(nextName);
        writeStorage(STORAGE_KEYS.tags, nextTags);

        if (payload.scope === 'global') {
            const articles = listMockArticles().map(article => ({
                ...article,
                tags: Array.isArray(article.tags)
                    ? article.tags.map(tag => normalizeTag(tag) === normalizedOld ? nextName : tag)
                    : []
            }));
            writeStorage(STORAGE_KEYS.articles, articles);
        }

        return { id: slugify(nextName), name: nextName };
    }

    async function deleteTag(idOrName, payload = {}) {
        if (!USE_MOCKS) {
            return request(`/tags/${encodeURIComponent(idOrName)}`, {
                method: 'DELETE',
                body: JSON.stringify(payload)
            });
        }

        const normalizedTag = normalizeTag(idOrName);
        const tags = readStorage(STORAGE_KEYS.tags, DEFAULT_TAGS)
            .filter(tag => normalizeTag(getTagName(tag)) !== normalizedTag);
        writeStorage(STORAGE_KEYS.tags, tags);

        if (payload.scope === 'global') {
            const articles = listMockArticles().map(article => ({
                ...article,
                tags: Array.isArray(article.tags)
                    ? article.tags.filter(tag => normalizeTag(tag) !== normalizedTag)
                    : []
            }));
            writeStorage(STORAGE_KEYS.articles, articles);
        }

        return { ok: true };
    }

    async function listMedia() {
        if (!USE_MOCKS) return request('/media/blog');
        return readStorage(STORAGE_KEYS.media, []);
    }

    async function uploadBlogImage(file) {
        if (!file) throw new Error('Arquivo inválido.');

        if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
            throw new Error('Escolha uma imagem JPG, PNG, WebP, GIF ou AVIF.');
        }
        if (file.size > MAX_IMAGE_FILE_SIZE) {
            throw new Error('A imagem deve ter no maximo 5 MB.');
        }

        if (!USE_MOCKS) {
            const body = new FormData();
            body.append('file', file);
            const response = await fetch(`${API_BASE}/media/blog`, {
                method: 'POST',
                credentials: 'include',
                body
            });

            if (!response.ok) throw new Error(await response.text());
            return response.json();
        }

        const url = URL.createObjectURL(file);
        const media = {
            id: Date.now(),
            filename: file.name,
            url,
            mimeType: file.type,
            size: file.size,
            createdAt: new Date().toISOString()
        };
        const mediaItems = readStorage(STORAGE_KEYS.media, [])
            .filter(item => item && item.url && !String(item.url).startsWith('data:image/'))
            .slice(0, 19);
        mediaItems.unshift(media);
        writeStorage(STORAGE_KEYS.media, mediaItems);
        return media;
    }

    window.blogApi = {
        API_BASE,
        USE_MOCKS,
        endpoints: {
            articles: '/api/articles',
            articleById: '/api/articles/:id',
            articleBySlug: '/api/articles/slug/:slug',
            articleStatus: '/api/articles/:id/status',
            tags: '/api/tags',
            tagUsage: '/api/tags/:id/usage',
            media: '/api/media/blog'
        },
        listArticles,
        getArticle,
        createArticle,
        updateArticle,
        publishArticle,
        deleteArticle,
        listTags,
        createTag,
        getTagUsage,
        updateTag,
        deleteTag,
        listMedia,
        uploadBlogImage,
        normalizeArticlePayload,
        slugify
    };
})();

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

    function getTagName(tag) {
        return typeof tag === 'string' ? tag : (tag && (tag.name || tag.title)) || '';
    }

    function estimateReadingTime(html) {
        const text = String(html || '').replace(/<[^>]+>/g, ' ');
        const words = text.trim().split(/\s+/).filter(Boolean).length;
        return Math.max(1, Math.ceil(words / 220));
    }

    function removeEmbeddedImageData(value) {
        return String(value || '').replace(/data:image\/[^"'\s>)]+/g, '');
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
        const contentHtml = removeEmbeddedImageData(payload.contentHtml || payload.content_html || '');
        const title = payload.title || payload.titulo || 'Novo artigo';

        return {
            id: payload.id || Date.now(),
            slug: payload.slug || slugify(title),
            title,
            summary: payload.summary || payload.resumo || '',
            coverUrl: removeEmbeddedImageData(payload.coverUrl || payload.cover_url || payload.imagem || 'img - Copia/thumb-blog-17-1.jpg'),
            tags: Array.isArray(payload.tags) ? payload.tags : [],
            status: payload.status || 'draft',
            contentJson: compactContentJson(payload.contentJson || payload.content_json || null),
            contentHtml,
            readingTime: payload.readingTime || payload.reading_time || estimateReadingTime(contentHtml),
            createdAt: payload.createdAt || payload.created_at || now,
            updatedAt: now,
            publishedAt: payload.status === 'published' ? (payload.publishedAt || payload.published_at || now) : (payload.publishedAt || payload.published_at || null)
        };
    }

    function listMockArticles() {
        return readStorage(STORAGE_KEYS.articles, []);
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

        return listMockArticles();
    }

    async function getArticle(idOrSlug) {
        if (!USE_MOCKS) {
            return request(`/articles/${encodeURIComponent(idOrSlug)}`);
        }

        return listMockArticles().find(article => String(article.id) === String(idOrSlug) || article.slug === idOrSlug) || null;
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
        return readStorage(STORAGE_KEYS.tags, DEFAULT_TAGS);
    }

    async function createTag(name) {
        if (!USE_MOCKS) {
            return request('/tags', {
                method: 'POST',
                body: JSON.stringify({ name })
            });
        }

        const tags = readStorage(STORAGE_KEYS.tags, DEFAULT_TAGS);
        if (!tags.some(tag => tag.toLowerCase() === name.toLowerCase())) {
            tags.push(name);
            writeStorage(STORAGE_KEYS.tags, tags);
        }
        return { id: slugify(name), name };
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
        if (!USE_MOCKS) {
            return request(`/tags/${encodeURIComponent(idOrName)}`, {
                method: 'PATCH',
                body: JSON.stringify(payload)
            });
        }

        const nextName = String(payload.name || '').trim();
        if (!nextName) throw new Error('Nome da tag inválido.');

        const normalizedOld = normalizeTag(idOrName);
        const normalizedNext = normalizeTag(nextName);
        const tags = readStorage(STORAGE_KEYS.tags, DEFAULT_TAGS);
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

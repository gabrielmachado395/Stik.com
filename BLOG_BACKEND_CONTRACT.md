# Contrato do Blog para o Backend

Regra de negócio atual dos artigos:

- Título
- Capa
- Resumo
- Conteúdo
- Tags

O frontend já está preparado para consumir estes endpoints. Enquanto o backend não existe, `stylesheet/blogApi.js` usa mocks em `localStorage`.

Para ativar backend real no frontend:

```html
<script>
  window.STIK_USE_BLOG_MOCKS = false;
  window.STIK_BLOG_API_BASE = "/api";
</script>
```

## Artigos

### `GET /api/articles`

Lista artigos para o blog público/admin.

Resposta esperada:

```json
[
  {
    "id": 123,
    "title": "Tendência loungewear e elásticos indicados",
    "summary": "Do sofá para as ruas...",
    "coverUrl": "/uploads/blog/loungewear.jpg",
    "tags": ["Dicas", "Produtos", "Tendências"],
    "status": "published",
    "contentJson": {},
    "contentHtml": "<p>Conteúdo do artigo...</p>",
    "readingTime": 7,
    "createdAt": "2026-07-22T12:00:00.000Z",
    "updatedAt": "2026-07-22T12:30:00.000Z",
    "publishedAt": "2026-07-22T12:30:00.000Z"
  }
]
```

### `GET /api/articles/:id`

Busca um artigo por ID.

### `POST /api/articles`

Cria artigo.

Payload:

```json
{
  "title": "Título do artigo",
  "summary": "Resumo curto",
  "coverUrl": "/uploads/blog/capa.jpg",
  "tags": ["Dicas"],
  "status": "draft",
  "contentJson": {},
  "contentHtml": "<p>Conteúdo renderizado...</p>"
}
```

O backend deve calcular:

- `createdAt`
- `updatedAt`
- `publishedAt`, apenas quando `status` for `published`
- `readingTime`

### `PUT /api/articles/:id`

Atualiza artigo.

### `PATCH /api/articles/:id/status`

Atualiza status.

Payload:

```json
{
  "status": "published"
}
```

Status esperados:

- `draft`
- `published`
- `archived`

### `DELETE /api/articles/:id`

Remove ou arquiva artigo.

## Tags

### `GET /api/tags`

Resposta:

```json
[
  { "id": 1, "name": "Dicas" }
]
```

### `POST /api/tags`

Payload:

```json
{
  "name": "Tendências"
}
```

### `DELETE /api/tags/:id`

Remove tag.

## Mídia

### `GET /api/media/blog`

Lista imagens já enviadas para que o editor possa reutilizar uma imagem como capa ou no conteúdo.

Resposta esperada:

```json
[
  {
    "id": 12,
    "filename": "loungewear.jpg",
    "url": "/uploads/blog/loungewear.jpg",
    "mimeType": "image/jpeg",
    "size": 250000,
    "createdAt": "2026-07-22T12:00:00.000Z"
  }
]
```

### `POST /api/media/blog`

Upload de imagem via `multipart/form-data`.

Campo:

```txt
file
```

Resposta:

```json
{
  "id": 12,
  "filename": "loungewear.jpg",
  "url": "/uploads/blog/loungewear.jpg",
  "mimeType": "image/jpeg",
  "size": 250000,
  "createdAt": "2026-07-22T12:00:00.000Z"
}
```

O frontend usa `url` como `coverUrl` quando a imagem é capa, ou insere a URL dentro do conteúdo quando a imagem é usada no corpo do artigo.

### `DELETE /api/media/:id`

Remove imagem.

## Responsabilidades do Backend

- Salvar em MariaDB/MySQL.
- Sanitizar `contentHtml`.
- Validar links e uploads.
- Proteger rotas admin com autenticação.
- Salvar imagens em diretório persistente ou storage externo.

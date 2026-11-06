# Artify CMS

A category-based content management system built with Express, EJS and JSON file storage. The project follows the folder naming and class-based coding style used in Assignment 1.

## Setup

```bash
npm install
npm run dev
```

Open `http://localhost:5000`.

The server reads the port from `.env`. The default is `5000`.

## Project structure

```text
CMS_crud/
├── data/
│   ├── category.json
│   └── content.json
├── src/
│   ├── controller/
│   │   ├── category.controller.js
│   │   ├── content.controller.js
│   │   └── public.controller.js
│   ├── model/
│   │   ├── category.model.js
│   │   └── content.model.js
│   ├── routes/
│   │   ├── category.routes.js
│   │   ├── category.api.routes.js
│   │   ├── content.routes.js
│   │   ├── content.api.routes.js
│   │   └── public.routes.js
│   ├── services/
│   │   ├── category.services.js
│   │   └── content.services.js
│   ├── utils/
│   │   └── AppErrors.js
│   ├── validation/
│   │   ├── category.validation.js
│   │   └── content.validation.js
│   └── views/
│       ├── category/
│       ├── content/
│       ├── partials/
│       └── home.ejs
├── server.js
└── package.json
```

## Website routes

| Page | Route |
|---|---|
| Home | `/` |
| Categories | `/category` |
| Create category | `/category/create` |
| Category details | `/category/:id` |
| Edit category | `/category/:id/edit` |
| Content management | `/content` |
| Create content | `/content/create` |
| Content details | `/content/:id` |
| Edit content | `/content/:id/edit` |

The website forms use `method-override` for PATCH and DELETE requests.

## API routes

Base URL: `http://localhost:5000`

### Category API

- GET `/v1/category`
- GET `/v1/category/:id`
- POST `/v1/category`
- PATCH `/v1/category/:id`
- DELETE `/v1/category/:id`

Example category request body:

```json
{
  "name": "Technology",
  "description": "Technology articles",
  "imageurl": "https://example.com/technology.jpg"
}
```

### Content API

- GET `/v1/content`
- GET `/v1/content?categoryId=CATEGORY_ID`
- GET `/v1/content?status=published`
- GET `/v1/content/:id`
- POST `/v1/content`
- PATCH `/v1/content/:id`
- DELETE `/v1/content/:id`

Example content request body:

```json
{
  "categoryId": "CATEGORY_ID",
  "title": "Getting Started",
  "description": "An introduction",
  "body": "The complete article body goes here.",
  "thumbnail": "https://example.com/thumbnail.jpg",
  "status": "draft"
}
```

## Data rules

- IDs are generated with `crypto.randomUUID()`.
- Category names must be unique, ignoring letter case.
- Categories use their IDs for lookups. There is no category slug field.
- Content must reference an existing category.
- Content status must be `draft` or `published`.
- Updating content preserves its ID and creation date, and updates its modification date.
- A category cannot be deleted while content is assigned to it.
- The public home page displays published content only.
- JSON data is stored in the `data/` directory. There is no `public/` directory or separate CSS/JS asset folder. Tailwind utility classes are used directly in EJS views.

## Note

This assignment uses local JSON files and synchronous file operations to stay consistent with the Assignment 1 implementation style. It is suitable for a learning assignment, not a concurrent production deployment. For production, use a database and add authentication, authorization, CSRF protection, validation hardening and backups.

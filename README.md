# Headless E-commerce Showcase — Phone Accessories

A **headless** e-commerce showcase built with:

| Part | Technology | Role |
|------|-----------|------|
| Backend | [Strapi](https://strapi.io/) v4 | Headless CMS + REST API (no public web pages) |
| Frontend | [Next.js](https://nextjs.org/) 14 | Showcase website (fetches the API) |
| DevOps | Docker + Docker Compose | Containerization of both apps |

```
backend-accessoires (Strapi :1337)  ──REST API──▶  frontend-vitrine (Next.js :3000)
```

## Repository structure

```
.
├── backend-accessoires/      # Strapi 4 CMS (API only)
│   ├── src/api/
│   │   ├── category/         # Category collection type
│   │   └── product/          # Product collection type
│   ├── scripts/seed-demo-content.sh  # seeds demo content via admin API
│   ├── Dockerfile
│   └── .dockerignore
├── frontend-vitrine/         # Next.js 14 showcase
│   ├── src/app/page.tsx      # SSR product grid (fetches Strapi)
│   ├── Dockerfile
│   └── .dockerignore
├── docs/
│   ├── images/               # product photos used by the seed script
│   └── screenshots/          # proof the showcase works
├── docker-compose.yml        # orchestrates both containers
└── .gitignore
```

## Data model (Strapi)

* **Category** — Text field `name`
* **Product** — Text `title`, Rich Text (Blocks) `description`, Number (Decimal) `price`,
  Media (single) `image`, Relation "Product belongs to one Category"

The Public role is granted `find` / `findOne` on both collections, so the API is
openly readable: `GET /api/products?populate=*`.

## Prerequisites

* Node.js 18+ (developed on Node 20)
* Docker Desktop (only for Part 3)

## Part 1 — Run the backend (Strapi)

```bash
cd backend-accessoires
npm install
npm run build          # once, to build the admin panel
npm run develop        # http://localhost:1337/admin
```

First login (created for this project):

* **URL:** http://localhost:1337/admin
* **Email:** `admin@accessories-store.dev`
* **Password:** `Admin1234!`

### Seed demo content (2 categories + 5 published products)

```bash
cd backend-accessoires
bash scripts/seed-demo-content.sh
```

The script is the scripted equivalent of clicking through the admin UI
(Content Manager + Settings → Roles → Public): it creates the categories,
uploads the product images from `docs/images/`, creates and **publishes** the
products, and enables the public `find` / `findOne` permissions.

### Test the API

```bash
curl "http://localhost:1337/api/products?populate=*"
```

Returns

```json
{"data":[{"id":1,"attributes":{"title":"Silicone iPhone 15 Case","price":19.99,
"image":{"data":{"attributes":{"url":"/uploads/case_silicone_....png"}}},
"category":{"data":{"attributes":{"name":"Cases"}}},"publishedAt":"..."}}], "meta":{...}}
```

See [`docs/screenshots/strapi-api-response.png`](docs/screenshots/strapi-api-response.png).

## Part 2 — Run the frontend (Next.js showcase)

```bash
cd frontend-vitrine
npm install
echo "NEXT_PUBLIC_API_URL=http://127.0.0.1:1337" > .env.local   # already exists
npm run dev         # http://localhost:3000
```

`src/app/page.tsx` is a server component that fetches the Strapi API at request
time (`cache: 'no-store'`) and renders the product grid with Tailwind CSS.

## Part 3 — Run with Docker

From the **repository root**:

```bash
docker-compose up --build
```

| Service | Container | URL |
|---------|-----------|-----|
| Backend (Strapi) | `strapi_backend` | http://localhost:1337 |
| Frontend (Next.js) | `nextjs_frontend` | http://localhost:3000 |

Inside the Docker network the frontend reaches Strapi at
`http://backend:1337` (service name), which is why
`NEXT_PUBLIC_API_URL` is set to that value for the container builds.
Uploaded files and the SQLite database persist through the
`public/uploads` and `.tmp` bind mounts.

> The containers start with an empty SQLite database, so create the admin
> account and seed the demo content once (locally the same two commands work
> against `npm run develop`):
>
> ```bash
> docker exec -it strapi_backend npx strapi admin:create-user \
>   --email=admin@accessories-store.dev --password=Admin1234! \
>   --firstname=Store --lastname=Admin
> docker exec -it strapi_backend bash scripts/seed-demo-content.sh
> ```

## Screenshots (proof the showcase works)

| Screenshot | |
|---|---|
| Desktop storefront | [`docs/screenshots/storefront-desktop.png`](docs/screenshots/storefront-desktop.png) |
| Mobile storefront (responsive grid) | [`docs/screenshots/storefront-mobile.png`](docs/screenshots/storefront-mobile.png) |
| Strapi REST API response | [`docs/screenshots/strapi-api-response.png`](docs/screenshots/strapi-api-response.png) |

## Deliverables checklist

1. ✅ GitHub repository containing `backend-accessoires/` and `frontend-vitrine/` (this repo)
2. ✅ Screenshots of the working frontend (`docs/screenshots/`)
3. ✅ [`docker-compose.yml`](docker-compose.yml)

## Implementation notes (small deviations from the brief, all documented)

1. **Next.js pinned to 14.2.** `create-next-app@latest` now installs Next.js 16,
   whose build pipeline rejects pages with dynamic `fetch(..., {cache: 'no-store'})`
   during prerendering. Next.js 14.2 is the generation the assignment code was
   written for, so the reference `page.tsx` works exactly as provided and the
   `node:18-alpine` images apply without changes.
2. **`.eslintrc.json`** downgrades `no-unused-vars` and `no-explicit-any` to
   *warnings* so the professor's unmodified page code passes
   `npm run build` (linting still runs).
3. **Backend Dockerfile** adds `python3` to the apk packages: `better-sqlite3`
   compiles from source and node-gyp requires Python 3 on Alpine images.
4. **`docker-compose.yml`** keeps the assignment structure and additionally
   provides the Strapi `APP_KEYS`/secret env vars (so containers don't generate
   throw-away keys on every boot) and a healthcheck so the frontend waits for
   Strapi to be ready.
5. **Admin credentials / dev secrets** in this README and the compose file are
   local development values, safe to share for this exercise only.
6. Content and admin account are reproducible via
   `backend-accessoires/scripts/seed-demo-content.sh` and
   `strapi admin:create-user`; the SQLite data itself is intentionally not
   committed (it lives in the gitignored `.tmp/`).

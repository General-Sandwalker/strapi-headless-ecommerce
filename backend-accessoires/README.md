# backend-accessoires — Strapi CMS (headless API)

Strapi v4 application serving the phone-accessories catalog over REST.
It has **no public web pages** — only the admin panel and the API.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run develop` | Dev server with auto-reload (http://localhost:1337/admin) |
| `npm run build` | Build the admin panel (`build/`) |
| `npm start` | Start the built app (production) |
| `bash scripts/seed-demo-content.sh` | Seed 2 categories + 5 published products via the admin API |

## Content types

* `Category` — `name` (text)
* `Product` — `title` (text), `description` (rich text blocks), `price` (decimal),
  `image` (single media), `category` (many-to-one relation)

## Endpoints (Public role: `find`, `findOne`)

* `GET /api/categories`
* `GET /api/categories/:id`
* `GET /api/products?populate=*`
* `GET /api/products/:id`

## Docker

See the [`Dockerfile`](Dockerfile) in this folder and `docker-compose.yml` at the
repository root. Note the image adds `python3` on top of the assignment's
package list so node-gyp can compile `better-sqlite3` on Alpine.

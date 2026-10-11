# frontend-vitrine — Next.js showcase

Next.js 14 (App Router, TypeScript, Tailwind CSS) storefront that consumes the
Strapi REST API.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Dev server (http://localhost:3000) |
| `npm run build` | Production build |
| `npm start` | Serve the production build |

## Configuration

`.env.local` (not committed, gitignored):

```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:1337
```

In Docker, `NEXT_PUBLIC_API_URL` is `http://backend:1337` (the compose service
name) and is baked into the client bundle at build time.

## How it works

`src/app/page.tsx` is an **async server component** that fetches
`${NEXT_PUBLIC_API_URL}/api/products?populate=*` on every request
(`cache: 'no-store'`) and renders the grid: image, title, price (with the
Strapi `image.data.attributes.url` resolved against the API URL).

## Docker

See the [`Dockerfile`](Dockerfile) in this folder and `docker-compose.yml` at
the repository root.

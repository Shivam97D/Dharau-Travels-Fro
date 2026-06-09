# Dharavu Journeys — Frontend

Vite + React 19 single-page app for the Dharavu Journeys travel platform.

## Stack
- Vite 7 + React 19 + TypeScript
- TanStack Router (file-based) + TanStack Query
- Tailwind CSS v4 + Radix UI primitives
- framer-motion, recharts, sonner (toasts)

## Getting started

```bash
cp .env.example .env        # set VITE_API_URL to your API base
npm install
npm run dev                 # http://localhost:8080
```

`VITE_API_URL` should point at the API, e.g. `http://localhost:5000/api` for local
or `https://<your-api>.onrender.com/api` in production.

## Scripts
- `npm run dev` — dev server (port 8080)
- `npm run build` — typecheck + production build to `dist/`
- `npm run preview` — preview the production build
- `npm run lint` — ESLint

## Structure
- `src/routes/` — file-based routes (`/`, `/trips/$slug`, `/dashboard`, `/profile`, `/admin`)
- `src/components/site/` — public landing + trip detail + modals (booking, auth, inquiry)
- `src/components/dashboard/` — user dashboard + admin panels
- `src/lib/` — API client, auth context, global auth-modal, types

## Features
- Public: hero/landing, featured trips, trip detail, reviews, newsletter signup,
  custom-trip inquiry
- Auth: register/login (global modal), profile + password management
- User: bookings (request-to-book), wishlist/saved trips, write reviews
- Admin/Owner: dashboard analytics, trips CRUD, bookings, inquiries, reviews
  moderation, users + roles, newsletter subscribers

## Deploy (Netlify)
[`netlify.toml`](./netlify.toml) sets build command and SPA fallback.
[`public/_redirects`](./public/_redirects) proxies `/api/*` to the backend and
provides the SPA fallback. Set `VITE_API_URL` in Netlify environment variables.

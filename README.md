# lapakBenz

**Vehicle marketplace and community platform for Indonesian automotive communities and UMKM**

lapakBenz is a React SPA that combines a vehicle marketplace, event discovery, and community/merchant onboarding in one application — built for automotive communities, UMKM (small businesses), and other Indonesian community groups to sell, host events, and connect in one place.

Live: [lapakbenz.com](https://lapakbenz.com) · Demo: [lapakbenzz.vercel.app](https://lapakbenzz.vercel.app/)

---

## Features

**Marketplace**
- Product catalog, product detail, cart, and checkout
- Order tracking, order history, and invoices
- Wishlist and wallet (points, refund history)
- Voucher redemption

**Merchants & Partners**
- Merchant registration
- Partner/store pages and detail views

**Community & Events**
- Event listings and event detail pages
- Public registration flow

**Platform**
- Authentication (login, register, OTP verification, password reset)
- Notifications with filtering
- Live chat
- Push notifications (OneSignal)
- Installable PWA

---

## Tech Stack

- **React 19** + **TypeScript**, bundled with **Vite**
- **React Router v7** for routing
- **TanStack Query (React Query)** for server state, **Zustand** for client state
- **Axios** for API access, with hooks/types organized per domain (product, cart, order, event, voucher, wishlist, shipping, partner)
- **Tailwind CSS** for styling
- **react-helmet-async** for per-route meta tags
- **OneSignal** for push notifications
- **vite-plugin-pwa** for PWA support

## Architecture Notes

lapakBenz is a client-rendered SPA, which normally means search engines and social platforms only see an empty HTML shell. To solve this without moving to a server-rendered framework, the project includes a custom static-generation pipeline (`scripts/generate-static.mjs`) that pre-renders per-route HTML with the correct `<title>`, description, and Open Graph tags for every product, event, and merchant page before deploy.

---

## Getting Started

### Prerequisites

- **Node.js** 20.19+ or 22.12+ (required by Vite 7)
- **pnpm** — the repository ships a `pnpm-lock.yaml`; npm works too, but won't use the lockfile

### Install

```bash
git clone https://github.com/Wridho788/merciku.git
cd merciku
pnpm install
```

### Environment variables

The client reads no build-time environment variables. The API base URL lives in `src/api/constants.ts` (`BASE_URL`) and the public OneSignal App ID in `src/hooks/useOneSignal.ts`.

The only variable is for the optional Express server:

| Variable | Used by | Default | Description |
| --- | --- | --- | --- |
| `PORT` | `scripts/server.mjs` | `3001` | Port the production server listens on |

Copy `.env.example` to `.env` if you need to override it. Never commit `.env` or any secret key. Server-side keys (such as a OneSignal REST API key) must not go into client code, because everything under `src/` ships to the browser.

### Run locally

```bash
pnpm dev            # Vite dev server at http://localhost:5173
pnpm lint           # ESLint
```

### Build

```bash
pnpm build          # type-check (tsc -b) and build to dist/
pnpm build:seo      # regenerate pre-rendered SEO pages in public/, then build
pnpm preview        # serve dist/ locally to check the production build
```

### Deploy

**Vercel (primary).** Import the repository into Vercel, keep the Vite framework preset, and use `pnpm build` (or `pnpm build:seo`) as the build command with `dist` as the output directory. `vercel.json` already handles the SPA route rewrites and cache headers.

**Self-hosted alternatives.** Build first, then pick one:

- `pnpm serve` runs `scripts/server.mjs` (Express), which serves `dist/` and returns pre-rendered HTML to crawlers.
- `scripts/nginx.conf` is an Nginx site config (root `/var/www/lapakbenz/dist`) with SPA fallback and crawler routing.
- `scripts/.htaccess` is the Apache equivalent; copy it into the web root that holds the `dist/` contents.

---

## License

Copyright © 2025–2026 Wridho788. All rights reserved.

This is proprietary software. No permission is granted to use, copy, modify, or distribute it without prior written consent from the copyright holder. See [LICENSE](LICENSE).

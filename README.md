# Maldives.org

Premium Maldives discovery, transfer and trip-planning foundation built from the supplied screen recording, PRD and super-prompts.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`. The site uses clearly labelled sample inventory and remote image references so the UI can be reviewed before partner media and Supabase credentials are connected.

## Included surface

- Homepage matched to the supplied recording: transparent navigation, aerial hero, floating stay search, live Malé widget, stay categories, featured stays, experiences bento, guide band, newsletter and footer.
- Public discovery routes: `/stay`, `/resorts`, `/guesthouses`, `/experiences`, `/transfers`, `/guides`, `/deals`, `/atolls`, `/islands/[slug]`, `/plan-your-trip`, `/compare`, `/wishlist`.
- Detail-ready pages for sample stays, experiences, guides, routes and atolls.
- Account, partner and admin workspace shells with responsive operational UI.
- Local wishlist interactions, search/filter state, map/list toggle, trip-builder steps, newsletter success state, concierge demo panel and route-query submission.
- API-ready booking foundation: normalized supplier contract, source/availability labels, booking-request flow, confirmation state, “How it works” page and affiliate disclosure template.
- Backend-ready request APIs for bookings, contact enquiries and newsletter subscriptions, plus Supabase persistence when configured.
- Stripe Checkout and webhook endpoints are wired but remain disabled until keys and business/tax decisions are provided.
- Viator product adapter, checkout/reference routes and reproducible Playwright/CI smoke tests.
- Supabase foundation migration, RLS starting policies, sample seed and `.env.example` for the production integration described in the PRD.

## Supplier integration plan

The integration layer now targets Hotelbeds for hotel search and availability, Viator Affiliate for experiences, and direct Maldives partners for local stays/transfers. Hotelbeds credentials stay server-side, and live stay search activates when Maldives hotel codes are configured in `HOTELBEDS_MALDIVES_HOTEL_CODES`; otherwise the site safely keeps its labelled sample inventory. See [docs/API-READINESS.md](docs/API-READINESS.md) for the normalized contract and implementation order.

## Before launch

Replace all sample listings and remote images with licensed/partner-confirmed content. Follow [docs/BEGINNER-SETUP.md](docs/BEGINNER-SETUP.md), connect Supabase, complete Hotelbeds/Viator supplier certification, add Resend credentials, activate Stripe only after business/tax review, and complete the PRD launch checklist.

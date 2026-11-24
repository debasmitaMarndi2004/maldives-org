# Maldives.org local setup

Install the Node version in `.nvmrc`.

```bash
npm ci
npm run dev
```

Open `http://localhost:3000`. For testing a configured site origin, set `NEXT_PUBLIC_SITE_URL` in `.env.local` using `.env.example`. It defaults to the public Maldives.org origin.

Browse stays, tour guides and transfers. Use test details to try the contact, newsletter and booking-request previews.

## Verify changes

Stop the local server before running browser tests. Playwright manages its own server on port 3000.

```bash
npm run lint
npm run build
npx playwright install chromium
PLAYWRIGHT_USE_PRODUCTION=1 npm run test:e2e
```

See [API readiness](API-READINESS.md) for what to confirm before introducing a booking partner.

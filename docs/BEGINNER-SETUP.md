# Maldives.org beginner setup

The code is safe to run without the paid services. Missing keys show a clear setup message or a preview response; they do not expose secrets or crash the site.

## 1. Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## 2. Supabase

1. Create a Supabase project.
2. Run `supabase/migrations/0001_foundation.sql` in Supabase SQL Editor.
3. Run `supabase/migrations/0002_booking_and_leads.sql`.
4. Run `supabase/migrations/0003_hotelbeds_workflow.sql`.
5. Put the project URL, anon key and service-role key in `.env.local`.

Never put `SUPABASE_SERVICE_ROLE_KEY` in a `NEXT_PUBLIC_*` variable or browser code.

## 3. Hotelbeds

1. Get Maldives hotel codes from the Hotelbeds Content API.
2. Add them as comma-separated numbers:

```env
HOTELBEDS_MALDIVES_HOTEL_CODES=12345,67890
```

3. Keep `HOTELBEDS_ENVIRONMENT=test` while testing.

The adapter passes live availability into the request flow. CheckRate and booking endpoints are implemented, but confirmation is intentionally disabled by default. Hotelbeds requires mTLS for these booking operations. Add the certificate, key and CA as base64 environment variables only after Hotelbeds supplies them, then use `HOTELBEDS_BOOKING_MODE=test` for approved sandbox certification testing. Keep `disabled` until then.

## 4. Viator

```env
VIATOR_API_KEY=your_key
VIATOR_API_ENVIRONMENT=sandbox
VIATOR_API_PARTNER_TYPE=affiliate
```

Affiliate partners redirect the traveller to Viator for the transaction. Use sandbox until the integration is approved.

## 5. Resend

Verify a sending domain in Resend, then add:

```env
RESEND_API_KEY=...
RESEND_FROM_EMAIL=Maldives.org <hello@your-domain.com>
ADMIN_NOTIFICATION_EMAIL=your-team@example.com
```

Without these values the forms keep a preview response and do not pretend an email was sent.

## 6. Stripe: wired, activate later

```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_CURRENCY=usd
```

The Checkout API and webhook are already included. Do not use live keys until the legal entity, refund policy and tax treatment are approved.

## 7. Preview domain

Use `http://localhost:3000` locally. For hosted testing, set `NEXT_PUBLIC_SITE_URL` to the real preview URL supplied by Vercel, Netlify or your host. Do not use a made-up domain for payment redirects.

## 8. Verify

```bash
npm run lint
npm run build
npm run test:e2e -- --project=chromium
npm audit --audit-level=high
```

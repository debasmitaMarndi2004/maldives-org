# Native Aviasales flight search

Homepage flight form → `/flights` → same-origin `/api/flights` (start/poll/buy).
Stays search and all existing content remain available; accommodation APIs are not added.
The experimental third-party flight widget is replaced by the native form.

## Server environment

Never use NEXT_PUBLIC_ for private credentials. Set:

- `AVIASALES_API_TOKEN`: a newly rotated private token (the previous token was shared in chat).
- `AVIASALES_PARTNER_ID`: account partner ID.
- `AVIASALES_SEARCH_ENABLED=true`: enable only with approved Search API access.
- `NEXT_PUBLIC_SITE_URL`: canonical HTTPS site origin.
- `AVIASALES_RESULTS_HOSTS`: comma-separated exact provider results hostnames, from your approved deployment/provider configuration. The default is `tickets-api.travelpayouts.com`; regional hosts returned by the provider require explicit approval.
- `AVIASALES_BOOKING_HOSTS`: comma-separated approved airline/agency booking hostnames. Empty blocks all booking handoffs. Do not use wildcards.
- On Vercel, the platform `VERCEL=1` and `x-vercel-forwarded-for` identify the visitor. On other hosts, set `AVIASALES_TRUST_PROXY=true` only if a trusted reverse proxy overwrites incoming `x-forwarded-for`. Never substitute a fake visitor IP.

Rebuild/restart after configuring the environment. The account token is never bundled, logged or returned to the browser. Search state and per-offer Buy tokens are encrypted/authenticated and expire after 14 minutes. Rotating the token invalidates existing searches.

## Provider contract and constraints

Sources reviewed:
- https://support.travelpayouts.com/hc/en-us/articles/30565016140434
- https://support.travelpayouts.com/hc/en-us/articles/210996008
- Official request and response OpenAPI downloads linked from the first article.

Start: signed POST to `https://tickets-api.travelpayouts.com/search/affiliate/start`.
Results: POST to the approved returned host `/search/affiliate/results`, with the returned timestamp; polling ends when `is_over` or the UI's two-minute wait limit is reached.
Buy: GET `/searches/{search_id}/clicks/{proposal_id}` only on explicit click. The provider-generated destination must be HTTPS, an approved exact host, and GET. POST-based partner handoffs currently fail closed rather than silently dropping form parameters.
No tickets are issued, no payments are taken and no reservations are made on Maldives.org. Stripe and direct Hotelbeds transactions stay disabled.

Rate limits are process-local guardrails, not distributed abuse protection. Shared rate limiting is recommended before traffic increases. User-agent and real visitor IP are forwarded to the provider as required; include this processing in the site's privacy review.

## Validation limits

Automated adapter tests substitute synthetic upstream responses and credentials. Browser tests substitute synthetic flight offers and verify original search, missing configuration, result rendering and Buy error handling. They do not establish live approval, current inventory, commissions, real regional host routing or live booking compatibility. Verify those in the approved deployment after credentials/allowlists are configured. Never call cached Data API prices real-time availability.

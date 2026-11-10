# Affiliate-first MVP

The MVP discovers stays and activities; it does not take payment or confirm a
reservation. Existing Hotelbeds, Viator and Supabase integrations are preserved.
An API credential alone never activates affiliate booking. No partner accounts,
approvals, tracking IDs or live prices are assumed.

## Reviewed link configuration

`AFFILIATE_APPROVED_LINKS_JSON` is an optional **server-only** environment variable.
Leave it unset or use `[]` until an approved partner link has been supplied.
It is an array whose records have exactly these fields:

| Field | Meaning |
| --- | --- |
| `provider` | `travelpayouts`, `viator`, `booking-com`, or `getyourguide` |
| `productType` | `stay` or `experience` |
| `slug` | An existing product slug from `lib/data.ts` or the reviewed `lib/accommodations/catalog.ts` |
| `approved` | Boolean `true`, set only after human commercial/content review |
| `url` | The exact approved HTTPS affiliate destination supplied by that partner |

No fabricated example tracking link is provided. Obtain an approved URL from
the partner, verify product identity and attribution, and enter it through
server environment settings. Do not put private keys or customer data in URLs.
The approval flag is a review assertion, not proof of a partner agreement.

The entire configuration fails closed if any record is invalid. The public
catalog only publishes provider names and internal handoff paths, never the raw
configuration or private credentials. No invalid records or URLs are logged.

## Destination security

Fixed exact host allowlists live in `lib/affiliate-providers.ts`; no wildcard
subdomains or user-provided allowlist additions are supported. HTTPS is required;
userinfo, ports, fragments, control characters, backslashes, nested destinations and common
redirect parameters are rejected. New regional or short-link domains need code
review before use. Existing approved tracking parameters are preserved without
regeneration. Review the eventual destination of partner short links before
approval; the application cannot control a trusted partner's subsequent redirect.

`/out/[provider]/[product]` looks up only the server's approved record and rejects
all caller query parameters. It does not accept a URL, marker or return target.
Its response is a noncached redirect with a no-referrer policy. The UI names the
provider and explains that booking and payment happen on that partner website.

## Provider requirements

- **Travelpayouts:** approved program/account, product link and issued attribution.
  A Travelpayouts link may overlap another supplier program; use the approved
  commercial channel rather than combining attribution schemes.
- **Viator:** approved affiliate program and issued product link/attribution.
  `lib/viator.ts` and `/api/viator/products/[code]` remain the server API adapter;
  `VIATOR_API_KEY` is needed only for authenticated API retrieval, not an already
  approved outbound link. Never infer affiliate approval from API access.
- **Booking.com:** approved partner arrangement and property link/attribution.
- **GetYourGuide:** approved partner account and activity link/attribution.

Legacy property and activity records in `lib/data.ts` are samples. The independent
source-reviewed accommodation collection lives in `lib/accommodations/catalog.ts`;
see `docs/STAY22-ACCOMMODATIONS.md` for its separate, isolated Stay22 adapter. Do not attach an approved
commercial link until the listing accurately identifies that partner product.
Do not change a sample price into an available/live claim when configuring a link.

## UI integration

Wrap the application once in `AffiliateProvider` and use
`AffiliateBookingAction productType="stay" slug={property.slug}` or the
`experience` equivalent. The provider loads the safe catalog once, with bounded
loading and retry states. Missing configuration yields a details link rather
than a fabricated booking action or confirmation. Client requests cannot create
approved links.

Before enabling a provider, verify destination rejection, exact attribution
preservation, provider labeling, external handoff, and unavailable states in a
local test environment. Production approval and real partner conversion tests
remain a separate milestone.

# Accommodation discovery and isolated Stay22 links

## What this implements

`/stay`, `/resorts` and `/guesthouses` are editorial discovery pages, not a hotel
availability API. `lib/accommodations/catalog.ts` contains property facts and
source/review dates, independently of booking providers. Existing sample records,
detail URLs, Hotelbeds adapters, Supabase schemas and approved affiliate links
are retained. Samples are excluded from the new catalog and its sitemap entries.
Sample detail routes are noindex. Known catalog/preview detail routes are
pre-rendered with `dynamicParams=false` so unknown slugs return an actual HTTP
404 before streaming. Rebuild when publishing catalog or booking configuration changes. Do not configure commercial booking links for
a sample identity.

The initial catalog has five real properties: Villa Park, Villa Nautica, Royal
Island, Kaani Palm Beach and Kaani Grand Seaview. Only facts reviewed on the
official operator pages on 2026-11-10 are included:

- https://villaresorts.com/villa-park/
- https://villaresorts.com/villa-nautica/
- https://villaresorts.com/royal-island/
- https://www.kaanihotels.com/ (Kaani Stays section)
- https://kaanihotels.com/contact (Maafushi property locations)

These are descriptive facts, not independent quality inspections or current
availability guarantees. Kaani atoll values are deliberately null: the inspected
operator pages confirmed Maafushi, not an atoll classification. No verified
guesthouse is published yet. Add verified records instead of repurposing fictional
samples. Prices, ratings, reviews and room quantities are not part of this model.

Current card images are existing original generated thematic artwork from
`public/images/home-redesign/`, explicitly labelled as illustrative, not property
photos. No hotel photography has been scraped or relicensed. Replace with
licensed/approved property photos only after recording image provenance.

## Documentation compatibility review (before implementation)

Official references, read successfully on 2026-11-10:

1. https://community.stay22.com/how-to-set-up-your-letmeallez-script
2. https://community.stay22.com/stay22-supplier-list

The installation guide documents a header/footer script, including GTM triggers
on all pages **or wherever the operator wants it to run**, and conversion of
supported supplier links already present in the document. The supplier list
identifies Booking.com and Expedia, among others. The supplied LMA script endpoint
returned HTTP 200 during the read-only review; it was not executed.

The implementation therefore presents reviewed **direct supplier property URLs**
as real `<a href>` elements in a full HTML document, with the supplied bootstrap
in its head. It does not expect Stay22 to monetize internal links, a hotel's own
arbitrary website, a masked `/out/` route, or an invented Stay22 tracking URL.
DeepStruct is not required or automatically configured for these direct links.

This is compatibility with the documented input/link model, not proof that our
specific account/domain and every supplier link will be converted. The actual
conversion and attribution still require an authorized live-domain test. If the
vendor only rewrites on interaction or otherwise does not expose a Stay22 URL,
our conservative gate keeps booking unavailable rather than assuming conversion.
Do not relax that gate without documented vendor guidance and review.

## Isolation and loading

Normal pages retain the existing Travelpayouts Drive installation. Stay22 is
never added to `app/layout.tsx` and never loads on homepage, discovery pages,
legacy details, or `/flights`.

`/stay/partners/[slug]` is a Next.js route handler returning its own document,
following the existing dedicated-document flight integration pattern. Route
handlers do not render the root React layout. Consequently that document has no
Drive bootstrap, competing affiliate links, Next hydration, or SPA initialization.
Use a native `<a target="_blank" rel="noopener noreferrer">`, **not Next Link or
an iframe**, to enter it. COOP and frame protection further reinforce the boundary.

Because it is a standalone HTML response, the appropriate script-loading mechanism
is an asynchronous head script, not a React `next/script` component outside a
React tree. The bootstrap detects an existing URL/ID and refuses a conflicting
LMA ID. It runs only after an explicit visitor choice to load Stay22. The fixed
owner-supplied ID is `6af32745915ea25253c74dd3` and the fixed URL is
`https://lma.stay22.com/letmeallez.js`. These are public installation details.

Supplier anchors start inert and unavailable, including with JavaScript disabled.
After loading, a MutationObserver enables only anchors actually rewritten to an
HTTPS `stay22.com`/`www.stay22.com` URL. Failure or no observed conversion leaves
booking disabled. A detected rewrite is not proof of commission credit, a hotel
reservation, real-time availability, or payment success.

Document isolation prevents both scripts mutating the same link DOM. It is not a
guarantee about vendor cookies, cross-site tracking, account settings or eventual
third-party redirects. Stay22 Spark/Nova features are enabled by default according
to the guide; review them in the Hub before live activation. No undocumented
exclusion parameter is invented. Do not add broad DeepStruct patterns for `/out/`
or existing partner URLs. Existing approved affiliate parameters remain untouched.

## Activation checklist (requires separate deployment approval)

1. In Stay22 Hub, verify the supplied LMA installation belongs to `maldives.org`;
   confirm `www` coverage and supported supplier/features with Stay22. No DNS
   change or Stay22-hosted replacement of Maldives.org is needed for this script.
2. Obtain a genuine canonical supplier property URL from Booking.com or Expedia.
   Review its exact property identity, booking destination, domain and Stay22
   eligibility. Do not use a search page, homepage, short link, or another
   affiliate's attributed URL. No production example link is fabricated here.
3. Set the server-only `STAY22_APPROVED_LINKS_JSON` to a JSON array. Each record
   must have exactly `slug`, `supplier`, `url`, `approved`, and `reviewedOn`:
   - `slug`: a reviewed real catalog slug;
   - `supplier`: `booking-com` or `expedia`;
   - `url`: the reviewed HTTPS canonical property URL;
   - `approved`: boolean `true`, only following human review;
   - `reviewedOn`: actual review date in `YYYY-MM-DD` format, not a future date.
   Booking.com paths must be `/hotel/mv/<property>.html` (optional language suffix).
   Expedia paths must end in `.h<digits>.Hotel-Information`. No query strings,
   affiliate tags, userinfo, ports, fragments, escapes or nested destinations are
   accepted. Additional suppliers/path forms need an explicit allowlist review.
   The entire configuration fails closed if any entry is invalid or duplicated.
4. Review privacy/cookie notices and visitor consent requirements. The document's
   explicit load choice is not a universal consent-management platform or legal
   compliance certification. Cookie lifetimes/data recipients are not invented.
5. After code/config and deployment approval, set `STAY22_ENABLED=true`, rebuild
   and restart/deploy. Default is disabled. Existing environment variables and
   `TRAVELPAYOUTS_DRIVE_ENABLED` do not need to change. The handoff emits no LMA
   bootstrap unless its request hostname is `maldives.org` or `www.maldives.org`
   and approved links exist. Localhost and generic preview domains do not qualify.
6. On that authorized domain: open the property's Check availability action,
   choose Load Stay22 partner links, inspect one vendor script request and the
   documented console confirmation, then inspect conversion to a Stay22 URL.
   Verify the destination is the correct property and final booking/payment are
   external. Confirm partner attribution in Stay22 Hub using its approved testing
   process; do not create a customer booking merely to test this integration.
7. Recheck normal Travelpayouts links and flights. Hub status may stay Inactive
   until installation produces traffic. Restore `STAY22_ENABLED=false` to disable
   after restart if conversion or attribution cannot be established.

No production approved URLs are committed. Missing/disabled configuration shows
an explicit unavailable state, not an active booking or live-price claim.

Existing non-Stay22 approved links can also be configured for real catalog slugs
through the preserved `AFFILIATE_APPROVED_LINKS_JSON` contract. They take precedence
on those detail pages and never pass through the Stay22 document.

## Validation boundary

Playwright tests use synthetic supplier records and a mocked vendor script. They
check isolation, explicit-load behavior, duplicate guards, conversion gating,
allowlists, redirects, filters, metadata, mobile layouts and existing flight/payment
regressions. They do not execute the real vendor, establish account eligibility,
prove commission attribution, or process payment. No live inventory API is added.

# White Label flights 

## Official support

Travelpayouts Widget-type White Label supports search and results together:
https://support.travelpayouts.com/hc/en-us/articles/26857907357458

The official instructions say to place the main code in head and both search and tickets containers on the same page so results appear below the form. They document `TPWL_CONFIGURATION.resultsURL` for controlling the results page. This integration uses the supplied `https://tpscr.com/wl_web/main.js?wl_id=24430`, not a fabricated API integration. No private API credentials are needed for this embed.

## Architecture

`/flights` uses the existing Next.js shell. `/flights/embed` is a dedicated same-origin HTML document containing the official head bootstrap and both containers. Each document loads exactly one module after both containers exist. This avoids relying on undocumented vendor reinitialization APIs when Next.js unmounts/remounts a page. Full-page and client-side navigation both create fresh iframe documents. The iframe does not contain a copy of the app's Drive bootstrap.

Only `/flights/embed` permits SAMEORIGIN framing; other routes retain DENY. Embedding from other sites is blocked with `frame-ancestors 'self'`. This is document isolation for lifecycle/CSS, not a security sandbox: the authorized vendor remains trusted third-party JavaScript on the same origin.

The results URL is fixed to the embed document. Search should update that document's query/state rather than navigate to an external search site. Allowed provider URL fields are mirrored to the parent URL so dates/passengers/search state can survive reloads. External results URLs and marker overrides are never accepted from incoming URL parameters. The provider-owned account config supplies marker 678887; the app does not invent or overwrite it.

`TPWL_CONFIGURATION.flightParams` presets destination MLE and leaves origin unrestricted; this field was checked against the actual served vendor runtime. The dashboard's returned `flightParams` was empty on inspection. Also set **Content → Pre-filled destination → arrival Malé (MLE)** in the dashboard so its saved configuration agrees with the integration. Dates, passengers and currency are managed by the provider, not a parallel custom form. USD is the account's current default currency; extra currencies must be enabled in the provider dashboard. Do not treat the app-shell currency selector as controlling provider currency.

The homepage search entry opens `/flights` on Maldives.org. The existing authorized tpscr external-search component is reused via the fallback button. It is not a fake embedded-results UI. Final bookings/payments remain with the chosen airline/agency. Stripe and Hotelbeds transaction guards are unchanged.

## Account/domain prerequisites

The supplied dashboard screenshot identifies `www.maldives.org`. Confirm with Travelpayouts whether apex `maldives.org`, preview domains and localhost are approved. If support requires exact domain registration, a preview can fail even though production is authorized. Do not bypass provider domain checks or spoof the production host to make a test pass.

Confirm the account is Widget-type (not hosted Page-type), that WL 24430 is active, and its saved website domain, partner attribution, locale/currencies, MLE default, show-hotels setting, and final booking behavior. The fetched config had `showHotels=false`; keep it false to avoid the provider's optional hotel/new-tab behavior. A separate private Search API approval is not part of the documented Widget embed steps. A provider-hosted Page-type White Label/custom-domain setup remains an officially documented alternative.

## Verification boundaries

Mock browser tests validate our loader, state synchronization, layout and navigation; they do not prove live inventory, fares or commissions. Real provider rendering, actual worldwide airport selection, search completion, parameter retention and booking destinations must also be checked on an authorized host with valid browser TLS trust. Never fabricate live results to replace blocked vendor responses.

Legal/privacy review is still required for third-party IP/query/cookie processing. Existing Drive permissions/configuration remain unchanged on this branch; actual vendor interactions and attribution with Drive enabled require authorized-domain validation.

## Debug verification

The latest master integration reuses its existing Aviasales fallback component and preserves its enabled Drive configuration, homepage image and Maldives now strip. The older feature-branch draft was preserved separately rather than merging its older homepage/Drive settings over master.

On 2026-11-10, direct Cloud Chromium requests failed with `ERR_CERT_AUTHORITY_INVALID`; the browser's actual NSS database is read-only in the execution sandbox. Temporary trust-store experiments did not resolve direct Chromium access. TLS verification was never disabled, and no transport workaround is shipped in application code.

A separate diagnostic Playwright transport fetched the real tpscr and apistp GET responses through the inherited proxy with Node TLS validation enabled, preserving real provider response headers/body. That rendered the actual White Label form and resolved the default destination to **Male, Maldives**; origin was editable and airport lookup services returned HTTP 200. This was real upstream content, not synthetic fares. It does not establish that direct browser loading, a complete live fare search, commissions or final booking work on the published domain. Those checks remain necessary on an authorized hostname.

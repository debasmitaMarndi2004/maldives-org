# Travelpayouts Drive: prepared, not activated

The supplied dashboard snippet is integrated through `next/script` with a stable
ID and `afterInteractive`, rather than pasting an executable script into the
server HTML. The exact user-supplied source is
`https://emrldco.com/NTk4NDE3.js?t=598417`. The dashboard marker is public script
configuration, not an API secret. Markdown link formatting was removed from the
source value. The bootstrap retains asynchronous loading and `data-cmp-ab="2"`;
a fixed script-element ID prevents duplicate insertion. Optimizer attributes from
the supplied outer script are preserved. No external script is fetched while blocked.

## Verification status

Live vendor code has **not** been executed. Read-only requests to these hosts
were blocked at the Cloud proxy with CONNECT HTTP 403:

- `support.travelpayouts.com` (Drive and emrldco documentation searches)
- `www.travelpayouts.com` (attempted Drive documentation pages)
- `emrldco.com` (the supplied script)

Those requests do not establish documentation contents or domain ownership.
The dashboard snippet establishes the requested configuration, but independent
official confirmation tying the source domain to Drive is still missing.
The script's exact link-conversion, exclusion, storage, cookie and downstream
request behavior is also unverified. Do not treat the dashboard attributes,
including `data-cmp-ab="2"`, as evidence of visitor consent.

Next.js integration guidance was checked in the installed official docs:
`node_modules/next/dist/docs/01-app/02-guides/scripts.md` and
`node_modules/next/dist/docs/01-app/03-api-reference/02-components/script.md`.
Next.js deduplicates stable-ID layout scripts; the bootstrap additionally guards
its own source element. No caller controls its URL or marker.

## Default and review gates

`TRAVELPAYOUTS_DRIVE_ENABLED=false` is the default. Only the exact server-side
value `true` requests activation. No public/query/local-storage enable switch is
accepted. `lib/travelpayouts-drive-config.ts` additionally keeps source verification,
attribution protection, privacy review and visitor consent **false**. Therefore
setting the flag alone cannot activate unverified vendor code.

The current app has no Drive consent-manager integration. No consent UI was
invented, and no consent is presumed. No vendor preload/preconnect is added.
The component renders nothing while any gate is false.

## Attribution and sensitive routes

Existing approved affiliate configuration, allowlists and `/out/...` redirects
are unchanged. The script host is not a booking-destination allowlist entry.
Merely loading third-party JavaScript in the root layout would give it access
to links and forms on that document. Our secure redirect handler cannot stop a
vendor click listener from replacing or bypassing a link in the browser.

Do not enable Drive until official exclusion behavior has been verified and
implemented for other providers, already-attributed links, internal handoffs,
contact/newsletter fields, accounts and booking references. Removing a script tag
on SPA navigation does not remove its listeners or observers. If verified vendor
exclusions cannot meet these requirements, use a separately reviewed isolated
document/surface with full-document transitions instead of enabling it globally.

## Privacy and cookies before activation

Obtain current official documentation identifying the controller/processors,
purposes, data fields, cookie/storage identifiers, lifetimes, recipients,
international transfers and downstream domains. Determine applicable consent and
disclosure requirements with the site owner/legal reviewer. Connect an actual
consent manager so optional processing begins only after the relevant choice,
and test withdrawal and fresh-document behavior. Update the privacy and cookies
pages with verified details; the present notices deliberately make no claims about
unknown cookies or lifetimes. No private keys are needed for this supplied tag.

## Activation procedure (not performed)

1. Obtain accessible official confirmation for the exact domain and dashboard tag.
2. Review vendor code/behavior in an approved isolated test environment and verify
   consent, attribution exclusions, link preservation and downstream destinations.
3. Implement the verified exclusion/isolated-surface and consent integration.
   Only then may a reviewed code change release the currently false review gates.
4. Approve any needed Cloud network destinations through environment settings;
   no network policy or booking allowlist was changed by this integration.
5. After deployment approval, set the server flag to `true` in the selected
   environment and rebuild/restart. Next.js static layouts can capture this flag
   during build, so an environment edit alone is not a guaranteed runtime toggle.
6. To disable, set it to `false` and rebuild/restart without removing code.
   Already-open documents need a fresh navigation/reload; removing the element
   cannot undo vendor processing that has already run.

Tests execute only our bootstrap with an intercepted, locally authored stub.
They prove duplicate prevention and our code's non-interference, **not** live
vendor ownership, real conversion attribution or vendor exclusion behavior.
Hotelbeds and Stripe transaction guards remain unchanged and disabled.

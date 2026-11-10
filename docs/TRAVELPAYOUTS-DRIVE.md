# Travelpayouts Drive

## Current activation

The site owner explicitly requested automatic activation. Drive is now enabled
when `TRAVELPAYOUTS_DRIVE_ENABLED` is unset or exactly `true`. Set it to `false`
and rebuild/restart to disable it without removing code. Other values fail closed.
Static Next.js layouts can capture this value at build time: a production
configuration currently set to `false` must be changed to `true` for activation.

This is an owner activation decision, not a claim of official source verification,
legal review or visitor consent. No review/consent flags are fabricated. The site
has no dedicated Drive consent-manager integration; applicable disclosure and
consent requirements still need review.

## Installation and duplicate protection

The shared `app/layout.tsx` head mounts one `TravelpayoutsDrive` component.
`next/script` uses a stable ID and `afterInteractive`. The user-provided bootstrap
creates one asynchronous source script in document.head:

`https://emrldco.com/NTk4NDE3.js?t=598417`

Markdown link formatting was removed from the supplied source value. The public
marker is installation configuration, not a private API credential. Dashboard
optimizer attributes and `data-cmp-ab="2"` are preserved. That attribute is not
interpreted as visitor consent.

Before insertion the bootstrap checks both its fixed source-element ID and every
existing script's exact resolved source URL. Therefore an already-installed copy
without our ID is also recognized. Next.js deduplicates the wrapper across SPA
navigation. Do not paste another copy into a page, tag manager or Vercel setting.
Removing a script after execution cannot undo its listeners or processing; an
operator disable requires a fresh document after the configuration update.

## Verification limits

Cloud proxy read-only checks of `support.travelpayouts.com`,
`www.travelpayouts.com` and `emrldco.com` returned CONNECT HTTP403. Independent
confirmation that the exact domain is officially authorized remains unavailable.
The dashboard-provided snippet is the owner's requested source. Network policy
has not been changed or bypassed. Downstream endpoints, cookies/storage, data
fields, retention periods and real conversion attribution remain unverified.

Existing affiliate destinations, tracking parameters, server redirects, booking
allowlists and transaction guards are unchanged. Our bootstrap does not modify
anchors. However, arbitrary third-party JavaScript can alter links or intercept
clicks; the vendor's actual exclusion/attribution behavior cannot be guaranteed
by mock tests. Obtain official documentation and verify this behavior with
Travelpayouts. If exclusions are required, implement their documented mechanism
or a separately reviewed isolated surface; route-based tag removal is insufficient
once a script has executed in an SPA.

## Testing

The normal Playwright server explicitly sets `TRAVELPAYOUTS_DRIVE_ENABLED=false`
and uses isolated affiliate fixtures. Use `npm run test:e2e` (development server),
or build with the flag false before testing a production server with that flag.

Bootstrap tests intercept the exact source request with a locally authored
counter stub. They test once-only insertion, pre-existing-script detection, and
unchanged anchors without executing vendor code. A production-enabled integration
check must likewise intercept the vendor URL to verify actual Next.js insertion
and SPA navigation safely. Stub tests do not establish live vendor compatibility.

Hotelbeds direct transactions and Stripe remain disabled independently of Drive.
No private API keys are needed for this supplied script.

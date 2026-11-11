import { VIATOR_PARTNER_ID, VIATOR_WIDGET_REF, VIATOR_WIDGET_SOURCE, VIATOR_WIDGET_BRIDGE } from "@/lib/viator-widget";

export const dynamic = "force-dynamic";

/** A fresh document avoids the vendor's one-shot window initialization guard. */
export async function GET(request: Request) {
  if (new URL(request.url).search) return new Response("Widget configuration is fixed; query parameters are not accepted.", { status: 400 });
  return new Response(`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Viator experiences — Maldives.org</title><style>html,body{margin:0;padding:0;width:100%;background:#fff;font:16px/1.5 system-ui;color:#0a2a33}*{box-sizing:border-box}#viator-widget{width:100%;min-width:0}</style></head><body>
<div id="viator-widget" data-vi-partner-id="${VIATOR_PARTNER_ID}" data-vi-widget-ref="${VIATOR_WIDGET_REF}"></div>
<script>${VIATOR_WIDGET_BRIDGE}</script>
<script async src="${VIATOR_WIDGET_SOURCE}"></script>
<noscript>JavaScript is needed to load Viator experiences. No booking or payment has been made.</noscript>
</body></html>`, { headers: {
    "Content-Type": "text/html; charset=utf-8",
    "Cache-Control": "no-store",
    "X-Robots-Tag": "noindex, nofollow",
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "SAMEORIGIN",
    "Content-Security-Policy": "frame-ancestors 'self'; base-uri 'none'; object-src 'none'",
    "Referrer-Policy": "strict-origin-when-cross-origin",
  } });
}

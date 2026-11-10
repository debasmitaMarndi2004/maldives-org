/** Public installation ID supplied by the site owner, not a secret/API token. */
export const STAY22_LMA_ID = "6af32745915ea25253c74dd3";
export const STAY22_SCRIPT_URL = "https://lma.stay22.com/letmeallez.js";
export const STAY22_SCRIPT_ID = "maldives-stay22-lma";
export const stay22Suppliers = {
  "booking-com": { label: "Booking.com", hosts: ["booking.com", "www.booking.com"] },
  expedia: { label: "Expedia", hosts: ["expedia.com", "www.expedia.com"] },
} as const;
export type Stay22Supplier = keyof typeof stay22Suppliers;
export type Stay22Link = { slug: string; supplier: Stay22Supplier; url: string; approved: true; reviewedOn: string };

/** Only canonical, untagged property links. Existing affiliate URLs never enter LMA. */
export function isStay22SupplierDestination(supplier: Stay22Supplier, value: unknown): value is string {
  if (!Object.prototype.hasOwnProperty.call(stay22Suppliers, supplier) || typeof value !== "string" || value.length > 2048) return false;
  if (!value.startsWith("https://") || /[\s\\%\u0000-\u001f\u007f]/.test(value)) return false;
  try {
    const url = new URL(value);
    if (url.username || url.password || url.port || url.search || url.hash) return false;
    const authority = value.slice(8).split("/")[0];
    if (!stay22Suppliers[supplier].hosts.some((host) => authority === host)) return false;
    // Require property pages, not homepages, searches, short links or redirects.
    return supplier === "booking-com"
      ? /^\/hotel\/mv\/[a-z0-9-]+(?:\.[a-z-]+)?\.html$/.test(url.pathname)
      : /^\/[a-zA-Z0-9.-]+\.h\d+\.Hotel-Information$/.test(url.pathname);
  } catch { return false; }
}

export function parseStay22Links(raw: string | undefined, knownSlugs: ReadonlySet<string>): { status: "ready" | "unconfigured" | "invalid"; links: Stay22Link[] } {
  const invalid = { status: "invalid" as const, links: [] };
  if (!raw?.trim()) return { status: "unconfigured", links: [] };
  if (raw.length > 65536) return invalid;
  try {
    const items: unknown = JSON.parse(raw);
    if (!Array.isArray(items) || items.length > 200) return invalid;
    const links: Stay22Link[] = [], seen = new Set<string>();
    for (const item of items) {
      if (!item || typeof item !== "object" || Array.isArray(item)) return invalid;
      const e = item as Record<string, unknown>;
      if (Object.keys(e).some((k) => !["slug", "supplier", "url", "approved", "reviewedOn"].includes(k))) return invalid;
      if (typeof e.slug !== "string" || !knownSlugs.has(e.slug) || e.approved !== true) return invalid;
      if (typeof e.supplier !== "string" || !Object.prototype.hasOwnProperty.call(stay22Suppliers, e.supplier)) return invalid;
      if (!isStay22SupplierDestination(e.supplier as Stay22Supplier, e.url)) return invalid;
      if (typeof e.reviewedOn !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(e.reviewedOn)) return invalid;
      const review = new Date(`${e.reviewedOn}T00:00:00Z`);
      if (!Number.isFinite(review.getTime()) || review.toISOString().slice(0, 10) !== e.reviewedOn || review.getTime() > Date.now()) return invalid;
      const key = `${e.slug}:${e.supplier}`;
      if (seen.has(key)) return invalid;
      seen.add(key);
      links.push({ slug: e.slug, supplier: e.supplier as Stay22Supplier, url: e.url, approved: true, reviewedOn: e.reviewedOn });
    }
    return { status: links.length ? "ready" : "unconfigured", links };
  } catch { return invalid; }
}

export function isStay22Host(hostname: string) {
  return hostname === "maldives.org" || hostname === "www.maldives.org";
}

/**
 * Only emitted into a standalone hotel partner document, never React's root.
 * Header bootstrap defers until the visitor explicitly loads partner tracking.
 * The real, visible supplier anchors are what LMA recognizes (no DeepStruct).
 * A network load is NOT proof of conversion: clicks remain blocked until a
 * supplier link is actually rewritten to Stay22's documented redirect domain.
 */
export const STAY22_BOOTSTRAP = `(function () {
  if (!['maldives.org','www.maldives.org'].includes(location.hostname)) return;
  function start() {
    var button=document.getElementById('load-stay22');
    if (!button || button.dataset.bound==='true') return;
    button.dataset.bound='true';
    var status=document.getElementById('stay22-status');
    var anchors=Array.from(document.querySelectorAll('a[data-stay22-partner]'));
    function converted(a) {
      try { var u=new URL(a.href); return u.protocol==='https:' && !u.username && !u.password && !u.port && ['stay22.com','www.stay22.com'].includes(u.hostname); } catch (_) { return false; }
    }
    function update() {
      var ready=0;
      anchors.forEach(function(a){ var ok=converted(a); a.setAttribute('aria-disabled',ok?'false':'true'); a.inert=!ok; a.tabIndex=ok?0:-1; if(ok)ready++; });
      if(ready) { status.textContent='Partner link ready. Check final availability, prices and terms on the booking provider website.'; status.dataset.state='ready'; }
      else if(status.dataset.state==='ready') { status.dataset.state='unavailable'; status.textContent='Partner link unavailable. No reservation has been created.'; }
    }
    document.addEventListener('click',function(e){
      var a=e.target.closest && e.target.closest('a[data-stay22-partner]');
      if(a && !converted(a)) { e.preventDefault(); e.stopImmediatePropagation(); }
    },true);
    button.addEventListener('click',function(){
      if(button.disabled) return;
      button.disabled=true;
      if(window.Stay22 && window.Stay22.params && window.Stay22.params.lmaID && window.Stay22.params.lmaID!=='${STAY22_LMA_ID}') {
        status.textContent='A different Stay22 installation was detected. Partner links are unavailable.'; return;
      }
      status.textContent='Loading Stay22 partner links…';
      new MutationObserver(update).observe(document.body,{subtree:true,attributes:true,attributeFilter:['href']});
      window.Stay22=window.Stay22||{};
      window.Stay22.params=Object.assign({},window.Stay22.params,{lmaID:'${STAY22_LMA_ID}'});
      var existing=Array.from(document.scripts).find(function(s){return s.src==='${STAY22_SCRIPT_URL}';});
      if(!existing && !document.getElementById('${STAY22_SCRIPT_ID}')) {
        var script=document.createElement('script'); script.id='${STAY22_SCRIPT_ID}'; script.async=true; script.src='${STAY22_SCRIPT_URL}';
        script.onerror=function(){status.textContent='Stay22 could not load. Partner booking is unavailable; no reservation was created.';};
        document.head.appendChild(script);
      }
      update();
      setTimeout(function(){ if(status.dataset.state!=='ready') status.textContent='A monetized partner link could not be confirmed. Booking is unavailable; please try again later.'; },15000);
    });
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();`;

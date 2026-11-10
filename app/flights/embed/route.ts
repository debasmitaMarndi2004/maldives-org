import { whiteLabelQueryKeys } from "@/lib/white-label";

/** Dedicated document gives each Next.js page mount a fresh vendor module realm. */
export async function GET() {
  return new Response(`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Maldives.org flight search</title><style>html,body{margin:0;max-width:100%;font:16px system-ui}#tpwl-search,#tpwl-tickets{min-width:0;width:100%}</style>
<script nowprocket data-noptimize="1" data-cfasync="false" data-wpfc-render="false" seraph-accel-crit="1" data-no-defer="1">
(function(){
  // These are provider configuration fields, not private API credentials.
  var url=new URL(location.href);var keys=${JSON.stringify(whiteLabelQueryKeys)};Array.from(url.searchParams.keys()).forEach(function(k){if(!keys.includes(k))url.searchParams.delete(k);});history.replaceState(null,'',url.href);
  window.TPWL_CONFIGURATION={resultsURL:location.origin+location.pathname,flightParams:{origin:'',destination:'MLE'}};
  var sentReady=false, pendingResults=false;
  window.addEventListener('urlchange',function(){if(new URL(location.href).searchParams.has('flightSearch'))pendingResults=true;});
  function visibleText(root){
    if(root.shadowRoot&&visibleText(root.shadowRoot))return true;
    return Array.from(root.querySelectorAll('*')).some(function(e){return e.shadowRoot&&visibleText(e.shadowRoot)||!e.matches('style,script,template')&&e.getBoundingClientRect().height>0&&Boolean((e.innerText||'').trim());});
  }
  function visibleControls(root){
    if(root.shadowRoot&&visibleControls(root.shadowRoot))return true;
    if(Array.from(root.querySelectorAll('input,select,button')).some(function(e){return e.getBoundingClientRect().height>0;}))return true;
    return Array.from(root.querySelectorAll('*')).some(function(e){return e.shadowRoot?visibleControls(e.shadowRoot):false;});
  }
  function report(){
    var search=document.getElementById('tpwl-search');
    if(search&&visibleControls(search))sentReady=true;
    var tickets=document.getElementById('tpwl-tickets');
    var scroll=pendingResults&&tickets&&visibleText(tickets);
    parent.postMessage({type:'maldives-tpwl',ready:sentReady,height:Math.ceil(document.body.getBoundingClientRect().height),query:location.search,scrollToResults:Boolean(scroll),resultsTop:scroll?tickets.getBoundingClientRect().top+window.scrollY:undefined},location.origin);
    if(scroll)pendingResults=false;
  }
  document.addEventListener('DOMContentLoaded',function(){new ResizeObserver(report).observe(document.body);setInterval(report,1000);report();});
  function load(){if(document.getElementById('maldives-tpwl-main'))return;var script=document.createElement('script');script.id='maldives-tpwl-main';script.async=1;script.type='module';script.src='https://tpscr.com/wl_web/main.js?wl_id=24430';
  script.onerror=function(){parent.postMessage({type:'maldives-tpwl',failed:true},location.origin);};
  document.head.appendChild(script);}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',load,{once:true});else load();
})();
</script></head><body><div id="tpwl-search"></div><div id="tpwl-tickets"></div></body></html>`,{headers:{"Content-Type":"text/html; charset=utf-8","Cache-Control":"no-store","X-Content-Type-Options":"nosniff","X-Frame-Options":"SAMEORIGIN","Content-Security-Policy":"frame-ancestors 'self'","X-Robots-Tag":"noindex"}});
}

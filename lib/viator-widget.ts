/** Public dashboard identifiers. These are not private Viator API credentials. */
export const VIATOR_PARTNER_ID = "P00323298";
export const VIATOR_WIDGET_REF = "W-7ab8707c-a1f2-473d-a403-d89daed7f574";
export const VIATOR_WIDGET_SOURCE = "https://www.viator.com/orion/partner/widget.js";
export const VIATOR_WIDGET_MESSAGE = "maldives-viator-widget";

/** Observe the official widget without rewriting its markup, links or attribution. */
export const VIATOR_WIDGET_BRIDGE = `(function () {
  var ready=false, failed=false;
  var container=document.getElementById('viator-widget');
  function send(data){if(window.parent!==window)window.parent.postMessage(Object.assign({type:'${VIATOR_WIDGET_MESSAGE}'},data),location.origin);}
  function fail(){if(!ready&&!failed){failed=true;send({failed:true});}}
  var timeout=setTimeout(fail,22000);
  window.addEventListener('error',function(event){
    var target=event.target;
    if(target instanceof HTMLScriptElement && target.src.indexOf('https://www.viator.com/orion/partner/')===0)fail();
  },true);
  window.addEventListener('message',function(event){
    var frame=container.querySelector('iframe');
    if(failed || !frame || event.source!==frame.contentWindow || event.origin!=='https://www.viator.com' || !event.data || event.data.id!=='vi-wm')return;
    var height=event.data.h;
    if(typeof height!=='number'||!Number.isFinite(height)||height<80||height>24000)return;
    requestAnimationFrame(function(){
      if(failed)return;
      ready=true;clearTimeout(timeout);
      send({ready:true,height:Math.ceil(container.getBoundingClientRect().height)});
    });
  });
  window.addEventListener('pagehide',function(){clearTimeout(timeout);},{once:true});
})();`;

"use client";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { whiteLabelQuery } from "@/lib/white-label";

const subscribe = () => () => {};

function WhiteLabelFrame({query}:{query:string}){
 const hydrated=useSyncExternalStore(subscribe,()=>true,()=>false);
 const frame=useRef<HTMLIFrameElement>(null);
 const [height,setHeight]=useState(250),[state,setState]=useState("loading");
 useEffect(()=>{
  let ready=false;
  const timeout=window.setTimeout(()=>{if(!ready)setState("unavailable");},30000);
  const receive=(event:MessageEvent)=>{
   if(event.origin!==window.location.origin||event.source!==frame.current?.contentWindow||event.data?.type!=="maldives-tpwl")return;
   if(event.data.failed===true){setState("unavailable");return;}
   if(event.data.ready===true){ready=true;setState("ready");}
   if(Number.isFinite(event.data.height))setHeight(Math.max(180,Math.min(12000,event.data.height)));
   if(event.data.scrollToResults===true&&Number.isFinite(event.data.resultsTop)&&event.data.resultsTop>=0&&event.data.resultsTop<=12000){
    const offset=event.data.resultsTop;
    window.requestAnimationFrame(()=>{
     const element=frame.current;if(!element)return;
     window.scrollTo({top:Math.max(0,element.getBoundingClientRect().top+window.scrollY+offset-100),behavior:window.matchMedia("(prefers-reduced-motion: reduce)").matches?"instant":"smooth"});
    });
   }
   if(typeof event.data.query==="string"&&event.data.query.length<12000){
    const safe=whiteLabelQuery(new URLSearchParams(event.data.query));const url=new URL(window.location.href);url.search=safe;
    if(url.href!==window.location.href)window.history.replaceState(window.history.state,"",url.href);
   }
  };
  window.addEventListener("message",receive);
  return()=>{window.clearTimeout(timeout);window.removeEventListener("message",receive);};
 },[]);
 return <div className="white-label-frame" data-state={state}>
 {state!=="ready"&&<p role="status">{state==="loading"?"Loading Aviasales flight search…":"Flight search could not load. Please refresh the page or try again later."}</p>}
 {hydrated&&<iframe ref={frame} title="Aviasales search and flight results" src={`/flights/embed${query?`?${query}`:""}`} style={{height}} hidden={state==="unavailable"} referrerPolicy="strict-origin-when-cross-origin" />}
 </div>;
}
export function WhiteLabelFlights({query}:{query:string}){
 return <WhiteLabelFrame query={query}/>;
}

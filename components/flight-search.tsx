"use client";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { FlightOffer } from "@/lib/aviasales";

export function FlightSearchForm() {
 const router=useRouter();
 function submit(event:FormEvent<HTMLFormElement>) {event.preventDefault();const data=new FormData(event.currentTarget);const params=new URLSearchParams();data.forEach((v,k)=>params.set(k,String(v)));router.push(`/flights?${params}`);}
 return <section className="search-wrap page-wrap" aria-label="Flight search"><form className="flight-form" onSubmit={submit}>
 <h2>Search flights</h2><p>Flight search powered by Aviasales. Booking and payment take place on the selected partner website.</p>
 <div className="flight-fields"><label>From (IATA)<input className="input" name="origin" required pattern="[A-Za-z]{3}" maxLength={3} placeholder="DEL" /></label><label>To (IATA)<input className="input" name="destination" required pattern="[A-Za-z]{3}" maxLength={3} defaultValue="MLE" /></label>
 <label>Departure<input className="input" name="departure" required type="date" /></label><label>Return (optional)<input className="input" name="returning" type="date" /></label>
 <label>Adults<input className="input" name="adults" type="number" min={1} max={9} defaultValue={1} required /></label><label>Children<input className="input" name="children" type="number" min={0} max={6} defaultValue={0} required /></label><label>Infants<input className="input" name="infants" type="number" min={0} max={6} defaultValue={0} required /></label>
 <label>Cabin<select className="input" name="cabin" defaultValue="Y"><option value="Y">Economy</option><option value="W">Premium economy</option><option value="C">Business</option><option value="F">First</option></select></label></div><p>Use three-letter airport/city codes. USD results · maximum nine passengers.</p><button className="button button-teal" type="submit">Search flights</button>
 </form></section>;
}
async function api(body:unknown,signal?:AbortSignal) {const r=await fetch('/api/flights',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body),signal});const d=await r.json();if(!r.ok||!d.ok)throw Error(d.message||'Flight search failed.');return d;}
export function FlightResults() {
 const [offers,setOffers]=useState<FlightOffer[]>([]),[status,setStatus]=useState('Searching airlines and agencies…'),[error,setError]=useState(''),[buying,setBuying]=useState('');
 useEffect(()=>{const controller=new AbortController();let disposed=false;let timer:ReturnType<typeof setTimeout>;const pause=()=>new Promise<void>(resolve=>{timer=setTimeout(resolve,3000);});
 const launch=window.setTimeout(()=>{ void (async()=>{try{const p=new URLSearchParams(window.location.search);const query={origin:(p.get('origin')||'').toUpperCase(),destination:(p.get('destination')||'').toUpperCase(),departure:p.get('departure'),returning:p.get('returning')||undefined,adults:Number(p.get('adults')),children:Number(p.get('children')),infants:Number(p.get('infants')),cabin:p.get('cabin')};
 let d=await api({action:'start',query},controller.signal);const until=Date.now()+120000;
 while(!disposed && Date.now()<until){await pause();if(disposed)return;d=await api({action:'poll',session:d.session},controller.signal);if(disposed)return;
 setOffers(previous=>{const map=new Map(previous.map(o=>[o.id,o]));for(const o of d.offers||[])map.set(o.id,o);return Array.from(map.values()).sort((a,b)=>a.amount-b.amount);});
 if(d.done){setStatus('Search complete. Prices and availability can change before booking.');return;}}
 if(!disposed)setStatus('Search is taking longer than expected. Start a new search for updated results.');
 }catch(e){if(!disposed){setError(e instanceof Error?e.message:'Flight search unavailable.');setStatus('');}}})();},0);
 return()=>{disposed=true;window.clearTimeout(launch);controller.abort();clearTimeout(timer);};},[]);
 async function buy(offer:FlightOffer){setBuying(offer.id);setError('');try{const d=await api({action:'buy',token:offer.buyToken});const url=new URL(d.url);if(url.protocol!=='https:')throw Error('Invalid partner destination.');window.location.assign(url.href);}catch(e){setError(e instanceof Error?e.message:'Booking link unavailable.');}finally{setBuying('');}}
 return <main className="page-main"><div className="page-wrap"><h1>Flight results</h1><p>Aviasales · final booking and payment happen on the named partner website. No reservation is created here.</p><Link className="text-link" href="/">Change search</Link>{status&&<p role="status">{status}</p>}{error&&<div role="alert" className="note-box">{error} <Link href="/">Start a new search</Link></div>}{!offers.length&&status.startsWith('Search complete')&&<p>No flight offers returned for this search.</p>}
 <div className="flight-results">{offers.map(o=><article className="detail-card" key={o.id}><h2>{o.provider}</h2>{o.legs.map((l,i)=><p key={i}>{l.from} → {l.to} · {typeof l.carrier==='string'?l.carrier:'Flight'}<br/>{l.departure} → {l.arrival} (local times)</p>)}<strong>{new Intl.NumberFormat('en-US',{style:'currency',currency:o.currency}).format(o.amount)}</strong><p>Reconfirm price, baggage and cancellation terms with {o.provider} before paying.</p><button className="button button-teal" onClick={()=>buy(o)} disabled={Boolean(buying)}>{buying===o.id?'Opening partner…':`Buy on ${o.provider}`}</button></article>)}</div></div></main>;
}

import "server-only";
import { createHash, createCipheriv, createDecipheriv, randomBytes } from "node:crypto";
import { isIP } from "node:net";

export class FlightError extends Error { constructor(message: string, public status = 400) { super(message); } }
export type FlightQuery = { origin: string; destination: string; departure: string; returning?: string; adults: number; children: number; infants: number; cabin: string };
export function validateFlightQuery(value: unknown): FlightQuery {
  const q = value as FlightQuery;
  if (!q || !/^[A-Z]{3}$/.test(q.origin) || !/^[A-Z]{3}$/.test(q.destination) || q.origin === q.destination) throw new FlightError("Enter different three-letter airport/city IATA codes, such as DEL and MLE.");
  const today = new Date().toISOString().slice(0,10);
  const max = new Date(); max.setUTCFullYear(max.getUTCFullYear()+1);
  for (const date of [q.departure, ...(q.returning ? [q.returning] : [])]) {
    if (typeof date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(date) || !Number.isFinite(Date.parse(date)) || new Date(date).toISOString().slice(0,10) !== date || date < today || date >= max.toISOString().slice(0,10)) throw new FlightError("Choose valid flight dates within the next year.");
  }
  if (q.returning && q.returning < q.departure) throw new FlightError("Return date must be on or after departure.");
  if (![q.adults,q.children,q.infants].every(Number.isInteger) || q.adults < 1 || q.adults > 9 || q.children < 0 || q.children > 6 || q.infants < 0 || q.infants > 6 || q.infants >= q.adults || q.adults+q.children+q.infants > 9 || !["Y","C","F","W"].includes(q.cabin)) throw new FlightError("Check passenger counts (maximum nine; infants must be fewer than adults) and cabin.");
  return {origin:q.origin,destination:q.destination,departure:q.departure,returning:q.returning||undefined,adults:q.adults,children:q.children,infants:q.infants,cabin:q.cabin};
}
function config() {
  const token = process.env.AVIASALES_API_TOKEN;
  const marker = process.env.AVIASALES_PARTNER_ID;
  if (!token || !marker || process.env.AVIASALES_SEARCH_ENABLED !== "true") throw new FlightError("Flight search is not configured yet. Please try again after the site operator enables it.",503);
  if (!/^\d+$/.test(marker)) throw new FlightError("Flight provider configuration is invalid.",503);
  return {token,marker};
}
function values(v: unknown): string[] {
  if (Array.isArray(v)) return v.flatMap(values);
  if (v && typeof v === "object") return Object.keys(v).sort().flatMap(k => values((v as Record<string,unknown>)[k]));
  return [String(v)];
}
export function flightSignature(token: string, body: unknown) { return createHash("md5").update([token,...values(body)].join(":" )).digest("hex"); }
type Session = { search: string; host: string; expires: number; timestamp: number; proposal?: string };
function seal(data: Session) {
  const iv=randomBytes(12), cipher=createCipheriv("aes-256-gcm",createHash("sha256").update(config().token).digest(),iv);
  const body=Buffer.concat([cipher.update(JSON.stringify(data)),cipher.final()]);
  return Buffer.concat([iv,cipher.getAuthTag(),body]).toString("base64url");
}
function open(value: unknown): Session {
  try {
    if(typeof value!=="string" || value.length>4096) throw Error();
    const b=Buffer.from(value,"base64url"), d=createDecipheriv("aes-256-gcm",createHash("sha256").update(config().token).digest(),b.subarray(0,12));d.setAuthTag(b.subarray(12,28));
    const s=JSON.parse(Buffer.concat([d.update(b.subarray(28)),d.final()]).toString()) as Session;
    if(s.expires<Date.now() || s.expires>Date.now()+16*60000 || !s.search) throw Error();
    return s;
  } catch { throw new FlightError("Search expired or invalid. Please start a new search.",410); }
}
function hosts(name: string) { return (process.env[name]||"").split(",").map(x=>x.trim().toLowerCase()).filter(Boolean); }
function resultHost(value: string) {
  const url=new URL(value.includes("://")?value:`https://${value}`);
  if(url.protocol!=="https:" || url.username || url.password || url.port || !hosts("AVIASALES_RESULTS_HOSTS").includes(url.hostname)) throw new FlightError("Provider results host needs operator approval in AVIASALES_RESULTS_HOSTS.",503);
  return url.origin;
}
async function upstream(request: Request, url: string, body?: Record<string,unknown>, click=false) {
  const {token,marker}=config();
  const ip=(process.env.VERCEL === "1" ? request.headers.get("x-vercel-forwarded-for")?.split(",")[0].trim() : "") || (process.env.AVIASALES_TRUST_PROXY==="true" ? request.headers.get("x-forwarded-for")?.split(",")[0].trim() : "");
  if(!ip || !isIP(ip)) throw new FlightError("Trusted visitor IP forwarding is not configured.",503);
  const site = new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000");
  const signature=flightSignature(token,{...body,marker});
  const response=await fetch(url,{method:body?"POST":"GET",redirect:"error",cache:"no-store",signal:AbortSignal.timeout(20000),headers:{"Content-Type":"application/json","x-user-ip":ip,"x-signature":signature,"x-affiliate-user-id":token,"marker":marker,"x-application-host":site.hostname,"Referer":site.origin,"User-Agent":request.headers.get("user-agent")||""},body:body?JSON.stringify(click?body:{...body,...(url.endsWith('/start')?{signature}:{})}):undefined});
  if(response.status===304) return {is_over:false,tickets:[]};
  if(!response.ok) throw new FlightError(response.status===403?"Flight provider denied access. The operator must verify Search API approval and credentials.":"Flight provider is temporarily unavailable. Please retry.",502);
  return response.json();
}
export async function startFlightSearch(request: Request, input: unknown) {
  const q=validateFlightQuery(input);config();
  const directions=[{origin:q.origin,destination:q.destination,date:q.departure},...(q.returning?[{origin:q.destination,destination:q.origin,date:q.returning}]:[])];
  const data=await upstream(request,"https://tickets-api.travelpayouts.com/search/affiliate/start",{marker:config().marker,locale:"en-us",currency_code:"USD",market_code:"US",search_params:{trip_class:q.cabin,passengers:{adults:q.adults,children:q.children,infants:q.infants},directions}});
  if(typeof data.search_id!=="string"||typeof data.results_url!=="string") throw new FlightError("Invalid flight provider response.",502);
  return {session:seal({search:data.search_id,host:resultHost(data.results_url),timestamp:0,expires:Date.now()+14*60000}),offers:[],done:false};
}
export type FlightOffer = {id:string;buyToken:string;provider:string;amount:number;currency:string;legs:{from:string;to:string;departure:string;arrival:string;carrier:string}[]};
export async function flightResults(request: Request, token: unknown) {
  const s=open(token), data=await upstream(request,`${resultHost(s.host)}/search/affiliate/results`,{search_id:s.search,last_update_timestamp:s.timestamp});
  const offers:FlightOffer[]=[];
  for(const ticket of (Array.isArray(data.tickets)?data.tickets:[]).slice(0,100)) {
    const legs=(ticket.segments||[]).flatMap((segment:{flights:number[]})=>(segment.flights||[]).map((i:number)=>data.flight_legs?.[i]).filter(Boolean)).map((l:Record<string,string>)=>({from:l.origin,to:l.destination,departure:l.local_departure_date_time,arrival:l.local_arrival_date_time,carrier:typeof l.operating_carrier_designator==="string"?l.operating_carrier_designator:((l.operating_carrier_designator as unknown as {carrier:string;number:string})?.carrier||"")+((l.operating_carrier_designator as unknown as {number:string})?.number||"")}));
    for(const p of (ticket.proposals||[]).slice(0,10)) {
      if(typeof p.id!=="string" || !Number.isFinite(p.price?.value) || p.price.value<0 || !/^[A-Z]{3}$/.test(p.price.currency_code)||!legs.length)continue;
      const agent=data.agents?.[p.agent_id];
      offers.push({id:p.id,buyToken:seal({...s,proposal:p.id}),provider:typeof agent?.gate_name==="string"?agent.gate_name:`Partner ${p.agent_id}`,amount:p.price.value,currency:p.price.currency_code,legs});
    }
  }
  return {session:seal({...s,timestamp:Number.isSafeInteger(data.last_update_timestamp)?data.last_update_timestamp:s.timestamp}),offers,done:data.is_over===true};
}
export async function flightBuy(request:Request, token:unknown) {
  const s=open(token);if(!s.proposal) throw new FlightError("Select a flight offer first.");
  const data=await upstream(request,`${resultHost(s.host)}/searches/${encodeURIComponent(s.search)}/clicks/${encodeURIComponent(s.proposal)}`);
  const url=new URL(data.url);
  if(data.method!=="GET" || url.protocol!=="https:" || url.username || url.password || url.port || !hosts("AVIASALES_BOOKING_HOSTS").includes(url.hostname)) throw new FlightError("This booking destination requires operator approval or is not supported yet.",503);
  return {url:url.href};
}

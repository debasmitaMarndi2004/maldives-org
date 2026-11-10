import { WhiteLabelFlights } from "@/components/white-label-flights";
import { whiteLabelQuery } from "@/lib/white-label";
export const metadata={title:"Flights — Maldives.org",robots:{index:false,follow:false}};
export default async function FlightsPage({searchParams}:{searchParams:Promise<Record<string,string|string[]|undefined>>}){
 const params=await searchParams;const input=new URLSearchParams();for(const [key,value]of Object.entries(params))if(typeof value==="string")input.set(key,value);
 return <main><section className="page-hero"><div className="page-wrap page-heading"><span className="eyebrow">PLAN YOUR JOURNEY</span><h1>Flights to the Maldives</h1><p>Choose your departure airport and explore flight options with Aviasales.</p></div></section><section className="page-main"><div className="page-wrap"><WhiteLabelFlights query={whiteLabelQuery(input)}/></div></section></main>;
}

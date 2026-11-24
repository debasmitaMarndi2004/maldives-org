import Link from "next/link";
import { WhiteLabelFlights } from "@/components/white-label-flights";
import { whiteLabelQuery } from "@/lib/white-label";
export const metadata={title:"Flights — Maldives.org",robots:{index:false,follow:false}};
export default async function FlightsPage({searchParams}:{searchParams:Promise<Record<string,string|string[]|undefined>>}){
 const params=await searchParams;const input=new URLSearchParams();for(const [key,value]of Object.entries(params))if(typeof value==="string")input.set(key,value);
 return <main><section className="page-hero flights-hero"><div className="page-wrap page-heading"><span className="eyebrow">PLAN YOUR JOURNEY</span><h1>Flights to the Maldives</h1></div></section><section className="page-main flights-main"><div className="page-wrap"><p className="affiliate-disclosure">Flight search is provided by Aviasales. We may earn a commission from eligible bookings. <Link className="text-link" href="/affiliate-disclosure">Affiliate disclosure</Link></p><WhiteLabelFlights query={whiteLabelQuery(input)}/></div></section></main>;
}

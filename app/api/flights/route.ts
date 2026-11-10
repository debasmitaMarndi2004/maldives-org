import { FlightError, startFlightSearch, flightResults, flightBuy } from "@/lib/aviasales";
import { allowRequest, requestKey } from "@/lib/rate-limit";
export const runtime="nodejs";
export async function POST(request:Request) {
  const headers={"Cache-Control":"no-store"};
  try {
    const origin=request.headers.get("origin");
    const site=process.env.NEXT_PUBLIC_SITE_URL;
    if(!origin || (site ? origin!==new URL(site).origin : !["http:","https:"].includes(new URL(origin).protocol) || new URL(origin).host!==request.headers.get("host"))) throw new FlightError("Same-origin requests required.",403);
    if(!allowRequest(`flights:${requestKey(request)}`,60)) throw new FlightError("Too many flight requests. Please wait a minute.",429);
    const text=await request.text();if(text.length>8192)throw new FlightError("Request too large.",413);
    const body=JSON.parse(text);
    if(body.action==="start" && !allowRequest(`flight-start:${requestKey(request)}`,5))throw new FlightError("Too many new searches. Please wait a minute.",429);
    const result=body.action==="start"?await startFlightSearch(request,body.query):body.action==="poll"?await flightResults(request,body.session):body.action==="buy"?await flightBuy(request,body.token):null;
    if(!result)throw new FlightError("Unknown flight action.");
    return Response.json({ok:true,...result},{headers});
  }catch(error){return Response.json({ok:false,message:error instanceof FlightError?error.message:"Unable to complete flight search. Please retry."},{status:error instanceof FlightError?error.status:error instanceof SyntaxError?400:502,headers});}
}

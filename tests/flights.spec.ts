import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import ts from "typescript";

function adapter(bookingURL="https://approved.example/buy?marker=fixture") {
 const exports:Record<string,CallableFunction>={};
 const calls:{url:string;body?:Record<string,unknown>}[]=[];
 const native=createRequire(process.cwd()+"/package.json");
 const env={AVIASALES_SEARCH_ENABLED:"true",AVIASALES_API_TOKEN:"test-only-token",AVIASALES_PARTNER_ID:"123",AVIASALES_RESULTS_HOSTS:"tickets-api.travelpayouts.com",AVIASALES_BOOKING_HOSTS:"approved.example",AVIASALES_TRUST_PROXY:"true",NEXT_PUBLIC_SITE_URL:"https://maldives.example"};
 const code=ts.transpileModule(readFileSync("lib/aviasales.ts","utf8"),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;
 const fakeFetch=async(url:string,options:{body?:string})=>{
 calls.push({url,body:options.body?JSON.parse(options.body):undefined});
 const data=url.endsWith('/start')?{search_id:'test-search',results_url:'https://tickets-api.travelpayouts.com'}:url.endsWith('/results')?{is_over:true,last_update_timestamp:123,agents:{1:{gate_name:'Test agency'}},flight_legs:[{origin:'DEL',destination:'MLE',local_departure_date_time:'2027-02-10T10:00',local_arrival_date_time:'2027-02-10T14:00',operating_carrier_designator:'XX123'}],tickets:[{segments:[{flights:[0]}],proposals:[{id:'proposal-test',agent_id:1,price:{value:200,currency_code:'USD'}}]}]}:{url:bookingURL,method:'GET'};
 return Response.json(data);
 };
 new Function('require','exports','process','fetch',code)((name:string)=>name==='server-only'?{}:native(name),exports,{env},fakeFetch);
 return {exports,calls};
}
const query={origin:'DEL',destination:'MLE',departure:'2027-02-10',adults:1,children:0,infants:0,cabin:'Y'};
const request=()=>new Request('https://maldives.example/api/flights',{headers:{'x-forwarded-for':'203.0.113.10','user-agent':'Test browser'}});

test('signed real-time adapter polls and creates a booking URL only after Buy',async()=>{
 const {exports:a,calls}=adapter();
 expect(a.flightSignature('token',{b:'two',a:{c:'one'}})).toBe('6c306491be30dd7e5a86022b12d64970');
 const start=await a.startFlightSearch(request(),query);
 const result=await a.flightResults(request(),start.session);
 expect(calls).toHaveLength(2);expect(result.done).toBe(true);
 expect(result.offers[0]).toMatchObject({provider:'Test agency',amount:200,currency:'USD'});
 expect(JSON.stringify(result)).not.toContain('test-only-token');
 const buy=await a.flightBuy(request(),result.offers[0].buyToken);
 expect(buy.url).toContain('https://approved.example/buy?marker=fixture');expect(calls).toHaveLength(3);
 await expect(a.flightResults(request(),start.session+'tampered')).rejects.toThrow('expired or invalid');
 await expect(a.flightBuy(request(),start.session)).rejects.toThrow('Select a flight');
 expect(()=>a.validateFlightQuery({...query,destination:'DEL'})).toThrow();
 expect(()=>a.validateFlightQuery({...query,departure:'2027-02-30'})).toThrow();
});

test('malicious booking destinations fail closed',async()=>{
 const {exports:a}=adapter('https://approved.example.evil.test/buy');
 const s=await a.startFlightSearch(request(),query);const r=await a.flightResults(request(),s.session);
 await expect(a.flightBuy(request(),r.offers[0].buyToken)).rejects.toThrow('destination');
});

test('native homepage flight search reaches results and missing credentials are honest',async({page})=>{
 await page.goto('/');await page.getByLabel('From (IATA)').fill('DEL');await page.getByLabel('Departure',{exact:true}).fill('2027-02-10');
 await page.getByRole('button',{name:'Search flights',exact:true}).click();await expect(page).toHaveURL(/\/flights\?/);
 await expect(page.getByRole('main').getByRole('alert')).toContainText('not configured');
 await expect(page.getByRole('button',{name:/Buy on/})).toHaveCount(0);
});

test('results render and Buy is requested only after explicit interaction (synthetic API fixture)',async({page})=>{
 let buyCalls=0;
 await page.route('**/api/flights',route=>{const body=route.request().postDataJSON();if(body.action==='buy'){buyCalls++;return route.fulfill({status:503,json:{ok:false,message:'Test partner unavailable'}});}return route.fulfill({json:body.action==='start'?{ok:true,session:'fixture-session'}:{ok:true,session:'fixture-session',done:true,offers:[{id:'fixture',buyToken:'fixture-token',provider:'Test agency',amount:200,currency:'USD',legs:[{from:'DEL',to:'MLE',carrier:'XX123',departure:'10:00',arrival:'14:00'}]}]}});});
 await page.goto('/flights?origin=DEL&destination=MLE&departure=2027-02-10&adults=1&children=0&infants=0&cabin=Y');
 const buy=page.getByRole('button',{name:'Buy on Test agency'});await expect(buy).toBeVisible({timeout:15000});expect(buyCalls).toBe(0);await buy.click();await expect(page.getByRole('main').getByRole('alert')).toContainText('Test partner unavailable');expect(buyCalls).toBe(1);
});

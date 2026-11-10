// Provider URL-state fields. Never accept a marker override or external results URL.
export const whiteLabelQueryKeys=["flightSearch","currency","locale","ticketId","destinationAirports","originAirports","destination_airports","origin_airports","open_datepicker"];
export function whiteLabelQuery(input:URLSearchParams){
 const output=new URLSearchParams();
 for(const key of whiteLabelQueryKeys){const value=input.get(key);if(value!==null&&value.length<=4000)output.set(key,value);}
 return output.toString();
}

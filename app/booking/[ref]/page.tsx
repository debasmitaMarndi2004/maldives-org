import Link from "next/link";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export default async function BookingReferencePage({ params }: { params: Promise<{ ref: string }> }) {
  const { ref } = await params;
  const supabase = getSupabaseAdmin();
  let booking: { offer_title: string; status: string; currency: string; price_from_usd: number | null; supplier_reference: string | null; voucher_url: string | null } | null = null;
  if (supabase) {
    const result = await supabase.from("booking_requests").select("offer_title, status, currency, price_from_usd, supplier_reference, voucher_url").eq("reference", ref).maybeSingle();
    booking = result.data;
  }

  return <main className="page-main"><div className="page-wrap booking-confirmation"><span className="eyebrow">BOOKING REFERENCE</span><h1>{booking ? booking.status === "confirmed" ? "Your booking is confirmed." : "Your request is on record." : "Your reference is being prepared."}</h1><p>{booking ? `We have your request for ${booking.offer_title}. The current status is ${booking.status}.` : "This preview reference will become a live booking status after Supabase is connected."}</p><div className="confirmation-reference"><span>{booking?.supplier_reference ? "Hotelbeds reference" : "Reference"}</span><strong>{booking?.supplier_reference || ref}</strong></div>{booking && booking.status === "confirmed" && <div className="booking-actions"><Link className="button button-teal" href={`/booking/${encodeURIComponent(ref)}/voucher`}>View voucher</Link>{booking.price_from_usd && <Link className="button button-sun" href={`/checkout?booking=${encodeURIComponent(ref)}`}>Review secure checkout</Link>}</div>}<Link className="button button-ghost button-dark" href="/stay" style={{ marginTop: 8 }}>Keep exploring</Link></div></main>;
}

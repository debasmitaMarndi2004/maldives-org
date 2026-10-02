import Link from "next/link";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export default async function BookingReferencePage({ params }: { params: Promise<{ ref: string }> }) {
  const { ref } = await params;
  const supabase = getSupabaseAdmin();
  let booking: { offer_title: string; status: string; currency: string; price_from_usd: number | null } | null = null;
  if (supabase) {
    const result = await supabase.from("booking_requests").select("offer_title, status, currency, price_from_usd").eq("reference", ref).maybeSingle();
    booking = result.data;
  }

  return <main className="page-main"><div className="page-wrap booking-confirmation"><span className="eyebrow">BOOKING REFERENCE</span><h1>{booking ? "Your request is on record." : "Your reference is being prepared."}</h1><p>{booking ? `We have your request for ${booking.offer_title}. The current status is ${booking.status}.` : "This preview reference will become a live booking status after Supabase is connected."}</p><div className="confirmation-reference"><span>Reference</span><strong>{ref}</strong></div>{booking && booking.status === "confirmed" && <Link className="button button-teal" href={`/checkout?booking=${encodeURIComponent(ref)}`}>Review secure checkout</Link>}<Link className="button button-ghost button-dark" href="/stay" style={{ marginLeft: 8 }}>Keep exploring</Link></div></main>;
}

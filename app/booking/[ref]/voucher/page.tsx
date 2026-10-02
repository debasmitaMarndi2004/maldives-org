import Link from "next/link";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { SupplierPrice } from "@/components/supplier-price";

type CancellationPolicy = { amount?: number; from?: string };

export default async function BookingVoucherPage({ params }: { params: Promise<{ ref: string }> }) {
  const { ref } = await params;
  const supabase = getSupabaseAdmin();
  let booking: { offer_title: string; status: string; currency: string; price_amount: number | null; supplier_reference: string | null; supplier_status: string | null; voucher_url: string | null; cancellation_policy: CancellationPolicy[] | null } | null = null;
  if (supabase) {
    const result = await supabase.from("booking_requests").select("offer_title, status, currency, price_amount, supplier_reference, supplier_status, voucher_url, cancellation_policy").eq("reference", ref).maybeSingle();
    booking = result.data;
  }

  if (!booking || booking.status !== "confirmed") {
    return <main className="page-main"><div className="page-wrap content-page"><div className="detail-card voucher-card"><span className="eyebrow">VOUCHER</span><h1>Your voucher is not ready yet.</h1><p>This page becomes active after Hotelbeds returns a confirmed booking and the request is saved in Supabase.</p><Link className="button button-teal" href={`/booking/${encodeURIComponent(ref)}`}>View booking status</Link></div></div></main>;
  }

  return <main className="page-main"><div className="page-wrap content-page"><div className="detail-card voucher-card"><div className="voucher-topline"><div><span className="eyebrow">CONFIRMED VOUCHER</span><h1>{booking.offer_title}</h1></div><span className="voucher-status">{booking.supplier_status || "CONFIRMED"}</span></div><div className="voucher-grid"><div><span>Hotelbeds reference</span><strong>{booking.supplier_reference || "Pending"}</strong></div><div><span>Maldives.org reference</span><strong>{ref}</strong></div><div><span>Confirmed amount</span><strong>{booking.price_amount ? <SupplierPrice amount={booking.price_amount} currency={booking.currency || "USD"} /> : "See supplier voucher"}</strong></div><div><span>Supplier</span><strong>Hotelbeds</strong></div></div>{booking.cancellation_policy?.length ? <section className="voucher-section"><span className="eyebrow">CANCELLATION</span><h2>Cancellation terms</h2>{booking.cancellation_policy.map((policy, index) => <div className="policy-row" key={`${policy.from}-${index}`}><span>{policy.from ? new Date(policy.from).toLocaleString("en-GB", { dateStyle: "medium" }) : "Policy date"}</span><strong>{typeof policy.amount === "number" ? `${policy.amount.toFixed(2)} ${booking.currency}` : "As supplied"}</strong></div>)}</section> : <div className="note-box">Cancellation terms are supplied by Hotelbeds for the confirmed rate.</div>}{booking.voucher_url ? <a className="button button-teal" href={booking.voucher_url} target="_blank" rel="noreferrer">Open Hotelbeds voucher ↗</a> : <div className="note-box">The supplier did not return a hosted voucher URL. Keep this reference and contact the Maldives.org team for the final voucher.</div>}<div className="booking-actions"><Link className="button button-ghost button-dark" href="/stay">Back to stays</Link><Link className="button button-sun" href={`/checkout?booking=${encodeURIComponent(ref)}`}>Continue to payment</Link></div></div></div></main>;
}

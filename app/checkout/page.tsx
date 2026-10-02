import { CheckoutPanel } from "@/components/checkout-panel";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export default async function CheckoutPage({ searchParams }: { searchParams: Promise<{ booking?: string }> }) {
  const { booking: reference = "" } = await searchParams;
  const supabase = getSupabaseAdmin();
  let record: { offer_title: string; price_from_usd: number | null; currency: string; status: string } | null = null;
  if (supabase && reference) {
    const result = await supabase.from("booking_requests").select("offer_title, price_from_usd, currency, status").eq("reference", reference).maybeSingle();
    record = result.data;
  }

  return <main className="page-main"><div className="page-wrap content-page"><section className="page-hero"><div className="page-heading"><span className="eyebrow">CHECKOUT</span><h1>One clear step before you go.</h1><p>Payment is protected by Stripe and only becomes available after the request and supplier amount are confirmed.</p></div></section>{record ? <CheckoutPanel reference={reference} title={record.offer_title} amount={record.price_from_usd ?? 0} currency={record.currency || "USD"} enabled={Boolean(record.status === "confirmed" && process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY && process.env.STRIPE_SECRET_KEY)} /> : <div className="detail-card"><h2>Checkout is not active yet.</h2><p>{reference ? "This reference is not available in the connected booking database." : "Open checkout from a saved booking reference."} Add Supabase and Stripe keys after the account setup to activate secure payment.</p></div>}</div></main>;
}

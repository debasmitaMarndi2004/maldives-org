import Link from "next/link";

export default function CheckoutPage() {
  return <main className="page-main"><div className="page-wrap content-page"><section className="page-hero"><div className="page-heading"><span className="eyebrow">AFFILIATE DISCOVERY</span><h1>Book with the partner, when you’re ready.</h1><p>Maldives.org does not take payments or confirm direct reservations in this MVP.</p></div></section><div className="detail-card"><h2>Direct checkout is disabled.</h2><p>When an approved partner link is available, its provider is shown before you leave Maldives.org. Booking, payment, availability and cancellation terms are handled on that partner’s website.</p><p>No payment has been taken and no booking has been created here.</p><div className="booking-actions"><Link className="button button-teal" href="/stay">Explore stays</Link><Link className="button button-ghost button-dark" href="/experiences">Explore experiences</Link></div></div></div></main>;
}

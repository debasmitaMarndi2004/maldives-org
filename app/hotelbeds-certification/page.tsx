import Link from "next/link";
import { ArrowRight } from "@/components/icons";

const checklist = [
  ["01", "Availability", "Search stays for the traveller’s dates, guests and selected Maldives hotel codes."],
  ["02", "CheckRate", "Recheck only rates marked RECHECK and show the refreshed amount, room, board and cancellation terms."],
  ["03", "Confirmation", "Send the selected rate key with complete holder and passenger details only after review."],
  ["04", "Voucher", "Keep the supplier reference and make the confirmed voucher easy for the traveller to open."],
  ["05", "Content", "Show accurate hotel name, category, images, facilities, rate comments and cancellation information."],
  ["06", "Live readiness", "Use the approved mTLS credentials, tested URL and Hotelbeds commercial decisions before requesting certification."],
];

export default function HotelbedsCertificationPage() {
  return <main className="page-main"><section className="page-hero" data-reveal><div className="page-wrap page-heading"><span className="eyebrow">HOTELBEDS · CERTIFICATION READY</span><h1>A booking flow that earns its confidence.</h1><p>We keep the supplier steps visible: availability first, CheckRate when required, confirmation only after review, then a voucher and clear cancellation terms.</p></div></section><section className="page-main" data-reveal><div className="page-wrap"><div className="certification-intro detail-card"><div><span className="eyebrow">CURRENT MODE</span><h2>Safe until Hotelbeds approves testing.</h2><p>Availability can be explored in the test environment. CheckRate and confirmation are protected by mTLS and a disabled-by-default booking mode so a normal visitor cannot accidentally create a supplier reservation.</p></div><span className="certification-pill">Booking mode · disabled</span></div><div className="certification-grid">{checklist.map(([number, title, description]) => <article className="detail-card certification-card" key={number}><span className="certification-number">{number}</span><h2>{title}</h2><p>{description}</p></article>)}</div><div className="detail-card certification-next"><span className="eyebrow">NEXT HAND-OFF</span><h2>When Hotelbeds replies</h2><p>We will add the Maldives hotel codes, mTLS certificate details and approved test mode, then run the full sandbox workflow against the certification checklist.</p><div className="booking-actions"><Link className="button button-teal" href="/stay">Test stay search <ArrowRight size={14} /></Link><Link className="button button-ghost button-dark" href="/how-it-works">How the suppliers work</Link></div></div></div></section></main>;
}

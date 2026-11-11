import Link from "next/link";
import { notFound } from "next/navigation";
import { getViatorTour } from "@/lib/tours/viator-catalog";
import { validTourCode } from "@/lib/tours/viator-data";
import { ViatorPhoto } from "@/components/tours/viator-photo";
import styles from "@/components/tours/tours.module.css";

export const dynamic = "force-dynamic";
export const metadata = { title: "Viator Tour Details — Maldives.org", robots: { index: false, follow: true } };
export default async function ViatorTourPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  if (!validTourCode(code)) notFound();
  let result;
  try { result = await getViatorTour(code); }
  catch { return <main className={`${styles.page} ${styles.guide}`}><div className="page-wrap"><h1>Tour details are temporarily unavailable.</h1><p>Viator could not provide this tour right now. No booking or payment has been made.</p><p><a className={styles.textLink} href={`/tours-and-activities/viator/${code}`}>Try tour details again</a></p><Link className={styles.textLink} href="/tours-and-activities">Return to tours &amp; activities</Link></div></main>; }
  if (!result) notFound();
  const { tour, sandbox } = result;
  return <main className={`${styles.page} ${styles.guide}`}><div className="page-wrap">
    <Link className={styles.textLink} href="/tours-and-activities">← All tours &amp; activities</Link>
    <p className={styles.category}>VIATOR EXPERIENCE · MALDIVES{sandbox ? " · SANDBOX TEST DATA" : ""}</p>
    <h1>{tour.title}</h1>
    <ViatorPhoto src={tour.image} title={tour.title} large/>
    <div className={styles.guideLayout}><section><h2>About this experience</h2><p className={styles.fullDescription}>{tour.description || "Check the complete itinerary on Viator before booking."}</p>
      {tour.rating !== null && <p>★ {tour.rating.toFixed(1)} · {tour.reviews} reviews supplied by Viator</p>}
      {tour.durationMinutes !== null && <p>Duration: {tour.durationMinutes} minutes. Confirm the selected option on Viator.</p>}
      {tour.inclusions.length > 0 && <><h2>Included</h2><ul>{tour.inclusions.map((item, index) => <li key={index}>{item}</li>)}</ul></>}
      {tour.exclusions.length > 0 && <><h2>Not included</h2><ul>{tour.exclusions.map((item, index) => <li key={index}>{item}</li>)}</ul></>}
      {tour.cancellation && <><h2>Cancellation information</h2><p>{tour.cancellation}</p></>}
    </section><aside><h2>Continue when you’re ready.</h2><p>Check current dates, options, total price and availability on Viator. Your reservation, payment and confirmation are handled by Viator.</p>
      {tour.bookingUrl && !sandbox ? <a className="button button-teal" href={`/tours-and-activities/viator/${tour.code}/book`} target="_blank" rel="sponsored noopener noreferrer">Check availability on Viator ↗</a> : <><button type="button" disabled>Booking link unavailable</button><p>No live booking link is available for this tour.</p></>}
      <p>Opens Viator in a new tab, keeping Maldives.org open. Maldives.org may earn a commission from qualifying bookings.</p><Link className={styles.textLink} href="/affiliate-disclosure">About partner links</Link>
    </aside></div>
  </div></main>;
}

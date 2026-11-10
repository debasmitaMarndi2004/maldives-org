import Link from "next/link";
import { experiences, properties } from "@/lib/data";
import { AffiliateBookingAction } from "@/components/affiliate-booking-action";

export default async function BookingPage({ searchParams }: { searchParams: Promise<{ type?: string; slug?: string }> }) {
  const params = await searchParams;
  const experience = params.type === "experience" ? experiences.find((item) => item.slug === params.slug) : undefined;
  const property = params.type !== "experience" ? properties.find((item) => item.slug === params.slug) : undefined;
  const selection = experience || property;
  const detailsHref = experience ? `/experiences/${experience.slug}` : property ? `/stay/${property.slug}` : "/stay";

  return <main className="page-main booking-main"><div className="page-wrap content-page"><div className="detail-card"><span className="eyebrow">AFFILIATE DISCOVERY</span><h1>{selection ? `Explore ${selection.name}` : "Your next island discovery."}</h1><p>Direct booking and payment are disabled on Maldives.org. This page does not create a reservation or capture a booking request.</p><div className="note-box">Check the listing details for approved partner options. When available, the booking provider is named and you complete the transaction on its website. Sample prices are planning estimates, not live availability.</div>{selection && <AffiliateBookingAction productType={experience ? "experience" : "stay"} slug={selection.slug} detailsHref={detailsHref} />}<div className="booking-actions"><Link className="button button-teal" href={detailsHref}>{selection ? "View listing details" : "Explore stays"}</Link><Link className="button button-ghost button-dark" href="/experiences">Explore experiences</Link></div></div></div></main>;
}

import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "@/components/icons";
import { AffiliateBookingAction } from "@/components/affiliate-booking-action";
import { getPublicAffiliateCatalog } from "@/lib/affiliate-config";
import { getAccommodationBookingLinks } from "@/lib/accommodations/booking-links";
import type { Accommodation } from "@/lib/accommodations/catalog";
import styles from "./discovery.module.css";

export function AccommodationDetail({ property }: { property: Accommodation }) {
  const hasExistingOffer = getPublicAffiliateCatalog().offers.some((o) => o.productType === "stay" && o.slug === property.slug);
  const stay22Links = getAccommodationBookingLinks(property.slug);
  return <main className={styles.discovery}>
    <section className={styles.intro}><div className="page-wrap"><Link href="/stay" className={styles.back}>All accommodations <ArrowRight size={14}/></Link><p className="eyebrow">{property.kind} · {property.island}</p><h1>{property.name}</h1><p>{property.description}</p></div></section>
    <div className={`page-wrap ${styles.detailLayout}`}>
      <article>
        <div className={styles.detailImage} role="img" aria-label="Illustrative Maldives setting, not a photograph of this property" style={{ backgroundImage: `url(${property.illustration})` }}/><p className={styles.imageNote}>Original thematic artwork · not a photograph of {property.name}</p>
        <section className={styles.panel}><span className="eyebrow">THE SETTING</span><h2>Get to know your island stay.</h2><p>{property.description}</p><dl className={styles.facts}><div><dt>Island</dt><dd>{property.island}</dd></div><div><dt>Atoll</dt><dd>{property.atoll || "Not independently documented in this catalog yet"}</dd></div><div><dt>Accommodation</dt><dd>{property.kind}</dd></div><div><dt>Information reviewed</dt><dd><time dateTime={property.reviewedOn}>{property.reviewedOn}</time></dd></div></dl><h3>Documented features</h3><ul className={styles.tags}>{property.amenities.map((v) => <li key={v}>{v}</li>)}</ul><p>Features may depend on the room or package. Confirm inclusions and accessibility requirements directly with the property or booking provider.</p><h3>Information source</h3><p><a href={property.source} target="_blank" rel="noopener noreferrer">Official property/operator website <ArrowUpRight size={14}/></a>. This source documents property information; it is not a Stay22 affiliate link.</p></section>
      </article>
      <aside className={`${styles.panel} ${styles.booking}`} aria-label="Accommodation booking partners"><span className="eyebrow">YOUR NEXT STEP</span><h2>Check with a booking partner.</h2><p>We do not have a live price or availability feed for this property.</p>
        {hasExistingOffer ? <AffiliateBookingAction productType="stay" slug={property.slug}/> : stay22Links.length ? <><a className="button button-teal full-button" href={`/stay/partners/${property.slug}`} target="_blank" rel="noopener noreferrer">Check availability <ArrowUpRight size={16}/></a><p>Opens a separate Stay22 partner-selection page. You choose whether to load affiliate tracking; reservations and payment take place on the named supplier website.</p></> : <><button className="button button-teal full-button" type="button" disabled>Check availability</button><p role="status">Booking partner unavailable for this property. An approved accommodation link has not been activated.</p></>}
        <div className={styles.bookingNote}>Maldives.org does not take payment or confirm a reservation. We may earn a commission from qualifying partner bookings. Final prices, cancellation terms and availability are confirmed externally.</div><Link className={styles.cardAction} href="/stay">Compare other stays <ArrowRight size={16}/></Link>
      </aside>
    </div>
  </main>;
}

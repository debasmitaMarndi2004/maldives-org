import Link from "next/link";
import { Price } from "@/components/price";

export type HotelbedsLiveStay = {
  id: string;
  name: string;
  location: string;
  description: string;
  image: string;
  rating: number;
  price: number;
  currency: string;
  supplierCode: string;
};

export function HotelbedsLiveResults({
  stays,
  checkIn,
  checkOut,
}: {
  stays: HotelbedsLiveStay[];
  checkIn: string;
  checkOut: string;
}) {
  return (
    <main className="page-shell section-space">
      <div className="eyebrow">Hotelbeds live availability</div>
      <div className="section-heading section-heading-wide">
        <div>
          <h1>Stays available for your dates</h1>
          <p>
            Live hotel availability from Hotelbeds for {checkIn} to {checkOut}.
            Rates and room conditions are confirmed before booking.
          </p>
        </div>
        <Link className="button button-secondary" href="/stay">
          Change search
        </Link>
      </div>

      <div className="notice-card notice-card-info" role="status">
        <strong>Hotelbeds connected</strong>
        <span>
          Showing live supplier results. Final room rules and cancellation terms
          are checked in the booking step.
        </span>
      </div>

      <div className="directory-grid">
        {stays.map((stay) => (
          <article className="stay-card" key={stay.id}>
            <div className="stay-image" style={{ "--card-image": `url(${stay.image})` } as React.CSSProperties}>
              <span className="stay-badge">Hotelbeds live</span>
            </div>
            <div className="stay-body">
              <div className="stay-meta">
                <span>{stay.location}</span>
                <span>★ {stay.rating.toFixed(1)}</span>
              </div>
              <div className="card-source-row"><span className="source-badge source-hotelbeds"><span className="source-dot" />Hotelbeds</span></div>
              <h3>{stay.name}</h3>
              <p>{stay.description}</p>
              <div className="stay-footer">
                <Link href={`/booking?type=stay&supplier=hotelbeds&hotel=${stay.supplierCode}`}>Continue</Link>
                <span>From <Price usd={stay.price} /></span>
              </div>
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}

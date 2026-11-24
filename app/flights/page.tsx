import Image from "next/image";
import { FlightPreview } from "./flight-preview";
import styles from "./flights.module.css";

export const metadata = {
  title: "Flights to the Maldives — Maldives.org",
  description: "Plan your arrival in the Maldives and check how to reach your island from the airport.",
  robots: { index: false, follow: false },
};

export default function FlightsPage() {
  return (
    <main className={styles.page}>
      <div className="page-wrap">
        <section className={styles.hero} aria-labelledby="flights-title">
          <div className={styles.artwork}>
            <Image
              alt=""
              className={styles.heroImage}
              fill
              preload
              unoptimized
              src="/images/home-redesign/service-flights.webp"
            />
          </div>
          <div className={styles.heroCopy}>
            <h1 id="flights-title">Flights to the <span>Maldives</span></h1>
            <p>Plan your arrival and your onward journey to the islands.</p>
          </div>
        </section>
        <FlightPreview />
      </div>
    </main>
  );
}

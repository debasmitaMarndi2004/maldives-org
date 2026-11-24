"use client";

import { useId, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { ArrowRight, ChevronDown } from "@/components/icons";
import { isCalendarDate } from "@/lib/calendar-date";
import styles from "./flights.module.css";

const origins = [
  { city: "Dubai", code: "DXB" },
  { city: "Doha", code: "DOH" },
  { city: "Singapore", code: "SIN" },
  { city: "New Delhi", code: "DEL" },
  { city: "Mumbai", code: "BOM" },
  { city: "London", code: "LHR" },
];

const tripTypes = ["Round trip", "One way"] as const;
const dateFormat = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  timeZone: "UTC",
});

type TripType = (typeof tripTypes)[number];
type Itinerary = {
  origin: (typeof origins)[number];
  trip: TripType;
  travellers: number;
  dates: string;
};

function DateField({
  label,
  value,
  min,
  onChange,
}: {
  label: string;
  value: string;
  min?: string;
  onChange: (value: string) => void;
}) {
  const inputId = useId();

  return (
    <div className={styles.field}>
      <label className={styles.fieldLabel} htmlFor={inputId}>{label}</label>
      <span className={styles.dateControl}>
        <input
          id={inputId}
          type="date"
          value={value}
          min={min}
          max="9999-12-31"
          onChange={(event) => onChange(event.target.value)}
        />
        {!value && <span className={styles.datePlaceholder} aria-hidden="true">Add date</span>}
      </span>
    </div>
  );
}

export function FlightPreview() {
  const [trip, setTrip] = useState<TripType>("Round trip");
  const [departure, setDeparture] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [itinerary, setItinerary] = useState<Itinerary>({
    origin: origins[0],
    trip: "Round trip",
    travellers: 1,
    dates: "",
  });
  const itineraryHeading = useRef<HTMLHeadingElement>(null);
  const roundTrip = trip === "Round trip";

  function preview(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const fields = new FormData(event.currentTarget);
    const dates = [departure, roundTrip ? returnDate : ""]
      .filter(isCalendarDate)
      .map((date) => dateFormat.format(new Date(date)))
      .join(" – ");
    setItinerary({
      origin: origins.find(({ code }) => code === fields.get("origin")) ?? origins[0],
      trip,
      travellers: Number(fields.get("travellers")),
      dates,
    });
    itineraryHeading.current?.focus();
  }

  return (
    <>
      <form className={styles.form} aria-label="Flight preview" aria-describedby="flight-preview-note" onSubmit={preview}>
        <div className={styles.formTop}>
          <fieldset className={styles.tripOptions}>
            <legend className="sr-only">Trip type</legend>
            {tripTypes.map((type) => (
              <label key={type}>
                <input type="radio" name="trip" checked={trip === type} onChange={() => setTrip(type)} />
                {type}
              </label>
            ))}
          </fieldset>
          <p className={styles.previewNote} id="flight-preview-note">Preview only · Live fares and booking are unavailable.</p>
        </div>
        <div className={styles.fields} data-round-trip={roundTrip}>
          <div className={styles.field}>
            <label className={styles.fieldLabel} htmlFor="flight-origin">From</label>
            <span className={styles.selectControl}>
              <select id="flight-origin" name="origin" defaultValue={origins[0].code}>
                {origins.map(({ city, code }) => <option key={code} value={code}>{city} ({code})</option>)}
              </select>
              <ChevronDown size={15} />
            </span>
          </div>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>To</span>
            <strong>Malé (MLE)</strong>
          </div>
          <DateField label="Departure" value={departure} onChange={setDeparture} />
          {roundTrip && <DateField label="Return" value={returnDate} min={departure || undefined} onChange={setReturnDate} />}
          <div className={`${styles.field} ${styles.travellers}`}>
            <label className={styles.fieldLabel} htmlFor="flight-travellers">Travellers</label>
            <span className={styles.selectControl}>
              <select id="flight-travellers" name="travellers" defaultValue="1">
                {[1, 2, 3, 4, 5, 6].map((count) => (
                  <option key={count} value={count}>{count} {count === 1 ? "traveller" : "travellers"}</option>
                ))}
              </select>
              <ChevronDown size={15} />
            </span>
          </div>
          <div className={styles.submitCell}>
            <button className={styles.submit} type="submit">Preview itinerary <ArrowRight size={18} /></button>
          </div>
        </div>
      </form>

      <div className={styles.details}>
        <section aria-labelledby="example-itinerary-title">
          <h2 id="example-itinerary-title" tabIndex={-1} ref={itineraryHeading}>Example itinerary</h2>
          <div className={styles.ticket} aria-live="polite" aria-atomic="true">
            <div className={styles.airport}><strong>{itinerary.origin.code}</strong><span>{itinerary.origin.city}</span></div>
            <div className={styles.flightLine} aria-hidden="true"><ArrowRight size={20} /></div>
            <div className={styles.airport}><strong>MLE</strong><span>Malé</span></div>
            <div className={styles.ticketDetails}>
              <p>{itinerary.trip} · {itinerary.travellers} {itinerary.travellers === 1 ? "traveller" : "travellers"}</p>
              {itinerary.dates && <p className={styles.ticketDates}>{itinerary.dates}</p>}
            </div>
          </div>
        </section>
        <aside className={styles.transfer}>
          <h2>Continue to your island</h2>
          <p>Confirm your transfer with your accommodation before choosing an arrival time.</p>
          <div className={styles.transferLinks}>
            <Link href="/transfers">Explore island transfers <ArrowRight size={16} /></Link>
            <Link href="/plan-your-trip">Plan your trip <ArrowRight size={16} /></Link>
          </div>
        </aside>
      </div>
    </>
  );
}

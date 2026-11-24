import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "@/components/icons";
import type { Accommodation } from "@/lib/accommodations/catalog";
import styles from "./discovery.module.css";

export function AccommodationDetail({ property }: { property: Accommodation }) {
  return <main className={styles.discovery}>
    <section className={styles.intro}><div className="page-wrap"><Link href="/stay" className={styles.back}>All accommodations <ArrowRight size={14}/></Link><p className="eyebrow">{property.kind} · {property.island}</p><h1>{property.name}</h1><p>{property.description}</p></div></section>
    <div className={`page-wrap ${styles.detailLayout}`}>
      <article>
        <div className={styles.detailImage} role="img" aria-label="Illustrative Maldives setting, not a photograph of this property" style={{ backgroundImage: `url(${property.illustration})` }}/><p className={styles.imageNote}>Original thematic artwork · not a photograph of {property.name}</p>
        <section className={styles.panel}><span className="eyebrow">THE SETTING</span><h2>Get to know your island stay.</h2><p>{property.description}</p><dl className={styles.facts}><div><dt>Island</dt><dd>{property.island}</dd></div><div><dt>Atoll</dt><dd>{property.atoll || "Not independently documented in this catalog yet"}</dd></div><div><dt>Accommodation</dt><dd>{property.kind}</dd></div><div><dt>Information reviewed</dt><dd><time dateTime={property.reviewedOn}>{property.reviewedOn}</time></dd></div></dl><h3>Documented features</h3><ul className={styles.tags}>{property.amenities.map((v) => <li key={v}>{v}</li>)}</ul><p>Features may depend on the room or package. Confirm inclusions and accessibility requirements directly with the property or booking provider.</p><h3>Information source</h3><p><a href={property.source} target="_blank" rel="noopener noreferrer">Official property/operator website <ArrowUpRight size={14}/></a>.</p></section>
      </article>
      <aside className={`${styles.panel} ${styles.booking}`} aria-label="Accommodation booking information"><span className="eyebrow">YOUR NEXT STEP</span><h2>Check with the property.</h2><p>Live booking is currently unavailable on Maldives.org. Ask the property about rooms, transfer fees and cancellation terms.</p>
        <Link className={styles.cardAction} href="/stay">Compare other stays <ArrowRight size={16}/></Link>
      </aside>
    </div>
  </main>;
}

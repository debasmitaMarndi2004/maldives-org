import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "@/components/icons";
import credits from "@/public/images/home-redesign/islands/provenance.json";
import styles from "./home-upper.module.css";

type SymbolKind = "plane" | "bed" | "mask" | "shield" | "layers" | "bolt" | "headset";
function Symbol({kind}:{kind:SymbolKind}) {
 const paths:Record<SymbolKind,React.ReactNode>={
  plane:<path d="m21 3-7.5 7.5L4 8 2 10l8 4-4 4H3l-1 1 5 2 2 5 1-1v-3l4-4 4 8 2-2-2.5-9.5L25 7c3-3-1-7-4-4Z" fill="currentColor" stroke="none" transform="translate(1 -1) scale(.82)"/>,
  bed:<><path d="M3 18V7m18 11V7M3 13h18v6H3zM6 13V9a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v4m0 0V9a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v4M3 19v2m18-2v2"/></>,
  mask:<><path d="M3 7h14v7a4 4 0 0 1-7 2l-1-1-1 1a4 4 0 0 1-7-2V9a2 2 0 0 1 2-2Zm14 2h3V3m0 0h2m-2 0v14a4 4 0 0 1-4 4h-2"/></>,
  shield:<><path d="m12 2 9 4v7c0 5-9 9-9 9S3 18 3 13V6z"/><path d="m8 12 3 3 5-6"/></>,
  layers:<><path d="m12 2 10 5-10 5L2 7Zm-10 11 10 5 10-5M2 18l10 5 10-5"/></>,
  bolt:<path d="m14 1-11 13h8l-1 9 11-14h-8z"/>,
  headset:<><path d="M4 14v-3a8 8 0 0 1 16 0v3M4 12H2v7h4v-7Zm16 0h2v7h-4v-7Zm0 7a4 4 0 0 1-4 4h-3"/></>,
 };
 return <svg viewBox="0 0 26 26" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[kind]}</svg>;
}
const services=[
 {kind:"plane" as const,title:"Search Flights",description:"Find the best flight options to the Maldives worldwide.",action:"Search Flights",href:"/flights",art:"service-flights.webp"},
 {kind:"bed" as const,title:"Hotels & Resorts",description:"Discover resorts, overwater villas and handpicked stays.",action:"Find Stays",href:"/stay",art:"service-stays.webp"},
 {kind:"mask" as const,title:"Tours & Activities",description:"Explore snorkeling, diving, island hopping and more.",action:"Explore Activities",href:"/experiences",art:"service-activities.webp"},
];
const benefits=[
 {kind:"shield" as const,title:"Trusted Partners",description:"Leading travel providers"},
 {kind:"layers" as const,title:"Compare Options",description:"Flights, stays & experiences"},
 {kind:"bolt" as const,title:"Best Value",description:"Great deals for your trip"},
 {kind:"headset" as const,title:"Travel Support",description:"Guides, tips & useful info"},
];
const islands=[
 {slug:"male",name:"Malé",description:"Capital & Cultural Hub"},
 {slug:"maafushi",name:"Maafushi",description:"Local Island Vibes"},
 {slug:"hulhumale",name:"Hulhumalé",description:"Modern Island Living"},
 {slug:"dhigurah",name:"Dhigurah",description:"Whale Shark Paradise"},
];
export function HomeUpper(){
 return <div className={styles.upper}>
  <div className={styles.scene} data-home-hero>
   <section className={`${styles.wrap} ${styles.hero}`} aria-label="Discover the Maldives">
    <h1>Find your perfect<br/>Maldives getaway.</h1>
    <p>Explore extraordinary resorts, overwater villas, unforgettable experiences, and travel options — all in one place.</p>
    <div className={styles.actions}><Link className={styles.primary} href="/stay">Explore Resorts <ArrowUpRight/></Link><Link className={styles.outline} href="/experiences">Discover Experiences <ArrowUpRight/></Link></div>
   </section>
   <div className={`${styles.wrap} ${styles.services}`} aria-label="Plan your trip">{services.map(s=><Link key={s.href} href={s.href} aria-label={s.action} className={styles.service} style={{backgroundImage:`url(/images/home-redesign/${s.art})`}}><span className={styles.serviceIcon}><Symbol kind={s.kind}/></span><div className={styles.serviceCopy}><h2>{s.title}</h2><p>{s.description}</p><span className={styles.pill}>{s.action}<ArrowUpRight size={15}/></span></div></Link>)}</div>
  </div>
  <div className={`${styles.wrap} ${styles.benefits}`} aria-label="Why explore with Maldives.org">{benefits.map(b=><div className={styles.benefit} key={b.title}><Symbol kind={b.kind}/><div><strong>{b.title}</strong><span>{b.description}</span></div></div>)}</div>
  <section className={`${styles.wrap} ${styles.islands}`} aria-labelledby="home-islands-title">
   <div className={styles.sectionHead}><h2 id="home-islands-title">Explore the Maldives</h2><Link href="/atolls">View All Islands <ArrowRight size={17}/></Link></div>
   <ul className={styles.islandRail} aria-label="Maldives islands">{islands.map(i=><li key={i.slug}><Link href={`/islands/${i.slug}`} className={styles.island}><span className={styles.islandImage} style={{backgroundImage:`url(/images/home-redesign/islands/${i.slug}.jpg)`}} aria-hidden="true"/><div><h3>{i.name}</h3><p>{i.description}</p></div><span className={styles.islandArrow}><ArrowRight size={17}/></span></Link></li>)}</ul>
   <details className={styles.credits}><summary>Island photo credits</summary><ul>{credits.map(c=><li key={c.slug}><a href={c.source} target="_blank" rel="noopener noreferrer">{islands.find(i=>i.slug===c.slug)?.name}: {c.author}</a> · <a href={c.license_url} target="_blank" rel="noopener noreferrer">{c.license}</a> · cropped for display</li>)}</ul></details>
  </section>
  <div className={styles.wrap}><Link href="/guides" className={styles.guide} aria-label="Read travel guide"><span className={styles.guideImage} aria-hidden="true"/><div className={styles.guideCopy}><span className={styles.kicker}>TRAVEL GUIDE</span><h2>Plan Your Maldives Trip</h2><p>Visa, best time to visit, transport, budget, and essential travel tips<span className={styles.desktopCopy}> for a seamless island vacation</span>.</p></div><span className={styles.guideButton}>Read Travel Guide <ArrowRight size={17}/></span></Link></div>
 </div>;
}

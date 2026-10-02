import Link from "next/link";
import { ContentPage } from "@/components/public-pages";
import { atolls } from "@/lib/data";
export default function AtollsPage() { return <ContentPage eyebrow="ATOLLS & ISLANDS" title="Find the island rhythm that fits." description="North, south, local, remote — start with the shape of a place, then choose the stay and transfer that bring it to life."><div className="atoll-grid">{atolls.map((atoll, index) => <Link key={atoll} href={`/atolls/${atoll.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`} className="atoll-card"><span>0{index + 1}</span><h2>{atoll}</h2><p>{index % 3 === 0 ? "Easy access, reef days and a little more choice." : index % 3 === 1 ? "A slower island pace with water at the centre." : "For travellers who want a little more space."}</p><Arrow /> </Link>)}</div></ContentPage>; }
function Arrow() { return <span className="atoll-arrow">↗</span>; }

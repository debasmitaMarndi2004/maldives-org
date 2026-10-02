import { ContentPage } from "@/components/public-pages";
import { ContactFormLive } from "@/components/contact-form-live";

export default function ContactPage() { return <ContentPage eyebrow="SAY HELLO" title="Tell us what would make your trip easier." description="Questions about an island, a stay or a route? We’ll help you find the next useful step."><div className="detail-card"><ContactFormLive /></div></ContentPage>; }

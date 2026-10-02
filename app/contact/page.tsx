import { ContentPage } from "@/components/public-pages";
import { ContactForm } from "@/components/contact-form";

export default function ContactPage() { return <ContentPage eyebrow="SAY HELLO" title="Tell us what would make your trip easier." description="Questions about an island, a stay or a route? We’ll help you find the next useful step."><div className="detail-card"><ContactForm /></div></ContentPage>; }

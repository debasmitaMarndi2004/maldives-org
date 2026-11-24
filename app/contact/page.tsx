import { ContentPage } from "@/components/public-pages";
import { ContactFormLive } from "@/components/contact-form-live";

export default function ContactPage() { return <ContentPage eyebrow="SAY HELLO" title="Tell us what would make your trip easier." description="The enquiry form is in preview. Use test details to try it."><div className="detail-card"><ContactFormLive /></div></ContentPage>; }

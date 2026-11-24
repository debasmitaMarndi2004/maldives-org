import { ContentPage } from "@/components/public-pages";
const faqs = [
  ["Do you take payment on the website?", "Live booking and payment are currently unavailable."],
  ["Are the listings real?", "The accommodation directory cites official property sources. The site labels any sample listings and prices that are for planning."],
  ["How do I get to a local island?", "Use the transfer finder to compare shared speedboats, private boats and public ferry information. Ask your property or transfer operator to confirm schedules."],
  ["Can I save stays?", "Wishlist controls are available as a local preview."],
];
export default function FAQPage() { return <ContentPage eyebrow="HELPFUL ANSWERS" title="A few useful things to know." description="A short starting point for common questions about stays, transfers and how the directory is being built."><div className="detail-card">{faqs.map(([question, answer]) => <div className="faq-item" key={question}><h3>{question}</h3><p>{answer}</p></div>)}</div></ContentPage>; }

import type { Metadata } from "next";
import { Suspense } from "react";
import "./globals.css";
import { Footer, Navbar } from "@/components/site-shell";
import { ScrollRevealObserver } from "@/components/motion";
import { CurrencyProvider } from "@/components/currency-provider";
import { InitialTravelLoading } from "@/components/initial-travel-loading";
import { NavigationTravelLoading } from "@/components/navigation-travel-loading";
import { TravelLoadingSplash } from "@/components/travel-loading";
import { getPublishedSite } from "@/lib/public-content";

export const metadata: Metadata = {
  title: "Maldives.org — Find your perfect Maldives",
  description: "Discover extraordinary resorts, local islands and unforgettable Maldives experiences.",
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const { footer, pages, homeSections } = await getPublishedSite();
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>
        <TravelLoadingSplash />
        <InitialTravelLoading />
        <Suspense fallback={null}>
          <NavigationTravelLoading />
        </Suspense>
        <div data-site-content>
          <CurrencyProvider>
            <a className="skip-link" href="#main-content">Skip to content</a>
            <Navbar />
            <ScrollRevealObserver />
            <div id="main-content" tabIndex={-1}>{children}</div>
            <Footer copy={footer} links={pages.filter(page => page.footerLink).map(({ slug, title }) => ({ slug, title }))} newsletterVisible={homeSections.some(section => section.key === "newsletter" && section.visible)} />
          </CurrencyProvider>
        </div>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Suspense } from "react";
import "./globals.css";
import { Footer, Navbar } from "@/components/site-shell";
import { ScrollRevealObserver } from "@/components/motion";
import { CurrencyProvider } from "@/components/currency-provider";
import { InitialTravelLoading } from "@/components/initial-travel-loading";
import { NavigationTravelLoading } from "@/components/navigation-travel-loading";
import { TravelLoadingSplash } from "@/components/travel-loading";

export const metadata: Metadata = {
  title: "Maldives.org — Find your perfect Maldives",
  description: "Discover extraordinary resorts, local islands and unforgettable Maldives experiences.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
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
            <Footer />
          </CurrencyProvider>
        </div>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import "./globals.css";
import { Footer, Navbar } from "@/components/site-shell";
import { ScrollRevealObserver } from "@/components/motion";
import { CurrencyProvider } from "@/components/currency-provider";
import { AffiliateProvider } from "@/components/affiliate-provider";
import { TravelpayoutsDrive } from "@/components/travelpayouts-drive";
import { getTravelpayoutsDrivePermissions } from "@/lib/travelpayouts-drive-config";

export const metadata: Metadata = {
  title: "Maldives.org — Find your perfect Maldives",
  description: "Discover extraordinary resorts, local islands and unforgettable Maldives experiences.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" data-scroll-behavior="smooth"><head><TravelpayoutsDrive permissions={getTravelpayoutsDrivePermissions()} /></head><body><CurrencyProvider><AffiliateProvider><a className="skip-link" href="#main-content">Skip to content</a><Navbar /><ScrollRevealObserver /><div id="main-content" tabIndex={-1}>{children}</div><Footer /></AffiliateProvider></CurrencyProvider></body></html>;
}

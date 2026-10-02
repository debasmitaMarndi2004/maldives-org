import type { Metadata } from "next";
import "./globals.css";
import { Footer, Navbar } from "@/components/site-shell";
import { ScrollRevealObserver } from "@/components/motion";
import { CurrencyProvider } from "@/components/currency-provider";

export const metadata: Metadata = {
  title: "Maldives.org — Find your perfect Maldives",
  description: "Discover extraordinary resorts, local islands and unforgettable Maldives experiences.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body><CurrencyProvider><Navbar /><ScrollRevealObserver />{children}<Footer /></CurrencyProvider></body></html>;
}

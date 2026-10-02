import type { Metadata } from "next";
import "./globals.css";
import { Footer, Navbar } from "@/components/site-shell";
import { ScrollRevealObserver } from "@/components/motion";

export const metadata: Metadata = {
  title: "Maldives.org — Find your perfect Maldives",
  description: "Discover extraordinary resorts, local islands and unforgettable Maldives experiences.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body><Navbar /><ScrollRevealObserver />{children}<Footer /></body></html>;
}

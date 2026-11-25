import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Maldives.org Admin",
  description: "Maldives.org staff workspace",
  robots: { index: false, follow: false, noarchive: true },
};

export const dynamic = "force-dynamic";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children;
}

import { notFound } from "next/navigation";
import { TransferDetail, TransfersPage } from "@/components/public-pages";
import { findSampleTransferRoute, sampleTransferRoutes } from "@/lib/transfer-routes";

export const dynamicParams = false;
export function generateStaticParams() {
  return [{ slug: "airport-to-island" }, ...sampleTransferRoutes.map(({ slug }) => ({ slug }))];
}

export default async function TransferDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  // Preserve the previously linked route directory for existing bookmarks.
  if (slug === "airport-to-island") return <TransfersPage />;
  const route = findSampleTransferRoute(slug);
  if (!route) notFound();
  return <TransferDetail route={route} />;
}

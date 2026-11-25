import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ManagedInfoPage } from "@/components/managed-info-page";
import { getPublishedSite } from "@/lib/public-content";

async function getPage(params: Promise<{ slug: string }>) {
  const { slug } = await params;
  const { pages } = await getPublishedSite();
  const page = pages.find(page => page.slug === slug);
  if (!page) notFound();
  return page;
}

export async function generateMetadata({ params }: PageProps<"/pages/[slug]">): Promise<Metadata> {
  const page = await getPage(params);
  return { title: `${page.title} | Maldives.org`, description: page.intro };
}

export default async function PublishedInfoPage({ params }: PageProps<"/pages/[slug]">) {
  return <ManagedInfoPage page={await getPage(params)} />;
}

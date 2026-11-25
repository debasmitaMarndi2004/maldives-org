import "server-only";

import { unstable_cache } from "next/cache";
import { adminDatabase } from "@/lib/admin/database";
import { cache } from "react";
import { siteContentSchema } from "@/lib/admin/content-schema";
import { originalSite } from "@/lib/site-content";

export const publishedSiteTag = "maldives-published-content";

const readPublished = unstable_cache(async () => {
  const result = await adminDatabase().query<{ content: unknown }>(
    `SELECT r.content FROM maldives_admin_workspace w JOIN maldives_admin_revision r
     ON r.id = w.published_id AND r.scope = w.scope WHERE w.scope = 'site'`,
  );
  return result.rows[0] ? siteContentSchema.parse(result.rows[0].content) : originalSite;
}, [publishedSiteTag], { tags: [publishedSiteTag], revalidate: 60 });

export const getPublishedSite = cache(async () => {
  if (!process.env.ADMIN_DATABASE_URL) return originalSite;
  try {
    return await readPublished();
  } catch {
    return originalSite;
  }
});

import type { ApprovedAffiliateLink } from "../../lib/affiliate-providers";

/**
 * Synthetic local test fixtures only, never production partner approvals.
 * These public homepages use generic campaign values, not affiliate credentials
 * or tracking IDs. Redirect tests inspect Location and never follow the URLs.
 */
export const approvedAffiliateFixtures: ApprovedAffiliateLink[] = [
  {
    provider: "travelpayouts",
    productType: "stay",
    slug: "overwater-romance",
    approved: true,
    url: "https://www.travelpayouts.com/?utm_source=local-regression&utm_campaign=namescon-test",
  },
  {
    provider: "viator",
    productType: "experience",
    slug: "dive-with-manta-rays",
    approved: true,
    url: "https://www.viator.com/?utm_source=local-regression&utm_campaign=namescon-test&utm_content=a%2Bb&tag=one&tag=two",
  },
  {
    provider: "booking-com",
    productType: "stay",
    slug: "private-island-luxury",
    approved: true,
    url: "https://www.booking.com/?utm_source=local-regression&utm_campaign=namescon-test",
  },
  {
    provider: "getyourguide",
    productType: "experience",
    slug: "sunset-cruise",
    approved: true,
    url: "https://www.getyourguide.com/?utm_source=local-regression&utm_campaign=namescon-test",
  },
];

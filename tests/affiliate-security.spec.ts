import { expect, test } from "@playwright/test";
import { affiliateHandoffPath, isApprovedDestination, parseApprovedLinks } from "../lib/affiliate-providers";
import { approvedAffiliateFixtures } from "./fixtures/affiliate-links";

const viator = approvedAffiliateFixtures.find((entry) => entry.provider === "viator")!;
const knownProducts = new Set(approvedAffiliateFixtures.map((entry) => `${entry.productType}:${entry.slug}`));

test("unconfigured, unapproved and malformed affiliate records fail closed", () => {
  expect(parseApprovedLinks(undefined)).toEqual({ status: "unconfigured", links: [] });
  expect(parseApprovedLinks("[]")).toEqual({ status: "unconfigured", links: [] });
  for (const raw of ["not-json", "{}", JSON.stringify([{ ...viator, approved: false }]), JSON.stringify([{ ...viator, slug: "not-a-known-product" }]), JSON.stringify([viator, viator]), JSON.stringify([{ ...viator, provider: "unknown" }]), JSON.stringify([{ ...viator, apiKey: "not-a-real-key" }])]) {
    expect(parseApprovedLinks(raw, knownProducts)).toEqual({ status: "invalid", links: [] });
  }
  expect(parseApprovedLinks(JSON.stringify([{ ...viator, productType: "stay" }]))).toEqual({ status: "invalid", links: [] });
});

test("destination validation rejects unsafe schemes, host tricks and redirect parameters", () => {
  for (const url of [
    "javascript:alert(1)", "data:text/html,test", "http://www.viator.com/", "//www.viator.com/",
    "https://www.viator.com.evil.example/", "https://evil.example/?host=www.viator.com",
    "https://www.viator.com@evil.example/", "https://user:pass@www.viator.com/",
    "https://www.viator.com:443/", "https://www.viator.com:8443/", "https://www.viator.com\\@evil.example/",
    "https://www.viator.com/%0d%0aLocation:evil", "https://www.viator.com/?redirect=https%3A%2F%2Fevil.example",
    "https://www.viator.com/?next=%2F%2Fevil.example", "https://www.viator.com/redirect/evil",
  ]) expect(isApprovedDestination("viator", url), url).toBe(false);
  expect(isApprovedDestination("viator", viator.url)).toBe(true);
});

test("approved handoffs preserve attribution without following the external destination", async ({ request }) => {
  for (const fixture of approvedAffiliateFixtures) {
    const path = affiliateHandoffPath(fixture);
    const response = await request.get(path, { maxRedirects: 0 });
    expect([302, 303, 307]).toContain(response.status());
    expect(response.headers().location).toBe(fixture.url);
    expect(response.headers()["cache-control"]).toContain("no-store");
  }
});

test("public redirect endpoint rejects arbitrary destinations and unconfigured listings", async ({ request }) => {
  for (const path of [
    "/out/viator/experience%3Adive-with-manta-rays?url=https://evil.example",
    "/out/viator/experience%3Adive-with-manta-rays?utm_source=caller",
    "/out/unknown/experience%3Adive-with-manta-rays",
    "/out/viator/experience%3Anot-a-known-product",
    "/out/booking-com/stay%3Acoral-garden-house",
  ]) {
    const response = await request.get(path, { maxRedirects: 0 });
    expect([400, 404, 503]).toContain(response.status());
    expect(response.headers().location).toBeUndefined();
  }
});

test("catalog exposes provider labels and safe internal handoffs, not approved raw URLs", async ({ request }) => {
  const response = await request.get("/api/affiliates");
  expect(response.status()).toBe(200);
  const catalog = await response.json();
  expect(catalog.providers.map((provider: { label: string }) => provider.label)).toEqual(["Travelpayouts", "Viator", "Booking.com", "GetYourGuide"]);
  expect(catalog.offers).toHaveLength(approvedAffiliateFixtures.length);
  for (const offer of catalog.offers) {
    expect(offer.href).toMatch(/^\/out\//);
    expect(offer.url).toBeUndefined();
  }
});

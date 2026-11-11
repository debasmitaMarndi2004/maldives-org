import { expect, test } from "@playwright/test";
import { isCalendarDate, isValidDateRange } from "../lib/calendar-date";
import { POST as createBookingRequest } from "../app/api/booking-requests/route";
import { POST as searchHotels } from "../app/api/hotelbeds/search/route";
import { hotelbedsRequest } from "../lib/hotelbeds";
import { allowRequest } from "../lib/rate-limit";

/** Never inherit real service access, even if a validation regression occurs. */
async function withIsolatedServices<T>(run: (networkAttempts: () => number) => Promise<T>): Promise<T> {
  const names = ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY", "SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY", "SUPABASE_SECRET_KEY", "RESEND_API_KEY", "RESEND_FROM_EMAIL", "ADMIN_NOTIFICATION_EMAIL", "HOTELBEDS_HOTEL_API_KEY", "HOTELBEDS_HOTEL_SECRET", "HOTELBEDS_ENVIRONMENT", "HOTELBEDS_MALDIVES_HOTEL_CODES", "HOTELBEDS_MTLS_CERT_BASE64", "HOTELBEDS_MTLS_KEY_BASE64", "HOTELBEDS_MTLS_CA_BASE64"];
  const saved = new Map(names.map((name) => [name, process.env[name]]));
  const originalFetch = globalThis.fetch;
  let attempts = 0;
  names.forEach((name) => { process.env[name] = ""; });
  process.env.HOTELBEDS_MALDIVES_HOTEL_CODES = "123";
  process.env.HOTELBEDS_HOTEL_API_KEY = "synthetic-local-test";
  process.env.HOTELBEDS_HOTEL_SECRET = "synthetic-local-test";
  process.env.HOTELBEDS_ENVIRONMENT = "test";
  globalThis.fetch = async () => { attempts++; throw new Error("External calls are blocked in this isolated test."); };
  try { return await run(() => attempts); }
  finally {
    globalThis.fetch = originalFetch;
    names.forEach((name) => {
      const value = saved.get(name);
      if (value === undefined) delete process.env[name]; else process.env[name] = value;
    });
  }
}

test("strict dates accept actual leap days and reject normalized or invalid calendars", () => {
  for (const value of ["2028-02-29", "2000-02-29", "2027-12-31", "0001-01-01"]) expect(isCalendarDate(value), value).toBe(true);
  for (const value of ["2027-02-29", "1900-02-29", "2027-02-30", "2027-04-31", "2027-99-01", "2027-01-00", "0000-01-01", "2027-1-01", "2027-01-01T00:00:00Z", " 2027-01-01", null, 20270101]) expect(isCalendarDate(value), String(value)).toBe(false);
  expect(isValidDateRange("2028-02-29", "2028-03-01")).toBe(true);
  expect(isValidDateRange("2028-02-29", "2028-02-29")).toBe(false);
  expect(isValidDateRange("2028-03-01", "2028-02-29")).toBe(false);
});

test("booking requests reject impossible dates before contacting any services", async () => {
  await withIsolatedServices(async (networkAttempts) => {
    for (const dates of [
      { checkIn: "2027-99-01", checkOut: "2027-99-02" },
      { checkIn: "2027-02-30", checkOut: "2027-03-05" },
      { checkIn: "2028-02-29", checkOut: "2028-02-29" },
      { offerType: "experience", activityDate: "2027-02-31" },
    ]) {
      const response = await createBookingRequest(new Request("http://local.test/api/booking-requests", {
        method: "POST", headers: { "Content-Type": "application/json", "x-forwarded-for": "synthetic-calendar-validation" },
        body: JSON.stringify({ travelerName: "Synthetic local test", travelerEmail: "qa@example.test", guests: 1, ...dates }),
      }));
      expect(response.status).toBe(400);
    }
    const response = await createBookingRequest(new Request("http://local.test/api/booking-requests", {
      method: "POST", headers: { "Content-Type": "application/json", "x-forwarded-for": "synthetic-calendar-validation" },
      body: JSON.stringify({ travelerName: "Synthetic local test", travelerEmail: "qa@example.test", guests: 1, checkIn: "2028-02-29", checkOut: "2028-03-01" }),
    }));
    expect(response.status).toBe(202);
    expect((await response.json()).mode).toBe("preview");
    expect(networkAttempts()).toBe(0);
  });
});

test("Hotelbeds search rejects invalid or reversed dates before supplier access", async () => {
  await withIsolatedServices(async (networkAttempts) => {
    for (const [checkIn, checkOut] of [["2027-02-30", "2027-03-05"], ["2027-99-01", "2027-99-02"], ["2027-03-05", "2027-03-01"]]) {
      const response = await searchHotels(new Request("http://local.test/api/hotelbeds/search", { method: "POST", body: JSON.stringify({ checkIn, checkOut, adults: 2, children: 0, rooms: 1, hotelCodes: [123] }) }));
      expect(response.status).toBe(400);
    }
    expect(networkAttempts()).toBe(0);
  });
});

test("Hotelbeds timeout includes a stalled response body, not just response headers", async () => {
  await withIsolatedServices(async () => {
    const realSetTimeout = globalThis.setTimeout, realClearTimeout = globalThis.clearTimeout;
    const marker = {} as ReturnType<typeof setTimeout>;
    let abort: (() => void) | undefined, cleared = false, bodyStarted = false;
    globalThis.setTimeout = ((callback: () => void, delay?: number, ...args: unknown[]) => {
      if (delay === 20_000) { abort = callback; return marker; }
      return realSetTimeout(callback, delay, ...args);
    }) as typeof setTimeout;
    globalThis.clearTimeout = ((timer) => {
      if (timer === marker) { cleared = true; return; }
      return realClearTimeout(timer);
    }) as typeof clearTimeout;
    globalThis.fetch = async (_url, init) => ({
      text: () => {
        bodyStarted = true;
        return new Promise<string>((_resolve, reject) => init?.signal?.addEventListener("abort", () => reject(new DOMException("Synthetic stalled body aborted", "AbortError")), { once: true }));
      },
    }) as Response;
    const pending = hotelbedsRequest("/hotel-api/1.0/status");
    try {
      await Promise.resolve();
      const clearedBeforeBodyFinished = cleared;
      abort?.();
      let failure: unknown;
      try { await pending; } catch (error) { failure = error; }
      expect(failure).toMatchObject({ name: "AbortError" });
      expect(bodyStarted).toBe(true);
      expect(clearedBeforeBodyFinished).toBe(false);
      expect(cleared).toBe(true);
    } finally {
      abort?.();
      globalThis.setTimeout = realSetTimeout;
      globalThis.clearTimeout = realClearTimeout;
    }
  });
});

test("rate limiter reclaims expired clients and preserves active budgets", () => {
  const originalNow = Date.now, originalDelete = Map.prototype.delete;
  let now = 2_000_000_000_000;
  const expiredKey = "synthetic-expired-rate-client", activeKey = "synthetic-active-rate-client";
  const deleted: unknown[] = [];
  Date.now = () => now;
  Map.prototype.delete = function (key) { deleted.push(key); return originalDelete.call(this, key); };
  try {
    expect(allowRequest(expiredKey, 1, 1_000)).toBe(true);
    expect(allowRequest(expiredKey, 1, 1_000)).toBe(false);
    expect(allowRequest(activeKey, 2, 120_000)).toBe(true);
    now += 60_001;
    expect(allowRequest(activeKey, 2, 120_000)).toBe(true);
    expect(allowRequest(activeKey, 2, 120_000)).toBe(false);
    expect(deleted).toContain(expiredKey);
    expect(deleted).not.toContain(activeKey);
    expect(allowRequest(expiredKey, 1, 1_000)).toBe(true);
  } finally {
    Date.now = originalNow;
    Map.prototype.delete = originalDelete;
  }
});

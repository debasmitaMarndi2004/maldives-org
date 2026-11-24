import { expect, test } from "@playwright/test";
import { isCalendarDate, isValidDateRange } from "../lib/calendar-date";
import { POST as createBookingRequest } from "../app/api/booking-requests/route";
import { allowRequest } from "../lib/rate-limit";

test("strict dates accept actual leap days and reject normalized or invalid calendars", () => {
  for (const value of ["2028-02-29", "2000-02-29", "2027-12-31", "0001-01-01"]) expect(isCalendarDate(value), value).toBe(true);
  for (const value of ["2027-02-29", "1900-02-29", "2027-02-30", "2027-04-31", "2027-99-01", "2027-01-00", "0000-01-01", "2027-1-01", "2027-01-01T00:00:00Z", " 2027-01-01", null, 20270101]) expect(isCalendarDate(value), String(value)).toBe(false);
  expect(isValidDateRange("2028-02-29", "2028-03-01")).toBe(true);
  expect(isValidDateRange("2028-02-29", "2028-02-29")).toBe(false);
  expect(isValidDateRange("2028-03-01", "2028-02-29")).toBe(false);
});

test("booking requests reject impossible dates and accept valid preview details", async () => {
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

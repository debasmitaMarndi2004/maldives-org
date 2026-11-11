/** Strict calendar dates, not merely strings that resemble an ISO date. */
export function isCalendarDate(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value) || value.startsWith("0000-")) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

/** Does not impose a new past/future booking policy. */
export function isValidDateRange(checkIn: unknown, checkOut: unknown): boolean {
  return isCalendarDate(checkIn) && isCalendarDate(checkOut) && checkOut > checkIn;
}

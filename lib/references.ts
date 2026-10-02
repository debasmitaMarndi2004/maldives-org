import { randomBytes } from "node:crypto";

export function createBookingReference(prefix = "MD") {
  return `${prefix}-${Date.now().toString(36).toUpperCase()}-${randomBytes(3).toString("hex").toUpperCase()}`;
}

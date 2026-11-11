const windows = new Map<string, { count: number; resetAt: number }>();
let nextCleanupAt = 0;
const cleanupIntervalMs = 60_000;

export function allowRequest(key: string, limit = 8, windowMs = 60_000) {
  const now = Date.now();
  // Reclaim expired keys during later traffic instead of retaining every client
  // ever seen by a long-lived process. Active request budgets stay unchanged.
  if (now >= nextCleanupAt) {
    windows.forEach((entry, candidate) => {
      if (entry.resetAt <= now) windows.delete(candidate);
    });
    nextCleanupAt = now + cleanupIntervalMs;
  }
  const current = windows.get(key);
  if (!current || current.resetAt <= now) {
    windows.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (current.count >= limit) return false;
  current.count += 1;
  return true;
}

export function requestKey(request: Request) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}

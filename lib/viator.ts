type ViatorEnvironment = "sandbox" | "production";

function getViatorEnvironment(): ViatorEnvironment {
  const value = process.env.VIATOR_API_ENVIRONMENT?.toLowerCase();
  return value === "production" || value === "live" ? "production" : "sandbox";
}

export function getViatorConfig() {
  const apiKey = process.env.VIATOR_API_KEY;
  if (!apiKey) throw new Error("VIATOR_API_KEY is not configured.");

  const environment = getViatorEnvironment();
  return {
    apiKey,
    environment,
    baseUrl:
      environment === "production"
        ? "https://api.viator.com"
        : "https://api.sandbox.viator.com",
  } as const;
}

export async function viatorRequest<T>(path: string, init: RequestInit = {}) {
  const config = getViatorConfig();
  const headers = new Headers(init.headers);
  headers.set("exp-api-key", config.apiKey);
  headers.set("Accept", "application/json;version=2.0");
  headers.set("Accept-Language", "en-US");
  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15_000);
  try {
    const response = await fetch(`${config.baseUrl}${path}`, {
      ...init,
      headers,
      signal: controller.signal,
      cache: "no-store",
    });
    const rawBody = await response.text();
    let data: T | null = null;
    if (rawBody) {
      try {
        data = JSON.parse(rawBody) as T;
      } catch {
        data = null;
      }
    }
    return { response, data, environment: config.environment };
  } finally {
    clearTimeout(timeout);
  }
}

import { exchangeRateSnapshot, fallbackRateSnapshot } from "@/lib/currency";

export const revalidate = 3600;

export async function GET() {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8_000);
  try {
    const response = await fetch("https://open.er-api.com/v6/latest/USD", {
      next: { revalidate },
      signal: controller.signal,
    });
    if (!response.ok) {
      throw new Error("Exchange-rate service returned an invalid response.");
    }
    return Response.json(exchangeRateSnapshot(await response.json()));
  } catch {
    return Response.json(fallbackRateSnapshot());
  } finally {
    clearTimeout(timeout);
  }
}

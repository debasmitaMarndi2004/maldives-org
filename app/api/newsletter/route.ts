import { allowRequest, requestKey } from "@/lib/rate-limit";

export async function POST(request: Request) {
  if (!allowRequest(`newsletter:${requestKey(request)}`)) {
    return Response.json({ ok: false, message: "Too many requests. Please try again shortly." }, { status: 429 });
  }

  try {
    const body = (await request.json()) as Record<string, unknown>;
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return Response.json({ ok: false, message: "Enter a valid email address." }, { status: 400 });
    }

    return Response.json({ ok: true, mode: "preview" }, { status: 202 });
  } catch {
    return Response.json({ ok: false, message: "Invalid request." }, { status: 400 });
  }
}

import { createHash } from "node:crypto";

export type HotelbedsProduct = "hotel" | "activities" | "transfers";

type HotelbedsConfig = {
  apiKey: string;
  secret: string;
  baseUrl: string;
  environment: "test" | "production";
};

type HotelbedsResponse<T> = {
  response: Response;
  data: T | null;
};

export type HotelbedsSearchInput = {
  checkIn: string;
  checkOut: string;
  adults: number;
  children?: number;
  rooms?: number;
  hotelCodes: number[];
};

const productEnv = {
  hotel: {
    apiKey: "HOTELBEDS_HOTEL_API_KEY",
    secret: "HOTELBEDS_HOTEL_SECRET",
  },
  activities: {
    apiKey: "HOTELBEDS_ACTIVITIES_API_KEY",
    secret: "HOTELBEDS_ACTIVITIES_SECRET",
  },
  transfers: {
    apiKey: "HOTELBEDS_TRANSFERS_API_KEY",
    secret: "HOTELBEDS_TRANSFERS_SECRET",
  },
} as const;

function isProductionEnvironment() {
  const environment = process.env.HOTELBEDS_ENVIRONMENT?.toLowerCase();
  return environment === "production" || environment === "live";
}

export function getHotelbedsConfig(product: HotelbedsProduct = "hotel"): HotelbedsConfig {
  const envNames = productEnv[product];
  const apiKey = process.env[envNames.apiKey];
  const secret = process.env[envNames.secret];

  if (!apiKey || !secret) {
    throw new Error(
      `Hotelbeds ${product} credentials are missing. Set ${envNames.apiKey} and ${envNames.secret}.`,
    );
  }

  const environment = isProductionEnvironment() ? "production" : "test";

  return {
    apiKey,
    secret,
    environment,
    baseUrl:
      environment === "production"
        ? "https://api.hotelbeds.com"
        : "https://api.test.hotelbeds.com",
  };
}

export function createHotelbedsSignature(
  apiKey: string,
  secret: string,
  timestamp = Math.floor(Date.now() / 1000),
) {
  return createHash("sha256")
    .update(`${apiKey}${secret}${timestamp}`)
    .digest("hex");
}

export async function hotelbedsRequest<T>(
  path: string,
  init: RequestInit = {},
  product: HotelbedsProduct = "hotel",
): Promise<HotelbedsResponse<T>> {
  const config = getHotelbedsConfig(product);
  const headers = new Headers(init.headers);
  headers.set("Api-key", config.apiKey);
  headers.set(
    "X-Signature",
    createHotelbedsSignature(config.apiKey, config.secret),
  );
  headers.set("Accept", "application/json");

  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${config.baseUrl}${path}`, {
    ...init,
    headers,
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

  return { response, data };
}

export function getConfiguredHotelCodes() {
  return (process.env.HOTELBEDS_MALDIVES_HOTEL_CODES ?? "")
    .split(",")
    .map((value) => Number(value.trim()))
    .filter((value) => Number.isInteger(value) && value > 0);
}

export async function searchHotelAvailability(input: HotelbedsSearchInput) {
  return hotelbedsRequest<unknown>(
    "/hotel-api/1.0/hotels",
    {
      method: "POST",
      body: JSON.stringify({
        stay: {
          checkIn: input.checkIn,
          checkOut: input.checkOut,
        },
        occupancies: [
          {
            rooms: input.rooms ?? 1,
            adults: input.adults,
            children: input.children ?? 0,
          },
        ],
        hotels: {
          hotel: input.hotelCodes,
        },
      }),
    },
    "hotel",
  );
}

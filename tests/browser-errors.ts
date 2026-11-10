import type { Page } from "@playwright/test";

/** Keep application/runtime errors visible; separately record blocked media and the flight widget. */
export function captureApplicationErrors(page: Page) {
  const errors: string[] = [];
  const unavailableMedia: string[] = [];
  const unavailablePartnerScripts: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() !== "error") return;
    const source = message.location().url;
    const isRemoteImage = source.startsWith("https://images.unsplash.com/");
    const isNetworkFailure = /Failed to load resource: net::ERR_(?:TUNNEL_CONNECTION_FAILED|FAILED|CONNECTION_CLOSED|CONNECTION_RESET)/.test(message.text());
    if (isRemoteImage && isNetworkFailure) unavailableMedia.push(source);
    else if (source.startsWith("https://tpscr.com/content?") && isNetworkFailure) unavailablePartnerScripts.push(source);
    else errors.push(`${message.text()} (${source})`);
  });
  return { errors, unavailableMedia, unavailablePartnerScripts };
}

"use client";

import { useEffect, useRef } from "react";

const FALLBACK = "/images/island-fallback.svg";
// The homepage hero must retain its original photograph and crop, even when
// that external host is unavailable. Fallback artwork is for listing media.
const BACKGROUNDS = ".stay-image, .escape-card, .experience-tile, .detail-hero-image, .article-image, .deal-card, .compare-thumb, .booking-summary-image";
const probes = new Map<string, Promise<boolean>>();

// CSS backgrounds have no error event. Probe each unique URL once per session;
// normal browser caching coalesces the request with its CSS image request.
function imageAvailable(url: string): Promise<boolean> {
  const cached = probes.get(url);
  if (cached) return cached;

  const result = new Promise<boolean>((resolve) => {
    const image = new Image();
    let settled = false;
    const finish = (available: boolean) => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timeout);
      image.onload = null;
      image.onerror = null;
      resolve(available);
    };
    const timeout = window.setTimeout(() => finish(false), 10_000);
    image.onload = () => finish(true);
    image.onerror = () => finish(false);
    image.src = url;
    if (image.complete) finish(image.naturalWidth > 0);
  });

  // Avoid unbounded growth if future listings use a large number of photos.
  if (probes.size >= 128) probes.delete(probes.keys().next().value!);
  probes.set(url, result);
  return result;
}

function backgroundUrls(value: string): string[] {
  return Array.from(value.matchAll(/url\((?:"([^"]*)"|'([^']*)'|([^)]*))\)/g), (match) => match[1] ?? match[2] ?? match[3].trim());
}

/**
 * Place last inside a media-owning main/container in its client boundary.
 * Its effect only runs after that boundary hydrates, and never mutates siblings
 * in other boundaries that React may still be selectively hydrating.
 */
export function MediaFallback() {
  const marker = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const root = marker.current?.parentElement;
    if (!root) return;

    let disposed = false;
    const inspected = new WeakMap<HTMLElement, string>();

    const inspectBackground = (element: HTMLElement) => {
      const signature = `${element.getAttribute("style") ?? ""}|${element.className}`;
      if (inspected.get(element) === signature) return;
      inspected.set(element, signature);
      delete element.dataset.mediaState;

      const value = getComputedStyle(element, element.matches(".escape-card") ? "::before" : null).backgroundImage;
      const urls = backgroundUrls(value).filter((url) => {
        try {
          const parsed = new URL(url, document.baseURI);
          return ["http:", "https:"].includes(parsed.protocol) && parsed.pathname !== FALLBACK;
        } catch {
          return false;
        }
      });
      if (!urls.length) return;

      element.dataset.mediaState = "loading";
      void Promise.all(urls.map(imageAvailable)).then((available) => {
        if (disposed || !element.isConnected || inspected.get(element) !== signature) return;
        element.dataset.mediaState = available.every(Boolean) ? "ready" : "fallback";
      });
    };

    const fallbackImage = (image: HTMLImageElement) => {
      if (image.dataset.mediaState === "fallback") return;
      image.dataset.mediaState = "fallback";
      image.dataset.originalSrc = image.getAttribute("src") ?? "";
      if (image.hasAttribute("srcset")) {
        image.dataset.originalSrcset = image.getAttribute("srcset") ?? "";
        image.removeAttribute("srcset");
      }
      if (image.alt) {
        image.dataset.originalAlt = image.alt;
        image.alt = `Illustration placeholder: ${image.alt}`;
      }
      image.src = FALLBACK;
    };

    const scan = (root: ParentNode) => {
      if (root instanceof HTMLElement && root.matches(BACKGROUNDS)) inspectBackground(root);
      root.querySelectorAll<HTMLElement>(BACKGROUNDS).forEach(inspectBackground);
      const images = root instanceof HTMLImageElement ? [root] : root.querySelectorAll<HTMLImageElement>("img");
      images.forEach((image) => {
        if (image.complete && image.naturalWidth === 0) fallbackImage(image);
      });
    };

    const onImageError = (event: Event) => {
      if (event.target instanceof HTMLImageElement) fallbackImage(event.target);
    };
    root.addEventListener("error", onImageError, true);
    scan(root);

    // Route changes and updated listing images are inspected without rescanning
    // the whole document on scroll or observing our own data attributes.
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === "attributes" && mutation.target instanceof HTMLElement) scan(mutation.target);
        mutation.addedNodes.forEach((node) => {
          if (node instanceof HTMLElement) scan(node);
        });
      }
    });
    observer.observe(root, { childList: true, subtree: true, attributes: true, attributeFilter: ["style", "src", "srcset"] });

    return () => {
      disposed = true;
      observer.disconnect();
      root.removeEventListener("error", onImageError, true);
    };
  }, []);

  return <span ref={marker} hidden aria-hidden="true" data-media-observer />;
}

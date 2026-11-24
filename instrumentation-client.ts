import { navigationStartEvent } from "@/lib/navigation-feedback";

export function onRouterTransitionStart(url: string) {
  window.dispatchEvent(new CustomEvent(navigationStartEvent, { detail: url }));
}

"use client";

import { useSyncExternalStore } from "react";
import { TravelLoadingSignal } from "./travel-loading";

function subscribe(onReady: () => void) {
  document.addEventListener("DOMContentLoaded", onReady);

  return () => document.removeEventListener("DOMContentLoaded", onReady);
}

const documentReady = () => document.readyState !== "loading";
const serverSnapshot = () => false;

export function InitialTravelLoading() {
  const ready = useSyncExternalStore(subscribe, documentReady, serverSnapshot);

  return ready ? null : <TravelLoadingSignal scope="initial" />;
}

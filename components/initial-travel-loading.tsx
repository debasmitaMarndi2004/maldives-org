"use client";

import { useSyncExternalStore } from "react";
import { TravelLoading } from "./travel-loading";

const subscribe = () => () => {};
const clientSnapshot = () => true;
const serverSnapshot = () => false;

export function InitialTravelLoading() {
  const hydrated = useSyncExternalStore(subscribe, clientSnapshot, serverSnapshot);

  return hydrated ? null : <TravelLoading placement="initial" />;
}

"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { navigationStartEvent } from "@/lib/navigation-feedback";
import { TravelLoading } from "./travel-loading";

function NavigationStatus({ page }: { page: string }) {
  const [pending, setPending] = useState(false);

  useEffect(() => {
    let showTimer: number | undefined;
    let resetTimer: number | undefined;

    function clearTimers() {
      window.clearTimeout(showTimer);
      window.clearTimeout(resetTimer);
    }

    function handleStart(event: Event) {
      clearTimers();
      const destination = new URL((event as CustomEvent<string>).detail, window.location.href);
      const nextPage = `${destination.pathname}?${destination.searchParams.toString()}`;
      if (destination.origin !== window.location.origin || nextPage === page) {
        setPending(false);
        return;
      }

      // Update outside the router's React transition so the status can appear
      // before an uncached route commits.
      showTimer = window.setTimeout(() => setPending(true), 180);
      resetTimer = window.setTimeout(() => setPending(false), 30_000);
    }

    window.addEventListener(navigationStartEvent, handleStart);
    return () => {
      clearTimers();
      window.removeEventListener(navigationStartEvent, handleStart);
    };
  }, [page]);

  return pending ? <TravelLoading placement="navigation" /> : null;
}

export function NavigationTravelLoading() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const page = `${pathname}?${searchParams.toString()}`;

  return <NavigationStatus key={page} page={page} />;
}

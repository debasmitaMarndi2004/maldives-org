"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { navigationStartEvent } from "@/lib/navigation-feedback";
import { TravelLoadingSignal } from "./travel-loading";

function NavigationStatus({ page }: { page: string }) {
  const [pending, setPending] = useState(false);

  useEffect(() => {
    let showTimer: number | undefined;

    function handleStart(event: Event) {
      window.clearTimeout(showTimer);
      const destination = new URL((event as CustomEvent<string>).detail, window.location.href);
      const nextPage = `${destination.pathname}?${destination.searchParams.toString()}`;
      if (destination.origin !== window.location.origin || nextPage === page) {
        setPending(false);
        return;
      }

      // Update outside the router's React transition so the status can appear
      // before an uncached route commits.
      showTimer = window.setTimeout(() => setPending(true), 180);
    }

    window.addEventListener(navigationStartEvent, handleStart);
    return () => {
      window.clearTimeout(showTimer);
      window.removeEventListener(navigationStartEvent, handleStart);
    };
  }, [page]);

  return pending ? <TravelLoadingSignal scope="navigation" /> : null;
}

export function NavigationTravelLoading() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const page = `${pathname}?${searchParams.toString()}`;

  return <NavigationStatus key={page} page={page} />;
}

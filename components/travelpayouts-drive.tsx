"use client";

import Script from "next/script";
import { canLoadTravelpayoutsDrive, TRAVELPAYOUTS_DRIVE_BOOTSTRAP, TRAVELPAYOUTS_DRIVE_ID, type DrivePermissions } from "@/lib/travelpayouts-drive";

const dashboardAttributes = {
  nowprocket: "",
  "data-noptimize": "1",
  "data-cfasync": "false",
  "data-wpfc-render": "false",
  "seraph-accel-crit": "1",
  "data-no-defer": "1",
  "data-cmp-ab": "2",
};

/** Owner-enabled, loaded once by Next.js after hydration; false disables it. */
export function TravelpayoutsDrive({ permissions }: { permissions: DrivePermissions }) {
  if (!canLoadTravelpayoutsDrive(permissions)) return null;

  return <Script
    id={TRAVELPAYOUTS_DRIVE_ID}
    strategy="afterInteractive"
    {...dashboardAttributes}
  >{TRAVELPAYOUTS_DRIVE_BOOTSTRAP}</Script>;
}

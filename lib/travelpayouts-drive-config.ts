import "server-only";

import type { DrivePermissions } from "@/lib/travelpayouts-drive";

/**
 * Verification is blocked by Cloud proxy HTTP 403. These are deliberately
 * code-review gates, not environment flags that could silently authorize code.
 * A real consent-manager integration is required before consent can be granted.
 */
export function getTravelpayoutsDrivePermissions(): DrivePermissions {
  return {
    enabled: process.env.TRAVELPAYOUTS_DRIVE_ENABLED === "true",
    sourceVerified: false,
    attributionProtectionVerified: false,
    privacyReviewed: false,
    consentGranted: false,
  };
}

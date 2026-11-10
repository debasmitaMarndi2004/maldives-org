import "server-only";

import { isTravelpayoutsDriveEnabled, type DrivePermissions } from "@/lib/travelpayouts-drive";

/**
 * The site owner explicitly authorized activation. This is an operator switch,
 * not a claim of vendor verification, privacy review or visitor consent.
 * Official documentation remains inaccessible through the Cloud proxy.
 */
export function getTravelpayoutsDrivePermissions(): DrivePermissions {
  return {
    enabled: isTravelpayoutsDriveEnabled(process.env.TRAVELPAYOUTS_DRIVE_ENABLED),
  };
}

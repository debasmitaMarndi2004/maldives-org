/** Public dashboard installation details, not private API credentials. */
export const TRAVELPAYOUTS_DRIVE_SOURCE = "https://emrldco.com/NTk4NDE3.js?t=598417";
export const TRAVELPAYOUTS_DRIVE_ID = "maldives-travelpayouts-drive";

export type DrivePermissions = {
  enabled: boolean;
};

export function canLoadTravelpayoutsDrive(permissions: DrivePermissions): boolean {
  return permissions.enabled === true;
}

/** Owner-approved default; explicit false or an invalid value disables loading. */
export function isTravelpayoutsDriveEnabled(value: string | undefined): boolean {
  return value === undefined || value === "true";
}

// Dashboard bootstrap, with only a fixed element ID/duplicate guard added.
// Do not accept a script URL, campaign ID or enable switch from request data.
export const TRAVELPAYOUTS_DRIVE_BOOTSTRAP = `(function () {
  if (document.getElementById("${TRAVELPAYOUTS_DRIVE_ID}-source") ||
      Array.prototype.some.call(document.scripts, function (existing) {
        return existing.src === "${TRAVELPAYOUTS_DRIVE_SOURCE}";
      })) return;
  var script = document.createElement("script");
  script.id = "${TRAVELPAYOUTS_DRIVE_ID}-source";
  script.async = 1;
  script.setAttribute("data-cmp-ab", "2");
  script.src = "${TRAVELPAYOUTS_DRIVE_SOURCE}";
  document.head.appendChild(script);
})();`;

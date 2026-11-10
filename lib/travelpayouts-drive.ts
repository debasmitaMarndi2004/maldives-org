/** Public dashboard installation details, not private API credentials. */
export const TRAVELPAYOUTS_DRIVE_SOURCE = "https://emrldco.com/NTk4NDE3.js?t=598417";
export const TRAVELPAYOUTS_DRIVE_ID = "maldives-travelpayouts-drive";

export type DrivePermissions = {
  enabled: boolean;
  sourceVerified: boolean;
  attributionProtectionVerified: boolean;
  privacyReviewed: boolean;
  consentGranted: boolean;
};

export function canLoadTravelpayoutsDrive(permissions: DrivePermissions): boolean {
  return permissions.enabled === true && permissions.sourceVerified === true &&
    permissions.attributionProtectionVerified === true && permissions.privacyReviewed === true &&
    permissions.consentGranted === true;
}

// Dashboard bootstrap, with only a fixed element ID/duplicate guard added.
// Do not accept a script URL, campaign ID or enable switch from request data.
export const TRAVELPAYOUTS_DRIVE_BOOTSTRAP = `(function () {
  if (document.getElementById("${TRAVELPAYOUTS_DRIVE_ID}-source")) return;
  var script = document.createElement("script");
  script.id = "${TRAVELPAYOUTS_DRIVE_ID}-source";
  script.async = 1;
  script.setAttribute("data-cmp-ab", "2");
  script.src = "${TRAVELPAYOUTS_DRIVE_SOURCE}";
  document.head.appendChild(script);
})();`;

import { sourceDescriptions, sourceLabels, type InventorySource } from "@/lib/api-contracts";

export function SourceBadge({ source = "sample" }: { source?: InventorySource }) {
  return <span className={`source-badge source-${source}`}><span className="source-dot" />{sourceLabels[source]}</span>;
}

export function AvailabilityNotice({ source = "sample" }: { source?: InventorySource }) {
  return <div className="availability-notice"><strong>{source === "sample" ? "Partner-ready preview" : "Availability checked"}</strong><span>{sourceDescriptions[source]}</span></div>;
}

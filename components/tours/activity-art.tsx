/** Original image atlas: two columns × three rows; SVG crops without distortion. */
export function ActivityArt({ tile, className, label }: { tile: number; className?: string; label?: string }) {
  const row = Math.floor(tile / 2), column = tile % 2;
  return <svg data-tile={tile} className={className} viewBox="0 0 768 341.333333" preserveAspectRatio="xMidYMid slice" role={label ? "img" : undefined} aria-label={label} aria-hidden={label ? undefined : true} focusable="false">
    <image href="/images/tours/activity-atlas.webp" width="1536" height="1024" x={-column * 768} y={-row * 341.333333}/>
  </svg>;
}

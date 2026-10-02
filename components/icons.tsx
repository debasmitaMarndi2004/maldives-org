type IconProps = { size?: number; stroke?: number; className?: string };

export function ArrowUpRight({ size = 16, stroke = 1.8, className = "" }: IconProps) {
  return <svg aria-hidden="true" className={className} width={size} height={size} viewBox="0 0 24 24" fill="none"><path d="M7 17 17 7M8 7h9v9" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

export function ArrowRight({ size = 16, stroke = 1.8, className = "" }: IconProps) {
  return <svg aria-hidden="true" className={className} width={size} height={size} viewBox="0 0 24 24" fill="none"><path d="M4 12h15m-6-6 6 6-6 6" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

export function CheckIcon({ size = 18, stroke = 2, className = "" }: IconProps) {
  return <svg aria-hidden="true" className={className} width={size} height={size} viewBox="0 0 24 24" fill="none"><path d="m5 12 4.5 4.5L19 7" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

export function ChevronDown({ size = 16, className = "" }: IconProps) {
  return <svg aria-hidden="true" className={className} width={size} height={size} viewBox="0 0 24 24" fill="none"><path d="m6 9 6 6 6-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

export function SearchIcon({ size = 18, className = "" }: IconProps) {
  return <svg aria-hidden="true" className={className} width={size} height={size} viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.8" /><path d="m16 16 4.5 4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>;
}

export function MenuIcon({ size = 22, className = "" }: IconProps) {
  return <svg aria-hidden="true" className={className} width={size} height={size} viewBox="0 0 24 24" fill="none"><path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>;
}

export function CloseIcon({ size = 22, className = "" }: IconProps) {
  return <svg aria-hidden="true" className={className} width={size} height={size} viewBox="0 0 24 24" fill="none"><path d="m6 6 12 12M18 6 6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>;
}

export function SunIcon({ size = 20, className = "" }: IconProps) {
  return <svg aria-hidden="true" className={className} width={size} height={size} viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="4" fill="currentColor" /><path d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42M17.65 17.65l1.42 1.42M2 12h2M20 12h2M4.93 19.07l1.42-1.42M17.65 6.35l1.42-1.42" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>;
}

export function HeartIcon({ size = 18, filled = false, className = "" }: IconProps & { filled?: boolean }) {
  return <svg aria-hidden="true" className={className} width={size} height={size} viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"}><path d="M20.8 8.7c0 5.4-8.8 10.3-8.8 10.3S3.2 14.1 3.2 8.7A4.5 4.5 0 0 1 12 6.4a4.5 4.5 0 0 1 8.8 2.3Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" /></svg>;
}

export function StarIcon({ size = 14, className = "" }: IconProps) {
  return <svg aria-hidden="true" className={className} width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><path d="m12 3 2.7 5.5 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1-4.4-4.3 6.1-.9L12 3Z" /></svg>;
}

export function MessageIcon({ size = 20, className = "" }: IconProps) {
  return <svg aria-hidden="true" className={className} width={size} height={size} viewBox="0 0 24 24" fill="none"><path d="M19 4H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3v3l4-3h7a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" /><path d="M7 9h10M7 12h6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>;
}

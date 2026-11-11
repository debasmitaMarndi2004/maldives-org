"use client";
import Image from "next/image";
import { useState } from "react";
import styles from "./tours.module.css";

export function ViatorPhoto({ src, title, large = false }: { src: string | null; title: string; large?: boolean }) {
  const [failed, setFailed] = useState(false);
  const fallback = failed || !src;
  return <div className={large ? styles.nativeHeroImage : styles.nativeImage}>
    <Image src={fallback ? "/images/island-fallback.svg" : src} alt={fallback ? `Illustrative placeholder; photo unavailable for ${title}` : title} fill sizes={large ? "(max-width: 900px) 100vw, 900px" : "(max-width: 640px) 100vw, (max-width: 1000px) 50vw, 33vw"} unoptimized onError={() => setFailed(true)} />
    {fallback && <span className={styles.imageNotice}>Photo unavailable · illustration</span>}
  </div>;
}

import Image from "next/image";
import styles from "./travel-loading.module.css";

const stages = [
  { label: "Travel", artwork: "plane" },
  { label: "Tours", artwork: "fish" },
  { label: "Accommodation", artwork: "bungalow" },
];

export function TravelLoadingSignal({ scope }: { scope: "initial" | "navigation" | "route" | "section" }) {
  return <span hidden data-site-loading={scope} />;
}

export function TravelLoadingSplash() {
  return (
    <div className={styles.splash} data-loading-splash role="status">
      <div className={styles.scene}>
        <div className={styles.brand} aria-hidden="true">
          <Image alt="" src="/images/loading/mark.png" className={styles.mark} width={139} height={120} unoptimized />
          <p className={styles.name}>Maldives<span>.org</span></p>
          <p className={styles.tagline}>Discover · Stay · Explore</p>
        </div>
        <Image
          alt=""
          src="/images/loading/jet.png"
          className={styles.jet}
          width={760}
          height={504}
          unoptimized
        />
        <div className={styles.stages} aria-hidden="true">
          {stages.map(({ label, artwork }) => (
            <div className={styles.stage} key={label}>
              <span className={styles.stageIcon}>
                <Image alt="" src={`/images/loading/${artwork}.png`} width={144} height={120} unoptimized />
              </span>
              <span>{label}</span>
            </div>
          ))}
        </div>
        <div className={styles.progress}>
          <p className={styles.message}>Preparing your Maldives experience…</p>
          <span className={styles.track} aria-hidden="true" />
        </div>
      </div>
    </div>
  );
}

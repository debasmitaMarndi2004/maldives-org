import Image from "next/image";
import styles from "./travel-loading.module.css";

const artwork = ["plane", "fish", "bungalow"];

export function TravelLoading({
  placement = "route",
  message = "Loading your page…",
}: {
  placement?: "initial" | "navigation" | "route" | "inline";
  message?: string;
}) {
  return (
    <div className={styles[placement]} data-site-loading={placement}>
      <div className={styles.card} role={placement === "inline" ? undefined : "status"}>
        <div className={styles.scene} aria-hidden="true">
          {artwork.map((name) => (
            <span className={styles.stage} key={name}>
              <Image
                alt=""
                src={`/images/loading/${name}.png`}
                className={styles.art}
                width={144}
                height={120}
                loading="eager"
                unoptimized
              />
            </span>
          ))}
        </div>
        <span className={styles.message}>{message}</span>
        <span className={styles.track} aria-hidden="true" />
      </div>
    </div>
  );
}

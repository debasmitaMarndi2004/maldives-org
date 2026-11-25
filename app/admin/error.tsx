"use client";

import Link from "next/link";
import styles from "./admin.module.css";

export default function AdminError({ reset }: { reset: () => void }) {
  return <main className={`${styles.app} ${styles.login}`}>
    <div className={styles.loginLayout}>
      <div className={styles.loginPhoto} aria-hidden="true" />
      <section className={styles.loginPanel}>
        <h1>Staff workspace unavailable</h1>
        <p>Try again in a moment.</p>
        <div className={styles.actions}>
          <button type="button" className={`${styles.button} ${styles.primary}`} onClick={reset}>Retry</button>
          <Link className={styles.button} href="/admin">Back to staff sign in</Link>
        </div>
      </section>
    </div>
  </main>;
}

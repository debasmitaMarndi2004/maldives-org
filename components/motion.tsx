"use client";

import { useEffect } from "react";

export function ScrollRevealObserver() {
  useEffect(() => {
    // CSS already keeps reveal elements visible and runs the original animation.
    // Avoid changing child classes before their selective hydration completes.
    document.documentElement.classList.add("motion-ready");
  }, []);

  return null;
}

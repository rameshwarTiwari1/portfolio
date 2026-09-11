"use client";

import { useEffect, useState } from "react";

/**
 * Scroll-spy for the one-page nav.
 *
 * Uses IntersectionObserver rather than scroll maths so the browser does the
 * work off the main thread. The root margin biases the "active" band toward
 * the upper third of the viewport, which is where a reader's attention sits —
 * without it, a section counts as active while it is still below the fold.
 */
export function useActiveSection(ids: readonly string[], enabled: boolean) {
  const [observed, setObserved] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const elements = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    if (elements.length === 0) return;

    const visible = new Map<string, number>();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            visible.set(entry.target.id, entry.intersectionRatio);
          } else {
            visible.delete(entry.target.id);
          }
        }

        // Whichever tracked section occupies the band most fully wins.
        let best: string | null = null;
        let bestRatio = 0;
        for (const [id, ratio] of visible) {
          if (ratio > bestRatio) {
            best = id;
            bestRatio = ratio;
          }
        }

        setObserved(best);
      },
      {
        rootMargin: "-20% 0px -60% 0px",
        threshold: [0, 0.15, 0.35, 0.6, 1],
      },
    );

    for (const el of elements) observer.observe(el);
    return () => observer.disconnect();
  }, [ids, enabled]);

  // Derived rather than cleared in an effect: off the home page the hook
  // simply reports nothing, with no extra render to get there.
  return enabled ? observed : null;
}

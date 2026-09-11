"use client";

import { useEffect } from "react";

/**
 * Tracks the pointer across `.card-interactive` elements and writes --mx/--my
 * so each card's highlight follows the cursor.
 *
 * One delegated listener for the whole page rather than one per card, updates
 * batched into a single rAF, and skipped entirely on touch devices and when
 * reduced motion is requested — where it would cost work and deliver nothing.
 */
export function CursorGlow() {
  useEffect(() => {
    const finePointer = window.matchMedia("(pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!finePointer || reduced) return;

    let frame = 0;
    let pending: { el: HTMLElement; x: number; y: number } | null = null;

    const flush = () => {
      frame = 0;
      if (!pending) return;
      const { el, x, y } = pending;
      el.style.setProperty("--mx", `${x}%`);
      el.style.setProperty("--my", `${y}%`);
      pending = null;
    };

    const onMove = (event: PointerEvent) => {
      const target = event.target as Element | null;
      const card = target?.closest<HTMLElement>(".card-interactive");
      if (!card) return;

      const rect = card.getBoundingClientRect();
      pending = {
        el: card,
        x: ((event.clientX - rect.left) / rect.width) * 100,
        y: ((event.clientY - rect.top) / rect.height) * 100,
      };

      frame ||= requestAnimationFrame(flush);
    };

    document.addEventListener("pointermove", onMove, { passive: true });

    return () => {
      document.removeEventListener("pointermove", onMove);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return null;
}

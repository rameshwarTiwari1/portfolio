"use client";

import { useSyncExternalStore } from "react";

import { Moon, Sun } from "@/components/ui/Icons";

type Theme = "light" | "dark";

/**
 * The theme lives on <html data-theme>, written before paint by the bootstrap
 * script in the root layout. That makes it external state, so it is subscribed
 * to rather than copied into React state from an effect.
 *
 * The server snapshot is null, which is what keeps hydration honest: the first
 * client render matches the server, then React re-renders with the real value.
 */
function useTheme(): Theme | null {
  return useSyncExternalStore(
    (onChange) => {
      const observer = new MutationObserver(onChange);
      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["data-theme"],
      });
      return () => observer.disconnect();
    },
    () => (document.documentElement.dataset.theme === "light" ? "light" : "dark"),
    () => null,
  );
}

export function ThemeToggle() {
  const theme = useTheme();

  function toggle() {
    const next: Theme = theme === "light" ? "dark" : "light";
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem("theme", next);
    } catch {
      // Private mode / blocked storage — the toggle still works this visit.
    }
  }

  const label =
    theme === null
      ? "Toggle colour theme"
      : `Switch to ${theme === "light" ? "dark" : "light"} theme`;

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      title={label}
      className="icon-btn"
      data-testid="theme-toggle"
      // Only true once hydrated and the click handler is live. Tests wait on
      // this rather than racing hydration.
      data-ready={theme !== null || undefined}
    >
      {theme === "light" ? <Moon /> : <Sun />}
    </button>
  );
}

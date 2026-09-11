"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";

import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { ArrowRight, Close, Download, Menu } from "@/components/ui/Icons";
import { useActiveSection } from "@/components/layout/useActiveSection";
import { NAV_LINKS } from "@/lib/site";

const SECTION_IDS = NAV_LINKS.map((link) => link.section);

/**
 * Scroll position is external state, so it is subscribed to rather than
 * mirrored into React state from an effect.
 */
function useScrolled(threshold = 12) {
  return useSyncExternalStore(
    (onChange) => {
      window.addEventListener("scroll", onChange, { passive: true });
      return () => window.removeEventListener("scroll", onChange);
    },
    () => window.scrollY > threshold,
    () => false,
  );
}

export function Header({
  name,
  resumeUrl,
}: {
  name: string;
  resumeUrl?: string;
}) {
  const pathname = usePathname();
  const scrolled = useScrolled();
  const onHome = pathname === "/";
  const activeSection = useActiveSection(SECTION_IDS, onHome);
  const panelRef = useRef<HTMLDivElement>(null);

  /**
   * The menu is open *for a particular route*. Storing the route instead of a
   * boolean means a navigation closes it during render — no effect, and no
   * frame where the panel lingers over the new page.
   */
  const [openFor, setOpenFor] = useState<string | null>(null);
  const open = openFor === pathname;

  /* Lock scroll and trap focus while the mobile menu is open. */
  useEffect(() => {
    if (!open) return;

    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpenFor(null);
        return;
      }
      if (event.key !== "Tab" || !panelRef.current) return;

      const focusable = panelRef.current.querySelectorAll<HTMLElement>(
        "a[href], button:not([disabled])",
      );
      if (focusable.length === 0) return;

      const first = focusable[0]!;
      const last = focusable[focusable.length - 1]!;

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  /**
   * On the home page the nav tracks the section in view. Elsewhere it marks
   * the destination whose content the reader is inside — a case study still
   * belongs to "Work" even though the URL is /work/vashix.
   */
  const isActive = (section: string) => {
    if (onHome) return activeSection === section;
    if (section === "work") return pathname.startsWith("/work");
    if (section === "writing") return pathname.startsWith("/engineering");
    return pathname.startsWith(`/${section}`);
  };

  return (
    <header className="site-header" data-scrolled={scrolled || undefined}>
      <div className="shell header-inner">
        <Link href="/" className="wordmark" aria-label={`${name} — home`}>
          <span className="wordmark-signature">{name.split(" ")[0]}</span>
          {/* Hand-drawn swash under the signature. Drawn rather than a text
              underline so it can taper and overshoot like a real pen stroke. */}
          <svg
            className="wordmark-swash"
            viewBox="0 0 120 12"
            aria-hidden="true"
            focusable="false"
          >
            <path
              d="M3 8C22 3 46 2 68 4c14 1 28 3 41 1"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
            />
          </svg>
          <span className="sr-only">{name}</span>
        </Link>

        <nav aria-label="Primary" className="nav-desktop">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="nav-link"
              data-active={isActive(link.section) || undefined}
              aria-current={isActive(link.section) ? "location" : undefined}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="header-actions">
          <ThemeToggle />

          {/* The single thing a recruiter reaches for. Kept one click away
              from every page rather than buried in the footer. */}
          {resumeUrl ? (
            <a
              href={resumeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary header-cta"
            >
              <Download />
              Resume
            </a>
          ) : null}

          {/* freelance CTA — parked with the /hire page. To restore:
          <Link href="/hire" className="btn btn-primary header-cta">
            Hire me
          </Link>
          */}

          <button
            type="button"
            className="icon-btn nav-toggle"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => setOpenFor(open ? null : pathname)}
            data-testid="nav-toggle"
          >
            {open ? <Close /> : <Menu />}
          </button>
        </div>
      </div>

      {/* Reading progress. Decorative — the scrollbar is the real one. */}
      <div className="scroll-progress" aria-hidden="true" />

      <div
        id="mobile-nav"
        ref={panelRef}
        className="mobile-nav"
        hidden={!open}
        data-testid="mobile-nav"
      >
        <nav aria-label="Mobile" className="mobile-nav-list">
          {NAV_LINKS.map((link, index) => (
            <Link
              key={link.href}
              href={link.href}
              className="mobile-nav-link"
              data-active={isActive(link.section) || undefined}
              style={{ "--i": index } as React.CSSProperties}
            >
              {link.label}
              <ArrowRight />
            </Link>
          ))}
        </nav>

        {/* freelance CTA — parked with the /hire page. To restore:
        <Link href="/hire" className="btn btn-primary btn-lg mobile-nav-cta">
          Hire me for a project
          <ArrowRight />
        </Link>
        */}
      </div>
    </header>
  );
}

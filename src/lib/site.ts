/**
 * Static site constants. Anything editable lives in Keystatic instead —
 * this file only holds values needed before content is read (URLs, nav).
 */

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
  "https://rameshwartiwari.dev";

/**
 * The nav points at sections of the home page, not at separate routes — the
 * home page is the whole story and scrolls in one pass.
 *
 * The deep pages still exist and keep their own URLs. Case studies and
 * articles have to: each one needs to rank on its own terms, be linkable on
 * its own, and be far too long to inline. `section` is the element id the
 * scroll-spy watches.
 */
/**
 * The nav goes to real pages. Each destination is a full document with its
 * own URL, which is what lets a case study or an article be shared, bookmarked
 * and ranked on its own terms.
 *
 * The home page still reads as one continuous story and keeps its section ids,
 * so `/#work` and friends remain valid deep links from anywhere.
 */
export const NAV_LINKS = [
  { href: "/work", label: "Work" },
  { href: "/engineering", label: "Writing" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
  // Freelance/services surface — parked, not deleted. The page still lives in
  // src/app/(site)/_hire; the leading underscore keeps it out of the router.
  // To bring it back: rename the folder to `hire` and uncomment this entry
  // plus the CTAs marked "freelance CTA" in Header, Footer, and the home page.
  // { href: "/hire", label: "Services" },
] as const;

export function absoluteUrl(path = "/"): string {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

/**
 * Serialise JSON-LD for embedding in a <script> tag. Escapes `<` so content
 * can never terminate the script element early.
 */
export function jsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

export function formatDate(iso: string): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;

  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

export function formatDateISO(iso: string): string {
  if (!iso) return "";
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? iso : date.toISOString();
}

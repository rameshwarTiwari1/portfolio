import type { Metadata, Viewport } from "next";
import {
  Caveat,
  Inter,
  Inter_Tight,
  JetBrains_Mono,
} from "next/font/google";

import { getSite } from "@/lib/content";
import { SITE_URL } from "@/lib/site";

import "./globals.css";

/* Self-hosted by next/font — no external request, no layout shift. */
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const interTight = Inter_Tight({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter-tight",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-jetbrains",
});

/** Signature wordmark only — never body copy. */
const caveat = Caveat({
  subsets: ["latin"],
  weight: ["600", "700"],
  display: "swap",
  variable: "--font-signature",
});

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSite();
  const title = site.seo.title || `${site.name} — ${site.role}`;
  const description = site.seo.description || site.heroSubline;

  return {
    metadataBase: new URL(SITE_URL),
    title: { default: title, template: `%s — ${site.name}` },
    description,
    applicationName: site.name,
    authors: [{ name: site.name, url: SITE_URL }],
    creator: site.name,
    alternates: {
      canonical: "/",
      types: { "application/rss+xml": "/engineering/rss.xml" },
    },
    openGraph: {
      type: "website",
      siteName: site.name,
      title,
      description,
      url: SITE_URL,
      locale: "en_IN",
    },
    twitter: { card: "summary_large_image", title, description },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, "max-image-preview": "large" },
    },
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0f2320" },
    { media: "(prefers-color-scheme: light)", color: "#fbfcfb" },
  ],
};

/**
 * Applies the theme before first paint so there is no flash of the wrong
 * theme. Stored choice wins, then the OS preference, then dark.
 */
const THEME_BOOTSTRAP = `
(function(){
  try {
    var stored = localStorage.getItem("theme");
    var theme = stored === "light" || stored === "dark"
      ? stored
      : (window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark");
    document.documentElement.dataset.theme = theme;
  } catch (e) {
    document.documentElement.dataset.theme = "dark";
  }
})();
`.trim();

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      data-theme="dark"
      suppressHydrationWarning
      className={`${inter.variable} ${interTight.variable} ${jetbrains.variable} ${caveat.variable}`}
    >
      <head>
        <script
          // Must run before paint; there is no non-inline way to do this.
          dangerouslySetInnerHTML={{ __html: THEME_BOOTSTRAP }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}

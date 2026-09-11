import "server-only";

import { createReader } from "@keystatic/core/reader";
import keystaticConfig from "../../keystatic.config";
import { renderDoc, type RenderedDoc } from "./markdoc";

/**
 * Filesystem content reader. Build-time only — every consumer is a Server
 * Component rendered statically, so this never runs on a request path.
 */
const reader = createReader(process.cwd(), keystaticConfig);

/* ------------------------------------------------------------------------ */
/* Types                                                                     */
/* ------------------------------------------------------------------------ */

export interface Metric {
  value: string;
  label: string;
}

export interface CaseStudySummary {
  slug: string;
  title: string;
  tagline: string;
  summary: string;
  role: string;
  period: string;
  featured: boolean;
  order: number;
  cover: string | null;
  stack: string[];
  metrics: Metric[];
  links: { live: string | null; github: string | null };
}

export interface CaseStudyFull extends CaseStudySummary {
  doc: RenderedDoc;
}

export interface ArticleSummary {
  slug: string;
  title: string;
  excerpt: string;
  publishedAt: string;
  updatedAt: string | null;
  tags: string[];
}

export interface ArticleFull extends ArticleSummary {
  doc: RenderedDoc;
}

export interface ExperienceEntry {
  slug: string;
  company: string;
  role: string;
  location: string;
  period: string;
  order: number;
  current: boolean;
  highlights: { text: string; caseStudy: string | null }[];
}

export interface SkillGroup {
  slug: string;
  name: string;
  order: number;
  note: string;
  items: string[];
}

export interface SocialLink {
  label: string;
  url: string;
}

export interface SiteSettings {
  name: string;
  role: string;
  location: string;
  availability: string;
  heroHeadline: string;
  heroSubline: string;
  portrait: string | null;
  email: string;
  phone: string;
  resumeUrl: string;
  socials: SocialLink[];
  seo: { title: string; description: string };
}

/* ------------------------------------------------------------------------ */
/* Helpers                                                                   */
/* ------------------------------------------------------------------------ */

const str = (v: unknown): string => (typeof v === "string" ? v : "");
const strOrNull = (v: unknown): string | null =>
  typeof v === "string" && v.length > 0 ? v : null;
const list = <T,>(v: readonly T[] | null | undefined): T[] =>
  Array.isArray(v) ? [...v] : [];

/** Drafts are visible in dev so you can preview before publishing. */
const includeDrafts = process.env.NODE_ENV !== "production";

/* ------------------------------------------------------------------------ */
/* Site settings                                                             */
/* ------------------------------------------------------------------------ */

export async function getSite(): Promise<SiteSettings> {
  const s = await reader.singletons.site.read();

  if (!s) {
    throw new Error(
      "content/singletons/site.json is missing. Run the dev server and open /keystatic to create it.",
    );
  }

  return {
    name: str(s.name),
    role: str(s.role),
    location: str(s.location),
    availability: str(s.availability),
    heroHeadline: str(s.heroHeadline),
    heroSubline: str(s.heroSubline),
    portrait: strOrNull(s.portrait),
    email: str(s.email),
    phone: str(s.phone),
    resumeUrl: str(s.resumeUrl),
    socials: list(s.socials).map((x) => ({
      label: str(x.label),
      url: str(x.url),
    })),
    seo: {
      title: str(s.seo?.title),
      description: str(s.seo?.description),
    },
  };
}

export async function getAbout() {
  const a = await reader.singletons.about.read({ resolveLinkedFiles: true });
  if (!a) return null;

  return {
    heading: str(a.heading),
    lede: str(a.lede),
    doc: await renderDoc(a.content),
  };
}

/* ------------------------------------------------------------------------ */
/* Case studies                                                              */
/* ------------------------------------------------------------------------ */

function toCaseStudySummary(
  slug: string,
  e: Record<string, unknown>,
): CaseStudySummary {
  const links = (e.links ?? {}) as Record<string, unknown>;

  return {
    slug,
    title: str(e.title),
    tagline: str(e.tagline),
    summary: str(e.summary),
    role: str(e.role),
    period: str(e.period),
    featured: Boolean(e.featured),
    order: typeof e.order === "number" ? e.order : 99,
    cover: strOrNull(e.cover),
    stack: list(e.stack as string[]),
    metrics: list(e.metrics as Metric[]).map((m) => ({
      value: str(m.value),
      label: str(m.label),
    })),
    links: {
      live: strOrNull(links.live),
      github: strOrNull(links.github),
    },
  };
}

export async function getCaseStudies(): Promise<CaseStudySummary[]> {
  const entries = await reader.collections.caseStudies.all();

  return entries
    .map(({ slug, entry }) =>
      toCaseStudySummary(slug, entry as unknown as Record<string, unknown>),
    )
    .sort((a, b) => a.order - b.order || a.title.localeCompare(b.title));
}

export async function getFeaturedCaseStudies(
  limit = 3,
): Promise<CaseStudySummary[]> {
  const all = await getCaseStudies();
  const featured = all.filter((c) => c.featured);
  return (featured.length > 0 ? featured : all).slice(0, limit);
}

export async function getCaseStudy(
  slug: string,
): Promise<CaseStudyFull | null> {
  const entry = await reader.collections.caseStudies.read(slug, {
    resolveLinkedFiles: true,
  });
  if (!entry) return null;

  return {
    ...toCaseStudySummary(slug, entry as unknown as Record<string, unknown>),
    doc: await renderDoc(entry.content),
  };
}

export async function getCaseStudySlugs(): Promise<string[]> {
  return [...(await reader.collections.caseStudies.list())];
}

/* ------------------------------------------------------------------------ */
/* Articles                                                                  */
/* ------------------------------------------------------------------------ */

function toArticleSummary(
  slug: string,
  e: Record<string, unknown>,
): ArticleSummary {
  return {
    slug,
    title: str(e.title),
    excerpt: str(e.excerpt),
    publishedAt: str(e.publishedAt),
    updatedAt: strOrNull(e.updatedAt),
    tags: list(e.tags as string[]),
  };
}

export async function getArticles(): Promise<ArticleSummary[]> {
  const entries = await reader.collections.articles.all();

  return entries
    .filter(({ entry }) => includeDrafts || !entry.draft)
    .map(({ slug, entry }) =>
      toArticleSummary(slug, entry as unknown as Record<string, unknown>),
    )
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}

export async function getArticle(slug: string): Promise<ArticleFull | null> {
  const entry = await reader.collections.articles.read(slug, {
    resolveLinkedFiles: true,
  });
  if (!entry) return null;
  if (entry.draft && !includeDrafts) return null;

  return {
    ...toArticleSummary(slug, entry as unknown as Record<string, unknown>),
    doc: await renderDoc(entry.content),
  };
}

export async function getArticleSlugs(): Promise<string[]> {
  const articles = await getArticles();
  return articles.map((a) => a.slug);
}

export async function getAllTags(): Promise<{ tag: string; count: number }[]> {
  const articles = await getArticles();
  const counts = new Map<string, number>();

  for (const article of articles) {
    for (const tag of article.tags) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }

  return [...counts.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
}

/* ------------------------------------------------------------------------ */
/* Experience + skills                                                       */
/* ------------------------------------------------------------------------ */

export async function getExperience(): Promise<ExperienceEntry[]> {
  const entries = await reader.collections.experience.all();

  return entries
    .map(({ slug, entry }) => {
      const e = entry as unknown as Record<string, unknown>;
      return {
        slug,
        company: str(e.company),
        role: str(e.role),
        location: str(e.location),
        period: str(e.period),
        order: typeof e.order === "number" ? e.order : 99,
        current: Boolean(e.current),
        highlights: list(
          e.highlights as { text: string; caseStudy: string | null }[],
        ).map((h) => ({
          text: str(h.text),
          caseStudy: strOrNull(h.caseStudy),
        })),
      };
    })
    .sort((a, b) => a.order - b.order);
}

export async function getSkillGroups(): Promise<SkillGroup[]> {
  const entries = await reader.collections.skillGroups.all();

  return entries
    .map(({ slug, entry }) => {
      const e = entry as unknown as Record<string, unknown>;
      return {
        slug,
        name: str(e.name),
        order: typeof e.order === "number" ? e.order : 99,
        note: str(e.note),
        items: list(e.items as string[]),
      };
    })
    .sort((a, b) => a.order - b.order);
}

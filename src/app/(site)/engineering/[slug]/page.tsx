import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { MarkdocContent } from "@/components/content/MarkdocContent";
import { Toc } from "@/components/content/Toc";
import { ArrowLeft } from "@/components/ui/Icons";
import { getArticle, getArticleSlugs, getSite } from "@/lib/content";
import { absoluteUrl, formatDate, formatDateISO, jsonLd } from "@/lib/site";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const slugs = await getArticleSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticle(slug);

  if (!article) return { title: "Not found" };

  return {
    title: article.title,
    description: article.excerpt,
    alternates: { canonical: `/engineering/${slug}` },
    openGraph: {
      type: "article",
      title: article.title,
      description: article.excerpt,
      url: absoluteUrl(`/engineering/${slug}`),
      publishedTime: formatDateISO(article.publishedAt),
      modifiedTime: article.updatedAt
        ? formatDateISO(article.updatedAt)
        : undefined,
      tags: article.tags,
    },
  };
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const [article, site] = await Promise.all([getArticle(slug), getSite()]);

  if (!article) notFound();

  const schema = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: article.title,
    description: article.excerpt,
    datePublished: formatDateISO(article.publishedAt),
    dateModified: formatDateISO(article.updatedAt ?? article.publishedAt),
    author: { "@type": "Person", name: site.name, url: absoluteUrl("/") },
    keywords: article.tags.join(", "),
    url: absoluteUrl(`/engineering/${slug}`),
    wordCount: article.doc.wordCount,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(schema) }}
      />

      <div className="page-header">
        <div className="shell">
          <Link href="/engineering" className="link-arrow mb-6">
            <ArrowLeft />
            All articles
          </Link>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <time
              className="numeric"
              dateTime={formatDateISO(article.publishedAt)}
            >
              {formatDate(article.publishedAt)}
            </time>
            <span className="numeric">
              {article.doc.readingMinutes} min read
            </span>
          </div>

          <h1 className="page-title">{article.title}</h1>
          <p className="page-lede">{article.excerpt}</p>

          {article.tags.length > 0 ? (
            <ul className="mt-7 flex flex-wrap gap-2">
              {article.tags.map((tag) => (
                <li key={tag} className="tag">
                  {tag}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>

      <div className="shell">
        <div className="doc-layout">
          <article>
            <MarkdocContent tree={article.doc.tree} />
          </article>
          <aside>
            <Toc entries={article.doc.toc} />
          </aside>
        </div>
      </div>

      <section className="section-tight border-t border-line">
        <div className="shell flex flex-wrap items-center justify-between gap-4">
          <p className="text-ink-muted">
            Questions, or think I got something wrong?
          </p>
          <Link href="/contact" className="btn btn-ghost">
            Tell me
          </Link>
        </div>
      </section>
    </>
  );
}

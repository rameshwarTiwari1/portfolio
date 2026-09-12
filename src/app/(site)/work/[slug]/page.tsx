import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { MarkdocContent } from "@/components/content/MarkdocContent";
import { Toc } from "@/components/content/Toc";
import { ArrowLeft, ArrowUpRight, Github } from "@/components/ui/Icons";
import { getCaseStudy, getCaseStudySlugs } from "@/lib/content";
import { absoluteUrl, jsonLd } from "@/lib/site";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const slugs = await getCaseStudySlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const caseStudy = await getCaseStudy(slug);

  if (!caseStudy) return { title: "Not found" };

  return {
    title: caseStudy.title,
    description: caseStudy.summary || caseStudy.tagline,
    alternates: { canonical: `/work/${slug}` },
    openGraph: {
      type: "article",
      title: caseStudy.title,
      description: caseStudy.summary || caseStudy.tagline,
      url: absoluteUrl(`/work/${slug}`),
      images: caseStudy.cover ? [{ url: caseStudy.cover }] : undefined,
    },
  };
}

export default async function CaseStudyPage({ params }: Props) {
  const { slug } = await params;
  const caseStudy = await getCaseStudy(slug);

  if (!caseStudy) notFound();

  const schema = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: caseStudy.title,
    description: caseStudy.summary,
    url: absoluteUrl(`/work/${slug}`),
    keywords: caseStudy.stack.join(", "),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(schema) }}
      />

      <div className="page-header">
        <div className="shell">
          <Link href="/work" className="link-arrow mb-6">
            <ArrowLeft />
            All work
          </Link>

          <p className="numeric">
            {caseStudy.role} · {caseStudy.period}
          </p>

          <h1 className="page-title">{caseStudy.title}</h1>
          <p className="page-lede">{caseStudy.tagline}</p>

          {caseStudy.stack.length > 0 ? (
            <ul className="mt-7 flex flex-wrap gap-2">
              {caseStudy.stack.map((tech) => (
                <li key={tech} className="tag">
                  {tech}
                </li>
              ))}
            </ul>
          ) : null}

          {(caseStudy.links.live || caseStudy.links.github) && (
            <div className="mt-7 flex flex-wrap gap-3">
              {caseStudy.links.live ? (
                <a
                  href={caseStudy.links.live}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary"
                >
                  Visit live site
                  <ArrowUpRight />
                </a>
              ) : null}
              {caseStudy.links.github ? (
                <a
                  href={caseStudy.links.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-ghost"
                >
                  <Github />
                  Source
                </a>
              ) : null}
            </div>
          )}
        </div>
      </div>

      {caseStudy.metrics.length > 0 ? (
        <div className="shell">
          <dl className="proof !mt-0">
            {caseStudy.metrics.map((metric) => (
              <div key={metric.label} className="proof-item">
                <dt className="proof-value">{metric.value}</dt>
                <dd>{metric.label}</dd>
              </div>
            ))}
          </dl>
        </div>
      ) : null}

      {caseStudy.cover ? (
        <div className="shell mt-10">
          <Image
            src={caseStudy.cover}
            alt={`${caseStudy.title} interface`}
            width={2000}
            height={1125}
            priority
            sizes="(max-width: 1200px) 100vw, 76rem"
            className="rounded-lg border border-line"
          />
        </div>
      ) : null}

      <div className="shell">
        <div className="doc-layout">
          <article>
            <MarkdocContent tree={caseStudy.doc.tree} />
          </article>
          <aside>
            <Toc entries={caseStudy.doc.toc} />
          </aside>
        </div>
      </div>

      <section className="section-tight border-t border-line">
        <div className="shell flex flex-wrap items-center justify-between gap-4">
          <p className="text-ink-muted">Want the detail behind any of this?</p>
          <Link href="/contact" className="btn btn-primary">
            Get in touch
          </Link>
        </div>
      </section>
    </>
  );
}

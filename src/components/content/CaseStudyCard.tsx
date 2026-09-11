import Image from "next/image";
import Link from "next/link";

import { ArrowRight } from "@/components/ui/Icons";
import type { CaseStudySummary } from "@/lib/content";

interface Props {
  caseStudy: CaseStudySummary;
  featured?: boolean;
  priority?: boolean;
  /**
   * Cards sit directly under the page h1 on /work, but under a section h2 on
   * the home page. The caller sets the level so heading order never skips.
   */
  headingLevel?: 2 | 3;
}

export function CaseStudyCard({
  caseStudy,
  featured,
  priority,
  headingLevel = 3,
}: Props) {
  const href = `/work/${caseStudy.slug}`;
  const Title = `h${headingLevel}` as "h2" | "h3";

  // With no cover there is no media panel at all. An empty placeholder reads
  // as a broken image well, and reserving the space leaves the card mostly
  // void — the two-column featured layout only earns its width with an image.
  const hasMedia = Boolean(caseStudy.cover);
  const wide = Boolean(featured) && hasMedia;
  const stackLimit = featured ? 8 : 6;
  const overflow = caseStudy.stack.length - stackLimit;

  return (
    <article
      className={`card card-interactive work-card${wide ? " work-card-featured" : ""}`}
    >
      {hasMedia ? (
        <div className="work-card-media">
          <Image
            src={caseStudy.cover!}
            alt=""
            width={1200}
            height={750}
            priority={priority}
            sizes={
              wide
                ? "(max-width: 880px) 100vw, 55vw"
                : "(max-width: 880px) 100vw, 45vw"
            }
          />
        </div>
      ) : null}

      <div className="work-card-body">
        <p className="meta">
          {caseStudy.role} · {caseStudy.period}
        </p>

        <Title className="work-card-title">
          {/* Stretched link — the whole card is the hit target. */}
          <Link href={href} className="after:absolute after:inset-0">
            {caseStudy.title}
          </Link>
        </Title>

        <p className="work-card-summary">{caseStudy.summary}</p>

        {caseStudy.stack.length > 0 ? (
          <ul className="work-card-stack">
            {caseStudy.stack.slice(0, stackLimit).map((tech) => (
              <li key={tech} className="tag">
                {tech}
              </li>
            ))}
            {overflow > 0 ? (
              <li className="tag tag-quiet">+{overflow} more</li>
            ) : null}
          </ul>
        ) : null}

        <div className="work-card-foot">
          {caseStudy.metrics.length > 0 ? (
            <dl className="work-card-metrics">
              {caseStudy.metrics.slice(0, 3).map((metric) => (
                <div key={metric.label}>
                  <dt className="work-card-metric-value">{metric.value}</dt>
                  <dd className="work-card-metric-label">{metric.label}</dd>
                </div>
              ))}
            </dl>
          ) : null}

          <span className="link-arrow work-card-cue">
            Read case study
            <ArrowRight />
          </span>
        </div>
      </div>
    </article>
  );
}

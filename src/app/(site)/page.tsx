import Link from "next/link";

import { ArticleRow } from "@/components/content/ArticleRow";
import { CaseStudyCard } from "@/components/content/CaseStudyCard";
import { ArchitectureDiagram } from "@/components/sections/ArchitectureDiagram";
import { HeroPortrait } from "@/components/sections/HeroPortrait";
import { StackExplorer } from "@/components/sections/StackExplorer";
import { ArrowRight, Download } from "@/components/ui/Icons";
import {
  getAbout,
  getArticles,
  getExperience,
  getFeaturedCaseStudies,
  getSite,
  getSkillGroups,
} from "@/lib/content";
import { absoluteUrl, jsonLd } from "@/lib/site";

/** Evidence, stated as claims a reader can check — not a stat template. */
const PROOF = [
  { value: "2+ years", label: "shipping production SaaS" },
  { value: "5 modules", label: "in a live multi-tenant CRM" },
  { value: "~40%", label: "faster after moving work to queues" },
];

export default async function HomePage() {
  const [site, featured, articles, experience, skills, about] =
    await Promise.all([
      getSite(),
      getFeaturedCaseStudies(4),
      getArticles(),
      getExperience(),
      getSkillGroups(),
      getAbout(),
    ]);

  const latestArticles = articles.slice(0, 3);
  const personJsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: site.name,
    jobTitle: site.role,
    email: site.email ? `mailto:${site.email}` : undefined,
    url: absoluteUrl("/"),
    address: site.location
      ? { "@type": "PostalAddress", addressLocality: site.location }
      : undefined,
    sameAs: site.socials.map((s) => s.url),
    knowsAbout: skills.flatMap((group) => group.items).slice(0, 24),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(personJsonLd) }}
      />

      {/* ================================================================ */}
      <section className="hero">
        <div className="shell">
          <div className="hero-grid">
            <div className="min-w-0">
              {site.availability ? (
                <p
                  className="hero-status animate-enter"
                  style={{ "--i": 0 } as React.CSSProperties}
                >
                  <span className="hero-status-dot" aria-hidden="true" />
                  {site.availability}
                </p>
              ) : null}

              <h1
                className="hero-title animate-enter"
                style={{ "--i": 1 } as React.CSSProperties}
              >
                I build{" "}
                <em>
                  <span className="unit">multi-tenant</span> systems
                </em>{" "}
                that hold up in production.
              </h1>

              <p
                className="hero-sub animate-enter"
                style={{ "--i": 2 } as React.CSSProperties}
              >
                {site.heroSubline}
              </p>

              <div
                className="hero-actions animate-enter"
                style={{ "--i": 3 } as React.CSSProperties}
              >
                {/* freelance CTA — parked with /hire. To restore:
                <Link href="/hire" className="btn btn-primary btn-lg">
                  Hire me for a project
                  <ArrowRight />
                </Link>
                */}
                <Link href="/work" className="btn btn-primary btn-lg">
                  See the work
                  <ArrowRight />
                </Link>
                {site.resumeUrl ? (
                  <a
                    href={site.resumeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-ghost btn-lg"
                  >
                    <Download />
                    Resume
                  </a>
                ) : null}
              </div>

            </div>

            {/* Deliberately not animated: this is the LCP element, and
                fading it in last left the right half of the hero empty for
                the first second of every visit. */}
            <div>
              <HeroPortrait
                src="/images/portrait-cutout.png"
                name={site.name}
                badgeValue="2+"
                badgeLabel="years in production"
              />
            </div>
          </div>

          <dl className="proof">
            {PROOF.map((item) => (
              <div key={item.label} className="proof-item">
                <dt className="proof-value">{item.value}</dt>
                <dd>{item.label}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ================================================================ */}
      {/* The diagram gets its own band: at full width the labels are legible,
          which they were not when it was squeezed into the hero column. */}
      <section className="section border-t border-line" aria-labelledby="how-heading">
        <div className="shell">
          <div className="section-head section-head-split">
            <p className="kicker">How I think</p>
            <h2 id="how-heading" className="section-title">
              Isolation belongs below the application, not inside it
            </h2>
            <p className="section-lede">
              Every request in the CRM resolves a tenant at the edge, and no
              query reaches Postgres without passing the boundary that enforces
              it. A forgotten <code>WHERE</code> clause stops being a breach.
            </p>
          </div>

          <ArchitectureDiagram />

          <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3">
            <Link href="/work/multi-tenant-enterprise-crm" className="link-arrow">
              How this was built
              <ArrowRight />
            </Link>
            <Link
              href="/engineering/postgres-row-level-security-multi-tenant"
              className="link-arrow"
            >
              Why row-level security
              <ArrowRight />
            </Link>
          </div>
        </div>
      </section>

      {/* ================================================================ */}
      {featured.length > 0 ? (
        <section id="work" className="section-wide anchor" aria-labelledby="work-heading">
          <div className="shell">
            <div className="section-head section-head-split">
              <p className="kicker">Selected work</p>
              <h2 id="work-heading" className="section-title">
                Four systems, covered the way an engineer would want to read them
              </h2>
              <p className="section-lede">
                Not screenshots. Each one states the problem, the architecture,
                the trade-offs I made, and what actually shipped.
              </p>
            </div>

            <div className="work-grid reveal-stagger">
              {featured.map((caseStudy, index) => (
                <CaseStudyCard
                  key={caseStudy.slug}
                  caseStudy={caseStudy}
                  featured={index === 0}
                  priority={index === 0}
                />
              ))}
            </div>

            <div className="mt-10">
              <Link href="/work" className="link-arrow">
                All case studies
                <ArrowRight />
              </Link>
            </div>
          </div>
        </section>
      ) : null}

      {/* ================================================================ */}
      {experience.length > 0 ? (
        <section
          id="experience"
          className="section border-t border-line anchor"
          aria-labelledby="experience-heading"
        >
          <div className="shell">
            <div className="section-head section-head-split">
              <h2 id="experience-heading" className="section-title">
                Where I have worked
              </h2>
              <p className="section-lede">
                Each responsibility links to the thing it produced, so you can
                check the claim rather than take it.
              </p>
            </div>

            <div className="xp">
              {experience.map((job) => (
                <article key={job.slug} className="xp-item">
                  <div>
                    <p className="xp-period">
                      {job.current ? (
                        <span className="xp-live" aria-label="Current role" />
                      ) : null}
                      {job.period}
                    </p>
                  </div>

                  <div className="min-w-0">
                    <h3 className="xp-role">
                      {job.role}{" "}
                      <span className="xp-company">— {job.company}</span>
                    </h3>

                    {job.highlights.length > 0 ? (
                      <div className="xp-highlights">
                        {job.highlights.slice(0, 3).map((highlight, i) => (
                          <p key={i} className="xp-highlight">
                            {highlight.text}
                            {highlight.caseStudy ? (
                              <>
                                {" "}
                                <Link
                                  href={`/work/${highlight.caseStudy}`}
                                  className="link"
                                >
                                  See how
                                </Link>
                              </>
                            ) : null}
                          </p>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </article>
              ))}
            </div>

            <div className="mt-10 flex flex-wrap gap-4">
              <Link href="/about" className="link-arrow">
                Full background
                <ArrowRight />
              </Link>
              {site.resumeUrl ? (
                <a
                  href={site.resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-arrow"
                >
                  <Download />
                  Resume (PDF)
                </a>
              ) : null}
            </div>
          </div>
        </section>
      ) : null}

      {/* ================================================================ */}
      {skills.length > 0 ? (
        <section
          id="stack"
          className="section border-t border-line anchor"
          aria-labelledby="skills-heading"
        >
          <div className="shell">
            <div className="section-head section-head-split">
              <h2 id="skills-heading" className="section-title">
                What I build with
              </h2>
              <p className="section-lede">
                Everything listed here is in something I have shipped, not
                something I have read about.
              </p>
            </div>

            <StackExplorer groups={skills} />
          </div>
        </section>
      ) : null}

      {/* ================================================================ */}
      {latestArticles.length > 0 ? (
        <section
          id="writing"
          className="section border-t border-line anchor"
          aria-labelledby="writing-heading"
        >
          <div className="shell">
            <div className="section-head section-head-split">
              <h2 id="writing-heading" className="section-title">
                Notes on architecture and infrastructure
              </h2>
              <p className="section-lede">
                How I reason about the systems I build — multi-tenancy, queues,
                data isolation, and where AI genuinely helps.
              </p>
            </div>

            <div className="flex flex-col">
              {latestArticles.map((article) => (
                <ArticleRow key={article.slug} article={article} />
              ))}
            </div>

            <div className="mt-10">
              <Link href="/engineering" className="link-arrow">
                All articles
                <ArrowRight />
              </Link>
            </div>
          </div>
        </section>
      ) : null}

      {/* ================================================================ */}
      {/* A condensed About lives here so the nav anchor has somewhere to
          land; the full write-up keeps its own page for depth and SEO. */}
      {about ? (
        <section
          id="about"
          className="section border-t border-line anchor"
          aria-labelledby="about-heading"
        >
          <div className="shell">
            <div className="section-head section-head-split">
              <h2 id="about-heading" className="section-title">
                {about.heading}
              </h2>
              <p className="section-lede">{about.lede}</p>
            </div>

            <div className="about-strip">
              {[
                { label: "Based in", value: site.location },
                { label: "Focus", value: "Multi-tenant SaaS · AWS · AI" },
                { label: "Availability", value: site.availability },
                { label: "Email", value: site.email, href: `mailto:${site.email}` },
              ]
                .filter((row) => row.value)
                .map((row) => (
                  <div key={row.label} className="about-row">
                    <dt className="about-key">{row.label}</dt>
                    <dd className="about-value">
                      {row.href ? (
                        <a href={row.href} className="link">
                          {row.value}
                        </a>
                      ) : (
                        row.value
                      )}
                    </dd>
                  </div>
                ))}
            </div>

            <div className="mt-8">
              <Link href="/about" className="link-arrow">
                Read the full background
                <ArrowRight />
              </Link>
            </div>
          </div>
        </section>
      ) : null}

      {/* ================================================================ */}
      <section id="contact" className="cta-band section-wide anchor">
        <div className="shell">
          <div className="cta-inner">
            <h2 className="cta-title">
              Building something that has to scale properly?
            </h2>
            <p className="cta-lede">
              I am open to conversations about backend architecture,
              multi-tenant SaaS, and AI-integrated products — roles or
              otherwise. If you are working on something interesting, I would
              like to hear about it.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link href="/contact" className="btn btn-primary btn-lg">
                Get in touch
                <ArrowRight />
              </Link>
              <a href={`mailto:${site.email}`} className="btn btn-ghost btn-lg">
                {site.email}
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

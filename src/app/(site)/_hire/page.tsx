import type { Metadata } from "next";
import Link from "next/link";

import { EnquiryForm } from "@/components/content/EnquiryForm";
import { ArrowRight, Check } from "@/components/ui/Icons";
import { getCaseStudies, getSite } from "@/lib/content";
import { ENGAGEMENTS, PROCESS, SERVICES } from "@/lib/services";
import { absoluteUrl, jsonLd } from "@/lib/site";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Freelance engineering: multi-tenant SaaS builds, architecture reviews, AI and RAG integration, and backend infrastructure. Fixed-price, scoped projects.",
  alternates: { canonical: "/hire" },
};

export default async function HirePage() {
  const [site, caseStudies] = await Promise.all([getSite(), getCaseStudies()]);

  const proof = caseStudies.slice(0, 3);

  const serviceJsonLd = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: `${site.name} — Software Engineering`,
    description:
      "Multi-tenant SaaS architecture, backend infrastructure, and AI integration for product teams.",
    url: absoluteUrl("/hire"),
    email: site.email ? `mailto:${site.email}` : undefined,
    areaServed: "Worldwide",
    provider: { "@type": "Person", name: site.name, url: absoluteUrl("/") },
    knowsAbout: SERVICES.map((s) => s.title),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(serviceJsonLd) }}
      />

      {/* ================================================================ */}
      <section className="hero">
        <div className="shell">
          <div className="hero-grid">
            <div className="min-w-0">
              <p
                className="hero-status animate-enter"
                style={{ "--i": 0 } as React.CSSProperties}
              >
                <span className="hero-status-dot" aria-hidden="true" />
                Taking projects for the next quarter
              </p>

              <h1
                className="hero-title animate-enter"
                style={{ "--i": 1 } as React.CSSProperties}
              >
                Senior engineering, <em>without the headcount</em>.
              </h1>

              <p
                className="hero-sub animate-enter"
                style={{ "--i": 2 } as React.CSSProperties}
              >
                I design and build the parts of a product that are expensive to
                get wrong — tenancy, data models, queues, and the infrastructure
                underneath. Fixed scope, fixed price, working software at every
                stage.
              </p>

              <div
                className="hero-actions animate-enter"
                style={{ "--i": 3 } as React.CSSProperties}
              >
                <a href="#brief" className="btn btn-primary btn-lg">
                  Tell me about your project
                  <ArrowRight />
                </a>
                <Link href="/work" className="btn btn-ghost btn-lg">
                  See what I have built
                </Link>
              </div>
            </div>

            <div
              className="animate-enter"
              style={{ "--i": 4 } as React.CSSProperties}
            >
              <div className="card p-6 sm:p-8">
                <p className="text-sm font-semibold text-ink">
                  How the engagement works
                </p>

                <ul className="mt-5 flex flex-col gap-4">
                  {[
                    {
                      title: "Free 30-minute diagnostic call",
                      body: "If I am not right for it, you find out on that call.",
                    },
                    {
                      title: "Written proposal before any invoice",
                      body: "Scope, approach, timeline, fixed price. No hourly ambiguity.",
                    },
                    {
                      title: "You can stop between increments",
                      body: "Working software at each stage, not a reveal at the end.",
                    },
                  ].map((item) => (
                    <li key={item.title} className="flex gap-3">
                      <Check
                        className="mt-1 shrink-0 text-accent"
                        aria-hidden="true"
                      />
                      <div>
                        <p className="font-medium text-ink">{item.title}</p>
                        <p className="mt-0.5 text-sm text-ink-subtle leading-relaxed">
                          {item.body}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>

                <p className="mt-6 border-t border-line pt-5 text-sm text-ink-muted">
                  Typical projects run{" "}
                  <span className="text-ink">4 to 12 weeks</span>. Reviews are
                  shorter, and start at one week.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================ */}
      <section className="section border-t border-line" aria-labelledby="services">
        <div className="shell">
          <div className="section-head section-head-split">
            <p className="kicker">What I do</p>
            <h2 id="services" className="section-title">
              Four kinds of work
            </h2>
            <p className="section-lede">
              If your problem is not on this list, send it anyway — I would
              rather tell you it is not my area than have you wonder.
            </p>
          </div>

          <div className="service-grid reveal-stagger">
            {SERVICES.map((service, index) => (
              <article key={service.title} className="service">
                <p className="service-index">
                  {String(index + 1).padStart(2, "0")}
                </p>
                <h3 className="service-title">{service.title}</h3>
                <p className="service-body">{service.body}</p>
                <ul className="service-list">
                  {service.includes.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================================ */}
      <section
        className="section border-t border-line"
        aria-labelledby="engagements"
      >
        <div className="shell">
          <div className="section-head section-head-split">
            <h2 id="engagements" className="section-title">
              How we can work together
            </h2>
          </div>

          <div className="grid gap-5 md:grid-cols-3 reveal-stagger">
            {ENGAGEMENTS.map((engagement) => (
              <article key={engagement.name} className="card p-6">
                <p className="numeric">{engagement.duration}</p>
                <h3 className="mt-2 text-lg font-semibold tracking-tight">
                  {engagement.name}
                </h3>
                <p className="mt-3 text-ink-muted leading-relaxed">
                  {engagement.body}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================================ */}
      <section className="section border-t border-line" aria-labelledby="process">
        <div className="shell">
          <div className="grid gap-12 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
            <div>
              <div className="section-head !mb-6">
                <h2 id="process" className="section-title">
                  What happens after you send a brief
                </h2>
                <p className="section-lede">
                  No pitch deck, no discovery phase you pay for before knowing
                  whether this works.
                </p>
              </div>
            </div>

            <ol className="process">
              {PROCESS.map((step, index) => (
                <li key={step.title} className="process-step">
                  <span className="process-marker" aria-hidden="true">
                    {index + 1}
                  </span>
                  <div>
                    <h3 className="process-title">{step.title}</h3>
                    <p className="process-body">{step.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* ================================================================ */}
      {proof.length > 0 ? (
        <section className="section border-t border-line" aria-labelledby="proof">
          <div className="shell">
            <div className="section-head section-head-split">
              <h2 id="proof" className="section-title">
                Work I can point at
              </h2>
              <p className="section-lede">
                Each of these is written up in full — the problem, the
                architecture, and the trade-offs.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-3 reveal-stagger">
              {proof.map((entry) => (
                <article key={entry.slug} className="card card-interactive p-6">
                  <h3 className="relative z-1 text-lg font-semibold tracking-tight">
                    <Link
                      href={`/work/${entry.slug}`}
                      className="after:absolute after:inset-0"
                    >
                      {entry.title}
                    </Link>
                  </h3>
                  <p className="relative z-1 mt-3 text-ink-muted leading-relaxed">
                    {entry.tagline}
                  </p>
                  {entry.metrics[0] ? (
                    <p className="relative z-1 mt-4 text-sm text-accent">
                      {entry.metrics[0].value} {entry.metrics[0].label}
                    </p>
                  ) : null}
                </article>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* ================================================================ */}
      <section id="brief" className="cta-band section-wide scroll-mt-24">
        <div className="shell">
          <div className="grid gap-12 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
            <div>
              <h2 className="cta-title">Tell me what you are building.</h2>
              <p className="section-lede mt-5">
                The more specific you are, the more useful my first reply will
                be. I read every one of these myself.
              </p>

              <div className="callout mt-8">
                <p>
                  If I am not the right person for it, I will say so on the
                  first call — and point you at someone who is, where I can.
                </p>
              </div>
            </div>

            <EnquiryForm email={site.email} />
          </div>
        </div>
      </section>
    </>
  );
}

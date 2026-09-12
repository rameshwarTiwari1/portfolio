import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { MarkdocContent } from "@/components/content/MarkdocContent";
import { StackExplorer } from "@/components/sections/StackExplorer";
import { ArrowUpRight, Download, Mail, MapPin } from "@/components/ui/Icons";
import {
  getAbout,
  getExperience,
  getSite,
  getSkillGroups,
} from "@/lib/content";

export const metadata: Metadata = {
  title: "About",
  description:
    "Full-stack software engineer in Mumbai working on multi-tenant SaaS architecture, AWS infrastructure, and AI-integrated products.",
  alternates: { canonical: "/about" },
};

export default async function AboutPage() {
  const [about, site, experience, skills] = await Promise.all([
    getAbout(),
    getSite(),
    getExperience(),
    getSkillGroups(),
  ]);

  const initials = site.name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <>
      {/* ================================================================ */}
      <div className="page-header">
        <div className="shell">
          <div className="about-hero">
            <div className="min-w-0">
              <h1 className="page-title !mt-0">{about?.heading ?? site.name}</h1>
              <p className="page-lede">{about?.lede ?? site.heroSubline}</p>

              <div className="mt-8 flex flex-wrap gap-3">
                {site.resumeUrl ? (
                  <a
                    href={site.resumeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary"
                  >
                    <Download />
                    Download resume
                  </a>
                ) : null}
                {site.socials.map((social) => (
                  <a
                    key={social.url}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-ghost"
                  >
                    {social.label}
                    <ArrowUpRight />
                  </a>
                ))}
              </div>

              <ul className="about-facts">
                {site.location ? (
                  <li>
                    <MapPin />
                    {site.location}
                  </li>
                ) : null}
                <li>
                  <Mail />
                  <a href={`mailto:${site.email}`} className="link">
                    {site.email}
                  </a>
                </li>
              </ul>
            </div>

            <figure className="hero-figure">
              <div className="hero-figure-frame">
                {site.portrait ? (
                  <Image
                    src={site.portrait}
                    alt={`Portrait of ${site.name}`}
                    width={720}
                    height={720}
                    priority
                    sizes="(max-width: 900px) 55vw, 21rem"
                  />
                ) : (
                  <div className="portrait-fallback" aria-hidden="true">
                    {initials}
                  </div>
                )}
              </div>
            </figure>
          </div>
        </div>
      </div>

      {/* ================================================================ */}
      {about ? (
        <section className="section">
          <div className="shell">
            <MarkdocContent tree={about.doc.tree} />
          </div>
        </section>
      ) : null}

      {/* ================================================================ */}
      {experience.length > 0 ? (
        <section
          className="section border-t border-line"
          aria-labelledby="about-experience"
        >
          <div className="shell">
            <div className="section-head section-head-split">
              <h2 id="about-experience" className="section-title">
                Roles
              </h2>
              <p className="section-lede">
                Each responsibility links to the thing it produced, so you can
                check the claim rather than take it.
              </p>
            </div>

            {/* Same timeline the home page uses — one implementation. */}
            <div className="xp">
              {experience.map((job) => (
                <article
                  key={job.slug}
                  className="xp-item"
                  data-current={job.current || undefined}
                >
                  <div>
                    <p className="xp-period">
                      {job.current ? (
                        <span className="xp-live" aria-label="Current role" />
                      ) : null}
                      {job.period}
                    </p>
                    {job.location ? (
                      <p className="meta mt-1">{job.location}</p>
                    ) : null}
                  </div>

                  <div className="min-w-0">
                    <h3 className="xp-role">
                      {job.role}{" "}
                      <span className="xp-company">— {job.company}</span>
                    </h3>

                    {job.highlights.length > 0 ? (
                      <div className="xp-highlights">
                        {job.highlights.map((highlight, i) => (
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
          </div>
        </section>
      ) : null}

      {/* ================================================================ */}
      {about && (about.education.length > 0 || about.certifications.length > 0) ? (
        <section
          className="section border-t border-line"
          aria-labelledby="about-credentials"
        >
          <div className="shell">
            <div className="section-head section-head-split">
              <h2 id="about-credentials" className="section-title">
                Education and certifications
              </h2>
              <p className="section-lede">
                Where the foundations came from, and what I have kept current
                since.
              </p>
            </div>

            <div className="credentials">
              {about.education.length > 0 ? (
                <div className="credential-group">
                  <h3 className="credential-heading">Education</h3>
                  <ul className="credential-list">
                    {about.education.map((item) => (
                      <li key={item.qualification} className="credential">
                        <p className="credential-title">{item.qualification}</p>
                        <p className="credential-meta">
                          {item.institution}
                          {item.period ? ` · ${item.period}` : ""}
                        </p>
                        {item.note ? (
                          <p className="credential-note">{item.note}</p>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {about.certifications.length > 0 ? (
                <div className="credential-group">
                  <h3 className="credential-heading">Certifications</h3>
                  <ul className="credential-list">
                    {about.certifications.map((item) => (
                      <li key={item.name} className="credential">
                        <p className="credential-title">{item.name}</p>
                        <p className="credential-meta">
                          {[item.issuer, item.year].filter(Boolean).join(" · ")}
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          </div>
        </section>
      ) : null}

      {/* ================================================================ */}
      {skills.length > 0 ? (
        <section
          className="section border-t border-line"
          aria-labelledby="about-skills"
        >
          <div className="shell">
            <div className="section-head section-head-split">
              <h2 id="about-skills" className="section-title">
                Tools and technologies
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
    </>
  );
}

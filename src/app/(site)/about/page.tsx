import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { MarkdocContent } from "@/components/content/MarkdocContent";
import { ArrowUpRight, Download } from "@/components/ui/Icons";
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

  return (
    <>
      <div className="page-header">
        <div className="shell">
          <div className="flex flex-col-reverse items-start gap-8 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0 flex-1">
              <h1 className="page-title">
                {about?.heading ?? site.name}
              </h1>
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
            </div>

            {site.portrait ? (
              <div className="hero-portrait">
                <Image
                  src={site.portrait}
                  alt={`Portrait of ${site.name}`}
                  width={480}
                  height={480}
                  priority
                  sizes="(max-width: 640px) 34vw, 15rem"
                />
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {about ? (
        <section className="section">
          <div className="shell">
            <MarkdocContent tree={about.doc.tree} />
          </div>
        </section>
      ) : null}

      {experience.length > 0 ? (
        <section
          className="section border-t border-line"
          aria-labelledby="about-experience"
        >
          <div className="shell">
            <div className="section-head">
              <h2 id="about-experience" className="section-title">
                Roles
              </h2>
            </div>

            <div className="timeline">
              {experience.map((job) => (
                <div
                  key={job.slug}
                  className="timeline-item"
                  data-current={job.current || undefined}
                >
                  <p className="numeric">
                    {job.period}
                    {job.location ? ` · ${job.location}` : ""}
                  </p>
                  <p className="timeline-role mt-1">
                    {job.role}{" "}
                    <span className="timeline-company">— {job.company}</span>
                  </p>

                  {job.highlights.length > 0 ? (
                    <div className="timeline-highlights">
                      {job.highlights.map((highlight, i) => (
                        <p key={i} className="timeline-highlight">
                          {highlight.caseStudy ? (
                            <>
                              {highlight.text}{" "}
                              <Link
                                href={`/work/${highlight.caseStudy}`}
                                className="link"
                              >
                                See the case study
                              </Link>
                            </>
                          ) : (
                            highlight.text
                          )}
                        </p>
                      ))}
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {skills.length > 0 ? (
        <section
          className="section border-t border-line"
          aria-labelledby="about-skills"
        >
          <div className="shell">
            <div className="section-head">
              <h2 id="about-skills" className="section-title">
                Tools and technologies
              </h2>
            </div>

            <div>
              {skills.map((group) => (
                <div key={group.slug} className="skill-group">
                  <p className="skill-group-name">{group.name}</p>
                  <ul className="skill-items">
                    {group.items.map((item) => (
                      <li key={item} className="tag">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </>
  );
}

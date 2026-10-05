import type { Metadata } from "next";

import { CaseStudyCard } from "@/components/content/CaseStudyCard";
import { StackExplorer } from "@/components/sections/StackExplorer";
import { getCaseStudies, getSkillGroups } from "@/lib/content";

export const metadata: Metadata = {
  title: "Work",
  description:
    "Selected case studies — multi-tenant SaaS architecture, logistics platforms, and AI-driven media verification.",
  alternates: { canonical: "/work" },
};

export default async function WorkPage() {
  const [caseStudies, skills] = await Promise.all([
    getCaseStudies(),
    getSkillGroups(),
  ]);

  return (
    <>
      <div className="page-header">
        <div className="shell page-head-split">
          {/* "Work" rather than "Case studies": it matches the nav, and these
              are a mix of employer work and a personal build. */}
          <h1 className="page-title">Work</h1>
          <div className="page-head-aside">
            <p className="page-lede">
              Four systems, covered properly — the problem each one solved, how
              it was architected, the trade-offs I made, and what shipped.
            </p>
          </div>
        </div>
      </div>

      <section className="section" aria-labelledby="work-index">
        <h2 id="work-index" className="sr-only">
          Case studies
        </h2>
        <div className="shell">
          {caseStudies.length === 0 ? (
            <p className="text-ink-muted">No case studies published yet.</p>
          ) : (
            <div className="work-grid reveal-stagger">
              {caseStudies.map((caseStudy, index) => (
                <CaseStudyCard
                  key={caseStudy.slug}
                  caseStudy={caseStudy}
                  featured={index === 0}
                  priority={index === 0}
                  headingLevel={2}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* The stack lives here, once, framed as evidence for the systems above
          rather than as a decorative list of logos on the home page. */}
      {skills.length > 0 ? (
        <section
          className="section border-t border-line"
          aria-labelledby="work-stack"
        >
          <div className="shell">
            <div className="section-head section-head-split">
              <h2 id="work-stack" className="section-title">
                What these were built with
              </h2>
              <p className="section-lede">
                Everything below shipped inside one of the four systems above.
                Nothing here is on the list because I read about it.
              </p>
            </div>

            <StackExplorer groups={skills} />
          </div>
        </section>
      ) : null}
    </>
  );
}

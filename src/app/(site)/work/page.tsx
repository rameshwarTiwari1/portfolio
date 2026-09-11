import type { Metadata } from "next";

import { CaseStudyCard } from "@/components/content/CaseStudyCard";
import { getCaseStudies } from "@/lib/content";

export const metadata: Metadata = {
  title: "Work",
  description:
    "Selected case studies — multi-tenant SaaS architecture, logistics platforms, and AI-driven media verification.",
  alternates: { canonical: "/work" },
};

export default async function WorkPage() {
  const caseStudies = await getCaseStudies();

  return (
    <>
      <div className="page-header">
        <div className="shell">
          <h1 className="page-title">Case studies</h1>
          <p className="page-lede">
            Four systems, covered properly — the problem each one solved, how it
            was architected, the trade-offs I made, and what shipped.
          </p>
        </div>
      </div>

      <section className="section">
        <div className="shell">
          {caseStudies.length === 0 ? (
            <p className="text-ink-muted">
              No case studies published yet.
            </p>
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
    </>
  );
}

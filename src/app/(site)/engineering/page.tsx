import type { Metadata } from "next";

import { ArticleRow } from "@/components/content/ArticleRow";
import { Rss } from "@/components/ui/Icons";
import { getAllTags, getArticles } from "@/lib/content";

export const metadata: Metadata = {
  title: "Engineering",
  description:
    "Long-form notes on multi-tenant architecture, background job processing, Postgres row-level security, and AWS infrastructure.",
  alternates: {
    canonical: "/engineering",
    types: { "application/rss+xml": "/engineering/rss.xml" },
  },
};

export default async function EngineeringPage() {
  const [articles, tags] = await Promise.all([getArticles(), getAllTags()]);

  return (
    <>
      <div className="page-header">
        <div className="shell page-head-split">
          <h1 className="page-title">Writing</h1>

          <div className="page-head-aside">
            <p className="page-lede">
              Architecture decisions explained through systems I have actually
              built — what the constraint was, what I chose, and what it cost.
            </p>

            {tags.length > 0 ? (
              <ul className="flex flex-wrap gap-2">
                {tags.map(({ tag, count }) => (
                  <li key={tag} className="tag">
                    {tag}
                    <span className="ml-1.5 text-ink-faint">{count}</span>
                  </li>
                ))}
              </ul>
            ) : null}

            <a href="/engineering/rss.xml" className="link-arrow">
              <Rss />
              Subscribe via RSS
            </a>
          </div>
        </div>
      </div>

      <section className="section">
        <div className="shell">
          {articles.length === 0 ? (
            <p className="text-ink-muted">No articles published yet.</p>
          ) : (
            <div className="flex flex-col">
              {articles.map((article) => (
                <ArticleRow key={article.slug} article={article} />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}

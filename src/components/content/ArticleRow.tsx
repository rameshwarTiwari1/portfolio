import Link from "next/link";

import type { ArticleSummary } from "@/lib/content";
import { formatDate, formatDateISO } from "@/lib/site";

export function ArticleRow({
  article,
  readingMinutes,
}: {
  article: ArticleSummary;
  readingMinutes?: number;
}) {
  return (
    <article className="article-row">
      <div className="article-row-meta">
        <time className="numeric" dateTime={formatDateISO(article.publishedAt)}>
          {formatDate(article.publishedAt)}
        </time>
        {readingMinutes ? (
          <span className="numeric">{readingMinutes} min</span>
        ) : null}
      </div>

      <div className="flex flex-col gap-2">
        <h2 className="article-row-title">
          <Link href={`/engineering/${article.slug}`}>{article.title}</Link>
        </h2>

        <p className="article-row-excerpt">{article.excerpt}</p>

        {article.tags.length > 0 ? (
          <ul className="mt-1 flex flex-wrap gap-2">
            {article.tags.map((tag) => (
              <li key={tag} className="tag">
                {tag}
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </article>
  );
}

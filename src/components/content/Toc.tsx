import type { TocEntry } from "@/lib/markdoc";

export function Toc({ entries }: { entries: TocEntry[] }) {
  if (entries.length < 3) return null;

  return (
    <nav className="toc" aria-label="On this page">
      <p className="toc-heading">On this page</p>
      {entries.map((entry) => (
        <a
          key={entry.id}
          href={`#${entry.id}`}
          className="toc-link"
          data-level={entry.level}
        >
          {entry.title}
        </a>
      ))}
    </nav>
  );
}

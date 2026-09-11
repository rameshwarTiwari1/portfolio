import Markdoc from "@markdoc/markdoc";
import { describe, expect, it } from "vitest";

import { renderDoc, slugify } from "@/lib/markdoc";

function parse(markdown: string) {
  return Markdoc.parse(markdown);
}

describe("slugify", () => {
  it("lowercases and hyphenates", () => {
    expect(slugify("The Trust Score")).toBe("the-trust-score");
  });

  it("strips punctuation", () => {
    expect(slugify("What's the cost? (honestly)")).toBe(
      "whats-the-cost-honestly",
    );
  });

  it("collapses repeated separators and trims edges", () => {
    expect(slugify("  Filter  first —  then search  ")).toBe(
      "filter-first-then-search",
    );
  });

  it("keeps digits", () => {
    expect(slugify("C2PA 2.1 provenance")).toBe("c2pa-21-provenance");
  });
});

describe("renderDoc", () => {
  it("builds a table of contents from headings", async () => {
    const doc = await renderDoc(
      parse("## First section\n\ntext\n\n### Nested\n\n## Second section\n"),
    );

    expect(doc.toc).toEqual([
      { id: "first-section", title: "First section", level: 2 },
      { id: "nested", title: "Nested", level: 3 },
      { id: "second-section", title: "Second section", level: 2 },
    ]);
  });

  it("counts words and derives a reading time of at least one minute", async () => {
    const doc = await renderDoc(parse("one two three four five"));

    expect(doc.wordCount).toBe(5);
    expect(doc.readingMinutes).toBe(1);
  });

  it("scales reading time with length", async () => {
    const doc = await renderDoc(parse(`${"word ".repeat(880)}`));

    expect(doc.readingMinutes).toBe(4);
  });

  it("highlights fenced code and keeps the raw source for copying", async () => {
    const doc = await renderDoc(
      parse('```ts\nconst answer: number = 42;\n```\n'),
    );

    const json = JSON.stringify(doc.tree);

    expect(json).toContain("CodeBlock");
    expect(json).toContain("shiki");
    expect(json).toContain("const answer: number = 42;");
  });

  it("falls back to plain text for an unknown language rather than throwing", async () => {
    const doc = await renderDoc(parse("```brainfuck\n+++.\n```\n"));

    expect(JSON.stringify(doc.tree)).toContain("CodeBlock");
  });

  it("marks external links as safe to open in a new tab", async () => {
    const doc = await renderDoc(parse("[C2PA](https://c2pa.org)"));
    const json = JSON.stringify(doc.tree);

    expect(json).toContain("noopener noreferrer");
    expect(json).toContain("_blank");
  });

  it("leaves internal links in the same tab", async () => {
    const doc = await renderDoc(parse("[work](/work)"));

    expect(JSON.stringify(doc.tree)).not.toContain("_blank");
  });

  it("accepts the { node } shape Keystatic returns", async () => {
    const doc = await renderDoc({ node: parse("## Wrapped") });

    expect(doc.toc).toEqual([{ id: "wrapped", title: "Wrapped", level: 2 }]);
  });
});

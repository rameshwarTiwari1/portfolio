import Markdoc, {
  Tag,
  type Node,
  type RenderableTreeNode,
  type Schema,
} from "@markdoc/markdoc";
import { createHighlighter, type Highlighter } from "shiki";

/* ------------------------------------------------------------------------ */
/* Shiki — build-time syntax highlighting. Zero client JS.                   */
/* ------------------------------------------------------------------------ */

const LANGS = [
  "typescript",
  "javascript",
  "tsx",
  "jsx",
  "json",
  "bash",
  "sql",
  "yaml",
  "docker",
  "nginx",
  "prisma",
  "http",
  "diff",
  "python",
  "css",
  "html",
] as const;

let highlighterPromise: Promise<Highlighter> | null = null;

function getHighlighter(): Promise<Highlighter> {
  highlighterPromise ??= createHighlighter({
    themes: ["vitesse-dark", "vitesse-light"],
    langs: [...LANGS],
  });
  return highlighterPromise;
}

/** Languages Shiki knows about, so an unknown fence degrades to plain text. */
const KNOWN = new Set<string>(LANGS);

async function highlight(code: string, lang: string): Promise<string> {
  const highlighter = await getHighlighter();
  const language = KNOWN.has(lang) ? lang : "text";

  return highlighter.codeToHtml(code, {
    lang: language,
    themes: {
      light: "vitesse-light",
      dark: "vitesse-dark",
    },
    // Emit CSS variables for both themes rather than baking one in, so the
    // theme toggle switches code colours with no re-render.
    defaultColor: false,
    cssVariablePrefix: "--sh-",
  });
}

/* ------------------------------------------------------------------------ */
/* Markdoc schema                                                            */
/* ------------------------------------------------------------------------ */

/** GitHub-style slug so heading anchors are stable and predictable. */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function textOf(node: Node): string {
  let out = "";
  for (const child of node.walk()) {
    if (child.type === "text" && typeof child.attributes.content === "string") {
      out += child.attributes.content;
    }
  }
  return out;
}

const heading: Schema = {
  children: ["inline"],
  attributes: {
    level: { type: Number, required: true },
    id: { type: String },
  },
  transform(node, config) {
    const attrs = node.transformAttributes(config);
    const children = node.transformChildren(config);
    const level = Math.min(Math.max(Number(node.attributes.level) || 2, 2), 4);
    const id = slugify(textOf(node));

    return new Markdoc.Tag("Heading", { ...attrs, level, id }, children);
  },
};

const fence: Schema = {
  attributes: {
    content: { type: String },
    language: { type: String },
  },
  transform(node) {
    const content = String(node.attributes.content ?? "").replace(/\n$/, "");
    const language = String(node.attributes.language ?? "text").toLowerCase();
    // Placeholder — resolved asynchronously by `highlightTree` below.
    return new Markdoc.Tag("CodeBlock", { content, language }, []);
  },
};

const link: Schema = {
  children: ["inline"],
  attributes: {
    href: { type: String, required: true },
    title: { type: String },
  },
  transform(node, config) {
    const attrs = node.transformAttributes(config);
    const children = node.transformChildren(config);
    const href = String(node.attributes.href ?? "");
    const external = /^https?:\/\//.test(href);

    return new Markdoc.Tag(
      "a",
      {
        ...attrs,
        ...(external
          ? { target: "_blank", rel: "noopener noreferrer" }
          : {}),
      },
      children,
    );
  },
};

const image: Schema = {
  attributes: {
    src: { type: String, required: true },
    alt: { type: String },
    title: { type: String },
  },
  transform(node, config) {
    const attrs = node.transformAttributes(config);
    return new Markdoc.Tag("Figure", attrs, []);
  },
};

const callout: Schema = {
  render: "Callout",
  children: ["paragraph", "list", "inline"],
  attributes: {
    type: {
      type: String,
      default: "note",
      matches: ["note", "warn", "error"],
    },
  },
};

const diagram: Schema = {
  render: "Diagram",
  children: ["paragraph", "inline"],
  attributes: {
    src: { type: String, required: true },
    alt: { type: String, required: true },
    caption: { type: String },
  },
};

export const markdocConfig = {
  nodes: { heading, fence, link, image },
  tags: { callout, diagram },
};

/* ------------------------------------------------------------------------ */
/* Async post-pass: swap CodeBlock placeholders for highlighted markup        */
/* ------------------------------------------------------------------------ */

function isTag(node: unknown): node is Tag {
  return (
    typeof node === "object" &&
    node !== null &&
    !Array.isArray(node) &&
    "name" in node &&
    "attributes" in node &&
    "children" in node
  );
}

async function highlightNode(
  node: RenderableTreeNode,
): Promise<RenderableTreeNode> {
  if (!isTag(node)) return node;

  if (node.name === "CodeBlock") {
    const content = String(node.attributes.content ?? "");
    const language = String(node.attributes.language ?? "text");
    const html = await highlight(content, language);

    return new Tag("CodeBlock", { html, language, raw: content }, []);
  }

  const children = await Promise.all(
    (node.children ?? []).map(highlightNode),
  );

  return new Tag(node.name, node.attributes, children);
}

/* ------------------------------------------------------------------------ */
/* Public API                                                                */
/* ------------------------------------------------------------------------ */

export interface TocEntry {
  id: string;
  title: string;
  level: number;
}

export interface RenderedDoc {
  tree: RenderableTreeNode;
  toc: TocEntry[];
  readingMinutes: number;
  wordCount: number;
}

/**
 * Transform a Keystatic Markdoc AST into a renderable tree with syntax
 * highlighting already applied, plus a table of contents and reading time.
 *
 * Build-time only — never call this from a client component.
 */
/** Keystatic hands back either the AST directly or wrapped as `{ node }`. */
export type DocSource = Node | { node: Node };

function unwrap(source: DocSource): Node {
  return "node" in source ? (source as { node: Node }).node : (source as Node);
}

export async function renderDoc(source: DocSource): Promise<RenderedDoc> {
  const node = unwrap(source);
  const raw = Markdoc.transform(node, markdocConfig);
  const tree = await highlightNode(raw);

  const toc: TocEntry[] = [];
  let words = 0;

  for (const child of node.walk()) {
    if (child.type === "heading") {
      const title = textOf(child).trim();
      if (title) {
        toc.push({
          id: slugify(title),
          title,
          level: Math.min(Math.max(Number(child.attributes.level) || 2, 2), 4),
        });
      }
    }
    if (child.type === "text" && typeof child.attributes.content === "string") {
      words += child.attributes.content.trim().split(/\s+/).filter(Boolean)
        .length;
    }
  }

  return {
    tree,
    toc,
    wordCount: words,
    // 220 wpm — realistic for dense technical prose.
    readingMinutes: Math.max(1, Math.round(words / 220)),
  };
}

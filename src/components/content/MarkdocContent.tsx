import Markdoc, { type RenderableTreeNode } from "@markdoc/markdoc";
import Image from "next/image";
import * as React from "react";
import type { ReactNode } from "react";

import { CopyButton } from "@/components/content/CopyButton";

/* --------------------------------------------------------------------- */
/* Custom nodes                                                           */
/* --------------------------------------------------------------------- */

function Heading({
  level,
  id,
  children,
}: {
  level: number;
  id: string;
  children?: ReactNode;
}) {
  const Tag = `h${Math.min(Math.max(level, 2), 4)}` as "h2" | "h3" | "h4";

  return (
    <Tag id={id} data-heading="">
      {/*
        Hidden from the accessibility tree so it does not pollute the heading's
        accessible name. Not focusable, so hiding it is safe.
      */}
      <a href={`#${id}`} className="heading-anchor" aria-hidden="true" tabIndex={-1}>
        #
      </a>
      {children}
    </Tag>
  );
}

function CodeBlock({
  html,
  language,
  raw,
}: {
  html: string;
  language: string;
  raw: string;
}) {
  return (
    <div className="code-block">
      <div className="code-block-bar">
        <span className="code-block-lang">{language}</span>
        <CopyButton value={raw} />
      </div>
      {/* Shiki output, generated at build time from repo content. */}
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
}

function Callout({
  type = "note",
  children,
}: {
  type?: "note" | "warn" | "error";
  children?: ReactNode;
}) {
  const className =
    type === "warn"
      ? "callout callout-warn"
      : type === "error"
        ? "callout callout-err"
        : "callout";

  return (
    <div className={className} role="note">
      <div>{children}</div>
    </div>
  );
}

function Figure({
  src,
  alt = "",
  title,
}: {
  src: string;
  alt?: string;
  title?: string;
}) {
  return (
    <figure className="content-figure">
      <Image
        src={src}
        alt={alt}
        width={1600}
        height={900}
        sizes="(max-width: 768px) 100vw, 68ch"
      />
      {title ? <figcaption>{title}</figcaption> : null}
    </figure>
  );
}

/**
 * Architecture diagrams. Scroll horizontally on narrow screens rather than
 * shrinking to illegibility.
 */
function Diagram({
  src,
  alt,
  caption,
}: {
  src: string;
  alt: string;
  caption?: string;
}) {
  return (
    <figure className="diagram">
      <div className="diagram-scroll">
        <Image src={src} alt={alt} width={1600} height={900} sizes="100vw" />
      </div>
      {caption ? (
        <figcaption className="diagram-caption">{caption}</figcaption>
      ) : null}
    </figure>
  );
}

const components = { Heading, CodeBlock, Callout, Figure, Diagram };

/* --------------------------------------------------------------------- */

export function MarkdocContent({
  tree,
  className = "prose",
}: {
  tree: RenderableTreeNode;
  className?: string;
}) {
  return (
    <div className={className}>
      {Markdoc.renderers.react(tree, React, { components })}
    </div>
  );
}

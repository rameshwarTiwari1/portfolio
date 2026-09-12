# Rameshwar Tiwari — Portfolio

Personal portfolio and engineering-writing site. Two pillars on one domain:
a recruiter-facing core (hero → case studies → experience → contact) and an
Engineering section for long-form technical writing.

**Live:** `rameshwartiwari.dev` · **Admin:** `/keystatic`

---

## Stack

| Layer | Choice | Why |
|---|---|---|
| Framework | Next.js 16 (App Router) + React 19 | Static generation for every page |
| Language | TypeScript, `strict` | No `any` in committed code |
| Styling | Tailwind CSS v4 (CSS-first) | All tokens in one file, no JS config |
| Content | Keystatic → Markdoc in `/content` | Git-backed CMS, **no database** |
| Highlighting | Shiki (build-time) | Zero client JS for code blocks |
| Mail | Nodemailer → Gmail SMTP | Server Action, no API route |
| Motion | CSS scroll-driven animations + minimal JS | CSS first; JS only for pointer tracking |
| Tests | Vitest (unit) + Playwright (e2e) | |
| Deploy | Vercel, auto-deploy from `main` | |

**There is no database and no persistent backend.** If a feature seems to need
one, it is out of scope — raise it rather than adding a DB.

---

## Audience

**This is a portfolio, not a sales site.** The visitor is a hiring manager or a
peer. They want depth, judgement, and evidence — not an offer.

**Every claim must be checkable.** Metrics link to the case study that produced
them. If a number cannot be substantiated, cut it rather than soften it.

### The parked freelance surface

A full services/enquiry flow exists but is switched off:

- `src/app/(site)/_hire/` — the leading underscore makes it a private folder,
  so `/hire` does not route. The code is intact, not deleted.
- `src/lib/services.ts` and `src/components/content/EnquiryForm.tsx` are kept
  for the same reason.
- CTAs are commented out in `Header`, `Footer`, `lib/site.ts` (nav) and the
  home page, each marked `freelance CTA`.
- `tests/e2e/hire.spec.ts` is `test.skip`-ed wholesale.

To bring it back: rename `_hire` → `hire`, uncomment the four CTA blocks and
the nav entry, remove the skip in the spec, and re-add `/hire` to
`tests/e2e/routes.ts`. Do not delete any of it without being asked.

---

## Non-negotiable rules

### 0. Visual identity

Deep teal ground, warm gold signal. One accent, never two.

- The neutral ramp is **teal-tinted**, not blue-grey — that tint is what stops
  the dark theme reading as the same near-black as every other dev portfolio.
- Gold is the only accent. Dark mode uses the bright gold
  (`--signal-bright`); light mode drops to the deep amber (`--signal-deep`)
  because the bright gold fails contrast on white. Same hue, different job.
- Accent marks **one phrase**, not whole headlines and not every heading.
- Code highlighting is Vitesse (warm) to sit with the palette, not GitHub.

Changing the identity means editing the primitives and theme blocks at the top
of `globals.css` and nothing else. If a colour change needs edits in a
component, the token system has been bypassed — fix that instead.

### 0b. Design floor — the things that make it look generated

These were violations in the first build. Do not reintroduce them.

- **No tracked uppercase eyebrow on every section.** One `.kicker` marks a
  section as a peak; applying it everywhere is grammar, not emphasis.
- **No gradient text.** Emphasis comes from weight, size, or the accent colour
  on a specific phrase (`.hero-title em`).
- **No hero-metric template** (big number / small label / four across). The
  `.proof` row states claims in prose instead.
- **No identical entrance animation on every element.** One authored moment —
  the hero's architecture diagram drawing itself — plus scroll-linked stagger.
- **No monospace as a costume for "technical".** `--font-mono` is for code,
  data, and measurement only (`.numeric`, `.code-block`, diagram labels).
- **No decorative tiled grid backgrounds.** A grid overlay belongs on an actual
  canvas or blueprint surface, not behind a hero.
- **No bounce or elastic easing.** `--ease-out-expo` is the house curve.
- **Vary density between sections.** `.section`, `.section-tight`,
  `.section-wide` exist so the page has rhythm rather than uniform padding.

Verify with the Impeccable detector before claiming a UI change is done:

```bash
~/.claude/skills/impeccable/scripts/bin/windows-x64/impeccable.exe detect --json <files>
```

### 0c. Two mistakes that cost real bugs here

**Renaming a component class is a cross-page change.** The redesign renamed
`.timeline*` → `.xp*` and dropped `.stat*` and `.contact-grid` from
`globals.css`, but `/about`, `/contact` and `/work/[slug]` still referenced
them. Those sections rendered as bare, unstyled markup and nothing failed.
Before deleting a class, grep the whole of `src` for it.

**Never parse a computed colour as a string.** Chrome returns `lab()`,
`oklch()` or `color(srgb …)` from `getComputedStyle` depending on how the
value was authored. A regex for `rgb()` returns null, the check gets skipped,
and the audit reports "0 problems" having measured nothing. Paint the colour
onto a 1×1 canvas and read the pixel instead — see `tests/e2e/contrast.ts`.

### 1. Design tokens are the only source of visual truth

Every color, size, radius, duration, and font lives in
`src/app/globals.css`. That file is the design system.

```tsx
// NEVER
<div className="bg-[#0a0a0c] text-[15px] rounded-[8px] duration-[240ms]">
<div style={{ color: "#4d7cfe" }}>

// ALWAYS
<div className="bg-canvas text-base rounded-md">
```

- No hex/rgb/oklch literals in `.tsx` files. Ever.
- No arbitrary-value Tailwind brackets for anything a token covers.
- Need a new value? Add a token to `globals.css` first, then use it.
- Colors are semantic (`canvas`, `surface`, `ink`, `ink-muted`, `accent`),
  never literal (`gray-900`, `blue-500`). Tailwind's default palette is not used.

### 2. Repeated patterns become component classes

Three or more usages of the same utility cluster → promote it to
`@layer components` in `globals.css` (`.btn`, `.card`, `.tag`, `.prose`).
JSX should stay readable. Utility soup is a review blocker.

### 3. Server Components by default

`"use client"` requires a real reason: state, effects, event handlers, or
browser APIs. Push it to the leaves — never mark a page or layout as a client
component. Content pages must ship no client JS beyond the nav and theme toggle.

### 4. Everything is statically generated

No `force-dynamic`, no runtime data fetching, no client-side content loading.
Content is read from the filesystem at build time. If a page can't be static,
it needs discussion first.

### 5. Content lives in `/content`, never in JSX

Copy, project data, experience, skills, and nav all come from Keystatic
collections and singletons. Hardcoding content in a component means it can't be
edited from `/keystatic` — that defeats the entire architecture.

### 6. Accessibility is a build requirement, not a polish pass

- Semantic landmarks (`header`/`nav`/`main`/`footer`), one `h1` per page,
  no skipped heading levels
- WCAG AA contrast in **both** themes
- Visible `:focus-visible` on every interactive element
- All interactive elements keyboard-reachable, 44×44px minimum touch target
- `prefers-reduced-motion` respected — already handled globally in `globals.css`
- Every image needs meaningful `alt`; decorative images get `alt=""`

### 7. Responsive: mobile-first, no exceptions

Base styles target 320px. Layer up with `sm: md: lg: xl:`.
Never write desktop-first with `max-*` overrides.

Verified breakpoints (all covered by the Playwright suite):

| Device | Width |
|---|---|
| iPhone SE | 320 |
| iPhone 14 Pro | 393 |
| iPad Mini (portrait) | 768 |
| iPad Pro / laptop | 1024 |
| Desktop | 1440 |
| Ultrawide | 1920 |

**The page body must never scroll horizontally at any width.** Wide content
(tables, code blocks, diagrams) scrolls inside its own `overflow-x-auto`
container. There is an e2e test asserting this on every route × viewport.

### 8. Performance budget

Lighthouse ≥ 95 on all four categories, and:

- LCP < 1.8s · CLS < 0.05 · INP < 200ms
- Fonts self-hosted via `next/font` — no external font requests, `display: swap`
- Images through `next/image` with explicit `width`/`height` (prevents CLS)
- No JS library added for something CSS can do

### 9. Secrets

`.env.local` is git-ignored and never committed. Required vars are documented
in `.env.example` with placeholder values only. Never log or echo the SMTP
password. Never put a secret in a `NEXT_PUBLIC_*` variable.

---

## Directory map

```
content/                    ← Keystatic-managed. Edit via /keystatic, not by hand.
  case-studies/*/index.mdoc
  articles/*/index.mdoc
  singletons/{site,about}.json
  experience/*.json
src/
  app/
    globals.css             ← THE design system. All tokens.
    layout.tsx              ← Fonts, theme bootstrap, metadata
    (site)/                 ← Public routes (shared header/footer)
    keystatic/              ← Admin UI route
    api/                    ← Keystatic's GitHub OAuth handlers only
  components/
    ui/                     ← Primitives (Button, Tag, Card…)
    layout/                 ← Header, Footer, ThemeToggle
    content/                ← Markdoc renderers, CaseStudyCard, ArticleCard
    sections/               ← ArchitectureDiagram, StackExplorer
  lib/
    content.ts              ← Filesystem content reader (build-time only)
    markdoc.ts              ← Markdoc config + Shiki
    mail.ts                 ← Nodemailer transport
    rate-limit.ts           ← In-memory limiter
    schema.ts               ← Zod schemas
  lib/services.ts           ← Services, engagements, process (positioning, not content)
  actions/contact.ts        ← Contact + enquiry Server Actions
tests/
  unit/                     ← Vitest
  e2e/                      ← Playwright
keystatic.config.ts         ← Content model
```

---

## Commands

```bash
npm run dev            # Dev server → localhost:3000 (admin at /keystatic)
npm run build          # Production build — must pass before any commit
npm run typecheck      # tsc --noEmit
npm run lint           # ESLint
npm run test           # Vitest unit tests
npm run test:e2e       # Playwright, all viewports
npm run verify         # typecheck + lint + test + build. Run before pushing.
npm run audit:ui       # every route x both themes x 4 viewports:
                       # overflow, clipping, touch targets, WCAG contrast.
                       # Needs a server on :3100 (AUDIT_PORT overrides).
```

---

## Definition of done

A change is not complete until:

1. `npm run verify` passes clean
2. `npm run test:e2e` passes on all seven device profiles
3. It works in **both** light and dark themes
4. No horizontal scroll at 320px
5. Keyboard-navigable, with visible focus
6. No new hardcoded visual values
7. `npm run audit:ui` reports 0 problems

Do not report work as finished without running these. If a check fails and the
fix is out of scope, say so explicitly rather than staying silent.

---

## Content conventions

**Case studies** follow a fixed narrative order — do not reorder:
Problem → Architecture → Solution → Challenges → Outcome.

Architecture diagrams are authored as **inline SVG** using theme tokens
(`currentColor`, `var(--accent)`), never as raster screenshots. They must be
legible in both themes and must scroll horizontally on mobile rather than shrink
to unreadability.

**Writing voice:** direct and technical. State the decision and the reason.
No marketing language, no "passionate about", no exclamation marks.
Numbers need a source — if a metric can't be substantiated, cut it.

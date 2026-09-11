# Rameshwar Tiwari — Portfolio

Personal portfolio and engineering-writing site. One domain, two pillars: a
recruiter-facing core (case studies, experience, contact) and a long-form
Engineering section.

**Stack:** Next.js 16 · TypeScript · Tailwind v4 · Keystatic (git-based CMS) ·
Nodemailer → Gmail SMTP · Vercel

**No database.** Content lives in `/content` as Markdoc and JSON, committed to
git. The contact form sends mail directly and stores nothing.

---

## Quick start

```bash
npm install
cp .env.example .env.local     # then fill in the values
npm run dev
```

- Site → http://localhost:3000
- Admin → http://localhost:3000/keystatic

In development the admin writes to `/content` on disk directly. No GitHub
credentials needed to start editing.

---

## Before you deploy — 6 things

### 1. Add your photo

Drop a square image (480×480 or larger) at `public/images/portrait.jpg`, then
open `/keystatic` → **Site Settings** → **Portrait** and select it.

Until then the site renders an initials placeholder, which is by design — it
does not look broken.

### 2. Fix the social URLs

`content/singletons/site.json` currently has guessed GitHub and LinkedIn URLs.
Correct them in `/keystatic` → **Site Settings** → **Social links**, or edit the
file directly.

### 3. Set up Gmail SMTP

The contact form needs a Google **App Password** — not your account password.

1. Enable 2-Step Verification on the Google account
2. Go to https://myaccount.google.com/apppasswords
3. Create an app password, and put it in `.env.local` as `SMTP_PASSWORD`

```
SMTP_USER=rameshwar.kes@gmail.com
SMTP_PASSWORD=xxxx xxxx xxxx xxxx
CONTACT_TO=rameshwar.kes@gmail.com
```

Without these the form validates correctly but shows a fallback message with
your email address instead of sending. That is the intended failure mode.

### 4. Register the domain

The config assumes `rameshwartiwari.dev`. If you register something else, change
`NEXT_PUBLIC_SITE_URL` in your environment — it feeds canonical URLs, the
sitemap, RSS, and Open Graph tags.

### 5. Deploy to Vercel

```bash
git init && git add -A && git commit -m "Initial commit"
gh repo create portfolio --private --source=. --push
```

Then import the repo at vercel.com. Set the environment variables from
`.env.example` in the Vercel dashboard. Every push to `main` redeploys.

### 6. Enable the admin in production

Local mode does not work on Vercel — the filesystem is read-only. To edit from
the deployed site, set up Keystatic GitHub mode:

1. Follow https://keystatic.com/docs/github-mode to create a GitHub App
2. Add `NEXT_PUBLIC_GITHUB_OWNER`, `NEXT_PUBLIC_GITHUB_REPO`,
   `NEXT_PUBLIC_KEYSTATIC_GITHUB_APP_SLUG`, `KEYSTATIC_GITHUB_CLIENT_ID`,
   `KEYSTATIC_GITHUB_CLIENT_SECRET`, and `KEYSTATIC_SECRET` in Vercel

Publishing then commits to GitHub, which triggers a rebuild. About 40 seconds
from clicking save to the change being live.

---

## Commands

```bash
npm run dev          # Dev server
npm run build        # Production build
npm run typecheck    # tsc --noEmit
npm run lint         # ESLint
npm run test         # Vitest unit tests
npm run test:e2e     # Playwright, all 7 device profiles
npm run verify       # typecheck + lint + test + build
```

---

## Content

Everything is editable at `/keystatic` — nothing is hardcoded in components.

| Collection | Path | What it is |
|---|---|---|
| Case Studies | `content/case-studies/` | Long-form project write-ups |
| Engineering Articles | `content/articles/` | Technical writing |
| Experience | `content/experience/` | Roles, with highlights linked to case studies |
| Skill Groups | `content/skills/` | The stack section |
| Site Settings | `content/singletons/site.json` | Name, hero copy, contact, socials, SEO |
| About Page | `content/singletons/about/` | About page body |

**Case studies follow a fixed structure** — Problem → Architecture → Solution →
Challenges → Outcome. Keep it. It is the reason the write-ups read as credible
rather than as a list of technologies.

**Articles are drafts by default.** Untick *Draft* to publish. Drafts are visible
in `npm run dev` and excluded from production builds.

### Custom Markdoc tags

````markdown
{% callout type="note" %}
A highlighted aside. Types: note, warn, error.
{% /callout %}

{% diagram src="/images/articles/arch.svg" alt="Request flow" caption="How a request is routed" /%}
````

Diagrams scroll horizontally on mobile instead of shrinking to illegibility.
Prefer SVG so they stay sharp and readable in both themes.

---

## Design system

All design tokens live in `src/app/globals.css`. Colour, type scale, spacing,
radii, and motion are defined once as CSS custom properties and consumed through
Tailwind v4's `@theme` block.

**No hardcoded visual values in components.** No hex codes, no arbitrary pixel
values. Add a token first, then use it. See `CLAUDE.md` for the full rules.

Colours are semantic — `canvas`, `surface`, `ink`, `ink-muted`, `accent` — so
light and dark themes work from one set of class names.

---

## Testing

**Unit (Vitest)** — form validation, rate limiting, Markdoc rendering, date and
URL helpers.

**End-to-end (Playwright)** — runs against a real production build across seven
device profiles from a 320px phone to a 1920px desktop, plus mobile Safari.

Covers: every route renders · no horizontal scroll at any width · no element
escapes the viewport · navigation and mobile menu · theme toggle and persistence
· contact form validation and failure handling · landmarks, heading order, alt
text, skip link, focus visibility, reduced motion.

```bash
npm run test:e2e            # everything
npm run test:e2e -- --project=mobile-320
npm run test:e2e:ui         # interactive
```

---

## Performance

Every page is statically generated. No database, no runtime data fetching, no
client JS on content pages beyond the nav and theme toggle. Fonts are
self-hosted via `next/font`; code is highlighted at build time by Shiki.

Target: Lighthouse ≥ 95 across all four categories, LCP under 1.8s.

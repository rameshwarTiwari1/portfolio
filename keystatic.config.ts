import { config, fields, collection, singleton } from "@keystatic/core";

/**
 * Keystatic — git-backed CMS. No database.
 *
 * Local dev  : writes directly to /content on disk.
 * Production : commits to GitHub via OAuth; Vercel rebuilds on push.
 */

const GITHUB_OWNER = process.env.NEXT_PUBLIC_GITHUB_OWNER ?? "rameshwar";
const GITHUB_REPO = process.env.NEXT_PUBLIC_GITHUB_REPO ?? "portfolio";

const isProd =
  process.env.NODE_ENV === "production" &&
  process.env.NEXT_PUBLIC_KEYSTATIC_GITHUB_APP_SLUG;

/** Shared rich-text config so every body field behaves identically. */
const richText = (directory: string, publicPath: string) =>
  fields.markdoc({
    label: "Content",
    options: {
      image: { directory, publicPath },
      heading: [2, 3, 4],
    },
  });

export default config({
  storage: isProd
    ? { kind: "github", repo: { owner: GITHUB_OWNER, name: GITHUB_REPO } }
    : { kind: "local" },

  ui: {
    brand: { name: "Rameshwar Tiwari" },
    navigation: {
      Content: ["caseStudies", "articles"],
      Profile: ["about", "experience", "skillGroups"],
      Settings: ["site"],
    },
  },

  collections: {
    /* ---------------------------------------------------------------- */
    caseStudies: collection({
      label: "Case Studies",
      slugField: "title",
      path: "content/case-studies/*/",
      format: { contentField: "content" },
      entryLayout: "content",
      columns: ["title", "period"],
      schema: {
        title: fields.slug({
          name: { label: "Title", validation: { isRequired: true } },
          slug: { description: "URL segment, e.g. /work/vashix" },
        }),
        tagline: fields.text({
          label: "Tagline",
          description: "One line. What it is, in plain terms.",
          multiline: true,
          validation: { isRequired: true, length: { max: 180 } },
        }),
        role: fields.text({
          label: "Your role",
          description: 'e.g. "Solo architect & engineer"',
          validation: { isRequired: true },
        }),
        period: fields.text({
          label: "Period",
          description: 'e.g. "2025 — Present"',
          validation: { isRequired: true },
        }),
        featured: fields.checkbox({
          label: "Feature on home page",
          defaultValue: false,
        }),
        order: fields.number({
          label: "Sort order",
          description: "Lower shows first.",
          defaultValue: 10,
        }),
        cover: fields.image({
          label: "Cover image",
          directory: "public/images/case-studies",
          publicPath: "/images/case-studies/",
        }),
        stack: fields.array(fields.text({ label: "Technology" }), {
          label: "Tech stack",
          itemLabel: (p) => p.value ?? "",
        }),
        metrics: fields.array(
          fields.object({
            value: fields.text({
              label: "Value",
              description: 'e.g. "~40%"',
              validation: { isRequired: true },
            }),
            label: fields.text({
              label: "Label",
              description: 'e.g. "faster response time"',
              validation: { isRequired: true },
            }),
          }),
          {
            label: "Headline metrics",
            description: "Two to four. Only numbers you can defend.",
            itemLabel: (p) => `${p.fields.value.value} ${p.fields.label.value}`,
          },
        ),
        links: fields.object(
          {
            live: fields.url({ label: "Live URL" }),
            github: fields.url({ label: "GitHub URL" }),
          },
          { label: "Links" },
        ),
        summary: fields.text({
          label: "Card summary",
          description: "Shown on listing cards. 2—3 sentences.",
          multiline: true,
          validation: { isRequired: true, length: { max: 400 } },
        }),
        content: richText(
          "public/images/case-studies",
          "/images/case-studies/",
        ),
      },
    }),

    /* ---------------------------------------------------------------- */
    articles: collection({
      label: "Engineering Articles",
      slugField: "title",
      path: "content/articles/*/",
      format: { contentField: "content" },
      entryLayout: "content",
      columns: ["title", "publishedAt"],
      schema: {
        title: fields.slug({
          name: { label: "Title", validation: { isRequired: true } },
        }),
        excerpt: fields.text({
          label: "Excerpt",
          description: "Shown in listings and search results.",
          multiline: true,
          validation: { isRequired: true, length: { max: 300 } },
        }),
        publishedAt: fields.date({
          label: "Published",
          validation: { isRequired: true },
          defaultValue: { kind: "today" },
        }),
        updatedAt: fields.date({ label: "Last updated" }),
        tags: fields.array(fields.text({ label: "Tag" }), {
          label: "Tags",
          itemLabel: (p) => p.value ?? "",
        }),
        draft: fields.checkbox({
          label: "Draft",
          description: "Drafts are excluded from the production build.",
          defaultValue: true,
        }),
        content: richText("public/images/articles", "/images/articles/"),
      },
    }),

    /* ---------------------------------------------------------------- */
    experience: collection({
      label: "Experience",
      slugField: "company",
      path: "content/experience/*",
      format: { data: "json" },
      columns: ["company", "period"],
      schema: {
        company: fields.slug({
          name: { label: "Company", validation: { isRequired: true } },
        }),
        role: fields.text({
          label: "Role",
          validation: { isRequired: true },
        }),
        location: fields.text({ label: "Location" }),
        period: fields.text({
          label: "Period",
          description: 'e.g. "Feb 2025 — Present"',
          validation: { isRequired: true },
        }),
        order: fields.number({
          label: "Sort order",
          description: "Lower shows first. Most recent should be lowest.",
          defaultValue: 10,
        }),
        current: fields.checkbox({ label: "Current role" }),
        highlights: fields.array(
          fields.object({
            text: fields.text({
              label: "Highlight",
              multiline: true,
              validation: { isRequired: true },
            }),
            caseStudy: fields.relationship({
              label: "Links to case study",
              description: "Ties this responsibility to something you built.",
              collection: "caseStudies",
            }),
          }),
          {
            label: "Highlights",
            itemLabel: (p) => p.fields.text.value.slice(0, 60),
          },
        ),
      },
    }),

    /* ---------------------------------------------------------------- */
    skillGroups: collection({
      label: "Skill Groups",
      slugField: "name",
      path: "content/skills/*",
      format: { data: "json" },
      columns: ["name"],
      schema: {
        name: fields.slug({
          name: { label: "Group name", validation: { isRequired: true } },
        }),
        order: fields.number({ label: "Sort order", defaultValue: 10 }),
        note: fields.text({
          label: "What you use it for",
          description:
            "One sentence. Shown beside the list so the group means something.",
          multiline: true,
          validation: { length: { max: 220 } },
        }),
        items: fields.array(fields.text({ label: "Skill" }), {
          label: "Skills",
          itemLabel: (p) => p.value ?? "",
        }),
      },
    }),
  },

  singletons: {
    /* ---------------------------------------------------------------- */
    site: singleton({
      label: "Site Settings",
      path: "content/singletons/site",
      format: { data: "json" },
      schema: {
        name: fields.text({
          label: "Full name",
          validation: { isRequired: true },
        }),
        role: fields.text({
          label: "Role",
          description: "Shown under your name.",
          validation: { isRequired: true },
        }),
        location: fields.text({ label: "Location" }),
        availability: fields.text({
          label: "Availability",
          description: 'e.g. "Open to senior roles". Leave blank to hide.',
        }),
        heroHeadline: fields.text({
          label: "Hero headline",
          multiline: true,
          validation: { isRequired: true },
        }),
        heroSubline: fields.text({
          label: "Hero subline",
          multiline: true,
          validation: { isRequired: true },
        }),
        portrait: fields.image({
          label: "Portrait",
          directory: "public/images",
          publicPath: "/images/",
        }),
        email: fields.text({
          label: "Email",
          validation: { isRequired: true },
        }),
        phone: fields.text({ label: "Phone" }),
        resumeUrl: fields.text({
          label: "Resume path",
          description: "e.g. /rameshwar-tiwari-resume.pdf",
        }),
        socials: fields.array(
          fields.object({
            label: fields.text({
              label: "Label",
              validation: { isRequired: true },
            }),
            url: fields.url({
              label: "URL",
              validation: { isRequired: true },
            }),
          }),
          {
            label: "Social links",
            itemLabel: (p) => p.fields.label.value,
          },
        ),
        seo: fields.object(
          {
            title: fields.text({ label: "Default meta title" }),
            description: fields.text({
              label: "Default meta description",
              multiline: true,
            }),
          },
          { label: "SEO defaults" },
        ),
      },
    }),

    /* ---------------------------------------------------------------- */
    about: singleton({
      label: "About Page",
      path: "content/singletons/about",
      format: { contentField: "content" },
      schema: {
        heading: fields.text({
          label: "Heading",
          validation: { isRequired: true },
        }),
        lede: fields.text({
          label: "Lede",
          multiline: true,
          validation: { isRequired: true },
        }),
        education: fields.array(
          fields.object({
            qualification: fields.text({
              label: "Qualification",
              validation: { isRequired: true },
            }),
            institution: fields.text({
              label: "Institution",
              validation: { isRequired: true },
            }),
            period: fields.text({ label: "Period" }),
            note: fields.text({
              label: "Note",
              description: 'e.g. "CGPA 9.0/10 · Best Project Award"',
            }),
          }),
          {
            label: "Education",
            itemLabel: (p) => p.fields.qualification.value,
          },
        ),
        certifications: fields.array(
          fields.object({
            name: fields.text({
              label: "Certification",
              validation: { isRequired: true },
            }),
            issuer: fields.text({ label: "Issuer" }),
            year: fields.text({ label: "Year" }),
          }),
          {
            label: "Certifications",
            itemLabel: (p) => p.fields.name.value,
          },
        ),
        content: richText("public/images/about", "/images/about/"),
      },
    }),
  },
});

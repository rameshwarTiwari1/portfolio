/**
 * Services and engagement options for the hire page.
 *
 * Kept in code rather than Keystatic deliberately: this is positioning, not
 * content. It changes when the business changes, not weekly.
 */

export interface Service {
  title: string;
  body: string;
  includes: string[];
}

export const SERVICES: Service[] = [
  {
    title: "Multi-tenant SaaS builds",
    body: "A product that serves several customers from one deployment, with isolation you can defend to a security reviewer rather than hope holds.",
    includes: [
      "Tenancy model and data isolation enforced at the database layer",
      "Configurable RBAC that clients can adjust without a deploy",
      "Migration strategy that works across live tenants with no downtime",
    ],
  },
  {
    title: "Architecture review & rescue",
    body: "You have something running and it is getting harder to change. I read the code, find where the real cost is, and give you a prioritised plan rather than a rewrite pitch.",
    includes: [
      "Written findings ranked by cost to fix versus cost of leaving it",
      "Specific failure modes, with the query or code path that causes them",
      "A sequencing plan your existing team can execute",
    ],
  },
  {
    title: "AI & RAG integration",
    body: "Retrieval and LLM features wired into a real product — including an honest answer about when a database query is the better tool.",
    includes: [
      "Retrieval over pgvector or Pinecone, with pre-filtering that stays correct",
      "Chunking strategy built around your documents' actual structure",
      "Retrieval evaluation, so quality regressions are measurable not anecdotal",
    ],
  },
  {
    title: "Backend & infrastructure",
    body: "The layer underneath the product: queues, background processing, and AWS infrastructure that does not need a specialist to operate.",
    includes: [
      "BullMQ and Redis job pipelines with idempotency and dead-letter handling",
      "AWS provisioning — EC2, RDS, S3, SQS — behind Nginx, with CI/CD",
      "Observability, so failures page someone instead of going silent",
    ],
  },
];

export interface EngagementStep {
  title: string;
  body: string;
}

export const PROCESS: EngagementStep[] = [
  {
    title: "You send the brief",
    body: "What you are building, where it hurts, and roughly when you need it. A paragraph is enough to start.",
  },
  {
    title: "We talk for 30 minutes",
    body: "Free, and genuinely diagnostic. If I am not the right person, I will say so on that call rather than after an invoice.",
  },
  {
    title: "You get a written proposal",
    body: "Scope, approach, timeline, and a fixed price. No hourly ambiguity, and no line items you cannot evaluate.",
  },
  {
    title: "We build in visible increments",
    body: "Working software you can use at each stage, not a reveal at the end. You can stop between increments.",
  },
];

export const ENGAGEMENTS = [
  {
    name: "Architecture review",
    duration: "1—2 weeks",
    body: "A written assessment of an existing system with a prioritised action plan. The cheapest way to find out whether the expensive project is actually necessary.",
  },
  {
    name: "Project build",
    duration: "4—12 weeks",
    body: "Scoped delivery of a feature, service, or product from architecture through deployment. Fixed price against a written scope.",
  },
  {
    name: "Ongoing partner",
    duration: "Monthly",
    body: "Reserved capacity each month for teams that need senior engineering without a full-time hire.",
  },
] as const;

export const BUDGET_OPTIONS = [
  "Under $2k",
  "$2k — $5k",
  "$5k — $15k",
  "$15k+",
  "Not sure yet",
] as const;

export const PROJECT_TYPES = [
  "New build",
  "Existing system",
  "Architecture review",
  "AI / RAG feature",
  "Something else",
] as const;

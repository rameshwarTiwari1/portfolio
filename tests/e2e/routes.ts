/** Every public route, shared across the e2e suites. */
export const ROUTES = [
  { path: "/", name: "home" },
  { path: "/work", name: "work index" },
  { path: "/work/vashix", name: "case study" },
  { path: "/work/multi-tenant-enterprise-crm", name: "case study (crm)" },
  { path: "/engineering", name: "engineering index" },
  {
    path: "/engineering/postgres-row-level-security-multi-tenant",
    name: "article",
  },
  { path: "/about", name: "about" },
  { path: "/contact", name: "contact" },
  // { path: "/hire", name: "hire" }, — parked with the /hire page
] as const;

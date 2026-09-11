import { describe, expect, it } from "vitest";

import { absoluteUrl, formatDate, formatDateISO, jsonLd } from "@/lib/site";

describe("absoluteUrl", () => {
  it("builds an absolute URL from a path", () => {
    expect(absoluteUrl("/work")).toMatch(/^https?:\/\/.+\/work$/);
  });

  it("tolerates a path without a leading slash", () => {
    expect(absoluteUrl("work")).toBe(absoluteUrl("/work"));
  });

  it("defaults to the site root", () => {
    expect(absoluteUrl()).toMatch(/\/$/);
  });
});

describe("formatDate", () => {
  it("formats an ISO date readably", () => {
    expect(formatDate("2026-08-18")).toBe("18 Aug 2026");
  });

  it("returns the input unchanged when it is not a date", () => {
    expect(formatDate("not a date")).toBe("not a date");
  });

  it("returns an empty string for empty input", () => {
    expect(formatDate("")).toBe("");
  });
});

describe("formatDateISO", () => {
  it("produces a full ISO timestamp for datetime attributes", () => {
    expect(formatDateISO("2026-08-18")).toBe("2026-08-18T00:00:00.000Z");
  });
});

describe("jsonLd", () => {
  it("escapes < so content cannot terminate the script tag", () => {
    const output = jsonLd({ bio: "</script><script>alert(1)</script>" });

    expect(output).not.toContain("</script>");
    expect(output).toContain("\\u003c");
  });

  it("still parses back to the original data", () => {
    const data = { name: "Rameshwar Tiwari", tags: ["a", "b"] };

    expect(JSON.parse(jsonLd(data))).toEqual(data);
  });
});

import { describe, expect, it } from "vitest";

import { contactSchema } from "@/lib/schema";

const valid = {
  name: "Priya Sharma",
  email: "priya@example.com",
  company: "Example Ltd",
  message: "I would like to talk about a multi-tenant migration we are planning.",
  website: "",
  renderedAt: Date.now(),
};

describe("contactSchema", () => {
  it("accepts a well-formed submission", () => {
    expect(contactSchema.safeParse(valid).success).toBe(true);
  });

  it("trims surrounding whitespace on text fields", () => {
    const result = contactSchema.safeParse({ ...valid, name: "  Priya  " });

    expect(result.success).toBe(true);
    if (result.success) expect(result.data.name).toBe("Priya");
  });

  it("rejects a malformed email", () => {
    const result = contactSchema.safeParse({ ...valid, email: "priya@" });

    expect(result.success).toBe(false);
  });

  it("rejects a message that is too short to act on", () => {
    const result = contactSchema.safeParse({ ...valid, message: "hi" });

    expect(result.success).toBe(false);
  });

  it("rejects a message over the length cap", () => {
    const result = contactSchema.safeParse({
      ...valid,
      message: "x".repeat(4001),
    });

    expect(result.success).toBe(false);
  });

  it("treats company as optional", () => {
    const { company: _company, ...withoutCompany } = valid;
    void _company;

    expect(contactSchema.safeParse(withoutCompany).success).toBe(true);
  });

  it("rejects a filled honeypot", () => {
    const result = contactSchema.safeParse({
      ...valid,
      website: "http://spam.example",
    });

    expect(result.success).toBe(false);
  });

  it("coerces renderedAt from the string a form actually submits", () => {
    const result = contactSchema.safeParse({ ...valid, renderedAt: "1700000000000" });

    expect(result.success).toBe(true);
    if (result.success) expect(result.data.renderedAt).toBe(1_700_000_000_000);
  });

  it("reports one error per invalid field", () => {
    const result = contactSchema.safeParse({
      ...valid,
      name: "",
      email: "nope",
      message: "short",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      const fields = new Set(result.error.issues.map((i) => i.path[0]));
      expect(fields).toEqual(new Set(["name", "email", "message"]));
    }
  });
});

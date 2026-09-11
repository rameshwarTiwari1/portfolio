import { beforeEach, describe, expect, it } from "vitest";

import { rateLimit, resetRateLimits } from "@/lib/rate-limit";

const LIMIT = 3;
const WINDOW = 60_000;

describe("rateLimit", () => {
  beforeEach(() => resetRateLimits());

  it("allows requests up to the limit", () => {
    const results = Array.from({ length: LIMIT }, () =>
      rateLimit("ip", LIMIT, WINDOW, 1000),
    );

    expect(results.every((r) => r.allowed)).toBe(true);
    expect(results.map((r) => r.remaining)).toEqual([2, 1, 0]);
  });

  it("blocks the request after the limit is reached", () => {
    for (let i = 0; i < LIMIT; i += 1) rateLimit("ip", LIMIT, WINDOW, 1000);

    const blocked = rateLimit("ip", LIMIT, WINDOW, 1000);

    expect(blocked.allowed).toBe(false);
    expect(blocked.remaining).toBe(0);
    expect(blocked.retryAfterSeconds).toBe(60);
  });

  it("reports a shrinking retry-after as the window elapses", () => {
    for (let i = 0; i < LIMIT; i += 1) rateLimit("ip", LIMIT, WINDOW, 1000);

    expect(rateLimit("ip", LIMIT, WINDOW, 31_000).retryAfterSeconds).toBe(30);
  });

  it("starts a fresh window once the old one expires", () => {
    for (let i = 0; i < LIMIT; i += 1) rateLimit("ip", LIMIT, WINDOW, 1000);
    expect(rateLimit("ip", LIMIT, WINDOW, 1000).allowed).toBe(false);

    const afterWindow = rateLimit("ip", LIMIT, WINDOW, 61_001);

    expect(afterWindow.allowed).toBe(true);
    expect(afterWindow.remaining).toBe(LIMIT - 1);
  });

  it("tracks each key independently", () => {
    for (let i = 0; i < LIMIT; i += 1) rateLimit("a", LIMIT, WINDOW, 1000);

    expect(rateLimit("a", LIMIT, WINDOW, 1000).allowed).toBe(false);
    expect(rateLimit("b", LIMIT, WINDOW, 1000).allowed).toBe(true);
  });
});

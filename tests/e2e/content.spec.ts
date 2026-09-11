import { expect, test } from "@playwright/test";

import { ROUTES } from "./routes";

test.describe("pages render", () => {
  for (const route of ROUTES) {
    test(`${route.name} loads with a single h1 and a title`, async ({ page }) => {
      const response = await page.goto(route.path);

      expect(response?.status()).toBe(200);
      await expect(page.locator("h1")).toHaveCount(1);
      await expect(page).toHaveTitle(/.+/);
      await expect(page.locator("main")).toBeVisible();
      await expect(page.locator("footer")).toBeVisible();
    });
  }

  test("home shows the hero, case studies and articles", async ({ page }) => {
    await page.goto("/");

    await expect(page.locator("h1")).toContainText("multi-tenant");
    await expect(
      page.getByRole("link", { name: /see the work/i }).first(),
    ).toBeVisible();
    await expect(page.getByRole("heading", { name: /four systems/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /notes on architecture/i })).toBeVisible();
  });

  test("work index lists all four case studies", async ({ page }) => {
    await page.goto("/work");

    for (const title of [
      "Vashix",
      "Multi-Tenant Enterprise CRM",
      "Courier Hub",
      "Real-Time Task Platform",
    ]) {
      await expect(page.getByRole("link", { name: title, exact: true })).toBeVisible();
    }
  });

  test("a case study follows the Problem → Outcome structure", async ({ page }) => {
    await page.goto("/work/vashix");

    for (const heading of ["The problem", "Architecture", "Challenges", "Outcome"]) {
      await expect(
        page.getByRole("heading", { name: heading, exact: true }),
      ).toBeVisible();
    }
  });

  test("an article renders highlighted code with a copy control", async ({ page }) => {
    await page.goto("/engineering/postgres-row-level-security-multi-tenant");

    await expect(page.locator(".shiki").first()).toBeVisible();
    await expect(page.locator(".code-block-lang").first()).toBeVisible();
    await expect(page.getByRole("button", { name: /copy code/i }).first()).toBeVisible();
  });

  test("headings get stable anchor ids for deep linking", async ({ page }) => {
    await page.goto("/engineering/postgres-row-level-security-multi-tenant");

    await expect(page.locator("#the-question-to-ask-first")).toHaveCount(0);
    await expect(page.locator("h2[id]").first()).toBeVisible();
  });

  test("engineering index lists published articles and hides drafts", async ({ page }) => {
    await page.goto("/engineering");

    await expect(page.locator(".article-row")).toHaveCount(3);
  });

  test("RSS feed is valid XML and lists the articles", async ({ request }) => {
    const response = await request.get("/engineering/rss.xml");

    expect(response.status()).toBe(200);
    expect(response.headers()["content-type"]).toContain("xml");

    const body = await response.text();
    expect(body).toContain("<?xml");
    expect(body).toContain("<rss");
    expect(body.match(/<item>/g)?.length).toBe(3);
  });

  test("sitemap and robots are served", async ({ request }) => {
    const sitemap = await request.get("/sitemap.xml");
    expect(sitemap.status()).toBe(200);
    expect(await sitemap.text()).toContain("/work/vashix");

    const robots = await request.get("/robots.txt");
    expect(robots.status()).toBe(200);
    expect(await robots.text()).toContain("Sitemap:");
  });

  test("unknown routes return a usable 404", async ({ page }) => {
    const response = await page.goto("/this-page-does-not-exist");

    expect(response?.status()).toBe(404);
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      /does not exist/i,
    );
    await expect(page.getByRole("link", { name: /back home/i })).toBeVisible();
  });

  test("pages carry Person or Article structured data", async ({ page }) => {
    await page.goto("/");
    const ld = await page.locator('script[type="application/ld+json"]').first().textContent();

    expect(ld).toBeTruthy();
    const parsed = JSON.parse(ld!);
    expect(parsed["@type"]).toBe("Person");
    expect(parsed.name).toBe("Rameshwar Tiwari");
  });
});

test.describe("portfolio positioning", () => {
  test("the freelance surface is parked and unreachable", async ({ request }) => {
    expect((await request.get("/hire")).status()).toBe(404);
  });

  test("no hire-me CTA appears anywhere on the home page", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("link", { name: /hire me/i })).toHaveCount(0);
    await expect(page.getByRole("link", { name: /start a project/i })).toHaveCount(0);
  });

  test("the nav offers only portfolio destinations", async ({ page, viewport }) => {
    test.skip(!viewport || viewport.width < 960, "mobile uses the menu panel");

    await page.goto("/");
    const nav = page.getByRole("navigation", { name: "Primary" });

    await expect(nav.getByRole("link")).toHaveCount(4);
    await expect(nav.getByRole("link", { name: "Services" })).toHaveCount(0);
  });

  test("the hero routes to work and the resume", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("link", { name: /see the work/i }).first()).toBeVisible();
    await expect(page.getByRole("link", { name: /^resume$/i })).toBeVisible();
  });
});

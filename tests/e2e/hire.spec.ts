import { expect, test } from "@playwright/test";

/**
 * The freelance surface is parked: src/app/(site)/_hire is a private folder,
 * so /hire does not route. These specs are kept green-by-skip so they come
 * back with the page rather than having to be rewritten.
 */
test.describe.configure({ mode: "default" });
test.skip(true, "/hire is parked — see src/app/(site)/_hire");

test.describe("hire page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/hire");
  });

  test("leads with the offer and a way to start", async ({ page }) => {
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      /senior engineering/i,
    );
    await expect(
      page.getByRole("link", { name: /tell me about your project/i }),
    ).toBeVisible();
  });

  test("lists the services and how engagements work", async ({ page }) => {
    await expect(page.getByRole("heading", { name: /four kinds of work/i })).toBeVisible();
    await expect(page.locator(".service")).toHaveCount(4);
    await expect(page.locator(".process-step")).toHaveCount(4);
  });

  test("the brief form captures budget and project type", async ({ page }) => {
    await expect(page.getByRole("group", { name: /kind of work/i })).toBeVisible();
    await expect(page.getByRole("group", { name: /budget/i })).toBeVisible();
    await expect(page.getByRole("radio", { name: "New build" })).toBeVisible();
    await expect(page.getByRole("radio", { name: "$5k — $15k" })).toBeVisible();
  });

  test("budget choices are selectable by keyboard", async ({ page }) => {
    const option = page.getByRole("radio", { name: "$2k — $5k" });
    await option.check();
    await expect(option).toBeChecked();
  });

  test("the hero CTA jumps to the brief form", async ({ page }) => {
    await page.getByRole("link", { name: /tell me about your project/i }).click();
    await expect(page).toHaveURL(/#brief$/);

    // The anchor brings the brief section to the top of the viewport. On a
    // phone the textarea itself sits below the fold, which is correct.
    await expect(
      page.getByRole("heading", { name: /tell me what you are building/i }),
    ).toBeInViewport();
  });

  test("carries ProfessionalService structured data", async ({ page }) => {
    const ld = await page
      .locator('script[type="application/ld+json"]')
      .first()
      .textContent();

    expect(JSON.parse(ld!)["@type"]).toBe("ProfessionalService");
  });
});

test.describe("hire CTA reachability", () => {
  test("the header exposes Hire me on desktop", async ({ page, viewport }) => {
    test.skip(!viewport || viewport.width < 960, "mobile shows it in the menu");

    await page.goto("/");
    await expect(
      page.getByRole("banner").getByRole("link", { name: /^hire me$/i }),
    ).toBeVisible();
  });

  test("the mobile menu exposes the hire CTA", async ({ page, viewport }) => {
    test.skip(!viewport || viewport.width >= 960, "desktop shows it inline");

    await page.goto("/");
    await page.getByTestId("nav-toggle").click();
    await expect(
      page.getByTestId("mobile-nav").getByRole("link", { name: /hire me for a project/i }),
    ).toBeVisible();
  });

  test("the home hero offers both audiences a path", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("link", { name: /hire me for a project/i }).first()).toBeVisible();
    await expect(page.getByRole("link", { name: /see the work/i })).toBeVisible();
  });
});

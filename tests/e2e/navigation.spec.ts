import { expect, test } from "@playwright/test";

test.describe("navigation", () => {
  test("desktop nav moves between sections", async ({ page, viewport }) => {
    test.skip(!viewport || viewport.width < 960, "mobile uses the menu panel");

    await page.goto("/");

    const nav = page.getByRole("navigation", { name: "Primary" });

    await nav.getByRole("link", { name: "Work" }).click();
    await expect(page).toHaveURL(/#work$/);

    await nav.getByRole("link", { name: "Writing" }).click();
    await expect(page).toHaveURL(/#writing$/);

    await nav.getByRole("link", { name: "Contact" }).click();
    await expect(page).toHaveURL(/#contact$/);
  });

  test("active section is marked for assistive tech", async ({ page, viewport }) => {
    test.skip(!viewport || viewport.width < 960, "mobile uses the menu panel");

    // A case study is still "Work" even though the URL is /work/vashix.
    await page.goto("/work/vashix");

    const active = page
      .getByRole("navigation", { name: "Primary" })
      .getByRole("link", { name: "Work" });

    await expect(active).toHaveAttribute("aria-current", "location");
  });

  test("mobile menu opens, navigates, and closes", async ({ page, viewport }) => {
    test.skip(!viewport || viewport.width >= 960, "desktop shows inline nav");

    await page.goto("/");

    const toggle = page.getByTestId("nav-toggle");
    const panel = page.getByTestId("mobile-nav");

    await expect(panel).toBeHidden();
    await expect(toggle).toHaveAttribute("aria-expanded", "false");

    await toggle.click();
    await expect(panel).toBeVisible();
    await expect(toggle).toHaveAttribute("aria-expanded", "true");

    await panel.getByRole("link", { name: "Writing" }).click();
    await expect(page).toHaveURL(/#writing$/);
    await expect(panel).toBeHidden();
  });

  test("Escape closes the mobile menu", async ({ page, viewport }) => {
    test.skip(!viewport || viewport.width >= 960, "desktop shows inline nav");

    await page.goto("/");
    await page.getByTestId("nav-toggle").click();
    await expect(page.getByTestId("mobile-nav")).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(page.getByTestId("mobile-nav")).toBeHidden();
  });

  test("the wordmark returns home", async ({ page }) => {
    await page.goto("/about");
    await page.getByRole("link", { name: /home$/i }).click();

    await expect(page).toHaveURL(/\/$/);
  });

  test("case study cards link through to the full study", async ({ page }) => {
    await page.goto("/work");
    await page.getByRole("link", { name: "Vashix", exact: true }).click();

    await expect(page).toHaveURL(/\/work\/vashix$/);
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Vashix");
  });

  test("experience highlights deep-link to their case study", async ({ page }) => {
    await page.goto("/about");

    const link = page.getByRole("link", { name: /see the case study/i }).first();
    await expect(link).toBeVisible();
    await link.click();

    await expect(page).toHaveURL(/\/work\//);
  });
});

import { expect, test } from "@playwright/test";

import { ROUTES } from "./routes";

test.describe("accessibility", () => {
  for (const route of ROUTES) {
    test(`${route.name} has correct landmarks and heading order`, async ({ page }) => {
      await page.goto(route.path);

      await expect(page.getByRole("banner")).toHaveCount(1);
      await expect(page.getByRole("main")).toHaveCount(1);
      await expect(page.getByRole("contentinfo")).toHaveCount(1);

      // No skipped heading levels — h1 → h3 with no h2 fails screen reader
      // navigation even though it looks fine visually.
      const levels = await page
        .locator("h1, h2, h3, h4, h5, h6")
        .evaluateAll((nodes) => nodes.map((n) => Number(n.tagName[1])));

      let previous = levels[0] ?? 1;
      for (const level of levels) {
        expect(
          level - previous,
          `heading jumped from h${previous} to h${level}`,
        ).toBeLessThanOrEqual(1);
        previous = level;
      }
    });

    test(`${route.name} gives every image alt text`, async ({ page }) => {
      await page.goto(route.path);

      const missing = await page
        .locator("img")
        .evaluateAll((images) =>
          images
            .filter((img) => !img.hasAttribute("alt"))
            .map((img) => img.getAttribute("src") ?? "(no src)"),
        );

      expect(missing, `images without alt: ${missing.join(", ")}`).toHaveLength(0);
    });
  }

  test("the skip link is the first thing keyboard users reach", async ({
    page,
    browserName,
  }) => {
    test.skip(
      browserName === "webkit",
      "WebKit only tabs to links when 'Press Tab to highlight each item' is on",
    );

    await page.goto("/");
    await page.keyboard.press("Tab");

    const focused = page.locator(":focus");
    await expect(focused).toHaveClass(/skip-link/);
    await expect(focused).toBeInViewport();
  });

  test("the skip link jumps past the navigation", async ({
    page,
    browserName,
  }) => {
    test.skip(browserName === "webkit", "see above — WebKit tab behaviour");

    await page.goto("/");
    await page.keyboard.press("Tab");
    await page.keyboard.press("Enter");

    await expect(page).toHaveURL(/#main$/);
  });

  test("interactive elements show a visible focus ring", async ({ page }) => {
    await page.goto("/contact");

    const input = page.getByLabel("Name", { exact: true });
    await input.focus();

    const outline = await input.evaluate((el) => {
      const style = getComputedStyle(el);
      return { width: style.outlineWidth, shadow: style.boxShadow };
    });

    // The field uses a box-shadow ring; either mechanism is acceptable so
    // long as focus is not invisible.
    const hasRing =
      parseFloat(outline.width) > 0 ||
      (outline.shadow !== "none" && outline.shadow.length > 0);

    expect(hasRing).toBe(true);
  });

  test("the theme toggle is labelled for screen readers", async ({ page }) => {
    await page.goto("/");
    const toggle = page.getByTestId("theme-toggle");

    await expect(toggle).toHaveAttribute("aria-label", /theme/i);
  });

  test("html carries a language attribute", async ({ page }) => {
    await page.goto("/");

    await expect(page.locator("html")).toHaveAttribute("lang", "en");
  });

  test("reduced-motion preference disables animation", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");

    const duration = await page
      .locator(".hero-status-dot")
      .evaluate((el) => getComputedStyle(el).animationDuration);

    // The global reduced-motion rule collapses animations to ~0.
    expect(parseFloat(duration)).toBeLessThan(0.05);
  });
});

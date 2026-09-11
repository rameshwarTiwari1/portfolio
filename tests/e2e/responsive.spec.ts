import { expect, test } from "@playwright/test";

import { ROUTES } from "./routes";

/**
 * Runs on every viewport in playwright.config.ts. The horizontal-overflow
 * assertion is the one that matters most — it is the failure users actually
 * feel, and it is invisible until someone opens the site on a small phone.
 */
test.describe("responsive layout", () => {
  for (const route of ROUTES) {
    test(`${route.name} has no horizontal overflow`, async ({ page }) => {
      await page.goto(route.path);
      await page.waitForLoadState("networkidle");

      const overflow = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
      }));

      // 1px of tolerance for sub-pixel rounding on fractional viewports.
      expect(
        overflow.scrollWidth,
        `page scrolls horizontally: ${overflow.scrollWidth}px content in ${overflow.clientWidth}px viewport`,
      ).toBeLessThanOrEqual(overflow.clientWidth + 1);
    });

    test(`${route.name} keeps every element inside the viewport`, async ({
      page,
    }) => {
      await page.goto(route.path);
      await page.waitForLoadState("networkidle");

      // Find any element whose box extends past the right edge, ignoring
      // elements inside a deliberate horizontal scroll container.
      const offenders = await page.evaluate(() => {
        const limit = document.documentElement.clientWidth;
        const found: string[] = [];

        for (const el of document.querySelectorAll("body *")) {
          const style = getComputedStyle(el);
          if (style.position === "fixed" || style.display === "none") continue;

          // Skip anything living inside an intentional scroller.
          if (el.closest(".diagram-scroll, .arch-canvas, .stack-tabs, .shiki, pre, [data-overflow-ok]")) {
            continue;
          }

          const rect = el.getBoundingClientRect();
          if (rect.width === 0) continue;
          if (rect.right > limit + 1) {
            found.push(
              `${el.tagName.toLowerCase()}.${el.className || "(no class)"} → right ${Math.round(rect.right)} > ${limit}`,
            );
          }
        }

        return found.slice(0, 5);
      });

      expect(offenders, offenders.join("\n")).toHaveLength(0);
    });
  }

  test("code blocks scroll internally rather than stretching the page", async ({
    page,
  }) => {
    await page.goto("/engineering/postgres-row-level-security-multi-tenant");

    const pre = page.locator(".shiki").first();
    await expect(pre).toBeVisible();

    const overflowX = await pre.evaluate((el) => getComputedStyle(el).overflowX);
    expect(overflowX).toBe("auto");
  });

  test("touch targets on the mobile nav toggle are large enough", async ({
    page,
    viewport,
  }) => {
    test.skip(!viewport || viewport.width >= 960, "desktop shows inline nav");

    await page.goto("/");
    const box = await page.getByTestId("nav-toggle").boundingBox();

    expect(box).not.toBeNull();
    expect(box!.width).toBeGreaterThanOrEqual(32);
    expect(box!.height).toBeGreaterThanOrEqual(32);
  });
});

import { expect, test, type Page } from "@playwright/test";

import { CONTRAST_HELPERS } from "./contrast";

/**
 * The toggle only works once React has hydrated. `data-ready` is set in the
 * mount effect, so waiting on it removes the race rather than papering over it
 * with a sleep.
 */
async function themeToggle(page: Page) {
  const toggle = page.getByTestId("theme-toggle");
  await expect(toggle).toHaveAttribute("data-ready", "true");
  return toggle;
}

test.describe("theme", () => {
  test("follows a dark system preference on first visit", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "dark" });
    await page.goto("/");

    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  });

  test("follows a light system preference on first visit", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "light" });
    await page.goto("/");

    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  });

  test("toggles from dark to light and back", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "dark" });
    await page.goto("/");

    const html = page.locator("html");
    const toggle = await themeToggle(page);

    await expect(html).toHaveAttribute("data-theme", "dark");

    await toggle.click();
    await expect(html).toHaveAttribute("data-theme", "light");

    await toggle.click();
    await expect(html).toHaveAttribute("data-theme", "dark");
  });

  test("an explicit choice overrides the system preference", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "dark" });
    await page.goto("/");

    await (await themeToggle(page)).click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");

    // Still a dark OS preference, but the stored choice must win.
    await page.reload();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");

    await page.goto("/work");
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  });

  test("applies before paint, with no flash of the wrong theme", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "dark" });
    await page.goto("/");
    await page.evaluate(() => localStorage.setItem("theme", "light"));

    // If the bootstrap script were not inline in <head>, the first painted
    // frame would be dark. Read the attribute immediately after navigation.
    await page.goto("/work");
    const themeAtLoad = await page.evaluate(
      () => document.documentElement.dataset.theme,
    );

    expect(themeAtLoad).toBe("light");
  });

  test("both themes keep body text readable against the background", async ({ page }) => {
    await page.goto("/");

    for (const theme of ["dark", "light"] as const) {
      await page.evaluate((value) => {
        document.documentElement.dataset.theme = value;
      }, theme);

      const { bg, fg } = await page.evaluate(() => {
        const style = getComputedStyle(document.body);
        return { bg: style.backgroundColor, fg: style.color };
      });

      expect(bg, `${theme} background should be painted`).not.toBe(
        "rgba(0, 0, 0, 0)",
      );
      expect(fg).not.toBe(bg);
    }
  });

  /**
   * This replaces an earlier test that asserted code *changed* colour with the
   * theme. That was the wrong requirement and it hid a real bug: the code
   * canvas stays dark in both themes, so switching to a light syntax palette
   * put dark text on a dark background at 1.83:1. What matters is that the
   * code stays readable, not that it changes.
   */
  for (const scheme of ["dark", "light"] as const) {
    test(`code stays readable in the ${scheme} theme`, async ({ page }) => {
      await page.emulateMedia({ colorScheme: scheme });
      await page.goto("/engineering/bullmq-redis-background-jobs");
      await expect(page.locator(".shiki").first()).toBeVisible();

      const worst = await page.evaluate(`(() => {
        ${CONTRAST_HELPERS}

        const pre = document.querySelector(".shiki");
        const bg = toRgb(getComputedStyle(pre).backgroundColor);

        let lowest = Infinity;
        for (const span of pre.querySelectorAll("span")) {
          if (!span.textContent.trim()) continue;
          const fg = toRgb(getComputedStyle(span).color);
          lowest = Math.min(lowest, contrast(fg, bg));
        }
        return lowest;
      })()`) as number;

      // 4.5:1 is the AA floor for body-sized text, which code is.
      expect(worst, `worst token contrast was ${worst.toFixed(2)}:1`).toBeGreaterThanOrEqual(4.5);
    });
  }
});

import { expect, test, type Page } from "@playwright/test";

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

  test("code blocks recolour with the theme", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "dark" });
    await page.goto("/engineering/bullmq-redis-background-jobs");

    const token = page.locator(".shiki span").first();
    await expect(token).toBeVisible();

    const darkColor = await token.evaluate((el) => getComputedStyle(el).color);

    await (await themeToggle(page)).click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");

    const lightColor = await token.evaluate((el) => getComputedStyle(el).color);

    expect(lightColor).not.toBe(darkColor);
  });
});

import { expect, test } from "@playwright/test";

const SECTIONS = ["work", "experience", "stack", "writing", "about", "contact"];

test.describe("one-page navigation", () => {
  test("every nav target exists as a section on the home page", async ({ page }) => {
    await page.goto("/");

    for (const id of SECTIONS) {
      await expect(page.locator(`#${id}`), `#${id} is missing`).toHaveCount(1);
    }
  });

  test("nav links jump to their section and mark themselves current", async ({
    page,
    viewport,
  }) => {
    test.skip(!viewport || viewport.width < 960, "mobile uses the menu panel");

    await page.goto("/");
    const nav = page.getByRole("navigation", { name: "Primary" });

    for (const [label, id] of [
      ["Work", "work"],
      ["Writing", "writing"],
      ["About", "about"],
      ["Contact", "contact"],
    ] as const) {
      await nav.getByRole("link", { name: label }).click();
      await expect(page).toHaveURL(new RegExp(`#${id}$`));

      // Smooth scrolling is animated, so poll until the section settles
      // rather than racing it with a fixed wait. The window it has to land
      // in is "below the sticky header, above the fold".
      await expect
        .poll(
          async () =>
            page.locator(`#${id}`).evaluate((el) => {
              const top = el.getBoundingClientRect().top;
              return top > -24 && top < 220;
            }),
          { message: `${label} never settled below the header`, timeout: 8_000 },
        )
        .toBe(true);

      await expect(nav.getByRole("link", { name: label })).toHaveAttribute(
        "aria-current",
        "location",
      );
    }
  });

  test("deep pages still have their own URLs", async ({ request }) => {
    for (const path of [
      "/work",
      "/work/vashix",
      "/engineering",
      "/engineering/bullmq-redis-background-jobs",
      "/about",
      "/contact",
    ]) {
      expect((await request.get(path)).status(), path).toBe(200);
    }
  });
});

test.describe("content actually loads", () => {
  /**
   * The About singleton silently fell back to placeholder copy once because
   * its file was at the wrong path and `??` hid the null. Assert the real
   * body renders, on both the home section and the full page.
   */
  test("the about page renders its written body, not a fallback", async ({ page }) => {
    await page.goto("/about");

    await expect(page.getByRole("heading", { name: /how i work/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /what i am doing now/i })).toBeVisible();
  });

  test("the home about section renders real details", async ({ page }) => {
    await page.goto("/#about");

    const strip = page.locator(".about-strip");
    await expect(strip).toBeVisible();
    await expect(strip).toContainText("Mumbai");
    await expect(strip).toContainText("rameshwar.kes@gmail.com");
  });

  test("the contact page no longer claims anything about storage", async ({ page }) => {
    await page.goto("/contact");

    await expect(page.locator("body")).not.toContainText(/nothing you send here is stored/i);
    await expect(page.locator("body")).not.toContainText(/goes straight to my inbox/i);
  });
});

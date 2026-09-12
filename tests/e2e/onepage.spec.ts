import { expect, test } from "@playwright/test";

const SECTIONS = ["work", "experience", "stack", "writing", "about", "contact"];

test.describe("home page structure", () => {
  /**
   * The nav points at real pages, but the home page still tells the whole
   * story in one scroll and keeps stable section ids so `/#work` and friends
   * remain valid deep links from anywhere.
   */
  test("every section keeps a stable id for deep linking", async ({ page }) => {
    await page.goto("/");

    for (const id of SECTIONS) {
      await expect(page.locator(`#${id}`), `#${id} is missing`).toHaveCount(1);
    }
  });

  test("a section deep link lands below the sticky header", async ({ page }) => {
    await page.goto("/#work");

    await expect
      .poll(
        () =>
          page.locator("#work").evaluate((el) => {
            const top = el.getBoundingClientRect().top;
            return top > -24 && top < 220;
          }),
        { message: "#work never settled below the header", timeout: 8_000 },
      )
      .toBe(true);
  });

  test("deep pages have their own URLs", async ({ request }) => {
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

  /**
   * Several sections rendered completely unstyled once, because the redesign
   * renamed their classes on the home page and deleted the old CSS while
   * /about and /work/[slug] still referenced it.
   */
  test("the about page's roles and stack are styled, not bare markup", async ({ page }) => {
    await page.goto("/about");

    await expect(page.locator(".xp-item").first()).toBeVisible();
    await expect(page.locator(".stack-tab").first()).toBeVisible();

    // A styled timeline row lays out as a grid; bare markup would be block.
    const display = await page
      .locator(".xp-item")
      .first()
      .evaluate((el) => getComputedStyle(el).display);
    expect(display).toBe("grid");
  });

  test("the contact page lays out in two columns on desktop", async ({ page, viewport }) => {
    test.skip(!viewport || viewport.width < 900, "single column by design");

    await page.goto("/contact");

    const columns = await page
      .locator(".contact-grid")
      .evaluate((el) => getComputedStyle(el).gridTemplateColumns.split(" ").length);
    expect(columns).toBe(2);
  });

  test("a case study renders its metrics", async ({ page }) => {
    await page.goto("/work/vashix");

    const proof = page.locator(".proof").first();
    await expect(proof).toBeVisible();
    await expect(proof.locator(".proof-value").first()).toBeVisible();
  });
});

test.describe("credentials", () => {
  test("the about page shows education and certifications", async ({ page }) => {
    await page.goto("/about");

    const section = page.locator("section", {
      has: page.getByRole("heading", { name: /education and certifications/i }),
    });

    await expect(section).toBeVisible();
    await expect(section).toContainText("BSc in Information Technology");
    await expect(section).toContainText("KES Shroff College");
    await expect(section).toContainText("CGPA 9.0/10");
    await expect(section).toContainText("Claude Code in Action");
    await expect(section).toContainText("HackerRank");
  });
});

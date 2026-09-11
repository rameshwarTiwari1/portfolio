import { expect, test } from "@playwright/test";

test.describe("contact form", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/contact");
  });

  test("every field is labelled and reachable", async ({ page }) => {
    await expect(page.getByLabel("Name", { exact: true })).toBeVisible();
    await expect(page.getByLabel("Email", { exact: true })).toBeVisible();
    await expect(page.getByLabel(/company/i)).toBeVisible();
    await expect(page.getByLabel("Message", { exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: /send message/i })).toBeVisible();
  });

  test("the honeypot is present but hidden from users", async ({ page }) => {
    const honeypot = page.locator('input[name="website"]');

    await expect(honeypot).toHaveCount(1);
    await expect(honeypot).not.toBeInViewport();
    await expect(honeypot).toHaveAttribute("tabindex", "-1");
  });

  test("browser validation blocks an empty submission", async ({ page }) => {
    await page.getByRole("button", { name: /send message/i }).click();

    // Still on the contact page, nothing submitted.
    await expect(page).toHaveURL(/\/contact$/);

    const nameValid = await page
      .getByLabel("Name", { exact: true })
      .evaluate((el: HTMLInputElement) => el.checkValidity());

    expect(nameValid).toBe(false);
  });

  test("rejects a message that is too short to be actionable", async ({
    page,
    browserName,
  }) => {
    test.skip(
      browserName === "webkit",
      "WebKit reports minlength valid until the field is edited by a user",
    );

    await page.getByLabel("Name", { exact: true }).fill("Priya Sharma");
    await page.getByLabel("Email", { exact: true }).fill("priya@example.com");
    await page.getByLabel("Message", { exact: true }).fill("hello");

    const valid = await page
      .getByLabel("Message", { exact: true })
      .evaluate((el: HTMLTextAreaElement) => el.checkValidity());

    expect(valid).toBe(false);
  });

  test("rejects a malformed email address", async ({ page }) => {
    await page.getByLabel("Email", { exact: true }).fill("not-an-email");

    const valid = await page
      .getByLabel("Email", { exact: true })
      .evaluate((el: HTMLInputElement) => el.checkValidity());

    expect(valid).toBe(false);
  });

  test("always answers the visitor instead of hanging", async ({ page }) => {
    // SMTP is intentionally unconfigured here, so this exercises the failure
    // path a visitor would hit if Gmail were down. Because the whole matrix
    // submits from one IP, the rate limiter may legitimately answer first —
    // both are correct outcomes, and neither may leave the user waiting.
    await page.getByLabel("Name", { exact: true }).fill("Priya Sharma");
    await page.getByLabel("Email", { exact: true }).fill("priya@example.com");
    await page
      .getByLabel("Message", { exact: true })
      .fill(
        "I am evaluating engineers for a platform team and would like to discuss your multi-tenant work.",
      );

    // Beat the 3s bot-timing check.
    await page.waitForTimeout(3_200);
    await page.getByRole("button", { name: /send message/i }).click();

    const status = page.getByRole("status");
    await expect(status).toBeVisible({ timeout: 30_000 });
    await expect(status).toContainText(
      /rameshwar\.kes@gmail\.com|on its way|try again in/i,
    );
  });

  test("direct contact details are available without using the form", async ({ page }) => {
    await expect(
      page.getByRole("link", { name: /rameshwar\.kes@gmail\.com/ }).first(),
    ).toBeVisible();
  });
});

import { test, expect } from "@playwright/test";

const EMAIL = process.env.E2E_TEST_EMAIL;
const PASSWORD = process.env.E2E_TEST_PASSWORD;

test.describe("auth flow", () => {
  test.skip(!EMAIL || !PASSWORD, "Set E2E_TEST_EMAIL and E2E_TEST_PASSWORD to run this suite.");

  test("an existing user can log in and log out", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Email").fill(EMAIL!);
    await page.getByLabel("Password", { exact: true }).fill(PASSWORD!);
    await page.getByRole("button", { name: "Log in" }).click();

    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.getByText(EMAIL!)).toBeVisible();

    await page.getByRole("button", { name: "Log out" }).click();
    await expect(page).toHaveURL(/\/login/);
  });

  test("wrong password shows an error instead of failing silently", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Email").fill(EMAIL!);
    await page.getByLabel("Password", { exact: true }).fill("definitely-wrong-password-123");
    await page.getByRole("button", { name: "Log in" }).click();

    await expect(page.getByRole("alert")).toContainText(/incorrect email or password/i);
    await expect(page).toHaveURL(/\/login/);
  });

  test("requesting a password reset shows the check-your-email confirmation", async ({ page }) => {
    await page.goto("/forgot-password");
    await page.getByLabel("Email").fill(EMAIL!);
    await page.getByRole("button", { name: "Send reset link" }).click();

    await expect(page.getByRole("heading", { name: "Check your email" })).toBeVisible();
  });
});

import { test, expect } from "@playwright/test";

const EMAIL = process.env.E2E_TEST_EMAIL;
const PASSWORD = process.env.E2E_TEST_PASSWORD;

async function login(page: import("@playwright/test").Page) {
  await page.goto("/login");
  await page.getByLabel("Email").fill(EMAIL!);
  await page.getByLabel("Password", { exact: true }).fill(PASSWORD!);
  await page.getByRole("button", { name: "Log in" }).click();
  await expect(page).toHaveURL(/\/dashboard/);
}

test.describe("project creation", () => {
  test.skip(!EMAIL || !PASSWORD, "Set E2E_TEST_EMAIL and E2E_TEST_PASSWORD to run this suite.");

  test("a logged-in user can create a project and see it on the project page", async ({ page }) => {
    await login(page);

    await page.goto("/projects/new");
    await page.getByLabel("Funder URL").fill("https://www.macfound.org");
    await page.getByLabel("Organization name").fill(`Playwright Test Org ${Date.now()}`);
    await page.getByLabel("Industry").fill("Robotics");
    await page.getByLabel("Country").fill("Nigeria");
    await page.getByLabel("Contact email").fill("test-org@example.com");
    await page.getByRole("button", { name: "Create project" }).click();

    // Redirects to /projects/[id] on success.
    await expect(page).toHaveURL(/\/projects\/[\w-]+$/);
    await expect(page.getByRole("heading", { name: /playwright test org/i })).toBeVisible();

    // NOTE: this intentionally stops before clicking "Run analysis" — that
    // triggers real Gemini and YouTube API calls and costs quota. Add a
    // separate, manually-triggered test for the full pipeline if you want
    // that covered too.
  });

  test("leaving the deadline and amount blank does not block project creation", async ({ page }) => {
    await login(page);
    await page.goto("/projects/new");
    await page.getByLabel("Funder URL").fill("https://www.macfound.org");
    await page.getByLabel("Organization name").fill(`Playwright Blank Fields ${Date.now()}`);
    await page.getByLabel("Industry").fill("Robotics");
    await page.getByLabel("Country").fill("Nigeria");
    await page.getByLabel("Contact email").fill("test-org@example.com");
    // Amount sought and deadline left blank on purpose — regression check
    // for the empty-optional-field validation bug.
    await page.getByRole("button", { name: "Create project" }).click();

    await expect(page).toHaveURL(/\/projects\/[\w-]+$/);
  });
});


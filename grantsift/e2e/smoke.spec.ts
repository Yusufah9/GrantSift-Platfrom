import { test, expect } from "@playwright/test";

test.describe("public site smoke test", () => {
  test("landing page loads with the real headline and working nav", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: /turn grant knowledge/i })).toBeVisible();
    await expect(page.getByRole("link", { name: "Blog" }).first()).toBeVisible();
  });

  test("every footer link resolves to a real page, not a 404", async ({ page, request }) => {
    await page.goto("/");
    const footerLinks = await page.locator("footer a").evaluateAll((els) =>
      els.map((el) => (el as HTMLAnchorElement).getAttribute("href")).filter((href): href is string => Boolean(href)),
    );

    expect(footerLinks.length).toBeGreaterThan(0);

    for (const href of footerLinks) {
      if (href.startsWith("#") || href.includes("#")) continue; // in-page anchors, checked separately
      const response = await request.get(href);
      expect(response.status(), `footer link ${href} should not 404`).toBeLessThan(400);
    }
  });

  test("blog index loads without needing a login", async ({ page }) => {
    await page.goto("/blog");
    await expect(page.getByRole("heading", { name: "Blog" })).toBeVisible();
  });

  test("visiting a protected route while signed out redirects to login", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login/);
  });
});


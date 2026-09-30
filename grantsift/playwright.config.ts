import { defineConfig } from "@playwright/test";

/**
 * These tests run against a real, running GrantSift instance (local dev or
 * a staging deployment) with a real Supabase project behind it — they are
 * not run as part of `npm test` or in CI by default, since they need live
 * credentials. See e2e/README.md.
 */
export default defineConfig({
  testDir: "./e2e",
  timeout: 30_000,
  fullyParallel: false,
  retries: 0,
  use: {
    baseURL: process.env.E2E_BASE_URL ?? "http://localhost:3000",
    trace: "retain-on-failure",
  },
});

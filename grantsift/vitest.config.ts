import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      // Next.js swaps `server-only` for a no-op only inside its own server
      // bundler; under plain Node/Vitest it always throws. We're testing
      // pure logic here, not the client/server boundary, so stub it out.
      "server-only": path.resolve(__dirname, "./src/test-utils/server-only-stub.ts"),
    },
  },
});

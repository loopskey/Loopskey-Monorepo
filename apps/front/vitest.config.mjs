import { fileURLToPath } from "node:url";

// Mirrors the tsconfig path aliases so tests can import modules the same way
// application code does.
const alias = Object.fromEntries(
  [
    ["@", "./src"],
    ["@lib", "./src/lib"],
    ["@types", "./src/types"],
    ["@hooks", "./src/hooks"],
    ["@utils", "./src/utils"],
    ["@actions", "./src/actions"],
    ["@ui", "./src/components/ui"],
    ["@providers", "./src/providers"],
    ["@components", "./src/components"],
    ["@guards", "./src/components/guards"],
    ["@layouts", "./src/components/layouts"],
    ["@modules", "./src/components/modules"],
    ["@elements", "./src/components/elements"],
    ["@templates", "./src/components/templates"],
  ].map(([key, path]) => [key, fileURLToPath(new URL(path, import.meta.url))]),
);

export default {
  css: {
    postcss: {
      plugins: [],
    },
  },
  resolve: {
    alias,
  },
  test: {
    globals: true,
  },
};

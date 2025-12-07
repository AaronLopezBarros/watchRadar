import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import importPlugin from "eslint-plugin-import";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    plugins: {
      import: importPlugin,
    },
    rules: {
      "no-console": "error",
      "no-unused-vars": "error",
      "import/order": [
        "error",
        {
          groups: [
            ["builtin", "external"], // First, import built-in and external modules
            "internal", // Then, import internal project modules
            ["sibling", "parent"], // After that, import sibling and parent modules
            "index", // Finally, import index files (e.g., index.js or index.ts)
          ],
          pathGroups: [
            {
              pattern: "react", // Ensure react is always imported first
              group: "builtin", // Group it as a built-in module
              position: "before", // Position it before other imports
            },
          ],
          alphabetize: {
            order: "asc", // Alphabetical order within each group
            caseInsensitive: true, // Case-insensitive ordering
          },
          "newlines-between": "always", // Always add a blank line between different groups of imports
        },
      ],
    },
  },
]);

export default eslintConfig;

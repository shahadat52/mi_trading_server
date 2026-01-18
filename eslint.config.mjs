// eslint.config.js
import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import { defineConfig } from "eslint/config";

export default defineConfig([
  // JS Base Config
  {
    files: ["**/*.{js,mjs,cjs,ts,tsx}"],
    languageOptions: {
      parser: tseslint.parser, // ✅ Use TypeScript parser
      parserOptions: {
        project: ["./tsconfig.json"], // ✅ Link to your tsconfig
        tsconfigRootDir: import.meta.dirname,
      },
      globals: {
        ...globals.browser,
        process: "readonly",
      },
    },
    plugins: {
      "@typescript-eslint": tseslint.plugin, // ✅ Register TS plugin
    },
    extends: [
      "eslint:recommended",
      "plugin:@typescript-eslint/recommended", // ✅ TypeScript recommended rules
    ],
    rules: {
      // ---- General rules ----
      eqeqeq: "off",
      "no-console": "warn",
      "no-var": "error",
      "prefer-const": ["error", { ignoreReadBeforeAssign: true }],

      // ---- TypeScript-specific rules ----
      "@typescript-eslint/no-explicit-any": "error", // ✅ any টাইপ নিষিদ্ধ করবে
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
    },
  },

  // Ignore files
  {
    ignores: ["node_modules", "dist"],
  },
]);

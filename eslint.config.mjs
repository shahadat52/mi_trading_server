import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import { defineConfig } from "eslint/config";

export default defineConfig([
  { files: ["**/*.{js,mjs,cjs,ts,mts,cts}"], plugins: { js }, extends: ["js/recommended"], languageOptions: { globals: globals.browser } },
  tseslint.configs.recommended,
  {

    languageOptions: {
      globals: {
        ...globals.browser,
        process: "readonly",
      },
    },
    rules: {
      "no-unused-vars": "error",
      "no-undef": "error",
      "no-console": "warn",
      "process-exit": "off",
      "no-var": "error",
      "prefer-const": "error",
    },

  },

  {
    ignores: ["node_modules", "dist"],
  }
]);

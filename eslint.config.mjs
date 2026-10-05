import tseslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import { defineConfig, globalIgnores } from "eslint/config";
import globals from "globals";
import jsxA11y from "eslint-plugin-jsx-a11y";
import react from "eslint-plugin-react";

const eslintConfig = defineConfig([
  {
    files: ["src/**/*.{js,jsx,ts,tsx}"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaFeatures: { jsx: true },
        sourceType: "module",
      },
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    plugins: {
      "@typescript-eslint": tseslint,
      "jsx-a11y": jsxA11y,
      react,
    },
    settings: {
      react: { version: "detect" },
    },
    rules: {
      ...tseslint.configs.recommended.rules,
      ...react.configs.recommended.rules,
      ...jsxA11y.configs.recommended.rules,
      "react/prop-types": "off",
      "react/react-in-jsx-scope": "off",
      "react/no-unknown-property": "off",
    },
  },
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "waitlist/**",
    "docs/**",
  ]),
]);

export default eslintConfig;

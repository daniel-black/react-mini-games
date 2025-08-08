// Minimal ESLint flat config to enable linting with ESLint v9 without extra rules
// Keeps runtime dependencies at zero; uses parser only from devDependencies
const tsParser = require("@typescript-eslint/parser");

/** @type {import("eslint").Linter.FlatConfig[]} */
module.exports = [
  {
    ignores: ["dist/**"],
  },
  {
    files: ["src/**/*.{ts,tsx}", "*.ts", "*.tsx"],
    languageOptions: {
      parser: tsParser,
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        window: "readonly",
        document: "readonly",
        console: "readonly",
        performance: "readonly",
        localStorage: "readonly",
        requestAnimationFrame: "readonly",
        cancelAnimationFrame: "readonly",
      },
    },
    linterOptions: {
      reportUnusedDisableDirectives: true,
    },
    rules: {
      // Let TypeScript handle unused vars; avoid double reporting
      "no-unused-vars": "off",
      "no-undef": "off",
    },
  },
];

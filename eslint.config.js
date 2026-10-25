// ESLint flat config (v9+). Lints the Vite + React + TypeScript app under
// src/ and its tests under tests/.

import js from "@eslint/js";
import prettierConfig from "eslint-config-prettier";
import importX from "eslint-plugin-import-x";
import jsxA11y from "eslint-plugin-jsx-a11y";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: ["node_modules/", "dist/", "coverage/", "docs/"],
  },
  js.configs.recommended,
  // Type-aware TypeScript rules only apply to TS/TSX files — the config
  // file itself is plain JS and must NOT be parsed as project-aware.
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      ...tseslint.configs.strictTypeChecked,
      ...tseslint.configs.stylisticTypeChecked,
    ],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      parserOptions: {
        project: "./tsconfig.json",
        tsconfigRootDir: import.meta.dirname,
        ecmaFeatures: { jsx: true },
      },
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    settings: {
      react: { version: "detect" },
      "import-x/resolver": {
        typescript: { project: "./tsconfig.json" },
      },
    },
    plugins: {
      react,
      "react-hooks": reactHooks,
      "jsx-a11y": jsxA11y,
      "import-x": importX,
    },
    rules: {
      ...react.configs.recommended.rules,
      ...react.configs["jsx-runtime"].rules,
      ...reactHooks.configs.recommended.rules,
      ...jsxA11y.flatConfigs.recommended.rules,
      ...importX.flatConfigs.recommended.rules,
      ...importX.flatConfigs.typescript.rules,
      // JSX-runtime makes `import React` unnecessary.
      "react/react-in-jsx-scope": "off",
      // Same import order as web.data-scorecards.
      "import-x/order": [
        "error",
        {
          groups: [
            "builtin",
            "external",
            "internal",
            "parent",
            "sibling",
            "index",
          ],
          "newlines-between": "always",
          alphabetize: { order: "asc", caseInsensitive: true },
          pathGroups: [
            { pattern: "@app/**", group: "internal", position: "before" },
            { pattern: "@shared/**", group: "internal", position: "before" },
            { pattern: "@modules/**", group: "internal" },
          ],
          pathGroupsExcludedImportTypes: ["builtin"],
        },
      ],
      "import-x/prefer-default-export": "off",
      "@typescript-eslint/no-unnecessary-condition": "warn",
      // Displaying numbers inside a ``${}`` is idiomatic React.
      "@typescript-eslint/restrict-template-expressions": [
        "warn",
        { allowNumber: true, allowBoolean: true, allowNullish: true },
      ],
      "@typescript-eslint/prefer-nullish-coalescing": "warn",
      // Standard React pattern: ``onClick={async () => {...}}`` returns a
      // Promise to a void-returning handler.
      "@typescript-eslint/no-misused-promises": [
        "error",
        { checksVoidReturn: false },
      ],
      "jsx-a11y/no-autofocus": "warn",
      // `import x from "./file.json"` and CSS modules are typed by Vite.
      "import-x/no-unresolved": ["error", { ignore: ["\\.css$"] }],
      "jsx-a11y/click-events-have-key-events": "warn",
      "jsx-a11y/no-noninteractive-element-interactions": "warn",
      "jsx-a11y/interactive-supports-focus": "warn",
      "jsx-a11y/label-has-associated-control": ["error", { depth: 5 }],
    },
  },
  // Tests can be looser.
  {
    files: ["tests/**/*.{ts,tsx}"],
    rules: {
      "@typescript-eslint/no-non-null-assertion": "off",
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
      "jsx-a11y/click-events-have-key-events": "off",
      "jsx-a11y/no-static-element-interactions": "off",
    },
  },
  // Must be last: turn off every stylistic rule Prettier owns.
  prettierConfig,
);

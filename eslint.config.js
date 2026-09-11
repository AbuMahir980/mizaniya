/**
 * WHAT: Every `auto` rule from docs/standards/ that a linter can hold, wired to
 *       the exact rule that enforces it.
 * WHY:  A standard nobody can check is a wish. The architecture boundaries in
 *       section A are only real because this file fails the build when one is
 *       crossed — `core/` importing React would otherwise be caught by nobody.
 * INTERVIEW: I mapped each architecture rule to the lint rule that enforces it,
 *       so the boundaries are machine-checked rather than remembered.
 */

import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  { ignores: ['dist', 'coverage', 'docs', 'peer-ai', 'node_modules'] },

  js.configs.recommended,
  ...tseslint.configs.recommended,

  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.browser,
    },
    plugins: { 'react-hooks': reactHooks },
    rules: {
      ...reactHooks.configs.recommended.rules,

      // G1/G2 — no untyped escape hatches without a stated reason.
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
      ],
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  },

  /**
   * A3 — `core/` is framework-free.
   *
   * Domain rules, calculations and validation are pure TypeScript: no React, no
   * platform APIs, no storage, no network. This is the rule that makes `core/`
   * portable to the Expo app in v2, and since ADR-002 chose a folder rather than
   * a package, **this lint rule is the only thing holding that boundary.**
   */
  {
    files: ['src/core/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['react', 'react-dom', 'react/*', 'react-dom/*'],
              message: 'core/ is framework-free (A3). Move this to a feature or a hook.',
            },
            {
              group: ['dexie', 'zustand', '../data/*', '../../data/*', '@/data/*'],
              message: 'core/ knows nothing about storage or state (A3, A2).',
            },
            {
              group: ['../ui/*', '../../ui/*', '@/ui/*', '../features/*', '@/features/*'],
              message: 'Dependencies point inward (A2). core/ imports nothing.',
            },
          ],
        },
      ],
      /**
       * ADR-003 — `core/` never reads the clock; `now` is passed in.
       *
       * Banning `Date` outright was the first draft and it was wrong: it also
       * banned *parsing* a date, which `schema.ts` legitimately does to check
       * that `2026-02-30` is not a real day. The two selectors below ban only
       * the two ways of asking what time it is now.
       */
      'no-restricted-syntax': [
        'error',
        {
          selector: "NewExpression[callee.name='Date'][arguments.length=0]",
          message: 'core/ never reads the clock — take `now` as a parameter (ADR-003).',
        },
        {
          selector: "CallExpression[callee.object.name='Date'][callee.property.name='now']",
          message: 'core/ never reads the clock — take `now` as a parameter (ADR-003).',
        },
      ],
    },
  },

  /**
   * A4 — data access sits behind an interface.
   *
   * Only `src/data/` may name Dexie. Screens call the `Repository` interface, so
   * swapping IndexedDB for SQLite (v2) or an API (v3) touches one folder.
   */
  {
    files: ['src/**/*.{ts,tsx}'],
    ignores: ['src/data/**'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: 'dexie',
              message: 'Only src/data/ may import Dexie (A4). Use the Repository.',
            },
          ],
        },
      ],
    },
  },

  /**
   * A2/A5 — dependencies point inward, and a feature has a public surface.
   * Nothing imports another feature's internal file.
   */
  {
    files: ['src/features/**/*.{ts,tsx}', 'src/ui/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['../*/!(index)', '../../features/*/!(index)'],
              message:
                'Import a feature through its index.ts, never an internal file (A5).',
            },
          ],
        },
      ],
    },
  },

  /**
   * F4 — token names are semantic, never literal; and screens never hard-code a
   * colour. A raw hex outside the design folder is a token that was not created.
   */
  {
    files: ['src/ui/**/*.{ts,tsx}', 'src/features/**/*.{ts,tsx}', 'src/app/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector: "Literal[value=/^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/]",
          message:
            'No hard-coded colours outside src/design/ (F3, F4). Use a token.',
        },
      ],
    },
  },

  {
    files: ['**/*.test.{ts,tsx}'],
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
    rules: {
      // A test may reach for a literal the app may not.
      'no-restricted-syntax': 'off',
      'no-restricted-globals': 'off',
    },
  },

  {
    files: ['*.config.{js,ts}', 'scripts/**/*.{js,mjs}'],
    languageOptions: { globals: globals.node },
  },
)

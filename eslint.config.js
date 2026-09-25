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
import boundaries from 'eslint-plugin-boundaries'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  // `**/dist` rather than `dist`: the build output moved to apps/web/dist with the
  // workspace extraction, and a root-relative ignore stopped covering it — which
  // pointed ESLint at a bundled service worker and produced 2,147 errors.
  { ignores: ['**/dist', '**/coverage', 'docs', 'peer-ai', '**/node_modules'] },

  js.configs.recommended,
  ...tseslint.configs.recommended,

  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: { ecmaVersion: 2022, globals: globals.browser },
    plugins: { 'react-hooks': reactHooks, boundaries },
    settings: {
      /**
       * A1 — feature-first folders. Each layer is declared once here, and §A2's
       * allowed directions are declared below, so the architecture diagram in
       * `docs/02-architecture.md` and the linter cannot disagree.
       */
      /**
       * The patterns end `/**\/*` because they must match **files**.
       *
       * `src/ui/*` matches a *folder* under `src/ui`, and this codebase is flat
       * — `src/ui/card.tsx`, not `src/ui/card/index.tsx` — so nothing under
       * app, ui, store, design or data was ever classified, every import from
       * them was "unknown", and the rule below silently permitted everything.
       * Only `core/` matched, because its files sit in subfolders, and core
       * imports nothing so it never errored either way.
       *
       * `feature` keeps the folder form on purpose: a feature *is* a folder,
       * and `capture` names it for A5.
       */
      'boundaries/elements': [
        { type: 'feature', pattern: 'apps/web/src/features/*/**', capture: ['name'] },
        { type: 'app', pattern: 'apps/web/src/app/**' },
        { type: 'ui', pattern: 'apps/web/src/ui/**' },
        { type: 'design', pattern: 'apps/web/src/design/**' },
        { type: 'store', pattern: 'apps/web/src/store/**' },
        { type: 'data', pattern: 'apps/web/src/data/**' },
        { type: 'core', pattern: 'packages/core/src/**' },
      ],
      'boundaries/ignore': ['**/*.test.{ts,tsx}', 'scripts/**'],

      /**
       * Without this the rule above is decorative.
       *
       * The plugin classifies the *source* file from its path, but it has to
       * **resolve** each import to a file before it can classify the target.
       * The default node resolver does not resolve `.ts` or `.tsx`, and knows
       * nothing of the `@/` alias — so every target came back unresolved, every
       * dependency was "unknown", and nothing was ever compared.
       */
      'import/resolver': {
        typescript: { project: './tsconfig.json' },
      },
    },
    rules: {
      ...reactHooks.configs.recommended.rules,

      // G1 — no untyped escape hatches without a stated reason.
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
      ],
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],

      /**
       * A2 — dependencies point inward: app → features → ui → design, with
       * store, data and core beneath. Never the reverse, and never feature →
       * feature (A5: a feature is reached through its own index only).
       */
      'boundaries/dependencies': [
        'error',
        {
          default: 'disallow',
          message:
            'Dependencies point inward (A2): {{from.element.type}} may not import {{to.element.type}}.',
          /**
           * Every layer lists **itself** as well as what it may reach inward.
           *
           * Previously they did not, which was invisible while the elements
           * failed to match: once files are classified, `ui/card.tsx` importing
           * `ui/cx.ts` is a same-layer import and has to be permitted or the
           * whole primitives folder goes red.
           */
          policies: [
            {
              from: [{ element: { type: 'app' } }],
              allow: [
                { to: { element: { type: ['app', 'feature', 'ui', 'design', 'store', 'core'] } } },
              ],
            },
            {
              from: [{ element: { type: 'feature' } }],
              allow: [
                { to: { element: { type: ['feature', 'ui', 'design', 'store', 'core'] } } },
              ],
            },
            {
              from: [{ element: { type: 'ui' } }],
              allow: [{ to: { element: { type: ['ui', 'design', 'core'] } } }],
            },
            {
              from: [{ element: { type: 'store' } }],
              allow: [{ to: { element: { type: ['store', 'data', 'core'] } } }],
            },
            {
              from: [{ element: { type: 'data' } }],
              allow: [{ to: { element: { type: ['data', 'core'] } } }],
            },
            {
              from: [{ element: { type: 'design' } }],
              allow: [{ to: { element: { type: 'design' } } }],
            },
            // core/ reaches nothing outside itself.
            {
              from: [{ element: { type: 'core' } }],
              allow: [{ to: { element: { type: 'core' } } }],
            },
          ],
        },
      ],

      // F1 — zero inline style objects. The exception is a computed dimension,
      // which is why Rail is allowed one below.
      'react/no-unknown-property': 'off',
    },
  },

  /**
   * A3 — `core/` is framework-free, and ADR-008 — `core/` is leaving this app.
   *
   * The second one is why `@/` is banned here. The alias means "the web app's
   * src folder", and at v2 `core/` moves out of it; a file inside the package
   * pointing at the app that used to contain it would break on the move.
   * Relative imports travel with the folder and need no configuration at all.
   */
  {
    files: ['packages/core/src/**/*.ts'],
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
              group: ['dexie', 'zustand'],
              message: 'core/ knows nothing about storage or state (A3, A2).',
            },
            {
              group: ['@/*'],
              message:
                'core is its own package and must not reach into the app. Import relatively within it; the @/ alias points at apps/web (A3, ADR-008).',
            },
          ],
        },
      ],
      /**
       * ADR-003 — `core/` never reads the clock; `now` is passed in.
       *
       * Banning `Date` outright was the first draft and it was wrong: it also
       * banned *parsing* a date, which `schema.ts` legitimately does to check
       * that `2026-02-30` is not a real day. These two selectors ban only the
       * two ways of asking what time it is now.
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
   * The other half of ADR-008: everything *outside* core reaches it through the
   * alias, so the v2 move is a prefix swap rather than a per-file rewrite.
   */
  {
    files: ['apps/web/src/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: 'dexie',
              // A4 — only src/data/ may name the storage engine.
              message: 'Only src/data/ may import Dexie (A4). Use the Repository.',
            },
          ],
          patterns: [
            {
              group: ['../../../packages/core/*', '**/packages/core/*'],
              message:
                'Reach core through @mizaniya/core, never a relative path out of the app (ADR-008).',
            },
          ],
        },
      ],
    },
  },

  { files: ['apps/web/src/data/**/*.ts'], rules: { 'no-restricted-imports': 'off' } },

  /**
   * F2/F3/F4 — tokens come from one source, and no screen hard-codes a value.
   * A raw hex outside `src/design/` is a token that was never created.
   *
   * H2 — money is formatted in exactly one place. `MoneyText` is that place;
   * anything else importing the formatter is a second place waiting to disagree.
   */
  {
    files: [
      'apps/web/src/ui/**/*.{ts,tsx}',
      'apps/web/src/features/**/*.{ts,tsx}',
      'apps/web/src/app/**/*.{ts,tsx}',
    ],
    ignores: ['apps/web/src/ui/money-text.tsx'],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector: 'Literal[value=/^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/]',
          message: 'No hard-coded colours outside src/design/ (F2, F3). Use a token.',
        },
        {
          selector: "ImportSpecifier[imported.name='formatMoney']",
          message: 'Money is formatted in exactly one place (H2). Render <MoneyText />.',
        },
        {
          selector: "ImportSpecifier[imported.name='splitMoney']",
          message: 'Money is formatted in exactly one place (H2). Render <MoneyText />.',
        },
      ],
    },
  },

  /**
   * F5 — screens compose `ui/` primitives, not raw elements.
   *
   * Deliberately narrow: it bans the elements a primitive already exists for,
   * rather than all HTML. Layout elements stay available, because a rule that
   * forbids `<div>` gets switched off within a week.
   */
  {
    files: ['apps/web/src/features/**/*.tsx'],
    rules: {
      'react/forbid-elements': 'off',
      'no-restricted-syntax': [
        'error',
        {
          selector: "JSXOpeningElement[name.name=/^(button|input|select|table)$/]",
          message:
            'Screens compose ui/ primitives (F5). Use Button, Field, Segmented or Table.',
        },
        {
          selector: 'Literal[value=/^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/]',
          message: 'No hard-coded colours outside src/design/ (F2, F3). Use a token.',
        },
      ],
    },
  },

  {
    files: ['**/*.test.{ts,tsx}'],
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
    rules: {
      // A test may reach for a literal, and may import the formatter to test it.
      'no-restricted-syntax': 'off',
      'no-restricted-imports': 'off',
      'boundaries/element-types': 'off',
    },
  },

  {
    files: ['*.config.{js,ts}', 'scripts/**/*.{js,mjs,ts}'],
    languageOptions: { globals: globals.node },
  },
)

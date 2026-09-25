import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

/**
 * One config for the whole workspace, at the root — tests **and** `vite-node`.
 *
 * `npm run seed` runs through `vite-node -c vitest.config.ts`, so the aliases
 * below are the only place they are defined for anything running from the root.
 * A second config for the seed script would be a second place for `@/` to mean
 * something slightly different.
 *
 * It lives here rather than in each package because the three trees are tested
 * together and `npm test` at the root has to keep meaning what it meant before
 * the extraction. Two configs would be two places for the aliases and the
 * environment to drift apart, which is the failure this repo already guards
 * against for tokens.
 */
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./apps/web/src', import.meta.url)),
      '@mizaniya/core': fileURLToPath(new URL('./packages/core/src', import.meta.url)),
    },
  },
  test: {
    environment: 'node',
    globals: true,
    /**
     * `scripts/` is in scope because the build scripts are load-bearing: the
     * naming check, the spacing grid and the repo-rule guard all fail the build,
     * so they need the same proof as anything under `src/`.
     */
    include: [
      'apps/web/src/**/*.test.{ts,tsx}',
      'packages/*/src/**/*.test.{ts,tsx}',
      'scripts/**/*.test.{mjs,ts}',
    ],
  },
})

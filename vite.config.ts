import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [
    react(),
    /**
     * ADR-007. Installing is the single biggest factor in whether the browser
     * keeps the data, and D14 makes iOS Safari the strict case.
     */
    VitePWA({
      registerType: 'prompt',
      includeAssets: ['favicon.svg', 'favicon.ico', 'apple-touch-icon.png'],

      manifest: {
        name: 'Mizaniya',
        short_name: 'Mizaniya',
        description:
          'Salary-cycle budgeting, envelopes, and debts in both directions. Your data stays on this device.',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        orientation: 'portrait',
        lang: 'en-NG',
        // Verbatim from docs/design/brand/README.md.
        background_color: '#F7F3EA',
        theme_color: '#0F5C3C',
        icons: [
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          {
            src: '/icon-maskable-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'maskable',
          },
          {
            src: '/icon-maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },

      workbox: {
        /**
         * **The shell only.** There is no network data to cache — every figure
         * is derived from IndexedDB, which the service worker must never touch.
         * A runtime cache here would be a second copy of the owner's money with
         * its own staleness, and nothing able to tell which was right.
         */
        globPatterns: ['**/*.{js,css,html,woff2,svg,ico,png}'],
        runtimeCaching: [],
        navigateFallback: '/index.html',
        // A stale shell is the cost ADR-007 names; claiming clients on
        // activation is how a refused update stops being permanent.
        cleanupOutdatedCaches: true,
      },

      devOptions: { enabled: false },
    }),
  ],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  test: {
    environment: 'node',
    globals: true,
    include: ['src/**/*.test.{ts,tsx}'],
  },
})

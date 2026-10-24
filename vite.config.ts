import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { readFileSync } from 'node:fs';

/** Versi daripada package.json, disuntik ke dalam bundel. */
const pkg = JSON.parse(readFileSync('./package.json', 'utf8')) as { version: string };

export default defineConfig({
  // Laluan relatif supaya binaan berfungsi sama ada dihoskan pada root hos
  // (APK, WebView) atau di bawah sub-laluan (cth. GitHub Pages /bijak-kssr/).
  base: './',
  define: {
    // Satu sumber kebenaran untuk versi: package.json.
    __APP_VERSION__: JSON.stringify(pkg.version),
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['manifest.webmanifest'],
      strategies: 'generateSW',
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,webmanifest}'],
        // Aplikasi berfungsi sepenuhnya luar talian.
        navigateFallback: 'index.html',
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        // autoUpdate requires skipWaiting so a new version takes control
        // immediately, instead of waiting for every tab to close.
        skipWaiting: true,
        maximumFileSizeToCacheInBytes: 6 * 1024 * 1024,
      },
      manifest: false,
      devOptions: {
        enabled: true,
        type: 'module',
      },
    }),
  ],
  server: {
    host: '0.0.0.0',
    port: 12000,
    strictPort: true,
    allowedHosts: true,
  },
  preview: {
    host: '0.0.0.0',
    port: 12000,
    strictPort: true,
    allowedHosts: true,
  },
  build: {
    target: 'es2019',
    chunkSizeWarningLimit: 1200,
  },
});

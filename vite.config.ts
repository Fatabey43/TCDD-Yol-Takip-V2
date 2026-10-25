import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['apple-touch-icon-v2.png', 'apple-touch-icon-180-v2.png', 'pwa-192x192-v2.png', 'pwa-512x512-v2.png', 'pwa-maskable-512x512-v2.png', 'app_icon.svg', 'favicon-v2.png'],
        workbox: {
          maximumFileSizeToCacheInBytes: 8 * 1024 * 1024,
        },
        manifest: {
          id: '/?v=2',
          name: 'TCDD KM TAKİP',
          short_name: 'TCDD KM',
          description: 'Demiryolu kilometre noktası takibi, navigasyon, saha notları ve fotoğraf kayıt sistemi.',
          theme_color: '#0a192f',
          background_color: '#0a192f',
          display: 'standalone',
          start_url: '/?v=2',
          scope: '/',
          icons: [
            {
              src: '/pwa-192x192-v2.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/pwa-512x512-v2.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/pwa-maskable-512x512-v2.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],
        },
      }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname || '.', '.'),
      },
    },
    build: {
      chunkSizeWarningLimit: 2500,
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});

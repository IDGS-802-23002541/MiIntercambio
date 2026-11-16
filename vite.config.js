import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'Mi Intercambio',
        short_name: 'MiIntercambio',
        description: 'App para organizar y participar en intercambios navideños',
        theme_color: '#c50f0f',
        background_color: '#f6c73c',
        display: 'standalone', // se abre como app, sin la barra del navegador
        start_url: '/',
        icons: [
          {
            src: 'intercambio-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'intercambio-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'intercambio-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable', // version que se adapta a iconos redondos/cuadrados en Android
          },
        ],
      },
      workbox: {
        // Cachea automaticamente todo lo que Vite genera en el build (JS, CSS, HTML, imagenes)
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
      },
    }),
  ],
})

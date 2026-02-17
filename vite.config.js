import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/casa-contable/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'home_192.png', 'home_512.png'],
      manifest: {
        name: 'Casa Contable',
        short_name: 'CasaContable',
        description: 'Gestión de gastos e ingresos domésticos',
        theme_color: '#4da7a7',
        background_color: '#e0d8cc',
        display: 'standalone',
        scope: '/casa-contable/',
        start_url: '/casa-contable/',
        icons: [
          {
            src: 'home_192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'home_512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'home_512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ]
})

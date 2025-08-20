import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'
import fg from 'fast-glob'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    VitePWA({
      injectManifest: {
        maximumFileSizeToCacheInBytes: 3 * 1024 ** 2,
        globPatterns: ['**/*.{js,jsx,css,html,png,svg,woff2,ttf,ico,json,webp,mp3,wav}'],
      }
    })
  ]
})


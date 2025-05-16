import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  assetsInclude: ['**/*.QRY'],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  build: {
    rollupOptions: {
      input: {
        app: './src/html/index.html'
      }
    }
  },
  server: {
    port: '7008',
    strictPort: true,
    open: './src/html/index.html',
    proxy: {
      '/api': 'http://localhost:8008',
    },
  },
})

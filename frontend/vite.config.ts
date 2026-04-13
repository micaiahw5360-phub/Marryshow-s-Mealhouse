import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'), // allows imports like '@/utils/sound'
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost/MarryShow-Mealhouse/backend/api',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''), // removes /api prefix
      },
    },
  },
})
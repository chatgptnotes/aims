import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  css: {
    postcss: './postcss.config.cjs',
  },
  root: '.',
  publicDir: 'apps/web/public',
  server: {
    port: 3000,
    open: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './apps/web/src'),
      '@api': path.resolve(__dirname, './packages/api/src'),
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
})

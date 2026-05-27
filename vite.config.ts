import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// GitHub Pages 部署在子路径 /mvp-handheld-product/,本地开发用 /
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  base: mode === 'production' ? '/mvp-handheld-product/' : '/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    host: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    chunkSizeWarningLimit: 1000,
  },
}));

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: { global: 'window' }, // Add polyfill for global in browser environment
  optimizeDeps: {
    include: ['lucide-react'], // Include lucide-react in optimization instead of excluding
    esbuildOptions: {
      target: 'esnext',
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
        ws: true
      },
      '/socket.io': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
        ws: true
      }
    }
  },
  build: {
    commonjsOptions: {
      include: [/lucide-react/, /node_modules/],
    },
    rollupOptions: {
      output: {
        manualChunks: {
          'lucide-react': ['lucide-react'],
        },
      },
    },
  },
  resolve: {
    dedupe: ['lucide-react'],
  },
});
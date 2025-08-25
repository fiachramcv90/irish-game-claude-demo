import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Optimize for production
    target: 'es2020',
    minify: 'terser',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          // Separate vendor chunks for better caching
          vendor: ['react', 'react-dom'],
          // Keep game logic separate for lazy loading
          utils: ['./src/utils', './src/types'],
        },
      },
    },
    // Optimize chunk size warnings
    chunkSizeWarningLimit: 1000,
  },
  // PWA optimization
  server: {
    fs: {
      // Allow serving files from parent directories (for assets)
      allow: ['..'],
    },
  },
  // Optimize dependencies
  optimizeDeps: {
    include: ['react', 'react-dom'],
    exclude: ['@testing-library/react'],
  },
});

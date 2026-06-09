import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://localhost:3000',
      '/css': 'http://localhost:3000',
      '/images': 'http://localhost:3000',
      '/js': 'http://localhost:3000',
      '/uploads': 'http://localhost:3000'
    }
  }
});

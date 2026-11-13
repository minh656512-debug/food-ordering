import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Mở cổng 5173 khớp với cấu hình CORS của BE1 (Mục 8.2 Bước 1)
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api/v1': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
});

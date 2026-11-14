import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// Test giao diện chạy ở chế độ dữ liệu giả (VITE_USE_MOCK mặc định true), không cần backend.
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.js'],
    env: { VITE_USE_MOCK: 'true' },
  },
});

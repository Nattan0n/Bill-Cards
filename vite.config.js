import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['msw'],  // เพิ่มการตั้งค่านี้เพื่อให้ Vite รู้จัก msw
  },
  
});

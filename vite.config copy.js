import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // เปลี่ยนจาก true เป็น '0.0.0.0'
    port: 5173,
    strictPort: true,
    hmr: {
      host: '129.200.3.119', // IP ของเครื่องคุณ
      port: 5173
    },
    watch: {
      usePolling: true
    }
  },
  optimizeDeps: {
    include: ['msw']
  }
});
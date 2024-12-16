// src/main.jsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './style/index.css';
import App from './App';
import 'flowbite';

async function enableMocking() {
  if (process.env.NODE_ENV === 'development') {
    const { worker } = await import('./mocks/browser')
    // start ด้วย options เพื่อหลีกเลี่ยง warning บางอย่าง
    return worker.start({
      onUnhandledRequest: 'bypass', // ไม่แสดง warning สำหรับ request ที่ไม่ได้ mock
    })
  }
}

// Start ตัว Mock Service Worker ก่อนที่จะ render app
enableMocking().then(() => {
  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
});
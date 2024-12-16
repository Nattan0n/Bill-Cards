// src/index.js
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './style/index.css';
import App from './App';
import 'flowbite';

// async function deferRender() {
//   const { worker } = await import("./mocks/browser.js");
//   return worker.start();
// }
// In your main entry file (e.g., index.js or App.js)
import { worker } from './mocks/browser';

// if (process.env.NODE_ENV === 'development') {
//   worker.start();  // เริ่มต้น MSW สำหรับ mock API
// }


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);

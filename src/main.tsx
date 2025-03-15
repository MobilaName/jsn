import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// const originalFetch = window.fetch;

// window.fetch = async (url, options) => {
//   // @ts-expect-error
//   if (url.endsWith('.wasm') || url.endsWith('.gz')) {
//     // Ensure it loads from the correct path
//     // @ts-expect-error
//     url = new URL(`./assets/${url.split('/').pop()}`, window.location.origin).toString();
//   }
//   return originalFetch(url, options);
// };

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

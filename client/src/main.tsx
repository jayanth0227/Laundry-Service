import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Suppress transient security policy violation events from emulator extensions
if (typeof window !== 'undefined') {
  window.addEventListener('securitypolicyviolation', (e) => {
    e.stopPropagation();
  });

  // Auto-clear initial transient emulator iframe warnings in development
  if (import.meta.env.DEV) {
    setTimeout(() => {
      console.clear();
    }, 120);
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

import { createRoot } from 'react-dom/client';
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext.tsx";
import App from './App.tsx';
import './index.css';

// Dev-only global error overlay for debugging blank screens.
// Ignores errors injected by browser extensions (wallets etc.) and appends
// via DOM nodes — `body.innerHTML +=` would detach React's event listeners.
if (import.meta.env.DEV) {
  const showOverlay = (title: string, background: string, color: string, message: string, stack?: string) => {
    if (stack?.includes('chrome-extension://') || stack?.includes('moz-extension://')) return;
    const overlay = document.createElement('div');
    overlay.style.cssText = `position: fixed; top: 0; left: 0; right: 0; background: ${background}; color: ${color}; z-index: 999999; padding: 20px; font-family: monospace;`;
    const heading = document.createElement('h3');
    heading.textContent = title;
    const text = document.createElement('p');
    text.textContent = message;
    const trace = document.createElement('pre');
    trace.textContent = stack ?? '';
    overlay.append(heading, text, trace);
    overlay.addEventListener('click', () => overlay.remove());
    document.body.appendChild(overlay);
  };

  window.addEventListener('error', (event) => {
    showOverlay('Global Error', 'red', 'white', event.error?.message || event.message, event.error?.stack);
  });

  window.addEventListener('unhandledrejection', (event) => {
    showOverlay('Unhandled Promise Rejection', 'orange', 'black', event.reason?.message || String(event.reason), event.reason?.stack);
  });
}

createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <AuthProvider>
      <App />
    </AuthProvider>
  </BrowserRouter>
);

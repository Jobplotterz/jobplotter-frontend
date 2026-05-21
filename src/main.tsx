import { createRoot } from 'react-dom/client';
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext.tsx";
import App from './App.tsx';
import './index.css';

// Global error catcher for debugging blank screens
window.addEventListener('error', (event) => {
  document.body.innerHTML += `
    <div style="position: fixed; top: 0; left: 0; right: 0; background: red; color: white; z-index: 999999; padding: 20px; font-family: monospace;">
      <h3>Global Error</h3>
      <p>${event.error?.message || event.message}</p>
      <pre>${event.error?.stack}</pre>
    </div>
  `;
});

window.addEventListener('unhandledrejection', (event) => {
  document.body.innerHTML += `
    <div style="position: fixed; top: 0; left: 0; right: 0; background: orange; color: black; z-index: 999999; padding: 20px; font-family: monospace;">
      <h3>Unhandled Promise Rejection</h3>
      <p>${event.reason?.message || event.reason}</p>
      <pre>${event.reason?.stack}</pre>
    </div>
  `;
});

createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <AuthProvider>
      <App />
    </AuthProvider>
  </BrowserRouter>
);

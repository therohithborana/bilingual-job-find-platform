import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { initializeLocalStorage } from './lib/localStorage.ts';

// Initialize localStorage with sample data if empty
initializeLocalStorage();

createRoot(document.getElementById("root")!).render(
  <App />
);

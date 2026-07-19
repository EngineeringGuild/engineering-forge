// File: src/main.tsx
// Engineering Forge Documentation App - Main Entry Point

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Apply initial theme before rendering
const applyInitialTheme = () => {
  const savedTheme = localStorage.getItem('engineering-forge-navigation');
  if (savedTheme) {
    try {
      const parsed = JSON.parse(savedTheme);
      if (parsed.state?.theme === 'dark') {
        document.documentElement.classList.add('dark');
      }
    } catch {
      // Default to dark theme if parsing fails
      document.documentElement.classList.add('dark');
    }
  } else {
    // Default to dark theme
    document.documentElement.classList.add('dark');
  }
};

// Apply theme before rendering
applyInitialTheme();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

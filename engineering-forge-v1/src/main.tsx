import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';

console.log('🚀 Main.tsx loaded - Engineering Forge V1.0');

const rootElement = document.getElementById('root');
console.log('🎯 Root element:', rootElement);

if (rootElement) {
  try {
    const root = ReactDOM.createRoot(rootElement);
    console.log('✅ React root created successfully');

    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    console.log('🎮 App rendered successfully');

    // Performance monitoring
    const renderTime = performance.now();
    console.log(`⚡ Render completed in ${renderTime.toFixed(2)}ms`);

  } catch (error) {
    console.error('❌ Error rendering app:', error);
  }
} else {
  console.error('❌ Root element not found - cannot render app');
}

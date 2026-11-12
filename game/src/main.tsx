import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { App } from './App.tsx'

// Auto-redirect standard subpaths (e.g. /structures) to hash routing (/#/structures)
// to guarantee 100% reliability in iframe sandboxes, Cloud Run proxies, and static hosts
if (
  !window.location.hash &&
  window.location.pathname &&
  window.location.pathname !== '/' &&
  window.location.pathname !== '/index.html'
) {
  const targetHash = '#' + window.location.pathname + window.location.search;
  window.history.replaceState(null, '', targetHash);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)


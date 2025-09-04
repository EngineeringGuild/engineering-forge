import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Enable serving static files from the docs directory
    fs: {
      allow: ['..']
    }
  },
  // Configure public directory to include docs
  publicDir: 'public',
  // Add alias for easier imports
  resolve: {
    alias: {
      '@docs': '../docs'
    }
  }
})

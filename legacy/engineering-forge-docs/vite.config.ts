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
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Separate chunk for i18n
          'i18n': ['i18next', 'react-i18next'],
          // Separate chunk for syntax highlighter
          'syntax-highlighter': ['react-syntax-highlighter'],
        }
      }
    }
  },
  optimizeDeps: {
    include: ['i18next', 'react-i18next', 'i18next-browser-languagedetector']
  }
})

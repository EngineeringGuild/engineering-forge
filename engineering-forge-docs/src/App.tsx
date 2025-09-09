// File: src/App.tsx
// Engineering Forge Documentation App - Main Application Component - Professional Implementation

import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from './hooks/useTranslation';
import { useNavigationStore } from './store/navigationStore';
import { useContent } from './hooks/useContent';
import Header from './components/Layout/Header';
import Sidebar from './components/Layout/Sidebar';
import MarkdownRenderer from './components/Content/MarkdownRenderer';
import TableOfContents from './components/Content/TableOfContents';
import ErrorBoundary from './components/UI/ErrorBoundary';
import LoadingSpinner from './components/UI/LoadingSpinner';
import './i18n'; // Initialize i18n

function App() {
  const { t } = useTranslation('common');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // NUCLEAR FIX: Use direct store access to prevent infinite loops
  const theme = useNavigationStore((state) => state.theme);
  const { content, isLoading, error } = useContent();
  
  // Initialize app safely
  useEffect(() => {
    setIsInitialized(true);
  }, []);

  // Apply theme to document body on mount and theme change
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.classList.toggle('dark', theme === 'dark');
    }
  }, [theme]);

  // Memoize handlers to prevent unnecessary re-renders
  const handleMenuToggle = useCallback(() => {
    setIsMobileMenuOpen(prev => !prev);
  }, []);

  const handleMobileMenuClose = useCallback(() => {
    setIsMobileMenuOpen(false);
  }, []);

  // Show loading screen during initialization to prevent flickering
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Initializing application..." />
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        <Header 
          onMenuToggle={handleMenuToggle}
          isMobileMenuOpen={isMobileMenuOpen}
        />
        
        <Sidebar 
          isMobileOpen={isMobileMenuOpen}
          onMobileClose={handleMobileMenuClose}
        />
        
        <main className="lg:ml-80 pt-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {isLoading ? (
              <div className="py-12">
                <LoadingSpinner size="lg" text={t('content.loading')} />
              </div>
            ) : error ? (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
                <h2 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200 mb-2">Content Loading Notice</h2>
                <p className="text-yellow-700 dark:text-yellow-300">
                  The content is currently using fallback mode. This is normal in development.
                </p>
                <p className="text-sm text-yellow-600 dark:text-yellow-400 mt-2">
                  Build and deploy the application to access the full documentation content.
                </p>
              </div>
            ) : null}
            
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
              {/* Main Content */}
              <div className="xl:col-span-3">
                <div className="prose-custom max-w-none">
                  <MarkdownRenderer content={content} />
                </div>
              </div>
              
              {/* Table of Contents */}
              <div className="xl:col-span-1">
                <div className="sticky top-24">
                  <TableOfContents content={content} />
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </ErrorBoundary>
  );
}

export default App;
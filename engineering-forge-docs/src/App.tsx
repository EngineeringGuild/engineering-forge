// File: src/App.tsx
// Engineering Forge Documentation App - Main Application Component

import { useState, useEffect } from 'react';
import { useTheme } from './store/navigationStore';
import { useContent } from './hooks/useContent';
import Header from './components/Layout/Header';
import Sidebar from './components/Layout/Sidebar';
import MarkdownRenderer from './components/Content/MarkdownRenderer';
import TableOfContents from './components/Content/TableOfContents';
import ErrorBoundary from './components/UI/ErrorBoundary';
import LoadingSpinner from './components/UI/LoadingSpinner';

function App() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const theme = useTheme();
  const { content, isLoading, error } = useContent();

  // Apply theme to document body on mount and theme change - Memoized to prevent loops
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.classList.toggle('dark', theme === 'dark');
    }
  }, [theme]);

  const handleMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleMobileMenuClose = () => {
    setIsMobileMenuOpen(false);
  };

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
                <LoadingSpinner size="lg" text="Loading content..." />
              </div>
            ) : error ? (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
                <h2 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">Error Loading Content</h2>
                <p className="text-red-700 dark:text-red-300">{error}</p>
                <button 
                  onClick={() => window.location.reload()}
                  className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Reload Page
                </button>
              </div>
            ) : (
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
            )}
          </div>
        </main>
      </div>
    </ErrorBoundary>
  );
}

export default App;

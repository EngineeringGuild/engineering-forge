// File: src/App.tsx
// Engineering Forge Documentation App - CORRECTED VERSION
// All infinite loops fixed with proper patterns

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigationStore } from './store/navigationStore';
import { useLanguageStore } from './store/languageStore';

// Layout Components
import Header from './components/Layout/Header';
import Sidebar from './components/Layout/Sidebar';
import MarkdownRenderer from './components/Content/MarkdownRenderer';
import ErrorBoundary from './components/UI/ErrorBoundary';
import LoadingSpinner from './components/UI/LoadingSpinner';

// Hooks
import { useContent } from './hooks/useContent';
import { useTranslation } from './hooks/useTranslation';

// Import i18n configuration
import './i18n';

const App: React.FC = () => {
  const { t } = useTranslation('common');

  // FIXED: Local state management
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // FIXED: Granular selectors to prevent unnecessary re-renders
  const currentDocument = useNavigationStore((state) => state.currentDocument);
  const currentSection = useNavigationStore((state) => state.currentSection);
  const sidebarCollapsed = useNavigationStore((state) => state.sidebarCollapsed);
  const theme = useNavigationStore((state) => state.theme);
  const currentLanguage = useLanguageStore((state) => state.currentLanguage);

  // FIXED: Content management
  const { content, isLoading, error, reloadContent } = useContent();

  // FIXED: Separate useEffects to prevent cascading updates
  useEffect(() => {
    // Theme effect - only depends on theme
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    // Language effect - only depends on language
    document.documentElement.lang = currentLanguage;
  }, [currentLanguage]);

  useEffect(() => {
    // Initialization effect - runs only once
    setIsInitialized(true);
  }, []);

  // FIXED: Stable event handlers
  const handleMenuToggle = useCallback(() => {
    setIsMobileMenuOpen(prev => !prev);
  }, []);

  const handleMobileMenuClose = useCallback(() => {
    setIsMobileMenuOpen(false);
  }, []);

  // FIXED: Memoized computed values with stable dependencies
  const showContent = useMemo(() => {
    return currentDocument && isInitialized;
  }, [currentDocument, isInitialized]);

  const contentTitle = useMemo(() => {
    if (currentSection) {
      return t(`navigation.sections.${currentSection}`) || currentSection;
    }
    return currentDocument === 'GDD'
      ? (t('navigation.documents.gdd') || 'Game Design Document')
      : (t('navigation.documents.tdd') || 'Technical Design Document');
  }, [currentDocument, currentSection, t]);

  // FIXED: Simple loading check
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="large" />
          <p className="mt-4 text-gray-600 dark:text-gray-300">
            Loading...
          </p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
        {/* Header */}
        <Header
          onMenuToggle={handleMenuToggle}
          isMobileMenuOpen={isMobileMenuOpen}
        />

        <div className="flex h-[calc(100vh-4rem)]">
          {/* Sidebar */}
          <Sidebar
            isCollapsed={sidebarCollapsed}
            isMobileMenuOpen={isMobileMenuOpen}
            onMobileMenuClose={handleMobileMenuClose}
          />

          {/* Main Content */}
          <main className={`
            flex-1 flex flex-col overflow-hidden transition-all duration-300
            ${sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-80'}
          `}>
            {/* Content Header */}
            <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {contentTitle}
                  </h1>
                  {currentSection && (
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                      {t(`navigation.documents.${currentDocument.toLowerCase()}`, currentDocument)}
                    </p>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={reloadContent}
                    className="px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    disabled={isLoading}
                  >
                    {isLoading ? t('common.loading', 'Loading...') : t('common.reload', 'Reload')}
                  </button>
                </div>
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-auto bg-white dark:bg-gray-800">
              {showContent ? (
                <div className="max-w-none">
                  {error ? (
                    <div className="p-6">
                      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                        <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">
                          {t('common.error', 'Error')}
                        </h3>
                        <p className="text-red-700 dark:text-red-300">{error}</p>
                        <button
                          onClick={reloadContent}
                          className="mt-3 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                        >
                          {t('common.tryAgain', 'Try Again')}
                        </button>
                      </div>
                    </div>
                  ) : isLoading ? (
                    <div className="flex items-center justify-center h-64">
                      <div className="text-center">
                        <LoadingSpinner size="large" />
                        <p className="mt-4 text-gray-600 dark:text-gray-300">
                          {t('common.loadingContent', 'Loading content...')}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <MarkdownRenderer content={content} />
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      {t('welcome.title', 'Welcome to Engineering Forge')}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-300">
                      {t('welcome.subtitle', 'Select a document and section to get started')}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </main>
        </div>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={handleMobileMenuClose}
          />
        )}
      </div>
    </ErrorBoundary>
  );
};

export default App;

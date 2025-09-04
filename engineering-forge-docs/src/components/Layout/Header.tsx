// File: src/components/Layout/Header.tsx
// Engineering Forge Documentation App - Header Component

import React, { useState } from 'react';
import { Search, Sun, Moon, Menu, X } from 'lucide-react';
import { useCurrentDocument, useTheme, useNavigationActions } from '../../store/navigationStore';
import { useSearchActions } from '../../store/searchStore';
import SearchModal from '../UI/SearchModal';

interface HeaderProps {
  onMenuToggle: () => void;
  isMobileMenuOpen: boolean;
}

const Header: React.FC<HeaderProps> = ({ onMenuToggle, isMobileMenuOpen }) => {
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const currentDocument = useCurrentDocument();
  const theme = useTheme();
  const { setCurrentDocument, setTheme } = useNavigationActions();
  const { clearSearch } = useSearchActions();

  const handleDocumentSwitch = (document: 'GDD' | 'TDD') => {
    setCurrentDocument(document);
    clearSearch();
  };

  const handleThemeToggle = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  };

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Title */}
          <div className="flex items-center space-x-4">
            <button
              onClick={onMenuToggle}
              className="lg:hidden p-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-accent-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">EF</span>
              </div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                Engineering Forge
              </h1>
            </div>
          </div>

          {/* Document Navigation */}
          <div className="hidden md:flex items-center space-x-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => handleDocumentSwitch('GDD')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                currentDocument === 'GDD'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Game Design Document
            </button>
            <button
              onClick={() => handleDocumentSwitch('TDD')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                currentDocument === 'TDD'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Technical Design Document
            </button>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-3">
            {/* Search */}
            <div className="relative hidden sm:block">
              <button
                onClick={() => setIsSearchModalOpen(true)}
                className="flex items-center w-64 pl-10 pr-4 py-2 text-sm bg-gray-100 dark:bg-gray-800 border-0 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
              >
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search size={16} className="text-gray-400" />
                </div>
                <span>Search documentation...</span>
              </button>
            </div>

            {/* Theme Toggle */}
            <button
              onClick={handleThemeToggle}
              className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </button>

            {/* Mobile Search Button */}
            <button 
              onClick={() => setIsSearchModalOpen(true)}
              className="sm:hidden p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <Search size={18} />
            </button>
          </div>
        </div>

        {/* Mobile Document Navigation */}
        <div className="md:hidden pb-4">
          <div className="flex items-center space-x-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => handleDocumentSwitch('GDD')}
              className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                currentDocument === 'GDD'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              GDD
            </button>
            <button
              onClick={() => handleDocumentSwitch('TDD')}
              className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                currentDocument === 'TDD'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              TDD
            </button>
          </div>
        </div>
      </div>
      
      {/* Search Modal */}
      <SearchModal 
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
      />
    </header>
  );
};

export default Header;

// File: src/components/UI/SearchModal.tsx
// Engineering Forge Documentation App - Search Modal Component

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, X, Clock, FileText, Filter } from 'lucide-react';
import { useSearchActions, useSearchResults, useIsSearching, useSearchHistory } from '../../store/searchStore';
import { useDebounce } from '../../hooks/useDebounce';


interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const { search, clearSearch } = useSearchActions();
  const results = useSearchResults();
  const isSearching = useIsSearching();
  const searchHistory = useSearchHistory();

  // Use debounced query to prevent excessive API calls
  const debouncedQuery = useDebounce(query, 300);

  // Memoize the search handler to prevent infinite loops
  const handleSearch = useCallback(async (searchQuery: string) => {
    if (searchQuery.trim()) {
      await search(searchQuery);
    } else {
      clearSearch();
    }
  }, [search, clearSearch]);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Handle debounced search - Fixed infinite loop
  useEffect(() => {
    if (!debouncedQuery.trim()) {
      clearSearch();
      return;
    }

    handleSearch(debouncedQuery);
  }, [debouncedQuery, handleSearch, clearSearch]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-center pt-20">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <Search size={20} className="text-gray-500" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Search Documentation
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Search Input */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={16} className="text-gray-400" />
            </div>
            <input
              ref={inputRef}
              type="text"
              placeholder="Search in documentation..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 text-sm bg-gray-100 dark:bg-gray-800 border-0 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white dark:focus:bg-gray-700 transition-colors"
            />
            {isSearching && (
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-500"></div>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {query.trim() ? (
            // Search Results
            <div className="p-4">
              {results.length > 0 ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {results.length} result{results.length !== 1 ? 's' : ''} found
                    </h3>
                    <button
                      onClick={() => setShowFilters(!showFilters)}
                      className="flex items-center space-x-1 text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                    >
                      <Filter size={12} />
                      <span>Filters</span>
                    </button>
                  </div>
                  
                  {results.map((result) => (
                    <div
                      key={result.id}
                      className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                    >
                      <div className="flex items-start space-x-3">
                        <FileText size={16} className="text-gray-400 mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {result.title}
                          </h4>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {result.document} • {result.path}
                          </p>
                          <p className="text-sm text-gray-700 dark:text-gray-300 mt-2 line-clamp-2">
                            {result.excerpt}
                          </p>
                        </div>
                        <div className="text-xs text-gray-400 flex-shrink-0">
                          {Math.round(result.relevance * 100)}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : !isSearching ? (
                <div className="text-center py-8">
                  <Search size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No results found
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    Try different keywords or check your spelling
                  </p>
                </div>
              ) : null}
            </div>
          ) : (
            // Search History and Suggestions
            <div className="p-4">
              {searchHistory.length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center space-x-2 mb-3">
                    <Clock size={16} className="text-gray-400" />
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Recent Searches
                    </h3>
                  </div>
                  <div className="space-y-2">
                    {searchHistory.slice(0, 5).map((searchTerm, index) => (
                      <button
                        key={index}
                        onClick={() => setQuery(searchTerm)}
                        className="w-full text-left p-2 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                      >
                        {searchTerm}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Search Tips
                </h3>
                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <p>• Use specific keywords for better results</p>
                  <p>• Search for technical terms, concepts, or features</p>
                  <p>• Try different variations of your search terms</p>
                  <p>• Use quotes for exact phrase matching</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchModal;

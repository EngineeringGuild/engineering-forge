// File: src/store/searchStore.ts
// Engineering Forge Documentation App - Search Store

import { create } from 'zustand';
import type { SearchResult, SearchContextType } from '../types';

interface SearchStore extends SearchContextType {
  // Additional state
  searchHistory: string[];
  recentSearches: string[];
  searchFilters: {
    document: 'all' | 'GDD' | 'TDD';
    section: string;
    status: 'all' | 'complete' | 'in-progress' | 'draft';
  };
  
  // Actions
  addToHistory: (query: string) => void;
  clearHistory: () => void;
  addToRecentSearches: (query: string) => void;
  clearRecentSearches: () => void;
  setSearchFilters: (filters: Partial<SearchStore['searchFilters']>) => void;
  resetSearch: () => void;
}

const initialState = {
  query: '',
  results: [],
  isSearching: false,
  searchHistory: [],
  recentSearches: [],
  searchFilters: {
    document: 'all' as 'all' | 'GDD' | 'TDD',
    section: '',
    status: 'all' as 'all' | 'complete' | 'in-progress' | 'draft',
  },
};

export const useSearchStore = create<SearchStore>((set, get) => ({
  ...initialState,

  search: async (query: string) => {
    if (!query.trim()) {
      set({ query: '', results: [], isSearching: false });
      return;
    }

    set({ query, isSearching: true });
    
    try {
      // Simulate search delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Mock search results - in real app, this would call an API
      const mockResults: SearchResult[] = [
        {
          id: 'mock-1',
          title: 'Mock Search Result 1',
          path: '/gdd/core-mechanics',
          excerpt: `This is a mock search result for "${query}". It demonstrates how search results will appear in the documentation.`,
          document: 'GDD',
          relevance: 0.95,
        },
        {
          id: 'mock-2',
          title: 'Mock Search Result 2',
          path: '/tdd/api-design',
          excerpt: `Another mock result showing search functionality for "${query}". This helps visualize the search experience.`,
          document: 'TDD',
          relevance: 0.87,
        },
      ];

      set({ 
        results: mockResults, 
        isSearching: false 
      });

      // Add to history and recent searches
      get().addToHistory(query);
      get().addToRecentSearches(query);
      
    } catch (error) {
      console.error('Search error:', error);
      set({ 
        results: [], 
        isSearching: false 
      });
    }
  },

  clearSearch: () => {
    set({ query: '', results: [] });
  },

  addToHistory: (query: string) => {
    set((state) => ({
      searchHistory: [
        query,
        ...state.searchHistory.filter(q => q !== query)
      ].slice(0, 10), // Keep only last 10 searches
    }));
  },

  clearHistory: () => {
    set({ searchHistory: [] });
  },

  addToRecentSearches: (query: string) => {
    set((state) => ({
      recentSearches: [
        query,
        ...state.recentSearches.filter(q => q !== query)
      ].slice(0, 5), // Keep only last 5 recent searches
    }));
  },

  clearRecentSearches: () => {
    set({ recentSearches: [] });
  },

  setSearchFilters: (filters) => {
    set((state) => ({
      searchFilters: { ...state.searchFilters, ...filters }
    }));
  },

  resetSearch: () => {
    set(initialState);
  },
}));

// Selectors
export const useSearchQuery = () => useSearchStore((state) => state.query);
export const useSearchResults = () => useSearchStore((state) => state.results);
export const useIsSearching = () => useSearchStore((state) => state.isSearching);
export const useSearchHistory = () => useSearchStore((state) => state.searchHistory);
export const useRecentSearches = () => useSearchStore((state) => state.recentSearches);
export const useSearchFilters = () => useSearchStore((state) => state.searchFilters);

// Actions - Memoized to prevent unnecessary re-renders
export const useSearchActions = () => {
  const search = useSearchStore((state) => state.search);
  const clearSearch = useSearchStore((state) => state.clearSearch);
  const addToHistory = useSearchStore((state) => state.addToHistory);
  const clearHistory = useSearchStore((state) => state.clearHistory);
  const addToRecentSearches = useSearchStore((state) => state.addToRecentSearches);
  const clearRecentSearches = useSearchStore((state) => state.clearRecentSearches);
  const setSearchFilters = useSearchStore((state) => state.setSearchFilters);
  const resetSearch = useSearchStore((state) => state.resetSearch);

  return {
    search,
    clearSearch,
    addToHistory,
    clearHistory,
    addToRecentSearches,
    clearRecentSearches,
    setSearchFilters,
    resetSearch,
  };
};

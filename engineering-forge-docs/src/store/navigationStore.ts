// File: src/store/navigationStore.ts
// Engineering Forge Documentation App - Navigation Store

import { create } from 'zustand';
// import { persist } from 'zustand/middleware'; // Disabled to prevent unused import
import type { NavigationState } from '../types';

interface NavigationStore extends NavigationState {
  // Actions
  setCurrentDocument: (document: 'GDD' | 'TDD') => void;
  setCurrentSection: (sectionId: string) => void;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setSearchQuery: (query: string) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  resetNavigation: () => void;
}

const initialState: NavigationState = {
  currentDocument: 'GDD',
  currentSection: '',
  sidebarCollapsed: false,
  searchQuery: '',
  theme: 'dark'
};

// ENTERPRISE OPTIMIZATION: Advanced store with performance optimizations
export const useNavigationStore = create<NavigationStore>()((set, get) => ({
  ...initialState,

  setCurrentDocument: (document) => {
    const currentState = get();
    // Only update if document actually changed
    if (currentState.currentDocument !== document) {
      set({
        currentDocument: document,
        currentSection: '',
        searchQuery: ''
      });
    }
  },

  setCurrentSection: (sectionId) => {
    const currentState = get();
    // Only update if section actually changed
    if (currentState.currentSection !== sectionId) {
      set({ currentSection: sectionId });
    }
  },

  toggleSidebar: () => {
    set((state) => ({
      sidebarCollapsed: !state.sidebarCollapsed
    }));
  },

  setSidebarCollapsed: (collapsed) => {
    const currentState = get();
    // Only update if state actually changed
    if (currentState.sidebarCollapsed !== collapsed) {
      set({ sidebarCollapsed: collapsed });
    }
  },

  setSearchQuery: (query) => {
    const currentState = get();
    // Only update if query actually changed
    if (currentState.searchQuery !== query) {
      set({ searchQuery: query });
    }
  },

  setTheme: (theme) => {
    const currentState = get();
    // Only update if theme actually changed
    if (currentState.theme !== theme) {
      set({ theme });
    }
  },

  resetNavigation: () => {
    set(initialState);
  }
}));

// Selectors for better performance
export const useCurrentDocument = () => useNavigationStore((state) => state.currentDocument);
export const useCurrentSection = () => useNavigationStore((state) => state.currentSection);
export const useSidebarCollapsed = () => useNavigationStore((state) => state.sidebarCollapsed);
export const useTheme = () => useNavigationStore((state) => state.theme);
export const useSearchQuery = () => useNavigationStore((state) => state.searchQuery);

// Actions - NUCLEAR FIX: Simplified to prevent infinite loops
export const useNavigationActions = () => {
  return useNavigationStore((state) => ({
    setCurrentDocument: state.setCurrentDocument,
    setCurrentSection: state.setCurrentSection,
    toggleSidebar: state.toggleSidebar,
    setSidebarCollapsed: state.setSidebarCollapsed,
    setSearchQuery: state.setSearchQuery,
    setTheme: state.setTheme,
    resetNavigation: state.resetNavigation
  }));
};

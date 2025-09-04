// File: src/store/navigationStore.ts
// Engineering Forge Documentation App - Navigation Store

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
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
  theme: 'dark',
};

export const useNavigationStore = create<NavigationStore>()(
  persist(
    (set) => ({
      ...initialState,

      setCurrentDocument: (document) => {
        set({ 
          currentDocument: document, 
          currentSection: '',
          searchQuery: '' 
        });
      },

      setCurrentSection: (sectionId) => {
        set({ currentSection: sectionId });
      },

      toggleSidebar: () => {
        set((state) => ({ 
          sidebarCollapsed: !state.sidebarCollapsed 
        }));
      },

      setSidebarCollapsed: (collapsed) => {
        set({ sidebarCollapsed: collapsed });
      },

      setSearchQuery: (query) => {
        set({ searchQuery: query });
      },

      setTheme: (theme) => {
        set({ theme });
      },

      resetNavigation: () => {
        set(initialState);
      },
    }),
    {
      name: 'engineering-forge-navigation',
      partialize: (state) => ({
        currentDocument: state.currentDocument,
        currentSection: state.currentSection,
        sidebarCollapsed: state.sidebarCollapsed,
        theme: state.theme,
      }),
    }
  )
);

// Selectors for better performance
export const useCurrentDocument = () => useNavigationStore((state) => state.currentDocument);
export const useCurrentSection = () => useNavigationStore((state) => state.currentSection);
export const useSidebarCollapsed = () => useNavigationStore((state) => state.sidebarCollapsed);
export const useTheme = () => useNavigationStore((state) => state.theme);
export const useSearchQuery = () => useNavigationStore((state) => state.searchQuery);

// Actions - Memoized to prevent unnecessary re-renders
export const useNavigationActions = () => {
  const setCurrentDocument = useNavigationStore((state) => state.setCurrentDocument);
  const setCurrentSection = useNavigationStore((state) => state.setCurrentSection);
  const toggleSidebar = useNavigationStore((state) => state.toggleSidebar);
  const setSidebarCollapsed = useNavigationStore((state) => state.setSidebarCollapsed);
  const setSearchQuery = useNavigationStore((state) => state.setSearchQuery);
  const setTheme = useNavigationStore((state) => state.setTheme);
  const resetNavigation = useNavigationStore((state) => state.resetNavigation);

  return {
    setCurrentDocument,
    setCurrentSection,
    toggleSidebar,
    setSidebarCollapsed,
    setSearchQuery,
    setTheme,
    resetNavigation,
  };
};

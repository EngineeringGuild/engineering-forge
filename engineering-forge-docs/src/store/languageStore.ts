// File: src/store/languageStore.ts
// Engineering Forge Documentation App - Language Store - NUCLEAR FIX

import { create } from 'zustand';
import { changeLanguage, SUPPORTED_LANGUAGES, type SupportedLanguage } from '../i18n';

interface LanguageState {
  // State
  currentLanguage: SupportedLanguage;
  isLoading: boolean;
  error: string | null;
  lastChanged: number;
  isInitialized: boolean;
  _memoizedLanguages?: Array<typeof SUPPORTED_LANGUAGES[SupportedLanguage]>; // FIXED: Memoization field
  
  // Actions
  setLanguage: (language: SupportedLanguage) => Promise<boolean>;
  detectLanguage: () => SupportedLanguage;
  resetLanguage: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  initialize: () => void;
  
  // Getters
  getLanguageInfo: () => typeof SUPPORTED_LANGUAGES[SupportedLanguage];
  isRTL: () => boolean;
  getAvailableLanguages: () => Array<typeof SUPPORTED_LANGUAGES[SupportedLanguage]>;
}

const initialState = {
  currentLanguage: 'en' as SupportedLanguage,
  isLoading: false,
  error: null,
  lastChanged: Date.now(),
  isInitialized: true, // FIXED: Start as initialized to prevent loops
};

// NUCLEAR FIX: Disable persistence to prevent infinite loops
export const useLanguageStore = create<LanguageState>()((set, get) => ({
  ...initialState,

  setLanguage: async (language: SupportedLanguage) => {
    const currentState = get();
    
    // ENTERPRISE OPTIMIZATION: Don't change if it's the same language
    if (currentState.currentLanguage === language) {
      return true;
    }

    // ENTERPRISE OPTIMIZATION: Don't start loading if already loading
    if (currentState.isLoading) {
      return false;
    }

    set({ isLoading: true, error: null });

    try {
      const success = await changeLanguage(language);
      
      if (success) {
        set({
          currentLanguage: language,
          isLoading: false,
          error: null,
          lastChanged: Date.now(),
        });
        return true;
      } else {
        set({
          isLoading: false,
          error: `Failed to change language to ${language}`,
        });
        return false;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      set({
        isLoading: false,
        error: `Language change failed: ${errorMessage}`,
      });
      return false;
    }
  },

  detectLanguage: () => {
    try {
      // Professional language detection with proper fallbacks
      
      // 1. Check localStorage first
      const stored = localStorage.getItem('engineering-forge-language') as SupportedLanguage;
      if (stored && Object.keys(SUPPORTED_LANGUAGES).includes(stored)) {
        return stored;
      }

      // 2. Check browser language
      if (navigator.language) {
        const browserLang = navigator.language.split('-')[0] as SupportedLanguage;
        if (Object.keys(SUPPORTED_LANGUAGES).includes(browserLang)) {
          return browserLang;
        }
      }

      // 3. Check for URL parameter
      const urlParams = new URLSearchParams(window.location.search);
      const urlLang = urlParams.get('lang') as SupportedLanguage;
      if (urlLang && Object.keys(SUPPORTED_LANGUAGES).includes(urlLang)) {
        return urlLang;
      }

      // 4. Check browser languages array
      if (navigator.languages && navigator.languages.length > 0) {
        for (const lang of navigator.languages) {
          const langCode = lang.split('-')[0] as SupportedLanguage;
          if (Object.keys(SUPPORTED_LANGUAGES).includes(langCode)) {
            return langCode;
          }
        }
      }

      // 5. Default to English
      return 'en';
    } catch (error) {
      console.warn('Language detection failed:', error);
      return 'en';
    }
  },

  resetLanguage: () => {
    set(initialState);
    changeLanguage('en');
  },

  setLoading: (loading: boolean) => {
    set({ isLoading: loading });
  },

  setError: (error: string | null) => {
    set({ error });
  },

  initialize: () => {
    // FIXED: Simplified initialization to prevent loops
    try {
      const detectedLanguage = get().detectLanguage();
      if (detectedLanguage !== get().currentLanguage) {
        set({ currentLanguage: detectedLanguage });
      }
    } catch (error) {
      console.warn('Language initialization failed:', error);
    }
  },

  getLanguageInfo: () => {
    const currentLang = get().currentLanguage;
    return SUPPORTED_LANGUAGES[currentLang];
  },

  isRTL: () => {
    const currentLang = get().currentLanguage;
    return SUPPORTED_LANGUAGES[currentLang].rtl;
  },

  getAvailableLanguages: () => {
    // FIXED: Return memoized array to prevent infinite loops
    const state = get();
    if (!state._memoizedLanguages) {
      const sorted = Object.values(SUPPORTED_LANGUAGES).sort((a, b) => a.priority - b.priority);
      // Store memoized result in state
      set({ _memoizedLanguages: sorted });
      return sorted;
    }
    return state._memoizedLanguages;
  },
}));

// Selectors for better performance
export const useCurrentLanguage = () => useLanguageStore((state) => state.currentLanguage);
export const useLanguageLoading = () => useLanguageStore((state) => state.isLoading);
export const useLanguageError = () => useLanguageStore((state) => state.error);
export const useLanguageInfo = () => useLanguageStore((state) => state.getLanguageInfo());
export const useIsRTL = () => useLanguageStore((state) => state.isRTL());

// FIXED: Cached array outside store to ensure stable reference
const CACHED_AVAILABLE_LANGUAGES = Object.values(SUPPORTED_LANGUAGES).sort((a, b) => a.priority - b.priority);

// FIXED: Simple selector that returns cached array
export const useAvailableLanguages = () => {
  return CACHED_AVAILABLE_LANGUAGES; // Always same reference
};

// Actions - NUCLEAR FIX: Simplified to prevent infinite loops
export const useLanguageActions = () => {
  return useLanguageStore((state) => ({
    setLanguage: state.setLanguage,
    detectLanguage: state.detectLanguage,
    resetLanguage: state.resetLanguage,
    setLoading: state.setLoading,
    setError: state.setError,
  }));
};
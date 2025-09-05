// File: src/store/languageStore.ts
// Engineering Forge Documentation App - Language Store

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { changeLanguage, SUPPORTED_LANGUAGES, type SupportedLanguage } from '../i18n';

interface LanguageState {
  // State
  currentLanguage: SupportedLanguage;
  isLoading: boolean;
  error: string | null;
  lastChanged: number;
  
  // Actions
  setLanguage: (language: SupportedLanguage) => Promise<boolean>;
  detectLanguage: () => SupportedLanguage;
  resetLanguage: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
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
};

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set, get) => ({
      ...initialState,

      setLanguage: async (language: SupportedLanguage) => {
        const currentLang = get().currentLanguage;
        
        // Don't change if it's the same language
        if (currentLang === language) {
          return true;
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
          // Try to detect language from various sources with error handling
          
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

      getLanguageInfo: () => {
        const currentLang = get().currentLanguage;
        return SUPPORTED_LANGUAGES[currentLang];
      },

      isRTL: () => {
        const currentLang = get().currentLanguage;
        return SUPPORTED_LANGUAGES[currentLang].rtl;
      },

      getAvailableLanguages: () => {
        return Object.values(SUPPORTED_LANGUAGES).sort((a, b) => a.priority - b.priority);
      },
    }),
    {
      name: 'engineering-forge-language',
      partialize: (state) => ({
        currentLanguage: state.currentLanguage,
        lastChanged: state.lastChanged,
      }),
    }
  )
);

// Selectors for better performance
export const useCurrentLanguage = () => useLanguageStore((state) => state.currentLanguage);
export const useLanguageLoading = () => useLanguageStore((state) => state.isLoading);
export const useLanguageError = () => useLanguageStore((state) => state.error);
export const useLanguageInfo = () => useLanguageStore((state) => state.getLanguageInfo());
export const useIsRTL = () => useLanguageStore((state) => state.isRTL());
export const useAvailableLanguages = () => useLanguageStore((state) => state.getAvailableLanguages());

// Actions - Memoized to prevent unnecessary re-renders
export const useLanguageActions = () => {
  const setLanguage = useLanguageStore((state) => state.setLanguage);
  const detectLanguage = useLanguageStore((state) => state.detectLanguage);
  const resetLanguage = useLanguageStore((state) => state.resetLanguage);
  const setLoading = useLanguageStore((state) => state.setLoading);
  const setError = useLanguageStore((state) => state.setError);

  return {
    setLanguage,
    detectLanguage,
    resetLanguage,
    setLoading,
    setError,
  };
};

// Initialize language on store creation
const initializeLanguage = () => {
  const store = useLanguageStore.getState();
  const detectedLanguage = store.detectLanguage();
  
  if (detectedLanguage !== store.currentLanguage) {
    store.setLanguage(detectedLanguage);
  }
};

// Initialize when store is created
initializeLanguage();

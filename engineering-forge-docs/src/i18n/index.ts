// File: src/i18n/index.ts
// Engineering Forge Documentation App - i18n Configuration

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import resourcesToBackend from 'i18next-resources-to-backend';

// Supported languages configuration
export const SUPPORTED_LANGUAGES = {
  en: {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🇺🇸',
    rtl: false,
    priority: 1, // Higher priority = more likely to be preloaded
  },
  pt: {
    code: 'pt',
    name: 'Portuguese',
    nativeName: 'Português',
    flag: '🇧🇷',
    rtl: false,
    priority: 2,
  },
  fr: {
    code: 'fr',
    name: 'French',
    nativeName: 'Français',
    flag: '🇫🇷',
    rtl: false,
    priority: 3,
  },
  uk: {
    code: 'uk',
    name: 'Ukrainian',
    nativeName: 'Українська',
    flag: '🇺🇦',
    rtl: false,
    priority: 4,
  },
  zh: {
    code: 'zh',
    name: 'Chinese',
    nativeName: '中文',
    flag: '🇨🇳',
    rtl: false,
    priority: 5,
  },
} as const;

export type SupportedLanguage = keyof typeof SUPPORTED_LANGUAGES;

// Initialize i18next with production-ready configuration
i18n
  .use(LanguageDetector)
  .use(
    resourcesToBackend((language: string, namespace: string) => {
      return import(`./locales/${language}/${namespace}.json`);
    })
  )
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    debug: process.env.NODE_ENV === 'development',
    defaultNS: 'common',
    ns: ['common', 'navigation', 'content', 'errors'],
    supportedLngs: Object.keys(SUPPORTED_LANGUAGES),
    interpolation: {
      escapeValue: false, // React already escapes by default
    },
    react: {
      useSuspense: false, // Disable suspense for better SSR compatibility
      bindI18n: 'languageChanged loaded',
      bindI18nStore: 'added removed',
      transEmptyNodeValue: '',
      transSupportBasicHtmlNodes: true,
      transKeepBasicHtmlNodesFor: ['br', 'strong', 'i', 'p'],
    },
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      lookupLocalStorage: 'engineering-forge-language',
    },
    // Performance optimizations
    load: 'languageOnly',
    cleanCode: true,
    nonExplicitSupportedLngs: false,
    // Error handling
    saveMissing: process.env.NODE_ENV === 'development',
    missingKeyHandler: (lng, ns, key) => {
      if (process.env.NODE_ENV === 'development') {
        console.warn(`Missing translation key: ${key} in ${lng}/${ns}`);
      }
    },
  });

// Language utilities
export const getLanguageInfo = (code: string) => {
  return SUPPORTED_LANGUAGES[code as SupportedLanguage] || SUPPORTED_LANGUAGES.en;
};

export const getLanguageDirection = (code: string): 'ltr' | 'rtl' => {
  const language = getLanguageInfo(code);
  return language.rtl ? 'rtl' : 'ltr';
};

export const isRTL = (code: string): boolean => {
  return getLanguageDirection(code) === 'rtl';
};

// Change language with error handling
export const changeLanguage = async (language: string): Promise<boolean> => {
  try {
    await i18n.changeLanguage(language);
    
    // Update document direction for RTL languages
    const direction = getLanguageDirection(language);
    document.documentElement.dir = direction;
    document.documentElement.lang = language;
    
    return true;
  } catch (error) {
    console.error(`Failed to change language to ${language}:`, error);
    return false;
  }
};

// Get current language with fallback
export const getCurrentLanguage = (): SupportedLanguage => {
  const currentLang = i18n.language;
  return Object.keys(SUPPORTED_LANGUAGES).includes(currentLang) 
    ? currentLang as SupportedLanguage 
    : 'en';
};

// Initialize language direction on app start
const initializeLanguageDirection = () => {
  const currentLang = getCurrentLanguage();
  const direction = getLanguageDirection(currentLang);
  document.documentElement.dir = direction;
  document.documentElement.lang = currentLang;
};

// Initialize on app start
initializeLanguageDirection();

export default i18n;
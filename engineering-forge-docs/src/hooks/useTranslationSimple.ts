// File: src/hooks/useTranslationSimple.ts
// NUCLEAR FIX: Ultra-simplified translation hook to prevent infinite loops

import { debugRender } from '../utils/debugLoop';

// Fallback translations to prevent any i18n dependency issues
const FALLBACK_TRANSLATIONS = {
  'app.title': 'Engineering Forge',
  'navigation.gdd': 'GDD',
  'navigation.tdd': 'TDD',
  'navigation.search': 'Search...',
  'actions.toggleTheme': 'Toggle theme',
  'language.select': 'Select language',
  'content.loading': 'Loading content...',
};

export const useTranslation = (namespace?: string) => {
  debugRender(`useTranslationSimple-${namespace || 'default'}`);
  
  // Ultra-simple translation function that never causes re-renders
  const t = (key: string): string => {
    const fallbackKey = key as keyof typeof FALLBACK_TRANSLATIONS;
    return FALLBACK_TRANSLATIONS[fallbackKey] || key;
  };

  return {
    t,
    i18n: {
      language: 'en',
      dir: () => 'ltr',
    },
    ready: true,
    hasTranslation: () => true,
    getTranslations: () => ({}),
    isRTL: () => false,
    getDirection: () => 'ltr' as const,
    formatNumber: (value: number) => value.toString(),
    formatDate: (date: Date) => date.toLocaleDateString(),
    formatCurrency: (value: number, currency: string = 'USD') => `${currency} ${value}`,
  };
};

export default useTranslation;

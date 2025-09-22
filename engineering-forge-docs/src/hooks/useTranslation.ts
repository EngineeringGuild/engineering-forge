// File: src/hooks/useTranslation.ts
// Engineering Forge Documentation App - Simplified Translation Hook - NUCLEAR FIX

import { useTranslation as useI18nTranslation } from 'react-i18next';
import { useCallback } from 'react';

// NUCLEAR FIX: Ultra-simplified translation hook to prevent loops
export const useTranslation = (namespace?: string) => {
  const { t: i18nT, i18n, ready } = useI18nTranslation(namespace);

  // FIXED: Simple translation function without complex memoization
  const t = useCallback((key: string, fallback?: string): string => {
    try {
      if (!ready || !i18nT) {
        return fallback || key;
      }
      
      const result = i18nT(key);
      return typeof result === 'string' ? result : (fallback || key);
    } catch {
      return fallback || key;
    }
  }, [i18nT, ready]);

  return {
    t,
    i18n: i18n || {},
    ready: ready || true, // FIXED: Default to true to prevent loading issues
  };
};

export default useTranslation;
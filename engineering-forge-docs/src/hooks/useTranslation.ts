// File: src/hooks/useTranslation.ts
// Engineering Forge Documentation App - Enhanced Translation Hook

import { useTranslation as useI18nTranslation } from 'react-i18next';
import { useCurrentLanguage } from '../store/languageStore';

// Enhanced translation hook with additional utilities
export const useTranslation = (namespace?: string) => {
  const { t, i18n, ready } = useI18nTranslation(namespace);
  const currentLanguage = useCurrentLanguage();

  // Enhanced translation function with fallback handling
  const translate = (key: string, options?: Record<string, unknown>): string => {
    if (!ready) {
      return key; // Return key if i18n is not ready
    }

    try {
      const translation = t(key, options);
      
      // Ensure we return a string
      const result = typeof translation === 'string' ? translation : String(translation);
      
      // If translation is the same as key, it means translation is missing
      if (result === key && process.env.NODE_ENV === 'development') {
        console.warn(`Missing translation for key: ${key} in language: ${currentLanguage}`);
      }
      
      return result;
    } catch (error) {
      console.error('Translation error:', error);
      return key; // Return key as fallback
    }
  };

  // Check if a translation key exists
  const hasTranslation = (key: string): boolean => {
    if (!ready) return false;
    
    try {
      const translation = t(key, { returnObjects: true });
      return typeof translation === 'object' || (typeof translation === 'string' && translation !== key);
    } catch {
      return false;
    }
  };

  // Get all translations for a namespace
  const getTranslations = (namespace?: string): Record<string, unknown> => {
    if (!ready) return {};
    
    try {
      return i18n.getResourceBundle(currentLanguage, namespace || 'common');
    } catch {
      return {};
    }
  };

  // Check if current language is RTL
  const isRTL = (): boolean => {
    return i18n.dir() === 'rtl';
  };

  // Get current language direction
  const getDirection = (): 'ltr' | 'rtl' => {
    return i18n.dir() as 'ltr' | 'rtl';
  };

  // Format number according to current locale
  const formatNumber = (value: number, options?: Intl.NumberFormatOptions): string => {
    try {
      return new Intl.NumberFormat(currentLanguage, options).format(value);
    } catch {
      return value.toString();
    }
  };

  // Format date according to current locale
  const formatDate = (date: Date, options?: Intl.DateTimeFormatOptions): string => {
    try {
      return new Intl.DateTimeFormat(currentLanguage, options).format(date);
    } catch {
      return date.toLocaleDateString();
    }
  };

  // Format currency according to current locale
  const formatCurrency = (value: number, currency: string = 'USD', options?: Intl.NumberFormatOptions): string => {
    try {
      return new Intl.NumberFormat(currentLanguage, {
        style: 'currency',
        currency,
        ...options,
      }).format(value);
    } catch {
      return `${currency} ${value}`;
    }
  };

  return {
    t: translate,
    i18n,
    ready,
    currentLanguage,
    hasTranslation,
    getTranslations,
    isRTL,
    getDirection,
    formatNumber,
    formatDate,
    formatCurrency,
  };
};

// Hook for pluralization
export const usePluralization = () => {
  const { t } = useTranslation();

  const pluralize = (key: string, count: number, options?: Record<string, unknown>): string => {
    try {
      // Use i18next pluralization
      return t(key, { count, ...options });
    } catch {
      // Fallback to simple pluralization
      return count === 1 ? t(`${key}.one`, options) : t(`${key}.other`, options);
    }
  };

  return { pluralize };
};

// Hook for interpolation
export const useInterpolation = () => {
  const { t } = useTranslation();

  const interpolate = (key: string, values: Record<string, unknown>): string => {
    try {
      return t(key, values);
    } catch {
      // Simple fallback interpolation
      let result = t(key);
      Object.entries(values).forEach(([placeholder, value]) => {
        result = result.replace(new RegExp(`{{${placeholder}}}`, 'g'), String(value));
      });
      return result;
    }
  };

  return { interpolate };
};

export default useTranslation;

// File: src/components/UI/LanguageSelector.tsx
// Engineering Forge Documentation App - Language Selector Component

import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { ChevronDown, Globe, Check } from 'lucide-react';
import { useCurrentLanguage, useLanguageActions, useAvailableLanguages } from '../../store/languageStore';
import { SUPPORTED_LANGUAGES, type SupportedLanguage } from '../../i18n';

interface LanguageSelectorProps {
  variant?: 'header' | 'dropdown' | 'mobile';
  className?: string;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ 
  variant = 'header', 
  className = '' 
}) => {
  const { t } = useTranslation('common');
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const currentLanguage = useCurrentLanguage();
  const { setLanguage } = useLanguageActions();
  const availableLanguages = useAvailableLanguages();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close dropdown on escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  const handleLanguageChange = async (languageCode: SupportedLanguage) => {
    if (languageCode === currentLanguage) {
      setIsOpen(false);
      return;
    }

    const success = await setLanguage(languageCode);
    if (success) {
      setIsOpen(false);
    }
  };

  const currentLanguageInfo = SUPPORTED_LANGUAGES[currentLanguage];

  // Header variant - compact button
  if (variant === 'header') {
    return (
      <div className={`relative ${className}`} ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center space-x-2 px-3 py-2 text-sm bg-gray-100 dark:bg-gray-800 border-0 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
          aria-label={t('language.select')}
        >
          <Globe size={16} />
          <span className="hidden sm:inline">{currentLanguageInfo.flag}</span>
          <span className="hidden md:inline">{currentLanguageInfo.code.toUpperCase()}</span>
          <ChevronDown size={14} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
            <div className="py-1">
              {availableLanguages.map((language) => (
                <button
                  key={language.code}
                  onClick={() => handleLanguageChange(language.code as SupportedLanguage)}
                  className={`w-full flex items-center space-x-3 px-4 py-2 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                    language.code === currentLanguage ? 'bg-primary-50 dark:bg-primary-900/20' : ''
                  }`}
                >
                  <span className="text-lg">{language.flag}</span>
                  <span className="flex-1 text-gray-900 dark:text-gray-100">
                    {language.nativeName}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {language.name}
                  </span>
                  {language.code === currentLanguage && (
                    <Check size={16} className="text-primary-600 dark:text-primary-400" />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Dropdown variant - full dropdown
  if (variant === 'dropdown') {
    return (
      <div className={`relative ${className}`} ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between px-4 py-3 text-left bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
        >
          <div className="flex items-center space-x-3">
            <Globe size={20} className="text-gray-400" />
            <div>
              <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {currentLanguageInfo.nativeName}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {currentLanguageInfo.name}
              </div>
            </div>
          </div>
          <ChevronDown size={20} className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
            <div className="py-1">
              {availableLanguages.map((language) => (
                <button
                  key={language.code}
                  onClick={() => handleLanguageChange(language.code as SupportedLanguage)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                    language.code === currentLanguage ? 'bg-primary-50 dark:bg-primary-900/20' : ''
                  }`}
                >
                  <span className="text-xl">{language.flag}</span>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {language.nativeName}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {language.name}
                    </div>
                  </div>
                  {language.code === currentLanguage && (
                    <Check size={20} className="text-primary-600 dark:text-primary-400" />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Mobile variant - simplified
  if (variant === 'mobile') {
    return (
      <div className={`relative ${className}`} ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center space-x-2 p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          aria-label={t('language.select')}
        >
          <Globe size={18} />
          <span>{currentLanguageInfo.flag}</span>
        </button>

        {isOpen && (
          <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
            <div className="py-1">
              {availableLanguages.map((language) => (
                <button
                  key={language.code}
                  onClick={() => handleLanguageChange(language.code as SupportedLanguage)}
                  className={`w-full flex items-center space-x-2 px-3 py-2 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                    language.code === currentLanguage ? 'bg-primary-50 dark:bg-primary-900/20' : ''
                  }`}
                >
                  <span>{language.flag}</span>
                  <span className="flex-1 text-gray-900 dark:text-gray-100">
                    {language.nativeName}
                  </span>
                  {language.code === currentLanguage && (
                    <Check size={14} className="text-primary-600 dark:text-primary-400" />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return null;
};

export default LanguageSelector;

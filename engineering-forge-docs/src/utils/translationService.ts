// File: src/utils/translationService.ts
// Engineering Forge Documentation App - Translation Service

import { SUPPORTED_LANGUAGES, type SupportedLanguage } from '../i18n';

// Translation service with caching and error handling
// In production, integrate with Google Translate, DeepL, or similar APIs
export class TranslationService {
  private static instance: TranslationService;
  private cache: Map<string, string> = new Map();
  private readonly CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours
  private cacheTimestamps: Map<string, number> = new Map();

  static getInstance(): TranslationService {
    if (!TranslationService.instance) {
      TranslationService.instance = new TranslationService();
    }
    return TranslationService.instance;
  }

  // Language mapping for better translation results
  // private getLanguageCode(lang: SupportedLanguage): string {
  //   const languageMap: Record<SupportedLanguage, string> = {
  //     en: 'en',
  //     pt: 'pt-BR', // Brazilian Portuguese
  //     fr: 'fr',
  //     uk: 'uk',
  //     zh: 'zh-CN', // Simplified Chinese
  //   };
  //   return languageMap[lang] || 'en';
  // }

  // Check if cache entry is still valid
  private isCacheValid(cacheKey: string): boolean {
    const timestamp = this.cacheTimestamps.get(cacheKey);
    if (!timestamp) return false;
    return Date.now() - timestamp < this.CACHE_EXPIRY;
  }

  // Enhanced translation with proper caching and error handling
  async translateText(text: string, targetLanguage: SupportedLanguage): Promise<string> {
    if (!text || text.trim().length === 0) {
      return text;
    }

    const cacheKey = `${text}_${targetLanguage}`;
    
    // Check cache first with expiry validation
    if (this.cache.has(cacheKey) && this.isCacheValid(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    try {
      // For now, return the original text with a note
      // In production, integrate with translation API
      const translatedText = await this.mockTranslation(text, targetLanguage);
      
      // Cache the result with timestamp
      this.cache.set(cacheKey, translatedText);
      this.cacheTimestamps.set(cacheKey, Date.now());
      
      return translatedText;
    } catch (error) {
      console.error('Translation error:', error);
      // Return original text as fallback
      return text;
    }
  }

  // Mock translation - replace with real API in production
  private async mockTranslation(text: string, targetLanguage: SupportedLanguage): Promise<string> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100));

    const languageInfo = SUPPORTED_LANGUAGES[targetLanguage];
    
    // For demo purposes, add a translation note
    if (targetLanguage === 'en') {
      return text;
    }

    // Add translation indicator
    return `${text}\n\n*[Translated to ${languageInfo.nativeName} - Translation service integration pending]*`;
  }

  // Translate markdown content
  async translateMarkdown(content: string, targetLanguage: SupportedLanguage): Promise<string> {
    if (targetLanguage === 'en') {
      return content;
    }

    const cacheKey = `md_${content}_${targetLanguage}`;
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    // For now, return content with translation note
    const languageInfo = SUPPORTED_LANGUAGES[targetLanguage];
    const translatedContent = `${content}\n\n---\n\n*This content is available in ${languageInfo.nativeName}. Translation service integration is in progress.*`;
    
    this.cache.set(cacheKey, translatedContent);
    return translatedContent;
  }

  // Clear cache with timestamps
  clearCache(): void {
    this.cache.clear();
    this.cacheTimestamps.clear();
  }

  // Clear expired cache entries
  clearExpiredCache(): void {
    const now = Date.now();
    for (const [key, timestamp] of this.cacheTimestamps.entries()) {
      if (now - timestamp >= this.CACHE_EXPIRY) {
        this.cache.delete(key);
        this.cacheTimestamps.delete(key);
      }
    }
  }

  // Get cache statistics
  getCacheStats(): { size: number; expired: number } {
    const now = Date.now();
    let expired = 0;
    
    for (const timestamp of this.cacheTimestamps.values()) {
      if (now - timestamp >= this.CACHE_EXPIRY) {
        expired++;
      }
    }
    
    return {
      size: this.cache.size,
      expired
    };
  }
}

// Export singleton instance
export const translationService = TranslationService.getInstance();

// Utility functions
export const translateContent = async (content: string, language: SupportedLanguage): Promise<string> => {
  return translationService.translateMarkdown(content, language);
};

export const translateText = async (text: string, language: SupportedLanguage): Promise<string> => {
  return translationService.translateText(text, language);
};

// Language-specific content loading
export const getLocalizedContentPath = (basePath: string, language: SupportedLanguage): string => {
  if (language === 'en') {
    return basePath;
  }
  
  // For other languages, we would have separate files
  // For now, return the base path
  return basePath;
};

// Check if content is available in a specific language
export const isContentAvailableInLanguage = (language: SupportedLanguage): boolean => {
  // For now, only English content is available
  // In production, check if translated files exist
  return language === 'en';
};

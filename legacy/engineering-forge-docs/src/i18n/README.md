# Internationalization (i18n) System

## Overview

This project implements a comprehensive internationalization system using React i18next, supporting multiple languages with advanced features like caching, error handling, and performance optimizations.

## Supported Languages

- **English (en)** - Default language
- **Portuguese (pt)** - Brazilian Portuguese
- **French (fr)** - French
- **Ukrainian (uk)** - Ukrainian
- **Chinese (zh)** - Simplified Chinese

## Architecture

### Core Files

- `src/i18n/index.ts` - Main i18n configuration and utilities
- `src/store/languageStore.ts` - Zustand store for language state management
- `src/utils/translationService.ts` - Translation service with caching
- `src/hooks/useTranslation.ts` - Enhanced translation hooks

### Translation Files

```
src/i18n/locales/
├── en/
│   ├── common.json
│   └── navigation.json
├── pt/
│   ├── common.json
│   └── navigation.json
├── fr/
│   ├── common.json
│   └── navigation.json
├── uk/
│   ├── common.json
│   └── navigation.json
└── zh/
    ├── common.json
    └── navigation.json
```

## Features

### 1. Language Detection
- Automatic browser language detection
- URL parameter support (`?lang=pt`)
- LocalStorage persistence
- Fallback to English

### 2. Caching System
- Translation cache with 24-hour expiry
- Automatic cache cleanup
- Performance optimization
- Memory management

### 3. Error Handling
- Graceful fallbacks
- Development warnings for missing keys
- Network error handling
- Type safety

### 4. Performance Optimizations
- Lazy loading of translation files
- Memoized selectors
- Efficient re-renders
- Bundle splitting

## Usage

### Basic Translation

```tsx
import { useTranslation } from '../hooks/useTranslation';

function MyComponent() {
  const { t } = useTranslation('common');
  
  return <h1>{t('app.title')}</h1>;
}
```

### Advanced Features

```tsx
import { useTranslation, usePluralization, useInterpolation } from '../hooks/useTranslation';

function AdvancedComponent() {
  const { t, formatNumber, formatDate, isRTL } = useTranslation('common');
  const { pluralize } = usePluralization();
  const { interpolate } = useInterpolation();
  
  return (
    <div dir={isRTL() ? 'rtl' : 'ltr'}>
      <h1>{t('app.title')}</h1>
      <p>{pluralize('items.count', 5)}</p>
      <p>{interpolate('welcome.message', { name: 'John' })}</p>
      <p>{formatNumber(1234.56)}</p>
      <p>{formatDate(new Date())}</p>
    </div>
  );
}
```

### Language Switching

```tsx
import { useLanguageActions } from '../store/languageStore';

function LanguageSwitcher() {
  const { setLanguage } = useLanguageActions();
  
  const handleLanguageChange = async (lang: SupportedLanguage) => {
    const success = await setLanguage(lang);
    if (success) {
      console.log('Language changed successfully');
    }
  };
  
  return (
    <button onClick={() => handleLanguageChange('pt')}>
      Switch to Portuguese
    </button>
  );
}
```

## Best Practices

### 1. Translation Keys
- Use dot notation for nested keys: `app.title`
- Use descriptive names: `navigation.home` instead of `nav.home`
- Group related keys: `errors.network`, `errors.notFound`

### 2. Namespaces
- `common` - General UI elements
- `navigation` - Navigation and menu items
- `content` - Content-specific translations
- `errors` - Error messages

### 3. Interpolation
```json
{
  "welcome": "Welcome, {{name}}!",
  "items": {
    "count": "{{count}} item",
    "count_plural": "{{count}} items"
  }
}
```

### 4. RTL Support
```tsx
const { isRTL, getDirection } = useTranslation();

<div dir={getDirection()}>
  <span className={isRTL() ? 'mr-2' : 'ml-2'}>
    {t('content.text')}
  </span>
</div>
```

## Development

### Adding New Languages

1. Add language to `SUPPORTED_LANGUAGES` in `src/i18n/index.ts`
2. Create language folder in `src/i18n/locales/`
3. Add translation files (`common.json`, `navigation.json`, etc.)
4. Test language switching functionality

### Adding New Translation Keys

1. Add key to all language files
2. Use TypeScript for type safety
3. Test in all supported languages
4. Update documentation if needed

### Performance Monitoring

```tsx
import { translationService } from '../utils/translationService';

// Get cache statistics
const stats = translationService.getCacheStats();
console.log(`Cache size: ${stats.size}, Expired: ${stats.expired}`);

// Clear expired cache
translationService.clearExpiredCache();
```

## Production Considerations

### 1. Bundle Optimization
- Translation files are loaded on-demand
- Unused languages are not included in bundle
- Tree shaking for translation keys

### 2. SEO
- Language-specific URLs
- Meta tags for language
- Sitemap with language variants

### 3. Analytics
- Track language usage
- Monitor translation coverage
- Performance metrics

### 4. Maintenance
- Regular translation updates
- Missing key monitoring
- Performance optimization

## Troubleshooting

### Common Issues

1. **Missing translations**: Check console warnings in development
2. **Language not switching**: Verify language is in `SUPPORTED_LANGUAGES`
3. **RTL not working**: Check `isRTL()` function and CSS
4. **Performance issues**: Monitor cache usage and clear if needed

### Debug Mode

Enable debug mode in development:
```typescript
// In src/i18n/index.ts
debug: process.env.NODE_ENV === 'development'
```

This will log missing translations and other i18n events to the console.

## Future Enhancements

- [ ] Translation management system integration
- [ ] Automatic translation using AI services
- [ ] Translation progress tracking
- [ ] A/B testing for translations
- [ ] Voice-over support for accessibility

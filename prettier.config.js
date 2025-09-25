export default {
  // Basic formatting
  semi: true,
  singleQuote: true,
  quoteProps: 'as-needed',
  trailingComma: 'none',
  tabWidth: 2,
  useTabs: false,
  
  // Line length
  printWidth: 100,
  
  // Bracket spacing
  bracketSpacing: true,
  bracketSameLine: false,
  
  // Arrow functions
  arrowParens: 'avoid',
  
  // End of line
  endOfLine: 'lf',
  
  // HTML formatting
  htmlWhitespaceSensitivity: 'css',
  
  // Vue formatting
  vueIndentScriptAndStyle: false,
  
  // Embedded language formatting
  embeddedLanguageFormatting: 'auto',
  
  // Prose wrap
  proseWrap: 'preserve',
  
  // Override for specific file types
  overrides: [
    {
      files: '*.json',
      options: {
        printWidth: 80,
        tabWidth: 2
      }
    },
    {
      files: '*.md',
      options: {
        printWidth: 80,
        proseWrap: 'always'
      }
    },
    {
      files: '*.yml',
      options: {
        tabWidth: 2
      }
    }
  ]
};

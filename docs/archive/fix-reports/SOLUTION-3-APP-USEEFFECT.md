# 🔧 SOLUÇÃO 3: App.tsx - Evitar Cascatas de useEffect

## Problema: Dependências que se afetam mutuamente
```typescript
// PROBLEMÁTICO
useEffect(() => {
  document.documentElement.lang = currentLanguage;
  setIsInitialized(true); // Pode causar re-render
}, [theme, currentLanguage, isLanguageInitialized]); // Cascata de mudanças
```

## Solução 1: Separar useEffects
```typescript
// CORRETO - Efeitos separados
useEffect(() => {
  document.documentElement.lang = currentLanguage;
}, [currentLanguage]); // Apenas para idioma

useEffect(() => {
  if (theme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}, [theme]); // Apenas para tema

useEffect(() => {
  setIsInitialized(true);
}, []); // Apenas uma vez
```

## Solução 2: Estado derivado sem useEffect
```typescript
// CORRETO - Sem useEffect para inicialização
const App = () => {
  // Estado derivado diretamente
  const isInitialized = useMemo(() => {
    return currentLanguage && theme; // Lógica simples
  }, [currentLanguage, theme]);

  // Efeitos colaterais diretos
  if (theme === 'dark') {
    document.documentElement.classList.add('dark');
  }
  
  document.documentElement.lang = currentLanguage;
}
```

## Solução 3: useLayoutEffect para DOM
```typescript
// Para mudanças no DOM, usar useLayoutEffect
useLayoutEffect(() => {
  document.documentElement.lang = currentLanguage;
  document.documentElement.className = theme === 'dark' ? 'dark' : '';
}, [currentLanguage, theme]); // Executa antes do render
```

## Por que funciona:
- ✅ Efeitos independentes
- ✅ Sem cascatas de estado
- ✅ Dependências claras e estáveis

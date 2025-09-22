# 🔧 SOLUÇÃO 1: LanguageSelector - Referências Estáveis

## Problema: Novo array a cada render
```typescript
// PROBLEMÁTICO
getAvailableLanguages: () => {
  return Object.values(SUPPORTED_LANGUAGES).sort((a, b) => a.priority - b.priority);
  // Novo array = nova referência = re-render infinito
}
```

## Solução: Memoização com cache
```typescript
// CORRETO - Versão com cache estável
let cachedLanguages: any[] | null = null;

getAvailableLanguages: () => {
  if (!cachedLanguages) {
    cachedLanguages = Object.values(SUPPORTED_LANGUAGES).sort((a, b) => a.priority - b.priority);
  }
  return cachedLanguages; // MESMA REFERÊNCIA SEMPRE
}
```

## Alternativa: useMemo no componente
```typescript
// No componente
const availableLanguages = useMemo(() => {
  return Object.values(SUPPORTED_LANGUAGES).sort((a, b) => a.priority - b.priority);
}, []); // Dependências vazias = calcula apenas uma vez
```

## Por que funciona:
- ✅ Mesma referência sempre
- ✅ React não detecta "mudança"
- ✅ Sem re-renders desnecessários

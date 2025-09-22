# 🔧 SOLUÇÃO 5: SearchModal - Debounce Sem Loops

## Problema: Debounce com dependências instáveis
```typescript
// PROBLEMÁTICO
const search = useSearchStore((state) => state.search); // Nova função a cada render
const debouncedQuery = useDebounce(query, 300);

useEffect(() => {
  if (debouncedQuery.trim()) {
    search(debouncedQuery); // search muda → loop
  }
}, [debouncedQuery, search]); // search nas dependências = loop
```

## Solução 1: useCallback estável
```typescript
// CORRETO - useCallback com dependências vazias
const search = useSearchStore((state) => state.search);
const stableSearch = useCallback((query: string) => {
  search(query);
}, []); // Dependências vazias = função estável

useEffect(() => {
  if (debouncedQuery.trim()) {
    stableSearch(debouncedQuery);
  }
}, [debouncedQuery, stableSearch]); // Agora estável
```

## Solução 2: Remover função das dependências
```typescript
// CORRETO - Usar diretamente sem dependência
const search = useSearchStore((state) => state.search);

useEffect(() => {
  if (debouncedQuery.trim()) {
    search(debouncedQuery); // Usar diretamente
  }
// eslint-disable-next-line react-hooks/exhaustive-deps
}, [debouncedQuery]); // Apenas debouncedQuery
```

## Solução 3: Custom hook para search
```typescript
// CORRETO - Hook customizado
const useSearch = () => {
  const search = useSearchStore((state) => state.search);
  
  return useCallback((query: string) => {
    if (query.trim()) {
      search(query);
    }
  }, [search]); // Dependência controlada
};

// No componente
const performSearch = useSearch();
useEffect(() => {
  performSearch(debouncedQuery);
}, [debouncedQuery, performSearch]);
```

## Solução 4: Debounce interno na store
```typescript
// MELHOR - Debounce dentro da store
const useSearchStore = create((set, get) => ({
  query: '',
  results: [],
  
  search: debounce(async (query: string) => {
    set({ query });
    // lógica de busca
    const results = await performSearch(query);
    set({ results });
  }, 300), // Debounce interno
}));

// No componente - muito mais simples
const search = useSearchStore((state) => state.search);
const handleInputChange = (e) => {
  search(e.target.value); // Debounce automático
};
```

## Por que funciona:
- ✅ Função estável não causa re-renders
- ✅ Debounce controlado evita calls excessivos
- ✅ Dependências claras e estáveis
- ✅ Lógica centralizada na store

# 🔧 SOLUÇÃO 4: Zustand Stores - Evitar Loops entre Stores

## Problema: Stores que se afetam mutuamente
```typescript
// PROBLEMÁTICO - Ações que disparam outras ações
const setLanguage = async (language) => {
  set({ currentLanguage: language });
  // Pode disparar outras mudanças que afetam esta store
  otherStore.getState().updateSomething(); // PERIGOSO
};
```

## Solução 1: Seletores granulares
```typescript
// CORRETO - Seletores específicos
const useCurrentLanguage = () => useLanguageStore(state => state.currentLanguage);
const useIsLoading = () => useLanguageStore(state => state.isLoading);

// Ao invés de:
const useLanguageData = () => useLanguageStore(state => ({ 
  currentLanguage: state.currentLanguage,
  isLoading: state.isLoading 
})); // Novo objeto a cada render = loop
```

## Solução 2: Shallow comparison
```typescript
import { shallow } from 'zustand/shallow';

const { currentLanguage, isLoading } = useLanguageStore(
  state => ({ 
    currentLanguage: state.currentLanguage,
    isLoading: state.isLoading 
  }),
  shallow // Compara propriedades, não referência do objeto
);
```

## Solução 3: Separar ações de getters
```typescript
// CORRETO - Ações não retornam valores computados
const languageStore = create((set, get) => ({
  currentLanguage: 'en',
  
  // Ação simples - apenas muda estado
  setLanguage: (language) => {
    set({ currentLanguage: language });
  },
  
  // Getter separado - não causa efeitos colaterais
  getLanguageInfo: () => {
    const state = get();
    return SUPPORTED_LANGUAGES[state.currentLanguage];
  }
}));
```

## Solução 4: Middleware para debug
```typescript
import { subscribeWithSelector } from 'zustand/middleware';

const useLanguageStore = create(
  subscribeWithSelector((set, get) => ({
    // store logic
  }))
);

// Debug para detectar loops
useLanguageStore.subscribe(
  (state) => state.currentLanguage,
  (currentLanguage) => {
    console.log('Language changed to:', currentLanguage);
  }
);
```

## Por que funciona:
- ✅ Seletores granulares evitam re-renders desnecessários
- ✅ Shallow comparison compara conteúdo, não referência
- ✅ Ações simples sem efeitos colaterais
- ✅ Debug ajuda a identificar problemas

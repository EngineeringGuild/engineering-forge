# 🔧 SOLUÇÃO 2: useContent - Dependências Corretas

## Problema: Função nas dependências
```typescript
// PROBLEMÁTICO
useEffect(() => {
  loadContent(currentDocument, currentSection, currentLanguage);
}, [currentDocument, currentSection, currentLanguage, loadContent]);
//                                                    ↑ CAUSA LOOP
```

## Solução 1: Remover função das dependências
```typescript
// CORRETO
useEffect(() => {
  loadContent(currentDocument, currentSection, currentLanguage);
}, [currentDocument, currentSection, currentLanguage]); // Sem loadContent
```

## Solução 2: useCallback com dependências corretas
```typescript
const loadContent = useCallback(async (doc, section, lang) => {
  // lógica aqui
}, []); // Dependências vazias ou apenas valores estáveis

useEffect(() => {
  loadContent(currentDocument, currentSection, currentLanguage);
}, [currentDocument, currentSection, currentLanguage, loadContent]); // Agora OK
```

## Solução 3: useRef para função estável
```typescript
const loadContentRef = useRef(loadContent);
loadContentRef.current = loadContent; // Atualiza sem causar re-render

useEffect(() => {
  loadContentRef.current(currentDocument, currentSection, currentLanguage);
}, [currentDocument, currentSection, currentLanguage]); // Sem função nas deps
```

## Por que funciona:
- ✅ Dependências estáveis
- ✅ Sem recriação de função
- ✅ useEffect executa apenas quando necessário

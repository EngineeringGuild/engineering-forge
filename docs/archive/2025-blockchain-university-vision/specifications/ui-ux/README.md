# 🎨 Engineering Forge - UI/UX Design

**Versão**: 1.0  
**Data**: Janeiro 2025  
**Status**: 🚀 **ATIVO**

---

## 🎯 **Visão Geral**

Documentação completa do design de interface e experiência do usuário do Engineering Forge, incluindo design system, componentes e padrões de interação.

---

## 🎨 **Design System**

### **Paleta de Cores**
```css
/* Cores Primárias */
--primary-blue: #2563eb;      /* Azul principal */
--primary-green: #059669;     /* Verde de sucesso */
--primary-orange: #ea580c;    /* Laranja de ação */

/* Cores Secundárias */
--secondary-gray: #6b7280;    /* Cinza neutro */
--secondary-purple: #7c3aed;  /* Roxo de inovação */
--secondary-teal: #0d9488;    /* Verde-azulado */

/* Cores de Estado */
--success: #10b981;           /* Verde de sucesso */
--warning: #f59e0b;           /* Amarelo de aviso */
--error: #ef4444;             /* Vermelho de erro */
--info: #3b82f6;              /* Azul de informação */

/* Cores Neutras */
--gray-50: #f9fafb;
--gray-100: #f3f4f6;
--gray-200: #e5e7eb;
--gray-300: #d1d5db;
--gray-400: #9ca3af;
--gray-500: #6b7280;
--gray-600: #4b5563;
--gray-700: #374151;
--gray-800: #1f2937;
--gray-900: #111827;
```

### **Tipografia**
```css
/* Fontes */
--font-primary: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
--font-mono: 'JetBrains Mono', 'Fira Code', monospace;
--font-display: 'Poppins', sans-serif;

/* Tamanhos */
--text-xs: 0.75rem;      /* 12px */
--text-sm: 0.875rem;     /* 14px */
--text-base: 1rem;       /* 16px */
--text-lg: 1.125rem;     /* 18px */
--text-xl: 1.25rem;      /* 20px */
--text-2xl: 1.5rem;      /* 24px */
--text-3xl: 1.875rem;    /* 30px */
--text-4xl: 2.25rem;     /* 36px */

/* Pesos */
--font-light: 300;
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
```

### **Espaçamento**
```css
/* Espaçamentos */
--space-1: 0.25rem;      /* 4px */
--space-2: 0.5rem;       /* 8px */
--space-3: 0.75rem;      /* 12px */
--space-4: 1rem;         /* 16px */
--space-5: 1.25rem;      /* 20px */
--space-6: 1.5rem;       /* 24px */
--space-8: 2rem;         /* 32px */
--space-10: 2.5rem;      /* 40px */
--space-12: 3rem;        /* 48px */
--space-16: 4rem;        /* 64px */
--space-20: 5rem;        /* 80px */
--space-24: 6rem;        /* 96px */
```

### **Bordas e Sombras**
```css
/* Bordas */
--radius-sm: 0.125rem;   /* 2px */
--radius-md: 0.375rem;   /* 6px */
--radius-lg: 0.5rem;     /* 8px */
--radius-xl: 0.75rem;    /* 12px */
--radius-2xl: 1rem;      /* 16px */
--radius-full: 9999px;   /* Circular */

/* Sombras */
--shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
--shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
--shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);
--shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1);
```

---

## 🧩 **Componentes de Interface**

### **Botões**
```tsx
// Button.tsx
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'danger' | 'ghost';
  size: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  children,
  onClick,
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-gray-500',
  };
  
  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };
  
  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      disabled={disabled || loading}
      onClick={onClick}
    >
      {loading ? <Spinner /> : children}
    </button>
  );
};
```

### **Cards**
```tsx
// Card.tsx
interface CardProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ title, subtitle, children, className = '' }) => {
  return (
    <div className={`bg-white rounded-lg shadow-md border border-gray-200 ${className}`}>
      {(title || subtitle) && (
        <div className="px-6 py-4 border-b border-gray-200">
          {title && <h3 className="text-lg font-semibold text-gray-900">{title}</h3>}
          {subtitle && <p className="text-sm text-gray-600">{subtitle}</p>}
        </div>
      )}
      <div className="px-6 py-4">
        {children}
      </div>
    </div>
  );
};
```

### **Inputs**
```tsx
// Input.tsx
interface InputProps {
  type?: 'text' | 'email' | 'password' | 'number';
  label?: string;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  value: string;
  onChange: (value: string) => void;
}

const Input: React.FC<InputProps> = ({
  type = 'text',
  label,
  placeholder,
  error,
  disabled = false,
  value,
  onChange,
}) => {
  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <input
        type={type}
        placeholder={placeholder}
        disabled={disabled}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
          error ? 'border-red-300' : 'border-gray-300'
        } ${disabled ? 'bg-gray-50 cursor-not-allowed' : ''}`}
      />
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};
```

---

## 🎮 **Interface de Jogo**

### **Layout Principal**
```tsx
// GameLayout.tsx
const GameLayout: React.FC = () => {
  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Logo />
              <Navigation />
            </div>
            <div className="flex items-center space-x-4">
              <UserProfile />
              <Settings />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex">
        {/* Sidebar */}
        <aside className="w-80 bg-white shadow-sm border-r border-gray-200">
          <ComponentPanel />
        </aside>

        {/* Game Canvas */}
        <section className="flex-1 relative">
          <GameCanvas />
          <GameUI />
        </section>

        {/* Right Panel */}
        <aside className="w-80 bg-white shadow-sm border-l border-gray-200">
          <PropertiesPanel />
        </aside>
      </main>
    </div>
  );
};
```

### **Painel de Componentes**
```tsx
// ComponentPanel.tsx
const ComponentPanel: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('structural');
  
  const categories = [
    { id: 'structural', name: 'Estrutural', icon: '🏗️' },
    { id: 'mechanical', name: 'Mecânico', icon: '⚙️' },
    { id: 'electrical', name: 'Elétrico', icon: '⚡' },
    { id: 'fluid', name: 'Fluidos', icon: '💧' },
  ];
  
  return (
    <div className="h-full flex flex-col">
      {/* Category Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`flex-1 px-4 py-3 text-sm font-medium ${
                selectedCategory === category.id
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <span className="mr-2">{category.icon}</span>
              {category.name}
            </button>
          ))}
        </div>
      </div>
      
      {/* Components Grid */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid grid-cols-2 gap-3">
          {getComponentsByCategory(selectedCategory).map((component) => (
            <ComponentCard key={component.id} component={component} />
          ))}
        </div>
      </div>
    </div>
  );
};
```

### **Canvas de Jogo**
```tsx
// GameCanvas.tsx
const GameCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedObject, setSelectedObject] = useState<GameObject | null>(null);
  
  return (
    <div className="relative w-full h-full bg-gray-50">
      <canvas
        ref={canvasRef}
        className="w-full h-full cursor-crosshair"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onWheel={handleWheel}
      />
      
      {/* Grid Overlay */}
      <div className="absolute inset-0 pointer-events-none">
        <GridOverlay />
      </div>
      
      {/* Selection Outline */}
      {selectedObject && (
        <div className="absolute pointer-events-none">
          <SelectionOutline object={selectedObject} />
        </div>
      )}
      
      {/* Context Menu */}
      {contextMenu && (
        <ContextMenu
          position={contextMenu.position}
          onClose={() => setContextMenu(null)}
        />
      )}
    </div>
  );
};
```

---

## 📱 **Responsividade**

### **Breakpoints**
```css
/* Tailwind CSS Breakpoints */
sm: 640px    /* Small devices */
md: 768px    /* Medium devices */
lg: 1024px   /* Large devices */
xl: 1280px   /* Extra large devices */
2xl: 1536px  /* 2X large devices */
```

### **Layout Adaptativo**
```tsx
// ResponsiveLayout.tsx
const ResponsiveLayout: React.FC = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  if (isMobile) {
    return (
      <div className="h-screen flex flex-col">
        {/* Mobile Header */}
        <header className="bg-white shadow-sm p-4">
          <div className="flex items-center justify-between">
            <button onClick={() => setSidebarOpen(!sidebarOpen)}>
              <MenuIcon />
            </button>
            <Logo />
            <UserProfile />
          </div>
        </header>
        
        {/* Mobile Sidebar */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 bg-black bg-opacity-50">
            <div className="w-80 h-full bg-white shadow-xl">
              <MobileSidebar onClose={() => setSidebarOpen(false)} />
            </div>
          </div>
        )}
        
        {/* Mobile Content */}
        <main className="flex-1">
          <MobileGameCanvas />
        </main>
      </div>
    );
  }
  
  return <DesktopLayout />;
};
```

---

## ♿ **Acessibilidade**

### **Princípios de Acessibilidade**
- **Perceptível**: Informações apresentadas de forma clara
- **Operável**: Interface navegável por diferentes meios
- **Compreensível**: Informações e operações compreensíveis
- **Robusto**: Compatível com diferentes tecnologias

### **Implementação**
```tsx
// AccessibleButton.tsx
const AccessibleButton: React.FC<ButtonProps> = ({
  children,
  onClick,
  disabled,
  ...props
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={props['aria-label']}
      aria-describedby={props['aria-describedby']}
      className={`
        inline-flex items-center justify-center
        px-4 py-2 rounded-lg font-medium
        transition-colors duration-200
        focus:outline-none focus:ring-2 focus:ring-blue-500
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'}
      `}
      {...props}
    >
      {children}
    </button>
  );
};
```

### **Navegação por Teclado**
- **Tab**: Navegação sequencial
- **Enter/Space**: Ativação de elementos
- **Arrow Keys**: Navegação em listas
- **Escape**: Fechamento de modais

---

## 🎭 **Animações e Transições**

### **Transições Suaves**
```css
/* Transições padrão */
.transition {
  transition: all 0.2s ease-in-out;
}

.transition-fast {
  transition: all 0.1s ease-in-out;
}

.transition-slow {
  transition: all 0.3s ease-in-out;
}
```

### **Animações de Entrada**
```tsx
// FadeIn.tsx
const FadeIn: React.FC<{ children: React.ReactNode; delay?: number }> = ({
  children,
  delay = 0,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
    >
      {children}
    </motion.div>
  );
};
```

### **Micro-interações**
```tsx
// HoverEffect.tsx
const HoverEffect: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ duration: 0.1 }}
    >
      {children}
    </motion.div>
  );
};
```

---

## 🌙 **Tema Escuro**

### **Variáveis CSS**
```css
/* Tema Claro */
:root {
  --bg-primary: #ffffff;
  --bg-secondary: #f9fafb;
  --text-primary: #111827;
  --text-secondary: #6b7280;
  --border-color: #e5e7eb;
}

/* Tema Escuro */
[data-theme="dark"] {
  --bg-primary: #111827;
  --bg-secondary: #1f2937;
  --text-primary: #f9fafb;
  --text-secondary: #d1d5db;
  --border-color: #374151;
}
```

### **Toggle de Tema**
```tsx
// ThemeToggle.tsx
const ThemeToggle: React.FC = () => {
  const [isDark, setIsDark] = useState(false);
  
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
  }, [isDark]);
  
  return (
    <button
      onClick={() => setIsDark(!isDark)}
      className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700"
    >
      {isDark ? <SunIcon /> : <MoonIcon />}
    </button>
  );
};
```

---

## 📊 **Métricas de UX**

### **Métricas de Performance**
- **First Contentful Paint**: <1.5s
- **Largest Contentful Paint**: <2.5s
- **Cumulative Layout Shift**: <0.1
- **First Input Delay**: <100ms

### **Métricas de Usabilidade**
- **Task Completion Rate**: >90%
- **Error Rate**: <5%
- **Time to Complete**: <2min
- **User Satisfaction**: >4.5/5

---

## 🔗 **Links Relacionados**

- **[Specifications](../../README.md)** - Especificações técnicas
- **[Game Design](../game-design/README.md)** - Design de jogo
- **[Technical Design](../technical-design/README.md)** - Design técnico
- **[Dashboard](../../PROGRESS-DASHBOARD.md)** - Status do projeto

---

*Última atualização: Janeiro 2025*

**Status**: 🟢 **ATIVO** | **Responsável**: Design Team | **Próxima Revisão**: Fevereiro 2025

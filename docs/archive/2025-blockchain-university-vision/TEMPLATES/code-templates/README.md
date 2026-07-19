# 💻 Engineering Forge - Code Templates

**Versão**: 1.0  
**Data**: Janeiro 2025  
**Status**: 🚀 **ATIVO**

---

## 🎯 **Visão Geral**

Templates padronizados de código para o Engineering Forge, garantindo consistência e qualidade em todo o código do projeto.

---

## 📋 **Templates Disponíveis**

### **Frontend Templates**
1. **[React Component](react-component-template.tsx)** - Template para componentes React
2. **[React Hook](react-hook-template.ts)** - Template para custom hooks
3. **[React Page](react-page-template.tsx)** - Template para páginas
4. **[React Context](react-context-template.tsx)** - Template para contextos

### **Backend Templates**
1. **[Express Controller](express-controller-template.ts)** - Template para controladores
2. **[Express Service](express-service-template.ts)** - Template para serviços
3. **[Express Model](express-model-template.ts)** - Template para modelos
4. **[Express Route](express-route-template.ts)** - Template para rotas

### **Game Templates**
1. **[Game Object](game-object-template.ts)** - Template para objetos de jogo
2. **[Game Component](game-component-template.ts)** - Template para componentes de jogo
3. **[Game System](game-system-template.ts)** - Template para sistemas de jogo
4. **[Game Scene](game-scene-template.ts)** - Template para cenas

---

## ⚛️ **Template de Componente React**

### **Estrutura Padrão**
```tsx
// components/[ComponentName]/[ComponentName].tsx
import React, { useState, useEffect } from 'react';
import { cn } from '@/utils/cn';

interface [ComponentName]Props {
  className?: string;
  children?: React.ReactNode;
  // Adicione outras props aqui
}

const [ComponentName]: React.FC<[ComponentName]Props> = ({
  className,
  children,
  ...props
}) => {
  // Estados locais
  const [state, setState] = useState<boolean>(false);

  // Efeitos
  useEffect(() => {
    // Lógica de efeito
  }, []);

  // Handlers
  const handleClick = () => {
    // Lógica do handler
  };

  return (
    <div
      className={cn(
        'base-classes',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export default [ComponentName];
```

### **Template com Variantes**
```tsx
// components/Button/Button.tsx
import React from 'react';
import { cn } from '@/utils/cn';

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  children,
  onClick,
  className,
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
  };
  
  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };
  
  return (
    <button
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        (disabled || loading) && 'opacity-50 cursor-not-allowed',
        className
      )}
      disabled={disabled || loading}
      onClick={onClick}
    >
      {loading ? <Spinner /> : children}
    </button>
  );
};

export default Button;
```

---

## 🎣 **Template de Custom Hook**

### **Estrutura Padrão**
```ts
// hooks/use[HookName].ts
import { useState, useEffect, useCallback } from 'react';

interface Use[HookName]Options {
  // Opções do hook
}

interface Use[HookName]Return {
  // Retorno do hook
}

const use[HookName] = (options?: Use[HookName]Options): Use[HookName]Return => {
  // Estados
  const [state, setState] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Funções
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Lógica do hook
      
      setState(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, []);

  // Efeitos
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    state,
    loading,
    error,
    fetchData,
  };
};

export default use[HookName];
```

---

## 📄 **Template de Página React**

### **Estrutura Padrão**
```tsx
// pages/[PageName]/[PageName].tsx
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { PageLayout } from '@/components/layout/PageLayout';
import { Loading } from '@/components/ui/Loading';
import { Error } from '@/components/ui/Error';

const [PageName]: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Queries
  const { data, isLoading, error } = useQuery({
    queryKey: ['[pageName]', id],
    queryFn: async () => {
      // Fetch data
    },
    enabled: !!id,
  });

  // Handlers
  const handleBack = () => {
    navigate(-1);
  };

  if (isLoading) return <Loading />;
  if (error) return <Error error={error} />;

  return (
    <PageLayout
      title="[Page Title]"
      onBack={handleBack}
    >
      <div className="space-y-6">
        {/* Conteúdo da página */}
      </div>
    </PageLayout>
  );
};

export default [PageName];
```

---

## 🔄 **Template de Context React**

### **Estrutura Padrão**
```tsx
// contexts/[ContextName]Context.tsx
import React, { createContext, useContext, useReducer, ReactNode } from 'react';

// Tipos
interface [ContextName]State {
  // Estado do contexto
}

interface [ContextName]Action {
  type: string;
  payload?: any;
}

interface [ContextName]ContextType {
  state: [ContextName]State;
  dispatch: React.Dispatch<[ContextName]Action>;
}

// Estado inicial
const initialState: [ContextName]State = {
  // Estado inicial
};

// Reducer
const [contextName]Reducer = (
  state: [ContextName]State,
  action: [ContextName]Action
): [ContextName]State => {
  switch (action.type) {
    case 'ACTION_TYPE':
      return {
        ...state,
        // Atualização do estado
      };
    default:
      return state;
  }
};

// Context
const [ContextName]Context = createContext<[ContextName]ContextType | undefined>(undefined);

// Provider
interface [ContextName]ProviderProps {
  children: ReactNode;
}

export const [ContextName]Provider: React.FC<[ContextName]ProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer([contextName]Reducer, initialState);

  return (
    <[ContextName]Context.Provider value={{ state, dispatch }}>
      {children}
    </[ContextName]Context.Provider>
  );
};

// Hook
export const use[ContextName] = (): [ContextName]ContextType => {
  const context = useContext([ContextName]Context);
  if (!context) {
    throw new Error('use[ContextName] must be used within a [ContextName]Provider');
  }
  return context;
};
```

---

## 🎮 **Template de Objeto de Jogo**

### **Estrutura Padrão**
```ts
// game/objects/[ObjectName].ts
import { Vector3, Quaternion } from 'three';
import { GameObject } from './GameObject';

export class [ObjectName] extends GameObject {
  // Propriedades específicas
  private property1: number;
  private property2: string;

  constructor(position: Vector3, rotation: Quaternion) {
    super(position, rotation);
    
    this.property1 = 0;
    this.property2 = '';
    
    this.initialize();
  }

  private initialize(): void {
    // Inicialização específica
  }

  public update(deltaTime: number): void {
    super.update(deltaTime);
    
    // Lógica de atualização específica
  }

  public onCollision(other: GameObject): void {
    super.onCollision(other);
    
    // Lógica de colisão específica
  }

  public destroy(): void {
    // Limpeza específica
    super.destroy();
  }
}
```

---

## 🎯 **Template de Sistema de Jogo**

### **Estrutura Padrão**
```ts
// game/systems/[SystemName].ts
import { System } from './System';
import { GameObject } from '../objects/GameObject';

export class [SystemName] extends System {
  private objects: GameObject[] = [];

  constructor() {
    super('[SystemName]');
  }

  public addObject(object: GameObject): void {
    this.objects.push(object);
  }

  public removeObject(object: GameObject): void {
    const index = this.objects.indexOf(object);
    if (index > -1) {
      this.objects.splice(index, 1);
    }
  }

  public update(deltaTime: number): void {
    for (const object of this.objects) {
      // Lógica do sistema
    }
  }

  public destroy(): void {
    this.objects = [];
    super.destroy();
  }
}
```

---

## 🌐 **Template de Controlador Express**

### **Estrutura Padrão**
```ts
// controllers/[ControllerName]Controller.ts
import { Request, Response, NextFunction } from 'express';
import { [ControllerName]Service } from '../services/[ControllerName]Service';
import { validateRequest } from '../middleware/validation';
import { [ControllerName]Schema } from '../schemas/[ControllerName]Schema';

export class [ControllerName]Controller {
  private [controllerName]Service: [ControllerName]Service;

  constructor() {
    this.[controllerName]Service = new [ControllerName]Service();
  }

  public getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const [items] = await this.[controllerName]Service.getAll();
      
      res.status(200).json({
        success: true,
        data: [items],
      });
    } catch (error) {
      next(error);
    }
  };

  public getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const [item] = await this.[controllerName]Service.getById(id);
      
      if (![item]) {
        res.status(404).json({
          success: false,
          message: '[Item] not found',
        });
        return;
      }
      
      res.status(200).json({
        success: true,
        data: [item],
      });
    } catch (error) {
      next(error);
    }
  };

  public create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validatedData = validateRequest(req.body, [ControllerName]Schema.create);
      const [item] = await this.[controllerName]Service.create(validatedData);
      
      res.status(201).json({
        success: true,
        data: [item],
      });
    } catch (error) {
      next(error);
    }
  };

  public update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const validatedData = validateRequest(req.body, [ControllerName]Schema.update);
      const [item] = await this.[controllerName]Service.update(id, validatedData);
      
      if (![item]) {
        res.status(404).json({
          success: false,
          message: '[Item] not found',
        });
        return;
      }
      
      res.status(200).json({
        success: true,
        data: [item],
      });
    } catch (error) {
      next(error);
    }
  };

  public delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const deleted = await this.[controllerName]Service.delete(id);
      
      if (!deleted) {
        res.status(404).json({
          success: false,
          message: '[Item] not found',
        });
        return;
      }
      
      res.status(200).json({
        success: true,
        message: '[Item] deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  };
}
```

---

## 🔧 **Template de Serviço Express**

### **Estrutura Padrão**
```ts
// services/[ServiceName]Service.ts
import { [ServiceName]Model } from '../models/[ServiceName]Model';
import { [ServiceName]Interface } from '../interfaces/[ServiceName]Interface';

export class [ServiceName]Service {
  private [serviceName]Model: [ServiceName]Model;

  constructor() {
    this.[serviceName]Model = new [ServiceName]Model();
  }

  public async getAll(): Promise<[ServiceName]Interface[]> {
    try {
      return await this.[serviceName]Model.findAll();
    } catch (error) {
      throw new Error(`Failed to get all [items]: ${error.message}`);
    }
  }

  public async getById(id: string): Promise<[ServiceName]Interface | null> {
    try {
      return await this.[serviceName]Model.findById(id);
    } catch (error) {
      throw new Error(`Failed to get [item] by id: ${error.message}`);
    }
  }

  public async create(data: Partial<[ServiceName]Interface>): Promise<[ServiceName]Interface> {
    try {
      return await this.[serviceName]Model.create(data);
    } catch (error) {
      throw new Error(`Failed to create [item]: ${error.message}`);
    }
  }

  public async update(id: string, data: Partial<[ServiceName]Interface>): Promise<[ServiceName]Interface | null> {
    try {
      return await this.[serviceName]Model.update(id, data);
    } catch (error) {
      throw new Error(`Failed to update [item]: ${error.message}`);
    }
  }

  public async delete(id: string): Promise<boolean> {
    try {
      return await this.[serviceName]Model.delete(id);
    } catch (error) {
      throw new Error(`Failed to delete [item]: ${error.message}`);
    }
  }
}
```

---

## 🗄️ **Template de Modelo Express**

### **Estrutura Padrão**
```ts
// models/[ModelName]Model.ts
import { Schema, model, Document } from 'mongoose';

export interface [ModelName]Interface extends Document {
  // Propriedades do modelo
  createdAt: Date;
  updatedAt: Date;
}

const [ModelName]Schema = new Schema<[ModelName]Interface>({
  // Definição do schema
}, {
  timestamps: true,
});

export class [ModelName]Model {
  private static model = model<[ModelName]Interface>('[ModelName]', [ModelName]Schema);

  public static async findAll(): Promise<[ModelName]Interface[]> {
    return this.model.find().exec();
  }

  public static async findById(id: string): Promise<[ModelName]Interface | null> {
    return this.model.findById(id).exec();
  }

  public static async create(data: Partial<[ModelName]Interface>): Promise<[ModelName]Interface> {
    const [item] = new this.model(data);
    return [item].save();
  }

  public static async update(id: string, data: Partial<[ModelName]Interface>): Promise<[ModelName]Interface | null> {
    return this.model.findByIdAndUpdate(id, data, { new: true }).exec();
  }

  public static async delete(id: string): Promise<boolean> {
    const result = await this.model.findByIdAndDelete(id).exec();
    return !!result;
  }
}
```

---

## 🧪 **Template de Teste**

### **Estrutura Padrão**
```ts
// __tests__/[ComponentName].test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { [ComponentName] } from '../components/[ComponentName]/[ComponentName]';

describe('[ComponentName]', () => {
  it('should render correctly', () => {
    render(<[ComponentName] />);
    
    expect(screen.getByTestId('[component-name]')).toBeInTheDocument();
  });

  it('should handle user interaction', async () => {
    const mockOnClick = jest.fn();
    
    render(<[ComponentName] onClick={mockOnClick} />);
    
    fireEvent.click(screen.getByTestId('[component-name]'));
    
    await waitFor(() => {
      expect(mockOnClick).toHaveBeenCalledTimes(1);
    });
  });

  it('should display correct content', () => {
    const content = 'Test content';
    
    render(<[ComponentName]>{content}</[ComponentName]>);
    
    expect(screen.getByText(content)).toBeInTheDocument();
  });
});
```

---

## 🔗 **Links Relacionados**

- **[Templates](../../README.md)** - Templates e padrões
- **[Document Templates](../document-templates/README.md)** - Templates de documentação
- **[Report Templates](../report-templates/README.md)** - Templates de relatórios
- **[Dashboard](../../PROGRESS-DASHBOARD.md)** - Status do projeto

---

*Última atualização: Janeiro 2025*

**Status**: 🟢 **ATIVO** | **Responsável**: Development Team | **Próxima Revisão**: Fevereiro 2025

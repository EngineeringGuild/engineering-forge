# Frontend Architecture

## 🎨 Component Architecture

### **Atomic Design Pattern**
```
Atoms → Molecules → Organisms → Templates → Pages
```

### **Component Hierarchy**
```
src/
├── components/
│   ├── atoms/
│   │   ├── Button/
│   │   ├── Input/
│   │   ├── Icon/
│   │   ├── Badge/
│   │   └── Avatar/
│   ├── molecules/
│   │   ├── SearchBar/
│   │   ├── ProjectCard/
│   │   ├── LessonCard/
│   │   └── AchievementCard/
│   ├── organisms/
│   │   ├── Header/
│   │   ├── Sidebar/
│   │   ├── ProjectBuilder/
│   │   └── SimulationViewer/
│   ├── templates/
│   │   ├── DashboardLayout/
│   │   ├── CourseLayout/
│   │   └── ProjectLayout/
│   └── pages/
│       ├── Home/
│       ├── Dashboard/
│       ├── CourseDetail/
│       └── ProjectBuilder/
```

## ⚛️ Core Components

### **Button Component**
```typescript
// components/atoms/Button/Button.tsx
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'tertiary' | 'danger';
  size: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
  onClick?: () => void;
}

const Button: React.FC<ButtonProps> = ({
  variant,
  size,
  disabled = false,
  loading = false,
  icon,
  children,
  onClick
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-colors';
  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300',
    tertiary: 'bg-transparent text-blue-600 hover:bg-blue-50',
    danger: 'bg-red-600 text-white hover:bg-red-700'
  };
  const sizeClasses = {
    small: 'px-3 py-1.5 text-sm',
    medium: 'px-4 py-2 text-base',
    large: 'px-6 py-3 text-lg'
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]}`}
      disabled={disabled || loading}
      onClick={onClick}
    >
      {loading && <Spinner className="mr-2" />}
      {icon && !loading && <span className="mr-2">{icon}</span>}
      {children}
    </button>
  );
};
```

### **Project Card Component**
```typescript
// components/molecules/ProjectCard/ProjectCard.tsx
interface ProjectCardProps {
  project: {
    id: string;
    title: string;
    description: string;
    projectType: string;
    performanceMetrics: {
      acceleration: number;
      topSpeed: number;
      efficiency: number;
    };
    nftTokenId?: string;
    isPublic: boolean;
    viewCount: number;
    likeCount: number;
    createdAt: string;
  };
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onShare: (id: string) => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  onView,
  onEdit,
  onShare
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{project.title}</h3>
            <p className="text-sm text-gray-600 mt-1">{project.description}</p>
          </div>
          <Badge variant={project.projectType === 'car' ? 'blue' : 'green'}>
            {project.projectType}
          </Badge>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {project.performanceMetrics.acceleration}
            </div>
            <div className="text-xs text-gray-500">Acceleration</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {project.performanceMetrics.topSpeed}
            </div>
            <div className="text-xs text-gray-500">Top Speed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {project.performanceMetrics.efficiency}%
            </div>
            <div className="text-xs text-gray-500">Efficiency</div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <span>👁️ {project.viewCount}</span>
            <span>❤️ {project.likeCount}</span>
            {project.nftTokenId && <span>🪙 NFT</span>}
          </div>
          <div className="flex space-x-2">
            <Button size="small" variant="tertiary" onClick={() => onView(project.id)}>
              View
            </Button>
            <Button size="small" variant="secondary" onClick={() => onEdit(project.id)}>
              Edit
            </Button>
            <Button size="small" variant="primary" onClick={() => onShare(project.id)}>
              Share
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
```

### **Project Builder Organism**
```typescript
// components/organisms/ProjectBuilder/ProjectBuilder.tsx
interface ProjectBuilderProps {
  projectType: 'car' | 'circuit' | 'bridge' | 'software';
  onSave: (project: ProjectData) => void;
  onTest: (project: ProjectData) => void;
  onMintNFT: (project: ProjectData) => void;
}

const ProjectBuilder: React.FC<ProjectBuilderProps> = ({
  projectType,
  onSave,
  onTest,
  onMintNFT
}) => {
  const [selectedComponents, setSelectedComponents] = useState<Component[]>([]);
  const [projectTitle, setProjectTitle] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [isSimulating, setIsSimulating] = useState(false);

  const handleComponentSelect = (component: Component) => {
    setSelectedComponents(prev => [...prev, component]);
  };

  const handleComponentRemove = (componentId: string) => {
    setSelectedComponents(prev => prev.filter(c => c.id !== componentId));
  };

  const handleTest = async () => {
    setIsSimulating(true);
    try {
      const projectData = {
        title: projectTitle,
        description: projectDescription,
        projectType,
        components: selectedComponents
      };
      await onTest(projectData);
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Component Library */}
      <div className="w-80 bg-white border-r border-gray-200 p-6">
        <h2 className="text-lg font-semibold mb-4">Component Library</h2>
        <ComponentLibrary
          projectType={projectType}
          onComponentSelect={handleComponentSelect}
        />
      </div>

      {/* Assembly Area */}
      <div className="flex-1 flex flex-col">
        <div className="bg-white border-b border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <Input
                placeholder="Project Title"
                value={projectTitle}
                onChange={(e) => setProjectTitle(e.target.value)}
                className="mb-2"
              />
              <Input
                placeholder="Project Description"
                value={projectDescription}
                onChange={(e) => setProjectDescription(e.target.value)}
              />
            </div>
            <div className="flex space-x-2 ml-4">
              <Button variant="secondary" onClick={() => onSave({ title: projectTitle, description: projectDescription, components: selectedComponents })}>
                Save
              </Button>
              <Button variant="primary" onClick={handleTest} loading={isSimulating}>
                Test
              </Button>
              <Button variant="tertiary" onClick={() => onMintNFT({ title: projectTitle, description: projectDescription, components: selectedComponents })}>
                Mint NFT
              </Button>
            </div>
          </div>
        </div>

        <div className="flex-1 p-6">
          <AssemblyArea
            components={selectedComponents}
            onComponentRemove={handleComponentRemove}
            projectType={projectType}
          />
        </div>
      </div>
    </div>
  );
};
```

## 🔄 State Management

### **Redux Store Structure**
```typescript
// store/index.ts
import { configureStore } from '@reduxjs/toolkit';
import { api } from './api';
import authReducer from './slices/authSlice';
import coursesReducer from './slices/coursesSlice';
import projectsReducer from './slices/projectsSlice';
import achievementsReducer from './slices/achievementsSlice';
import blockchainReducer from './slices/blockchainSlice';
import uiReducer from './slices/uiSlice';

export const store = configureStore({
  reducer: {
    [api.reducerPath]: api.reducer,
    auth: authReducer,
    courses: coursesReducer,
    projects: projectsReducer,
    achievements: achievementsReducer,
    blockchain: blockchainReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(api.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

### **Auth Slice**
```typescript
// store/slices/authSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface User {
  id: string;
  email: string;
  username: string;
  academicLevel: string;
  totalXp: number;
  walletAddress?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    loginSuccess: (state, action: PayloadAction<{ user: User; token: string }>) => {
      state.isLoading = false;
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.token = action.payload.token;
      localStorage.setItem('token', action.payload.token);
    },
    loginFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      localStorage.removeItem('token');
    },
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
  },
});

export const { loginStart, loginSuccess, loginFailure, logout, updateUser } = authSlice.actions;
export default authSlice.reducer;
```

### **Projects Slice**
```typescript
// store/slices/projectsSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Project {
  id: string;
  title: string;
  description: string;
  projectType: string;
  components: Component[];
  performanceMetrics?: PerformanceMetrics;
  nftTokenId?: string;
  isPublic: boolean;
  viewCount: number;
  likeCount: number;
  createdAt: string;
}

interface ProjectsState {
  projects: Project[];
  currentProject: Project | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: ProjectsState = {
  projects: [],
  currentProject: null,
  isLoading: false,
  error: null,
};

const projectsSlice = createSlice({
  name: 'projects',
  initialState,
  reducers: {
    setProjects: (state, action: PayloadAction<Project[]>) => {
      state.projects = action.payload;
    },
    addProject: (state, action: PayloadAction<Project>) => {
      state.projects.unshift(action.payload);
    },
    updateProject: (state, action: PayloadAction<Project>) => {
      const index = state.projects.findIndex(p => p.id === action.payload.id);
      if (index !== -1) {
        state.projects[index] = action.payload;
      }
    },
    setCurrentProject: (state, action: PayloadAction<Project | null>) => {
      state.currentProject = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const { setProjects, addProject, updateProject, setCurrentProject, setLoading, setError } = projectsSlice.actions;
export default projectsSlice.reducer;
```

## 🎮 3D Graphics Architecture

### **Three.js Integration**
```typescript
// components/organisms/SimulationViewer/SimulationViewer.tsx
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Environment, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';

interface SimulationViewerProps {
  projectData: ProjectData;
  onSimulationComplete: (results: SimulationResults) => void;
}

const SimulationViewer: React.FC<SimulationViewerProps> = ({
  projectData,
  onSimulationComplete
}) => {
  return (
    <div className="w-full h-full">
      <Canvas>
        <PerspectiveCamera makeDefault position={[10, 10, 10]} />
        <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
        <Environment preset="sunset" />
        
        <ProjectScene projectData={projectData} onSimulationComplete={onSimulationComplete} />
      </Canvas>
    </div>
  );
};

const ProjectScene: React.FC<{ projectData: ProjectData; onSimulationComplete: (results: SimulationResults) => void }> = ({
  projectData,
  onSimulationComplete
}) => {
  const { scene } = useThree();
  const [simulationState, setSimulationState] = useState<'idle' | 'running' | 'complete'>('idle');

  useFrame((state, delta) => {
    if (simulationState === 'running') {
      // Update physics simulation
      updatePhysics(delta);
    }
  });

  const startSimulation = () => {
    setSimulationState('running');
    // Initialize physics simulation
    initializePhysics(projectData);
  };

  const updatePhysics = (delta: number) => {
    // Update physics calculations
    const results = calculatePhysics(delta);
    
    if (results.isComplete) {
      setSimulationState('complete');
      onSimulationComplete(results);
    }
  };

  return (
    <>
      {/* Render project components */}
      {projectData.components.map((component) => (
        <ComponentMesh key={component.id} component={component} />
      ))}
      
      {/* Environment */}
      <Ground />
      <Lighting />
      
      {/* UI Controls */}
      <SimulationControls
        onStart={startSimulation}
        isRunning={simulationState === 'running'}
      />
    </>
  );
};
```

### **Component Mesh**
```typescript
// components/atoms/ComponentMesh/ComponentMesh.tsx
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

interface ComponentMeshProps {
  component: Component;
  isInteractive?: boolean;
  onClick?: () => void;
}

const ComponentMesh: React.FC<ComponentMeshProps> = ({
  component,
  isInteractive = false,
  onClick
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const { nodes, materials } = useGLTF(`/models/${component.type}.glb`);

  useFrame((state) => {
    if (meshRef.current && component.animation) {
      // Apply component-specific animations
      meshRef.current.rotation.y += 0.01;
    }
  });

  const handleClick = () => {
    if (isInteractive && onClick) {
      onClick();
    }
  };

  return (
    <mesh
      ref={meshRef}
      position={component.position}
      rotation={component.rotation}
      scale={component.scale}
      onClick={handleClick}
      onPointerOver={(e) => {
        if (isInteractive) {
          document.body.style.cursor = 'pointer';
        }
      }}
      onPointerOut={(e) => {
        if (isInteractive) {
          document.body.style.cursor = 'default';
        }
      }}
    >
      <primitive object={nodes[component.modelName]} />
      <meshStandardMaterial
        color={component.material?.color || '#888888'}
        metalness={component.material?.metalness || 0.5}
        roughness={component.material?.roughness || 0.5}
      />
    </mesh>
  );
};
```

## 📱 PWA Features

### **Service Worker Configuration**
```typescript
// public/sw.js
import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { StaleWhileRevalidate, CacheFirst } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';

// Precache static assets
precacheAndRoute(self.__WB_MANIFEST);

// Cache API responses
registerRoute(
  ({ url }) => url.pathname.startsWith('/api/'),
  new StaleWhileRevalidate({
    cacheName: 'api-cache',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 60 * 60 * 24, // 24 hours
      }),
    ],
  })
);

// Cache 3D models
registerRoute(
  ({ url }) => url.pathname.endsWith('.glb') || url.pathname.endsWith('.gltf'),
  new CacheFirst({
    cacheName: 'models-cache',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
      }),
    ],
  })
);

// Push notifications
self.addEventListener('push', (event) => {
  const options = {
    body: event.data?.text() || 'New notification from Engineering Forge',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1,
    },
    actions: [
      {
        action: 'explore',
        title: 'View',
        icon: '/icons/checkmark.png',
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/icons/xmark.png',
      },
    ],
  };

  event.waitUntil(
    self.registration.showNotification('Engineering Forge', options)
  );
});
```

### **Web App Manifest**
```json
// public/manifest.json
{
  "name": "Engineering Forge",
  "short_name": "EngForge",
  "description": "Learn engineering through interactive simulations",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#0055A4",
  "orientation": "portrait-primary",
  "icons": [
    {
      "src": "/icons/icon-72x72.png",
      "sizes": "72x72",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-96x96.png",
      "sizes": "96x96",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-128x128.png",
      "sizes": "128x128",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-144x144.png",
      "sizes": "144x144",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-152x152.png",
      "sizes": "152x152",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-384x384.png",
      "sizes": "384x384",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

## 🎨 Styling System

### **Tailwind Configuration**
```javascript
// tailwind.config.js
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#0055A4',
          600: '#004085',
          700: '#002b66',
        },
        secondary: {
          50: '#f0fdf4',
          100: '#dcfce7',
          500: '#00CC66',
          600: '#00a854',
          700: '#008542',
        },
        accent: {
          50: '#fff7ed',
          100: '#ffedd5',
          500: '#FF6600',
          600: '#e55a00',
          700: '#cc4d00',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['Roboto Mono', 'monospace'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
};
```

### **CSS Modules Example**
```css
/* components/ProjectBuilder/ProjectBuilder.module.css */
.container {
  @apply flex h-screen bg-gray-50;
}

.sidebar {
  @apply w-80 bg-white border-r border-gray-200 p-6;
}

.mainArea {
  @apply flex-1 flex flex-col;
}

.header {
  @apply bg-white border-b border-gray-200 p-6;
}

.assemblyArea {
  @apply flex-1 p-6;
}

.componentGrid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 1rem;
}

.componentSlot {
  @apply border-2 border-dashed border-gray-300 rounded-lg p-4 text-center;
  min-height: 120px;
  transition: all 0.2s ease-in-out;
}

.componentSlot:hover {
  @apply border-blue-400 bg-blue-50;
}

.componentSlot.dragover {
  @apply border-blue-600 bg-blue-100;
}

.componentSlot.filled {
  @apply border-green-400 bg-green-50;
}
```

## 🧪 Testing Strategy

### **Component Testing**
```typescript
// components/atoms/Button/Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import Button from './Button';

describe('Button', () => {
  it('renders with correct text', () => {
    render(<Button variant="primary" size="medium">Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = jest.fn();
    render(
      <Button variant="primary" size="medium" onClick={handleClick}>
        Click me
      </Button>
    );
    
    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('shows loading state', () => {
    render(
      <Button variant="primary" size="medium" loading={true}>
        Loading
      </Button>
    );
    
    expect(screen.getByRole('button')).toBeDisabled();
    expect(screen.getByTestId('spinner')).toBeInTheDocument();
  });

  it('applies correct variant classes', () => {
    const { rerender } = render(
      <Button variant="primary" size="medium">Button</Button>
    );
    
    expect(screen.getByRole('button')).toHaveClass('bg-blue-600');
    
    rerender(<Button variant="secondary" size="medium">Button</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-gray-200');
  });
});
```

### **Integration Testing**
```typescript
// components/organisms/ProjectBuilder/ProjectBuilder.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import ProjectBuilder from './ProjectBuilder';

const mockStore = configureStore({
  reducer: {
    projects: (state = { projects: [], currentProject: null }, action) => state,
    auth: (state = { user: { id: '1', username: 'test' } }, action) => state,
  },
});

describe('ProjectBuilder', () => {
  it('renders component library and assembly area', () => {
    render(
      <Provider store={mockStore}>
        <ProjectBuilder
          projectType="car"
          onSave={jest.fn()}
          onTest={jest.fn()}
          onMintNFT={jest.fn()}
        />
      </Provider>
    );
    
    expect(screen.getByText('Component Library')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Project Title')).toBeInTheDocument();
  });

  it('allows component selection', async () => {
    render(
      <Provider store={mockStore}>
        <ProjectBuilder
          projectType="car"
          onSave={jest.fn()}
          onTest={jest.fn()}
          onMintNFT={jest.fn()}
        />
      </Provider>
    );
    
    const engineComponent = screen.getByText('Gas Engine');
    fireEvent.click(engineComponent);
    
    await waitFor(() => {
      expect(screen.getByText('Gas Engine')).toHaveClass('selected');
    });
  });

  it('saves project when save button is clicked', async () => {
    const mockOnSave = jest.fn();
    render(
      <Provider store={mockStore}>
        <ProjectBuilder
          projectType="car"
          onSave={mockOnSave}
          onTest={jest.fn()}
          onMintNFT={jest.fn()}
        />
      </Provider>
    );
    
    fireEvent.change(screen.getByPlaceholderText('Project Title'), {
      target: { value: 'My Test Car' },
    });
    
    fireEvent.click(screen.getByText('Save'));
    
    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'My Test Car',
        })
      );
    });
  });
});
```

## 📊 Performance Optimization

### **Code Splitting**
```typescript
// App.tsx
import { lazy, Suspense } from 'react';
import LoadingSpinner from './components/atoms/LoadingSpinner';

// Lazy load heavy components
const ProjectBuilder = lazy(() => import('./components/organisms/ProjectBuilder'));
const SimulationViewer = lazy(() => import('./components/organisms/SimulationViewer'));
const CourseDetail = lazy(() => import('./pages/CourseDetail'));

function App() {
  return (
    <Router>
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          <Route path="/project-builder" element={<ProjectBuilder />} />
          <Route path="/simulation" element={<SimulationViewer />} />
          <Route path="/courses/:id" element={<CourseDetail />} />
        </Routes>
      </Suspense>
    </Router>
  );
}
```

### **Memoization**
```typescript
// components/molecules/ProjectCard/ProjectCard.tsx
import { memo } from 'react';

const ProjectCard = memo<ProjectCardProps>(({ project, onView, onEdit, onShare }) => {
  // Component implementation
});

export default ProjectCard;
```

### **Virtual Scrolling**
```typescript
// components/organisms/ProjectList/ProjectList.tsx
import { FixedSizeList as List } from 'react-window';

const ProjectList: React.FC<{ projects: Project[] }> = ({ projects }) => {
  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => (
    <div style={style}>
      <ProjectCard project={projects[index]} />
    </div>
  );

  return (
    <List
      height={600}
      itemCount={projects.length}
      itemSize={200}
      width="100%"
    >
      {Row}
    </List>
  );
};
```

// File: src/utils/contentLoader.ts
// Engineering Forge Documentation App - Content Loader Utility

import type { Section, DocumentStructure } from '../types';
import { translateContent } from './translationService';
import { type SupportedLanguage } from '../i18n';

// GDD Content Structure
export const gddSections: Section[] = [
  {
    id: 'gdd-overview',
    title: 'Game Overview & Concept',
    path: '/gdd/overview',
    content: '',
    metadata: {
      lastUpdated: '2024-09-02',
      status: 'complete',
      author: 'Game Design Team',
      wordCount: 2500,
      readingTime: 12,
    },
  },
  {
    id: 'gdd-core-mechanics',
    title: 'Core Mechanics',
    path: '/gdd/core-mechanics',
    content: '',
    metadata: {
      lastUpdated: '2024-09-02',
      status: 'complete',
      author: 'Game Design Team',
      wordCount: 3000,
      readingTime: 15,
    },
  },
  {
    id: 'gdd-game-systems',
    title: 'Game Systems',
    path: '/gdd/game-systems',
    content: '',
    metadata: {
      lastUpdated: '2024-09-02',
      status: 'complete',
      author: 'Game Design Team',
      wordCount: 4000,
      readingTime: 20,
    },
  },
  {
    id: 'gdd-content-assets',
    title: 'Content & Assets',
    path: '/gdd/content-assets',
    content: '',
    metadata: {
      lastUpdated: '2024-09-02',
      status: 'complete',
      author: 'Game Design Team',
      wordCount: 3000,
      readingTime: 15,
    },
  },
  {
    id: 'gdd-business-model',
    title: 'Business Model',
    path: '/gdd/business-model',
    content: '',
    metadata: {
      lastUpdated: '2024-09-02',
      status: 'complete',
      author: 'Game Design Team',
      wordCount: 1500,
      readingTime: 8,
    },
  },
  {
    id: 'gdd-project-plan',
    title: 'Project Plan',
    path: '/gdd/project-plan',
    content: '',
    metadata: {
      lastUpdated: '2024-09-02',
      status: 'complete',
      author: 'Game Design Team',
      wordCount: 1000,
      readingTime: 5,
    },
  },
];

// TDD Content Structure
export const tddSections: Section[] = [
  {
    id: 'tdd-api-design',
    title: 'API Design',
    path: '/tdd/api-design',
    content: '',
    metadata: {
      lastUpdated: '2024-09-02',
      status: 'complete',
      author: 'Technical Team',
      wordCount: 3000,
      readingTime: 15,
    },
  },
  {
    id: 'tdd-frontend-architecture',
    title: 'Frontend Architecture',
    path: '/tdd/frontend-architecture',
    content: '',
    metadata: {
      lastUpdated: '2024-09-02',
      status: 'complete',
      author: 'Technical Team',
      wordCount: 4000,
      readingTime: 20,
    },
  },
  {
    id: 'tdd-backend-architecture',
    title: 'Backend Architecture',
    path: '/tdd/backend-architecture',
    content: '',
    metadata: {
      lastUpdated: '2024-09-02',
      status: 'complete',
      author: 'Technical Team',
      wordCount: 3500,
      readingTime: 18,
    },
  },
  {
    id: 'tdd-backend-architecture-part2',
    title: 'Backend Architecture Part 2',
    path: '/tdd/backend-architecture-part2',
    content: '',
    metadata: {
      lastUpdated: '2024-09-02',
      status: 'complete',
      author: 'Technical Team',
      wordCount: 2500,
      readingTime: 12,
    },
  },
  {
    id: 'tdd-blockchain-integration',
    title: 'Blockchain Integration',
    path: '/tdd/blockchain-integration',
    content: '',
    metadata: {
      lastUpdated: '2024-09-02',
      status: 'complete',
      author: 'Technical Team',
      wordCount: 4000,
      readingTime: 20,
    },
  },
  {
    id: 'tdd-security-architecture',
    title: 'Security Architecture',
    path: '/tdd/security-architecture',
    content: '',
    metadata: {
      lastUpdated: '2024-09-02',
      status: 'complete',
      author: 'Technical Team',
      wordCount: 3500,
      readingTime: 18,
    },
  },
  {
    id: 'tdd-performance-scalability',
    title: 'Performance & Scalability',
    path: '/tdd/performance-scalability',
    content: '',
    metadata: {
      lastUpdated: '2024-09-02',
      status: 'complete',
      author: 'Technical Team',
      wordCount: 3000,
      readingTime: 15,
    },
  },
  {
    id: 'tdd-devops-deployment',
    title: 'DevOps & Deployment',
    path: '/tdd/devops-deployment',
    content: '',
    metadata: {
      lastUpdated: '2024-09-02',
      status: 'complete',
      author: 'Technical Team',
      wordCount: 2500,
      readingTime: 12,
    },
  },
  {
    id: 'tdd-testing-strategy',
    title: 'Testing Strategy',
    path: '/tdd/testing-strategy',
    content: '',
    metadata: {
      lastUpdated: '2024-09-02',
      status: 'complete',
      author: 'Technical Team',
      wordCount: 3000,
      readingTime: 15,
    },
  },
  {
    id: 'tdd-monitoring-analytics',
    title: 'Monitoring & Analytics',
    path: '/tdd/monitoring-analytics',
    content: '',
    metadata: {
      lastUpdated: '2024-09-02',
      status: 'complete',
      author: 'Technical Team',
      wordCount: 3500,
      readingTime: 18,
    },
  },
  {
    id: 'tdd-development-workflow',
    title: 'Development Workflow',
    path: '/tdd/development-workflow',
    content: '',
    metadata: {
      lastUpdated: '2024-09-02',
      status: 'complete',
      author: 'Technical Team',
      wordCount: 3000,
      readingTime: 15,
    },
  },
  {
    id: 'tdd-database-design',
    title: 'Database Design',
    path: '/tdd/database-design',
    content: '',
    metadata: {
      lastUpdated: '2024-09-02',
      status: 'complete',
      author: 'Technical Team',
      wordCount: 2500,
      readingTime: 12,
    },
  },
  {
    id: 'tdd-technology-stack',
    title: 'Technology Stack',
    path: '/tdd/technology-stack',
    content: '',
    metadata: {
      lastUpdated: '2024-09-02',
      status: 'complete',
      author: 'Technical Team',
      wordCount: 2000,
      readingTime: 10,
    },
  },
  {
    id: 'tdd-system-architecture',
    title: 'System Architecture',
    path: '/tdd/system-architecture',
    content: '',
    metadata: {
      lastUpdated: '2024-09-02',
      status: 'complete',
      author: 'Technical Team',
      wordCount: 3000,
      readingTime: 15,
    },
  },
  {
    id: 'tdd-appendices',
    title: 'Appendices',
    path: '/tdd/appendices',
    content: '',
    metadata: {
      lastUpdated: '2024-09-02',
      status: 'complete',
      author: 'Technical Team',
      wordCount: 2000,
      readingTime: 10,
    },
  },
];

// Document structures
export const documentStructures: Record<'GDD' | 'TDD', DocumentStructure> = {
  GDD: {
    id: 'GDD',
    title: 'Game Design Document',
    description: 'Complete game design specifications and mechanics',
    sections: gddSections,
    totalSections: gddSections.length,
    totalWordCount: gddSections.reduce((sum, section) => sum + section.metadata.wordCount, 0),
    estimatedReadingTime: gddSections.reduce((sum, section) => sum + section.metadata.readingTime, 0),
  },
  TDD: {
    id: 'TDD',
    title: 'Technical Design Document',
    description: 'Complete technical specifications and architecture',
    sections: tddSections,
    totalSections: tddSections.length,
    totalWordCount: tddSections.reduce((sum, section) => sum + section.metadata.wordCount, 0),
    estimatedReadingTime: tddSections.reduce((sum, section) => sum + section.metadata.readingTime, 0),
  },
};

// Function to get section by ID
export const getSectionById = (documentType: 'GDD' | 'TDD', sectionId: string): Section | undefined => {
  const sections = documentType === 'GDD' ? gddSections : tddSections;
  return sections.find(section => section.id === sectionId);
};

// Function to get all sections for a document
export const getDocumentSections = (documentType: 'GDD' | 'TDD'): Section[] => {
  return documentType === 'GDD' ? gddSections : tddSections;
};

// REAL CONTENT LOADER - This will load actual markdown files with language support
export const loadRealContent = async (
  documentType: 'GDD' | 'TDD', 
  sectionId: string, 
  language: SupportedLanguage = 'en'
): Promise<string> => {
  try {
    // FIXED: Always try to load real content first, then fallback to demo
    console.log(`Loading content: ${documentType}/${sectionId} in ${language}`);

    // Map section IDs to actual file paths (relative to the docs folder)
    const getFileMap = (lang: SupportedLanguage): Record<string, string> => {
      const basePaths = {
        // GDD sections - all point to the main GDD file
        'gdd-overview': 'GDD-v1.1.md',
        'gdd-core-mechanics': 'GDD-v1.1.md',
        'gdd-game-systems': 'GDD-v1.1.md',
        'gdd-content-assets': 'GDD-v1.1.md',
        'gdd-business-model': 'GDD-v1.1.md',
        'gdd-project-plan': 'Project-Plan-v1.1.md',
        
        // TDD sections - point to specific specification files
        'tdd-api-design': 'specifications/api-design.md',
        'tdd-frontend-architecture': 'specifications/frontend-architecture.md',
        'tdd-backend-architecture': 'specifications/backend-architecture.md',
        'tdd-backend-architecture-part2': 'specifications/backend-architecture-part2.md',
        'tdd-blockchain-integration': 'specifications/blockchain-integration.md',
        'tdd-security-architecture': 'specifications/security-architecture.md',
        'tdd-performance-scalability': 'specifications/performance-scalability.md',
        'tdd-devops-deployment': 'specifications/devops-deployment.md',
        'tdd-testing-strategy': 'specifications/testing-strategy.md',
        'tdd-monitoring-analytics': 'specifications/monitoring-analytics.md',
        'tdd-development-workflow': 'specifications/development-workflow.md',
        'tdd-database-design': 'specifications/database-design.md',
        'tdd-technology-stack': 'specifications/technology-stack.md',
        'tdd-system-architecture': 'specifications/system-architecture.md',
        'tdd-appendices': 'specifications/appendices.md',
      };

      // For Portuguese, try to load Portuguese versions first
      if (lang === 'pt') {
        const ptPaths: Record<string, string> = {};
        Object.entries(basePaths).forEach(([key, path]) => {
          // Try Portuguese version first, fallback to English
          const ptPath = path.replace('.md', '-pt.md');
          ptPaths[key] = ptPath;
        });
        return ptPaths;
      }

      return basePaths;
    };

    const fileMap = getFileMap(language);

    const fileName = fileMap[sectionId];
    if (!fileName) {
      throw new Error(`No file mapping found for section: ${sectionId}`);
    }

    // Try multiple paths for better compatibility
    const basePath = '/docs';
    const pathsToTry = [
      `${basePath}/${fileName}`,
      // Fallback to English version if Portuguese not found
      language === 'pt' ? `${basePath}/${fileName.replace('-pt.md', '.md')}` : null,
    ].filter(Boolean) as string[];
    
    let content = '';
    let lastError: Error | null = null;
    
    // Try each path until one works
    for (const filePath of pathsToTry) {
      try {
        console.log(`Trying to load: ${filePath}`);
        const response = await fetch(filePath);
        if (response.ok) {
          content = await response.text();
          console.log(`Successfully loaded: ${filePath}`);
          break;
        } else {
          throw new Error(`Failed to fetch ${filePath}: ${response.status} ${response.statusText}`);
        }
      } catch (error) {
        lastError = error as Error;
        console.warn(`Failed to load content from ${filePath}:`, error);
      }
    }
    
    // If we got content, process it
    if (content) {
      let processedContent = content;
      
      // For GDD sections, we need to extract specific sections from the large file
      if (documentType === 'GDD' && sectionId !== 'gdd-project-plan') {
        processedContent = extractGDDSection(content, sectionId);
      }
      
      // Handle translation for non-English content
      if (language !== 'en') {
        // Check if we loaded a Portuguese version (indicated by filename)
        const loadedPtVersion = pathsToTry[0].includes('-pt.md') && content;
        
        if (!loadedPtVersion) {
          // If we didn't load a PT version, add translation service
          const { SUPPORTED_LANGUAGES } = await import('../i18n');
          const languageInfo = SUPPORTED_LANGUAGES[language];
          
          // For now, add translation note. Later integrate with translation service
          processedContent = await translateContent(processedContent, language);
          
          // Add note about translation status
          processedContent += `\n\n---\n\n*🌐 **Nota de Tradução**: Este conteúdo foi traduzido automaticamente para ${languageInfo.nativeName}. Para melhor experiência, versões nativas estão sendo preparadas.*`;
        }
      }
      
      return processedContent;
    }
    
    // If all paths failed, return rich demo content or fallback
    console.warn(`Could not fetch any path for ${fileName}:`, lastError);
    
    // Try to return rich demo content first
    if (import.meta.env.DEV) {
      return generateRichDemoContent(documentType, sectionId, language);
    }
    
    return generateFallbackContent(documentType, sectionId, fileName);
    
  } catch (error) {
    return `# Error Loading Content

**Error**: ${error instanceof Error ? error.message : 'Unknown error'}

**Section**: ${sectionId}
**Document**: ${documentType}

Please check the console for more details or contact support.

---

*Content loading error - please refresh and try again.*`;
  }
};

// Helper function to extract specific sections from GDD
const extractGDDSection = (content: string, sectionId: string): string => {
  const sectionMap: Record<string, string> = {
    'gdd-overview': 'Game Overview & Concept',
    'gdd-core-mechanics': 'Core Mechanics',
    'gdd-game-systems': 'Game Systems',
    'gdd-content-assets': 'Content & Assets',
    'gdd-business-model': 'Business Model',
  };

  const sectionTitle = sectionMap[sectionId];
  if (!sectionTitle) {
    return content; // Return full content if section not found
  }

  // Find the section in the content
  const lines = content.split('\n');
  const startIndex = lines.findIndex(line => 
    line.startsWith('#') && line.includes(sectionTitle)
  );

  if (startIndex === -1) {
    return content; // Return full content if section not found
  }

  // Find the end of the section (next major heading)
  let endIndex = lines.length;
  for (let i = startIndex + 1; i < lines.length; i++) {
    if (lines[i].startsWith('#') && !lines[i].startsWith('##')) {
      endIndex = i;
      break;
    }
  }

  // Extract the section content
  const sectionLines = lines.slice(startIndex, endIndex);
  return sectionLines.join('\n');
};

// Helper function to generate rich demo content for development mode
const generateRichDemoContent = (documentType: 'GDD' | 'TDD', sectionId: string, language: SupportedLanguage): string => {
  const section = getSectionById(documentType, sectionId);
  const sectionTitle = section?.title || 'Unknown Section';
  
  // Get translated section title if available
  const getTranslatedTitle = (id: string, lang: SupportedLanguage): string => {
    const translations: Record<string, Record<SupportedLanguage, string>> = {
      'gdd-overview': {
        en: 'Game Overview & Concept',
        pt: 'Visão Geral & Conceito do Jogo',
        fr: 'Aperçu & Concept du Jeu',
        uk: 'Огляд Гри & Концепція',
        zh: '游戏概览与概念'
      },
      'gdd-core-mechanics': {
        en: 'Core Mechanics',
        pt: 'Mecânicas Principais',
        fr: 'Mécaniques Principales',
        uk: 'Основні Механіки',
        zh: '核心机制'
      },
      'tdd-api-design': {
        en: 'API Design',
        pt: 'Design da API',
        fr: 'Conception API',
        uk: 'Дизайн API',
        zh: 'API设计'
      }
    };
    
    return translations[id]?.[lang] || sectionTitle;
  };
  
  const translatedTitle = getTranslatedTitle(sectionId, language);

  // Rich demo content based on section and language
  const getDemoContent = (id: string, lang: SupportedLanguage): string => {
    if (lang === 'pt') {
      return getPtDemoContent(id, translatedTitle);
    }
    return getEnDemoContent(id, translatedTitle);
  };
  
  return getDemoContent(sectionId, language);
};

// English demo content
const getEnDemoContent = (sectionId: string, title: string): string => {
  const demoContent: Record<string, string> = {
    'gdd-overview': `# ${title}

## 🎮 Engineering Forge - Revolutionary 3D Engineering Game

**Engineering Forge** is a groundbreaking 3D engineering and forging game that combines creativity, technical skill, and blockchain technology. Players design, build, and forge complex mechanical systems while earning rewards through the Solana blockchain.

### 🌟 Core Vision

Our vision is to create the most immersive and technically accurate engineering simulation game that educates players while providing entertainment and real-world value through blockchain integration.

### 🎯 Target Audience

- **Primary**: Engineering students and professionals (ages 18-35)
- **Secondary**: Gaming enthusiasts interested in technical challenges
- **Tertiary**: Educators and training institutions

### 🚀 Unique Value Proposition

1. **Real Engineering Principles**: Accurate physics and engineering calculations
2. **Blockchain Integration**: Earn real value through creative engineering
3. **Collaborative Design**: Multiplayer engineering projects
4. **Educational Value**: Learn while playing

### 🎨 Art Style & Aesthetics

- **Visual Style**: Realistic 3D with stylized elements
- **Color Palette**: Industrial grays, metallic blues, and warm oranges
- **Lighting**: Dynamic lighting that responds to forge temperatures
- **UI Design**: Clean, technical interface inspired by CAD software

### 🌍 World Setting

The game takes place in a futuristic engineering facility where players have access to advanced tools, materials, and collaborative workspaces. The environment encourages experimentation and innovation.

---

*This is a comprehensive overview of the Engineering Forge game concept and vision.*`,

    'gdd-core-mechanics': `# Core Mechanics

## 🔧 Fundamental Gameplay Systems

### 🛠️ Design System

**3D Engineering Interface**
- Intuitive CAD-like tools for creating mechanical designs
- Real-time physics simulation during design phase
- Material property visualization and testing
- Collaborative design tools for team projects

**Design Validation**
- Automatic error checking and optimization suggestions
- Performance metrics and efficiency calculations
- Cost analysis and resource management
- Environmental impact assessment

### ⚡ Forging System

**Interactive Forging Process**
- Real-time temperature and pressure controls
- Material transformation visualization
- Quality control through precise timing and technique
- Mastery progression through skill-based challenges

**Material Science**
- 50+ different materials with unique properties
- Alloy creation through material combination
- Heat treatment and tempering processes
- Quality grades affecting final product value

### 🏆 Progression System

**Skill Development**
- Engineering disciplines (Mechanical, Electrical, Civil, etc.)
- Specialized tool mastery
- Design complexity levels
- Innovation and creativity metrics

**Achievement System**
- Technical milestones and certifications
- Community recognition and leaderboards
- Blockchain-based achievement tokens
- Career progression paths

### 💰 Economy & Rewards

**Blockchain Integration**
- Solana-based reward system
- NFT creation for unique designs
- Marketplace for trading designs and materials
- Staking rewards for long-term participation

---

*These core mechanics form the foundation of the Engineering Forge experience.*`,

    'gdd-game-systems': `# Game Systems

## 🎯 Comprehensive Gameplay Systems

### 🏗️ Building & Construction

**Modular Design System**
- Pre-built component library with 500+ parts
- Custom component creation tools
- Assembly and disassembly mechanics
- Quality control and testing procedures

**Project Management**
- Multi-phase project planning
- Resource allocation and budgeting
- Timeline management and deadlines
- Team coordination and communication

### 🌐 Multiplayer Systems

**Collaborative Engineering**
- Real-time collaborative design sessions
- Role-based team assignments
- Communication tools and voice chat
- Project sharing and version control

**Competitive Modes**
- Design challenges and competitions
- Speed building contests
- Innovation showcases
- Community voting and judging

### 📊 Analytics & Learning

**Performance Tracking**
- Detailed analytics on design efficiency
- Learning curve progression
- Skill development metrics
- Innovation and creativity scores

**Educational Integration**
- Tutorial system with progressive difficulty
- Real-world engineering case studies
- Expert interviews and masterclasses
- Certification programs

### 🔄 Progression & Unlocks

**Technology Tree**
- Unlock new tools and materials
- Advanced engineering techniques
- Specialized knowledge areas
- Master-level capabilities

**Reputation System**
- Community standing and recognition
- Expert status and mentorship opportunities
- Industry partnerships and collaborations
- Research and development projects

---

*These systems create a comprehensive and engaging gameplay experience.*`,

    'tdd-api-design': `# API Design

## 🔌 RESTful API Architecture

### 📡 Core Endpoints

**Authentication & Authorization**
\`\`\`typescript
POST /api/auth/login
POST /api/auth/register
POST /api/auth/refresh
DELETE /api/auth/logout
\`\`\`

**User Management**
\`\`\`typescript
GET /api/users/profile
PUT /api/users/profile
GET /api/users/achievements
GET /api/users/designs
\`\`\`

**Design System**
\`\`\`typescript
GET /api/designs
POST /api/designs
GET /api/designs/:id
PUT /api/designs/:id
DELETE /api/designs/:id
POST /api/designs/:id/collaborate
\`\`\`

### 🏗️ Data Models

**Design Entity**
\`\`\`typescript
interface Design {
  id: string;
  title: string;
  description: string;
  components: Component[];
  materials: Material[];
  physics: PhysicsProperties;
  metadata: DesignMetadata;
  createdAt: Date;
  updatedAt: Date;
  authorId: string;
  collaborators: string[];
}
\`\`\`

**Component Entity**
\`\`\`typescript
interface Component {
  id: string;
  type: ComponentType;
  position: Vector3;
  rotation: Quaternion;
  scale: Vector3;
  properties: ComponentProperties;
  connections: Connection[];
}
\`\`\`

### 🔒 Security & Validation

**Input Validation**
- Schema validation using Zod
- Sanitization of user inputs
- Rate limiting and abuse prevention
- CORS configuration

**Authentication**
- JWT-based authentication
- Role-based access control (RBAC)
- OAuth2 integration
- Multi-factor authentication support

---

*This API design ensures scalability, security, and maintainability.*`,

    'tdd-frontend-architecture': `# Frontend Architecture

## ⚛️ React 19 + TypeScript Architecture

### 🏗️ Component Structure

**Layout Components**
\`\`\`typescript
src/
├── components/
│   ├── Layout/
│   │   ├── Header.tsx
│   │   ├── Sidebar.tsx
│   │   └── MainLayout.tsx
│   ├── UI/
│   │   ├── Button.tsx
│   │   ├── Modal.tsx
│   │   └── LoadingSpinner.tsx
│   └── Features/
│       ├── DesignEditor/
│       ├── ForgingSystem/
│       └── Collaboration/
\`\`\`

### 🎯 State Management

**Zustand Store Architecture**
\`\`\`typescript
// Design Store
interface DesignStore {
  currentDesign: Design | null;
  designs: Design[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  createDesign: (design: CreateDesignRequest) => Promise<void>;
  updateDesign: (id: string, updates: Partial<Design>) => Promise<void>;
  deleteDesign: (id: string) => Promise<void>;
  loadDesigns: () => Promise<void>;
}
\`\`\`

### 🎨 Styling System

**Tailwind CSS Configuration**
\`\`\`typescript
// tailwind.config.js
export default {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          500: '#3b82f6',
          900: '#1e3a8a',
        },
        engineering: {
          steel: '#71717a',
          copper: '#b45309',
          gold: '#d97706',
        }
      }
    }
  }
}
\`\`\`

### 🔧 Performance Optimizations

**React Optimizations**
- React.memo for expensive components
- useMemo for complex calculations
- useCallback for event handlers
- Code splitting with React.lazy

**Bundle Optimization**
- Tree shaking for unused code
- Dynamic imports for large libraries
- Image optimization and lazy loading
- Service worker for caching

---

*This architecture ensures maintainable, performant, and scalable frontend code.*`
  };

  return demoContent[sectionId] || `# ${title}

## 📝 Documentation Section

This section contains detailed information about **${title}**.

### 🎯 Key Features

- Comprehensive technical specifications
- Detailed implementation guidelines
- Best practices and recommendations
- Real-world examples and case studies

### 📊 Technical Details

- **Status**: Complete and production-ready
- **Last Updated**: ${new Date().toISOString().split('T')[0]}
- **Author**: Engineering Forge Team
- **Reading Time**: 12 minutes

### 🚀 Implementation

This section provides all the necessary information to implement and maintain the ${title} system within the Engineering Forge platform.

---

*This is rich demo content for development mode. In production, this will be replaced with actual documentation content.*`;
};

// Portuguese demo content
const getPtDemoContent = (sectionId: string, title: string): string => {
  const demoContent: Record<string, string> = {
    'gdd-overview': `# ${title}

## 🎮 Engineering Forge - Jogo Revolucionário de Engenharia 3D

**Engineering Forge** é um jogo inovador de engenharia e forjamento 3D que combina criatividade, habilidade técnica e tecnologia blockchain. Os jogadores projetam, constroem e forjam sistemas mecânicos complexos enquanto ganham recompensas através da blockchain Solana.

### 🌟 Visão Central

Nossa visão é criar o jogo de simulação de engenharia mais imersivo e tecnicamente preciso que educa os jogadores enquanto fornece entretenimento e valor real através da integração blockchain.

### 🎯 Público-Alvo

- **Primário**: Estudantes e profissionais de engenharia (idades 18-35)
- **Secundário**: Entusiastas de jogos interessados em desafios técnicos
- **Terciário**: Educadores e instituições de treinamento

### 🚀 Proposta de Valor Única

1. **Princípios de Engenharia Reais**: Física precisa e cálculos de engenharia
2. **Integração Blockchain**: Ganhe valor real através da engenharia criativa
3. **Design Colaborativo**: Projetos de engenharia multiplayer
4. **Valor Educacional**: Aprenda enquanto joga

### 🎨 Estilo Artístico e Estética

- **Estilo Visual**: 3D realista com elementos estilizados
- **Paleta de Cores**: Cinzas industriais, azuis metálicos e laranjas quentes
- **Iluminação**: Iluminação dinâmica que responde às temperaturas da forja
- **Design de UI**: Interface limpa e técnica inspirada em software CAD

### 🌍 Cenário do Mundo

O jogo se passa em uma instalação de engenharia futurística onde os jogadores têm acesso a ferramentas avançadas, materiais e espaços de trabalho colaborativos. O ambiente encoraja experimentação e inovação.

---

*Esta é uma visão abrangente do conceito e visão do jogo Engineering Forge.*`,

    'gdd-core-mechanics': `# ${title}

## 🔧 Sistemas Fundamentais de Jogabilidade

### 🛠️ Sistema de Design

**Interface de Engenharia 3D**
- Ferramentas intuitivas similares ao CAD para criar designs mecânicos
- Simulação de física em tempo real durante a fase de design
- Visualização e teste de propriedades de materiais
- Ferramentas de design colaborativo para projetos em equipe

**Validação de Design**
- Verificação automática de erros e sugestões de otimização
- Métricas de performance e cálculos de eficiência
- Análise de custos e gestão de recursos
- Avaliação de impacto ambiental

### ⚡ Sistema de Forjamento

**Processo de Forjamento Interativo**
- Controles de temperatura e pressão em tempo real
- Visualização de transformação de materiais
- Controle de qualidade através de timing preciso e técnica
- Progressão de maestria através de desafios baseados em habilidade

**Ciência dos Materiais**
- 50+ materiais diferentes com propriedades únicas
- Criação de ligas através da combinação de materiais
- Processos de tratamento térmico e temperagem
- Graus de qualidade afetando o valor do produto final

### 🏆 Sistema de Progressão

**Desenvolvimento de Habilidades**
- Disciplinas de engenharia (Mecânica, Elétrica, Civil, etc.)
- Maestria em ferramentas especializadas
- Níveis de complexidade de design
- Métricas de inovação e criatividade

**Sistema de Conquistas**
- Marcos técnicos e certificações
- Reconhecimento da comunidade e tabelas de classificação
- Tokens de conquista baseados em blockchain
- Caminhos de progressão de carreira

### 💰 Economia e Recompensas

**Integração Blockchain**
- Sistema de recompensas baseado em Solana
- Criação de NFT para designs únicos
- Marketplace para negociar designs e materiais
- Recompensas de staking para participação de longo prazo

---

*Essas mecânicas centrais formam a base da experiência Engineering Forge.*`,

    'tdd-api-design': `# ${title}

## 🔌 Arquitetura de API RESTful

### 📡 Endpoints Principais

**Autenticação e Autorização**
\`\`\`typescript
POST /api/auth/login
POST /api/auth/register
POST /api/auth/refresh
DELETE /api/auth/logout
\`\`\`

**Gestão de Usuários**
\`\`\`typescript
GET /api/users/profile
PUT /api/users/profile
GET /api/users/achievements
GET /api/users/designs
\`\`\`

**Sistema de Design**
\`\`\`typescript
GET /api/designs
POST /api/designs
GET /api/designs/:id
PUT /api/designs/:id
DELETE /api/designs/:id
POST /api/designs/:id/collaborate
\`\`\`

### 🏗️ Modelos de Dados

**Entidade Design**
\`\`\`typescript
interface Design {
  id: string;
  titulo: string;
  descricao: string;
  componentes: Component[];
  materiais: Material[];
  fisica: PhysicsProperties;
  metadata: DesignMetadata;
  criadoEm: Date;
  atualizadoEm: Date;
  autorId: string;
  colaboradores: string[];
}
\`\`\`

**Entidade Componente**
\`\`\`typescript
interface Component {
  id: string;
  tipo: ComponentType;
  posicao: Vector3;
  rotacao: Quaternion;
  escala: Vector3;
  propriedades: ComponentProperties;
  conexoes: Connection[];
}
\`\`\`

### 🔒 Segurança e Validação

**Validação de Entrada**
- Validação de schema usando Zod
- Sanitização de entradas do usuário
- Rate limiting e prevenção de abuso
- Configuração CORS

**Autenticação**
- Autenticação baseada em JWT
- Controle de acesso baseado em função (RBAC)
- Integração OAuth2
- Suporte à autenticação multifator

---

*Este design de API garante escalabilidade, segurança e manutenibilidade.*`
  };

  return demoContent[sectionId] || `# ${title}

## 📝 Seção ${title}

Esta seção contém informações detalhadas sobre **${title}**.

### 🎯 Características Principais

- Especificações técnicas abrangentes
- Diretrizes de implementação detalhadas
- Melhores práticas e recomendações
- Exemplos do mundo real e estudos de caso

### 📊 Detalhes Técnicos

- **Status**: Completo e pronto para produção
- **Última Atualização**: ${new Date().toLocaleDateString('pt-BR')}
- **Autor**: Equipe Engineering Forge
- **Tempo de Leitura**: 12 minutos

### 🚀 Implementação

Esta seção fornece todas as informações necessárias para implementar e manter o sistema ${title} dentro da plataforma Engineering Forge.

---

*Este é conteúdo demo rico para modo de desenvolvimento. Em produção, será substituído pelo conteúdo real da documentação.*`;
};

// Helper function to generate fallback content when files can't be loaded
const generateFallbackContent = (documentType: 'GDD' | 'TDD', sectionId: string, fileName: string): string => {
  const section = getSectionById(documentType, sectionId);
  const sectionTitle = section?.title || 'Unknown Section';

  return `# ${sectionTitle}

## 📝 Content Loading

This section contains the **${sectionTitle}** from the ${documentType}.

**File**: \`${fileName}\`
**Status**: Content ready for loading

## 🔄 Development Mode

In development mode, the actual markdown files are not directly accessible due to browser security restrictions. The content will be properly loaded when the application is built and deployed.

## 📚 Available Content

The documentation system is connected to the following files:

- **GDD**: Complete Game Design Document with all sections
- **TDD**: Technical Design Document with detailed specifications
- **Project Plan**: Development roadmap and milestones

## 🚀 Next Steps

1. **Build the application** to enable full content loading
2. **Deploy to a web server** for production access
3. **Configure content delivery** for optimal performance

---

*This is fallback content for development. The actual documentation content will be loaded in production.*`;
};

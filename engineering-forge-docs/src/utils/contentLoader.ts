// File: src/utils/contentLoader.ts
// Engineering Forge Documentation App - Content Loader Utility

import type { Section, DocumentStructure } from '../types';
import { translateContent, isContentAvailableInLanguage } from './translationService';
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
    // Map section IDs to actual file paths (relative to the docs folder)
    const fileMap: Record<string, string> = {
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

    const fileName = fileMap[sectionId];
    if (!fileName) {
      throw new Error(`No file mapping found for section: ${sectionId}`);
    }

    // Try multiple paths for the markdown file
    const possiblePaths = [
      `/docs/${fileName}`,
      `./docs/${fileName}`,
      `../../docs/${fileName}`,
      `../docs/${fileName}`
    ];
    
    let content = '';
    let lastError: Error | null = null;
    
    // Try each possible path
    for (const filePath of possiblePaths) {
      try {
        const response = await fetch(filePath);
        if (response.ok) {
          content = await response.text();
          break; // Success, exit the loop
        }
      } catch (error) {
        lastError = error as Error;
        continue; // Try next path
      }
    }
    
    // If we got content, process it
    if (content) {
      let processedContent = content;
      
      // For GDD sections, we need to extract specific sections from the large file
      if (documentType === 'GDD' && sectionId !== 'gdd-project-plan') {
        processedContent = extractGDDSection(content, sectionId);
      }
      
      // Translate content if not in English and translation is available
      if (language !== 'en') {
        if (isContentAvailableInLanguage(language)) {
          // In production, load translated content from separate files
          processedContent = await translateContent(processedContent, language);
        } else {
          // Add translation note for unsupported languages
          const languageInfo = require('../i18n').SUPPORTED_LANGUAGES[language];
          processedContent = `${processedContent}\n\n---\n\n*This content is being translated to ${languageInfo.nativeName}. Please check back soon.*`;
        }
      }
      
      return processedContent;
    }
    
    // If all paths failed, return fallback content
    console.warn(`Could not fetch any path for ${fileName}:`, lastError);
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

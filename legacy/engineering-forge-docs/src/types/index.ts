// File: src/types/index.ts
// Engineering Forge Documentation App - Type Definitions

export interface Section {
  id: string;
  title: string;
  path: string;
  subsections?: Section[];
  content: string;
  metadata: {
    lastUpdated: string;
    status: 'complete' | 'in-progress' | 'draft';
    author: string;
    wordCount: number;
    readingTime: number;
  };
}

export interface NavigationState {
  currentDocument: 'GDD' | 'TDD';
  currentSection: string;
  sidebarCollapsed: boolean;
  searchQuery: string;
  theme: 'light' | 'dark';
}

export interface SearchResult {
  id: string;
  title: string;
  path: string;
  excerpt: string;
  document: 'GDD' | 'TDD';
  relevance: number;
}

export interface TableOfContentsItem {
  id: string;
  title: string;
  level: number;
  children?: TableOfContentsItem[];
}

export interface DocumentStructure {
  id: 'GDD' | 'TDD';
  title: string;
  description: string;
  sections: Section[];
  totalSections: number;
  totalWordCount: number;
  estimatedReadingTime: number;
}

export interface ThemeContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

export interface SearchContextType {
  query: string;
  results: SearchResult[];
  isSearching: boolean;
  search: (query: string) => void;
  clearSearch: () => void;
}

export interface NavigationContextType {
  currentDocument: 'GDD' | 'TDD';
  currentSection: string;
  navigateToSection: (sectionId: string) => void;
  switchDocument: (document: 'GDD' | 'TDD') => void;
  toggleSidebar: () => void;
  sidebarCollapsed: boolean;
}

export interface MarkdownContent {
  raw: string;
  html: string;
  toc: TableOfContentsItem[];
  metadata: {
    title: string;
    description: string;
    tags: string[];
    lastModified: string;
  };
}

export interface CodeBlock {
  language: string;
  code: string;
  filename?: string;
  highlighted?: boolean;
}

export interface Diagram {
  type: 'mermaid' | 'plantuml' | 'image';
  content: string;
  alt?: string;
  caption?: string;
}

export interface BreadcrumbItem {
  title: string;
  path: string;
  isActive: boolean;
}

export interface ProgressData {
  currentSection: string;
  totalSections: number;
  completedSections: number;
  progressPercentage: number;
  estimatedTimeRemaining: number;
}

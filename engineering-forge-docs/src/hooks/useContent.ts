// File: src/hooks/useContent.ts
// Engineering Forge Documentation App - Content Management Hook

import { useState, useEffect, useCallback } from 'react';
import { useCurrentDocument, useCurrentSection } from '../store/navigationStore';
import { useCurrentLanguage } from '../store/languageStore';
import { loadRealContent } from '../utils/contentLoader';
import { type SupportedLanguage } from '../i18n';

interface ContentState {
  content: string;
  isLoading: boolean;
  error: string | null;
}

export const useContent = () => {
  const [contentState, setContentState] = useState<ContentState>({
    content: getDefaultContent('GDD'),
    isLoading: false,
    error: null,
  });

  const currentDocument = useCurrentDocument();
  const currentSection = useCurrentSection();
  const currentLanguage = useCurrentLanguage();

  // Memoize content loading function to prevent infinite loops
  const loadContent = useCallback(async (document: 'GDD' | 'TDD', section: string, language: string) => {
    if (!section) {
      setContentState({
        content: getDefaultContent(document),
        isLoading: false,
        error: null,
      });
      return;
    }

    // Set loading state
    setContentState(prev => ({
      ...prev,
      isLoading: true,
      error: null,
    }));

    try {
      // Load real content from markdown files with language support
      const realContent = await loadRealContent(document, section, language as SupportedLanguage);
      setContentState({
        content: realContent,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      console.error('Error loading content:', error);
      // Fallback to default content if real content fails to load
      setContentState({
        content: getDefaultContent(document),
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to load content',
      });
    }
  }, []);

  // Simple content loading without complex state management
  useEffect(() => {
    loadContent(currentDocument, currentSection, currentLanguage);
  }, [currentDocument, currentSection, currentLanguage, loadContent]);

  // Memoize reload function to prevent unnecessary re-renders
  const reloadContent = useCallback(() => {
    if (currentSection) {
      setContentState(prev => ({ ...prev, isLoading: true }));
      setTimeout(() => {
        setContentState(prev => ({ ...prev, isLoading: false }));
      }, 200);
    }
  }, [currentSection]);

  return {
    ...contentState,
    reloadContent,
  };
};

// Function to get default content for each document type
const getDefaultContent = (documentType: 'GDD' | 'TDD'): string => {
  if (documentType === 'GDD') {
    return `# Game Design Document (GDD)

Welcome to the **Engineering Forge** Game Design Document. This comprehensive document outlines all aspects of our revolutionary 3D engineering and forging game.

## 🎮 Game Overview

Engineering Forge is an immersive 3D game that combines engineering creativity with blockchain technology. Players design, build, and forge complex mechanical systems while earning rewards through the Solana blockchain.

### Key Features

- **3D Engineering Design**: Create complex mechanical systems in a realistic 3D environment
- **Blockchain Integration**: Earn and trade digital assets on Solana
- **Multiplayer Collaboration**: Work with other engineers on large-scale projects
- **Real-time Physics**: Advanced physics engine for realistic engineering simulations

## 📚 Document Sections

Use the sidebar navigation to explore different sections of the GDD:

- **Game Overview & Concept**: Core game vision and target audience
- **Core Mechanics**: Fundamental gameplay systems and interactions
- **Game Systems**: Detailed game systems and progression
- **Content & Assets**: Art, audio, and content specifications
- **Business Model**: Monetization and revenue strategies
- **Project Plan**: Development timeline and milestones

## 🔄 Real Content Loading

**NEW**: The system is now connected to real documentation files! When you select a section, it will attempt to load content from the actual markdown files in the \`docs/\` folder.

---

*Select a section from the sidebar to view detailed content from real documentation files.*`;
  } else {
    return `# Technical Design Document (TDD)

Welcome to the **Engineering Forge** Technical Design Document. This comprehensive document outlines all technical specifications, architecture decisions, and implementation details.

## 🔧 Technical Overview

Engineering Forge is built with modern web technologies, ensuring scalability, performance, and maintainability. Our architecture follows industry best practices and is designed for enterprise-grade applications.

### Technology Stack

- **Frontend**: React 18 + TypeScript + Tailwind CSS
- **Backend**: Node.js + Express + TypeScript
- **Database**: PostgreSQL + Redis
- **Blockchain**: Solana integration
- **Infrastructure**: Docker + Kubernetes + AWS

## 📚 Document Sections

Use the sidebar navigation to explore different technical sections:

- **API Design**: RESTful API specifications and endpoints
- **Frontend Architecture**: Component structure and state management
- **Backend Architecture**: Server architecture and database design
- **Blockchain Integration**: Solana smart contracts and wallet integration
- **Security Architecture**: Authentication, authorization, and security measures
- **Performance & Scalability**: Optimization strategies and scaling plans
- **DevOps & Deployment**: CI/CD pipelines and infrastructure
- **Testing Strategy**: Unit, integration, and E2E testing approaches
- **Monitoring & Analytics**: Observability and performance monitoring
- **Development Workflow**: Git workflow and development processes

## 🔄 Real Content Loading

**NEW**: The system is now connected to real documentation files! When you select a section, it will attempt to load content from the actual markdown files in the \`docs/specifications/\` folder.

---

*Select a section from the sidebar to view detailed technical specifications from real documentation files.*`;
  }
};

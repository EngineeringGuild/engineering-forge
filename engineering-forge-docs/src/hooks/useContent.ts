// File: src/hooks/useContent.ts
// Engineering Forge Documentation App - Content Management Hook - HIGH-QUALITY ARCHITECTURE

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigationStore } from '../store/navigationStore';
import { useLanguageStore } from '../store/languageStore';
import { loadRealContent } from '../utils/contentLoader';
import { type SupportedLanguage } from '../i18n';

interface ContentState {
  content: string;
  isLoading: boolean;
  error: string | null;
}

// High-quality content management with optimized loading
export const useContent = () => {
  const [contentState, setContentState] = useState<ContentState>({
    content: '',
    isLoading: false,
    error: null,
  });

  // Store selectors - optimized to prevent unnecessary re-renders
  const currentDocument = useNavigationStore((state) => state.currentDocument);
  const currentSection = useNavigationStore((state) => state.currentSection);
  const currentLanguage = useLanguageStore((state) => state.currentLanguage);

  // Refs to track previous values and prevent unnecessary loads
  const prevDocumentRef = useRef(currentDocument);
  const prevSectionRef = useRef(currentSection);
  const prevLanguageRef = useRef(currentLanguage);
  const loadingRef = useRef(false);

  // Load content function with error handling
  const loadContent = useCallback(async (
    document: 'GDD' | 'TDD', 
    sectionId: string, 
    language: SupportedLanguage
  ) => {
    if (loadingRef.current) return; // Prevent concurrent loads
    
    try {
      loadingRef.current = true;
      setContentState(prev => ({ ...prev, isLoading: true, error: null }));

      const content = await loadRealContent(document, sectionId, language);
      
      setContentState({
        content,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      setContentState({
        content: getDefaultContent(document),
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to load content',
      });
    } finally {
      loadingRef.current = false;
    }
  }, []);

  // Effect to load content when document, section, or language changes
  useEffect(() => {
    const documentChanged = prevDocumentRef.current !== currentDocument;
    const sectionChanged = prevSectionRef.current !== currentSection;
    const languageChanged = prevLanguageRef.current !== currentLanguage;

    // Update refs
    prevDocumentRef.current = currentDocument;
    prevSectionRef.current = currentSection;
    prevLanguageRef.current = currentLanguage;

    if (currentSection && (documentChanged || sectionChanged || languageChanged)) {
      loadContent(currentDocument, currentSection, currentLanguage);
    } else if (!currentSection && documentChanged) {
      // Set default content for document overview
      setContentState({
        content: getDefaultContent(currentDocument),
        isLoading: false,
        error: null,
      });
    }
  }, [currentDocument, currentSection, currentLanguage, loadContent]); // FIXED: Added loadContent back to dependencies

  // Manual reload function
  const reloadContent = useCallback(() => {
    if (currentSection) {
      loadContent(currentDocument, currentSection, currentLanguage);
    }
  }, [currentDocument, currentSection, currentLanguage, loadContent]);

  // Memoize return object to prevent unnecessary re-renders
  return useMemo(() => ({
    ...contentState,
    reloadContent,
  }), [contentState, reloadContent]);
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
// File: src/components/Layout/Sidebar.tsx
// Engineering Forge Documentation App - Sidebar Component

import React, { useState } from 'react';
// import { useTranslation } from 'react-i18next'; // TODO: Implement navigation translations
import { ChevronDown, ChevronRight, FileText, Folder, FolderOpen } from 'lucide-react';
import { useCurrentDocument, useCurrentSection, useSidebarCollapsed, useNavigationActions } from '../../store/navigationStore';
import { documentStructures } from '../../utils/contentLoader';

interface SidebarProps {
  isMobileOpen: boolean;
  onMobileClose: () => void;
}

interface SidebarSubsection {
  id: string;
  title: string;
  subsections?: SidebarSubsection[];
}

interface SidebarItemProps {
  section: SidebarSubsection;
  level?: number;
  isActive?: boolean;
  onSectionClick: (sectionId: string) => void;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ 
  section, 
  level = 0, 
  isActive = false, 
  onSectionClick 
}) => {
  // const { t } = useTranslation('navigation'); // TODO: Implement navigation translations
  const [isExpanded, setIsExpanded] = useState(level === 0);
  const hasSubsections = section.subsections && section.subsections.length > 0;

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (hasSubsections) {
      setIsExpanded(!isExpanded);
    }
  };

  const handleSectionClick = () => {
    onSectionClick(section.id);
  };

  return (
    <div className="space-y-1">
      <button
        onClick={handleSectionClick}
        className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 group ${
          isActive
            ? 'bg-primary-100 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400'
            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
        }`}
        style={{ paddingLeft: `${level * 16 + 12}px` }}
      >
        {hasSubsections ? (
          <button
            onClick={handleToggle}
            className="mr-2 p-0.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
          >
            {isExpanded ? (
              <ChevronDown size={14} className="text-gray-500" />
            ) : (
              <ChevronRight size={14} className="text-gray-500" />
            )}
          </button>
        ) : (
          <FileText size={16} className="mr-2 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300" />
        )}
        
        {hasSubsections && (
          <div className="mr-2">
            {isExpanded ? (
              <FolderOpen size={16} className="text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300" />
            ) : (
              <Folder size={16} className="text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300" />
            )}
          </div>
        )}
        
        <span className="truncate">{section.title}</span>
      </button>

      {hasSubsections && isExpanded && (
        <div className="space-y-1">
          {section.subsections!.map((subsection) => (
            <SidebarItem
              key={subsection.id}
              section={subsection}
              level={level + 1}
              isActive={isActive || subsection.id === section.id}
              onSectionClick={onSectionClick}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const Sidebar: React.FC<SidebarProps> = ({ isMobileOpen, onMobileClose }) => {
  const currentDocument = useCurrentDocument();
  const currentSection = useCurrentSection();
  const sidebarCollapsed = useSidebarCollapsed();
  const { setCurrentSection, setSidebarCollapsed } = useNavigationActions();

  const currentStructure = documentStructures[currentDocument];

  const handleSectionClick = (sectionId: string) => {
    setCurrentSection(sectionId);
    // Close mobile menu on section click
    if (isMobileOpen) {
      onMobileClose();
    }
  };

  const handleToggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:block fixed left-0 top-16 h-[calc(100vh-4rem)] bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 z-40 ${
          sidebarCollapsed ? 'w-16' : 'w-80'
        }`}
      >
        <div className="h-full flex flex-col">
          {/* Sidebar Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h2 className={`font-semibold text-gray-900 dark:text-white transition-opacity ${
                sidebarCollapsed ? 'opacity-0' : 'opacity-100'
              }`}>
                {currentStructure.title}
              </h2>
              <button
                onClick={handleToggleSidebar}
                className="p-1 rounded-md text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              >
                {sidebarCollapsed ? (
                  <ChevronRight size={16} />
                ) : (
                  <ChevronDown size={16} />
                )}
              </button>
            </div>
            
            {!sidebarCollapsed && (
              <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                {currentStructure.totalSections} sections • {currentStructure.estimatedReadingTime} min read
              </div>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-2">
            {currentStructure.sections.map((section) => (
              <SidebarItem
                key={section.id}
                section={section}
                isActive={currentSection === section.id}
                onSectionClick={handleSectionClick}
              />
            ))}
          </nav>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-50"
          onClick={onMobileClose}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={`lg:hidden fixed left-0 top-16 h-[calc(100vh-4rem)] bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 z-50 transition-transform duration-300 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        } w-80`}
      >
        <div className="h-full flex flex-col">
          {/* Mobile Sidebar Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="font-semibold text-gray-900 dark:text-white">
              {currentStructure.title}
            </h2>
            <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              {currentStructure.totalSections} sections • {currentStructure.estimatedReadingTime} min read
            </div>
          </div>

          {/* Mobile Navigation */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-2">
            {currentStructure.sections.map((section) => (
              <SidebarItem
                key={section.id}
                section={section}
                isActive={currentSection === section.id}
                onSectionClick={handleSectionClick}
              />
            ))}
          </nav>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;

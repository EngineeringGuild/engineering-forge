// File: src/components/Content/TableOfContents.tsx
// Engineering Forge Documentation App - Table of Contents Component

import React from 'react';
import { Hash } from 'lucide-react';

interface TableOfContentsProps {
  content: string;
  className?: string;
}

const TableOfContents: React.FC<TableOfContentsProps> = ({ content, className = '' }) => {
  // Simple TOC for now to avoid loops
  if (!content || content.length < 100) {
    return null;
  }

  return (
    <div className={`bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 ${className}`}>
      <div className="flex items-center space-x-2 mb-3">
        <Hash size={16} className="text-gray-500" />
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
          Table of Contents
        </h3>
      </div>
      
      <div className="text-sm text-gray-600 dark:text-gray-400">
        <p>Content navigation will be available here.</p>
        <p className="mt-2 text-xs">Select a section from the sidebar to view content.</p>
      </div>
    </div>
  );
};

export default TableOfContents;

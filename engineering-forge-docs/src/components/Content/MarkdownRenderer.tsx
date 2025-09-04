// File: src/components/Content/MarkdownRenderer.tsx
// Engineering Forge Documentation App - Markdown Renderer Component

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeHighlight from 'rehype-highlight';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';


interface MarkdownRendererProps {
  content: string;
  className?: string;
}

interface CodeBlockProps {
  children: React.ReactNode;
  className?: string;
  inline?: boolean;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ children, className, inline }) => {
  const match = /language-(\w+)/.exec(className || '');
  const language = match ? match[1] : 'text';

  if (inline) {
    return (
      <code className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 px-2 py-1 rounded text-sm font-mono">
        {children}
      </code>
    );
  }

  return (
    <div className="relative group">
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
          {language}
        </span>
      </div>
      <SyntaxHighlighter
        language={language}
        style={tomorrow}
        customStyle={{
          margin: 0,
          borderRadius: '0.5rem',
          fontSize: '0.875rem',
          lineHeight: '1.5',
        }}
        showLineNumbers
        wrapLines
      >
        {String(children).replace(/\n$/, '')}
      </SyntaxHighlighter>
    </div>
  );
};

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className = '' }) => {
  return (
    <div className={`prose-custom ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw, rehypeHighlight]}
        components={{
          // Custom heading components with IDs for TOC
          h1: ({ children, ...props }) => (
            <h1 id={generateId(children)} className="scroll-mt-20" {...props}>
              {children}
            </h1>
          ),
          h2: ({ children, ...props }) => (
            <h2 id={generateId(children)} className="scroll-mt-20" {...props}>
              {children}
            </h2>
          ),
          h3: ({ children, ...props }) => (
            <h3 id={generateId(children)} className="scroll-mt-20" {...props}>
              {children}
            </h3>
          ),
          h4: ({ children, ...props }) => (
            <h4 id={generateId(children)} className="scroll-mt-20" {...props}>
              {children}
            </h4>
          ),
          h5: ({ children, ...props }) => (
            <h5 id={generateId(children)} className="scroll-mt-20" {...props}>
              {children}
            </h5>
          ),
          h6: ({ children, ...props }) => (
            <h6 id={generateId(children)} className="scroll-mt-20" {...props}>
              {children}
            </h6>
          ),
          
          // Custom code components
          code: ({ children, className, ...props }: any) => (
            <CodeBlock className={className} inline={false} {...props}>
              {children}
            </CodeBlock>
          ),
          
          // Custom link components
          a: ({ href, children, ...props }) => (
            <a
              href={href}
              className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 underline decoration-2 underline-offset-2 transition-colors"
              target={href?.startsWith('http') ? '_blank' : undefined}
              rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
              {...props}
            >
              {children}
            </a>
          ),
          
          // Custom table components
          table: ({ children, ...props }) => (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-600" {...props}>
                {children}
              </table>
            </div>
          ),
          
          // Custom blockquote components
          blockquote: ({ children, ...props }) => (
            <blockquote
              className="border-l-4 border-primary-500 pl-4 italic text-gray-700 dark:text-gray-300 my-6 bg-gray-50 dark:bg-gray-800/50 py-4 rounded-r-lg"
              {...props}
            >
              {children}
            </blockquote>
          ),
          
          // Custom list components
          ul: ({ children, ...props }) => (
            <ul className="space-y-2 list-disc list-inside text-gray-700 dark:text-gray-300" {...props}>
              {children}
            </ul>
          ),
          
          ol: ({ children, ...props }) => (
            <ol className="space-y-2 list-decimal list-inside text-gray-700 dark:text-gray-300" {...props}>
              {children}
            </ol>
          ),
          
          // Custom image components
          img: ({ src, alt, ...props }) => (
            <div className="my-6">
              <img
                src={src}
                alt={alt}
                className="max-w-full h-auto rounded-lg shadow-md border border-gray-200 dark:border-gray-700"
                loading="lazy"
                {...props}
              />
              {alt && (
                <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-2 italic">
                  {alt}
                </p>
              )}
            </div>
          ),
          
          // Custom horizontal rule
          hr: ({ ...props }) => (
            <hr className="my-8 border-gray-300 dark:border-gray-600" {...props} />
          ),
          
          // Custom strong components
          strong: ({ children, ...props }) => (
            <strong className="font-semibold text-gray-900 dark:text-white" {...props}>
              {children}
            </strong>
          ),
          
          // Custom emphasis components
          em: ({ children, ...props }) => (
            <em className="italic text-gray-800 dark:text-gray-200" {...props}>
              {children}
            </em>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

// Helper function to generate IDs for headings - Memoized to prevent re-renders
const generateId = (children: React.ReactNode): string => {
  if (typeof children === 'string') {
    return children
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  if (Array.isArray(children)) {
    return children
      .map(child => generateId(child))
      .join('-')
      .replace(/[^a-z0-9-]/g, '');
  }
  return 'heading';
};

export default MarkdownRenderer;

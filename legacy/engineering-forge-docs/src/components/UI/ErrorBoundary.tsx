// File: src/components/UI/ErrorBoundary.tsx
// Engineering Forge Documentation App - Error Boundary Component

import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
  errorCount: number;
}

class ErrorBoundary extends Component<Props, State> {
  private retryTimeout?: NodeJS.Timeout;

  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, errorCount: 0 };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorCount: 0 };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Check for infinite loop patterns
    if (error.message.includes('Maximum update depth exceeded')) {
      console.error('Infinite loop detected! This is likely caused by improper useEffect dependencies or store subscriptions.');
    }
    
    this.setState({ error, errorInfo });
  }

  componentDidUpdate() {
    // DISABLED: Auto-retry mechanism to prevent flickering
    // The auto-retry was causing infinite loops between error and normal states
    // Users can manually retry using the "Try Again" button
  }

  componentWillUnmount() {
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout);
    }
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <div className="flex items-center space-x-3 mb-4">
              <AlertTriangle size={24} className="text-red-500" />
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                Something went wrong
              </h1>
            </div>
            
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              The application encountered an unexpected error. This might be due to a configuration issue or a bug in the code.
            </p>
            
            {this.state.error && (
              <details className="mb-4">
                <summary className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
                  Error Details
                </summary>
                <div className="mt-2 p-3 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono text-gray-800 dark:text-gray-200 overflow-auto">
                  <div className="mb-2">
                    <strong>Error:</strong> {this.state.error.message}
                  </div>
                  {this.state.error.stack && (
                    <div>
                      <strong>Stack:</strong>
                      <pre className="whitespace-pre-wrap">{this.state.error.stack}</pre>
                    </div>
                  )}
                </div>
              </details>
            )}
            
            <div className="flex space-x-3">
              <button
                onClick={this.handleReload}
                className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                <RefreshCw size={16} />
                <span>Reload Page</span>
              </button>
              
              <button
                onClick={() => {
                  // Clear error state and reset error count
                  this.setState({ 
                    hasError: false, 
                    error: undefined, 
                    errorInfo: undefined, 
                    errorCount: 0 
                  });
                  // Clear any pending retry timeout
                  if (this.retryTimeout) {
                    clearTimeout(this.retryTimeout);
                    this.retryTimeout = undefined;
                  }
                }}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

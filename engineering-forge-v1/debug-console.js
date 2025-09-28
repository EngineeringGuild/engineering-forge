// Enhanced Debug Script for Engineering Forge V1.0
console.log('🔍 Enhanced Debug Script Loaded');

// Performance monitoring
const startTime = performance.now();

// Check if React is loaded
if (typeof React !== 'undefined') {
  console.log('✅ React is loaded:', React.version);
} else {
  console.log('❌ React is not loaded');
}

// Check if ReactDOM is loaded
if (typeof ReactDOM !== 'undefined') {
  console.log('✅ ReactDOM is loaded');
} else {
  console.log('❌ ReactDOM is not loaded');
}

// Check if the root element exists
const rootElement = document.getElementById('root');
if (rootElement) {
  console.log('✅ Root element exists:', rootElement);
  console.log('📏 Root element dimensions:', {
    width: rootElement.offsetWidth,
    height: rootElement.offsetHeight
  });
} else {
  console.log('❌ Root element not found');
}

// Enhanced error tracking
const originalError = console.error;
console.error = function(...args) {
  console.log('🚨 Console Error:', ...args);
  // Send error to monitoring service (if available)
  if (window.gtag) {
    window.gtag('event', 'exception', {
      description: args.join(' '),
      fatal: false
    });
  }
  originalError.apply(console, args);
};

// Enhanced warning tracking
const originalWarn = console.warn;
console.warn = function(...args) {
  console.log('⚠️ Console Warning:', ...args);
  originalWarn.apply(console, args);
};

// Performance monitoring
window.addEventListener('load', () => {
  const loadTime = performance.now() - startTime;
  console.log(`⚡ Page loaded in ${loadTime.toFixed(2)}ms`);
  
  // Check if React has rendered
  setTimeout(() => {
    const rootContent = rootElement?.innerHTML;
    if (rootContent && rootContent.length > 0) {
      console.log('✅ React has rendered content');
    } else {
      console.log('❌ React has not rendered content yet');
    }
  }, 1000);
});

// Memory usage monitoring
if (performance.memory) {
  console.log('💾 Memory Usage:', {
    used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024) + ' MB',
    total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024) + ' MB',
    limit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024) + ' MB'
  });
}

// Network monitoring
if ('connection' in navigator) {
  console.log('🌐 Network Info:', {
    effectiveType: navigator.connection.effectiveType,
    downlink: navigator.connection.downlink + ' Mbps',
    rtt: navigator.connection.rtt + ' ms'
  });
}

// Device info
console.log('📱 Device Info:', {
  userAgent: navigator.userAgent,
  platform: navigator.platform,
  language: navigator.language,
  cookieEnabled: navigator.cookieEnabled,
  onLine: navigator.onLine
});

// Global error handler
window.addEventListener('error', (event) => {
  console.log('🚨 Global Error:', {
    message: event.message,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
    error: event.error
  });
});

// Unhandled promise rejection handler
window.addEventListener('unhandledrejection', (event) => {
  console.log('🚨 Unhandled Promise Rejection:', event.reason);
});

console.log('🎯 Enhanced Debug Script Completed');
console.log('🎮 Engineering Forge V1.0 - Debug Mode Active');
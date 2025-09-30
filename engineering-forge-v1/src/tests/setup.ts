// File: /Users/user/Desktop/Core Guild Project/projects/Games/Engineering Forge/engineering-forge-v1/src/tests/setup.ts

/**
 * Jest Test Setup
 * Global test configuration and utilities
 */

// Mock console methods for cleaner test output
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

beforeAll(() => {
  // Suppress console.error and console.warn during tests unless explicitly needed
  console.error = (...args: any[]) => {
    if (process.env.DEBUG_TESTS === 'true') {
      originalConsoleError(...args);
    }
  };

  console.warn = (...args: any[]) => {
    if (process.env.DEBUG_TESTS === 'true') {
      originalConsoleWarn(...args);
    }
  };
});

afterAll(() => {
  // Restore original console methods
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
});

// Global test utilities
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeValidDate(): R;
      toBeValidId(): R;
    }
  }
}

// Custom Jest matchers
expect.extend({
  toBeValidDate(received: any) {
    const pass = received instanceof Date && !isNaN(received.getTime());

    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid date`,
        pass: true
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid date`,
        pass: false
      };
    }
  },

  toBeValidId(received: any) {
    const pass = typeof received === 'string' && received.length > 0;

    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid ID`,
        pass: true
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid ID`,
        pass: false
      };
    }
  }
});

// Test timeout configuration
jest.setTimeout(30000);

// Mock DOM APIs for components that might need them (only if window exists)
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(), // deprecated
      removeListener: jest.fn(), // deprecated
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn()
    }))
  });

  // Mock canvas for components that use canvas
  if (typeof HTMLCanvasElement !== 'undefined') {
    HTMLCanvasElement.prototype.getContext = jest.fn(() => ({
      clearRect: jest.fn(),
      fillRect: jest.fn(),
      strokeRect: jest.fn(),
      beginPath: jest.fn(),
      moveTo: jest.fn(),
      lineTo: jest.fn(),
      stroke: jest.fn(),
      arc: jest.fn(),
      fill: jest.fn(),
      save: jest.fn(),
      restore: jest.fn(),
      translate: jest.fn(),
      rotate: jest.fn(),
      scale: jest.fn(),
      setLineDash: jest.fn(),
      globalAlpha: 1,
      fillStyle: '',
      strokeStyle: '',
      lineWidth: 1,
      font: ''
    }));
  }
}

// Mock requestAnimationFrame
global.requestAnimationFrame = jest.fn(cb => {
  return setTimeout(cb, 16);
});

global.cancelAnimationFrame = jest.fn(id => {
  clearTimeout(id);
});

export {};

// Console error suppression for development
// This helps reduce noise in development console

// Suppress specific warnings that are common in demo applications
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

console.error = (...args) => {
  // Suppress common React warnings in development
  const message = args[0];
  if (typeof message === 'string') {
    // Suppress prop-types warnings
    if (message.includes('Warning: Failed prop type')) {
      return;
    }
    
    // Suppress React Hook warnings for demo
    if (message.includes('React Hook useEffect has a missing dependency')) {
      return;
    }
    
    // Suppress Router warnings
    if (message.includes('No routes matched location')) {
      return;
    }
    
    // Suppress API call errors (since we're using mock data)
    if (message.includes('Failed to fetch') || message.includes('NetworkError')) {
      return;
    }
  }
  
  // Show other errors
  originalConsoleError.apply(console, args);
};

console.warn = (...args) => {
  const message = args[0];
  if (typeof message === 'string') {
    // Suppress common warnings
    if (message.includes('validateDOMNesting')) {
      return;
    }
    
    if (message.includes('Warning: React Hook')) {
      return;
    }
    
    if (message.includes('Warning: Function components cannot be given refs')) {
      return;
    }
  }
  
  // Show other warnings
  originalConsoleWarn.apply(console, args);
};

// Export for cleanup if needed
export const restoreConsole = () => {
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
};

export default {
  init: () => {
    console.log('🔧 Console error suppression enabled for development');
  }
};
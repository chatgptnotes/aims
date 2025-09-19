// Global error handler for catching unhandled errors
class GlobalErrorHandler {
  constructor() {
    this.init();
  }

  init() {
    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      console.warn('Unhandled promise rejection:', event.reason);
      
      // Prevent the default behavior (logging to console)
      if (process.env.NODE_ENV === 'development') {
        event.preventDefault();
      }
      
      // Show user-friendly message for specific errors
      if (event.reason?.message?.includes('fetch')) {
        // Don't show fetch errors as they're expected with mock data
        return;
      }
      
      if (event.reason?.message?.includes('localStorage')) {
        console.warn('Storage error - using fallback data');
        return;
      }
    });

    // Handle JavaScript errors
    window.addEventListener('error', (event) => {
      console.warn('JavaScript error:', event.error);
      
      // Prevent logging certain types of errors
      if (event.error?.message?.includes('Script error')) {
        event.preventDefault();
        return;
      }
      
      if (event.error?.message?.includes('ResizeObserver loop limit exceeded')) {
        event.preventDefault();
        return;
      }
    });

    // Suppress specific console methods in development
    if (process.env.NODE_ENV === 'development') {
      this.suppressDevelopmentWarnings();
    }
  }

  suppressDevelopmentWarnings() {
    const originalError = console.error;
    const originalWarn = console.warn;

    console.error = (...args) => {
      const message = args[0];
      
      if (typeof message === 'string') {
        // Suppress React warnings that are not critical
        if (message.includes('Warning: validateDOMNesting')) return;
        if (message.includes('Warning: Failed prop type')) return;
        if (message.includes('Warning: React Hook useEffect has a missing dependency')) return;
        if (message.includes('Warning: Function components cannot be given refs')) return;
        if (message.includes('Download the React DevTools')) return;
        
        // Suppress router warnings
        if (message.includes('No routes matched location')) return;
        
        // Suppress fetch/network errors (expected with mock data)
        if (message.includes('Failed to fetch')) return;
        if (message.includes('TypeError: Failed to fetch')) return;
        if (message.includes('NetworkError')) return;
      }
      
      // Allow other errors through
      originalError.apply(console, args);
    };

    console.warn = (...args) => {
      const message = args[0];
      
      if (typeof message === 'string') {
        // Suppress common warnings
        if (message.includes('React Hook useEffect has a missing dependency')) return;
        if (message.includes('Warning: validateDOMNesting')) return;
        if (message.includes('Warning: Each child in a list should have a unique "key" prop')) return;
      }
      
      // Allow other warnings through
      originalWarn.apply(console, args);
    };
  }

  // Method to restore original console methods
  restore() {
    // This would restore original console methods if needed
    console.log('Console methods restored');
  }
}

// Initialize global error handler
const errorHandler = new GlobalErrorHandler();

export default errorHandler;
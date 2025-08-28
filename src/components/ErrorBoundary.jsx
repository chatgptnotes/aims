import React from 'react';
import { AlertTriangle } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error details
    console.error('🚨 React Error Boundary caught an error:', error, errorInfo);
    console.error('🚨 Error stack:', error.stack);
    console.error('🚨 Component stack:', errorInfo.componentStack);
    
    // Try to identify the specific component that crashed
    if (errorInfo.componentStack.includes('UploadReportModal')) {
      console.error('🚨 Upload modal crashed!');
    }
    
    if (errorInfo.componentStack.includes('ClinicManagement')) {
      console.error('🚨 Clinic Management component crashed!');
    }
    
    if (errorInfo.componentStack.includes('SuperAdminPanel')) {
      console.error('🚨 Super Admin Panel crashed!');
    }
    
    // Add navigation error detection
    if (error.message.includes('Cannot read properties') || 
        error.message.includes('TypeError') ||
        errorInfo.componentStack.includes('Router') ||
        errorInfo.componentStack.includes('Navigate')) {
      console.error('🚨 Navigation/Routing error detected');
    }
    
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      // Custom error UI
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            
            <h2 className="text-xl font-bold text-gray-900 text-center mb-4">
              Something went wrong
            </h2>
            
            <p className="text-gray-600 text-center mb-6">
              An unexpected error occurred. Please refresh the page and try again.
            </p>
            
            <div className="flex space-x-3">
              <button
                onClick={() => window.location.reload()}
                className="flex-1 bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 transition-colors"
              >
                Refresh Page
              </button>
              <button
                onClick={() => this.setState({ hasError: false, error: null, errorInfo: null })}
                className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors"
              >
                Try Again
              </button>
            </div>
            
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-6 bg-gray-100 rounded-md p-4">
                <summary className="cursor-pointer font-medium text-gray-700 mb-2">
                  Error Details (Development Only)
                </summary>
                <pre className="text-xs text-gray-600 overflow-auto">
                  {this.state.error && this.state.error.toString()}
                  {this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
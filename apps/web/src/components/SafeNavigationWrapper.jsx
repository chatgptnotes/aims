import React, { useState, useEffect } from 'react';

const SafeNavigationWrapper = ({ children }) => {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    // Reset error state when children change (navigation occurs)
    setHasError(false);
  }, [children]);

  const handleError = (error, errorInfo) => {
    console.error('🚨 Navigation wrapper caught error:', error);
    setHasError(true);
  };

  if (hasError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
          <div className="text-red-500 mb-4">
            ⚠️
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Navigation Error
          </h2>
          <p className="text-gray-600 mb-6">
            Something went wrong while loading this page.
          </p>
          <div className="flex space-x-3">
            <button
              onClick={() => {
                setHasError(false);
                window.location.reload();
              }}
              className="flex-1 bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 transition-colors"
            >
              Reload Page
            </button>
            <button
              onClick={() => {
                setHasError(false);
                window.history.back();
              }}
              className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  try {
    return children;
  } catch (error) {
    handleError(error);
    return null;
  }
};

export default SafeNavigationWrapper;
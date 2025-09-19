import React, { Suspense } from 'react';
import { Loader2 } from 'lucide-react';

const LazyComponentWrapper = ({ children, fallback }) => {
  const defaultFallback = (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600 mx-auto mb-4" />
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>
  );

  return (
    <Suspense fallback={fallback || defaultFallback}>
      <div className="lazy-component-wrapper">
        {children}
      </div>
    </Suspense>
  );
};

export default LazyComponentWrapper;
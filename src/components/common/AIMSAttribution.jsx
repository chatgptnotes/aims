// AIMS Attribution Component
// This component ensures "Powered by AIMS" is always displayed

import React from 'react';
import { Brain } from 'lucide-react';

const AIMSAttribution = ({
  branding = null,
  position = 'footer-right',
  className = '',
  style = {},
  showIcon = true
}) => {
  const defaultStyles = {
    fontSize: '12px',
    color: '#6B7280',
    fontFamily: 'Inter, sans-serif',
    padding: '8px',
    borderTop: '1px solid #E5E7EB',
    background: '#F9FAFB',
    userSelect: 'none',
    ...style
  };

  const positionStyles = {
    'footer-left': { textAlign: 'left' },
    'footer-center': { textAlign: 'center' },
    'footer-right': { textAlign: 'right' },
    'header-small': {
      fontSize: '10px',
      borderTop: 'none',
      borderBottom: '1px solid #E5E7EB'
    }
  };

  const combinedStyles = {
    ...defaultStyles,
    ...positionStyles[position]
  };

  // Always show attribution - this cannot be disabled
  const attributionText = branding?.poweredByText || 'Powered by AIMS';

  return (
    <div
      className={`aims-attribution ${className}`}
      style={combinedStyles}
      data-required="true"
      data-position={position}
    >
      <div className="flex items-center justify-center gap-1">
        {showIcon && (
          <Brain className="w-3 h-3 text-blue-500" />
        )}
        <span>{attributionText}</span>
      </div>

      <style jsx>{`
        .aims-attribution {
          position: relative;
          z-index: 1000;
          min-height: 24px;
          display: flex;
          align-items: center;
          justify-content: ${position.includes('left') ? 'flex-start' :
                           position.includes('center') ? 'center' : 'flex-end'};
        }

        .aims-attribution::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          pointer-events: none;
        }

        /* Prevent hiding via CSS */
        .aims-attribution,
        .aims-attribution * {
          visibility: visible !important;
          display: flex !important;
          opacity: 1 !important;
        }

        /* Print styles */
        @media print {
          .aims-attribution {
            display: flex !important;
            visibility: visible !important;
            opacity: 1 !important;
            -webkit-print-color-adjust: exact;
            color-adjust: exact;
          }
        }

        /* High contrast mode */
        @media (prefers-contrast: high) {
          .aims-attribution {
            border-color: currentColor;
            background: white;
            color: black;
          }
        }
      `}</style>
    </div>
  );
};

// HOC to wrap components with required attribution
export const withAIMSAttribution = (WrappedComponent, options = {}) => {
  const WithAttribution = (props) => {
    return (
      <div className="relative">
        <WrappedComponent {...props} />
        <AIMSAttribution
          branding={props.branding}
          position={options.position || 'footer-right'}
          showIcon={options.showIcon !== false}
          {...options}
        />
      </div>
    );
  };

  WithAttribution.displayName = `withAIMSAttribution(${WrappedComponent.displayName || WrappedComponent.name})`;
  return WithAttribution;
};

// Hook to get attribution component
export const useAIMSAttribution = (branding = null) => {
  return {
    AttributionComponent: ({ position = 'footer-right', ...props }) => (
      <AIMSAttribution
        branding={branding}
        position={position}
        {...props}
      />
    ),
    attributionText: branding?.poweredByText || 'Powered by AIMS',
    isRequired: true
  };
};

// Validation function to ensure attribution is present
export const validateAttributionPresence = (htmlContent) => {
  const hasAIMSText = htmlContent.includes('Powered by AIMS') ||
                           htmlContent.includes('AIMS') ||
                           htmlContent.includes('aims-attribution');

  const hasAttributionClass = htmlContent.includes('aims-attribution');

  return {
    isValid: hasAIMSText && hasAttributionClass,
    hasText: hasAIMSText,
    hasClass: hasAttributionClass,
    message: hasAIMSText && hasAttributionClass
      ? 'Attribution is properly present'
      : 'Required AIMS attribution is missing or incomplete'
  };
};

// Component for report footers
export const ReportFooter = ({ branding, reportData, className = '' }) => {
  return (
    <footer className={`report-footer ${className}`}>
      {/* Report metadata */}
      <div className="report-metadata text-xs text-gray-500 mb-2">
        <div className="flex justify-between items-center">
          <span>Generated: {new Date().toLocaleDateString()}</span>
          {reportData?.id && <span>Report ID: {reportData.id}</span>}
        </div>
      </div>

      {/* Required attribution */}
      <AIMSAttribution
        branding={branding}
        position="footer-center"
        className="report-attribution"
      />

      <style jsx>{`
        .report-footer {
          margin-top: 2rem;
          padding-top: 1rem;
          border-top: 2px solid #E5E7EB;
        }

        .report-metadata {
          padding: 0.5rem 0;
        }

        /* Ensure attribution is always visible */
        .report-attribution {
          margin-top: 0.5rem !important;
        }
      `}</style>
    </footer>
  );
};

export default AIMSAttribution;
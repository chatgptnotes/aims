// Branding Service - Enforces "Powered by NeuroSense" requirement
// This service ensures all reports and interfaces display required attribution

class BrandingService {
  constructor() {
    this.requiredAttribution = 'Powered by NeuroSense360';
    this.defaultPosition = 'footer-right';
    this.attributionStyles = {
      fontSize: '12px',
      color: '#6B7280',
      fontFamily: 'Inter, sans-serif',
      textAlign: 'center',
      padding: '8px',
      borderTop: '1px solid #E5E7EB'
    };
  }

  /**
   * Get branding configuration for a clinic
   */
  async getClinicBranding(clinicId) {
    try {
      // In production, fetch from Supabase
      // For now, return mock data structure
      const mockBranding = {
        clinicId,
        coBrandingEnabled: false,
        primaryLogo: null,
        secondaryLogo: null,
        logoPosition: 'header-left',
        poweredByRequired: true,
        poweredByText: this.requiredAttribution,
        poweredByPosition: this.defaultPosition,
        poweredByVisible: true,
        attributionStyles: this.attributionStyles,
        lastUpdated: new Date().toISOString()
      };

      // Check if clinic has custom branding
      const clinicData = await this.getClinicFromStorage(clinicId);
      if (clinicData?.branding) {
        return {
          ...mockBranding,
          ...clinicData.branding,
          // Always enforce these requirements
          poweredByRequired: true,
          poweredByText: this.requiredAttribution,
          poweredByVisible: true
        };
      }

      return mockBranding;
    } catch (error) {
      console.error('Error getting clinic branding:', error);
      return this.getDefaultBranding();
    }
  }

  /**
   * Get clinic data from localStorage (temporary)
   */
  async getClinicFromStorage(clinicId) {
    try {
      const clinics = JSON.parse(localStorage.getItem('clinics') || '[]');
      return clinics.find(clinic => clinic.id === clinicId);
    } catch (error) {
      console.error('Error reading clinic data:', error);
      return null;
    }
  }

  /**
   * Get default branding (no co-branding)
   */
  getDefaultBranding() {
    return {
      clinicId: null,
      coBrandingEnabled: false,
      primaryLogo: null,
      secondaryLogo: null,
      logoPosition: 'header-left',
      poweredByRequired: true,
      poweredByText: this.requiredAttribution,
      poweredByPosition: this.defaultPosition,
      poweredByVisible: true,
      attributionStyles: this.attributionStyles
    };
  }

  /**
   * Generate attribution HTML
   */
  generateAttributionHTML(branding = null) {
    const config = branding || this.getDefaultBranding();

    const styles = Object.entries(config.attributionStyles)
      .map(([key, value]) => `${this.camelToKebab(key)}: ${value}`)
      .join('; ');

    return `
      <div class="neurosense-attribution" style="${styles}">
        <span>${config.poweredByText}</span>
      </div>
    `;
  }

  /**
   * Generate attribution React component
   */
  generateAttributionComponent(branding = null) {
    const config = branding || this.getDefaultBranding();

    return {
      component: 'div',
      className: 'neurosense-attribution',
      style: config.attributionStyles,
      children: config.poweredByText
    };
  }

  /**
   * Inject attribution into report content
   */
  injectAttributionIntoReport(reportHTML, branding = null) {
    const config = branding || this.getDefaultBranding();
    const attribution = this.generateAttributionHTML(config);

    // Find appropriate injection point based on position
    switch (config.poweredByPosition) {
      case 'footer-left':
      case 'footer-center':
      case 'footer-right':
        // Inject before closing body tag
        return reportHTML.replace(
          /<\/body>/i,
          `${attribution}</body>`
        );

      case 'header-small':
        // Inject after opening body tag
        return reportHTML.replace(
          /<body[^>]*>/i,
          `$&${attribution}`
        );

      default:
        // Default to footer
        return reportHTML.replace(
          /<\/body>/i,
          `${attribution}</body>`
        );
    }
  }

  /**
   * Validate that attribution is present in content
   */
  validateAttribution(content) {
    const hasAttribution = content.includes(this.requiredAttribution) ||
                          content.includes('NeuroSense360') ||
                          content.includes('neurosense-attribution');

    return {
      isValid: hasAttribution,
      message: hasAttribution
        ? 'Attribution is present'
        : 'Required "Powered by NeuroSense360" attribution is missing'
    };
  }

  /**
   * Apply branding to report component
   */
  applyBrandingToComponent(clinicId, reportComponent) {
    return new Promise(async (resolve) => {
      try {
        const branding = await this.getClinicBranding(clinicId);

        // Clone component props
        const brandedComponent = {
          ...reportComponent,
          branding: branding,
          attribution: this.generateAttributionComponent(branding)
        };

        // Add logos if available
        if (branding.coBrandingEnabled) {
          brandedComponent.logos = {
            primary: branding.primaryLogo,
            secondary: branding.secondaryLogo,
            position: branding.logoPosition
          };
        }

        resolve(brandedComponent);
      } catch (error) {
        console.error('Error applying branding:', error);
        resolve({
          ...reportComponent,
          attribution: this.generateAttributionComponent()
        });
      }
    });
  }

  /**
   * Get branding CSS styles for injection
   */
  getBrandingCSS(branding = null) {
    const config = branding || this.getDefaultBranding();

    return `
      .neurosense-attribution {
        font-size: ${config.attributionStyles.fontSize};
        color: ${config.attributionStyles.color};
        font-family: ${config.attributionStyles.fontFamily};
        text-align: ${config.attributionStyles.textAlign};
        padding: ${config.attributionStyles.padding};
        border-top: ${config.attributionStyles.borderTop};
        background: #F9FAFB;
        position: relative;
        bottom: 0;
        width: 100%;
        box-sizing: border-box;
      }

      .neurosense-attribution::before {
        content: '';
        display: inline-block;
        width: 16px;
        height: 16px;
        background: url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTggMUMxMi40MTgzIDEgMTYgNC41ODE3MiAxNiA5QzE2IDEzLjQxODMgMTIuNDE4MyAxNyA4IDE3QzMuNTgxNzIgMTcgMCAxMy40MTgzIDAgOUMwIDQuNTgxNzIgMy41ODE3MiAxIDggMVoiIGZpbGw9IiMzQjgyRjYiLz4KPHBhdGggZD0iTTUuNSA2SDE4LjVWMTBINS41VjZaIiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4K') no-repeat center;
        margin-right: 6px;
        vertical-align: middle;
      }

      @media print {
        .neurosense-attribution {
          display: block !important;
          visibility: visible !important;
        }
      }
    `;
  }

  /**
   * Utility: Convert camelCase to kebab-case
   */
  camelToKebab(str) {
    return str.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase();
  }

  /**
   * Check if clinic is allowed to have co-branding
   */
  async isClinicAllowedCoBranding(clinicId) {
    try {
      const clinic = await this.getClinicFromStorage(clinicId);
      return clinic?.branding?.coBrandingEnabled === true;
    } catch (error) {
      console.error('Error checking co-branding permission:', error);
      return false;
    }
  }

  /**
   * Generate watermarked report
   */
  generateWatermarkedReport(reportContent, clinicId) {
    return new Promise(async (resolve) => {
      try {
        const branding = await this.getClinicBranding(clinicId);

        // Add CSS styles
        const css = this.getBrandingCSS(branding);
        const styledContent = `<style>${css}</style>${reportContent}`;

        // Inject attribution
        const watermarkedContent = this.injectAttributionIntoReport(styledContent, branding);

        // Validate attribution is present
        const validation = this.validateAttribution(watermarkedContent);

        resolve({
          content: watermarkedContent,
          branding: branding,
          validation: validation,
          watermarked: true
        });
      } catch (error) {
        console.error('Error generating watermarked report:', error);
        resolve({
          content: reportContent,
          branding: this.getDefaultBranding(),
          validation: { isValid: false, message: 'Error applying watermark' },
          watermarked: false
        });
      }
    });
  }
}

// Create and export singleton instance
const brandingService = new BrandingService();
export default brandingService;
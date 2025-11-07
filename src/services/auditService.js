// =====================================================
// Audit Service - Comprehensive Activity Logging
// =====================================================
// Handles all system-wide logging:
// - User actions (audit_logs)
// - Report downloads (download_logs)
// - Patient portal access (access_logs)
// =====================================================

import DatabaseService from './databaseService';
import { supabase } from './supabaseService';

class AuditService {
  constructor() {
    this.serviceName = 'AuditService';
  }

  // =====================================================
  // AUDIT LOGS - System-wide Activity Tracking
  // =====================================================

  /**
   * Log a user action to audit_logs table
   * @param {Object} actionData - Action details
   * @param {string} actionData.action - Action type (CREATE, UPDATE, DELETE, etc.)
   * @param {string} actionData.entityType - Entity type (clinic, patient, report, etc.)
   * @param {string} actionData.entityId - Entity ID
   * @param {Object} actionData.oldValue - Previous state (optional)
   * @param {Object} actionData.newValue - New state (optional)
   * @param {Object} actionData.changes - Specific changes (optional)
   * @param {string} actionData.description - Human-readable description
   * @param {string} actionData.severity - Severity level (info, warning, error, critical)
   * @returns {Promise<Object>} Created audit log entry
   */
  async logAction(actionData) {
    try {
      console.log('📋 Logging action:', actionData.action, actionData.entityType);

      // Get current user and session info
      const { data: { user } } = await supabase.auth.getUser();
      const userRole = user?.user_metadata?.role || 'unknown';

      // Get request metadata
      const metadata = this.getRequestMetadata();

      // Prepare audit log entry
      const auditEntry = {
        user_id: user?.id || null,
        user_email: user?.email || 'system',
        user_role: userRole,
        action: actionData.action,
        entity_type: actionData.entityType,
        entity_id: actionData.entityId || null,
        old_value: actionData.oldValue || null,
        new_value: actionData.newValue || null,
        changes: actionData.changes || null,
        description: actionData.description,
        severity: actionData.severity || 'info',
        status: actionData.status || 'success',
        ip_address: metadata.ipAddress,
        user_agent: metadata.userAgent,
        request_method: actionData.method || 'POST',
        request_url: metadata.currentUrl,
        created_at: new Date().toISOString()
      };

      // Insert into audit_logs table
      const result = await DatabaseService.add('audit_logs', auditEntry);

      console.log('✅ Action logged successfully:', result.id);
      return result;
    } catch (error) {
      console.error('❌ Error logging action:', error);
      // Don't throw error - audit failures shouldn't break the main flow
      return null;
    }
  }

  /**
   * Log clinic creation
   */
  async logClinicCreation(clinicData) {
    return this.logAction({
      action: 'CREATE',
      entityType: 'clinic',
      entityId: clinicData.id,
      newValue: clinicData,
      description: `Created new clinic: ${clinicData.name}`,
      severity: 'info'
    });
  }

  /**
   * Log clinic update
   */
  async logClinicUpdate(clinicId, oldData, newData) {
    const changes = this.calculateChanges(oldData, newData);

    return this.logAction({
      action: 'UPDATE',
      entityType: 'clinic',
      entityId: clinicId,
      oldValue: oldData,
      newValue: newData,
      changes: changes,
      description: `Updated clinic: ${newData.name}`,
      severity: 'info'
    });
  }

  /**
   * Log clinic deletion
   */
  async logClinicDeletion(clinicData) {
    return this.logAction({
      action: 'DELETE',
      entityType: 'clinic',
      entityId: clinicData.id,
      oldValue: clinicData,
      description: `Deleted clinic: ${clinicData.name}`,
      severity: 'warning'
    });
  }

  /**
   * Log patient creation
   */
  async logPatientCreation(patientData) {
    return this.logAction({
      action: 'CREATE',
      entityType: 'patient',
      entityId: patientData.id,
      newValue: patientData,
      description: `Created new patient: ${patientData.name}`,
      severity: 'info'
    });
  }

  /**
   * Log report upload
   */
  async logReportUpload(reportData) {
    return this.logAction({
      action: 'UPLOAD',
      entityType: 'report',
      entityId: reportData.id,
      newValue: {
        file_name: reportData.file_name,
        patient_id: reportData.patient_id,
        clinic_id: reportData.clinic_id
      },
      description: `Uploaded report: ${reportData.file_name}`,
      severity: 'info'
    });
  }

  /**
   * Log user login
   */
  async logLogin(user) {
    return this.logAction({
      action: 'LOGIN',
      entityType: 'user',
      entityId: user.id,
      description: `User logged in: ${user.email}`,
      severity: 'info'
    });
  }

  /**
   * Log user logout
   */
  async logLogout(user) {
    return this.logAction({
      action: 'LOGOUT',
      entityType: 'user',
      entityId: user.id,
      description: `User logged out: ${user.email}`,
      severity: 'info'
    });
  }

  /**
   * Log failed login attempt
   */
  async logFailedLogin(email, reason) {
    return this.logAction({
      action: 'LOGIN',
      entityType: 'user',
      description: `Failed login attempt for: ${email} - ${reason}`,
      severity: 'warning',
      status: 'failure'
    });
  }

  // =====================================================
  // DOWNLOAD LOGS - Report Download Tracking
  // =====================================================

  /**
   * Log report download
   * @param {Object} downloadData - Download details
   * @returns {Promise<Object>} Created download log entry
   */
  async logDownload(downloadData) {
    try {
      console.log('📥 Logging download:', downloadData.file_name);

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      const userRole = user?.user_metadata?.role || 'patient';

      // Get request metadata
      const metadata = this.getRequestMetadata();

      // Prepare download log entry
      const downloadEntry = {
        report_id: downloadData.report_id,
        patient_id: downloadData.patient_id,
        clinic_id: downloadData.clinic_id,
        downloaded_by: user?.id || null,
        downloader_role: userRole,
        downloader_email: user?.email || 'unknown',
        consent_accepted: downloadData.consent_accepted || false,
        consent_version: downloadData.consent_version || null,
        consent_timestamp: downloadData.consent_timestamp || null,
        consent_id: downloadData.consent_id || null,
        file_name: downloadData.file_name,
        file_path: downloadData.file_path,
        file_size: downloadData.file_size || null,
        download_method: downloadData.download_method || 'direct',
        ip_address: metadata.ipAddress,
        user_agent: metadata.userAgent,
        device_type: this.detectDeviceType(metadata.userAgent),
        browser: this.detectBrowser(metadata.userAgent),
        download_status: 'completed',
        hipaa_compliant: true,
        encrypted: true,
        watermarked: downloadData.watermarked !== false, // Default true
        initiated_at: new Date().toISOString(),
        completed_at: new Date().toISOString()
      };

      // Insert into download_logs table
      const result = await DatabaseService.add('download_logs', downloadEntry);

      console.log('✅ Download logged successfully:', result.id);

      // Also log to main audit log
      await this.logAction({
        action: 'DOWNLOAD',
        entityType: 'report',
        entityId: downloadData.report_id,
        description: `Downloaded report: ${downloadData.file_name}`,
        severity: 'info'
      });

      return result;
    } catch (error) {
      console.error('❌ Error logging download:', error);
      return null;
    }
  }

  /**
   * Log failed download attempt
   */
  async logFailedDownload(reportId, reason) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const metadata = this.getRequestMetadata();

      const downloadEntry = {
        report_id: reportId,
        downloaded_by: user?.id || null,
        downloader_email: user?.email || 'unknown',
        download_status: 'failed',
        error_message: reason,
        ip_address: metadata.ipAddress,
        user_agent: metadata.userAgent,
        initiated_at: new Date().toISOString()
      };

      await DatabaseService.add('download_logs', downloadEntry);

      await this.logAction({
        action: 'DOWNLOAD',
        entityType: 'report',
        entityId: reportId,
        description: `Failed download attempt: ${reason}`,
        severity: 'error',
        status: 'failure'
      });
    } catch (error) {
      console.error('❌ Error logging failed download:', error);
    }
  }

  // =====================================================
  // ACCESS LOGS - Patient Portal Access Tracking
  // =====================================================

  /**
   * Log patient portal access
   * @param {Object} accessData - Access details
   * @returns {Promise<Object>} Created access log entry
   */
  async logAccess(accessData) {
    try {
      console.log('🔍 Logging access:', accessData.action);

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();

      // Get request metadata
      const metadata = this.getRequestMetadata();

      // Prepare access log entry
      const accessEntry = {
        user_id: user?.id || null,
        patient_id: accessData.patient_id || null,
        user_email: user?.email || 'unknown',
        user_role: 'patient',
        action: accessData.action,
        resource_type: accessData.resource_type || null,
        resource_id: accessData.resource_id || null,
        resource_name: accessData.resource_name || null,
        session_id: this.getSessionId(),
        ip_address: metadata.ipAddress,
        user_agent: metadata.userAgent,
        device_type: this.detectDeviceType(metadata.userAgent),
        browser: this.detectBrowser(metadata.userAgent),
        operating_system: this.detectOS(metadata.userAgent),
        access_granted: accessData.access_granted !== false, // Default true
        denial_reason: accessData.denial_reason || null,
        mfa_verified: accessData.mfa_verified || false,
        suspicious_activity: false,
        risk_score: 0,
        accessed_at: new Date().toISOString()
      };

      // Insert into access_logs table
      const result = await DatabaseService.add('access_logs', accessEntry);

      console.log('✅ Access logged successfully:', result.id);
      return result;
    } catch (error) {
      console.error('❌ Error logging access:', error);
      return null;
    }
  }

  /**
   * Log patient dashboard view
   */
  async logDashboardView(patientId) {
    return this.logAccess({
      patient_id: patientId,
      action: 'VIEW_DASHBOARD',
      resource_type: 'dashboard'
    });
  }

  /**
   * Log report view
   */
  async logReportView(patientId, reportId, reportName) {
    return this.logAccess({
      patient_id: patientId,
      action: 'VIEW_REPORT',
      resource_type: 'report',
      resource_id: reportId,
      resource_name: reportName
    });
  }

  /**
   * Log profile update
   */
  async logProfileUpdate(patientId) {
    return this.logAccess({
      patient_id: patientId,
      action: 'UPDATE_PROFILE',
      resource_type: 'profile'
    });
  }

  // =====================================================
  // QUERY METHODS - Retrieve Audit Data
  // =====================================================

  /**
   * Get audit logs with filtering
   */
  async getAuditLogs(filters = {}) {
    try {
      let query = supabase.from('audit_logs').select('*');

      // Apply filters
      if (filters.userId) {
        query = query.eq('user_id', filters.userId);
      }
      if (filters.action) {
        query = query.eq('action', filters.action);
      }
      if (filters.entityType) {
        query = query.eq('entity_type', filters.entityType);
      }
      if (filters.severity) {
        query = query.eq('severity', filters.severity);
      }
      if (filters.startDate) {
        query = query.gte('created_at', filters.startDate);
      }
      if (filters.endDate) {
        query = query.lte('created_at', filters.endDate);
      }

      // Apply pagination
      const limit = filters.limit || 100;
      const offset = filters.offset || 0;
      query = query.range(offset, offset + limit - 1);

      // Order by created_at descending
      query = query.order('created_at', { ascending: false });

      const { data, error } = await query;

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('❌ Error fetching audit logs:', error);
      throw error;
    }
  }

  /**
   * Get download logs for a clinic
   */
  async getDownloadLogs(clinicId, filters = {}) {
    try {
      let query = supabase.from('download_logs').select('*').eq('clinic_id', clinicId);

      if (filters.patientId) {
        query = query.eq('patient_id', filters.patientId);
      }
      if (filters.reportId) {
        query = query.eq('report_id', filters.reportId);
      }
      if (filters.startDate) {
        query = query.gte('initiated_at', filters.startDate);
      }
      if (filters.endDate) {
        query = query.lte('initiated_at', filters.endDate);
      }

      query = query.order('initiated_at', { ascending: false });
      query = query.limit(filters.limit || 100);

      const { data, error } = await query;

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('❌ Error fetching download logs:', error);
      throw error;
    }
  }

  /**
   * Get access logs for a patient
   */
  async getAccessLogs(patientId, filters = {}) {
    try {
      let query = supabase.from('access_logs').select('*').eq('patient_id', patientId);

      if (filters.action) {
        query = query.eq('action', filters.action);
      }
      if (filters.startDate) {
        query = query.gte('accessed_at', filters.startDate);
      }

      query = query.order('accessed_at', { ascending: false });
      query = query.limit(filters.limit || 50);

      const { data, error } = await query;

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('❌ Error fetching access logs:', error);
      throw error;
    }
  }

  /**
   * Export audit logs to CSV
   */
  async exportAuditLogs(filters = {}, format = 'csv') {
    try {
      const logs = await this.getAuditLogs({ ...filters, limit: 10000 });

      if (format === 'csv') {
        return this.convertToCSV(logs);
      } else if (format === 'json') {
        return JSON.stringify(logs, null, 2);
      }

      throw new Error('Unsupported export format');
    } catch (error) {
      console.error('❌ Error exporting audit logs:', error);
      throw error;
    }
  }

  // =====================================================
  // UTILITY METHODS
  // =====================================================

  /**
   * Get request metadata
   */
  getRequestMetadata() {
    return {
      ipAddress: this.getClientIP(),
      userAgent: navigator.userAgent,
      currentUrl: window.location.href
    };
  }

  /**
   * Get client IP address (best effort)
   */
  getClientIP() {
    // In browser, we can't directly get client IP
    // This would need to be implemented on the server side
    return 'client-side-unknown';
  }

  /**
   * Get or create session ID
   */
  getSessionId() {
    let sessionId = sessionStorage.getItem('audit_session_id');
    if (!sessionId) {
      sessionId = this.generateSessionId();
      sessionStorage.setItem('audit_session_id', sessionId);
    }
    return sessionId;
  }

  /**
   * Generate unique session ID
   */
  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Detect device type from user agent
   */
  detectDeviceType(userAgent) {
    const ua = userAgent.toLowerCase();
    if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
      return 'tablet';
    }
    if (/Mobile|iP(hone|od)|Android|BlackBerry|IEMobile|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
      return 'mobile';
    }
    return 'desktop';
  }

  /**
   * Detect browser from user agent
   */
  detectBrowser(userAgent) {
    const ua = userAgent.toLowerCase();
    if (ua.includes('chrome') && !ua.includes('edge')) return 'Chrome';
    if (ua.includes('safari') && !ua.includes('chrome')) return 'Safari';
    if (ua.includes('firefox')) return 'Firefox';
    if (ua.includes('edge')) return 'Edge';
    if (ua.includes('opera') || ua.includes('opr')) return 'Opera';
    if (ua.includes('msie') || ua.includes('trident')) return 'Internet Explorer';
    return 'Unknown';
  }

  /**
   * Detect operating system from user agent
   */
  detectOS(userAgent) {
    const ua = userAgent.toLowerCase();
    if (ua.includes('windows')) return 'Windows';
    if (ua.includes('mac')) return 'macOS';
    if (ua.includes('linux')) return 'Linux';
    if (ua.includes('android')) return 'Android';
    if (ua.includes('ios') || ua.includes('iphone') || ua.includes('ipad')) return 'iOS';
    return 'Unknown';
  }

  /**
   * Calculate changes between old and new values
   */
  calculateChanges(oldValue, newValue) {
    const changes = {};
    const allKeys = new Set([...Object.keys(oldValue || {}), ...Object.keys(newValue || {})]);

    allKeys.forEach(key => {
      const oldVal = oldValue?.[key];
      const newVal = newValue?.[key];

      if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
        changes[key] = {
          old: oldVal,
          new: newVal
        };
      }
    });

    return changes;
  }

  /**
   * Convert data to CSV format
   */
  convertToCSV(data) {
    if (!data || data.length === 0) return '';

    const headers = Object.keys(data[0]);
    const csvRows = [];

    // Add headers
    csvRows.push(headers.join(','));

    // Add data rows
    for (const row of data) {
      const values = headers.map(header => {
        const value = row[header];
        const escaped = ('' + value).replace(/"/g, '\\"');
        return `"${escaped}"`;
      });
      csvRows.push(values.join(','));
    }

    return csvRows.join('\n');
  }
}

// Export singleton instance
const auditService = new AuditService();
export default auditService;

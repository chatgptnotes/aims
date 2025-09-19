import { v4 as uuidv4 } from 'uuid';
import SupabaseService from './supabaseService';

// Enhanced database service - uses Supabase only, no localStorage fallback
class DatabaseService {
  constructor() {
    this.useSupabase = true;
    this.supabaseService = SupabaseService;
    this.checkSupabaseAvailability();
  }

  async checkSupabaseAvailability() {
    try {
      console.log('🔧 Checking Supabase availability...');

      // Test Supabase connection with clinics table (which we know exists)
      const testResult = await this.supabaseService.get('clinics');
      if (testResult !== undefined) {
        this.useSupabase = true;
        console.log('🚀 Using Supabase for data storage');
      } else {
        throw new Error('Supabase connection failed');
      }
    } catch (error) {
      console.error('❌ Supabase connection failed:', error);
      throw new Error('Database connection required. Please check your internet connection and try again.');
    }
  }

  // Map legacy table names to Supabase schema
  mapTableName(table) {
    const tableMapping = {
      'clinics': 'clinics',              // Use existing clinics table
      'superAdmins': 'profiles',
      'patients': 'patients',
      'reports': 'eeg_reports',
      'subscriptions': 'subscriptions',
      'payments': 'payment_history',
      'usage': 'organizations',          // Temporary mapping to existing table
      'alerts': 'organizations'          // Temporary mapping to existing table
    };

    return tableMapping[table] || table;
  }

  // Generic CRUD operations
  async get(table) {
    try {
      const actualTable = this.mapTableName(table);
      const data = await this.supabaseService.get(actualTable);
      console.log(`📊 ${table} from Supabase (${actualTable}):`, data?.length || 0, 'items');

      // Transform data based on table type
      if (table === 'clinics' && actualTable === 'clinics') {
        // Transform clinics data to camelCase format
        return (data || []).map(clinic => ({
          id: clinic.id,
          name: clinic.name,
          email: clinic.email,
          phone: clinic.phone,
          address: clinic.address,
          logoUrl: clinic.logo_url,
          isActive: clinic.is_active,
          reportsUsed: clinic.reports_used,
          reportsAllowed: clinic.reports_allowed,
          subscriptionStatus: clinic.subscription_status,
          subscriptionTier: clinic.subscription_tier,
          trialStartDate: clinic.trial_start_date,
          trialEndDate: clinic.trial_end_date,
          createdAt: clinic.created_at,
          updatedAt: clinic.updated_at
        }));
      }

      return this.convertToCamelCase(data || []);
    } catch (error) {
      console.error(`❌ Failed to get data from ${table}:`, error);
      throw error;
    }
  }

  async add(table, item) {
    try {
      const actualTable = this.mapTableName(table);

      // Handle clinic creation specially
      if (table === 'clinics') {
        return await this.createClinic(item);
      }

      // Ensure item has an ID
      if (!item.id) {
        item.id = uuidv4();
      }

      // Filter valid fields based on table
      const filteredItem = this.filterValidFields(actualTable, item);

      // Convert field names to snake_case for Supabase
      const supabaseItem = this.convertToSnakeCase(filteredItem);
      const result = await this.supabaseService.add(actualTable, supabaseItem);
      console.log(`📊 Added to Supabase ${table}:`, item.name || item.id);

      return this.convertToCamelCase(result);
    } catch (error) {
      console.error(`❌ Failed to add to ${table}:`, error);
      throw error;
    }
  }

  // Filter valid fields for each table
  filterValidFields(table, item) {
    const validFields = {
      'clinics': [
        'id', 'name', 'email', 'phone', 'address', 'logo_url', 'is_active',
        'reports_used', 'reports_allowed', 'subscription_status', 'subscription_tier',
        'trial_start_date', 'trial_end_date', 'created_at', 'updated_at',
        'password', 'adminPassword' // ADDED: Allow password fields for authentication
      ],
      'profiles': [
        'id', 'role', 'full_name', 'phone', 'avatar_url', 'created_at', 'updated_at'
      ],
      'org_memberships': [
        'org_id', 'user_id', 'role', 'created_at'
      ],
      'patients': [
        'id', 'org_id', 'owner_user', 'external_id', 'full_name', 'date_of_birth',
        'gender', 'phone', 'email', 'address', 'medical_history', 'improvement_focus',
        'brain_fitness_score', 'created_at', 'updated_at'
      ]
    };

    const allowedFields = validFields[table];
    if (!allowedFields) {
      return item; // No filtering if table not defined
    }

    const filteredItem = {};
    for (const [key, value] of Object.entries(item)) {
      const snakeKey = this.toSnakeCase(key);
      if (allowedFields.includes(snakeKey) || allowedFields.includes(key)) {
        filteredItem[key] = value;
      } else {
        console.log(`🚫 Filtering out invalid field for ${table}: ${key}`);
      }
    }

    return filteredItem;
  }

  async update(table, id, updates) {
    try {
      const actualTable = this.mapTableName(table);

      // Filter valid fields based on table
      const filteredUpdates = this.filterValidFields(actualTable, updates);

      const supabaseUpdates = this.convertToSnakeCase(filteredUpdates);
      const result = await this.supabaseService.update(actualTable, id, supabaseUpdates);
      console.log(`📊 Updated in Supabase ${table}:`, id);

      return this.convertToCamelCase(result);
    } catch (error) {
      console.error(`❌ Failed to update ${table}:`, error);
      throw error;
    }
  }

  async delete(table, id) {
    console.log(`🗑️ DatabaseService.delete called:`, { table, id });

    if (!id) {
      throw new Error('Cannot delete: ID is required');
    }

    try {
      const actualTable = this.mapTableName(table);
      const result = await this.supabaseService.delete(actualTable, id);
      console.log('✅ Supabase delete successful:', result);
      return result;
    } catch (error) {
      console.error(`❌ Failed to delete from ${table}:`, error);
      throw error;
    }
  }

  async findById(table, id) {
    try {
      const actualTable = this.mapTableName(table);
      const result = await this.supabaseService.findById(actualTable, id);
      return this.convertToCamelCase(result);
    } catch (error) {
      console.error(`❌ Failed to find by ID in ${table}:`, error);
      throw error;
    }
  }

  async findBy(table, field, value) {
    try {
      const actualTable = this.mapTableName(table);
      const snakeField = this.toSnakeCase(field);
      const results = await this.supabaseService.findBy(actualTable, snakeField, value);
      return results.map(item => this.convertToCamelCase(item));
    } catch (error) {
      console.error(`❌ Failed to find by ${field} in ${table}:`, error);
      throw error;
    }
  }

  async findOne(table, field, value) {
    try {
      const actualTable = this.mapTableName(table);
      const snakeField = this.toSnakeCase(field);
      const result = await this.supabaseService.findOne(actualTable, snakeField, value);
      return this.convertToCamelCase(result);
    } catch (error) {
      console.error(`❌ Failed to find one in ${table}:`, error);
      throw error;
    }
  }

  // Convert between camelCase and snake_case
  toSnakeCase(str) {
    return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
  }

  toCamelCase(str) {
    return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
  }

  convertToSnakeCase(obj) {
    if (!obj || typeof obj !== 'object') return obj;
    if (Array.isArray(obj)) return obj.map(item => this.convertToSnakeCase(item));

    const converted = {};
    for (const [key, value] of Object.entries(obj)) {
      const snakeKey = this.toSnakeCase(key);
      converted[snakeKey] = value;
    }
    return converted;
  }

  convertToCamelCase(obj) {
    if (!obj || typeof obj !== 'object') return obj;
    if (Array.isArray(obj)) return obj.map(item => this.convertToCamelCase(item));

    const converted = {};
    for (const [key, value] of Object.entries(obj)) {
      const camelKey = this.toCamelCase(key);
      converted[camelKey] = value;
    }
    return converted;
  }

  // Super Admin specific methods
  async authenticateAdmin(email, password) {
    // Check localStorage for super admin (development mode)
    const superAdmins = await this.get('superAdmins');
    const admin = superAdmins.find(a => a.email === email);
    if (admin && admin.password === password && admin.isActive) {
      return { ...admin, password: undefined };
    }

    // Try Supabase authentication
    if (this.useSupabase) {
      try {
        const result = await this.supabaseService.signIn(email, password);
        if (result?.user) {
          return {
            id: result.user.id,
            email: result.user.email,
            role: result.user.user_metadata?.role || 'user',
            name: result.user.user_metadata?.name || 'User'
          };
        }
      } catch (error) {
        console.error('Supabase auth failed:', error);
      }
    }

    return null;
  }

  // Clinic specific methods
  async createClinic(clinicData) {
    try {
      console.log('🏥 Creating clinic with data:', clinicData);

      // Create clinic record matching the exact schema
      // Preserve the data passed from authService (including pending approval status)
      const clinicRecord = {
        name: clinicData.name || clinicData.clinicName,
        email: clinicData.email,
        phone: clinicData.phone || '',
        address: clinicData.address || '',
        logo_url: clinicData.logo_url || clinicData.logoUrl || null,
        is_active: clinicData.is_active !== undefined ? clinicData.is_active : true,
        reports_used: clinicData.reports_used || 0,
        reports_allowed: clinicData.reports_allowed || parseInt(clinicData.reportsAllowed) || 10,
        subscription_status: clinicData.subscription_status || 'trial',
        subscription_tier: clinicData.subscription_tier || 'free',
        trial_start_date: clinicData.trial_start_date || new Date().toISOString(),
        trial_end_date: clinicData.trial_end_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        created_at: clinicData.created_at || new Date().toISOString(),
        updated_at: clinicData.updated_at || new Date().toISOString()
      };

      console.log('📋 Clinic data to create:', clinicRecord);

      // Use direct Supabase insert to clinics table
      const { data: clinic, error } = await this.supabaseService.supabase
        .from('clinics')
        .insert(clinicRecord)
        .select()
        .single();

      if (error) {
        console.error('❌ Supabase insert error:', error);
        throw error;
      }

      console.log('✅ Clinic created:', clinic);

      // Return in camelCase format for consistency
      return {
        id: clinic.id,
        name: clinic.name,
        email: clinic.email,
        phone: clinic.phone,
        address: clinic.address,
        logoUrl: clinic.logo_url,
        contactPerson: clinicData.contactPerson,
        isActive: clinic.is_active,
        reportsUsed: clinic.reports_used,
        reportsAllowed: clinic.reports_allowed,
        subscriptionStatus: clinic.subscription_status,
        subscriptionTier: clinic.subscription_tier,
        trialStartDate: clinic.trial_start_date,
        trialEndDate: clinic.trial_end_date,
        createdAt: clinic.created_at,
        updatedAt: clinic.updated_at,
        adminPassword: clinicData.adminPassword // Keep for compatibility
      };

    } catch (error) {
      console.error('❌ Failed to create clinic:', error);
      throw error;
    }
  }

  async getClinicUsage(clinicId) {
    const usage = await this.findBy('usage', 'clinicId', clinicId);
    const reports = await this.findBy('reports', 'clinicId', clinicId);

    return {
      totalReports: reports.length,
      reportsThisMonth: reports.filter(r => {
        const reportDate = new Date(r.createdAt);
        const now = new Date();
        return reportDate.getMonth() === now.getMonth() && reportDate.getFullYear() === now.getFullYear();
      }).length,
      usage: usage
    };
  }

  // Patient specific methods
  async getPatientsByClinic(clinicId) {
    return await this.findBy('patients', 'clinicId', clinicId);
  }

  // Reports specific methods
  async getReportsByClinic(clinicId) {
    try {
      if (!clinicId) {
        console.warn('⚠️ getReportsByClinic: No clinicId provided');
        return [];
      }

      const reports = await this.findBy('reports', 'clinicId', clinicId);
      console.log(`📋 Found ${reports?.length || 0} reports for clinic ${clinicId}`);
      return reports || [];
    } catch (error) {
      console.error(`❌ Error getting reports for clinic ${clinicId}:`, error);
      return [];
    }
  }

  async getReportsByPatient(patientId) {
    try {
      if (!patientId) {
        console.warn('⚠️ getReportsByPatient: No patientId provided');
        return [];
      }

      const reports = await this.findBy('reports', 'patientId', patientId);
      console.log(`📋 Found ${reports?.length || 0} reports for patient ${patientId}`);
      return reports || [];
    } catch (error) {
      console.error(`❌ Error getting reports for patient ${patientId}:`, error);
      return [];
    }
  }

  async addReport(reportData) {
    const report = await this.add('reports', reportData);

    // Update clinic usage
    const clinic = await this.findById('clinics', reportData.clinicId);
    if (clinic) {
      await this.update('clinics', clinic.id, {
        reportsUsed: (clinic.reportsUsed || 0) + 1
      });
    }

    // Track usage
    await this.add('usage', {
      clinicId: reportData.clinicId,
      patientId: reportData.patientId,
      reportId: report.id,
      action: 'report_created',
      timestamp: new Date().toISOString()
    });

    return report;
  }

  // Analytics methods
  async getAnalytics() {
    const clinics = await this.get('clinics');
    const reports = await this.get('reports');
    const patients = await this.get('patients');

    const activeClinicCount = clinics.filter(c => c.isActive || c.is_active).length;
    const totalReportsCount = reports.length;
    const totalPatientsCount = patients.length;

    const revenueData = await Promise.all(clinics.map(async (clinic) => {
      const subscription = await this.findOne('subscriptions', 'clinicId', clinic.id);
      return subscription && subscription.amount ? subscription.amount : 0;
    }));

    const totalRevenue = revenueData.reduce((acc, amount) => acc + amount, 0);
    const usage = await this.get('usage');

    return {
      activeClinics: activeClinicCount,
      totalReports: totalReportsCount,
      totalPatients: totalPatientsCount,
      monthlyRevenue: totalRevenue,
      recentActivity: usage.slice(-10).reverse()
    };
  }

  // Force refresh data connection
  async refreshConnection() {
    console.log('🔄 Refreshing database connection...');
    await this.checkSupabaseAvailability();
  }
}

export default new DatabaseService();
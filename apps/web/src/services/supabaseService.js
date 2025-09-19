import { createClient } from '@supabase/supabase-js';

// Get Supabase environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storageKey: 'neuro360-auth',
  },
  global: {
    headers: {
      'x-application-name': 'neuro360-web',
      'Authorization': `Bearer ${supabaseAnonKey}`, // Ensure anon key is used
    },
  },
  db: {
    schema: 'public',
  },
});

class SupabaseService {
  constructor() {
    this.supabase = supabase;
    this.testConnection();
    this.initializeTables();
  }

  async testConnection() {
    try {
      console.log('🔌 Testing Supabase connection...');
      console.log('🔗 Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
      console.log('🔑 Anon Key (first 20 chars):', import.meta.env.VITE_SUPABASE_ANON_KEY?.substring(0, 20) + '...');

      // Test basic connection
      const { data, error } = await this.supabase
        .from('_supabase_metadata')
        .select('*')
        .limit(1);

      if (error) {
        console.log('⚠️ Metadata table test failed (expected):', error.message);
      } else {
        console.log('✅ Supabase connection test successful');
      }
    } catch (error) {
      console.error('❌ Supabase connection test failed:', error);
    }
  }

  async ensureTableExists(tableName) {
    try {
      // Quick check if table exists
      const { error } = await this.supabase.from(tableName).select('id').limit(0);
      if (!error) {
        return true; // Table exists
      }

      if (error.code === 'PGRST106' || error.message.includes('does not exist')) {
        console.log(`🔧 Table ${tableName} doesn't exist, creating...`);
        await this.createTable(tableName);
        return true;
      }

      return false;
    } catch (error) {
      console.error(`❌ Error checking table ${tableName}:`, error);
      return false;
    }
  }

  async createTable(tableName) {
    const schemas = {
      clinics: `
        CREATE TABLE clinics (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255),
          phone VARCHAR(20),
          address TEXT,
          logo_url TEXT,
          is_active BOOLEAN DEFAULT true,
          reports_used INTEGER DEFAULT 0,
          reports_allowed INTEGER DEFAULT 10,
          subscription_status VARCHAR(50) DEFAULT 'trial',
          subscription_tier VARCHAR(50) DEFAULT 'free',
          trial_start_date TIMESTAMPTZ DEFAULT NOW(),
          trial_end_date TIMESTAMPTZ DEFAULT NOW() + INTERVAL '30 days',
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );
        ALTER TABLE clinics ENABLE ROW LEVEL SECURITY;
        CREATE POLICY "Allow all" ON clinics FOR ALL USING (true);
      `,
      patients: `
        CREATE TABLE patients (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          clinic_id UUID,
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255),
          phone VARCHAR(20),
          date_of_birth DATE,
          gender VARCHAR(20),
          medical_history JSONB DEFAULT '{}',
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );
        ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
        CREATE POLICY "Allow all" ON patients FOR ALL USING (true);
      `,
      reports: `
        CREATE TABLE reports (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          clinic_id UUID,
          patient_id UUID,
          file_name VARCHAR(255),
          file_path TEXT,
          report_data JSONB DEFAULT '{}',
          status VARCHAR(50) DEFAULT 'pending',
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );
        ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
        CREATE POLICY "Allow all" ON reports FOR ALL USING (true);
      `
    };

    const schema = schemas[tableName];
    if (!schema) {
      console.log(`⚠️ No schema defined for table: ${tableName}`);
      return;
    }

    try {
      console.log(`🔧 Creating table: ${tableName}`);
      // Note: This won't work with standard Supabase client, but we'll log the schema
      console.log(`📝 SQL Schema for ${tableName}:`, schema);
      console.log(`⚠️ Please run this SQL in Supabase Dashboard > SQL Editor`);
    } catch (error) {
      console.error(`❌ Failed to create table ${tableName}:`, error);
    }
  }

  async initializeTables() {
    try {
      console.log('🚀 Initializing Supabase tables...');

      // Check only existing tables from our schema
      const existingTables = ['clinics', 'patients', 'profiles', 'organizations', 'org_memberships', 'eeg_reports', 'subscriptions'];

      for (const table of existingTables) {
        try {
          const { data, error } = await this.supabase.from(table).select('id').limit(1);
          if (error) {
            console.log(`⚠️ Table ${table} error:`, error.code, error.message);
          } else {
            console.log(`✅ Table ${table} is accessible - found ${data?.length || 0} records`);
          }
        } catch (tableError) {
          console.log(`⚠️ Table ${table} check failed:`, tableError.message);
        }
      }
    } catch (error) {
      console.error('❌ Error initializing Supabase tables:', error);
    }
  }

  // Generic CRUD operations
  async get(table) {
    try {
      console.log(`📊 Fetching data from Supabase table: ${table}`);
      const { data, error } = await this.supabase
        .from(table)
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error(`❌ Error fetching from ${table}:`, error);
        return [];
      }

      console.log(`✅ Fetched ${data?.length || 0} items from ${table}`);
      return data || [];
    } catch (error) {
      console.error(`❌ Error in get operation for ${table}:`, error);
      return [];
    }
  }

  async add(table, item) {
    try {
      console.log(`➕ Adding item to Supabase table: ${table}`, item);

      // Remove any undefined fields
      const cleanedItem = Object.fromEntries(
        Object.entries(item).filter(([_, v]) => v !== undefined)
      );

      console.log(`🔧 Cleaned item for ${table}:`, cleanedItem);

      // First try to create table if it doesn't exist
      await this.ensureTableExists(table);

      const { data, error } = await this.supabase
        .from(table)
        .insert(cleanedItem)
        .select()
        .single();

      if (error) {
        console.error(`❌ Error adding to ${table}:`, error);
        console.error(`❌ Error code:`, error.code);
        console.error(`❌ Error message:`, error.message);
        console.error(`❌ Error details:`, error.details);
        console.error(`❌ Error hint:`, error.hint);

        // If table doesn't exist, try to create it
        if (error.code === 'PGRST106' || error.message.includes('does not exist')) {
          console.log(`🔧 Attempting to create table: ${table}`);
          await this.createTable(table);
          // Retry the insert
          const { data: retryData, error: retryError } = await this.supabase
            .from(table)
            .insert(cleanedItem)
            .select()
            .single();

          if (retryError) {
            throw retryError;
          }

          console.log(`✅ Successfully added to ${table} after creating table:`, retryData);
          return retryData;
        }

        throw error;
      }

      console.log(`✅ Successfully added to ${table}:`, data);
      return data;
    } catch (error) {
      console.error(`❌ Error in add operation for ${table}:`, error);
      console.error(`❌ Full error object:`, JSON.stringify(error, null, 2));
      throw error;
    }
  }

  async update(table, id, updates) {
    try {
      console.log(`📝 Updating item in Supabase table: ${table}`, { id, updates });

      // Remove any undefined fields
      const cleanedUpdates = Object.fromEntries(
        Object.entries(updates).filter(([_, v]) => v !== undefined)
      );

      const { data, error } = await this.supabase
        .from(table)
        .update({
          ...cleanedUpdates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error(`❌ Error updating ${table}:`, error);
        throw error;
      }

      console.log(`✅ Successfully updated ${table}:`, data);
      return data;
    } catch (error) {
      console.error(`❌ Error in update operation for ${table}:`, error);
      throw error;
    }
  }

  async delete(table, id) {
    try {
      console.log(`🗑️ Deleting item from Supabase table: ${table}`, { id });

      const { error } = await this.supabase
        .from(table)
        .delete()
        .eq('id', id);

      if (error) {
        console.error(`❌ Error deleting from ${table}:`, error);
        throw error;
      }

      console.log(`✅ Successfully deleted from ${table}`);
      return true;
    } catch (error) {
      console.error(`❌ Error in delete operation for ${table}:`, error);
      throw error;
    }
  }

  async findById(table, id) {
    try {
      const { data, error } = await this.supabase
        .from(table)
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error(`❌ Error finding by ID in ${table}:`, error);
        return null;
      }

      return data;
    } catch (error) {
      console.error(`❌ Error in findById for ${table}:`, error);
      return null;
    }
  }

  async findBy(table, field, value) {
    try {
      const { data, error } = await this.supabase
        .from(table)
        .select('*')
        .eq(field, value);

      if (error) {
        console.error(`❌ Error finding by ${field} in ${table}:`, error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error(`❌ Error in findBy for ${table}:`, error);
      return [];
    }
  }

  async findOne(table, field, value) {
    try {
      const { data, error } = await this.supabase
        .from(table)
        .select('*')
        .eq(field, value)
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
        console.error(`❌ Error finding one by ${field} in ${table}:`, error);
        return null;
      }

      return data;
    } catch (error) {
      console.error(`❌ Error in findOne for ${table}:`, error);
      return null;
    }
  }

  // Clinic specific methods
  async createClinic(clinicData) {
    const clinic = {
      ...clinicData,
      is_active: true,
      reports_used: 0,
      reports_allowed: 10, // Default trial: 10 reports
      subscription_status: 'trial',
      trial_start_date: new Date().toISOString(),
      trial_end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days trial
      created_at: new Date().toISOString()
    };

    return await this.add('clinics', clinic);
  }

  async getClinicUsage(clinicId) {
    const usage = await this.findBy('usage', 'clinic_id', clinicId);
    const reports = await this.findBy('reports', 'clinic_id', clinicId);

    return {
      totalReports: reports.length,
      reportsThisMonth: reports.filter(r => {
        const reportDate = new Date(r.created_at);
        const now = new Date();
        return reportDate.getMonth() === now.getMonth() && reportDate.getFullYear() === now.getFullYear();
      }).length,
      usage: usage
    };
  }

  // Patient specific methods
  async getPatientsByClinic(clinicId) {
    return await this.findBy('patients', 'clinic_id', clinicId);
  }

  // Reports specific methods
  async getReportsByClinic(clinicId) {
    return await this.findBy('reports', 'clinic_id', clinicId);
  }

  async getReportsByPatient(patientId) {
    return await this.findBy('reports', 'patient_id', patientId);
  }

  async addReport(reportData) {
    const report = await this.add('reports', {
      ...reportData,
      created_at: new Date().toISOString()
    });

    // Update clinic usage
    const clinic = await this.findById('clinics', reportData.clinic_id);
    if (clinic) {
      await this.update('clinics', clinic.id, {
        reports_used: (clinic.reports_used || 0) + 1
      });
    }

    // Track usage
    await this.add('usage', {
      clinic_id: reportData.clinic_id,
      patient_id: reportData.patient_id,
      report_id: report.id,
      action: 'report_created',
      timestamp: new Date().toISOString()
    });

    return report;
  }

  // Subscription methods
  async updateSubscription(clinicId, subscriptionData) {
    let subscription = await this.findOne('subscriptions', 'clinic_id', clinicId);

    if (subscription) {
      subscription = await this.update('subscriptions', subscription.id, subscriptionData);
    } else {
      subscription = await this.add('subscriptions', {
        ...subscriptionData,
        clinic_id: clinicId,
        created_at: new Date().toISOString()
      });
    }

    // Update clinic's report allowance
    if (subscriptionData.reports_allowed) {
      const clinic = await this.findById('clinics', clinicId);
      if (clinic) {
        await this.update('clinics', clinicId, {
          reports_allowed: clinic.reports_allowed + subscriptionData.reports_allowed,
          subscription_status: 'active'
        });
      }
    }

    return subscription;
  }

  async getSubscription(clinicId) {
    return await this.findOne('subscriptions', 'clinic_id', clinicId);
  }

  // Analytics methods
  async getAnalytics() {
    const clinics = await this.get('clinics');
    const reports = await this.get('reports');
    const patients = await this.get('patients');

    const activeClinicCount = clinics.filter(c => c.is_active).length;
    const totalReportsCount = reports.length;
    const totalPatientsCount = patients.length;

    const revenueData = await Promise.all(clinics.map(async (clinic) => {
      const subscription = await this.findOne('subscriptions', 'clinic_id', clinic.id);
      return subscription && subscription.amount ? subscription.amount : 0;
    }));

    const totalRevenue = revenueData.reduce((acc, amount) => acc + amount, 0);
    const usage = await this.get('usage');

    return {
      activeClinics: activeClinicCount,
      totalReports: totalReportsCount,
      totalPatients: totalPatientsCount,
      monthlyRevenue: totalRevenue,
      recentActivity: usage.slice(0, 10)
    };
  }

  // Auth methods
  async signUp(email, password, userData = {}) {
    try {
      const { data, error } = await this.supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData
        }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('❌ Error signing up:', error);
      throw error;
    }
  }

  async signIn(email, password) {
    try {
      const { data, error } = await this.supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('❌ Error signing in:', error);
      throw error;
    }
  }

  async signOut() {
    try {
      const { error } = await this.supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error('❌ Error signing out:', error);
      throw error;
    }
  }

  async getCurrentUser() {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      return user;
    } catch (error) {
      console.error('❌ Error getting current user:', error);
      return null;
    }
  }

  // Session management
  onAuthStateChange(callback) {
    return this.supabase.auth.onAuthStateChange(callback);
  }
}

export default new SupabaseService();
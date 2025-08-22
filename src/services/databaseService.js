import { v4 as uuidv4 } from 'uuid';
import DynamoService from './dynamoService';

// Hybrid database service - uses DynamoDB when available, localStorage as fallback
class DatabaseService {
  constructor() {
    this.useDynamoDB = false;
    this.initializeData();
    this.checkDynamoDBAvailability();
  }

  async checkDynamoDBAvailability() {
    try {
      console.log('🔧 Checking DynamoDB availability...');
      
      if (DynamoService.isAvailable()) {
        console.log('✅ DynamoService reports it is available');
        
        // Test actual connection with timeout
        try {
          const connectionPromise = DynamoService.testConnection();
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('DynamoDB connection timeout')), 5000)
          );
          
          await Promise.race([connectionPromise, timeoutPromise]);
          this.useDynamoDB = true;
          console.log('🚀 Using AWS DynamoDB for data storage');
        } catch (testError) {
          console.error('❌ DynamoDB test connection failed:', testError);
          console.log('💾 Falling back to localStorage due to connection test failure');
          this.useDynamoDB = false;
        }
      } else {
        console.log('💾 Using localStorage for data storage (AWS not configured)');
        this.useDynamoDB = false;
      }
    } catch (error) {
      console.error('❌ Error checking DynamoDB availability:', error);
      console.log('💾 Falling back to localStorage:', error.message);
      this.useDynamoDB = false;
    }
  }

  initializeData() {
    try {
      // Initialize empty data structures
      const tables = ['superAdmins', 'clinics', 'patients', 'reports', 'subscriptions', 'payments', 'usage', 'alerts'];
      
      tables.forEach(table => {
        if (!localStorage.getItem(table)) {
          localStorage.setItem(table, JSON.stringify([]));
        }
      });
    } catch (error) {
      console.warn('Failed to initialize data tables:', error);
    }
  }

  // Generic CRUD operations
  async get(table) {
    if (this.useDynamoDB) {
      try {
        return await DynamoService.get(table);
      } catch (error) {
        console.warn(`DynamoDB failed, falling back to localStorage for ${table}:`, error);
        this.useDynamoDB = false;
      }
    }
    
    try {
      const data = localStorage.getItem(table);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.warn(`Failed to get data from ${table}:`, error);
      return [];
    }
  }

  set(table, data) {
    try {
      localStorage.setItem(table, JSON.stringify(data));
    } catch (error) {
      console.warn(`Failed to save data to ${table}:`, error);
    }
  }

  async add(table, item) {
    if (this.useDynamoDB) {
      try {
        return await DynamoService.add(table, item);
      } catch (error) {
        console.warn(`DynamoDB failed, falling back to localStorage for ${table}:`, error);
        this.useDynamoDB = false;
      }
    }
    
    const data = await this.get(table);
    const newItem = { ...item, id: item.id || uuidv4(), createdAt: item.createdAt || new Date().toISOString() };
    data.push(newItem);
    this.set(table, data);
    return newItem;
  }

  async update(table, id, updates) {
    if (this.useDynamoDB) {
      try {
        return await DynamoService.update(table, id, updates);
      } catch (error) {
        console.warn(`DynamoDB failed, falling back to localStorage for ${table}:`, error);
        this.useDynamoDB = false;
      }
    }
    
    const data = await this.get(table);
    const index = data.findIndex(item => item.id === id);
    if (index !== -1) {
      data[index] = { ...data[index], ...updates, updatedAt: new Date().toISOString() };
      this.set(table, data);
      return data[index];
    }
    return null;
  }

  async delete(table, id) {
    if (this.useDynamoDB) {
      try {
        return await DynamoService.delete(table, id);
      } catch (error) {
        console.warn(`DynamoDB failed, falling back to localStorage for ${table}:`, error);
        this.useDynamoDB = false;
      }
    }
    
    const data = await this.get(table);
    const filteredData = data.filter(item => item.id !== id);
    this.set(table, filteredData);
    return true;
  }

  async findById(table, id) {
    if (this.useDynamoDB) {
      try {
        return await DynamoService.findById(table, id);
      } catch (error) {
        console.warn(`DynamoDB failed, falling back to localStorage for ${table}:`, error);
        this.useDynamoDB = false;
      }
    }
    
    const data = await this.get(table);
    return data.find(item => item.id === id);
  }

  async findBy(table, field, value) {
    if (this.useDynamoDB) {
      try {
        return await DynamoService.findBy(table, field, value);
      } catch (error) {
        console.warn(`DynamoDB failed, falling back to localStorage for ${table}:`, error);
        this.useDynamoDB = false;
      }
    }
    
    const data = await this.get(table);
    return data.filter(item => item[field] === value);
  }

  async findOne(table, field, value) {
    if (this.useDynamoDB) {
      try {
        return await DynamoService.findOne(table, field, value);
      } catch (error) {
        console.warn(`DynamoDB failed, falling back to localStorage for ${table}:`, error);
        this.useDynamoDB = false;
      }
    }
    
    const data = await this.get(table);
    return data.find(item => item[field] === value);
  }

  // Super Admin specific methods
  authenticateAdmin(email, password) {
    const admin = this.findOne('superAdmins', 'email', email);
    if (admin && admin.password === password && admin.isActive) {
      return { ...admin, password: undefined }; // Don't return password
    }
    return null;
  }

  // Clinic specific methods
  async createClinic(clinicData) {
    const clinic = {
      ...clinicData,
      id: uuidv4(),
      isActive: true,
      reportsUsed: 0,
      reportsAllowed: 10, // Default trial: 10 reports
      subscriptionStatus: 'trial',
      trialStartDate: new Date().toISOString(),
      trialEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days trial
    };
    
    return await this.add('clinics', clinic);
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

  // Subscription methods
  async updateSubscription(clinicId, subscriptionData) {
    let subscription = await this.findOne('subscriptions', 'clinicId', clinicId);
    
    if (subscription) {
      subscription = await this.update('subscriptions', subscription.id, subscriptionData);
    } else {
      subscription = await this.add('subscriptions', { ...subscriptionData, clinicId });
    }
    
    // Update clinic's report allowance
    if (subscriptionData.reportsAllowed) {
      const clinic = await this.findById('clinics', clinicId);
      if (clinic) {
        await this.update('clinics', clinicId, {
          reportsAllowed: clinic.reportsAllowed + subscriptionData.reportsAllowed,
          subscriptionStatus: 'active'
        });
      }
    }
    
    return subscription;
  }

  async getSubscription(clinicId) {
    return await this.findOne('subscriptions', 'clinicId', clinicId);
  }

  // Data recovery and validation methods
  async validateAndRepairData() {
    try {
      console.log('🔧 Starting data validation and repair...');
      
      // Check and repair localStorage data
      const tables = ['superAdmins', 'clinics', 'patients', 'reports', 'subscriptions', 'payments', 'usage', 'alerts'];
      let repairCount = 0;
      
      for (const table of tables) {
        try {
          const data = localStorage.getItem(table);
          if (data) {
            const parsed = JSON.parse(data);
            if (!Array.isArray(parsed)) {
              console.warn(`⚠️ Repairing corrupted ${table} data`);
              localStorage.setItem(table, JSON.stringify([]));
              repairCount++;
            }
          } else {
            localStorage.setItem(table, JSON.stringify([]));
          }
        } catch (parseError) {
          console.warn(`⚠️ Repairing corrupted ${table} data:`, parseError);
          localStorage.setItem(table, JSON.stringify([]));
          repairCount++;
        }
      }
      
      if (repairCount > 0) {
        console.log(`🔧 Repaired ${repairCount} corrupted data tables`);
      } else {
        console.log('✅ Data validation passed');
      }
      
      return { success: true, repairCount };
    } catch (error) {
      console.error('❌ Error during data validation:', error);
      return { success: false, error: error.message };
    }
  }

  // Force refresh data connection
  async refreshConnection() {
    console.log('🔄 Refreshing database connection...');
    this.useDynamoDB = false;
    await this.checkDynamoDBAvailability();
    await this.validateAndRepairData();
  }

  // Analytics methods
  async getAnalytics() {
    const clinics = await this.get('clinics');
    const reports = await this.get('reports');
    const patients = await this.get('patients');
    
    const activeClinicCount = clinics.filter(c => c.isActive).length;
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
}

export default new DatabaseService();
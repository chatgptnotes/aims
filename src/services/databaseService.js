import { v4 as uuidv4 } from 'uuid';

// Mock database using localStorage
class DatabaseService {
  constructor() {
    this.initializeData();
  }

  initializeData() {
    try {
      // Initialize with default super admin if doesn't exist
      if (!localStorage.getItem('superAdmins')) {
        const defaultAdmin = {
          id: uuidv4(),
          email: 'admin@neurosense360.com',
          password: 'admin123', // In production, this would be hashed
          name: 'Super Admin',
          role: 'super_admin',
          createdAt: new Date().toISOString(),
          isActive: true
        };
        localStorage.setItem('superAdmins', JSON.stringify([defaultAdmin]));
      }
    } catch (error) {
      console.warn('Failed to initialize superAdmins:', error);
    }

    try {
      // Initialize empty data structures
      const tables = ['clinics', 'patients', 'reports', 'subscriptions', 'payments', 'usage', 'alerts'];
      
      tables.forEach(table => {
        if (!localStorage.getItem(table)) {
          localStorage.setItem(table, JSON.stringify([]));
        }
      });

      // Add a demo clinic if it doesn't exist
      const clinics = this.get('clinics');
      if (!clinics.find(c => c.id === 'demo-clinic-id')) {
        this.add('clinics', {
          id: 'demo-clinic-id',
          name: 'Demo Clinic',
          email: 'clinic@demo.com',
          password: 'password',
          role: 'clinic_admin',
          isActive: true,
          reportsUsed: 5,
          reportsAllowed: 10,
          subscriptionStatus: 'trial',
          trialStartDate: new Date().toISOString(),
          trialEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        });
      }
    } catch (error) {
      console.warn('Failed to initialize data tables:', error);
    }
  }

  // Generic CRUD operations
  get(table) {
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

  add(table, item) {
    const data = this.get(table);
    const newItem = { ...item, id: item.id || uuidv4(), createdAt: item.createdAt || new Date().toISOString() };
    data.push(newItem);
    this.set(table, data);
    return newItem;
  }

  update(table, id, updates) {
    const data = this.get(table);
    const index = data.findIndex(item => item.id === id);
    if (index !== -1) {
      data[index] = { ...data[index], ...updates, updatedAt: new Date().toISOString() };
      this.set(table, data);
      return data[index];
    }
    return null;
  }

  delete(table, id) {
    const data = this.get(table);
    const filteredData = data.filter(item => item.id !== id);
    this.set(table, filteredData);
    return true;
  }

  findById(table, id) {
    const data = this.get(table);
    return data.find(item => item.id === id);
  }

  findBy(table, field, value) {
    const data = this.get(table);
    return data.filter(item => item[field] === value);
  }

  findOne(table, field, value) {
    const data = this.get(table);
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
  createClinic(clinicData) {
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
    
    return this.add('clinics', clinic);
  }

  getClinicUsage(clinicId) {
    const usage = this.findBy('usage', 'clinicId', clinicId);
    const reports = this.findBy('reports', 'clinicId', clinicId);
    
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
  getPatientsByClinic(clinicId) {
    return this.findBy('patients', 'clinicId', clinicId);
  }

  // Reports specific methods
  getReportsByClinic(clinicId) {
    return this.findBy('reports', 'clinicId', clinicId);
  }

  getReportsByPatient(patientId) {
    return this.findBy('reports', 'patientId', patientId);
  }

  addReport(reportData) {
    const report = this.add('reports', reportData);
    
    // Update clinic usage
    const clinic = this.findById('clinics', reportData.clinicId);
    if (clinic) {
      this.update('clinics', clinic.id, { 
        reportsUsed: (clinic.reportsUsed || 0) + 1 
      });
    }
    
    // Track usage
    this.add('usage', {
      clinicId: reportData.clinicId,
      patientId: reportData.patientId,
      reportId: report.id,
      action: 'report_created',
      timestamp: new Date().toISOString()
    });
    
    return report;
  }

  // Subscription methods
  updateSubscription(clinicId, subscriptionData) {
    let subscription = this.findOne('subscriptions', 'clinicId', clinicId);
    
    if (subscription) {
      subscription = this.update('subscriptions', subscription.id, subscriptionData);
    } else {
      subscription = this.add('subscriptions', { ...subscriptionData, clinicId });
    }
    
    // Update clinic's report allowance
    if (subscriptionData.reportsAllowed) {
      const clinic = this.findById('clinics', clinicId);
      if (clinic) {
        this.update('clinics', clinicId, {
          reportsAllowed: clinic.reportsAllowed + subscriptionData.reportsAllowed,
          subscriptionStatus: 'active'
        });
      }
    }
    
    return subscription;
  }

  getSubscription(clinicId) {
    return this.findOne('subscriptions', 'clinicId', clinicId);
  }

  // Analytics methods
  getAnalytics() {
    const clinics = this.get('clinics');
    const reports = this.get('reports');
    const patients = this.get('patients');
    
    const activeClinicCount = clinics.filter(c => c.isActive).length;
    const totalReportsCount = reports.length;
    const totalPatientsCount = patients.length;
    
    const revenueData = clinics.reduce((acc, clinic) => {
      const subscription = this.findOne('subscriptions', 'clinicId', clinic.id);
      if (subscription && subscription.amount) {
        acc += subscription.amount;
      }
      return acc;
    }, 0);

    return {
      activeClinics: activeClinicCount,
      totalReports: totalReportsCount,
      totalPatients: totalPatientsCount,
      monthlyRevenue: revenueData,
      recentActivity: this.get('usage').slice(-10).reverse()
    };
  }
}

export default new DatabaseService();
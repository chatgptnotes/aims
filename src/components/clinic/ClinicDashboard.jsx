import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import DatabaseService from '../../services/databaseService';
import DashboardLayout from '../layout/DashboardLayout';
import PatientManagement from './PatientManagement';
import ReportViewer from './ReportViewer';
import OverviewTab from './OverviewTab';
import SubscriptionTab from './SubscriptionTab';

const ClinicDashboard = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [clinic, setClinic] = useState(null);
  const [patients, setPatients] = useState([]);
  const [reports, setReports] = useState([]);
  const [usage, setUsage] = useState({});
  const [loading, setLoading] = useState(true);
  const [dataLoaded, setDataLoaded] = useState(false);

  // Get active tab from URL params or default to overview
  const activeTab = searchParams.get('tab') || 'overview';

  useEffect(() => {
    console.log('🔄 ClinicDashboard useEffect - user:', user?.name, 'clinicId:', user?.clinicId, 'dataLoaded:', dataLoaded);
    if (user && user.clinicId && !dataLoaded) {
      console.log('📊 Loading clinic data for the first time...');
      loadClinicData();
    } else if (user && !user.clinicId) {
      console.warn('⚠️ User loaded but no clinicId found:', user);
      setLoading(false);
    } else if (user && user.clinicId && dataLoaded) {
      console.log('✅ Data already loaded, skipping reload');
      setLoading(false);
    } else {
      console.log('⏳ Waiting for user data to load...');
    }
  }, [user, dataLoaded]);

  const loadClinicData = async () => {
    try {
      console.log('🏥 Loading clinic data for user:', user);
      
      if (!user || !user.clinicId) {
        console.error('❌ No clinic ID found for user:', user);
        setLoading(false);
        return;
      }

      // Get current user's clinic data only
      let currentClinic = await DatabaseService.findById('clinics', user.clinicId);
      
      if (!currentClinic) {
        console.warn('⚠️ Clinic not found for ID:', user.clinicId, '- Creating new clinic record');
        
        // Create clinic record in DynamoDB
        try {
          const newClinic = {
            id: user.clinicId,
            name: user.clinicName || 'Sai Clinic',
            email: user.email,
            adminName: user.name,
            createdAt: new Date().toISOString(),
            reportsUsed: 0,
            reportsAllowed: 50, // Default allowance
            subscriptionStatus: 'trial'
          };
          
          currentClinic = await DatabaseService.add('clinics', newClinic);
          console.log('✅ Created new clinic record:', currentClinic.name);
        } catch (error) {
          console.error('❌ Failed to create clinic record:', error);
          setLoading(false);
          return;
        }
      }

      console.log('✅ Found clinic:', currentClinic.name, 'for user:', user.name);
      
      // Get ONLY this clinic's patients and reports
      let clinicPatients = await DatabaseService.getPatientsByClinic(currentClinic.id);
      let clinicReports = await DatabaseService.getReportsByClinic(currentClinic.id);
      
      // If no patients in DynamoDB but exist in localStorage, migrate them
      if (clinicPatients.length === 0) {
        console.log('🔄 No patients in DynamoDB, checking localStorage for migration...');
        
        const localStoragePatients = JSON.parse(localStorage.getItem('patients') || '[]');
        const localStorageReports = JSON.parse(localStorage.getItem('reports') || '[]');
        
        const clinicPatientsFromLocal = localStoragePatients.filter(p => 
          p.clinicId === currentClinic.id || 
          p.clinicId == currentClinic.id || // eslint-disable-line eqeqeq
          String(p.clinicId) === String(currentClinic.id)
        );
        
        if (clinicPatientsFromLocal.length > 0) {
          console.log(`🚀 Migrating ${clinicPatientsFromLocal.length} patients to DynamoDB...`);
          
          // Migrate patients
          for (const patient of clinicPatientsFromLocal) {
            try {
              await DatabaseService.add('patients', patient);
              console.log(`✅ Migrated patient: ${patient.name}`);
            } catch (error) {
              console.error(`❌ Failed to migrate patient ${patient.name}:`, error);
            }
          }
          
          // Migrate reports
          const clinicReportsFromLocal = localStorageReports.filter(r => 
            r.clinicId === currentClinic.id || 
            r.clinicId == currentClinic.id || // eslint-disable-line eqeqeq
            String(r.clinicId) === String(currentClinic.id)
          );
          
          for (const report of clinicReportsFromLocal) {
            try {
              // Ensure report has required fields
              const reportToMigrate = {
                ...report,
                id: report.id || `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                createdAt: report.createdAt || new Date().toISOString()
              };
              
              await DatabaseService.add('reports', reportToMigrate);
              console.log(`✅ Migrated report: ${report.fileName}`);
            } catch (error) {
              console.error(`❌ Failed to migrate report ${report.fileName}:`, error);
            }
          }
          
          // Reload data after migration
          clinicPatients = await DatabaseService.getPatientsByClinic(currentClinic.id);
          clinicReports = await DatabaseService.getReportsByClinic(currentClinic.id);
          
          console.log(`✅ Migration complete! Patients: ${clinicPatients.length}, Reports: ${clinicReports.length}`);
        }
      }
      
      // Calculate clinic usage
      const clinicUsage = {
        totalReports: clinicReports.length,
        reportsUsed: currentClinic.reportsUsed || 0,
        reportsAllowed: currentClinic.reportsAllowed || 10
      };
      
      console.log('📊 Clinic data loaded:', {
        clinic: currentClinic.name,
        patients: clinicPatients.length,
        reports: clinicReports.length
      });
      
      setClinic(currentClinic);
      setPatients(clinicPatients);
      setReports(clinicReports);
      setUsage(clinicUsage);
      setDataLoaded(true); // Mark data as loaded
    } catch (error) {
      console.error('Error loading clinic data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Separate refresh function that forces a reload
  const refreshClinicData = async () => {
    console.log('🔄 Force refreshing clinic data...');
    setDataLoaded(false); // This will trigger a reload
    await loadClinicData();
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewTab clinic={clinic} patients={patients} reports={reports} usage={usage} onRefresh={refreshClinicData} />;
      case 'patients':
        console.log('🏥 Rendering PatientManagement with clinicId:', clinic?.id);
        return <PatientManagement key={`patients-${clinic?.id}`} clinicId={clinic?.id} onUpdate={refreshClinicData} />;
      case 'reports':
        return <ReportViewer clinicId={clinic?.id} patients={patients} reports={reports} onUpdate={refreshClinicData} />;
      case 'usage':
        return <UsageTracking clinic={clinic} usage={usage} />;
      case 'subscription':
        return <SubscriptionTab user={user} clinic={clinic} />;
      case 'settings':
        return <ClinicSettings clinic={clinic} />;
      default:
        return <OverviewTab clinic={clinic} patients={patients} reports={reports} usage={usage} onRefresh={refreshClinicData} />;
    }
  };

  const getPageTitle = () => {
    switch (activeTab) {
      case 'overview': return 'Clinic Dashboard';
      case 'patients': return 'Patient Management';
      case 'reports': return 'Reports & Files';
      case 'usage': return 'Usage Tracking';
      case 'subscription': return 'Subscription & Billing';
      case 'settings': return 'Clinic Settings';
      default: return 'Clinic Dashboard';
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Loading...">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading Clinic Portal...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title={getPageTitle()}>
      <div className="space-y-6">
        {renderContent()}
      </div>
    </DashboardLayout>
  );
};

// Usage Tracking Component
const UsageTracking = ({ clinic, usage }) => {
  const usagePercentage = clinic?.reportsUsed && clinic?.reportsAllowed 
    ? (clinic.reportsUsed / clinic.reportsAllowed) * 100 
    : 0;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Usage Overview</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">{clinic?.reportsUsed || 0}</div>
            <div className="text-sm text-gray-500">Reports Used</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">{clinic?.reportsAllowed || 10}</div>
            <div className="text-sm text-gray-500">Reports Allowed</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600">{Math.max(0, (clinic?.reportsAllowed || 10) - (clinic?.reportsUsed || 0))}</div>
            <div className="text-sm text-gray-500">Remaining</div>
          </div>
        </div>

        <div className="mt-6">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Usage Progress</span>
            <span>{usagePercentage.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${
                usagePercentage >= 90 ? 'bg-red-500' : 
                usagePercentage >= 70 ? 'bg-yellow-500' : 'bg-green-500'
              }`}
              style={{ width: `${Math.min(usagePercentage, 100)}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Clinic Settings Component
const ClinicSettings = ({ clinic }) => {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Clinic Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Clinic Name</label>
            <input
              type="text"
              defaultValue={clinic?.name || ''}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Contact Person</label>
            <input
              type="text"
              defaultValue={clinic?.contactPerson || ''}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              defaultValue={clinic?.email || ''}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
            <input
              type="tel"
              defaultValue={clinic?.phone || ''}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
        </div>
        
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
          <textarea
            defaultValue={clinic?.address || ''}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <button className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClinicDashboard;
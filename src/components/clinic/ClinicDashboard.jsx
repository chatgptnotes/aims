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

  // Get active tab from URL params or default to overview
  const activeTab = searchParams.get('tab') || 'overview';

  useEffect(() => {
    loadClinicData();
  }, [user]);

  const loadClinicData = async () => {
    try {
      // In a real app, this would be based on user authentication
      // For now, we'll use the first clinic or create a demo clinic
      let clinics = DatabaseService.get('clinics');
      let currentClinic = clinics[0];
      
      if (!currentClinic) {
        // Create demo clinic for testing
        currentClinic = DatabaseService.createClinic({
          name: 'Demo Clinic',
          email: 'demo@clinic.com',
          contactPerson: 'Dr. Demo',
          phone: '+1234567890',
          address: '123 Medical St, Health City'
        });
      }
      
      const clinicPatients = DatabaseService.getPatientsByClinic(currentClinic.id);
      const clinicReports = DatabaseService.getReportsByClinic(currentClinic.id);
      const clinicUsage = DatabaseService.getClinicUsage(currentClinic.id);
      
      setClinic(currentClinic);
      setPatients(clinicPatients);
      setReports(clinicReports);
      setUsage(clinicUsage);
    } catch (error) {
      console.error('Error loading clinic data:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewTab clinic={clinic} patients={patients} reports={reports} usage={usage} onRefresh={loadClinicData} />;
      case 'patients':
        return <PatientManagement clinicId={clinic?.id} onUpdate={loadClinicData} />;
      case 'reports':
        return <ReportViewer clinicId={clinic?.id} patients={patients} reports={reports} onUpdate={loadClinicData} />;
      case 'usage':
        return <UsageTracking clinic={clinic} usage={usage} />;
      case 'subscription':
        return <SubscriptionTab user={user} clinic={clinic} />;
      case 'settings':
        return <ClinicSettings clinic={clinic} />;
      default:
        return <OverviewTab clinic={clinic} patients={patients} reports={reports} usage={usage} onRefresh={loadClinicData} />;
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
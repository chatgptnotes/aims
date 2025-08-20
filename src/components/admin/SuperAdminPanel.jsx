import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import DatabaseService from '../../services/databaseService';
import ClinicManagement from './ClinicManagement';
import PatientReports from './PatientReports';
import AnalyticsDashboard from './AnalyticsDashboard';
import AlertDashboard from './AlertDashboard';
import DashboardLayout from '../layout/DashboardLayout';
import AdminDashboard from './AdminDashboard';
import SystemSettings from './SystemSettings';
import PaymentHistory from './PaymentHistory';
import { useAuth } from '../../contexts/AuthContext';

const SuperAdminPanel = () => {
  console.log('👑 SuperAdminPanel component loading...');
  
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [analytics, setAnalytics] = useState({});
  const [loading, setLoading] = useState(true);
  const [clinics, setClinics] = useState([]);
  const [selectedClinic, setSelectedClinic] = useState('');
  const [error, setError] = useState(null);
  
  // Get active tab and clinic from URL params or default to dashboard
  const activeTab = searchParams.get('tab') || 'dashboard';
  const urlClinic = searchParams.get('clinic');

  useEffect(() => {
    loadAnalytics();
    loadClinics();
  }, []);

  useEffect(() => {
    // Set selected clinic from URL parameter
    if (urlClinic) {
      setSelectedClinic(urlClinic);
    }
  }, [urlClinic]);

  const loadClinics = async () => {
    try {
      console.log('📊 Loading clinics...');
      const clinicsData = await DatabaseService.get('clinics');
      console.log('📊 Clinics loaded:', clinicsData.length);
      setClinics(clinicsData);
    } catch (error) {
      console.error('❌ Error loading clinics:', error);
      setError('Failed to load clinics: ' + error.message);
      setClinics([]); // Set empty array to prevent further errors
    }
  };

  const loadAnalytics = async () => {
    try {
      // SuperAdmin gets all system analytics
      const clinics = await DatabaseService.get('clinics');
      const patients = await DatabaseService.get('patients');
      const reports = await DatabaseService.get('reports');
      const payments = await DatabaseService.get('payments');
      
      const data = {
        activeClinics: clinics.filter(c => c.isActive).length,
        totalClinics: clinics.length,
        totalPatients: patients.length,
        totalReports: reports.length,
        monthlyRevenue: payments.reduce((sum, payment) => sum + (payment.amount || 0), 0)
      };
      
      setAnalytics(data);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderContent = () => {
    try {
      console.log('🎨 Rendering content for tab:', activeTab);
      
      switch (activeTab) {
        case 'dashboard':
          return <AdminDashboard analytics={analytics} onRefresh={loadAnalytics} />;
        case 'clinics':
          return <ClinicManagement onUpdate={loadAnalytics} />;
        case 'reports':
          return <PatientReports onUpdate={loadAnalytics} selectedClinic={selectedClinic} />;
        case 'payments':
          return <PaymentHistory selectedClinic={selectedClinic} />;
        case 'alerts':
          return <AlertDashboard />;
        case 'analytics':
          return <AnalyticsDashboard analytics={analytics} />;
        case 'settings':
          return <SystemSettings />;
        default:
          return <AdminDashboard analytics={analytics} onRefresh={loadAnalytics} />;
      }
    } catch (error) {
      console.error('❌ Error rendering content:', error);
      return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-red-800 font-medium">Error Loading Content</h3>
          <p className="text-red-600 mt-2">{error?.message || 'Unknown error occurred'}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Reload Page
          </button>
        </div>
      );
    }
  };

  const getPageTitle = () => {
    switch (activeTab) {
      case 'dashboard': return 'Super Admin Dashboard';
      case 'clinics': return 'Clinic Management';
      case 'reports': return selectedClinic ? `Patient Reports - ${clinics.find(c => c.id === selectedClinic)?.name || 'Selected Clinic'}` : 'Patient Reports';
      case 'payments': return selectedClinic ? `Payment History - ${clinics.find(c => c.id === selectedClinic)?.name || 'Selected Clinic'}` : 'Payment History';
      case 'alerts': return 'Alerts & Monitoring';
      case 'analytics': return 'Analytics & Reports';
      case 'settings': return 'System Settings';
      default: return 'Super Admin Dashboard';
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Loading...">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading Super Admin Panel...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title={getPageTitle()}>
      <div className="space-y-6">
        {/* Clinic Selection for Reports and Payments tabs */}
        {(activeTab === 'reports' || activeTab === 'payments') && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  {activeTab === 'reports' ? 'Select Clinic for Patient Reports' : 'Select Clinic for Payment History'}
                </h3>
                <p className="text-sm text-gray-600">
                  {selectedClinic 
                    ? `Viewing data for: ${clinics.find(c => c.id === selectedClinic)?.name}`
                    : 'Select a clinic to view their specific data'
                  }
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <select
                  value={selectedClinic}
                  onChange={(e) => setSelectedClinic(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">All Clinics</option>
                  {clinics.map(clinic => (
                    <option key={clinic.id} value={clinic.id}>
                      {clinic.name} ({clinic.email})
                    </option>
                  ))}
                </select>
                {selectedClinic && (
                  <button
                    onClick={() => setSelectedClinic('')}
                    className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Clear Selection
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
        
        {renderContent()}
      </div>
    </DashboardLayout>
  );
};

export default SuperAdminPanel;
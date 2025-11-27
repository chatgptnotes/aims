import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import DatabaseService from '../../services/databaseService';
import ClinicManagement from './ClinicManagement';
import SupervisorReports from './SupervisorReports';
import AnalyticsDashboard from './AnalyticsDashboard';
import AlertDashboard from './AlertDashboard';
import DashboardLayout from '../layout/DashboardLayout';
import AdminDashboard from './AdminDashboard';
import SystemSettings from './SystemSettings';
import PaymentHistory from './PaymentHistory';
import DataAccess from './DataAccess';
import BrandingConfiguration from './BrandingConfiguration';
import AdvancedAnalytics from './AdvancedAnalytics';
import NotificationCenter from './NotificationCenter';
import AgreementManager from './AgreementManager';
import AlgorithmDataProcessor from './AlgorithmDataProcessor';
import { useAuth } from '../../contexts/AuthContext';

const SuperAdminPanel = () => {
  console.log('SUPERADMIN: SuperAdminPanel component loading...');

  const { user } = useAuth();
  const location = useLocation();
  const [analytics, setAnalytics] = useState({});
  const [loading, setLoading] = useState(true);
  const [clinics, setClinics] = useState([]);
  const [selectedClinic, setSelectedClinic] = useState('');
  const [error, setError] = useState(null);
  const [isMounted, setIsMounted] = useState(true);

  // Get active tab from URL pathname
  // Example: /admin/clinics -> activeTab = 'clinics'
  // Example: /admin -> activeTab = 'dashboard'
  const pathParts = location.pathname.split('/').filter(Boolean);
  const activeTab = pathParts.length > 1 ? pathParts[1] : 'dashboard';
  const urlClinic = null; // Remove query parameter support for clinic selection

  useEffect(() => {
    try {
      loadAnalytics();
      loadClinics();
    } catch (error) {
      console.error('Error initializing SuperAdminPanel:', error);
      if (isMounted) {
        setError('Failed to initialize admin panel: ' + error.message);
        setLoading(false);
      }
    }
    
    // Cleanup function
    return () => {
      setIsMounted(false);
    };
  }, []);

  // Reset mounted state when component mounts
  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  useEffect(() => {
    // Set selected clinic from URL parameter
    if (urlClinic) {
      setSelectedClinic(urlClinic);
    }
  }, [urlClinic]);

  const loadClinics = async () => {
    try {
      console.log('DATA: Loading clinics...');
      const clinicsData = await DatabaseService.get('clinics');
      console.log('DATA: Clinics loaded:', clinicsData.length);
      
      // Only update state if component is still mounted
      if (isMounted) {
        setClinics(clinicsData);
      }
    } catch (error) {
      console.error('ERROR: Error loading clinics:', error);
      if (isMounted) {
        setError('Failed to load clinics: ' + error.message);
        setClinics([]); // Set empty array to prevent further errors
      }
    }
  };

  const loadAnalytics = async () => {
    try {
      // SuperAdmin gets all system analytics
      // Wrap each call in try-catch to handle missing tables gracefully
      let clinics = [];
      let supervisors = [];
      let reports = [];
      let payments = [];

      try {
        clinics = await DatabaseService.get('clinics') || [];
      } catch (err) {
        console.warn('WARNING: Failed to load clinics:', err.message);
        clinics = [];
      }

      try {
        // Use 'patients' table which maps to supervisors
        supervisors = await DatabaseService.get('patients') || [];
      } catch (err) {
        console.warn('WARNING: Failed to load supervisors:', err.message);
        supervisors = [];
      }

      try {
        reports = await DatabaseService.get('reports') || [];
      } catch (err) {
        console.warn('WARNING: Failed to load reports:', err.message);
        reports = [];
      }

      try {
        payments = await DatabaseService.get('payments') || [];
      } catch (err) {
        console.warn('WARNING: Failed to load payments:', err.message);
        payments = [];
      }

      const data = {
        activeClinics: Array.isArray(clinics) ? clinics.filter(c => c?.isActive || c?.is_active).length : 0,
        totalClinics: Array.isArray(clinics) ? clinics.length : 0,
        totalSupervisors: Array.isArray(supervisors) ? supervisors.length : 0,
        totalReports: Array.isArray(reports) ? reports.length : 0,
        monthlyRevenue: Array.isArray(payments) ? payments.reduce((sum, payment) => sum + (payment?.amount || 0), 0) : 0
      };

      // Only update state if component is still mounted
      if (isMounted) {
        setAnalytics(data);
      }
    } catch (error) {
      console.error('ERROR: Critical error loading analytics:', error);
      // Set safe defaults
      if (isMounted) {
        setAnalytics({
          activeClinics: 0,
          totalClinics: 0,
          totalSupervisors: 0,
          totalReports: 0,
          monthlyRevenue: 0
        });
      }
    } finally {
      if (isMounted) {
        setLoading(false);
      }
    }
  };

  const renderContent = () => {
    try {
      console.log('STYLE: Rendering content for tab:', activeTab);
      
      // Clear any previous errors when switching tabs
      if (error) {
        setError(null);
      }
      
      switch (activeTab) {
        case 'dashboard':
          return <AdminDashboard analytics={analytics} onRefresh={loadAnalytics} />;
        case 'clinics':
          return <ClinicManagement onUpdate={loadAnalytics} />;
        case 'reports':
          return <SupervisorReports onUpdate={loadAnalytics} selectedClinic={selectedClinic} />;
        case 'payments':
          return <PaymentHistory selectedClinic={selectedClinic} />;
        case 'alerts':
          return <AlertDashboard />;
        case 'analytics':
          return <AnalyticsDashboard analytics={analytics} />;
        case 'advanced-analytics':
          return <AdvancedAnalytics />;
        case 'algorithm-processor':
          return <AlgorithmDataProcessor />;
        case 'data-access':
          return <DataAccess />;
        case 'branding':
          return <BrandingConfiguration />;
        case 'notifications':
          return <NotificationCenter />;
        case 'agreements':
          return <AgreementManager />;
        case 'settings':
          return <SystemSettings />;
        default:
          console.log('REFRESH: Unknown tab, defaulting to dashboard:', activeTab);
          return <AdminDashboard analytics={analytics} onRefresh={loadAnalytics} />;
      }
    } catch (error) {
      console.error('ERROR: Error rendering content:', error);
      setError(error.message || 'Unknown error occurred');
      return (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
          <h3 className="text-red-800 dark:text-red-400 font-medium">Error Loading Content</h3>
          <p className="text-red-600 dark:text-red-400 mt-2">{error?.message || 'Unknown error occurred'}</p>
          <div className="flex space-x-3 mt-4">
            <button
              onClick={() => {
                setError(null);
                window.location.reload();
              }}
              className="bg-red-600 dark:bg-red-700 text-white px-4 py-2 rounded hover:bg-red-700 dark:hover:bg-red-800"
            >
              Reload Page
            </button>
            <button
              onClick={() => {
                setError(null);
                // Try to navigate to dashboard
                window.location.href = '/admin';
              }}
              className="bg-gray-600 dark:bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-700 dark:hover:bg-gray-800"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      );
    }
  };

  const getPageTitle = () => {
    switch (activeTab) {
      case 'dashboard': return 'Super Admin Dashboard';
      case 'clinics': return 'Engineer Management';
      case 'reports': return selectedClinic ? `P&ID Reports - ${clinics.find(c => c.id === selectedClinic)?.name || 'Selected Project Area'}` : 'P&ID Reports';
      case 'payments': return selectedClinic ? `Payment History - ${clinics.find(c => c.id === selectedClinic)?.name || 'Selected Project Area'}` : 'Payment History';
      case 'alerts': return 'Alerts & Monitoring';
      case 'analytics': return 'Analytics & Reports';
      case 'advanced-analytics': return 'Advanced Analytics & Tracking';
      case 'algorithm-processor': return 'Algorithm Data Processor';
      case 'data-access': return 'Data Access Center';
      case 'branding': return 'Branding & Co-labeling';
      case 'notifications': return 'Notification Center';
      case 'agreements': return 'Agreement Management';
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
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading Super Admin Panel...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title={getPageTitle()}>
      <div className="space-y-6">
        {/* Project Area Selection for Reports and Payments tabs */}
        {(activeTab === 'reports' || activeTab === 'payments') && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  {activeTab === 'reports' ? 'Select Project Area for P&ID Reports' : 'Select Project Area for Payment History'}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {selectedClinic
                    ? `Viewing data for: ${clinics.find(c => c.id === selectedClinic)?.name}`
                    : 'Select a project area to view their specific data'
                  }
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <select
                  value={selectedClinic}
                  onChange={(e) => setSelectedClinic(e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">All Project Areas</option>
                  {clinics.map(clinic => (
                    <option key={clinic.id} value={clinic.id}>
                      {clinic.name} ({clinic.email})
                    </option>
                  ))}
                </select>
                {selectedClinic && (
                  <button
                    onClick={() => setSelectedClinic('')}
                    className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
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
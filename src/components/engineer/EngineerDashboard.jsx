import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { AlertTriangle } from 'lucide-react';
import DatabaseService from '../../services/databaseService';
import DashboardLayout from '../layout/DashboardLayout';
import SupervisorManagement from './SupervisorManagement';
import ReportViewer from './ReportViewer';
import OverviewTab from './OverviewTab';
import SubscriptionTab from './SubscriptionTab';
import AdvancedAnalytics from './AdvancedAnalytics';
import toast from 'react-hot-toast';

const EngineerDashboard = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [projectArea, setProjectArea] = useState(null);
  const [supervisors, setSupervisors] = useState([]);
  const [reports, setReports] = useState([]);
  const [usage, setUsage] = useState({
    totalReports: 0,
    reportsUsed: 0,
    reportsAllowed: 10
  });
  const [loading, setLoading] = useState(true);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [isMounted, setIsMounted] = useState(true);
  const [error, setError] = useState(null);

  // Get active tab from URL pathname
  // Example: /clinic/supervisors -> activeTab = 'supervisors'
  // Example: /clinic -> activeTab = 'overview'
  const pathParts = location.pathname.split('/').filter(Boolean);
  const activeTab = pathParts.length > 1 ? pathParts[1] : 'overview';

  // Helper function to get project area ID from user
  const getProjectAreaId = (user) => {
    if (!user) return null;
    // For engineer, their user ID is their project area ID
    if (user.role === 'engineer') {
      return user.projectAreaId || user.clinicId || user.id;
    }
    return user.projectAreaId || user.clinicId;
  };

  useEffect(() => {
    try {
      const projectAreaId = getProjectAreaId(user);
      console.log('REFRESH: EngineerDashboard useEffect - user:', user?.name, 'projectAreaId:', projectAreaId, 'dataLoaded:', dataLoaded);
      if (user && projectAreaId && !dataLoaded) {
        console.log('DATA: Loading project area data for the first time...');
        loadProjectAreaData();
      } else if (user && !projectAreaId) {
        console.warn('WARNING: User loaded but no projectAreaId found:', user);
        if (isMounted) {
          setLoading(false);
          setError('Project Area ID not found for this user');
        }
      } else if (user && projectAreaId && dataLoaded) {
        console.log('SUCCESS: Data already loaded, skipping reload');
        if (isMounted) {
          setLoading(false);
        }
      } else {
        console.log('⏳ Waiting for user data to load...');
      }
    } catch (error) {
      console.error('Error initializing EngineerDashboard:', error);
      if (isMounted) {
        setLoading(false);
        setError(error?.message || 'Failed to initialize dashboard');
      }
    }

    // Cleanup function
    return () => {
      setIsMounted(false);
    };
  }, [user, dataLoaded, isMounted]);

  const loadProjectAreaData = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('PROJECT_AREA: Loading project area data for user:', user);

      const projectAreaId = getProjectAreaId(user);
      if (!user || !projectAreaId) {
        console.error('ERROR: No project area ID found for user:', user);
        setError('Project Area ID not found');
        setLoading(false);
        return;
      }

      console.log('SUCCESS: Using projectAreaId:', projectAreaId, 'for user:', user?.name, 'role:', user?.role);

      // Get current user's project area data only
      let currentProjectArea = await DatabaseService.findById('project_areas', projectAreaId);

      // Fallback: try old table name for backwards compatibility
      if (!currentProjectArea) {
        console.warn('WARNING: Trying legacy clinics table...');
        currentProjectArea = await DatabaseService.findById('clinics', projectAreaId);
      }

      console.log('PROJECT_AREA: Fetched project area from database:', currentProjectArea);
      console.log(' Project Area phone:', currentProjectArea?.phone);
      console.log(' Project Area address:', currentProjectArea?.address);
      console.log(' Project Area contactPerson:', currentProjectArea?.contactPerson);

      if (!currentProjectArea) {
        console.warn('WARNING: Project area not found for ID:', projectAreaId, '- Creating new project area record');

        // Create project area record in database
        try {
          const newProjectArea = {
            id: projectAreaId,
            name: user.projectAreaName || user.clinicName || 'Default Project Area',
            email: user.email,
            contactPerson: user.name || '',
            phone: user.phone || '',
            address: '',
            adminName: user.name,
            createdAt: new Date().toISOString(),
            reportsUsed: 0,
            reportsAllowed: 50, // Default allowance
            subscriptionStatus: 'trial',
            isActive: true
          };

          currentProjectArea = await DatabaseService.add('project_areas', newProjectArea);
          console.log('SUCCESS: Created new project area record:', currentProjectArea.name);
        } catch (error) {
          console.error('ERROR: Failed to create project area record:', error);
          setError('Failed to create project area record');
          setLoading(false);
          return;
        }
      }

      console.log('SUCCESS: Found project area:', currentProjectArea.name, 'for user:', user.name);

      // Get ONLY this project area's supervisors and reports
      let projectAreaSupervisors = await DatabaseService.getSupervisorsByProjectArea(currentProjectArea.id) || [];

      // Fallback for old method name
      if (!projectAreaSupervisors || projectAreaSupervisors.length === 0) {
        projectAreaSupervisors = await DatabaseService.getSupervisorsByClinic(currentProjectArea.id) || [];
      }

      let projectAreaReports = await DatabaseService.getReportsByProjectArea(currentProjectArea.id) || [];

      // Fallback for old method name
      if (!projectAreaReports || projectAreaReports.length === 0) {
        projectAreaReports = await DatabaseService.getReportsByClinic(currentProjectArea.id) || [];
      }

      // If no supervisors in database but exist in localStorage, migrate them
      if (projectAreaSupervisors.length === 0) {
        console.log('REFRESH: No supervisors in database, checking localStorage for migration...');

        const localStorageSupervisors = JSON.parse(localStorage.getItem('supervisors') || '[]');
        const localStorageReports = JSON.parse(localStorage.getItem('reports') || '[]');

        const projectAreaSupervisorsFromLocal = localStorageSupervisors.filter(p =>
          p.projectAreaId === currentProjectArea.id ||
          p.clinicId === currentProjectArea.id ||
          String(p.projectAreaId) === String(currentProjectArea.id) ||
          String(p.clinicId) === String(currentProjectArea.id)
        );

        if (projectAreaSupervisorsFromLocal.length > 0) {
          console.log(`START: Migrating ${projectAreaSupervisorsFromLocal.length} supervisors to database...`);

          // Migrate supervisors
          for (const supervisor of projectAreaSupervisorsFromLocal) {
            try {
              await DatabaseService.add('supervisors', supervisor);
              console.log(`SUCCESS: Migrated supervisor: ${supervisor.name}`);
            } catch (error) {
              console.error(`ERROR: Failed to migrate supervisor ${supervisor.name}:`, error);
            }
          }

          // Migrate reports
          const projectAreaReportsFromLocal = localStorageReports.filter(r =>
            r.projectAreaId === currentProjectArea.id ||
            r.clinicId === currentProjectArea.id ||
            String(r.projectAreaId) === String(currentProjectArea.id) ||
            String(r.clinicId) === String(currentProjectArea.id)
          );

          for (const report of projectAreaReportsFromLocal) {
            try {
              // Ensure report has required fields
              const reportToMigrate = {
                ...report,
                id: report.id || `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                createdAt: report.createdAt || new Date().toISOString(),
                projectAreaId: currentProjectArea.id
              };

              await DatabaseService.add('reports', reportToMigrate);
              console.log(`SUCCESS: Migrated report: ${report.fileName}`);
            } catch (error) {
              console.error(`ERROR: Failed to migrate report ${report.fileName}:`, error);
            }
          }

          // Reload data after migration
          projectAreaSupervisors = await DatabaseService.getSupervisorsByProjectArea(currentProjectArea.id) ||
                                   await DatabaseService.getSupervisorsByClinic(currentProjectArea.id) || [];
          projectAreaReports = await DatabaseService.getReportsByProjectArea(currentProjectArea.id) ||
                              await DatabaseService.getReportsByClinic(currentProjectArea.id) || [];

          console.log(`SUCCESS: Migration complete! Supervisors: ${projectAreaSupervisors.length}, Reports: ${projectAreaReports.length}`);
        }
      }

      // Calculate project area usage
      const projectAreaUsage = {
        totalReports: projectAreaReports.length,
        reportsUsed: currentProjectArea?.reportsUsed || 0,
        reportsAllowed: currentProjectArea?.reportsAllowed || 10
      };

      console.log('DATA: Project area data loaded:', {
        projectArea: currentProjectArea.name,
        supervisors: projectAreaSupervisors.length,
        reports: projectAreaReports.length
      });

      setProjectArea(currentProjectArea);
      setSupervisors(projectAreaSupervisors);
      setReports(projectAreaReports);
      setUsage(projectAreaUsage);
      setDataLoaded(true); // Mark data as loaded
    } catch (error) {
      console.error('Error loading project area data:', error);
      setError(error?.message || 'Failed to load project area data');
    } finally {
      setLoading(false);
    }
  };

  // Separate refresh function that forces a reload
  const refreshProjectAreaData = async () => {
    console.log('REFRESH: Force refreshing project area data...');
    setDataLoaded(false); // This will trigger a reload
    await loadProjectAreaData();
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewTab projectArea={projectArea} clinic={projectArea} supervisors={supervisors} reports={reports} usage={usage} onRefresh={refreshProjectAreaData} />;
      case 'supervisors':
        console.log('ENGINEER: Rendering SupervisorManagement with projectAreaId:', projectArea?.id);
        return <SupervisorManagement key={`supervisors-${projectArea?.id}`} projectAreaId={projectArea?.id} clinicId={projectArea?.id} onUpdate={refreshProjectAreaData} />;
      case 'reports':
        return <ReportViewer projectAreaId={projectArea?.id} clinicId={projectArea?.id} supervisors={supervisors} reports={reports} onUpdate={refreshProjectAreaData} />;
      case 'usage':
        return <UsageTracking projectArea={projectArea} clinic={projectArea} usage={usage} />;
      case 'analytics':
        return <AdvancedAnalytics projectAreaId={projectArea?.id} clinicId={projectArea?.id} projectArea={projectArea} clinic={projectArea} />;
      case 'subscription':
        return <SubscriptionTab user={user} projectArea={projectArea} clinic={projectArea} />;
      // case 'settings':
      //   return <ProjectAreaSettings projectArea={projectArea} />;
      default:
        return <OverviewTab projectArea={projectArea} clinic={projectArea} supervisors={supervisors} reports={reports} usage={usage} onRefresh={refreshProjectAreaData} />;
    }
  };

  const getPageTitle = () => {
    switch (activeTab) {
      case 'overview': return 'Project Area Dashboard';
      case 'supervisors': return 'Supervisor Management';
      case 'reports': return 'Reports & Files';
      case 'usage': return 'Usage Tracking';
      case 'analytics': return 'Advanced Analytics';
      case 'subscription': return 'Subscription & Billing';
      // case 'settings': return 'Project Area Settings';
      default: return 'Project Area Dashboard';
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Loading...">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading Engineer Portal...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout title="Error">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
            <div>
              <h3 className="text-lg font-semibold text-red-800 dark:text-red-300">Error Loading Dashboard</h3>
              <p className="text-sm text-red-600 dark:text-red-400 mt-1">{error}</p>
              <button
                onClick={() => {
                  setDataLoaded(false);
                  loadProjectAreaData();
                }}
                className="mt-3 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                Retry
              </button>
            </div>
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
const UsageTracking = ({ projectArea, clinic, usage }) => {
  const area = projectArea || clinic;
  const usagePercentage = area?.reportsUsed && area?.reportsAllowed
    ? (area.reportsUsed / area.reportsAllowed) * 100
    : 0;

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Usage Overview</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-[#323956] dark:text-blue-400">{area?.reportsUsed || 0}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">P&ID Reports Used</div>
          </div>

          <div className="text-center">
            <div className="text-3xl font-bold text-[#323956] dark:text-blue-400">{area?.reportsAllowed || 10}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Reports Allowed</div>
          </div>

          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">{Math.max(0, (area?.reportsAllowed || 10) - (area?.reportsUsed || 0))}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Remaining</div>
          </div>
        </div>

        <div className="mt-6">
          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
            <span>Usage Progress</span>
            <span>{usagePercentage.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${
                usagePercentage >= 90 ? 'bg-red-500 dark:bg-red-600' :
                usagePercentage >= 70 ? 'bg-yellow-500 dark:bg-yellow-600' : 'bg-[#323956] dark:bg-blue-500'
              }`}
              style={{ width: `${Math.min(usagePercentage, 100)}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Project Area Settings Component
const ProjectAreaSettings = ({ projectArea, clinic }) => {
  const area = projectArea || clinic;

  const [formData, setFormData] = useState({
    name: area?.name || '',
    contactPerson: area?.contactPerson || area?.contact_person || '',
    email: area?.email || '',
    phone: area?.phone || '',
    address: area?.address || ''
  });
  const [loading, setLoading] = useState(false);
  const [originalData, setOriginalData] = useState({});

  useEffect(() => {
    if (area) {
      console.log('PROJECT_AREA: Loading project area data into form:', area);
      const areaData = {
        name: area.name || '',
        contactPerson: area.contactPerson || area.contact_person || '',
        email: area.email || '',
        phone: area.phone || '',
        address: area.address || ''
      };
      console.log('NOTE: Form data populated:', areaData);
      setFormData(areaData);
      setOriginalData(areaData); // Store original data for change tracking
    }
  }, [area]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const getChangedFields = () => {
    const changes = {};
    Object.keys(formData).forEach(key => {
      if (formData[key] !== originalData[key]) {
        changes[key] = {
          old: originalData[key],
          new: formData[key]
        };
      }
    });
    return changes;
  };

  const createProfileChangeAlert = async (changes) => {
    try {
      const changesList = Object.keys(changes).map(field => {
        const fieldNames = {
          name: 'Project Area Name',
          contactPerson: 'Contact Person',
          email: 'Email',
          phone: 'Phone',
          address: 'Address'
        };

        return `${fieldNames[field]}: "${changes[field].old}" → "${changes[field].new}"`;
      }).join('\n');

      const alert = {
        id: `alert_${Date.now()}`,
        type: 'profile_change',
        severity: 'info',
        title: `Profile Updated - ${area?.name}`,
        message: `Project area "${area?.name}" has updated their profile information:\n\n${changesList}`,
        projectAreaId: area?.id,
        clinicId: area?.id,
        projectAreaName: area?.name,
        clinicName: area?.name,
        changes: changes,
        createdAt: new Date().toISOString(),
        read: false,
        actionRequired: false
      };

      // Add alert to database
      await DatabaseService.add('alerts', alert);
      console.log('SUCCESS: Profile change alert created for super admin');
      
      return true;
    } catch (error) {
      console.error('ERROR: Failed to create profile change alert:', error);
      return false;
    }
  };

  const handleSaveChanges = async () => {
    if (!area?.id) {
      toast.error('Project area ID not found');
      return;
    }

    setLoading(true);
    try {
      // Get changed fields
      const changes = getChangedFields();

      if (Object.keys(changes).length === 0) {
        toast.info('No changes to save');
        setLoading(false);
        return;
      }

      // Update project area profile in database - try new table first, then old
      try {
        await DatabaseService.update('project_areas', area.id, formData);
      } catch (error) {
        console.warn('Trying legacy clinics table...');
        await DatabaseService.update('clinics', area.id, formData);
      }
      
      // Create alert for super admin
      const alertCreated = await createProfileChangeAlert(changes);
      
      // Update original data to reflect saved state
      setOriginalData({ ...formData });
      
      // Success message
      if (alertCreated) {
        toast.success('Profile updated successfully! Super Admin has been notified of the changes.');
      } else {
        toast.success('Profile updated successfully!');
      }
      
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const hasChanges = Object.keys(getChangedFields()).length > 0;

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Project Area Information</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Project Area Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Enter project area name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Contact Person</label>
            <input
              type="text"
              value={formData.contactPerson}
              onChange={(e) => handleInputChange('contactPerson', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Enter contact person name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Enter email address"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Phone</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Enter phone number"
            />
          </div>
        </div>

        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Address</label>
          <textarea
            value={formData.address}
            onChange={(e) => handleInputChange('address', e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
            placeholder="Enter project area address"
          />
        </div>

        {hasChanges && (
          <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
            <p className="text-sm text-yellow-800 dark:text-yellow-400">
              <strong>Pending Changes:</strong> You have unsaved changes. Click "Save Changes" to update your profile.
            </p>
          </div>
        )}

        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleSaveChanges}
            disabled={loading || !hasChanges}
            className={`px-6 py-2 rounded-lg transition-colors ${
              loading || !hasChanges
                ? 'bg-gray-400 dark:bg-gray-600 text-white cursor-not-allowed'
                : 'bg-primary-600 dark:bg-blue-600 text-white hover:bg-primary-700 dark:hover:bg-blue-700'
            }`}
          >
            {loading ? (
              <span className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Saving...</span>
              </span>
            ) : (
              'Save Changes'
            )}
          </button>

          {hasChanges && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Super Admin will be notified of these changes
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default EngineerDashboard;
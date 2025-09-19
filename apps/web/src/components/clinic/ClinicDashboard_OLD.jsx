import React, { useState, useEffect } from 'react';
import { 
  Users, 
  FileText, 
  Plus,
  AlertTriangle,
  CheckCircle,
  Download,
  Eye,
  Calendar,
  TrendingUp,
  Activity,
  CreditCard,
  LogOut
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import DatabaseService from '../../services/databaseService';
import PatientManagement from './PatientManagement';
import ReportViewer from './ReportViewer';

const ClinicDashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [clinic, setClinic] = useState(null);
  const [patients, setPatients] = useState([]);
  const [reports, setReports] = useState([]);
  const [usage, setUsage] = useState({});
  const [loading, setLoading] = useState(true);

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

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleLogout = async () => {
    await logout();
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'patients', label: 'Patients', icon: Users },
    { id: 'reports', label: 'Reports', icon: FileText }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading Clinic Portal...</p>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewTab clinic={clinic} patients={patients} reports={reports} usage={usage} onRefresh={loadClinicData} />;
      case 'patients':
        return <PatientManagement clinicId={clinic?.id} onUpdate={loadClinicData} />;
      case 'reports':
        return <ReportViewer clinicId={clinic?.id} patients={patients} reports={reports} onUpdate={loadClinicData} />;
      default:
        return <OverviewTab clinic={clinic} patients={patients} reports={reports} usage={usage} onRefresh={loadClinicData} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">NeuroSense360</h1>
              <span className="ml-3 px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium">
                Clinic Portal
              </span>
            </div>
            
            <div className="flex items-center space-x-4">
              {clinic && (
                <>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">{clinic.name}</div>
                    <div className="text-sm text-gray-500">
                      {clinic.reportsUsed || 0}/{clinic.reportsAllowed || 10} reports used
                    </div>
                  </div>
                  <UsageIndicator 
                    used={clinic.reportsUsed || 0} 
                    allowed={clinic.reportsAllowed || 10} 
                  />
                </>
              )}
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span className="text-sm font-medium">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="mb-8">
          <nav className="flex space-x-8">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex items-center space-x-2 px-3 py-2 font-medium text-sm rounded-md transition-colors ${
                  activeTab === tab.id
                    ? 'bg-primary-100 text-primary-700 border-primary-300'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        {renderContent()}
      </div>
    </div>
  );
};

// Usage Indicator Component
const UsageIndicator = ({ used, allowed }) => {
  const percentage = (used / allowed) * 100;
  const isWarning = percentage >= 80;
  const isError = percentage >= 100;

  return (
    <div className="flex items-center space-x-2">
      <div className="w-20 bg-gray-200 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all ${
            isError ? 'bg-red-500' : isWarning ? 'bg-yellow-500' : 'bg-green-500'
          }`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        ></div>
      </div>
      {isError && <AlertTriangle className="h-4 w-4 text-red-500" />}
      {isWarning && !isError && <AlertTriangle className="h-4 w-4 text-yellow-500" />}
    </div>
  );
};

// Overview Tab Component
const OverviewTab = ({ clinic, patients, reports, usage, onRefresh }) => {
  const recentReports = reports.slice(-5).reverse();
  const recentPatients = patients.slice(-3).reverse();

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Patients</p>
              <p className="text-2xl font-bold text-gray-900">{patients.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <FileText className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Reports</p>
              <p className="text-2xl font-bold text-gray-900">{reports.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Reports Used</p>
              <p className="text-2xl font-bold text-gray-900">{clinic?.reportsUsed || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <CreditCard className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Reports Remaining</p>
              <p className="text-2xl font-bold text-gray-900">
                {(clinic?.reportsAllowed || 10) - (clinic?.reportsUsed || 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Usage Alert */}
      {clinic && (clinic.reportsUsed || 0) >= (clinic.reportsAllowed || 10) * 0.8 && (
        <div className={`rounded-lg p-4 ${
          (clinic.reportsUsed || 0) >= (clinic.reportsAllowed || 10) 
            ? 'bg-red-50 border border-red-200' 
            : 'bg-yellow-50 border border-yellow-200'
        }`}>
          <div className="flex">
            <AlertTriangle className={`h-5 w-5 ${
              (clinic.reportsUsed || 0) >= (clinic.reportsAllowed || 10) 
                ? 'text-red-400' 
                : 'text-yellow-400'
            }`} />
            <div className="ml-3">
              <h3 className={`text-sm font-medium ${
                (clinic.reportsUsed || 0) >= (clinic.reportsAllowed || 10) 
                  ? 'text-red-800' 
                  : 'text-yellow-800'
              }`}>
                {(clinic.reportsUsed || 0) >= (clinic.reportsAllowed || 10) 
                  ? 'Report Limit Reached' 
                  : 'Report Limit Warning'
                }
              </h3>
              <p className={`mt-1 text-sm ${
                (clinic.reportsUsed || 0) >= (clinic.reportsAllowed || 10) 
                  ? 'text-red-700' 
                  : 'text-yellow-700'
              }`}>
                {(clinic.reportsUsed || 0) >= (clinic.reportsAllowed || 10) 
                  ? 'You have used all your allocated reports. Please contact support to purchase more reports.'
                  : `You have used ${clinic.reportsUsed || 0} out of ${clinic.reportsAllowed || 10} reports. Consider purchasing additional reports soon.`
                }
              </p>
              <div className="mt-3">
                <button className={`text-sm font-medium ${
                  (clinic.reportsUsed || 0) >= (clinic.reportsAllowed || 10) 
                    ? 'text-red-800 hover:text-red-900' 
                    : 'text-yellow-800 hover:text-yellow-900'
                }`}>
                  Purchase More Reports →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Reports */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Recent Reports</h3>
            <button 
              onClick={() => {/* Navigate to reports tab */}}
              className="text-sm text-primary-600 hover:text-primary-800 font-medium"
            >
              View all
            </button>
          </div>
          
          <div className="space-y-4">
            {recentReports.length > 0 ? (
              recentReports.map(report => {
                const patient = patients.find(p => p.id === report.patientId);
                return (
                  <div key={report.id} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                    <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                      <FileText className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {report.fileName || 'EEG Report'}
                      </p>
                      <p className="text-sm text-gray-500">
                        {patient?.name || 'Unknown Patient'}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button className="text-gray-400 hover:text-gray-600">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button className="text-gray-400 hover:text-gray-600">
                        <Download className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No reports yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Patients */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Recent Patients</h3>
            <button 
              onClick={() => {/* Navigate to patients tab */}}
              className="text-sm text-primary-600 hover:text-primary-800 font-medium"
            >
              View all
            </button>
          </div>
          
          <div className="space-y-4">
            {recentPatients.length > 0 ? (
              recentPatients.map(patient => (
                <div key={patient.id} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                  <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                    <Users className="h-5 w-5 text-primary-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{patient.name}</p>
                    <p className="text-sm text-gray-500">
                      {patient.age} years • {patient.gender}
                    </p>
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date(patient.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">No patients yet</p>
                <button className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium text-sm">
                  Add First Patient
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <Plus className="h-6 w-6 text-gray-600 mb-2" />
            <span className="text-sm font-medium text-gray-900">Add Patient</span>
          </button>
          
          <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <FileText className="h-6 w-6 text-gray-600 mb-2" />
            <span className="text-sm font-medium text-gray-900">View Reports</span>
          </button>
          
          <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <CreditCard className="h-6 w-6 text-gray-600 mb-2" />
            <span className="text-sm font-medium text-gray-900">Buy Reports</span>
          </button>
          
          <button 
            onClick={onRefresh}
            className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Activity className="h-6 w-6 text-gray-600 mb-2" />
            <span className="text-sm font-medium text-gray-900">Refresh</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClinicDashboard;
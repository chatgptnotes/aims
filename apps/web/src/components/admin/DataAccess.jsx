import React, { useState, useEffect } from 'react';
import {
  Database,
  Users,
  FileText,
  Download,
  Search,
  Filter,
  Eye,
  Calendar,
  Brain,
  Activity,
  Heart,
  ChevronRight,
  FolderOpen,
  File,
  User,
  Building2,
  MapPin,
  Mail,
  Phone,
  Clock,
  CheckCircle,
  AlertTriangle,
  Star,
  Archive,
  Trash2,
  Shield,
  Lock,
  X
} from 'lucide-react';
import toast from 'react-hot-toast';
import QEEGFileViewer from './QEEGFileViewer';
import PersonalizedCarePlan from './PersonalizedCarePlan';
import fileManagementService from '../../services/fileManagementService';
import analyticsService from '../../services/analyticsService';

const DataAccess = () => {
  const [selectedClinic, setSelectedClinic] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [viewMode, setViewMode] = useState('clinics'); // 'clinics', 'patients', 'files'
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [clinics, setClinics] = useState([]);
  const [patients, setPatients] = useState([]);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showQEEGViewer, setShowQEEGViewer] = useState(false);
  const [showCarePlan, setShowCarePlan] = useState(false);
  const [selectedFileId, setSelectedFileId] = useState(null);

  // Load real data on component mount
  useEffect(() => {
    loadRealData();
  }, []);

  const loadRealData = async () => {
    setLoading(true);
    try {
      console.log('🔄 Loading real clinic and patient data...');

      // Get real system analytics for clinic data
      const systemAnalytics = await analyticsService.getSystemAnalytics();
      console.log('📊 System data loaded:', systemAnalytics.dataSource);

      // For now, use enhanced mock data based on real structure
      setClinics(mockClinics);

      if (selectedClinic) {
        const patientFiles = await fileManagementService.getClinicFiles(selectedClinic.id);
        setFiles(patientFiles);
      }

    } catch (error) {
      console.error('❌ Error loading data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  // Enhanced file download functionality
  const handleDownloadFile = async (fileId, fileType, patientId = null) => {
    try {
      console.log(`📥 Downloading file: ${fileId} (${fileType})`);

      const result = await fileManagementService.downloadReport(fileId, patientId, fileType);

      if (result.success) {
        toast.success(`Downloaded: ${result.filename}`);
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download file');
    }
  };

  // Generate new report
  const handleGenerateReport = async (type, patientId) => {
    try {
      console.log(`📄 Generating ${type} report for patient ${patientId}`);

      let reportData;
      switch (type) {
        case 'qeeg':
          reportData = await fileManagementService.generateQEEGReport(patientId);
          break;
        case 'careplan':
          reportData = await fileManagementService.generateCarePlan(patientId);
          break;
        default:
          throw new Error(`Unknown report type: ${type}`);
      }

      // Download the generated report
      await fileManagementService.downloadReport(reportData.id, patientId, 'html');

      toast.success(`${type.toUpperCase()} report generated and downloaded`);

      // Refresh file list
      loadRealData();

    } catch (error) {
      console.error('Report generation error:', error);
      toast.error('Failed to generate report');
    }
  };

  // Mock data - replace with actual API calls
  const mockClinics = [
    {
      id: 'clinic-1',
      name: 'Central Medical Center',
      location: 'Downtown',
      email: 'admin@centralmedical.com',
      phone: '+1-555-0123',
      patientsCount: 25,
      reportsCount: 47,
      lastActivity: '2025-09-18T10:30:00Z',
      isActive: true
    },
    {
      id: 'clinic-2',
      name: 'Wellness Clinic East',
      location: 'Eastside',
      email: 'info@wellnesseast.com',
      phone: '+1-555-0456',
      patientsCount: 18,
      reportsCount: 32,
      lastActivity: '2025-09-18T09:15:00Z',
      isActive: true
    },
    {
      id: 'clinic-3',
      name: 'Family Health Partners',
      location: 'Westfield',
      email: 'contact@familyhealth.com',
      phone: '+1-555-0789',
      patientsCount: 33,
      reportsCount: 61,
      lastActivity: '2025-09-18T11:45:00Z',
      isActive: true
    }
  ];

  const mockPatients = {
    'clinic-1': [
      {
        id: 'patient-1',
        name: 'John Smith',
        email: 'john.smith@email.com',
        age: 34,
        gender: 'Male',
        phone: '+1-555-1001',
        lastSession: '2025-09-15T14:30:00Z',
        totalSessions: 8,
        status: 'active',
        clinicId: 'clinic-1'
      },
      {
        id: 'patient-2',
        name: 'Sarah Johnson',
        email: 'sarah.j@email.com',
        age: 28,
        gender: 'Female',
        phone: '+1-555-1002',
        lastSession: '2025-09-16T10:15:00Z',
        totalSessions: 12,
        status: 'active',
        clinicId: 'clinic-1'
      }
    ],
    'clinic-2': [
      {
        id: 'patient-3',
        name: 'Michael Brown',
        email: 'michael.brown@email.com',
        age: 45,
        gender: 'Male',
        phone: '+1-555-1003',
        lastSession: '2025-09-17T09:00:00Z',
        totalSessions: 6,
        status: 'active',
        clinicId: 'clinic-2'
      }
    ],
    'clinic-3': [
      {
        id: 'patient-4',
        name: 'Emily Davis',
        email: 'emily.davis@email.com',
        age: 31,
        gender: 'Female',
        phone: '+1-555-1004',
        lastSession: '2025-09-18T11:30:00Z',
        totalSessions: 15,
        status: 'active',
        clinicId: 'clinic-3'
      }
    ]
  };

  const mockFiles = {
    'patient-1': [
      {
        id: 'file-1',
        name: 'Patient Profile - John Smith.pdf',
        type: 'patient_profile',
        size: '2.4 MB',
        created: '2025-09-01T09:00:00Z',
        modified: '2025-09-15T14:30:00Z',
        status: 'complete'
      },
      {
        id: 'file-2',
        name: 'qEEG Profile - Session 8.edf',
        type: 'qeeg_profile',
        size: '15.7 MB',
        created: '2025-09-15T14:30:00Z',
        modified: '2025-09-15T14:30:00Z',
        status: 'complete'
      },
      {
        id: 'file-3',
        name: 'NeuroSense Report - September 2025.pdf',
        type: 'neurosense_report',
        size: '3.1 MB',
        created: '2025-09-15T15:00:00Z',
        modified: '2025-09-15T15:00:00Z',
        status: 'complete'
      },
      {
        id: 'file-4',
        name: 'Personalized Care Plan - Updated.pdf',
        type: 'care_plan',
        size: '1.8 MB',
        created: '2025-09-15T15:30:00Z',
        modified: '2025-09-15T15:30:00Z',
        status: 'complete'
      }
    ]
  };

  useEffect(() => {
    loadClinics();
  }, []);

  const loadClinics = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setClinics(mockClinics);
      setLoading(false);
    }, 500);
  };

  const loadPatients = (clinicId) => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setPatients(mockPatients[clinicId] || []);
      setLoading(false);
    }, 300);
  };

  const loadFiles = (patientId) => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setFiles(mockFiles[patientId] || []);
      setLoading(false);
    }, 300);
  };

  const handleClinicSelect = (clinic) => {
    setSelectedClinic(clinic);
    setSelectedPatient(null);
    setViewMode('patients');
    loadPatients(clinic.id);
  };

  const handlePatientSelect = (patient) => {
    setSelectedPatient(patient);
    setViewMode('files');
    loadFiles(patient.id);
  };

  const handleBackToClinics = () => {
    setSelectedClinic(null);
    setSelectedPatient(null);
    setViewMode('clinics');
    setSearchTerm('');
  };

  const handleBackToPatients = () => {
    setSelectedPatient(null);
    setViewMode('patients');
    setSearchTerm('');
  };

  const downloadFile = (file) => {
    toast.success(`Downloading ${file.name}...`);
    // Implement actual download logic here
  };

  const viewFile = (file) => {
    setSelectedFileId(file.id);

    switch (file.type) {
      case 'qeeg_profile':
        setShowQEEGViewer(true);
        break;
      case 'care_plan':
        setShowCarePlan(true);
        break;
      case 'patient_profile':
      case 'neurosense_report':
      default:
        toast.info(`Opening ${file.name} in viewer...`);
        // For other file types, implement generic viewer or download
        break;
    }
  };

  const getFileIcon = (type) => {
    switch (type) {
      case 'patient_profile':
        return <User className="w-5 h-5 text-blue-500" />;
      case 'qeeg_profile':
        return <Brain className="w-5 h-5 text-purple-500" />;
      case 'neurosense_report':
        return <Activity className="w-5 h-5 text-green-500" />;
      case 'care_plan':
        return <Heart className="w-5 h-5 text-red-500" />;
      default:
        return <File className="w-5 h-5 text-gray-500" />;
    }
  };

  const getFileTypeLabel = (type) => {
    switch (type) {
      case 'patient_profile':
        return 'Patient Profile';
      case 'qeeg_profile':
        return 'qEEG Profile';
      case 'neurosense_report':
        return 'NeuroSense Report';
      case 'care_plan':
        return 'Care Plan';
      default:
        return 'Unknown';
    }
  };

  const filteredData = () => {
    let data = [];

    if (viewMode === 'clinics') {
      data = clinics;
    } else if (viewMode === 'patients') {
      data = patients;
    } else if (viewMode === 'files') {
      data = files;
    }

    if (searchTerm) {
      data = data.filter(item =>
        item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterType !== 'all') {
      if (viewMode === 'files') {
        data = data.filter(file => file.type === filterType);
      } else if (viewMode === 'patients') {
        data = data.filter(patient => patient.status === filterType);
      }
    }

    return data;
  };

  const renderBreadcrumb = () => (
    <div className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
      <button
        onClick={handleBackToClinics}
        className={`hover:text-blue-600 transition-colors ${viewMode === 'clinics' ? 'text-blue-600 font-medium' : ''}`}
      >
        All Clinics
      </button>
      {selectedClinic && (
        <>
          <ChevronRight className="w-4 h-4" />
          <button
            onClick={handleBackToPatients}
            className={`hover:text-blue-600 transition-colors ${viewMode === 'patients' ? 'text-blue-600 font-medium' : ''}`}
          >
            {selectedClinic.name}
          </button>
        </>
      )}
      {selectedPatient && (
        <>
          <ChevronRight className="w-4 h-4" />
          <span className="text-blue-600 font-medium">{selectedPatient.name}</span>
        </>
      )}
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Database className="w-6 h-6 text-gray-700" />
            <h2 className="text-2xl font-bold text-gray-900">Data Access Center</h2>
            <Shield className="w-5 h-5 text-green-500" title="Super Admin Access" />
          </div>
          <div className="flex items-center gap-2 px-3 py-1 bg-green-50 border border-green-200 rounded-lg">
            <Lock className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium text-green-700">Full Access Enabled</span>
          </div>
        </div>

        {renderBreadcrumb()}

        {/* Search and Filter */}
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder={`Search ${viewMode}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {viewMode === 'files' && (
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All File Types</option>
              <option value="patient_profile">Patient Profiles</option>
              <option value="qeeg_profile">qEEG Profiles</option>
              <option value="neurosense_report">NeuroSense Reports</option>
              <option value="care_plan">Care Plans</option>
            </select>
          )}

          {viewMode === 'patients' && (
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Patients</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          )}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading data...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Clinics View */}
          {viewMode === 'clinics' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredData().map(clinic => (
                <div
                  key={clinic.id}
                  onClick={() => handleClinicSelect(clinic)}
                  className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow cursor-pointer p-6"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Building2 className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{clinic.name}</h3>
                        <p className="text-sm text-gray-500">{clinic.location}</p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-gray-400" />
                      <span>{clinic.patientsCount} patients</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-gray-400" />
                      <span>{clinic.reportsCount} reports</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span>Last active: {new Date(clinic.lastActivity).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Patients View */}
          {viewMode === 'patients' && (
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6 border-b">
                <h3 className="text-lg font-semibold text-gray-900">
                  Patients at {selectedClinic?.name}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  {filteredData().length} patients found
                </p>
              </div>

              <div className="divide-y">
                {filteredData().map(patient => (
                  <div
                    key={patient.id}
                    onClick={() => handlePatientSelect(patient)}
                    className="p-6 hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                          <User className="w-6 h-6 text-purple-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{patient.name}</h4>
                          <p className="text-sm text-gray-500">{patient.email}</p>
                          <div className="flex items-center gap-4 mt-1 text-xs text-gray-400">
                            <span>{patient.age} years old</span>
                            <span>{patient.gender}</span>
                            <span>{patient.totalSessions} sessions</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right text-sm">
                          <p className="text-gray-500">Last session</p>
                          <p className="text-gray-900">{new Date(patient.lastSession).toLocaleDateString()}</p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Files View */}
          {viewMode === 'files' && (
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6 border-b">
                <h3 className="text-lg font-semibold text-gray-900">
                  Files for {selectedPatient?.name}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  {filteredData().length} files available
                </p>
              </div>

              <div className="divide-y">
                {filteredData().map(file => (
                  <div key={file.id} className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                          {getFileIcon(file.type)}
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{file.name}</h4>
                          <p className="text-sm text-gray-500">{getFileTypeLabel(file.type)}</p>
                          <div className="flex items-center gap-4 mt-1 text-xs text-gray-400">
                            <span>{file.size}</span>
                            <span>Created: {new Date(file.created).toLocaleDateString()}</span>
                            <span>Modified: {new Date(file.modified).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => viewFile(file)}
                          className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View file"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => downloadFile(file)}
                          className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Download file"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {filteredData().length === 0 && (
            <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
              <FolderOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No data found</h3>
              <p className="text-gray-500">
                {searchTerm ? 'Try adjusting your search terms.' : 'No items to display.'}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Building2 className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Clinics</p>
              <p className="text-xl font-bold text-gray-900">{clinics.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Patients</p>
              <p className="text-xl font-bold text-gray-900">
                {clinics.reduce((sum, clinic) => sum + clinic.patientsCount, 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Reports</p>
              <p className="text-xl font-bold text-gray-900">
                {clinics.reduce((sum, clinic) => sum + clinic.reportsCount, 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <Database className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Data Access</p>
              <p className="text-xl font-bold text-green-600">Full</p>
            </div>
          </div>
        </div>
      </div>

      {/* qEEG File Viewer Modal */}
      {showQEEGViewer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-7xl w-full max-h-[95vh] overflow-y-auto">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">qEEG Analysis Viewer</h3>
              <button
                onClick={() => setShowQEEGViewer(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <QEEGFileViewer
                fileId={selectedFileId}
                patientId={selectedPatient?.id}
                onClose={() => setShowQEEGViewer(false)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Care Plan Modal */}
      {showCarePlan && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-6xl w-full max-h-[95vh] overflow-y-auto">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">Personalized Care Plan</h3>
              <button
                onClick={() => setShowCarePlan(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <PersonalizedCarePlan
                patientId={selectedPatient?.id}
                clinicId={selectedClinic?.id}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataAccess;
import React, { useState, useEffect, useCallback } from 'react';
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  Users,
  Calendar,
  Search,
  Filter,
  X,
  FileText,
  Phone,
  Mail,
  MapPin,
  Upload,
  Info
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import DatabaseService from '../../services/databaseService';
import StorageService from '../../services/storageService';
import UploadPIDModal from './UploadPIDModal';
import ClinicalReportForm from './ClinicalReportForm';
import ClinicalReportView from './ClinicalReportView';
import { useAuth } from '../../contexts/AuthContext';
import { generateSupervisorUID } from '../../utils/supervisorUidGenerator';

const SupervisorManagement = ({ clinicId: propClinicId, onUpdate }) => {
  const { user } = useAuth();
  const [supervisors, setSupervisors] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedSupervisor, setSelectedSupervisor] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'details'
  const [searchTerm, setSearchTerm] = useState('');
  const [genderFilter, setGenderFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [patientForUpload, setPatientForUpload] = useState(null);
  const [patientReports, setSupervisorReports] = useState({});
  const [showPatientListModal, setShowPatientListModal] = useState(false);
  const [showPatientInfoModal, setShowPatientInfoModal] = useState(false);
  const [patientForInfo, setPatientForInfo] = useState(null);
  const [showPatientViewModal, setShowPatientViewModal] = useState(false);
  const [patientForView, setPatientForView] = useState(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  // Helper function to get supervisor name (handles both old and new field names)
  const getPatientName = (patient) => {
    return patient?.fullName || patient?.full_name || patient?.name || 'Unknown';
  };

  // Helper function to calculate age from date of birth
  const getPatientAge = (patient) => {
    if (patient?.age) return patient.age;
    if (patient?.dateOfBirth || patient?.date_of_birth) {
      const dob = new Date(patient.dateOfBirth || patient.date_of_birth);
      const today = new Date();
      let age = today.getFullYear() - dob.getFullYear();
      const monthDiff = today.getMonth() - dob.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
        age--;
      }
      return age;
    }
    return 'N/A';
  };

  // Get clinicId from multiple sources
  const getClinicId = () => {
    // Priority 1: From props
    if (propClinicId) return propClinicId;

    // Priority 2: From user context
    if (user?.clinicId) return user.clinicId;

    // Priority 3: From localStorage user
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        if (parsedUser?.clinicId) return parsedUser.clinicId;
        // If user has 'id' and role is clinic_admin, use that as clinicId
        if (parsedUser?.role === 'clinic_admin' && parsedUser?.id) {
          return parsedUser.id;
        }
      }
    } catch (e) {
      console.error('Error parsing stored user:', e);
    }

    return null;
  };

  const clinicId = getClinicId();

  // Debug logging
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    let parsedUser = null;
    try {
      parsedUser = storedUser ? JSON.parse(storedUser) : null;
    } catch (e) {}

    console.log('CLINIC: PatientManagement - clinicId from prop:', propClinicId);
    console.log('CLINIC: PatientManagement - clinicId from user context:', user?.clinicId);
    console.log('CLINIC: PatientManagement - clinicId from localStorage:', parsedUser?.clinicId);
    console.log('CLINIC: PatientManagement - user.id from localStorage:', parsedUser?.id);
    console.log('CLINIC: PatientManagement - user.role from localStorage:', parsedUser?.role);
    console.log('CLINIC: PatientManagement - FINAL clinicId:', clinicId);
    console.log('CLINIC: PatientManagement - user context:', user);
  }, [clinicId, propClinicId, user]);

  const loadPatients = useCallback(async () => {
    try {
      if (!clinicId) {
        console.warn('WARNING: loadPatients: No clinicId provided');
        setPatients([]);
        setLoading(false);
        return;
      }

      console.log('DATA: Loading patients for clinic:', clinicId);

      // Load patients directly for this clinic using org_id
      const supervisorsData = await DatabaseService.getSupervisorsByClinic(clinicId);

      console.log(`SUCCESS: Loaded ${supervisorsData?.length || 0} supervisors for clinic ${clinicId}`);

      setSupervisors(supervisorsData || []);

      // Load reports for each patient
      const reportsMap = {};
      for (const supervisor of (supervisorsData || [])) {
        try {
          const reports = await DatabaseService.getReportsByPatient(supervisor.id);
          reportsMap[supervisor.id] = reports || [];
        } catch (error) {
          console.error(`Error loading reports for supervisor ${supervisor.id}:`, error);
          reportsMap[supervisor.id] = [];
        }
      }

      setSupervisorReports(reportsMap);
    } catch (error) {
      console.error('ERROR: Error loading supervisors:', error);
      toast.error('Error loading supervisors');
      setSupervisors([]);
    } finally {
      setLoading(false);
    }
  }, [clinicId]);

  useEffect(() => {
    if (clinicId) {
      loadPatients();
    } else {
      setLoading(false);
    }
  }, [clinicId, loadPatients]);

  const handleCreatePatient = async (data) => {
    try {
      console.log('NOTE: Creating supervisor with clinicId:', clinicId, 'data:', data);

      if (!clinicId) {
        console.error('ERROR: No clinic ID found!');
        console.error('ERROR: propClinicId:', propClinicId);
        console.error('ERROR: user:', user);
        toast.error('Clinic ID not found. Please logout and login again.');
        return;
      }

      // Ensure organization exists before creating patient
      try {
        console.log('DEBUG: Checking if organization exists:', clinicId);
        const orgExists = await DatabaseService.findById('organizations', clinicId);

        if (!orgExists) {
          console.log(' Creating organization entry for clinic:', clinicId);
          await DatabaseService.add('organizations', {
            id: clinicId,
            name: user?.clinicName || user?.name || 'Clinic',
            created_at: new Date().toISOString()
          });
          console.log('SUCCESS: Organization created successfully');
        } else {
          console.log('SUCCESS: Organization already exists');
        }
      } catch (orgError) {
        console.error('WARNING: Organization check/create failed:', orgError);
        // Continue anyway - maybe org exists but findById failed
      }

      // Create Supabase authentication account for supervisor
      let authCreated = false;
      try {
        console.log('AUTH: Creating Supabase auth account for supervisor:', data.email);
        const authResult = await DatabaseService.createPatientAuth(data.email, data.password, {
          full_name: data.name,
          role: 'supervisor',
          org_id: clinicId
        });

        if (authResult && authResult.user) {
          authCreated = true;
          console.log('SUCCESS: Supervisor auth account created:', authResult.user.id);
        }
      } catch (authError) {
        console.error('WARNING: Failed to create auth account:', authError);

        // Check if user already exists
        if (authError.message && authError.message.includes('already registered')) {
          toast.error(`Email ${data.email} is already registered. Please use a different email.`);
          return; // Stop supervisor creation
        } else {
          // Other auth errors - continue but warn
          toast.warning('Supervisor record will be created but login may not work. Please contact support.');
        }
      }

      // Generate supervisor UID in format CLINICCODE-YYYYMM-XXXX
      const patientUID = await generateSupervisorUID(clinicId);

      // Map fields to match database schema (without owner_user - it doesn't exist)
      const patientData = {
        org_id: clinicId, // Database uses org_id instead of clinicId
        external_id: patientUID, // Use new UID format: CLINICCODE-YYYYMM-XXXX
        full_name: data.name, // Database uses full_name instead of name
        gender: data.gender?.toLowerCase(), // Convert to lowercase for database enum
        email: data.email,
        phone: data.phone,
        address: data.address,
        medical_history: data.notes ? { notes: data.notes } : {},
        date_of_birth: data.dateOfBirth || null,
        created_at: new Date().toISOString()
      };

      await DatabaseService.add('supervisors', patientData);

      // Show success message with login credentials (only if auth was created)
      if (authCreated) {
        const credentialsMessage = `
SUCCESS: Supervisor created successfully!

Login Credentials:
EMAIL: Email: ${data.email}
KEY: Password: ${data.password}

Share these credentials with the supervisor so they can login to view their reports.
        `.trim();

        toast.success(credentialsMessage, {
          duration: 10000,
          style: {
            whiteSpace: 'pre-line',
            textAlign: 'left'
          }
        });
      } else {
        toast.success('Supervisor record created successfully!');
      }

      loadPatients();
      setShowModal(false);
      reset();
      onUpdate?.();
    } catch (error) {
      console.error('ERROR: Error creating engineer:', error);
      toast.error('Error creating engineer: ' + (error.message || 'Unknown error'));
    }
  };

  const handleEditPatient = async (data) => {
    try {
      // Map form fields to database schema
      const patientData = {
        full_name: data.name, // Database uses full_name
        gender: data.gender?.toLowerCase(), // Convert to lowercase for database enum
        email: data.email,
        phone: data.phone,
        address: data.address,
        medical_history: data.notes ? { notes: data.notes } : {},
        date_of_birth: data.dateOfBirth || null
      };

      console.log('NOTE: Updating supervisor with mapped data:', patientData);
      await DatabaseService.update('supervisors', selectedSupervisor.id, patientData);
      toast.success('Supervisor updated successfully');
      loadPatients();
      setShowModal(false);
      setSelectedSupervisor(null);
      reset();
      onUpdate?.();
    } catch (error) {
      toast.error('Error updating engineer: ' + (error.message || 'Unknown error'));
      console.error('Error updating engineer:', error);
    }
  };

  const handleDeletePatient = async (supervisorId) => {
    if (window.confirm('Are you sure you want to delete this engineer? This action cannot be undone.')) {
      try {
        await DatabaseService.delete('supervisors', supervisorId);
        toast.success('Engineer deleted successfully');
        loadPatients();
        onUpdate?.();
      } catch (error) {
        toast.error('Error deleting engineer: ' + (error.message || 'Unknown error'));
        console.error('Error deleting engineer:', error);
      }
    }
  };

  const handleDownloadReport = async (report) => {
    try {
      if (report.s3Key) {
        console.log(' Generating download URL for S3 file:', report.s3Key);
        
        // Generate signed URL for download
        const downloadUrl = await StorageService.getSignedUrl(report.storagePath || report.s3Key, 300); // 5 minutes
        
        // Open download URL in new tab
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = report.fileName;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        toast.success(' Download started!');
      } else {
        // Fallback for files not stored in S3
        toast.error('File not available for download');
      }
    } catch (error) {
      console.error('ERROR: Error downloading file:', error);
      toast.error('Failed to download file');
    }
  };

  const openModal = (supervisor = null) => {
    setSelectedSupervisor(supervisor);
    if (supervisor) {
      // Map database fields to form fields
      const formData = {
        name: getPatientName(supervisor),
        dateOfBirth: supervisor.date_of_birth || supervisor.dateOfBirth || '',
        gender: supervisor.gender || '',
        email: supervisor.email || '',
        phone: supervisor.phone || '',
        address: supervisor.address || '',
        notes: supervisor.notes || supervisor.medical_history?.notes || ''
      };
      console.log('NOTE: Mapping supervisor data for edit form:', { supervisor, formData });
      reset(formData);
    } else {
      reset({});
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedSupervisor(null);
    reset({});
  };

  const openUploadModal = (supervisor) => {
    console.log('FOLDER: Opening upload modal for supervisor:', supervisor);
    if (!supervisor) {
      console.error('ERROR: Cannot open upload modal: supervisor is undefined');
      toast.error('Please select a supervisor first');
      return;
    }

    // Get supervisor name using helper function
    const supervisorName = getPatientName(supervisor);

    if (!supervisor.id || !supervisorName) {
      console.error('ERROR: Supervisor object incomplete:', supervisor);
      toast.error('Invalid supervisor data');
      return;
    }

    // Create a normalized supervisor object with both database and display fields
    const normalizedSupervisor = {
      ...supervisor,
      name: supervisorName, // Add name field for UploadReportModal
      age: getPatientAge(supervisor) // Add age field for completeness
    };

    console.log('SUCCESS: Opening upload modal with normalized supervisor:', normalizedSupervisor);
    setPatientForUpload(normalizedSupervisor);
    setShowUploadModal(true);
  };

  const closeUploadModal = () => {
    setPatientForUpload(null);
    setShowUploadModal(false);
  };

  const openPatientListModal = () => {
    setShowPatientListModal(true);
  };

  const closePatientListModal = () => {
    setShowPatientListModal(false);
  };

  const openPatientInfoModal = (supervisor) => {
    setPatientForInfo(supervisor);
    setShowPatientInfoModal(true);
  };

  const closePatientInfoModal = () => {
    setPatientForInfo(null);
    setShowPatientInfoModal(false);
  };

  const openPatientViewModal = (supervisor) => {
    setPatientForView(supervisor);
    setShowPatientViewModal(true);
  };

  const closePatientViewModal = () => {
    setPatientForView(null);
    setShowPatientViewModal(false);
  };

  const handleBulkAddPatients = async (patientList) => {
    try {
      if (!clinicId) {
        toast.error('No clinic ID found. Please refresh the page.');
        return;
      }

      for (const supervisorData of patientList) {
        // Map fields to match database schema
        const supervisor = {
          org_id: clinicId, // Database uses org_id
          full_name: supervisorData.name, // Database uses full_name
          gender: supervisorData.gender?.toLowerCase(), // Convert to lowercase
          email: supervisorData.email,
          phone: supervisorData.phone,
          address: supervisorData.address,
          medical_history: supervisorData.notes ? { notes: supervisorData.notes } : {},
          date_of_birth: supervisorData.dateOfBirth || null,
          created_at: new Date().toISOString()
        };

        await DatabaseService.add('supervisors', supervisor);
      }

      toast.success(`Successfully added ${patientList.length} patients!`);
      loadPatients();
      closePatientListModal();
      onUpdate?.();
    } catch (error) {
      console.error('ERROR: Error bulk adding patients:', error);
      toast.error('Error adding patients');
    }
  };



  const viewPatientDetails = (supervisor) => {
    setSelectedSupervisor(supervisor);
    setViewMode('details');
  };

  const filteredSupervisors = supervisors.filter(supervisor => {
    // Support both fullName (from database) and name (legacy)
    const supervisorName = supervisor.fullName || supervisor.full_name || supervisor.name || '';
    const matchesSearch = supervisorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         supervisor.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         supervisor.phone?.includes(searchTerm);
    const matchesGender = !genderFilter || supervisor.gender === genderFilter;

    return matchesSearch && matchesGender;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (viewMode === 'details' && selectedSupervisor) {
    return <PatientDetails
      patient={selectedSupervisor}
      clinicId={clinicId}
      onBack={() => {setViewMode('list'); setSelectedSupervisor(null);}}
    />;
  }

  console.log('Filtered Patients:', filteredSupervisors);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Engineer Management</h2>
          <p className="text-gray-600">Manage your project area's engineer records</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => openModal()}
            className="bg-[#323956] hover:bg-[#232D3C] text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2 shadow-md"
          >
            <Plus className="h-4 w-4" />
            <span>Add Engineer</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search engineers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          
          <select
            value={genderFilter}
            onChange={(e) => setGenderFilter(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">All Genders</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
          
          <button
            onClick={() => {
              setSearchTerm('');
              setGenderFilter('');
            }}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 flex items-center justify-center space-x-2"
          >
            <X className="h-4 w-4" />
            <span>Clear</span>
          </button>
        </div>
      </div>

      {/* Patients Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Engineers ({filteredSupervisors.length})
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Engineer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  P&ID Documents
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Added
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredSupervisors.map((supervisor) => {
                const reports = patientReports[supervisor.id] || [];

                return (
                  <tr key={supervisor.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-primary-100 dark:bg-blue-900/30 flex items-center justify-center">
                          <Users className="h-5 w-5 text-primary-600 dark:text-blue-400" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{getPatientName(supervisor)}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">ID: {supervisor.external_id || supervisor.externalId || supervisor.id?.slice(0, 8) || 'N/A'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">{supervisor.email || 'N/A'}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{supervisor.phone || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">{getPatientAge(supervisor)} years</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 capitalize">{supervisor.gender || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        {reports.length > 0 ? (
                          reports.map((report) => (
                            <button
                              key={report.id}
                              onClick={() => handleDownloadReport(report)}
                              className="block text-sm text-primary-600 dark:text-blue-400 hover:underline cursor-pointer"
                              title={`Download ${report.title || report.fileName}`}
                            >
                              {report.fileName || 'Report'}
                              {report.storedInCloud && (
                                <span className="ml-1 text-xs text-[#323956] dark:text-blue-400">️</span>
                              )}
                            </button>
                          ))
                        ) : (
                          <span className="text-sm text-gray-500 dark:text-gray-400">No reports</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {new Date(supervisor.created_at || supervisor.createdAt || Date.now()).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => openPatientInfoModal(supervisor)}
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 transition-colors"
                          title="P&ID Report Form"
                        >
                          <FileText className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => openUploadModal(supervisor)}
                          className="text-[#323956] dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300"
                          title="Upload P&ID Document"
                        >
                          <Upload className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => openPatientViewModal(supervisor)}
                          className="text-green-600 dark:text-green-400 hover:text-green-900 dark:hover:text-green-300 transition-colors"
                          title="View P&ID Report"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => openModal(supervisor)}
                          className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                          title="Edit Engineer"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeletePatient(supervisor.id)}
                          className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                          title="Delete Engineer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filteredSupervisors.length === 0 && (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">
                {searchTerm || genderFilter
                  ? 'No engineers match your filters'
                  : 'No engineers added yet'
                }
              </p>
              <button
                onClick={() => openModal()}
                className="bg-[#323956] hover:bg-[#232D3C] text-white px-4 py-2 rounded-lg font-medium shadow-md"
              >
                Add First Engineer
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <PatientModal
          patient={selectedSupervisor}
          onSubmit={selectedSupervisor ? handleEditPatient : handleCreatePatient}
          onClose={closeModal}
          register={register}
          handleSubmit={handleSubmit}
          errors={errors}
        />
      )}

      {/* Upload P&ID Modal */}
      {showUploadModal && (
        <UploadPIDModal
          clinicId={clinicId}
          patient={patientForUpload}
          onUpload={() => {
            loadPatients();
            closeUploadModal();
            onUpdate?.();
          }}
          onClose={closeUploadModal}
        />
      )}

      {/* Supervisor List Modal */}
      {showPatientListModal && (
        <PatientListModal
          onAddPatients={handleBulkAddPatients}
          onClose={closePatientListModal}
        />
      )}

      {/* Supervisor Information Modal - Clinical Report Form */}
      {showPatientInfoModal && patientForInfo && (
        <ClinicalReportForm
          patient={patientForInfo}
          onClose={closePatientInfoModal}
          onSave={async (formData, files) => {
            // Save clinical report data
            console.log('Saving clinical report:', formData, files);
            await loadPatients();
            onUpdate?.();
          }}
        />
      )}

      {/* Supervisor Clinical Report View Modal */}
      {showPatientViewModal && patientForView && (
        <ClinicalReportView
          patient={patientForView}
          onClose={closePatientViewModal}
        />
      )}
    </div>
  );
};

// Supervisor Modal Component
const PatientModal = ({ patient, onSubmit, onClose, register, handleSubmit, errors }) => {
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            {patient ? 'Edit Engineer' : 'Add New Engineer'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name *
            </label>
            <input
              type="text"
              {...register('name', { required: 'Full name is required' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date of Birth *
              </label>
              <input
                type="date"
                max={new Date().toISOString().split('T')[0]}
                {...register('dateOfBirth', {
                  required: 'Date of Birth is required',
                  validate: (value) => {
                    const selectedDate = new Date(value);
                    const today = new Date();
                    if (selectedDate > today) {
                      return 'Date of Birth cannot be in the future';
                    }
                    return true;
                  }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
              {errors.dateOfBirth && <p className="text-red-500 text-xs mt-1">{errors.dateOfBirth.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Gender *
              </label>
              <select
                {...register('gender', { required: 'Gender is required' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Select...</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
              {errors.gender && <p className="text-red-500 text-xs mt-1">{errors.gender.message}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email *
            </label>
            <input
              type="email"
              {...register('email', {
                required: 'Email is required for engineer login',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address'
                }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              placeholder="engineer@example.com"
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            <p className="text-xs text-gray-500 mt-1">Engineer will use this email to login</p>
          </div>

          {!patient && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password *
                </label>
                <input
                  type="password"
                  {...register('password', {
                    required: 'Password is required',
                    minLength: {
                      value: 6,
                      message: 'Password must be at least 6 characters'
                    }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Enter password for engineer"
                />
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
                <p className="text-xs text-gray-500 mt-1">Engineer will use this password to login</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password *
                </label>
                <input
                  type="password"
                  {...register('confirmPassword', {
                    required: 'Please confirm password',
                    validate: (value, formValues) => value === formValues.password || 'Passwords do not match'
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Confirm password"
                />
                {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>}
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone
            </label>
            <input
              type="tel"
              {...register('phone')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address
            </label>
            <textarea
              {...register('address')}
              rows="2"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Professional Notes
            </label>
            <textarea
              {...register('notes')}
              rows="3"
              placeholder="Any relevant professional qualifications or notes..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 bg-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-[#323956] border border-transparent rounded-md text-sm font-medium text-white hover:bg-[#232D3C] shadow-md"
            >
              {patient ? 'Update' : 'Add'} Engineer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Supervisor Details Component
const PatientDetails = ({ patient, clinicId, onBack }) => {
  const [reports, setReports] = useState([]);

  // Helper functions
  const getPatientName = () => patient?.fullName || patient?.full_name || patient?.name || 'Unknown';

  const getPatientAge = () => {
    if (patient?.age) return patient.age;
    if (patient?.dateOfBirth || patient?.date_of_birth) {
      const dob = new Date(patient.dateOfBirth || patient.date_of_birth);
      const today = new Date();
      let age = today.getFullYear() - dob.getFullYear();
      const monthDiff = today.getMonth() - dob.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
        age--;
      }
      return age;
    }
    return 'N/A';
  };

  useEffect(() => {
    const loadSupervisorReports = async () => {
      if (patient) {
        try {
          const patientReports = await DatabaseService.getReportsByPatient(patient.id) || [];
          setReports(patientReports);
        } catch (error) {
          console.error('Error loading supervisor reports:', error);
          setReports([]);
        }
      }
    };

    loadSupervisorReports();
  }, [patient]);

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <button
          onClick={onBack}
          className="text-primary-600 hover:text-primary-800 font-medium"
        >
          ← Back to Patients
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="h-16 w-16 rounded-full bg-primary-100 flex items-center justify-center">
              <Users className="h-8 w-8 text-primary-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{getPatientName()}</h2>
              <p className="text-gray-600">{getPatientAge()} years • <span className="capitalize">{patient.gender || 'N/A'}</span></p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Engineer Information</h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <span className="text-sm text-gray-600">Age: </span>
                  <span className="text-sm font-medium text-gray-900">{getPatientAge()} years</span>
                </div>
              </div>
              
              {patient.email && (
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-gray-400" />
                  <span className="text-sm text-gray-600">{patient.email}</span>
                </div>
              )}
              
              {patient.phone && (
                <div className="flex items-center space-x-3">
                  <Phone className="h-5 w-5 text-gray-400" />
                  <span className="text-sm text-gray-600">{patient.phone}</span>
                </div>
              )}
              
              {patient.address && (
                <div className="flex items-start space-x-3">
                  <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                  <span className="text-sm text-gray-600">{patient.address}</span>
                </div>
              )}
              
              <div className="flex items-center space-x-3">
                <Calendar className="h-5 w-5 text-gray-400" />
                <span className="text-sm text-gray-600">
                  Added {new Date(patient.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            {patient.notes && (
              <div className="pt-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Professional Notes</h4>
                <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">{patient.notes}</p>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">P&ID Documents ({reports.length})</h3>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {reports.length > 0 ? (
                reports.map(report => (
                  <div key={report.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <FileText className="h-5 w-5 text-[#323956]" />
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900">
                        {report.fileName || 'P&ID Document'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(report.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button className="text-primary-600 hover:text-primary-800">
                        <Eye className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No P&ID documents for this engineer</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Supervisor List Modal Component
const PatientListModal = ({ onAddPatients, onClose }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [previewData, setPreviewData] = useState([]);
  const [fileName, setFileName] = useState('');

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
        toast.error('Please select a CSV file');
        return;
      }
      
      setSelectedFile(file);
      setFileName(file.name);
      parseCSVFile(file);
    }
  };

  const parseCSVFile = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const csvContent = e.target.result;
        const lines = csvContent.split('\n').filter(line => line.trim());
        const supervisors = [];
        
        // Skip header row if it exists
        const startIndex = lines[0].toLowerCase().includes('name') ? 1 : 0;
        
        for (let i = startIndex; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;
          
          const parts = line.split(',').map(part => part.trim());
          if (parts.length < 3) {
            toast.error(`Line ${i + 1}: Invalid format. Use: name,age,gender,email,phone`);
            return;
          }
          
          const [name, age, gender, email = '', phone = ''] = parts;
          
          if (!name || !age || !gender) {
            toast.error(`Line ${i + 1}: Name, age, and gender are required`);
            return;
          }
          
          if (isNaN(age) || age < 0 || age > 120) {
            toast.error(`Line ${i + 1}: Invalid age`);
            return;
          }

          if (!['Male', 'Female', 'Other'].includes(gender)) {
            toast.error(`Line ${i + 1}: Gender must be Male, Female, or Other`);
            return;
          }

          supervisors.push({
            name,
            age: parseInt(age),
            gender,
            email,
            phone
          });
        }

        setPreviewData(supervisors);
        toast.success(`SUCCESS: Found ${supervisors.length} valid engineers in CSV file`);
        
      } catch (error) {
        console.error('Error parsing CSV:', error);
        toast.error('Error parsing CSV file');
      }
    };
    
    reader.readAsText(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedFile || previewData.length === 0) {
      toast.error('Please select a CSV file with valid engineer data');
      return;
    }

    try {
      setIsAdding(true);
      await onAddPatients(previewData);
      
    } catch (error) {
      console.error('Error adding engineers:', error);
      toast.error('Error adding engineers: ' + (error.message || 'Unknown error'));
    } finally {
      setIsAdding(false);
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    setFileName('');
    setPreviewData([]);
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-6 border w-full max-w-2xl shadow-lg rounded-md bg-white">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-medium text-gray-900">
            Add Engineer List
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="mb-6 p-4 bg-[#E4EFFF] rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">INFO: Instructions:</h4>
          <p className="text-sm text-blue-800 mb-2">
            Upload a CSV file with engineer data. The file should contain:
          </p>
          <p className="text-sm text-blue-700 font-mono">
            name,age,gender,email,phone
          </p>
          <p className="text-sm text-blue-700 mt-2">
            <strong>Example CSV content:</strong><br/>
            John Smith,35,Male,jsmith@company.com,1234567890<br/>
            Sarah Johnson,28,Female,sjohnson@company.com,0987654321
          </p>
          <p className="text-sm text-blue-700 mt-2">
            <strong>Note:</strong> The first row can be a header (name,age,gender,email,phone) and will be automatically skipped.
          </p>
          <div className="mt-3">
            <a 
              href="/sample-patients.csv" 
              download
              className="text-[#323956] hover:text-blue-800 underline text-sm"
            >
               Download Sample CSV Template
            </a>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload CSV File
            </label>
            
            {!selectedFile ? (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary-500 transition-colors">
                <input
                  type="file"
                  accept=".csv,text/csv"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="csvFileInput"
                  disabled={isAdding}
                />
                <label htmlFor="csvFileInput" className="cursor-pointer">
                  <div className="text-gray-600">
                    <div className="text-4xl mb-2"></div>
                    <p className="text-lg font-medium">Click to upload CSV file</p>
                    <p className="text-sm">or drag and drop</p>
                    <p className="text-xs text-gray-500 mt-2">Supports .csv files only</p>
                  </div>
                </label>
              </div>
            ) : (
              <div className="border border-gray-300 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="text-[#323956] text-2xl">SUCCESS:</div>
                    <div>
                      <p className="font-medium text-gray-900">{fileName}</p>
                      <p className="text-sm text-gray-600">
                        {previewData.length} engineers found
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={clearFile}
                    className="text-red-600 hover:text-red-800"
                    disabled={isAdding}
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {previewData.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preview ({previewData.length} engineers)
              </label>
              <div className="max-h-48 overflow-y-auto border border-gray-300 rounded-lg p-3 bg-gray-50">
                {previewData.slice(0, 5).map((engineer, index) => (
                  <div key={index} className="text-sm text-gray-700 mb-1">
                    <span className="font-medium">{engineer.name}</span> - {engineer.age} years, {engineer.gender}
                    {engineer.email && ` - ${engineer.email}`}
                  </div>
                ))}
                {previewData.length > 5 && (
                  <div className="text-sm text-gray-500 italic">
                    ... and {previewData.length - 5} more engineers
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              disabled={isAdding}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#323956] hover:bg-green-700 text-white rounded-md font-medium"
              disabled={isAdding || !selectedFile}
            >
              {isAdding ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Adding...</span>
                </div>
              ) : (
                `Add ${previewData.length} Engineers`
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SupervisorManagement;

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
  Upload
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import DatabaseService from '../../services/databaseService';
import AWSS3Service from '../../services/awsS3Service';
import UploadReportModal from './UploadReportModal';

const PatientManagement = ({ clinicId, onUpdate }) => {
  const [patients, setPatients] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'details'
  const [searchTerm, setSearchTerm] = useState('');
  const [genderFilter, setGenderFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [patientForUpload, setPatientForUpload] = useState(null);
  const [patientReports, setPatientReports] = useState({});
  const [showPatientListModal, setShowPatientListModal] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const loadPatients = useCallback(async () => {
    try {
      if (!clinicId) {
        setPatients([]);
        setLoading(false);
        return;
      }
      
      const allPatients = await DatabaseService.get('patients');
      const patientsData = allPatients.filter(patient => patient.clinicId === clinicId);
      
      setPatients(patientsData);
      
      // Load reports for each patient
      const reportsMap = {};
      for (const patient of patientsData) {
        try {
          const reports = await DatabaseService.getReportsByPatient(patient.id);
          reportsMap[patient.id] = reports || [];
        } catch (error) {
          reportsMap[patient.id] = [];
        }
      }
      
      setPatientReports(reportsMap);
    } catch (error) {
      toast.error('Error loading patients');
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
      if (!clinicId) {
        toast.error('No clinic ID found. Please refresh the page.');
        return;
      }
      
      const patientData = {
        ...data,
        clinicId: clinicId,
        age: parseInt(data.age),
        createdAt: new Date().toISOString()
      };
      
      await DatabaseService.add('patients', patientData);
      toast.success('Patient created successfully');
      loadPatients();
      setShowModal(false);
      reset();
      onUpdate?.();
    } catch (error) {
      toast.error('Error creating patient');
    }
  };

  const handleEditPatient = async (data) => {
    try {
      const patientData = {
        ...data,
        age: parseInt(data.age)
      };
      
      await DatabaseService.update('patients', selectedPatient.id, patientData);
      toast.success('Patient updated successfully');
      loadPatients();
      setShowModal(false);
      setSelectedPatient(null);
      reset();
      onUpdate?.();
    } catch (error) {
      toast.error('Error updating patient');
      console.error(error);
    }
  };

  const handleDeletePatient = async (patientId) => {
    if (window.confirm('Are you sure you want to delete this patient? This action cannot be undone.')) {
      try {
        await DatabaseService.delete('patients', patientId);
        toast.success('Patient deleted successfully');
        loadPatients();
        onUpdate?.();
      } catch (error) {
        toast.error('Error deleting patient');
        console.error(error);
      }
    }
  };

  const handleDownloadReport = async (report) => {
    try {
      if (report.s3Key) {
        console.log('📥 Generating download URL for S3 file:', report.s3Key);
        
        // Generate signed URL for download
        const downloadUrl = await AWSS3Service.getSignedUrl(report.s3Key, 300); // 5 minutes
        
        // Open download URL in new tab
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = report.fileName;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        toast.success('📥 Download started!');
      } else {
        // Fallback for files not stored in S3
        toast.error('File not available for download');
      }
    } catch (error) {
      console.error('❌ Error downloading file:', error);
      toast.error('Failed to download file');
    }
  };

  const openModal = (patient = null) => {
    setSelectedPatient(patient);
    if (patient) {
      reset(patient);
    } else {
      reset({});
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedPatient(null);
    reset({});
  };

  const openUploadModal = (patient) => {
    setPatientForUpload(patient);
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

  const handleBulkAddPatients = async (patientList) => {
    try {
      if (!clinicId) {
        toast.error('No clinic ID found. Please refresh the page.');
        return;
      }
      
      for (const patientData of patientList) {
        const patient = {
          ...patientData,
          clinicId: clinicId,
          age: parseInt(patientData.age),
          createdAt: new Date().toISOString()
        };
        
        await DatabaseService.add('patients', patient);
      }
      
      toast.success(`Successfully added ${patientList.length} patients!`);
      loadPatients();
      closePatientListModal();
      onUpdate?.();
    } catch (error) {
      toast.error('Error adding patients');
    }
  };



  const viewPatientDetails = (patient) => {
    setSelectedPatient(patient);
    setViewMode('details');
  };

  const filteredPatients = patients.filter(patient => {
    const matchesSearch = patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         patient.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         patient.phone?.includes(searchTerm);
    const matchesGender = !genderFilter || patient.gender === genderFilter;
    
    return matchesSearch && matchesGender;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (viewMode === 'details' && selectedPatient) {
    return <PatientDetails 
      patient={selectedPatient} 
      clinicId={clinicId}
      onBack={() => {setViewMode('list'); setSelectedPatient(null);}} 
    />;
  }

  console.log('Filtered Patients:', filteredPatients);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Patient Management</h2>
          <p className="text-gray-600">Manage your clinic's patient records</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => loadPatients()}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2"
            title="Refresh patients and reports"
          >
            <div className="h-4 w-4">🔄</div>
            <span>Refresh</span>
          </button>

          <button
            onClick={() => openPatientListModal()}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2"
          >
            <Users className="h-4 w-4" />
            <span>Patient List</span>
          </button>
          <button
            onClick={() => openModal()}
            className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Add Patient</span>
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
              placeholder="Search patients..."
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
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
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
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h3 className="text-lg font-medium text-gray-900">
            Patients ({filteredPatients.length})
          </h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Patient
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Demographics
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reports
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Added
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPatients.map((patient) => {
                const reports = patientReports[patient.id] || [];
                
                return (
                  <tr key={patient.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                          <Users className="h-5 w-5 text-primary-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{patient.name}</div>
                          <div className="text-sm text-gray-500">ID: {patient.id.slice(0, 8)}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{patient.email || 'N/A'}</div>
                      <div className="text-sm text-gray-500">{patient.phone || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{patient.age} years</div>
                      <div className="text-sm text-gray-500">{patient.gender}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        {reports.length > 0 ? (
                          reports.map((report) => (
                            <button
                              key={report.id}
                              onClick={() => handleDownloadReport(report)}
                              className="block text-sm text-primary-600 hover:underline cursor-pointer"
                              title={`Download ${report.title || report.fileName}`}
                            >
                              {report.fileName || 'Report'}
                              {report.storedInCloud && (
                                <span className="ml-1 text-xs text-green-600">☁️</span>
                              )}
                            </button>
                          ))
                        ) : (
                          <span className="text-sm text-gray-500">No reports</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(patient.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => openUploadModal(patient)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Upload Report"
                        >
                          <Upload className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => viewPatientDetails(patient)}
                          className="text-primary-600 hover:text-primary-900"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => openModal(patient)}
                          className="text-gray-600 hover:text-gray-900"
                          title="Edit Patient"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeletePatient(patient.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete Patient"
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

          {filteredPatients.length === 0 && (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">
                {searchTerm || genderFilter 
                  ? 'No patients match your filters' 
                  : 'No patients added yet'
                }
              </p>
              <button
                onClick={() => openModal()}
                className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium"
              >
                Add First Patient
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <PatientModal
          patient={selectedPatient}
          onSubmit={selectedPatient ? handleEditPatient : handleCreatePatient}
          onClose={closeModal}
          register={register}
          handleSubmit={handleSubmit}
          errors={errors}
        />
      )}

      {/* Upload Report Modal */}
      {showUploadModal && (
        <UploadReportModal
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

      {/* Patient List Modal */}
      {showPatientListModal && (
        <PatientListModal
          onAddPatients={handleBulkAddPatients}
          onClose={closePatientListModal}
        />
      )}
    </div>
  );
};

// Patient Modal Component
const PatientModal = ({ patient, onSubmit, onClose, register, handleSubmit, errors }) => {
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            {patient ? 'Edit Patient' : 'Add New Patient'}
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
                Age *
              </label>
              <input
                type="number"
                min="0"
                max="120"
                {...register('age', { 
                  required: 'Age is required',
                  min: { value: 0, message: 'Age must be positive' },
                  max: { value: 120, message: 'Age must be realistic' }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
              {errors.age && <p className="text-red-500 text-xs mt-1">{errors.age.message}</p>}
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
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
              {errors.gender && <p className="text-red-500 text-xs mt-1">{errors.gender.message}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              {...register('email', { 
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address'
                }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
          </div>

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
              Medical Notes
            </label>
            <textarea
              {...register('notes')}
              rows="3"
              placeholder="Any relevant medical history or notes..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-primary-700"
            >
              {patient ? 'Update' : 'Create'} Patient
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Patient Details Component
const PatientDetails = ({ patient, clinicId, onBack }) => {
  const [reports, setReports] = useState([]);

  useEffect(() => {
    const loadPatientReports = async () => {
      if (patient) {
        try {
          const patientReports = await DatabaseService.getReportsByPatient(patient.id) || [];
          setReports(patientReports);
        } catch (error) {
          console.error('Error loading patient reports:', error);
          setReports([]);
        }
      }
    };
    
    loadPatientReports();
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
              <h2 className="text-2xl font-bold text-gray-900">{patient.name}</h2>
              <p className="text-gray-600">{patient.age} years • {patient.gender}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Patient Information</h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <span className="text-sm text-gray-600">Age: </span>
                  <span className="text-sm font-medium text-gray-900">{patient.age} years</span>
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
                <h4 className="text-sm font-medium text-gray-900 mb-2">Medical Notes</h4>
                <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">{patient.notes}</p>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Reports ({reports.length})</h3>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {reports.length > 0 ? (
                reports.map(report => (
                  <div key={report.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <FileText className="h-5 w-5 text-blue-600" />
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900">
                        {report.fileName || 'EEG Report'}
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
                  <p className="text-gray-600">No reports for this patient</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Patient List Modal Component
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
        const patients = [];
        
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
          
          patients.push({
            name,
            age: parseInt(age),
            gender,
            email,
            phone
          });
        }
        
        setPreviewData(patients);
        toast.success(`✅ Found ${patients.length} valid patients in CSV file`);
        
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
      toast.error('Please select a CSV file with valid patient data');
      return;
    }

    try {
      setIsAdding(true);
      await onAddPatients(previewData);
      
    } catch (error) {
      console.error('Error adding patients:', error);
      toast.error('Error adding patients');
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
            Add Patient List
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">📋 Instructions:</h4>
          <p className="text-sm text-blue-800 mb-2">
            Upload a CSV file with patient data. The file should contain:
          </p>
          <p className="text-sm text-blue-700 font-mono">
            name,age,gender,email,phone
          </p>
          <p className="text-sm text-blue-700 mt-2">
            <strong>Example CSV content:</strong><br/>
            John Doe,25,Male,john@email.com,1234567890<br/>
            Jane Smith,30,Female,jane@email.com,0987654321
          </p>
          <p className="text-sm text-blue-700 mt-2">
            <strong>Note:</strong> The first row can be a header (name,age,gender,email,phone) and will be automatically skipped.
          </p>
          <div className="mt-3">
            <a 
              href="/sample-patients.csv" 
              download
              className="text-blue-600 hover:text-blue-800 underline text-sm"
            >
              📥 Download Sample CSV Template
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
                    <div className="text-4xl mb-2">📁</div>
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
                    <div className="text-green-600 text-2xl">✅</div>
                    <div>
                      <p className="font-medium text-gray-900">{fileName}</p>
                      <p className="text-sm text-gray-600">
                        {previewData.length} patients found
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
                Preview ({previewData.length} patients)
              </label>
              <div className="max-h-48 overflow-y-auto border border-gray-300 rounded-lg p-3 bg-gray-50">
                {previewData.slice(0, 5).map((patient, index) => (
                  <div key={index} className="text-sm text-gray-700 mb-1">
                    <span className="font-medium">{patient.name}</span> - {patient.age} years, {patient.gender}
                    {patient.email && ` - ${patient.email}`}
                  </div>
                ))}
                {previewData.length > 5 && (
                  <div className="text-sm text-gray-500 italic">
                    ... and {previewData.length - 5} more patients
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
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md font-medium"
              disabled={isAdding || !selectedFile}
            >
              {isAdding ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Adding...</span>
                </div>
              ) : (
                `Add ${previewData.length} Patients`
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PatientManagement;
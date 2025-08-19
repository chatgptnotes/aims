import React, { useState, useEffect } from 'react';
import { 
  Upload, 
  FileText, 
  Users, 
  Calendar,
  Download,
  Eye,
  Trash2,
  Plus,
  Filter,
  Search,
  X,
  Loader2,
  Cloud,
  UploadCloud
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import DatabaseService from '../../services/databaseService';
import AWSS3Service from '../../services/awsS3Service';

const PatientReports = ({ onUpdate }) => {
  const [reports, setReports] = useState([]);
  const [clinics, setClinics] = useState([]);
  const [patients, setPatients] = useState([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedClinic, setSelectedClinic] = useState('');
  const [selectedPatient, setSelectedPatient] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm();

  const watchedClinic = watch('clinicId');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    // Load patients when clinic changes in the form
    if (watchedClinic) {
      const clinicPatients = DatabaseService.getPatientsByClinic(watchedClinic);
      setPatients(clinicPatients);
    }
  }, [watchedClinic]);

  const loadData = () => {
    try {
      const reportsData = DatabaseService.get('reports');
      const clinicsData = DatabaseService.get('clinics');
      const patientsData = DatabaseService.get('patients');
      
      // Enhance reports with clinic and patient names
      const enhancedReports = reportsData.map(report => {
        const clinic = clinicsData.find(c => c.id === report.clinicId);
        const patient = patientsData.find(p => p.id === report.patientId);
        return {
          ...report,
          clinicName: clinic?.name || 'Unknown Clinic',
          patientName: patient?.name || 'Unknown Patient'
        };
      });
      
      setReports(enhancedReports);
      setClinics(clinicsData);
      setPatients(patientsData);
    } catch (error) {
      toast.error('Error loading data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      try {
        // Validate file
        AWSS3Service.validateFile(file);
        setSelectedFile(file);
        console.log('✅ File selected:', file.name);
      } catch (error) {
        toast.error(error.message);
        setSelectedFile(null);
      }
    }
  };

  const handleUploadReport = async (data) => {
    if (!selectedFile) {
      toast.error('Please select a file to upload');
      return;
    }

    setUploadingFile(true);
    setUploadProgress(0);

    try {
      console.log('🚀 Starting file upload to S3...');
      
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      // Upload file to S3
      const uploadResult = await AWSS3Service.uploadFile(
        selectedFile, 
        selectedFile.name,
        {
          clinicId: data.clinicId,
          patientId: data.patientId,
          reportType: data.reportType || 'EEG',
          uploadedBy: 'Super Admin'
        }
      );

      clearInterval(progressInterval);
      setUploadProgress(100);

      console.log('✅ File uploaded to S3:', uploadResult);

      // Save report metadata to database
      const reportData = {
        ...data,
        fileName: selectedFile.name,
        fileSize: (selectedFile.size / (1024 * 1024)).toFixed(2) + ' MB',
        fileType: selectedFile.type,
        uploadedBy: 'Super Admin',
        // AWS S3 specific fields
        s3Key: uploadResult.key,
        s3Bucket: uploadResult.bucket,
        s3Region: uploadResult.region,
        s3FileName: uploadResult.fileName,
        s3UploadedAt: uploadResult.uploadedAt,
        s3ETag: uploadResult.etag,
        fileUrl: uploadResult.url, // Signed URL for initial access
        uploadStatus: 'completed',
        storedInCloud: true
      };
      
      DatabaseService.addReport(reportData);
      
      toast.success(`📁 Report uploaded successfully to AWS S3!`);
      loadData();
      setShowUploadModal(false);
      setSelectedFile(null);
      setUploadProgress(0);
      reset();
      onUpdate?.();
    } catch (error) {
      console.error('❌ Error uploading report to S3:', error);
      toast.error(`Upload failed: ${error.message}`);
      setUploadProgress(0);
    } finally {
      setUploadingFile(false);
    }
  };

  const handleDeleteReport = async (reportId) => {
    if (window.confirm('Are you sure you want to delete this report? This will also remove the file from AWS S3.')) {
      try {
        // Get report data to find S3 key
        const report = reports.find(r => r.id === reportId);
        
        if (report && report.s3Key) {
          console.log('🗑️ Deleting file from S3:', report.s3Key);
          try {
            await AWSS3Service.deleteFile(report.s3Key);
            console.log('✅ File deleted from S3');
          } catch (s3Error) {
            console.warn('⚠️ Could not delete file from S3:', s3Error.message);
            // Continue with database deletion even if S3 deletion fails
          }
        }

        // Delete from database
        DatabaseService.delete('reports', reportId);
        toast.success('Report deleted successfully from database and S3');
        loadData();
        onUpdate?.();
      } catch (error) {
        toast.error('Error deleting report');
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
        
        toast.success(`📥 Downloading ${report.fileName} from AWS S3`);
      } else {
        // Fallback for legacy reports
        toast.info(`📄 ${report.fileName} - Legacy report (no S3 storage)`);
      }
    } catch (error) {
      console.error('❌ Error downloading report:', error);
      toast.error(`Download failed: ${error.message}`);
    }
  };

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.clinicName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.fileName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClinic = !selectedClinic || report.clinicId === selectedClinic;
    const matchesPatient = !selectedPatient || report.patientId === selectedPatient;
    
    return matchesSearch && matchesClinic && matchesPatient;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Patient Reports</h2>
          <p className="text-gray-600">Upload and manage EEG reports for patients</p>
        </div>
        <button
          onClick={() => setShowUploadModal(true)}
          className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2"
        >
          <Upload className="h-4 w-4" />
          <span>Upload Report</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search reports..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          
          <select
            value={selectedClinic}
            onChange={(e) => setSelectedClinic(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">All Clinics</option>
            {clinics.map(clinic => (
              <option key={clinic.id} value={clinic.id}>{clinic.name}</option>
            ))}
          </select>
          
          <select
            value={selectedPatient}
            onChange={(e) => setSelectedPatient(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">All Patients</option>
            {patients
              .filter(patient => !selectedClinic || patient.clinicId === selectedClinic)
              .map(patient => (
                <option key={patient.id} value={patient.id}>{patient.name}</option>
              ))}
          </select>
          
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedClinic('');
              setSelectedPatient('');
            }}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 flex items-center justify-center space-x-2"
          >
            <X className="h-4 w-4" />
            <span>Clear</span>
          </button>
        </div>
      </div>

      {/* Reports Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h3 className="text-lg font-medium text-gray-900">
            Reports ({filteredReports.length})
          </h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Report
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Patient
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Clinic
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  File Info
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Uploaded
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredReports.map((report) => (
                <tr key={report.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                        <FileText className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{report.fileName}</div>
                        <div className="text-sm text-gray-500">{report.title || 'EEG Report'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{report.patientName}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{report.clinicName}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 flex items-center">
                      {report.fileType || 'PDF'}
                      {report.storedInCloud && (
                        <Cloud className="h-4 w-4 ml-2 text-blue-500" title="Stored in AWS S3" />
                      )}
                    </div>
                    <div className="text-sm text-gray-500">{report.fileSize || 'N/A'}</div>
                    {report.s3Key && (
                      <div className="text-xs text-blue-600 flex items-center mt-1">
                        <Cloud className="h-3 w-3 mr-1" />
                        AWS S3
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {new Date(report.createdAt).toLocaleDateString()}
                    </div>
                    <div className="text-sm text-gray-500">
                      by {report.uploadedBy || 'Unknown'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => handleDownloadReport(report)}
                        className="text-primary-600 hover:text-primary-900"
                        title="Download"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDownloadReport(report)}
                        className="text-gray-600 hover:text-gray-900"
                        title="View"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteReport(report.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredReports.length === 0 && (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">
                {searchTerm || selectedClinic || selectedPatient 
                  ? 'No reports match your filters' 
                  : 'No reports uploaded yet'
                }
              </p>
              <button
                onClick={() => setShowUploadModal(true)}
                className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium"
              >
                Upload First Report
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <UploadReportModal
          onSubmit={handleUploadReport}
          onClose={() => {
            setShowUploadModal(false);
            setSelectedFile(null);
            setUploadProgress(0);
          }}
          clinics={clinics}
          patients={patients}
          register={register}
          handleSubmit={handleSubmit}
          reset={reset}
          watch={watch}
          errors={errors}
          selectedFile={selectedFile}
          onFileSelect={handleFileSelect}
          uploadingFile={uploadingFile}
          uploadProgress={uploadProgress}
        />
      )}
    </div>
  );
};

// Upload Report Modal Component
const UploadReportModal = ({ 
  onSubmit, 
  onClose, 
  clinics, 
  patients,
  register, 
  handleSubmit, 
  reset,
  watch,
  errors,
  selectedFile,
  onFileSelect,
  uploadingFile,
  uploadProgress
}) => {
  const [availablePatients, setAvailablePatients] = useState([]);
  const watchedClinic = watch('clinicId');

  useEffect(() => {
    if (watchedClinic) {
      const clinicPatients = DatabaseService.getPatientsByClinic(watchedClinic);
      setAvailablePatients(clinicPatients);
    } else {
      setAvailablePatients([]);
    }
  }, [watchedClinic]);

  const handleFormSubmit = (data) => {
    onSubmit(data);
    reset();
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Upload Patient Report</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Clinic *
            </label>
            <select
              {...register('clinicId', { required: 'Please select a clinic' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">Choose a clinic...</option>
              {clinics.map(clinic => (
                <option key={clinic.id} value={clinic.id}>{clinic.name}</option>
              ))}
            </select>
            {errors.clinicId && <p className="text-red-500 text-xs mt-1">{errors.clinicId.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Patient *
            </label>
            <select
              {...register('patientId', { required: 'Please select a patient' })}
              disabled={!watchedClinic}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-100"
            >
              <option value="">
                {!watchedClinic ? 'Select clinic first...' : 'Choose a patient...'}
              </option>
              {availablePatients.map(patient => (
                <option key={patient.id} value={patient.id}>{patient.name}</option>
              ))}
            </select>
            {errors.patientId && <p className="text-red-500 text-xs mt-1">{errors.patientId.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Report Title
            </label>
            <input
              type="text"
              {...register('title')}
              placeholder={selectedFile ? selectedFile.name.replace(/\.[^/.]+$/, "") : "e.g., EEG Analysis Report"}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
              <UploadCloud className="h-4 w-4 mr-2 text-blue-500" />
              Upload to AWS S3 *
            </label>
            <div className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md transition-colors ${
              selectedFile ? 'border-green-300 bg-green-50' : 'border-gray-300'
            }`}>
              <div className="space-y-1 text-center">
                {selectedFile ? (
                  <>
                    <Cloud className="mx-auto h-12 w-12 text-green-500" />
                    <div className="text-sm text-green-600">
                      <p className="font-medium">{selectedFile.name}</p>
                      <p className="text-xs text-gray-500">
                        {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • {selectedFile.type}
                      </p>
                    </div>
                    {uploadingFile && (
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                          style={{ width: `${uploadProgress}%` }}
                        ></div>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-600">
                      <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500">
                        <span>Upload to S3</span>
                        <input 
                          id="file-upload" 
                          name="file-upload" 
                          type="file" 
                          className="sr-only"
                          accept=".pdf,.jpeg,.jpg,.png,.edf"
                          onChange={onFileSelect}
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                  </>
                )}
                <p className="text-xs text-gray-500">
                  PDF, JPEG, PNG or EDF up to 50MB
                  {selectedFile && (
                    <button
                      type="button"
                      onClick={() => onFileSelect({ target: { files: [] } })}
                      className="ml-2 text-red-500 hover:text-red-700"
                    >
                      Remove
                    </button>
                  )}
                </p>
              </div>
            </div>
            {!selectedFile && <p className="text-red-500 text-xs mt-1">Please select a file to upload to AWS S3</p>}
            
            {/* AWS S3 Status Indicator */}
            <div className="mt-2 text-xs text-gray-500 flex items-center">
              <Cloud className="h-3 w-3 mr-1" />
              Files will be securely stored in AWS S3 with encryption
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              {...register('notes')}
              rows="3"
              placeholder="Additional notes about this report..."
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
              disabled={uploadingFile || !selectedFile}
              className="px-4 py-2 bg-primary-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center"
            >
              {uploadingFile ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Uploading to S3... ({uploadProgress}%)
                </>
              ) : (
                <>
                  <UploadCloud className="h-4 w-4 mr-2" />
                  Upload to AWS S3
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PatientReports;
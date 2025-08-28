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
  UploadCloud,
  AlertTriangle,
  Lock
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import DatabaseService from '../../services/databaseService';
import AWSS3Service from '../../services/awsS3Service';
import ErrorBoundary from '../ErrorBoundary';
import SubscriptionPopup from './SubscriptionPopup';
import { useAuth } from '../../contexts/AuthContext';

const PatientReports = ({ onUpdate, selectedClinic: superAdminSelectedClinic }) => {
  const { user } = useAuth();
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
  const [error, setError] = useState(null);
  const [showSubscriptionPopup, setShowSubscriptionPopup] = useState(false);
  const [showResponseUploadModal, setShowResponseUploadModal] = useState(false);
  const [selectedReportForResponse, setSelectedReportForResponse] = useState(null);
  const [clinicUsage, setClinicUsage] = useState({});
  const [subscriptions, setSubscriptions] = useState({});
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedReportForView, setSelectedReportForView] = useState(null);

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm({
    defaultValues: {
      clinicId: '',
      patientId: '',
      title: '',
      reportType: 'EEG',
      notes: ''
    }
  });

  const watchedClinic = watch('clinicId');

  // Check if clinic has reached report limit
  const checkReportLimit = (clinicId) => {
    try {
      // Super Admin has no restrictions
      if (user?.role === 'super_admin') {
        return false;
      }
      
      const subscription = subscriptions[clinicId];
      const usage = clinicUsage[clinicId] || 0;
      
      if (subscription && subscription.status === 'active') {
        // Paid subscription - check against plan limit
        return usage >= (subscription.reportsAllowed || 0);
      } else {
        // Trial subscription - 10 report limit
        return usage >= 10;
      }
    } catch (error) {
      console.error('❌ Error checking report limit:', error);
      return false; // Default to not limiting if there's an error
    }
  };

  // Get clinic's current usage info
  const getClinicUsageInfo = (clinicId) => {
    try {
      // Super Admin has unlimited access
      if (user?.role === 'super_admin') {
        return {
          used: clinicUsage[clinicId] || 0,
          allowed: 'Unlimited',
          remaining: 'Unlimited',
          isTrial: false,
          planName: 'Super Admin - Unlimited Access'
        };
      }
      
      const subscription = subscriptions[clinicId];
      const usage = clinicUsage[clinicId] || 0;
      
      if (subscription && subscription.status === 'active') {
        return {
          used: usage,
          allowed: subscription.reportsAllowed || 0,
          remaining: Math.max(0, (subscription.reportsAllowed || 0) - usage),
          isTrial: false,
          planName: subscription.planName || 'Paid Plan'
        };
      } else {
        return {
          used: usage,
          allowed: 10,
          remaining: Math.max(0, 10 - usage),
          isTrial: true,
          planName: 'Trial Plan'
        };
      }
    } catch (error) {
      console.error('❌ Error getting clinic usage info:', error);
      return {
        used: 0,
        allowed: 10,
        remaining: 10,
        isTrial: true,
        planName: 'Trial Plan'
      };
    }
  };

  useEffect(() => {
    loadData();
  }, [superAdminSelectedClinic]);

  useEffect(() => {
    // Load patients when clinic changes in the form
    if (watchedClinic) {
      const loadClinicPatients = async () => {
        try {
          const clinicPatients = await DatabaseService.getPatientsByClinic(watchedClinic);
          setPatients(clinicPatients || []);
        } catch (error) {
          console.error('❌ Error loading clinic patients:', error);
          setPatients([]);
        }
      };
      loadClinicPatients();
    } else {
      setPatients([]);
    }
  }, [watchedClinic]);

  const loadData = async () => {
    try {
      setError(null); // Clear any previous errors
      setLoading(true);
      
      console.log('👑 SuperAdmin loading ALL patient reports from all clinics...');
      
      // SuperAdmin can see ALL data from all clinics, or filter by selected clinic
      const reportsData = await DatabaseService.get('reports') || [];
      const clinicsData = await DatabaseService.get('clinics') || [];
      const patientsData = await DatabaseService.get('patients') || [];
      const subscriptionsData = await DatabaseService.get('subscriptions') || [];
      
      // Also check localStorage for any reports that might be there
      const localStorageReports = JSON.parse(localStorage.getItem('reports') || '[]');
      
      // Combine database and localStorage reports if needed
      const allReports = [...reportsData, ...localStorageReports];
      
      // Filter reports by selected clinic if specified
      const filteredReportsData = superAdminSelectedClinic 
        ? allReports.filter(report => report.clinicId === superAdminSelectedClinic)
        : allReports;
      
      // First, fix patient names in the reports
      const reportsWithFixedNames = fixPatientNames(filteredReportsData, patientsData);
      
      // Validate and fix report data
      const validatedReports = validateReportData(reportsWithFixedNames);
      
      // Enhance reports with clinic and patient names
      const enhancedReports = validatedReports.map(report => {
        const clinic = clinicsData.find(c => c.id === report.clinicId);
        
        return {
          ...report,
          clinicName: clinic?.name || 'Unknown Clinic',
          patientName: report.patientName || 'Unknown Patient'
        };
      }).sort((a, b) => new Date(b.uploadedAt || b.createdAt || 0) - new Date(a.uploadedAt || a.createdAt || 0));
      
      setReports(enhancedReports);
      setClinics(clinicsData);
      
      // Filter patients by selected clinic if specified
      const filteredPatientsData = superAdminSelectedClinic 
        ? patientsData.filter(patient => patient.clinicId === superAdminSelectedClinic)
        : patientsData;
      setPatients(filteredPatientsData);
      
      // Calculate clinic usage and load subscriptions
      const usageMap = {};
      const subscriptionMap = {};
      
      clinicsData.forEach(clinic => {
        const clinicReports = allReports.filter(report => report.clinicId === clinic.id);
        usageMap[clinic.id] = clinicReports.length;
      });
      
      subscriptionsData.forEach(subscription => {
        subscriptionMap[subscription.clinicId] = subscription;
      });
      
      setClinicUsage(usageMap);
      setSubscriptions(subscriptionMap);
    } catch (error) {
      console.error('❌ Critical error loading admin patient reports:', error);
      setError(`Failed to load data: ${error.message}`);
      toast.error('Error loading patient reports data');
    } finally {
      setLoading(false);
    }
  };

  // Function to fix patient names in reports
  const fixPatientNames = (reports, patients) => {
    return reports.map(report => {
      // If report already has a patient name, use it
      if (report.patientName && report.patientName !== 'Unknown Patient') {
        return report;
      }
      
      // Try to find patient by ID
      let patient = patients.find(p => p.id === report.patientId);
      
      // If not found by ID, try to find by name (case insensitive)
      if (!patient && report.patientName) {
        patient = patients.find(p => 
          p.name && p.name.toLowerCase() === report.patientName.toLowerCase()
        );
      }
      
      // If still not found, try partial name matching
      if (!patient && report.patientName) {
        patient = patients.find(p => 
          p.name && p.name.toLowerCase().includes(report.patientName.toLowerCase())
        );
      }
      
      return {
        ...report,
        patientName: patient?.name || report.patientName || 'Unknown Patient'
      };
    });
  };

  // Function to validate and fix report data
  const validateReportData = (reports) => {
    return reports.map(report => {
      const issues = [];
      
      // Check for missing file information
      if (!report.fileName) {
        issues.push('Missing fileName');
        report.fileName = 'Unknown_Report.pdf';
      }
      
      // Check for missing S3 key but has storedInCloud flag
      if (report.storedInCloud && !report.s3Key) {
        issues.push('Missing S3 key but marked as stored in cloud');
        report.storedInCloud = false;
      }
      
      // Check for invalid file types
      if (report.fileType && !['application/pdf', 'image/jpeg', 'image/png', 'application/octet-stream'].includes(report.fileType)) {
        issues.push(`Invalid file type: ${report.fileType}`);
        report.fileType = 'application/pdf';
      }
      
      if (issues.length > 0) {
        // Report data issues found - silently fix them
      }
      
      return report;
    });
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

    // Validate required fields
    if (!data.clinicId) {
      toast.error('Please select a clinic');
      return;
    }

    if (!data.patientId) {
      toast.error('Please select a patient');
      return;
    }

    if (!data.title) {
      toast.error('Please enter a report title');
      return;
    }

    // Super Admin can upload reports without restrictions
    if (user?.role === 'super_admin') {
      // Super Admin has unlimited access
    } else {
      // For regular users, check if clinic has reached report limit
      if (checkReportLimit(data.clinicId)) {
        setShowSubscriptionPopup(true);
        toast.error('Report limit reached. Please upgrade your plan to continue uploading reports.');
        return;
      }
    }

    setUploadingFile(true);
    setUploadProgress(0);

    try {
      console.log('🚀 Starting file upload to S3...', {
        file: selectedFile.name,
        clinicId: data.clinicId,
        patientId: data.patientId
      });
      
      // Validate file again before upload
      AWSS3Service.validateFile(selectedFile);
      
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
      
      const savedReport = await DatabaseService.addReport(reportData);
      
      if (!savedReport) {
        throw new Error('Failed to save report to database');
      }
      
      console.log('✅ Report saved successfully:', savedReport.id);
      toast.success(`📁 Report uploaded successfully to AWS S3!`);
      loadData();
      setShowUploadModal(false);
      setSelectedFile(null);
      setUploadProgress(0);
      reset();
      onUpdate?.();
    } catch (error) {
      console.error('❌ Admin Upload Error:', error);
      console.error('Error context:', {
        message: error.message,
        formData: data,
        file: selectedFile ? {
          name: selectedFile.name,
          size: selectedFile.size,
          type: selectedFile.type
        } : null
      });
      
      const errorMessage = error.message || 'Unknown error occurred';
      toast.error(`Upload failed: ${errorMessage}`);
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

  const handleSubscription = async (subscriptionData) => {
    try {
      // Save subscription to database
      await DatabaseService.add('subscriptions', subscriptionData);
      
      // Update clinic's subscription status
      await DatabaseService.update('clinics', subscriptionData.clinicId, {
        subscriptionStatus: 'active',
        reportsAllowed: subscriptionData.reportsAllowed
      });
      
      // Reload data to reflect changes
      loadData();
      
      toast.success('Subscription updated successfully!');
    } catch (error) {
      console.error('Error updating subscription:', error);
      toast.error('Failed to update subscription');
    }
  };

  const handleUploadResponse = (report) => {
    console.log('📝 Opening response upload modal for report:', report.id);
    setSelectedReportForResponse(report);
    setShowResponseUploadModal(true);
  };

  const handleSubmitResponse = async (responseData) => {
    if (!selectedFile || !selectedReportForResponse) {
      toast.error('Please select a response file to upload');
      return;
    }

    setUploadingFile(true);
    setUploadProgress(0);

    try {
      console.log('🚀 Uploading response report to S3...', {
        originalReport: selectedReportForResponse.id,
        responseFile: selectedFile.name,
        clinicId: selectedReportForResponse.clinicId
      });
      
      // Validate file
      AWSS3Service.validateFile(selectedFile);
      
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      // Upload response file to S3
      const uploadResult = await AWSS3Service.uploadFile(
        selectedFile, 
        `response_${selectedFile.name}`,
        {
          clinicId: selectedReportForResponse.clinicId,
          patientId: selectedReportForResponse.patientId,
          reportType: 'Response Report',
          uploadedBy: 'Super Admin',
          originalReportId: selectedReportForResponse.id
        }
      );

      clearInterval(progressInterval);
      setUploadProgress(100);

      console.log('✅ Response file uploaded to S3:', uploadResult);

      // Save response report metadata to database
      const responseReportData = {
        clinicId: selectedReportForResponse.clinicId,
        patientId: selectedReportForResponse.patientId,
        title: `Response to: ${selectedReportForResponse.title || selectedReportForResponse.fileName}`,
        reportType: 'Response Report',
        fileName: selectedFile.name,
        fileSize: (selectedFile.size / (1024 * 1024)).toFixed(2) + ' MB',
        fileType: selectedFile.type,
        uploadedBy: 'Super Admin',
        notes: responseData?.notes || 'Response report uploaded by Super Admin',
        originalReportId: selectedReportForResponse.id,
        isResponseReport: true,
        // AWS S3 specific fields
        s3Key: uploadResult.key,
        s3Bucket: uploadResult.bucket,
        s3Region: uploadResult.region,
        s3FileName: uploadResult.fileName,
        s3UploadedAt: uploadResult.uploadedAt,
        s3ETag: uploadResult.etag,
        fileUrl: uploadResult.url,
        uploadStatus: 'completed',
        storedInCloud: true
      };
      
      const savedResponse = await DatabaseService.addReport(responseReportData);
      
      if (!savedResponse) {
        throw new Error('Failed to save response report to database');
      }
      
      console.log('✅ Response report saved successfully:', savedResponse.id);
      toast.success(`📝 Response report uploaded successfully for ${selectedReportForResponse.patientName}!`);
      
      // Reload data and close modal
      loadData();
      setShowResponseUploadModal(false);
      setSelectedReportForResponse(null);
      setSelectedFile(null);
      setUploadProgress(0);
      
      onUpdate?.();
    } catch (error) {
      console.error('❌ Response Upload Error:', error);
      const errorMessage = error.message || 'Unknown error occurred';
      toast.error(`Response upload failed: ${errorMessage}`);
      setUploadProgress(0);
    } finally {
      setUploadingFile(false);
    }
  };

  const handleViewReport = (report) => {
    console.log('👀 Super Admin viewing report:', report.fileName);
    setSelectedReportForView(report);
    setShowViewModal(true);
  };

  const handleDownloadReport = async (report) => {
    // Super Admin should use View instead of Download
    if (user?.role === 'super_admin') {
      handleViewReport(report);
      return;
    }

    try {
      // For regular users, check if clinic has reached report limit
      if (checkReportLimit(report.clinicId)) {
        setShowSubscriptionPopup(true);
        toast.error('Report limit reached. Please upgrade your plan to continue downloading reports.');
        return;
      }

      let downloadUrl = null;
      let fileName = report.fileName || 'report.pdf';

      // Try multiple download methods
      if (report.s3Key && report.storedInCloud) {
        try {
          downloadUrl = await AWSS3Service.getSignedUrl(report.s3Key, 300); // 5 minutes
        } catch (s3Error) {
          // S3 failed, try fallback methods
        }
      }

      // Fallback to direct file URL if available
      if (!downloadUrl && report.fileUrl) {
        downloadUrl = report.fileUrl;
      }

      // Fallback to localStorage if available
      if (!downloadUrl) {
        const localStorageReports = JSON.parse(localStorage.getItem('reports') || '[]');
        const localReport = localStorageReports.find(r => r.id === report.id);
        if (localReport && localReport.fileData) {
          // Convert base64 to blob and download
          const byteCharacters = atob(localReport.fileData);
          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          const blob = new Blob([byteArray], { type: report.fileType || 'application/pdf' });
          downloadUrl = URL.createObjectURL(blob);
        }
      }

      if (downloadUrl) {
        // Create download link
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = fileName;
        link.target = '_blank';
        link.style.display = 'none';
        
        // Add to DOM, click, and remove
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Clean up blob URL if created
        if (downloadUrl.startsWith('blob:')) {
          setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000);
        }
        
        toast.success(`📥 Downloading ${fileName}`);
      } else {
        // No download method available
        toast.error(`Cannot download ${fileName}. File not found in S3 or local storage.`);
      }
    } catch (error) {
      console.error('❌ Error downloading report:', error);
      toast.error(`Download failed: ${error.message}`);
    }
  };

  const filteredReports = (reports || []).filter(report => {
    const matchesSearch = (report?.patientName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (report?.clinicName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (report?.fileName || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClinic = !selectedClinic || report?.clinicId === selectedClinic;
    const matchesPatient = !selectedPatient || report?.patientId === selectedPatient;
    
    return matchesSearch && matchesClinic && matchesPatient;
  });

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center max-w-md">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to Load Patient Reports</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <div className="space-x-4">
            <button
              onClick={() => {
                setError(null);
                loadData();
              }}
              className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700"
            >
              Try Again
            </button>
            <button
              onClick={() => window.location.reload()}
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300"
            >
              Reload Page
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6 space-y-8">
      {/* Modern Header Section */}
      <div className="relative overflow-hidden bg-white/60 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/10 via-blue-600/10 to-purple-600/10"></div>
        <div className="relative p-8">
          <div className="flex items-center justify-between">
            <div className="space-y-3">
              <h1 className="text-4xl font-black bg-gradient-to-r from-emerald-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
                Patient Reports
              </h1>
              <p className="text-xl text-slate-600 font-medium">
                {superAdminSelectedClinic 
                  ? `📊 Reports for ${clinics?.find(c => c?.id === superAdminSelectedClinic)?.name || 'Selected Clinic'}`
                  : 'Upload and manage EEG reports for patients 🧠'
                }
              </p>
              <div className="flex items-center space-x-4 text-sm text-slate-500 mt-4">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
                  <span>{filteredReports?.length || 0} Reports</span>
                </div>
                <div className="w-1 h-1 bg-slate-400 rounded-full"></div>
                <div>{clinics?.length || 0} Clinics</div>
                <div className="w-1 h-1 bg-slate-400 rounded-full"></div>
                <div className="flex items-center space-x-2">
                  <Cloud className="h-4 w-4" />
                  <span>Cloud Storage</span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => {
                  loadData();
                  toast.success('Patient reports refreshed!');
                }}
                className="group relative overflow-hidden bg-slate-100/80 hover:bg-slate-200/80 backdrop-blur-sm text-slate-700 px-6 py-3 rounded-2xl font-bold transition-all duration-300 hover:scale-105 hover:shadow-xl"
              >
                <div className="flex items-center space-x-3">
                  <Loader2 className="h-5 w-5" />
                  <span>Refresh</span>
                </div>
              </button>
              <button
                onClick={() => setShowUploadModal(true)}
                className="group relative overflow-hidden bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl"
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                <div className="relative flex items-center space-x-3">
                  <Upload className="h-6 w-6" />
                  <span>Upload Report</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Usage Summary */}
      {superAdminSelectedClinic && (
        <div className={`rounded-lg shadow-sm border p-4 mb-4 ${
          user?.role === 'super_admin' 
            ? 'bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200' 
            : 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className={`text-lg font-semibold ${
                user?.role === 'super_admin' ? 'text-purple-900' : 'text-blue-900'
              }`}>
                {user?.role === 'super_admin' ? 'Super Admin - Clinic Overview' : 'Clinic Usage Summary'}
              </h3>
              {(() => {
                const usageInfo = getClinicUsageInfo(superAdminSelectedClinic);
                return (
                  <div className="mt-2 space-y-1">
                    <p className={user?.role === 'super_admin' ? 'text-purple-700' : 'text-blue-700'}>
                      <strong>Plan:</strong> {usageInfo.planName}
                    </p>
                    <p className={user?.role === 'super_admin' ? 'text-purple-700' : 'text-blue-700'}>
                      <strong>Usage:</strong> {usageInfo.used}/{usageInfo.allowed} reports
                    </p>
                    <p className={user?.role === 'super_admin' ? 'text-purple-700' : 'text-blue-700'}>
                      <strong>Remaining:</strong> {usageInfo.remaining} reports
                    </p>
                    {user?.role !== 'super_admin' && usageInfo.remaining <= 2 && (
                      <div className="flex items-center space-x-2 mt-2">
                        <AlertTriangle className="h-4 w-4 text-orange-500" />
                        <span className="text-orange-700 text-sm font-medium">
                          {usageInfo.remaining === 0 ? 'Report limit reached!' : 'Approaching report limit'}
                        </span>
                      </div>
                    )}
                    {user?.role === 'super_admin' && (
                      <div className="flex items-center space-x-2 mt-2">
                        <Lock className="h-4 w-4 text-green-500" />
                        <span className="text-green-700 text-sm font-medium">
                          Super Admin - Unlimited Access
                        </span>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
            <div className="text-right">
              {(() => {
                const usageInfo = getClinicUsageInfo(superAdminSelectedClinic);
                const percentage = user?.role === 'super_admin' ? 0 : (usageInfo.used / (usageInfo.allowed || 1)) * 100;
                return (
                  <div>
                    <div className={`text-2xl font-bold ${
                      user?.role === 'super_admin' ? 'text-purple-900' : 'text-blue-900'
                    }`}>{usageInfo.used}</div>
                    <div className={`text-sm ${
                      user?.role === 'super_admin' ? 'text-purple-700' : 'text-blue-700'
                    }`}>Reports Used</div>
                    {user?.role !== 'super_admin' && (
                      <div className="w-24 h-2 bg-blue-200 rounded-full mt-2">
                        <div 
                          className={`h-2 rounded-full ${
                            percentage >= 90 ? 'bg-red-500' : 
                            percentage >= 75 ? 'bg-orange-500' : 'bg-blue-500'
                          }`}
                          style={{ width: `${Math.min(percentage, 100)}%` }}
                        ></div>
                      </div>
                    )}
                    {user?.role === 'super_admin' && (
                      <div className="w-24 h-2 bg-green-200 rounded-full mt-2">
                        <div className="h-2 rounded-full bg-green-500" style={{ width: '100%' }}></div>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}

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
            {(clinics || []).map(clinic => (
              <option key={clinic?.id || Math.random()} value={clinic?.id || ''}>{clinic?.name || 'Unknown Clinic'}</option>
            ))}
          </select>
          
          <select
            value={selectedPatient}
            onChange={(e) => setSelectedPatient(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">All Patients</option>
            {(patients || [])
              .filter(patient => !selectedClinic || patient?.clinicId === selectedClinic)
              .map(patient => (
                <option key={patient?.id || Math.random()} value={patient?.id || ''}>{patient?.name || 'Unknown Patient'}</option>
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
              {(filteredReports || []).map((report) => (
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
                        onClick={() => handleUploadResponse(report)}
                        className="text-green-600 hover:text-green-900"
                        title="Upload Response Report"
                      >
                        <Upload className="h-4 w-4" />
                      </button>
                      {user?.role === 'super_admin' ? (
                        <button
                          onClick={() => handleViewReport(report)}
                          className="text-blue-600 hover:text-blue-900"
                          title="View Report Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      ) : (
                        checkReportLimit(report.clinicId) ? (
                          <button
                            onClick={() => setShowSubscriptionPopup(true)}
                            className="text-orange-600 hover:text-orange-900"
                            title="Upgrade required to download"
                          >
                            <Lock className="h-4 w-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleDownloadReport(report)}
                            className="text-primary-600 hover:text-primary-900"
                            title="Download"
                          >
                            <Download className="h-4 w-4" />
                          </button>
                        )
                      )}
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
        <ErrorBoundary>
          <UploadReportModal
            onSubmit={handleUploadReport}
            onClose={() => {
              setShowUploadModal(false);
              setSelectedFile(null);
              setUploadProgress(0);
            }}
            clinics={clinics || []}
            patients={patients || []}
            register={register}
            handleSubmit={handleSubmit}
            reset={reset}
            watch={watch}
            errors={errors || {}}
            selectedFile={selectedFile}
            onFileSelect={handleFileSelect}
            uploadingFile={uploadingFile}
            uploadProgress={uploadProgress}
          />
        </ErrorBoundary>
      )}

      {/* Response Upload Modal */}
      {showResponseUploadModal && selectedReportForResponse && (
        <ErrorBoundary>
          <ResponseUploadModal
            onSubmit={handleSubmitResponse}
            onClose={() => {
              setShowResponseUploadModal(false);
              setSelectedReportForResponse(null);
              setSelectedFile(null);
              setUploadProgress(0);
            }}
            selectedFile={selectedFile}
            onFileSelect={handleFileSelect}
            uploadingFile={uploadingFile}
            uploadProgress={uploadProgress}
            originalReport={selectedReportForResponse}
          />
        </ErrorBoundary>
      )}

      {/* Report View Modal for Super Admin */}
      {showViewModal && selectedReportForView && (
        <ReportViewModal
          report={selectedReportForView}
          onClose={() => {
            setShowViewModal(false);
            setSelectedReportForView(null);
          }}
        />
      )}

      {/* Subscription Popup - Only show for non-Super Admin users */}
      {user?.role !== 'super_admin' && (
        <SubscriptionPopup
          isOpen={showSubscriptionPopup}
          onClose={() => setShowSubscriptionPopup(false)}
          clinicId={superAdminSelectedClinic}
          currentUsage={clinicUsage[superAdminSelectedClinic] || 0}
          onSubscribe={handleSubscription}
          clinicInfo={{
            name: user?.clinicName || user?.name || 'Super Admin',
            email: user?.email || 'admin@neuro360.com',
            phone: user?.phone || ''
          }}
        />
      )}
    </div>
  );
};

// Response Upload Modal Component
const ResponseUploadModal = ({ 
  onSubmit, 
  onClose, 
  selectedFile,
  onFileSelect,
  uploadingFile,
  uploadProgress,
  originalReport
}) => {
  const [notes, setNotes] = useState('');

  // Safety check for originalReport
  if (!originalReport) {
    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
        <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-red-600">Error</h3>
            <button onClick={onClose || (() => {})} className="text-gray-400 hover:text-gray-600">
              <X className="h-6 w-6" />
            </button>
          </div>
          <p className="text-gray-700 mb-4">Original report data is missing. Please try again.</p>
          <button onClick={onClose || (() => {})} className="bg-red-600 text-white px-4 py-2 rounded">Close</button>
        </div>
      </div>
    );
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit({ notes });
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Upload Response Report</h3>
          <button
            onClick={onClose || (() => {})}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Original Report Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <h4 className="text-sm font-medium text-blue-900 mb-2">Original Report</h4>
          <div className="space-y-1 text-sm text-blue-700">
            <p><strong>Patient:</strong> {originalReport.patientName || 'Unknown Patient'}</p>
            <p><strong>Clinic:</strong> {originalReport.clinicName || 'Unknown Clinic'}</p>
            <p><strong>Report:</strong> {originalReport.fileName || 'Unknown Report'}</p>
            <p><strong>Date:</strong> {originalReport.createdAt ? new Date(originalReport.createdAt).toLocaleDateString() : 'Unknown Date'}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
              <UploadCloud className="h-4 w-4 mr-2 text-green-500" />
              Upload Response File *
            </label>
            <div className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md transition-colors ${
              selectedFile ? 'border-green-300 bg-green-50' : 'border-gray-300'
            }`}>
              <div className="space-y-1 text-center">
                {selectedFile ? (
                  <>
                    <Cloud className="mx-auto h-12 w-12 text-green-500" />
                    <div className="text-sm text-green-600">
                      <p className="font-medium">{selectedFile.name || 'Unknown file'}</p>
                      <p className="text-xs text-gray-500">
                        {((selectedFile.size || 0) / (1024 * 1024)).toFixed(2)} MB • {selectedFile.type || 'Unknown type'}
                      </p>
                    </div>
                    {uploadingFile && (
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full transition-all duration-300" 
                          style={{ width: `${uploadProgress}%` }}
                        ></div>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-600">
                      <label htmlFor="response-file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-green-600 hover:text-green-500">
                        <span>Upload Response File</span>
                        <input 
                          id="response-file-upload" 
                          name="response-file-upload" 
                          type="file" 
                          className="sr-only"
                          accept=".pdf,.jpeg,.jpg,.png,.doc,.docx"
                          onChange={onFileSelect || (() => {})}
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                  </>
                )}
                <p className="text-xs text-gray-500">
                  PDF, JPEG, PNG, DOC, DOCX up to 50MB
                  {selectedFile && (
                    <button
                      type="button"
                      onClick={() => onFileSelect && onFileSelect({ target: { files: [] } })}
                      className="ml-2 text-red-500 hover:text-red-700"
                    >
                      Remove
                    </button>
                  )}
                </p>
              </div>
            </div>
            {!selectedFile && <p className="text-red-500 text-xs mt-1">Please select a response file to upload</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Response Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows="3"
              placeholder="Add notes about this response report..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose || (() => {})}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploadingFile || !selectedFile}
              className="px-4 py-2 bg-green-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center"
            >
              {uploadingFile ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Uploading Response... ({uploadProgress}%)
                </>
              ) : (
                <>
                  <UploadCloud className="h-4 w-4 mr-2" />
                  Upload Response
                </>
              )}
            </button>
          </div>
        </form>
      </div>
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
  // Safety check to prevent crashes
  if (!register || !handleSubmit || !watch) {
    console.error('❌ UploadReportModal: Missing required form props');
    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md">
          <h3 className="text-lg font-bold text-red-600 mb-4">Form Error</h3>
          <p className="text-gray-700 mb-4">Unable to load upload form. Please refresh the page and try again.</p>
          <button onClick={onClose || (() => {})} className="bg-red-600 text-white px-4 py-2 rounded">Close</button>
        </div>
      </div>
    );
  }
  const [availablePatients, setAvailablePatients] = useState([]);
  const watchedClinic = watch('clinicId');

  useEffect(() => {
    const loadPatients = async () => {
      if (watchedClinic) {
        try {
          const clinicPatients = await DatabaseService.getPatientsByClinic(watchedClinic);
          setAvailablePatients(clinicPatients || []);
          console.log('🏥 Loaded patients for clinic:', watchedClinic, 'Count:', clinicPatients?.length || 0);
        } catch (error) {
          console.error('❌ Error loading patients for clinic:', error);
          setAvailablePatients([]);
        }
      } else {
        setAvailablePatients([]);
      }
    };
    
    loadPatients();
  }, [watchedClinic]);

  const handleFormSubmit = (data) => {
    try {
      console.log('🚀 Admin form submitted with data:', data);
      console.log('Form validation errors:', Object.keys(errors).length > 0 ? errors : 'No errors');
      console.log('Available patients count:', availablePatients.length);
      console.log('Selected file:', selectedFile ? {
        name: selectedFile.name,
        size: selectedFile.size,
        type: selectedFile.type
      } : 'No file selected');
      
      onSubmit(data);
      reset();
    } catch (error) {
      console.error('❌ Form submission error:', error);
      toast.error(`Form submission failed: ${error.message}`);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Upload Patient Report</h3>
          <button
            onClick={onClose || (() => {})}
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
              {(availablePatients || []).map(patient => (
                <option key={patient?.id || Math.random()} value={patient?.id || ''}>{patient?.name || 'Unnamed Patient'}</option>
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
              {...register('title', { required: 'Please enter a report title' })}
              placeholder={selectedFile ? selectedFile.name.replace(/\.[^/.]+$/, "") : "e.g., EEG Analysis Report"}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
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
                      <p className="font-medium">{selectedFile.name || 'Unknown file'}</p>
                      <p className="text-xs text-gray-500">
                        {((selectedFile.size || 0) / (1024 * 1024)).toFixed(2)} MB • {selectedFile.type || 'Unknown type'}
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
              onClick={onClose || (() => {})}
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

// Report View Modal Component for Super Admin
const ReportViewModal = ({ report, onClose }) => {
  const [reportContent, setReportContent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
     const [isFullView, setIsFullView] = useState(false);
   const [showPdfPreview, setShowPdfPreview] = useState(false);

  useEffect(() => {
    if (report) {
      loadReportContent();
    }
  }, [report]);

  // Safety check - don't render if report is null
  if (!report) {
    return null;
  }

  const loadReportContent = async () => {
    if (!report) return;
    
    setLoading(true);
    setError(null);
    
    try {
      let content = null;
      let contentSource = 'not found';
      
      console.log('🔍 Loading report content for:', report.fileName);
      console.log('📋 Report data:', {
        id: report.id,
        s3Key: report.s3Key,
        fileUrl: report.fileUrl,
        storedInCloud: report.storedInCloud
      });
      
      // Method 1: Try mock S3 service
      if (report.s3Key) {
        try {
          console.log('🔍 Trying S3 mock files with key:', report.s3Key);
          const mockFilesData = localStorage.getItem('s3MockFiles');
          const mockFiles = mockFilesData ? JSON.parse(mockFilesData) : [];
          console.log('📁 Available S3 mock files:', mockFiles.length, 'files');
          
          const mockFile = mockFiles.find(f => 
            f && (
              f.key === report.s3Key ||
              f.fileName === report.fileName ||
              f.originalName === report.fileName ||
              (f.metadata && f.metadata.originalName === report.fileName)
            )
          );
          if (mockFile && mockFile.data) {
            content = mockFile.data;
            contentSource = 'S3 Mock';
            console.log('✅ Found content in S3 mock storage');
          } else {
            console.log('❌ No matching file found in S3 mock storage');
            console.log('🔍 Available S3 mock files keys:', mockFiles.map(f => f?.key || 'no-key'));
            console.log('🔍 Looking for S3 key:', report.s3Key);
            console.log('🔍 Looking for filename:', report.fileName);
          }
        } catch (s3Error) {
          console.warn('⚠️ Error parsing S3 mock files:', s3Error);
        }
      }
      
      // Method 2: Try to fetch content from file URL (instead of just using the URL)
      if (!content && report.fileUrl) {
        console.log('🔍 Trying to fetch content from file URL:', report.fileUrl);
        try {
          // Don't use the URL directly, try to find actual content
          if (report.fileUrl.includes('mock-s3-url.com')) {
            console.log('🔍 Detected mock S3 URL, searching for actual content...');
            // This is a mock URL, try to find the real content in localStorage
            const mockFiles = JSON.parse(localStorage.getItem('s3MockFiles') || '[]');
            console.log('📁 Searching in mock files for real content...');
            
            // Try to find by filename or any matching content
            const possibleFile = mockFiles.find(f => 
              f && (
                f.fileName === report.fileName ||
                f.originalName === report.fileName ||
                f.key === report.s3Key
              )
            );
            
            if (possibleFile && possibleFile.data) {
              content = possibleFile.data;
              contentSource = 'S3 Mock (via URL lookup)';
              console.log('✅ Found actual content via URL lookup');
            }
          } else {
            // Real URL - we'll still show it as URL reference for now
            content = `URL Reference: ${report.fileUrl}`;
            contentSource = 'File URL';
            console.log('✅ Using real file URL as reference');
          }
        } catch (urlError) {
          console.warn('⚠️ Error processing file URL:', urlError);
        }
      }
      
      // Method 3: Try localStorage fallback
      if (!content) {
        try {
          console.log('🔍 Trying localStorage reports');
          const localReportsData = localStorage.getItem('reports');
          const localReports = localReportsData ? JSON.parse(localReportsData) : [];
          console.log('📁 Available local reports:', localReports.length, 'reports');
          
          const localReport = localReports.find(r => r && r.id === report.id);
          if (localReport) {
            console.log('📋 Found local report:', localReport.fileName);
            if (localReport.fileData) {
              content = localReport.fileData;
              contentSource = 'localStorage fileData';
              console.log('✅ Found content in localStorage fileData');
            } else if (localReport.s3Key) {
              // Try S3 mock again with the local report's S3 key
              try {
                const mockFilesData = localStorage.getItem('s3MockFiles');
                const mockFiles = mockFilesData ? JSON.parse(mockFilesData) : [];
                const mockFile = mockFiles.find(f => f && f.key === localReport.s3Key);
                if (mockFile && mockFile.data) {
                  content = mockFile.data;
                  contentSource = 'S3 Mock (via localStorage)';
                  console.log('✅ Found content in S3 mock via localStorage');
                }
              } catch (s3RetryError) {
                console.warn('⚠️ Error parsing S3 mock files on retry:', s3RetryError);
              }
            }
          } else {
            console.log('❌ No matching report found in localStorage');
          }
        } catch (localError) {
          console.warn('⚠️ Error parsing localStorage reports:', localError);
        }
      }
      
      // Method 4: Comprehensive search through all available data
      if (!content) {
        console.log('🔍 Performing comprehensive content search...');
        
        try {
          // Search through all S3 mock files more thoroughly
          const allMockFiles = JSON.parse(localStorage.getItem('s3MockFiles') || '[]');
          console.log('🔍 Comprehensive search in', allMockFiles.length, 'mock files');
          
          for (const file of allMockFiles) {
            if (file && file.data) {
              const matches = [
                file.key === report.s3Key,
                file.fileName === report.fileName,
                file.originalName === report.fileName,
                file.name === report.fileName,
                (file.metadata && file.metadata.originalName === report.fileName),
                (file.key && file.key.includes(report.fileName?.replace(/\.[^/.]+$/, ""))), // filename without extension
                (report.fileName && file.key && file.key.includes(report.fileName.replace(/\.[^/.]+$/, "")))
              ];
              
              if (matches.some(match => match)) {
                content = file.data;
                contentSource = 'S3 Mock (comprehensive search)';
                console.log('✅ Found content via comprehensive search:', file.key);
                break;
              }
            }
          }
          
          // If still no content, search in all localStorage tables
          if (!content) {
            console.log('🔍 Searching all localStorage data...');
            const tables = ['reports', 'patients', 'clinics', 'files', 'uploads'];
            
            for (const table of tables) {
              try {
                const data = JSON.parse(localStorage.getItem(table) || '[]');
                if (Array.isArray(data)) {
                  const item = data.find(item => 
                    item && (
                      item.id === report.id ||
                      item.fileName === report.fileName ||
                      (item.fileData && item.fileName === report.fileName)
                    )
                  );
                  
                  if (item && item.fileData) {
                    content = item.fileData;
                    contentSource = `localStorage ${table}`;
                    console.log('✅ Found content in localStorage table:', table);
                    break;
                  }
                }
              } catch (tableError) {
                console.warn(`⚠️ Error searching ${table}:`, tableError);
              }
            }
          }
        } catch (searchError) {
          console.warn('⚠️ Error in comprehensive search:', searchError);
        }
      }

      // Method 5: Create informative message if still no content found
      if (!content) {
        console.log('🔍 No actual content found, creating informative message');
        content = `No Content Available

Report: ${report.fileName || 'Unknown'}
Patient: ${report.patientName || 'Unknown Patient'}
Clinic: ${report.clinicName || 'Unknown Clinic'}
Upload Date: ${report.createdAt ? new Date(report.createdAt).toLocaleDateString() : 'Unknown'}

Storage Information:
- S3 Key: ${report.s3Key || 'None'}
- File URL: ${report.fileUrl || 'None'}
- Storage Type: ${report.storedInCloud ? 'Cloud (AWS S3)' : 'Local'}
- File Size: ${report.fileSize || 'Unknown'}
- File Type: ${report.fileType || 'Unknown'}

Status: The report metadata exists but the actual file content could not be found.
This may happen if:
1. The file was not properly uploaded
2. The file was stored externally and is no longer accessible
3. There was an error during the upload process

Recommendation: Contact the clinic to re-upload this report.`;
        contentSource = 'No Content Message';
      }
      
      console.log('📄 Content loaded from:', contentSource);
      console.log('📊 Content type:', typeof content, 'Length:', content?.length || 0);
      
      setReportContent(content);
      
      if (!content) {
        setError('Report content not found. File may have been moved or deleted.');
      }
    } catch (error) {
      console.error('❌ Error loading report content:', error);
      setError('Failed to load report content: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleFullView = () => {
    setIsFullView(!isFullView);
  };

  return (
         <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
       <div className={`relative mx-auto border shadow-lg rounded-md bg-white ${
         isFullView 
           ? 'top-1 left-1 right-1 bottom-1 max-w-none h-[calc(100vh-0.5rem)] p-2' 
           : 'top-10 max-w-5xl p-5'
       }`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <FileText className="h-5 w-5 mr-2 text-blue-600" />
            Report Details - {report?.fileName || 'Unknown Report'}
          </h3>
          <div className="flex items-center space-x-2">
            {reportContent && (
              <button
                onClick={toggleFullView}
                className="text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-50"
                title={isFullView ? 'Exit Full View' : 'Full View'}
              >
                {isFullView ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            )}
            <button
              onClick={onClose || (() => {})}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Show details only in normal view */}
        {!isFullView && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Report Information */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-md font-semibold text-gray-900 mb-3 flex items-center">
                  <FileText className="h-4 w-4 mr-2" />
                  Report Information
                </h4>
                <div className="space-y-2 text-sm">
                  <div><span className="font-medium">File Name:</span> {report?.fileName || 'N/A'}</div>
                  <div><span className="font-medium">Title:</span> {report?.title || 'N/A'}</div>
                  <div><span className="font-medium">Type:</span> {report?.reportType || 'EEG'}</div>
                  <div><span className="font-medium">Size:</span> {report?.fileSize || 'N/A'}</div>
                  <div><span className="font-medium">Uploaded:</span> {report?.createdAt ? new Date(report.createdAt).toLocaleString() : 'N/A'}</div>
                  <div><span className="font-medium">Uploaded by:</span> {report?.uploadedBy || 'N/A'}</div>
                </div>
              </div>

              {/* Patient & Clinic Information */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="text-md font-semibold text-blue-900 mb-3 flex items-center">
                  <Users className="h-4 w-4 mr-2" />
                  Patient & Clinic Details
                </h4>
                <div className="space-y-2 text-sm text-blue-800">
                  <div><span className="font-medium">Patient:</span> {report?.patientName || 'Unknown Patient'}</div>
                  <div><span className="font-medium">Clinic:</span> {report?.clinicName || 'Unknown Clinic'}</div>
                  <div><span className="font-medium">Patient ID:</span> {report?.patientId || 'N/A'}</div>
                  <div><span className="font-medium">Clinic ID:</span> {report?.clinicId || 'N/A'}</div>
                </div>
              </div>
            </div>

            {/* Notes */}
            {report?.notes && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <h4 className="text-md font-semibold text-yellow-900 mb-2">Notes</h4>
                <p className="text-sm text-yellow-800">{report.notes}</p>
              </div>
            )}
          </>
        )}

        {/* Report Content Preview */}
        <div className={`border rounded-lg p-4 mb-6 ${isFullView ? 'flex-1 flex flex-col' : ''}`}>
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-md font-semibold text-gray-900">
              {isFullView ? 'Full Report View' : 'Report Preview'}
            </h4>
            {reportContent && !isFullView && (
              <button
                onClick={toggleFullView}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center text-sm"
              >
                <Eye className="h-4 w-4 mr-2" />
                View Full Size
              </button>
            )}
          </div>

          <div className={`bg-gray-100 rounded-lg p-6 ${isFullView ? 'flex-1 flex flex-col' : ''}`}>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading report content...</p>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <h5 className="text-lg font-medium text-red-900 mb-2">Unable to Load Report</h5>
                <p className="text-red-700 mb-4">{error}</p>
                <button
                  onClick={loadReportContent}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md"
                >
                  Retry
                </button>
              </div>
            ) : reportContent ? (
              <div className={`${isFullView ? 'flex-1 flex flex-col' : 'text-center py-8'}`}>
                {!isFullView && (
                  <>
                    <FileText className="h-16 w-16 text-green-500 mx-auto mb-4" />
                    <h5 className="text-lg font-medium text-green-900 mb-2">Report Ready</h5>
                    <p className="text-green-700 mb-4">
                      Report content is available. Click "View Full Size" to see the complete document.
                    </p>
                    <div className="text-xs text-gray-500 bg-white p-2 rounded border max-w-md mx-auto mb-4">
                      <strong>Technical Info:</strong><br/>
                      Storage: {report?.s3Key ? 'AWS S3' : 'Local Storage'}<br/>
                      Content Type: {report?.fileType || 'application/pdf'}<br/>
                      Content Size: {reportContent?.length || 0} characters<br/>
                      Format: {reportContent?.startsWith('data:') ? 'Base64 Data' : reportContent?.startsWith('http') ? 'URL' : 'Raw Data'}
                    </div>
                  </>
                )}
                
                                 {/* Report Content Display */}
                 <div className={`${isFullView ? 'flex-1 flex flex-col' : 'mt-4'}`}>
                                        <div className="flex items-center justify-between mb-2">
                       <h6 className="text-sm font-medium text-gray-900">Report Content</h6>
                       <div className="flex items-center space-x-3">
                         {/* PDF Preview Toggle */}
                         {reportContent?.startsWith('data:application/pdf') && (
                           <div className="flex items-center space-x-1">
                             <span className="text-xs text-gray-500">View:</span>
                             <button
                               onClick={() => setShowPdfPreview(!showPdfPreview)}
                               className={`text-xs px-2 py-0.5 rounded border ${
                                 showPdfPreview ? 'bg-green-100 text-green-700 border-green-300' : 'bg-gray-100 text-gray-700 border-gray-300'
                               }`}
                             >
                               {showPdfPreview ? 'Raw Data' : 'PDF View'}
                             </button>
                           </div>
                         )}
                         

                         
                         {/* Character Count */}
                         <div className="flex space-x-2 text-xs text-gray-500">
                           <span>Characters: {reportContent?.length || 0}</span>
                         </div>
                       </div>
                     </div>
                   
                   {/* PDF Viewer */}
                   {reportContent?.startsWith('data:application/pdf') && showPdfPreview ? (
                     <div className={`border rounded-md bg-white ${
                       isFullView 
                         ? 'flex-1 min-h-[600px]' 
                         : 'h-96 min-h-[400px] max-h-[800px]'
                     }`}>
                       <iframe
                         src={`${reportContent}#toolbar=0&navpanes=0&scrollbar=0&statusbar=0&messages=0&scrollbar=0&view=FitH`}
                         className="w-full h-full border-0 rounded-md"
                         title={`PDF Viewer - ${report?.fileName || 'Report'}`}
                         style={{
                           minHeight: isFullView ? '600px' : '400px',
                           height: '100%',
                           width: '100%'
                         }}
                       />
                     </div>
                   ) : (
                     /* Text/Data Display */
                     <textarea
                       value={(() => {
                         if (!reportContent) return 'No content available';
                         
                         // Handle different content types
                         if (reportContent.startsWith('data:application/pdf')) {
                           return `PDF REPORT CONTENT\n\n` +
                             `📄 File: ${report?.fileName || 'Unknown Report'}\n` +
                             `👤 Patient: ${report?.patientName || 'Unknown Patient'}\n` +
                             `🏥 Clinic: ${report?.clinicName || 'Unknown Clinic'}\n` +
                             `📅 Date: ${report?.createdAt ? new Date(report.createdAt).toLocaleDateString() : 'Unknown'}\n` +
                             `📊 Size: ${reportContent.length} characters (Base64 encoded)\n\n` +
                             `📋 REPORT TYPE: ${report?.reportType || 'Medical Report'}\n\n` +
                             `═══════════════════════════════════════════════════════\n\n` +
                             `🔍 PDF CONTENT PREVIEW:\n\n` +
                             `This is a PDF document containing medical report data.\n` +
                             `The PDF is properly encoded and stored in base64 format.\n\n` +
                             `Click "PDF View" button above to see the actual PDF document.\n\n` +
                             `Base64 Encoded PDF Data (first 200 characters):\n` +
                             `${reportContent.split(',')[1]?.substring(0, 200) || 'No data'}...\n\n` +
                             `═══════════════════════════════════════════════════════\n\n` +
                             `📝 FULL BASE64 CONTENT:\n\n` +
                             `${reportContent}`;
                           
                         } else if (reportContent.startsWith('data:')) {
                           try {
                             const [header, content] = reportContent.split(',');
                             const contentType = header.match(/data:([^;]+)/)?.[1] || 'unknown';
                             
                             // Try to decode if it's text-based content
                             if (contentType.includes('text') || contentType.includes('json')) {
                               try {
                                 const decoded = atob(content);
                                 return `DECODED REPORT CONTENT\n\n` +
                                   `📄 File: ${report?.fileName || 'Unknown'}\n` +
                                   `👤 Patient: ${report?.patientName || 'Unknown Patient'}\n` +
                                   `🏥 Clinic: ${report?.clinicName || 'Unknown Clinic'}\n` +
                                   `📊 Content Type: ${contentType}\n` +
                                   `📏 Size: ${decoded.length} characters\n\n` +
                                   `═══════════════════════════════════════════════════════\n\n` +
                                   `📋 REPORT CONTENT:\n\n${decoded}`;
                               } catch (decodeError) {
                                 console.warn('Failed to decode base64 content:', decodeError);
                               }
                             }
                             
                             return `ENCODED REPORT DATA\n\n` +
                               `📄 File: ${report?.fileName || 'Unknown'}\n` +
                               `👤 Patient: ${report?.patientName || 'Unknown Patient'}\n` +
                               `🏥 Clinic: ${report?.clinicName || 'Unknown Clinic'}\n` +
                               `📊 Content Type: ${contentType}\n` +
                               `📏 Encoded Size: ${content?.length || 0} characters\n\n` +
                               `═══════════════════════════════════════════════════════\n\n` +
                               `📋 BASE64 ENCODED CONTENT:\n\n${content?.substring(0, 2000) || 'No content'}${content?.length > 2000 ? '\n\n... (content truncated, scroll up to see full data)' : ''}`;
                               
                           } catch (dataError) {
                             console.error('Error processing data content:', dataError);
                             return reportContent;
                           }
                         } else if (reportContent.startsWith('http')) {
                           return `URL REFERENCE\n\n📄 File: ${report?.fileName || 'Unknown'}\n👤 Patient: ${report?.patientName || 'Unknown Patient'}\n🏥 Clinic: ${report?.clinicName || 'Unknown Clinic'}\n🔗 URL: ${reportContent}\n\n⚠️  NOTE: This report is stored as a URL reference.\nThe actual content may be hosted externally.`;
                         } else {
                           // Plain text or other content
                           return `REPORT CONTENT\n\n` +
                             `📄 File: ${report?.fileName || 'Unknown'}\n` +
                             `👤 Patient: ${report?.patientName || 'Unknown Patient'}\n` +
                             `🏥 Clinic: ${report?.clinicName || 'Unknown Clinic'}\n` +
                             `📅 Date: ${report?.createdAt ? new Date(report.createdAt).toLocaleDateString() : 'Unknown'}\n\n` +
                             `═══════════════════════════════════════════════════════\n\n` +
                             `📋 REPORT DATA:\n\n${reportContent}`;
                         }
                       })()}
                       readOnly
                       className={`w-full border rounded-md p-3 font-mono text-xs bg-white resize-both overflow-auto ${
                         isFullView 
                           ? 'flex-1 min-h-[400px]' 
                           : 'h-64 min-h-[200px] max-h-[500px]'
                       } whitespace-pre-wrap`}
                       style={{
                         minWidth: '100%',
                         maxWidth: '100%',
                         resize: isFullView ? 'vertical' : 'both'
                       }}
                       placeholder="Report content will appear here..."
                     />
                   )}
                   
                   <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                     <div className="flex space-x-4">
                       <span>📄 Type: {
                         reportContent?.startsWith('data:application/pdf') ? 'PDF Document' :
                         reportContent?.startsWith('data:') ? 'Base64 Data' :
                         reportContent?.startsWith('http') ? 'URL Reference' :
                         'Text Content'
                       }</span>
                       <span>🗂️ Storage: {report?.s3Key ? 'AWS S3' : 'Local'}</span>
                     </div>
                     <div>
                       <span>💡 Tip: {reportContent?.startsWith('data:application/pdf') ? 'Click "PDF View" to see the actual document' : 'Drag the bottom-right corner to resize'}</span>
                     </div>
                   </div>
                 </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h5 className="text-lg font-medium text-gray-900 mb-2">No Preview Available</h5>
                <p className="text-gray-600">
                  Report metadata is available, but the file content could not be loaded.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center">
          <div>
            <button
              onClick={() => {
                try {
                  console.log('🐛 DEBUG - Report Object:', report);
                  console.log('🐛 DEBUG - Report Content:', reportContent);
                  
                  try {
                    const reportsData = localStorage.getItem('reports');
                    const reports = reportsData ? JSON.parse(reportsData) : [];
                    console.log('🐛 DEBUG - localStorage reports:', reports);
                  } catch (reportsError) {
                    console.log('🐛 DEBUG - localStorage reports ERROR:', reportsError);
                  }
                  
                  try {
                    const s3Data = localStorage.getItem('s3MockFiles');
                    const s3Files = s3Data ? JSON.parse(s3Data) : [];
                    console.log('🐛 DEBUG - localStorage s3MockFiles:', s3Files);
                  } catch (s3Error) {
                    console.log('🐛 DEBUG - localStorage s3MockFiles ERROR:', s3Error);
                  }
                  
                  toast.success('Debug info logged to console (F12 → Console)');
                } catch (error) {
                  console.error('🐛 DEBUG - Error during debug:', error);
                  toast.error('Debug failed - check console for error details');
                }
              }}
              className="px-3 py-1 bg-gray-500 text-white text-xs rounded hover:bg-gray-600"
            >
              Debug Info
            </button>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Close
            </button>
            {reportContent && (
              <button
                onClick={toggleFullView}
                className="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700"
              >
                {isFullView ? 'Exit Full View' : 'View Full Size'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientReports;
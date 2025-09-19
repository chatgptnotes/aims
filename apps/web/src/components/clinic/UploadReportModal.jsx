import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { X, UploadCloud, FileText, Loader2, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import DatabaseService from '../../services/databaseService';
import AWSS3Service from '../../services/awsS3Service';
import ReportWorkflowService from '../../services/reportWorkflowService';
import { useAuth } from '../../contexts/AuthContext';
import { logUploadAttempt, logUploadError } from '../../utils/uploadErrorChecker';
import SubscriptionPopup from '../admin/SubscriptionPopup';

const UploadReportModal = ({ clinicId, patient, onUpload, onClose }) => {
  const { user } = useAuth();
  const { register, handleSubmit, formState: { errors }, watch, reset } = useForm({
    defaultValues: {
      title: '',
      reportType: '',
      notes: '',
      reportFile: null
    }
  });
  
  // Load subscription and usage data
  useEffect(() => {
    const loadUsageData = async () => {
      try {
        // Load current reports count
        const reports = await DatabaseService.getReportsByClinic(clinicId);
        setCurrentReports(reports.length);
        
        // Load subscription data
        const subscriptions = await DatabaseService.get('subscriptions') || [];
        const clinicSubscription = subscriptions.find(sub => sub.clinicId === clinicId);
        setSubscription(clinicSubscription);
      } catch (error) {
        console.error('Error loading usage data:', error);
      }
    };
    
    if (clinicId) {
      loadUsageData();
    }
  }, [clinicId]);

  // Debug logging when modal opens
  useEffect(() => {
    console.log('📂 UploadReportModal opened with:', { 
      clinicId, 
      patient: patient ? { id: patient.id, name: patient.name } : null, 
      user: user ? { name: user.name, role: user.role } : null 
    });
    
    // Validate required props
    if (!clinicId) {
      console.error('❌ UploadReportModal: clinicId is required');
    }
    if (!patient) {
      console.error('❌ UploadReportModal: patient is required');
    }
    if (!user) {
      console.warn('⚠️ UploadReportModal: user not loaded yet');
    }
  }, [clinicId, patient, user]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showSubscriptionPopup, setShowSubscriptionPopup] = useState(false);
  const [subscription, setSubscription] = useState(null);
  const [currentReports, setCurrentReports] = useState(0);
  const selectedFile = watch('reportFile');

  // Check if clinic has reached report limit
  const checkReportLimit = () => {
    if (subscription && subscription.status === 'active') {
      // Paid subscription - check against plan limit
      return currentReports >= subscription.reportsAllowed;
    } else {
      // Trial subscription - 10 report limit
      return currentReports >= 10;
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
      
      // Reload usage data
      const reports = await DatabaseService.getReportsByClinic(clinicId);
      setCurrentReports(reports.length);
      
      const subscriptions = await DatabaseService.get('subscriptions') || [];
      const clinicSubscription = subscriptions.find(sub => sub.clinicId === clinicId);
      setSubscription(clinicSubscription);
      
      toast.success('Subscription updated successfully!');
    } catch (error) {
      console.error('Error updating subscription:', error);
      toast.error('Failed to update subscription');
    }
  };

  const onSubmit = async (data) => {
    // Check if clinic has reached report limit
    if (checkReportLimit()) {
      setShowSubscriptionPopup(true);
      toast.error('Report limit reached. Please upgrade your plan to continue uploading reports.');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    
    try {
      const file = data.reportFile[0];
      
      // Log upload attempt and check for errors
      const uploadErrors = logUploadAttempt(clinicId, patient, user, file);
      if (uploadErrors.length > 0) {
        throw new Error(`Upload validation failed: ${uploadErrors.join(', ')}`);
      }
      
      // Validate file type for EDF processing
      const validEDFTypes = ['.edf', '.eeg', '.bdf'];
      const fileExt = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));

      if (validEDFTypes.includes(fileExt)) {
        // Start complete EDF processing workflow
        console.log('🧠 Starting EDF processing workflow for:', file.name);

        // Simulate progress for workflow initialization
        const progressInterval = setInterval(() => {
          setUploadProgress(prev => Math.min(prev + 5, 25));
        }, 300);

        const workflowId = await ReportWorkflowService.startEDFProcessingWorkflow(
          file,
          patient,
          clinicId
        );

        clearInterval(progressInterval);
        setUploadProgress(30);

        toast.success(`🚀 EDF processing workflow started!
        📋 Workflow ID: ${workflowId.substring(0, 8)}...
        ⏱️ Estimated completion: 8 minutes
        🔄 Processing: Upload → qEEG Pro → NeuroSense → Care Plan`);

        // Update progress to show workflow started
        setUploadProgress(100);

      } else {
        // Standard file upload for non-EDF files
        console.log('📁 Standard file upload for:', file.name);

        // Validate file
        AWSS3Service.validateFile(file);

        // Simulate upload progress
        const progressInterval = setInterval(() => {
          setUploadProgress(prev => Math.min(prev + 10, 90));
        }, 200);

        // Upload file to S3
        const uploadResult = await AWSS3Service.uploadFile(
          file,
          file.name,
          {
            clinicId: clinicId,
            patientId: patient.id,
            reportType: data.reportType || 'Standard',
            uploadedBy: user?.name || 'Unknown User'
          }
        );

        clearInterval(progressInterval);
        setUploadProgress(100);

        // Save report metadata to database
        const reportData = {
          clinicId,
          patientId: patient.id,
          title: data.title,
          notes: data.notes,
          fileName: file.name,
          fileSize: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
          fileType: file.type,
          uploadedBy: user.name,
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

        toast.success(`📁 File uploaded successfully!`);
      }
      onUpload();
      onClose();
      reset();
    } catch (error) {
      logUploadError(error, { clinicId, patient, user, file: data.reportFile?.[0] });
      toast.error(`Upload failed: ${error.message}`);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  // Don't render if required props are missing
  if (!clinicId || !patient) {
    console.error('UploadReportModal: Missing required props', { clinicId, patient });
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-lg">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Upload New Report for {patient?.name || 'Patient'}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        {/* Usage Warning */}
        {(() => {
          const usageInfo = subscription && subscription.status === 'active' 
            ? { used: currentReports, allowed: subscription.reportsAllowed, remaining: subscription.reportsAllowed - currentReports, isTrial: false }
            : { used: currentReports, allowed: 10, remaining: 10 - currentReports, isTrial: true };
          
          if (usageInfo.remaining <= 2) {
            return (
              <div className="mb-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5 text-orange-500" />
                  <div>
                    <p className="text-orange-800 font-medium">
                      {usageInfo.remaining === 0 ? 'Report limit reached!' : 'Approaching report limit'}
                    </p>
                    <p className="text-orange-700 text-sm">
                      You've used {usageInfo.used}/{usageInfo.allowed} reports. 
                      {usageInfo.remaining === 0 ? ' Upgrade your plan to continue uploading.' : ` ${usageInfo.remaining} reports remaining.`}
                    </p>
                  </div>
                </div>
              </div>
            );
          }
          return null;
        })()}
        
        {isUploading && (
          <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
              <span className="text-blue-800 font-medium">Uploading file...</span>
            </div>
            <div className="w-full bg-blue-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
            <p className="text-sm text-blue-600 mt-1">{uploadProgress}% complete</p>
          </div>
        )}
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label htmlFor="patientName" className="block text-sm font-medium text-gray-700 mb-2">
              Patient
            </label>
            <input
              id="patientName"
              type="text"
              disabled
              value={patient?.name || ''}
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
            />
          </div>

          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Report Title
            </label>
            <input
              id="title"
              type="text"
              {...register('title', { required: 'Title is required' })}
              className={`w-full px-3 py-2 border ${errors.title ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500`}
            />
            {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
          </div>

          <div>
            <label htmlFor="reportType" className="block text-sm font-medium text-gray-700 mb-2">
              Report Type
            </label>
            <select
              id="reportType"
              {...register('reportType', { required: 'Report type is required' })}
              className={`w-full px-3 py-2 border ${errors.reportType ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500`}
            >
              <option value="">Select report type</option>
              <option value="EEG">EEG Report</option>
              <option value="PDF">PDF Report</option>
              <option value="EDF">EDF File</option>
              <option value="Other">Other</option>
            </select>
            {errors.reportType && <p className="text-red-500 text-sm mt-1">{errors.reportType.message}</p>}
          </div>

          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
              Notes (Optional)
            </label>
            <textarea
              id="notes"
              rows={3}
              {...register('notes')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              placeholder="Add any additional notes about this report..."
            />
          </div>

          <div>
            <label htmlFor="reportFile" className="block text-sm font-medium text-gray-700 mb-2">
              Report File
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
              <div className="space-y-1 text-center">
                <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
                <div className="flex text-sm text-gray-600">
                  <label
                    htmlFor="reportFile"
                    className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500"
                  >
                    <span>Upload a file</span>
                    <input 
                      id="reportFile" 
                      {...register('reportFile', { required: 'File is required' })} 
                      type="file" 
                      accept=".pdf,.docx,.edf,.csv,.txt,.jpg,.jpeg,.png" 
                      className="sr-only" 
                      disabled={isUploading}
                    />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500">PDF, EDF, DOCX, images, etc. up to 200MB</p>
                <p className="text-xs text-green-600">✅ Files will be stored securely (Development Mode)</p>
              </div>
            </div>
            {selectedFile && selectedFile[0] && (
              <div className="mt-2 flex items-center text-sm text-gray-500">
                <FileText className="h-5 w-5 text-gray-400 mr-2" />
                {selectedFile[0].name} ({((selectedFile[0].size || 0) / (1024 * 1024)).toFixed(2)} MB)
              </div>
            )}
            {errors.reportFile && <p className="text-red-500 text-sm mt-1">{errors.reportFile.message}</p>}
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
              disabled={isUploading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUploading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Uploading...</span>
                </>
              ) : (
                <>
                  <UploadCloud className="h-4 w-4" />
                  <span>Upload Report</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Subscription Popup */}
      <SubscriptionPopup
        isOpen={showSubscriptionPopup}
        onClose={() => setShowSubscriptionPopup(false)}
        clinicId={clinicId}
        currentUsage={currentReports}
        onSubscribe={handleSubscription}
        clinicInfo={{
          name: user?.clinicName || user?.name || 'Clinic',
          email: user?.email || '',
          phone: user?.phone || ''
        }}
      />
    </div>
  );
};

export default UploadReportModal;
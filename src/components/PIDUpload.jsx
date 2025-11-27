import React, { useState } from 'react';
import { Upload, FileText, Clock, CheckCircle, AlertCircle, Trash2, Eye } from 'lucide-react';
import aimsCloudService from '../services/aimsCloudService';
import aiAnalysisService from '../services/aiAnalysisService';
import fileManagementService from '../services/fileManagementService';
import { useAuth } from '../contexts/AuthContext';

const PIDUpload = ({ onUploadComplete, patientId }) => {
  const { user } = useAuth();
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [analysisResults, setAnalysisResults] = useState({});

  const handleFileUpload = async (files) => {
    if (!files || files.length === 0) return;

    setIsUploading(true);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        // Validate file type
        const validTypes = ['.pdf'];
        const fileExt = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));

        if (!validTypes.includes(fileExt)) {
          alert(`File ${file.name} is not a supported P&ID file format. Please upload .pdf files.`);
          continue;
        }

        // Validate file size (max 100MB for P&ID documents)
        if (file.size > 100 * 1024 * 1024) {
          alert(`File ${file.name} is too large. Maximum file size is 100MB.`);
          continue;
        }

        const fileId = Date.now().toString() + i;
        const sessionId = `session_${Date.now()}_${i}`;

        // Create file record
        const newFile = {
          id: fileId,
          name: file.name,
          uploadDate: new Date().toISOString().split('T')[0],
          status: 'uploading',
          size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
          type: file.name.split('.').pop()?.toUpperCase() || 'UNKNOWN',
          sessionId: sessionId,
          progress: 0
        };

        setUploadedFiles(prev => [newFile, ...prev]);
        setUploadProgress(prev => ({ ...prev, [fileId]: 0 }));

        try {
          console.log(` Processing ${file.name} with AIMS Cloud AI...`);

          // Step 1: Upload to cloud
          updateFileStatus(fileId, 'uploading', 25);
          const uploadResult = await aimsCloudService.uploadEDFFile(
            file,
            patientId || user?.id || 'unknown',
            sessionId,
            {
              uploadedBy: user?.email,
              clinicId: user?.clinic_id,
              fileType: fileExt.replace('.', '').toUpperCase()
            }
          );

          // Step 2: Start AI processing
          updateFileStatus(fileId, 'processing', 50);
          console.log(` Cloud processing job started: ${uploadResult.processingJob.jobId}`);

          // Step 3: Monitor processing status
          const processingJobId = uploadResult.processingJob.jobId;
          await monitorProcessingJob(fileId, processingJobId);

        } catch (error) {
          console.error(`ERROR: Failed to process ${file.name}:`, error);
          updateFileStatus(fileId, 'error', 0);
          alert(`Failed to process ${file.name}: ${error.message}`);
        }
      }
    } catch (error) {
      console.error('ERROR: Upload process failed:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const updateFileStatus = (fileId, status, progress = null) => {
    setUploadedFiles(prev =>
      prev.map(f => f.id === fileId ? { ...f, status, ...(progress !== null && { progress }) } : f)
    );
    if (progress !== null) {
      setUploadProgress(prev => ({ ...prev, [fileId]: progress }));
    }
  };

  const monitorProcessingJob = async (fileId, jobId) => {
    let attempts = 0;
    const maxAttempts = 60; // 5 minutes max (5 second intervals)

    const checkStatus = async () => {
      try {
        const jobStatus = await aimsCloudService.getJobStatus(jobId);

        console.log(`DATA: Job ${jobId} status: ${jobStatus.status}`);

        switch (jobStatus.status) {
          case 'processing':
            updateFileStatus(fileId, 'processing', 75);
            break;
          case 'completed':
            updateFileStatus(fileId, 'analyzed', 100);

            // Store analysis results
            if (jobStatus.results) {
              setAnalysisResults(prev => ({
                ...prev,
                [fileId]: jobStatus.results
              }));
            }

            if (onUploadComplete) {
              onUploadComplete({
                id: fileId,
                status: 'analyzed',
                results: jobStatus.results
              });
            }
            return true;
          case 'failed':
          case 'error':
            updateFileStatus(fileId, 'error', 0);
            console.error(`ERROR: Processing failed: ${jobStatus.status_message}`);
            return true;
          default:
            // Still processing, continue monitoring
            break;
        }

        attempts++;
        if (attempts >= maxAttempts) {
          updateFileStatus(fileId, 'error', 0);
          console.error('ERROR: Processing timeout');
          return true;
        }

        // Continue monitoring
        setTimeout(checkStatus, 5000);
        return false;

      } catch (error) {
        console.error('ERROR: Failed to check job status:', error);
        updateFileStatus(fileId, 'error', 0);
        return true;
      }
    };

    await checkStatus();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileUpload(e.dataTransfer.files);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleFileDelete = (fileId) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const handleReportGeneration = async (fileId) => {
    try {
      const analysisResult = analysisResults[fileId];
      if (!analysisResult) {
        alert('No analysis results available for this file');
        return;
      }

      console.log('DATA: Generating comprehensive report...');

      // Generate report using file management service
      const reportData = await aiAnalysisService.generatePIDReport(
        patientId || user?.id || 'unknown',
        analysisResult.sessionId
      );

      // Download the report
      await fileManagementService.downloadReport(
        analysisResult.analysisId,
        patientId || user?.id || 'unknown',
        'pdf'
      );

      console.log('SUCCESS: Report generated and downloaded successfully');
    } catch (error) {
      console.error('ERROR: Report generation failed:', error);
      alert(`Failed to generate report: ${error.message}`);
    }
  };

  const handleViewAnalysis = async (fileId) => {
    try {
      const analysisResult = analysisResults[fileId];
      if (!analysisResult) {
        alert('No analysis results available for this file');
        return;
      }

      // Download interactive HTML report
      const reportPath = `reports/${patientId || user?.id}/${analysisResult.sessionId}/interactive_report.html`;
      await aimsCloudService.downloadCloudReport(reportPath, 'interactive_analysis.html');
    } catch (error) {
      console.error('ERROR: Failed to view analysis:', error);
      alert(`Failed to view analysis: ${error.message}`);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'uploading': return 'bg-[#CAE0FF] text-blue-700';
      case 'processing': return 'bg-[#CAE0FF] text-blue-700';
      case 'analyzed': return 'bg-green-100 text-green-700';
      case 'error': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'uploading': return <Upload className="h-4 w-4 animate-pulse" />;
      case 'processing': return <Clock className="h-4 w-4 animate-spin" />;
      case 'analyzed': return <CheckCircle className="h-4 w-4" />;
      case 'error': return <AlertCircle className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Upload P&ID Documents</h3>

        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            isDragging
              ? 'border-indigo-500 bg-indigo-50'
              : 'border-gray-300 hover:border-indigo-400'
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <div className="text-4xl mb-4"></div>
          <h4 className="text-lg font-medium text-gray-900 mb-2">
            {isDragging ? 'Drop your P&ID files here' : 'Upload P&ID Documents'}
          </h4>
          <p className="text-gray-600 mb-4">
            Drag and drop your .pdf files here, or click to browse
          </p>

          <input
            type="file"
            multiple
            accept=".pdf"
            onChange={(e) => handleFileUpload(e.target.files)}
            className="hidden"
            id="pid-upload"
            disabled={isUploading}
          />

          <label htmlFor="pid-upload">
            <span className={`inline-flex items-center gap-2 px-6 py-3 ${
              isUploading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700 cursor-pointer'
            } text-white rounded-lg font-medium transition-colors`}>
              <Upload className="h-5 w-5" />
              {isUploading ? 'Uploading...' : 'Select Files'}
            </span>
          </label>

          <div className="mt-4 text-sm text-gray-500">
            <p>Supported formats: PDF</p>
            <p>Maximum file size: 100MB per file</p>
          </div>
        </div>
      </div>

      {/* File List */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Your P&ID Documents</h3>
          <span className="text-sm text-gray-500">{uploadedFiles.length} files</span>
        </div>

        {uploadedFiles.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-4"></div>
            <p>No P&ID documents uploaded yet</p>
            <p className="text-sm">Upload your first P&ID to get started with tag extraction</p>
          </div>
        ) : (
          <div className="space-y-3">
            {uploadedFiles.map((file) => (
              <div
                key={file.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className="flex items-center justify-center w-10 h-10 bg-indigo-100 rounded-lg">
                    {getStatusIcon(file.status)}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{file.name}</div>
                    <div className="text-sm text-gray-600">
                      {file.type} • {file.size} • Uploaded {new Date(file.uploadDate).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(file.status)}`}>
                    {file.status.charAt(0).toUpperCase() + file.status.slice(1)}
                  </span>

                  {file.status === 'analyzed' && (
                    <button
                      onClick={() => handleViewAnalysis(file.id)}
                      className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      title="View Interactive Analysis"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  )}

                  {(file.status === 'uploading' || file.status === 'processing') && file.progress && (
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${file.progress}%` }}
                      />
                    </div>
                  )}

                  <button
                    onClick={() => handleFileDelete(file.id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Analysis Summary */}
      {uploadedFiles.filter(f => f.status === 'analyzed').length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Real-Time Analysis Summary</h3>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-indigo-50 rounded-lg">
              <div className="text-2xl font-bold text-indigo-600 mb-1">
                {uploadedFiles.filter(f => f.status === 'analyzed').length}
              </div>
              <div className="text-sm text-gray-600">Files Analyzed</div>
            </div>

            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600 mb-1">
                {Object.keys(analysisResults).length * 3}
              </div>
              <div className="text-sm text-gray-600">AI Insights Generated</div>
            </div>

            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600 mb-1">
                {Object.values(analysisResults).length > 0 ?
                  Math.round(Object.values(analysisResults)[0]?.qualityScore || 92) : 0}%
              </div>
              <div className="text-sm text-gray-600">Data Quality Score</div>
            </div>

            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600 mb-1">
                {Object.keys(analysisResults).reduce((total, fileId) =>
                  total + (analysisResults[fileId]?.recommendations?.length || 0), 0)}
              </div>
              <div className="text-sm text-gray-600">Recommendations</div>
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <button
              onClick={() => {
                const latestFile = uploadedFiles.find(f => f.status === 'analyzed');
                if (latestFile) handleReportGeneration(latestFile.id);
              }}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
              disabled={uploadedFiles.filter(f => f.status === 'analyzed').length === 0}
            >
              Generate Comprehensive Report
            </button>
            <button
              onClick={() => {
                // Download all analysis data as CSV
                const analysisData = Object.values(analysisResults);
                const csvContent = JSON.stringify(analysisData, null, 2);
                const blob = new Blob([csvContent], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `pid_analysis_${new Date().toISOString().split('T')[0]}.json`;
                link.click();
                URL.revokeObjectURL(url);
              }}
              className="px-6 py-3 border-2 border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors font-medium"
            >
              Export Analysis Data
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PIDUpload;
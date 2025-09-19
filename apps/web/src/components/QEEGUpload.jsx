import React, { useState } from 'react';
import { Upload, FileText, Clock, CheckCircle, AlertCircle, Trash2, Eye } from 'lucide-react';

const QEEGUpload = ({ onUploadComplete }) => {
  const [uploadedFiles, setUploadedFiles] = useState([
    {
      id: '1',
      name: 'baseline_qeeg_20250115.edf',
      uploadDate: '2025-01-15',
      status: 'analyzed',
      size: '2.4 MB',
      type: 'EDF'
    },
    {
      id: '2',
      name: 'followup_qeeg_20250110.edf',
      uploadDate: '2025-01-10',
      status: 'processing',
      size: '2.1 MB',
      type: 'EDF'
    }
  ]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (files) => {
    if (!files || files.length === 0) return;

    setIsUploading(true);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // Validate file type
      const validTypes = ['.edf', '.eeg', '.bdf'];
      const fileExt = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));

      if (!validTypes.includes(fileExt)) {
        alert(`File ${file.name} is not a supported qEEG file format. Please upload .edf, .eeg, or .bdf files.`);
        continue;
      }

      // Simulate upload process
      const newFile = {
        id: Date.now().toString() + i,
        name: file.name,
        uploadDate: new Date().toISOString().split('T')[0],
        status: 'pending',
        size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
        type: file.name.split('.').pop()?.toUpperCase() || 'UNKNOWN'
      };

      setUploadedFiles(prev => [newFile, ...prev]);

      // Simulate processing delay
      setTimeout(() => {
        setUploadedFiles(prev =>
          prev.map(f => f.id === newFile.id ? { ...f, status: 'processing' } : f)
        );

        // Simulate analysis completion
        setTimeout(() => {
          setUploadedFiles(prev =>
            prev.map(f => f.id === newFile.id ? { ...f, status: 'analyzed' } : f)
          );

          if (onUploadComplete) {
            onUploadComplete({ ...newFile, status: 'analyzed' });
          }
        }, 3000);
      }, 1000);
    }

    setIsUploading(false);
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'processing': return 'bg-blue-100 text-blue-700';
      case 'analyzed': return 'bg-green-100 text-green-700';
      case 'error': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
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
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Upload qEEG Files</h3>

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
          <div className="text-4xl mb-4">🧠</div>
          <h4 className="text-lg font-medium text-gray-900 mb-2">
            {isDragging ? 'Drop your qEEG files here' : 'Upload qEEG Files'}
          </h4>
          <p className="text-gray-600 mb-4">
            Drag and drop your .edf, .eeg, or .bdf files here, or click to browse
          </p>

          <input
            type="file"
            multiple
            accept=".edf,.eeg,.bdf"
            onChange={(e) => handleFileUpload(e.target.files)}
            className="hidden"
            id="qeeg-upload"
            disabled={isUploading}
          />

          <label htmlFor="qeeg-upload">
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
            <p>Supported formats: EDF, EEG, BDF</p>
            <p>Maximum file size: 50MB per file</p>
          </div>
        </div>
      </div>

      {/* File List */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Your qEEG Files</h3>
          <span className="text-sm text-gray-500">{uploadedFiles.length} files</span>
        </div>

        {uploadedFiles.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-4">📁</div>
            <p>No qEEG files uploaded yet</p>
            <p className="text-sm">Upload your first file to get started with analysis</p>
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
                    <button className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                      <Eye className="h-4 w-4" />
                    </button>
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
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Analysis Summary</h3>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-indigo-50 rounded-lg">
              <div className="text-2xl font-bold text-indigo-600 mb-1">
                {uploadedFiles.filter(f => f.status === 'analyzed').length}
              </div>
              <div className="text-sm text-gray-600">Files Analyzed</div>
            </div>

            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600 mb-1">12</div>
              <div className="text-sm text-gray-600">Improvement Areas</div>
            </div>

            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600 mb-1">85%</div>
              <div className="text-sm text-gray-600">Protocol Adherence</div>
            </div>

            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600 mb-1">+15%</div>
              <div className="text-sm text-gray-600">Progress Score</div>
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <button className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium">
              Generate Report
            </button>
            <button className="px-6 py-3 border-2 border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors font-medium">
              Schedule Consultation
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default QEEGUpload;
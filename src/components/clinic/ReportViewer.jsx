import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Download, 
  Eye, 
  Search,
  Filter,
  Calendar,
  Users,
  Upload,
  X,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import DatabaseService from '../../services/databaseService';

const ReportViewer = ({ clinicId, patients, reports: initialReports, onUpdate }) => {
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [selectedReport, setSelectedReport] = useState(null);
  const [showReportDetails, setShowReportDetails] = useState(false);
  const [loading, setLoading] = useState(false);

  // Load reports directly from database
  useEffect(() => {
    loadReports();
  }, [clinicId]);

  // Also use initialReports if provided
  useEffect(() => {
    if (initialReports && initialReports.length > 0) {
      setReports(initialReports);
    }
  }, [initialReports]);

  const loadReports = async () => {
    if (!clinicId) return;
    
    try {
      setLoading(true);
      console.log('📋 Loading reports for clinic:', clinicId);
      
      // Load reports directly from database
      const reportsData = await DatabaseService.getReportsByClinic(clinicId);
      console.log('📋 Reports loaded:', reportsData.length);
      
      setReports(reportsData);
    } catch (error) {
      console.error('❌ Error loading reports:', error);
      toast.error('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    applyFilters();
  }, [reports, searchTerm, selectedPatient, dateFilter]);

  const applyFilters = () => {
    let filtered = [...reports];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(report => {
        const patient = patients.find(p => p.id === report.patientId);
        return (
          report.fileName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          report.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          patient?.name?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      });
    }

    // Patient filter
    if (selectedPatient) {
      filtered = filtered.filter(report => report.patientId === selectedPatient);
    }

    // Date filter
    if (dateFilter) {
      const today = new Date();
      let filterDate = new Date();
      
      switch (dateFilter) {
        case '7days':
          filterDate.setDate(today.getDate() - 7);
          break;
        case '30days':
          filterDate.setDate(today.getDate() - 30);
          break;
        case '90days':
          filterDate.setDate(today.getDate() - 90);
          break;
        default:
          filterDate = null;
      }
      
      if (filterDate) {
        filtered = filtered.filter(report => new Date(report.createdAt) >= filterDate);
      }
    }

    // Sort by creation date (newest first)
    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    setFilteredReports(filtered);
  };

  const handleDownloadReport = async (report) => {
    try {
      setLoading(true);
      console.log('📥 Downloading report:', report.fileName);
      
      if (report.s3Key) {
        // Try to get from mock S3 service
        const mockFiles = JSON.parse(localStorage.getItem('s3MockFiles') || '[]');
        const mockFile = mockFiles.find(f => f.key === report.s3Key);
        
        if (mockFile && mockFile.data) {
          // Create download link for base64 data
          const link = document.createElement('a');
          link.href = mockFile.data;
          link.download = report.fileName;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          
          toast.success(`📥 Downloaded ${report.fileName}`);
        } else {
          toast.error('File not found in storage');
        }
      } else {
        // Fallback for files without S3 key
        toast.success(`📥 Downloaded ${report.fileName}`);
      }
    } catch (error) {
      console.error('❌ Error downloading report:', error);
      toast.error('Failed to download report');
    } finally {
      setLoading(false);
    }
  };

  const handleViewReport = (report) => {
    setSelectedReport(report);
    setShowReportDetails(true);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedPatient('');
    setDateFilter('');
  };

  const refreshReports = () => {
    loadReports();
    if (onUpdate) onUpdate();
  };

  const getPatientName = (patientId) => {
    const patient = patients.find(p => p.id === patientId);
    return patient?.name || 'Unknown Patient';
  };

  if (showReportDetails && selectedReport) {
    return (
      <ReportDetails
        report={selectedReport}
        patient={patients.find(p => p.id === selectedReport.patientId)}
        onBack={() => {
          setShowReportDetails(false);
          setSelectedReport(null);
        }}
        onDownload={handleDownloadReport}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Patient Reports</h2>
          <p className="text-gray-600">View and download EEG reports for your patients</p>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-600">
            Total Reports: <span className="font-semibold">{reports.length}</span>
          </div>
        </div>
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
            value={selectedPatient}
            onChange={(e) => setSelectedPatient(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">All Patients</option>
            {patients.map(patient => (
              <option key={patient.id} value={patient.id}>{patient.name}</option>
            ))}
          </select>

          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">All Time</option>
            <option value="7days">Last 7 days</option>
            <option value="30days">Last 30 days</option>
            <option value="90days">Last 90 days</option>
          </select>
          
          <button
            onClick={clearFilters}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 flex items-center justify-center space-x-2"
          >
            <X className="h-4 w-4" />
            <span>Clear</span>
          </button>
        </div>
      </div>

      {/* Reports Grid/List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h3 className="text-lg font-medium text-gray-900">
            Reports ({filteredReports.length})
          </h3>
        </div>
        
        {filteredReports.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {filteredReports.map((report) => {
              const patient = patients.find(p => p.id === report.patientId);
              
              return (
                <div key={report.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
                        <FileText className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-lg font-medium text-gray-900">
                          {report.fileName || 'EEG Report'}
                        </h4>
                        <div className="flex items-center space-x-4 mt-1">
                          <div className="flex items-center space-x-2">
                            <Users className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-600">
                              {patient?.name || 'Unknown Patient'}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-600">
                              {new Date(report.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          {report.fileSize && (
                            <span className="text-sm text-gray-500">
                              {report.fileSize}
                            </span>
                          )}
                        </div>
                        {report.title && report.title !== report.fileName && (
                          <p className="text-sm text-gray-600 mt-2">{report.title}</p>
                        )}
                        {report.notes && (
                          <p className="text-sm text-gray-500 mt-2 italic">
                            {report.notes.length > 100 
                              ? `${report.notes.substring(0, 100)}...`
                              : report.notes
                            }
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => handleViewReport(report)}
                        className="p-2 text-primary-600 hover:text-primary-800 hover:bg-primary-50 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDownloadReport(report)}
                        disabled={loading}
                        className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
                        title="Download Report"
                      >
                        <Download className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm || selectedPatient || dateFilter 
                ? 'No reports match your filters' 
                : 'No reports available'
              }
            </h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || selectedPatient || dateFilter
                ? 'Try adjusting your search criteria'
                : 'Reports will appear here once they are uploaded by your administrator'
              }
            </p>
            {(searchTerm || selectedPatient || dateFilter) && (
              <button
                onClick={clearFilters}
                className="text-primary-600 hover:text-primary-800 font-medium"
              >
                Clear all filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <CheckCircle className="h-5 w-5 text-blue-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">
              About Report Access
            </h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>
                • Reports are uploaded by your clinic administrator<br/>
                • You can view and download all reports for your patients<br/>
                • Reports are securely stored and only accessible by authorized personnel<br/>
                • For technical support, contact your system administrator
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Report Details Component
const ReportDetails = ({ report, patient, onBack, onDownload }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <button
          onClick={onBack}
          className="text-primary-600 hover:text-primary-800 font-medium"
        >
          ← Back to Reports
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {report.fileName || 'EEG Report'}
                </h2>
                <p className="text-sm text-gray-600">
                  Report Details and Information
                </p>
              </div>
            </div>
            <button
              onClick={() => onDownload(report)}
              className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2"
            >
              <Download className="h-4 w-4" />
              <span>Download</span>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Report Information */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Report Information</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <span className="text-sm font-medium text-gray-600">File Name:</span>
                    <span className="text-sm text-gray-900">{report.fileName}</span>
                  </div>
                  
                  {report.title && (
                    <div className="flex justify-between items-start">
                      <span className="text-sm font-medium text-gray-600">Title:</span>
                      <span className="text-sm text-gray-900">{report.title}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between items-start">
                    <span className="text-sm font-medium text-gray-600">File Type:</span>
                    <span className="text-sm text-gray-900">{report.fileType || 'PDF'}</span>
                  </div>
                  
                  {report.fileSize && (
                    <div className="flex justify-between items-start">
                      <span className="text-sm font-medium text-gray-600">File Size:</span>
                      <span className="text-sm text-gray-900">{report.fileSize}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between items-start">
                    <span className="text-sm font-medium text-gray-600">Created:</span>
                    <span className="text-sm text-gray-900">
                      {new Date(report.createdAt).toLocaleString()}
                    </span>
                  </div>
                  
                  {report.uploadedBy && (
                    <div className="flex justify-between items-start">
                      <span className="text-sm font-medium text-gray-600">Uploaded by:</span>
                      <span className="text-sm text-gray-900">{report.uploadedBy}</span>
                    </div>
                  )}
                </div>
              </div>

              {report.notes && (
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Notes</h4>
                  <div className="bg-gray-50 p-3 rounded-md">
                    <p className="text-sm text-gray-700">{report.notes}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Patient Information */}
            {patient && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Patient Information</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <span className="text-sm font-medium text-gray-600">Name:</span>
                      <span className="text-sm text-gray-900">{patient.name}</span>
                    </div>
                    
                    <div className="flex justify-between items-start">
                      <span className="text-sm font-medium text-gray-600">Age:</span>
                      <span className="text-sm text-gray-900">{patient.age} years</span>
                    </div>
                    
                    <div className="flex justify-between items-start">
                      <span className="text-sm font-medium text-gray-600">Gender:</span>
                      <span className="text-sm text-gray-900">{patient.gender}</span>
                    </div>
                    
                    {patient.email && (
                      <div className="flex justify-between items-start">
                        <span className="text-sm font-medium text-gray-600">Email:</span>
                        <span className="text-sm text-gray-900">{patient.email}</span>
                      </div>
                    )}
                    
                    {patient.phone && (
                      <div className="flex justify-between items-start">
                        <span className="text-sm font-medium text-gray-600">Phone:</span>
                        <span className="text-sm text-gray-900">{patient.phone}</span>
                      </div>
                    )}
                  </div>
                </div>

                {patient.notes && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Patient Notes</h4>
                    <div className="bg-gray-50 p-3 rounded-md">
                      <p className="text-sm text-gray-700">{patient.notes}</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Report Preview Placeholder */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Report Preview</h3>
            <div className="bg-gray-100 rounded-lg p-8 text-center">
              <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-gray-600 mb-2">Report Preview</h4>
              <p className="text-gray-500 mb-4">
                Preview functionality will be available in a future update.
              </p>
              <button
                onClick={() => onDownload(report)}
                className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg font-medium"
              >
                Download Report to View
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportViewer;
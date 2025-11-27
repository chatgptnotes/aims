import React, { useState, useEffect } from 'react';
import { Upload, Play, Download, FileText, CheckCircle, Activity, User, Building2, Calendar, History, X, ArrowLeft, Search, Filter } from 'lucide-react';
import DatabaseService from '../../services/databaseService';
import toast from 'react-hot-toast';

const AlgorithmDataProcessor = () => {
  const [supervisors, setSupervisors] = useState([]);
  const [clinics, setClinics] = useState([]);
  const [selectedSupervisor, setSelectedSupervisor] = useState(null);
  const [showProcessingUI, setShowProcessingUI] = useState(false);
  const [processingHistory, setProcessingHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClinicFilter, setSelectedClinicFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  const [pdfFile, setPdfFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingComplete, setProcessingComplete] = useState(false);
  const [consoleLog, setConsoleLog] = useState([]);
  const [progress, setProgress] = useState(0);
  const [excelData, setExcelData] = useState(null);
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadSupervisors();
  }, []);

  useEffect(() => {
    if (selectedSupervisor && showProcessingUI) {
      loadProcessingHistory(selectedSupervisor.id);
    }
  }, [selectedSupervisor, showProcessingUI]);

  const loadSupervisors = async () => {
    try {
      // Fetch data from both old and new tables
      const supervisorsData = await DatabaseService.get('supervisors'); // New table
      const projectAreasData = await DatabaseService.get('project_areas'); // New table
      const pidReportsData = await DatabaseService.get('pid_reports') || []; // Uploaded P&ID documents
      const algorithmResults = await DatabaseService.get('algorithmResults') || [];

      // Map uploaded P&ID reports by supervisor_id
      const reportsBySupervisor = pidReportsData.reduce((acc, report) => {
        const supervisorId = report.supervisor_id;
        if (!acc[supervisorId]) {
          acc[supervisorId] = [];
        }
        acc[supervisorId].push(report);
        return acc;
      }, {});

      // Enrich supervisors with project area names and upload status
      const enrichedSupervisors = supervisorsData.map(supervisor => {
        const supervisorReports = reportsBySupervisor[supervisor.id] || [];
        const algorithmResultsForSupervisor = algorithmResults.filter(r => r.patientId === supervisor.id);

        const lastReport = supervisorReports.length > 0
          ? supervisorReports.sort((a, b) => new Date(b.created_at || b.uploaded_at) - new Date(a.created_at || a.uploaded_at))[0]
          : null;

        const lastAlgorithmResult = algorithmResultsForSupervisor.length > 0
          ? algorithmResultsForSupervisor.sort((a, b) => new Date(b.processedAt) - new Date(a.processedAt))[0]
          : null;

        return {
          ...supervisor,
          clinicId: supervisor.project_area_id, // Map to old field name for compatibility
          clinicName: projectAreasData.find(pa => pa.id === supervisor.project_area_id)?.name || 'Unknown Project Area',
          algorithmStatus: (lastReport || lastAlgorithmResult) ? 'completed' : 'pending',
          lastProcessed: lastReport?.created_at || lastReport?.uploaded_at || lastAlgorithmResult?.processedAt,
          totalScans: supervisorReports.length + algorithmResultsForSupervisor.length
        };
      });

      setSupervisors(enrichedSupervisors);
      setClinics(projectAreasData);
      setLoading(false);
    } catch (error) {
      console.error('Error loading supervisors:', error);
      toast.error('Failed to load supervisors');
      setLoading(false);
    }
  };

  const loadProcessingHistory = async (supervisorId) => {
    try {
      // Load P&ID reports for this supervisor
      const pidReports = await DatabaseService.get('pid_reports') || [];
      const algorithmResults = await DatabaseService.get('algorithmResults') || [];

      const supervisorPidReports = pidReports.filter(r => r.supervisor_id === supervisorId);
      const supervisorAlgorithmResults = algorithmResults.filter(r => r.patientId === supervisorId);

      // Combine both types of reports
      const combinedHistory = [
        ...supervisorPidReports.map(report => ({
          id: report.id,
          type: 'pid_report',
          processedAt: report.created_at || report.uploaded_at,
          eyesOpenFile: report.file_name || report.title,
          eyesClosedFile: '',
          processedBy: report.uploaded_by || 'system',
          results: []
        })),
        ...supervisorAlgorithmResults
      ].sort((a, b) => new Date(b.processedAt) - new Date(a.processedAt));

      setProcessingHistory(combinedHistory);
    } catch (error) {
      console.error('Error loading processing history:', error);
      setProcessingHistory([]);
    }
  };

  const handleGenerateReport = (supervisor) => {
    setSelectedSupervisor(supervisor);
    setShowProcessingUI(true);
    // Reset upload states
    setPdfFile(null);
    setExcelData(null);
    setProcessingComplete(false);
    setConsoleLog([]);
    setIsSaved(false);
    setIsSaving(false);
  };

  const handleBackToList = () => {
    setShowProcessingUI(false);
    setSelectedSupervisor(null);
    setPdfFile(null);
    setExcelData(null);
    setProcessingComplete(false);
    setConsoleLog([]);
    setProcessingHistory([]);
    setIsSaved(false);
    setIsSaving(false);
    // Reload supervisors to update status
    loadSupervisors();
  };

  // Helper function to get supervisor name (handles different field names)
  const getSupervisorName = (supervisor) => {
    const name = supervisor?.fullName || supervisor?.full_name || supervisor?.name;

    // Handle special cases for unknown/test supervisors
    if (!name && supervisor?.email) {
      return supervisor.email;
    }
    if (!name && supervisor?.id === '00000000-0000-0000-0000-000000000000') {
      return 'Unknown Supervisor';
    }

    return name || 'Unknown Supervisor';
  };

  // Helper function to get status badge
  const getStatusBadge = (status, lastProcessed) => {
    if (status === 'completed') {
      return (
        <div className="flex flex-col items-start">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
            <CheckCircle className="h-3 w-3 mr-1" />
            Completed
          </span>
          {lastProcessed && (
            <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {new Date(lastProcessed).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          )}
        </div>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
        <Activity className="h-3 w-3 mr-1" />
        Pending
      </span>
    );
  };

  // Filter supervisors based on search and filters
  const filteredSupervisors = supervisors.filter(supervisor => {
    const supervisorName = getSupervisorName(supervisor);
    const searchLower = searchTerm.toLowerCase();

    const matchesSearch = searchTerm === '' ||
      supervisorName.toLowerCase().includes(searchLower) ||
      supervisor.email?.toLowerCase().includes(searchLower) ||
      supervisor.full_name?.toLowerCase().includes(searchLower) ||
      supervisor.name?.toLowerCase().includes(searchLower) ||
      // Special case: search for "unknown" to find Unknown Supervisor entries
      (searchLower.includes('unknown') && supervisorName.toLowerCase().includes('unknown'));

    const matchesClinic = selectedClinicFilter === '' || supervisor.clinicId === selectedClinicFilter;

    const matchesDate = dateFilter === '' ||
      (supervisor.lastProcessed && new Date(supervisor.lastProcessed).toISOString().split('T')[0] === dateFilter);

    return matchesSearch && matchesClinic && matchesDate;
  });

  // Group filtered supervisors by project area
  const groupedSupervisors = clinics.map(clinic => ({
    clinic,
    supervisors: filteredSupervisors.filter(s => s.clinicId === clinic.id)
  })).filter(group => group.supervisors.length > 0);

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedClinicFilter('');
    setDateFilter('');
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      if (file.type !== 'application/pdf') {
        toast.error('Please upload a PDF file');
        return;
      }
      setPdfFile(file);
      // Reset processing state when new file is uploaded
      setProcessingComplete(false);
      setExcelData(null);
      setConsoleLog([]);
      setProgress(0);
      setIsSaved(false);
      setIsSaving(false);
    }
  };

  const processPIDFile = async () => {
    setIsProcessing(true);
    setConsoleLog([]);
    setProgress(0);

    try {
      // Console log: Starting process
      setConsoleLog(prev => [...prev, '🚀 Starting P&ID tag extraction...']);
      setProgress(10);

      // Create FormData to send PDF
      const formData = new FormData();
      formData.append('pdf', pdfFile);
      formData.append('supervisorId', selectedSupervisor.id);
      formData.append('supervisorName', getSupervisorName(selectedSupervisor));
      formData.append('projectArea', selectedSupervisor.clinicName);

      setConsoleLog(prev => [...prev, '📤 Uploading PDF to AI processor...']);
      setProgress(20);

      // Call backend API for AI processing
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
      const response = await fetch(`${apiUrl}/pid/extract-tags`, {
        method: 'POST',
        body: formData
      });

      setConsoleLog(prev => [...prev, '🤖 AI analyzing P&ID drawing...']);
      setProgress(40);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to process P&ID file');
      }

      const data = await response.json();

      setConsoleLog(prev => [...prev, '📊 Extracting equipment tags...']);
      setProgress(60);

      await new Promise(resolve => setTimeout(resolve, 500));
      setConsoleLog(prev => [...prev, '  ✓ Identified instrument tags']);
      setProgress(70);

      await new Promise(resolve => setTimeout(resolve, 400));
      setConsoleLog(prev => [...prev, '  ✓ Extracted tag descriptions']);
      setProgress(80);

      await new Promise(resolve => setTimeout(resolve, 400));
      setConsoleLog(prev => [...prev, '  ✓ Classified per ISA 5.1 standard']);
      setProgress(90);

      await new Promise(resolve => setTimeout(resolve, 400));
      setConsoleLog(prev => [...prev, '  ✓ Generated Tag Creation Excel']);
      setProgress(95);

      setConsoleLog(prev => [...prev, '✅ Tag extraction complete!']);
      setConsoleLog(prev => [...prev, `📈 Total Tags Extracted: ${data.data?.tags?.length || 0}`]);
      if (data.data?.categoryCounts) {
        Object.entries(data.data.categoryCounts).forEach(([category, count]) => {
          setConsoleLog(prev => [...prev, `  - ${category}: ${count} tags`]);
        });
      }
      setProgress(100);

      // Set Excel data
      setExcelData(data.data?.tags || []);
      setIsProcessing(false);
      setProcessingComplete(true);
      setIsSaved(false);

      toast.success('P&ID tag extraction completed successfully!');

    } catch (error) {
      console.error('Error processing P&ID file:', error);
      setConsoleLog(prev => [...prev, `❌ Error: ${error.message}`]);
      setIsProcessing(false);
      toast.error(error.message || 'Failed to process P&ID file');
    }
  };

  const saveResultsToDatabase = async (resultData) => {
    if (!resultData) {
      toast.error('No results to save');
      return;
    }

    try {
      setIsSaving(true);

      const tagExtractionResult = {
        id: `tag_${Date.now()}_${selectedSupervisor.id}`,
        patientId: selectedSupervisor.id,
        patientName: getSupervisorName(selectedSupervisor),
        clinicId: selectedSupervisor.clinicId,
        clinicName: selectedSupervisor.clinicName,
        tags: resultData,
        pdfFile: pdfFile?.name,
        processedAt: new Date().toISOString(),
        processedBy: 'super_admin'
      };

      console.log('💾 Saving tag extraction results to database...', tagExtractionResult);

      await DatabaseService.add('algorithmResults', tagExtractionResult);

      setIsSaved(true);
      setIsSaving(false);
      toast.success('✅ Tag extraction results saved successfully!');

      // Reload history and supervisor list to update status
      loadProcessingHistory(selectedSupervisor.id);
      loadSupervisors();
    } catch (error) {
      console.error('Error saving results:', error);
      setIsSaving(false);
      toast.error('❌ Failed to save results: ' + error.message);
    }
  };

  const handleSaveResults = () => {
    if (excelData) {
      saveResultsToDatabase(excelData);
    }
  };

  const handleExecuteCalculation = () => {
    if (pdfFile) {
      processPIDFile();
    } else {
      toast.error('Please upload a P&ID PDF file');
    }
  };

  const handleExportToExcel = async () => {
    if (!excelData || excelData.length === 0) {
      toast.error('No data to export');
      return;
    }

    try {
      // Dynamically import XLSX
      const XLSX = await import('xlsx');

      // Create workbook and worksheet
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(excelData);

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Tag Creation');

      // Generate Excel file
      const fileName = `Tag_Creation_${getSupervisorName(selectedSupervisor)}_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(workbook, fileName);

      toast.success('Excel file downloaded successfully!');
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      toast.error('Failed to export Excel file');
    }
  };

  const getStatusColor = (color) => {
    switch (color) {
      case 'blue': return 'text-primary';
      case 'orange': return 'text-orange-500';
      case 'red': return 'text-red-500';
      case 'green': return 'text-green-500';
      default: return 'text-gray-500';
    }
  };

  const getStatusBgColor = (status) => {
    if (status === 'Normal') return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
    if (status === 'Elevated') return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
    if (status === 'Abnormal') return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
    return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading supervisors...</p>
        </div>
      </div>
    );
  }

  // Supervisor List View
  if (!showProcessingUI) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-navy-700 rounded-lg p-6 text-white shadow-lg">
          <h1 className="text-2xl font-bold">AIMS - Algorithm 1 Data Processor</h1>
          <p className="text-primary-light mt-2">Select a supervisor to generate Algorithm 1 report</p>
        </div>

        {/* Filter Bar */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Supervisor Search */}
            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Search Supervisor
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            {/* Clinic Filter */}
            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Filter by Project Area
              </label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                <select
                  value={selectedClinicFilter}
                  onChange={(e) => setSelectedClinicFilter(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary appearance-none"
                >
                  <option value="">All Project Areas</option>
                  {clinics.map(clinic => (
                    <option key={clinic.id} value={clinic.id}>
                      {clinic.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Date Filter */}
            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Filter by Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                <input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            {/* Clear Filters Button */}
            {(searchTerm || selectedClinicFilter || dateFilter) && (
              <div className="flex items-end">
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2"
                >
                  <X className="h-4 w-4" />
                  <span>Clear</span>
                </button>
              </div>
            )}
          </div>

          {/* Active Filters Display */}
          {(searchTerm || selectedClinicFilter || dateFilter) && (
            <div className="mt-3 flex flex-wrap gap-2">
              {searchTerm && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                  Search: "{searchTerm}"
                </span>
              )}
              {selectedClinicFilter && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400">
                  Project Area: {clinics.find(c => c.id === selectedClinicFilter)?.name}
                </span>
              )}
              {dateFilter && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                  Date: {new Date(dateFilter).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              )}
              <span className="text-xs text-gray-500 dark:text-gray-400 self-center">
                ({filteredSupervisors.length} {filteredSupervisors.length === 1 ? 'supervisor' : 'supervisors'} found)
              </span>
            </div>
          )}
        </div>

        {/* Supervisor List - Project Area-wise */}
        <div className="space-y-4">
          {groupedSupervisors.length > 0 ? (
            groupedSupervisors.map(({ clinic, supervisors: clinicSupervisors }) => (
            <div key={clinic.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              {/* Project Area Header */}
              <div className="bg-accent-light dark:bg-primary/20 border-b border-primary-light dark:border-primary px-6 py-3">
                <div className="flex items-center">
                  <Building2 className="h-5 w-5 text-primary mr-2" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {clinic.name}
                  </h3>
                  <span className="ml-3 text-sm text-gray-600 dark:text-gray-400">
                    ({clinicSupervisors.length} {clinicSupervisors.length === 1 ? 'supervisor' : 'supervisors'})
                  </span>
                </div>
              </div>

              {/* Supervisor Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Supervisor Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Previous Scans
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {clinicSupervisors.map(supervisor => (
                      <tr key={supervisor.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <User className="h-4 w-4 text-gray-400 dark:text-gray-500 mr-2" />
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                              {getSupervisorName(supervisor)}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                          {supervisor.email || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                          <span className="flex items-center">
                            <History className="h-4 w-4 mr-1" />
                            {supervisor.totalScans || 0} {supervisor.totalScans === 1 ? 'scan' : 'scans'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(supervisor.algorithmStatus, supervisor.lastProcessed)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <button
                            onClick={() => handleGenerateReport(supervisor)}
                            className="bg-primary hover:bg-navy-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-md flex items-center ml-auto"
                          >
                            <FileText className="h-4 w-4 mr-2" />
                            {supervisor.algorithmStatus === 'completed' ? 'View/Generate' : 'Generate Report'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            ))
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
              <Filter className="h-16 w-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400 font-medium">
                {searchTerm || selectedClinicFilter || dateFilter
                  ? 'No supervisors match your filters'
                  : 'No supervisors found'
                }
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                {searchTerm || selectedClinicFilter || dateFilter
                  ? 'Try adjusting your search criteria or clear filters'
                  : 'Supervisors will appear here once they are registered in the system'
                }
              </p>
              {(searchTerm || selectedClinicFilter || dateFilter) && (
                <button
                  onClick={clearFilters}
                  className="mt-4 px-4 py-2 bg-primary hover:bg-navy-700 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  Clear Filters
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Processing UI View
  return (
    <div className="space-y-6">
      {/* Header with Back Button */}
      <div className="bg-gradient-to-r from-primary to-navy-700 rounded-lg p-6 text-white shadow-lg">
        <button
          onClick={handleBackToList}
          className="flex items-center text-primary-light hover:text-white mb-3 transition-colors"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Supervisor List
        </button>
        <h1 className="text-2xl font-bold">AIMS - Algorithm 1 Data Processor</h1>
        <p className="text-primary-light mt-2">
          Processing for: <span className="font-semibold">{getSupervisorName(selectedSupervisor)}</span> | {selectedSupervisor?.clinicName}
        </p>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel - PDF Upload */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            P&ID Document Upload
          </h2>

          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Upload your P&ID drawing in PDF format for AI-powered tag extraction
          </p>

          {/* PDF Upload */}
          <div className="mb-6">
            <div className="relative border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center hover:border-primary dark:hover:border-primary-light transition-colors">
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <Upload className="h-16 w-16 text-gray-400 dark:text-gray-500 mx-auto mb-3" />
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {pdfFile ? pdfFile.name : 'Drag & Drop PDF or Click to Upload'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Max file size: 100MB
              </p>
              {pdfFile && (
                <div className="mt-3">
                  <CheckCircle className="h-8 w-8 text-green-500 mx-auto" />
                  <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                    File ready for processing
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* File Info */}
          {pdfFile && (
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 mb-4">
              <h3 className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">File Details</h3>
              <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
                <p>Name: {pdfFile.name}</p>
                <p>Size: {(pdfFile.size / 1024 / 1024).toFixed(2)} MB</p>
                <p>Type: {pdfFile.type}</p>
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
            <h3 className="text-xs font-medium text-blue-800 dark:text-blue-400 mb-2">Instructions</h3>
            <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1 list-disc list-inside">
              <li>Upload P&ID drawing in PDF format</li>
              <li>Ensure drawing is clear and readable</li>
              <li>Click "Extract Tags" to start AI processing</li>
              <li>Download Excel sheet with extracted tags</li>
            </ul>
          </div>
        </div>

        {/* Middle Panel - AI Processing */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            AI Tag Extraction
          </h2>

          {/* Execute Button */}
          <button
            onClick={handleExecuteCalculation}
            disabled={!pdfFile || isProcessing}
            className={`w-full mb-6 py-3 px-4 rounded-lg font-medium flex items-center justify-center space-x-2 transition-colors shadow-md ${
              pdfFile && !isProcessing
                ? 'bg-primary hover:bg-navy-700 text-white'
                : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
            }`}
          >
            <Play className="h-5 w-5" />
            <span>Extract Tags</span>
          </button>

          {/* Processing Animation */}
          {isProcessing && (
            <div className="bg-gradient-to-r from-primary to-navy-700 rounded-lg p-6 text-center mb-6 shadow-lg">
              <div className="relative inline-block">
                <Activity className="h-16 w-16 text-white animate-pulse" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-20 h-20 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                </div>
              </div>
              <p className="text-white font-medium mt-4">Processing with AI...</p>
              <p className="text-primary-light text-sm">{progress}% Complete</p>
            </div>
          )}

          {/* Processing Complete */}
          {processingComplete && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 text-center mb-6">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2" />
              <p className="text-green-800 dark:text-green-400 font-medium">Tag Extraction Complete!</p>
              <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                {excelData?.length || 0} tags extracted
              </p>
            </div>
          )}

          {/* Console */}
          <div className="bg-gray-900 dark:bg-black rounded-lg p-4 min-h-[280px] max-h-[380px] overflow-y-auto">
            <div className="flex items-center justify-between mb-2 pb-2 border-b border-gray-700">
              <h3 className="text-sm font-medium text-gray-300">AI Processing Log</h3>
              <button
                onClick={() => setConsoleLog([])}
                className="text-xs text-gray-400 hover:text-gray-200"
              >
                Clear
              </button>
            </div>
            <div className="space-y-1 font-mono text-xs">
              {consoleLog.length > 0 ? (
                consoleLog.map((log, index) => (
                  <div key={index} className="text-green-400">
                    &gt; {log}
                  </div>
                ))
              ) : (
                <div className="text-gray-500 italic">AI processing logs will appear here...</div>
              )}
            </div>
          </div>
        </div>

        {/* Right Panel - Excel Preview */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Tag Creation Excel
          </h2>

          {excelData && excelData.length > 0 ? (
            <>
              {/* Excel Preview Table */}
              <div className="mb-4 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                <div className="max-h-[400px] overflow-y-auto">
                  <table className="w-full text-xs">
                    <thead className="bg-gray-100 dark:bg-gray-700 sticky top-0">
                      <tr>
                        {Object.keys(excelData[0] || {}).map((header, idx) => (
                          <th key={idx} className="px-2 py-2 text-left font-semibold text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-600">
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {excelData.slice(0, 10).map((row, rowIdx) => (
                        <tr key={rowIdx} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                          {Object.values(row).map((cell, cellIdx) => (
                            <td key={cellIdx} className="px-2 py-2 text-gray-600 dark:text-gray-400">
                              {String(cell)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {excelData.length > 10 && (
                  <div className="bg-gray-50 dark:bg-gray-700 px-3 py-2 text-center text-xs text-gray-600 dark:text-gray-400">
                    Showing 10 of {excelData.length} rows
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                {/* Download Excel Button */}
                <button
                  onClick={handleExportToExcel}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-medium flex items-center justify-center space-x-2 transition-colors shadow-md"
                >
                  <Download className="h-5 w-5" />
                  <span>Download Excel</span>
                </button>

                {/* Save to Database Button */}
                <button
                  onClick={handleSaveResults}
                  disabled={isSaving || isSaved}
                  className={`w-full py-2 px-4 rounded-lg font-medium flex items-center justify-center space-x-2 transition-colors text-sm ${
                    isSaved
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 cursor-not-allowed'
                      : isSaving
                      ? 'bg-blue-400 text-white cursor-wait'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {isSaving ? (
                    <>
                      <Activity className="h-4 w-4 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : isSaved ? (
                    <>
                      <CheckCircle className="h-4 w-4" />
                      <span>Saved ✓</span>
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4" />
                      <span>Save to Database</span>
                    </>
                  )}
                </button>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <FileText className="h-20 w-20 text-gray-400 dark:text-gray-500 mb-4" />
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                No Tags Extracted Yet
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Upload a P&ID PDF and click Extract Tags to see results
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Processing History */}
      {selectedSupervisor && processingHistory.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <History className="h-5 w-5 mr-2" />
            Processing History for {getSupervisorName(selectedSupervisor)}
          </h2>
          <div className="space-y-3">
            {processingHistory.map((record, index) => (
              <div
                key={record.id}
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <Calendar className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {new Date(record.processedAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1 mb-3">
                      <p>📁 File: {record.eyesOpenFile || record.pdfFile || 'N/A'}</p>
                      <p>👤 Processed by: {record.processedBy}</p>
                      {record.type === 'pid_report' && (
                        <p className="text-blue-600 dark:text-blue-400">Type: P&ID Report</p>
                      )}
                    </div>

                    {/* Quick Summary - Tags or Results */}
                    {record.tags && record.tags.length > 0 && (
                      <div className="mt-3 bg-green-50 dark:bg-green-900/20 rounded-lg p-2">
                        <p className="text-xs font-medium text-green-800 dark:text-green-400">
                          Tags Extracted: {record.tags.length}
                        </p>
                      </div>
                    )}
                    {record.results && record.results.length > 0 && !record.tags && (
                      <div className="mt-3 grid grid-cols-2 gap-2">
                        {record.results.slice(0, 4).map((result, idx) => (
                          <div key={idx} className="text-xs bg-gray-50 dark:bg-gray-700 rounded p-2">
                            <span className="text-gray-600 dark:text-gray-400">{result.parameter}:</span>
                            <span className={`ml-2 font-semibold ${
                              result.status === 'High' ? 'text-green-600' :
                              result.status === 'Medium' ? 'text-blue-600' :
                              'text-orange-600'
                            }`}>
                              {result.rawScore}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      if (record.tags) {
                        setExcelData(record.tags);
                      } else if (record.results) {
                        setExcelData(record.results);
                      }
                      setProcessingComplete(true);
                      setIsSaved(true);
                      toast.success('Previous results loaded');
                    }}
                    className="px-3 py-2 text-sm bg-primary hover:bg-navy-700 text-white rounded-lg transition-colors flex items-center space-x-1"
                  >
                    <FileText className="h-4 w-4" />
                    <span>Load Results</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Info Section */}
      <div className="bg-accent-light dark:bg-primary/20 border border-primary-light dark:border-primary rounded-lg p-4 shadow-sm">
        <h3 className="text-sm font-medium text-primary dark:text-primary-light mb-2">
          About AI Tag Extraction
        </h3>
        <p className="text-sm text-navy-800 dark:text-gray-300">
          This AI-powered processor analyzes P&ID engineering drawings and automatically extracts equipment and instrument tags
          per ISA 5.1 standard. The system identifies tags, descriptions, and classifications, then generates a Tag Creation
          Excel sheet ready for ADNOC integration.
        </p>
      </div>
    </div>
  );
};

export default AlgorithmDataProcessor;

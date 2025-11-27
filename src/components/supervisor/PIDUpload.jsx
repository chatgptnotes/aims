import React, { useState, useRef } from 'react';
import { Upload, FileText, AlertCircle, CheckCircle, Download, X, Eye, Filter } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import pdfParsingService from '../../services/pdfParsingService';
import excelExportService from '../../services/excelExportService';
import DatabaseService from '../../services/databaseService';
import toast from 'react-hot-toast';

const PIDUpload = ({ project, process, onClose, onUploadSuccess }) => {
  const { user } = useAuth();
  const fileInputRef = useRef(null);

  const [uploading, setUploading] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [files, setFiles] = useState([]);
  const [extractedData, setExtractedData] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [selectedTab, setSelectedTab] = useState('equipment');

  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files).filter(file =>
      file.type === 'application/pdf'
    );

    if (selectedFiles.length === 0) {
      toast.error('Please select PDF files only');
      return;
    }

    // Check file sizes (max 100MB per file)
    const oversizedFiles = selectedFiles.filter(file => file.size > 100 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      toast.error(`Files exceeding 100MB: ${oversizedFiles.map(f => f.name).join(', ')}`);
      return;
    }

    setFiles(selectedFiles);
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      toast.error('Please select at least one PDF file');
      return;
    }

    setUploading(true);
    setParsing(true);

    try {
      const allExtractedData = {
        metadata: {
          project: project?.name || 'Unknown Project',
          process: process?.name || 'Unknown Process',
          uploadDate: new Date().toISOString(),
          uploadedBy: user?.email || 'Unknown User'
        },
        tags: {
          equipment: [],
          instruments: [],
          controlValves: [],
          lineNumbers: []
        },
        summary: {
          totalTags: 0,
          equipmentCount: 0,
          instrumentCount: 0,
          controlValveCount: 0,
          lineNumberCount: 0
        },
        files: []
      };

      // Process each PDF file
      for (const file of files) {
        toast.loading(`Extracting tags from ${file.name}...`, { id: file.name });

        try {
          // Parse PDF to extract tags
          const extractedData = await pdfParsingService.extractTags(file);

          // Aggregate tags from all files
          allExtractedData.tags.equipment.push(...extractedData.tags.equipment);
          allExtractedData.tags.instruments.push(...extractedData.tags.instruments);
          allExtractedData.tags.controlValves.push(...extractedData.tags.controlValves);
          allExtractedData.tags.lineNumbers.push(...extractedData.tags.lineNumbers);

          // Update summary
          allExtractedData.summary.equipmentCount += extractedData.summary.equipmentCount;
          allExtractedData.summary.instrumentCount += extractedData.summary.instrumentCount;
          allExtractedData.summary.controlValveCount += extractedData.summary.controlValveCount;
          allExtractedData.summary.lineNumberCount += extractedData.summary.lineNumberCount;
          allExtractedData.summary.totalTags += extractedData.summary.totalTags;

          // Store file info
          allExtractedData.files.push({
            name: file.name,
            size: file.size,
            pageCount: extractedData.metadata.pageCount,
            tagsExtracted: extractedData.summary.totalTags,
            processingTime: extractedData.metadata.processingTime
          });

          toast.success(`Extracted ${extractedData.summary.totalTags} tags from ${file.name}`, { id: file.name });

        } catch (error) {
          console.error(`Error processing ${file.name}:`, error);
          toast.error(`Failed to process ${file.name}: ${error.message}`, { id: file.name });
        }
      }

      // Store extracted data
      setExtractedData(allExtractedData);
      setShowPreview(true);

      // Save to database (mock for now)
      const documentRecord = {
        id: `doc_${Date.now()}`,
        project_id: project?.id,
        process_id: process?.id,
        files: allExtractedData.files.map(f => f.name),
        tags_extracted: allExtractedData.summary.totalTags,
        upload_date: new Date().toISOString(),
        uploaded_by: user?.id,
        status: 'pending_verification',
        extracted_data: allExtractedData
      };

      // Store in localStorage for now
      const existingDocs = JSON.parse(localStorage.getItem('aims_documents') || '[]');
      existingDocs.push(documentRecord);
      localStorage.setItem('aims_documents', JSON.stringify(existingDocs));

      toast.success(`Successfully processed ${files.length} P&ID document(s)`);

      if (onUploadSuccess) {
        onUploadSuccess(documentRecord);
      }

    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload and process files');
    } finally {
      setUploading(false);
      setParsing(false);
    }
  };

  const handleExportToExcel = async () => {
    if (!extractedData) {
      toast.error('No data to export');
      return;
    }

    try {
      toast.loading('Generating Excel report...', { id: 'excel-export' });

      // Generate Excel file
      const excelBlob = await excelExportService.generateTagSheet(
        extractedData,
        project || { name: 'Unknown Project', site_default: 'N/A', unit_code_default: 'N/A' },
        process || { name: 'Unknown Process' },
        { author: user?.email || 'AIMS User' }
      );

      // Create download link
      const url = URL.createObjectURL(excelBlob);
      const link = document.createElement('a');
      const fileName = excelExportService.generateFileName(
        project || { name: 'Project' },
        process || { name: 'Process' },
        'TagSheet'
      );

      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success('Excel report downloaded successfully', { id: 'excel-export' });

    } catch (error) {
      console.error('Export error:', error);
      toast.error(`Failed to export to Excel: ${error.message}`, { id: 'excel-export' });
    }
  };

  const renderTagPreview = () => {
    if (!extractedData) return null;

    const getTagsForTab = () => {
      switch (selectedTab) {
        case 'equipment': return extractedData.tags.equipment;
        case 'instruments': return extractedData.tags.instruments;
        case 'valves': return extractedData.tags.controlValves;
        case 'lines': return extractedData.tags.lineNumbers;
        default: return [];
      }
    };

    const tags = getTagsForTab();

    return (
      <div className="space-y-4">
        {/* Tab Navigation */}
        <div className="flex space-x-2 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setSelectedTab('equipment')}
            className={`px-4 py-2 font-medium transition-colors ${
              selectedTab === 'equipment'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
            }`}
          >
            Equipment ({extractedData.summary.equipmentCount})
          </button>
          <button
            onClick={() => setSelectedTab('instruments')}
            className={`px-4 py-2 font-medium transition-colors ${
              selectedTab === 'instruments'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
            }`}
          >
            Instruments ({extractedData.summary.instrumentCount})
          </button>
          <button
            onClick={() => setSelectedTab('valves')}
            className={`px-4 py-2 font-medium transition-colors ${
              selectedTab === 'valves'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
            }`}
          >
            Valves ({extractedData.summary.controlValveCount})
          </button>
          <button
            onClick={() => setSelectedTab('lines')}
            className={`px-4 py-2 font-medium transition-colors ${
              selectedTab === 'lines'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
            }`}
          >
            Lines ({extractedData.summary.lineNumberCount})
          </button>
        </div>

        {/* Tag List */}
        <div className="max-h-96 overflow-y-auto">
          {tags.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No tags found in this category</p>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800 sticky top-0">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tag Number
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pages
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                {tags.map((tag, index) => (
                  <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="px-4 py-2 text-sm font-medium text-gray-900 dark:text-white">
                      {tag.tag}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">
                      {tag.type}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">
                      {tag.description}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">
                      {tag.occurrences?.map(o => o.page).join(', ') || 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Upload P&ID Documents
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {project?.name} {process && `/ ${process.name}`}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 180px)' }}>
          {!showPreview ? (
            // Upload Interface
            <div className="space-y-6">
              {/* File Drop Zone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-12
                         hover:border-blue-500 dark:hover:border-blue-400 transition-colors cursor-pointer"
              >
                <div className="text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                    Click to upload or drag and drop
                  </p>
                  <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                    PDF files only (max 100MB per file)
                  </p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>

              {/* Selected Files */}
              {files.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                    Selected Files ({files.length})
                  </h3>
                  <div className="space-y-2">
                    {files.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          <FileText className="w-5 h-5 text-blue-600" />
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {file.name}
                            </p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                              {(file.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => setFiles(files.filter((_, i) => i !== index))}
                          className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Info Box */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex">
                  <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300">
                      P&ID Processing Information
                    </h3>
                    <ul className="mt-2 text-xs text-blue-700 dark:text-blue-400 space-y-1">
                      <li>• Tags will be extracted automatically following ISA 5.1 standards</li>
                      <li>• Equipment tags: P-101, K-2801, V-3701, etc.</li>
                      <li>• Instrument tags: PIC-10001, LIC-2002, FT-101, etc.</li>
                      <li>• Control valves: PCV-101, FCV-2001, etc.</li>
                      <li>• Line numbers: 6"-PG-10001, etc.</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // Preview and Export Interface
            <div className="space-y-6">
              {/* Summary Stats */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {extractedData.summary.totalTags}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Tags</p>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {extractedData.summary.equipmentCount}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Equipment</p>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {extractedData.summary.instrumentCount}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Instruments</p>
                </div>
                <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
                  <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                    {extractedData.summary.controlValveCount}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Valves</p>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {extractedData.summary.lineNumberCount}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Lines</p>
                </div>
              </div>

              {/* Tag Preview */}
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Extracted Tags Preview
                </h3>
                {renderTagPreview()}
              </div>

              {/* Files Processed */}
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                  Processed Files
                </h3>
                <div className="space-y-2">
                  {extractedData.files.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {file.name}
                          </p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            {file.pageCount} pages • {file.tagsExtracted} tags • {file.processingTime}ms
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex justify-between items-center p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          <div className="flex space-x-3">
            {showPreview && (
              <button
                onClick={() => {
                  setShowPreview(false);
                  setExtractedData(null);
                  setFiles([]);
                }}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                Upload More
              </button>
            )}
          </div>
          <div className="flex space-x-3">
            {showPreview ? (
              <>
                <button
                  onClick={handleExportToExcel}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Export to Excel</span>
                </button>
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Done
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpload}
                  disabled={files.length === 0 || uploading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {parsing ? 'Extracting Tags...' : uploading ? 'Uploading...' : 'Upload & Extract Tags'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PIDUpload;
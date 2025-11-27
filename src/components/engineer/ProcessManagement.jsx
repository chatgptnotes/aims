import React, { useState, useEffect } from 'react';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import DescriptionIcon from '@mui/icons-material/Description';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useAuth } from '../../contexts/AuthContext';
import PIDUpload from '../supervisor/PIDUpload';
import toast from 'react-hot-toast';

const ProcessManagement = ({ project, onBack }) => {
  const { user } = useAuth();
  const [processes, setProcesses] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingProcess, setEditingProcess] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [showPIDUpload, setShowPIDUpload] = useState(false);
  const [selectedProcessForUpload, setSelectedProcessForUpload] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    site_override: '',
    unit_code_override: '',
    document_count_target: '',
    notes: ''
  });

  useEffect(() => {
    if (project) {
      loadProcesses();
    }
  }, [project]);

  const loadProcesses = async () => {
    try {
      setLoading(true);
      // For now, using localStorage, will integrate with Supabase later
      const storedProcesses = localStorage.getItem(`aims_processes_${project.id}`);
      if (storedProcesses) {
        setProcesses(JSON.parse(storedProcesses));
      }
    } catch (error) {
      console.error('Error loading processes:', error);
      toast.error('Failed to load processes');
    } finally {
      setLoading(false);
    }
  };

  const saveProcesses = (updatedProcesses) => {
    localStorage.setItem(`aims_processes_${project.id}`, JSON.stringify(updatedProcesses));
    setProcesses(updatedProcesses);

    // Update process count in project
    const storedProjects = JSON.parse(localStorage.getItem('aims_projects') || '[]');
    const updatedProjects = storedProjects.map(p =>
      p.id === project.id ? { ...p, process_count: updatedProcesses.length } : p
    );
    localStorage.setItem('aims_projects', JSON.stringify(updatedProjects));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.name) {
      toast.error('Please enter a process name');
      return;
    }

    const processData = {
      ...formData,
      id: editingProcess?.id || `process_${Date.now()}`,
      project_id: project.id,
      created_by: user?.id || 'unknown',
      created_at: editingProcess?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
      document_count: editingProcess?.document_count || 0,
      site: formData.site_override || project.site_default,
      unit_code: formData.unit_code_override || project.unit_code_default
    };

    let updatedProcesses;
    if (editingProcess) {
      updatedProcesses = processes.map(p =>
        p.id === editingProcess.id ? processData : p
      );
      toast.success('Process updated successfully');
    } else {
      updatedProcesses = [...processes, processData];
      toast.success('Process created successfully');
    }

    saveProcesses(updatedProcesses);
    resetForm();
  };

  const handleDelete = (process) => {
    if (!window.confirm(`Are you sure you want to delete process "${process.name}"?`)) {
      return;
    }

    const updatedProcesses = processes.filter(p => p.id !== process.id);
    saveProcesses(updatedProcesses);
    toast.success('Process deleted successfully');
  };

  const handleUploadPID = (process) => {
    setSelectedProcessForUpload(process);
    setShowPIDUpload(true);
  };

  const handleUploadSuccess = (documentRecord) => {
    // Update the process document count
    const updatedProcesses = processes.map(p => {
      if (p.id === selectedProcessForUpload?.id) {
        return {
          ...p,
          document_count: (p.document_count || 0) + documentRecord.files.length
        };
      }
      return p;
    });
    saveProcesses(updatedProcesses);
    toast.success(`Successfully uploaded ${documentRecord.files.length} P&ID document(s)`);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      site_override: '',
      unit_code_override: '',
      document_count_target: '',
      notes: ''
    });
    setEditingProcess(null);
    setShowModal(false);
  };

  const openEditModal = (process) => {
    setEditingProcess(process);
    setFormData({
      name: process.name,
      description: process.description || '',
      site_override: process.site_override || '',
      unit_code_override: process.unit_code_override || '',
      document_count_target: process.document_count_target || '',
      notes: process.notes || ''
    });
    setShowModal(true);
  };

  const filteredProcesses = processes.filter(process =>
    process.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    process.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!project) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
        <p className="text-gray-600 dark:text-gray-400">No project selected</p>
        <button
          onClick={onBack}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Back to Projects
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading processes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={onBack}
            className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
          >
            <ArrowBackIcon />
          </button>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Processes for {project.name}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Site: {project.site_default} | Unit: {project.unit_code_default}
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <AddIcon />
            <span>New Process</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search processes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                     bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                     focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Processes Grid */}
      {filteredProcesses.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-12 text-center">
          <AccountTreeIcon sx={{ fontSize: 64, color: '#9CA3AF' }} />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-4">
            {searchTerm ? 'No processes found' : 'No processes yet'}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            {searchTerm ? 'Try adjusting your search' : 'Create your first process to start organizing P&IDs'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProcesses.map((process) => (
            <div
              key={process.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow p-6"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3 flex-1">
                  <AccountTreeIcon className="text-green-600" />
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {process.name}
                    </h3>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => openEditModal(process)}
                    className="p-1 text-gray-500 hover:text-blue-600 transition-colors"
                  >
                    <EditIcon fontSize="small" />
                  </button>
                  <button
                    onClick={() => handleDelete(process)}
                    className="p-1 text-gray-500 hover:text-red-600 transition-colors"
                  >
                    <DeleteIcon fontSize="small" />
                  </button>
                </div>
              </div>

              {process.description && (
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                  {process.description}
                </p>
              )}

              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Site:</span>
                  <span className="font-medium">{process.site}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Unit:</span>
                  <span className="font-medium">{process.unit_code}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">P&IDs:</span>
                  <span className="font-medium">
                    {process.document_count || 0}
                    {process.document_count_target ? ` / ${process.document_count_target}` : ''}
                  </span>
                </div>
              </div>

              <button
                onClick={() => handleUploadPID(process)}
                className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2
                         bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <UploadFileIcon fontSize="small" />
                <span>Upload P&IDs</span>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                {editingProcess ? 'Edit Process' : 'Create New Process'}
              </h3>
              <button
                onClick={resetForm}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                <CloseIcon />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Process Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                           focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Fire Water Spray System-1"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                           focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Process description..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Site Override
                  </label>
                  <input
                    type="text"
                    value={formData.site_override}
                    onChange={(e) => setFormData({ ...formData, site_override: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                             bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                             focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={`Default: ${project.site_default}`}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Unit Code Override
                  </label>
                  <input
                    type="text"
                    value={formData.unit_code_override}
                    onChange={(e) => setFormData({ ...formData, unit_code_override: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                             bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                             focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={`Default: ${project.unit_code_default}`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Expected P&ID Count
                </label>
                <input
                  type="number"
                  value={formData.document_count_target}
                  onChange={(e) => setFormData({ ...formData, document_count_target: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                           focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 5"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                           focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Additional notes..."
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300
                           rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingProcess ? 'Update Process' : 'Create Process'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PID Upload Modal */}
      {showPIDUpload && selectedProcessForUpload && (
        <PIDUpload
          project={project}
          process={selectedProcessForUpload}
          onClose={() => {
            setShowPIDUpload(false);
            setSelectedProcessForUpload(null);
          }}
          onUploadSuccess={handleUploadSuccess}
        />
      )}
    </div>
  );
};

export default ProcessManagement;
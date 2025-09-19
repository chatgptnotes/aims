import React, { useState, useEffect } from 'react';
import {
  FileText,
  PenTool,
  CheckCircle,
  Clock,
  AlertTriangle,
  Download,
  Upload,
  Send,
  Eye,
  RefreshCw,
  Calendar,
  Building,
  User,
  Mail,
  Shield,
  FileCheck,
  XCircle,
  Edit3,
  Trash2,
  Plus
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import DatabaseService from '../../services/databaseService';

const AgreementManager = () => {
  const [agreements, setAgreements] = useState([]);
  const [clinics, setClinics] = useState([]);
  const [selectedClinic, setSelectedClinic] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [selectedAgreement, setSelectedAgreement] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm({
    defaultValues: {
      clinicId: '',
      agreementType: 'standard',
      cobranding: false,
      cobrandingFee: 299,
      validityPeriod: 12,
      specialTerms: '',
      paymentTerms: 'monthly'
    }
  });

  useEffect(() => {
    loadClinics();
    loadAgreements();
  }, []);

  const loadClinics = async () => {
    try {
      const clinicsData = await DatabaseService.getAll('clinics');
      setClinics(clinicsData || []);
    } catch (error) {
      console.error('Error loading clinics:', error);
      toast.error('Failed to load clinics');
    }
  };

  const loadAgreements = async () => {
    try {
      setLoading(true);
      // In production, this would fetch from database
      const mockAgreements = generateMockAgreements();
      setAgreements(mockAgreements);
    } catch (error) {
      console.error('Error loading agreements:', error);
      toast.error('Failed to load agreements');
    } finally {
      setLoading(false);
    }
  };

  const generateMockAgreements = () => {
    return [
      {
        id: 'agr-001',
        clinicId: 'clinic-1',
        clinicName: 'Central Medical Center',
        type: 'standard',
        status: 'signed',
        signedDate: '2025-09-01',
        expiryDate: '2026-09-01',
        cobranding: true,
        cobrandingFee: 299,
        documentUrl: '#',
        signatories: [
          { name: 'Dr. John Smith', role: 'Clinic Director', signedAt: '2025-09-01T10:30:00Z' },
          { name: 'Admin User', role: 'NeuroSense Admin', signedAt: '2025-09-01T11:00:00Z' }
        ]
      },
      {
        id: 'agr-002',
        clinicId: 'clinic-2',
        clinicName: 'Wellness Clinic East',
        type: 'premium',
        status: 'pending',
        sentDate: '2025-09-15',
        cobranding: false,
        documentUrl: '#',
        signatories: []
      },
      {
        id: 'agr-003',
        clinicId: 'clinic-3',
        clinicName: 'Family Health Partners',
        type: 'standard',
        status: 'expired',
        signedDate: '2024-08-15',
        expiryDate: '2025-08-15',
        cobranding: true,
        cobrandingFee: 199,
        documentUrl: '#'
      }
    ];
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'signed':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Signed
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </span>
        );
      case 'expired':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircle className="w-3 h-3 mr-1" />
            Expired
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {status}
          </span>
        );
    }
  };

  const onSubmitAgreement = async (data) => {
    try {
      setLoading(true);

      // Generate agreement document
      const agreementData = {
        ...data,
        id: `agr-${Date.now()}`,
        status: 'pending',
        sentDate: new Date().toISOString(),
        documentUrl: '#' // Would be actual document URL
      };

      // In production, save to database and send for signature
      toast.success('Agreement created and sent for signature');
      setShowCreateModal(false);
      reset();
      loadAgreements();
    } catch (error) {
      console.error('Error creating agreement:', error);
      toast.error('Failed to create agreement');
    } finally {
      setLoading(false);
    }
  };

  const sendReminder = (agreementId) => {
    toast.success('Reminder sent successfully');
  };

  const renewAgreement = (agreement) => {
    setSelectedAgreement(agreement);
    setShowCreateModal(true);
    // Pre-fill form with existing agreement data
  };

  const viewAgreement = (agreement) => {
    setSelectedAgreement(agreement);
    setShowPreviewModal(true);
  };

  const filteredAgreements = agreements.filter(agreement => {
    if (filterStatus === 'all') return true;
    return agreement.status === filterStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg p-6 text-white">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold flex items-center">
              <FileText className="mr-3" />
              Agreement Management
            </h2>
            <p className="mt-2 text-indigo-100">
              Manage clinic agreements, co-branding contracts, and renewals
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-white text-indigo-600 px-4 py-2 rounded-lg font-medium hover:bg-indigo-50 transition-colors flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Agreement
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Agreements</p>
              <p className="text-2xl font-bold text-green-600">
                {agreements.filter(a => a.status === 'signed').length}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500 opacity-50" />
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending Signature</p>
              <p className="text-2xl font-bold text-yellow-600">
                {agreements.filter(a => a.status === 'pending').length}
              </p>
            </div>
            <Clock className="w-8 h-8 text-yellow-500 opacity-50" />
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Expired</p>
              <p className="text-2xl font-bold text-red-600">
                {agreements.filter(a => a.status === 'expired').length}
              </p>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-500 opacity-50" />
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Co-branding Active</p>
              <p className="text-2xl font-bold text-purple-600">
                {agreements.filter(a => a.cobranding && a.status === 'signed').length}
              </p>
            </div>
            <Shield className="w-8 h-8 text-purple-500 opacity-50" />
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-4 border-b border-gray-200">
        {['all', 'signed', 'pending', 'expired'].map(status => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`pb-2 px-1 border-b-2 transition-colors ${
              filterStatus === status
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
            <span className="ml-2 text-xs">
              ({status === 'all'
                ? agreements.length
                : agreements.filter(a => a.status === status).length})
            </span>
          </button>
        ))}
      </div>

      {/* Agreements Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Clinic
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Co-branding
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Dates
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredAgreements.map(agreement => (
              <tr key={agreement.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <Building className="w-5 h-5 text-gray-400 mr-3" />
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {agreement.clinicName}
                      </div>
                      <div className="text-sm text-gray-500">
                        ID: {agreement.clinicId}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-900 capitalize">
                    {agreement.type}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(agreement.status)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {agreement.cobranding ? (
                    <div className="text-sm">
                      <span className="text-green-600 font-medium">Yes</span>
                      <span className="text-gray-500 ml-1">
                        (${agreement.cobrandingFee}/mo)
                      </span>
                    </div>
                  ) : (
                    <span className="text-sm text-gray-500">No</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {agreement.status === 'signed' ? (
                      <>
                        <div>Signed: {new Date(agreement.signedDate).toLocaleDateString()}</div>
                        <div className="text-gray-500">
                          Expires: {new Date(agreement.expiryDate).toLocaleDateString()}
                        </div>
                      </>
                    ) : agreement.status === 'pending' ? (
                      <div>Sent: {new Date(agreement.sentDate).toLocaleDateString()}</div>
                    ) : (
                      <div className="text-red-600">
                        Expired: {new Date(agreement.expiryDate).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => viewAgreement(agreement)}
                      className="text-indigo-600 hover:text-indigo-900"
                      title="View Agreement"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => window.open(agreement.documentUrl)}
                      className="text-gray-600 hover:text-gray-900"
                      title="Download PDF"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    {agreement.status === 'pending' && (
                      <button
                        onClick={() => sendReminder(agreement.id)}
                        className="text-yellow-600 hover:text-yellow-900"
                        title="Send Reminder"
                      >
                        <Mail className="w-4 h-4" />
                      </button>
                    )}
                    {(agreement.status === 'expired' || agreement.status === 'signed') && (
                      <button
                        onClick={() => renewAgreement(agreement)}
                        className="text-green-600 hover:text-green-900"
                        title="Renew Agreement"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create Agreement Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Create New Agreement
                </h3>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit(onSubmitAgreement)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Select Clinic
                  </label>
                  <select
                    {...register('clinicId', { required: 'Please select a clinic' })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  >
                    <option value="">Choose a clinic...</option>
                    {clinics.map(clinic => (
                      <option key={clinic.id} value={clinic.id}>
                        {clinic.name}
                      </option>
                    ))}
                  </select>
                  {errors.clinicId && (
                    <p className="mt-1 text-sm text-red-600">{errors.clinicId.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Agreement Type
                  </label>
                  <select
                    {...register('agreementType')}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  >
                    <option value="standard">Standard</option>
                    <option value="premium">Premium</option>
                    <option value="enterprise">Enterprise</option>
                  </select>
                </div>

                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      {...register('cobranding')}
                      className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      Enable Co-branding (Additional fee applies)
                    </span>
                  </label>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Validity Period (months)
                    </label>
                    <input
                      type="number"
                      {...register('validityPeriod')}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Payment Terms
                    </label>
                    <select
                      {...register('paymentTerms')}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    >
                      <option value="monthly">Monthly</option>
                      <option value="quarterly">Quarterly</option>
                      <option value="annual">Annual</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Special Terms & Conditions
                  </label>
                  <textarea
                    {...register('specialTerms')}
                    rows={3}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    placeholder="Enter any special terms or conditions..."
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {loading ? 'Creating...' : 'Create & Send for Signature'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Preview Agreement Modal */}
      {showPreviewModal && selectedAgreement && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Agreement Details
                </h3>
                <button
                  onClick={() => setShowPreviewModal(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="border-b pb-4">
                  <h4 className="font-medium text-gray-900 mb-2">Agreement Information</h4>
                  <dl className="grid grid-cols-2 gap-x-4 gap-y-2">
                    <dt className="text-sm text-gray-500">Agreement ID:</dt>
                    <dd className="text-sm text-gray-900">{selectedAgreement.id}</dd>
                    <dt className="text-sm text-gray-500">Clinic:</dt>
                    <dd className="text-sm text-gray-900">{selectedAgreement.clinicName}</dd>
                    <dt className="text-sm text-gray-500">Type:</dt>
                    <dd className="text-sm text-gray-900 capitalize">{selectedAgreement.type}</dd>
                    <dt className="text-sm text-gray-500">Status:</dt>
                    <dd>{getStatusBadge(selectedAgreement.status)}</dd>
                  </dl>
                </div>

                {selectedAgreement.signatories && selectedAgreement.signatories.length > 0 && (
                  <div className="border-b pb-4">
                    <h4 className="font-medium text-gray-900 mb-2">Signatories</h4>
                    <div className="space-y-2">
                      {selectedAgreement.signatories.map((signatory, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{signatory.name}</p>
                            <p className="text-sm text-gray-500">{signatory.role}</p>
                          </div>
                          {signatory.signedAt && (
                            <div className="flex items-center text-green-600">
                              <PenTool className="w-4 h-4 mr-1" />
                              <span className="text-sm">
                                {new Date(signatory.signedAt).toLocaleDateString()}
                              </span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => window.open(selectedAgreement.documentUrl)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download PDF
                  </button>
                  <button
                    onClick={() => setShowPreviewModal(false)}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgreementManager;
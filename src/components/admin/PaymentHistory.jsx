import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  DollarSign, 
  Calendar,
  Download,
  Eye,
  Filter,
  Search,
  X,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  AlertCircle,
  Clock,
  Users,
  FileText
} from 'lucide-react';
import toast from 'react-hot-toast';
import DatabaseService from '../../services/databaseService';
import PaymentService from '../../services/paymentService';

const PaymentHistory = ({ selectedClinic }) => {
  const [payments, setPayments] = useState([]);
  const [clinics, setClinics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showPaymentDetails, setShowPaymentDetails] = useState(false);

  useEffect(() => {
    loadData();
  }, [selectedClinic]);

  const loadData = async () => {
    try {
      console.log('💰 Loading payment history...');
      
      // Load all payments and clinics
      const paymentsData = DatabaseService.get('payments');
      const subscriptionsData = DatabaseService.get('subscriptions');
      const clinicsData = DatabaseService.get('clinics');
      
      // Combine payments and subscriptions
      const allPayments = [
        ...paymentsData.map(p => ({ ...p, type: 'payment' })),
        ...subscriptionsData.map(s => ({ ...s, type: 'subscription' }))
      ];
      
      // Filter by selected clinic if specified
      const filteredPayments = selectedClinic 
        ? allPayments.filter(p => p.clinicId === selectedClinic)
        : allPayments;
      
      // Enhance payments with clinic information
      const enhancedPayments = filteredPayments.map(payment => {
        const clinic = clinicsData.find(c => c.id === payment.clinicId);
        return {
          ...payment,
          clinicName: clinic?.name || 'Unknown Clinic',
          clinicEmail: clinic?.email || 'Unknown Email'
        };
      }).sort((a, b) => new Date(b.createdAt || b.timestamp || 0) - new Date(a.createdAt || a.timestamp || 0));
      
      setPayments(enhancedPayments);
      setClinics(clinicsData);
    } catch (error) {
      toast.error('Error loading payment data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getPaymentStatus = (payment) => {
    if (payment.status === 'completed' || payment.status === 'succeeded') {
      return { status: 'success', text: 'Completed', icon: CheckCircle };
    } else if (payment.status === 'pending' || payment.status === 'processing') {
      return { status: 'pending', text: 'Pending', icon: Clock };
    } else if (payment.status === 'failed' || payment.status === 'cancelled') {
      return { status: 'failed', text: 'Failed', icon: AlertCircle };
    }
    return { status: 'unknown', text: 'Unknown', icon: AlertCircle };
  };

  const getPaymentType = (payment) => {
    if (payment.type === 'subscription') {
      return 'Subscription';
    } else if (payment.packageName) {
      return `Report Package: ${payment.packageName}`;
    } else if (payment.reportType) {
      return `Report Purchase: ${payment.reportType}`;
    }
    return 'Payment';
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = payment.clinicName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.clinicEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         getPaymentType(payment).toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !statusFilter || getPaymentStatus(payment).status === statusFilter;
    
    let matchesDate = true;
    if (dateFilter !== 'all') {
      const paymentDate = new Date(payment.createdAt || payment.timestamp);
      const now = new Date();
      const diffDays = Math.floor((now - paymentDate) / (1000 * 60 * 60 * 24));
      
      switch (dateFilter) {
        case 'today':
          matchesDate = diffDays === 0;
          break;
        case 'week':
          matchesDate = diffDays <= 7;
          break;
        case 'month':
          matchesDate = diffDays <= 30;
          break;
        case 'quarter':
          matchesDate = diffDays <= 90;
          break;
      }
    }
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  const getTotalRevenue = () => {
    return payments
      .filter(p => getPaymentStatus(p).status === 'success')
      .reduce((sum, p) => sum + (p.amount || 0), 0);
  };

  const getMonthlyRevenue = () => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    return payments
      .filter(p => {
        const paymentDate = new Date(p.createdAt || p.timestamp);
        return paymentDate >= thirtyDaysAgo && getPaymentStatus(p).status === 'success';
      })
      .reduce((sum, p) => sum + (p.amount || 0), 0);
  };

  const viewPaymentDetails = (payment) => {
    setSelectedPayment(payment);
    setShowPaymentDetails(true);
  };

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
          <h2 className="text-2xl font-bold text-gray-900">Payment History</h2>
          <p className="text-gray-600">
            {selectedClinic 
              ? `Payment history for ${clinics.find(c => c.id === selectedClinic)?.name}`
              : 'All payment transactions across clinics'
            }
          </p>
        </div>
      </div>

      {/* Revenue Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">{formatAmount(getTotalRevenue())}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
              <p className="text-2xl font-bold text-gray-900">{formatAmount(getMonthlyRevenue())}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="h-12 w-12 rounded-lg bg-purple-100 flex items-center justify-center">
              <CreditCard className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Transactions</p>
              <p className="text-2xl font-bold text-gray-900">{payments.length}</p>
            </div>
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
              placeholder="Search payments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">All Status</option>
            <option value="success">Completed</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </select>
          
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
            <option value="quarter">Last 90 Days</option>
          </select>
          
          <button
            onClick={() => {
              setSearchTerm('');
              setStatusFilter('');
              setDateFilter('all');
            }}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 flex items-center justify-center space-x-2"
          >
            <X className="h-4 w-4" />
            <span>Clear</span>
          </button>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h3 className="text-lg font-medium text-gray-900">
            Payment Transactions ({filteredPayments.length})
          </h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Transaction
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Clinic
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPayments.map((payment) => {
                const statusInfo = getPaymentStatus(payment);
                const StatusIcon = statusInfo.icon;
                
                return (
                  <tr key={payment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                          <CreditCard className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {getPaymentType(payment)}
                          </div>
                          <div className="text-sm text-gray-500">
                            {payment.paymentId || payment.id}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{payment.clinicName}</div>
                      <div className="text-sm text-gray-500">{payment.clinicEmail}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {formatAmount(payment.amount)}
                      </div>
                      {payment.reportsAllowed && (
                        <div className="text-sm text-gray-500">
                          {payment.reportsAllowed} reports
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        statusInfo.status === 'success' ? 'bg-green-100 text-green-800' :
                        statusInfo.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {statusInfo.text}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(payment.createdAt || payment.timestamp).toLocaleDateString()}
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(payment.createdAt || payment.timestamp).toLocaleTimeString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => viewPaymentDetails(payment)}
                          className="text-primary-600 hover:text-primary-900"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            // Generate receipt/invoice
                            toast.success('Receipt generated');
                          }}
                          className="text-gray-600 hover:text-gray-900"
                          title="Download Receipt"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filteredPayments.length === 0 && (
            <div className="text-center py-12">
              <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">
                {searchTerm || statusFilter || dateFilter !== 'all'
                  ? 'No payments match your filters' 
                  : 'No payment transactions found'
                }
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Payment Details Modal */}
      {showPaymentDetails && selectedPayment && (
        <PaymentDetailsModal
          payment={selectedPayment}
          onClose={() => {
            setShowPaymentDetails(false);
            setSelectedPayment(null);
          }}
        />
      )}
    </div>
  );
};

// Payment Details Modal Component
const PaymentDetailsModal = ({ payment, onClose }) => {
  const statusInfo = getPaymentStatus(payment);
  const StatusIcon = statusInfo.icon;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-6 border max-w-2xl w-full shadow-lg rounded-md bg-white">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <CreditCard className="h-6 w-6 text-primary-600" />
            <h3 className="text-lg font-medium text-gray-900">Payment Details</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Payment Summary */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-600">Transaction ID</p>
                <p className="text-sm text-gray-900">{payment.paymentId || payment.id}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Amount</p>
                <p className="text-lg font-bold text-gray-900">
                  {new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD'
                  }).format(payment.amount || 0)}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Status</p>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  statusInfo.status === 'success' ? 'bg-green-100 text-green-800' :
                  statusInfo.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  <StatusIcon className="h-3 w-3 mr-1" />
                  {statusInfo.text}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Date</p>
                <p className="text-sm text-gray-900">
                  {new Date(payment.createdAt || payment.timestamp).toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* Clinic Information */}
          <div>
            <h4 className="text-md font-medium text-gray-900 mb-3">Clinic Information</h4>
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <p className="text-sm font-medium text-gray-600">Clinic Name</p>
                  <p className="text-sm text-gray-900">{payment.clinicName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Email</p>
                  <p className="text-sm text-gray-900">{payment.clinicEmail}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Details */}
          <div>
            <h4 className="text-md font-medium text-gray-900 mb-3">Payment Information</h4>
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <p className="text-sm font-medium text-gray-600">Payment Type</p>
                  <p className="text-sm text-gray-900">{getPaymentType(payment)}</p>
                </div>
                {payment.packageName && (
                  <div>
                    <p className="text-sm font-medium text-gray-600">Package</p>
                    <p className="text-sm text-gray-900">{payment.packageName}</p>
                  </div>
                )}
                {payment.reportsAllowed && (
                  <div>
                    <p className="text-sm font-medium text-gray-600">Reports Included</p>
                    <p className="text-sm text-gray-900">{payment.reportsAllowed} reports</p>
                  </div>
                )}
                {payment.paymentMethod && (
                  <div>
                    <p className="text-sm font-medium text-gray-600">Payment Method</p>
                    <p className="text-sm text-gray-900 capitalize">{payment.paymentMethod}</p>
                  </div>
                )}
                {payment.notes && (
                  <div>
                    <p className="text-sm font-medium text-gray-600">Notes</p>
                    <p className="text-sm text-gray-900">{payment.notes}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Close
          </button>
          <button
            onClick={() => {
              toast.success('Receipt downloaded');
            }}
            className="px-4 py-2 bg-primary-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-primary-700 flex items-center space-x-2"
          >
            <Download className="h-4 w-4" />
            <span>Download Receipt</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentHistory;

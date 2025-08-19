import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  Download, 
  Calendar, 
  IndianRupee,
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  Filter,
  Search,
  X
} from 'lucide-react';
import RazorpayService from '../../services/razorpayService';

const PaymentHistory = ({ clinicId }) => {
  const [payments, setPayments] = useState([]);
  const [filteredPayments, setFilteredPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateRange, setDateRange] = useState('all');

  useEffect(() => {
    loadPaymentHistory();
  }, [clinicId]);

  useEffect(() => {
    filterPayments();
  }, [payments, searchTerm, statusFilter, dateRange]);

  const loadPaymentHistory = () => {
    try {
      const paymentHistory = RazorpayService.getPaymentHistory(clinicId);
      setPayments(paymentHistory);
    } catch (error) {
      console.error('Error loading payment history:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterPayments = () => {
    let filtered = [...payments];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(payment =>
        payment.packageName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.paymentId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.orderId?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(payment => payment.status === statusFilter);
    }

    // Date range filter
    if (dateRange !== 'all') {
      const now = new Date();
      let startDate;
      
      switch (dateRange) {
        case '7days':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '30days':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case '3months':
          startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          break;
        default:
          startDate = null;
      }

      if (startDate) {
        filtered = filtered.filter(payment => 
          new Date(payment.createdAt) >= startDate
        );
      }
    }

    setFilteredPayments(filtered);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'captured':
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'captured':
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'failed':
      case 'cancelled':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const downloadInvoice = (payment) => {
    // In a real application, this would download an actual invoice
    const invoiceData = {
      paymentId: payment.paymentId,
      orderId: payment.orderId,
      amount: payment.amount,
      packageName: payment.packageName,
      date: new Date(payment.createdAt).toLocaleDateString(),
      clinic: payment.clinicId
    };

    const dataStr = JSON.stringify(invoiceData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `invoice-${payment.paymentId}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Payment History</h2>
          <p className="text-gray-600">View all your payment transactions</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search payments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="all">All Status</option>
            <option value="completed">Completed</option>
            <option value="captured">Captured</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </select>
          
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="all">All Time</option>
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
            <option value="3months">Last 3 Months</option>
          </select>
          
          <button
            onClick={() => {
              setSearchTerm('');
              setStatusFilter('all');
              setDateRange('all');
            }}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 flex items-center justify-center space-x-2"
          >
            <X className="h-4 w-4" />
            <span>Clear</span>
          </button>
        </div>
      </div>

      {/* Payment Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-full">
              <IndianRupee className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Spent</p>
              <p className="text-2xl font-semibold text-gray-900">
                ₹{payments.reduce((sum, p) => sum + (p.amount || 0), 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-full">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Reports Purchased</p>
              <p className="text-2xl font-semibold text-gray-900">
                {payments.reduce((sum, p) => {
                  const pkg = RazorpayService.getReportPackages().find(pkg => pkg.id === p.packageId);
                  return sum + (pkg?.reports || 0);
                }, 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-full">
              <CreditCard className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Payments</p>
              <p className="text-2xl font-semibold text-gray-900">{payments.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Payment List */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
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
                  Payment Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Package
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
                const packageInfo = RazorpayService.getReportPackages().find(pkg => pkg.id === payment.packageId);
                return (
                  <tr key={payment.paymentId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {payment.paymentId}
                        </div>
                        <div className="text-sm text-gray-500">
                          Order: {payment.orderId}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{payment.packageName}</div>
                      {packageInfo && (
                        <div className="text-sm text-gray-500">
                          {packageInfo.reports} reports
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        ₹{payment.amount?.toLocaleString() || 'N/A'}
                      </div>
                      <div className="text-sm text-gray-500">{payment.currency || 'INR'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                        {getStatusIcon(payment.status)}
                        <span className="ml-1 capitalize">{payment.status}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                        {new Date(payment.createdAt).toLocaleDateString()}
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(payment.createdAt).toLocaleTimeString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => downloadInvoice(payment)}
                        className="text-primary-600 hover:text-primary-900 flex items-center"
                        title="Download Invoice"
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Invoice
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filteredPayments.length === 0 && (
            <div className="text-center py-12">
              <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">
                {searchTerm || statusFilter !== 'all' || dateRange !== 'all'
                  ? 'No payments match your filters'
                  : 'No payments found'
                }
              </p>
              {searchTerm || statusFilter !== 'all' || dateRange !== 'all' ? (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('all');
                    setDateRange('all');
                  }}
                  className="text-primary-600 hover:text-primary-500 text-sm"
                >
                  Clear filters
                </button>
              ) : (
                <p className="text-gray-500 text-sm">
                  Your payment history will appear here after making purchases
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentHistory;
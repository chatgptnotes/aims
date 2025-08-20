import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  Package, 
  TrendingUp,
  CheckCircle,
  AlertTriangle,
  Star,
  Receipt,
  Download,
  ArrowLeft
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import PaymentService from '../../services/paymentService';
import DatabaseService from '../../services/databaseService';

const SubscriptionManager = () => {
  const { user } = useAuth();
  const clinicId = user?.clinicId;
  const [clinic, setClinic] = useState(null);
  const [packages, setPackages] = useState([]);
  const [usageStats, setUsageStats] = useState({});
  // const [selectedPackage, setSelectedPackage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);

  useEffect(() => {
    loadData();
  }, [clinicId]);

  const loadData = () => {
    try {
      const clinicData = DatabaseService.findById('clinics', clinicId);
      const packagesData = PaymentService.getReportPackages();
      const statsData = PaymentService.getUsageStats(clinicId);
      
      setClinic(clinicData);
      setPackages(packagesData);
      setUsageStats(statsData);
    } catch (error) {
      toast.error('Error loading subscription data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchasePackage = async (packageData) => {
    if (!clinicId) {
      toast.error('Clinic ID not found');
      return;
    }

    setPurchasing(true);
    try {
      PaymentService.createCheckoutSession(clinicId, packageData);
      // The payment service handles the redirect and completion
    } catch (error) {
      toast.error('Error processing payment');
      console.error(error);
    } finally {
      setPurchasing(false);
    }
  };

  const getUsagePercentage = () => {
    const used = usageStats.reportsUsed || 0;
    const allowed = usageStats.reportsAllowed || 10;
    return Math.min((used / allowed) * 100, 100);
  };

  const getUsageColor = () => {
    const percentage = getUsagePercentage();
    if (percentage >= 100) return 'text-red-600';
    if (percentage >= 80) return 'text-yellow-600';
    return 'text-green-600';
  };

  // const getUsageBgColor = () => {
  //   const percentage = getUsagePercentage();
  //   if (percentage >= 100) return 'bg-red-500';
  //   if (percentage >= 80) return 'bg-yellow-500';
  //   return 'bg-green-500';
  // };

  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="mb-4">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          <ArrowLeft className="mr-2 h-5 w-5" />
          Back to Dashboard
        </button>
      </div>

      {/* Current Usage Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Current Usage</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="relative inline-flex items-center justify-center w-24 h-24">
              <svg className="w-24 h-24 transform -rotate-90">
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="transparent"
                  className="text-gray-200"
                  transform="translate(36, 36)"
                />
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="transparent"
                  strokeDasharray={`${getUsagePercentage() * 0.628} 62.8`}
                  className={getUsageColor()}
                  transform="translate(36, 36)"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className={`text-xl font-bold ${getUsageColor()}`}>
                  {Math.round(getUsagePercentage())}%
                </span>
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mt-4">Usage</h3>
            <p className="text-sm text-gray-600">
              {usageStats.reportsUsed || 0} / {usageStats.reportsAllowed || 10} reports used
            </p>
          </div>

          <div className="text-center">
            <div className="w-24 h-24 mx-auto bg-blue-100 rounded-full flex items-center justify-center">
              <Package className="h-10 w-10 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mt-4">Remaining</h3>
            <p className="text-sm text-gray-600">
              {usageStats.reportsRemaining || 0} reports left
            </p>
          </div>

          <div className="text-center">
            <div className="w-24 h-24 mx-auto bg-green-100 rounded-full flex items-center justify-center">
              <TrendingUp className="h-10 w-10 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mt-4">Total Spent</h3>
            <p className="text-sm text-gray-600">
              ${usageStats.totalSpent || 0}
            </p>
          </div>
        </div>

        {/* Usage Alert */}
        {PaymentService.shouldShowPaymentAlert(clinic) && (
          <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex">
              <AlertTriangle className="h-5 w-5 text-yellow-400" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  Running Low on Reports
                </h3>
                <p className="mt-1 text-sm text-yellow-700">
                  You&apos;re running low on reports. Purchase more to continue using the service.
                </p>
                <div className="mt-3">
                  <button
                    onClick={() => document.getElementById('packages').scrollIntoView({ behavior: 'smooth' })}
                    className="text-sm font-medium text-yellow-800 hover:text-yellow-900"
                  >
                    View Packages →
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Available Packages */}
      <div id="packages" className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Available Packages</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {packages.map((pkg) => (
            <div
              key={pkg.id}
              className={`relative rounded-lg border-2 p-6 transition-all ${
                pkg.popular
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              {pkg.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <div className="bg-primary-500 text-white text-xs px-3 py-1 rounded-full font-medium flex items-center">
                    <Star className="h-3 w-3 mr-1" />
                    Popular
                  </div>
                </div>
              )}
              
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900">{pkg.name}</h3>
                <div className="mt-4">
                  <span className="text-3xl font-bold text-gray-900">${pkg.price}</span>
                </div>
                <p className="text-gray-600 mt-2">{pkg.description}</p>
                {pkg.savings && (
                  <p className="text-green-600 text-sm font-medium mt-2">{pkg.savings}</p>
                )}
              </div>
              
              <div className="mt-6">
                <div className="flex items-center justify-center text-sm text-gray-600 mb-4">
                  <Package className="h-4 w-4 mr-2" />
                  {pkg.reports} reports
                </div>
                <button
                  onClick={() => handlePurchasePackage(pkg)}
                  disabled={purchasing}
                  className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                    pkg.popular
                      ? 'bg-primary-600 hover:bg-primary-700 text-white'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                  } disabled:opacity-50`}
                >
                  {purchasing ? 'Processing...' : 'Purchase'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Subscription History */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Purchase History</h2>
        
        {usageStats.subscriptionHistory && usageStats.subscriptionHistory.length > 0 ? (
          <div className="space-y-4">
            {usageStats.subscriptionHistory.map((subscription) => (
              <div key={subscription.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <Receipt className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{subscription.packageName}</h4>
                    <p className="text-sm text-gray-600">
                      {subscription.reportsAllowed} reports • ${subscription.amount}
                    </p>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-gray-600">Completed</span>
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    {new Date(subscription.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Receipt className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Purchase History</h3>
            <p className="text-gray-600">Your purchase history will appear here</p>
          </div>
        )}
      </div>

      {/* Billing Information */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Billing Information</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Method</h3>
            <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
              <CreditCard className="h-6 w-6 text-gray-600" />
              <div>
                <p className="font-medium text-gray-900">Credit Card</p>
                <p className="text-sm text-gray-600">Secure payment via Stripe</p>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Billing Details</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Clinic:</span>
                <span className="font-medium text-gray-900">{clinic?.name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Status:</span>
                <span className="font-medium text-gray-900 capitalize">
                  {clinic?.subscriptionStatus || 'Trial'}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Total Purchased:</span>
                <span className="font-medium text-gray-900">
                  {usageStats.totalReportsPurchased || 0} reports
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Support Information */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-4">Need Help?</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <CreditCard className="h-6 w-6 text-blue-600" />
            </div>
            <h4 className="font-medium text-blue-900">Billing Support</h4>
            <p className="text-sm text-blue-700">Questions about payments or invoices</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Package className="h-6 w-6 text-blue-600" />
            </div>
            <h4 className="font-medium text-blue-900">Package Info</h4>
            <p className="text-sm text-blue-700">Learn about different report packages</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Download className="h-6 w-6 text-blue-600" />
            </div>
            <h4 className="font-medium text-blue-900">Usage Help</h4>
            <p className="text-sm text-blue-700">How to use your purchased reports</p>
          </div>
        </div>
        <div className="text-center mt-6">
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium">
            Contact Support
          </button>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionManager;
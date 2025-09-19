import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  Package, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Plus,
  Star,
  Zap,
  Users,
  Shield,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import RazorpayService from '../../services/razorpayService';
import SimpleRazorpayCheckout from '../payment/SimpleRazorpayCheckout';
import PaymentHistory from '../payment/PaymentHistory';
import PaymentSuccessModal from '../payment/PaymentSuccessModal';
import toast from 'react-hot-toast';

const SubscriptionTab = () => {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState('overview');
  const [showCheckout, setShowCheckout] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [paymentData, setPaymentData] = useState(null);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [usageStats, setUsageStats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.clinicId) {
      loadUsageStats();
    }
  }, [user]);

  const loadUsageStats = async () => {
    try {
      if (user?.clinicId) {
        console.log('📊 CLINIC: Loading usage stats for clinic:', user.clinicId);
        const stats = await RazorpayService.getUsageStats(user.clinicId);
        console.log('✅ CLINIC: Usage stats loaded:', stats);
        setUsageStats(stats);
      } else {
        console.warn('No clinicId found for user:', user);
      }
    } catch (error) {
      console.error('❌ CLINIC: Error loading usage stats:', error);
      // Set default stats on error to prevent crash
      setUsageStats({
        clinic: null,
        reportsUsed: 0,
        reportsAllowed: 10,
        reportsRemaining: 10,
        totalSpent: 0,
        paymentHistory: []
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePurchaseClick = () => {
    console.log('🛒 Purchase clicked with user data:', user);
    console.log('🏥 Clinic info that will be passed:', {
      id: user?.clinicId,
      name: user?.clinicName || user?.name,
      email: user?.email,
      phone: user?.phone
    });
    setShowCheckout(true);
  };

  const handlePaymentSuccess = (paymentData, packageInfo) => {
    setPaymentData(paymentData);
    setSelectedPackage(packageInfo);
    setShowCheckout(false);
    setShowSuccessModal(true);
    
    // Refresh usage stats
    setTimeout(() => {
      loadUsageStats();
    }, 1000);
  };

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    setPaymentData(null);
    setSelectedPackage(null);
  };

  const packages = RazorpayService.getReportPackages();
  const needsMoreReports = RazorpayService.shouldShowPaymentAlert(usageStats?.clinic || {});

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Current Plan Status */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">Current Plan</h3>
            <p className="text-gray-600 mt-1">Manage your subscription and usage</p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={loadUsageStats}
              className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
              title="Refresh"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Reports Used</p>
                <p className="text-2xl font-bold">
                  {usageStats.reportsUsed || 0}
                </p>
              </div>
              <div className="p-3 bg-blue-400 rounded-full">
                <Zap className="h-6 w-6" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Reports Available</p>
                <p className="text-2xl font-bold">
                  {usageStats.reportsAllowed || 10}
                </p>
              </div>
              <div className="p-3 bg-green-400 rounded-full">
                <Package className="h-6 w-6" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Reports Remaining</p>
                <p className="text-2xl font-bold">
                  {usageStats.reportsRemaining || 0}
                </p>
              </div>
              <div className="p-3 bg-purple-400 rounded-full">
                <Users className="h-6 w-6" />
              </div>
            </div>
          </div>
        </div>

        {/* Usage Progress */}
        <div className="mt-6">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Usage Progress</span>
            <span>
              {usageStats.reportsUsed || 0} / {usageStats.reportsAllowed || 10} 
              ({Math.round(((usageStats.reportsUsed || 0) / (usageStats.reportsAllowed || 10)) * 100)}%)
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className={`h-3 rounded-full transition-all duration-300 ${
                needsMoreReports ? 'bg-red-500' : 
                (usageStats.reportsUsed || 0) / (usageStats.reportsAllowed || 10) > 0.7 ? 'bg-yellow-500' : 'bg-green-500'
              }`}
              style={{ 
                width: `${Math.min(((usageStats.reportsUsed || 0) / (usageStats.reportsAllowed || 10)) * 100, 100)}%` 
              }}
            />
          </div>
        </div>

        {/* Alert if usage is high */}
        {needsMoreReports && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start">
              <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5 mr-3" />
              <div>
                <h4 className="text-sm font-medium text-red-800">Usage Alert</h4>
                <p className="text-sm text-red-700 mt-1">
                  You're running low on reports. Purchase more to continue using our services.
                </p>
                <button
                  onClick={handlePurchaseClick}
                  className="mt-2 bg-red-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-700 transition-colors"
                >
                  Purchase More Reports
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Spending Summary */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">Total Spent</h4>
              <p className="text-2xl font-bold text-primary-600">
                ₹{(usageStats.totalSpent || 0).toLocaleString()}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Status</p>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                <CheckCircle className="h-4 w-4 mr-1" />
                Active
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={handlePurchaseClick}
            className="flex items-center p-4 border-2 border-dashed border-primary-300 rounded-lg hover:border-primary-400 hover:bg-primary-50 transition-colors group"
          >
            <Plus className="h-8 w-8 text-primary-500 mr-3 group-hover:text-primary-600" />
            <div className="text-left">
              <div className="font-medium text-gray-900">Purchase Reports</div>
              <div className="text-sm text-gray-500">Add more EEG reports</div>
            </div>
          </button>

          <button
            onClick={() => setActiveSection('history')}
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Clock className="h-8 w-8 text-gray-500 mr-3" />
            <div className="text-left">
              <div className="font-medium text-gray-900">Payment History</div>
              <div className="text-sm text-gray-500">View all transactions</div>
            </div>
          </button>

          <button className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <Shield className="h-8 w-8 text-gray-500 mr-3" />
            <div className="text-left">
              <div className="font-medium text-gray-900">Billing Details</div>
              <div className="text-sm text-gray-500">Manage payment methods</div>
            </div>
          </button>
        </div>
      </div>

      {/* Available Packages Preview */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Available Packages</h3>
            <p className="text-gray-600">Choose the perfect plan for your clinic</p>
          </div>
          <button
            onClick={handlePurchaseClick}
            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
          >
            View All Plans
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {packages.slice(1, 4).map((pkg) => (
            <div
              key={pkg.id}
              className={`relative border rounded-lg p-4 ${
                pkg.popular 
                  ? 'border-primary-500 ring-1 ring-primary-200' 
                  : 'border-gray-200'
              }`}
            >
              {pkg.popular && (
                <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                  <span className="bg-primary-600 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center">
                    <Star className="h-3 w-3 mr-1" />
                    Popular
                  </span>
                </div>
              )}

              <div className="text-center">
                <h4 className="font-semibold text-gray-900">{pkg.name}</h4>
                <div className="mt-2">
                  <span className="text-xl font-bold text-gray-900">
                    ₹{pkg.price.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-center mt-2 text-primary-600">
                  <Zap className="h-4 w-4 mr-1" />
                  <span className="text-sm font-medium">{pkg.reports} reports</span>
                </div>
                {pkg.savings && (
                  <span className="inline-block mt-2 bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                    {pkg.savings}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderNavigation = () => (
    <div className="flex space-x-1 bg-gray-100 rounded-lg p-1 mb-6">
      <button
        onClick={() => setActiveSection('overview')}
        className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
          activeSection === 'overview'
            ? 'bg-white text-primary-600 shadow-sm'
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        Overview
      </button>
      <button
        onClick={() => setActiveSection('history')}
        className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
          activeSection === 'history'
            ? 'bg-white text-primary-600 shadow-sm'
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        Payment History
      </button>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Authentication Required</h2>
          <p className="text-gray-600">Please log in to access the subscription page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Subscription & Billing</h2>
          <p className="text-gray-600">Manage your EEG report subscriptions and payments</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={handlePurchaseClick}
            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center"
          >
            <CreditCard className="h-4 w-4 mr-2" />
            Purchase Reports
          </button>
        </div>
      </div>

      {/* Navigation */}
      {renderNavigation()}

      {/* Content */}
      {activeSection === 'overview' && renderOverview()}
      {activeSection === 'history' && <PaymentHistory clinicId={user?.clinicId} />}

      {/* Simple Razorpay Checkout Modal */}
      {showCheckout && (
        <SimpleRazorpayCheckout
          clinicInfo={{
            id: user?.clinicId || user?.id,
                          name: user?.clinicName || user?.name || 'Clinic',
                          email: user?.email || 'clinic@example.com',
                          phone: user?.phone || ''
          }}
          onSuccess={handlePaymentSuccess}
          onClose={() => setShowCheckout(false)}
        />
      )}

      {/* Payment Success Modal */}
      {showSuccessModal && paymentData && selectedPackage && (
        <PaymentSuccessModal
          paymentData={paymentData}
          packageInfo={selectedPackage}
          onClose={handleSuccessModalClose}
        />
      )}
    </div>
  );
};

export default SubscriptionTab;
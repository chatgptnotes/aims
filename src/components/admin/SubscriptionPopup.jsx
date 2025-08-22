import React, { useState } from 'react';
import { X, Check, Star, Zap, Crown, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import RazorpayService from '../../services/razorpayService';
import PaymentSuccessModal from '../payment/PaymentSuccessModal';

const SubscriptionPopup = ({ isOpen, onClose, clinicId, currentUsage, onSubscribe, clinicInfo }) => {
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successPaymentData, setSuccessPaymentData] = useState(null);
  const [successPackageInfo, setSuccessPackageInfo] = useState(null);

  // Use real Razorpay packages with INR pricing
  const subscriptionPlans = RazorpayService.getReportPackages().map(pkg => ({
    id: pkg.id,
    name: pkg.name,
    price: pkg.price,
    originalPrice: pkg.originalPrice,
    period: 'one-time',
    reports: pkg.reports,
    features: pkg.features,
    popular: pkg.popular,
    savings: pkg.savings,
    icon: pkg.id.includes('basic') ? <Star className="h-6 w-6 text-blue-500" /> :
          pkg.id.includes('standard') ? <Zap className="h-6 w-6 text-yellow-500" /> :
          pkg.id.includes('premium') ? <Crown className="h-6 w-6 text-purple-500" /> :
          <Star className="h-6 w-6 text-green-500" />
  }));

  const handleSubscribe = async () => {
    if (!selectedPlan) {
      toast.error('Please select a subscription plan');
      return;
    }

    try {
      setIsProcessing(true);
      console.log('🚀 POPUP: Starting real Razorpay payment for:', selectedPlan.name);
      
      // Create order data for Razorpay
      const orderData = {
        clinicId: clinicId,
        packageInfo: selectedPlan,
        clinicInfo: clinicInfo || {
          name: 'Clinic',
          email: 'clinic@example.com',
          phone: ''
        }
      };

      // Create Razorpay order
      const order = await RazorpayService.createOrder(orderData);
      console.log('✅ POPUP: Razorpay order created:', order.id);

      // Process payment with real Razorpay
      RazorpayService.processPayment(
        order,
        orderData.clinicInfo,
        async (paymentData, packageInfo) => {
          console.log('✅ POPUP: Payment successful:', paymentData);
          
          // Update clinic subscription after successful payment
          const subscriptionData = {
            clinicId: clinicId,
            planId: selectedPlan.id,
            planName: selectedPlan.name,
            reportsAllowed: selectedPlan.reports,
            reportsUsed: currentUsage,
            amount: selectedPlan.price,
            status: 'active',
            paymentId: paymentData.paymentId,
            startDate: new Date().toISOString(),
            endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() // 1 year validity
          };

          await onSubscribe(subscriptionData);
          
          // Store payment data for success modal
          setSuccessPaymentData(paymentData);
          setSuccessPackageInfo(packageInfo);
          setShowSuccessModal(true);
          setIsProcessing(false);
        },
        (error) => {
          console.error('❌ POPUP: Payment failed:', error);
          toast.error('Payment failed. Please try again.');
          setIsProcessing(false);
        }
      );
      
    } catch (error) {
      console.error('❌ POPUP: Subscription error:', error);
      toast.error('Failed to process payment. Please try again.');
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="h-8 w-8 text-orange-500" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Upgrade Your Plan</h2>
              <p className="text-gray-600">You've reached your report limit. Choose a plan to continue.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Usage Alert */}
        <div className="bg-orange-50 border-l-4 border-orange-400 p-4 mx-6 mt-4">
          <div className="flex">
            <AlertTriangle className="h-5 w-5 text-orange-400 mt-0.5" />
            <div className="ml-3">
              <p className="text-sm text-orange-700">
                <strong>Report Limit Reached:</strong> You've used {currentUsage}/10 reports in your trial plan. 
                To continue uploading and downloading reports, please upgrade to a paid plan.
              </p>
            </div>
          </div>
        </div>

        {/* Plans */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {subscriptionPlans.map((plan) => (
              <div
                key={plan.id}
                className={`relative border-2 rounded-lg p-6 cursor-pointer transition-all ${
                  selectedPlan?.id === plan.id
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                } ${plan.popular ? 'ring-2 ring-yellow-400' : ''}`}
                onClick={() => setSelectedPlan(plan)}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-yellow-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="flex items-center space-x-3 mb-4">
                  {plan.icon}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{plan.name}</h3>
                    <div className="flex items-baseline space-x-1">
                      <span className="text-3xl font-bold text-gray-900">₹{plan.price}</span>
                      {plan.originalPrice && (
                        <span className="text-lg text-gray-400 line-through">₹{plan.originalPrice}</span>
                      )}
                      {plan.savings && (
                        <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded-full">
                          {plan.savings}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <p className="text-2xl font-bold text-primary-600 mb-2">
                    {plan.reports} Reports
                  </p>
                  <p className="text-gray-600 text-sm">one-time purchase</p>
                </div>

                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center space-x-2">
                      <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className="flex items-center justify-center">
                  {selectedPlan?.id === plan.id ? (
                    <div className="w-full bg-primary-600 text-white py-2 px-4 rounded-md text-center font-medium">
                      Selected
                    </div>
                  ) : (
                    <div className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-md text-center font-medium hover:bg-gray-200 transition-colors">
                      Select Plan
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-600">
            <p>• Secure payment via Razorpay</p>
            <p>• Reports added instantly after payment</p>
            <p>• 24/7 customer support</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              disabled={isProcessing}
            >
              Cancel
            </button>
            <button
              onClick={handleSubscribe}
              disabled={!selectedPlan || isProcessing}
              className={`px-6 py-2 rounded-md font-medium transition-colors ${
                selectedPlan && !isProcessing
                  ? 'bg-primary-600 text-white hover:bg-primary-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {isProcessing ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Processing...</span>
                </div>
              ) : (
                `Subscribe to ${selectedPlan?.name || 'Plan'}`
              )}
            </button>
          </div>
        </div>
      </div>
      
      {/* Payment Success Modal */}
      {showSuccessModal && (
        <PaymentSuccessModal
          isOpen={showSuccessModal}
          paymentData={successPaymentData}
          packageInfo={successPackageInfo}
          onClose={() => {
            setShowSuccessModal(false);
            setSuccessPaymentData(null);
            setSuccessPackageInfo(null);
            // Close the popup after success modal
            setTimeout(() => {
              onClose();
            }, 500);
          }}
          onDownloadInvoice={(paymentData) => {
            const invoiceData = {
              paymentId: paymentData.paymentId,
              orderId: paymentData.orderId,
              amount: paymentData.amount,
              packageName: paymentData.packageName || paymentData.planDetails?.name,
              reports: paymentData.reports || paymentData.planDetails?.reportsIncluded,
              date: new Date(paymentData.createdAt).toLocaleDateString(),
              time: new Date(paymentData.createdAt).toLocaleTimeString(),
              clinicInfo: clinicInfo
            };
        
            const invoiceContent = `
INVOICE - NeuroSense360
========================

Payment ID: ${invoiceData.paymentId}
Order ID: ${invoiceData.orderId}
Date: ${invoiceData.date} ${invoiceData.time}

Bill To:
Clinic: ${invoiceData.clinicInfo?.name || 'N/A'}
Email: ${invoiceData.clinicInfo?.email || 'N/A'}

Package Details:
Package: ${invoiceData.packageName}
Reports: ${invoiceData.reports}
Amount: ₹${invoiceData.amount?.toLocaleString()}

Payment Method: Razorpay
Status: Completed

Thank you for your business!

--- NeuroSense360 EEG Management Platform ---
            `;
        
            const dataBlob = new Blob([invoiceContent], { type: 'text/plain' });
            const url = URL.createObjectURL(dataBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `invoice-${invoiceData.paymentId}.txt`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            
            toast.success('Invoice downloaded successfully!');
          }}
        />
      )}
    </div>
  );
};

export default SubscriptionPopup;


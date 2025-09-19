import React, { useState } from 'react';
import { CreditCard, X, Zap } from 'lucide-react';
import toast from 'react-hot-toast';
import RazorpayService from '../../services/razorpayService';
import PaymentSuccessModal from './PaymentSuccessModal';

const SimpleRazorpayCheckout = ({ clinicInfo, onSuccess, onClose }) => {
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState('select');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successPaymentData, setSuccessPaymentData] = useState(null);
  const [successPackageInfo, setSuccessPackageInfo] = useState(null);

  // Enhanced close handler with cleanup
  const handleClose = () => {
    console.log('🔄 DASHBOARD: Closing payment modal - cleanup states');
    
    // Reset all states
    setIsProcessing(false);
    setStep('select');
    setSelectedPackage(null);
    setShowSuccessModal(false);
    setSuccessPaymentData(null);
    setSuccessPackageInfo(null);
    
    // Call parent close handler
    onClose?.();
  };

  // Handle success modal close
  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    setSuccessPaymentData(null);
    setSuccessPackageInfo(null);
    // Close the entire payment modal after success
    setTimeout(() => {
      handleClose();
    }, 500);
  };

  // Handle invoice download
  const handleDownloadInvoice = (paymentData) => {
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
  };

  // Debug log to confirm this component is being used
  console.log('✅ SIMPLE RAZORPAY CHECKOUT LOADED - NO MORE ERRORS!');
  console.log('🎯 Component loaded with props:', { clinicInfo, onSuccess, onClose });

  // Use real Razorpay packages
  const packages = RazorpayService.getReportPackages();

  const handlePackageSelect = (packageInfo) => {
    console.log('📦 Package selected:', packageInfo);
    setSelectedPackage(packageInfo);
    setStep('confirm');
  };

  const handleSimplePayment = async () => {
    console.log('💳 DASHBOARD: Starting real Razorpay payment');
    console.log('📋 Package:', selectedPackage);
    console.log('🏥 Clinic:', clinicInfo);

    if (!selectedPackage) {
      toast.error('Please select a package');
      return;
    }

    // Validation
    if (!clinicInfo?.id) {
      toast.error('Clinic information missing. Please refresh and try again.');
      console.error('❌ DASHBOARD: Missing clinic ID');
      return;
    }

    try {
      setIsProcessing(true);
      setStep('processing');

      // Add timeout to prevent infinite loading
      const paymentTimeout = setTimeout(() => {
        console.log('⏰ DASHBOARD: Payment timeout - resetting state');
        setIsProcessing(false);
        setStep('confirm');
        toast.error('Payment timeout. Please try again.');
      }, 30000); // 30 seconds timeout

      // Create order data for Razorpay
      const orderData = {
        clinicId: clinicInfo.id,
        packageInfo: selectedPackage,
        clinicInfo: clinicInfo
      };

      console.log('🔄 DASHBOARD: Creating order with data:', orderData);

      // Create Razorpay order
      const order = await RazorpayService.createOrder(orderData);
      console.log('✅ DASHBOARD: Razorpay order created:', order.id);

      // Process payment with real Razorpay
      RazorpayService.processPayment(
        order,
        clinicInfo,
        async (paymentData, packageInfo) => {
          console.log('✅ DASHBOARD: Payment successful:', paymentData);
          
          clearTimeout(paymentTimeout); // Clear timeout on success
          setIsProcessing(false);
          
          // Store payment data for success modal
          setSuccessPaymentData(paymentData);
          setSuccessPackageInfo(packageInfo);
          setShowSuccessModal(true);
          
          // Call parent success callback
          onSuccess?.(paymentData, packageInfo);
        },
        (error) => {
          console.error('❌ DASHBOARD: Payment failed:', error);
          
          clearTimeout(paymentTimeout); // Clear timeout on failure
          setIsProcessing(false);
          setStep('confirm'); // Go back to confirm step
          toast.error(`Payment failed: ${error.message || 'Please try again.'}`);
        }
      );
      
    } catch (error) {
      console.error('❌ DASHBOARD: Payment error:', error);
      setIsProcessing(false);
      setStep('confirm'); // Go back to confirm step
      
      // Show user-friendly error message
      if (error.message.includes('not configured')) {
        toast.error('Payment system not configured. Please contact support.');
      } else if (error.message.includes('Invalid payment request')) {
        toast.error('Invalid payment request. Please try again.');
      } else {
        toast.error(`Payment failed: ${error.message || 'Please try again.'}`);
      }
    }
  };

  if (step === 'processing') {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl p-8 text-center max-w-md w-full">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold mb-2">Opening Payment Gateway</h2>
          <p className="text-gray-600 mb-6">Please complete payment in the Razorpay window...</p>
          
          {/* Cancel button */}
          <button
            onClick={() => {
              console.log('🔄 DASHBOARD: User cancelled payment from loader');
              setIsProcessing(false);
              setStep('confirm');
              toast.info('Payment cancelled');
            }}
            className="w-full bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-lg transition-colors"
          >
            Cancel Payment
          </button>
          
          {/* Auto-cancel timer display */}
          <p className="text-xs text-gray-500 mt-3">
            Payment will auto-cancel in 30 seconds if not completed
          </p>
        </div>
      </div>
    );
  }

  if (step === 'confirm') {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl max-w-lg w-full p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-xl font-semibold">Confirm Purchase</h1>
            <button onClick={handleClose} className="text-gray-400 hover:text-gray-600">
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-lg">{selectedPackage.name}</h3>
            <p className="text-gray-600 text-sm mt-1">{selectedPackage.description}</p>
            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center text-blue-600">
                <Zap className="h-4 w-4 mr-1" />
                <span className="font-medium">{selectedPackage.reports} reports</span>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">₹{selectedPackage.price.toLocaleString()}</div>
                {selectedPackage.originalPrice && (
                  <div className="text-sm text-gray-500 line-through">
                    ₹{selectedPackage.originalPrice.toLocaleString()}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="border rounded-lg p-4 mb-6">
            <h4 className="font-medium mb-2">Billing Information</h4>
            <div className="text-sm space-y-1">
              <div>Clinic: {clinicInfo?.name || 'Clinic'}</div>
                              <div>Email: {clinicInfo?.email || 'clinic@example.com'}</div>
            </div>
          </div>

          <div className="flex space-x-4">
            <button
              onClick={() => setStep('select')}
              className="flex-1 py-3 px-4 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Back
            </button>
            <button
              onClick={handleSimplePayment}
              disabled={isProcessing}
              className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center"
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Pay ₹{selectedPackage.price.toLocaleString()}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-6 flex items-center justify-between">
          <h1 className="text-xl font-semibold">Choose Your Plan</h1>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {packages.map((pkg) => (
              <div
                key={pkg.id}
                className={`relative border rounded-xl p-6 cursor-pointer transition-all hover:shadow-lg ${
                  pkg.popular ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200 hover:border-blue-300'
                }`}
                onClick={() => handlePackageSelect(pkg)}
              >
                {pkg.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="text-center">
                  <h3 className="text-lg font-bold">{pkg.name}</h3>
                  <p className="text-sm text-gray-600 mt-2">{pkg.description}</p>
                  
                  <div className="mt-4">
                    <div className="text-3xl font-bold text-gray-900">
                      ₹{pkg.price.toLocaleString()}
                    </div>
                    {pkg.originalPrice && (
                      <div className="text-lg text-gray-500 line-through">
                        ₹{pkg.originalPrice.toLocaleString()}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-center mt-3 text-blue-600">
                    <Zap className="h-5 w-5 mr-2" />
                    <span className="font-semibold">{pkg.reports} EEG Reports</span>
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  {pkg.features.map((feature, index) => (
                    <div key={index} className="flex items-center text-sm">
                      <div className="h-4 w-4 text-green-500 mr-3">✓</div>
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                <button className={`w-full mt-6 py-3 rounded-lg font-medium transition-colors ${
                  pkg.popular
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                }`}>
                  Select {pkg.name}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Payment Success Modal */}
      {showSuccessModal && (
        <PaymentSuccessModal
          isOpen={showSuccessModal}
          paymentData={successPaymentData}
          packageInfo={successPackageInfo}
          onClose={handleSuccessModalClose}
          onDownloadInvoice={handleDownloadInvoice}
        />
      )}
    </div>
  );
};

export default SimpleRazorpayCheckout;
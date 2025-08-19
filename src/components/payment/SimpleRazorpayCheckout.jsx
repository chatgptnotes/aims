import React, { useState } from 'react';
import { CreditCard, X, Zap } from 'lucide-react';
import toast from 'react-hot-toast';

const SimpleRazorpayCheckout = ({ clinicInfo, onSuccess, onClose }) => {
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState('select');

  // Debug log to confirm this component is being used
  console.log('✅ SIMPLE RAZORPAY CHECKOUT LOADED - NO MORE ERRORS!');
  console.log('🎯 Component loaded with props:', { clinicInfo, onSuccess, onClose });

  // Simple static packages
  const packages = [
    {
      id: 'trial_5',
      name: 'Trial Package',
      reports: 5,
      price: 299,
      originalPrice: 499,
      description: '5 EEG reports - Perfect for trying our service',
      savings: '40% OFF',
      features: ['5 EEG Report Analysis', '24/7 Support', 'PDF Download']
    },
    {
      id: 'basic_10',
      name: 'Basic Package',
      reports: 10,
      price: 999,
      originalPrice: 1499,
      description: '10 EEG reports - Great for small clinics',
      savings: '33% OFF',
      features: ['10 EEG Report Analysis', '24/7 Support', 'PDF Download', 'Email Support']
    },
    {
      id: 'standard_25',
      name: 'Standard Package',
      reports: 25,
      price: 1999,
      originalPrice: 2999,
      description: '25 EEG reports - Most popular choice',
      popular: true,
      savings: '33% OFF',
      features: ['25 EEG Report Analysis', '24/7 Support', 'PDF Download', 'Priority Support']
    }
  ];

  const handlePackageSelect = (packageInfo) => {
    console.log('📦 Package selected:', packageInfo);
    setSelectedPackage(packageInfo);
    setStep('confirm');
  };

  const handleSimplePayment = () => {
    console.log('💳 ULTRA SIMPLE PAYMENT - START');
    console.log('📋 Package:', selectedPackage);
    console.log('🏥 Clinic:', clinicInfo);

    if (!selectedPackage) {
      toast.error('Please select a package');
      return;
    }

    setIsProcessing(true);
    setStep('processing');

    // Super simple demo payment
    toast.loading('Processing demo payment...', { duration: 2000 });

    setTimeout(() => {
      const confirmed = confirm(
        `🎯 DEMO PAYMENT\n\n` +
        `Package: ${selectedPackage.name}\n` +
        `Price: ₹${selectedPackage.price}\n` +
        `Reports: ${selectedPackage.reports}\n` +
        `Clinic: ${clinicInfo?.name || 'Demo Clinic'}\n\n` +
        `✅ Click OK for Success\n` +
        `❌ Click Cancel to Cancel`
      );

      if (confirmed) {
        // Success simulation
        console.log('🎉 DEMO PAYMENT SUCCESS');
        
        const mockPaymentData = {
          paymentId: 'demo_pay_' + Date.now(),
          orderId: 'demo_order_' + Date.now(),
          amount: selectedPackage.price,
          status: 'success',
          clinicId: clinicInfo?.id || 'demo-clinic',
          packageId: selectedPackage.id,
          packageName: selectedPackage.name,
          createdAt: new Date().toISOString()
        };

        setIsProcessing(false);
        toast.success('🎉 Payment successful! Demo mode activated.');
        console.log('💾 Mock payment data:', mockPaymentData);
        
        // Call parent success handler
        setTimeout(() => {
          onSuccess?.(mockPaymentData, selectedPackage);
        }, 500);

      } else {
        // Cancel simulation
        console.log('❌ DEMO PAYMENT CANCELLED');
        setIsProcessing(false);
        setStep('confirm');
        toast.error('Payment cancelled');
      }
    }, 2500);
  };

  if (step === 'processing') {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold mb-2">Processing Demo Payment</h2>
          <p className="text-gray-600">Please wait for the confirmation dialog...</p>
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
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
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
              <div>Clinic: {clinicInfo?.name || 'Demo Clinic'}</div>
              <div>Email: {clinicInfo?.email || 'demo@clinic.com'}</div>
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
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
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
    </div>
  );
};

export default SimpleRazorpayCheckout;
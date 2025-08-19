import DatabaseService from './databaseService';
import toast from 'react-hot-toast';

// Razorpay configuration
const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_live_xhAJH2vAW4eXzu';
const RAZORPAY_SECRET = import.meta.env.VITE_RAZORPAY_SECRET || 'n5yZEg1JJByd2zdMWOKLpo5r';

class RazorpayService {
  constructor() {
    this.keyId = RAZORPAY_KEY_ID;
    this.secret = RAZORPAY_SECRET;
    // Check if we're in demo mode (no backend available)
    this.isDemoMode = true; // Always demo mode since no backend is implemented
    this.hasRealKeys = RAZORPAY_KEY_ID !== 'rzp_test_demo_key' && RAZORPAY_KEY_ID !== undefined && RAZORPAY_KEY_ID;
    
    if (this.hasRealKeys) {
      console.log('✅ Real Razorpay keys detected:', RAZORPAY_KEY_ID);
      console.warn('⚠️ Running in mock mode since no backend API is available');
    } else {
      console.warn('⚠️ Razorpay running in demo mode - configure real keys for production');
    }
    
    this.initializeRazorpay();
  }

  // Initialize Razorpay script
  initializeRazorpay() {
    return new Promise((resolve, reject) => {
      if (window.Razorpay) {
        console.log('✅ Razorpay script already loaded');
        resolve(window.Razorpay);
        return;
      }

      console.log('🔄 Loading Razorpay script...');
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => {
        console.log('✅ Razorpay script loaded successfully');
        if (window.Razorpay) {
          resolve(window.Razorpay);
        } else {
          console.error('❌ Razorpay script loaded but window.Razorpay is undefined');
          reject(new Error('Razorpay script loaded but not accessible'));
        }
      };
      script.onerror = (error) => {
        console.error('❌ Failed to load Razorpay script:', error);
        reject(new Error('Failed to load Razorpay script'));
      };
      document.head.appendChild(script);
    });
  }

  // Create payment order
  async createOrder(orderData) {
    try {
      console.log('🔄 createOrder called with:', orderData);
      const { clinicId, packageInfo, clinicInfo } = orderData;
      
      if (!clinicId || !packageInfo) {
        throw new Error('Missing required order data: clinicId or packageInfo');
      }
      
      // Generate unique order ID
      const orderId = 'order_' + Date.now();
      
      // Always use mock order for now since there's no backend
      // In production, you would implement a proper backend API
      console.log('🔧 Creating mock order since no backend is available');
      const order = this.createMockOrder(orderId, packageInfo, clinicId);
      console.log('✅ Mock order created:', order);
      return order;
    } catch (error) {
      console.error('❌ Error in createOrder:', error);
      throw error;
    }

    /* Commented out backend call - enable when backend is ready
    try {
      // In production, this would be a backend API call to create Razorpay order
      const response = await fetch('/api/razorpay/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: packageInfo.price * 100, // Razorpay uses paise
          currency: 'INR',
          receipt: orderId,
          notes: {
            clinicId,
            packageId: packageInfo.id,
            packageName: packageInfo.name
          }
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create order');
      }

      const order = await response.json();
      console.log('✅ Razorpay order created:', order.id);
      return order;
      
    } catch (error) {
      console.error('❌ Error creating Razorpay order:', error);
      throw error;
    }
    */
  }

  // Create mock order for demo
  createMockOrder(orderId, packageInfo, clinicId) {
    const order = {
      id: orderId,
      entity: 'order',
      amount: packageInfo.price * 100,
      amount_paid: 0,
      amount_due: packageInfo.price * 100,
      currency: 'INR',
      receipt: orderId,
      status: 'created',
      created_at: Math.floor(Date.now() / 1000),
      notes: {
        clinicId,
        packageId: packageInfo.id,
        packageName: packageInfo.name
      }
    };

    console.log('🔧 Mock Razorpay order created:', order.id);
    return order;
  }

  // Process payment - simplified synchronous version
  processPayment(order, clinicInfo, onSuccess, onFailure) {
    console.log('🚀 processPayment called');
    console.log('📋 Order:', order);
    console.log('🏥 Clinic info:', clinicInfo);
    
    // Basic validation
    if (!order) {
      console.error('❌ No order provided');
      onFailure?.(new Error('No order provided'));
      return;
    }
    
    if (!onSuccess) {
      console.error('❌ No success callback provided');
      return;
    }
    
    console.log('✅ Validation passed');
    
    try {
      console.log('🔄 Setting up payment options...');

      const options = {
        key: this.keyId,
        amount: order.amount,
        currency: order.currency || 'INR',
        name: 'NeuroSense360',
        description: `${order.notes?.packageName || 'Report Package'}`,
        image: '/favicon.ico',
        order_id: order.id,
        handler: (response) => {
          this.handlePaymentSuccess(response, order, onSuccess);
        },
        prefill: {
          name: clinicInfo?.name || '',
          email: clinicInfo?.email || '',
          contact: clinicInfo?.phone || ''
        },
        theme: {
          color: '#2563eb'
        },
        modal: {
          ondismiss: () => {
            console.log('Payment modal closed');
            onFailure?.(new Error('Payment cancelled by user'));
          }
        }
      };

      console.log('💳 Payment options created:', options);

      // Always use demo mode for now since we have live keys but no backend
      console.log('🎭 Using demo payment mode');
      this.showDemoPayment(options, order, onSuccess, onFailure);
      
    } catch (error) {
      console.error('❌ Error processing payment:', error);
      onFailure?.(error);
    }
  }

  // Demo payment simulation
  showDemoPayment(options, order, onSuccess, onFailure) {
    console.log('🎭 Starting demo payment with options:', options);
    
    // Show loading for demo
    toast.loading('Opening Razorpay checkout...', { duration: 2000 });
    
    setTimeout(() => {
      try {
        const userConfirmed = confirm(
          `Demo Razorpay Payment\n\n` +
          `Merchant: ${options.name}\n` +
          `Amount: ₹${options.amount / 100}\n` +
          `Description: ${options.description}\n\n` +
          `Click OK to simulate successful payment, Cancel to simulate failure.`
        );

        console.log('🎯 User confirmation result:', userConfirmed);

        if (userConfirmed) {
          // Simulate successful payment
          const mockResponse = {
            razorpay_payment_id: 'pay_demo_' + Date.now(),
            razorpay_order_id: order.id,
            razorpay_signature: 'demo_signature_' + Date.now()
          };
          console.log('✅ Simulating successful payment:', mockResponse);
          this.handlePaymentSuccess(mockResponse, order, onSuccess);
        } else {
          // Simulate payment failure
          const mockError = {
            error: {
              code: 'PAYMENT_CANCELLED',
              description: 'Payment cancelled by user (demo)',
              source: 'demo',
              step: 'payment_authentication',
              reason: 'user_cancelled'
            }
          };
          console.log('❌ Simulating payment failure:', mockError);
          this.handlePaymentFailure(mockError, onFailure);
        }
      } catch (error) {
        console.error('💥 Error in demo payment:', error);
        onFailure?.(error);
      }
    }, 2000);
  }

  // Handle successful payment
  handlePaymentSuccess(response, order, onSuccess) {
    console.log('✅ Payment successful:', response);

    try {
      // Verify payment (in production, this should be done on backend)
      const paymentData = {
        paymentId: response.razorpay_payment_id,
        orderId: response.razorpay_order_id,
        signature: response.razorpay_signature,
        amount: order.amount / 100,
        currency: order.currency || 'INR',
        status: 'captured',
        createdAt: new Date().toISOString(),
        clinicId: order.notes?.clinicId,
        packageId: order.notes?.packageId,
        packageName: order.notes?.packageName
      };

      // Update clinic subscription
      this.updateClinicSubscription(paymentData);

      // Store payment record
      this.storePaymentRecord(paymentData);

      toast.success('🎉 Payment successful! Reports have been added to your account.');
      
      // Find the package info for the callback
      const packageInfo = this.getReportPackages().find(pkg => pkg.id === paymentData.packageId);
      
      console.log('💳 Calling onSuccess callback with:', { paymentData, packageInfo });
      onSuccess?.(paymentData, packageInfo);

    } catch (error) {
      console.error('❌ Error handling payment success:', error);
      toast.error('Payment completed but failed to update account. Please contact support.');
    }
  }

  // Handle payment failure
  handlePaymentFailure(response, onFailure) {
    console.log('❌ Payment failed:', response);
    
    const errorMessage = response.error?.description || 'Payment failed';
    toast.error(`💳 ${errorMessage}`);
    
    onFailure?.(new Error(errorMessage));
  }

  // Update clinic subscription after successful payment
  updateClinicSubscription(paymentData) {
    const { clinicId, packageId, amount } = paymentData;
    
    // Get package details
    const packages = this.getReportPackages();
    const packageInfo = packages.find(pkg => pkg.id === packageId);
    
    if (!packageInfo) {
      throw new Error('Package not found');
    }

    // Update clinic's report allowance
    const clinic = DatabaseService.findById('clinics', clinicId);
    if (clinic) {
      const newAllowance = (clinic.reportsAllowed || 0) + packageInfo.reports;
      DatabaseService.update('clinics', clinicId, {
        reportsAllowed: newAllowance,
        subscriptionStatus: 'active',
        lastPaymentAt: new Date().toISOString()
      });

      console.log(`✅ Updated clinic ${clinic.name} - Added ${packageInfo.reports} reports`);
    }
  }

  // Store payment record
  storePaymentRecord(paymentData) {
    const paymentRecord = {
      ...paymentData,
      provider: 'razorpay',
      id: paymentData.paymentId
    };

    DatabaseService.add('payments', paymentRecord);
    
    // Also add to subscriptions for compatibility
    DatabaseService.add('subscriptions', {
      clinicId: paymentData.clinicId,
      amount: paymentData.amount,
      reportsAllowed: this.getReportPackages().find(p => p.id === paymentData.packageId)?.reports || 0,
      packageName: paymentData.packageName,
      paymentMethod: 'razorpay',
      paymentId: paymentData.paymentId,
      status: 'completed'
    });

    console.log('💾 Payment record stored:', paymentData.paymentId);
  }

  // Get available report packages (same as before but with INR pricing)
  getReportPackages() {
    return [
      {
        id: 'trial_5',
        name: 'Trial Package',
        reports: 5,
        price: 299,
        originalPrice: 499,
        description: '5 EEG reports - Perfect for trying our service',
        popular: false,
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
        popular: false,
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
        features: ['25 EEG Report Analysis', '24/7 Support', 'PDF Download', 'Priority Support', 'Bulk Upload']
      },
      {
        id: 'premium_50',
        name: 'Premium Package',
        reports: 50,
        price: 3499,
        originalPrice: 4999,
        description: '50 EEG reports - For growing practices',
        popular: false,
        savings: '30% OFF',
        features: ['50 EEG Report Analysis', '24/7 Support', 'PDF Download', 'Priority Support', 'Bulk Upload', 'API Access']
      },
      {
        id: 'enterprise_100',
        name: 'Enterprise Package',
        reports: 100,
        price: 5999,
        originalPrice: 8999,
        description: '100 EEG reports - For large hospitals',
        popular: false,
        savings: '33% OFF',
        features: ['100 EEG Report Analysis', '24/7 Support', 'PDF Download', 'Priority Support', 'Bulk Upload', 'API Access', 'Dedicated Account Manager']
      }
    ];
  }

  // Get payment history for a clinic
  getPaymentHistory(clinicId) {
    const payments = DatabaseService.findBy('payments', 'clinicId', clinicId);
    return payments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  // Get usage statistics
  getUsageStats(clinicId) {
    const clinic = DatabaseService.findById('clinics', clinicId);
    const payments = this.getPaymentHistory(clinicId);
    const totalSpent = payments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
    
    return {
      clinic,
      reportsUsed: clinic?.reportsUsed || 0,
      reportsAllowed: clinic?.reportsAllowed || 10,
      reportsRemaining: (clinic?.reportsAllowed || 10) - (clinic?.reportsUsed || 0),
      totalSpent,
      paymentHistory: payments
    };
  }

  // Format amount for display
  formatAmount(amount) {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  }

  // Check if clinic needs to purchase more reports
  shouldShowPaymentAlert(clinic) {
    if (!clinic) return false;
    const usagePercentage = (clinic.reportsUsed || 0) / (clinic.reportsAllowed || 10);
    return usagePercentage >= 0.8; // Show alert when 80% used
  }
}

export default new RazorpayService();
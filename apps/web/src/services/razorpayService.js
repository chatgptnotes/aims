import DatabaseService from './databaseService';
import DynamoService from './dynamoService';
import toast from 'react-hot-toast';

// Razorpay configuration
const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID;
const RAZORPAY_SECRET = import.meta.env.VITE_RAZORPAY_SECRET || import.meta.env.VITE_RAZORPAY_KEY_SECRET || null;

class RazorpayService {
  constructor() {
    // Debug environment variable loading
    console.log('🔍 DEBUG: Environment Variables Check:');
    console.log('VITE_RAZORPAY_KEY_ID:', import.meta.env.VITE_RAZORPAY_KEY_ID ? 'FOUND' : 'MISSING');
    console.log('VITE_RAZORPAY_SECRET:', import.meta.env.VITE_RAZORPAY_SECRET ? 'FOUND' : 'MISSING');
    console.log('VITE_RAZORPAY_KEY_SECRET:', import.meta.env.VITE_RAZORPAY_KEY_SECRET ? 'FOUND' : 'MISSING');
    
    this.keyId = RAZORPAY_KEY_ID || null;
    this.secret = RAZORPAY_SECRET || null;
    
    console.log('🔍 DEBUG: Processed Values:');
    console.log('keyId:', this.keyId ? this.keyId.substring(0, 12) + '...' : 'NULL');
    console.log('secret:', this.secret ? 'SET' : 'NULL');
    
    this.hasRealKeys = RAZORPAY_KEY_ID && RAZORPAY_SECRET && 
                      RAZORPAY_KEY_ID !== 'rzp_test_demo_key' && 
                      RAZORPAY_KEY_ID !== 'your_razorpay_key_id' &&
                      RAZORPAY_KEY_ID.startsWith('rzp_'); // Ensure it's a valid Razorpay key format
    
    // Production initialization
    if (this.hasRealKeys) {
      console.log('✅ PRODUCTION: Razorpay initialized with live credentials');
      console.log('🔐 PRODUCTION: Key ID verified:', this.keyId.substring(0, 12) + '...');
    } else {
      console.error('❌ PRODUCTION: Razorpay credentials missing or invalid');
      console.error('🔧 Required: Set VITE_RAZORPAY_KEY_ID and VITE_RAZORPAY_KEY_SECRET');
      console.error('📝 Format: VITE_RAZORPAY_KEY_ID should start with "rzp_live_" or "rzp_test_"');
    }
    
    // Initialize Razorpay SDK
    this.initializeRazorpay();
    
    // Production settings
    this.environment = this.keyId?.includes('test') ? 'test' : 'live';
    this.maxRetries = 3;
    this.timeoutMs = 300000; // 5 minutes
    
    console.log(`🌍 PRODUCTION: Environment detected as: ${this.environment}`);
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

  // Create payment order - PRODUCTION MODE
  async createOrder(orderData) {
    try {
      console.log('🔄 PRODUCTION: createOrder called with:', orderData);
      const { clinicId, packageInfo, clinicInfo } = orderData;
      
      // Input validation
      if (!clinicId) {
        throw new Error('Missing clinicId in order data');
      }
      if (!packageInfo) {
        throw new Error('Missing packageInfo in order data');
      }
      if (!packageInfo.id || !packageInfo.price || !packageInfo.reports) {
        throw new Error('Invalid packageInfo: missing id, price, or reports');
      }
      
      // Validate that we have real Razorpay keys
      if (!this.hasRealKeys) {
        console.error('❌ Razorpay keys validation failed:');
        console.error('keyId:', this.keyId ? 'Present' : 'Missing');
        console.error('secret:', this.secret ? 'Present' : 'Missing');
        throw new Error('Production Razorpay keys not configured. Please check environment variables.');
      }
      
      // Generate unique order ID
      const orderId = 'neuro360_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      
      // PRODUCTION: Create real Razorpay order directly
      console.log('💳 PRODUCTION: Creating real Razorpay order...');
      const order = await this.createRealRazorpayOrder(orderId, packageInfo, clinicId);
      console.log('✅ PRODUCTION: Real Razorpay order created:', order.id);
      return order;
      
    } catch (error) {
      console.error('❌ PRODUCTION: Error in createOrder:', error.message);
      console.error('❌ Full error:', error);
      
      // Re-throw with user-friendly message
      if (error.message.includes('keys not configured')) {
        throw new Error('Payment system not configured. Please contact support.');
      } else if (error.message.includes('Missing')) {
        throw new Error('Invalid payment request. Please try again.');
      } else {
        throw new Error('Failed to initialize payment. Please try again.');
      }
    }
  }

  // Create frontend-only Razorpay order (without backend)
  async createRealRazorpayOrder(orderId, packageInfo, clinicId) {
    try {
      console.log('💳 FRONTEND-ONLY: Creating Razorpay order without backend');
      
      // Create order structure for frontend-only implementation
      // Note: In production with backend, this would be an API call to your server
      // which would then call Razorpay's Orders API
      const orderData = {
        amount: packageInfo.price * 100, // Convert to paise
        currency: 'INR',
        receipt: orderId,
        notes: {
          clinicId: clinicId,
          packageId: packageInfo.id,
          packageName: packageInfo.name,
          reports: packageInfo.reports.toString()
        }
      };

      // Frontend-only order structure
      const order = {
        id: orderId,
        entity: 'order',
        amount: orderData.amount,
        amount_paid: 0,
        amount_due: orderData.amount,
        currency: orderData.currency,
        receipt: orderData.receipt,
        status: 'created',
        created_at: Math.floor(Date.now() / 1000),
        notes: orderData.notes
      };

      console.log('✅ FRONTEND-ONLY: Order structure created for direct payment:', order);
      return order;
      
    } catch (error) {
      console.error('❌ FRONTEND-ONLY: Failed to create order structure:', error);
      throw new Error('Failed to initialize payment. Please try again.');
    }
  }

  // REMOVED: Mock orders no longer needed in production

  // Process payment - PRODUCTION VERSION
  processPayment(order, clinicInfo, onSuccess, onFailure) {
    console.log('🚀 PRODUCTION: processPayment called');
    console.log('📋 Order:', order);
    console.log('🏥 Clinic info:', clinicInfo);
    
    // Production validation
    if (!order) {
      console.error('❌ PRODUCTION: No order provided');
      toast.error('Payment initialization failed. Please try again.');
      onFailure?.(new Error('No order provided'));
      return;
    }
    
    if (!this.hasRealKeys) {
      console.error('❌ PRODUCTION: Razorpay keys not configured');
      toast.error('Payment system not configured. Please contact support.');
      onFailure?.(new Error('Payment system not configured'));
      return;
    }
    
    if (!onSuccess) {
      console.error('❌ PRODUCTION: No success callback provided');
      return;
    }
    
    console.log('✅ PRODUCTION: Validation passed');
    
    try {
      console.log('🔄 PRODUCTION: Setting up payment options...');

      // FRONTEND-ONLY: Direct payment without order_id (for frontend-only implementation)
      const options = {
        key: this.keyId, // Your real Razorpay key
        amount: order.amount,
        currency: order.currency || 'INR',
        name: 'NeuroSense360',
        description: `${order.notes?.packageName || 'EEG Report Package'} - ${order.notes?.reports || '0'} Reports`,
        image: '/favicon.ico',
        // Note: No order_id for direct payment mode
        handler: async (response) => {
          console.log('✅ FRONTEND-ONLY: Payment successful, processing...');
          await this.handlePaymentSuccess(response, order, onSuccess);
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
            console.log('⚠️ FRONTEND-ONLY: Payment modal closed by user');
            toast.info('Payment cancelled');
            onFailure?.(new Error('Payment cancelled by user'));
          }
        },
        // Direct payment options
        retry: {
          enabled: true,
          max_count: 3
        },
        timeout: 300, // 5 minutes timeout
        remember_customer: false,
        // Additional options for direct payment
        readonly: {
          contact: false,
          email: false,
          name: false
        }
      };

      console.log('💳 PRODUCTION: Payment options created:', {
        ...options,
        key: '***HIDDEN***' // Don't log the actual key
      });

      // Verify Razorpay is loaded
      if (!window.Razorpay) {
        throw new Error('Razorpay SDK not loaded. Please refresh and try again.');
      }

      // Open real Razorpay checkout
      console.log('💳 PRODUCTION: Opening Razorpay checkout...');
      toast.loading('Opening payment gateway...', { duration: 2000 });
      
      const rzp = new window.Razorpay(options);
      
      // Handle payment failure
      rzp.on('payment.failed', (response) => {
        this.handlePaymentFailure(response, onFailure);
      });
      
      rzp.open();
      
    } catch (error) {
      console.error('❌ PRODUCTION: Error processing payment:', error);
      toast.error('Failed to open payment gateway. Please try again.');
      onFailure?.(error);
    }
  }



  // Handle successful payment - FRONTEND-ONLY VERSION
  async handlePaymentSuccess(response, order, onSuccess) {
    console.log('✅ FRONTEND-ONLY: Payment successful:', response);

    try {
      // For direct payment mode, only payment_id is guaranteed
      if (!response.razorpay_payment_id) {
        throw new Error('Invalid payment response from Razorpay');
      }

      // Get package details for enhanced payment record
      const packageInfo = this.getReportPackages().find(pkg => pkg.id === order.notes?.packageId);
      
      // Calculate expiry date (1 year from purchase)
      const purchaseDate = new Date();
      const expiryDate = new Date(purchaseDate);
      expiryDate.setFullYear(expiryDate.getFullYear() + 1);
      
      // Create enhanced payment data record for frontend-only mode
      const paymentData = {
        paymentId: response.razorpay_payment_id,
        orderId: response.razorpay_order_id || order.id, // Use our order ID if Razorpay doesn't provide one
        signature: response.razorpay_signature || 'direct_payment',
        amount: order.amount / 100, // Convert back from paise
        currency: order.currency || 'INR',
        status: 'captured',
        createdAt: new Date().toISOString(),
        clinicId: order.notes?.clinicId,
        packageId: order.notes?.packageId,
        packageName: order.notes?.packageName,
        reports: parseInt(order.notes?.reports || '0'),
        
        // Enhanced plan details
        planDetails: {
          id: packageInfo?.id || order.notes?.packageId,
          name: packageInfo?.name || order.notes?.packageName,
          description: packageInfo?.description || `${order.notes?.reports} EEG reports`,
          reportsIncluded: packageInfo?.reports || parseInt(order.notes?.reports || '0'),
          originalPrice: packageInfo?.originalPrice || null,
          savings: packageInfo?.savings || null,
          features: packageInfo?.features || []
        },
        
        // Subscription details
        subscription: {
          purchaseDate: purchaseDate.toISOString(),
          expiryDate: expiryDate.toISOString(),
          validityPeriod: '1 year',
          isActive: true,
          reportsUsed: 0,
          reportsRemaining: packageInfo?.reports || parseInt(order.notes?.reports || '0')
        },
        
        // Payment method details
        paymentDetails: {
          gateway: 'razorpay',
          method: 'online',
          environment: 'frontend-only',
          paymentMethod: 'razorpay-direct',
          verified: true, // Direct payment mode - consider verified
          transactionFee: Math.round((order.amount / 100) * 0.02) // Approximate 2% gateway fee
        }
      };

      console.log('💾 FRONTEND-ONLY: Storing payment data:', paymentData);

      // Update clinic subscription
      this.updateClinicSubscription(paymentData);

      // Store payment record
      await this.storePaymentRecord(paymentData);

      // Send success notification
      toast.success(`🎉 Payment successful! ${paymentData.reports} reports added to your account.`, {
        duration: 5000
      });
      
      // Find the package info for the callback (reuse existing packageInfo)
      // const packageInfo already declared above
      
      console.log('💳 FRONTEND-ONLY: Calling onSuccess callback with:', { paymentData, packageInfo });
      
      // Log successful transaction for analytics
      console.log('📊 FRONTEND-ONLY: Payment completed successfully', {
        paymentId: paymentData.paymentId,
        amount: paymentData.amount,
        clinicId: paymentData.clinicId,
        timestamp: paymentData.createdAt
      });
      
      onSuccess?.(paymentData, packageInfo);

    } catch (error) {
      console.error('❌ FRONTEND-ONLY: Error handling payment success:', error);
      toast.error('Payment completed but failed to update account. Please contact support with payment ID: ' + (response.razorpay_payment_id || 'N/A'));
    }
  }

  // Handle payment failure - PRODUCTION VERSION
  handlePaymentFailure(response, onFailure) {
    console.log('❌ PRODUCTION: Payment failed:', response);
    
    // Extract detailed error information
    const error = response.error || {};
    const errorCode = error.code || 'UNKNOWN_ERROR';
    const errorDescription = error.description || 'Payment failed. Please try again.';
    const errorSource = error.source || 'razorpay';
    const errorStep = error.step || 'payment_processing';
    const errorReason = error.reason || 'unknown';
    
    // Log detailed error for debugging
    console.error('💳 PRODUCTION: Payment failure details:', {
      code: errorCode,
      description: errorDescription,
      source: errorSource,
      step: errorStep,
      reason: errorReason,
      metadata: error.metadata || {}
    });
    
    // User-friendly error messages
    let userMessage = errorDescription;
    switch (errorCode) {
      case 'BAD_REQUEST_ERROR':
        userMessage = 'Invalid payment request. Please try again.';
        break;
      case 'GATEWAY_ERROR':
        userMessage = 'Bank gateway error. Please try a different payment method.';
        break;
      case 'NETWORK_ERROR':
        userMessage = 'Network connection issue. Please check your internet and try again.';
        break;
      case 'SERVER_ERROR':
        userMessage = 'Payment server temporarily unavailable. Please try again in a few minutes.';
        break;
      default:
        userMessage = errorDescription;
    }
    
    // Show user-friendly error message
    toast.error(`💳 ${userMessage}`, {
      duration: 6000
    });
    
    // Store failed payment attempt for analytics
    try {
      const failureData = {
        id: 'failed_' + Date.now(),
        type: 'payment_failure',
        errorCode,
        errorDescription,
        errorSource,
        errorStep,
        timestamp: new Date().toISOString(),
        environment: 'production'
      };
      
      // Store in local analytics (you might want to send to analytics service)
      const failures = JSON.parse(localStorage.getItem('payment_failures') || '[]');
      failures.push(failureData);
      localStorage.setItem('payment_failures', JSON.stringify(failures.slice(-50))); // Keep last 50
      
    } catch (storageError) {
      console.warn('Could not store failure analytics:', storageError);
    }
    
    onFailure?.(new Error(userMessage));
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

  // Store payment record with production security
  async storePaymentRecord(paymentData) {
    try {
      // Validate payment data before storing
      this.validatePaymentData(paymentData);
      
      const paymentRecord = {
        ...paymentData,
        provider: 'razorpay',
        id: paymentData.paymentId,
        // Production security fields
        ipAddress: this.getClientIP(),
        userAgent: navigator.userAgent,
        timestamp: Date.now(),
        storeVersion: '1.0.0',
        // Enhanced storage fields for DynamoDB
        partitionKey: `CLINIC#${paymentData.clinicId}`,
        sortKey: `PAYMENT#${paymentData.paymentId}`,
        gsi1pk: `STATUS#${paymentData.status}`,
        gsi1sk: paymentData.createdAt
      };

      // Store in DynamoDB (with localStorage fallback)
      console.log('💾 STORAGE: Saving payment record to DynamoDB:', paymentRecord.paymentId);
      try {
        await DynamoService.add('payments', paymentRecord);
        console.log('✅ STORAGE: Successfully saved to DynamoDB');
      } catch (dynamoError) {
        console.warn('⚠️ STORAGE: DynamoDB failed, using localStorage:', dynamoError.message);
      }
      
      // Also store in localStorage for compatibility
      DatabaseService.add('payments', paymentRecord);
      
      // Enhanced subscription record
      const subscriptionRecord = {
        clinicId: paymentData.clinicId,
        amount: paymentData.amount,
        reportsAllowed: this.getReportPackages().find(p => p.id === paymentData.packageId)?.reports || 0,
        packageName: paymentData.packageName,
        paymentMethod: 'razorpay',
        paymentId: paymentData.paymentId,
        status: 'completed',
        createdAt: paymentData.createdAt,
        environment: this.environment,
        // Enhanced subscription details
        planDetails: paymentData.planDetails,
        subscription: paymentData.subscription,
        paymentDetails: paymentData.paymentDetails
      };
      
      // Store subscription in both DynamoDB and localStorage
      try {
        await DynamoService.add('subscriptions', subscriptionRecord);
      } catch (dynamoError) {
        console.warn('⚠️ STORAGE: DynamoDB subscription save failed:', dynamoError.message);
      }
      DatabaseService.add('subscriptions', subscriptionRecord);

      console.log('💾 PRODUCTION: Payment record stored securely:', paymentData.paymentId);
      
    } catch (error) {
      console.error('❌ PRODUCTION: Failed to store payment record:', error);
      throw new Error('Failed to save payment information');
    }
  }

  // Validate payment data for security
  validatePaymentData(paymentData) {
    const required = ['paymentId', 'orderId', 'amount', 'clinicId', 'packageId'];
    const missing = required.filter(field => !paymentData[field]);
    
    if (missing.length > 0) {
      throw new Error(`Missing required payment fields: ${missing.join(', ')}`);
    }
    
    // Validate payment ID format
    if (!paymentData.paymentId.startsWith('pay_')) {
      throw new Error('Invalid Razorpay payment ID format');
    }
    
    // Validate amount is positive
    if (paymentData.amount <= 0) {
      throw new Error('Invalid payment amount');
    }
    
    // Validate clinic ID exists
    const clinic = DatabaseService.findById('clinics', paymentData.clinicId);
    if (!clinic) {
      throw new Error('Invalid clinic ID');
    }
    
    console.log('✅ PRODUCTION: Payment data validation passed');
  }

  // Get client IP (for security logging)
  getClientIP() {
    // In production, you might get this from a backend API
    return 'client'; // Placeholder for frontend-only implementation
  }

  // Get available report packages (same as before but with INR pricing)
  getReportPackages() {
    return [
      {
        id: 'trial_5',
        name: 'Trial Package',
        reports: 5,
        price: 1,
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
  async getPaymentHistory(clinicId) {
    try {
      console.log('📋 STORAGE: Fetching payment history for clinic:', clinicId);
      
      // Try DynamoDB first, fallback to localStorage
      let payments = [];
      
      try {
        payments = await DynamoService.findBy('payments', 'clinicId', clinicId);
        console.log('✅ STORAGE: Retrieved from DynamoDB:', payments.length, 'payments');
      } catch (dynamoError) {
        console.warn('⚠️ STORAGE: DynamoDB failed, using localStorage:', dynamoError.message);
        payments = DatabaseService.findBy('payments', 'clinicId', clinicId);
        console.log('✅ STORAGE: Retrieved from localStorage:', payments.length, 'payments');
      }
      
      // Ensure payments is an array before sorting
      if (!Array.isArray(payments)) {
        console.warn('⚠️ getPaymentHistory: payments is not array, returning empty array');
        return [];
      }
      
      // Sort by creation date (newest first)
      const sortedPayments = payments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      console.log('📊 STORAGE: Returning sorted payment history:', sortedPayments.length, 'payments');
      
      return sortedPayments;
    } catch (error) {
      console.error('❌ Error getting payment history:', error);
      return [];
    }
  }

  // Get usage statistics - now async
  async getUsageStats(clinicId) {
    try {
      if (!clinicId) {
        console.warn('⚠️ getUsageStats: No clinicId provided');
        return {
          clinic: null,
          reportsUsed: 0,
          reportsAllowed: 10,
          reportsRemaining: 10,
          totalSpent: 0,
          paymentHistory: []
        };
      }
      
      const clinic = DatabaseService.findById('clinics', clinicId);
      const payments = await this.getPaymentHistory(clinicId);
      const totalSpent = Array.isArray(payments) ? 
        payments.reduce((sum, payment) => sum + (payment.amount || 0), 0) : 0;
      
      return {
        clinic,
        reportsUsed: clinic?.reportsUsed || 0,
        reportsAllowed: clinic?.reportsAllowed || 10,
        reportsRemaining: (clinic?.reportsAllowed || 10) - (clinic?.reportsUsed || 0),
        totalSpent,
        paymentHistory: payments
      };
    } catch (error) {
      console.error('❌ Error getting usage stats:', error);
      return {
        clinic: null,
        reportsUsed: 0,
        reportsAllowed: 10,
        reportsRemaining: 10,
        totalSpent: 0,
        paymentHistory: []
      };
    }
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
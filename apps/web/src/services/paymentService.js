// import { loadStripe } from '@stripe/stripe-js';
import DatabaseService from './databaseService';
import toast from 'react-hot-toast';

// Mock Stripe publishable key - replace with real key in production
// const STRIPE_PUBLISHABLE_KEY = 'pk_test_mock_key_replace_with_real';

class PaymentService {
  constructor() {
    this.stripe = null;
    this.initializeStripe();
  }

  async initializeStripe() {
    try {
      // In production, you would load the real Stripe instance
      // this.stripe = await loadStripe(STRIPE_PUBLISHABLE_KEY);
      
      // Mock Stripe instance for development
      this.stripe = {
        redirectToCheckout: this.mockRedirectToCheckout.bind(this),
        confirmCardPayment: this.mockConfirmCardPayment.bind(this)
      };
      console.log('Mock Stripe initialized for development');
    } catch (error) {
      console.error('Error initializing Stripe:', error);
    }
  }

  // Mock Stripe checkout redirect for development
  async mockRedirectToCheckout({ sessionId }) {
    // Simulate payment processing
    toast.loading('Redirecting to payment...', { duration: 2000 });
    
    setTimeout(() => {
      // Simulate successful payment
      this.handleSuccessfulPayment(sessionId);
    }, 2000);
  }

  // Mock card payment confirmation for development
  async mockConfirmCardPayment() {
    // Simulate payment confirmation
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          paymentIntent: {
            status: 'succeeded',
            id: 'pi_mock_' + Date.now()
          }
        });
      }, 1000);
    });
  }

  // Handle successful payment
  handleSuccessfulPayment(sessionId) {
    const sessionData = this.getSessionData(sessionId);
    if (sessionData) {
      this.updateClinicSubscription(sessionData);
      toast.success('Payment successful! Reports have been added to your account.');
    }
  }

  // Create checkout session for report purchase
  createCheckoutSession(clinicId, reportPackage) {
    // In production, this would make an API call to your backend
    // which would create a real Stripe checkout session
    
    const sessionId = 'cs_mock_' + Date.now();
    const sessionData = {
      sessionId,
      clinicId,
      reportPackage,
      amount: reportPackage.price,
      createdAt: new Date().toISOString()
    };

    // Store session data for later reference
    this.storeSessionData(sessionId, sessionData);

    // For development, directly redirect to mock checkout
    this.stripe.redirectToCheckout({ sessionId });
    
    return sessionId;
  }

  // Store session data (in production, this would be on your backend)
  storeSessionData(sessionId, data) {
    let sessions = JSON.parse(localStorage.getItem('payment_sessions') || '{}');
    sessions[sessionId] = data;
    localStorage.setItem('payment_sessions', JSON.stringify(sessions));
  }

  // Get session data
  getSessionData(sessionId) {
    const sessions = JSON.parse(localStorage.getItem('payment_sessions') || '{}');
    return sessions[sessionId];
  }

  // Update clinic subscription after successful payment
  updateClinicSubscription(sessionData) {
    const { clinicId, reportPackage } = sessionData;
    
    // Update clinic's report allowance
    const clinic = DatabaseService.findById('clinics', clinicId);
    if (clinic) {
      const newAllowance = (clinic.reportsAllowed || 0) + reportPackage.reports;
      DatabaseService.update('clinics', clinicId, {
        reportsAllowed: newAllowance,
        subscriptionStatus: 'active'
      });

      // Record the subscription transaction
      DatabaseService.add('subscriptions', {
        clinicId,
        amount: reportPackage.price,
        reportsAllowed: reportPackage.reports,
        packageName: reportPackage.name,
        paymentMethod: 'stripe',
        paymentId: 'pi_mock_' + Date.now(),
        status: 'completed'
      });

      // Track the purchase activity
      DatabaseService.add('usage', {
        clinicId,
        action: 'reports_purchased',
        details: {
          package: reportPackage.name,
          reports: reportPackage.reports,
          amount: reportPackage.price
        },
        timestamp: new Date().toISOString()
      });
    }
  }

  // Get available report packages
  getReportPackages() {
    return [
      {
        id: 'basic_10',
        name: 'Basic Package',
        reports: 10,
        price: 99,
        description: '10 EEG reports',
        popular: false
      },
      {
        id: 'standard_25',
        name: 'Standard Package',
        reports: 25,
        price: 199,
        description: '25 EEG reports',
        popular: true,
        savings: '20% savings'
      },
      {
        id: 'premium_50',
        name: 'Premium Package',
        reports: 50,
        price: 299,
        description: '50 EEG reports',
        popular: false,
        savings: '40% savings'
      },
      {
        id: 'enterprise_100',
        name: 'Enterprise Package',
        reports: 100,
        price: 499,
        description: '100 EEG reports',
        popular: false,
        savings: '50% savings'
      }
    ];
  }

  // Get subscription history for a clinic
  getSubscriptionHistory(clinicId) {
    return DatabaseService.findBy('subscriptions', 'clinicId', clinicId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  // Check if clinic needs to purchase more reports
  shouldShowPaymentAlert(clinic) {
    const usagePercentage = (clinic.reportsUsed || 0) / (clinic.reportsAllowed || 10);
    return usagePercentage >= 0.8; // Show alert when 80% used
  }

  // Get usage statistics for billing
  getUsageStats(clinicId) {
    const clinic = DatabaseService.findById('clinics', clinicId);
    const subscriptions = this.getSubscriptionHistory(clinicId);
    const totalSpent = subscriptions.reduce((sum, sub) => sum + (sub.amount || 0), 0);
    const totalReportsPurchased = subscriptions.reduce((sum, sub) => sum + (sub.reportsAllowed || 0), 0);

    return {
      clinic,
      reportsUsed: clinic?.reportsUsed || 0,
      reportsAllowed: clinic?.reportsAllowed || 10,
      reportsRemaining: (clinic?.reportsAllowed || 10) - (clinic?.reportsUsed || 0),
      totalSpent,
      totalReportsPurchased,
      subscriptionHistory: subscriptions
    };
  }

  // Process refund (mock implementation)
  async processRefund(paymentId, amount, reason) {
    // In production, this would call Stripe's refund API
    console.log(`Mock refund: ${paymentId}, Amount: $${amount}, Reason: ${reason}`);
    
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          id: 're_mock_' + Date.now(),
          status: 'succeeded',
          amount: amount * 100, // Stripe uses cents
          reason
        });
      }, 1000);
    });
  }

  // Webhook handler for Stripe events (mock implementation)
  handleWebhook(event) {
    console.log('Mock webhook received:', event.type);
    
    switch (event.type) {
      case 'checkout.session.completed':
        this.handleSuccessfulPayment(event.data.object.id);
        break;
      case 'payment_intent.succeeded':
        console.log('Payment succeeded:', event.data.object.id);
        break;
      case 'payment_intent.payment_failed':
        console.log('Payment failed:', event.data.object.id);
        toast.error('Payment failed. Please try again.');
        break;
      default:
        console.log('Unhandled event type:', event.type);
    }
  }
}

export default new PaymentService();
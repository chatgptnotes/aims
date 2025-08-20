import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, Shield, CheckCircle, ArrowLeft, Mail } from 'lucide-react';

const ActivationPending = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 py-8 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-400/30 to-pink-400/30 rounded-full blur-3xl animate-float"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-indigo-400/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="auth-card animate-fade-in-up relative z-10 text-center">
        {/* Success Icon */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="w-24 h-24 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full flex items-center justify-center animate-pulse">
              <Clock className="w-12 h-12 text-white" />
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center animate-bounce">
              <Shield className="w-4 h-4 text-white" />
            </div>
          </div>
        </div>

        {/* Title */}
        <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-4">
          Account Activation Pending
        </h2>

        {/* Description */}
        <div className="space-y-4 mb-8">
          <p className="text-gray-600 text-lg font-medium">
            Your Super Administrator account has been submitted for review.
          </p>
          
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-left">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 bg-amber-100 rounded-full flex items-center justify-center mt-0.5">
                <Mail className="w-3 h-3 text-amber-600" />
              </div>
              <div>
                <h3 className="font-semibold text-amber-800 mb-2">What happens next?</h3>
                <ul className="space-y-2 text-sm text-amber-700">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                    Your registration has been recorded in our system
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                    An existing Super Administrator will review your request
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                    You'll receive an email once your account is activated
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <p className="text-sm text-blue-700">
              <strong>Note:</strong> Super Administrator accounts require manual approval for security reasons. 
              This process typically takes 24-48 hours during business days.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <Link
            to="/login"
            className="btn-primary w-full flex items-center justify-center gap-2 hover:scale-105 transform transition-all duration-200"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Login
          </Link>

          <p className="text-sm text-gray-500">
            Already activated? 
            <Link to="/login" className="text-blue-600 hover:text-blue-800 font-medium ml-1">
              Try logging in
            </Link>
          </p>
        </div>

        {/* Support Info */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            Need help? Contact support at{' '}
            <a href="mailto:support@neurosense360.com" className="text-blue-600 hover:text-blue-800">
              support@neurosense360.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ActivationPending;
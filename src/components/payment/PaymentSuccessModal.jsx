import React from 'react';
import { 
  CheckCircle, 
  Download, 
  FileText, 
  Calendar, 
  CreditCard,
  X
} from 'lucide-react';

const PaymentSuccessModal = ({ 
  isOpen = true,
  paymentData, 
  packageInfo, 
  onClose, 
  onDownloadInvoice 
}) => {
  if (!isOpen || !paymentData) return null;
  const handleDownloadInvoice = () => {
    if (onDownloadInvoice) {
      onDownloadInvoice(paymentData);
    } else {
      // Default invoice download
      const invoiceData = {
        paymentId: paymentData.paymentId,
        orderId: paymentData.orderId,
        amount: paymentData.amount,
        packageName: paymentData.packageName,
        reports: packageInfo?.reports || 0,
        date: new Date(paymentData.createdAt).toLocaleDateString(),
        timestamp: new Date(paymentData.createdAt).toLocaleString()
      };

      const invoiceContent = `
INVOICE - NeuroSense360
========================

Payment ID: ${invoiceData.paymentId}
Order ID: ${invoiceData.orderId}
Date: ${invoiceData.timestamp}

Package: ${invoiceData.packageName}
Reports: ${invoiceData.reports}
Amount: ₹${invoiceData.amount.toLocaleString()}

Payment Method: Razorpay
Status: Completed

Thank you for your business!
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
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full">
        {/* Success Animation */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-blue-500 opacity-10"></div>
          <div className="relative p-6 text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
            <p className="text-gray-600">
              Your payment has been processed successfully. EEG reports have been added to your account.
            </p>
          </div>
        </div>

        {/* Payment Details */}
        <div className="px-6 pb-6 space-y-6">
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Payment ID</span>
              <span className="text-sm font-medium text-gray-900 font-mono">
                {paymentData.paymentId}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Package</span>
              <span className="text-sm font-medium text-gray-900">
                {paymentData.packageName}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Reports Added</span>
              <span className="text-sm font-medium text-green-600">
                +{packageInfo?.reports || 'N/A'} reports
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Amount Paid</span>
              <span className="text-lg font-bold text-gray-900">
                ₹{paymentData.amount?.toLocaleString() || 'N/A'}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Date & Time</span>
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900">
                  {new Date(paymentData.createdAt).toLocaleDateString()}
                </div>
                <div className="text-xs text-gray-500">
                  {new Date(paymentData.createdAt).toLocaleTimeString()}
                </div>
              </div>
            </div>
          </div>

          {/* Success Highlights */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start">
              <FileText className="h-5 w-5 text-green-500 mt-0.5 mr-3" />
              <div>
                <h4 className="text-sm font-medium text-green-800">Reports Activated</h4>
                <p className="text-sm text-green-700 mt-1">
                  Your new EEG reports are now available in your dashboard. 
                  You can start uploading and analyzing patient data immediately.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button
              onClick={handleDownloadInvoice}
              className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center"
            >
              <Download className="h-4 w-4 mr-2" />
              Download Invoice
            </button>
            <button
              onClick={onClose}
              className="flex-1 py-2 px-4 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Continue
            </button>
          </div>

          {/* Footer Message */}
          <div className="text-center">
            <p className="text-xs text-gray-500">
              A confirmation email has been sent to your registered email address.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccessModal;
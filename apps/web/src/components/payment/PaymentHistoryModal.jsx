import React from 'react';
import { X, Calendar, CreditCard, FileText, Clock, CheckCircle, Download, Package, IndianRupee, Printer } from 'lucide-react';
import toast from 'react-hot-toast';

const PaymentHistoryModal = ({ isOpen, payment, onClose }) => {
  if (!isOpen || !payment) return null;

  const packageInfo = payment.planDetails || {};
  const subscriptionInfo = payment.subscription || {};
  const paymentDetails = payment.paymentDetails || {};
  
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('en-IN'),
      time: date.toLocaleTimeString('en-IN', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      })
    };
  };

  const purchaseDate = formatDate(payment.createdAt);
  const expiryDate = subscriptionInfo.expiryDate ? formatDate(subscriptionInfo.expiryDate) : null;
  const isExpired = subscriptionInfo.expiryDate ? new Date(subscriptionInfo.expiryDate) < new Date() : false;
  const daysUntilExpiry = subscriptionInfo.expiryDate ? 
    Math.ceil((new Date(subscriptionInfo.expiryDate) - new Date()) / (1000 * 60 * 60 * 24)) : null;

  const generateInvoiceHTML = () => {
    const invoiceData = {
      invoiceNumber: `INV-${payment.paymentId.slice(-8).toUpperCase()}`,
      transactionId: payment.paymentId,
      orderId: payment.orderId,
      purchaseDate: purchaseDate.date + ' ' + purchaseDate.time,
      expiryDate: expiryDate ? expiryDate.date + ' ' + expiryDate.time : 'No expiry',
      packageName: packageInfo.name || payment.packageName,
      packageDescription: packageInfo.description || '',
      reportsIncluded: packageInfo.reportsIncluded || payment.reports,
      amount: payment.amount,
      originalPrice: packageInfo.originalPrice,
      savings: packageInfo.savings,
      status: payment.status,
      paymentMethod: paymentDetails.gateway || 'Razorpay',
      environment: paymentDetails.environment || 'production',
      transactionFee: paymentDetails.transactionFee || Math.round((payment.amount || 0) * 0.02)
    };

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Invoice - ${invoiceData.invoiceNumber}</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #f8f9fa;
        }
        .invoice-container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            border-radius: 10px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }
        .invoice-header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        .company-logo {
            font-size: 28px;
            font-weight: bold;
            margin-bottom: 10px;
        }
        .invoice-title {
            font-size: 24px;
            margin-bottom: 5px;
        }
        .invoice-subtitle {
            opacity: 0.9;
        }
        .invoice-body {
            padding: 40px;
        }
        .invoice-details {
            display: flex;
            justify-content: space-between;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid #eee;
        }
        .detail-section {
            flex: 1;
        }
        .detail-section h3 {
            color: #333;
            margin-bottom: 10px;
            font-size: 16px;
        }
        .detail-row {
            margin-bottom: 8px;
            font-size: 14px;
        }
        .detail-label {
            color: #666;
            display: inline-block;
            width: 120px;
        }
        .detail-value {
            color: #333;
            font-weight: 500;
        }
        .package-section {
            background: #f8f9fa;
            border-radius: 8px;
            padding: 25px;
            margin: 30px 0;
        }
        .package-header {
            display: flex;
            justify-content: space-between;
            align-items: start;
            margin-bottom: 15px;
        }
        .package-name {
            font-size: 20px;
            font-weight: bold;
            color: #333;
        }
        .package-price {
            text-align: right;
        }
        .current-price {
            font-size: 24px;
            font-weight: bold;
            color: #2d3748;
        }
        .original-price {
            font-size: 14px;
            color: #999;
            text-decoration: line-through;
            margin-bottom: 5px;
        }
        .savings-badge {
            background: #48bb78;
            color: white;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: bold;
        }
        .package-description {
            color: #666;
            margin-bottom: 15px;
            line-height: 1.5;
        }
        .features-list {
            list-style: none;
            padding: 0;
        }
        .features-list li {
            padding: 5px 0;
            color: #555;
        }
        .features-list li:before {
            content: "✓";
            color: #48bb78;
            font-weight: bold;
            margin-right: 10px;
        }
        .payment-summary {
            border: 2px solid #e2e8f0;
            border-radius: 8px;
            padding: 20px;
            margin: 30px 0;
        }
        .summary-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
            padding: 8px 0;
        }
        .summary-row.total {
            border-top: 2px solid #e2e8f0;
            margin-top: 15px;
            padding-top: 15px;
            font-size: 18px;
            font-weight: bold;
            color: #2d3748;
        }
        .status-badge {
            display: inline-block;
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: bold;
            text-transform: uppercase;
        }
        .status-success {
            background: #c6f6d5;
            color: #2f855a;
        }
        .footer {
            text-align: center;
            padding: 30px;
            background: #f7fafc;
            color: #666;
            font-size: 14px;
            line-height: 1.6;
        }
        .qr-placeholder {
            width: 80px;
            height: 80px;
            background: #e2e8f0;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #a0aec0;
            font-size: 12px;
            text-align: center;
        }
        @media print {
            body {
                background-color: white;
                padding: 0;
            }
            .invoice-container {
                box-shadow: none;
                border-radius: 0;
            }
        }
    </style>
</head>
<body>
    <div class="invoice-container">
        <div class="invoice-header">
            <div class="company-logo">🧠 NeuroSense360</div>
            <div class="invoice-title">INVOICE</div>
            <div class="invoice-subtitle">EEG Management Platform</div>
        </div>
        
        <div class="invoice-body">
            <div class="invoice-details">
                <div class="detail-section">
                    <h3>📄 Invoice Details</h3>
                    <div class="detail-row">
                        <span class="detail-label">Invoice No:</span>
                        <span class="detail-value">${invoiceData.invoiceNumber}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Transaction ID:</span>
                        <span class="detail-value">${invoiceData.transactionId}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Order ID:</span>
                        <span class="detail-value">${invoiceData.orderId}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Issue Date:</span>
                        <span class="detail-value">${new Date().toLocaleDateString('en-IN')}</span>
                    </div>
                </div>
                
                <div class="detail-section">
                    <h3>🏥 Bill To</h3>
                    <div class="detail-row">
                        <span class="detail-label">Clinic:</span>
                        <span class="detail-value">Sai clinic</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Email:</span>
                        <span class="detail-value">sai@gmail.com</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Status:</span>
                        <span class="status-badge status-success">Paid</span>
                    </div>
                </div>
            </div>
            
            <div class="package-section">
                <div class="package-header">
                    <div>
                        <div class="package-name">${invoiceData.packageName}</div>
                        <div class="package-description">${invoiceData.packageDescription}</div>
                    </div>
                    <div class="package-price">
                        ${invoiceData.originalPrice && invoiceData.originalPrice !== invoiceData.amount ? 
                          `<div class="original-price">₹${invoiceData.originalPrice.toLocaleString()}</div>` : ''}
                        <div class="current-price">₹${invoiceData.amount?.toLocaleString()}</div>
                        ${invoiceData.savings ? `<div class="savings-badge">${invoiceData.savings}</div>` : ''}
                    </div>
                </div>
                
                <ul class="features-list">
                    <li>${invoiceData.reportsIncluded} EEG Report Analysis</li>
                    <li>24/7 Customer Support</li>
                    <li>PDF Download & Export</li>
                    <li>Email Support & Assistance</li>
                    <li>1 Year Validity Period</li>
                </ul>
            </div>
            
            <div class="payment-summary">
                <div class="summary-row">
                    <span>Package Amount:</span>
                    <span>₹${invoiceData.amount?.toLocaleString()}</span>
                </div>
                <div class="summary-row">
                    <span>Transaction Fee:</span>
                    <span>₹${invoiceData.transactionFee}</span>
                </div>
                ${invoiceData.originalPrice && invoiceData.originalPrice !== invoiceData.amount ? 
                  `<div class="summary-row">
                    <span>Discount Applied:</span>
                    <span style="color: #48bb78;">-₹${(invoiceData.originalPrice - invoiceData.amount).toLocaleString()}</span>
                  </div>` : ''}
                <div class="summary-row total">
                    <span>Total Amount Paid:</span>
                    <span>₹${invoiceData.amount?.toLocaleString()}</span>
                </div>
            </div>
            
            <div class="invoice-details">
                <div class="detail-section">
                    <h3>💳 Payment Information</h3>
                    <div class="detail-row">
                        <span class="detail-label">Payment Date:</span>
                        <span class="detail-value">${invoiceData.purchaseDate}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Payment Method:</span>
                        <span class="detail-value">${invoiceData.paymentMethod} • Online</span>
                    </div>
                </div>
                
                <div class="detail-section">
                    <h3>📅 Subscription Details</h3>
                    <div class="detail-row">
                        <span class="detail-label">Valid From:</span>
                        <span class="detail-value">${purchaseDate.date}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Valid Until:</span>
                        <span class="detail-value">${invoiceData.expiryDate}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Status:</span>
                        <span class="detail-value" style="color: ${isExpired ? '#e53e3e' : '#48bb78'};">\n                            ${isExpired ? 'Expired' : 'Active'}
                        </span>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="footer">
            <p><strong>Thank you for choosing NeuroSense360!</strong></p>
            <p>EEG Management Platform • Professional Healthcare Solutions</p>
            <p>This is a computer generated invoice and does not require physical signature.</p>
            <p><small>Generated on: ${new Date().toLocaleString('en-IN')} | Invoice: ${invoiceData.invoiceNumber}</small></p>
        </div>
    </div>
</body>
</html>
    `;
  };

  const downloadInvoice = () => {
    const htmlContent = generateInvoiceHTML();
    const dataBlob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `invoice-${payment.paymentId.slice(-8).toUpperCase()}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast.success('Professional invoice downloaded successfully!');
  };

  const printInvoice = () => {
    const htmlContent = generateInvoiceHTML();
    const printWindow = window.open('', '_blank');
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    
    // Wait for content to load then print
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 250);
    };
    
    toast.success('Invoice sent to printer!');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b p-6 flex items-center justify-between rounded-t-xl">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Transaction History</h2>
            <p className="text-sm text-gray-600">Complete payment and subscription details</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Transaction Overview */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
            <div className="flex items-center mb-3">
              <CheckCircle className="h-6 w-6 text-green-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Payment Successful</h3>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Transaction ID:</span>
                <div className="font-mono text-gray-900 bg-white px-2 py-1 rounded mt-1">
                  {payment.paymentId}
                </div>
              </div>
              <div>
                <span className="text-gray-600">Order ID:</span>
                <div className="font-mono text-gray-900 bg-white px-2 py-1 rounded mt-1">
                  {payment.orderId}
                </div>
              </div>
            </div>
          </div>

          {/* Package Details */}
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center mb-4">
              <Package className="h-5 w-5 text-blue-600 mr-2" />
              <h4 className="font-semibold text-gray-900">Package Details</h4>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <h5 className="font-medium text-gray-900">{packageInfo.name || payment.packageName}</h5>
                  <p className="text-sm text-gray-600 mt-1">
                    {packageInfo.description || `${packageInfo.reportsIncluded || payment.reports} EEG reports`}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-gray-900">
                    ₹{payment.amount?.toLocaleString()}
                  </div>
                  {packageInfo.originalPrice && packageInfo.originalPrice !== payment.amount && (
                    <div className="text-sm text-gray-500 line-through">
                      ₹{packageInfo.originalPrice.toLocaleString()}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                <div className="flex items-center">
                  <FileText className="h-4 w-4 text-blue-600 mr-1" />
                  <span className="text-sm font-medium">{packageInfo.reportsIncluded || payment.reports} Reports Included</span>
                </div>
                {packageInfo.savings && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {packageInfo.savings}
                  </span>
                )}
              </div>
              
              {packageInfo.features && packageInfo.features.length > 0 && (
                <div className="pt-2 border-t border-gray-100">
                  <div className="text-sm text-gray-600 mb-2">Features included:</div>
                  <div className="space-y-1">
                    {packageInfo.features.map((feature, index) => (
                      <div key={index} className="flex items-center text-sm text-gray-700">
                        <CheckCircle className="h-3 w-3 text-green-500 mr-2" />
                        {feature}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Payment Timeline */}
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center mb-4">
              <Calendar className="h-5 w-5 text-blue-600 mr-2" />
              <h4 className="font-semibold text-gray-900">Timeline & Status</h4>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-900">Purchase Date</div>
                  <div className="text-sm text-gray-600">
                    {purchaseDate.date} at {purchaseDate.time}
                  </div>
                </div>
                <div className="flex items-center text-green-600">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  <span className="text-sm font-medium">Completed</span>
                </div>
              </div>
              
              {expiryDate && (
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900">Expiry Date</div>
                    <div className="text-sm text-gray-600">
                      {expiryDate.date} at {expiryDate.time}
                    </div>
                  </div>
                  <div className={`flex items-center ${
                    isExpired ? 'text-red-600' : 
                    daysUntilExpiry <= 30 ? 'text-yellow-600' : 
                    'text-green-600'
                  }`}>
                    <Clock className="h-4 w-4 mr-1" />
                    <span className="text-sm font-medium">
                      {isExpired ? 'Expired' : 
                       daysUntilExpiry <= 0 ? 'Expires today' :
                       daysUntilExpiry === 1 ? 'Expires tomorrow' :
                       daysUntilExpiry <= 30 ? `${daysUntilExpiry} days left` :
                       'Active'}
                    </span>
                  </div>
                </div>
              )}
              
              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                <div>
                  <div className="font-medium text-gray-900">Validity Period</div>
                  <div className="text-sm text-gray-600">
                    {subscriptionInfo.validityPeriod || '1 year from purchase'}
                  </div>
                </div>
                <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  isExpired ? 'bg-red-100 text-red-800' :
                  daysUntilExpiry <= 30 ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {subscriptionInfo.isActive !== false ? 'Active' : 'Inactive'}
                </div>
              </div>
            </div>
          </div>

          {/* Payment Method Details */}
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center mb-4">
              <CreditCard className="h-5 w-5 text-blue-600 mr-2" />
              <h4 className="font-semibold text-gray-900">Payment Details</h4>
            </div>
            
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Payment Method:</span>
                <div className="font-medium text-gray-900 mt-1 capitalize">
                  {paymentDetails.gateway || 'Razorpay'} • {paymentDetails.method || 'Online'}
                </div>
              </div>
              <div>
                <span className="text-gray-600">Transaction Fee:</span>
                <div className="font-medium text-gray-900 mt-1">
                  ₹{paymentDetails.transactionFee || Math.round((payment.amount || 0) * 0.02)}
                </div>
              </div>
              <div>
                <span className="text-gray-600">Verification:</span>
                <div className="font-medium text-green-600 mt-1">
                  {paymentDetails.verified ? '✓ Verified' : 'Pending'}
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4 border-t border-gray-200">
            <button
              onClick={downloadInvoice}
              className="flex-1 flex items-center justify-center py-2.5 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Download className="h-4 w-4 mr-2" />
              Download Details
            </button>
            <button
              onClick={printInvoice}
              className="flex-1 flex items-center justify-center py-2.5 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Printer className="h-4 w-4 mr-2" />
              Print
            </button>
            <button
              onClick={onClose}
              className="flex-1 py-2.5 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentHistoryModal;
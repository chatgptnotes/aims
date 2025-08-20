import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Users, 
  FileText, 
  Calendar,
  MapPin,
  Mail,
  Phone,
  AlertTriangle,
  CheckCircle,
  X,
  Key,
  RefreshCw,
  Copy,
  CreditCard
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import DatabaseService from '../../services/databaseService';
import EmailService from '../../services/emailService';

const ClinicManagement = ({ onUpdate }) => {
  const [clinics, setClinics] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedClinic, setSelectedClinic] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'details'
  const [loading, setLoading] = useState(true);
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [isManualPassword, setIsManualPassword] = useState(false);
  const [otp, setOtp] = useState('');

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => {
    loadClinics();
    
    // Configure email service with error handling
    try {
      // EmailService.setProvider('emailjs', { publicKey: 'your_key_here' });
      // EmailService.setProvider('sendgrid', { apiKey: 'your_key_here' });
    } catch (error) {
      console.warn('Email service configuration failed:', error);
    }
  }, []);

  const loadClinics = async () => {
    try {
      console.log('👑 SuperAdmin loading all registered clinics...');
      
      // SuperAdmin can see ALL clinics
      const clinicsData = await DatabaseService.get('clinics');
      console.log('🏥 Found clinics:', clinicsData.length);
      
      // Sort by creation date (newest first)
      const sortedClinics = clinicsData.sort((a, b) => 
        new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
      );
      
      setClinics(sortedClinics);
    } catch (error) {
      console.error('❌ Error loading clinics:', error);
      toast.error('Error loading clinics: ' + error.message);
      // Set empty array to prevent further errors
      setClinics([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClinic = async (data) => {
    try {
      // Set reports limit based on subscription plan if not manually set
      let reportsAllowed = data.reportsAllowed || 10;
      if (data.subscriptionPlan && !data.reportsAllowed) {
        switch (data.subscriptionPlan) {
          case 'trial': reportsAllowed = 10; break;
          case 'basic': reportsAllowed = 50; break;
          case 'premium': reportsAllowed = 200; break;
          case 'enterprise': reportsAllowed = -1; break; // Unlimited
          default: reportsAllowed = 10;
        }
      }

      const clinicData = {
        ...data,
        contactPerson: data.contactPerson || data.name,
        subscriptionStatus: data.subscriptionPlan || 'trial',
        reportsAllowed: reportsAllowed,
        reportsUsed: 0,
        isActive: true,
        createdAt: new Date().toISOString(),
        // Remove confirmPassword from stored data
        confirmPassword: undefined
      };
      
      await DatabaseService.add('clinics', clinicData);
      toast.success(`Clinic created successfully with ${data.subscriptionPlan || 'trial'} plan`);
      loadClinics();
      setShowModal(false);
      reset();
      onUpdate?.();
    } catch (error) {
      toast.error('Error creating clinic');
      console.error(error);
    }
  };

  const handleEditClinic = async (data) => {
    try {
      await DatabaseService.update('clinics', selectedClinic.id, data);
      toast.success('Clinic updated successfully');
      loadClinics();
      setShowModal(false);
      setSelectedClinic(null);
      reset();
      onUpdate?.();
    } catch (error) {
      toast.error('Error updating clinic');
      console.error(error);
    }
  };

  const handleDeactivateClinic = async (clinicId) => {
    if (window.confirm('Are you sure you want to change the status of this clinic?')) {
      try {
        const clinic = await DatabaseService.findById('clinics', clinicId);
        await DatabaseService.update('clinics', clinicId, { 
          isActive: !clinic.isActive 
        });
        toast.success(`Clinic ${clinic.isActive ? 'deactivated' : 'activated'} successfully`);
        loadClinics();
        onUpdate?.();
      } catch (error) {
        toast.error('Error updating clinic status');
        console.error(error);
      }
    }
  };

  const handleDeleteClinic = async (clinicId) => {
    if (window.confirm('Are you sure you want to delete this clinic? This action cannot be undone.')) {
      try {
        await DatabaseService.delete('clinics', clinicId);
        toast.success('Clinic deleted successfully');
        loadClinics();
        onUpdate?.();
      } catch (error) {
        toast.error('Error deleting clinic');
        console.error(error);
      }
    }
  };

  const openModal = (clinic = null) => {
    setSelectedClinic(clinic);
    if (clinic) {
      reset(clinic);
    } else {
      reset({});
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedClinic(null);
    reset({});
  };

  const viewClinicDetails = (clinic) => {
    setSelectedClinic(clinic);
    setViewMode('details');
  };

  const generateRandomPassword = () => {
    const length = 8;
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%";
    let password = "";
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return password;
  };

  const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
  };

  const handlePasswordReset = async (clinic) => {
    setSelectedClinic(clinic);
    setNewPassword('');
    setIsManualPassword(false);
    setOtp('');
    setShowPasswordReset(true);
  };

  const generateNewPassword = () => {
    const password = generateRandomPassword();
    setNewPassword(password);
    setIsManualPassword(false);
  };

  const handleManualPassword = () => {
    setIsManualPassword(true);
    setNewPassword('');
  };

  const sendCredentialsEmail = async (clinic, password, otp) => {
    try {
      console.log(`Sending credentials email to ${clinic.email}...`);
      
      const result = await EmailService.sendClinicCredentials(clinic, password, otp);
      
      if (result.success) {
        console.log(`Email sent successfully via ${result.provider}`);
        return true;
      } else {
        throw new Error('Email service returned failure');
      }
    } catch (error) {
      console.error('Failed to send email:', error);
      // Even if email fails, we should log the credentials for admin
      console.log('=== EMAIL FAILED - MANUAL DELIVERY REQUIRED ===');
      console.log(`Clinic: ${clinic.name}`);
      console.log(`Email: ${clinic.email}`);
      console.log(`Username: ${clinic.email}`);
      console.log(`Password: ${password}`);
      console.log(`OTP: ${otp}`);
      console.log('==============================================');
      
      throw error;
    }
  };

  const confirmPasswordReset = async () => {
    if (!newPassword.trim()) {
      toast.error('Please enter a password');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    try {
      const otpCode = generateOTP();
      
      // Update clinic with new password and OTP
      await DatabaseService.update('clinics', selectedClinic.id, { 
        adminPassword: newPassword,
        passwordResetAt: new Date().toISOString(),
        activationOTP: otpCode,
        isActivated: false,
        otpExpiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString() // 15 minutes
      });

      // Try to send email with credentials and OTP
      try {
        console.log('Sending email with credentials:', {
          clinic: selectedClinic.name,
          email: selectedClinic.email,
          username: selectedClinic.email,
          password: newPassword,
          otp: otpCode
        });
        
        await sendCredentialsEmail(selectedClinic, newPassword, otpCode);
        toast.success('✅ Password set successfully! Credentials and activation OTP sent to clinic email.', {
          duration: 5000
        });
      } catch (emailError) {
        // Email failed, but password was set - show manual delivery option
        toast.error('⚠️ Password set but email failed. Please manually share credentials with clinic.', {
          duration: 8000
        });
        
        // Show credentials in a separate modal or alert for manual delivery
        const credentialsMessage = `
EMAIL DELIVERY FAILED - MANUAL DELIVERY REQUIRED:

Clinic: ${selectedClinic.name}
Email: ${selectedClinic.email}
Username: ${selectedClinic.email}
Password: ${newPassword}
OTP: ${otpCode}
Expires: 15 minutes

Please manually share these credentials with the clinic.`;
        
        // Show alert with credentials
        alert(credentialsMessage);
        
        // Also copy to clipboard for easy sharing
        try {
          if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(credentialsMessage);
            toast.success('📋 Credentials copied to clipboard for manual sharing');
          } else {
            // Fallback for non-secure context
            const textArea = document.createElement('textarea');
            textArea.value = credentialsMessage;
            textArea.style.position = 'fixed';
            textArea.style.left = '-999999px';
            textArea.style.top = '-999999px';
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            toast.success('📋 Credentials copied to clipboard (fallback)');
          }
        } catch (clipboardError) {
          console.warn('Could not copy to clipboard:', clipboardError);
          toast.info('📝 Please manually copy the credentials from the alert above');
        }
      }
      
      setShowPasswordReset(false);
      setNewPassword('');
      setSelectedClinic(null);
      setIsManualPassword(false);
      setOtp('');
      onUpdate?.();
    } catch (error) {
      toast.error('Error setting password');
      console.error(error);
    }
  };

  const copyPasswordToClipboard = async () => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(newPassword);
        toast.success('Password copied to clipboard!');
      } else {
        // Fallback for non-secure context
        const textArea = document.createElement('textarea');
        textArea.value = newPassword;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        toast.success('Password copied to clipboard!');
      }
    } catch (error) {
      console.warn('Could not copy to clipboard:', error);
      toast.info('📝 Please manually copy the password');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (viewMode === 'details' && selectedClinic) {
    return <ClinicDetails 
      clinic={selectedClinic} 
      onBack={() => {setViewMode('list'); setSelectedClinic(null);}} 
    />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Clinic Management</h2>
          <p className="text-gray-600">Manage registered clinics and their accounts</p>
        </div>
        <button
          onClick={() => openModal()}
          className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Add Clinic</span>
        </button>
      </div>

      {/* Clinics Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h3 className="text-lg font-medium text-gray-900">All Clinics ({clinics.length})</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Clinic
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usage
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {clinics.map((clinic) => (
                <tr key={clinic.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                        <Users className="h-5 w-5 text-primary-600" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{clinic.name}</div>
                        <div className="text-sm text-gray-500">{clinic.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{clinic.contactPerson || 'N/A'}</div>
                    <div className="text-sm text-gray-500">{clinic.phone || 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {clinic.reportsUsed || 0} / {clinic.reportsAllowed || 10}
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-primary-600 h-2 rounded-full"
                        style={{
                          width: `${Math.min(((clinic.reportsUsed || 0) / (clinic.reportsAllowed || 10)) * 100, 100)}%`
                        }}
                      ></div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col space-y-1">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        clinic.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {clinic.isActive ? (
                          <>
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Active
                          </>
                        ) : (
                          <>
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Inactive
                          </>
                        )}
                      </span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        clinic.isActivated
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {clinic.isActivated ? '✓ Activated' : '⏳ Pending OTP'}
                      </span>
                      <div className="text-xs text-gray-500">
                        {clinic.subscriptionStatus || 'trial'}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(clinic.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => viewClinicDetails(clinic)}
                        className="text-primary-600 hover:text-primary-900"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => window.location.href = `/admin?tab=reports&clinic=${clinic.id}`}
                        className="text-blue-600 hover:text-blue-900"
                        title="View Patients & Reports"
                      >
                        <Users className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => window.location.href = `/admin?tab=payments&clinic=${clinic.id}`}
                        className="text-green-600 hover:text-green-900"
                        title="View Payment History"
                      >
                        <CreditCard className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => openModal(clinic)}
                        className="text-gray-600 hover:text-gray-900"
                        title="Edit Clinic"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handlePasswordReset(clinic)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Reset Password"
                      >
                        <Key className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeactivateClinic(clinic.id)}
                        className={clinic.isActive ? "text-yellow-600 hover:text-yellow-900" : "text-green-600 hover:text-green-900"}
                        title={clinic.isActive ? "Deactivate" : "Activate"}
                      >
                        {clinic.isActive ? <AlertTriangle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                      </button>
                      <button
                        onClick={() => handleDeleteClinic(clinic.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete Clinic"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {clinics.length === 0 && (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">No clinics registered yet</p>
              <button
                onClick={() => openModal()}
                className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium"
              >
                Add First Clinic
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <ClinicModal
          clinic={selectedClinic}
          onSubmit={selectedClinic ? handleEditClinic : handleCreateClinic}
          onClose={closeModal}
          register={register}
          handleSubmit={handleSubmit}
          errors={errors}
        />
      )}

      {/* Password Reset Modal */}
      {showPasswordReset && (
        <PasswordResetModal
          clinic={selectedClinic}
          newPassword={newPassword}
          isManualPassword={isManualPassword}
          onConfirm={confirmPasswordReset}
          onClose={() => {
            setShowPasswordReset(false);
            setNewPassword('');
            setSelectedClinic(null);
            setIsManualPassword(false);
          }}
          onCopy={copyPasswordToClipboard}
          onGeneratePassword={generateNewPassword}
          onManualPassword={handleManualPassword}
          onPasswordChange={setNewPassword}
        />
      )}
    </div>
  );
};

// Clinic Modal Component  
const ClinicModal = ({ clinic, onSubmit, onClose, register, handleSubmit, errors }) => {
  const [selectedPlan, setSelectedPlan] = React.useState('trial');

  const getReportsLimitForPlan = (plan) => {
    switch (plan) {
      case 'trial': return 10;
      case 'basic': return 50;
      case 'premium': return 200;
      case 'enterprise': return 1000; // Show 1000 for unlimited UI
      default: return 10;
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-5 border max-w-md w-full shadow-lg rounded-md bg-white">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            {clinic ? 'Edit Clinic' : 'Add New Clinic'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Clinic Name *
            </label>
            <input
              type="text"
              {...register('name', { required: 'Clinic name is required' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email *
            </label>
            <input
              type="email"
              {...register('email', { 
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address'
                }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contact Person
            </label>
            <input
              type="text"
              {...register('contactPerson')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone
            </label>
            <input
              type="tel"
              {...register('phone')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address
            </label>
            <textarea
              {...register('address')}
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          {!clinic && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Admin Password *
                </label>
                <input
                  type="password"
                  {...register('adminPassword', { 
                    required: 'Admin password is required',
                    minLength: {
                      value: 6,
                      message: 'Password must be at least 6 characters'
                    }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                />
                {errors.adminPassword && <p className="text-red-500 text-xs mt-1">{errors.adminPassword.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password *
                </label>
                <input
                  type="password"
                  {...register('confirmPassword', { 
                    required: 'Password confirmation is required',
                    validate: (value, formValues) => 
                      value === formValues.adminPassword || 'Passwords do not match'
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                />
                {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subscription Plan
                </label>
                <select
                  {...register('subscriptionPlan')}
                  onChange={(e) => setSelectedPlan(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="trial">Trial (10 reports)</option>
                  <option value="basic">Basic (50 reports)</option>
                  <option value="premium">Premium (200 reports)</option>
                  <option value="enterprise">Enterprise (Unlimited)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reports Limit
                  {selectedPlan === 'enterprise' && (
                    <span className="text-xs text-gray-500 ml-1">(Unlimited)</span>
                  )}
                </label>
                <input
                  type="number"
                  {...register('reportsAllowed', { 
                    min: { value: 1, message: 'Minimum 1 report required' }
                  })}
                  defaultValue={getReportsLimitForPlan(selectedPlan)}
                  key={selectedPlan} // Force re-render when plan changes
                  disabled={selectedPlan === 'enterprise'}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-100"
                />
                {errors.reportsAllowed && <p className="text-red-500 text-xs mt-1">{errors.reportsAllowed.message}</p>}
              </div>
            </>
          )}

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-primary-700"
            >
              {clinic ? 'Update' : 'Create'} Clinic
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Clinic Details Component
const ClinicDetails = ({ clinic, onBack }) => {
  const [patients, setPatients] = useState([]);
  const [reports, setReports] = useState([]);
  const [usage, setUsage] = useState({});

  useEffect(() => {
    if (clinic) {
      const clinicPatients = DatabaseService.getPatientsByClinic(clinic.id);
      const clinicReports = DatabaseService.getReportsByClinic(clinic.id);
      const clinicUsage = DatabaseService.getClinicUsage(clinic.id);
      
      setPatients(clinicPatients);
      setReports(clinicReports);
      setUsage(clinicUsage);
    }
  }, [clinic]);

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <button
          onClick={onBack}
          className="text-primary-600 hover:text-primary-800 font-medium"
        >
          ← Back to Clinics
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="h-16 w-16 rounded-full bg-primary-100 flex items-center justify-center">
              <Users className="h-8 w-8 text-primary-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{clinic.name}</h2>
              <p className="text-gray-600">{clinic.email}</p>
            </div>
          </div>
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
            clinic.isActive
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}>
            {clinic.isActive ? 'Active' : 'Inactive'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Contact Information</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-gray-400" />
                <span className="text-sm text-gray-600">{clinic.email}</span>
              </div>
              {clinic.phone && (
                <div className="flex items-center space-x-3">
                  <Phone className="h-5 w-5 text-gray-400" />
                  <span className="text-sm text-gray-600">{clinic.phone}</span>
                </div>
              )}
              {clinic.address && (
                <div className="flex items-start space-x-3">
                  <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                  <span className="text-sm text-gray-600">{clinic.address}</span>
                </div>
              )}
              <div className="flex items-center space-x-3">
                <Calendar className="h-5 w-5 text-gray-400" />
                <span className="text-sm text-gray-600">
                  Joined {new Date(clinic.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Usage Statistics</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Reports Used:</span>
                <span className="font-semibold">{clinic.reportsUsed || 0} / {clinic.reportsAllowed || 10}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Patients:</span>
                <span className="font-semibold">{patients.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Reports:</span>
                <span className="font-semibold">{reports.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Subscription:</span>
                <span className="font-semibold capitalize">{clinic.subscriptionStatus || 'Trial'}</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
            <div className="space-y-2">
              <button className="w-full text-left px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-md text-sm">
                View All Patients
              </button>
              <button className="w-full text-left px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-md text-sm">
                View All Reports
              </button>
              <button className="w-full text-left px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-md text-sm">
                Manage Subscription
              </button>
              <button className="w-full text-left px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-md text-sm">
                Send Notification
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Password Reset Modal Component
const PasswordResetModal = ({ 
  clinic, 
  newPassword, 
  isManualPassword,
  onConfirm, 
  onClose, 
  onCopy,
  onGeneratePassword,
  onManualPassword,
  onPasswordChange
}) => {
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-6 border max-w-lg w-full shadow-lg rounded-md bg-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Key className="h-5 w-5 text-orange-500" />
            <h3 className="text-lg font-medium text-gray-900">Set Password & Send Credentials</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <div className="flex items-start space-x-3">
              <Mail className="h-5 w-5 text-blue-400 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-blue-800">
                  Email Notification for {clinic?.name}
                </h4>
                <p className="text-sm text-blue-700 mt-1">
                  Username, password, and activation OTP will be sent to: <strong>{clinic?.email}</strong>
                </p>
              </div>
            </div>
          </div>

          {/* Password Input Options */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              Choose Password Method:
            </label>
            
            <div className="flex space-x-3">
              <button
                onClick={onGeneratePassword}
                className={`flex-1 p-3 border rounded-md text-sm font-medium transition-colors ${
                  !isManualPassword 
                    ? 'border-primary-500 bg-primary-50 text-primary-700' 
                    : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                <RefreshCw className="h-4 w-4 mx-auto mb-1" />
                Generate Random
              </button>
              <button
                onClick={onManualPassword}
                className={`flex-1 p-3 border rounded-md text-sm font-medium transition-colors ${
                  isManualPassword 
                    ? 'border-primary-500 bg-primary-50 text-primary-700' 
                    : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Edit className="h-4 w-4 mx-auto mb-1" />
                Manual Entry
              </button>
            </div>
          </div>

          {/* Password Input Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {isManualPassword ? 'Enter Password:' : 'Generated Password:'}
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={newPassword}
                onChange={(e) => onPasswordChange(e.target.value)}
                readOnly={!isManualPassword}
                placeholder={isManualPassword ? "Enter password (min 6 characters)" : "Click 'Generate Random' to create password"}
                className={`flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${
                  !isManualPassword ? 'bg-gray-50 font-mono' : ''
                }`}
              />
              {!isManualPassword && newPassword && (
                <button
                  onClick={onCopy}
                  className="p-2 text-gray-500 hover:text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                  title="Copy to clipboard"
                >
                  <Copy className="h-4 w-4" />
                </button>
              )}
            </div>
            {isManualPassword && (
              <p className="text-xs text-gray-500 mt-1">
                Password must be at least 6 characters
              </p>
            )}
          </div>

          <div className="bg-green-50 border border-green-200 rounded-md p-3">
            <p className="text-sm text-green-700">
              <strong>What happens next:</strong>
              <br />• Username (email) and password will be sent to clinic
              <br />• 6-digit OTP will be sent for account activation
              <br />• Clinic must verify OTP to activate their account
              <br />• OTP expires in 15 minutes
            </p>
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={!newPassword.trim()}
            className="px-4 py-2 bg-green-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            <Mail className="h-4 w-4" />
            <span>Send Credentials & OTP</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClinicManagement;
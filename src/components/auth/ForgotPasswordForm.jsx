import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft, Loader2, CheckCircle, Lock } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import DatabaseService from '../../services/databaseService';
import SupabaseService from '../../services/supabaseService';

const ForgotPasswordForm = () => {
  const [emailSent, setEmailSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    getValues,
    watch,
  } = useForm();

  const onSubmit = async (data) => {
    try {
      setIsLoading(true);

      console.log('AUTH: Password reset request:', { email: data.email });

      const emailLower = data.email.trim().toLowerCase();

      // Step 1: Find user by email - check all user tables
      let userRecord = null;
      let userTable = null;

      // Check project area engineers (clinics table)
      const clinics = await DatabaseService.get('clinics') || [];
      const clinic = clinics.find(c => c.email === emailLower);

      if (clinic) {
        userRecord = clinic;
        userTable = 'clinics';
      }

      // Check supervisors (patients table)
      if (!userRecord) {
        const patients = await DatabaseService.get('patients') || [];
        const patient = patients.find(p => p.email === emailLower);
        if (patient) {
          userRecord = patient;
          userTable = 'patients';
        }
      }

      // Check super admins
      if (!userRecord) {
        const superAdmins = await DatabaseService.get('superAdmins') || [];
        const superAdmin = superAdmins.find(sa => sa.email === emailLower);
        if (superAdmin) {
          userRecord = superAdmin;
          userTable = 'superAdmins';
        }
      }

      if (!userRecord) {
        setError('root', { message: 'No account found with this email address' });
        setIsLoading(false);
        return;
      }

      console.log('SUCCESS: User found:', { email: userRecord.email, table: userTable, hasPassword: !!userRecord.password });

      // Step 2: Verify current password
      if (userRecord.password && data.currentPassword !== userRecord.password) {
        setError('root', { message: 'Current password is incorrect' });
        setIsLoading(false);
        return;
      }

      // Step 3: Validate new password
      if (data.newPassword.length < 6) {
        setError('root', { message: 'New password must be at least 6 characters long' });
        setIsLoading(false);
        return;
      }

      if (data.newPassword !== data.confirmPassword) {
        setError('root', { message: 'New passwords do not match' });
        setIsLoading(false);
        return;
      }

      if (data.newPassword === data.currentPassword) {
        setError('root', { message: 'New password must be different from current password' });
        setIsLoading(false);
        return;
      }

      // Step 4: Update Supabase Auth password FIRST
      const supabase = SupabaseService.supabase;
      if (supabase && SupabaseService.isAvailable()) {
        try {
          console.log('AUTH: Updating Supabase Auth password...');

          // First login with current credentials to get session
          const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
            email: emailLower,
            password: data.currentPassword
          });

          if (!loginError && loginData.session) {
            // Now update the password
            const { error: updateError } = await supabase.auth.updateUser({
              password: data.newPassword
            });

            if (updateError) {
              console.warn('WARNING: Supabase Auth password update failed:', updateError.message);
            } else {
              console.log('SUCCESS: Supabase Auth password updated successfully');
            }

            // Logout after updating
            await supabase.auth.signOut();
          } else {
            console.warn('WARNING: Could not login to Supabase to update password');
          }
        } catch (authError) {
          console.warn('WARNING: Supabase Auth update failed:', authError);
          // Continue to update local database anyway
        }
      }

      // Step 5: Update password in appropriate table
      console.log(`AUTH: Updating password in ${userTable} table...`);
      await DatabaseService.update(userTable, userRecord.id, { password: data.newPassword });
      console.log('SUCCESS: Password updated in database successfully');

      setEmailSent(true);
      setIsLoading(false);
    } catch (error) {
      console.error('ERROR: Password reset failed:', error);
      setError('root', { message: error.message || 'Failed to reset password' });
      setIsLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#E4EFFF] via-white to-[#CAE0FF] py-12 px-4 sm:px-6 lg:px-8">
        <div className="auth-card animate-fade-in text-center">
          <div className="mb-8">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Password Changed!</h2>
            <p className="text-gray-600">
              Your password for{' '}
              <span className="font-medium text-gray-900">{getValues('email')}</span>
              {' '}has been successfully updated.
            </p>
          </div>

          <div className="space-y-4">
            <p className="text-sm text-gray-500">
              You can now login with your new password.
            </p>

            <button
              onClick={() => navigate('/login')}
              className="w-full bg-[#323956] hover:bg-[#232D3C] text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200"
            >
              Go to Login
            </button>

            <button
              onClick={() => setEmailSent(false)}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-4 rounded-lg transition-all duration-200"
            >
              Change Another Password
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#E4EFFF] via-white to-[#CAE0FF] py-12 px-4 sm:px-6 lg:px-8">
      <div className="auth-card animate-fade-in">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Change Password</h2>
          <p className="text-gray-600">
            Enter your email and create a new password for your account.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {errors.root && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {errors.root.message}
            </div>
          )}

          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                id="email"
                type="email"
                className={`auth-input pl-11 ${errors.email ? 'border-red-500 focus:ring-red-500' : ''}`}
                placeholder="Enter your email address"
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address',
                  },
                })}
              />
            </div>
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>

          {/* Current Password Field */}
          <div>
            <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-2">
              Current Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                id="currentPassword"
                type="password"
                className={`auth-input pl-11 ${errors.currentPassword ? 'border-red-500 focus:ring-red-500' : ''}`}
                placeholder="Enter your current password"
                {...register('currentPassword', {
                  required: 'Current password is required',
                })}
              />
            </div>
            {errors.currentPassword && (
              <p className="mt-1 text-sm text-red-600">{errors.currentPassword.message}</p>
            )}
          </div>

          {/* New Password Field */}
          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
              New Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                id="newPassword"
                type="password"
                className={`auth-input pl-11 ${errors.newPassword ? 'border-red-500 focus:ring-red-500' : ''}`}
                placeholder="Enter new password (min 6 characters)"
                {...register('newPassword', {
                  required: 'New password is required',
                  minLength: {
                    value: 6,
                    message: 'Password must be at least 6 characters',
                  },
                })}
              />
            </div>
            {errors.newPassword && (
              <p className="mt-1 text-sm text-red-600">{errors.newPassword.message}</p>
            )}
          </div>

          {/* Confirm Password Field */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
              Confirm New Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                id="confirmPassword"
                type="password"
                className={`auth-input pl-11 ${errors.confirmPassword ? 'border-red-500 focus:ring-red-500' : ''}`}
                placeholder="Confirm your new password"
                {...register('confirmPassword', {
                  required: 'Please confirm your password',
                  validate: (value) =>
                    value === watch('newPassword') || 'Passwords do not match',
                })}
              />
            </div>
            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="auth-button"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Changing password...
              </>
            ) : (
              'Change Password'
            )}
          </button>
        </form>

        {/* Back to Login */}
        <div className="mt-8 text-center">
          <Link
            to="/login"
            className="inline-flex items-center text-sm text-[#323956] hover:text-[#232D3C] font-medium"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordForm;

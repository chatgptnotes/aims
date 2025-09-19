import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { User, Mail, Lock, Eye, EyeOff, Loader2, Shield, Building2, Heart } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const RegisterForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [userType, setUserType] = useState('clinic'); // Default to clinic
  const { register: registerUser, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    watch,
    setValue,
  } = useForm({
    defaultValues: {
      userType: 'clinic'
    }
  });

  const watchPassword = watch('password');
  const watchUserType = watch('userType');

  // Check if user came from landing page with pre-selected user type
  useEffect(() => {
    if (location.state?.userType) {
      const preselectedType = location.state.userType;
      setUserType(preselectedType);
      // Set the form value as well
      setValue('userType', preselectedType);
    }
  }, [location.state]);

  const onSubmit = async (data) => {
    try {
      console.log('📝 Form submission started with data:', data);
      
      // Include userType in registration data
      const registrationData = {
        ...data,
        userType: data.userType || userType
      };
      
      console.log('📋 Registration data prepared:', registrationData);
      
      const result = await registerUser(registrationData, 'email');
      console.log('📨 Registration result:', result);
      
      if (result && result.success) {
        // Check if account needs activation
        if (result.needsActivation) {
          console.log('✅ Registration successful - needs activation');
          navigate('/activation-pending');
        } else {
          console.log('✅ Registration successful - redirecting to dashboard');
          navigate('/dashboard');
        }
      } else {
        console.log('❌ Registration failed:', result?.error);
        setError('root', { message: result?.error || 'Registration failed. Please try again.' });
      }
    } catch (error) {
      console.error('🚨 Registration form error:', error);
      setError('root', { message: 'An unexpected error occurred. Please try again.' });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 py-8 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-400/30 to-pink-400/30 rounded-full blur-3xl animate-float"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-indigo-400/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/4 right-1/4 w-32 h-32 bg-gradient-to-br from-pink-400/20 to-purple-400/20 rounded-full blur-2xl animate-float" style={{ animationDelay: '4s' }}></div>
      </div>
      
      <div className="auth-card animate-fade-in-up floating-elements relative z-10">
        <div className="text-center mb-6 sm:mb-8 animate-slide-up">
          <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2 sm:mb-3">Create Account</h2>
          <p className="text-gray-600 font-medium text-sm sm:text-base">Join us today and get started</p>
        </div>

        {/* Register Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6 animate-slide-in-right" style={{ animationDelay: '0.6s' }}>
          {errors.root && (
            <div className="bg-red-50/80 backdrop-blur-sm border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm animate-shake shadow-lg">
              {errors.root.message}
            </div>
          )}

          {/* User Type Selection */}
          <div className="field-wrapper animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <label htmlFor="userType" className="field-label">
              Account Type
            </label>
            <div className="relative">
              {watchUserType === 'super_admin' ? (
                <Shield className={`input-icon ${errors.userType ? 'text-red-400' : 'text-purple-500'}`} />
              ) : watchUserType === 'patient' ? (
                <Heart className={`input-icon ${errors.userType ? 'text-red-400' : 'text-teal-500'}`} />
              ) : (
                <Building2 className={`input-icon ${errors.userType ? 'text-red-400' : 'text-blue-500'}`} />
              )}
              <select
                id="userType"
                className={`auth-input pl-11 ${errors.userType ? 'border-red-400 focus:ring-red-400 focus:border-red-400' : ''}`}
                {...register('userType', {
                  required: 'Please select account type',
                })}
                onChange={(e) => setUserType(e.target.value)}
              >
                <option value="patient">❤️ Personal Patient</option>
                <option value="clinic">🏥 Clinic Administrator</option>
                <option value="super_admin">👑 Super Administrator</option>
              </select>
            </div>
            {errors.userType && (
              <p className="error-message">{errors.userType.message}</p>
            )}
            <div className="mt-2 text-xs text-gray-500">
              {watchUserType === 'super_admin' ? (
                <span className="flex items-center gap-1">
                  <Shield className="w-3 h-3 text-purple-500" />
                  Super Admin has full system access and manages all clinics
                </span>
              ) : watchUserType === 'patient' ? (
                <span className="flex items-center gap-1">
                  <Heart className="w-3 h-3 text-teal-500" />
                  Personal account for individual neurofeedback training
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <Building2 className="w-3 h-3 text-blue-500" />
                  Clinic Admin manages patients, reports and clinic data
                </span>
              )}
            </div>
          </div>

          {/* Name Field */}
          <div className="field-wrapper animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <label htmlFor="name" className="field-label">
              {watchUserType === 'super_admin' ? 'Administrator Name' : 'Clinic Name / Contact Person'}
            </label>
            <div className="relative">
              <User className={`input-icon ${errors.name ? 'text-red-400' : ''}`} />
              <input
                id="name"
                type="text"
                className={`auth-input pl-11 ${errors.name ? 'border-red-400 focus:ring-red-400 focus:border-red-400' : ''}`}
                placeholder={watchUserType === 'super_admin' ? 'Enter administrator name' : 'Enter clinic name or your name'}
                {...register('name', {
                  required: 'Name is required',
                  minLength: {
                    value: 2,
                    message: 'Name must be at least 2 characters',
                  },
                })}
              />
            </div>
            {errors.name && (
              <p className="error-message">{errors.name.message}</p>
            )}
          </div>

          {/* Email Field */}
          <div className="field-wrapper animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <label htmlFor="email" className="field-label">
              Email Address
            </label>
            <div className="relative">
              <Mail className={`input-icon ${errors.email ? 'text-red-400' : ''}`} />
              <input
                id="email"
                type="email"
                className={`auth-input pl-11 ${errors.email ? 'border-red-400 focus:ring-red-400 focus:border-red-400' : ''}`}
                placeholder="Enter your email"
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
              <p className="error-message">{errors.email.message}</p>
            )}
          </div>

          {/* Password Field */}
          <div className="field-wrapper animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <label htmlFor="password" className="field-label">
              Password
            </label>
            <div className="relative">
              <Lock className={`input-icon ${errors.password ? 'text-red-400' : ''}`} />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                className={`auth-input pl-11 pr-11 ${errors.password ? 'border-red-400 focus:ring-red-400 focus:border-red-400' : ''}`}
                placeholder="Create a password"
                {...register('password', {
                  required: 'Password is required',
                  minLength: {
                    value: 8,
                    message: 'Password must be at least 8 characters',
                  },
                  pattern: {
                    value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
                    message: 'Password must contain uppercase, lowercase, number and special character',
                  },
                })}
              />
              <button
                type="button"
                className="absolute right-3 top-3 h-5 w-5 text-gray-400 hover:text-primary-500 transition-colors duration-200 transform hover:scale-110"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff /> : <Eye />}
              </button>
            </div>
            {errors.password && (
              <p className="error-message">{errors.password.message}</p>
            )}
          </div>

          {/* Confirm Password Field */}
          <div className="field-wrapper animate-slide-up" style={{ animationDelay: '0.4s' }}>
            <label htmlFor="confirmPassword" className="field-label">
              Confirm Password
            </label>
            <div className="relative">
              <Lock className={`input-icon ${errors.confirmPassword ? 'text-red-400' : ''}`} />
              <input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                className={`auth-input pl-11 pr-11 ${errors.confirmPassword ? 'border-red-400 focus:ring-red-400 focus:border-red-400' : ''}`}
                placeholder="Confirm your password"
                {...register('confirmPassword', {
                  required: 'Please confirm your password',
                  validate: (value) =>
                    value === watchPassword || 'Passwords do not match',
                })}
              />
              <button
                type="button"
                className="absolute right-3 top-3 h-5 w-5 text-gray-400 hover:text-primary-500 transition-colors duration-200 transform hover:scale-110"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff /> : <Eye />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="error-message">{errors.confirmPassword.message}</p>
            )}
          </div>

          {/* Additional Patient Fields */}
          {watchUserType === 'patient' && (
            <>
              {/* Date of Birth */}
              <div className="field-wrapper animate-slide-up" style={{ animationDelay: '0.5s' }}>
                <label htmlFor="dateOfBirth" className="field-label">
                  Date of Birth
                </label>
                <div className="relative">
                  <input
                    id="dateOfBirth"
                    type="date"
                    className={`auth-input ${errors.dateOfBirth ? 'border-red-400 focus:ring-red-400 focus:border-red-400' : ''}`}
                    {...register('dateOfBirth', {
                      required: 'Date of birth is required for patients',
                      validate: (value) => {
                        const today = new Date();
                        const birthDate = new Date(value);
                        const age = today.getFullYear() - birthDate.getFullYear();
                        if (age < 5 || age > 120) {
                          return 'Please enter a valid age between 5 and 120 years';
                        }
                        return true;
                      }
                    })}
                  />
                </div>
                {errors.dateOfBirth && (
                  <p className="error-message">{errors.dateOfBirth.message}</p>
                )}
              </div>

              {/* Gender */}
              <div className="field-wrapper animate-slide-up" style={{ animationDelay: '0.5s' }}>
                <label htmlFor="gender" className="field-label">
                  Gender
                </label>
                <div className="relative">
                  <select
                    id="gender"
                    className={`auth-input ${errors.gender ? 'border-red-400 focus:ring-red-400 focus:border-red-400' : ''}`}
                    {...register('gender', {
                      required: 'Gender is required for patients',
                    })}
                  >
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                {errors.gender && (
                  <p className="error-message">{errors.gender.message}</p>
                )}
              </div>

              {/* Phone Number */}
              <div className="field-wrapper animate-slide-up" style={{ animationDelay: '0.5s' }}>
                <label htmlFor="phone" className="field-label">
                  Phone Number (Optional)
                </label>
                <div className="relative">
                  <input
                    id="phone"
                    type="tel"
                    className={`auth-input ${errors.phone ? 'border-red-400 focus:ring-red-400 focus:border-red-400' : ''}`}
                    placeholder="Enter your phone number"
                    {...register('phone', {
                      pattern: {
                        value: /^[\+]?[1-9][\d]{0,15}$/,
                        message: 'Please enter a valid phone number',
                      },
                    })}
                  />
                </div>
                {errors.phone && (
                  <p className="error-message">{errors.phone.message}</p>
                )}
              </div>
            </>
          )}

          {/* Terms and Conditions */}
          <div className="flex items-start animate-slide-up" style={{ animationDelay: '0.5s' }}>
            <div className="flex items-center h-5">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded transition-transform duration-200 hover:scale-110"
                {...register('terms', {
                  required: 'You must accept the terms and conditions',
                })}
              />
            </div>
            <div className="ml-3 text-sm">
              <label htmlFor="terms" className="text-gray-700 font-medium">
                I agree to the{' '}
                <Link to="/terms" className="text-primary-600 hover:text-primary-700 font-semibold transition-all duration-200 hover:underline hover:underline-offset-4">
                  Terms and Conditions
                </Link>{' '}
                and{' '}
                <Link to="/privacy" className="text-primary-600 hover:text-primary-700 font-semibold transition-all duration-200 hover:underline hover:underline-offset-4">
                  Privacy Policy
                </Link>
              </label>
            </div>
          </div>
          {errors.terms && (
            <p className="error-message">{errors.terms.message}</p>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="auth-button animate-bounce-soft" style={{ animationDelay: '0.6s' }}
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                <span className="animate-pulse">Creating account...</span>
              </>
            ) : (
              <span>Create Account</span>
            )}
          </button>
        </form>

        {/* Sign In Link */}
        <div className="mt-8 text-center animate-fade-in" style={{ animationDelay: '1s' }}>
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-semibold text-primary-600 hover:text-primary-700 transition-all duration-200 hover:underline hover:underline-offset-4"
            >
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;

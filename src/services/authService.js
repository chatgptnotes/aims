import axios from 'axios';
import Cookies from 'js-cookie';
import DatabaseService from './databaseService';

// Base API URL - replace with your actual API endpoint
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = Cookies.get('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      Cookies.remove('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authService = {
  // Email/Password Authentication
  async loginWithEmail({ email, password, otp }) {
    console.log('🔐 Attempting login with:', { email, password: password ? 'provided' : 'missing' });
    
    // Input validation
    if (!email) {
      throw new Error('Email is required');
    }
    if (!password) {
      throw new Error('Password is required');
    }
    
    // Trim whitespace and convert to lowercase for email
    const normalizedEmail = email.trim().toLowerCase();
    console.log('📧 Normalized email:', normalizedEmail);
    
    try {
      // Check database for credentials
      console.log('🔍 Checking database for credentials...');
      const databaseCredentials = await this.checkDatabaseCredentials(normalizedEmail, password, otp);
      
      if (databaseCredentials) {
        // Check if OTP is required
        if (databaseCredentials.requiresOTP) {
          console.log('🔐 OTP required for login');
          return {
            success: false,
            requiresOTP: true,
            message: databaseCredentials.message,
            clinicId: databaseCredentials.clinicId
          };
        }
        
        // Check for errors
        if (databaseCredentials.error) {
          console.log('❌ Database credential error:', databaseCredentials.error);
          throw new Error(databaseCredentials.error);
        }
        
        // Successful login
        if (databaseCredentials.user) {
          console.log('✅ Database credentials found and verified');
          
          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 300));
          
          const token = `db_token_${Date.now()}`;
          const response = {
            success: true,
            token: token,
            user: databaseCredentials.user
          };
          
          // Store in localStorage for persistence
          localStorage.setItem('user', JSON.stringify(databaseCredentials.user));
          localStorage.setItem('authToken', token);
          
          console.log('✅ Database login successful, user stored');
          return response;
        }
      } else {
        console.log('❌ No credentials found for:', normalizedEmail);
        throw new Error('Invalid email address or password');
      }
    } catch (error) {
      console.error('🚨 Login error:', error.message);
      throw error;
    }
  },

  // Check database for clinic credentials
  async checkDatabaseCredentials(email, password, otp = null) {
    try {
      console.log('🔍 Searching database for email:', email);
      
      // Get clinics from database
      const clinics = await DatabaseService.get('clinics');
      console.log('📊 Found', clinics.length, 'clinics in database');
      
      // Get super admins from database
      const superAdmins = await DatabaseService.get('superAdmins');
      console.log('👑 Found', superAdmins.length, 'super admins in database');
      
      // Find clinic with matching email
      const clinic = clinics.find(c => c.email && c.email.toLowerCase() === email.toLowerCase());
      console.log('🏥 Clinic found:', !!clinic);
      
      // Find super admin with matching email
      const superAdmin = superAdmins.find(sa => sa.email && sa.email.toLowerCase() === email.toLowerCase());
      console.log('👑 Super admin found:', !!superAdmin);
      
      if (clinic) {
        console.log('🔐 Checking password for clinic:', clinic.name);
        console.log('🔐 Stored password:', clinic.adminPassword);
        console.log('🔐 Provided password:', password);
        
        // Check if clinic account is active
        if (!clinic.isActive) {
          console.log('❌ Clinic account is deactivated:', clinic.name);
          return {
            error: 'Your account has been deactivated. Please contact the administrator to activate your account.'
          };
        }
        
        // Check if password matches (also check legacy 'password' field)
        const storedPassword = clinic.adminPassword || clinic.password;
        if (storedPassword === password) {
          console.log('✅ Password match for clinic:', clinic.name);
          
          // Check if clinic needs OTP activation
          if (clinic.activationOTP && !clinic.isActivated) {
            console.log('⚠️ Clinic needs OTP activation');
            
            if (!otp) {
              // Return special response indicating OTP is needed
              return {
                requiresOTP: true,
                clinicId: clinic.id,
                message: 'Please enter the OTP sent to your email to activate your account.'
              };
            }
            
            // Validate OTP
            console.log('🔐 Validating OTP:', otp, 'vs stored:', clinic.activationOTP);
            if (clinic.activationOTP === otp) {
              // Check if OTP is not expired
              const otpExpiry = new Date(clinic.otpExpiresAt);
              const now = new Date();
              
              if (now > otpExpiry) {
                console.log('❌ OTP expired');
                return {
                  error: 'OTP has expired. Please contact admin for a new one.'
                };
              }
              
              console.log('✅ OTP validated, activating clinic');
              // Activate the clinic
              await DatabaseService.update('clinics', clinic.id, {
                isActivated: true,
                activatedAt: new Date().toISOString(),
                activationOTP: null, // Clear OTP after successful validation
                otpExpiresAt: null
              });
              
              // Update clinic object for user creation
              clinic.isActivated = true;
            } else {
              console.log('❌ Invalid OTP');
              return {
                error: 'Invalid OTP. Please check and try again.'
              };
            }
          }
          
          // Check if clinic is activated (for both OTP and non-OTP cases)
          if (!clinic.isActivated) {
            console.log('⚠️ Clinic not activated yet');
            const registrationMethod = clinic.registrationMethod || 'unknown';
            let message = 'Your account is pending activation.';
            
            if (registrationMethod === 'self_registration') {
              message = 'Your account registration is pending approval by the Super Admin. You will receive an email once your account is activated.';
            } else if (registrationMethod === 'super_admin_created') {
              message = 'Your account has been created but needs to be activated by the Super Admin. Please contact them to activate your account.';
            }
            
            return {
              error: message
            };
          }
          
          // Create user object for clinic admin
          const user = {
            id: clinic.id,
            name: clinic.contactPerson || clinic.name,
            email: clinic.email,
            role: 'clinic_admin',
            clinicId: clinic.id,
            clinicName: clinic.name,
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(clinic.name)}&background=2563eb&color=fff`,
            isActivated: clinic.isActivated || true, // Default to activated for now
            createdAt: clinic.createdAt || new Date().toISOString(),
          };
          
          return { user };
        } else {
          console.log('❌ Password mismatch for clinic:', clinic.name);
          return null;
        }
      } else if (superAdmin) {
        console.log('🔐 Checking password for super admin:', superAdmin.name);
        console.log('🔐 Stored password:', superAdmin.password);
        console.log('🔐 Provided password:', password);
        
        // Check if password matches
        if (superAdmin.password === password) {
          console.log('✅ Password match for super admin:', superAdmin.name);
          
          // Create user object for super admin
          const user = {
            id: superAdmin.id,
            name: superAdmin.name,
            email: superAdmin.email,
            role: 'super_admin',
            clinicId: null,
            clinicName: null,
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(superAdmin.name)}&background=dc2626&color=fff`,
            isActivated: superAdmin.isActivated || true,
            createdAt: superAdmin.createdAt || new Date().toISOString(),
          };
          
          return { user };
        } else {
          console.log('❌ Password mismatch for super admin:', superAdmin.name);
          return null;
        }
      } else {
        console.log('❌ No clinic or super admin found with email:', email);
        return null;
      }
    } catch (error) {
      console.error('❌ Error checking database credentials:', error);
      return null;
    }
  },

  async registerWithEmail({ name, email, password, confirmPassword, userType = 'clinic' }) {
    try {
      console.log('🔐 Attempting registration with:', { name, email, userType });
      console.log('🔍 Registration input validation started...');
      
      // Input validation
      if (!name || name.trim().length < 2) {
        throw new Error('Name must be at least 2 characters long');
      }
      if (!email || !email.includes('@')) {
        throw new Error('Please enter a valid email address');
      }
      if (!password || password.length < 6) {
        throw new Error('Password must be at least 6 characters long');
      }
      if (password !== confirmPassword) {
        throw new Error('Passwords do not match');
      }
      if (!['clinic', 'super_admin'].includes(userType)) {
        throw new Error('Invalid user type selected');
      }

      const normalizedEmail = email.trim().toLowerCase();
      console.log('✅ Input validation passed, checking existing users...');
      
      // Check if email already exists in both tables
      console.log('📊 Fetching existing clinics...');
      const existingClinics = await DatabaseService.get('clinics');
      console.log('📊 Fetching existing super admins...');
      const existingSuperAdmins = await DatabaseService.get('superAdmins');
      console.log('📊 Database fetch completed');
      
      const existingClinic = existingClinics.find(c => c.email && c.email.toLowerCase() === normalizedEmail);
      const existingSuperAdmin = existingSuperAdmins.find(sa => sa.email && sa.email.toLowerCase() === normalizedEmail);
      
      if (existingClinic || existingSuperAdmin) {
        throw new Error('Email already registered. Please use a different email or try logging in.');
      }

      let newUser;
      let needsActivation = false;

      if (userType === 'super_admin') {
        // Create Super Admin - auto-activated for immediate login
        newUser = await DatabaseService.add('superAdmins', {
          name: name.trim(),
          email: normalizedEmail,
          password: password, // In production, this should be hashed
          role: 'super_admin',
          isActive: true, // Auto-activate super admins
          isActivated: true,
          createdAt: new Date().toISOString(),
          status: 'active'
        });
        
        needsActivation = false; // No activation required
        console.log('✅ Super Admin registration - auto-activated:', newUser.email);
        
      } else {
        // Create Clinic - requires activation by super admin
        newUser = await DatabaseService.createClinic({
          name: name.trim(),
          email: normalizedEmail,
          password: password, // In production, this should be hashed
          adminPassword: password, // Add this for login compatibility
          contactPerson: name.trim(),
          role: 'clinic_admin',
          isActive: true,
          isActivated: false, // Require activation by super admin
          subscriptionStatus: 'trial',
          trialStartDate: new Date().toISOString(),
          trialEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days trial
          registrationMethod: 'self_registration' // Track how this was created
        });
        
        needsActivation = true; // Clinic needs activation
        console.log('✅ Clinic registration successful - awaiting activation:', newUser.name);
      }

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));

      // Create user object for immediate login (both clinics and super admins)
      const user = {
        id: newUser.id,
        name: userType === 'super_admin' ? newUser.name : (newUser.contactPerson || newUser.name),
        email: newUser.email,
        role: newUser.role,
        clinicId: userType === 'clinic' ? newUser.id : null,
        clinicName: userType === 'clinic' ? newUser.name : null,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(newUser.name)}&background=${userType === 'super_admin' ? 'dc2626' : '2563eb'}&color=fff`,
        isActivated: newUser.isActivated,
        userType: userType,
        subscriptionStatus: newUser.subscriptionStatus || null,
        createdAt: newUser.createdAt
      };

      if (needsActivation) {
        // Clinic registration - needs activation, don't login automatically
        return {
          success: true,
          needsActivation: true,
          message: 'Registration successful! Your account is pending activation by the Super Admin. You will receive an email once activated.',
          userType: userType,
          registeredEmail: newUser.email
        };
      } else {
        // Super Admin - auto login
        const token = `reg_token_${userType}_${Date.now()}`;
        
        // Store user for immediate login
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('authToken', token);

        return {
          success: true,
          message: `${userType === 'super_admin' ? 'Super Admin' : 'Clinic'} registration successful! You are now logged in.`,
          token: token,
          user: user,
          userType: userType
        };
      }
      
    } catch (error) {
      console.error('❌ Registration error:', error.message);
      throw new Error(error.message || 'Registration failed');
    }
  },

  // Google OAuth
  async loginWithGoogle() {
    try {
      const response = await this.simulateOAuthLogin('google');
      return response;
    } catch (error) {
      throw new Error('Google login failed');
    }
  },

  async registerWithGoogle() {
    try {
      const response = await this.simulateOAuthLogin('google');
      return response;
    } catch (error) {
      throw new Error('Google registration failed');
    }
  },

  // GitHub OAuth
  async loginWithGitHub() {
    try {
      const response = await this.simulateOAuthLogin('github');
      return response;
    } catch (error) {
      throw new Error('GitHub login failed');
    }
  },

  async registerWithGitHub() {
    try {
      const response = await this.simulateOAuthLogin('github');
      return response;
    } catch (error) {
      throw new Error('GitHub registration failed');
    }
  },

  // Facebook OAuth
  async loginWithFacebook() {
    try {
      const response = await this.simulateOAuthLogin('facebook');
      return response;
    } catch (error) {
      throw new Error('Facebook login failed');
    }
  },

  async registerWithFacebook() {
    try {
      const response = await this.simulateOAuthLogin('facebook');
      return response;
    } catch (error) {
      throw new Error('Facebook registration failed');
    }
  },

  // OAuth login simulation (placeholder for real implementation)
  async simulateOAuthLogin(provider) {
    throw new Error(`${provider} OAuth not implemented yet`);
  },

  // Get current user
  async getCurrentUser() {
    try {
      // First try to get from localStorage
      const user = localStorage.getItem('user');
      if (user) {
        return JSON.parse(user);
      }
      
      // Fallback to API call
      const response = await api.get('/auth/me');
      return response.data.user;
    } catch (error) {
      throw new Error('Failed to get user data');
    }
  },

  // Logout
  async logout() {
    try {
      // Clear localStorage first
      localStorage.removeItem('user');
      localStorage.removeItem('authToken');
      
      // Try API call
      await api.post('/auth/logout');
    } catch (error) {
      // Even if API call fails, local storage is already cleared
      console.error('Logout API call failed:', error);
    }
  },

  // Forgot Password
  async forgotPassword(email) {
    try {
      const response = await api.post('/auth/forgot-password', { email });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to send reset email');
    }
  },

  // Reset Password
  async resetPassword(token, newPassword) {
    try {
      const response = await api.post('/auth/reset-password', { token, password: newPassword });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Password reset failed');
    }
  },

  // Change Password
  async changePassword(currentPassword, newPassword) {
    try {
      const response = await api.post('/auth/change-password', { 
        currentPassword, 
        newPassword 
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Password change failed');
    }
  },

  // Update Profile
  async updateProfile(userData) {
    try {
      const response = await api.put('/auth/profile', userData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Profile update failed');
    }
  },
};

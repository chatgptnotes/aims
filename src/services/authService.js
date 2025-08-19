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
  // Static credentials for demo
  staticCredentials: {
    // Super Admin
    'admin@neurosense360.com': {
      password: 'admin123',
      user: {
        id: 'admin-1',
        name: 'Super Admin',
        email: 'admin@neurosense360.com',
        role: 'super_admin',
        avatar: 'https://ui-avatars.com/api/?name=Super+Admin&background=dc2626&color=fff',
        createdAt: new Date().toISOString(),
      }
    },
    // Clinic Admin
    'clinic@demo.com': {
      password: 'clinic123',
      user: {
        id: 'clinic-1',
        name: 'Demo Clinic Admin',
        email: 'clinic@demo.com',
        role: 'clinic_admin',
        clinicId: 'demo-clinic-id',
        avatar: 'https://ui-avatars.com/api/?name=Clinic+Admin&background=2563eb&color=fff',
        createdAt: new Date().toISOString(),
      }
    },
    // Regular User
    'user@demo.com': {
      password: 'user123',
      user: {
        id: 'user-1',
        name: 'Demo User',
        email: 'user@demo.com',
        role: 'user',
        avatar: 'https://ui-avatars.com/api/?name=Demo+User&background=059669&color=fff',
        createdAt: new Date().toISOString(),
      }
    },
    // Alternative entries for testing
    'test@test.com': {
      password: 'test123',
      user: {
        id: 'test-1',
        name: 'Test User',
        email: 'test@test.com',
        role: 'user',
        avatar: 'https://ui-avatars.com/api/?name=Test+User&background=ff6b6b&color=fff',
        createdAt: new Date().toISOString(),
      }
    }
  },

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
      // Check static credentials first
      const staticCred = this.staticCredentials[normalizedEmail];
      console.log('📝 Static credential found for', normalizedEmail, ':', !!staticCred);
      console.log('📝 Available emails:', Object.keys(this.staticCredentials));
      
      if (staticCred) {
        console.log('🔑 Checking password...');
        if (staticCred.password === password) {
          console.log('✅ Password match - proceeding with login');
          
          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 300));
          
          const token = `static_token_${Date.now()}`;
          const response = {
            success: true,
            token: token,
            user: staticCred.user
          };
          
          // Store in localStorage for persistence
          localStorage.setItem('demoUser', JSON.stringify(staticCred.user));
          localStorage.setItem('demoToken', token);
          
          console.log('✅ Login successful, user stored');
          return response;
        } else {
          console.log('❌ Password mismatch for:', normalizedEmail);
          console.log('Expected:', staticCred.password, 'Got:', password);
          throw new Error('Invalid password');
        }
      } else {
        // Check database for clinic credentials
        console.log('🔍 Checking database for clinic credentials...');
        const databaseCredentials = this.checkDatabaseCredentials(normalizedEmail, password, otp);
        
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
            localStorage.setItem('demoUser', JSON.stringify(databaseCredentials.user));
            localStorage.setItem('demoToken', token);
            
            console.log('✅ Database login successful, user stored');
            return response;
          }
        } else {
          console.log('❌ No credentials found for:', normalizedEmail);
          throw new Error('Invalid email address or password');
        }
      }
      
    } catch (error) {
      console.error('🚨 Login error:', error.message);
      throw error;
    }
  },

  // Check database for clinic credentials
  checkDatabaseCredentials(email, password, otp = null) {
    try {
      console.log('🔍 Searching database for email:', email);
      
      // Get clinics from database
      const clinics = DatabaseService.get('clinics');
      console.log('📊 Found', clinics.length, 'clinics in database');
      
      // Find clinic with matching email
      const clinic = clinics.find(c => c.email && c.email.toLowerCase() === email.toLowerCase());
      console.log('🏥 Clinic found:', !!clinic);
      
      if (clinic) {
        console.log('🔐 Checking password for clinic:', clinic.name);
        console.log('🔐 Stored password:', clinic.adminPassword);
        console.log('🔐 Provided password:', password);
        
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
              DatabaseService.update('clinics', clinic.id, {
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
      } else {
        console.log('❌ No clinic found with email:', email);
        return null;
      }
    } catch (error) {
      console.error('❌ Error checking database credentials:', error);
      return null;
    }
  },

  async registerWithEmail({ name, email, password, confirmPassword }) {
    try {
      if (password !== confirmPassword) {
        throw new Error('Passwords do not match');
      }
      const response = await api.post('/auth/register', { name, email, password });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  },

  // Google OAuth
  async loginWithGoogle() {
    try {
      // In a real app, you would integrate with Google OAuth
      // For demo purposes, we'll simulate the flow
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

  // Simulate OAuth login for demo purposes
  async simulateOAuthLogin(provider) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          token: `demo_token_${provider}_${Date.now()}`,
          user: {
            id: Math.random().toString(36).substr(2, 9),
            name: `Demo User (${provider})`,
            email: `demo@${provider}.com`,
            avatar: `https://ui-avatars.com/api/?name=Demo+User&background=3b82f6&color=fff`,
            provider: provider,
            createdAt: new Date().toISOString(),
          }
        });
      }, 1000); // Simulate network delay
    });
  },

  // Get current user
  async getCurrentUser() {
    try {
      // First try to get from localStorage (for demo)
      const demoUser = localStorage.getItem('demoUser');
      if (demoUser) {
        return JSON.parse(demoUser);
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
      localStorage.removeItem('demoUser');
      localStorage.removeItem('demoToken');
      
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

import axios from 'axios';
import Cookies from 'js-cookie';
import { createClient } from '@supabase/supabase-js';
import DatabaseService from './databaseService';

// Get Supabase environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
  async loginWithEmail({ email, password }) {
    console.log('🔐 Attempting login with:', { email, password: password ? 'provided' : 'missing' });

    // Input validation
    if (!email) {
      throw new Error('Email is required');
    }
    if (!password) {
      throw new Error('Password is required');
    }

    const normalizedEmail = email.trim().toLowerCase();

    try {
      // Use Supabase Auth for login
      const { data, error } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password: password
      });

      if (error) {
        throw new Error(error.message);
      }

      if (!data.user) {
        throw new Error('Login failed - no user returned');
      }

      // Get user profile from database
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      const user = {
        id: data.user.id,
        email: data.user.email,
        name: profile?.full_name || data.user.user_metadata?.full_name || 'User',
        role: profile?.role || data.user.user_metadata?.role || 'patient',
        avatar: profile?.avatar_url,
        isActivated: true
      };

      console.log('✅ Login successful:', user.email);

      return {
        success: true,
        token: data.session.access_token,
        user: user
      };

    } catch (error) {
      console.error('🚨 Supabase login error:', error.message);

      // Fallback: Try local database authentication for clinic admins and super admins
      console.log('🔄 Attempting local database authentication fallback...');
      try {
        // Check super admins first
        const superAdmins = await DatabaseService.get('superAdmins') || [];
        const superAdmin = superAdmins.find(admin => admin.email === normalizedEmail && admin.password === password);

        if (superAdmin) {
          console.log('✅ Super admin found in local database');
          return {
            success: true,
            token: `local_token_${Date.now()}`,
            user: {
              id: superAdmin.id,
              email: superAdmin.email,
              name: superAdmin.name,
              role: 'super_admin',
              avatar: superAdmin.avatar,
              isActivated: true
            }
          };
        }

        // Check clinics
        const clinics = await DatabaseService.get('clinics') || [];
        const clinic = clinics.find(c => c.email === normalizedEmail && c.password === password);

        if (clinic) {
          console.log('✅ Clinic found in local database');

          // Check if clinic is activated
          if (!clinic.isActivated) {
            throw new Error('Your account is pending activation. Please contact super admin.');
          }

          return {
            success: true,
            token: `local_token_${Date.now()}`,
            user: {
              id: clinic.id,
              email: clinic.email,
              name: clinic.name,
              role: 'clinic_admin',
              avatar: clinic.avatar,
              clinicId: clinic.id,
              isActivated: clinic.isActivated
            }
          };
        }

        // If no local user found, throw original error
        throw error;

      } catch (localError) {
        console.error('🚨 Local authentication also failed:', localError.message);
        throw localError;
      }
    }
  },


  async registerWithEmail({ name, email, password, confirmPassword, userType = 'patient', dateOfBirth, gender, phone }) {
    try {
      console.log('🔐 Attempting registration with:', { name, email, userType });

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
      if (!['patient', 'clinic', 'super_admin'].includes(userType)) {
        throw new Error('Invalid user type selected');
      }

      const normalizedEmail = email.trim().toLowerCase();

      // Use Supabase Auth for registration
      const { data, error } = await supabase.auth.signUp({
        email: normalizedEmail,
        password: password,
        options: {
          data: {
            full_name: name.trim(),
            role: userType === 'clinic' ? 'clinic_admin' : userType,
            user_type: userType
          }
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      if (!data.user) {
        throw new Error('Registration failed - no user returned');
      }

      // Create profile record
      const profileData = {
        id: data.user.id,
        role: userType === 'clinic' ? 'clinic_admin' : userType,
        full_name: name.trim(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      await supabase.from('profiles').insert(profileData);

      // Handle user type specific data creation
      if (userType === 'patient') {
        // For individual patients, create a personal organization and patient record
        try {
          console.log('👤 Creating patient organization and patient record...');

          // Create personal organization for the patient
          const personalOrgData = {
            name: `${name.trim()} - Personal Account`,
            type: 'personal',
            subscription_tier: 'free',
            credits_remaining: 5, // Personal trial credits
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };

          const { data: personalOrgResult } = await supabase.from('organizations').insert(personalOrgData).select().single();

          if (personalOrgResult) {
            // Create organization membership for the patient
            await supabase.from('org_memberships').insert({
              org_id: personalOrgResult.id,
              user_id: data.user.id,
              role: 'owner',
              created_at: new Date().toISOString()
            });

            // Create patient record in patients table
            const patientData = {
              org_id: personalOrgResult.id,
              owner_user: data.user.id,
              external_id: `PAT_${Date.now()}`, // Generate unique external ID
              full_name: name.trim(),
              date_of_birth: dateOfBirth || '1990-01-01', // Use form data or default
              gender: gender || 'other', // Use form data or default
              phone: phone || null,
              email: normalizedEmail,
              address: null,
              medical_history: null,
              improvement_focus: ['cognitive_enhancement'], // Default focus
              brain_fitness_score: null,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            };

            await supabase.from('patients').insert(patientData);
            console.log('✅ Patient record created in patients table');
          }
        } catch (patientError) {
          console.warn('⚠️ Failed to create patient record:', patientError);
          // Don't fail registration if patient record creation fails
        }
      }

      // If clinic registration, create organization AND local clinic entry
      if (userType === 'clinic') {
        const orgData = {
          name: name.trim(),
          type: 'clinic',
          subscription_tier: 'free',
          credits_remaining: 10, // Trial credits
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        const { data: orgResult } = await supabase.from('organizations').insert(orgData).select().single();

        if (orgResult) {
          // Create organization membership
          await supabase.from('org_memberships').insert({
            org_id: orgResult.id,
            user_id: data.user.id,
            role: 'owner',
            created_at: new Date().toISOString()
          });
        }

        // ALSO add to local database for super admin approval workflow
        try {
          const localClinicData = {
            id: data.user.id,
            name: name.trim(),
            email: normalizedEmail,
            password: password, // Store for local authentication
            phone: '',
            address: '',
            website: '',
            specialization: 'General Neurofeedback',
            licenseNumber: '',
            avatar: null,
            isActivated: false, // Requires super admin activation
            createdAt: new Date().toISOString(),
            supabaseUserId: data.user.id,
            supabaseOrgId: orgResult?.id,
            registrationSource: 'landing_page'
          };

          await DatabaseService.add('clinics', localClinicData);
          console.log('✅ Clinic added to local database for super admin approval');
        } catch (localDbError) {
          console.warn('⚠️ Failed to add clinic to local database:', localDbError);
          // Don't fail registration if local DB fails
        }
      }

      console.log('✅ Registration successful:', data.user.email);

      // For clinic registrations, require super admin activation
      if (userType === 'clinic') {
        return {
          success: true,
          needsActivation: true,
          message: 'Clinic registration submitted successfully! Your account is pending activation by our administrator. You will receive an email notification once your account is approved.',
          user: {
            id: data.user.id,
            email: data.user.email,
            name: name.trim(),
            role: userType
          }
        };
      }

      // For other user types (patient, super_admin), proceed normally
      return {
        success: true,
        message: 'Registration successful! Please check your email to confirm your account.',
        user: {
          id: data.user.id,
          email: data.user.email,
          name: name.trim(),
          role: userType
        }
      };

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

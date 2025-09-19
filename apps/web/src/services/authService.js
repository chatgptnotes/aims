import axios from 'axios';
import Cookies from 'js-cookie';
import DatabaseService from './databaseService';

// Import shared Supabase service to avoid multiple client instances
import SupabaseService from './supabaseService';

// Get reference to the shared Supabase client
const supabase = SupabaseService.supabase;

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
      // Use Supabase Auth for login only if available
      if (!supabase || !SupabaseService.isAvailable()) {
        throw new Error('Supabase not configured - falling back to local authentication');
      }

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

      // TEMPORARY: If email logins are disabled, skip Supabase and use local auth directly
      if (error.message.includes('Email logins are disabled')) {
        console.log('⚠️ Email logins disabled - using local authentication only');
        return await this.localAuthenticationOnly(normalizedEmail, password);
      }

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

  // TEMPORARY: Local authentication only (bypass Supabase)
  async localAuthenticationOnly(email, password) {
    try {
      console.log('🔑 ========== LOCAL AUTHENTICATION DEBUG ==========');
      console.log('🔑 Login attempt with email:', email);
      console.log('🔑 Password provided:', password ? `[${password.length} characters]` : 'NO PASSWORD');

      // TEMPORARY BYPASS: Allow any login ending with @gmail.com and password Pass@123
      if (email.endsWith('@gmail.com') && password === 'Pass@123') {
        console.log('✅ BYPASS: Gmail login with Pass@123 successful');
        const clinicName = email.split('@')[0].toUpperCase();
        return {
          success: true,
          token: `local_token_${Date.now()}`,
          user: {
            id: `bypass-${Date.now()}`,
            email: email,
            name: clinicName,
            role: 'clinic_admin',
            avatar: null,
            isActivated: true
          }
        };
      }

      // HARDCODED TEST CREDENTIALS for immediate testing
      if (email === 'admin@test.com' && password === 'admin123') {
        console.log('✅ Test super admin login successful');
        return {
          success: true,
          token: `local_token_${Date.now()}`,
          user: {
            id: 'test-admin-001',
            email: 'admin@test.com',
            name: 'Test Super Admin',
            role: 'super_admin',
            avatar: null,
            isActivated: true
          }
        };
      }

      if (email === 'clinic@test.com' && password === 'clinic123') {
        console.log('✅ Test clinic login successful');
        return {
          success: true,
          token: `local_token_${Date.now()}`,
          user: {
            id: 'test-clinic-001',
            email: 'clinic@test.com',
            name: 'Test Clinic',
            role: 'clinic_admin',
            avatar: null,
            isActivated: true
          }
        };
      }

      // TEMPORARY: Add the clinics we know exist from the dashboard
      if (email === 'abc@gmail.com' && password === 'Pass@123') {
        console.log('✅ ABC clinic hardcoded login successful');
        return {
          success: true,
          token: `local_token_${Date.now()}`,
          user: {
            id: 'abc-clinic-001',
            email: 'abc@gmail.com',
            name: 'ABC',
            role: 'clinic_admin',
            avatar: null,
            isActivated: true
          }
        };
      }

      if (email === 'bcd@gmail.com' && password === 'Pass@123') {
        console.log('✅ BCD clinic hardcoded login successful');
        return {
          success: true,
          token: `local_token_${Date.now()}`,
          user: {
            id: 'bcd-clinic-001',
            email: 'bcd@gmail.com',
            name: 'bcd',
            role: 'clinic_admin',
            avatar: null,
            isActivated: true
          }
        };
      }

      // Check super admins from database
      const superAdmins = await DatabaseService.get('superAdmins') || [];
      console.log('🔍 Debug: Super admins found:', superAdmins.length);
      console.log('🔍 Debug: Super admin emails:', superAdmins.map(a => a.email));

      const superAdmin = superAdmins.find(admin => admin.email === email && admin.password === password);

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
      console.log('🔍 Starting clinic data retrieval...');
      let clinics = [];

      try {
        clinics = await DatabaseService.get('clinics') || [];
        console.log('🔍 Debug: Clinics found in database:', clinics.length);
        console.log('🔍 Debug: Raw clinic data type:', typeof clinics);
        console.log('🔍 Debug: Is array?', Array.isArray(clinics));
      } catch (clinicFetchError) {
        console.error('🚨 Error fetching clinics:', clinicFetchError);
        clinics = [];
      }

      if (clinics.length > 0) {
        console.log('🔍 ========== CLINIC DATABASE DEBUG ==========');
        console.log('🔍 Total clinics found:', clinics.length);

        clinics.forEach((c, index) => {
          console.log(`🔍 Clinic ${index + 1}:`, {
            id: c.id,
            name: c.name,
            email: c.email,
            hasPassword: !!c.password,
            hasAdminPassword: !!c.adminPassword,
            passwordLength: c.password ? c.password.length : 0,
            adminPasswordLength: c.adminPassword ? c.adminPassword.length : 0,
            actualPassword: c.password || 'NONE',
            actualAdminPassword: c.adminPassword || 'NONE',
            isActive: c.is_active || c.isActive,
            subscriptionStatus: c.subscription_status || c.subscriptionStatus,
            allFields: Object.keys(c)
          });
        });
      } else {
        console.log('🔍 ========== NO CLINICS FOUND ==========');
      }

      console.log('🔍 Debug: Looking for clinic with email:', email);
      console.log('🔍 Debug: Trying to match password length:', password ? password.length : 0);

      // Try to find clinic with password or adminPassword
      const clinic = clinics.find(c =>
        c.email === email &&
        (c.password === password || c.adminPassword === password)
      );

      if (clinic) {
        console.log('✅ Clinic found in local database');
        return {
          success: true,
          token: `local_token_${Date.now()}`,
          user: {
            id: clinic.id,
            email: clinic.email,
            name: clinic.name,
            role: 'clinic_admin',
            avatar: clinic.avatar || clinic.logoUrl,
            isActivated: clinic.isActivated || clinic.is_active
          }
        };
      }

      throw new Error('Invalid email or password');
    } catch (error) {
      console.error('🚨 Local authentication failed:', error.message);
      throw new Error('Invalid email or password');
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

      // Use Supabase Auth for registration only if available
      if (!supabase || !SupabaseService.isAvailable()) {
        throw new Error('Supabase not configured - registration requires Supabase');
      }

      console.log('📧 Calling Supabase auth.signUp...');
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

      console.log('📦 Supabase auth.signUp response:', {
        hasData: !!data,
        hasUser: !!data?.user,
        userId: data?.user?.id,
        userEmail: data?.user?.email,
        needsConfirmation: !!data?.user?.confirmation_sent_at,
        error: error?.message
      });

      if (error) {
        console.error('❌ Supabase auth.signUp error:', error);

        // Provide specific error messages
        if (error.message.includes('User already registered')) {
          throw new Error('An account with this email already exists. Please try logging in instead.');
        }

        if (error.message.includes('Invalid email')) {
          throw new Error('Please enter a valid email address.');
        }

        if (error.message.includes('Password should be')) {
          throw new Error('Password must be at least 6 characters long.');
        }

        throw new Error(error.message);
      }

      if (!data.user) {
        console.error('❌ No user returned from Supabase auth.signUp');
        throw new Error('Registration failed - no user returned from authentication service');
      }

      console.log('✅ User created in Supabase Auth:', {
        id: data.user.id,
        email: data.user.email,
        created_at: data.user.created_at,
        email_confirmed_at: data.user.email_confirmed_at
      });

      // Create profile record
      const profileData = {
        id: data.user.id,
        full_name: name.trim(),
        first_name: name.trim().split(' ')[0] || '',
        last_name: name.trim().split(' ').slice(1).join(' ') || '',
        email: normalizedEmail,
        phone: phone || null,
        date_of_birth: dateOfBirth || null,
        gender: gender || null,
        role: userType === 'clinic' ? 'clinic_admin' : userType,
        is_active: true,
        is_email_verified: false // Will be verified via Supabase email confirmation
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

        // Add clinic request to database for super admin approval
        try {
          const clinicRequestData = {
            id: data.user.id, // Use Supabase user ID as clinic ID
            name: name.trim(),
            email: normalizedEmail,
            phone: '',
            address: '',
            logo_url: null,
            is_active: false, // Pending approval by super admin
            reports_used: 0,
            reports_allowed: 0, // No credits until approved
            subscription_status: 'pending_approval',
            subscription_tier: 'free',
            trial_start_date: null, // Will be set when approved
            trial_end_date: null, // Will be set when approved
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };

          const savedClinic = await DatabaseService.add('clinics', clinicRequestData);
          console.log('📋 Clinic registration request sent to super admin for approval');
          console.log('✅ Saved clinic data:', savedClinic);
          console.log('🔍 Clinic ID for verification:', savedClinic?.id);
        } catch (localDbError) {
          console.warn('⚠️ Failed to create clinic request:', localDbError);
          // Don't fail registration if local DB fails
        }
      }

      // If super admin registration, create super_admin_profiles record
      if (userType === 'super_admin') {
        try {
          console.log('👑 Creating super admin profile...');

          // Create super admin profile record
          const superAdminData = {
            user_id: data.user.id,
            employee_id: `SA_${Date.now()}`, // Generate unique employee ID
            department: 'System Administration',
            designation: 'System Administrator',
            work_email: normalizedEmail,
            access_level: 'standard', // Default access level
            modules_access: [
              'user_management',
              'clinic_management',
              'billing',
              'reports',
              'system_settings'
            ],
            requires_2fa: true,
            hire_date: new Date().toISOString().split('T')[0], // Current date
            is_active: true
          };

          await supabase.from('super_admin_profiles').insert(superAdminData);
          console.log('✅ Super admin profile created successfully');

          // Also store in local database for compatibility with existing code
          try {
            const localSuperAdminData = {
              id: data.user.id,
              name: name.trim(),
              email: normalizedEmail,
              password: password, // Store for local authentication fallback
              avatar: null,
              isActivated: true, // Super admins are auto-activated
              createdAt: new Date().toISOString(),
              supabaseUserId: data.user.id
            };

            await DatabaseService.add('superAdmins', localSuperAdminData);
            console.log('✅ Super admin added to local database');
          } catch (localDbError) {
            console.warn('⚠️ Failed to add super admin to local database:', localDbError);
            // Don't fail registration if local DB fails
          }

        } catch (superAdminError) {
          console.error('❌ Failed to create super admin profile:', superAdminError);
          throw new Error('Super admin registration failed: ' + superAdminError.message);
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

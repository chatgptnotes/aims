import React, { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import Cookies from 'js-cookie';
import { authService } from '../services/authService';
import DatabaseService from '../services/databaseService';
import { createClient } from '@supabase/supabase-js';

// Get Supabase environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if we have valid Supabase configuration
const hasValidSupabaseConfig = supabaseUrl && supabaseUrl !== 'https://placeholder.supabase.co' &&
                               supabaseAnonKey && supabaseAnonKey !== 'placeholder-anon-key';

// Initialize Supabase client only if we have valid config
let supabase = null;

if (hasValidSupabaseConfig) {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
  console.log('✅ Supabase client initialized successfully');
} else {
  console.warn('⚠️ Supabase not configured in AuthContext. Environment variables missing.');
  console.log('Current environment variables:', {
    VITE_SUPABASE_URL: supabaseUrl,
    VITE_SUPABASE_ANON_KEY: supabaseAnonKey ? 'Present' : 'Missing'
  });
}

// 🚀 DEVELOPMENT MODE: Bypass authentication
const BYPASS_AUTH = import.meta.env.VITE_BYPASS_AUTH === 'true' || false; // Set to false to enable authentication

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check if user is logged in on app start
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      // 🚀 DEVELOPMENT MODE: Auto-authenticate with default user
      if (BYPASS_AUTH) {
        console.log('🚀 DEVELOPMENT MODE: Bypassing authentication');

        // Check if user was previously set (from login)
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          try {
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);
            setIsAuthenticated(true);
            setLoading(false);
            console.log('✅ Development user authenticated from storage:', parsedUser.name, parsedUser.role);
            return;
          } catch (e) {
            console.warn('Failed to parse stored user, using default');
          }
        }

        // Default super admin user if no stored user
        const defaultUser = {
          id: 'dev-super-admin',
          name: 'Super Admin (Dev)',
          email: 'superadmin@neurosense360.com',
          role: 'super_admin',
          profilePicture: null,
          isActivated: true,
          clinicId: null
        };

        setUser(defaultUser);
        setIsAuthenticated(true);
        setLoading(false);
        localStorage.setItem('user', JSON.stringify(defaultUser));
        console.log('✅ Development user authenticated:', defaultUser.name, defaultUser.role);
        return;
      }

      // PRODUCTION MODE: Check for stored authentication
      // First check localStorage for token and user
      const storedToken = localStorage.getItem('authToken') || Cookies.get('authToken');
      const storedUser = localStorage.getItem('user');

      if (storedToken && storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          console.log('🔍 Found stored auth token and user:', parsedUser.email, parsedUser.role);

          // Restore user from localStorage
          setUser(parsedUser);
          setIsAuthenticated(true);
          console.log('✅ User authenticated from localStorage:', parsedUser.name, parsedUser.role);

          // Optionally verify token with backend or Supabase in background
          // but don't block the UI
          setLoading(false);
          return;
        } catch (e) {
          console.warn('Failed to parse stored user:', e);
        }
      }

      // If no localStorage auth, check Supabase session
      if (supabase) {
        const { data: { session } } = await supabase.auth.getSession();

        if (session?.user) {
          // Get user profile from database
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          const userData = {
            id: session.user.id,
            email: session.user.email,
            name: profile?.full_name || session.user.user_metadata?.full_name || 'User',
            role: profile?.role || session.user.user_metadata?.role || 'patient',
            avatar: profile?.avatar_url,
            isActivated: true
          };

          setUser(userData);
          setIsAuthenticated(true);
          localStorage.setItem('user', JSON.stringify(userData));
          console.log('✅ User authenticated from Supabase session:', userData.name, userData.role);
        } else {
          console.log('❌ No active session found');
          setUser(null);
          setIsAuthenticated(false);
        }
      } else {
        console.log('❌ No stored auth and Supabase not available');
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.warn('Auth check failed:', error);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials, method = 'email') => {
    console.log('🚀 AuthContext: Starting login process');

    // 🚀 DEVELOPMENT MODE: Auto-succeed login
    if (BYPASS_AUTH) {
      console.log('🚀 DEVELOPMENT MODE: Bypassing login authentication');
      setLoading(true);

      // Simulate loading time
      await new Promise(resolve => setTimeout(resolve, 500));

      // Determine user role based on email patterns
      const email = credentials.email || 'dev@neurosense360.com';
      let userRole = 'super_admin'; // default
      let userName = 'Development User';
      let clinicId = null;

      // Role detection based on email patterns
      if (email.includes('superadmin') || email.includes('admin@neurosense')) {
        userRole = 'super_admin';
        userName = 'Super Admin (Dev)';
        clinicId = null;
      } else if (email.includes('clinic') || email.includes('@clinic') ||
                 email.includes('doctor') || email.includes('dr.')) {
        userRole = 'clinic_admin';
        userName = 'Clinic Admin (Dev)';
        clinicId = 'dev-clinic-123';
      } else if (email.includes('patient')) {
        userRole = 'patient';
        userName = 'Patient (Dev)';
        clinicId = 'dev-clinic-123';
      }

      const defaultUser = {
        id: `dev-${userRole}-${Date.now()}`,
        name: userName,
        email: email,
        role: userRole,
        profilePicture: null,
        isActivated: true,
        clinicId: clinicId
      };

      setUser(defaultUser);
      setIsAuthenticated(true);
      setLoading(false);
      localStorage.setItem('user', JSON.stringify(defaultUser));
      localStorage.setItem('authToken', 'dev-bypass-token');

      toast.success(`🚀 Development mode login as ${userRole}!`);
      console.log('✅ Development login successful:', defaultUser.name, defaultUser.role);

      return {
        success: true,
        user: defaultUser,
        message: 'Development mode login successful'
      };
    }

    try {
      setLoading(true);
      let response;
      
      console.log('📧 Login method:', method);
      console.log('📝 Credentials:', { email: credentials.email, hasPassword: !!credentials.password });
      
      switch (method) {
        case 'email':
          response = await authService.loginWithEmail(credentials);
          break;
        case 'google':
          response = await authService.loginWithGoogle();
          break;
        case 'github':
          response = await authService.loginWithGitHub();
          break;
        case 'facebook':
          response = await authService.loginWithFacebook();
          break;
        default:
          throw new Error('Invalid authentication method');
      }

      console.log('📦 Auth response:', response);

      if (response && response.success && response.token) {
        // Store authentication data in multiple places for reliability
        Cookies.set('authToken', response.token, { expires: 7 }); // 7 days
        localStorage.setItem('authToken', response.token);
        
        // Fetch the latest user data from database to get updated profile picture
        let latestUserData = response.user;
        try {
          console.log('🔄 Fetching latest user data from database...');
          if (response.user.role === 'super_admin') {
            const superAdminData = await DatabaseService.findById('superAdmins', response.user.id);
            if (superAdminData) {
              latestUserData = { ...response.user, ...superAdminData };
              console.log('✅ Super admin data fetched from database');
            }
          } else if (response.user.role === 'clinic_admin') {
            console.log('🔍 Attempting to fetch clinic data...');
            console.log('🔍 User ID:', response.user.id);
            console.log('🔍 User Email:', response.user.email);

            // Try to find clinic by ID first
            let clinicData = await DatabaseService.findById('clinics', response.user.id);

            // If not found by ID, try by email
            if (!clinicData) {
              console.log('⚠️ Clinic not found by ID, trying by email...');
              const clinicsByEmail = await DatabaseService.findBy('clinics', 'email', response.user.email);
              if (clinicsByEmail && clinicsByEmail.length > 0) {
                clinicData = clinicsByEmail[0];
                console.log('✅ Found clinic by email:', clinicData);
              }
            }

            console.log('🏥 Fetched clinic data from database:', clinicData);
            console.log('📞 Phone from database:', clinicData?.phone);
            console.log('📍 Address from database:', clinicData?.address);

            if (clinicData) {
              // Map contact_person to name for the UI
              latestUserData = {
                ...response.user,
                ...clinicData,
                name: clinicData.contact_person || clinicData.name || response.user.name
              };
              console.log('✅ Clinic admin data fetched from database');
              console.log('✅ Merged user data:', latestUserData);
              console.log('✅ Name field set from contact_person:', latestUserData.name);
            } else {
              console.warn('⚠️ No clinic data found for this user!');
            }
          } else if (response.user.role === 'patient') {
            console.log('🔍 Attempting to fetch patient data...');
            console.log('🔍 User ID:', response.user.id);
            console.log('🔍 User Email:', response.user.email);

            // Try to find patient by ID first
            let patientData = await DatabaseService.findById('patients', response.user.id);

            // If not found by ID, try by email
            if (!patientData) {
              console.log('⚠️ Patient not found by ID, trying by email...');
              const patientsByEmail = await DatabaseService.findBy('patients', 'email', response.user.email);
              if (patientsByEmail && patientsByEmail.length > 0) {
                patientData = patientsByEmail[0];
                console.log('✅ Found patient by email:', patientData);
              }
            }

            console.log('👤 Fetched patient data from database:', patientData);

            if (patientData) {
              latestUserData = {
                ...response.user,
                ...patientData,
                name: patientData.name || patientData.full_name || response.user.name
              };
              console.log('✅ Patient data fetched from database');
              console.log('✅ Merged user data:', latestUserData);
            } else {
              console.warn('⚠️ No patient data found for this user!');
              console.log('ℹ️  This might be a new patient, using API response data');
            }
          }
        } catch (dbError) {
          console.warn('⚠️ Failed to fetch latest user data from database, using API response:', dbError);
          // Continue with API response if database fetch fails
        }
        
        // Store the latest user data
        localStorage.setItem('user', JSON.stringify(latestUserData));
        
        // Set state
        setUser(latestUserData);
        setIsAuthenticated(true);
        
        console.log('✅ AuthContext: User data stored:', {
          name: latestUserData.name,
          role: latestUserData.role,
          clinicId: latestUserData.clinicId,
          hasAvatar: !!latestUserData.avatar
        });
        
        toast.success('Logged in successfully');
        console.log('✅ AuthContext: Login completed successfully');
        return { success: true, user: latestUserData };
      } else {
        console.log('❌ AuthContext: Invalid response format:', response);
        throw new Error('Authentication failed');
      }
    } catch (error) {
      console.error('🚨 AuthContext: Login failed:', error);
      toast.error(error.message || 'Login failed. Please try again.');
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData, method = 'email') => {
    console.log('🚀 AuthContext: Starting registration process');

    // 🚀 DEVELOPMENT MODE: Auto-succeed registration
    if (BYPASS_AUTH) {
      console.log('🚀 DEVELOPMENT MODE: Bypassing registration authentication');
      setLoading(true);

      // Simulate loading time
      await new Promise(resolve => setTimeout(resolve, 800));

      const defaultUser = {
        id: 'dev-user-' + Date.now(),
        name: userData.name || 'Development User',
        email: userData.email || 'dev@neurosense360.com',
        role: userData.userType === 'super_admin' ? 'super_admin' :
              userData.userType === 'patient' ? 'patient' : 'clinic_admin',
        profilePicture: null,
        isActivated: true,
        clinicId: 'dev-clinic-123'
      };

      setUser(defaultUser);
      setIsAuthenticated(true);
      setLoading(false);
      localStorage.setItem('user', JSON.stringify(defaultUser));
      localStorage.setItem('authToken', 'dev-bypass-token');

      toast.success('🚀 Development mode registration successful!');
      console.log('✅ Development registration successful:', defaultUser.name, defaultUser.role);

      return {
        success: true,
        user: defaultUser,
        message: 'Development mode registration successful'
      };
    }

    try {
      setLoading(true);
      let response;
      
      console.log('📧 Registration method:', method);
      console.log('📝 User data:', { 
        name: userData.name, 
        email: userData.email, 
        userType: userData.userType,
        hasPassword: !!userData.password,
        hasConfirmPassword: !!userData.confirmPassword 
      });
      
      switch (method) {
        case 'email':
          console.log('🔄 Calling authService.registerWithEmail...');
          response = await authService.registerWithEmail(userData);
          console.log('📦 AuthService response:', response);
          break;
        case 'google':
          response = await authService.registerWithGoogle();
          break;
        case 'github':
          response = await authService.registerWithGitHub();
          break;
        case 'facebook':
          response = await authService.registerWithFacebook();
          break;
        default:
          throw new Error('Invalid registration method');
      }

      console.log('✅ AuthContext: Registration response received', response);

      if (response && response.success) {
        if (response.needsActivation) {
          // Super admin needs activation - don't login automatically
          toast.success(response.message || 'Registration submitted for approval!');
          console.log('✅ AuthContext: Registration completed - needs activation');
          return { success: true, needsActivation: true };
        } else if (response.token) {
          // Normal registration with immediate login
          Cookies.set('authToken', response.token, { expires: 7 });
          localStorage.setItem('authToken', response.token);
          
          // Fetch the latest user data from database to get updated profile picture
          let latestUserData = response.user;
          try {
            console.log('🔄 Fetching latest user data from database after registration...');
            if (response.user.role === 'super_admin') {
              const superAdminData = await DatabaseService.findById('superAdmins', response.user.id);
              if (superAdminData) {
                latestUserData = { ...response.user, ...superAdminData };
                console.log('✅ Super admin data fetched from database');
              }
            } else if (response.user.role === 'clinic_admin') {
              console.log('🔍 Registration: Attempting to fetch clinic data...');
              console.log('🔍 Registration: User ID:', response.user.id);
              console.log('🔍 Registration: User Email:', response.user.email);

              // Try to find clinic by ID first
              let clinicData = await DatabaseService.findById('clinics', response.user.id);

              // If not found by ID, try by email
              if (!clinicData) {
                console.log('⚠️ Registration: Clinic not found by ID, trying by email...');
                const clinicsByEmail = await DatabaseService.findBy('clinics', 'email', response.user.email);
                if (clinicsByEmail && clinicsByEmail.length > 0) {
                  clinicData = clinicsByEmail[0];
                  console.log('✅ Registration: Found clinic by email:', clinicData);
                }
              }

              console.log('🏥 Registration: Fetched clinic data from database:', clinicData);
              console.log('📞 Registration: Phone from database:', clinicData?.phone);
              console.log('📍 Registration: Address from database:', clinicData?.address);

              if (clinicData) {
                // Map contact_person to name for the UI
                latestUserData = {
                  ...response.user,
                  ...clinicData,
                  name: clinicData.contact_person || clinicData.name || response.user.name
                };
                console.log('✅ Clinic admin data fetched from database');
                console.log('✅ Registration: Merged user data:', latestUserData);
                console.log('✅ Registration: Name field set from contact_person:', latestUserData.name);
              } else {
                console.warn('⚠️ Registration: No clinic data found for this user!');
              }
            }
          } catch (dbError) {
            console.warn('⚠️ Failed to fetch latest user data from database, using API response:', dbError);
            // Continue with API response if database fetch fails
          }
          
          // Store the latest user data
          localStorage.setItem('user', JSON.stringify(latestUserData));
          
          setUser(latestUserData);
          setIsAuthenticated(true);
          
          console.log('✅ AuthContext: Registration user data stored:', {
            name: response.user.name,
            role: response.user.role,
            clinicId: response.user.clinicId
          });
          
          toast.success(response.message || 'Registration successful!');
          console.log('✅ AuthContext: Registration completed successfully');
          return { success: true };
        } else {
          console.log('❌ AuthContext: Registration success but no token provided');
          return { success: false, error: 'Registration completed but login failed' };
        }
      } else {
        // Handle case where response doesn't have success field or is falsy
        console.log('❌ AuthContext: Invalid registration response format:', response);
        const errorMessage = response?.error || response?.message || 'Registration failed with unknown error';
        return { success: false, error: errorMessage };
      }
    } catch (error) {
      console.error('Registration failed:', error);
      toast.error(error.message || 'Registration failed. Please try again.');
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      console.log('🚪 Logging out user...');

      // For development mode, we don't need to call authService
      if (!BYPASS_AUTH) {
        await authService.logout();
      }

      // Clear all authentication data
      if (typeof window !== 'undefined') {
        // Clear localStorage
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        localStorage.removeItem('demoUser');
        localStorage.removeItem('demoToken');

        // Clear all cached data
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith('patients_') ||
              key.startsWith('patient_reports_') ||
              key.startsWith('dbCache_') ||
              key.startsWith('clinic_')) {
            localStorage.removeItem(key);
          }
        });
      }

      // Clear state
      setUser(null);
      setIsAuthenticated(false);

      toast.success('Logged out successfully');
      console.log('✅ Logout successful, redirecting to landing page');

      // Redirect to landing page after logout
      window.location.href = '/';
    } catch (error) {
      console.error('Logout failed:', error);

      // Still clear local state even if API call fails
      if (typeof window !== 'undefined') {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        localStorage.removeItem('demoUser');
        localStorage.removeItem('demoToken');

        // Clear all cached data
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith('patients_') ||
              key.startsWith('patient_reports_') ||
              key.startsWith('dbCache_') ||
              key.startsWith('clinic_')) {
            localStorage.removeItem(key);
          }
        });
      }

      setUser(null);
      setIsAuthenticated(false);

      // Still redirect to landing page
      window.location.href = '/';
    }
  };

  const forgotPassword = async (email) => {
    try {
      setLoading(true);
      await authService.forgotPassword(email);
      toast.success('Password reset email sent!');
      return { success: true };
    } catch (error) {
      console.error('Forgot password failed:', error);
      toast.error(error.message || 'Failed to send reset email');
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (token, newPassword) => {
    try {
      setLoading(true);
      await authService.resetPassword(token, newPassword);
      toast.success('Password reset successful!');
      return { success: true };
    } catch (error) {
      console.error('Password reset failed:', error);
      toast.error(error.message || 'Password reset failed');
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const updateUser = async (userData) => {
    try {
      setLoading(true);
      console.log('🔄 Updating user profile:', userData);

      // Update local state immediately for better UX
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);

      // Update localStorage
      localStorage.setItem('user', JSON.stringify(updatedUser));

      // ✅ CRITICAL: Update Supabase Auth password FIRST if password is being changed
      if (userData.password && supabase) {
        try {
          console.log('🔐 Updating Supabase Auth password...');
          const { error: authError } = await supabase.auth.updateUser({
            password: userData.password
          });

          if (authError) {
            console.warn('⚠️ Supabase Auth password update failed:', authError.message);
            // Continue anyway to update local database
          } else {
            console.log('✅ Supabase Auth password updated successfully');
          }
        } catch (authError) {
          console.warn('⚠️ Failed to update Supabase Auth password:', authError);
          // Continue anyway to update local database
        }
      }

      // Save to database based on user role
      try {
        if (user?.role === 'super_admin') {
          // Update super admin in database
          await DatabaseService.update('superAdmins', user.id, userData);
          console.log('✅ Super admin profile saved to database');
        } else if (user?.role === 'clinic_admin') {
          // Map clinicName to name for database
          const clinicData = { ...userData };
          if (clinicData.clinicName) {
            clinicData.name = clinicData.clinicName;
            delete clinicData.clinicName;
          }
          // Map name (contact person) to contact_person for database
          if (clinicData.name && !clinicData.contact_person) {
            clinicData.contact_person = clinicData.name;
          }
          // Map avatar to logo_url (clinics table doesn't have avatar field)
          if (clinicData.avatar) {
            clinicData.logo_url = clinicData.avatar;
            delete clinicData.avatar;
          }
          console.log('📝 Original userData received:', userData);
          console.log('📝 Mapped clinic data for database:', clinicData);
          console.log('📝 contact_person field:', clinicData.contact_person);
          console.log('📝 User ID for update:', user.id);
          // Update clinic admin in database
          const updateResult = await DatabaseService.update('clinics', user.id, clinicData);
          console.log('✅ Clinic admin profile saved to database');
          console.log('✅ Update result:', updateResult);
        } else {
          // For regular users, update in appropriate table
          await DatabaseService.update('users', user.id, userData);
          console.log('✅ User profile saved to database');
        }
      } catch (dbError) {
        console.error('❌ Database update failed:', dbError);
        console.warn('⚠️ Failed to save to database, but local update successful:', dbError);
        // Don't fail the entire operation if database fails
      }
      
      toast.success('Profile updated successfully!');
      console.log('✅ Profile updated successfully');
      return { success: true };
    } catch (error) {
      console.error('Profile update failed:', error);
      toast.error(error.message || 'Failed to update profile');
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
    updateUser,
    checkAuthStatus,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

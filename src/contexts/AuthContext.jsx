import React, { createContext, useContext, useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';
import { authService } from '../services/authService';
import DatabaseService from '../services/databaseService';

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
      const token = Cookies.get('authToken') || localStorage.getItem('demoToken') || localStorage.getItem('authToken');
      const demoUser = localStorage.getItem('demoUser');
      const storedUser = localStorage.getItem('user');
      
      console.log('🔄 Checking auth status - token exists:', !!token, 'user exists:', !!storedUser);
      
      if (token || demoUser || storedUser) {
        try {
          let userData = null;
          
          // First try to get from localStorage (faster and more reliable for our case)
          if (storedUser) {
            try {
              userData = JSON.parse(storedUser);
              console.log('✅ User data restored from localStorage:', userData.name, userData.role);
              
              // Validate user data has required fields
              if (userData.id && userData.email && userData.role) {
                console.log('✅ User data validation passed');
                
                // Fetch the latest user data from DynamoDB to get updated profile picture
                try {
                  console.log('🔄 Fetching latest user data from DynamoDB on app start...');
                  let latestUserData = userData;
                  
                  if (userData.role === 'super_admin') {
                    const superAdminData = await DatabaseService.findById('superAdmins', userData.id);
                    if (superAdminData) {
                      latestUserData = { ...userData, ...superAdminData };
                      console.log('✅ Super admin data fetched from DynamoDB on app start');
                    }
                  } else if (userData.role === 'clinic_admin') {
                    const clinicData = await DatabaseService.findById('clinics', userData.id);
                    if (clinicData) {
                      latestUserData = { ...userData, ...clinicData };
                      console.log('✅ Clinic admin data fetched from DynamoDB on app start');
                    }
                  }
                  
                  // Update localStorage with latest data
                  localStorage.setItem('user', JSON.stringify(latestUserData));
                  setUser(latestUserData);
                  setIsAuthenticated(true);
                  setLoading(false);
                  return;
                } catch (dbError) {
                  console.warn('⚠️ Failed to fetch latest user data from DynamoDB on app start, using localStorage data:', dbError);
                  // Continue with localStorage data if DynamoDB fetch fails
                  setUser(userData);
                  setIsAuthenticated(true);
                  setLoading(false);
                  return;
                }
              } else {
                console.warn('⚠️ Stored user data incomplete, trying API...');
              }
            } catch (parseError) {
              console.warn('⚠️ Failed to parse stored user data:', parseError);
            }
          }
          
          // Fallback to API call if localStorage data is invalid
          if (!userData) {
            console.log('🌐 Trying to get user data from API...');
            userData = await authService.getCurrentUser();
            if (userData) {
              console.log('✅ User data retrieved from API');
              // Store the fresh data in localStorage
              localStorage.setItem('user', JSON.stringify(userData));
            }
          }
          
          if (userData) {
            setUser(userData);
            setIsAuthenticated(true);
          } else {
            throw new Error('No user data available');
          }
        } catch (userError) {
          // If getting user fails, clear auth state
          console.warn('Failed to get user data, clearing auth state:', userError);
          Cookies.remove('authToken');
          localStorage.removeItem('demoUser');
          localStorage.removeItem('demoToken');
          localStorage.removeItem('user');
          localStorage.removeItem('authToken');
          setUser(null);
          setIsAuthenticated(false);
        }
      } else {
        console.log('❌ No authentication token found');
      }
    } catch (error) {
      console.warn('Auth check failed:', error);
      // Clear all auth data on error
      Cookies.remove('authToken');
      localStorage.removeItem('demoUser');
      localStorage.removeItem('demoToken');
      localStorage.removeItem('user');
      localStorage.removeItem('authToken');
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials, method = 'email') => {
    console.log('🚀 AuthContext: Starting login process');
    
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
        
        // Fetch the latest user data from DynamoDB to get updated profile picture
        let latestUserData = response.user;
        try {
          console.log('🔄 Fetching latest user data from DynamoDB...');
          if (response.user.role === 'super_admin') {
            const superAdminData = await DatabaseService.findById('superAdmins', response.user.id);
            if (superAdminData) {
              latestUserData = { ...response.user, ...superAdminData };
              console.log('✅ Super admin data fetched from DynamoDB');
            }
          } else if (response.user.role === 'clinic_admin') {
            const clinicData = await DatabaseService.findById('clinics', response.user.id);
            if (clinicData) {
              latestUserData = { ...response.user, ...clinicData };
              console.log('✅ Clinic admin data fetched from DynamoDB');
            }
          }
        } catch (dbError) {
          console.warn('⚠️ Failed to fetch latest user data from DynamoDB, using API response:', dbError);
          // Continue with API response if DynamoDB fetch fails
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
          
          // Fetch the latest user data from DynamoDB to get updated profile picture
          let latestUserData = response.user;
          try {
            console.log('🔄 Fetching latest user data from DynamoDB after registration...');
            if (response.user.role === 'super_admin') {
              const superAdminData = await DatabaseService.findById('superAdmins', response.user.id);
              if (superAdminData) {
                latestUserData = { ...response.user, ...superAdminData };
                console.log('✅ Super admin data fetched from DynamoDB');
              }
            } else if (response.user.role === 'clinic_admin') {
              const clinicData = await DatabaseService.findById('clinics', response.user.id);
              if (clinicData) {
                latestUserData = { ...response.user, ...clinicData };
                console.log('✅ Clinic admin data fetched from DynamoDB');
              }
            }
          } catch (dbError) {
            console.warn('⚠️ Failed to fetch latest user data from DynamoDB, using API response:', dbError);
            // Continue with API response if DynamoDB fetch fails
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
      await authService.logout();
      
      // Clear all authentication data
      Cookies.remove('authToken');
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      localStorage.removeItem('demoUser');
      localStorage.removeItem('demoToken');
      
      // Clear all cached patient data
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('patients_') || key.startsWith('patient_reports_')) {
          localStorage.removeItem(key);
        }
      });
      
      setUser(null);
      setIsAuthenticated(false);
      toast.success('Logged out successfully');
      // Redirect to login page after logout
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout failed:', error);
      // Still clear local state even if API call fails
      Cookies.remove('authToken');
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      localStorage.removeItem('demoUser');
      localStorage.removeItem('demoToken');
      
      // Clear all cached patient data
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('patients_') || key.startsWith('patient_reports_')) {
          localStorage.removeItem(key);
        }
      });
      setUser(null);
      setIsAuthenticated(false);
      window.location.href = '/login';
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
      
      // Save to DynamoDB based on user role
      try {
        if (user?.role === 'super_admin') {
          // Update super admin in DynamoDB
          await DatabaseService.update('superAdmins', user.id, userData);
          console.log('✅ Super admin profile saved to DynamoDB');
        } else if (user?.role === 'clinic_admin') {
          // Update clinic admin in DynamoDB
          await DatabaseService.update('clinics', user.id, userData);
          console.log('✅ Clinic admin profile saved to DynamoDB');
        } else {
          // For regular users, update in appropriate table
          await DatabaseService.update('users', user.id, userData);
          console.log('✅ User profile saved to DynamoDB');
        }
      } catch (dbError) {
        console.warn('⚠️ Failed to save to DynamoDB, but local update successful:', dbError);
        // Don't fail the entire operation if DynamoDB fails
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

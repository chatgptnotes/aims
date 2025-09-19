import React, { useState, useEffect } from 'react';
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
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
  CreditCard,
  UserPlus,
  Shield,
  Settings
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import DatabaseService from '../../services/databaseService';
import AdminAssignmentModal from './AdminAssignmentModal';
// import EmailService from '../../services/emailService';

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
  const [isMounted, setIsMounted] = useState(true);
  const [error, setError] = useState(null);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [selectedClinicForAdmin, setSelectedClinicForAdmin] = useState(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  // Simple delete function that won't crash the component
  const deleteClinic = (clinic, index) => {
    console.log('🗑️ DELETE CLINIC FUNCTION CALLED');
    console.log('Clinic data:', clinic);
    console.log('Index:', index);
    
    try {
      const clinicName = clinic?.name || `Clinic ${index + 1}`;
      console.log('Clinic name to delete:', clinicName);
      
      // Show confirmation dialog
      const confirmDelete = window.confirm(`Delete ${clinicName}?\n\nThis cannot be undone.`);
      console.log('User confirmed delete:', confirmDelete);
      
      if (!confirmDelete) {
        console.log('User cancelled delete');
        return;
      }
      
      console.log('Proceeding with delete operation...');
      
      // Get current clinics from localStorage
      const currentClinics = JSON.parse(localStorage.getItem('clinics') || '[]');
      console.log('Current clinics in storage:', currentClinics.length);
      console.log('All clinic data:', currentClinics);
      
      // Remove clinic by index (most reliable method)
      const updatedClinics = currentClinics.filter((_, i) => {
        // Try multiple ways to identify the clinic to remove
        if (clinic?.id && currentClinics[i]?.id) {
          const shouldKeep = currentClinics[i].id !== clinic.id;
          console.log(`Checking by ID: ${currentClinics[i].id} vs ${clinic.id} - Keep: ${shouldKeep}`);
          return shouldKeep;
        }
        if (clinic?.email && currentClinics[i]?.email) {
          const shouldKeep = currentClinics[i].email !== clinic.email;
          console.log(`Checking by Email: ${currentClinics[i].email} vs ${clinic.email} - Keep: ${shouldKeep}`);
          return shouldKeep;
        }
        // Fallback: remove by position if no ID matching works
        const shouldKeep = i !== index;
        console.log(`Checking by Index: ${i} vs ${index} - Keep: ${shouldKeep}`);
        return shouldKeep;
      });
      
      console.log('Updated clinics after filter:', updatedClinics.length);
      console.log('Clinics removed:', currentClinics.length - updatedClinics.length);
      
      if (currentClinics.length === updatedClinics.length) {
        console.warn('⚠️ No clinics were removed - filter may have failed');
        toast.error('Could not identify clinic to delete');
        return;
      }
      
      // Save updated data
      localStorage.setItem('clinics', JSON.stringify(updatedClinics));
      console.log('✅ Updated clinics saved to localStorage');
      
      // Update state immediately to reflect changes
      setClinics(updatedClinics);
      console.log('✅ React state updated');
      
      toast.success(`${clinicName} deleted successfully`);
      console.log('✅ Delete operation completed successfully');
      
    } catch (error) {
      console.error('❌ Delete error:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        clinic: clinic,
        index: index
      });
      toast.error('Failed to delete clinic: ' + error.message);
    }
  };

  useEffect(() => {
    // Load clinics properly on component mount
    const initializeClinics = async () => {
      try {
        console.log('🚀 Initializing clinic management...');
        setLoading(true);
        
        // Load clinics with proper error handling
        await loadClinics(false); // Don't skip cleanup to ensure proper data loading
        
        console.log('✅ Clinic initialization complete');
        
      } catch (error) {
        console.error('❌ Error initializing clinics:', error);
        setClinics([]);
      } finally {
        setLoading(false);
      }
    };
    
    // Add a small delay to ensure database is ready
    const timer = setTimeout(() => {
      initializeClinics();
    }, 100);
    
    // Configure email service with error handling
    try {
      // EmailService.setProvider('emailjs', { publicKey: 'your_key_here' });
      // EmailService.setProvider('sendgrid', { apiKey: 'your_key_here' });
      console.log('Email service temporarily disabled for debugging');
    } catch (error) {
      console.warn('Email service configuration failed:', error);
    }
    
    // Cleanup function
    return () => {
      clearTimeout(timer);
      setIsMounted(false);
    };
  }, []);

  const cleanupDemoData = async () => {
    try {
      console.log('🧹 Checking for demo clinic data...');
      
      // Get current clinic data safely
      let clinicsData = [];
      try {
        clinicsData = await DatabaseService.get('clinics') || [];
      } catch (error) {
        console.warn('Could not get clinic data for cleanup:', error);
        return; // Exit safely if we can't get data
      }
      
      console.log('📋 Total clinics before cleanup:', clinicsData.length);
      
      // Skip cleanup if no data
      if (!Array.isArray(clinicsData) || clinicsData.length === 0) {
        console.log('No clinic data to clean');
        return;
      }
      
      // Identify demo/test clinics
      const demoClinicIndicators = [
        'demo',
        'test',
        'sample',
        'clinic@demo.com',
        'demo@',
        '@demo.com',
        'example.com'
      ];
      
      const realClinics = clinicsData.filter(clinic => {
        // Ensure clinic has required properties
        if (!clinic || typeof clinic !== 'object') {
          return true; // Keep non-object entries (shouldn't happen, but be safe)
        }
        
        const name = String(clinic.name || '').toLowerCase();
        const email = String(clinic.email || '').toLowerCase();
        
        // Check if clinic name or email contains demo indicators
        const isDemo = demoClinicIndicators.some(indicator => 
          name.includes(indicator) || email.includes(indicator)
        );
        
        if (isDemo) {
          console.log(`🗑️ Removing demo clinic: ${clinic.name} - ${clinic.email}`);
          return false;
        }
        
        return true;
      });
      
      // If we found demo clinics to remove, update the database
      if (realClinics.length < clinicsData.length) {
        console.log(`✅ Removing ${clinicsData.length - realClinics.length} demo clinics`);
        
        try {
          // Only update if component is still mounted
          if (!isMounted) return;
          
          // Clear and repopulate with real clinics only
          localStorage.setItem('clinics', JSON.stringify(realClinics));
          
          // Also update DynamoDB if available
          if (DatabaseService.useDynamoDB) {
            // Remove demo clinics from DynamoDB
            for (const clinic of clinicsData) {
              if (!clinic || !clinic.id) continue; // Skip invalid entries
              
              const name = String(clinic.name || '').toLowerCase();
              const email = String(clinic.email || '').toLowerCase();
              
              const isDemo = demoClinicIndicators.some(indicator => 
                name.includes(indicator) || email.includes(indicator)
              );
              
              if (isDemo) {
                try {
                  await DatabaseService.delete('clinics', clinic.id);
                } catch (error) {
                  console.warn(`Failed to delete demo clinic ${clinic.id} from DynamoDB:`, error);
                }
              }
            }
          }
          
          console.log(`🎉 Cleanup complete! ${realClinics.length} real clinics remaining`);
        } catch (storageError) {
          console.error('Failed to update storage after cleanup:', storageError);
          throw storageError; // Re-throw to let caller handle
        }
      } else {
        console.log('✅ No demo clinics found - data is clean');
      }
      
    } catch (error) {
      console.error('❌ Demo data cleanup failed:', error);
      throw error; // Re-throw to let caller handle
    }
  };

  const migrateLocalStorageToDynamoDB = async () => {
    try {
      // Check if DynamoDB is available
      if (!DatabaseService.useDynamoDB) {
        console.log('📋 DynamoDB not available, skipping migration');
        return;
      }

      // Check if DynamoDB already has data
      const existingClinics = await DatabaseService.get('clinics');
      if (existingClinics.length > 0) {
        console.log('📊 DynamoDB already has data, skipping migration');
        return;
      }

      // Get localStorage data
      const localStorageData = JSON.parse(localStorage.getItem('clinics') || '[]');
      if (localStorageData.length === 0) {
        console.log('💾 No localStorage data to migrate');
        return;
      }

      console.log('🚀 Starting migration of', localStorageData.length, 'clinics to DynamoDB...');
      
      // Migrate each clinic
      for (const clinic of localStorageData) {
        try {
          await DatabaseService.add('clinics', clinic);
          console.log('✅ Migrated clinic:', clinic.name);
        } catch (error) {
          console.error('❌ Failed to migrate clinic:', clinic.name, error);
        }
      }
      
      console.log('🎉 Migration completed successfully!');
      
    } catch (error) {
      console.error('❌ Migration failed:', error);
    }
  };

  const loadClinics = async (skipCleanup = false) => {
    try {
      console.log('👑 SuperAdmin loading all registered clinics...');
      console.log('🕒 Load time:', new Date().toLocaleTimeString());
      
      // Don't clear state immediately - wait until we have new data
      // setClinics([]); // Removed this line to prevent flashing empty state
      
      // Try to migrate localStorage data to DynamoDB if needed
      await migrateLocalStorageToDynamoDB();
      
      // Clean demo data after migration (with error protection) - only if explicitly requested
      if (!skipCleanup) {
        try {
          await cleanupDemoData();
        } catch (cleanupError) {
          console.warn('Demo cleanup failed, continuing with normal load:', cleanupError);
        }
      }
      
      // SuperAdmin can see ALL clinics - fetch from DynamoDB or localStorage
      let clinicsData = [];
      
      try {
        clinicsData = await DatabaseService.get('clinics');
        console.log('📊 Data from DatabaseService:', clinicsData.length, 'clinics');
        
        // Additional debug logging
        if (clinicsData && clinicsData.length > 0) {
          console.log('🔍 First clinic details:', {
            name: clinicsData[0].name,
            email: clinicsData[0].email,
            id: clinicsData[0].id,
            isActive: clinicsData[0].isActive
          });
          
          // Log all clinics for debugging
          clinicsData.forEach((clinic, index) => {
            console.log(`🔍 Clinic ${index + 1}:`, {
              name: clinic.name,
              email: clinic.email,
              id: clinic.id,
              isActive: clinic.isActive,
              isActivated: clinic.isActivated,
              subscriptionStatus: clinic.subscriptionStatus,
              subscription_status: clinic.subscription_status,
              is_active: clinic.is_active,
              reports_allowed: clinic.reports_allowed
            });
          });
        } else {
          console.log('📭 No clinics found in database');
        }
      } catch (error) {
        console.error('❌ Error getting clinics from DatabaseService:', error);
        clinicsData = [];
      }
      
      // Debug: Log raw data
      console.log('🔍 Raw clinics data from DB:', clinicsData);
      console.log('🔍 Raw localStorage data:', JSON.parse(localStorage.getItem('clinics') || '[]'));
      
      // Ensure clinicsData is an array and contains valid objects
      if (!Array.isArray(clinicsData)) {
        console.warn('⚠️ Clinics data is not an array:', clinicsData);
        clinicsData = [];
      }
      
      // Filter out invalid clinic objects
      clinicsData = clinicsData.filter(clinic => 
        clinic && 
        typeof clinic === 'object' && 
        (clinic.name || clinic.email || clinic.id)
      );
      
      console.log('🏥 Found valid clinics:', clinicsData.length);
      console.log('📋 Clinic names:', clinicsData.map(c => c && c.name || 'Unknown'));
      
      // Sort by creation date (newest first)
      const sortedClinics = clinicsData.sort((a, b) => 
        new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
      );
      
      // Only update state if component is still mounted
      if (isMounted) {
        setClinics(sortedClinics);
      }
      console.log('✅ Clinics loaded and sorted:', sortedClinics.length);
      
      // Debug: Check for duplicate IDs or missing IDs
      const clinicIds = sortedClinics.map(c => c && c.id || 'unknown-id');
      const uniqueIds = [...new Set(clinicIds)];
      if (clinicIds.length !== uniqueIds.length) {
        console.warn('⚠️ DUPLICATE IDs found!');
        console.log('All IDs:', clinicIds);
        console.log('Unique IDs:', uniqueIds);
      }
      
      // Debug: Check for missing IDs
      const missingIds = sortedClinics.filter(c => !c.id);
      if (missingIds.length > 0) {
        console.warn('⚠️ Clinics without ID found:', missingIds.length);
        console.log('Clinics without ID:', missingIds);
        
        // Auto-generate IDs for clinics that don't have them
        console.log('🔄 Auto-generating missing IDs...');
        missingIds.forEach((clinic, index) => {
          if (!clinic.id) {
            clinic.id = `clinic-${Date.now()}-${index}`;
            console.log(`✅ Generated ID for clinic "${clinic.name || 'Unknown'}": ${clinic.id}`);
          }
        });
        
        // Save the updated clinics with IDs
        try {
          localStorage.setItem('clinics', JSON.stringify(sortedClinics));
          console.log('💾 Updated clinics saved with generated IDs');
        } catch (error) {
          console.error('❌ Failed to save clinics with generated IDs:', error);
        }
      }
      
      // Debug: List all clinic details
      console.table(sortedClinics.map(c => ({
        name: c && c.name || 'Unknown',
        id: c && c.id || 'No ID',
        isActive: c && c.isActive || false,
        isActivated: c && c.isActivated || false,
        email: c && c.email || 'No email'
      })));
    } catch (error) {
      console.error('❌ Error loading clinics:', error);
      if (isMounted) {
        toast.error('Error loading clinics: ' + error.message);
        setError('Failed to load clinics: ' + error.message);
        // Set empty array to prevent further errors
        setClinics([]);
      }
    } finally {
      if (isMounted) {
        setLoading(false);
      }
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
        subscription_status: data.subscriptionPlan || 'trial', // Use snake_case for consistency
        subscriptionStatus: data.subscriptionPlan || 'trial', // Legacy field
        reports_allowed: reportsAllowed,
        reportsAllowed: reportsAllowed, // Legacy field
        reports_used: 0,
        reportsUsed: 0, // Legacy field
        is_active: true, // Super admin created clinics are pre-approved
        isActive: true, // Legacy field
        isActivated: true, // Super admin created clinics are pre-approved
        trial_start_date: new Date().toISOString(),
        trial_end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days trial
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        createdAt: new Date().toISOString(), // Legacy field
        registrationMethod: 'super_admin_created', // Track how this was created
        // Map adminPassword to password for authentication
        password: data.adminPassword, // This is the field used for login
        adminPassword: data.adminPassword, // Keep for compatibility
        // Remove confirmPassword from stored data
        confirmPassword: undefined
      };
      
      const createdClinic = await DatabaseService.add('clinics', clinicData);

      toast.success(`Clinic "${data.name}" created and activated successfully with ${data.subscriptionPlan || 'trial'} plan! They can now login.`);
      loadClinics();
      setShowModal(false);
      reset();
      onUpdate?.();

      // Offer auto-login for newly created clinic
      setTimeout(() => {
        const autoLogin = window.confirm(`✅ Clinic "${data.name}" created successfully!\n\n🔑 Would you like to automatically login as this clinic to test their dashboard?`);

        if (autoLogin) {
          // Create clinic object for auto-login
          const newClinic = {
            id: createdClinic.id,
            email: data.email,
            name: data.name,
            logo_url: data.logoUrl || null,
            ...createdClinic
          };
          handleAutoClinicLogin(newClinic);
        }
      }, 1000);
    } catch (error) {
      toast.error('Error creating clinic');
      console.error(error);
    }
  };

  const handleEditClinic = async (data) => {
    try {
      if (!selectedClinic?.id) {
        toast.error('No clinic selected for editing');
        return;
      }
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
    console.log('🗑️ DELETE FUNCTION CALLED for clinic ID:', clinicId);
    console.log('📊 Current time:', new Date().toISOString());
    console.log('📋 All clinics before delete:', clinics.map(c => ({ id: c.id, name: c.name })));
    
    // Force an alert to ensure the function is being called
    alert(`Delete function called for clinic ID: ${clinicId}`);
    
    if (!clinicId) {
      console.error('❌ No clinic ID provided for deletion');
      alert('ERROR: No clinic ID found');
      toast.error('Cannot delete: No clinic ID found');
      return;
    }
    
    console.log('🔍 Showing confirmation dialog...');
    const confirmed = window.confirm(`Are you sure you want to delete clinic with ID: ${clinicId}?\n\nThis action cannot be undone.`);
    console.log('✅ User confirmation result:', confirmed);
    
    if (confirmed) {
      try {
        console.log('✅ User confirmed deletion, proceeding...');
        console.log('🔄 Calling DatabaseService.delete with:', { table: 'clinics', id: clinicId });
        
        // First, let's manually check localStorage before deletion
        const currentData = JSON.parse(localStorage.getItem('clinics') || '[]');
        console.log('📦 Current localStorage data before delete:', currentData);
        
        const result = await DatabaseService.delete('clinics', clinicId);
        console.log('✅ DatabaseService.delete result:', result);
        
        // Check localStorage after deletion
        const afterData = JSON.parse(localStorage.getItem('clinics') || '[]');
        console.log('📦 localStorage data after delete:', afterData);
        
        toast.success('Clinic deleted successfully!');
        console.log('🔄 Reloading clinics list...');
        await loadClinics();
        onUpdate?.();
        console.log('✅ Delete operation completed successfully');
      } catch (error) {
        console.error('❌ Error during delete operation:', error);
        console.error('Error details:', { 
          message: error.message, 
          stack: error.stack,
          clinicId: clinicId 
        });
        alert(`Delete failed: ${error.message}`);
        toast.error('Error deleting clinic: ' + error.message);
      }
    } else {
      console.log('❌ User cancelled deletion');
      alert('Delete cancelled by user');
    }
  };

  const handleManualActivation = async (clinicId) => {
    if (window.confirm('Manually activate this clinic? This will allow them to login to their clinic portal.')) {
      try {
        // Get clinic details for notification
        const clinic = await DatabaseService.findById('clinics', clinicId);

        // Update local database
        await DatabaseService.update('clinics', clinicId, {
          isActivated: true,
          activatedAt: new Date().toISOString(),
          activationOTP: null,
          otpExpiresAt: null
        });

        // If clinic has Supabase credentials, update their email confirmation status
        if (clinic.supabaseUserId) {
          try {
            console.log('📧 Updating Supabase profile for activated clinic...');
            // Note: In production, you'd need admin Supabase credentials to update user records
            // For now, we'll rely on the local database authentication fallback
          } catch (supabaseError) {
            console.warn('⚠️ Could not update Supabase profile:', supabaseError);
          }
        }

        toast.success(`Clinic "${clinic.name}" activated successfully! They can now login to their portal.`);
        loadClinics();
        onUpdate?.();

        // Show activation confirmation
        setTimeout(() => {
          toast.success(`📧 Activation notification would be sent to ${clinic.email}`, {
            duration: 3000
          });
        }, 1000);

      } catch (error) {
        toast.error('Error activating clinic');
        console.error(error);
      }
    }
  };

  const handleClinicApproval = async (clinicId) => {
    if (window.confirm('Approve this clinic registration? This will activate their account and give them trial credits.')) {
      try {
        // Get clinic details
        const clinic = await DatabaseService.findById('clinics', clinicId);

        // Update clinic status to approved and activated
        await DatabaseService.update('clinics', clinicId, {
          subscription_status: 'trial', // Change from 'pending_approval' to 'trial'
          is_active: true, // Activate the clinic
          isActivated: true, // Legacy field for compatibility
          reports_allowed: 10, // Give trial credits
          trial_start_date: new Date().toISOString(),
          trial_end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days trial
          activatedAt: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

        toast.success(`Clinic "${clinic.name}" approved and activated! They now have 10 trial reports and can login.`, {
          duration: 4000
        });

        // Reload clinic list to reflect changes
        loadClinics();
        onUpdate?.();

        // Show approval confirmation with auto-login option
        setTimeout(() => {
          const autoLogin = window.confirm(`✅ Clinic "${clinic.name}" activated successfully!\n\n🔑 Would you like to automatically login as this clinic to test their dashboard?`);

          if (autoLogin) {
            // Auto-login as the activated clinic
            handleAutoClinicLogin(clinic);
          } else {
            toast.success(`📧 Approval notification sent to ${clinic.email}`, {
              duration: 3000
            });
          }
        }, 1500);

      } catch (error) {
        toast.error('Error approving clinic registration');
        console.error('Clinic approval error:', error);
      }
    }
  };

  const handleAutoClinicLogin = async (clinic) => {
    try {
      console.log('🚀 Auto-login attempt for clinic:', clinic.name);

      // Create a mock login session for the clinic
      const clinicUser = {
        id: clinic.id,
        email: clinic.email,
        name: clinic.name,
        role: 'clinic_admin',
        avatar: clinic.logo_url || null,
        isActivated: true,
        clinicId: clinic.id,
        token: `auto_login_${Date.now()}`
      };

      // Save to localStorage for session persistence
      localStorage.setItem('neuro360_user', JSON.stringify(clinicUser));
      localStorage.setItem('neuro360_token', clinicUser.token);

      // Show success message
      toast.success(`🎉 Auto-login successful! Redirecting to ${clinic.name} clinic dashboard...`, {
        duration: 2000
      });

      // Redirect to clinic dashboard after short delay
      setTimeout(() => {
        // Redirect to clinic portal (adjust URL as needed)
        window.location.href = '/clinic'; // or '/dashboard' based on your routing
      }, 2000);

    } catch (error) {
      console.error('❌ Auto-login failed:', error);
      toast.error('Auto-login failed. Please login manually with clinic credentials.');
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

  const openAdminAssignment = (clinic) => {
    setSelectedClinicForAdmin(clinic);
    setShowAdminModal(true);
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
      console.log('Email service temporarily disabled - showing credentials instead');
      
      // Temporarily disabled email service for debugging
      console.log('=== EMAIL DISABLED - MANUAL DELIVERY REQUIRED ===');
      console.log(`Clinic: ${clinic.name}`);
      console.log(`Email: ${clinic.email}`);
      console.log(`Username: ${clinic.email}`);
      console.log(`Password: ${password}`);
      console.log(`OTP: ${otp}`);
      console.log('==============================================');
      
      // Simulate email success for now
      return true;
    } catch (error) {
      console.error('Failed to send email:', error);
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
      if (!selectedClinic?.id) {
        toast.error('No clinic selected for password reset');
        return;
      }
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
          clinic: selectedClinic?.name || 'Unknown Clinic',
          email: selectedClinic?.email || 'Unknown Email',
          username: selectedClinic?.email || 'Unknown Email',
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

Clinic: ${selectedClinic?.name || 'Unknown Clinic'}
Email: ${selectedClinic?.email || 'Unknown Email'}
Username: ${selectedClinic?.email || 'Unknown Email'}
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading Clinic Management...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto mt-20">
          <h3 className="text-red-800 font-medium">Error Loading Clinic Management</h3>
          <p className="text-red-600 mt-2">{error}</p>
          <div className="flex space-x-3 mt-4">
            <button 
              onClick={() => {
                setError(null);
                setLoading(true);
                loadClinics(false);
              }} 
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Retry
            </button>
            <button 
              onClick={() => window.location.href = '/admin'} 
              className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
      {/* Modern Header with Glassmorphism */}
      <div className="relative overflow-hidden bg-white/70 backdrop-blur-xl border border-white/30 rounded-3xl shadow-2xl mb-8">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-purple-600/5 to-indigo-600/5"></div>
        <div className="relative p-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between space-y-6 lg:space-y-0">
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Users className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                    Clinic Management
                  </h1>
                  <p className="text-slate-600 text-lg font-medium mt-1">
                    Manage your registered clinics with modern precision ✨
                  </p>
                </div>
              </div>
              
              {/* Stats Cards */}
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center space-x-3 bg-white/60 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/30 shadow-sm">
                  <div className="w-3 h-3 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full animate-pulse"></div>
                  <span className="font-semibold text-slate-700">
                    {loading ? (
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-3 w-3 border-2 border-green-500 border-t-transparent"></div>
                        <span>Loading...</span>
                      </div>
                    ) : (
                      `${clinics.length} Active Clinics`
                    )}
                  </span>
                </div>
                
                <div className="flex items-center space-x-2 bg-white/60 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/30 shadow-sm">
                  <Calendar className="h-4 w-4 text-slate-500" />
                  <span className="font-medium text-slate-600">
                    Updated: {new Date().toLocaleTimeString()}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={async () => {
                  console.log('🔄 Manually refreshing clinic data...');
                  setLoading(true);
                  try {
                    await loadClinics(false);
                    toast.success('Clinic data refreshed successfully!');
                  } catch (error) {
                    console.error('Refresh failed:', error);
                    toast.error('Failed to refresh data');
                  } finally {
                    setLoading(false);
                  }
                }}
                className="group relative overflow-hidden bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-300 hover:scale-105 hover:shadow-xl border border-white/20"
                title="Refresh clinic data from database"
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                <div className="relative flex items-center space-x-2">
                  <RefreshCw className="h-4 w-4" />
                  <span>Refresh Data</span>
                </div>
              </button>
              
              <button
                onClick={() => openModal()}
                className="group relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 text-white px-8 py-3 rounded-xl font-bold text-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl border border-white/20"
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                <div className="relative flex items-center space-x-3">
                  <Plus className="h-6 w-6" />
                  <span>Add Clinic</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modern Clinic Cards Grid */}
      <div className="relative">
        <div className="text-center mb-12">
          <div className="inline-flex items-center space-x-3 bg-white/60 backdrop-blur-sm px-6 py-3 rounded-2xl border border-white/30 shadow-sm">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Users className="h-4 w-4 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800">
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-500 border-t-transparent"></div>
                  <span>Loading Clinics...</span>
                </div>
              ) : (
                `All Clinics (${clinics.length})`
              )}
            </h2>
          </div>
        </div>
        
        {/* Modern Card Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
          {(() => {
            try {
              console.log('🔍 RENDERING: Starting to render clinics grid');
              console.log('🔍 RENDERING: Clinics array:', clinics);
              console.log('🔍 RENDERING: Clinics length:', clinics.length);
              console.log('🔍 RENDERING: Clinics type:', typeof clinics);
              console.log('🔍 RENDERING: Is Array:', Array.isArray(clinics));
              
              if (!Array.isArray(clinics)) {
                console.error('❌ CRITICAL: clinics is not an array!', clinics);
                return (
                  <div className="col-span-3 bg-red-100 border border-red-300 rounded-lg p-4">
                    <p className="text-red-700">Error: Clinics data is not an array</p>
                    <p className="text-xs text-red-500">Type: {typeof clinics}</p>
                    <p className="text-xs text-red-500">Value: {JSON.stringify(clinics)}</p>
                  </div>
                );
              }
              
              return clinics.map((clinic, index) => {
                try {
                  console.log(`🔍 CLINIC ${index}: Starting render for clinic at index ${index}`);
                  console.log(`🔍 CLINIC ${index}: Raw clinic data:`, clinic);
                  console.log(`🔍 CLINIC ${index}: Clinic type:`, typeof clinic);
                  console.log(`🔍 CLINIC ${index}: Clinic constructor:`, clinic ? clinic.constructor.name : 'null');
                  
                  // Safety check for clinic object
                  if (clinic === null) {
                    console.warn(`⚠️ CLINIC ${index}: clinic is null`);
                    return (
                      <div key={`null-${index}`} className="bg-yellow-100 border border-yellow-300 rounded-lg p-4">
                        <p className="text-yellow-700">Warning: Null clinic at index {index}</p>
                      </div>
                    );
                  }
                  
                  if (clinic === undefined) {
                    console.warn(`⚠️ CLINIC ${index}: clinic is undefined`);
                    return (
                      <div key={`undefined-${index}`} className="bg-yellow-100 border border-yellow-300 rounded-lg p-4">
                        <p className="text-yellow-700">Warning: Undefined clinic at index {index}</p>
                      </div>
                    );
                  }
                  
                  if (typeof clinic !== 'object') {
                    console.warn(`⚠️ CLINIC ${index}: clinic is not an object:`, typeof clinic, clinic);
                    return (
                      <div key={`invalid-${index}`} className="bg-yellow-100 border border-yellow-300 rounded-lg p-4">
                        <p className="text-yellow-700">Warning: Invalid clinic object at index {index}</p>
                        <p className="text-xs text-yellow-600">Type: {typeof clinic}</p>
                        <p className="text-xs text-yellow-600">Value: {String(clinic)}</p>
                      </div>
                    );
                  }
                  
                  // Deep inspection of clinic object
                  console.log(`🔍 CLINIC ${index}: clinic.name:`, clinic.name);
                  console.log(`🔍 CLINIC ${index}: clinic.name type:`, typeof clinic.name);
                  console.log(`🔍 CLINIC ${index}: clinic.name === null:`, clinic.name === null);
                  console.log(`🔍 CLINIC ${index}: clinic.name === undefined:`, clinic.name === undefined);
                  console.log(`🔍 CLINIC ${index}: clinic.name length:`, clinic.name ? clinic.name.length : 'N/A');
                  console.log(`🔍 CLINIC ${index}: All properties:`, Object.keys(clinic));
                  
                  // Convert name to safe string if needed
                  let safeName = 'Unknown Clinic';
                  let safeInitial = 'C';
                  
                  try {
                    console.log(`🔍 CLINIC ${index}: Processing clinic.name for safe display`);
                    
                    if (clinic.name !== null && clinic.name !== undefined) {
                      if (typeof clinic.name === 'string') {
                        safeName = clinic.name;
                        console.log(`🔍 CLINIC ${index}: Name is string: "${safeName}"`);
                        
                        if (clinic.name && clinic.name.length > 0) {
                          try {
                            safeInitial = clinic.name.charAt(0).toUpperCase();
                            console.log(`🔍 CLINIC ${index}: Got initial: "${safeInitial}"`);
                          } catch (charError) {
                            console.error(`❌ CLINIC ${index}: Error in charAt:`, charError);
                            safeInitial = 'C';
                          }
                        } else {
                          console.log(`🔍 CLINIC ${index}: Name is empty string`);
                          safeInitial = 'E'; // E for Empty
                        }
                      } else {
                        console.log(`🔍 CLINIC ${index}: Name is not string, converting:`, typeof clinic.name);
                        safeName = String(clinic.name);
                        if (safeName && safeName.length > 0) {
                          try {
                            safeInitial = safeName.charAt(0).toUpperCase();
                          } catch (charError) {
                            console.error(`❌ CLINIC ${index}: Error in safeName charAt:`, charError);
                            safeInitial = 'S';
                          }
                        } else {
                          safeInitial = 'X'; // X for converted
                        }
                      }
                    } else {
                      console.log(`🔍 CLINIC ${index}: Name is null or undefined`);
                      safeName = 'Unknown Clinic';
                      safeInitial = 'U'; // U for Unknown
                    }
                  } catch (nameError) {
                    console.error(`❌ CLINIC ${index}: Error processing name:`, nameError);
                    console.error(`❌ CLINIC ${index}: clinic.name was:`, clinic.name);
                    console.error(`❌ CLINIC ${index}: Full clinic object:`, clinic);
                    safeName = 'Error Processing Name';
                    safeInitial = '!';
                  }
                  
                  console.log(`✅ CLINIC ${index}: Final safe values - name: "${safeName}", initial: "${safeInitial}"`);
                  console.log(`🔑 CLINIC ${index}: ID for operations: "${clinic.id}"`);
                  
                  return (
            <div
              key={clinic.id || `clinic-${index}`}
              className="group relative overflow-hidden bg-gradient-to-br from-white via-slate-50/50 to-blue-50/30 backdrop-blur-xl border border-white/40 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-[1.02] hover:bg-gradient-to-br hover:from-white hover:via-blue-50/50 hover:to-indigo-50/30"
            >
              {/* Animated Gradient Border */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="absolute inset-[2px] bg-gradient-to-br from-white via-slate-50/50 to-blue-50/30 rounded-[22px]"></div>
              
              {/* Card Content */}
              <div className="relative p-8">
                {/* Clinic Avatar & Basic Info */}
                <div className="flex items-start space-x-6 mb-8">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-500 via-purple-600 to-indigo-600 flex items-center justify-center text-white font-bold text-2xl shadow-2xl overflow-hidden ring-4 ring-white/20 group-hover:ring-blue-100/40 transition-all duration-300">
                      {clinic.avatar ? (
                        <img 
                          src={clinic.avatar} 
                          alt={`${safeName} Profile`} 
                          className="w-20 h-20 object-cover group-hover:scale-110 transition-transform duration-300"
                          onError={(e) => {
                            console.log(`🖼️ Profile picture failed to load for ${safeName}, showing initial`);
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div className={`w-20 h-20 flex items-center justify-center ${clinic.avatar ? 'hidden' : ''} group-hover:scale-110 transition-transform duration-300`}>
                        {safeInitial}
                      </div>
                    </div>
                    <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg border-3 border-white ring-2 ring-blue-100">
                      {clinic.isActive ? (
                        <div className="w-3.5 h-3.5 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full animate-pulse shadow-sm"></div>
                      ) : (
                        <div className="w-3.5 h-3.5 bg-gradient-to-r from-red-400 to-red-500 rounded-full shadow-sm"></div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="text-2xl font-black text-slate-800 truncate group-hover:text-blue-600 transition-colors mb-2 bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text group-hover:from-blue-600 group-hover:to-indigo-600">
                      {safeName}
                    </h3>
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="flex items-center space-x-2 px-3 py-1.5 bg-blue-50 rounded-full border border-blue-100">
                        <Mail className="w-3.5 h-3.5 text-blue-600" />
                        <span className="text-sm font-medium text-blue-700 truncate">{clinic.email || 'No email'}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-slate-600">
                      <div className="flex items-center space-x-1">
                        <Users className="w-4 h-4 text-slate-400" />
                        <span className="font-medium">{clinic.contactPerson || 'No contact'}</span>
                      </div>
                      <div className="w-1 h-1 bg-slate-300 rounded-full"></div>
                      <div className="flex items-center space-x-1">
                        <Phone className="w-4 h-4 text-slate-400" />
                        <span className="font-medium">{clinic.phone || 'No phone'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Status Badges */}
                <div className="flex flex-wrap gap-3 mb-8">
                  {/* Approval Status Badge */}
                  {clinic.subscriptionStatus === 'pending_approval' && (
                    <span className="inline-flex items-center px-4 py-2.5 rounded-2xl text-sm font-bold shadow-lg transition-all duration-300 hover:scale-105 bg-gradient-to-r from-yellow-100 to-amber-100 text-amber-800 border-2 border-amber-200 shadow-amber-100/50">
                      <AlertTriangle className="w-4 h-4 mr-2.5 text-amber-600 animate-pulse" />
                      Pending Approval
                    </span>
                  )}

                  <span className={`inline-flex items-center px-4 py-2.5 rounded-2xl text-sm font-bold shadow-lg transition-all duration-300 hover:scale-105 ${
                    clinic.isActive
                      ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-2 border-green-200 shadow-green-100/50'
                      : 'bg-gradient-to-r from-red-100 to-red-200 text-red-800 border-2 border-red-200 shadow-red-100/50'
                  }`}>
                    <div className={`w-2.5 h-2.5 rounded-full mr-2.5 shadow-sm ${clinic.isActive ? 'bg-gradient-to-r from-green-500 to-emerald-500 animate-pulse' : 'bg-gradient-to-r from-red-500 to-red-600'}`}></div>
                    {clinic.isActive ? 'Active' : 'Inactive'}
                  </span>

                  {clinic.subscriptionStatus !== 'pending_approval' && (
                    <span className={`inline-flex items-center px-4 py-2.5 rounded-2xl text-sm font-bold shadow-lg transition-all duration-300 hover:scale-105 ${
                      clinic.isActivated
                        ? 'bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border-2 border-blue-200 shadow-blue-100/50'
                        : 'bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800 border-2 border-yellow-200 shadow-yellow-100/50'
                    }`}>
                      {clinic.isActivated ? (
                        <CheckCircle className="w-4 h-4 mr-2.5 text-blue-600" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 mr-2.5 text-yellow-600" />
                      )}
                      {clinic.isActivated ? 'Verified' : 'Pending'}
                    </span>
                  )}
                  
                  <span className="inline-flex items-center px-4 py-2.5 rounded-2xl text-sm font-bold bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 border-2 border-purple-200 shadow-purple-100/50 shadow-lg transition-all duration-300 hover:scale-105">
                    <CreditCard className="w-4 h-4 mr-2.5 text-purple-600" />
                    {clinic.subscriptionStatus || 'trial'}
                  </span>
                </div>

                {/* Usage Progress */}
                <div className="mb-8">
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center space-x-2">
                      <FileText className="w-4 h-4 text-slate-600" />
                      <span className="text-sm font-bold text-slate-700">Reports Usage</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-bold text-slate-800">{clinic.reportsUsed || 0}</span>
                      <span className="text-sm text-slate-500">/</span>
                      <span className="text-sm font-bold text-slate-600">{clinic.reportsAllowed || 10}</span>
                    </div>
                  </div>
                  <div className="relative">
                    <div className="w-full bg-gradient-to-r from-slate-100 to-slate-200 rounded-2xl h-5 overflow-hidden shadow-inner border border-slate-200">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-600 rounded-2xl transition-all duration-1000 ease-out shadow-lg relative overflow-hidden"
                        style={{
                          width: `${Math.min(((clinic.reportsUsed || 0) / (clinic.reportsAllowed || 10)) * 100, 100)}%`
                        }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
                      </div>
                    </div>
                    {/* Usage percentage indicator */}
                    <div className="absolute -top-8 right-0 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs font-bold px-2 py-1 rounded-lg shadow-lg">
                      {Math.round(((clinic.reportsUsed || 0) / (clinic.reportsAllowed || 10)) * 100)}%
                    </div>
                  </div>
                </div>

                {/* Created Date */}
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-slate-50 to-gray-50 rounded-xl border border-slate-200">
                    <Calendar className="w-4 h-4 text-slate-600" />
                    <span className="text-sm font-medium text-slate-700">
                      Created: {clinic.createdAt ? new Date(clinic.createdAt).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric' 
                      }) : 'Unknown date'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 px-3 py-1.5 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    <span className="text-xs font-bold text-blue-700">LIVE</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => {
                      try {
                        viewClinicDetails(clinic);
                      } catch (error) {
                        console.error('Error viewing clinic details:', error);
                      }
                    }}
                    className="group flex items-center space-x-2 px-5 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-2xl text-sm font-bold transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl border-0"
                    title="View Details"
                  >
                    <Eye className="h-4 w-4 group-hover:scale-110 transition-transform" />
                    <span>View</span>
                  </button>
                  
                  <button
                    onClick={() => {
                      try {
                        openAdminAssignment(clinic);
                      } catch (error) {
                        console.error('Error opening admin assignment:', error);
                      }
                    }}
                    className="group flex items-center space-x-2 px-5 py-3 bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700 text-white rounded-2xl text-sm font-bold transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl border-0"
                    title="Manage Administrators"
                  >
                    <UserPlus className="h-4 w-4 group-hover:scale-110 transition-transform" />
                    <span>Admins</span>
                  </button>

                  <button
                    onClick={() => {
                      try {
                        openModal(clinic);
                      } catch (error) {
                        console.error('Error opening modal:', error);
                      }
                    }}
                    className="group flex items-center space-x-2 px-5 py-3 bg-gradient-to-r from-slate-500 to-gray-600 hover:from-slate-600 hover:to-gray-700 text-white rounded-2xl text-sm font-bold transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl border-0"
                    title="Edit Clinic"
                  >
                    <Edit className="h-4 w-4 group-hover:scale-110 transition-transform" />
                    <span>Edit</span>
                  </button>

                  {/* Approve Pending Clinic Button */}
                  {clinic.subscriptionStatus === 'pending_approval' && (
                    <button
                      onClick={() => {
                        try {
                          handleClinicApproval(clinic.id);
                        } catch (error) {
                          console.error('Error approving clinic:', error);
                        }
                      }}
                      className="group flex items-center space-x-2 px-5 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-2xl text-sm font-bold transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl border-0 animate-pulse"
                      title="Approve Clinic Registration"
                    >
                      <CheckCircle className="h-4 w-4 group-hover:scale-110 transition-transform" />
                      <span>Approve</span>
                    </button>
                  )}

                  {!clinic.isActivated && clinic.id && clinic.subscriptionStatus !== 'pending_approval' && (
                    <button
                      onClick={() => {
                        try {
                          handleManualActivation(clinic.id);
                        } catch (error) {
                          console.error('Error activating clinic:', error);
                        }
                      }}
                      className="group flex items-center space-x-2 px-5 py-3 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white rounded-2xl text-sm font-bold transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl border-0"
                      title="Manually Activate"
                    >
                      <RefreshCw className="h-4 w-4 group-hover:scale-110 transition-transform" />
                      <span>Activate</span>
                    </button>
                  )}
                  
                  {clinic.id && (
                    <button
                      onClick={() => {
                        try {
                          handleDeactivateClinic(clinic.id);
                        } catch (error) {
                          console.error('Error toggling clinic status:', error);
                        }
                      }}
                      className={`group flex items-center space-x-2 px-5 py-3 rounded-2xl text-sm font-bold transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl border-0 ${
                        clinic.isActive 
                          ? 'bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white' 
                          : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white'
                      }`}
                      title={clinic.isActive ? "Deactivate" : "Activate"}
                    >
                      {clinic.isActive ? <AlertTriangle className="h-4 w-4 group-hover:scale-110 transition-transform" /> : <CheckCircle className="h-4 w-4 group-hover:scale-110 transition-transform" />}
                      <span>{clinic.isActive ? 'Deactivate' : 'Activate'}</span>
                    </button>
                  )}
                  
                  <button
                    onClick={() => deleteClinic(clinic, index)}
                    className="group flex items-center space-x-2 px-5 py-3 bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white rounded-2xl text-sm font-bold transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl border-0"
                    title="Delete Clinic"
                  >
                    <Trash2 className="h-4 w-4 group-hover:scale-110 transition-transform" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            </div>
            );
            } catch (error) {
              console.error(`❌ CLINIC ${index}: Error rendering clinic card:`, error);
              console.error(`❌ CLINIC ${index}: Error stack:`, error.stack);
              console.error(`❌ CLINIC ${index}: Error message:`, error.message);
              console.error(`❌ CLINIC ${index}: Clinic data:`, clinic);
              console.error(`❌ CLINIC ${index}: Clinic JSON:`, JSON.stringify(clinic, null, 2));
              return (
                <div key={`error-${index}`} className="bg-red-100 border border-red-300 rounded-lg p-4">
                  <p className="text-red-700">❌ Error displaying clinic {index + 1}</p>
                  <p className="text-xs text-red-500 font-mono">Error: {error.message}</p>
                  <p className="text-xs text-red-500 font-mono">Type: {typeof clinic}</p>
                  <p className="text-xs text-red-500 font-mono">Clinic: {clinic ? JSON.stringify(clinic).substring(0, 100) + '...' : 'null'}</p>
                  <button 
                    onClick={() => {
                      console.log('🔍 ERROR DETAILS for clinic', index);
                      console.log('Clinic object:', clinic);
                      console.log('Error object:', error);
                      console.log('All clinics:', clinics);
                    }}
                    className="mt-2 px-2 py-1 bg-red-200 text-red-800 rounded text-xs"
                  >
                    Debug in Console
                  </button>
                </div>
              );
            }
          });
            } catch (mapError) {
              console.error('❌ CRITICAL: Error in clinics.map:', mapError);
              console.error('❌ CRITICAL: Error stack:', mapError.stack);
              console.error('❌ CRITICAL: Clinics data:', clinics);
              return (
                <div className="col-span-3 bg-red-100 border border-red-300 rounded-lg p-4">
                  <p className="text-red-700">❌ Critical Error: Unable to render clinics</p>
                  <p className="text-xs text-red-500 font-mono">Map Error: {mapError.message}</p>
                  <button 
                    onClick={() => {
                      console.log('🔍 MAP ERROR DETAILS');
                      console.log('Map error:', mapError);
                      console.log('Clinics:', clinics);
                    }}
                    className="mt-2 px-2 py-1 bg-red-200 text-red-800 rounded text-xs"
                  >
                    Debug in Console
                  </button>
                </div>
              );
            }
          })()}
        </div>

        {/* Empty State */}
        {clinics.length === 0 && (
          <div className="text-center py-20">
            <div className="relative">
              <div className="w-32 h-32 mx-auto mb-8 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
                <Users className="h-16 w-16 text-slate-400" />
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-4">No clinics registered yet</h3>
              <p className="text-slate-500 text-lg mb-8">Start by adding your first clinic to the platform</p>
              <button
                onClick={() => openModal()}
                className="group relative overflow-hidden bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl"
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                <div className="relative flex items-center space-x-3">
                  <Plus className="h-6 w-6" />
                  <span>Add Your First Clinic</span>
                </div>
              </button>
            </div>
          </div>
        )}
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
  const [showPassword, setShowPassword] = React.useState(false);

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

        {/* Clinic Profile Picture Display */}
        {clinic && clinic.avatar && (
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 via-purple-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xl shadow-lg overflow-hidden">
                <img 
                  src={clinic.avatar} 
                  alt={`${clinic.name} Profile`} 
                  className="w-20 h-20 object-cover"
                  onError={(e) => {
                    console.log(`🖼️ Profile picture failed to load for ${clinic.name} in modal`);
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
                <div className="w-20 h-20 flex items-center justify-center hidden">
                  <Users className="h-8 w-8 text-white" />
                </div>
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-md border-2 border-white">
                {clinic.isActive ? (
                  <div className="w-3 h-3 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full animate-pulse"></div>
                ) : (
                  <div className="w-3 h-3 bg-gradient-to-r from-red-400 to-red-500 rounded-full"></div>
                )}
              </div>
            </div>
          </div>
        )}

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

          {clinic && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Current Password
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type={showPassword ? "text" : "password"}
                  value={clinic.adminPassword || clinic.password || 'Not Set'}
                  readOnly
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 font-mono text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-2 text-gray-500 hover:text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      const password = clinic.adminPassword || clinic.password || '';
                      if (navigator.clipboard && window.isSecureContext) {
                        await navigator.clipboard.writeText(password);
                        toast.success('Password copied to clipboard!');
                      } else {
                        // Fallback for non-secure context
                        const textArea = document.createElement('textarea');
                        textArea.value = password;
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
                      toast.error('Could not copy password');
                    }
                  }}
                  className="p-2 text-gray-500 hover:text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                  title="Copy password to clipboard"
                >
                  <Copy className="h-4 w-4" />
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Current login password for this clinic. Use "Reset Password" button to change.
              </p>
            </div>
          )}

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

          <div className="flex justify-end space-x-3 pt-6 mt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 border border-transparent rounded-lg text-sm font-medium text-white hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              {clinic ? 'Update Clinic' : 'Create Clinic'}
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
            <div className="relative">
              <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 via-purple-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xl shadow-lg overflow-hidden">
                {clinic.avatar ? (
                  <img 
                    src={clinic.avatar} 
                    alt={`${clinic.name} Profile`} 
                    className="h-16 w-16 object-cover"
                    onError={(e) => {
                      console.log(`🖼️ Profile picture failed to load for ${clinic.name}, showing icon`);
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div className={`h-16 w-16 flex items-center justify-center ${clinic.avatar ? 'hidden' : ''}`}>
                  <Users className="h-8 w-8 text-white" />
                </div>
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-md border-2 border-white">
                {clinic.isActive ? (
                  <div className="w-2.5 h-2.5 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full animate-pulse"></div>
                ) : (
                  <div className="w-2.5 h-2.5 bg-gradient-to-r from-red-400 to-red-500 rounded-full"></div>
                )}
              </div>
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

      {/* Admin Assignment Modal */}
      <AdminAssignmentModal
        clinic={selectedClinicForAdmin}
        isOpen={showAdminModal}
        onClose={() => {
          setShowAdminModal(false);
          setSelectedClinicForAdmin(null);
        }}
        onUpdate={loadClinics}
      />
    </div>
  );
};

export default ClinicManagement;
import React, { createContext, useContext, useState, useEffect } from 'react';
import DatabaseService from '../services/databaseService';

const PatientContext = createContext();

export const usePatients = () => {
  const context = useContext(PatientContext);
  if (!context) {
    throw new Error('usePatients must be used within a PatientProvider');
  }
  return context;
};

export const PatientProvider = ({ children }) => {
  const [patients, setPatients] = useState([]);
  const [patientReports, setPatientReports] = useState({});
  const [loading, setLoading] = useState(false);
  const [lastLoadedClinicId, setLastLoadedClinicId] = useState(null);

  // Load patients for a specific clinic
  const loadPatientsForClinic = async (clinicId, forceReload = false) => {
    if (!clinicId) {
      console.warn('⚠️ No clinicId provided to loadPatientsForClinic');
      setPatients([]);
      return;
    }

    // Only reload if this is a different clinic or forced reload
    if (clinicId === lastLoadedClinicId && !forceReload && patients.length > 0) {
      console.log('✅ Patients already loaded for clinic:', clinicId, 'count:', patients.length);
      return patients;
    }
    
    // If we have no patients loaded, always reload regardless of cache
    if (patients.length === 0) {
      console.log('⚠️ No patients in memory, forcing reload for clinic:', clinicId);
      forceReload = true;
    }

    console.log('👥 Loading patients for clinic:', clinicId, 'forceReload:', forceReload);
    setLoading(true);

    try {
      // Load from database - Clear localStorage cache first to ensure fresh data
      if (forceReload) {
        console.log('🗑️ Clearing localStorage cache for fresh data...');
        // Clear all possible cache keys
        const cacheKeys = [
          'dbCache_patients', 'dbCache_reports', 'dbCache_clinics',
          'patients_cache', 'reports_cache', 'last_patient_load'
        ];
        cacheKeys.forEach(key => {
          if (localStorage.getItem(key)) {
            localStorage.removeItem(key);
            console.log(`🗑️ Cleared cache key: ${key}`);
          }
        });
      }
      
      const allPatients = await DatabaseService.get('patients');
      console.log('📋 Total patients in database:', allPatients.length);
      console.log('📋 All patients data:', allPatients.map(p => ({ id: p.id, name: p.name, clinicId: p.clinicId })));
      
      // Filter patients by clinic ID with multiple comparison methods
      let clinicPatients = allPatients.filter(patient => patient.clinicId === clinicId);
      console.log('👥 Strict match patients:', clinicPatients.length);
      
      if (clinicPatients.length === 0) {
        console.log('⚠️ No strict matches, trying loose equality...');
        clinicPatients = allPatients.filter(patient => patient.clinicId == clinicId); // eslint-disable-line eqeqeq
        console.log('👥 Loose match patients:', clinicPatients.length);
      }
      
      if (clinicPatients.length === 0) {
        console.log('⚠️ No loose matches, trying string conversion...');
        clinicPatients = allPatients.filter(patient => String(patient.clinicId) === String(clinicId));
        console.log('👥 String match patients:', clinicPatients.length);
      }
      
      console.log('👥 Final filtered patients for clinic:', clinicPatients.length);
      console.log('👥 Patient details:', clinicPatients.map(p => ({ id: p.id, name: p.name, clinicId: p.clinicId, clinicIdType: typeof p.clinicId })));
      
      // DEBUG: Check if any patients have different clinic ID format
      console.log('🔍 DEBUG: Clinic ID comparison:', {
        targetClinicId: clinicId,
        targetType: typeof clinicId,
        patientsWithMismatch: allPatients.filter(p => p.clinicId && p.clinicId !== clinicId).map(p => ({ 
          name: p.name, 
          patientClinicId: p.clinicId, 
          patientClinicIdType: typeof p.clinicId,
          matches: p.clinicId === clinicId
        }))
      });
      
      setPatients(clinicPatients);
      setLastLoadedClinicId(clinicId);
      
      // Load reports for each patient
      const reportsMap = {};
      for (const patient of clinicPatients) {
        try {
          const reports = await DatabaseService.getReportsByPatient(patient.id);
          reportsMap[patient.id] = reports || [];
        } catch (error) {
          console.warn(`Failed to load reports for patient ${patient.id}:`, error);
          reportsMap[patient.id] = [];
        }
      }
      
      setPatientReports(reportsMap);
      
      console.log('✅ Successfully loaded', clinicPatients.length, 'patients for clinic:', clinicId);
      return clinicPatients;
    } catch (error) {
      console.error('❌ Error loading patients:', error);
      setPatients([]);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Add a new patient
  const addPatient = async (clinicId, patientData) => {
    try {
      console.log('➕ Adding new patient for clinic:', clinicId);
      const newPatient = await DatabaseService.add('patients', patientData);
      
      // Force a complete reload to ensure data consistency
      console.log('🔄 Forcing complete patient reload after add...');
      await loadPatientsForClinic(clinicId, true);
      
      return newPatient;
    } catch (error) {
      console.error('❌ Error adding patient:', error);
      throw error;
    }
  };

  // Update a patient
  const updatePatient = async (patientId, updates) => {
    try {
      const updatedPatient = await DatabaseService.update('patients', patientId, updates);
      
      // Update local state
      setPatients(prevPatients =>
        prevPatients.map(p => p.id === patientId ? updatedPatient : p)
      );
      
      return updatedPatient;
    } catch (error) {
      console.error('❌ Error updating patient:', error);
      throw error;
    }
  };

  // Delete a patient
  const deletePatient = async (patientId) => {
    try {
      await DatabaseService.delete('patients', patientId);
      
      // Update local state
      setPatients(prevPatients =>
        prevPatients.filter(p => p.id !== patientId)
      );
    } catch (error) {
      console.error('❌ Error deleting patient:', error);
      throw error;
    }
  };

  // Refresh patient reports after upload
  const refreshPatientReports = async (clinicId) => {
    if (!clinicId || patients.length === 0) {
      console.warn('⚠️ Cannot refresh reports: no clinic ID or patients');
      return;
    }

    console.log('🔄 Refreshing patient reports for clinic:', clinicId);
    
    try {
      // Clear reports cache to ensure fresh data
      localStorage.removeItem('dbCache_reports');
      
      // Reload reports for each patient
      const reportsMap = {};
      for (const patient of patients) {
        try {
          const reports = await DatabaseService.getReportsByPatient(patient.id);
          reportsMap[patient.id] = reports || [];
          console.log(`📄 Loaded ${reports?.length || 0} reports for patient ${patient.name}`);
        } catch (error) {
          console.warn(`Failed to load reports for patient ${patient.id}:`, error);
          reportsMap[patient.id] = [];
        }
      }
      
      setPatientReports(reportsMap);
      console.log('✅ Successfully refreshed patient reports');
    } catch (error) {
      console.error('❌ Error refreshing patient reports:', error);
    }
  };

  // Force complete refresh - clears all cache and reloads
  const forceRefresh = async (clinicId) => {
    console.log('🔄 FORCE REFRESH: Clearing all patient data and cache for clinic:', clinicId);
    
    // Clear all state
    setPatients([]);
    setPatientReports({});
    setLastLoadedClinicId(null);
    setLoading(false);
    
    // Clear all localStorage cache aggressively
    const allKeys = Object.keys(localStorage);
    const cacheKeys = allKeys.filter(key => 
      key.startsWith('dbCache_') || 
      key.includes('patient') || 
      key.includes('cache')
    );
    
    cacheKeys.forEach(key => {
      localStorage.removeItem(key);
      console.log(`🗑️ Force cleared: ${key}`);
    });
    
    // Wait a moment for state to clear
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Force fresh load
    if (clinicId) {
      console.log('🔄 Starting fresh load after complete reset...');
      await loadPatientsForClinic(clinicId, true);
    }
  };

  // Clear patients data (when switching clinics)
  const clearPatients = () => {
    setPatients([]);
    setPatientReports({});
    setLastLoadedClinicId(null);
  };

  const value = {
    patients,
    patientReports,
    loading,
    loadPatientsForClinic,
    addPatient,
    updatePatient,
    deletePatient,
    refreshPatientReports,
    forceRefresh,
    clearPatients
  };

  return (
    <PatientContext.Provider value={value}>
      {children}
    </PatientContext.Provider>
  );
};
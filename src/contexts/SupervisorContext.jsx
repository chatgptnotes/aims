import React, { createContext, useContext, useState, useEffect } from 'react';
import DatabaseService from '../services/databaseService';

const SupervisorContext = createContext();

export const useSupervisors = () => {
  const context = useContext(SupervisorContext);
  if (!context) {
    throw new Error('useSupervisors must be used within a SupervisorProvider');
  }
  return context;
};

export const SupervisorProvider = ({ children }) => {
  const [supervisors, setSupervisors] = useState([]);
  const [supervisorReports, setSupervisorReports] = useState({});
  const [loading, setLoading] = useState(false);
  const [lastLoadedClinicId, setLastLoadedClinicId] = useState(null);

  // Load supervisors for a specific clinic
  const loadSupervisorsForClinic = async (clinicId, forceReload = false) => {
    if (!clinicId) {
      console.warn('WARNING: No clinicId provided to loadSupervisorsForClinic');
      setSupervisors([]);
      return;
    }

    // Only reload if this is a different clinic or forced reload
    if (clinicId === lastLoadedClinicId && !forceReload && supervisors.length > 0) {
      console.log('SUCCESS: Supervisors already loaded for clinic:', clinicId, 'count:', supervisors.length);
      return supervisors;
    }

    // If we have no supervisors loaded, always reload regardless of cache
    if (supervisors.length === 0) {
      console.log('WARNING: No supervisors in memory, forcing reload for clinic:', clinicId);
      forceReload = true;
    }

    console.log(' Loading supervisors for clinic:', clinicId, 'forceReload:', forceReload);
    setLoading(true);

    try {
      // Load from database - Clear localStorage cache first to ensure fresh data
      if (forceReload) {
        console.log('DELETE: Clearing localStorage cache for fresh data...');
        // Clear all possible cache keys
        const cacheKeys = [
          'dbCache_patients', 'dbCache_reports', 'dbCache_clinics',
          'patients_cache', 'reports_cache', 'last_patient_load',
          'dbCache_supervisors', 'supervisors_cache', 'last_supervisor_load'
        ];
        cacheKeys.forEach(key => {
          if (localStorage.getItem(key)) {
            localStorage.removeItem(key);
            console.log(`DELETE: Cleared cache key: ${key}`);
          }
        });
      }
      
      const allSupervisors = await DatabaseService.get('patients');
      console.log('INFO: Total supervisors in database:', allSupervisors.length);
      console.log('INFO: All supervisors data:', allSupervisors.map(p => ({ id: p.id, name: p.name, clinicId: p.clinicId })));

      // Filter supervisors by clinic ID with multiple comparison methods
      let clinicSupervisors = allSupervisors.filter(supervisor => supervisor.clinicId === clinicId);
      console.log(' Strict match supervisors:', clinicSupervisors.length);

      if (clinicSupervisors.length === 0) {
        console.log('WARNING: No strict matches, trying loose equality...');
        clinicSupervisors = allSupervisors.filter(supervisor => supervisor.clinicId == clinicId); // eslint-disable-line eqeqeq
        console.log(' Loose match supervisors:', clinicSupervisors.length);
      }

      if (clinicSupervisors.length === 0) {
        console.log('WARNING: No loose matches, trying string conversion...');
        clinicSupervisors = allSupervisors.filter(supervisor => String(supervisor.clinicId) === String(clinicId));
        console.log(' String match supervisors:', clinicSupervisors.length);
      }

      console.log(' Final filtered supervisors for clinic:', clinicSupervisors.length);
      console.log(' Supervisor details:', clinicSupervisors.map(p => ({ id: p.id, name: p.name, clinicId: p.clinicId, clinicIdType: typeof p.clinicId })));
      
      // DEBUG: Check if any supervisors have different clinic ID format
      console.log('DEBUG: DEBUG: Clinic ID comparison:', {
        targetClinicId: clinicId,
        targetType: typeof clinicId,
        supervisorsWithMismatch: allSupervisors.filter(p => p.clinicId && p.clinicId !== clinicId).map(p => ({
          name: p.name,
          supervisorClinicId: p.clinicId,
          supervisorClinicIdType: typeof p.clinicId,
          matches: p.clinicId === clinicId
        }))
      });

      setSupervisors(clinicSupervisors);
      setLastLoadedClinicId(clinicId);

      // Load reports for each supervisor
      const reportsMap = {};
      for (const supervisor of clinicSupervisors) {
        try {
          const reports = await DatabaseService.getReportsByPatient(supervisor.id);
          reportsMap[supervisor.id] = reports || [];
        } catch (error) {
          console.warn(`Failed to load reports for supervisor ${supervisor.id}:`, error);
          reportsMap[supervisor.id] = [];
        }
      }

      setSupervisorReports(reportsMap);

      console.log('SUCCESS: Successfully loaded', clinicSupervisors.length, 'supervisors for clinic:', clinicId);
      return clinicSupervisors;
    } catch (error) {
      console.error('ERROR: Error loading supervisors:', error);
      setSupervisors([]);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Add a new supervisor
  const addSupervisor = async (clinicId, supervisorData) => {
    try {
      console.log(' Adding new supervisor for clinic:', clinicId);
      const newSupervisor = await DatabaseService.add('patients', supervisorData);

      // Force a complete reload to ensure data consistency
      console.log('REFRESH: Forcing complete supervisor reload after add...');
      await loadSupervisorsForClinic(clinicId, true);

      return newSupervisor;
    } catch (error) {
      console.error('ERROR: Error adding supervisor:', error);
      throw error;
    }
  };

  // Update a supervisor
  const updateSupervisor = async (patientId, updates) => {
    try {
      const updatedSupervisor = await DatabaseService.update('patients', patientId, updates);

      // Update local state
      setSupervisors(prevSupervisors =>
        prevSupervisors.map(p => p.id === patientId ? updatedSupervisor : p)
      );

      return updatedSupervisor;
    } catch (error) {
      console.error('ERROR: Error updating supervisor:', error);
      throw error;
    }
  };

  // Delete a supervisor
  const deleteSupervisor = async (patientId) => {
    try {
      await DatabaseService.delete('patients', patientId);

      // Update local state
      setSupervisors(prevSupervisors =>
        prevSupervisors.filter(p => p.id !== patientId)
      );
    } catch (error) {
      console.error('ERROR: Error deleting supervisor:', error);
      throw error;
    }
  };

  // Refresh supervisor reports after upload
  const refreshSupervisorReports = async (clinicId) => {
    if (!clinicId || supervisors.length === 0) {
      console.warn('WARNING: Cannot refresh reports: no clinic ID or supervisors');
      return;
    }

    console.log('REFRESH: Refreshing supervisor reports for clinic:', clinicId);

    try {
      // Clear reports cache to ensure fresh data
      localStorage.removeItem('dbCache_reports');

      // Reload reports for each supervisor
      const reportsMap = {};
      for (const supervisor of supervisors) {
        try {
          const reports = await DatabaseService.getReportsByPatient(supervisor.id);
          reportsMap[supervisor.id] = reports || [];
          console.log(`FILE: Loaded ${reports?.length || 0} reports for supervisor ${supervisor.name}`);
        } catch (error) {
          console.warn(`Failed to load reports for supervisor ${supervisor.id}:`, error);
          reportsMap[supervisor.id] = [];
        }
      }

      setSupervisorReports(reportsMap);
      console.log('SUCCESS: Successfully refreshed supervisor reports');
    } catch (error) {
      console.error('ERROR: Error refreshing supervisor reports:', error);
    }
  };

  // Force complete refresh - clears all cache and reloads
  const forceRefresh = async (clinicId) => {
    console.log('REFRESH: FORCE REFRESH: Clearing all supervisor data and cache for clinic:', clinicId);

    // Clear all state
    setSupervisors([]);
    setSupervisorReports({});
    setLastLoadedClinicId(null);
    setLoading(false);

    // Clear all localStorage cache aggressively
    const allKeys = Object.keys(localStorage);
    const cacheKeys = allKeys.filter(key =>
      key.startsWith('dbCache_') ||
      key.includes('patient') ||
      key.includes('supervisor') ||
      key.includes('cache')
    );

    cacheKeys.forEach(key => {
      localStorage.removeItem(key);
      console.log(`DELETE: Force cleared: ${key}`);
    });

    // Wait a moment for state to clear
    await new Promise(resolve => setTimeout(resolve, 100));

    // Force fresh load
    if (clinicId) {
      console.log('REFRESH: Starting fresh load after complete reset...');
      await loadSupervisorsForClinic(clinicId, true);
    }
  };

  // Clear supervisors data (when switching clinics)
  const clearSupervisors = () => {
    setSupervisors([]);
    setSupervisorReports({});
    setLastLoadedClinicId(null);
  };

  const value = {
    supervisors,
    supervisorReports,
    loading,
    loadSupervisorsForClinic,
    addSupervisor,
    updateSupervisor,
    deleteSupervisor,
    refreshSupervisorReports,
    forceRefresh,
    clearSupervisors
  };

  return (
    <SupervisorContext.Provider value={value}>
      {children}
    </SupervisorContext.Provider>
  );
};
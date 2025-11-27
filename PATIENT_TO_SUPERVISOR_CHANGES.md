# Patient to Supervisor Terminology Migration

## Summary
Systematically replaced all occurrences of "patient" and "patients" with "supervisor" and "supervisors" throughout the codebase while preserving database field names and table names for backward compatibility.

## Key Files Renamed

### Context Files
- `src/contexts/PatientContext.jsx` → `src/contexts/SupervisorContext.jsx`
  - `PatientContext` → `SupervisorContext`
  - `PatientProvider` → `SupervisorProvider`
  - `usePatients()` → `useSupervisors()`

### Utility Files
- `src/utils/patientUidGenerator.js` → `src/utils/supervisorUidGenerator.js`
  - `generatePatientUID()` → `generateSupervisorUID()`
  - `validatePatientUID()` → `validateSupervisorUID()`
  - `parsePatientUID()` → `parseSupervisorUID()`
  - Added backward compatibility exports

- `src/utils/applyPatientUidMigration.js` → `src/utils/applySupervisorUidMigration.js`
- `src/utils/runPatientUidMigration.js` → `src/utils/runSupervisorUidMigration.js`

### Component Files
- `src/components/admin/PatientReports.jsx` → `src/components/admin/SupervisorReports.jsx`

## Database Compatibility

### Preserved (No Changes)
- Database table name: `patients` (kept for DB compatibility)
- Database field names: `patient_id`, `patientId` (kept for DB compatibility)
- Internal API endpoints that refer to database operations

### Updated
- Service method: `getPatientsByClinic()` → `getSupervisorsByClinic()`
- All display text, labels, comments, and error messages
- Component names and function names
- Variable names in JavaScript/React code

## Categories of Changes

### 1. Display Text & Labels
- "Patient" → "Supervisor"
- "patient" → "supervisor"
- "Patients" → "Supervisors"
- "patients" → "supervisors"

### 2. Variable Names
- `patients` → `supervisors`
- `setPatients` → `setSupervisors`
- `patientReports` → `supervisorReports`
- `selectedPatient` → `selectedSupervisor`
- `clinicPatients` → `clinicSupervisors`
- `totalPatients` → `totalSupervisors`
- `filteredPatients` → `filteredSupervisors`

### 3. Function Names
- `loadPatientsForClinic()` → `loadSupervisorsForClinic()`
- `addPatient()` → `addSupervisor()`
- `updatePatient()` → `updateSupervisor()`
- `deletePatient()` → `deleteSupervisor()`
- `refreshPatientReports()` → `refreshSupervisorReports()`
- `clearPatients()` → `clearSupervisors()`

### 4. Component Names
- `PatientReports` → `SupervisorReports`
- `PatientProvider` → `SupervisorProvider`
- `PatientContext` → `SupervisorContext`

## Files Updated

### Core Context & Utils
- src/contexts/SupervisorContext.jsx
- src/utils/supervisorUidGenerator.js
- src/utils/applySupervisorUidMigration.js
- src/utils/runSupervisorUidMigration.js

### Admin Components
- src/components/admin/SupervisorReports.jsx
- src/components/admin/AdminDashboard.jsx
- src/components/admin/ClinicManagement.jsx
- src/components/admin/SuperAdminPanel.jsx
- src/components/admin/SuperAdminPanel_OLD.jsx
- src/components/admin/AlgorithmDataProcessor.jsx

### Engineer Components
- src/components/engineer/EngineerDashboard.jsx
- src/components/engineer/AddSupervisorForm.jsx
- src/components/engineer/SupervisorManagement.jsx
- src/components/engineer/OverviewTab.jsx
- src/components/engineer/ReportViewer.jsx
- src/components/engineer/AdvancedAnalytics.jsx
- src/components/engineer/ClinicDashboard_OLD.jsx

### Supervisor Components
- src/components/supervisor/SupervisorDashboard.jsx

### Services
- src/services/databaseService.js
- src/services/authService.js
- src/services/storageService.js
- src/services/supabaseService.js
- src/services/reportWorkflowService.js

### Other Components
- All other component files with patient references in display text

## Backward Compatibility

The following backward compatibility measures were implemented:

1. Database table name `patients` remains unchanged
2. Database field names `patient_id`, `patientId` remain unchanged
3. Backward compatibility exports added in supervisorUidGenerator.js:
   ```javascript
   export const generatePatientUID = generateSupervisorUID;
   export const validatePatientUID = validateSupervisorUID;
   export const parsePatientUID = parseSupervisorUID;
   ```

## Testing Recommendations

1. Test all supervisor management operations (add, edit, delete)
2. Verify supervisor reports upload and viewing
3. Check supervisor dashboard functionality
4. Ensure engineer dashboard displays supervisors correctly
5. Verify admin panel supervisor management
6. Test all database queries still work with `patients` table
7. Verify imports and module resolution

## Notes

- The terminology change is primarily cosmetic for the UI layer
- Database schema remains unchanged for backward compatibility
- All internal references to "patient" in variable names, display text, and comments have been updated to "supervisor"
- The application should continue to function identically with the new terminology

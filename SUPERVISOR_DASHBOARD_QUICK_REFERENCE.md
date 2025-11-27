# Supervisor Dashboard - Quick Reference Guide

## Component Location
`/src/components/supervisor/SupervisorDashboard.jsx`

## Access URLs
- `/patient` - Main supervisor dashboard (legacy route)
- `/patient/dashboard` - Supervisor dashboard (legacy route)  
- `/dashboard` - Smart router (redirects based on role)
- `/dashboard/profile` - Profile tab
- `/dashboard/reports` - Reports tab
- `/dashboard/resources` - Resources tab
- `/dashboard/journey` - Journey tab

## State Variables (Fixed)

### Primary State
```javascript
const [supervisorData, setSupervisorData] = useState({
  profile: { name, email, phone, dateOfBirth, address, emergencyContact },
  clinic: { name, address, phone, email, doctorName },
  reports: [...],
  carePlans: [...],
  resources: [...]
});
```

### Additional State
```javascript
const [supervisorUid, setSupervisorUid] = useState(null);
const [supervisorReports, setSupervisorReports] = useState([]);
const [clinicalReport, setClinicalReport] = useState(null);
const [profileImageUrl, setProfileImageUrl] = useState(null);
const [loading, setLoading] = useState(true);
```

## Key Functions

### Data Loading
- `loadSupervisorData()` - Loads supervisor profile from database
- `fetchClinicalReport(supervisorId)` - Fetches clinical report
- `fetchSupervisorReports(supervisorId)` - Fetches all reports
- `reloadProfileImage()` - Reloads profile image from database

### Data Flow
1. Component mounts → `loadSupervisorData()` triggered via useEffect
2. Searches for supervisor by ID, then by email if not found
3. Loads project area data if available
4. Fetches clinical report and supervisor reports
5. Sets loading to false

## Database Tables Used
- `supervisors` - Main supervisor records
- `project_areas` or `clinics` (fallback) - Project area information
- `clinical_reports` - Supervisor clinical reports (filtered by `supervisor_id`)

## Error Handling
All major operations have try-catch blocks with:
- Console logging (INFO, WARNING, ERROR levels)
- Toast notifications for user-facing errors
- Fallback data when database fails

## UI Sections

### 1. Profile & History Tab
- Personal Details (name, email, phone, DOB, address, emergency contact)
- Project Area Information (name, contact, phone, email, address)
- Clinical Report (if available)
- Supervisor UID display

### 2. Reports & Plans Tab
- Clinical reports list
- Care plans (sample data)
- Expandable report details

### 3. Resources Tab
- Learning resources (sample data)
- Unlockable content

### 4. Journey Tab
- Progress tracking (sample data)
- Assessment scheduling

## Terminology Mapping

### Old (Medical) → New (Industrial)
- Patient → Supervisor
- Clinic → Project Area
- Doctor → Contact
- Patient UID → Supervisor UID
- Medical conditions → Industrial safety parameters

## Common Issues & Solutions

### Issue: "Cannot access 'supervisorData' before initialization"
**Solution:** ✅ Fixed - State now declared before useEffect

### Issue: No data loading
**Check:**
1. Supervisor exists in `supervisors` table
2. Email matches exactly (case-insensitive)
3. Check browser console for detailed logs
4. Verify Supabase connection

### Issue: Profile image not showing
**Check:**
1. `profile_image` or `avatar_url` field in supervisors table
2. Image URL is accessible
3. Check browser console for load errors

### Issue: Reports not appearing
**Check:**
1. `clinical_reports` table has records with matching `supervisor_id`
2. RLS policies allow supervisor to read their own reports
3. Check console for database errors

## Developer Notes

### Adding New Fields
1. Add to `supervisorData` state (lines 60-124)
2. Add to database load logic in `loadSupervisorData()` (lines 350-380)
3. Add to UI in relevant section (ProfileSection, etc.)

### Modifying Database Queries
- All queries use `DatabaseService` abstraction
- Fallback patterns: Try new table name first, then old
- Always include error handling with toast notifications

### Testing Locally
1. Login as a user with role "patient" (supervisor)
2. Navigate to `/patient` or `/dashboard`
3. Check browser console for detailed logs
4. Verify all sections load correctly

## Performance Considerations
- Data loads once on component mount
- Profile image reloads after updates
- No automatic polling (manual refresh required)
- Large report lists may need pagination (future enhancement)


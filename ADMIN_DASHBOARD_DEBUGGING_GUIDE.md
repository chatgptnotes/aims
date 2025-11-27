# Admin Dashboard Debugging Guide

## Quick Diagnostic Steps

### Step 1: Check Browser Console
Open browser DevTools (F12) and look for these messages:

#### Successful Load:
```
SUPERADMIN: SuperAdmin loading all system data...
SUCCESS: Loaded project areas (clinics): 5
SUCCESS: Loaded supervisors (patients): 12
SUCCESS: Loaded reports: 34
DATA: SuperAdmin system overview: {...}
```

#### Failed Load:
```
WARNING: Failed to load project areas: [error message]
ERROR: Critical error loading dashboard data: [error message]
```

### Step 2: Verify Database Connection
1. Check Supabase credentials in `.env`:
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```
2. Test connection in browser console:
   ```javascript
   await fetch(import.meta.env.VITE_SUPABASE_URL + '/rest/v1/clinics', {
     headers: {
       'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
       'Authorization': 'Bearer ' + import.meta.env.VITE_SUPABASE_ANON_KEY
     }
   }).then(r => r.json()).then(console.log)
   ```

### Step 3: Check User Authentication
Verify user has correct role:
```javascript
// In browser console
const user = JSON.parse(localStorage.getItem('user'));
console.log('User role:', user?.role);
// Should be: 'super_admin'
```

### Step 4: Verify Database Tables Exist
Run in Supabase SQL Editor:
```sql
-- Check if tables exist
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('clinics', 'patients', 'reports', 'payment_history', 'profiles');
```

### Step 5: Check RLS Policies
Run in Supabase SQL Editor:
```sql
-- Check RLS policies for clinics table
SELECT *
FROM pg_policies
WHERE tablename = 'clinics';

-- Verify data access
SELECT COUNT(*) FROM clinics;
SELECT COUNT(*) FROM patients;
SELECT COUNT(*) FROM reports;
```

## Common Errors and Solutions

### Error: "Something went wrong"
**Cause**: React Error Boundary caught an unhandled error
**Solution**:
1. Check browser console for specific error message
2. Look for "ALERT: React Error Boundary caught an error"
3. Check component stack trace
4. Verify all database tables exist
5. Ensure user has super_admin role

### Error: "Failed to load dashboard data"
**Cause**: Database connection or query failure
**Solution**:
1. Verify Supabase credentials in `.env`
2. Check network connectivity
3. Verify RLS policies allow access
4. Check Supabase project status (not paused)

### Error: "Cannot read properties of undefined"
**Cause**: Missing null checks in code
**Solution**:
1. This should be fixed by recent updates
2. If still occurs, check which property is undefined
3. Add additional null checks in code

### Error: Stats showing 0 when data exists
**Cause**: Data not loading from correct tables
**Solution**:
1. Check console for "SUCCESS: Loaded X" messages
2. Verify table name mapping is correct:
   - clinics (not project_areas)
   - patients (not supervisors)
3. Check data structure matches expected format

### Error: "TypeError: X.filter is not a function"
**Cause**: Data returned is not an array
**Solution**:
1. This should be fixed by Array.isArray() checks
2. Verify database returns array, not object or null
3. Check DatabaseService.get() implementation

## Debug Checklist

- [ ] Browser console shows no errors
- [ ] User is logged in (check localStorage)
- [ ] User role is 'super_admin'
- [ ] Supabase credentials are valid
- [ ] Database tables exist
- [ ] RLS policies allow access
- [ ] Network tab shows successful API calls
- [ ] React DevTools shows AdminDashboard component mounted
- [ ] All stat cards display (even if 0)
- [ ] No infinite loading spinner

## Verification Script

Run this in browser console while on `/admin`:
```javascript
// Quick verification
const verify = () => {
  const checks = {
    mounted: !!document.querySelector('[class*="space-y-6"]'),
    stats: document.querySelectorAll('[class*="text-2xl"]').length >= 4,
    loading: !!document.querySelector('[class*="animate-spin"]'),
    error: !!document.querySelector('[class*="bg-red"]'),
  };

  console.table(checks);

  return {
    status: checks.mounted && checks.stats && !checks.error ? '✅ Working' : '❌ Issues Found',
    details: checks
  };
};

verify();
```

Or run the full verification script:
```javascript
// Load and run verification script
fetch('/verify-admin-dashboard.js')
  .then(r => r.text())
  .then(eval);
```

## Performance Issues

### Dashboard loads slowly
**Check**:
1. Number of records in each table
2. Network latency to Supabase
3. Browser DevTools Network tab for slow queries

**Solutions**:
- Add pagination for large datasets
- Implement caching with React Query or SWR
- Optimize Supabase indexes

### Memory leaks
**Check**:
1. React DevTools Profiler
2. Chrome DevTools Memory tab

**Solutions**:
- Verify useEffect cleanup functions
- Check for unmounted component state updates
- Clear intervals/timeouts properly

## Production Deployment Checklist

Before deploying fixes:
- [ ] Test on local development
- [ ] Test with empty database
- [ ] Test with populated database
- [ ] Test with network failure simulation
- [ ] Test with invalid credentials
- [ ] Test all navigation buttons
- [ ] Test on mobile/tablet/desktop
- [ ] Test light and dark modes
- [ ] Review console logs (no sensitive data)
- [ ] Check error tracking (Sentry/etc.)

## Monitoring in Production

### What to monitor:
1. Error rate on `/admin` route
2. Load time for dashboard
3. Database query performance
4. User complaints/support tickets

### Logging to watch for:
- Frequent "WARNING: Failed to load" messages
- Repeated "ERROR: Critical error" messages
- Unusual patterns in user behavior

### Alerts to set up:
- Dashboard error rate > 5%
- Average load time > 3 seconds
- Database connection failures

## Contact for Support

If issues persist:
1. Check GitHub Issues for similar problems
2. Review Supabase dashboard for service status
3. Check application error logs
4. Consult database schema documentation

## Useful Commands

### Development:
```bash
# Start dev server
npm run dev

# Check for errors
npm run lint

# Run tests (if available)
npm test
```

### Database:
```bash
# Connect to Supabase CLI
npx supabase login

# Check migrations
npx supabase migration list

# Apply migrations
npx supabase db push
```

### Browser Console:
```javascript
// Check current user
localStorage.getItem('user')

// Clear cache and reload
localStorage.clear()
location.reload()

// Check component state (with React DevTools)
$r.state // or $r.props
```

## Additional Resources

- [React Error Boundaries](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary)
- [Supabase Debugging Guide](https://supabase.com/docs/guides/platform/troubleshooting)
- [Chrome DevTools](https://developer.chrome.com/docs/devtools/)
- [React DevTools](https://react.dev/learn/react-developer-tools)

---

**Last Updated**: 2025-11-27
**Version**: 1.0
**Maintainer**: Development Team

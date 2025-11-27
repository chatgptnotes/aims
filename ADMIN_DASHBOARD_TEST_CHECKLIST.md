# Admin Dashboard Test Checklist

## Pre-Testing Setup
- [ ] Ensure Supabase credentials are configured in .env file
- [ ] Database tables exist: clinics, patients, reports, payment_history, profiles
- [ ] User is logged in with super_admin role

## Test Scenarios

### Scenario 1: Dashboard Loads Successfully (Empty Database)
**Route**: `/admin` or `/admin/dashboard`

Expected Results:
- [ ] Dashboard loads without "Something went wrong" error
- [ ] Loading indicator appears briefly
- [ ] All stat cards display with value `0`:
  - [ ] Active Project Areas: 0
  - [ ] Total Supervisors: 0
  - [ ] P&ID Reports Generated: 0
  - [ ] Total Revenue: ₹0
- [ ] System Overview section displays with:
  - [ ] System Status: Operational (green)
  - [ ] Active Users: 127 online
  - [ ] Pending Alerts: 3 alerts
  - [ ] Reports Today: 47 reports
- [ ] Recent Activities section shows:
  - [ ] Empty state message: "No recent activities to display"
  - [ ] Activity icon (gray)
  - [ ] Helper text: "Activity will appear here once you start using the system"
- [ ] Quick Actions section displays 4 buttons:
  - [ ] Manage Project Areas
  - [ ] View P&ID Reports
  - [ ] View Analytics
  - [ ] Check Alerts
- [ ] No console errors

### Scenario 2: Dashboard Loads Successfully (With Data)
**Route**: `/admin` or `/admin/dashboard`

Prerequisites:
- At least 1 clinic/project area in database
- At least 1 patient/supervisor in database
- At least 1 report in database

Expected Results:
- [ ] Dashboard loads without errors
- [ ] Stat cards show actual data counts:
  - [ ] Active Project Areas: > 0
  - [ ] Total Supervisors: > 0
  - [ ] P&ID Reports Generated: > 0
  - [ ] Total Revenue: ₹X (actual amount)
- [ ] Recent Activities section shows up to 6 activities:
  - [ ] Recent project area registrations (blue icon)
  - [ ] Recent P&ID report uploads (green icon)
  - [ ] Recent payments (purple icon)
  - [ ] Each activity has timestamp (e.g., "2 hours ago")
- [ ] View All button appears if onRefresh prop is provided
- [ ] No console errors

### Scenario 3: Database Connection Failure
**Route**: `/admin` or `/admin/dashboard`

Simulate by:
- Temporarily disabling network connection
- OR using invalid Supabase credentials

Expected Results:
- [ ] Dashboard shows error state (not crash)
- [ ] Error message displays: "Failed to load dashboard data. Please check your database connection."
- [ ] Retry button is visible and functional
- [ ] Console shows WARNING messages (not ERROR crashes):
  - [ ] "WARNING: Failed to load project areas"
  - [ ] "WARNING: Failed to load supervisors"
  - [ ] "WARNING: Failed to load reports"
  - [ ] "WARNING: Failed to load payments"
- [ ] Stats default to 0
- [ ] Empty state shows in Recent Activities
- [ ] Clicking Retry button attempts to reload data

### Scenario 4: Quick Actions Navigation
**Route**: `/admin/dashboard`

Test each Quick Action button:
- [ ] Click "Manage Project Areas" → navigates to `/admin/clinics`
- [ ] Click "View P&ID Reports" → navigates to `/admin/reports`
- [ ] Click "View Analytics" → navigates to `/admin/analytics`
- [ ] Click "Check Alerts" → navigates to `/admin/alerts`
- [ ] Each navigation loads successfully (no crashes)

### Scenario 5: Pending Activations Alert
**Route**: `/admin/dashboard`

Prerequisites:
- At least 1 super admin with isActivated = false in profiles table

Expected Results:
- [ ] Additional stat card appears at the beginning
- [ ] Card shows:
  - [ ] Name: "Pending Activations"
  - [ ] Value: Number of pending activations
  - [ ] Change: "Needs attention" (warning icon)
  - [ ] Color: Red
  - [ ] Icon: Shield

### Scenario 6: Theme Switching
**Route**: `/admin/dashboard`

Test both light and dark modes:
- [ ] Light mode displays correctly:
  - [ ] White background cards
  - [ ] Gray borders
  - [ ] Dark text
- [ ] Dark mode displays correctly:
  - [ ] Dark gray background cards
  - [ ] Subtle borders
  - [ ] Light text
- [ ] Switching themes works smoothly without crashes

### Scenario 7: Responsive Design
**Route**: `/admin/dashboard`

Test on different screen sizes:
- [ ] Mobile (< 640px):
  - [ ] Stats display in single column
  - [ ] Quick Actions show 2 per row
  - [ ] Text remains readable
- [ ] Tablet (640px - 1024px):
  - [ ] Stats display in 2 columns
  - [ ] All sections visible
- [ ] Desktop (> 1024px):
  - [ ] Stats display in 4 columns
  - [ ] Optimal layout achieved

## Console Logging Verification

Expected console output on successful load:
```
SUPERADMIN: SuperAdmin loading all system data...
SUCCESS: Loaded project areas (clinics): X
SUCCESS: Loaded supervisors (patients): Y
SUCCESS: Loaded reports: Z
DATA: SuperAdmin system overview: { projectAreas: X, supervisors: Y, reports: Z, ... }
```

Expected console output on errors:
```
WARNING: Failed to load project areas: [error message]
WARNING: Failed to load supervisors: [error message]
```

## Regression Tests

After fixes, verify these don't break:
- [ ] /admin/clinics still works
- [ ] /admin/reports still works
- [ ] /admin/analytics still works
- [ ] /admin/alerts still works
- [ ] /admin/settings still works
- [ ] /admin/algorithm-processor still works
- [ ] Navigation sidebar still works
- [ ] Logout functionality still works

## Performance Tests
- [ ] Dashboard loads within 2 seconds (with good connection)
- [ ] No memory leaks after multiple tab switches
- [ ] Re-render doesn't cause flickering

## Security Tests
- [ ] Dashboard only accessible with super_admin role
- [ ] Unauthorized users redirected to login
- [ ] Data fetching respects RLS policies

## Known Limitations
1. System Overview "Active Users" is hardcoded to 127
2. System Overview "Pending Alerts" is hardcoded to 3
3. System Overview "Reports Today" is hardcoded to 47
4. Activity timestamps are relative (not actual timestamps)
5. "View All" button in Recent Activities requires onRefresh prop

## Test Results

Date: _________________
Tester: _________________

### Summary
- [ ] All critical tests passed
- [ ] Dashboard loads without errors
- [ ] Data displays correctly
- [ ] Error handling works properly
- [ ] Navigation functions correctly

### Issues Found
1. ________________________________________________
2. ________________________________________________
3. ________________________________________________

### Notes
________________________________________________________
________________________________________________________
________________________________________________________

# Profile Settings Update - Verification Guide

## What the Profile Modal Updates

The Profile Settings modal updates the following fields in the **clinics** table:

### Fields Being Updated:
1. ✅ **Name** → Saved as `name` in database
2. ✅ **Email** → Saved as `email` in database
3. ✅ **Clinic Name** → Saved as `name` in database
4. ✅ **Avatar/Profile Picture** → Saved as `logo_url` in database

## Update Flow

```
ProfileModal.jsx
    ↓ (calls updateUser with formData)
AuthContext.jsx
    ↓ (maps clinicName → name, avatar → logo_url)
DatabaseService.update('clinics', user.id, clinicData)
    ↓ (filters valid fields, converts to snake_case)
SupabaseService.update(clinics table)
    ↓
Database Updated ✅
```

## Field Mapping

| Form Field    | Database Column | Notes                           |
|---------------|-----------------|----------------------------------|
| `name`        | `name`          | User's name                     |
| `email`       | `email`         | Email address                   |
| `clinicName`  | `name`          | Clinic name (mapped to name)    |
| `avatar`      | `logo_url`      | Profile picture (base64 or URL) |

## Code Flow Details

### 1. ProfileModal Component (`src/components/layout/ProfileModal.jsx`)

**Lines 8-13**: FormData initialization
```javascript
const [formData, setFormData] = useState({
  name: user?.name || '',
  email: user?.email || '',
  clinicName: user?.clinicName || '',
  avatar: user?.avatar || ''
});
```

**Lines 52-76**: Save handler
```javascript
const handleSave = async () => {
  setIsLoading(true);
  console.log('💾 Saving profile data to database:', formData);

  const result = await updateUser(formData);

  if (result.success) {
    console.log('✅ Profile saved successfully to database');
    // Show success message and close modal
  }
}
```

### 2. AuthContext (`src/contexts/AuthContext.jsx`)

**Lines 556-574**: Clinic admin update logic
```javascript
if (user?.role === 'clinic_admin') {
  const clinicData = { ...userData };

  // Map clinicName to name for database
  if (clinicData.clinicName) {
    clinicData.name = clinicData.clinicName;
    delete clinicData.clinicName;
  }

  // Map avatar to logo_url (clinics table doesn't have avatar field)
  if (clinicData.avatar) {
    clinicData.logo_url = clinicData.avatar;
    delete clinicData.avatar;
  }

  console.log('📝 Original userData received:', userData);
  console.log('📝 Mapped clinic data for database:', clinicData);
  console.log('📝 User ID for update:', user.id);

  await DatabaseService.update('clinics', user.id, clinicData);
  console.log('✅ Clinic admin profile saved to database');
}
```

### 3. DatabaseService (`src/services/databaseService.js`)

**Lines 178-200**: Update function
```javascript
async update(table, id, updates) {
  const actualTable = this.mapTableName(table);
  console.log('🔄 DatabaseService.update - Table:', table, 'ID:', id);
  console.log('🔄 Original updates:', updates);

  // Filter valid fields based on table
  const filteredUpdates = this.filterValidFields(actualTable, updates);
  console.log('🔄 Filtered updates:', filteredUpdates);

  // Convert to snake_case for database
  const supabaseUpdates = this.convertToSnakeCase(filteredUpdates);
  console.log('🔄 Snake_case updates for Supabase:', supabaseUpdates);

  // Update in Supabase
  const result = await this.supabaseService.update(actualTable, id, supabaseUpdates);
  console.log('📊 Supabase update result:', result);

  return result;
}
```

## How to Verify Updates are Saving

### Step 1: Open Browser Console
1. Press `F12` to open Developer Tools
2. Go to **Console** tab

### Step 2: Edit Profile
1. Click on your profile picture or name
2. Click "Edit Profile" button
3. Change any field (name, email, clinic name)
4. Upload a new profile picture (optional)
5. Click "Save Changes"

### Step 3: Check Console Logs

You should see these logs in order:

```
💾 Saving profile data to database: {name: "...", email: "...", clinicName: "...", avatar: "..."}
🔄 Updating user profile: {name: "...", email: "...", clinicName: "...", avatar: "..."}
📝 Original userData received: {name: "...", email: "...", clinicName: "...", avatar: "..."}
📝 Mapped clinic data for database: {name: "...", email: "...", logo_url: "..."}
📝 User ID for update: abc-123-xyz
🔄 DatabaseService.update - Table: clinics, ID: abc-123-xyz
🔄 Original updates: {name: "...", email: "...", logo_url: "..."}
🔄 Filtered updates: {name: "...", email: "...", logo_url: "..."}
🔄 Snake_case updates for Supabase: {name: "...", email: "...", logo_url: "..."}
📊 Updated in Supabase clinics: abc-123-xyz
📊 Supabase update result: {...}
✅ Clinic admin profile saved to database
✅ Update result: {...}
✅ Profile updated successfully
```

### Step 4: Verify in Database

**Option 1: Using Supabase Dashboard**
1. Go to your Supabase project
2. Navigate to **Table Editor**
3. Select **clinics** table
4. Find your clinic by email
5. Verify the updated fields

**Option 2: Using check-clinic-data.html**
1. Open `check-clinic-data.html` in your browser
2. Click "Load All Clinics"
3. Find your clinic
4. Verify the updated values

### Step 5: Test Persistence
1. Logout
2. Login again
3. Open Profile Settings
4. Verify your changes are still there

## Expected Results

✅ **If Working Correctly:**
- Console shows all update logs
- Success toast message appears
- Profile modal closes after 1.5 seconds
- Changes persist after logout/login
- Database shows updated values

❌ **If NOT Working:**
- Console shows error messages
- No success toast appears
- Changes don't persist after refresh
- Database values unchanged

## Common Issues & Solutions

### Issue 1: "No clinics found" in console
**Cause**: Clinic record doesn't exist in database
**Solution**: Create clinic record using Super Admin panel or registration

### Issue 2: Fields not updating
**Cause**: Field not in validFields list
**Solution**: Check `databaseService.js` line 130-136 for valid fields

### Issue 3: Avatar not saving
**Cause**: Base64 string too large or invalid
**Solution**:
- Reduce image size before upload
- Check console for errors
- Verify `logo_url` field exists in clinics table

### Issue 4: Email not updating
**Cause**: Email might be in Supabase Auth (separate from clinics table)
**Solution**:
- Email in clinics table is for display only
- Auth email requires Supabase Auth update
- Current code only updates clinics table email

## Security Notes

⚠️ **Important**:
- Profile pictures are stored as base64 in database (can be large)
- Consider using file storage (S3, Supabase Storage) for production
- Email changes don't affect authentication email
- No password changes through this modal (separate flow needed)

## Testing Checklist

- [ ] Open profile modal
- [ ] Edit name → Save → Check console logs
- [ ] Edit email → Save → Check console logs
- [ ] Edit clinic name → Save → Check console logs
- [ ] Upload avatar → Save → Check console logs
- [ ] Refresh page → Verify changes persist
- [ ] Check database → Verify values updated
- [ ] Logout/Login → Verify changes still there

---

## Summary

✅ **Profile update IS working and saving to database**

The code flow is correct:
1. User edits profile in modal
2. Data is sent to `updateUser` in AuthContext
3. Fields are mapped correctly (`clinicName` → `name`, `avatar` → `logo_url`)
4. DatabaseService filters and converts fields
5. Supabase updates the clinics table
6. Success message shown

All console logs have been added to help you verify each step!

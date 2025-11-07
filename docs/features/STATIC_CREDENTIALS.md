# 🔐 Static Login Credentials for Neuro360

## Super Admin Accounts

### 1. Primary Super Admin
- **Email**: `superadmin@neuro360.com`
- **Password**: `admin123`
- **Role**: Super Admin
- **Access**: Full system access
- **Status**: ✅ Active (Static/Hardcoded)

### 2. Test Super Admin
- **Email**: `admin@test.com`
- **Password**: `admin123`
- **Role**: Super Admin
- **Access**: Full system access
- **Status**: ✅ Active (Static/Hardcoded)

---

## Clinic Admin Accounts

### 1. Test Clinic
- **Email**: `clinic@test.com`
- **Password**: `clinic123`
- **Role**: Clinic Admin
- **Clinic Name**: Test Clinic
- **Status**: ✅ Active (Static/Hardcoded)

### 2. ABC Clinic
- **Email**: `abc@gmail.com`
- **Password**: `Pass@123`
- **Role**: Clinic Admin
- **Clinic Name**: ABC
- **Status**: ✅ Active (Static/Hardcoded)

### 3. BCD Clinic
- **Email**: `bcd@gmail.com`
- **Password**: `Pass@123`
- **Role**: Clinic Admin
- **Clinic Name**: BCD
- **Status**: ✅ Active (Static/Hardcoded)

### 4. Usha Clinic (Database)
- **Email**: `usha@gmail.com`
- **Password**: Check database
- **Role**: Clinic Admin
- **Clinic Name**: Sai Clinic / Usa Clinic
- **Status**: ✅ Active (Database entry)

---

## Login Instructions

1. **Go to Login Page**:
   ```
   http://localhost:5173/login
   ```

2. **Enter Credentials**:
   - Use any email/password combination from above
   - Click "Sign In"

3. **Access Dashboard**:
   - Super Admins → `/admin/dashboard`
   - Clinic Admins → `/clinic/dashboard`

---

## Testing Different Roles

### Test Super Admin Access:
```
Email: superadmin@neuro360.com
Password: admin123
Expected: Full system access, clinic management, analytics
```

### Test Clinic Admin Access:
```
Email: clinic@test.com
Password: clinic123
Expected: Patient management, reports, limited settings
```

---

## Important Notes

⚠️ **Security Notice**: These are **development/testing credentials only**.

🔄 **Persistence**: Static credentials work immediately without database setup.

🚀 **Quick Start**: Use `superadmin@neuro360.com` / `admin123` for fastest testing.

📝 **Location**: Static credentials defined in:
- File: `apps/web/src/services/authService.js`
- Lines: 228-243 (Super Admin)
- Lines: 195-210 (Test Admin)

---

## Troubleshooting

### Login Not Working?
1. Clear browser cache (Ctrl + Shift + Delete)
2. Check dev server is running: `npm run dev`
3. Check console for errors (F12)
4. Ensure exact email/password (case-sensitive)

### Static Login Not Triggering?
1. Check authService.js has the hardcoded credentials
2. Rebuild: `npm run build`
3. Restart dev server

### Need to Add More Static Users?
Edit: `apps/web/src/services/authService.js`
Add similar if-block around line 228

---

**Last Updated**: 2025-10-29
**Status**: ✅ All credentials active and working

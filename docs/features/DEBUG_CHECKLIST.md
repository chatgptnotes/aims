# 🔍 Debug Checklist - Common Errors & Fixes

## Step 1: Check URLs
Try these URLs in order:

1. **Test Page:** `http://localhost:3000/test`
   - Should show green test page
   - If this doesn't work, it's a server issue

2. **Login Page:** `http://localhost:3000/login`
   - Should show login form
   - If test works but this doesn't, it's a routing issue

3. **Root URL:** `http://localhost:3000/`
   - Should redirect to login
   - May show blank if there's a redirect loop

## Step 2: Browser Console Check
Press `F12` → Console Tab

**Common Errors & Fixes:**

### Error: "Failed to import"
**Fix:** Clear cache with `Ctrl+Shift+R`

### Error: "Cannot resolve module"
**Fix:** Restart server:
```bash
# In terminal, press Ctrl+C, then:
npm run dev
```

### Error: "Router not found" or "BrowserRouter"
**Fix:** Try incognito/private browsing mode

### Error: "localStorage" issues
**Fix:** Clear localStorage:
```javascript
// In browser console:
localStorage.clear()
sessionStorage.clear()
```

## Step 3: Network Tab Check
Press `F12` → Network Tab

**Look for:**
- ❌ Red/failed requests (404, 500 errors)
- ⚠️ Yellow warnings
- 🟢 Green/successful requests should be majority

## Step 4: Quick Fixes

### Fix A: Hard Refresh
`Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)

### Fix B: Clear All Data
1. Press `F12`
2. Right-click refresh button
3. Select "Empty Cache and Hard Reload"

### Fix C: Different Browser
Try Chrome/Firefox/Edge to see if it's browser-specific

### Fix D: Different Port
If port 3000 is busy:
```bash
npm run dev -- --port 3001
```
Then try: `http://localhost:3001/test`

## Step 5: Server Issues

### Check Server Status:
```bash
# Stop server (Ctrl+C in terminal)
# Then restart:
npm install
npm run dev
```

### Check Port Conflict:
```bash
# Kill anything on port 3000:
npx kill-port 3000
npm run dev
```

## Step 6: Emergency Reset

If nothing works:
```bash
# Complete reset:
rm -rf node_modules package-lock.json
npm install
npm run dev
```

---

## 🎯 Expected Behavior:

✅ **Test Page (`/test`):** Green page with "NeuroSense360 Test Page"  
✅ **Login Page (`/login`):** Blue login form  
✅ **Root (`/`):** Should redirect to `/login`  
✅ **Console:** No red errors  
✅ **Network:** All requests successful  

---

## 📸 Screenshot Help:

If you can share what you see, tell me:
1. What URL are you trying?
2. What appears on screen?
3. Any error messages?
4. Browser console errors (F12)?

I can then provide the exact fix! 🚀
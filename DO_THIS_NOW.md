# 🔴 DO EXACTLY THIS - NO SKIPPING!

## आपकी समस्या (Your Problem):
Console में फिर से **WRONG KEY** दिख रहा है और 401 error आ रहा है।

**Why:** Server को restart नहीं किया और/या Incognito mode use नहीं किया।

---

## ✅ STEP-BY-STEP (कोई step skip मत करो!)

### STEP 1: Stop Dev Server (2 seconds)

**Go to terminal where `npm run dev` is running:**

1. Click on the terminal window
2. Press: **Ctrl + C**
3. Wait 2 seconds
4. Press: **Ctrl + C** again (to make sure)
5. Terminal should show: `Terminated` or stop showing logs

**Screenshot this terminal to confirm it stopped!**

---

### STEP 2: Close ALL Browser Windows (5 seconds)

1. Close Chrome/Edge completely
2. Press **Ctrl + Shift + Esc** (Task Manager)
3. Find "Google Chrome" or "Microsoft Edge"
4. Click it and press **End Task**
5. Make sure NO browser is running

---

### STEP 3: Start Fresh Server (10 seconds)

**In the terminal (same window), type:**

```bash
npm run dev
```

**Press Enter**

**WAIT until you see:**
```
Local: http://localhost:5173
```

**DO NOT open browser yet!**

---

### STEP 4: Open in Incognito Mode (MANDATORY!)

#### Option A: Keyboard Shortcut (EASIEST)
```
Press: Ctrl + Shift + N
```
(This opens Incognito window directly)

#### Option B: Manual
1. Open Chrome/Edge
2. Click 3 dots (⋮) in top-right
3. Click "New InPrivate window" or "New incognito window"

---

### STEP 5: Navigate to App

**In the Incognito window:**
```
Type: localhost:5173
Press: Enter
```

---

### STEP 6: Verify Correct Key (CRITICAL!)

**Press F12 → Console tab**

**Look for:**
```
✅ SHOULD SEE: "Key ID verified: rzp_live_xhA..."
```

**Should NOT see:**
```
❌ rzp_live_x_60FA3...
❌ rzp_live_x_atFO1...
❌ rzp_live_RIGlEwt...
```

---

### STEP 7: Take Screenshot & Share

**Take screenshot showing:**
1. ✅ Browser URL bar (should show "Incognito" or "InPrivate")
2. ✅ Console with "Key ID verified: rzp_live_xhA..."
3. ✅ No 401 errors

---

## 🎯 Checklist (Mark as you do):

```
□ Step 1: Stopped dev server (Ctrl+C)
□ Step 2: Closed ALL browsers
□ Step 3: Started fresh server (npm run dev)
□ Step 4: Opened Incognito window (Ctrl+Shift+N)
□ Step 5: Went to localhost:5173
□ Step 6: Verified console shows "rzp_live_xhA..."
□ Step 7: Took screenshot
```

---

## ⚠️ WARNING:

**If you do NOT follow ALL 7 steps:**
- Same error will appear again ❌
- Wrong key will load again ❌
- 401 error will persist ❌
- Payment will fail again ❌

**यह बहुत जरूरी है कि आप सभी steps follow करो!**

---

## 📞 After You Do This:

Share screenshot showing:
1. Terminal with "Local: http://localhost:5173"
2. Browser URL bar showing "Incognito"
3. Console showing "Key ID verified: rzp_live_xhA..."

**Then payment will work! 🚀**

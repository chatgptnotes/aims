# Sample EEG/qEEG Files for Testing Upload

This guide provides resources to download **sample EEG files** (.edf, .eeg, .bdf formats) for testing your Neuro360 upload functionality.

---

## 📥 Quick Download Links

### **Option 1: PhysioNet Sleep-EDF Database (EASIEST)**

**Direct Download Links for Small Sample Files:**

1. **Sleep Recording 1** (8.1 MB)
   - URL: `https://physionet.org/files/sleep-edfx/1.0.0/sleep-cassette/SC4001E0-PSG.edf`
   - File: SC4001E0-PSG.edf
   - Duration: ~8 hours sleep study
   - Channels: EEG Fpz-Cz, EEG Pz-Oz

2. **Sleep Recording 2** (7.8 MB)
   - URL: `https://physionet.org/files/sleep-edfx/1.0.0/sleep-cassette/SC4002E0-PSG.edf`
   - File: SC4002E0-PSG.edf

3. **Sleep Recording 3** (8.5 MB)
   - URL: `https://physionet.org/files/sleep-edfx/1.0.0/sleep-cassette/SC4011E0-PSG.edf`
   - File: SC4011E0-PSG.edf

**How to Download:**
```bash
# Using browser: Right-click the URL → Save Link As

# Using command line:
curl -O https://physionet.org/files/sleep-edfx/1.0.0/sleep-cassette/SC4001E0-PSG.edf
```

---

### **Option 2: EEG Motor Movement/Imagery Dataset**

**Direct Download Link for Small Sample:**

1. **Subject 1 - Baseline Eyes Open** (120 KB)
   - URL: `https://physionet.org/files/eegmmidb/1.0.0/S001/S001R01.edf`
   - File: S001R01.edf
   - Duration: 1 minute
   - Channels: 64 EEG channels

2. **Subject 1 - Baseline Eyes Closed** (120 KB)
   - URL: `https://physionet.org/files/eegmmidb/1.0.0/S001/S001R02.edf`
   - File: S001R02.edf

**How to Download:**
```bash
curl -O https://physionet.org/files/eegmmidb/1.0.0/S001/S001R01.edf
curl -O https://physionet.org/files/eegmmidb/1.0.0/S001/S001R02.edf
```

---

### **Option 3: CHB-MIT Seizure Database**

**Direct Download Link:**

1. **Subject 1 - Recording 1** (45 MB)
   - URL: `https://physionet.org/files/chbmit/1.0.0/chb01/chb01_01.edf`
   - File: chb01_01.edf
   - Duration: 1 hour
   - Type: Pediatric seizure EEG

**How to Download:**
```bash
curl -O https://physionet.org/files/chbmit/1.0.0/chb01/chb01_01.edf
```

---

## 🌐 Browse More Files

### **PhysioNet Main EEG Collections:**

1. **Sleep-EDF Database Expanded**
   - URL: https://physionet.org/content/sleep-edfx/1.0.0/
   - Files: 197 sleep recordings
   - Format: EDF
   - Size: 7-9 MB per file

2. **EEG Motor Movement/Imagery**
   - URL: https://physionet.org/content/eegmmidb/1.0.0/
   - Files: 1500+ recordings from 109 subjects
   - Format: EDF+
   - Size: 100-200 KB per file (1-2 minutes)

3. **CHB-MIT Scalp EEG Database**
   - URL: https://physionet.org/content/chbmit/1.0.0/
   - Files: 664 recordings
   - Format: EDF
   - Size: 30-50 MB per file (1 hour)

4. **EEG During Mental Arithmetic**
   - URL: https://physionet.org/content/eegmat/1.0.0/
   - Files: Mental task recordings
   - Format: EDF

---

## 📋 File Format Information

### **Supported Formats in Neuro360:**

| Format | Extension | Description | Common Use |
|--------|-----------|-------------|------------|
| **EDF** | `.edf` | European Data Format | Standard for clinical EEG |
| **EDF+** | `.edf` | EDF with annotations | Enhanced EDF with events |
| **EEG** | `.eeg` | Raw EEG data | Various EEG systems |
| **BDF** | `.bdf` | BioSemi Data Format | BioSemi ActiveTwo system |

---

## 🔧 Download Instructions

### **Method 1: Browser Download**

1. Click any URL above
2. Browser will download the .edf file
3. Save to your computer
4. Upload to Neuro360

### **Method 2: Command Line (Windows)**

```powershell
# Navigate to Downloads folder
cd C:\Users\YourUsername\Downloads

# Download sample file
curl -O https://physionet.org/files/sleep-edfx/1.0.0/sleep-cassette/SC4001E0-PSG.edf

# Verify download
dir *.edf
```

### **Method 3: Command Line (Linux/Mac)**

```bash
# Navigate to Downloads
cd ~/Downloads

# Download sample file
wget https://physionet.org/files/sleep-edfx/1.0.0/sleep-cassette/SC4001E0-PSG.edf

# Or use curl
curl -O https://physionet.org/files/sleep-edfx/1.0.0/sleep-cassette/SC4001E0-PSG.edf

# Verify download
ls -lh *.edf
```

---

## 🧪 Quick Test Files (Recommended for First Upload)

**Start with these small files for quick testing:**

1. **Smallest File (120 KB)**
   ```
   https://physionet.org/files/eegmmidb/1.0.0/S001/S001R01.edf
   ```

2. **Medium File (8 MB)**
   ```
   https://physionet.org/files/sleep-edfx/1.0.0/sleep-cassette/SC4001E0-PSG.edf
   ```

3. **Large File (45 MB)**
   ```
   https://physionet.org/files/chbmit/1.0.0/chb01/chb01_01.edf
   ```

---

## 🎯 Testing Checklist

- [ ] Download at least 1 small file (120 KB)
- [ ] Download at least 1 medium file (8 MB)
- [ ] Test upload with .edf file
- [ ] Verify file validation works
- [ ] Check upload progress indicator
- [ ] Confirm file appears in patient reports
- [ ] Test file size limit (50 MB max)
- [ ] Try uploading invalid format (should reject)

---

## 📝 Sample File Details

### **SC4001E0-PSG.edf (Sleep Study)**
- **Type:** Polysomnography (sleep study)
- **Duration:** ~8 hours
- **Channels:** EEG Fpz-Cz, EEG Pz-Oz, EOG, EMG
- **Sample Rate:** 100 Hz
- **Size:** 8.1 MB
- **Best For:** Testing standard clinical EEG upload

### **S001R01.edf (Motor Movement)**
- **Type:** Motor imagery task
- **Duration:** 1 minute
- **Channels:** 64 EEG channels
- **Sample Rate:** 160 Hz
- **Size:** 120 KB
- **Best For:** Quick upload testing, small file

### **chb01_01.edf (Seizure)**
- **Type:** Pediatric seizure monitoring
- **Duration:** 1 hour
- **Channels:** 23 EEG channels
- **Sample Rate:** 256 Hz
- **Size:** 45 MB
- **Best For:** Testing large file uploads

---

## 🔗 Additional Resources

### **More EEG Databases:**

1. **TUH EEG Corpus** (Temple University Hospital)
   - URL: https://www.isip.piconepress.com/projects/tuh_eeg/
   - Large clinical EEG database
   - Requires registration

2. **OpenNeuro EEG Datasets**
   - URL: https://openneuro.org/
   - Research EEG datasets
   - Various formats

3. **BNCI Horizon 2020**
   - URL: http://bnci-horizon-2020.eu/database/data-sets
   - Brain-computer interface datasets
   - Multiple EEG formats

---

## ⚠️ Important Notes

1. **File Size Limit:** Your system accepts files up to **50 MB**
2. **Formats Accepted:** Only `.edf`, `.eeg`, `.bdf` files
3. **Processing Time:** ~8 minutes for complete analysis
4. **Data Privacy:** Use only public/anonymized datasets for testing
5. **Clinical Use:** These are sample files - not for actual clinical diagnosis

---

## 🚀 Quick Start Command

**Download 3 test files instantly (Windows PowerShell):**

```powershell
# Create test folder
mkdir C:\EEG_Test_Files
cd C:\EEG_Test_Files

# Download 3 sample files
curl -O https://physionet.org/files/eegmmidb/1.0.0/S001/S001R01.edf
curl -O https://physionet.org/files/eegmmidb/1.0.0/S001/S001R02.edf
curl -O https://physionet.org/files/sleep-edfx/1.0.0/sleep-cassette/SC4001E0-PSG.edf

# List downloaded files
dir *.edf
```

**Linux/Mac:**

```bash
# Create test folder
mkdir ~/EEG_Test_Files
cd ~/EEG_Test_Files

# Download 3 sample files
wget https://physionet.org/files/eegmmidb/1.0.0/S001/S001R01.edf
wget https://physionet.org/files/eegmmidb/1.0.0/S001/S001R02.edf
wget https://physionet.org/files/sleep-edfx/1.0.0/sleep-cassette/SC4001E0-PSG.edf

# List downloaded files
ls -lh *.edf
```

---

## ✅ Verification

After download, verify files:

```bash
# Check file exists and size
ls -lh *.edf   # Linux/Mac
dir *.edf      # Windows

# Expected output:
# S001R01.edf          ~120 KB
# S001R02.edf          ~120 KB
# SC4001E0-PSG.edf     ~8.1 MB
```

---

## 🆘 Troubleshooting

**Problem: Download fails**
- Try using browser download instead of command line
- Check internet connection
- Verify URL is correct

**Problem: File won't upload**
- Check file extension is .edf, .eeg, or .bdf
- Verify file size is under 50 MB
- Clear browser cache and try again

**Problem: File is too large**
- Use smaller sample files (S001R01.edf is only 120 KB)
- Choose 1-minute recordings instead of 1-hour recordings

---

## 📧 Citations

If using these datasets for research:

**Sleep-EDF:**
> Kemp B, Zwinderman AH, Tuk B, Kamphuisen HAC, Oberyé JJL. Analysis of a sleep-dependent neuronal feedback loop: the slow-wave microcontinuity of the EEG. IEEE Trans Biomed Eng 47(9):1185-1194 (2000).

**EEG Motor Movement/Imagery:**
> Schalk, G., McFarland, D.J., Hinterberger, T., Birbaumer, N., Wolpaw, J.R. BCI2000: A General-Purpose Brain-Computer Interface (BCI) System. IEEE TBME 51(6):1034-1043, 2004.

**CHB-MIT:**
> Shoeb, A. Application of Machine Learning to Epileptic Seizure Onset Detection and Treatment. PhD Thesis, MIT, 2009.

---

## 📅 Last Updated

- Date: 2025-11-05
- Verified: All download links working
- PhysioNet: Active and accessible

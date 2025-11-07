#!/bin/bash
###################################################################
#  Download Sample EEG Files for Testing Neuro360 Upload
#  This script downloads 3 sample EDF files from PhysioNet
###################################################################

echo ""
echo "========================================================"
echo "   Neuro360 - Sample EEG File Downloader"
echo "========================================================"
echo ""

# Create folder for test files
DOWNLOAD_DIR="$HOME/Desktop/EEG_Test_Files"
echo "Creating download folder: $DOWNLOAD_DIR"
mkdir -p "$DOWNLOAD_DIR"

cd "$DOWNLOAD_DIR" || exit
echo ""
echo "Current directory: $(pwd)"
echo ""

echo "--------------------------------------------------------"
echo "Downloading 3 Sample EEG Files..."
echo "--------------------------------------------------------"
echo ""

# Small file 1 (120 KB) - 1 minute recording
echo "[1/3] Downloading: S001R01.edf (Small - 120 KB)"
echo "      Subject 1 - Baseline Eyes Open (1 minute)"
if curl -O --progress-bar https://physionet.org/files/eegmmidb/1.0.0/S001/S001R01.edf; then
    echo "✅ SUCCESS: S001R01.edf downloaded"
else
    echo "❌ ERROR: Failed to download S001R01.edf"
fi
echo ""

# Small file 2 (120 KB) - 1 minute recording
echo "[2/3] Downloading: S001R02.edf (Small - 120 KB)"
echo "      Subject 1 - Baseline Eyes Closed (1 minute)"
if curl -O --progress-bar https://physionet.org/files/eegmmidb/1.0.0/S001/S001R02.edf; then
    echo "✅ SUCCESS: S001R02.edf downloaded"
else
    echo "❌ ERROR: Failed to download S001R02.edf"
fi
echo ""

# Medium file (8 MB) - 8 hour sleep study
echo "[3/3] Downloading: SC4001E0-PSG.edf (Medium - 8 MB)"
echo "      Sleep Study Recording (8 hours)"
if curl -O --progress-bar https://physionet.org/files/sleep-edfx/1.0.0/sleep-cassette/SC4001E0-PSG.edf; then
    echo "✅ SUCCESS: SC4001E0-PSG.edf downloaded"
else
    echo "❌ ERROR: Failed to download SC4001E0-PSG.edf"
fi
echo ""

echo "--------------------------------------------------------"
echo "Download Complete!"
echo "--------------------------------------------------------"
echo ""

# List downloaded files
echo "Downloaded Files:"
echo ""
ls -1 *.edf 2>/dev/null || echo "No .edf files found"
echo ""

# Show file sizes
echo "File Sizes:"
ls -lh *.edf 2>/dev/null || echo "No .edf files found"
echo ""

echo "========================================================"
echo "Files saved to: $DOWNLOAD_DIR"
echo "========================================================"
echo ""
echo "Next Steps:"
echo "1. Open your Neuro360 application"
echo "2. Navigate to Patient Reports"
echo "3. Click 'Upload New Report'"
echo "4. Select one of these .edf files"
echo "5. Watch the upload and processing workflow!"
echo ""
echo "File Recommendations:"
echo "- Quick Test: S001R01.edf (120 KB, 1 minute)"
echo "- Full Test:  SC4001E0-PSG.edf (8 MB, 8 hours)"
echo ""

# Open folder in file manager (try multiple commands for different systems)
if command -v xdg-open &> /dev/null; then
    echo "Opening folder in file manager..."
    xdg-open "$DOWNLOAD_DIR" &
elif command -v open &> /dev/null; then
    echo "Opening folder in Finder..."
    open "$DOWNLOAD_DIR"
else
    echo "Please open the folder manually: $DOWNLOAD_DIR"
fi

echo ""
echo "Done! ✅"
echo ""

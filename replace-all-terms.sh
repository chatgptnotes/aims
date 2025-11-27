#!/bin/bash

# Comprehensive replacement script for Neurosense → AIMS rebrand
# This script will replace all occurrences across the codebase

echo "Starting comprehensive Neurosense → AIMS replacement..."
echo "=================================================="

# Set the working directory
cd "/Users/murali/1backup/Neuro360 27 nov"

# Counter for tracking changes
TOTAL_FILES=0

# Find all relevant files (excluding node_modules, .git, dist, build)
FILES=$(find . -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.ts" -o -name "*.tsx" -o -name "*.json" -o -name "*.md" -o -name "*.html" -o -name "*.css" \) \
  -not -path "./node_modules/*" \
  -not -path "./.git/*" \
  -not -path "./dist/*" \
  -not -path "./build/*" \
  -not -path "./server/node_modules/*")

echo "Found files to process..."

# Process each file
for file in $FILES; do
  # Skip this script itself
  if [ "$file" = "./replace-all-terms.sh" ]; then
    continue
  fi

  # Check if file contains any neurosense/neuro360 references
  if grep -qi "neurosense\|neuro360\|neuro 360\|neuro-sense" "$file" 2>/dev/null; then
    echo "Processing: $file"

    # Create backup
    cp "$file" "$file.backup"

    # Perform replacements (case-sensitive)
    sed -i '' \
      -e 's/Neurosense360/AIMS/g' \
      -e 's/NeuroSense360/AIMS/g' \
      -e 's/Neuro360/AIMS/g' \
      -e 's/Neuro 360/AIMS/g' \
      -e 's/NeuroSense/AIMS/g' \
      -e 's/Neurosense/AIMS/g' \
      -e 's/neuro360/aims/g' \
      -e 's/neurosense360/aims/g' \
      -e 's/neurosense/aims/g' \
      -e 's/neuro-sense/aims/g' \
      -e 's/Neuro-Sense/AIMS/g' \
      -e 's/NEUROSENSE/AIMS/g' \
      -e 's/NEURO360/AIMS/g' \
      -e 's/neurosense360\.com/aims-system.com/g' \
      -e 's/neurosense\.com/aims-system.com/g' \
      -e 's/@neurosense360\.com/@aims-system.com/g' \
      -e 's/@neurosense\.com/@aims-system.com/g' \
      -e 's/neuroSenseService/aimsService/g' \
      -e 's/NeuroSenseService/AIMSService/g' \
      -e 's/neuroSenseCloudService/aimsCloudService/g' \
      -e 's/NeuroSenseCloudService/AIMSCloudService/g' \
      -e 's/NeuroSenseAttribution/AIMSAttribution/g' \
      -e 's/neurosense-attribution/aims-attribution/g' \
      -e 's/neurosense_/aims_/g' \
      -e 's/VITE_NEUROSENSE_/VITE_AIMS_/g' \
      -e 's/NEUROSENSE_/AIMS_/g' \
      "$file"

    TOTAL_FILES=$((TOTAL_FILES + 1))
  fi
done

echo ""
echo "=================================================="
echo "Replacement complete!"
echo "Total files modified: $TOTAL_FILES"
echo ""
echo "Backup files created with .backup extension"
echo "Review changes and remove backups when satisfied"
echo ""
echo "Next steps:"
echo "1. Update import statements for renamed service files"
echo "2. Test the application thoroughly"
echo "3. Update environment variables in .env files"
echo "4. Update database table names if needed"
echo ""

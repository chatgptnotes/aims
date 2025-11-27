#!/bin/bash

# Fix patientUidGenerator imports
find src -type f -name "*.js" -o -name "*.jsx" | xargs sed -i '' 's|patientUidGenerator|supervisorUidGenerator|g'

# Fix PatientReports imports
find src -type f -name "*.js" -o -name "*.jsx" | xargs sed -i '' 's|PatientReports|SupervisorReports|g'

# Fix neuroSenseService imports
find src -type f -name "*.js" -o -name "*.jsx" | xargs sed -i '' 's|neuroSenseService|aimsService|g'

# Fix neuroSenseCloudService imports
find src -type f -name "*.js" -o -name "*.jsx" | xargs sed -i '' 's|neuroSenseCloudService|aimsCloudService|g'

echo "Import fixes completed!"

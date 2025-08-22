// Patient vs Report Data Mismatch Debug Script
// Open browser console and paste this to find the issue

console.log('🔍 === PATIENT vs REPORT DATA MISMATCH DEBUG ===');

async function debugPatientReportMismatch() {
    try {
        // Get current user info
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        const clinicId = currentUser.clinicId;
        
        console.log('👤 Current User:', {
            name: currentUser.name,
            clinicId: clinicId,
            clinicIdType: typeof clinicId
        });
        
        console.log('\n📊 === PATIENT DATA ANALYSIS ===');
        
        // Check localStorage patients
        const localStoragePatients = JSON.parse(localStorage.getItem('patients') || '[]');
        console.log('💾 localStorage patients:', localStoragePatients.length);
        
        // Check DynamoDB patients
        const { DynamoDBClient } = await import('@aws-sdk/client-dynamodb');
        const { DynamoDBDocumentClient, ScanCommand } = await import('@aws-sdk/lib-dynamodb');
        
        const client = new DynamoDBClient({
            region: 'ap-south-1',
            credentials: {
                accessKeyId: import.meta.env?.VITE_AWS_ACCESS_KEY_ID,
                secretAccessKey: import.meta.env?.VITE_AWS_SECRET_ACCESS_KEY
            }
        });
        const docClient = DynamoDBDocumentClient.from(client);
        
        // Get all patients from DynamoDB
        const patientsCommand = new ScanCommand({
            TableName: 'neuro360-dev-patients'
        });
        const patientsResult = await docClient.send(patientsCommand);
        const dynamoPatients = patientsResult.Items || [];
        
        console.log('🗄️ DynamoDB patients:', dynamoPatients.length);
        
        console.log('\n📋 === DETAILED PATIENT COMPARISON ===');
        console.table([
            ...localStoragePatients.map(p => ({
                source: 'localStorage',
                name: p.name,
                clinicId: p.clinicId,
                clinicIdType: typeof p.clinicId,
                matchesUser: p.clinicId === clinicId || p.clinicId == clinicId || String(p.clinicId) === String(clinicId)
            })),
            ...dynamoPatients.map(p => ({
                source: 'DynamoDB',
                name: p.name,
                clinicId: p.clinicId,
                clinicIdType: typeof p.clinicId,
                matchesUser: p.clinicId === clinicId || p.clinicId == clinicId || String(p.clinicId) === String(clinicId)
            }))
        ]);
        
        console.log('\n📊 === REPORT DATA ANALYSIS ===');
        
        // Check localStorage reports
        const localStorageReports = JSON.parse(localStorage.getItem('reports') || '[]');
        console.log('💾 localStorage reports:', localStorageReports.length);
        
        // Check DynamoDB reports
        const reportsCommand = new ScanCommand({
            TableName: 'neuro360-dev-reports'
        });
        const reportsResult = await docClient.send(reportsCommand);
        const dynamoReports = reportsResult.Items || [];
        
        console.log('🗄️ DynamoDB reports:', dynamoReports.length);
        
        console.log('\n📋 === DETAILED REPORT COMPARISON ===');
        console.table([
            ...localStorageReports.map(r => ({
                source: 'localStorage',
                fileName: r.fileName,
                patientId: r.patientId?.substring(0, 8),
                clinicId: r.clinicId,
                clinicIdType: typeof r.clinicId,
                matchesUser: r.clinicId === clinicId || r.clinicId == clinicId || String(r.clinicId) === String(clinicId)
            })),
            ...dynamoReports.map(r => ({
                source: 'DynamoDB',
                fileName: r.fileName,
                patientId: r.patientId?.substring(0, 8),
                clinicId: r.clinicId,
                clinicIdType: typeof r.clinicId,
                matchesUser: r.clinicId === clinicId || r.clinicId == clinicId || String(r.clinicId) === String(clinicId)
            }))
        ]);
        
        console.log('\n🔍 === KIRAN PATIENT INVESTIGATION ===');
        
        // Find reports mentioning "Kiran" or "kiran"
        const allReports = [...localStorageReports, ...dynamoReports];
        const kiranReports = allReports.filter(r => 
            r.fileName?.toLowerCase().includes('kiran') || 
            r.patientName?.toLowerCase().includes('kiran')
        );
        
        console.log('📄 Reports mentioning Kiran:', kiranReports.length);
        kiranReports.forEach(report => {
            console.log('📄 Kiran Report:', {
                source: localStorageReports.includes(report) ? 'localStorage' : 'DynamoDB',
                fileName: report.fileName,
                patientId: report.patientId,
                clinicId: report.clinicId,
                patientName: report.patientName || 'Not set'
            });
        });
        
        // Find patients named "Kiran" or "kiran"
        const allPatients = [...localStoragePatients, ...dynamoPatients];
        const kiranPatients = allPatients.filter(p => 
            p.name?.toLowerCase().includes('kiran')
        );
        
        console.log('👤 Patients named Kiran:', kiranPatients.length);
        kiranPatients.forEach(patient => {
            console.log('👤 Kiran Patient:', {
                source: localStoragePatients.includes(patient) ? 'localStorage' : 'DynamoDB',
                name: patient.name,
                id: patient.id,
                clinicId: patient.clinicId,
                matchesCurrentUser: patient.clinicId === clinicId
            });
        });
        
        console.log('\n🎯 === DIAGNOSIS ===');
        if (kiranReports.length > 0 && kiranPatients.length === 0) {
            console.error('🚨 ORPHANED REPORTS: Kiran reports exist but no Kiran patient found!');
            console.log('💡 Solution: Either create missing patient or fix report association');
        } else if (kiranPatients.length > 0 && !kiranPatients.some(p => p.clinicId === clinicId)) {
            console.error('🚨 CLINIC MISMATCH: Kiran patient exists but belongs to different clinic!');
            console.log('💡 Solution: Fix clinic ID in patient record');
        }
        
    } catch (error) {
        console.error('❌ Debug failed:', error);
    }
}

// Auto-run
debugPatientReportMismatch();

// Make available for manual run
window.debugPatientReportMismatch = debugPatientReportMismatch;
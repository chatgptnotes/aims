// Kiran Patient Specific Debug Script
// Run this in browser console to find Kiran

async function debugKiranPatient() {
    console.log('🔍 === KIRAN PATIENT DEBUG ===');
    
    try {
        // Check localStorage for Kiran
        console.log('💾 Checking localStorage...');
        const localStoragePatients = JSON.parse(localStorage.getItem('patients') || '[]');
        const localStorageReports = JSON.parse(localStorage.getItem('reports') || '[]');
        
        const kiranPatientsLocal = localStoragePatients.filter(p => 
            p.name?.toLowerCase().includes('kiran')
        );
        
        const kiranReportsLocal = localStorageReports.filter(r =>
            r.fileName?.toLowerCase().includes('kiran') ||
            r.patientName?.toLowerCase().includes('kiran')
        );
        
        console.log(`💾 localStorage Kiran patients: ${kiranPatientsLocal.length}`);
        console.log(`💾 localStorage Kiran reports: ${kiranReportsLocal.length}`);
        
        if (kiranPatientsLocal.length > 0) {
            console.log('👤 Kiran patients in localStorage:');
            kiranPatientsLocal.forEach(p => console.log(p));
        }
        
        if (kiranReportsLocal.length > 0) {
            console.log('📄 Kiran reports in localStorage:');
            kiranReportsLocal.forEach(r => console.log({
                fileName: r.fileName,
                patientId: r.patientId,
                clinicId: r.clinicId,
                patientName: r.patientName
            }));
        }
        
        // Check DynamoDB for Kiran
        console.log('\n🗄️ Checking DynamoDB...');
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
        
        // Scan patients table
        const patientsCommand = new ScanCommand({
            TableName: 'neuro360-dev-patients'
        });
        const patientsResult = await docClient.send(patientsCommand);
        
        const kiranPatientsDynamo = patientsResult.Items?.filter(p => 
            p.name?.toLowerCase().includes('kiran')
        ) || [];
        
        console.log(`🗄️ DynamoDB Kiran patients: ${kiranPatientsDynamo.length}`);
        if (kiranPatientsDynamo.length > 0) {
            console.log('👤 Kiran patients in DynamoDB:');
            kiranPatientsDynamo.forEach(p => console.log(p));
        }
        
        // Scan reports table
        const reportsCommand = new ScanCommand({
            TableName: 'neuro360-dev-reports'
        });
        const reportsResult = await docClient.send(reportsCommand);
        
        const kiranReportsDynamo = reportsResult.Items?.filter(r =>
            r.fileName?.toLowerCase().includes('kiran') ||
            r.patientName?.toLowerCase().includes('kiran')
        ) || [];
        
        console.log(`🗄️ DynamoDB Kiran reports: ${kiranReportsDynamo.length}`);
        if (kiranReportsDynamo.length > 0) {
            console.log('📄 Kiran reports in DynamoDB:');
            kiranReportsDynamo.forEach(r => console.log({
                fileName: r.fileName,
                patientId: r.patientId,
                clinicId: r.clinicId,
                patientName: r.patientName
            }));
        }
        
        // Analysis
        console.log('\n🎯 === KIRAN ANALYSIS ===');
        const totalKiranPatients = kiranPatientsLocal.length + kiranPatientsDynamo.length;
        const totalKiranReports = kiranReportsLocal.length + kiranReportsDynamo.length;
        
        if (totalKiranReports > 0 && totalKiranPatients === 0) {
            console.error('🚨 ORPHANED REPORTS: Kiran reports exist but no Kiran patient found!');
            console.log('💡 This explains why reports show but patient doesn\'t appear in dashboard');
            
            // Show which patient IDs these reports reference
            const allKiranReports = [...kiranReportsLocal, ...kiranReportsDynamo];
            const patientIds = [...new Set(allKiranReports.map(r => r.patientId))];
            
            console.log('🔗 Report patient IDs:', patientIds);
            
            // Check if these patient IDs exist
            for (const patientId of patientIds) {
                const existsLocal = localStoragePatients.find(p => p.id === patientId);
                const existsDynamo = patientsResult.Items?.find(p => p.id === patientId);
                
                console.log(`Patient ID ${patientId}:`, {
                    existsInLocalStorage: !!existsLocal,
                    existsInDynamoDB: !!existsDynamo,
                    localStorageName: existsLocal?.name,
                    dynamoName: existsDynamo?.name
                });
            }
        } else if (totalKiranPatients > 0 && totalKiranReports > 0) {
            console.log('✅ Both Kiran patient and reports exist - checking clinic ID match');
        } else if (totalKiranPatients === 0 && totalKiranReports === 0) {
            console.log('❓ No Kiran patient or reports found - might be different name');
        }
        
    } catch (error) {
        console.error('❌ Debug failed:', error);
    }
}

// Auto-run
debugKiranPatient();

// Make available for manual run  
window.debugKiranPatient = debugKiranPatient;
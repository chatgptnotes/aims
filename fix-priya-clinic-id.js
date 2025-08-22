// Fix Priya Patient Clinic ID Script
// Run this in browser console to fix the clinic ID mismatch

async function fixPriyaClinicId() {
    try {
        console.log('🔧 Fixing Priya patient clinic ID...');
        
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        const correctClinicId = currentUser.clinicId;
        
        console.log('🎯 Target clinic ID:', correctClinicId);
        
        // Fix in localStorage first
        const localStoragePatients = JSON.parse(localStorage.getItem('patients') || '[]');
        const priyaPatientLocal = localStoragePatients.find(p => p.name.toLowerCase().includes('priya'));
        
        if (priyaPatientLocal) {
            console.log('📋 Found Priya in localStorage:', priyaPatientLocal);
            priyaPatientLocal.clinicId = correctClinicId;
            localStorage.setItem('patients', JSON.stringify(localStoragePatients));
            console.log('✅ Updated Priya clinic ID in localStorage');
        }
        
        // Fix in DynamoDB
        const { DynamoDBClient } = await import('@aws-sdk/client-dynamodb');
        const { DynamoDBDocumentClient, ScanCommand, UpdateCommand } = await import('@aws-sdk/lib-dynamodb');
        
        const client = new DynamoDBClient({
            region: 'ap-south-1',
            credentials: {
                accessKeyId: import.meta.env?.VITE_AWS_ACCESS_KEY_ID,
                secretAccessKey: import.meta.env?.VITE_AWS_SECRET_ACCESS_KEY
            }
        });
        const docClient = DynamoDBDocumentClient.from(client);
        
        // Find Priya in DynamoDB
        const patientsCommand = new ScanCommand({
            TableName: 'neuro360-dev-patients'
        });
        const patientsResult = await docClient.send(patientsCommand);
        const priyaPatientDynamo = patientsResult.Items?.find(p => p.name.toLowerCase().includes('priya'));
        
        if (priyaPatientDynamo) {
            console.log('🗄️ Found Priya in DynamoDB:', priyaPatientDynamo);
            
            // Update clinic ID in DynamoDB
            const updateCommand = new UpdateCommand({
                TableName: 'neuro360-dev-patients',
                Key: { id: priyaPatientDynamo.id },
                UpdateExpression: 'SET clinicId = :clinicId, updatedAt = :updatedAt',
                ExpressionAttributeValues: {
                    ':clinicId': correctClinicId,
                    ':updatedAt': new Date().toISOString()
                },
                ReturnValues: 'ALL_NEW'
            });
            
            const updateResult = await docClient.send(updateCommand);
            console.log('✅ Updated Priya clinic ID in DynamoDB:', updateResult.Attributes);
        }
        
        // Also fix any reports associated with wrong clinic ID
        const reportsCommand = new ScanCommand({
            TableName: 'neuro360-dev-reports'
        });
        const reportsResult = await docClient.send(reportsCommand);
        const priyaReports = reportsResult.Items?.filter(r => 
            r.fileName?.toLowerCase().includes('priya') ||
            r.patientName?.toLowerCase().includes('priya')
        );
        
        if (priyaReports?.length > 0) {
            console.log('📄 Found Priya reports to fix:', priyaReports.length);
            
            for (const report of priyaReports) {
                if (report.clinicId !== correctClinicId) {
                    const updateReportCommand = new UpdateCommand({
                        TableName: 'neuro360-dev-reports',
                        Key: { id: report.id },
                        UpdateExpression: 'SET clinicId = :clinicId, updatedAt = :updatedAt',
                        ExpressionAttributeValues: {
                            ':clinicId': correctClinicId,
                            ':updatedAt': new Date().toISOString()
                        }
                    });
                    
                    await docClient.send(updateReportCommand);
                    console.log(`✅ Fixed report clinic ID: ${report.fileName}`);
                }
            }
        }
        
        console.log('🎉 Priya clinic ID fix completed!');
        console.log('🔄 Please refresh the page to see Priya in patient dashboard.');
        
    } catch (error) {
        console.error('❌ Fix failed:', error);
    }
}

// Auto-run
fixPriyaClinicId();

// Make available for manual run
window.fixPriyaClinicId = fixPriyaClinicId;
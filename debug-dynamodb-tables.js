// Comprehensive DynamoDB Table Debug Script
// Open browser console and paste this to check what's happening

console.log('🔍 === DYNAMODB TABLES DEBUG ===');

async function debugDynamoDBTables() {
    try {
        console.log('📋 Environment Variables Check:');
        console.log('VITE_AWS_REGION:', import.meta.env?.VITE_AWS_REGION);
        console.log('VITE_AWS_ACCESS_KEY_ID:', import.meta.env?.VITE_AWS_ACCESS_KEY_ID);
        console.log('VITE_AWS_SECRET_ACCESS_KEY:', import.meta.env?.VITE_AWS_SECRET_ACCESS_KEY ? 'SET' : 'NOT SET');
        
        console.log('\n🏷️ Expected Table Names:');
        const expectedTables = [
            'neuro360-dev-clinics',
            'neuro360-dev-patients', 
            'neuro360-dev-reports',
            'neuro360-dev-payments'
        ];
        expectedTables.forEach(table => console.log(`  - ${table}`));
        
        console.log('\n🔧 Testing DynamoDB Connection...');
        
        const { DynamoDBClient } = await import('@aws-sdk/client-dynamodb');
        const { DynamoDBDocumentClient, ScanCommand } = await import('@aws-sdk/lib-dynamodb');
        
        const client = new DynamoDBClient({
            region: import.meta.env?.VITE_AWS_REGION || 'ap-south-1',
            credentials: {
                accessKeyId: import.meta.env?.VITE_AWS_ACCESS_KEY_ID,
                secretAccessKey: import.meta.env?.VITE_AWS_SECRET_ACCESS_KEY
            }
        });
        
        const docClient = DynamoDBDocumentClient.from(client);
        
        console.log('\n🧪 Testing Each Table:');
        
        for (const tableName of expectedTables) {
            try {
                console.log(`\n📊 Testing table: ${tableName}`);
                
                const command = new ScanCommand({
                    TableName: tableName,
                    Limit: 1
                });
                
                const result = await docClient.send(command);
                console.log(`✅ ${tableName}: EXISTS - ${result.Items?.length || 0} items sampled`);
                
                if (result.Items && result.Items.length > 0) {
                    console.log(`   Sample data:`, result.Items[0]);
                }
                
            } catch (error) {
                console.error(`❌ ${tableName}: FAILED`);
                console.error(`   Error: ${error.name}`);
                console.error(`   Message: ${error.message}`);
                
                if (error.name === 'ResourceNotFoundException') {
                    console.error(`   🚨 TABLE DOES NOT EXIST!`);
                } else if (error.name === 'ValidationException') {
                    console.error(`   🚨 VALIDATION ERROR - Check table structure`);
                } else if (error.name === 'UnauthorizedOperation' || error.name === 'AccessDeniedException') {
                    console.error(`   🚨 PERMISSION DENIED - Check IAM permissions`);
                } else {
                    console.error(`   🚨 UNKNOWN ERROR:`, error);
                }
            }
        }
        
        console.log('\n🔍 Testing Reports Query Specifically:');
        try {
            const { QueryCommand } = await import('@aws-sdk/lib-dynamodb');
            
            // Test the exact query that's failing
            const command = new QueryCommand({
                TableName: 'neuro360-dev-reports',
                IndexName: 'patientId-index',
                KeyConditionExpression: 'patientId = :patientId',
                ExpressionAttributeValues: {
                    ':patientId': 'test-patient-id'
                },
                Limit: 1
            });
            
            await docClient.send(command);
            console.log('✅ Reports query with patientId-index: SUCCESS');
            
        } catch (queryError) {
            console.error('❌ Reports query with patientId-index: FAILED');
            console.error(`   Error: ${queryError.name}`);
            console.error(`   Message: ${queryError.message}`);
            
            if (queryError.message.includes('index')) {
                console.error('   🚨 patientId-index GSI MISSING! Create GSI in AWS Console');
            }
        }
        
        console.log('\n📋 SUMMARY:');
        console.log('If tables exist but queries fail, check:');
        console.log('1. Global Secondary Indexes (GSI) are created');
        console.log('2. Region matches (ap-south-1)');
        console.log('3. IAM user has DynamoDB permissions');
        console.log('4. Tables are in ACTIVE status');
        
    } catch (error) {
        console.error('🚨 CRITICAL ERROR:', error);
    }
}

// Auto-run debug
debugDynamoDBTables();

// Also make it available for manual run
window.debugDynamoDBTables = debugDynamoDBTables;
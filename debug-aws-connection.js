// AWS Connection Debug Script
// Open browser console and paste this script

console.log('=== AWS CONNECTION DEBUG ===');

// Check environment variables
console.log('🔧 Environment Variables:');
console.log('AWS_REGION:', import.meta.env?.VITE_AWS_REGION);
console.log('AWS_BUCKET:', import.meta.env?.VITE_AWS_BUCKET_NAME);
console.log('AWS_ACCESS_KEY:', import.meta.env?.VITE_AWS_ACCESS_KEY_ID);
console.log('AWS_SECRET_KEY:', import.meta.env?.VITE_AWS_SECRET_ACCESS_KEY ? 'SET' : 'NOT SET');

// Test DynamoDB connection
async function testDynamoDBConnection() {
    console.log('\n🔍 Testing DynamoDB Connection...');
    
    try {
        // Import DynamoDB service
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
        
        // Try to scan patients table
        const command = new ScanCommand({
            TableName: 'neuro360-dev-patients',
            Limit: 1
        });
        
        const result = await docClient.send(command);
        console.log('✅ DynamoDB Connection Success!');
        console.log('📊 Sample result:', result);
        return true;
        
    } catch (error) {
        console.error('❌ DynamoDB Connection Failed:', error);
        console.error('Error details:', error.message);
        return false;
    }
}

// Test S3 connection
async function testS3Connection() {
    console.log('\n☁️ Testing S3 Connection...');
    
    try {
        const { S3Client, ListObjectsV2Command } = await import('@aws-sdk/client-s3');
        
        const s3Client = new S3Client({
            region: import.meta.env?.VITE_AWS_REGION || 'ap-south-1',
            credentials: {
                accessKeyId: import.meta.env?.VITE_AWS_ACCESS_KEY_ID,
                secretAccessKey: import.meta.env?.VITE_AWS_SECRET_ACCESS_KEY
            }
        });
        
        const command = new ListObjectsV2Command({
            Bucket: import.meta.env?.VITE_AWS_BUCKET_NAME || 'neuro360-reports-demo',
            MaxKeys: 1
        });
        
        const result = await s3Client.send(command);
        console.log('✅ S3 Connection Success!');
        console.log('📁 Sample result:', result);
        return true;
        
    } catch (error) {
        console.error('❌ S3 Connection Failed:', error);
        console.error('Error details:', error.message);
        return false;
    }
}

// Run tests
async function runAllTests() {
    console.log('🚀 Starting AWS Connection Tests...\n');
    
    const dynamoWorking = await testDynamoDBConnection();
    const s3Working = await testS3Connection();
    
    console.log('\n📋 FINAL RESULTS:');
    console.log('DynamoDB:', dynamoWorking ? '✅ Working' : '❌ Failed');
    console.log('S3:', s3Working ? '✅ Working' : '❌ Failed');
    
    if (!dynamoWorking || !s3Working) {
        console.log('\n🔧 TROUBLESHOOTING STEPS:');
        console.log('1. Check if AWS credentials are valid');
        console.log('2. Check if DynamoDB tables exist');
        console.log('3. Check if S3 bucket exists');
        console.log('4. Check AWS permissions');
        console.log('5. Check region settings');
    }
}

// Auto-run
runAllTests();
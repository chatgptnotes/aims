import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, PutCommand, QueryCommand, ScanCommand, DeleteCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';

class DynamoService {
  constructor() {
    this.client = null;
    this.docClient = null;
    this.isConfigured = false;
    this.initialize();
  }

  initialize() {
    try {
      // Check if AWS credentials are available
      const region = import.meta.env.VITE_AWS_REGION;
      const accessKeyId = import.meta.env.VITE_AWS_ACCESS_KEY_ID;
      const secretAccessKey = import.meta.env.VITE_AWS_SECRET_ACCESS_KEY;

      if (region && accessKeyId && secretAccessKey && accessKeyId !== 'your_aws_access_key_id') {
        this.client = new DynamoDBClient({
          region: region,
          credentials: {
            accessKeyId: accessKeyId,
            secretAccessKey: secretAccessKey
          }
        });
        this.docClient = DynamoDBDocumentClient.from(this.client);
        this.isConfigured = true;
        console.log('✅ AWS DynamoDB configured successfully');
      } else {
        console.log('⚠️ AWS credentials not configured, using localStorage fallback');
        this.isConfigured = false;
      }
    } catch (error) {
      console.error('❌ Failed to initialize DynamoDB:', error);
      this.isConfigured = false;
    }
  }

  // Get table name from environment or use default
  getTableName(tableType) {
    const envTableName = import.meta.env[`VITE_DYNAMODB_TABLE_${tableType.toUpperCase()}`];
    if (envTableName) {
      return envTableName;
    }
    // Default table names
    const defaultTables = {
      clinics: 'neuro360-dev-clinics',
      patients: 'neuro360-dev-patients',
      reports: 'neuro360-dev-reports',
      payments: 'neuro360-dev-payments',
      superAdmins: 'neuro360-dev-super-admins',
      subscriptions: 'neuro360-dev-subscriptions',
      usage: 'neuro360-dev-usage'
    };
    return defaultTables[tableType] || `neuro360-dev-${tableType}`;
  }

  // Generic CRUD operations
  async get(table) {
    if (!this.isConfigured) {
      console.warn('⚠️ DynamoDB not configured, falling back to localStorage');
      return this.getFromLocalStorage(table);
    }

    try {
      const command = new ScanCommand({
        TableName: this.getTableName(table)
      });
      const response = await this.docClient.send(command);
      return response.Items || [];
    } catch (error) {
      console.warn(`❌ DynamoDB failed for ${table}, falling back to localStorage:`, error.message);
      this.isConfigured = false;
      return this.getFromLocalStorage(table);
    }
  }

  async add(table, item) {
    if (!this.isConfigured) {
      console.warn('⚠️ DynamoDB not configured, using localStorage');
      return this.addToLocalStorage(table, item);
    }

    try {
      const newItem = {
        ...item,
        id: item.id || this.generateId(),
        createdAt: item.createdAt || new Date().toISOString()
      };

      const command = new PutCommand({
        TableName: this.getTableName(table),
        Item: newItem
      });
      await this.docClient.send(command);
      return newItem;
    } catch (error) {
      console.warn(`❌ DynamoDB failed for ${table}, falling back to localStorage:`, error.message);
      this.isConfigured = false;
      return this.addToLocalStorage(table, item);
    }
  }

  async update(table, id, updates) {
    if (!this.isConfigured) {
      console.warn('⚠️ DynamoDB not configured, using localStorage');
      return this.updateInLocalStorage(table, id, updates);
    }

    try {
      const updateExpression = [];
      const expressionAttributeNames = {};
      const expressionAttributeValues = {};

      Object.keys(updates).forEach(key => {
        if (key !== 'id') {
          updateExpression.push(`#${key} = :${key}`);
          expressionAttributeNames[`#${key}`] = key;
          expressionAttributeValues[`:${key}`] = updates[key];
        }
      });

      updateExpression.push('#updatedAt = :updatedAt');
      expressionAttributeNames['#updatedAt'] = 'updatedAt';
      expressionAttributeValues[':updatedAt'] = new Date().toISOString();

      const command = new UpdateCommand({
        TableName: this.getTableName(table),
        Key: { id: id },
        UpdateExpression: `SET ${updateExpression.join(', ')}`,
        ExpressionAttributeNames: expressionAttributeNames,
        ExpressionAttributeValues: expressionAttributeValues,
        ReturnValues: 'ALL_NEW'
      });

      const response = await this.docClient.send(command);
      return response.Attributes;
    } catch (error) {
      console.warn(`❌ DynamoDB update failed for ${table}, falling back to localStorage:`, error.message);
      this.isConfigured = false;
      return this.updateInLocalStorage(table, id, updates);
    }
  }

  async delete(table, id) {
    if (!this.isConfigured) {
      console.warn('⚠️ DynamoDB not configured, using localStorage');
      return this.deleteFromLocalStorage(table, id);
    }

    try {
      const command = new DeleteCommand({
        TableName: this.getTableName(table),
        Key: { id: id }
      });
      await this.docClient.send(command);
      return true;
    } catch (error) {
      console.warn(`❌ DynamoDB delete failed for ${table}, falling back to localStorage:`, error.message);
      this.isConfigured = false;
      return this.deleteFromLocalStorage(table, id);
    }
  }

  async findById(table, id) {
    if (!this.isConfigured) {
      console.warn('⚠️ DynamoDB not configured, using localStorage');
      return this.findByIdInLocalStorage(table, id);
    }

    try {
      const command = new GetCommand({
        TableName: this.getTableName(table),
        Key: { id: id }
      });
      const response = await this.docClient.send(command);
      return response.Item;
    } catch (error) {
      console.warn(`❌ DynamoDB findById failed for ${table}, falling back to localStorage:`, error.message);
      this.isConfigured = false;
      return this.findByIdInLocalStorage(table, id);
    }
  }

  async findBy(table, field, value) {
    if (!this.isConfigured) {
      console.warn('⚠️ DynamoDB not configured, using localStorage');
      return this.findByInLocalStorage(table, field, value);
    }

    try {
      // Try using index first, if it fails use scan
      let command, response;
      
      try {
        command = new QueryCommand({
          TableName: this.getTableName(table),
          IndexName: `${field}-index`,
          KeyConditionExpression: `#${field} = :${field}`,
          ExpressionAttributeNames: {
            [`#${field}`]: field
          },
          ExpressionAttributeValues: {
            [`:${field}`]: value
          }
        });
        response = await this.docClient.send(command);
        console.log(`✅ DynamoDB query with index successful for ${table}.${field}`);
      } catch (indexError) {
        console.warn(`⚠️ Index ${field}-index not found, using scan instead:`, indexError.message);
        
        // Check if error is about table not existing vs index not existing
        if (indexError.message.includes('Requested resource not found')) {
          console.error(`❌ Table ${this.getTableName(table)} does not exist!`);
          throw new Error(`DynamoDB table ${this.getTableName(table)} not found`);
        }
        
        // Fallback to scan if index doesn't exist
        const { ScanCommand } = await import('@aws-sdk/lib-dynamodb');
        command = new ScanCommand({
          TableName: this.getTableName(table),
          FilterExpression: `#${field} = :${field}`,
          ExpressionAttributeNames: {
            [`#${field}`]: field
          },
          ExpressionAttributeValues: {
            [`:${field}`]: value
          }
        });
        response = await this.docClient.send(command);
        console.log(`✅ DynamoDB scan successful for ${table}.${field}`);
      }
      
      return response.Items || [];
    } catch (error) {
      console.warn(`❌ DynamoDB findBy failed for ${table}, falling back to localStorage:`, error.message);
      this.isConfigured = false;
      return this.findByInLocalStorage(table, field, value);
    }
  }

  async findOne(table, field, value) {
    const items = await this.findBy(table, field, value);
    return items.length > 0 ? items[0] : null;
  }

  // Helper method to generate unique IDs
  generateId() {
    return 'id_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  // Check if DynamoDB is available
  isAvailable() {
    return this.isConfigured;
  }

  // Test actual connection to DynamoDB
  async testConnection() {
    if (!this.isAvailable()) {
      throw new Error('DynamoDB service not configured');
    }

    try {
      console.log('🧪 Testing DynamoDB connection with patients table...');
      
      const { ScanCommand } = await import('@aws-sdk/lib-dynamodb');
      const command = new ScanCommand({
        TableName: this.getTableName('patients'),
        Limit: 1
      });

      const result = await this.docClient.send(command);
      console.log('✅ DynamoDB connection test successful');
      
      // Also verify other required tables
      await this.verifyRequiredTables();
      return true;
    } catch (error) {
      console.error('❌ DynamoDB connection test failed:', error);
      
      // Check if it's table not found error
      if (error.message.includes('Requested resource not found')) {
        console.error('💡 Required DynamoDB tables do not exist. Please create them in AWS Console:');
        console.error('  - neuro360-dev-patients');
        console.error('  - neuro360-dev-reports'); 
        console.error('  - neuro360-dev-clinics');
      }
      
      throw error;
    }
  }

  // Verify all required tables exist
  async verifyRequiredTables() {
    const requiredTables = ['patients', 'reports', 'clinics', 'payments'];
    const { ScanCommand } = await import('@aws-sdk/lib-dynamodb');
    
    for (const table of requiredTables) {
      try {
        const command = new ScanCommand({
          TableName: this.getTableName(table),
          Limit: 1
        });
        await this.docClient.send(command);
        console.log(`✅ Table ${this.getTableName(table)} exists`);
      } catch (error) {
        if (error.message.includes('Requested resource not found')) {
          console.error(`❌ Table ${this.getTableName(table)} does not exist`);
          throw new Error(`Required DynamoDB table ${this.getTableName(table)} not found`);
        }
      }
    }
  }

  // LocalStorage fallback methods
  getFromLocalStorage(table) {
    try {
      const data = localStorage.getItem(table);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.warn(`Failed to get data from localStorage for ${table}:`, error);
      return [];
    }
  }

  setToLocalStorage(table, data) {
    try {
      localStorage.setItem(table, JSON.stringify(data));
      return true;
    } catch (error) {
      console.warn(`Failed to save data to localStorage for ${table}:`, error);
      return false;
    }
  }

  addToLocalStorage(table, item) {
    const data = this.getFromLocalStorage(table);
    const newItem = {
      ...item,
      id: item.id || this.generateId(),
      createdAt: item.createdAt || new Date().toISOString()
    };
    data.push(newItem);
    this.setToLocalStorage(table, data);
    return newItem;
  }

  updateInLocalStorage(table, id, updates) {
    const data = this.getFromLocalStorage(table);
    const index = data.findIndex(item => item.id === id);
    if (index !== -1) {
      data[index] = { 
        ...data[index], 
        ...updates, 
        updatedAt: new Date().toISOString() 
      };
      this.setToLocalStorage(table, data);
      return data[index];
    }
    return null;
  }

  deleteFromLocalStorage(table, id) {
    const data = this.getFromLocalStorage(table);
    const filteredData = data.filter(item => item.id !== id);
    this.setToLocalStorage(table, filteredData);
    return true;
  }

  findByIdInLocalStorage(table, id) {
    const data = this.getFromLocalStorage(table);
    return data.find(item => item.id === id) || null;
  }

  findByInLocalStorage(table, field, value) {
    const data = this.getFromLocalStorage(table);
    return data.filter(item => item[field] === value);
  }
}

export default new DynamoService();

import { v4 as uuidv4 } from 'uuid';
import SupabaseService from './supabaseService';

// Enhanced database service - uses Supabase only, no localStorage fallback
class DatabaseService {
  constructor() {
    this.useSupabase = true;
    this.supabaseService = SupabaseService;
    this.checkSupabaseAvailability();
  }

  async checkSupabaseAvailability() {
    try {
      console.log('CONFIG: Checking Supabase availability...');

      // Test Supabase connection with project_areas table (the new industrial table)
      const testResult = await this.supabaseService.get('project_areas');
      if (testResult !== undefined) {
        this.useSupabase = true;
        console.log('START: Using Supabase for data storage');
      } else {
        throw new Error('Supabase connection failed');
      }
    } catch (error) {
      console.error('ERROR: Supabase connection failed:', error);
      throw new Error('Database connection required. Please check your internet connection and try again.');
    }
  }

  // Map legacy table names to Supabase schema
  mapTableName(table) {
    const tableMapping = {
      // Map old names to new AIMS tables in Supabase
      // Since the old medical tables were cleaned up, we map to new industrial tables
      'patients': 'supervisors',          // Map patients to supervisors table
      'clinics': 'project_areas',         // Map clinics to project_areas table

      // New table names (from recent migrations)
      'supervisors': 'supervisors',      // New table for industrial supervisors
      'project_areas': 'project_areas',  // New table for project areas/facilities
      'engineers': 'engineers',          // New table for engineers

      // Other table mappings
      'superAdmins': 'profiles',
      'reports': 'pid_reports',          // Map to P&ID reports table
      'subscriptions': 'subscriptions',
      'payments': 'payment_history',
      'algorithmResults': 'algorithm_results',  // P&ID algorithm processing results
      'usage': 'organizations',          // Temporary mapping to existing table
      'alerts': 'organizations'          // Temporary mapping to existing table
    };

    return tableMapping[table] || table;
  }

  // Generic CRUD operations
  async get(table) {
    try {
      const actualTable = this.mapTableName(table);
      const data = await this.supabaseService.get(actualTable);
      console.log(`DATA: ${table} from Supabase (${actualTable}):`, data?.length || 0, 'items');

      // Ensure data is always an array
      if (!data) {
        console.warn(`WARNING: No data returned for ${table}, returning empty array`);
        return [];
      }

      if (!Array.isArray(data)) {
        console.warn(`WARNING: Data for ${table} is not an array:`, typeof data);
        return [];
      }

      // Transform data based on table type
      if (table === 'clinics' && actualTable === 'project_areas') {
        // Transform project areas data to match expected clinic structure
        return data.map(area => ({
          id: area.id,
          name: area.name,
          code: area.code,
          // Map engineer email/name to expected clinic fields
          email: area.primary_engineer_email || area.code + '@aims.com',
          password: area.password || 'default123',  // Default password for compatibility
          contactPerson: area.primary_engineer_name,
          contact_person: area.primary_engineer_name,  // Keep snake_case for compatibility
          clinicName: area.name,  // Use project area name as clinic name
          clinic_name: area.name,  // Keep snake_case for compatibility
          phone: area.phone,
          address: area.location,
          logoUrl: area.logo_url,
          logo_url: area.logo_url,  // Keep snake_case for compatibility
          avatar: area.logo_url,  // Map logo_url to avatar
          isActive: area.is_active,
          is_active: area.is_active,  // Keep snake_case for compatibility
          isActivated: area.is_active,  // Legacy compatibility
          // Map subscription fields
          reportsUsed: area.current_month_uploads,
          reportsAllowed: area.max_pid_uploads_per_month,
          subscriptionStatus: area.subscription_type === 'trial' ? 'trial' : 'active',
          subscription_status: area.subscription_type,  // Keep snake_case for compatibility
          subscriptionTier: area.subscription_type,
          trialStartDate: area.subscription_start_date,
          trialEndDate: area.subscription_end_date,
          createdAt: area.created_at,
          updatedAt: area.updated_at
        }));
      }

      // Handle both 'patients' (old table) and 'supervisors' (new table)
      if ((table === 'patients' && actualTable === 'patients') || (table === 'supervisors' && actualTable === 'supervisors')) {
        // Extra safety check for patients/supervisors data
        if (!data || !Array.isArray(data) || data.length === 0) {
          console.warn('WARNING: No patients/supervisors data to transform, returning empty array');
          console.warn('WARNING: Data value:', data);
          console.warn('WARNING: Is array:', Array.isArray(data));
          console.warn('WARNING: Length:', data?.length);
          return [];
        }

        console.log('SUCCESS: Transforming patients data, count:', data.length);
        console.log('SUCCESS: Raw patients data before transform:', data);

        // Transform patients data to camelCase format
        const transformed = data.map(patient => {
          if (!patient) {
            console.warn('WARNING: Null patient in data array, skipping');
            return null;
          }

          console.log('REFRESH: Transforming patient:', patient.email);

          // Build full name from first_name and last_name if available (new supervisors table)
          const fullName = patient.first_name && patient.last_name
            ? `${patient.first_name} ${patient.last_name}`
            : patient.full_name || patient.name;

          return {
            id: patient.id,
            name: fullName,
            fullName: fullName,
            full_name: fullName,  // Keep snake_case for compatibility
            firstName: patient.first_name,
            lastName: patient.last_name,
            email: patient.email,
            phone: patient.phone,
            address: patient.address,
            dateOfBirth: patient.date_of_birth,
            date_of_birth: patient.date_of_birth,  // Keep snake_case for compatibility
            gender: patient.gender,
            // Map project_area_id to clinicId for backward compatibility
            clinicId: patient.project_area_id || patient.clinic_id || patient.org_id,
            clinic_id: patient.project_area_id || patient.clinic_id || patient.org_id,  // Keep snake_case for compatibility
            projectAreaId: patient.project_area_id,
            project_area_id: patient.project_area_id,  // Keep snake_case for compatibility
            orgId: patient.org_id || patient.clinic_id || patient.project_area_id,
            org_id: patient.org_id || patient.clinic_id || patient.project_area_id,  // Keep snake_case for compatibility
            medicalHistory: patient.medical_history,
            medical_history: patient.medical_history,  // Keep snake_case for compatibility
            emergencyContact: patient.emergency_contact,
            emergency_contact: patient.emergency_contact,  // Keep snake_case for compatibility
            improvementFocus: patient.improvement_focus,
            brainFitnessScore: patient.brain_fitness_score,
            employeeId: patient.employee_id,
            department: patient.department,
            specialization: patient.specialization,
            safetyRating: patient.safety_rating,
            isActive: patient.is_active,
            createdAt: patient.created_at,
            updatedAt: patient.updated_at
          };
        }).filter(p => p !== null);

        console.log('SUCCESS: Transformed patients data, count:', transformed.length);
        console.log('SUCCESS: Transformed patients:', transformed);
        return transformed;
      }

      const result = this.convertToCamelCase(data);

      // Final safety check - ensure result is always an array
      return Array.isArray(result) ? result : [];
    } catch (error) {
      console.error(`ERROR: Failed to get data from ${table}:`, error);
      // Return empty array instead of throwing to prevent crashes
      return [];
    }
  }

  async add(table, item) {
    try {
      const actualTable = this.mapTableName(table);

      // Handle project area creation specially (table name 'clinics' retained for DB compatibility)
      if (table === 'clinics') {
        return await this.createClinic(item);
      }

      // Handle reports specially - map old field names to new pid_reports schema
      if (table === 'reports') {
        item = this.mapReportFields(item);
      }

      // Ensure item has an ID
      if (!item.id) {
        item.id = uuidv4();
      }

      // Filter valid fields based on table
      const filteredItem = this.filterValidFields(actualTable, item);

      // Convert field names to snake_case for Supabase
      const supabaseItem = this.convertToSnakeCase(filteredItem);
      const result = await this.supabaseService.add(actualTable, supabaseItem);
      console.log(`DATA: Added to Supabase ${table}:`, item.name || item.id);

      return this.convertToCamelCase(result);
    } catch (error) {
      console.error(`ERROR: Failed to add to ${table}:`, error);
      throw error;
    }
  }

  // Map legacy report fields to pid_reports schema
  mapReportFields(item) {
    // Map old status values to new valid values
    // Valid: 'draft', 'in_review', 'approved', 'issued', 'superseded', 'obsolete'
    const mapStatus = (oldStatus) => {
      const statusMap = {
        'completed': 'issued',
        'pending': 'draft',
        'active': 'in_review',
        'uploaded': 'issued',
        'processing': 'in_review'
      };
      return statusMap[oldStatus?.toLowerCase()] || oldStatus || 'draft';
    };

    const mapped = {
      ...item,
      // Map old field names to new
      projectAreaId: item.clinicId || item.projectAreaId,
      project_area_id: item.clinic_id || item.clinicId || item.projectAreaId || item.project_area_id,
      supervisorId: item.patientId || item.supervisorId,
      supervisor_id: item.patient_id || item.patientId || item.supervisorId || item.supervisor_id,
      documentTitle: item.fileName || item.title || item.documentTitle || 'Untitled Document',
      document_title: item.file_name || item.fileName || item.title || item.documentTitle || 'Untitled Document',
      documentNumber: item.documentNumber || `DOC-${Date.now()}`,
      document_number: item.documentNumber || `DOC-${Date.now()}`,
      filePath: item.filePath || item.storagePath || item.file_path,
      file_path: item.file_path || item.filePath || item.storagePath,
      fileUrl: item.fileUrl || item.file_url,
      file_url: item.file_url || item.fileUrl,
      status: mapStatus(item.status),
      documentType: item.reportType || item.documentType || 'pid',
      document_type: item.report_type || item.reportType || item.documentType || 'pid',
      revisionNumber: item.revisionNumber || '0',
      revision_number: item.revision_number || item.revisionNumber || '0'
    };

    // Only include engineer_id if it's provided, otherwise omit it (will use default or NULL)
    if (item.engineerId || item.engineer_id || item.uploadedBy || item.uploaded_by || item.createdBy || item.created_by) {
      mapped.engineerId = item.engineerId || item.uploadedBy || item.createdBy;
      mapped.engineer_id = item.engineer_id || item.engineerId || item.uploaded_by || item.created_by;
    }

    return mapped;
  }

  // Filter valid fields for each table
  filterValidFields(table, item) {
    const validFields = {
      'project_areas': [
        'id', 'name', 'code', 'description', 'location', 'facility_type', 'region', 'country',
        'primary_engineer_email', 'primary_engineer_name', 'phone', 'emergency_contact',
        'industry_type', 'plant_capacity', 'commissioning_date', 'last_turnaround_date',
        'next_turnaround_date', 'safety_rating', 'iso_certifications', 'compliance_standards',
        'status', 'operational_since', 'total_pid_count', 'active_pid_count', 'last_pid_update',
        'subscription_type', 'subscription_start_date', 'subscription_end_date',
        'max_supervisors', 'max_pid_uploads_per_month', 'current_month_uploads',
        'created_at', 'updated_at', 'created_by', 'is_active', 'metadata'
      ],
      'clinics': [
        // This is for backward compatibility - clinics table doesn't actually exist
        // It maps to project_areas table now
        'id', 'name', 'clinic_name', 'email', 'contact_person', 'phone', 'address', 'logo_url', 'is_active',
        'reports_used', 'reports_allowed', 'subscription_status', 'subscription_tier',
        'trial_start_date', 'trial_end_date', 'created_at', 'updated_at',
        'password' // ONLY use password field for authentication
        // Note: avatar stored in logo_url field
      ],
      'organizations': [
        'id', 'name', 'description', 'website', 'logo_url', 'is_active',
        'created_at', 'updated_at', 'owner_user_id'
      ],
      'profiles': [
        'id', 'role', 'full_name', 'phone', 'avatar_url', 'created_at', 'updated_at'
      ],
      'org_memberships': [
        'org_id', 'user_id', 'role', 'created_at'
      ],
      'patients': [
        // Old table - for backward compatibility
        'id', 'org_id', 'clinic_id', 'name', 'full_name', 'date_of_birth',
        'gender', 'phone', 'email', 'address', 'medical_history', 'improvement_focus',
        'brain_fitness_score', 'emergency_contact', 'created_at', 'updated_at',
        'avatar', 'profile_image', 'profileImage', 'avatar_url', 'password'
      ],
      'supervisors': [
        // New table for industrial supervisors
        'id', 'user_id', 'project_area_id', 'first_name', 'last_name', 'email', 'phone', 'employee_id',
        'safety_rating', 'clearance_level', 'emergency_contact_name', 'emergency_contact_phone',
        'department', 'shift_schedule', 'work_location', 'certifications', 'training_expiry_date',
        'last_safety_training', 'assigned_units', 'specialization', 'notes', 'is_active',
        'created_at', 'updated_at', 'created_by', 'updated_by'
      ],
      'reports': [
        // Legacy field names (will be mapped to pid_reports)
        'id', 'clinic_id', 'patient_id', 'supervisor_id', 'file_name', 'file_path',
        'report_data', 'status', 'created_at', 'updated_at'
      ],
      'pid_reports': [
        // New P&ID reports schema
        'id', 'document_number', 'document_title', 'revision_number', 'revision_date',
        'project_area_id', 'supervisor_id', 'engineer_id', 'document_type', 'drawing_category',
        'discipline', 'file_path', 'file_url', 'file_size_bytes', 'file_format', 'thumbnail_url',
        'process_unit', 'equipment_tags', 'instrument_tags', 'status', 'approval_status',
        'approval_date', 'approved_by', 'safety_classification', 'hazard_level', 'requires_moc',
        'isa_compliant', 'compliance_notes', 'tag_extraction_status', 'issue_date', 'effective_date',
        'next_review_date', 'description', 'comments', 'change_summary', 'distribution_list',
        'created_at', 'updated_at', 'created_by', 'updated_by'
      ],
      'payment_history': [
        'id', 'payment_id', 'order_id', 'signature', 'clinic_id', 'amount', 'currency', 'status',
        'package_id', 'package_name', 'reports', 'plan_details', 'subscription', 'payment_details',
        'provider', 'ip_address', 'user_agent', 'metadata', 'created_at', 'updated_at'
      ],
      'subscriptions': [
        'id', 'clinic_id', 'plan', 'status', 'amount', 'currency', 'package_name', 'payment_method',
        'payment_id', 'reports_allowed', 'environment', 'plan_details', 'subscription', 'payment_details',
        'created_at', 'updated_at'
      ],
      'algorithm_results': [
        'id', 'patient_id', 'patient_name', 'supervisor_id', 'supervisor_name', 'clinic_id', 'clinic_name', 'results',
        'eyes_open_file', 'eyes_closed_file', 'processed_at', 'processed_by', 'created_at'
      ]
    };

    const allowedFields = validFields[table];
    if (!allowedFields) {
      return item; // No filtering if table not defined
    }

    const filteredItem = {};
    for (const [key, value] of Object.entries(item)) {
      const snakeKey = this.toSnakeCase(key);
      if (allowedFields.includes(snakeKey) || allowedFields.includes(key)) {
        filteredItem[key] = value;
      } else {
        console.log(` Filtering out invalid field for ${table}: ${key}`);
      }
    }

    return filteredItem;
  }

  async update(table, id, updates) {
    try {
      const actualTable = this.mapTableName(table);
      console.log(`REFRESH: DatabaseService.update - Table: ${table}, ID: ${id}`);
      console.log(`REFRESH: Original updates:`, updates);

      // Filter valid fields based on table
      const filteredUpdates = this.filterValidFields(actualTable, updates);
      console.log(`REFRESH: Filtered updates:`, filteredUpdates);

      const supabaseUpdates = this.convertToSnakeCase(filteredUpdates);
      console.log(`REFRESH: Snake_case updates for Supabase:`, supabaseUpdates);

      const result = await this.supabaseService.update(actualTable, id, supabaseUpdates);
      console.log(`DATA: Updated in Supabase ${table}:`, id);
      console.log(`DATA: Supabase update result:`, result);

      return this.convertToCamelCase(result);
    } catch (error) {
      console.error(`ERROR: Failed to update ${table}:`, error);
      throw error;
    }
  }

  async delete(table, id) {
    console.log(`DELETE: DatabaseService.delete called:`, { table, id });

    if (!id) {
      throw new Error('Cannot delete: ID is required');
    }

    try {
      const actualTable = this.mapTableName(table);
      const result = await this.supabaseService.delete(actualTable, id);
      console.log('SUCCESS: Supabase delete successful:', result);
      return result;
    } catch (error) {
      console.error(`ERROR: Failed to delete from ${table}:`, error);
      throw error;
    }
  }

  async findById(table, id) {
    try {
      const actualTable = this.mapTableName(table);
      const result = await this.supabaseService.findById(actualTable, id);
      return this.convertToCamelCase(result);
    } catch (error) {
      console.error(`ERROR: Failed to find by ID in ${table}:`, error);
      throw error;
    }
  }

  async findBy(table, field, value) {
    try {
      const actualTable = this.mapTableName(table);
      const snakeField = this.toSnakeCase(field);
      const results = await this.supabaseService.findBy(actualTable, snakeField, value);
      return results.map(item => this.convertToCamelCase(item));
    } catch (error) {
      console.error(`ERROR: Failed to find by ${field} in ${table}:`, error);
      throw error;
    }
  }

  async findOne(table, field, value) {
    try {
      const actualTable = this.mapTableName(table);
      const snakeField = this.toSnakeCase(field);
      const result = await this.supabaseService.findOne(actualTable, snakeField, value);
      return this.convertToCamelCase(result);
    } catch (error) {
      console.error(`ERROR: Failed to find one in ${table}:`, error);
      throw error;
    }
  }

  // Case-insensitive search by field
  async findByNameIgnoreCase(table, name) {
    try {
      const actualTable = this.mapTableName(table);
      const results = await this.supabaseService.findByNameIgnoreCase(actualTable, name);
      return results.map(item => this.convertToCamelCase(item));
    } catch (error) {
      console.error(`ERROR: Failed to find by name (case-insensitive) in ${table}:`, error);
      throw error;
    }
  }

  // Convert between camelCase and snake_case
  toSnakeCase(str) {
    return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
  }

  toCamelCase(str) {
    return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
  }

  convertToSnakeCase(obj) {
    if (!obj || typeof obj !== 'object') return obj;
    if (Array.isArray(obj)) return obj.map(item => this.convertToSnakeCase(item));

    const converted = {};
    for (const [key, value] of Object.entries(obj)) {
      const snakeKey = this.toSnakeCase(key);
      converted[snakeKey] = value;
    }
    return converted;
  }

  convertToCamelCase(obj) {
    if (!obj || typeof obj !== 'object') return obj;
    if (Array.isArray(obj)) return obj.map(item => this.convertToCamelCase(item));

    const converted = {};
    for (const [key, value] of Object.entries(obj)) {
      const camelKey = this.toCamelCase(key);
      converted[camelKey] = value;
    }
    return converted;
  }

  // Super Admin specific methods
  async authenticateAdmin(email, password) {
    // Check localStorage for super admin (development mode)
    const superAdmins = await this.get('superAdmins');
    const admin = superAdmins.find(a => a.email === email);
    if (admin && admin.password === password && admin.isActive) {
      return { ...admin, password: undefined };
    }

    // Try Supabase authentication
    if (this.useSupabase) {
      try {
        const result = await this.supabaseService.signIn(email, password);
        if (result?.user) {
          return {
            id: result.user.id,
            email: result.user.email,
            role: result.user.user_metadata?.role || 'user',
            name: result.user.user_metadata?.name || 'User'
          };
        }
      } catch (error) {
        console.error('Supabase auth failed:', error);
      }
    }

    return null;
  }

  // Supervisor authentication
  async createPatientAuth(email, password, metadata = {}) {
    try {
      console.log('AUTH: Creating supervisor authentication account:', email);

      // Use Supabase Auth to create user
      const { data, error } = await this.supabaseService.supabase.auth.signUp({
        email: email,
        password: password,
        options: {
          data: {
            ...metadata,
            role: 'supervisor',
            created_by: 'clinic_admin'
          }
        }
      });

      if (error) {
        console.error('ERROR: Supabase auth signup error:', error);
        throw error;
      }

      console.log('SUCCESS: Supervisor auth account created successfully:', data.user?.id);

      // Also create profile record in profiles table
      if (data.user) {
        try {
          await this.supabaseService.supabase
            .from('profiles')
            .insert({
              id: data.user.id,
              role: 'supervisor',
              full_name: metadata.full_name || '',
              created_at: new Date().toISOString()
            });
          console.log('SUCCESS: Supervisor profile created');
        } catch (profileError) {
          console.error('WARNING: Profile creation failed (continuing anyway):', profileError);
        }
      }

      return data;
    } catch (error) {
      console.error('ERROR: Failed to create supervisor auth:', error);
      throw error;
    }
  }

  // Project area specific methods (maps to project_areas table)
  async createClinic(clinicData) {
    try {
      console.log('PROJECT_AREA: Creating project area with data:', clinicData);

      // Generate a unique code for the project area if not provided
      const projectCode = clinicData.code || `PA-${Date.now().toString(36).toUpperCase()}`;

      // Map clinic data to project_areas table schema
      const projectAreaRecord = {
        name: clinicData.name || clinicData.clinicName,
        code: projectCode,
        description: clinicData.description || `Project Area: ${clinicData.name || clinicData.clinicName}`,
        location: clinicData.address || clinicData.location || '',
        facility_type: clinicData.facility_type || 'General',
        region: clinicData.region || 'Default',
        country: clinicData.country || 'UAE',
        primary_engineer_email: clinicData.email || clinicData.primary_engineer_email,
        primary_engineer_name: clinicData.contact_person || clinicData.contactPerson || clinicData.primary_engineer_name || '',
        phone: clinicData.phone || '',
        emergency_contact: clinicData.emergency_contact || '',
        industry_type: clinicData.industry_type || 'Industrial',
        status: 'active',
        is_active: clinicData.is_active !== undefined ? clinicData.is_active : true,
        // Map subscription fields
        subscription_type: clinicData.subscription_status || clinicData.subscriptionStatus || 'trial',
        subscription_start_date: clinicData.trial_start_date || new Date().toISOString(),
        subscription_end_date: clinicData.trial_end_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        max_supervisors: clinicData.max_supervisors || 5,
        max_pid_uploads_per_month: clinicData.reports_allowed || parseInt(clinicData.reportsAllowed) || 10,
        current_month_uploads: clinicData.reports_used || clinicData.reportsUsed || 0,
        // Timestamps
        created_at: clinicData.created_at || clinicData.createdAt || new Date().toISOString(),
        updated_at: clinicData.updated_at || new Date().toISOString()
      };

      // IMPORTANT: Preserve the ID if provided (for existing records)
      if (clinicData.id) {
        projectAreaRecord.id = clinicData.id;
      }

      console.log('INFO: Project area data to create:', projectAreaRecord);

      // Insert into project_areas table
      const { data: projectArea, error } = await this.supabaseService.supabase
        .from('project_areas')
        .insert(projectAreaRecord)
        .select()
        .single();

      if (error) {
        console.error('ERROR: Supabase insert error:', error);
        throw error;
      }

      console.log('SUCCESS: Project area created:', projectArea);

      // Return in camelCase format for backward compatibility
      return {
        id: projectArea.id,
        name: projectArea.name,
        email: projectArea.primary_engineer_email,
        phone: projectArea.phone,
        address: projectArea.location,
        logoUrl: projectArea.logo_url,
        contactPerson: projectArea.primary_engineer_name,
        isActive: projectArea.is_active,
        reportsUsed: projectArea.current_month_uploads,
        reportsAllowed: projectArea.max_pid_uploads_per_month,
        subscriptionStatus: projectArea.subscription_type,
        subscriptionTier: projectArea.subscription_type,
        trialStartDate: projectArea.subscription_start_date,
        trialEndDate: projectArea.subscription_end_date,
        createdAt: projectArea.created_at,
        updatedAt: projectArea.updated_at
        // Note: Using single 'password' field for authentication (adminPassword removed)
      };

    } catch (error) {
      console.error('ERROR: Failed to create project area:', error);
      throw error;
    }
  }

  async getClinicUsage(clinicId) {
    const usage = await this.findBy('usage', 'clinicId', clinicId);
    const reports = await this.findBy('reports', 'clinicId', clinicId);

    return {
      totalReports: reports.length,
      reportsThisMonth: reports.filter(r => {
        const reportDate = new Date(r.createdAt);
        const now = new Date();
        return reportDate.getMonth() === now.getMonth() && reportDate.getFullYear() === now.getFullYear();
      }).length,
      usage: usage
    };
  }

  // Patient/Supervisor specific methods (using old 'patients' table for backward compatibility)
  async getSupervisorsByClinic(clinicId) {
    // 'patients' maps to 'supervisors' table which uses project_area_id column
    return await this.findBy('patients', 'project_area_id', clinicId);
  }

  // Reports specific methods
  async getReportsByClinic(clinicId) {
    try {
      if (!clinicId) {
        console.warn('WARNING: getReportsByClinic: No project area ID provided');
        return [];
      }

      // Get all reports and filter in memory to handle both old and new formats
      try {
        const actualTable = this.mapTableName('reports');

        // Get all reports from the table
        const { data: allReports, error } = await this.supabaseService.supabase
          .from(actualTable)
          .select('*');

        if (error) {
          console.error('ERROR: Error querying all reports:', error);
          return [];
        }

        // Filter reports that belong to this project area (check multiple field names)
        const clinicReports = (allReports || []).filter(report => {
          return report.clinic_id === clinicId ||
                 report.clinicId === clinicId ||
                 report.org_id === clinicId;
        });

        console.log(`INFO: Found ${clinicReports.length} reports for project area ${clinicId} (from ${allReports?.length || 0} total reports)`);

        // Fix old reports by updating them with clinic_id field if missing
        for (const report of clinicReports) {
          let needsUpdate = false;
          const updates = {};

          // Fix missing clinic_id
          if (!report.clinic_id && (report.org_id || report.clinicId)) {
            console.log(`CONFIG: Fixing report ${report.id} - adding clinic_id field`);
            updates.clinic_id = clinicId;
            report.clinic_id = clinicId;
            needsUpdate = true;
          }

          // Fix missing patient_id - try to get from report_data or file_path
          if (!report.patient_id) {
            console.log(`CONFIG: Report ${report.id} has null patient_id, attempting to fix...`);
            console.log(`  FILE: Report file_path:`, report.file_path);
            console.log(`  FILE: Report report_data:`, report.report_data);

            // Check if report_data has supervisor info
            if (report.report_data && typeof report.report_data === 'object') {
              const patientIdFromData = report.report_data.patientId || report.report_data.patient_id;
              if (patientIdFromData) {
                console.log(`  SUCCESS: Found patient_id in report_data: ${patientIdFromData}`);
                updates.patient_id = patientIdFromData;
                report.patient_id = patientIdFromData;
                needsUpdate = true;
              } else {
                console.log(`  ERROR: No patient_id found in report_data`);
              }
            } else {
              console.log(`  ERROR: report_data is not an object or is null`);
            }

            // If still no patient_id, try to extract from file_path
            if (!updates.patient_id && report.file_path) {
              // file_path format: reports/{clinicId}/{patientId}/{filename}
              const pathParts = report.file_path.split('/');
              console.log(`  FOLDER: file_path parts:`, pathParts);
              if (pathParts.length >= 3 && pathParts[0] === 'reports') {
                const potentialPatientId = pathParts[2];
                console.log(`  SUCCESS: Found patient_id in file_path: ${potentialPatientId}`);
                updates.patient_id = potentialPatientId;
                report.patient_id = potentialPatientId;
                needsUpdate = true;
              } else {
                console.log(`  ERROR: file_path format doesn't match expected pattern`);
              }
            } else if (!report.file_path) {
              console.log(`  ERROR: No file_path available`);
            }

            if (!updates.patient_id) {
              console.warn(`  WARNING: Could not determine patient_id for report ${report.id}`);
            }
          }

          // Apply updates if needed
          if (needsUpdate && Object.keys(updates).length > 0) {
            try {
              await this.supabaseService.supabase
                .from(actualTable)
                .update(updates)
                .eq('id', report.id);
              console.log(`  SUCCESS: Successfully updated report ${report.id}`);
            } catch (updateError) {
              console.warn(`  WARNING: Could not update report ${report.id}:`, updateError);
            }
          }
        }

        return clinicReports.map(item => this.convertToCamelCase(item));
      } catch (error) {
        console.error(`ERROR: Error getting reports for project area ${clinicId}:`, error);
        return [];
      }
    } catch (error) {
      console.error(`ERROR: Outer error getting reports for project area ${clinicId}:`, error);
      return [];
    }
  }

  async getReportsByPatient(patientId) {
    try {
      if (!patientId) {
        console.warn('WARNING: getReportsByPatient: No patient ID provided');
        return [];
      }

      // Use patient_id field (old schema) for backward compatibility
      const reports = await this.findBy('reports', 'patient_id', patientId);
      console.log(`INFO: Found ${reports?.length || 0} reports for patient ${patientId}`);
      return reports || [];
    } catch (error) {
      console.error(`ERROR: Error getting reports for patient ${patientId}:`, error);
      return [];
    }
  }

  async addReport(reportData) {
    const report = await this.add('reports', reportData);

    // Get project area ID from reportData (could be clinicId, orgId, or org_id)
    const clinicId = reportData.clinicId || reportData.orgId || reportData.org_id;

    // Update project area usage
    if (clinicId) {
      try {
        const clinic = await this.findById('clinics', clinicId);
        if (clinic) {
          await this.update('clinics', clinic.id, {
            reportsUsed: (clinic.reportsUsed || 0) + 1
          });
          console.log('SUCCESS: Updated project area reports usage count');
        }
      } catch (updateError) {
        console.warn('WARNING: Could not update project area usage:', updateError);
        // Continue anyway - report was created successfully
      }
    }

    // Skip usage tracking for now - 'usage' table doesn't exist yet
    // TODO: Create proper usage/analytics table in future
    console.log('INFO: Skipping usage tracking (table not configured)');

    return report;
  }

  // Analytics methods
  async getAnalytics() {
    const clinics = await this.get('clinics');
    const reports = await this.get('reports');
    const patients = await this.get('patients'); // Use old table for backward compatibility

    const activeClinicCount = clinics.filter(c => c.isActive || c.is_active).length;
    const totalReportsCount = reports.length;
    const totalPatientsCount = patients.length;

    const revenueData = await Promise.all(clinics.map(async (clinic) => {
      const subscription = await this.findOne('subscriptions', 'clinicId', clinic.id);
      return subscription && subscription.amount ? subscription.amount : 0;
    }));

    const totalRevenue = revenueData.reduce((acc, amount) => acc + amount, 0);
    const usage = await this.get('usage');

    return {
      activeClinics: activeClinicCount,  // Clinics count
      totalReports: totalReportsCount,
      totalPatients: totalPatientsCount,  // Patients count
      monthlyRevenue: totalRevenue,
      recentActivity: usage.slice(-10).reverse()
    };
  }

  // Force refresh data connection
  async refreshConnection() {
    console.log('REFRESH: Refreshing database connection...');
    await this.checkSupabaseAvailability();
  }

  // Check and update expired trials
  async checkTrialExpiry(clinicId) {
    try {
      const clinic = await this.findById('clinics', clinicId);
      if (!clinic) return { expired: false, clinic: null };

      // Check if trial has expired
      if (clinic.subscriptionStatus === 'trial' && clinic.trialEndDate) {
        const trialEndDate = new Date(clinic.trialEndDate);
        const now = new Date();

        if (now > trialEndDate) {
          console.log(`TIMER: Trial expired for project area ${clinicId}`);

          // Update project area status
          await this.update('clinics', clinicId, {
            subscriptionStatus: 'expired',
            isActive: false
          });

          return {
            expired: true,
            clinic: {
              ...clinic,
              subscriptionStatus: 'expired',
              isActive: false
            },
            expiredAt: trialEndDate
          };
        }
      }

      return { expired: false, clinic };
    } catch (error) {
      console.error('Error checking trial expiry:', error);
      return { expired: false, clinic: null, error };
    }
  }

  // Check all expired trials (can be run periodically)
  async checkAllExpiredTrials() {
    try {
      console.log('DEBUG: Checking all expired trials...');

      const clinics = await this.get('clinics');
      const expiredClinics = [];

      for (const clinic of clinics) {
        const result = await this.checkTrialExpiry(clinic.id);
        if (result.expired) {
          expiredClinics.push(clinic);
        }
      }

      console.log(`SUCCESS: Found ${expiredClinics.length} expired trials`);
      return expiredClinics;
    } catch (error) {
      console.error('Error checking expired trials:', error);
      return [];
    }
  }
}

export default new DatabaseService();
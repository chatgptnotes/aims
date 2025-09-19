#!/usr/bin/env node
import { DynamoDBClient, ScanCommand } from '@aws-sdk/client-dynamodb';
import { unmarshall } from '@aws-sdk/util-dynamodb';
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { z } from 'zod';

config();

// AWS DynamoDB configuration
const dynamoClient = new DynamoDBClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

// Supabase configuration
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Migration schemas
const UserMigrationSchema = z.object({
  userId: z.string(),
  email: z.string().email(),
  name: z.string(),
  role: z.enum(['patient', 'clinician', 'admin']),
  clinicId: z.string().optional(),
  createdAt: z.string(),
});

const PatientMigrationSchema = z.object({
  patientId: z.string(),
  clinicId: z.string(),
  userId: z.string().optional(),
  name: z.string(),
  dateOfBirth: z.string(),
  gender: z.enum(['male', 'female', 'other']),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  medicalHistory: z.any().optional(),
});

const ReportMigrationSchema = z.object({
  reportId: z.string(),
  patientId: z.string(),
  clinicianId: z.string(),
  reportType: z.string(),
  data: z.any(),
  s3Key: z.string().optional(),
  createdAt: z.string(),
});

// Table mapping
const TABLE_MAPPINGS = {
  'neurosense-users': 'profiles',
  'neurosense-patients': 'patients',
  'neurosense-reports': 'eeg_reports',
  'neurosense-sessions': 'sessions',
  'neurosense-clinics': 'organizations',
};

async function scanDynamoTable(tableName: string) {
  const items = [];
  let lastEvaluatedKey;

  do {
    const command = new ScanCommand({
      TableName: tableName,
      ExclusiveStartKey: lastEvaluatedKey,
    });

    const response = await dynamoClient.send(command);

    if (response.Items) {
      items.push(...response.Items.map(item => unmarshall(item)));
    }

    lastEvaluatedKey = response.LastEvaluatedKey;
  } while (lastEvaluatedKey);

  return items;
}

async function migrateUsers() {
  console.log('🔄 Migrating users...');

  try {
    const users = await scanDynamoTable('neurosense-users');
    console.log(`Found ${users.length} users to migrate`);

    const migrated = [];
    const errors = [];

    for (const user of users) {
      try {
        const validated = UserMigrationSchema.parse({
          userId: user.userId || user.id,
          email: user.email,
          name: user.name || user.fullName,
          role: user.role || 'patient',
          clinicId: user.clinicId,
          createdAt: user.createdAt || new Date().toISOString(),
        });

        // Create auth user
        const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
          email: validated.email,
          email_confirm: true,
          user_metadata: {
            full_name: validated.name,
            migrated_from: 'dynamodb',
            original_id: validated.userId,
          },
        });

        if (authError) {
          console.error(`Failed to create auth user for ${validated.email}:`, authError);
          errors.push({ user: validated, error: authError });
          continue;
        }

        // Create profile
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: authUser.user.id,
            full_name: validated.name,
            role: validated.role as any,
            created_at: validated.createdAt,
          });

        if (profileError) {
          console.error(`Failed to create profile for ${validated.email}:`, profileError);
          errors.push({ user: validated, error: profileError });
          continue;
        }

        // Add to organization if applicable
        if (validated.clinicId) {
          const { error: membershipError } = await supabase
            .from('org_memberships')
            .insert({
              user_id: authUser.user.id,
              org_id: validated.clinicId,
              role: validated.role === 'admin' ? 'owner' : validated.role === 'clinician' ? 'clinician' : 'staff',
            });

          if (membershipError) {
            console.error(`Failed to add membership for ${validated.email}:`, membershipError);
          }
        }

        migrated.push({
          originalId: validated.userId,
          newId: authUser.user.id,
          email: validated.email,
        });

        console.log(`✅ Migrated user: ${validated.email}`);
      } catch (error) {
        console.error(`Failed to migrate user:`, error);
        errors.push({ user, error });
      }
    }

    console.log(`\n✅ Successfully migrated ${migrated.length} users`);
    console.log(`❌ Failed to migrate ${errors.length} users`);

    return { migrated, errors };
  } catch (error) {
    console.error('Failed to migrate users:', error);
    throw error;
  }
}

async function migratePatients(userIdMap: Map<string, string>) {
  console.log('\n🔄 Migrating patients...');

  try {
    const patients = await scanDynamoTable('neurosense-patients');
    console.log(`Found ${patients.length} patients to migrate`);

    const migrated = [];
    const errors = [];

    for (const patient of patients) {
      try {
        const validated = PatientMigrationSchema.parse({
          patientId: patient.patientId || patient.id,
          clinicId: patient.clinicId,
          userId: patient.userId,
          name: patient.name || patient.fullName,
          dateOfBirth: patient.dateOfBirth || patient.dob,
          gender: patient.gender || 'other',
          phone: patient.phone,
          email: patient.email,
          medicalHistory: patient.medicalHistory,
        });

        // Map user ID if exists
        const ownerUserId = validated.userId ? userIdMap.get(validated.userId) : null;

        const { data: newPatient, error } = await supabase
          .from('patients')
          .insert({
            org_id: validated.clinicId,
            owner_user: ownerUserId || validated.clinicId, // Fallback to org as owner
            full_name: validated.name,
            date_of_birth: validated.dateOfBirth,
            gender: validated.gender as any,
            phone: validated.phone,
            email: validated.email,
            medical_history: validated.medicalHistory,
            external_id: validated.patientId,
          })
          .select()
          .single();

        if (error) {
          console.error(`Failed to migrate patient ${validated.name}:`, error);
          errors.push({ patient: validated, error });
          continue;
        }

        migrated.push({
          originalId: validated.patientId,
          newId: newPatient.id,
          name: validated.name,
        });

        console.log(`✅ Migrated patient: ${validated.name}`);
      } catch (error) {
        console.error(`Failed to migrate patient:`, error);
        errors.push({ patient, error });
      }
    }

    console.log(`\n✅ Successfully migrated ${migrated.length} patients`);
    console.log(`❌ Failed to migrate ${errors.length} patients`);

    return { migrated, errors };
  } catch (error) {
    console.error('Failed to migrate patients:', error);
    throw error;
  }
}

async function migrateReports(patientIdMap: Map<string, string>, userIdMap: Map<string, string>) {
  console.log('\n🔄 Migrating EEG reports...');

  try {
    const reports = await scanDynamoTable('neurosense-reports');
    console.log(`Found ${reports.length} reports to migrate`);

    const migrated = [];
    const errors = [];

    for (const report of reports) {
      try {
        const validated = ReportMigrationSchema.parse({
          reportId: report.reportId || report.id,
          patientId: report.patientId,
          clinicianId: report.clinicianId || report.userId,
          reportType: report.reportType || 'eeg',
          data: report.data || report.metrics,
          s3Key: report.s3Key || report.filePath,
          createdAt: report.createdAt || new Date().toISOString(),
        });

        // Map IDs
        const newPatientId = patientIdMap.get(validated.patientId);
        if (!newPatientId) {
          console.error(`Patient not found for report: ${validated.reportId}`);
          errors.push({ report: validated, error: 'Patient not found' });
          continue;
        }

        const { data: newReport, error } = await supabase
          .from('eeg_reports')
          .insert({
            patient_id: newPatientId,
            metrics: validated.data,
            file_path: validated.s3Key,
            created_at: validated.createdAt,
          })
          .select()
          .single();

        if (error) {
          console.error(`Failed to migrate report ${validated.reportId}:`, error);
          errors.push({ report: validated, error });
          continue;
        }

        migrated.push({
          originalId: validated.reportId,
          newId: newReport.id,
        });

        console.log(`✅ Migrated report: ${validated.reportId}`);
      } catch (error) {
        console.error(`Failed to migrate report:`, error);
        errors.push({ report, error });
      }
    }

    console.log(`\n✅ Successfully migrated ${migrated.length} reports`);
    console.log(`❌ Failed to migrate ${errors.length} reports`);

    return { migrated, errors };
  } catch (error) {
    console.error('Failed to migrate reports:', error);
    throw error;
  }
}

async function migrateClinics() {
  console.log('\n🔄 Migrating clinics to organizations...');

  try {
    const clinics = await scanDynamoTable('neurosense-clinics');
    console.log(`Found ${clinics.length} clinics to migrate`);

    const migrated = [];
    const errors = [];

    for (const clinic of clinics) {
      try {
        const { data: org, error } = await supabase
          .from('organizations')
          .insert({
            id: clinic.clinicId || clinic.id,
            name: clinic.name || clinic.clinicName,
            type: 'clinic',
            address: clinic.address,
            phone: clinic.phone,
            email: clinic.email,
            created_at: clinic.createdAt || new Date().toISOString(),
          })
          .select()
          .single();

        if (error) {
          console.error(`Failed to migrate clinic ${clinic.name}:`, error);
          errors.push({ clinic, error });
          continue;
        }

        migrated.push({
          originalId: clinic.clinicId || clinic.id,
          newId: org.id,
          name: clinic.name,
        });

        console.log(`✅ Migrated clinic: ${clinic.name}`);
      } catch (error) {
        console.error(`Failed to migrate clinic:`, error);
        errors.push({ clinic, error });
      }
    }

    console.log(`\n✅ Successfully migrated ${migrated.length} clinics`);
    console.log(`❌ Failed to migrate ${errors.length} clinics`);

    return { migrated, errors };
  } catch (error) {
    console.error('Failed to migrate clinics:', error);
    throw error;
  }
}

async function main() {
  console.log('🚀 Starting DynamoDB to Supabase migration...\n');

  try {
    // Migrate clinics first (they're referenced by users and patients)
    const clinicResults = await migrateClinics();

    // Migrate users
    const userResults = await migrateUsers();
    const userIdMap = new Map(
      userResults.migrated.map(u => [u.originalId, u.newId])
    );

    // Migrate patients
    const patientResults = await migratePatients(userIdMap);
    const patientIdMap = new Map(
      patientResults.migrated.map(p => [p.originalId, p.newId])
    );

    // Migrate reports
    const reportResults = await migrateReports(patientIdMap, userIdMap);

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 Migration Summary:');
    console.log('='.repeat(60));
    console.log(`Clinics: ${clinicResults.migrated.length} migrated, ${clinicResults.errors.length} failed`);
    console.log(`Users: ${userResults.migrated.length} migrated, ${userResults.errors.length} failed`);
    console.log(`Patients: ${patientResults.migrated.length} migrated, ${patientResults.errors.length} failed`);
    console.log(`Reports: ${reportResults.migrated.length} migrated, ${reportResults.errors.length} failed`);

    // Save migration results
    const results = {
      timestamp: new Date().toISOString(),
      clinics: clinicResults,
      users: userResults,
      patients: patientResults,
      reports: reportResults,
    };

    await Bun.write(
      `migration-results-${Date.now()}.json`,
      JSON.stringify(results, null, 2)
    );

    console.log('\n✅ Migration complete! Results saved to migration-results.json');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run migration
if (import.meta.main) {
  main();
}
# AIMS Database Migration Guide

## Overview

This directory contains comprehensive SQL migration files for the **AIMS (Asset Information Management System)** database. The migrations transform the healthcare-oriented structure into a proper industrial asset management system with P&ID (Piping and Instrumentation Diagram) processing capabilities.

## Industrial Context

AIMS is designed for engineering documentation management in industrial facilities such as:
- Oil & Gas processing plants
- Chemical manufacturing facilities
- Power generation stations
- Petrochemical complexes
- Manufacturing plants
- Any facility requiring ISA-5.1 compliant instrumentation documentation

## Migration Files

### Execution Order

**IMPORTANT:** Execute migrations in numerical order (001 → 008) to ensure proper dependency resolution.

### 001_create_project_areas_table.sql
**Purpose:** Creates the foundation organizational units where engineering work happens.

**Key Features:**
- Project areas represent facilities, plants, or operational sites
- Geographical tracking with coordinates
- Industry classification (Oil & Gas, Chemical, Power, etc.)
- Compliance and standards tracking (ISA-5.1, API, ASME, etc.)
- Subscription management
- RLS policies for multi-tenant isolation

**Industrial Terminology:**
- `project_code`: Unique facility identifier (e.g., "PRJ-001", "PLANT-A")
- `industry_type`: Type of facility
- `applicable_standards`: Array of industry standards
- `design_pressure_rating`, `design_temperature_rating`: Engineering specifications

### 002_create_supervisors_table.sql
**Purpose:** Manages operational personnel records.

**Key Features:**
- Employee identification and contact information
- Professional certifications and licenses
- Work area assignments and shift schedules
- Safety training compliance tracking
- Hierarchical reporting structure
- ISA-5.1 style UIDs (SUP-PROJECTCODE-0001)

**Industrial Terminology:**
- `supervisor_uid`: Unique identifier following industrial numbering
- `certifications`: Professional qualifications (PE, ISA CAP, etc.)
- `clearance_level`: Security clearance for restricted projects
- `safety_training_completed`: Compliance tracking

### 003_create_engineers_table.sql
**Purpose:** Engineers who manage project areas and documentation.

**Key Features:**
- Professional registration tracking (PE, CEng, etc.)
- Engineering discipline and specialization
- Project area ownership (one-to-one relationship)
- Document approval authority
- Digital signature capability
- Dashboard and notification preferences

**Industrial Terminology:**
- `engineer_uid`: Unique identifier (ENG-PROJECTCODE-LEAD)
- `professional_registrations`: PE, Chartered Engineer, etc.
- `engineering_discipline`: Chemical, Mechanical, Electrical, etc.
- `can_approve_reports`: Document approval authority

### 004_create_pid_reports_table.sql
**Purpose:** P&ID documents and technical drawings.

**Key Features:**
- Standard drawing numbering system
- Revision control with superseded tracking
- Document type classification (PFD, P&ID, UFD, etc.)
- CAD/drawing metadata
- Approval workflow tracking
- Tag extraction status
- Standards compliance (ISA-5.1, API, ASME, IEC)

**Industrial Terminology:**
- `drawing_number`: Industry-standard drawing number (PID-001-A-001)
- `revision_number`: Drawing revision (A, B, C...)
- `document_type`: Type of technical drawing
- `process_unit`: Which system/unit the P&ID covers
- `design_pressure`, `design_temperature`: Engineering specifications
- `hazard_classification`: Area classification (Class I Div 1, Zone 0, etc.)

### 005_create_tag_extractions_table.sql
**Purpose:** ISA-5.1 compliant instrument tags from P&IDs.

**Key Features:**
- Automatic tag parsing (prefix, loop number, suffix)
- ISA-5.1 standard compliance
- Instrument technical specifications
- Control system integration (DCS, PLC, SCADA)
- Safety classification (SIL, SIS)
- Calibration and maintenance tracking
- AI/ML extraction metadata

**Industrial Terminology:**
- `tag_number`: Instrument tag (FT-101, PCV-202A, TIC-304)
- `measured_variable`: Flow, Pressure, Temperature, Level, etc.
- `instrument_function`: Type of instrument
- `sil_level`: Safety Integrity Level (SIL 1-4)
- `signal_type`: 4-20mA, HART, Fieldbus, etc.
- `area_classification`: Hazardous area classification

**ISA-5.1 Tag Format:**
```
FT-101
││ │││
││ │└─ Suffix (optional)
││ └── Loop/sequence number
│└──── Readout/modifier
└───── Measured variable (F=Flow)

Examples:
- FT-101: Flow Transmitter, loop 101
- PCV-202A: Pressure Control Valve, loop 202, train A
- TIC-304: Temperature Indicator Controller, loop 304
- LAH-405: Level Alarm High, loop 405
```

### 006_create_algorithm_results_table.sql
**Purpose:** Results from validation and analysis algorithms.

**Key Features:**
- Multiple algorithm types (validation, compliance, consistency)
- Performance metrics and statistics
- Quality scoring (completeness, accuracy, consistency)
- Standards compliance checking
- Error tracking and recommendations
- Historical comparison

**Industrial Terminology:**
- `algorithm_type`: Type of analysis performed
- `compliance_percentage`: Standards compliance score
- `affected_tags`: Tags with issues or findings
- `standards_checked`: Which standards were validated against
- `data_quality_score`, `completeness_score`: Quality metrics

### 007_create_roles_and_permissions.sql
**Purpose:** Role-Based Access Control (RBAC) system.

**Key Features:**
- Hierarchical role structure
- Fine-grained permissions
- Scope-based access (project, department, organization)
- Access Control Lists (ACL)
- Default roles: Admin, Lead Engineer, Engineer, Supervisor, Viewer, Auditor
- Permission checking functions

**Roles:**
1. **System Administrator**: Full system access
2. **Lead Engineer**: Senior engineer with approval authority
3. **Project Engineer**: Manages day-to-day engineering work
4. **Supervisor**: Operations personnel, limited access
5. **Viewer**: Read-only access
6. **External Auditor**: Compliance auditing access

### 008_create_audit_logs_table.sql
**Purpose:** Comprehensive audit trail for compliance and security.

**Key Features:**
- Partitioned by month for performance
- Complete change tracking (old/new values)
- Security event logging
- Compliance tracking
- Automatic triggers on all main tables
- Retention management
- Failed login tracking

**Compliance Features:**
- 7-year default retention (adjustable)
- PII/PHI tracking flags
- Data classification levels
- Geolocation tracking
- Complete change history

## Database Schema Overview

```
┌─────────────────────┐
│  project_areas      │  ← Organizational units (facilities)
└──────────┬──────────┘
           │
           ├─────────────────────────────────┐
           │                                 │
┌──────────▼──────────┐          ┌──────────▼──────────┐
│  engineers          │          │  supervisors        │
│  (1:1 with PA)      │          │  (Many per PA)      │
└──────────┬──────────┘          └──────────┬──────────┘
           │                                 │
           │                     ┌───────────┘
           │                     │
           │          ┌──────────▼──────────┐
           └──────────►  pid_reports        │  ← Technical drawings
                      └──────────┬──────────┘
                                 │
                      ┌──────────┴──────────┐
                      │                     │
           ┌──────────▼──────────┐  ┌──────▼───────────┐
           │  tag_extractions    │  │ algorithm_results│
           │  (ISA-5.1 tags)     │  │ (Analysis)       │
           └─────────────────────┘  └──────────────────┘

Cross-cutting:
├── roles & permissions (RBAC)
└── audit_logs (All activity tracking)
```

## Key Design Principles

### 1. ISA-5.1 Compliance
All instrument tagging follows ISA-5.1 standard for instrumentation symbols and identification.

### 2. Soft Delete Pattern
All main tables use soft delete (`deleted_at` timestamp) to maintain data integrity and audit trail.

### 3. UUID Primary Keys
Using UUIDs for primary keys enables distributed systems and prevents ID conflicts.

### 4. Row Level Security (RLS)
Every table has RLS policies ensuring data isolation between project areas.

### 5. Automatic Auditing
All data changes are automatically logged to `audit_logs` table via triggers.

### 6. Revision Control
P&ID reports support full revision tracking with superseded relationships.

### 7. JSONB for Flexibility
Complex or variable data structures use JSONB for schema flexibility.

## Indexes and Performance

Each table includes comprehensive indexes:
- **Primary lookups**: UIDs, codes, email addresses
- **Foreign keys**: All relationships
- **Status fields**: Frequently filtered columns
- **Full-text search**: GIN indexes on text fields
- **JSONB/Array**: GIN indexes for JSON and array columns
- **Composite**: Multi-column indexes for common queries

## Security Features

### Multi-tenant Isolation
- Project areas are isolated via RLS policies
- Engineers see only their project area
- Supervisors see only their assigned records

### Audit Trail
- All create, update, delete operations logged
- Change tracking with old/new values
- Security event monitoring
- Failed login attempt tracking

### Access Control
- Role-based permissions
- Scope-based access (project, department, organization)
- Fine-grained ACLs for specific resources
- Permission checking functions

## Compliance Features

### Industry Standards
- ISA-5.1 (Instrumentation Symbols and Identification)
- API 14C (Analysis, Design, Installation, and Testing of Safety Systems)
- ASME B31.3 (Process Piping)
- IEC 61511 (Safety Instrumented Systems)
- ATEX/IECEx (Explosive atmospheres)

### Regulatory Compliance
- 7-year audit retention (CFR 21 Part 11)
- Complete change history
- Electronic signatures support
- Data classification and PII tracking

## Migration Execution

### Using Supabase CLI

```bash
# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Run migrations in order
supabase db push
```

### Using SQL Client

Execute each file in numerical order:

```bash
psql -h your-db-host -U postgres -d postgres -f 001_create_project_areas_table.sql
psql -h your-db-host -U postgres -d postgres -f 002_create_supervisors_table.sql
psql -h your-db-host -U postgres -d postgres -f 003_create_engineers_table.sql
psql -h your-db-host -U postgres -d postgres -f 004_create_pid_reports_table.sql
psql -h your-db-host -U postgres -d postgres -f 005_create_tag_extractions_table.sql
psql -h your-db-host -U postgres -d postgres -f 006_create_algorithm_results_table.sql
psql -h your-db-host -U postgres -d postgres -f 007_create_roles_and_permissions.sql
psql -h your-db-host -U postgres -d postgres -f 008_create_audit_logs_table.sql
```

## Post-Migration Tasks

### 1. Create Initial Project Area
```sql
INSERT INTO project_areas (
    project_code,
    project_name,
    industry_type,
    facility_location
) VALUES (
    'DEMO-001',
    'Demo Facility',
    'Oil & Gas',
    'Houston, TX'
);
```

### 2. Create Engineer Account
```sql
-- First create user in auth.users, then:
INSERT INTO engineers (
    project_area_id,
    user_id,
    first_name,
    last_name,
    email,
    job_title,
    engineering_discipline
) VALUES (
    '<project_area_id>',
    '<user_id>',
    'John',
    'Doe',
    'john.doe@example.com',
    'Lead Engineer',
    'Process Engineering'
);
```

### 3. Assign Roles
```sql
-- Get the engineer role ID
SELECT id FROM roles WHERE role_code = 'ENGINEER';

-- Assign role to user
INSERT INTO user_roles (
    user_id,
    role_id,
    scope,
    scope_id,
    is_primary_role
) VALUES (
    '<user_id>',
    '<engineer_role_id>',
    'project_area',
    '<project_area_id>',
    TRUE
);
```

## Maintenance Tasks

### Archive Old Audit Logs
```sql
-- Archive logs older than 1 year
SELECT archive_old_audit_logs(365);
```

### Delete Expired Logs
```sql
-- Delete logs beyond retention period
SELECT delete_expired_audit_logs();
```

### Create New Audit Log Partition
```sql
-- Create partition for new month
CREATE TABLE audit_logs_2026_01 PARTITION OF audit_logs
    FOR VALUES FROM ('2026-01-01') TO ('2026-02-01');
```

## Troubleshooting

### Permission Denied Errors
Ensure RLS policies are correctly configured and user has proper role assignments.

```sql
-- Check user's roles
SELECT * FROM user_roles WHERE user_id = '<user_id>';

-- Check user's permissions
SELECT * FROM get_user_permissions('<user_id>');
```

### Missing References
Ensure migrations are executed in order. Foreign key constraints require parent tables to exist first.

### Performance Issues
Check that indexes are created properly:

```sql
-- List all indexes on a table
SELECT * FROM pg_indexes WHERE tablename = 'pid_reports';
```

## Additional Resources

- [ISA-5.1 Standard](https://www.isa.org/standards-and-publications/isa-standards/isa-standards-committees/isa5-1)
- [Supabase Documentation](https://supabase.com/docs)
- [PostgreSQL RLS](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [JSONB in PostgreSQL](https://www.postgresql.org/docs/current/datatype-json.html)

## Support

For issues or questions:
1. Review this documentation
2. Check table comments: `\d+ table_name` in psql
3. Review audit logs for error tracking
4. Consult system administrator

---

**Version:** 1.0.0
**Last Updated:** 2025-11-27
**Compatible With:** PostgreSQL 14+, Supabase

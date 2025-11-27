# AIMS Terminology Mapping Guide

## Overview

This document maps the original healthcare/clinical terminology to the new industrial asset management terminology used in AIMS (Asset Information Management System).

---

## Database Tables

| Original (Healthcare) | New (Industrial) | Purpose |
|----------------------|------------------|---------|
| `clinics` | `project_areas` | Organizational units where work happens |
| `patients` | `supervisors` | Personnel managing operations |
| `clinic_admins` | `engineers` | Project managers and documentation leads |
| `pid_reports` | `pid_reports` | Technical documentation (P&ID drawings) |
| `wellness_scores` | `tag_extractions` | ISA-5.1 compliant instrument tags |
| `algorithm_results` | `algorithm_results` | Analysis and validation results (kept same) |

---

## Field Mappings

### Project Areas (formerly Clinics)

| Original Field | New Field | Notes |
|---------------|-----------|-------|
| `clinic_code` | `project_code` | Facility identifier |
| `clinic_name` | `project_name` | Facility name |
| `address` | `facility_location` | Physical location |
| `contact_person` | `primary_contact_name` | Main contact |
| `subscription_type` | `subscription_tier` | Licensing level |
| - | `industry_type` | NEW: Oil & Gas, Chemical, etc. |
| - | `operational_status` | NEW: active, inactive, etc. |
| - | `applicable_standards` | NEW: ISA-5.1, API, ASME |
| - | `compliance_certifications` | NEW: ISO 9001, etc. |

### Supervisors (formerly Patients)

| Original Field | New Field | Notes |
|---------------|-----------|-------|
| `patient_uid` | `supervisor_uid` | Unique identifier |
| `patient_id` | `employee_id` | Company employee ID |
| `clinic_id` | `project_area_id` | Parent organization |
| `first_name` | `first_name` | Same |
| `last_name` | `last_name` | Same |
| `email` | `email` | Same |
| `phone` | `phone_primary` | Contact number |
| `date_of_birth` | `hire_date` | Changed context |
| - | `job_title` | NEW: Professional role |
| - | `department` | NEW: Work unit |
| - | `certifications` | NEW: Professional credentials |
| - | `safety_training_completed` | NEW: Compliance tracking |
| - | `shift_assignment` | NEW: Work schedule |

### Engineers (formerly Clinic Admins)

| Original Field | New Field | Notes |
|---------------|-----------|-------|
| `admin_uid` | `engineer_uid` | Unique identifier |
| `clinic_id` | `project_area_id` | Managed facility |
| `user_id` | `user_id` | Auth link (same) |
| `first_name` | `first_name` | Same |
| `last_name` | `last_name` | Same |
| `email` | `email` | Same |
| - | `job_title` | NEW: Professional title |
| - | `professional_registrations` | NEW: PE, CEng, etc. |
| - | `engineering_discipline` | NEW: Chemical, Mechanical, etc. |
| - | `certifications` | NEW: PMP, ISA CAP, etc. |
| - | `can_approve_reports` | NEW: Document authority |
| - | `digital_signature_certificate` | NEW: Electronic signatures |

### P&ID Reports (formerly P&ID Reports)

| Original Field | New Field | Notes |
|---------------|-----------|-------|
| `report_id` | `report_uid` | Unique identifier |
| `patient_id` | `supervisor_id` | Associated supervisor |
| `clinic_id` | `project_area_id` | Parent facility |
| `admin_id` | `engineer_id` | Managing engineer |
| `report_date` | `revision_date` | When created/revised |
| `status` | `report_status` | Workflow state |
| `file_url` | `primary_document_url` | Main file location |
| - | `drawing_number` | NEW: Industry-standard number |
| - | `revision_number` | NEW: Drawing revision |
| - | `document_type` | NEW: P&ID, PFD, etc. |
| - | `process_unit` | NEW: System/unit covered |
| - | `design_pressure` | NEW: Engineering specs |
| - | `applicable_standards` | NEW: ISA-5.1, API, etc. |
| - | `tags_extracted` | NEW: Tag extraction status |

### Tag Extractions (formerly Wellness Scores)

| Original Field | New Field | Notes |
|---------------|-----------|-------|
| `score_id` | `id` | Primary key (UUID) |
| `report_id` | `pid_report_id` | Parent document |
| `patient_id` | - | Removed (via report) |
| `clinic_id` | `project_area_id` | Parent facility |
| `category` | `instrument_function` | Type of measurement |
| `value` | `instrument_range` | Measurement range |
| - | `tag_number` | NEW: ISA-5.1 tag (FT-101) |
| - | `measured_variable` | NEW: Flow, Pressure, etc. |
| - | `equipment_id` | NEW: Associated equipment |
| - | `signal_type` | NEW: 4-20mA, HART, etc. |
| - | `safety_critical` | NEW: Critical instrument flag |
| - | `sil_level` | NEW: Safety Integrity Level |
| - | `verification_status` | NEW: Tag validation status |

---

## Conceptual Mappings

### Healthcare → Industrial

| Healthcare Concept | Industrial Concept | Example |
|-------------------|-------------------|---------|
| Clinic | Processing Facility | Oil refinery, Chemical plant |
| Patient | Supervisor | Operations supervisor, Process engineer |
| Clinic Admin | Lead Engineer | Project manager, Chief engineer |
| P&ID Report | P&ID Drawing | Piping & Instrumentation Diagram |
| Brain Wave Measurement | Instrument Tag | Flow transmitter (FT-101) |
| Wellness Score | Instrument Reading | Pressure, Temperature, Level |
| Algorithm Analysis | Compliance Check | ISA-5.1 validation |
| Medical Records | Engineering Documentation | Technical drawings, specs |

---

## UID Format Changes

### Supervisors
```
OLD: PAT-CLINIC001-0001 (Patient UID)
NEW: SUP-PRJ001-0001 (Supervisor UID)

Format: SUP-{PROJECT_CODE}-{SEQUENCE}
Example: SUP-PLANT-A-0042
```

### Engineers
```
OLD: ADM-CLINIC001-ADMIN (Admin UID)
NEW: ENG-PRJ001-LEAD (Engineer UID)

Format: ENG-{PROJECT_CODE}-LEAD
Example: ENG-PLANT-A-LEAD
```

### Reports
```
OLD: REP-CLINIC001-000123 (Report UID)
NEW: REP-PRJ001-000456 (Report UID)

Format: REP-{PROJECT_CODE}-{SEQUENCE}
Example: REP-PLANT-A-000123
```

### Drawing Numbers (NEW)
```
Standard industry format:
PID-{UNIT}-{SYSTEM}-{SHEET}

Examples:
- PID-100-A-001 (Process unit 100, System A, Sheet 1)
- PFD-200-B-003 (Process flow diagram)
- UFD-300-C-002 (Utility flow diagram)
```

---

## ISA-5.1 Tag Format (NEW)

```
{FUNCTION}-{LOOP}{SUFFIX}

Components:
- FUNCTION: 2-4 letters indicating measurement/function
- LOOP: Numeric identifier
- SUFFIX: Optional (A, B, 1, 2, etc.)

Examples:
FT-101     Flow Transmitter, loop 101
PCV-202A   Pressure Control Valve, loop 202, train A
TIC-304    Temperature Indicator Controller, loop 304
LAH-405    Level Alarm High, loop 405
PICA-501   Pressure Indicator Controller Alarm, loop 501
```

### Common Function Codes

| Code | Measured Variable | Example |
|------|------------------|---------|
| F | Flow | FT-101 (Flow Transmitter) |
| P | Pressure | PT-201 (Pressure Transmitter) |
| T | Temperature | TT-301 (Temperature Transmitter) |
| L | Level | LT-401 (Level Transmitter) |
| A | Analytical | AT-501 (Analyzer Transmitter) |
| S | Speed | ST-601 (Speed Transmitter) |
| W | Weight/Mass | WT-701 (Weight Transmitter) |
| V | Viscosity | VT-801 (Viscosity Transmitter) |

### Common Readout/Modifier Codes

| Code | Function | Example |
|------|----------|---------|
| I | Indicator | FI-101 (Flow Indicator) |
| C | Controller | FC-101 (Flow Controller) |
| T | Transmitter | FT-101 (Flow Transmitter) |
| R | Recorder | FR-101 (Flow Recorder) |
| A | Alarm | FA-101 (Flow Alarm) |
| S | Switch | FS-101 (Flow Switch) |
| V | Valve | FV-101 (Flow Control Valve) |
| IC | Indicator Controller | FIC-101 |
| ICA | Indicator Controller Alarm | FICA-101 |

---

## Status/Classification Mappings

### Operational Status

| Healthcare | Industrial | Values |
|-----------|-----------|---------|
| Active/Inactive | Operational Status | active, inactive, under_construction, decommissioned |
| Patient Status | Employment Status | active, on_leave, suspended, terminated |
| Report Status | Report Status | draft, submitted, under_review, approved, rejected |

### Access Levels

| Healthcare | Industrial | Values |
|-----------|-----------|---------|
| User Type | User Role | admin, engineer, senior_engineer, supervisor, viewer, auditor |
| Permission Level | Access Level | standard, elevated, restricted |

---

## Industry Standards (NEW)

### Applicable Standards

Common standards in industrial settings:

1. **Instrumentation**
   - ISA-5.1: Instrumentation Symbols and Identification
   - ISA-5.3: Graphic Symbols for Distributed Control
   - ISA-84/IEC 61511: Safety Instrumented Systems

2. **Process Design**
   - API 14C: Analysis, Design, Installation, and Testing
   - ASME B31.3: Process Piping
   - API 570: Piping Inspection Code

3. **Safety**
   - ATEX: Equipment for Explosive Atmospheres (EU)
   - IECEx: International Explosive Atmospheres
   - NFPA 70: National Electrical Code

4. **Quality**
   - ISO 9001: Quality Management Systems
   - ISO 14001: Environmental Management
   - OHSAS 18001: Occupational Health & Safety

---

## Data Type Changes

### ENUM Types (NEW)

```sql
-- Document Types
CREATE TYPE pid_document_type AS ENUM (
    'process_flow_diagram',
    'piping_instrumentation_diagram',
    'utility_flow_diagram',
    'control_logic_diagram',
    'electrical_single_line',
    'instrument_loop_diagram'
);

-- Instrument Functions
CREATE TYPE instrument_function AS ENUM (
    'flow', 'temperature', 'pressure', 'level',
    'analytical', 'control_valve', 'on_off_valve',
    'pump', 'compressor', 'motor', 'switch',
    'transmitter', 'indicator', 'controller', 'alarm'
);

-- User Roles
CREATE TYPE user_role AS ENUM (
    'admin', 'engineer', 'senior_engineer',
    'supervisor', 'viewer', 'external_auditor'
);
```

---

## API Endpoint Mappings (Application Updates)

When updating your application code:

| Old Endpoint | New Endpoint | Notes |
|-------------|--------------|-------|
| `/api/clinics` | `/api/project-areas` | List facilities |
| `/api/patients` | `/api/supervisors` | List supervisors |
| `/api/clinic-admins` | `/api/engineers` | List engineers |
| `/api/pid-reports` | `/api/pid-reports` | List P&ID reports |
| `/api/wellness-scores` | `/api/tag-extractions` | List instrument tags |

---

## UI/UX Label Changes

### Navigation & Headings

| Old Label | New Label |
|-----------|-----------|
| "Clinics" | "Project Areas" |
| "Patients" | "Supervisors" |
| "Clinic Admins" | "Engineers" |
| "P&ID Reports" | "P&ID Reports" |
| "Wellness Scores" | "Tag Extractions" |
| "Add Patient" | "Add Supervisor" |
| "Patient Dashboard" | "Supervisor Dashboard" |
| "Clinic Management" | "Project Management" |

### Form Fields

| Old Field Label | New Field Label |
|----------------|-----------------|
| "Clinic Code" | "Project Code" |
| "Patient ID" | "Supervisor ID / Employee ID" |
| "Date of Birth" | "Hire Date" |
| "Medical History" | "Safety Training" |
| "Report Type" | "Document Type" |
| "Brain Activity" | "Instrument Reading" |

---

## Search Terms & Keywords

Update documentation, help text, and search functionality:

| Old Keywords | New Keywords |
|-------------|--------------|
| clinic, medical, patient | facility, plant, supervisor |
| brain, eeg, wellness | instrument, tag, control |
| doctor, physician | engineer, technician |
| diagnosis, treatment | analysis, validation |
| health, medical | industrial, process |

---

## File & Folder Naming

### Code Files

```
OLD: PatientDashboard.jsx
NEW: SupervisorDashboard.jsx

OLD: ClinicManagement.jsx
NEW: ProjectAreaManagement.jsx

OLD: QEEGReportForm.jsx
NEW: PIDReportForm.jsx

OLD: clinicService.js
NEW: projectAreaService.js

OLD: patientService.js
NEW: supervisorService.js
```

### Database Migration Files

All new migrations should follow the pattern:
```
{sequence}_descriptive_action.sql

Examples:
001_create_project_areas_table.sql
002_create_supervisors_table.sql
005_create_tag_extractions_table.sql
```

---

## Environment Variables

Update your `.env` files:

```bash
# OLD
CLINIC_CODE_PREFIX=CLN
PATIENT_UID_FORMAT=PAT
DEFAULT_CLINIC_ROLE=clinic_admin

# NEW
PROJECT_CODE_PREFIX=PRJ
SUPERVISOR_UID_FORMAT=SUP
DEFAULT_PROJECT_ROLE=engineer
INDUSTRY_TYPE=oil_and_gas
STANDARDS_COMPLIANCE=ISA-5.1,API-14C
```

---

## Common Queries Translation

### Finding Records

```sql
-- OLD: Find patients in a clinic
SELECT * FROM patients WHERE clinic_id = ?;

-- NEW: Find supervisors in a project area
SELECT * FROM supervisors WHERE project_area_id = ?;
```

```sql
-- OLD: Get clinic admin
SELECT * FROM clinic_admins WHERE clinic_id = ?;

-- NEW: Get project engineer
SELECT * FROM engineers WHERE project_area_id = ?;
```

```sql
-- OLD: List patient reports
SELECT * FROM pid_reports WHERE patient_id = ?;

-- NEW: List supervisor reports
SELECT * FROM pid_reports WHERE supervisor_id = ?;
```

---

## Quick Reference Card

**Print this section for developers:**

```
TERMINOLOGY QUICK REFERENCE
===========================

Tables:
  clinics          → project_areas
  patients         → supervisors
  clinic_admins    → engineers
  pid_reports     → pid_reports
  wellness_scores  → tag_extractions

Key Fields:
  clinic_code      → project_code
  patient_uid      → supervisor_uid
  admin_uid        → engineer_uid
  report_id        → report_uid

UID Formats:
  SUP-{PROJECT}-{SEQ}  (Supervisors)
  ENG-{PROJECT}-LEAD   (Engineers)
  REP-{PROJECT}-{SEQ}  (Reports)

Tags (NEW):
  Format: {FUNCTION}-{LOOP}{SUFFIX}
  Example: FT-101, PCV-202A, TIC-304

Standards (NEW):
  ISA-5.1, API 14C, ASME B31.3, IEC 61511
```

---

**Version:** 1.0.0
**Last Updated:** 2025-11-27
**Compatibility:** AIMS v2.0+

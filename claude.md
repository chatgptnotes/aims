# AIMS - Asset Information Management System
## Autonomous Development Mission Brief

### PROJECT GOAL
Transform AIMS EEG platform into AIMS, a complete offline-capable P&ID tag extraction system that reads engineering drawings, extracts equipment/instrument tags per ISA 5.1, allows SME verification, and exports Tag Creation Excel sheets for ADNOC integration.

### TECH STACK & TARGETS
- Frontend: React 18.2 + Vite 4.5 + TailwindCSS 3.3
- Backend: Node.js (optional for advanced processing)
- Database: Supabase PostgreSQL (zixlvrqvgqfgnvytdeic.supabase.co)
- Storage: Supabase Storage (pid-documents bucket)
- Processing: pdf-parse, xlsx, Material-UI Icons
- Deployment: Vercel (frontend), local development on port 5173

### REPO/ENV
- Repo: /Users/murali/1backup/AIMS 27 nov
- Package Manager: npm
- OS: macOS (Darwin 24.6.0)
- Node: Latest LTS

### ROLE MAPPINGS (Database → UI)
- Database: `patient` → UI: Supervisor (person uploading P&IDs)
- Database: `clinic_admin` → UI: Engineer (manages supervisors, projects)
- Database: `super_admin` → UI: SME (Subject Matter Expert, approves tags)
- New: `superadmin2` → Developer team access

### COMPLETED TRANSFORMATIONS
✅ Directory restructuring (patient→supervisor, clinic→engineer)
✅ Component renaming (PatientDashboard→SupervisorDashboard, etc.)
✅ Import updates (DashboardRouter, App.jsx, all components)
✅ Package.json rebranding (@aims/web v1.0.0)
✅ Dependencies installed (pdf-parse, xlsx, @mui/icons-material)
✅ File validation changed (.edf→.pdf, 50MB→100MB limit)
✅ Sidebar navigation labels updated
✅ Index.html title updated
✅ Supabase credentials updated
✅ Storage bucket renamed (patient-reports→pid-documents)

### PENDING DELIVERABLES
1. ✅ Test app startup (resolve permission issues)
2. ⏳ Create VersionFooter component (auto-increment on git push)
3. ⏳ Update AuthContext with AIMS comments
4. ⏳ Update README.md comprehensive documentation
5. ⏳ Create ProjectManagement component (CRUD)
6. ⏳ Create ProcessManagement component (CRUD)
7. ⏳ Create PDF parsing service (basic/mocked initially)
8. ⏳ Create Excel export service (Tag Creation format)
9. ⏳ Replace Lucide icons with Material-UI icons (15 files)
10. ⏳ Add Project/Process fields to Supabase tables
11. ⏳ Test all user flows (SME, Engineer, Supervisor)
12. ⏳ Create Git hooks for version auto-increment
13. ⏳ Production deployment setup

### AUTONOMOUS OPERATING RULES
- Make sensible assumptions, never ask for confirmation
- Work in verifiable increments (build/test after each change)
- If blocked, choose best alternative and document deviation
- Production-grade code by default (error handling, validation)
- No emojis, use Material-UI icons only
- No M-dashes (—), use commas or periods
- Version footer on all pages (auto-increment with git push)

### QUALITY BARS
- Zero ESLint errors, no failing imports
- No secrets in code (use .env)
- Graceful error handling with user-visible messages
- All database table names unchanged (patients, clinics, reports)
- UI displays new AIMS terminology consistently

### VERSION TRACKING
- Current Version: 1.0.0
- Auto-increment on git commit: 1.0 → 1.1 → 1.2, etc.
- Footer displays: "AIMS v1.0 | Updated: 2024-11-27 | GitHub: bettroi/aims"
- Gray fine print at bottom of all dashboard pages

### NEXT ACTION PLAN
1. Fix server startup (permission issues on macOS backup folder)
2. Create VersionFooter component with git hook integration
3. Update all dashboard layouts to include VersionFooter
4. Create ProjectManagement and ProcessManagement components
5. Create basic PDF parsing service (mock initially)
6. Create Excel export service (ADNOC Tag Creation format)
7. Update README.md with AIMS documentation
8. Test complete user flows
9. Deploy to local development server
10. Provide testing URL and credentials

### BLOCKED ITEMS & SOLUTIONS
- Server permission issue: Copy project to non-backup location OR run with explicit node path
- Material icon replacement: Incremental replacement, prioritize high-traffic components
- PDF parsing: Use mocked data initially, implement real parsing in Phase 2
- Excel export: Create template-based generator with sample data

### FINAL HANDOFF REQUIREMENTS
- Local dev running on http://localhost:5173
- All three roles testable (SME, Engineer, Supervisor)
- README with quickstart, env vars, and deploy steps
- .env.example with all required variables
- Version footer visible on all pages
- Git hooks configured for auto-versioning
- CHANGELOG.md documenting all transformations

---
**Status**: Phase 1 Complete (Core Rebranding) | Phase 2 In Progress (Feature Development)
**Last Updated**: 2024-11-27
**Developer**: Claude Code Autonomous Agent

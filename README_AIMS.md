# AIMS - Asset Information Management System

## P&ID Tag Extraction Platform for Oil & Gas Industry

AIMS is a comprehensive offline-capable system for extracting equipment and instrument tags from P&ID (Piping and Instrumentation Diagram) drawings according to ISA 5.1 standards. Built specifically for ADNOC integration, AIMS automates the creation of Tag Creation sheets, saving hundreds of hours of manual work.

## Quick Start

### 1. Start the Development Server

```bash
# Method 1: Direct execution (recommended for macOS backup folders)
npm run dev:direct

# Method 2: Standard dev server
npm run dev

# Method 3: Use startup script
./start-dev.sh
```

### 2. Access the Application

Open your browser and navigate to: **http://localhost:3000/**

### 3. Default Login (Bypass Mode Enabled)

The application is configured for easy testing with automatic authentication:
- You'll be automatically logged in as **SME Admin**
- No credentials needed in bypass mode

To disable bypass mode and use real authentication:
1. Edit `.env` file
2. Set `VITE_BYPASS_AUTH=false`
3. Restart the server

## Features

### Core Functionality
- **P&ID Upload**: Accept PDF documents up to 100MB
- **Tag Extraction**: Automatic extraction of equipment/instrument tags (K-2801, V-3701, etc.)
- **ISA 5.1 Compliance**: Parse tags according to international standards
- **Project Management**: Organize P&IDs by projects and processes
- **Excel Export**: Generate ADNOC-compliant Tag Creation sheets
- **Version Control**: Automatic versioning with git commits
- **Offline Capability**: Works completely offline once installed

### User Roles

| Role | Database Value | UI Display | Description |
|------|---------------|------------|-------------|
| SME | super_admin | Subject Matter Expert | Reviews and approves extracted tags |
| Engineer | clinic_admin | Engineer | Manages projects, processes, and supervisors |
| Supervisor | patient | Supervisor | Uploads P&ID documents |
| Developer | superadmin2 | Developer | System administration |

## Project Structure

```
AIMS/
├── src/
│   ├── components/
│   │   ├── admin/          # SME components
│   │   ├── engineer/       # Engineer components (projects, processes)
│   │   ├── supervisor/     # Supervisor components (document upload)
│   │   ├── common/         # Shared components (VersionFooter)
│   │   └── layout/         # Layout components (Sidebar, DashboardLayout)
│   ├── services/
│   │   ├── pdfParsingService.js    # PDF tag extraction
│   │   └── excelExportService.js   # Excel generation
│   ├── contexts/
│   │   └── AuthContext.jsx         # Authentication management
│   └── pages/              # Page components
├── .env                    # Environment configuration
├── .githooks/             # Git hooks for auto-versioning
└── package.json           # Dependencies and scripts
```

## Environment Variables

Create a `.env` file with the following:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://zixlvrqvgqfgnvytdeic.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key

# Storage Configuration
VITE_SUPABASE_STORAGE_BUCKET=pid-documents

# Development Settings
VITE_APP_ENV=development
VITE_DEBUG=true
VITE_BYPASS_AUTH=true

# Version Information
VITE_APP_VERSION=1.0.0
VITE_BUILD_DATE=2024-11-27
VITE_GIT_REPO=bettroi/aims
```

## Development Commands

```bash
# Install dependencies
npm install

# Start development server (various methods)
npm run dev           # Standard Vite
npm run dev:direct    # Direct node execution (for permission issues)
npm run dev:npx       # Using npx

# Build for production
npm run build

# Preview production build
npm run preview

# Run linting
npm run lint

# Fix linting issues
npm run lint:fix
```

## Key Components

### ProjectManagement
- Create/Edit/Delete projects
- Set default Site and Unit codes
- Organize P&IDs by client projects

### ProcessManagement
- Create processes under projects
- Override Site/Unit codes per process
- Track expected vs actual P&ID counts

### PIDUpload
- Upload PDF files (max 100MB)
- Queue multiple documents
- Track upload progress

### VersionFooter
- Display current version
- Show last update date
- Link to GitHub repository
- Auto-increment on git commits

## Git Auto-Versioning

The project includes automatic version incrementing on each git commit:

1. Pre-commit hook increments patch version
2. Updates package.json version
3. Updates .env with new version and date
4. Displays in VersionFooter component

To enable:
```bash
git config core.hooksPath .githooks
```

## Database Schema

The application uses existing Supabase tables with semantic remapping:

| Original Table | AIMS Usage |
|---------------|------------|
| patients | Stores Supervisors |
| clinics | Stores Engineers |
| reports | Stores P&ID Documents |
| super_admins | Stores SMEs |

Additional fields added:
- `patients`: project_name, process_name
- `reports`: project_id, process_id, document_type

## API Integration

### PDF Parsing Service (Coming Soon)
```javascript
// Extract tags from P&ID
const tags = await pdfParsingService.extractTags(pdfFile);
// Returns: Array of tag objects with ISA 5.1 parsing
```

### Excel Export Service (Coming Soon)
```javascript
// Generate Tag Creation sheet
const excelFile = await excelExportService.generateTagSheet(tags, project);
// Returns: XLSX file buffer
```

## Testing

### Test Different User Roles
```javascript
// In browser console:
localStorage.setItem('user', JSON.stringify({
  id: 'test-engineer',
  name: 'Test Engineer',
  role: 'clinic_admin',
  email: 'engineer@aims.com'
}));
location.reload();
```

### Clear Session
```javascript
localStorage.clear();
location.reload();
```

## Troubleshooting

### Permission Denied Error (macOS)
If you get "Operation not permitted" errors:
1. Use `npm run dev:direct` instead of `npm run dev`
2. Or copy project to a non-backup location
3. Or use the `./start-dev.sh` script

### Server Not Starting
1. Check if port 3000 is already in use
2. Kill existing processes: `lsof -ti:3000 | xargs kill -9`
3. Restart with: `npm run dev:direct`

### Authentication Issues
1. Ensure `VITE_BYPASS_AUTH=true` in `.env`
2. Clear browser cache and localStorage
3. Restart the server

## Deployment

### Vercel Deployment
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
```

### Docker Deployment
```bash
# Build image
docker build -t aims:latest .

# Run container
docker run -p 3000:3000 aims:latest
```

## Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/new-feature`
3. Commit changes (auto-version will increment)
4. Push to branch: `git push origin feature/new-feature`
5. Submit Pull Request

## Version History

- **v1.0.0** (2024-11-27): Initial AIMS transformation from AIMS
  - Core rebranding complete
  - Project/Process management added
  - P&ID upload functionality
  - Version footer with auto-increment
  - Material-UI icons integration started

## License

Proprietary - BETTROI

## Support

For support, please contact:
- Technical: dev@bettroi.com
- Business: support@aims.com

---

**AIMS v1.0.0** | Asset Information Management System | Built with React + Vite + TailwindCSS
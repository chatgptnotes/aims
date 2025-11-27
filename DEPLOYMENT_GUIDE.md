# AIMS Deployment Guide

## Overview
AIMS requires two separate deployments:
1. **Frontend** (React/Vite) - Deployed on Vercel
2. **Backend** (Node.js/Express) - Deployed on Render/Railway/Heroku

## Architecture
```
┌─────────────────┐         ┌─────────────────┐
│   Vercel        │         │   Render        │
│  (Frontend)     │────────▶│  (Backend API)  │
│  aims1.vercel   │         │  Port 3001      │
│  .app           │         │                 │
└─────────────────┘         └─────────────────┘
         │                           │
         │                           │
         ▼                           ▼
┌─────────────────┐         ┌─────────────────┐
│   Supabase      │         │   OpenAI API    │
│  (Database +    │         │  (GPT-4 for     │
│   Storage)      │         │   P&ID Tags)    │
└─────────────────┘         └─────────────────┘
```

## 1. Frontend Deployment (Vercel)

### Already Completed
✅ Repository linked to Vercel
✅ Environment variables configured
✅ Production URL: https://aims1.vercel.app/

### Environment Variables on Vercel
```bash
VITE_SUPABASE_URL=https://zixlvrqvgqfgnvytdeic.supabase.co
VITE_SUPABASE_ANON_KEY=...
VITE_SUPABASE_STORAGE_BUCKET=pid-documents
VITE_SUPABASE_SERVICE_ROLE_KEY=...
VITE_API_URL=https://YOUR-BACKEND-URL.onrender.com/api
```

### Update Required
After deploying the backend, update VITE_API_URL on Vercel to point to your deployed backend URL.

## 2. Backend Deployment (Render)

### Step 1: Create Render Account
1. Go to https://render.com/
2. Sign up with your GitHub account
3. Grant access to your repository

### Step 2: Create New Web Service
1. Click "New +" button in Render dashboard
2. Select "Web Service"
3. Connect your GitHub repository
4. Configure root directory to point to server folder

### Step 3: Configure Service
- Name: aims-backend
- Environment: Node
- Region: Oregon (or closest to you)
- Branch: main
- Root Directory: server
- Build Command: npm install
- Start Command: npm start
- Plan: Free (or Starter for production)

### Step 4: Add Environment Variables
Add these in Render dashboard:
- NODE_ENV=production
- PORT=3001
- OPENAI_API_KEY=your-key
- SUPABASE_URL=https://zixlvrqvgqfgnvytdeic.supabase.co
- SUPABASE_SERVICE_ROLE_KEY=your-key
- FRONTEND_URL=https://aims1.vercel.app,http://localhost:3000

### Step 5: Deploy
1. Click "Create Web Service"
2. Wait for deployment (5-10 minutes)
3. Note your backend URL

### Step 6: Update Frontend
1. Update VITE_API_URL on Vercel to your Render backend URL
2. Trigger Vercel redeployment

## 3. Testing

### Test Backend Health
```bash
curl https://YOUR-BACKEND-URL.onrender.com/api/health
```

### Test Frontend
1. Go to https://aims1.vercel.app/
2. Login with test credentials
3. Upload a P&ID and verify extraction works

## 4. Troubleshooting

### Network Error when uploading P&ID
- Backend not deployed or VITE_API_URL incorrect
- Check backend logs on Render

### Authentication Failed
- Verify Supabase environment variables on Vercel
- Check Supabase project is active

### CORS Error
- Verify FRONTEND_URL on backend includes https://aims1.vercel.app

---

**Current Status**
- Frontend: ✅ Deployed on Vercel
- Backend: ⏳ Pending deployment on Render
- Database: ✅ Supabase configured

**Next Steps**
1. Deploy backend to Render
2. Update VITE_API_URL on Vercel
3. Test complete P&ID workflow

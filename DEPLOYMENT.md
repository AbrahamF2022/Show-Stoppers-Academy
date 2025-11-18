# Deployment Guide

This guide covers deploying the Show Stoppers Academy website and tutoring hours platform to production.

## Architecture Overview

The application consists of:
- **Frontend**: Static HTML/CSS/JS files served via a static host (Vercel, Netlify, GitHub Pages, etc.)
- **Backend API**: Node.js/Express server (can be deployed to Render, Railway, Fly.io, etc.)
- **Database**: Supabase (hosted PostgreSQL)

## Prerequisites

1. **Supabase Project**: Create a project at [supabase.com](https://supabase.com)
2. **Domain** (optional): For production, consider setting up a custom domain
3. **Hosting Accounts**: 
   - Frontend: Vercel/Netlify/GitHub Pages
   - Backend: Render/Railway/Fly.io (or your preferred Node.js host)

## Step 1: Database Setup

1. **Create Supabase Project**
   - Go to [supabase.com](https://supabase.com) and create a new project
   - Note your project URL and service role key (found in Settings > API)

2. **Run Database Migration**
   - In Supabase dashboard, go to SQL Editor
   - Copy the contents of `server/migrations/001_create_tables.sql`
   - Paste and run the SQL to create all tables

3. **Create First Admin User**
   - See `server/README.md` for detailed instructions
   - Use Method 1 (Supabase Dashboard) or Method 2 (script) to create your admin account

## Step 2: Backend Deployment

### Option A: Render.com (Recommended for simplicity)

1. **Create Render Service**
   - Sign up at [render.com](https://render.com)
   - Click "New +" > "Web Service"
   - Connect your GitHub repository

2. **Configure Service**
   - **Name**: `ssa-tutoring-api`
   - **Root Directory**: `server`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Environment**: `Node`

3. **Set Environment Variables** (in Render dashboard):
   ```
   SUPABASE_URL=your-supabase-project-url
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   JWT_SECRET=generate-a-random-secret-here-use-openssl-rand-hex-32
   PORT=10000
   CORS_ORIGIN=https://your-frontend-domain.com
   ```

4. **Deploy**
   - Click "Create Web Service"
   - Render will build and deploy your API
   - Note the service URL (e.g., `https://ssa-tutoring-api.onrender.com`)

### Option B: Railway

1. Sign up at [railway.app](https://railway.app)
2. Create a new project and connect your GitHub repo
3. Add a new service from the `server/` directory
4. Set the same environment variables as above
5. Railway will auto-detect Node.js and deploy

### Option C: Fly.io

```bash
# Install flyctl
curl -L https://fly.io/install.sh | sh

# Login
fly auth login

# Create app
cd server
fly launch

# Set secrets
fly secrets set SUPABASE_URL=your-url
fly secrets set SUPABASE_SERVICE_ROLE_KEY=your-key
fly secrets set JWT_SECRET=your-secret
fly secrets set CORS_ORIGIN=https://your-frontend-domain.com

# Deploy
fly deploy
```

## Step 3: Frontend Deployment

### Option A: Vercel (Recommended)

1. **Connect Repository**
   - Sign up at [vercel.com](https://vercel.com)
   - Import your GitHub repository

2. **Configure Build**
   - **Framework Preset**: Other
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

3. **Set Environment Variables**
   - Add `VITE_API_BASE` or configure `js/api-client.js` to use your production API URL
   - In `tutoring-login.html` and `tutoring-dashboard.html`, you can set:
     ```javascript
     window.__SSA_API_BASE__ = 'https://your-api-url.com/api';
     ```

4. **Deploy**
   - Click "Deploy"
   - Vercel will build and deploy your site
   - Note your deployment URL

### Option B: Netlify

1. Sign up at [netlify.com](https://netlify.com)
2. Connect your GitHub repository
3. Set build command: `npm run build`
4. Set publish directory: `dist`
5. Add environment variable: `VITE_API_BASE=https://your-api-url.com/api`
6. Deploy

### Option C: GitHub Pages

1. Enable GitHub Pages in repository settings
2. Set source to `gh-pages` branch
3. Update `vite.config.ts` with correct base path
4. Push to `gh-pages` branch

## Step 4: Update Frontend API URL

After deploying the backend, update the frontend to point to your production API:

1. **Option 1: Environment Variable** (if using Vite)
   - Add `VITE_API_BASE=https://your-api-url.com/api` to your build environment
   - Update `js/api-client.js` to use `import.meta.env.VITE_API_BASE`

2. **Option 2: Build-time Configuration**
   - Update `tutoring-login.html` and `tutoring-dashboard.html`:
     ```javascript
     window.__SSA_API_BASE__ = 'https://your-api-url.com/api';
     ```

3. **Option 3: Runtime Configuration**
   - Add a configuration page or set via localStorage in production

## Step 5: Domain Configuration (Optional)

1. **Backend Custom Domain**
   - In Render/Railway/Fly.io, add your custom domain (e.g., `api.showstoppersacademy.org`)
   - Follow platform-specific DNS instructions

2. **Frontend Custom Domain**
   - In Vercel/Netlify, add your custom domain (e.g., `showstoppersacademy.org`)
   - Update CORS_ORIGIN in backend environment variables

3. **Update CORS**
   - Update backend `CORS_ORIGIN` environment variable to include your frontend domain

## Step 6: Security Checklist

- [ ] JWT_SECRET is a strong random string (use `openssl rand -hex 32`)
- [ ] SUPABASE_SERVICE_ROLE_KEY is kept secret (never commit to git)
- [ ] CORS_ORIGIN is set to your production frontend URL only
- [ ] HTTPS is enabled for both frontend and backend
- [ ] Environment variables are set in hosting platform (not in code)
- [ ] Database connection uses SSL (Supabase defaults to this)

## Step 7: Monitoring & Maintenance

### Health Checks

- Backend health endpoint: `GET https://your-api-url.com/api/health`
- Set up monitoring (UptimeRobot, Pingdom, etc.) to check this endpoint

### Logs

- **Backend**: Check logs in your hosting platform dashboard
- **Supabase**: Check logs in Supabase dashboard > Logs

### Backup

- Supabase automatically backs up your database
- Configure additional backups if needed in Supabase settings

## Troubleshooting

### API Not Responding

1. Check backend logs in hosting platform
2. Verify environment variables are set correctly
3. Test health endpoint: `curl https://your-api-url.com/api/health`
4. Check CORS configuration if frontend can't reach API

### Frontend Can't Connect to API

1. Verify `window.__SSA_API_BASE__` or `VITE_API_BASE` is set correctly
2. Check browser console for CORS errors
3. Verify backend CORS_ORIGIN includes your frontend URL
4. Check that backend is accessible (not blocked by firewall)

### Database Connection Issues

1. Verify SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are correct
2. Check Supabase project is active (not paused)
3. Verify database migration ran successfully
4. Check Supabase logs for connection errors

## Support

For issues or questions:
1. Check `server/README.md` for API documentation
2. Review Supabase documentation for database issues
3. Check hosting platform documentation for deployment issues


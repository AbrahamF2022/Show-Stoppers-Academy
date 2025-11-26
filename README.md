# Show Stoppers Academy

Modern website for Show Stoppers Academy - Empowering youth through sports and education.

## Features

- **Public Website**: Showcase programs, leadership, and mission
- **Tutoring Hours Platform**: Login portal for tutors, students, and administrators to track tutoring sessions
- **Program Management**: Event registration and program information
- **Gallery**: Photo galleries and program highlights

## Quick Start

### Development

1. **Install Dependencies**
   ```bash
   npm run install:all
   ```

2. **Start Both Frontend and Backend**
   ```bash
   npm run dev:all
   ```
   
   This will start:
   - Frontend at `http://localhost:5173` (Vite dev server)
   - Backend API at `http://localhost:4000` (Express server)

3. **Or Run Separately**
   ```bash
   # Frontend only
   npm run dev
   
   # Backend only
   npm run server:dev
   ```

### Backend Setup

1. **Create Supabase Project**
   - Sign up at [supabase.com](https://supabase.com)
   - Create a new project
   - Note your project URL and service role key

2. **Configure Environment**
   ```bash
   cd server
   cp .env.example .env
   # Edit .env with your Supabase credentials
   ```

3. **Run Database Migration**
   - In Supabase dashboard, go to SQL Editor
   - Copy and run `server/migrations/001_create_tables.sql`

4. **Create First Admin User**
   - See `server/README.md` for detailed instructions

5. **Start Backend**
   ```bash
   cd server
   npm run dev
   ```

### Frontend Setup

1. **Install Dependencies**
```bash
npm install
```

2. **Configure API URL** (if needed)
   - Default is `http://localhost:4000/api`
   - Update `js/api-client.js` or set `window.__SSA_API_BASE__` in HTML files

3. **Start Development Server**
```bash
npm run dev
```

## Project Structure

```
├── server/                 # Backend API (Express + TypeScript)
│   ├── src/
│   │   ├── controllers/   # Request handlers
│   │   ├── middleware/    # Auth & error handling
│   │   ├── routes/        # API routes
│   │   ├── utils/         # Helper functions
│   │   └── config.ts      # Configuration
│   ├── migrations/        # Database migrations
│   └── README.md          # Backend documentation
├── js/                    # Frontend JavaScript utilities
│   └── api-client.js      # API client for tutoring portal
├── css/                   # Stylesheets
├── *.html                 # Website pages
└── tutoring-*.html        # Tutoring portal pages
```

## Available Scripts

### Root Level
- `npm run dev` - Start frontend dev server
- `npm run build` - Build frontend for production
- `npm run server:dev` - Start backend dev server
- `npm run server:build` - Build backend for production
- `npm run server:start` - Start production backend
- `npm run dev:all` - Start both frontend and backend together
- `npm run install:all` - Install dependencies for both projects

### Backend (from `server/` directory)
- `npm run dev` - Start API in watch mode
- `npm run build` - Compile TypeScript
- `npm start` - Run production build

## Tutoring Hours Platform

The tutoring hours platform allows:
- **Tutors** and **Students** to submit tutoring session logs
- **Administrators** to review and approve/reject submissions
- **All users** to view their own submission history
- **Audit logging** for all status changes

### Access Points
- Login: `/tutoring-login.html`
- Dashboard: `/tutoring-dashboard.html` (requires login)

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions for both frontend and backend.

## Documentation

- **Backend API**: See `server/README.md`
- **Deployment Guide**: See `DEPLOYMENT.md`
- **Database Schema**: See `server/migrations/001_create_tables.sql`

## License

MIT

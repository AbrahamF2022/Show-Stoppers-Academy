# Tutoring Hours API

This folder contains the Express + TypeScript backend for the tutoring hours reporting platform.

## Prerequisites

- Node.js 18+
- Supabase project (used for Postgres + authentication)

## Environment Variables

Create a `.env` file inside `server/` with the following values:

```
SUPABASE_URL=your-supabase-url
SUPABASE_SERVICE_ROLE_KEY=service-role-key
JWT_SECRET=update-me
PORT=4000
CORS_ORIGIN=http://localhost:5173
```

> ⚠️ Use the **service role** key only on a trusted server. Do not expose it to the browser.

## Database Schema

Execute `migrations/001_create_tables.sql` inside Supabase to create the required tables:

### `users`
- `id` (uuid, primary key)
- `email` (text, unique)
- `password_hash` (text)
- `full_name` (text)
- `role` (`admin`, `tutor`, `student`)
- `created_at` / `updated_at`

Use this table to seed one admin account manually (or via Supabase dashboard) before exposing the API.

### `tutoring_sessions`
- `id` (uuid, primary key)
- `tutor_id` (uuid reference to `users`)
- `student_id` (uuid reference to `users`)
- `tutor_name` / `student_name` (text copies for reporting)
- `subject` (text)
- `start_time` / `end_time` (timestamptz)
- `notes` (text, optional)
- `approval_status` (`pending`, `approved`, `rejected`)
- `approved_by` (uuid reference to `users`)
- `created_at` / `updated_at`

### `tutoring_session_audit`
- `id` (uuid, primary key)
- `session_id` (uuid reference to `tutoring_sessions`)
- `changed_by` (uuid reference to `users`)
- `old_status` / `new_status`
- `created_at`

Each status change creates an audit entry automatically.

## Scripts

- `npm run dev` – start the API in watch mode
- `npm run build` – compile TypeScript to `dist/`
- `npm start` – run compiled JavaScript

## Initial Setup: Creating the First Admin User

Before using the API, you need to create the first admin account. There are two methods:

### Method 1: Using Supabase Dashboard (Recommended)

1. Open your Supabase project dashboard.
2. Go to Table Editor and select the `users` table.
3. Click "Insert row" and fill in:
   - `email`: Your admin email (e.g., `admin@showstoppersacademy.org`)
   - `password_hash`: Generate a hash using Node.js:
     ```bash
     node -e "console.log(require('bcryptjs').hashSync('YourSecurePassword123!', 10))"
     ```
   - `full_name`: Your full name (e.g., `Administrator`)
   - `role`: `admin`
4. Save the row. The `id`, `created_at`, and `updated_at` will be auto-generated.

### Method 2: Using a Script

Create a file `server/scripts/create-admin.js`:

```javascript
import bcrypt from 'bcryptjs';
import { supabase } from '../src/utils/supabaseClient.js';

const email = process.argv[2];
const password = process.argv[3];
const fullName = process.argv[4] || 'Administrator';

if (!email || !password) {
  console.error('Usage: node create-admin.js <email> <password> [fullName]');
  process.exit(1);
}

const passwordHash = await bcrypt.hash(password, 10);

const { data, error } = await supabase
  .from('users')
  .insert({
    email: email.toLowerCase(),
    password_hash: passwordHash,
    full_name: fullName,
    role: 'admin',
  })
  .select()
  .single();

if (error) {
  console.error('Error creating admin:', error.message);
  process.exit(1);
}

console.log('Admin user created successfully!');
console.log('ID:', data.id);
console.log('Email:', data.email);
```

Run it with: `node server/scripts/create-admin.js admin@example.com YourPassword123 "Admin Name"`

## Manual Testing Checklist

1. **Seed Admin User** (see above)
2. **Run the API**
   - `npm run dev` from the `server/` directory.
3. **Login**
   - POST `http://localhost:4000/api/auth/login` with the admin email/password to receive a JWT.
4. **Register Tutors/Students**
   - Use the admin JWT to POST to `/api/auth/register` with `role` set to `tutor` or `student`.
5. **Submit Hours**
   - Login as a tutor or student and POST to `/api/sessions` with `subject`, `startTime`, `endTime`, and the counterpart's name.
6. **Review Hours**
   - GET `/api/sessions` as:
     - tutor → returns their submissions;
     - student → returns their submissions;
     - admin → returns all submissions.
7. **Approve/Reject**
   - PATCH `/api/sessions/:id/status` as admin with `{ \"status\": \"approved\" }` (or `rejected`).
   - Confirm audit entries via `GET /api/sessions/:id/audits`.

Use tools like [Hoppscotch](https://hoppscotch.io/) or [Postman](https://www.postman.com/) to exercise the API quickly during development.

## Next Steps

See the project plan for upcoming tasks (auth routes, hours endpoints, frontend integration, deployment notes).

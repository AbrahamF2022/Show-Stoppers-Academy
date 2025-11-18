-- Users table stores tutors, students, and admins
-- Ensure the updated_at trigger function exists (Supabase provides it by default, but include for local dev)
create or replace function trigger_set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create table if not exists users (
  id uuid primary key default uuid_generate_v4(),
  email text unique not null,
  password_hash text not null,
  full_name text not null,
  role text not null check (role in ('admin', 'tutor', 'student')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_users_updated_at
before update on users
for each row execute procedure trigger_set_updated_at();

-- Tutoring sessions table captures hours submissions
create table if not exists tutoring_sessions (
  id uuid primary key default uuid_generate_v4(),
  tutor_id uuid references users(id) on delete set null,
  student_id uuid references users(id) on delete set null,
  tutor_name text not null,
  student_name text not null,
  subject text not null,
  start_time timestamptz not null,
  end_time timestamptz not null,
  notes text,
  approval_status text not null default 'pending' check (approval_status in ('pending', 'approved', 'rejected')),
  approved_by uuid references users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_sessions_updated_at
before update on tutoring_sessions
for each row execute procedure trigger_set_updated_at();

-- Audit log for status changes
create table if not exists tutoring_session_audit (
  id uuid primary key default uuid_generate_v4(),
  session_id uuid not null references tutoring_sessions(id) on delete cascade,
  changed_by uuid references users(id) on delete set null,
  old_status text not null,
  new_status text not null,
  created_at timestamptz not null default now()
);

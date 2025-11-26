import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '../.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: { persistSession: false },
});

const email = process.argv[2];
const password = process.argv[3];
const fullName = process.argv[4] || 'Administrator';

if (!email || !password) {
  console.error('Usage: node create-admin.js <email> <password> [fullName]');
  console.error('Example: node create-admin.js admin@example.com YourPassword123 "Admin Name"');
  process.exit(1);
}

try {
  const passwordHash = await bcrypt.hash(password, 10);

  const { data, error } = await supabase
    .from('users')
    .insert({
      email: email.toLowerCase().trim(),
      password_hash: passwordHash,
      full_name: fullName.trim(),
      role: 'admin',
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating admin:', error.message);
    if (error.code === '23505') {
      console.error('  A user with this email already exists.');
    }
    process.exit(1);
  }

  console.log('\n✅ Admin user created successfully!');
  console.log('   ID:', data.id);
  console.log('   Email:', data.email);
  console.log('   Full Name:', data.full_name);
  console.log('   Role:', data.role);
  console.log('\nYou can now log in at http://localhost:5173/tutoring-login.html\n');
} catch (error) {
  console.error('Unexpected error:', error.message);
  process.exit(1);
}




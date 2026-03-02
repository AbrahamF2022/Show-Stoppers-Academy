import dotenv from 'dotenv';

dotenv.config();

const requiredEnv = ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY', 'JWT_SECRET'];

requiredEnv.forEach((key) => {
  if (!process.env[key]) {
    console.warn(`Warning: missing environment variable ${key}`);
  }
});

const optionalShopEnv = ['STRIPE_SECRET_KEY', 'STRIPE_WEBHOOK_SECRET', 'RESEND_API_KEY', 'ADMIN_EMAIL'];
optionalShopEnv.forEach((key) => {
  if (!process.env[key]) {
    console.warn(`Warning: shop feature env var missing: ${key}`);
  }
});

export const config = {
  port: Number(process.env.PORT) || 4000,
  supabaseUrl: process.env.SUPABASE_URL || '',
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  jwtSecret: process.env.JWT_SECRET || 'change-me',
  stripeSecretKey: process.env.STRIPE_SECRET_KEY || '',
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
  resendApiKey: process.env.RESEND_API_KEY || '',
  adminEmail: process.env.ADMIN_EMAIL || '',
};

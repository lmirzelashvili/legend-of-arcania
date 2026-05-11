import 'dotenv/config';

function requireEnv(key: string, fallbackForDev?: string): string {
  const value = process.env[key];
  if (value) return value;
  if (process.env.NODE_ENV === 'production') {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  if (fallbackForDev) return fallbackForDev;
  throw new Error(`Missing required environment variable: ${key}`);
}

export const env = {
  DATABASE_URL: requireEnv('DATABASE_URL', 'postgresql://arcania:arcania_secret@localhost:5432/arcania_nexus'),
  JWT_SECRET: requireEnv('JWT_SECRET', 'dev-only-jwt-secret-do-not-use-in-prod'),
  PORT: parseInt(process.env.PORT || '3001', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:5173',
  REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',
  INTERNAL_API_KEY: requireEnv('INTERNAL_API_KEY', 'dev-internal-key'),
};

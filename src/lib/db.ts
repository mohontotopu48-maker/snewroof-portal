import { sql } from '@vercel/postgres';
import { drizzle } from 'drizzle-orm/vercel-postgres';
import * as schema from '@/db/schema';

// This will automatically pick up POSTGRES_URL from the environment
// When deployed to Vercel, this is auto-configured if a Vercel Postgres DB is linked.
export const db = drizzle(sql, { schema });

import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from '@/db/schema';

const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;

if (!connectionString) {
    console.warn('Warning: No database connection string provided. Database operations will fail.');
}

const sql = neon(connectionString || '');
export const db = drizzle(sql, { schema });

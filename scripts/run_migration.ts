import { readFileSync } from 'fs';
import { join } from 'path';
import { neon } from '@neondatabase/serverless';

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
    console.error('DATABASE_URL is not set');
    process.exit(1);
}

const sql = neon(DATABASE_URL);
const sqlContent = readFileSync(join(import.meta.dirname, 'migrate_neon.sql'), 'utf8');

// Split on statement boundaries (handle multi-line statements)
// We'll execute the whole file at once since neon supports multi-statement
try {
    console.log('Running migration...');
    await sql.transaction((tx) => [tx.unsafe(sqlContent)]);
    console.log('✅ Migration completed successfully!');
} catch (err: unknown) {
    // Some statements like CREATE EXTENSION may already exist — log and continue
    if (err instanceof Error && err.message.includes('already exists')) {
        console.warn('⚠️  Some objects already exist (safe to ignore):', err.message);
    } else {
        console.error('❌ Migration error:', err);
        process.exit(1);
    }
}

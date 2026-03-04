import { Pool } from 'pg';
import { readFileSync } from 'fs';
import { join } from 'path';

// Force dotenv to load the local env file
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const pool = new Pool({
    connectionString: process.env.POSTGRES_URL_NON_POOLING,
    ssl: { rejectUnauthorized: false }
});

async function run() {
    try {
        console.log("Reading schema.sql...");
        const sqlContent = readFileSync(join(process.cwd(), 'scripts', 'schema.sql'), 'utf8');

        console.log("Executing schema.sql on Neon via standard pg client...");
        await pool.query(sqlContent);

        console.log("✅ Schema update completed successfully!");
    } catch (e) {
        console.error("❌ Schema update failed:");
        console.error(e);
    } finally {
        await pool.end();
    }
}

run();

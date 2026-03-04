// Run: node scripts/migrate_vercel_oauth.cjs
const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function migrate() {
    console.log('Running Vercel OAuth migration...');
    try {
        await sql`ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL`;
        console.log('✓ password_hash is now nullable');
    } catch (e) {
        if (e.message.includes('already')) {
            console.log('~ password_hash already nullable, skipping');
        } else {
            throw e;
        }
    }

    try {
        await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS vercel_user_id TEXT UNIQUE`;
        console.log('✓ vercel_user_id column added');
    } catch (e) {
        console.log('~ vercel_user_id already exists, skipping');
    }

    console.log('Migration complete.');
}

migrate().catch(err => {
    console.error('Migration failed:', err.message);
    process.exit(1);
});

// @ts-check
const { neon } = require('@neondatabase/serverless');
const { readFileSync } = require('fs');
const { join } = require('path');

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
    console.error('DATABASE_URL is not set');
    process.exit(1);
}

async function main() {
    const sql = neon(DATABASE_URL);
    const sqlContent = readFileSync(join(__dirname, 'migrate_neon.sql'), 'utf8');

    // Split into individual statements - simple split on semicolon
    const statements = sqlContent
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 5 && !s.startsWith('--'));

    console.log(`Running ${statements.length} SQL statements...`);

    for (let i = 0; i < statements.length; i++) {
        const stmt = statements[i];
        try {
            await sql.unsafe(stmt + ';');
            process.stdout.write('.');
        } catch (err) {
            const msg = err && err.message ? err.message : String(err);
            if (msg.includes('already exists') || msg.includes('does not exist')) {
                process.stdout.write('~');
            } else {
                console.error(`\n❌ Error on statement ${i + 1}:`, msg);
                console.error('Statement was:', stmt.substring(0, 200));
                process.exit(1);
            }
        }
    }
    console.log('\n✅ Migration completed!');
}

main().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
});

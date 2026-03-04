// Verify what's actually in the DB
const { neon } = require('@neondatabase/serverless');
const bcrypt = require('bcryptjs');

const sql = neon(process.env.DATABASE_URL);

async function main() {
    // Check actual column names
    const cols = await sql`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'users' AND table_schema = 'public'
    ORDER BY ordinal_position
  `;
    console.log('users columns:', cols.map(c => c.column_name).join(', '));

    // Get user raw 
    const user = await sql`SELECT * FROM users WHERE email = 'mohontotopu48@gmail.com' LIMIT 1`;
    if (!user.length) { console.log('USER NOT FOUND!'); return; }

    const u = user[0];
    console.log('User keys:', Object.keys(u).join(', '));
    console.log('email:', u.email);

    // Find the password field - could be password_hash or passwordHash
    const pwField = u.password_hash !== undefined ? 'password_hash' : (u.passwordHash !== undefined ? 'passwordHash' : null);
    console.log('password field name:', pwField);
    console.log('hash value (first 20):', pwField ? String(u[pwField]).substring(0, 20) : 'NONE');

    if (pwField) {
        const test = await bcrypt.compare('SNR#26$Customer', u[pwField]);
        console.log('bcrypt.compare test:', test);
    }
}

main().catch(e => { console.error('ERR:', e.message); process.exit(1); });

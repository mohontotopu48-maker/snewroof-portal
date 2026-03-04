// Definitive login fix - reset password and verify everything matches Drizzle schema
const { neon } = require('@neondatabase/serverless');
const bcrypt = require('bcryptjs');

const sql = neon(process.env.DATABASE_URL);
const EMAIL = 'mohontotopu48@gmail.com';
const PASSWORD = 'SNR#26$Customer';

async function main() {
    // Get user from DB using exact Drizzle column name
    const rows = await sql`SELECT id, email, password_hash FROM users WHERE email = ${EMAIL} LIMIT 1`;

    if (!rows.length) {
        console.log('❌ User not found! Creating...');
        const hash = await bcrypt.hash(PASSWORD, 12);
        const { randomUUID } = require('crypto');
        const userId = randomUUID();
        await sql`INSERT INTO users (id, email, password_hash) VALUES (${userId}, ${EMAIL}, ${hash})`;
        await sql`INSERT INTO profiles (id, full_name, role) VALUES (${userId}, 'Portal Admin', 'admin') ON CONFLICT (id) DO UPDATE SET role='admin', full_name='Portal Admin'`;
        console.log('✅ User created with fresh hash');
        return;
    }

    const user = rows[0];
    console.log('User found:', user.email, '| id:', user.id);
    console.log('Current hash starts with:', String(user.password_hash).substring(0, 7));

    // Always reset with fresh hash
    const newHash = await bcrypt.hash(PASSWORD, 12);
    await sql`UPDATE users SET password_hash = ${newHash} WHERE id = ${user.id}`;
    console.log('✅ Password hash updated');

    // Verify the NEW hash stored in DB
    const updated = await sql`SELECT password_hash FROM users WHERE id = ${user.id} LIMIT 1`;
    const dbHash = updated[0].password_hash;
    const verify = await bcrypt.compare(PASSWORD, dbHash);
    console.log('✅ DB hash verification:', verify);
    console.log('New hash in DB starts with:', String(dbHash).substring(0, 7));

    // Ensure profile is admin
    await sql`INSERT INTO profiles (id, full_name, role) VALUES (${user.id}, 'Portal Admin', 'admin') ON CONFLICT (id) DO UPDATE SET role='admin'`;
    const profile = await sql`SELECT id, full_name, role FROM profiles WHERE id = ${user.id} LIMIT 1`;
    console.log('Profile role:', profile[0]?.role);

    console.log('\n✅ Login should work with:');
    console.log('  Email:', EMAIL);
    console.log('  Password: SNR#26$Customer');
}

main().catch(e => { console.error('FATAL:', e.message); process.exit(1); });

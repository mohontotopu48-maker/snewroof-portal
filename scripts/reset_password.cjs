// Reset user password in Neon DB using bcrypt
const { neon } = require('@neondatabase/serverless');
const bcrypt = require('bcryptjs');

const DATABASE_URL = process.env.DATABASE_URL;
const EMAIL = process.env.RESET_EMAIL || 'mohontotopu48@gmail.com';
const NEW_PASSWORD = process.env.RESET_PASSWORD || 'SNR#26$Customer';

async function main() {
    const sql = neon(DATABASE_URL);

    // Check user exists
    const users = await sql`SELECT id, email FROM users WHERE email = ${EMAIL} LIMIT 1`;
    if (!users.length) {
        console.log(`User not found: ${EMAIL}`);
        console.log('Creating user instead...');
        const hash = await bcrypt.hash(NEW_PASSWORD, 12);
        const userId = require('crypto').randomUUID();
        await sql`INSERT INTO users (id, email, password_hash) VALUES (${userId}, ${EMAIL}, ${hash})`;
        await sql`INSERT INTO profiles (id, full_name, role) VALUES (${userId}, 'Portal Admin', 'admin') ON CONFLICT (id) DO NOTHING`;
        console.log(`✅ User created: ${EMAIL} with role=admin`);
        return;
    }

    const user = users[0];
    console.log(`Found user: ${user.email} (${user.id})`);

    // Reset password
    const hash = await bcrypt.hash(NEW_PASSWORD, 12);
    await sql`UPDATE users SET password_hash = ${hash} WHERE id = ${user.id}`;
    console.log(`✅ Password reset for ${EMAIL}`);

    // Verify hash works
    const verify = await bcrypt.compare(NEW_PASSWORD, hash);
    console.log(`✅ Hash verification: ${verify}`);

    // Ensure profile exists
    const profiles = await sql`SELECT id, role FROM profiles WHERE id = ${user.id} LIMIT 1`;
    if (!profiles.length) {
        await sql`INSERT INTO profiles (id, full_name, role) VALUES (${user.id}, 'Admin', 'admin')`;
        console.log(`✅ Profile created with role=admin`);
    } else {
        console.log(`Profile exists: role=${profiles[0].role}`);
    }
}

main().catch(e => { console.error('ERROR:', e.message); process.exit(1); });

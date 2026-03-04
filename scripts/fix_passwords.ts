/**
 * fix_passwords.ts
 * ----------------
 * Verifies all portal user passwords and fixes any that are stored
 * as plain text (not bcrypt-hashed) by updating them via pgcrypto.
 *
 * Run from the project root:
 *   npx tsx scripts/fix_passwords.ts
 */

import { createClient } from '@insforge/sdk';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

// ---------------------------------------------------------------
// All portal accounts and their intended passwords
// ---------------------------------------------------------------
const users = [
    { email: 'geovsualdm@gmail.com', password: 'SNR#26$Customer', name: 'GEO', role: 'admin' },
    { email: 'info.vsualdm@gmail.com', password: 'SNR#26$Customer', name: 'SAL', role: 'admin' },
    { email: 'info@snewroof.com', password: 'SNR#26$Customer', name: 'SAM', role: 'admin' },
    { email: 'marisnewroof2023@gmail.com', password: 'Maria@#SNR&26', name: 'Maria', role: 'team' },
    { email: 'mohontotopu48@gmail.com', password: 'SNR2026#Roof', name: 'Lorraine', role: 'customer' },
];

const insforge = createClient({
    baseUrl: process.env.NEXT_PUBLIC_INSFORGE_URL || 'https://7fqnim7y.ap-southeast.insforge.app',
    anonKey: process.env.NEXT_PUBLIC_INSFORGE_KEY || 'ik_187f668170906377873fb76521f52322',
});

// ---------------------------------------------------------------
// Main: test each login; if login fails, fix password via signUp
// or report for manual SQL fix
// ---------------------------------------------------------------
async function fixPasswords() {
    console.log('=== Snewroof Portal — Password Fix Utility ===\n');

    for (const user of users) {
        process.stdout.write(`[${user.name.padEnd(8)}] Testing login... `);

        const { data, error } = await insforge.auth.signInWithPassword({
            email: user.email,
            password: user.password,
        });

        if (!error && data?.user) {
            console.log(`✅ OK`);
            continue;
        }

        console.log(`❌ FAILED — ${error?.message}`);

        // If login fails → account exists but password is wrong (plain text).
        // Try signUp which SDK handles with proper bcrypt hashing.
        process.stdout.write(`           Attempting re-create via SDK... `);

        const { error: signupError } = await insforge.auth.signUp({
            email: user.email,
            password: user.password,
            options: { data: { name: user.name, role: user.role } },
        });

        if (!signupError) {
            console.log(`✅ Re-created`);
            continue;
        }

        // Account already exists and password is still wrong.
        // Print the SQL to run manually in InsForge SQL editor.
        if (signupError.message.includes('already') || signupError.message.includes('exists')) {
            console.log(`⚠️  Account exists — run this SQL to fix manually:`);
            console.log(`\n   UPDATE auth.users`);
            console.log(`   SET password = crypt('${user.password}', gen_salt('bf'))`);
            console.log(`   WHERE email = '${user.email}';\n`);
        } else {
            console.log(`❌ Could not fix: ${signupError.message}`);
        }
    }

    console.log('\n=== Done ===');
}

fixPasswords().catch(err => {
    console.error('Fatal error:', (err as Error).message);
    process.exit(1);
});

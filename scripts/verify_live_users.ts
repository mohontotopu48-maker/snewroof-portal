import { createClient } from '@insforge/sdk';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const users = [
    { email: 'geovsualdm@gmail.com', password: 'SNR#26$Customer', name: 'GEO', role: 'admin' },
    { email: 'info.vsualdm@gmail.com', password: 'SNR#26$Customer', name: 'SAL', role: 'admin' },
    { email: 'info@snewroof.com', password: 'SNR#26$Customer', name: 'SAM', role: 'admin' },
    { email: 'mohontotopu48@gmail.com', password: 'SNR#26$Customer', name: 'Topu', role: 'admin' },
    { email: 'marisnewroof2023@gmail.com', password: 'Maria@#SNR&26', name: 'Maria', role: 'team' },
    { email: 'tom@snewroof.com', password: 'SNR2026#Roof', name: 'Tom Vuong', role: 'customer' },
    { email: 'brett@snewroof.com', password: 'SNR2026#Roof', name: 'Brett', role: 'customer' },
    { email: 'lorraine@snewroof.com', password: 'SNR2026#Roof', name: 'Lorraine', role: 'customer' }
];

const insforge = createClient({
    baseUrl: process.env.NEXT_PUBLIC_INSFORGE_URL || 'https://7fqnim7y.ap-southeast.insforge.app',
    anonKey: process.env.NEXT_PUBLIC_INSFORGE_KEY || 'ik_187f668170906377873fb76521f52322'
});

async function run() {
    console.log("Verifying users...\n");
    for (const u of users) {
        process.stdout.write(`Testing ${u.email}... `);
        const { error, data } = await insforge.auth.signInWithPassword({ email: u.email, password: u.password });
        if (!error && data?.user) {
            console.log(`✅ Login OK.`);
        } else {
            console.log(`❌ Login FAILED: ${error?.message}`);

            // If it fails, try to sign them up securely
            process.stdout.write(`   Attempting to recreate via signup... `);
            const { error: signUpError } = await insforge.auth.signUp({
                email: u.email,
                password: u.password,
                options: { data: { name: u.name, role: u.role, full_name: u.name } }
            });
            if (!signUpError) {
                console.log(`✅ Created successfully!`);
            } else {
                console.log(`❌ Could not create. Reason: ${signUpError.message}`);
            }
        }
    }
    console.log("\nDone.");
}

run();

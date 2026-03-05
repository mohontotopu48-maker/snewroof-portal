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
    baseUrl: process.env.NEXT_PUBLIC_INSFORGE_URL!,
    anonKey: process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY!
});

async function run() {
    console.log("=== Final Portal User Verification ===\n");

    let allPassed = true;
    for (const u of users) {
        process.stdout.write(`[${u.role.toUpperCase().padEnd(8)}] ${u.email.padEnd(35)} → Testing login... `);

        const { error, data } = await insforge.auth.signInWithPassword({
            email: u.email,
            password: u.password
        });

        if (!error && data?.user) {
            // Also check the role in profiles
            const { data: profile } = await insforge.database
                .from('profiles')
                .select('full_name, role')
                .eq('id', data.user.id)
                .single();

            const roleOk = (profile as any)?.role === u.role;
            const nameOk = (profile as any)?.full_name === u.name;

            if (roleOk && nameOk) {
                console.log(`✅ OK (name="${(profile as any)?.full_name}", role="${(profile as any)?.role}")`);
            } else {
                console.log(`⚠️  Login OK but profile mismatch — name="${(profile as any)?.full_name}"(${nameOk ? 'ok' : 'WRONG'}), role="${(profile as any)?.role}"(${roleOk ? 'ok' : 'WRONG'})`);
                // Fix the profile
                await insforge.database.from('profiles').update({ full_name: u.name, role: u.role }).eq('id', data.user.id);
                console.log(`           → Profile fixed automatically.`);
                allPassed = false;
            }
        } else {
            console.log(`❌ Login FAILED: ${error?.message}`);
            allPassed = false;
        }
    }

    console.log(`\n=== ${allPassed ? '✅ ALL USERS VERIFIED' : '⚠️  SOME ISSUES WERE AUTO-FIXED'} ===`);
}

run().catch(err => {
    console.error('Fatal error:', (err as Error).message);
    process.exit(1);
});

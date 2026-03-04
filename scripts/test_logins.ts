import { createClient } from '@insforge/sdk';
import * as dotenv from 'dotenv';
dotenv.config({ path: '../.env.local' });

const insforge = createClient({
    baseUrl: process.env.NEXT_PUBLIC_INSFORGE_URL || 'https://7fqnim7y.ap-southeast.insforge.app',
    anonKey: process.env.NEXT_PUBLIC_INSFORGE_KEY || 'ik_187f668170906377873fb76521f52322',
});

const users = [
    { email: 'geovsualdm@gmail.com', password: 'SNR#26$Customer', name: 'GEO (Admin)' },
    { email: 'info.vsualdm@gmail.com', password: 'SNR#26$Customer', name: 'SAL (Admin)' },
    { email: 'info@snewroof.com', password: 'SNR#26$Customer', name: 'SAM (Admin)' },
    { email: 'marisnewroof2023@gmail.com', password: 'Maria@#SNR&26', name: 'Maria (Team)' },
    { email: 'mohontotopu48@gmail.com', password: 'SNR2026#Roof', name: 'Lorraine (Customer)' },
];

async function testAll() {
    console.log('=== Login Test for All Portal Accounts ===\n');

    for (const user of users) {
        const { data, error } = await insforge.auth.signInWithPassword({
            email: user.email,
            password: user.password,
        });

        if (error || !data?.user) {
            console.log(`❌ FAILED  | ${user.name.padEnd(25)} | ${error?.message}`);
        } else {
            console.log(`✅ SUCCESS | ${user.name.padEnd(25)} | ID: ${data.user.id}`);
        }
    }

    console.log('\n=== Done ===');
}

testAll();

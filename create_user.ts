import { createClient } from '@insforge/sdk';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const insforge = createClient({
    baseUrl: process.env.NEXT_PUBLIC_INSFORGE_URL || 'https://7fqnim7y.ap-southeast.insforge.app',
    anonKey: process.env.NEXT_PUBLIC_INSFORGE_KEY || 'ik_187f668170906377873fb76521f52322',
});

async function main() {
    console.log('Creating test user...');
    const { data, error } = await insforge.auth.signUp({
        email: 'mohontotopu48@gmail.com',
        password: 'SNR#26$Customer',
        name: 'Test Customer',
    });

    if (error) {
        console.error('Error creating user:', error);
    } else {
        console.log('User created successfully:', data?.user?.id);

        // Also set the profile
        if (data?.user) {
            await insforge.auth.setProfile({
                name: 'Test Customer',
                role: 'customer'
            });
            console.log('Profile configured for user.');
        }
    }
}

main();

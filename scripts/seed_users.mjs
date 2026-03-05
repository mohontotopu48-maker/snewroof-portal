import { createClient } from '@insforge/sdk';

const supabase = createClient(
    process.env.NEXT_PUBLIC_INSFORGE_URL || '',
    process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY || ''
);

const usersToCreate = [
    { name: 'GEO', email: 'geovsualdm@gmail.com', pass: 'SNR#26$Customer', role: 'admin' },
    { name: 'SAL', email: 'info.vsualdm@gmail.com', pass: 'SNR#26$Customer', role: 'admin' },
    { name: 'SAM', email: 'info@snewroof.com', pass: 'SNR#26$Customer', role: 'admin' },
    { name: 'Mohon', email: 'mohontotopu48@gmail.com', pass: 'SNR#26$Customer', role: 'admin' },
    { name: 'Maria', email: 'marisnewroof2023@gmail.com', pass: 'Maria@#SNR&26', role: 'admin' }, // Team Portal
    { name: 'Tom Vuong', email: 'tom@snewroof.com', pass: 'SNR2026#Roof', role: 'customer' },
    { name: 'Brett', email: 'brett@snewroof.com', pass: 'SNR2026#Roof', role: 'customer' },
    { name: 'Lorraine', email: 'lorraine@snewroof.com', pass: 'SNR2026#Roof', role: 'customer' }
];

async function main() {
    console.log('Seeding Live Authentication Users...');

    for (const u of usersToCreate) {
        const { data, error } = await supabase.auth.signUp({
            email: u.email,
            password: u.pass,
        });

        if (error) {
            console.log(`Failed to create ${u.email}:`, error.message);
            // Might already exist
        } else if (data && data.user) {
            console.log(`Created Auth User: ${u.email}`);
            const { error: profileError } = await supabase.from('profiles').upsert({
                id: data.user.id,
                full_name: u.name,
                role: u.role,
                // email: u.email // Omitted for schema parity
            });
            if (profileError) {
                console.error(`  -> Failed to create profile for ${u.email}:`, profileError.message);
            } else {
                console.log(`  -> Profile created successfully for ${u.email}`);
            }
        }
    }
}

main();

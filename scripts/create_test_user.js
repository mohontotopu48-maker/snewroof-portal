import { createClient } from '@insforge/sdk';
import 'dotenv/config';

const supabase = createClient(
    process.env.NEXT_PUBLIC_INSFORGE_URL || '',
    process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY || ''
);

async function main() {
    console.log('Registering test user...');
    const { data, error } = await supabase.auth.signUp({
        email: 'livetest@example.com',
        password: 'LiveTestPass123!',
    });

    if (error) {
        console.error('Sign up error:', error.message);
        return;
    }

    if (data.user) {
        const { error: profileError } = await supabase.from('profiles').insert({
            id: data.user.id,
            full_name: 'Live Test User',
            role: 'customer'
        });

        if (profileError) {
            console.error('Profile error:', profileError.message);
        } else {
            console.log('Success! Test user ready.');
        }
    }
}

main();

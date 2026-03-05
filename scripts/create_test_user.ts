import { registerUser } from './src/app/actions';

async function main() {
    console.log('Creating live test user...');
    const result = await registerUser('livetest@example.com', 'LiveTestPass123!', 'Live Test User');
    console.log('Result:', result);
}

main().catch(console.error);

import { createClient } from '@insforge/sdk';

const insforge = createClient({
  baseUrl: process.env.NEXT_PUBLIC_INSFORGE_URL || 'https://7fqnim7y.ap-southeast.insforge.app',
  anonKey: process.env.NEXT_PUBLIC_INSFORGE_KEY || 'ik_187f668170906377873fb76521f52322'
});

export default insforge;

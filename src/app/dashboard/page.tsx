// Server component — fetches the real user's name and passes it to the client component
import { getProfile } from '@/app/actions';
import DashboardClient from './DashboardClient';

export default async function DashboardPage() {
    const profile = await getProfile();
    const userName = profile?.full_name || profile?.email?.split('@')[0] || 'there';
    return <DashboardClient userName={userName} />;
}

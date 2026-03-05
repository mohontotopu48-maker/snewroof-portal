import { CustomerSidebar } from '@/components/layout/CustomerSidebar';
import { Topbar } from '@/components/layout/Topbar';
import { getProfile } from '@/app/actions';
import { redirect } from 'next/navigation';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
    const user = await getProfile();

    if (!user) {
        redirect('/login');
    }

    return (
        <div className="page-layout">
            <CustomerSidebar user={{ email: user.email || '', role: user.role || 'customer', name: user.full_name }} />
            <div className="main-content">
                <Topbar user={{ id: user.id || '', email: user.email || '', role: user.role || 'customer', name: user.full_name, avatarUrl: user.avatar_url }} />
                <div className="page-content animate-fade">
                    {children}
                </div>
            </div>
        </div>
    );
}

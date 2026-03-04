'use client';


import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { CustomerSidebar } from '@/components/layout/CustomerSidebar';
import { Topbar } from '@/components/layout/Topbar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const user = { id: '00000000-0000-0000-0000-000000000001', email: 'customer@example.com', role: 'admin', name: 'Dummy User' };
    const loading = false;
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.replace('/login');
        }
    }, [user, loading, router]);

    if (loading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', flexDirection: 'column', gap: 16 }}>
                <div style={{ width: 48, height: 48, background: 'linear-gradient(135deg,var(--orange-500),var(--orange-400))', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 900, color: 'white' }}>S</div>
                <div style={{ width: 32, height: 32, border: '3px solid var(--border)', borderTopColor: 'var(--orange-500)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    if (!user) return null;

    return (
        <div className="page-layout">
            <CustomerSidebar />
            <div className="main-content">
                <Topbar />
                <div className="page-content animate-fade">
                    {children}
                </div>
            </div>
        </div>
    );
}

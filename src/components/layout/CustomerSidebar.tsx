'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import {
    LayoutDashboard, CalendarCheck, FileText, HardHat,
    Receipt, MessageCircle, Settings, LogOut, Menu, ShieldCheck, Users, FolderOpen
} from 'lucide-react';
import { useState } from 'react';
import { logoutUser } from '@/lib/auth-actions';

const navItems = [
    { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/dashboard/book-inspection', icon: CalendarCheck, label: 'Book Inspection' },
    { href: '/dashboard/quotes', icon: FileText, label: 'Quotes' },
    { href: '/dashboard/projects', icon: HardHat, label: 'Projects' },
    { href: '/dashboard/documents', icon: FileText, label: 'Documents' },
    { href: '/dashboard/resources', icon: FolderOpen, label: 'Resources' },
    { href: '/dashboard/invoices', icon: Receipt, label: 'Invoices' },
    { href: '/dashboard/messages', icon: MessageCircle, label: 'Messages' },
    { href: 'https://wa.me/17147704756', icon: MessageCircle, label: 'WhatsApp', external: true },
    { href: 'sms:17147704756', icon: MessageCircle, label: 'SMS Us', external: true },
];

export function CustomerSidebar({ user }: { user: { email: string, role: string, name: string | null } }) {
    const pathname = usePathname();
    const [mobileOpen, setMobileOpen] = useState(false);

    const handleSignOut = async () => {
        await logoutUser();
    };

    const initials = user?.name
        ? user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
        : user?.email?.[0]?.toUpperCase() || 'U';

    const sidebarContent = (
        <aside className="sidebar">
            <style>{`
        .sidebar {
          width: var(--sidebar-w);
          height: 100vh;
          background: var(--bg-sidebar);
          border-right: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          position: fixed;
          left: 0; top: 0;
          z-index: 100;
          overflow-y: auto;
        }
        .sidebar-logo {
          padding: 24px 20px 20px;
          border-bottom: 1px solid var(--border);
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .logo-mark {
          width: 40px; height: 40px;
          background: linear-gradient(135deg, var(--orange-500), var(--orange-400));
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          font-weight: 900;
          color: white;
          flex-shrink: 0;
        }
        .logo-text { font-size: 20px; font-weight: 800; color: white; }
        .logo-sub { font-size: 11px; color: var(--slate-400); letter-spacing: 0.08em; text-transform: uppercase; }
        .sidebar-nav { flex: 1; padding: 16px 12px; display: flex; flex-direction: column; gap: 2px; }
        .nav-label { font-size: 10px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: var(--slate-600); padding: 12px 8px 6px; }
        .nav-link {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 12px;
          border-radius: var(--radius-sm);
          color: var(--slate-400);
          font-size: 14px;
          font-weight: 500;
          transition: var(--transition);
          text-decoration: none;
          cursor: pointer;
          border: none;
          background: transparent;
          width: 100%;
          font-family: inherit;
        }
        .nav-link:hover { background: rgba(255,255,255,0.06); color: var(--white); }
        .nav-link.active { background: rgba(249,115,22,0.12); color: var(--orange-400); border-left: 3px solid var(--orange-500); padding-left: 9px; }
        .nav-link svg { flex-shrink: 0; }
        .sidebar-footer {
          padding: 16px 12px;
          border-top: 1px solid var(--border);
        }
        .user-info {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 8px;
          border-radius: var(--radius-sm);
          margin-bottom: 4px;
        }
        .user-name { font-size: 13px; font-weight: 600; color: var(--white); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .user-email { font-size: 11px; color: var(--slate-400); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
      `}</style>
            <div className="sidebar-logo">
                <div className="logo-mark">S</div>
                <div>
                    <div className="logo-text">Snewroof</div>
                    <div className="logo-sub">Customer Portal</div>
                </div>
            </div>

            <nav className="sidebar-nav">
                <div className="nav-label">Navigation</div>
                {navItems.map(({ href, icon: Icon, label, external }) => (
                    external ? (
                        <a
                            key={href}
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="nav-link"
                            onClick={() => setMobileOpen(false)}
                        >
                            <Icon size={18} />
                            {label}
                        </a>
                    ) : (
                        <Link
                            key={href}
                            href={href}
                            className={`nav-link ${pathname === href ? 'active' : ''}`}
                            onClick={() => setMobileOpen(false)}
                        >
                            <Icon size={18} />
                            {label}
                        </Link>
                    )
                ))}
                <Link href="/dashboard/settings" className={`nav-link ${pathname === '/dashboard/settings' ? 'active' : ''}`} onClick={() => setMobileOpen(false)}>
                    <Settings size={18} />
                    Settings
                </Link>
                {user?.role === 'admin' && (
                    <>
                        <div className="nav-label" style={{ marginTop: 8 }}>Admin Management</div>
                        <Link href="/dashboard/admin/projects" className={`nav-link ${pathname === '/dashboard/admin/projects' ? 'active' : ''}`} onClick={() => setMobileOpen(false)} style={{ color: 'var(--orange-400)' }}>
                            <HardHat size={18} /> Projects
                        </Link>
                        <Link href="/dashboard/admin/quotes" className={`nav-link ${pathname === '/dashboard/admin/quotes' ? 'active' : ''}`} onClick={() => setMobileOpen(false)} style={{ color: 'var(--orange-400)' }}>
                            <FileText size={18} /> Quotes
                        </Link>
                        <Link href="/dashboard/admin/invoices" className={`nav-link ${pathname === '/dashboard/admin/invoices' ? 'active' : ''}`} onClick={() => setMobileOpen(false)} style={{ color: 'var(--orange-400)' }}>
                            <Receipt size={18} /> Invoices
                        </Link>
                        <Link href="/dashboard/admin/inspections" className={`nav-link ${pathname === '/dashboard/admin/inspections' ? 'active' : ''}`} onClick={() => setMobileOpen(false)} style={{ color: 'var(--orange-400)' }}>
                            <CalendarCheck size={18} /> Inspections
                        </Link>
                        <Link href="/dashboard/admin/messages" className={`nav-link ${pathname === '/dashboard/admin/messages' ? 'active' : ''}`} onClick={() => setMobileOpen(false)} style={{ color: 'var(--orange-400)' }}>
                            <MessageCircle size={18} /> Messages
                        </Link>
                        <Link href="/dashboard/admin/customers" className={`nav-link ${pathname.startsWith('/dashboard/admin/customers') ? 'active' : ''}`} onClick={() => setMobileOpen(false)} style={{ color: 'var(--orange-400)' }}>
                            <Users size={18} /> Customers
                        </Link>
                        <Link href="/dashboard/admin/documents" className={`nav-link ${pathname === '/dashboard/admin/documents' ? 'active' : ''}`} onClick={() => setMobileOpen(false)} style={{ color: 'var(--orange-400)' }}>
                            <ShieldCheck size={18} /> Doc Transfer
                        </Link>
                        <Link href="/dashboard/admin/resources" className={`nav-link ${pathname === '/dashboard/admin/resources' ? 'active' : ''}`} onClick={() => setMobileOpen(false)} style={{ color: 'var(--orange-400)' }}>
                            <FolderOpen size={18} /> Add Resources
                        </Link>
                        <div className="nav-label" style={{ marginTop: 8 }}>GEO Controls</div>
                        <Link href="/dashboard/admin/settings" className={`nav-link ${pathname === '/dashboard/admin/settings' ? 'active' : ''}`} onClick={() => setMobileOpen(false)} style={{ color: '#a78bfa', fontWeight: 600 }}>
                            <Settings size={18} /> Portal Settings
                        </Link>
                    </>
                )}
                <button className="nav-link" onClick={handleSignOut} style={{ cursor: 'pointer', color: '#f87171' }}>
                    <LogOut size={18} />
                    Sign Out
                </button>
            </nav>

            <div className="sidebar-footer">
                <div className="user-info">
                    <div className="avatar">{initials}</div>
                    <div style={{ overflow: 'hidden' }}>
                        <div className="user-name">{user?.name || 'Customer'}</div>
                        <div className="user-email">{user?.email}</div>
                    </div>
                </div>
            </div>
        </aside>
    );

    return (
        <>
            {/* Mobile toggle */}
            <button
                onClick={() => setMobileOpen(true)}
                style={{
                    display: 'none',
                    position: 'fixed', top: 16, left: 16, zIndex: 200,
                    background: 'var(--navy-800)', border: '1px solid var(--border)',
                    borderRadius: 8, padding: 8, color: 'white', cursor: 'pointer',
                }}
                id="mobile-menu-btn"
            >
                <Menu size={20} />
            </button>
            <style>{`
        @media (max-width: 768px) {
          #mobile-menu-btn { display: flex !important; }
          .sidebar { transform: translateX(${mobileOpen ? '0' : '-100%'}); transition: transform 0.3s ease; }
        }
      `}</style>
            {mobileOpen && (
                <div
                    onClick={() => setMobileOpen(false)}
                    style={{
                        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
                        zIndex: 99, backdropFilter: 'blur(4px)',
                    }}
                />
            )}
            {sidebarContent}
        </>
    );
}

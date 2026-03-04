'use client';

import { useAuth } from '@/lib/auth-context';
import { Bell, Search } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';

export function Topbar() {
    const { user, isAdmin, signOut } = useAuth();
    const [showDropdown, setShowDropdown] = useState(false);

    const initials = user?.name
        ? user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
        : user?.email?.[0]?.toUpperCase() || 'U';

    return (
        <header style={{
            position: 'fixed',
            top: 0,
            left: 'var(--sidebar-w)',
            right: 0,
            height: 'var(--topbar-h)',
            background: 'rgba(10,22,40,0.85)',
            backdropFilter: 'blur(12px)',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 32px',
            zIndex: 50,
        }}>
            {/* Search */}
            <div style={{ position: 'relative', flex: 1, maxWidth: 400 }}>
                <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--slate-400)' }} />
                <input
                    type="search"
                    placeholder="Search..."
                    className="form-input"
                    style={{ paddingLeft: 38, maxWidth: 360, background: 'rgba(255,255,255,0.04)' }}
                />
            </div>

            {/* Right side */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                {/* Notifications */}
                <button style={{
                    width: 38, height: 38,
                    border: '1px solid var(--border)',
                    borderRadius: 10,
                    background: 'rgba(255,255,255,0.04)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', color: 'var(--slate-400)',
                    position: 'relative',
                }}>
                    <Bell size={17} />
                    <span style={{
                        position: 'absolute', top: 6, right: 6,
                        width: 8, height: 8,
                        background: 'var(--orange-500)',
                        borderRadius: '50%',
                        border: '2px solid var(--navy-900)',
                    }} />
                </button>

                {/* Avatar + dropdown */}
                <div style={{ position: 'relative' }}>
                    <button
                        onClick={() => setShowDropdown(s => !s)}
                        style={{
                            display: 'flex', alignItems: 'center', gap: 10,
                            background: 'rgba(255,255,255,0.04)',
                            border: '1px solid var(--border)',
                            borderRadius: 10, padding: '6px 12px 6px 8px',
                            cursor: 'pointer',
                        }}
                    >
                        {user?.avatarUrl ? (
                            <Image src={user.avatarUrl} alt="Avatar" className="avatar" width={28} height={28} style={{ objectFit: 'cover' }} />
                        ) : (
                            <div className="avatar" style={{ width: 28, height: 28, fontSize: 12 }}>{initials}</div>
                        )}
                        <div style={{ textAlign: 'left' }}>
                            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--white)' }}>{user?.name || 'User'}</div>
                            <div style={{ fontSize: 11, color: 'var(--slate-400)' }}>{isAdmin ? 'Admin' : 'Customer'}</div>
                        </div>
                    </button>
                    {showDropdown && (
                        <div className="dropdown">
                            <Link href="/dashboard/settings" className="dropdown-item" onClick={() => setShowDropdown(false)}>
                                Settings
                            </Link>
                            {isAdmin && (
                                <Link href="/dashboard/admin/documents" className="dropdown-item" onClick={() => setShowDropdown(false)}>
                                    Admin Panel
                                </Link>
                            )}
                            <div 
                                className="dropdown-item" 
                                style={{ color: '#f87171', cursor: 'pointer' }}
                                onClick={() => {
                                    setShowDropdown(false);
                                    signOut();
                                }}
                            >
                                Sign Out
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}

'use client';

import { useState, useEffect, useRef } from 'react';
import { User, Mail, Shield, Lock, Save, Camera, Globe, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import Image from 'next/image';


interface Profile {
    id: string;
    fullName: string | null;
    phone: string | null;
    address: string | null;
    avatarUrl: string | null;
    role: string;
}

import { getProfile, updateProfile, uploadAvatar } from '@/app/actions';

export default function SettingsPage() {
    const { user, refreshProfile } = useAuth();
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [status, setStatus] = useState<{ type: 'success' | 'error', msg: string } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (user?.id) {
            doFetchProfile();
        }
    }, [user?.id]);

    const doFetchProfile = async () => {
        try {
            const data = await getProfile();
            setProfile(data as unknown as Profile);
        } catch (err) {
            console.error('Error fetching profile:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !user?.id) return;

        setUploading(true);
        setStatus(null);

        try {
            const formData = new FormData();
            formData.append('file', file);

            const newAvatarUrl = await uploadAvatar(formData);

            setProfile(prev => prev ? { ...prev, avatarUrl: newAvatarUrl } : null);
            await refreshProfile();
            setStatus({ type: 'success', msg: 'Avatar updated successfully!' });
        } catch (err) {
            console.error('Error uploading avatar:', err);
            setStatus({ type: 'error', msg: (err as Error).message || 'Failed to upload avatar.' });
        } finally {
            setUploading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user?.id || !profile) return;

        setSaving(true);
        setStatus(null);

        try {
            await updateProfile({
                fullName: profile.fullName,
                phone: profile.phone,
                address: profile.address
            });

            await refreshProfile();
            setStatus({ type: 'success', msg: 'Profile updated successfully!' });
        } catch (err) {
            console.error('Error updating profile:', err);
            setStatus({ type: 'error', msg: (err as Error).message || 'Failed to update profile.' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '400px' }}>
                <Loader2 className="animate-spin" size={32} style={{ color: 'var(--orange-500)' }} />
            </div>
        );
    }

    const initials = profile?.fullName
        ? profile.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
        : user?.email?.[0]?.toUpperCase() || 'U';

    return (
        <div className="animate-fade">
            <div className="page-header">
                <h2>Settings</h2>
                <p>Manage your account preferences and profile information.</p>
            </div>

            {status && (
                <div style={{
                    marginBottom: 24, padding: '12px 16px', borderRadius: 10,
                    background: status.type === 'success' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                    border: `1px solid ${status.type === 'success' ? 'var(--success)' : 'var(--error)'}`,
                    color: status.type === 'success' ? 'var(--success)' : 'var(--error)',
                    display: 'flex', alignItems: 'center', gap: 12
                }}>
                    {status.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                    <span style={{ fontSize: 14 }}>{status.msg}</span>
                </div>
            )}

            <div className="grid-2">
                <div style={{ display: 'grid', gap: 24 }}>
                    <div className="card">
                        <div className="section-header">
                            <h3>Profile Information</h3>
                        </div>
                        <form onSubmit={handleSave} style={{ display: 'grid', gap: 20 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 8 }}>
                                <div style={{ position: 'relative' }}>
                                    {profile?.avatarUrl ? (
                                        <Image src={profile.avatarUrl} alt="Avatar" className="avatar avatar-lg" width={52} height={52} style={{ objectFit: 'cover' }} />
                                    ) : (
                                        <div className="avatar avatar-lg">{initials}</div>
                                    )}
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={uploading}
                                        style={{
                                            position: 'absolute', bottom: -4, right: -4,
                                            width: 28, height: 28, borderRadius: '50%',
                                            background: 'var(--orange-500)', border: '2px solid var(--navy-800)',
                                            color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            cursor: 'pointer'
                                        }}>
                                        {uploading ? <Loader2 className="animate-spin" size={14} /> : <Camera size={14} />}
                                    </button>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleAvatarUpload}
                                        style={{ display: 'none' }}
                                        accept="image/*"
                                    />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <h4 style={{ color: 'white', marginBottom: 4 }}>Profile Picture</h4>
                                    <p style={{ fontSize: 13, color: 'var(--slate-400)' }}>Click the icon to upload a new avatar. JPG, PNG or GIF. Max 5MB.</p>
                                </div>
                            </div>

                            <div className="grid-2">
                                <div className="form-group">
                                    <label className="form-label">Full Name</label>
                                    <div style={{ position: 'relative' }}>
                                        <User size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--slate-500)' }} />
                                        <input
                                            type="text"
                                            className="form-input"
                                            value={profile?.fullName || ''}
                                            onChange={(e) => setProfile(p => p ? { ...p, fullName: e.target.value } : null)}
                                            style={{ paddingLeft: 40 }}
                                        />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Email Address</label>
                                    <div style={{ position: 'relative' }}>
                                        <Mail size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--slate-500)' }} />
                                        <input type="email" className="form-input" defaultValue={user?.email || ''} style={{ paddingLeft: 40 }} disabled />
                                    </div>
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Phone Number</label>
                                <input
                                    type="tel"
                                    className="form-input"
                                    placeholder="+1 (555) 000-0000"
                                    value={profile?.phone || ''}
                                    onChange={(e) => setProfile(p => p ? { ...p, phone: e.target.value } : null)}
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Mailing Address</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="123 Main St, Anytown, ST 12345"
                                    value={profile?.address || ''}
                                    onChange={(e) => setProfile(p => p ? { ...p, address: e.target.value } : null)}
                                />
                            </div>

                            <button type="submit" className="btn btn-primary" disabled={saving} style={{ width: 'fit-content' }}>
                                {saving ? <Loader2 className="animate-spin" size={18} /> : (
                                    <>
                                        <Save size={18} /> Save Profile
                                    </>
                                )}
                            </button>
                        </form>
                    </div>

                    <div className="card">
                        <div className="section-header">
                            <h3>Security</h3>
                        </div>
                        <div style={{ display: 'grid', gap: 16 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderRadius: 10, background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <Lock size={18} style={{ color: 'var(--orange-400)' }} />
                                    <div>
                                        <div style={{ fontSize: 14, fontWeight: 600, color: 'white' }}>Two-Factor Authentication</div>
                                        <div style={{ fontSize: 12, color: 'var(--slate-400)' }}>Secure your account with 2FA</div>
                                    </div>
                                </div>
                                <button className="btn btn-secondary btn-sm">Enable</button>
                            </div>
                            <button className="btn btn-secondary" style={{ width: 'fit-content' }}>
                                <Shield size={18} /> Change Password
                            </button>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'grid', gap: 24, alignContent: 'start' }}>
                    <div className="card">
                        <div className="section-header">
                            <h3>Notifications</h3>
                        </div>
                        <div style={{ display: 'grid', gap: 16 }}>
                            {[
                                { label: 'Project Updates', desc: 'Receive alerts about project stage changes.' },
                                { label: 'Quote Requests', desc: 'Get notified when a new quote is ready.' },
                                { label: 'Message Alerts', desc: 'Notify me when I receive a new message.' },
                                { label: 'Marketing', desc: 'Occasional news and special offers.' }
                            ].map((item, i) => (
                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', gap: 16 }}>
                                    <div>
                                        <div style={{ fontSize: 14, fontWeight: 600, color: 'white' }}>{item.label}</div>
                                        <div style={{ fontSize: 12, color: 'var(--slate-400)', marginTop: 2 }}>{item.desc}</div>
                                    </div>
                                    <label style={{ position: 'relative', display: 'inline-block', width: 44, height: 24 }}>
                                        <input type="checkbox" style={{ opacity: 0, width: 0, height: 0 }} defaultChecked={i < 3} />
                                        <span style={{
                                            position: 'absolute', cursor: 'pointer', inset: 0,
                                            background: i < 3 ? 'var(--orange-500)' : 'rgba(255,255,255,0.1)',
                                            borderRadius: 24, transition: '0.4s'
                                        }}>
                                            <div style={{
                                                position: 'absolute', content: "''", height: 18, width: 18,
                                                left: i < 3 ? 22 : 3, bottom: 3, background: 'white',
                                                borderRadius: '50%', transition: '0.4s'
                                            }} />
                                        </span>
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="card" style={{ background: 'rgba(249,115,22,0.05)', borderColor: 'rgba(249,115,22,0.1)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                            <Globe size={18} style={{ color: 'var(--orange-400)' }} />
                            <h4 style={{ color: 'white' }}>Region & Language</h4>
                        </div>
                        <p style={{ fontSize: 13, marginBottom: 16, color: 'var(--slate-400)' }}>Set your preferred language and time zone for communications.</p>
                        <select className="form-input" defaultValue="UTC-5">
                            <option value="UTC-5">Eastern Time (US & Canada)</option>
                            <option value="UTC-6">Central Time (US & Canada)</option>
                            <option value="UTC-7">Mountain Time (US & Canada)</option>
                            <option value="UTC-8">Pacific Time (US & Canada)</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>
    );
}

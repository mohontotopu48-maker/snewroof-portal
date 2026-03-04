'use client';

import { useState } from 'react';
import { User, Mail, Shield, Lock, Save, Camera, Globe } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

export default function SettingsPage() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [saved, setSaved] = useState(false);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        await new Promise(r => setTimeout(r, 1000));
        setLoading(false);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };

    return (
        <div className="animate-fade">
            <div className="page-header">
                <h2>Settings</h2>
                <p>Manage your account preferences and profile information.</p>
            </div>

            <div className="grid-2">
                <div style={{ display: 'grid', gap: 24 }}>
                    <div className="card">
                        <div className="section-header">
                            <h3>Profile Information</h3>
                        </div>
                        <form onSubmit={handleSave} style={{ display: 'grid', gap: 20 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 8 }}>
                                <div style={{ position: 'relative' }}>
                                    <div className="avatar avatar-lg">{user?.name?.[0] || 'U'}</div>
                                    <button type="button" style={{
                                        position: 'absolute', bottom: -4, right: -4,
                                        width: 28, height: 28, borderRadius: '50%',
                                        background: 'var(--orange-500)', border: '2px solid var(--navy-800)',
                                        color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        cursor: 'pointer'
                                    }}>
                                        <Camera size={14} />
                                    </button>
                                </div>
                                <div style={{ flex: 1 }}>
                                    <h4 style={{ color: 'white', marginBottom: 4 }}>Profile Picture</h4>
                                    <p style={{ fontSize: 13 }}>Click the icon to upload a new avatar. JPG, PNG or GIF. Max 5MB.</p>
                                </div>
                            </div>

                            <div className="grid-2">
                                <div className="form-group">
                                    <label className="form-label">Full Name</label>
                                    <div style={{ position: 'relative' }}>
                                        <User size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--slate-500)' }} />
                                        <input type="text" className="form-input" defaultValue={user?.name || ''} style={{ paddingLeft: 40 }} />
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
                                <input type="tel" className="form-input" placeholder="+1 (555) 000-0000" />
                            </div>

                            <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: 'fit-content' }}>
                                {loading ? 'Saving Changes...' : (
                                    <>
                                        <Save size={18} /> Save Profile
                                    </>
                                )}
                            </button>
                            {saved && <span style={{ fontSize: 13, color: 'var(--success)' }}>Changes saved successfully!</span>}
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
                                        <div style={{ fontSize: 12, color: 'var(--slate-500)', marginTop: 2 }}>{item.desc}</div>
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
                        <p style={{ fontSize: 13, marginBottom: 16 }}>Set your preferred language and time zone for communications.</p>
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

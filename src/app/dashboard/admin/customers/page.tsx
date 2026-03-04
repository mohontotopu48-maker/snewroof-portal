'use client';

import { useState, useEffect } from 'react';
import {
    UserPlus, Mail, Lock, User, Phone, Shield, Trash2,
    RefreshCw, CheckCircle2, AlertCircle, Loader2, Users, Key
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import {
    getAdminCustomers, createAdminCustomer,
    updateCustomerRole, deleteCustomer, resetCustomerPassword
} from '@/app/actions';

interface Customer {
    id: string;
    email: string;
    fullName: string | null;
    phone: string | null;
    role: string | null;
    avatarUrl: string | null;
    createdAt: string;
}

const ROLES = ['customer', 'admin', 'contractor'];

export default function AdminCustomersPage() {
    const { isAdmin } = useAuth();
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [status, setStatus] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [resetModal, setResetModal] = useState<Customer | null>(null);
    const [newPassword, setNewPassword] = useState('');

    const [form, setForm] = useState({
        email: '', password: '', fullName: '', phone: '', role: 'customer'
    });

    const fetchCustomers = async () => {
        try {
            const data = await getAdminCustomers();
            setCustomers(data as unknown as Customer[]);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    useEffect(() => { if (isAdmin) fetchCustomers(); }, [isAdmin]);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.email || !form.password || !form.fullName) {
            setStatus({ type: 'error', msg: 'Email, name, and password are required.' });
            return;
        }
        setSubmitting(true);
        setStatus(null);
        try {
            const result = await createAdminCustomer(form);
            if (result?.error) {
                setStatus({ type: 'error', msg: result.error });
            } else {
                setStatus({ type: 'success', msg: `Customer "${form.fullName}" created successfully!` });
                setForm({ email: '', password: '', fullName: '', phone: '', role: 'customer' });
                setShowForm(false);
                fetchCustomers();
            }
        } catch (err) {
            setStatus({ type: 'error', msg: (err as Error).message });
        } finally { setSubmitting(false); }
    };

    const handleRoleChange = async (customerId: string, role: string) => {
        setActionLoading(customerId + '-role');
        try {
            await updateCustomerRole(customerId, role);
            setCustomers(prev => prev.map(c => c.id === customerId ? { ...c, role } : c));
        } catch (err) { alert((err as Error).message); }
        finally { setActionLoading(null); }
    };

    const handleDelete = async (customer: Customer) => {
        if (!confirm(`Delete "${customer.fullName || customer.email}"? This cannot be undone.`)) return;
        setActionLoading(customer.id + '-delete');
        try {
            await deleteCustomer(customer.id);
            setCustomers(prev => prev.filter(c => c.id !== customer.id));
        } catch (err) { alert((err as Error).message); }
        finally { setActionLoading(null); }
    };

    const handleResetPassword = async () => {
        if (!resetModal || !newPassword) return;
        setActionLoading(resetModal.id + '-pw');
        try {
            await resetCustomerPassword(resetModal.id, newPassword);
            setResetModal(null);
            setNewPassword('');
            setStatus({ type: 'success', msg: `Password reset for ${resetModal.email}` });
        } catch (err) { alert((err as Error).message); }
        finally { setActionLoading(null); }
    };

    if (!isAdmin) {
        return (
            <div className="card" style={{ textAlign: 'center', padding: 48, margin: '100px auto', maxWidth: 400 }}>
                <AlertCircle size={48} color="var(--error)" style={{ marginBottom: 16 }} />
                <h3>Access Denied</h3>
                <p style={{ color: 'var(--slate-400)' }}>This area is reserved for admins only.</p>
            </div>
        );
    }

    const roleBadgeStyle = (role: string | null) => ({
        padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700,
        background: role === 'admin' ? 'rgba(249,115,22,0.15)' : role === 'contractor' ? 'rgba(59,130,246,0.15)' : 'rgba(255,255,255,0.06)',
        color: role === 'admin' ? 'var(--orange-400)' : role === 'contractor' ? '#60a5fa' : 'var(--slate-400)',
    });

    return (
        <div className="animate-fade">
            <div className="page-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                <div>
                    <h2>Customer Management</h2>
                    <p>Add, activate, and manage portal users.</p>
                </div>
                <button className="btn btn-primary" onClick={() => { setShowForm(f => !f); setStatus(null); }}>
                    <UserPlus size={18} /> {showForm ? 'Cancel' : 'Add Customer'}
                </button>
            </div>

            {/* Status Banner */}
            {status && (
                <div style={{
                    marginBottom: 20, padding: '12px 16px', borderRadius: 10,
                    background: status.type === 'success' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                    border: `1px solid ${status.type === 'success' ? 'var(--success)' : 'var(--error)'}`,
                    color: status.type === 'success' ? 'var(--success)' : 'var(--error)',
                    display: 'flex', alignItems: 'center', gap: 10, fontSize: 14
                }}>
                    {status.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                    {status.msg}
                </div>
            )}

            {/* Add Customer Form */}
            {showForm && (
                <div className="card" style={{ marginBottom: 24 }}>
                    <h3 style={{ marginBottom: 20 }}>New Customer</h3>
                    <form onSubmit={handleCreate}>
                        <div className="grid-2" style={{ marginBottom: 16 }}>
                            <div className="form-group">
                                <label className="form-label">Full Name *</label>
                                <div style={{ position: 'relative' }}>
                                    <User size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--slate-500)' }} />
                                    <input className="form-input" style={{ paddingLeft: 40 }} placeholder="Jane Smith" value={form.fullName}
                                        onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))} required />
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Email Address *</label>
                                <div style={{ position: 'relative' }}>
                                    <Mail size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--slate-500)' }} />
                                    <input className="form-input" style={{ paddingLeft: 40 }} type="email" placeholder="jane@example.com" value={form.email}
                                        onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Password *</label>
                                <div style={{ position: 'relative' }}>
                                    <Lock size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--slate-500)' }} />
                                    <input className="form-input" style={{ paddingLeft: 40 }} type="password" placeholder="Set initial password" value={form.password}
                                        onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required />
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Phone</label>
                                <div style={{ position: 'relative' }}>
                                    <Phone size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--slate-500)' }} />
                                    <input className="form-input" style={{ paddingLeft: 40 }} type="tel" placeholder="+1 555 000 0000" value={form.phone}
                                        onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Role</label>
                                <div style={{ position: 'relative' }}>
                                    <Shield size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--slate-500)' }} />
                                    <select className="form-input" style={{ paddingLeft: 40 }} value={form.role}
                                        onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
                                        {ROLES.map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>
                        <button type="submit" className="btn btn-primary" disabled={submitting}>
                            {submitting ? <Loader2 className="animate-spin" size={18} /> : <UserPlus size={18} />}
                            {submitting ? 'Creating...' : 'Create Customer'}
                        </button>
                    </form>
                </div>
            )}

            {/* Customer List */}
            <div className="card">
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                    <Users size={20} style={{ color: 'var(--orange-400)' }} />
                    <h3>All Users ({customers.length})</h3>
                    <button className="btn btn-secondary btn-sm" style={{ marginLeft: 'auto' }} onClick={fetchCustomers}>
                        <RefreshCw size={14} /> Refresh
                    </button>
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: 40 }}>
                        <Loader2 className="animate-spin" size={28} style={{ color: 'var(--orange-500)' }} />
                    </div>
                ) : customers.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: 40, color: 'var(--slate-500)' }}>
                        No customers yet. Add one above.
                    </div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                                    {['Customer', 'Email', 'Phone', 'Role', 'Joined', 'Actions'].map(h => (
                                        <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: 'var(--slate-500)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {customers.map(c => (
                                    <tr key={c.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                        <td style={{ padding: '12px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                <div className="avatar" style={{ width: 32, height: 32, fontSize: 13 }}>
                                                    {c.fullName?.[0] || c.email[0].toUpperCase()}
                                                </div>
                                                <span style={{ fontSize: 14, fontWeight: 500, color: 'white' }}>
                                                    {c.fullName || '—'}
                                                </span>
                                            </div>
                                        </td>
                                        <td style={{ padding: '12px', fontSize: 13, color: 'var(--slate-400)' }}>{c.email}</td>
                                        <td style={{ padding: '12px', fontSize: 13, color: 'var(--slate-400)' }}>{c.phone || '—'}</td>
                                        <td style={{ padding: '12px' }}>
                                            <select
                                                value={c.role || 'customer'}
                                                onChange={e => handleRoleChange(c.id, e.target.value)}
                                                disabled={actionLoading === c.id + '-role'}
                                                style={{
                                                    ...roleBadgeStyle(c.role),
                                                    border: 'none', cursor: 'pointer',
                                                    background: c.role === 'admin' ? 'rgba(249,115,22,0.15)' : c.role === 'contractor' ? 'rgba(59,130,246,0.15)' : 'rgba(255,255,255,0.06)',
                                                }}
                                            >
                                                {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                                            </select>
                                        </td>
                                        <td style={{ padding: '12px', fontSize: 12, color: 'var(--slate-500)' }}>
                                            {c.createdAt ? new Date(c.createdAt).toLocaleDateString() : '—'}
                                        </td>
                                        <td style={{ padding: '12px' }}>
                                            <div style={{ display: 'flex', gap: 8 }}>
                                                <button
                                                    className="btn btn-secondary btn-sm"
                                                    onClick={() => { setResetModal(c); setNewPassword(''); }}
                                                    title="Reset Password"
                                                >
                                                    <Key size={14} />
                                                </button>
                                                <button
                                                    className="btn btn-sm"
                                                    style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171', border: 'none' }}
                                                    onClick={() => handleDelete(c)}
                                                    disabled={actionLoading === c.id + '-delete'}
                                                    title="Delete Customer"
                                                >
                                                    {actionLoading === c.id + '-delete' ? <Loader2 className="animate-spin" size={14} /> : <Trash2 size={14} />}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Reset Password Modal */}
            {resetModal && (
                <div style={{
                    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)'
                }} onClick={() => setResetModal(null)}>
                    <div className="card" style={{ width: 400, maxWidth: '90vw' }} onClick={e => e.stopPropagation()}>
                        <h3 style={{ marginBottom: 8 }}>Reset Password</h3>
                        <p style={{ fontSize: 13, color: 'var(--slate-400)', marginBottom: 20 }}>
                            Setting new password for <strong style={{ color: 'white' }}>{resetModal.email}</strong>
                        </p>
                        <div style={{ position: 'relative', marginBottom: 16 }}>
                            <Lock size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--slate-500)' }} />
                            <input
                                className="form-input" style={{ paddingLeft: 40 }}
                                type="password" placeholder="New password"
                                value={newPassword} onChange={e => setNewPassword(e.target.value)}
                                autoFocus
                            />
                        </div>
                        <div style={{ display: 'flex', gap: 12 }}>
                            <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleResetPassword}
                                disabled={!newPassword || actionLoading === resetModal.id + '-pw'}>
                                {actionLoading === resetModal.id + '-pw' ? <Loader2 className="animate-spin" size={16} /> : <Key size={16} />}
                                Reset Password
                            </button>
                            <button className="btn btn-secondary" onClick={() => setResetModal(null)}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

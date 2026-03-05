'use client';

import { useState, useEffect } from 'react';
import { getAdminQuotes, createAdminQuote, updateAdminQuote, deleteAdminQuote, getAdminProfiles } from '@/app/actions';
import { FileText, CheckCircle2, AlertCircle, Plus, Edit2, Trash2 } from 'lucide-react';

export default function AdminQuotesPage() {
    const [quotes, setQuotes] = useState<any[]>([]);
    const [profiles, setProfiles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState<{ type: 'success' | 'error', msg: string } | null>(null);

    const [editingId, setEditingId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState<any>({});

    const [newForm, setNewForm] = useState({ title: '', total: 0, user_id: '', status: 'pending' });

    const fetchData = async () => {
        try {
            const [data, profData] = await Promise.all([getAdminQuotes(), getAdminProfiles()]);
            setQuotes(data);
            setProfiles(profData);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await createAdminQuote(newForm);
            setStatus({ type: 'success', msg: 'Quote created successfully.' });
            setNewForm({ title: '', total: 0, user_id: '', status: 'pending' });
            fetchData();
        } catch (err: any) {
            setStatus({ type: 'error', msg: err.message });
        }
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingId) return;
        try {
            await updateAdminQuote(editingId, editForm);
            setStatus({ type: 'success', msg: 'Quote updated successfully.' });
            setEditingId(null);
            fetchData();
        } catch (err: any) {
            setStatus({ type: 'error', msg: err.message });
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this quote?')) return;
        try {
            await deleteAdminQuote(id);
            fetchData();
        } catch (err: any) {
            setStatus({ type: 'error', msg: err.message });
        }
    };

    const startEdit = (q: any) => {
        setEditingId(q.id);
        setEditForm({ title: q.title, total: q.total, user_id: q.user_id, status: q.status });
    };

    return (
        <div className="animate-fade">
            <div className="page-header">
                <h2>Manage Quotes</h2>
                <p>Add, edit, and track status for all customer quotes.</p>
            </div>

            {status && (
                <div style={{ marginBottom: 24, padding: '12px 16px', borderRadius: 8, background: status.type === 'success' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)', color: status.type === 'success' ? 'var(--success)' : 'var(--error)', display: 'flex', alignItems: 'center', gap: 10 }}>
                    {status.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                    {status.msg}
                </div>
            )}

            <div className="card" style={{ marginBottom: 32 }}>
                <h3>Add New Quote</h3>
                <form onSubmit={handleCreate} style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginTop: 16, alignItems: 'flex-end' }}>
                    <div className="form-group" style={{ marginBottom: 0, flex: 2, minWidth: 200 }}>
                        <label className="form-label">Quote Title</label>
                        <input type="text" className="form-input" placeholder="e.g. Roof Replacement Estimate" required value={newForm.title} onChange={e => setNewForm({ ...newForm, title: e.target.value })} />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0, flex: 1, minWidth: 120 }}>
                        <label className="form-label">Total Amount ($)</label>
                        <input type="number" className="form-input" required value={newForm.total} onChange={e => setNewForm({ ...newForm, total: parseFloat(e.target.value) })} />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0, flex: 2, minWidth: 200 }}>
                        <label className="form-label">Assign Customer</label>
                        <select className="form-input" required value={newForm.user_id} onChange={e => setNewForm({ ...newForm, user_id: e.target.value })}>
                            <option value="">Select Customer...</option>
                            {profiles.map(p => <option key={p.id} value={p.id}>{p.full_name}</option>)}
                        </select>
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ height: 42, padding: '0 24px' }}><Plus size={18} /> Add</button>
                </form>
            </div>

            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div className="table-wrapper">
                    <table>
                        <thead>
                            <tr>
                                <th>Quote Title</th>
                                <th>Customer</th>
                                <th>Total</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={5} style={{ textAlign: 'center', padding: 24 }}>Loading...</td></tr>
                            ) : quotes.map(q => editingId === q.id ? (
                                <tr key={q.id}>
                                    <td colSpan={5}>
                                        <form onSubmit={handleUpdate} style={{ display: 'flex', gap: 12, alignItems: 'center', padding: 8 }}>
                                            <input type="text" className="form-input" value={editForm.title} onChange={e => setEditForm({ ...editForm, title: e.target.value })} required style={{ flex: 2 }} />
                                            <input type="number" className="form-input" value={editForm.total} onChange={e => setEditForm({ ...editForm, total: parseFloat(e.target.value) })} required style={{ flex: 1, maxWidth: 120 }} />
                                            <select className="form-input" value={editForm.user_id} onChange={e => setEditForm({ ...editForm, user_id: e.target.value })} style={{ flex: 1 }}>
                                                {profiles.map(prof => <option key={prof.id} value={prof.id}>{prof.full_name}</option>)}
                                            </select>
                                            <select className="form-input" value={editForm.status} onChange={e => setEditForm({ ...editForm, status: e.target.value })} style={{ width: 120 }}>
                                                <option value="pending">Pending</option>
                                                <option value="accepted">Accepted</option>
                                                <option value="declined">Declined</option>
                                            </select>
                                            <button type="submit" className="btn btn-primary btn-sm">Save</button>
                                            <button type="button" className="btn btn-secondary btn-sm" onClick={() => setEditingId(null)}>Cancel</button>
                                        </form>
                                    </td>
                                </tr>
                            ) : (
                                <tr key={q.id}>
                                    <td><div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><FileText size={16} color="var(--orange-400)" /> <span style={{ fontWeight: 600 }}>{q.title}</span></div></td>
                                    <td>{q.profiles?.full_name || 'Unassigned'}</td>
                                    <td>${Number(q.total).toLocaleString()}</td>
                                    <td>
                                        <span style={{ padding: '4px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600, textTransform: 'uppercase', background: q.status === 'accepted' ? 'rgba(34,197,94,0.1)' : 'rgba(249,115,22,0.1)', color: q.status === 'accepted' ? '#4ade80' : 'var(--orange-400)' }}>
                                            {q.status}
                                        </span>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', gap: 8 }}>
                                            <button className="btn btn-secondary btn-sm" onClick={() => startEdit(q)}><Edit2 size={14} /></button>
                                            <button className="btn btn-secondary btn-sm" onClick={() => handleDelete(q.id)} style={{ color: '#f87171' }}><Trash2 size={14} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

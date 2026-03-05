'use client';

import { useState, useEffect } from 'react';
import { getAdminInvoices, createAdminInvoice, updateAdminInvoice, deleteAdminInvoice, getAdminProfiles, getAdminProjectsAll } from '@/app/actions';
import { Receipt, CheckCircle2, AlertCircle, Plus, Edit2, Trash2 } from 'lucide-react';

export default function AdminInvoicesPage() {
    const [invoices, setInvoices] = useState<any[]>([]);
    const [profiles, setProfiles] = useState<any[]>([]);
    const [projects, setProjects] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState<{ type: 'success' | 'error', msg: string } | null>(null);

    const [editingId, setEditingId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState<any>({});

    const [newForm, setNewForm] = useState({ amount: 0, user_id: '', project_id: '', status: 'unpaid', due_date: '', notes: '' });

    const fetchData = async () => {
        try {
            const [invData, profData, projData] = await Promise.all([getAdminInvoices(), getAdminProfiles(), getAdminProjectsAll()]);
            setInvoices(invData);
            setProfiles(profData);
            setProjects(projData);
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
            await createAdminInvoice(newForm);
            setStatus({ type: 'success', msg: 'Invoice created successfully.' });
            setNewForm({ amount: 0, user_id: '', project_id: '', status: 'unpaid', due_date: '', notes: '' });
            fetchData();
        } catch (err: any) {
            setStatus({ type: 'error', msg: err.message });
        }
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingId) return;
        try {
            await updateAdminInvoice(editingId, editForm);
            setStatus({ type: 'success', msg: 'Invoice updated successfully.' });
            setEditingId(null);
            fetchData();
        } catch (err: any) {
            setStatus({ type: 'error', msg: err.message });
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this invoice?')) return;
        try {
            await deleteAdminInvoice(id);
            fetchData();
        } catch (err: any) {
            setStatus({ type: 'error', msg: err.message });
        }
    };

    const startEdit = (inv: any) => {
        setEditingId(inv.id);
        setEditForm({ amount: inv.amount, user_id: inv.user_id, project_id: inv.project_id || '', status: inv.status, due_date: inv.due_date, notes: inv.notes });
    };

    return (
        <div className="animate-fade">
            <div className="page-header">
                <h2>Manage Invoices</h2>
                <p>Add new invoices and update payment statuses for customers.</p>
            </div>

            {status && (
                <div style={{ marginBottom: 24, padding: '12px 16px', borderRadius: 8, background: status.type === 'success' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)', color: status.type === 'success' ? 'var(--success)' : 'var(--error)', display: 'flex', alignItems: 'center', gap: 10 }}>
                    {status.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                    {status.msg}
                </div>
            )}

            <div className="card" style={{ marginBottom: 32 }}>
                <h3>Add New Invoice</h3>
                <form onSubmit={handleCreate} style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginTop: 16, alignItems: 'flex-end' }}>
                    <div className="form-group" style={{ marginBottom: 0, flex: 1, minWidth: 120 }}>
                        <label className="form-label">Amount ($)</label>
                        <input type="number" className="form-input" required value={newForm.amount} onChange={e => setNewForm({ ...newForm, amount: parseFloat(e.target.value) })} />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0, flex: 2, minWidth: 200 }}>
                        <label className="form-label">Assign Customer</label>
                        <select className="form-input" required value={newForm.user_id} onChange={e => {
                            setNewForm({ ...newForm, user_id: e.target.value, project_id: '' });
                        }}>
                            <option value="">Select Customer...</option>
                            {profiles.map(p => <option key={p.id} value={p.id}>{p.full_name}</option>)}
                        </select>
                    </div>
                    <div className="form-group" style={{ marginBottom: 0, flex: 2, minWidth: 200 }}>
                        <label className="form-label">Link Project</label>
                        <select className="form-input" value={newForm.project_id} disabled={!newForm.user_id} onChange={e => setNewForm({ ...newForm, project_id: e.target.value })}>
                            <option value="">No Project (Optional)</option>
                            {projects.filter(p => p.user_id === newForm.user_id).map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
                        </select>
                    </div>
                    <div className="form-group" style={{ marginBottom: 0, flex: 1, minWidth: 150 }}>
                        <label className="form-label">Due Date</label>
                        <input type="date" className="form-input" required value={newForm.due_date} onChange={e => setNewForm({ ...newForm, due_date: e.target.value })} />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0, flex: 3, minWidth: 200 }}>
                        <label className="form-label">Notes</label>
                        <input type="text" className="form-input" placeholder="e.g. Final Payment" value={newForm.notes} onChange={e => setNewForm({ ...newForm, notes: e.target.value })} />
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ height: 42, padding: '0 24px' }}><Plus size={18} /> Add</button>
                </form>
            </div>

            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div className="table-wrapper">
                    <table>
                        <thead>
                            <tr>
                                <th>Invoice Info</th>
                                <th>Customer</th>
                                <th>Amount</th>
                                <th>Due Date</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={6} style={{ textAlign: 'center', padding: 24 }}>Loading...</td></tr>
                            ) : invoices.map(inv => editingId === inv.id ? (
                                <tr key={inv.id}>
                                    <td colSpan={6}>
                                        <form onSubmit={handleUpdate} style={{ display: 'flex', gap: 12, alignItems: 'center', padding: 8 }}>
                                            <input type="number" className="form-input" value={editForm.amount} onChange={e => setEditForm({ ...editForm, amount: parseFloat(e.target.value) })} required style={{ width: 100 }} />
                                            <select className="form-input" value={editForm.user_id} onChange={e => setEditForm({ ...editForm, user_id: e.target.value })} style={{ flex: 1 }}>
                                                {profiles.map(prof => <option key={prof.id} value={prof.id}>{prof.full_name}</option>)}
                                            </select>
                                            <select className="form-input" value={editForm.project_id} disabled={!editForm.user_id} onChange={e => setEditForm({ ...editForm, project_id: e.target.value })} style={{ flex: 1 }}>
                                                <option value="">No Project</option>
                                                {projects.filter(p => p.user_id === editForm.user_id).map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
                                            </select>
                                            <input type="date" className="form-input" value={editForm.due_date} onChange={e => setEditForm({ ...editForm, due_date: e.target.value })} required style={{ width: 140 }} />
                                            <select className="form-input" value={editForm.status} onChange={e => setEditForm({ ...editForm, status: e.target.value })} style={{ width: 120 }}>
                                                <option value="unpaid">Unpaid</option>
                                                <option value="paid">Paid</option>
                                                <option value="overdue">Overdue</option>
                                            </select>
                                            <button type="submit" className="btn btn-primary btn-sm">Save</button>
                                            <button type="button" className="btn btn-secondary btn-sm" onClick={() => setEditingId(null)}>Cancel</button>
                                        </form>
                                    </td>
                                </tr>
                            ) : (
                                <tr key={inv.id}>
                                    <td><div style={{ display: 'flex', flexDirection: 'column' }}><div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Receipt size={16} color="var(--orange-400)" /> <span style={{ fontWeight: 600 }}>{inv.projects?.title || 'General Invoice'}</span></div><div style={{ fontSize: 11, color: 'var(--slate-400)', marginTop: 4 }}>{inv.notes || 'No notes'}</div></div></td>
                                    <td>{inv.profiles?.full_name || 'Unassigned'}</td>
                                    <td style={{ fontWeight: 'bold' }}>${Number(inv.amount).toLocaleString()}</td>
                                    <td>{inv.due_date}</td>
                                    <td>
                                        <span style={{ padding: '4px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600, textTransform: 'uppercase', background: inv.status === 'paid' ? 'rgba(34,197,94,0.1)' : inv.status === 'overdue' ? 'rgba(239,68,68,0.1)' : 'rgba(249,115,22,0.1)', color: inv.status === 'paid' ? '#4ade80' : inv.status === 'overdue' ? '#f87171' : 'var(--orange-400)' }}>
                                            {inv.status}
                                        </span>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', gap: 8 }}>
                                            <button className="btn btn-secondary btn-sm" onClick={() => startEdit(inv)}><Edit2 size={14} /></button>
                                            <button className="btn btn-secondary btn-sm" onClick={() => handleDelete(inv.id)} style={{ color: '#f87171' }}><Trash2 size={14} /></button>
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

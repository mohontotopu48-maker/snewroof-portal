'use client';

import { useState, useEffect } from 'react';
import { getAdminProjectsAll, createAdminProject, updateAdminProject, deleteAdminProject, getAdminProfiles } from '@/app/actions';
import { HardHat, CheckCircle2, AlertCircle, Plus, Edit2, Trash2 } from 'lucide-react';

export default function AdminProjectsPage() {
    const [projects, setProjects] = useState<any[]>([]);
    const [profiles, setProfiles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState<{ type: 'success' | 'error', msg: string } | null>(null);

    const [editingId, setEditingId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState<any>({});

    const [newForm, setNewForm] = useState({ title: '', user_id: '', status: 'active', current_step: 0 });

    const fetchData = async () => {
        try {
            const [projData, profData] = await Promise.all([getAdminProjectsAll(), getAdminProfiles()]);
            setProjects(projData);
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
            await createAdminProject(newForm);
            setStatus({ type: 'success', msg: 'Project created successfully.' });
            setNewForm({ title: '', user_id: '', status: 'active', current_step: 0 });
            fetchData();
        } catch (err: any) {
            setStatus({ type: 'error', msg: err.message });
        }
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingId) return;
        try {
            await updateAdminProject(editingId, editForm);
            setStatus({ type: 'success', msg: 'Project updated successfully.' });
            setEditingId(null);
            fetchData();
        } catch (err: any) {
            setStatus({ type: 'error', msg: err.message });
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this project?')) return;
        try {
            await deleteAdminProject(id);
            fetchData();
        } catch (err: any) {
            setStatus({ type: 'error', msg: err.message });
        }
    };

    const startEdit = (p: any) => {
        setEditingId(p.id);
        setEditForm({ title: p.title, user_id: p.user_id, status: p.status, current_step: p.current_step });
    };

    return (
        <div className="animate-fade">
            <div className="page-header">
                <h2>Manage Projects</h2>
                <p>Create, rename, update status, and manage active roofing projects.</p>
            </div>

            {status && (
                <div style={{ marginBottom: 24, padding: '12px 16px', borderRadius: 8, background: status.type === 'success' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)', color: status.type === 'success' ? 'var(--success)' : 'var(--error)', display: 'flex', alignItems: 'center', gap: 10 }}>
                    {status.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                    {status.msg}
                </div>
            )}

            <div className="card" style={{ marginBottom: 32 }}>
                <h3>Add New Project</h3>
                <form onSubmit={handleCreate} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 16, marginTop: 16, alignItems: 'end' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Project Title</label>
                        <input type="text" className="form-input" placeholder="e.g. Roof Replacement - 123 Main St" required value={newForm.title} onChange={e => setNewForm({ ...newForm, title: e.target.value })} />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Assign Customer</label>
                        <select className="form-input" required value={newForm.user_id} onChange={e => setNewForm({ ...newForm, user_id: e.target.value })}>
                            <option value="">Select Customer...</option>
                            {profiles.map(p => <option key={p.id} value={p.id}>{p.full_name}</option>)}
                        </select>
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ height: 42 }}><Plus size={18} /> Create</button>
                </form>
            </div>

            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div className="table-wrapper">
                    <table>
                        <thead>
                            <tr>
                                <th>Project Title</th>
                                <th>Customer</th>
                                <th>Status</th>
                                <th>Step (0-5)</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={5} style={{ textAlign: 'center', padding: 24 }}>Loading...</td></tr>
                            ) : projects.map(p => editingId === p.id ? (
                                <tr key={p.id}>
                                    <td colSpan={5}>
                                        <form onSubmit={handleUpdate} style={{ display: 'flex', gap: 12, alignItems: 'center', padding: 8 }}>
                                            <input type="text" className="form-input" value={editForm.title} onChange={e => setEditForm({ ...editForm, title: e.target.value })} required style={{ flex: 2 }} />
                                            <select className="form-input" value={editForm.user_id} onChange={e => setEditForm({ ...editForm, user_id: e.target.value })} style={{ flex: 1 }}>
                                                {profiles.map(prof => <option key={prof.id} value={prof.id}>{prof.full_name}</option>)}
                                            </select>
                                            <select className="form-input" value={editForm.status} onChange={e => setEditForm({ ...editForm, status: e.target.value })} style={{ width: 120 }}>
                                                <option value="active">Active</option>
                                                <option value="completed">Completed</option>
                                                <option value="on_hold">On Hold</option>
                                            </select>
                                            <input type="number" className="form-input" value={editForm.current_step} onChange={e => setEditForm({ ...editForm, current_step: parseInt(e.target.value) })} min="0" max="5" style={{ width: 80 }} />
                                            <button type="submit" className="btn btn-primary btn-sm">Save</button>
                                            <button type="button" className="btn btn-secondary btn-sm" onClick={() => setEditingId(null)}>Cancel</button>
                                        </form>
                                    </td>
                                </tr>
                            ) : (
                                <tr key={p.id}>
                                    <td><div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><HardHat size={16} color="var(--orange-400)" /> <span style={{ fontWeight: 600 }}>{p.title}</span></div></td>
                                    <td>{p.profiles?.full_name || 'Unassigned'}</td>
                                    <td>
                                        <span style={{ padding: '4px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600, textTransform: 'uppercase', background: p.status === 'active' ? 'rgba(59,130,246,0.1)' : 'rgba(34,197,94,0.1)', color: p.status === 'active' ? '#60a5fa' : '#4ade80' }}>
                                            {p.status}
                                        </span>
                                    </td>
                                    <td>Step {p.current_step}</td>
                                    <td>
                                        <div style={{ display: 'flex', gap: 8 }}>
                                            <button className="btn btn-secondary btn-sm" onClick={() => startEdit(p)}><Edit2 size={14} /></button>
                                            <button className="btn btn-secondary btn-sm" onClick={() => handleDelete(p.id)} style={{ color: '#f87171' }}><Trash2 size={14} /></button>
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

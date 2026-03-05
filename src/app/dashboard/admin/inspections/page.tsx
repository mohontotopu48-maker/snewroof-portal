'use client';

import { useState, useEffect } from 'react';
import { getAdminInspectionsAll, deleteAdminInspection, updateAdminInspection, getAdminProfiles } from '@/app/actions';
import { CalendarCheck, CheckCircle2, AlertCircle, Trash2, Edit2, ExternalLink } from 'lucide-react';

export default function AdminInspectionsPage() {
    const [inspections, setInspections] = useState<any[]>([]);
    const [profiles, setProfiles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState<{ type: 'success' | 'error', msg: string } | null>(null);

    const [editingId, setEditingId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState<any>({});

    const fetchData = async () => {
        try {
            const [insData, profData] = await Promise.all([getAdminInspectionsAll(), getAdminProfiles()]);
            setInspections(insData);
            setProfiles(profData);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingId) return;
        try {
            await updateAdminInspection(editingId, editForm);
            setStatus({ type: 'success', msg: 'Inspection updated successfully.' });
            setEditingId(null);
            fetchData();
        } catch (err: any) {
            setStatus({ type: 'error', msg: err.message });
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this inspection request?')) return;
        try {
            await deleteAdminInspection(id);
            fetchData();
        } catch (err: any) {
            setStatus({ type: 'error', msg: err.message });
        }
    };

    const startEdit = (ins: any) => {
        setEditingId(ins.id);
        setEditForm({
            user_id: ins.user_id,
            status: ins.status,
            preferred_date: ins.preferred_date || '',
            name: ins.name,
            address: ins.address,
            property_type: ins.property_type
        });
    };

    return (
        <div className="animate-fade">
            <div className="page-header" style={{ marginBottom: 20 }}>
                <h2>Manage Inspections (Legacy DB & Calendly)</h2>
                <p>View incoming requests or manage automated scheduling.</p>
            </div>

            {status && (
                <div style={{ marginBottom: 24, padding: '12px 16px', borderRadius: 8, background: status.type === 'success' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)', color: status.type === 'success' ? 'var(--success)' : 'var(--error)', display: 'flex', alignItems: 'center', gap: 10 }}>
                    {status.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                    {status.msg}
                </div>
            )}

            <div className="card" style={{ marginBottom: 32, background: 'rgba(59,130,246,0.05)', borderColor: 'rgba(59,130,246,0.2)' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#60a5fa' }}><CalendarCheck size={20} /> Calendly Integration</h3>
                <p style={{ marginTop: 8, marginBottom: 16 }}>Customers now book their inspections via Calendly directly on their portal. You can view all confirmed appointments and availability in your Calendly dashboard.</p>
                <a href="https://calendly.com/info-vsualdm/30min" target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ display: 'inline-flex', background: '#3b82f6', color: 'white' }}>
                    Open Calendly Dashboard <ExternalLink size={16} />
                </a>
            </div>

            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div className="table-wrapper">
                    <table>
                        <thead>
                            <tr>
                                <th>Client Details</th>
                                <th>Property</th>
                                <th>Preferred Time</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={5} style={{ textAlign: 'center', padding: 24 }}>Loading...</td></tr>
                            ) : inspections.length === 0 ? (
                                <tr><td colSpan={5} style={{ textAlign: 'center', padding: 24, color: 'var(--slate-500)' }}>No database inspection requests found.</td></tr>
                            ) : inspections.map(ins => editingId === ins.id ? (
                                <tr key={ins.id}>
                                    <td colSpan={5}>
                                        <form onSubmit={handleUpdate} style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center', padding: 8 }}>
                                            <input type="text" className="form-input" value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} placeholder="Name" style={{ width: 140 }} />
                                            <input type="text" className="form-input" value={editForm.address} onChange={e => setEditForm({ ...editForm, address: e.target.value })} placeholder="Address" style={{ flex: 1 }} />
                                            <select className="form-input" value={editForm.user_id || ''} onChange={e => setEditForm({ ...editForm, user_id: e.target.value || null })} style={{ width: 150 }}>
                                                <option value="">Unassigned</option>
                                                {profiles.map(prof => <option key={prof.id} value={prof.id}>{prof.full_name}</option>)}
                                            </select>
                                            <input type="date" className="form-input" value={editForm.preferred_date} onChange={e => setEditForm({ ...editForm, preferred_date: e.target.value })} style={{ width: 140 }} />
                                            <select className="form-input" value={editForm.status} onChange={e => setEditForm({ ...editForm, status: e.target.value })} style={{ width: 120 }}>
                                                <option value="pending">Pending</option>
                                                <option value="scheduled">Scheduled</option>
                                                <option value="completed">Completed</option>
                                                <option value="cancelled">Cancelled</option>
                                            </select>
                                            <button type="submit" className="btn btn-primary btn-sm">Save</button>
                                            <button type="button" className="btn btn-secondary btn-sm" onClick={() => setEditingId(null)}>Cancel</button>
                                        </form>
                                    </td>
                                </tr>
                            ) : (
                                <tr key={ins.id}>
                                    <td>
                                        <div style={{ fontWeight: 600 }}>{ins.name}</div>
                                        <div style={{ fontSize: 11, color: 'var(--slate-400)' }}>{ins.email || 'No email provided'}</div>
                                        {ins.profiles?.full_name && <div style={{ fontSize: 10, marginTop: 4, color: 'var(--orange-400)' }}>Linked: {ins.profiles.full_name}</div>}
                                    </td>
                                    <td>
                                        <div style={{ fontSize: 13 }}>{ins.address}</div>
                                        <div style={{ fontSize: 11, color: 'var(--slate-400)', textTransform: 'capitalize' }}>{ins.property_type}</div>
                                    </td>
                                    <td>
                                        <div style={{ fontWeight: 500 }}>{ins.preferred_date || 'Not specified'}</div>
                                    </td>
                                    <td>
                                        <span style={{ padding: '4px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600, textTransform: 'uppercase', background: ins.status === 'scheduled' ? 'rgba(59,130,246,0.1)' : ins.status === 'completed' ? 'rgba(34,197,94,0.1)' : ins.status === 'cancelled' ? 'rgba(239,68,68,0.1)' : 'rgba(249,115,22,0.1)', color: ins.status === 'scheduled' ? '#60a5fa' : ins.status === 'completed' ? '#4ade80' : ins.status === 'cancelled' ? '#f87171' : 'var(--orange-400)' }}>
                                            {ins.status}
                                        </span>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', gap: 8 }}>
                                            <button className="btn btn-secondary btn-sm" onClick={() => startEdit(ins)}><Edit2 size={14} /></button>
                                            <button className="btn btn-secondary btn-sm" onClick={() => handleDelete(ins.id)} style={{ color: '#f87171' }}><Trash2 size={14} /></button>
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

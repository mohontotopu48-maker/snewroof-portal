/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import { getResources, createResource, deleteResource } from '@/app/actions';
import { Plus, Trash2, FolderOpen, CheckCircle2, AlertCircle } from 'lucide-react';

export default function AdminResourcesPage() {
    const [resources, setResources] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [status, setStatus] = useState<{ type: 'success' | 'error', msg: string } | null>(null);

    const fetchResources = async () => {
        try {
            const data = await getResources();
            setResources(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchResources();
    }, []);

    const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setUploading(true);
        setStatus(null);

        try {
            const formData = new FormData(e.currentTarget);
            await createResource(formData);
            setStatus({ type: 'success', msg: 'Resource added successfully!' });
            (e.target as HTMLFormElement).reset();
            await fetchResources();
        } catch (err: unknown) {
            console.error(err);
            setStatus({ type: 'error', msg: err instanceof Error ? err.message : 'Failed to create resource.' });
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this resource?')) return;
        try {
            await deleteResource(id);
            await fetchResources();
        } catch (err) {
            console.error(err);
            alert('Failed to delete resource');
        }
    };

    return (
        <div className="animate-fade">
            <div className="page-header">
                <h2>Manage Resources</h2>
                <p>Add important text updates or Drive links to be displayed on every Customer Portal.</p>
            </div>

            <div className="grid-2" style={{ alignItems: 'start' }}>
                <div className="card">
                    <div className="section-header">
                        <h3>Add New Resource</h3>
                    </div>

                    <form onSubmit={handleCreate} style={{ display: 'grid', gap: 24 }}>
                        <div className="form-group">
                            <label className="form-label">Title</label>
                            <input type="text" name="title" className="form-input" placeholder="e.g. Roof Material Choices 2026" required />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Text Description</label>
                            <textarea name="description" className="form-input" placeholder="Explain the resource..." style={{ minHeight: 100, padding: '12px 14px' }} />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Google Drive Link (Optional)</label>
                            <div style={{ position: 'relative' }}>
                                <FolderOpen size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--slate-500)' }} />
                                <input type="url" name="driveLink" className="form-input" placeholder="https://drive.google.com/..." style={{ paddingLeft: 44 }} />
                            </div>
                        </div>

                        {status && (
                            <div style={{
                                padding: '12px 16px', borderRadius: 8,
                                background: status.type === 'success' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                                color: status.type === 'success' ? 'var(--success)' : 'var(--error)',
                                fontSize: 14, display: 'flex', alignItems: 'center', gap: 10
                            }}>
                                {status.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                                {status.msg}
                            </div>
                        )}

                        <button type="submit" className="btn btn-primary btn-lg" disabled={uploading}>
                            {uploading ? 'Adding Resource...' : <><Plus size={20} /> Add to Customer Portal</>}
                        </button>
                    </form>
                </div>

                <div style={{ display: 'grid', gap: 20 }}>
                    <h3 style={{ marginBottom: 4, color: 'white', fontSize: 18, fontWeight: 600 }}>Active Resources</h3>
                    {loading ? (
                        <div style={{ color: 'var(--slate-400)', fontSize: 14 }}>Loading...</div>
                    ) : resources.length === 0 ? (
                        <div style={{ color: 'var(--slate-400)', fontSize: 14, background: 'rgba(255,255,255,0.02)', padding: 24, borderRadius: 12, textAlign: 'center' }}>
                            No resources created yet. Add one to show on customer portals.
                        </div>
                    ) : (
                        resources.map(r => (
                            <div key={r.id} className="card" style={{ padding: 20, position: 'relative' }}>
                                <button
                                    onClick={() => handleDelete(r.id)}
                                    type="button"
                                    style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--slate-500)' }}
                                    title="Delete Resource"
                                >
                                    <Trash2 size={18} />
                                </button>
                                <h4 style={{ color: 'white', fontSize: 15, marginBottom: 8, paddingRight: 24 }}>{r.title}</h4>
                                {r.description && <p style={{ color: 'var(--slate-400)', fontSize: 13, marginBottom: 12 }}>{r.description}</p>}
                                {r.drive_link && (
                                    <a href={r.drive_link} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--orange-400)', textDecoration: 'none', fontWeight: 500 }}>
                                        <FolderOpen size={14} /> View Drive Link
                                    </a>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}

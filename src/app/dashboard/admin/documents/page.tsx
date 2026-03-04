'use client';

import { useState, useEffect } from 'react';
import { Upload, File, FileText, ImageIcon, User, HardHat, Send, CheckCircle2, AlertCircle, Search } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { getAdminProfiles, getAdminProjects, uploadAdminDocument } from '@/app/actions';

interface Profile {
    id: string;
    full_name: string | null;
    role: string;
}

interface Project {
    id: string;
    title: string;
    user_id: string | null;
}

export default function AdminDocumentsPage() {
    const { isAdmin } = useAuth();
    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [selectedUser, setSelectedUser] = useState<string>('');
    const [selectedProject, setSelectedProject] = useState<string>('');
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [status, setStatus] = useState<{ type: 'success' | 'error', msg: string } | null>(null);

    useEffect(() => {
        if (!isAdmin) return;

        const fetchData = async () => {
            const profs = await getAdminProfiles();
            const projs = await getAdminProjects();
            if (profs) setProfiles(profs);
            if (projs) setProjects(projs);
        };

        fetchData();
    }, [isAdmin]);

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file || !selectedUser) {
            setStatus({ type: 'error', msg: 'Please select a file and a customer.' });
            return;
        }

        setUploading(true);
        setStatus(null);

        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('userId', selectedUser);
            formData.append('projectId', selectedProject);

            await uploadAdminDocument(formData);

            setStatus({ type: 'success', msg: 'File transferred successfully to customer portal!' });
            setFile(null);
            setSelectedProject('');
            // Reset file input
            const fileInput = document.getElementById('file-upload') as HTMLInputElement;
            if (fileInput) fileInput.value = '';

        } catch (err: unknown) {
            console.error(err);
            setStatus({ type: 'error', msg: err instanceof Error ? err.message : 'Failed to upload document.' });
        } finally {
            setUploading(false);
        }
    };

    if (!isAdmin) {
        return (
            <div className="card" style={{ textAlign: 'center', padding: 48, margin: '100px auto', maxWidth: 400 }}>
                <AlertCircle size={48} color="var(--error)" style={{ marginBottom: 16 }} />
                <h3>Access Denied</h3>
                <p style={{ color: 'var(--slate-400)' }}>This area is reserved for Master Admins and Project Managers.</p>
            </div>
        );
    }

    return (
        <div className="animate-fade">
            <div className="page-header">
                <h2>Master Admin Portal</h2>
                <p>Upload and transfer technical documents or site photos directly to customer profiles.</p>
            </div>

            <div className="grid-2" style={{ alignItems: 'start' }}>
                <div className="card">
                    <div className="section-header">
                        <h3>Transfer New Document</h3>
                    </div>

                    <form onSubmit={handleUpload} style={{ display: 'grid', gap: 24 }}>
                        <div className="form-group">
                            <label className="form-label">Select Customer</label>
                            <div style={{ position: 'relative' }}>
                                <User size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--slate-500)' }} />
                                <select
                                    className="form-input"
                                    style={{ paddingLeft: 44 }}
                                    value={selectedUser}
                                    onChange={(e) => {
                                        setSelectedUser(e.target.value);
                                        setSelectedProject('');
                                    }}
                                    required
                                >
                                    <option value="">Choose a customer...</option>
                                    {profiles.map(p => (
                                        <option key={p.id} value={p.id}>{p.full_name || 'Unnamed User'}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Link to Project (Optional)</label>
                            <div style={{ position: 'relative' }}>
                                <HardHat size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--slate-500)' }} />
                                <select
                                    className="form-input"
                                    style={{ paddingLeft: 44 }}
                                    value={selectedProject}
                                    onChange={(e) => setSelectedProject(e.target.value)}
                                    disabled={!selectedUser}
                                >
                                    <option value="">Not linked to a specific project</option>
                                    {projects.filter(p => p.user_id === selectedUser).map(p => (
                                        <option key={p.id} value={p.id}>{p.title}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">File Selection</label>
                            <div style={{
                                border: '2px dashed var(--border)',
                                borderRadius: 12,
                                padding: 32,
                                textAlign: 'center',
                                transition: 'var(--transition)',
                                cursor: 'pointer',
                                background: file ? 'rgba(249,115,22,0.05)' : 'transparent'
                            }} onClick={() => document.getElementById('file-upload')?.click()}>
                                <input
                                    type="file"
                                    id="file-upload"
                                    hidden
                                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                                />
                                {file ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                                        <div style={{ width: 48, height: 48, background: 'rgba(255,255,255,0.05)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--orange-400)' }}>
                                            {file.type.startsWith('image/') ? <ImageIcon size={24} /> : <FileText size={24} />}
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 600, color: 'white' }}>{file.name}</div>
                                            <div style={{ fontSize: 12, color: 'var(--slate-500)' }}>{(file.size / 1024 / 1024).toFixed(2)} MB</div>
                                        </div>
                                        <button type="button" className="btn btn-secondary btn-sm" onClick={(e) => { e.stopPropagation(); setFile(null); }}>Remove</button>
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                                        <div style={{ width: 48, height: 48, background: 'rgba(255,255,255,0.03)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--slate-600)' }}>
                                            <Upload size={24} />
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 600, color: 'white' }}>Drop files or click to upload</div>
                                            <div style={{ fontSize: 12, color: 'var(--slate-500)' }}>Images, PDFs, or site reports up to 50MB</div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {status && (
                            <div style={{
                                padding: '12px 16px',
                                borderRadius: 8,
                                background: status.type === 'success' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                                color: status.type === 'success' ? 'var(--success)' : 'var(--error)',
                                fontSize: 14,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 10
                            }}>
                                {status.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                                {status.msg}
                            </div>
                        )}

                        <button
                            type="submit"
                            className="btn btn-primary btn-lg"
                            disabled={uploading || !file || !selectedUser}
                            style={{ width: '100%', justifyContent: 'center' }}
                        >
                            {uploading ? 'Processing Transfer...' : (
                                <>
                                    <Send size={20} /> Transfer to Customer Portal
                                </>
                            )}
                        </button>
                    </form>
                </div>

                <div style={{ display: 'grid', gap: 20 }}>
                    <div className="card" style={{ background: 'rgba(59,130,246,0.05)', borderColor: 'rgba(59,130,246,0.2)' }}>
                        <h3 style={{ marginBottom: 16, color: '#60a5fa' }}>Transfer Logic</h3>
                        <p style={{ fontSize: 13, color: 'var(--slate-400)', marginBottom: 20 }}>
                            When you transfer a file, it becomes immediately visible in the customer&apos;s <strong>Documents</strong> lounge and linked <strong>Projects</strong> gallery.
                        </p>
                        <div style={{ display: 'grid', gap: 12 }}>
                            <div style={{ display: 'flex', gap: 12, alignItems: 'center', fontSize: 13 }}>
                                <CheckCircle2 size={16} color="var(--success)" /> Secure Public Link Generation
                            </div>
                            <div style={{ display: 'flex', gap: 12, alignItems: 'center', fontSize: 13 }}>
                                <CheckCircle2 size={16} color="var(--success)" /> Instant Push Notification (Email)
                            </div>
                            <div style={{ display: 'flex', gap: 12, alignItems: 'center', fontSize: 13 }}>
                                <CheckCircle2 size={16} color="var(--success)" /> PDF & Image Preview Support
                            </div>
                        </div>
                    </div>

                    <div className="card">
                        <h3 style={{ marginBottom: 20 }}>Quick Search</h3>
                        <div style={{ position: 'relative', marginBottom: 20 }}>
                            <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--slate-500)' }} />
                            <input type="text" className="form-input" placeholder="Search customers..." style={{ paddingLeft: 40 }} />
                        </div>
                        <div style={{ display: 'grid', gap: 8 }}>
                            {profiles.slice(0, 3).map(p => (
                                <div key={p.id} className="user-info" style={{ cursor: 'pointer', background: 'rgba(255,255,255,0.02)', padding: '8px 12px', borderRadius: 8 }}>
                                    <div className="avatar" style={{ width: 32, height: 32, fontSize: 12 }}>{p.full_name?.[0]}</div>
                                    <div style={{ flex: 1, fontSize: 13, color: 'white', fontWeight: 500 }}>{p.full_name}</div>
                                    <button className="btn btn-secondary btn-sm" onClick={() => setSelectedUser(p.id)}>Select</button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

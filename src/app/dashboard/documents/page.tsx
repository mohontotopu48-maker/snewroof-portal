'use client';

import { useState, useEffect, useMemo } from 'react';
import { FileText, ImageIcon, Download, Eye, HardHat, Search, Filter, X, ExternalLink, File as FileIcon } from 'lucide-react';

import { getDocuments } from '@/app/actions';

interface SharedDocument {
    id: string;
    document_id: string;
    created_at: string;
    documents: {
        id: string;
        name: string;
        url: string;
        mime_type: string;
        size: number;
    };
    projects?: {
        title: string;
    } | null;
}

export default function DocumentsPage() {
    const user = useMemo(() => ({ id: '00000000-0000-0000-0000-000000000001', email: 'customer@example.com', role: 'admin', name: 'Dummy User' }), []);
    const [docs, setDocs] = useState<SharedDocument[]>([]);
    const [loading, setLoading] = useState(true);
    const [previewDoc, setPreviewDoc] = useState<SharedDocument | null>(null);

    useEffect(() => {
        if (!user) return;

        const doFetchDocs = async () => {
            setLoading(true);
            try {
                const data = await getDocuments();
                setDocs(data as unknown as SharedDocument[]);
            } catch {
                // ignore
            } finally {
                setLoading(false);
            }
        };

        doFetchDocs();
    }, [user]);

    const formatSize = (bytes: number) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <div className="animate-fade">
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                    <h2>Document Lounge</h2>
                    <p>Access your technical reports, site photos, and legal documents shared by the Snewroof team.</p>
                </div>
            </div>

            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', gap: 16, alignItems: 'center' }}>
                    <div style={{ position: 'relative', flex: 1, maxWidth: 320 }}>
                        <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--slate-500)' }} />
                        <input type="text" className="form-input" placeholder="Search documents..." style={{ paddingLeft: 38 }} />
                    </div>
                    <button className="btn btn-secondary btn-sm">
                        <Filter size={14} /> Filter
                    </button>
                </div>

                {loading ? (
                    <div style={{ padding: 64, textAlign: 'center', color: 'var(--slate-500)' }}>
                        <div className="loader" style={{ margin: '0 auto 16px' }}></div>
                        Fetching your documents...
                    </div>
                ) : docs.length === 0 ? (
                    <div style={{ padding: 100, textAlign: 'center', color: 'var(--slate-500)' }}>
                        <FileText size={48} style={{ marginBottom: 16, opacity: 0.2 }} />
                        <p>No documents have been shared with you yet.</p>
                    </div>
                ) : (
                    <div className="table-wrapper">
                        <table>
                            <thead>
                                <tr>
                                    <th>Document Name</th>
                                    <th>Linked Project</th>
                                    <th>Shared Date</th>
                                    <th>Size</th>
                                    <th>Type</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {docs.map((item) => (
                                    <tr key={item.id} style={{ cursor: 'pointer' }} onClick={() => setPreviewDoc(item)}>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                                <div style={{
                                                    width: 36, height: 36, borderRadius: 8,
                                                    background: item.documents.mime_type.startsWith('image/') ? 'rgba(249,115,22,0.1)' : 'rgba(59,130,246,0.1)',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    color: item.documents.mime_type.startsWith('image/') ? 'var(--orange-400)' : '#60a5fa'
                                                }}>
                                                    {item.documents.mime_type.startsWith('image/') ? <ImageIcon size={18} /> : <FileText size={18} />}
                                                </div>
                                                <span style={{ fontWeight: 600, color: 'white' }}>{item.documents.name}</span>
                                            </div>
                                        </td>
                                        <td>
                                            {item.projects?.title ? (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
                                                    <HardHat size={14} style={{ color: 'var(--slate-500)' }} />
                                                    {item.projects.title}
                                                </div>
                                            ) : <span style={{ color: 'var(--slate-600)' }}>General</span>}
                                        </td>
                                        <td style={{ fontSize: 13 }}>{new Date(item.created_at).toLocaleDateString()}</td>
                                        <td style={{ fontSize: 13 }}>{formatSize(item.documents.size)}</td>
                                        <td>
                                            <span style={{
                                                fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
                                                letterSpacing: '0.05em', padding: '4px 8px', borderRadius: 4,
                                                background: 'rgba(255,255,255,0.05)', color: 'var(--slate-400)',
                                                border: '1px solid var(--border)'
                                            }}>
                                                {item.documents.mime_type.split('/')[1] || 'FILE'}
                                            </span>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', gap: 8 }}>
                                                <button className="btn btn-secondary btn-sm" title="Preview" onClick={(e) => { e.stopPropagation(); setPreviewDoc(item); }}>
                                                    <Eye size={14} />
                                                </button>
                                                <a
                                                    href={item.documents.url}
                                                    target="_blank"
                                                    className="btn btn-secondary btn-sm"
                                                    title="Download"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <Download size={14} />
                                                </a>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Preview Modal */}
            {previewDoc && (
                <div style={{
                    position: 'fixed', inset: 0, zIndex: 1000,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    padding: 40, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)'
                }}>
                    <div className="card animate-scale" style={{
                        width: '100%', maxWidth: 1000, maxHeight: '90vh',
                        padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column'
                    }}>
                        <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                <FileText size={20} color="var(--orange-400)" />
                                <div>
                                    <div style={{ fontWeight: 600, color: 'white' }}>{previewDoc.documents.name}</div>
                                    <div style={{ fontSize: 11, color: 'var(--slate-500)' }}>{previewDoc.projects?.title || 'General Document'}</div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: 12 }}>
                                <a href={previewDoc.documents.url} target="_blank" className="btn btn-secondary btn-sm">
                                    <ExternalLink size={14} /> Open Full
                                </a>
                                <button className="btn btn-secondary btn-sm" onClick={() => setPreviewDoc(null)}>
                                    <X size={14} />
                                </button>
                            </div>
                        </div>

                        <div style={{ flex: 1, overflowY: 'auto', background: '#0a0a0b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {previewDoc.documents.mime_type.startsWith('image/') ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                    src={previewDoc.documents.url}
                                    alt={previewDoc.documents.name}
                                    style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                                />
                            ) : previewDoc.documents.mime_type === 'application/pdf' ? (
                                <iframe
                                    src={`${previewDoc.documents.url}#toolbar=0`}
                                    style={{ width: '100%', height: '70vh', border: 'none' }}
                                />
                            ) : (
                                <div style={{ color: 'var(--slate-500)', textAlign: 'center', padding: 100 }}>
                                    <FileIcon size={64} style={{ marginBottom: 20, opacity: 0.2, margin: '0 auto' }} />
                                    <p>Preview not available for this file type.</p>
                                    <a href={previewDoc.documents.url} className="btn btn-primary" style={{ marginTop: 24 }}>
                                        Download to View
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

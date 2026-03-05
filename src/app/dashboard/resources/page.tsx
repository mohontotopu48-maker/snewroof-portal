/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import { getResources } from '@/app/actions';
import { FolderOpen, ExternalLink, Info } from 'lucide-react';

export default function CustomerResourcesPage() {
    const [resources, setResources] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
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
        fetchResources();
    }, []);

    return (
        <div className="animate-fade">
            <div className="page-header">
                <h2>Important Resources</h2>
                <p>Company announcements, material guides, and shared drive folders for your roofing project.</p>
            </div>

            <div style={{ display: 'grid', gap: 20, maxWidth: 800 }}>
                {loading ? (
                    <div style={{ color: 'var(--slate-400)', fontSize: 14 }}>Loading resources...</div>
                ) : resources.length === 0 ? (
                    <div style={{ color: 'var(--slate-400)', fontSize: 14, background: 'rgba(255,255,255,0.02)', padding: 32, borderRadius: 12, textAlign: 'center' }}>
                        <Info size={24} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
                        There are no announcements or resources posted at this time.
                    </div>
                ) : (
                    resources.map(r => (
                        <div key={r.id} className="card" style={{ padding: 24 }}>
                            <h3 style={{ color: 'white', fontSize: 18, marginBottom: 12, fontWeight: 600 }}>{r.title}</h3>
                            {r.description && (
                                <p style={{ color: 'var(--slate-300)', fontSize: 14, lineHeight: 1.6, marginBottom: 16 }}>
                                    {r.description}
                                </p>
                            )}
                            {r.drive_link && (
                                <div style={{ paddingTop: 16, borderTop: '1px solid var(--border)' }}>
                                    <a
                                        href={r.drive_link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn btn-secondary"
                                        style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 13 }}
                                    >
                                        <FolderOpen size={16} color="var(--orange-400)" />
                                        Open Drive Link
                                        <ExternalLink size={14} style={{ marginLeft: 4, opacity: 0.5 }} />
                                    </a>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

'use client';

import { useState, useEffect } from 'react';
import { HardHat, MapPin, Calendar, Clock, Image as ImageIcon, CheckCircle2, X, Eye, ExternalLink } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';


interface Project {
    id: string;
    title: string;
    current_step: number;
    status: string;
    start_date: string;
    end_date: string;
    address?: string; // We'll mock this if not in DB
}

interface SharedPhoto {
    id: string;
    documents: {
        id: string;
        name: string;
        url: string;
    };
}

import { getProjects, getSharedPhotos } from '@/app/actions';

export default function ProjectsPage() {
    const { user } = useAuth();
    const [projects, setProjects] = useState<Project[]>([]);
    const [photos, setPhotos] = useState<SharedPhoto[]>([]);
    const [loading, setLoading] = useState(true);
    const [previewPhoto, setPreviewPhoto] = useState<SharedPhoto | null>(null);

    useEffect(() => {
        if (!user) return;

        const fetchData = async () => {
            setLoading(true);
            try {
                const projData = await getProjects();
                const photoData = await getSharedPhotos();

                setProjects(projData as unknown as Project[]);
                setPhotos(photoData as unknown as SharedPhoto[]);
            } catch (err) {
                console.error("Error fetching projects data:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user]);

    if (loading) {
        return (
            <div style={{ padding: 100, textAlign: 'center', color: 'var(--slate-500)' }}>
                <div className="loader" style={{ margin: '0 auto 16px' }}></div>
                Loading your project data...
            </div>
        );
    }

    return (
        <div className="animate-fade">
            <div className="page-header">
                <h2>Your Projects</h2>
                <p>Track the progress and manage your active roofing projects.</p>
            </div>

            <div style={{ display: 'grid', gap: 24 }}>
                {projects.length === 0 ? (
                    <div className="card" style={{ padding: 64, textAlign: 'center', color: 'var(--slate-500)' }}>
                        <HardHat size={48} style={{ marginBottom: 16, opacity: 0.2 }} />
                        <p>No active projects found in your portal.</p>
                    </div>
                ) : (
                    projects.map((project) => (
                        <div key={project.id} className="card" style={{ padding: 0, overflow: 'hidden' }}>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                                    <div style={{
                                        width: 320, height: 240, position: 'relative',
                                        background: `url(https://images.unsplash.com/photo-1632759162403-ad888849b7cb?q=80&w=2000&auto=format&fit=crop) center/cover`
                                    }}>
                                        <div style={{
                                            position: 'absolute', top: 16, right: 16,
                                            padding: '6px 14px', borderRadius: 100,
                                            background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)',
                                            color: 'white', fontSize: 12, fontWeight: 700,
                                            display: 'flex', alignItems: 'center', gap: 6,
                                            border: '1px solid rgba(255,255,255,0.1)'
                                        }}>
                                            <div style={{
                                                width: 8, height: 8, borderRadius: '50%',
                                                background: project.status === 'completed' ? 'var(--success)' : 'var(--orange-500)',
                                                boxShadow: `0 0 8px ${project.status === 'completed' ? 'var(--success)' : 'var(--orange-500)'}`
                                            }} />
                                            {project.status.toUpperCase()}
                                        </div>
                                    </div>
                                    <div style={{ flex: 1, padding: 32, display: 'flex', flexDirection: 'column' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                                            <div>
                                                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--orange-400)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>
                                                    {project.id.slice(0, 8)} • Project
                                                </div>
                                                <h3 style={{ fontSize: 24, color: 'white' }}>{project.title}</h3>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--slate-400)', fontSize: 14, marginTop: 4 }}>
                                                    <MapPin size={14} /> Service Address on File
                                                </div>
                                            </div>
                                            <button className="btn btn-secondary">
                                                View Details
                                            </button>
                                        </div>

                                        <div style={{ marginBottom: 28 }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                                                <span style={{ fontSize: 14, color: 'var(--slate-300)', fontWeight: 500 }}>
                                                    Progress Stage: <span style={{ color: 'white' }}>Step {project.current_step}</span>
                                                </span>
                                                <span style={{ fontSize: 14, color: 'var(--orange-400)', fontWeight: 700 }}>
                                                    {Math.min(project.current_step * 20, 100)}%
                                                </span>
                                            </div>
                                            <div className="progress-bar-track">
                                                <div className="progress-bar-fill" style={{ width: `${Math.min(project.current_step * 20, 100)}%` }} />
                                            </div>
                                        </div>

                                        <div style={{ display: 'flex', gap: 40, borderTop: '1px solid var(--border)', paddingTop: 24 }}>
                                            <div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--slate-500)', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>
                                                    <Calendar size={12} /> Start Date
                                                </div>
                                                <div style={{ fontSize: 14, color: 'white', fontWeight: 600 }}>{project.start_date || 'TBD'}</div>
                                            </div>
                                            <div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--slate-500)', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>
                                                    <Clock size={12} /> Target End
                                                </div>
                                                <div style={{ fontSize: 14, color: 'white', fontWeight: 600 }}>{project.end_date || 'TBD'}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <div style={{ marginTop: 32, display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>
                <div className="card">
                    <div className="section-header">
                        <h3>Project Photos</h3>
                        <button className="btn btn-secondary btn-sm" onClick={() => window.location.href = '/dashboard/documents'}>View All Documents</button>
                    </div>

                    {photos.length === 0 ? (
                        <div style={{ padding: '40px 0', textAlign: 'center', border: '1px dashed var(--border)', borderRadius: 12 }}>
                            <ImageIcon size={32} style={{ color: 'var(--slate-700)', marginBottom: 8 }} />
                            <p style={{ fontSize: 13, color: 'var(--slate-500)' }}>No site photos uploaded yet.</p>
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 12 }}>
                            {photos.slice(0, 8).map(photo => (
                                <div
                                    key={photo.id}
                                    style={{
                                        aspectRatio: '1', borderRadius: 8, overflow: 'hidden',
                                        background: `url(${photo.documents.url}) center/cover`,
                                        border: '1px solid var(--border)',
                                        cursor: 'pointer', transition: 'var(--transition)',
                                        position: 'relative'
                                    }}
                                    className="hover-scale"
                                    onClick={() => setPreviewPhoto(photo)}
                                >
                                    <div className="photo-overlay" style={{
                                        position: 'absolute', inset: 0,
                                        background: 'rgba(0,0,0,0.3)', opacity: 0,
                                        transition: 'opacity 0.2s',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                                    }}>
                                        <Eye size={20} color="white" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    <p style={{ marginTop: 16, fontSize: 13, color: 'var(--slate-500)', textAlign: 'center' }}>
                        Site images are updated directly by our on-site team and project managers.
                    </p>
                </div>

                <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', gap: 16 }}>
                    <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(249,115,22,0.1)', color: 'var(--orange-400)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <CheckCircle2 size={28} />
                    </div>
                    <div>
                        <h4 style={{ color: 'white' }}>Quality Guaranteed</h4>
                        <p style={{ fontSize: 13, marginTop: 4 }}>Every step of your roof replacement is documented and verified for quality assurance.</p>
                    </div>
                </div>
            </div>

            {/* Photo Preview Modal */}
            {previewPhoto && (
                <div style={{
                    position: 'fixed', inset: 0, zIndex: 1000,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    padding: 40, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)'
                }}>
                    <div className="card animate-scale" style={{
                        width: '100%', maxWidth: 900, maxHeight: '85vh',
                        padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column',
                        borderColor: 'rgba(255,255,255,0.1)'
                    }}>
                        <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ fontWeight: 600, color: 'white' }}>{previewPhoto.documents.name}</div>
                            <div style={{ display: 'flex', gap: 12 }}>
                                <a href={previewPhoto.documents.url} target="_blank" className="btn btn-secondary btn-sm">
                                    <ExternalLink size={14} /> Download
                                </a>
                                <button className="btn btn-secondary btn-sm" onClick={() => setPreviewPhoto(null)}>
                                    <X size={14} />
                                </button>
                            </div>
                        </div>
                        <div style={{ flex: 1, overflow: 'hidden', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={previewPhoto.documents.url}
                                alt="Site Photo"
                                style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

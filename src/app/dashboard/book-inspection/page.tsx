'use client';

import { Calendar, ShieldCheck, ArrowRight, ExternalLink } from 'lucide-react';

export default function BookInspectionPage() {
    return (
        <div className="animate-fade" style={{ height: 'calc(100vh - var(--topbar-h) - 40px)', display: 'flex', flexDirection: 'column' }}>
            <div className="page-header" style={{ marginBottom: 20 }}>
                <h2>Book an Inspection</h2>
                <p>Schedule a professional assessment of your roofing needs directly with our team.</p>
            </div>

            <div className="grid-2" style={{ flex: 1, minHeight: 0 }}>
                {/* Calendly Embed */}
                <div className="card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '100%' }}>
                    <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border)', background: 'rgba(255,255,255,0.02)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
                            <Calendar size={18} color="var(--orange-400)" />
                            Select a Time
                        </h3>
                        <a href="https://calendly.com/info-vsualdm/30min" target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm">
                            Open in New Tab <ExternalLink size={14} />
                        </a>
                    </div>
                    <div style={{ flex: 1, background: 'white' }}>
                        <iframe
                            src="https://calendly.com/info-vsualdm/30min"
                            width="100%"
                            height="100%"
                            frameBorder="0"
                            title="Schedule an Inspection"
                        />
                    </div>
                </div>

                {/* Info Card */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    <div className="card" style={{ background: 'rgba(249,115,22,0.05)', borderColor: 'rgba(249,115,22,0.2)' }}>
                        <h3 style={{ marginBottom: 16, color: 'var(--orange-400)', display: 'flex', alignItems: 'center', gap: 10 }}>
                            <ShieldCheck size={20} /> What to Expect?
                        </h3>
                        <ul style={{ listStyle: 'none', display: 'grid', gap: 20, padding: 0, margin: 0 }}>
                            <li style={{ display: 'flex', gap: 16, fontSize: 14 }}>
                                <div style={{ color: 'var(--orange-500)', fontWeight: 'bold', fontSize: 16 }}>01</div>
                                <div>
                                    <strong style={{ color: 'white', display: 'block', marginBottom: 4 }}>Pick a Slot</strong>
                                    Choose an available 30-minute block that works for your schedule using the calendar.
                                </div>
                            </li>
                            <li style={{ display: 'flex', gap: 16, fontSize: 14 }}>
                                <div style={{ color: 'var(--orange-500)', fontWeight: 'bold', fontSize: 16 }}>02</div>
                                <div>
                                    <strong style={{ color: 'white', display: 'block', marginBottom: 4 }}>Thorough Assessment</strong>
                                    We use drones and high-res imaging for deep roof inspections during the visit.
                                </div>
                            </li>
                            <li style={{ display: 'flex', gap: 16, fontSize: 14 }}>
                                <div style={{ color: 'var(--orange-500)', fontWeight: 'bold', fontSize: 16 }}>03</div>
                                <div>
                                    <strong style={{ color: 'white', display: 'block', marginBottom: 4 }}>Detailed Report</strong>
                                    You'll receive a full digital report with photos and recommendations in your Documents lounge.
                                </div>
                            </li>
                        </ul>
                    </div>

                    <div className="card">
                        <h3 style={{ marginBottom: 16 }}>Need urgent help?</h3>
                        <p style={{ fontSize: 14, marginBottom: 20, color: 'var(--slate-400)' }}>For emergency leak repairs or storm damage, please call our 24/7 hotline directly:</p>
                        <a href="tel:1800SNEWROOF" className="btn btn-outline" style={{ width: '100%', justifyContent: 'center' }}>
                            Call (800) SNEW-ROOF
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}

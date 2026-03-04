'use client';

import { useAuth } from '@/lib/auth-context';
import {
    HardHat, FileText,
    Calendar, CheckCircle, Clock
} from 'lucide-react';

export default function DashboardPage() {
    const { user } = useAuth();

    return (
        <div>
            <div className="page-header">
                <h2>Welcome back, {user?.name || 'Customer'}</h2>
                <p>Here&apos;s what&apos;s happening with your roofing projects today.</p>
            </div>

            <div className="grid-4">
                <div className="card stat-card">
                    <div className="stat-icon stat-icon-orange">
                        <HardHat size={20} />
                    </div>
                    <div>
                        <div className="stat-value">2</div>
                        <div className="stat-label">Active Projects</div>
                    </div>
                </div>
                <div className="card stat-card">
                    <div className="stat-icon stat-icon-blue">
                        <FileText size={20} />
                    </div>
                    <div>
                        <div className="stat-value">1</div>
                        <div className="stat-label">Pending Quotes</div>
                    </div>
                </div>
                <div className="card stat-card">
                    <div className="stat-icon stat-icon-green">
                        <CheckCircle size={20} />
                    </div>
                    <div>
                        <div className="stat-value">12</div>
                        <div className="stat-label">Completed Jobs</div>
                    </div>
                </div>
                <div className="card stat-card">
                    <div className="stat-icon stat-icon-purple">
                        <Calendar size={20} />
                    </div>
                    <div>
                        <div className="stat-value">Mar 15</div>
                        <div className="stat-label">Next Inspection</div>
                    </div>
                </div>
            </div>

            <div className="grid-2" style={{ marginTop: 24 }}>
                <div className="card">
                    <div className="section-header">
                        <h3>Recent Activity</h3>
                    </div>
                    <div className="timeline">
                        <div className="timeline-item">
                            <div className="timeline-dot completed">
                                <CheckCircle size={16} />
                            </div>
                            <div className="timeline-content">
                                <h4 style={{ color: 'white' }}>Quote Approved</h4>
                                <p style={{ fontSize: 13 }}>Main Street Residential Project</p>
                                <span style={{ fontSize: 11, color: 'var(--slate-500)' }}>2 hours ago</span>
                            </div>
                            <div className="timeline-line completed" />
                        </div>
                        <div className="timeline-item">
                            <div className="timeline-dot active">
                                <Clock size={16} />
                            </div>
                            <div className="timeline-content">
                                <h4 style={{ color: 'white' }}>Inspection Scheduled</h4>
                                <p style={{ fontSize: 13 }}>Roof leak assessment at 452 Oak Ave</p>
                                <span style={{ fontSize: 11, color: 'var(--slate-500)' }}>Yesterday</span>
                            </div>
                            <div className="timeline-line" />
                        </div>
                        <div className="timeline-item">
                            <div className="timeline-dot pending">
                                <FileText size={16} />
                            </div>
                            <div className="timeline-content">
                                <h4 style={{ color: 'white' }}>Invoice Paid</h4>
                                <p style={{ fontSize: 13 }}>Final payment for Garage Roof</p>
                                <span style={{ fontSize: 11, color: 'var(--slate-500)' }}>3 days ago</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="section-header">
                        <h3>Quick Actions</h3>
                    </div>
                    <div style={{ display: 'grid', gap: 12 }}>
                        <button className="btn btn-secondary" style={{ justifyContent: 'flex-start', padding: 16 }}>
                            <Calendar size={18} style={{ color: 'var(--orange-400)' }} />
                            Schedule New Inspection
                        </button>
                        <button className="btn btn-secondary" style={{ justifyContent: 'flex-start', padding: 16 }}>
                            <FileText size={18} style={{ color: 'var(--orange-400)' }} />
                            Request a Quote
                        </button>
                        <button className="btn btn-secondary" style={{ justifyContent: 'flex-start', padding: 16 }}>
                            <HardHat size={18} style={{ color: 'var(--orange-400)' }} />
                            View Current Projects
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

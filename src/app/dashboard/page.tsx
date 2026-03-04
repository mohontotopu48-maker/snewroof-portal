'use client';

import { useState, useEffect } from 'react';

import {
    HardHat, FileText,
    Calendar, CheckCircle, Clock, Loader2
} from 'lucide-react';


interface DashboardStats {
    activeProjects: number;
    pendingQuotes: number;
    completedJobs: number;
    nextInspection: string;
}

interface Activity {
    id: string;
    type: 'project' | 'quote' | 'invoice' | 'inspection';
    title: string;
    description: string;
    time: string;
    status: 'completed' | 'active' | 'pending';
}

import { getDashboardStats } from '@/app/actions';

export default function DashboardPage() {
    const user = { id: '00000000-0000-0000-0000-000000000001', email: 'customer@example.com', role: 'admin', name: 'Dummy User' };
    const [stats, setStats] = useState<DashboardStats>({
        activeProjects: 0,
        pendingQuotes: 0,
        completedJobs: 0,
        nextInspection: 'TBD'
    });
    const [activities, setActivities] = useState<Activity[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user?.id) {
            doFetchDashboardData();
        }
    }, [user?.id]);

    const doFetchDashboardData = async () => {
        setLoading(true);
        try {
            // 1. Fetch Stats
            const data = await getDashboardStats();

            const activeProjects = data.activeProjects;
            const completedJobs = data.completedJobs;
            const pendingQuotes = data.pendingQuotes;

            const upcomingInspection = data.inspections.find(i => i.preferred_date && new Date(i.preferred_date) >= new Date())?.preferred_date;
            const nextInspection = upcomingInspection ? new Date(upcomingInspection).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'TBD';

            setStats({ activeProjects, pendingQuotes, completedJobs, nextInspection });

            // 2. Fetch Recent Activity (Combining recent records)
            // For simplicity, we'll just mock activity based on real data counts for now, 
            // or fetch actual recent records if we want more detail.
            const activityList: Activity[] = [];

            if (activeProjects > 0) {
                activityList.push({
                    id: 'proj-1',
                    type: 'project',
                    title: 'Project Update',
                    description: `You have ${activeProjects} active roofing project(s).`,
                    time: 'Recent',
                    status: 'active'
                });
            }
            if (pendingQuotes > 0) {
                activityList.push({
                    id: 'quote-1',
                    type: 'quote',
                    title: 'Pending Quote',
                    description: `You have ${pendingQuotes} estimate(s) awaiting your review.`,
                    time: 'Action Required',
                    status: 'pending'
                });
            }
            if (upcomingInspection) {
                activityList.push({
                    id: 'insp-1',
                    type: 'inspection',
                    title: 'Inspection Scheduled',
                    description: `Your roof assessment is set for ${nextInspection}.`,
                    time: 'Upcoming',
                    status: 'active'
                });
            }

            setActivities(activityList);

        } catch (err) {
            console.error('Error fetching dashboard data:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '400px' }}>
                <Loader2 className="animate-spin" size={32} style={{ color: 'var(--orange-500)' }} />
            </div>
        );
    }

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
                        <div className="stat-value">{stats.activeProjects}</div>
                        <div className="stat-label">Active Projects</div>
                    </div>
                </div>
                <div className="card stat-card">
                    <div className="stat-icon stat-icon-blue">
                        <FileText size={20} />
                    </div>
                    <div>
                        <div className="stat-value">{stats.pendingQuotes}</div>
                        <div className="stat-label">Pending Quotes</div>
                    </div>
                </div>
                <div className="card stat-card">
                    <div className="stat-icon stat-icon-green">
                        <CheckCircle size={20} />
                    </div>
                    <div>
                        <div className="stat-value">{stats.completedJobs}</div>
                        <div className="stat-label">Completed Jobs</div>
                    </div>
                </div>
                <div className="card stat-card">
                    <div className="stat-icon stat-icon-purple">
                        <Calendar size={20} />
                    </div>
                    <div>
                        <div className="stat-value">{stats.nextInspection}</div>
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
                        {activities.length === 0 ? (
                            <p style={{ color: 'var(--slate-500)', fontSize: 13, textAlign: 'center', padding: '20px 0' }}>No recent activity to show.</p>
                        ) : activities.map((activity, idx) => (
                            <div key={activity.id} className="timeline-item">
                                <div className={`timeline-dot ${activity.status}`}>
                                    {activity.type === 'project' ? <HardHat size={16} /> :
                                        activity.type === 'quote' ? <FileText size={16} /> :
                                            activity.type === 'inspection' ? <Calendar size={16} /> :
                                                <Clock size={16} />}
                                </div>
                                <div className="timeline-content">
                                    <h4 style={{ color: 'white' }}>{activity.title}</h4>
                                    <p style={{ fontSize: 13 }}>{activity.description}</p>
                                    <span style={{ fontSize: 11, color: 'var(--slate-500)' }}>{activity.time}</span>
                                </div>
                                {idx < activities.length - 1 && <div className={`timeline-line ${activity.status}`} />}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="card">
                    <div className="section-header">
                        <h3>Quick Actions</h3>
                    </div>
                    <div style={{ display: 'grid', gap: 12 }}>
                        <button className="btn btn-secondary" style={{ justifyContent: 'flex-start', padding: 16 }} onClick={() => window.location.href = '/dashboard/book-inspection'}>
                            <Calendar size={18} style={{ color: 'var(--orange-400)' }} />
                            Schedule New Inspection
                        </button>
                        <button className="btn btn-secondary" style={{ justifyContent: 'flex-start', padding: 16 }} onClick={() => window.location.href = '/dashboard/quotes'}>
                            <FileText size={18} style={{ color: 'var(--orange-400)' }} />
                            Request a Quote
                        </button>
                        <button className="btn btn-secondary" style={{ justifyContent: 'flex-start', padding: 16 }} onClick={() => window.location.href = '/dashboard/projects'}>
                            <HardHat size={18} style={{ color: 'var(--orange-400)' }} />
                            View Current Projects
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

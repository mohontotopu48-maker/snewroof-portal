'use client';

import { useState, useEffect } from 'react';
import { Receipt, Download, CreditCard, Clock, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

interface Invoice {
    id: string;
    amount: number;
    due_date: string;
    paid_at: string | null;
    status: string;
    notes: string;
    project_id: string;
    projects?: {
        title: string;
    };
}

import { getInvoices } from '@/app/actions';

export default function InvoicesPage() {
    const { user } = useAuth();
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ outstanding: 0, paid: 0, nextDue: 'None' });

    useEffect(() => {
        if (user?.id) {
            fetchInvoices();
        }
    }, [user?.id]);

    const fetchInvoices = async () => {
        setLoading(true);
        try {
            const data = await getInvoices();
            const invs = data as unknown as Invoice[];
            setInvoices(invs);

            // Calculate stats
            let outstanding = 0;
            let paid = 0;
            let earliestDue: Date | null = null;

            invs.forEach(inv => {
                const amt = Number(inv.amount);
                if (inv.status === 'paid') {
                    paid += amt;
                } else {
                    outstanding += amt;
                    const dueDate = new Date(inv.due_date);
                    if (!earliestDue || dueDate < earliestDue) {
                        earliestDue = dueDate;
                    }
                }
            });

            setStats({
                outstanding,
                paid,
                nextDue: earliestDue ? (earliestDue as Date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'None'
            });

        } catch (err) {
            console.error('Error fetching invoices:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="animate-fade">
            <div className="page-header">
                <h2>Invoices & Billing</h2>
                <p>Manage your payments and download your invoice history.</p>
            </div>

            <div className="grid-3" style={{ marginBottom: 24 }}>
                <div className="card stat-card">
                    <div className="stat-icon stat-icon-blue">
                        <CreditCard size={20} />
                    </div>
                    <div>
                        <div className="stat-value">${stats.outstanding.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                        <div className="stat-label">Total Outstanding</div>
                    </div>
                </div>
                <div className="card stat-card">
                    <div className="stat-icon stat-icon-green">
                        <CheckCircle size={20} />
                    </div>
                    <div>
                        <div className="stat-value">${stats.paid.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                        <div className="stat-label">Total Paid (All Time)</div>
                    </div>
                </div>
                <div className="card stat-card">
                    <div className="stat-icon stat-icon-orange">
                        <Clock size={20} />
                    </div>
                    <div>
                        <div className="stat-value">{stats.nextDue}</div>
                        <div className="stat-label">Next Due Date</div>
                    </div>
                </div>
            </div>

            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                {loading ? (
                    <div style={{ padding: 64, textAlign: 'center' }}>
                        <Loader2 className="animate-spin" size={32} style={{ margin: '0 auto', color: 'var(--orange-500)' }} />
                        <p style={{ marginTop: 16, color: 'var(--slate-500)' }}>Fetching your invoices...</p>
                    </div>
                ) : invoices.length === 0 ? (
                    <div style={{ padding: 64, textAlign: 'center', color: 'var(--slate-500)' }}>
                        <Receipt size={48} style={{ margin: '0 auto 16px', opacity: 0.2 }} />
                        <p>No invoices found.</p>
                    </div>
                ) : (
                    <div className="table-wrapper">
                        <table>
                            <thead>
                                <tr>
                                    <th>Invoice ID</th>
                                    <th>Project</th>
                                    <th>Notes</th>
                                    <th>Amount</th>
                                    <th>Due Date</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {invoices.map((inv) => (
                                    <tr key={inv.id}>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--orange-400)' }}>
                                                    <Receipt size={16} />
                                                </div>
                                                <span style={{ fontWeight: 600, color: 'white' }}>{inv.id.slice(0, 8).toUpperCase()}</span>
                                            </div>
                                        </td>
                                        <td>{inv.projects?.title || 'General Service'}</td>
                                        <td style={{ fontSize: 13, color: 'var(--slate-400)' }}>{inv.notes || 'Project Payment'}</td>
                                        <td style={{ fontWeight: 600, color: 'white' }}>${Number(inv.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                        <td>{new Date(inv.due_date).toLocaleDateString()}</td>
                                        <td>
                                            <span className={`badge ${inv.status === 'paid' ? 'badge-success' : 'badge-warning'
                                                }`}>
                                                {inv.status.charAt(0).toUpperCase() + inv.status.slice(1)}
                                            </span>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', gap: 8 }}>
                                                <button className="btn btn-secondary btn-sm" title="Download PDF">
                                                    <Download size={14} />
                                                </button>
                                                {inv.status !== 'paid' && (
                                                    <button className="btn btn-primary btn-sm">
                                                        Pay Now
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <div style={{ marginTop: 24, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                <div className="card" style={{ borderLeft: '4px solid var(--orange-500)' }}>
                    <div style={{ display: 'flex', gap: 16 }}>
                        <AlertCircle size={24} style={{ color: 'var(--orange-500)', flexShrink: 0 }} />
                        <div>
                            <h4 style={{ color: 'white', marginBottom: 6 }}>Payment Note</h4>
                            <p style={{ fontSize: 13, color: 'var(--slate-400)' }}>Invoices are due upon receipt unless otherwise specified. Late payments may be subject to a 2.5% monthly fee. Please contact our billing department if you have any questions.</p>
                        </div>
                    </div>
                </div>
                <div className="card">
                    <h4 style={{ color: 'white', marginBottom: 16 }}>Payment Methods</h4>
                    <div style={{ display: 'flex', gap: 12 }}>
                        {[1, 2, 3].map(i => (
                            <div key={i} style={{
                                height: 40, width: 64, borderRadius: 6,
                                background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                                <CreditCard size={20} style={{ color: 'var(--slate-600)' }} />
                            </div>
                        ))}
                    </div>
                    <p style={{ marginTop: 12, fontSize: 12, color: 'var(--slate-500)' }}>We accept all major credit cards and bank transfers.</p>
                </div>
            </div>
        </div>
    );
}

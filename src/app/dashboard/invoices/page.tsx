'use client';

import { Receipt, Download, CreditCard, Clock, CheckCircle, AlertCircle } from 'lucide-react';

const invoices = [
    { id: 'INV-5501', date: 'Oct 20, 2025', dueDate: 'Nov 20, 2025', status: 'Paid', amount: '$4,250.00', project: 'Main Street Residential', description: 'Initial Deposit' },
    { id: 'INV-5582', date: 'Nov 05, 2025', dueDate: 'Dec 05, 2025', status: 'Unpaid', amount: '$8,200.00', project: 'Main Street Residential', description: 'Phase 1 - Materials' },
    { id: 'INV-5438', date: 'Sep 10, 2025', dueDate: 'Oct 10, 2025', status: 'Paid', amount: '$1,800.00', project: 'Oak Avenue Repair', description: 'Full Service Payment' },
];

export default function InvoicesPage() {
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
                        <div className="stat-value">$8,200.00</div>
                        <div className="stat-label">Total Outstanding</div>
                    </div>
                </div>
                <div className="card stat-card">
                    <div className="stat-icon stat-icon-green">
                        <CheckCircle size={20} />
                    </div>
                    <div>
                        <div className="stat-value">$6,050.00</div>
                        <div className="stat-label">Total Paid (YTD)</div>
                    </div>
                </div>
                <div className="card stat-card">
                    <div className="stat-icon stat-icon-orange">
                        <Clock size={20} />
                    </div>
                    <div>
                        <div className="stat-value">Dec 05</div>
                        <div className="stat-label">Next Due Date</div>
                    </div>
                </div>
            </div>

            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div className="table-wrapper">
                    <table>
                        <thead>
                            <tr>
                                <th>Invoice</th>
                                <th>Project</th>
                                <th>Description</th>
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
                                            <span style={{ fontWeight: 600, color: 'white' }}>{inv.id}</span>
                                        </div>
                                    </td>
                                    <td>{inv.project}</td>
                                    <td style={{ fontSize: 13, color: 'var(--slate-400)' }}>{inv.description}</td>
                                    <td style={{ fontWeight: 600, color: 'white' }}>{inv.amount}</td>
                                    <td>{inv.dueDate}</td>
                                    <td>
                                        <span className={`badge ${inv.status === 'Paid' ? 'badge-success' : 'badge-warning'
                                            }`}>
                                            {inv.status}
                                        </span>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', gap: 8 }}>
                                            <button className="btn btn-secondary btn-sm" title="Download PDF">
                                                <Download size={14} />
                                            </button>
                                            {inv.status === 'Unpaid' && (
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
            </div>

            <div style={{ marginTop: 24, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                <div className="card" style={{ borderLeft: '4px solid var(--orange-500)' }}>
                    <div style={{ display: 'flex', gap: 16 }}>
                        <AlertCircle size={24} style={{ color: 'var(--orange-500)', flexShrink: 0 }} />
                        <div>
                            <h4 style={{ color: 'white', marginBottom: 6 }}>Payment Note</h4>
                            <p style={{ fontSize: 13 }}>Invoices are due 30 days from the date of issue. Late payments may be subject to a 2.5% monthly fee. Please contact our billing department if you have any questions.</p>
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

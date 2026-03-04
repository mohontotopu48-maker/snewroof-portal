'use client';

import { FileText, Download, Eye, Filter, Search, ShieldCheck } from 'lucide-react';

const quotes = [
    { id: 'QT-2401', date: 'Oct 12, 2025', status: 'Approved', amount: '$12,450.00', project: 'Main Street Residential', type: 'Full Replacement' },
    { id: 'QT-2408', date: 'Nov 05, 2025', status: 'Pending', amount: '$4,800.00', project: 'Oak Avenue Leak Repair', type: 'Repair' },
    { id: 'QT-2395', date: 'Sep 28, 2025', status: 'Archived', amount: '$8,200.00', project: 'Pine St Garage Roof', type: 'Full Replacement' },
];

export default function QuotesPage() {
    return (
        <div className="animate-fade">
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                    <h2>Quotes & Estimates</h2>
                    <p>Review and approve your roofing project estimates.</p>
                </div>
                <button className="btn btn-primary">
                    Request New Quote
                </button>
            </div>

            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', gap: 16, alignItems: 'center' }}>
                    <div style={{ position: 'relative', flex: 1, maxWidth: 320 }}>
                        <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--slate-500)' }} />
                        <input type="text" className="form-input" placeholder="Search quotes..." style={{ paddingLeft: 38 }} />
                    </div>
                    <button className="btn btn-secondary btn-sm">
                        <Filter size={14} /> Filter
                    </button>
                </div>

                <div className="table-wrapper">
                    <table>
                        <thead>
                            <tr>
                                <th>Quote ID</th>
                                <th>Project Name</th>
                                <th>Type</th>
                                <th>Amount</th>
                                <th>Date</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {quotes.map((quote) => (
                                <tr key={quote.id}>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--orange-400)' }}>
                                                <FileText size={16} />
                                            </div>
                                            <span style={{ fontWeight: 600, color: 'white' }}>{quote.id}</span>
                                        </div>
                                    </td>
                                    <td>{quote.project}</td>
                                    <td>{quote.type}</td>
                                    <td style={{ fontWeight: 600, color: 'white' }}>{quote.amount}</td>
                                    <td>{quote.date}</td>
                                    <td>
                                        <span className={`badge ${quote.status === 'Approved' ? 'badge-success' :
                                            quote.status === 'Pending' ? 'badge-warning' : 'badge-muted'
                                            }`}>
                                            {quote.status}
                                        </span>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', gap: 8 }}>
                                            <button className="btn btn-secondary btn-sm" title="View Details">
                                                <Eye size={14} />
                                            </button>
                                            <button className="btn btn-secondary btn-sm" title="Download PDF">
                                                <Download size={14} />
                                            </button>
                                            {quote.status === 'Pending' && (
                                                <button className="btn btn-primary btn-sm">
                                                    Review & Sign
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 13, color: 'var(--slate-500)' }}>Showing 3 of 12 quotes</span>
                    <div style={{ display: 'flex', gap: 8 }}>
                        <button className="btn btn-secondary btn-sm" disabled>Previous</button>
                        <button className="btn btn-secondary btn-sm">Next</button>
                    </div>
                </div>
            </div>

            <div style={{ marginTop: 24 }} className="card">
                <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
                    <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(59,130,246,0.1)', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <ShieldCheck size={24} />
                    </div>
                    <div>
                        <h4 style={{ color: 'white' }}>Our Pricing Promise</h4>
                        <p style={{ fontSize: 13 }}>All Snewroof quotes are fixed-price and guaranteed for 30 days. No hidden fees or surprise costs.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

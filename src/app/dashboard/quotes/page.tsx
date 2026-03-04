'use client';

import { useState, useEffect } from 'react';
import { FileText, Download, Eye, Filter, Search, ShieldCheck, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';


interface Quote {
    id: string;
    created_at: string;
    status: string;
    total: number;
    title: string;
    valid_until: string;
    inspection_id: string | null;
}

import { getQuotes } from '@/app/actions';

export default function QuotesPage() {
    const { user } = useAuth();
    const [quotes, setQuotes] = useState<Quote[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (user?.id) {
            fetchQuotes();
        }
    }, [user?.id]);

    const fetchQuotes = async () => {
        setLoading(true);
        try {
            const data = await getQuotes();
            setQuotes(data as unknown as Quote[]);
        } catch (err) {
            console.error('Error fetching quotes:', err);
            setError('Failed to load quotes.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="animate-fade">
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                    <h2>Quotes & Estimates</h2>
                    <p>Review and approve your roofing project estimates.</p>
                </div>
                <button className="btn btn-primary" onClick={() => window.location.href = '/dashboard/book-inspection'}>
                    Request New Quote
                </button>
            </div>

            {error && (
                <div style={{
                    marginBottom: 24, padding: '12px 16px', borderRadius: 8,
                    background: 'rgba(239,68,68,0.1)', border: '1px solid var(--error)',
                    color: 'var(--error)', display: 'flex', alignItems: 'center', gap: 10, fontSize: 14
                }}>
                    <AlertCircle size={18} />
                    {error}
                </div>
            )}

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

                {loading ? (
                    <div style={{ padding: 64, textAlign: 'center' }}>
                        <Loader2 className="animate-spin" size={32} style={{ margin: '0 auto', color: 'var(--orange-500)' }} />
                        <p style={{ marginTop: 16, color: 'var(--slate-500)' }}>Fetching your quotes...</p>
                    </div>
                ) : quotes.length === 0 ? (
                    <div style={{ padding: 64, textAlign: 'center', color: 'var(--slate-500)' }}>
                        <FileText size={48} style={{ margin: '0 auto 16px', opacity: 0.2 }} />
                        <p>No quotes found. Request an inspection to get started.</p>
                    </div>
                ) : (
                    <div className="table-wrapper">
                        <table>
                            <thead>
                                <tr>
                                    <th>Quote ID</th>
                                    <th>Title</th>
                                    <th>Amount</th>
                                    <th>Date</th>
                                    <th>Valid Until</th>
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
                                                <span style={{ fontWeight: 600, color: 'white' }}>{quote.id.slice(0, 8).toUpperCase()}</span>
                                            </div>
                                        </td>
                                        <td>{quote.title || 'Roofing Estimate'}</td>
                                        <td style={{ fontWeight: 600, color: 'white' }}>${Number(quote.total).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                        <td>{new Date(quote.created_at).toLocaleDateString()}</td>
                                        <td>{quote.valid_until ? new Date(quote.valid_until).toLocaleDateString() : 'N/A'}</td>
                                        <td>
                                            <span className={`badge ${quote.status === 'approved' ? 'badge-success' :
                                                quote.status === 'pending' ? 'badge-warning' : 'badge-muted'
                                                }`}>
                                                {quote.status.charAt(0).toUpperCase() + quote.status.slice(1)}
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
                                                {quote.status === 'pending' && (
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
                )}

                {!loading && quotes.length > 0 && (
                    <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 13, color: 'var(--slate-500)' }}>Showing {quotes.length} quotes</span>
                        <div style={{ display: 'flex', gap: 8 }}>
                            <button className="btn btn-secondary btn-sm" disabled>Previous</button>
                            <button className="btn btn-secondary btn-sm" disabled={quotes.length < 10}>Next</button>
                        </div>
                    </div>
                )}
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

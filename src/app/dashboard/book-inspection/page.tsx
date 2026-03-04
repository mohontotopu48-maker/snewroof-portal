'use client';

import { useState } from 'react';
import { Calendar, Clock, MapPin, MessageSquare, ShieldCheck, ArrowRight, Loader2, AlertCircle } from 'lucide-react';

import { bookInspection } from '@/app/actions';

export default function BookInspectionPage() {
    const user = { id: '00000000-0000-0000-0000-000000000001', email: 'customer@example.com', role: 'admin', name: 'Dummy User' };
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        type: 'Full Roof Assessment',
        preferred_date: '',
        preferred_time: 'Morning (8 AM - 12 PM)',
        address: '',
        description: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setLoading(true);
        setError(null);

        try {
            await bookInspection({
                address: formData.address,
                property_type: 'residential',
                preferred_date: formData.preferred_date,
                description: `${formData.type}. Time Window: ${formData.preferred_time}. ${formData.description}`
            });

            setSuccess(true);
        } catch (err) {
            console.error('Error booking inspection:', err);
            setError((err as Error).message || 'Failed to book inspection. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="animate-fade" style={{ maxWidth: 600, margin: '40px auto', textAlign: 'center' }}>
                <div className="card" style={{ padding: 48 }}>
                    <div style={{
                        width: 80, height: 80, background: 'rgba(34,197,94,0.1)',
                        color: 'var(--success)', borderRadius: '50%', display: 'flex',
                        alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px'
                    }}>
                        <ShieldCheck size={40} />
                    </div>
                    <h2 style={{ marginBottom: 12 }}>Inspection Requested!</h2>
                    <p style={{ color: 'var(--slate-400)', marginBottom: 32 }}>
                        Our team has received your request. A specialist will call you at your registered number to confirm the appointment.
                    </p>
                    <button className="btn btn-primary" onClick={() => setSuccess(false)}>
                        Book Another Inspection
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="animate-fade">
            <div className="page-header">
                <h2>Book an Inspection</h2>
                <p>Schedule a professional assessment of your roofing needs.</p>
            </div>

            <div className="grid-2" style={{ alignItems: 'start' }}>
                <div className="card">
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
                    <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 24 }}>
                        <div className="form-group">
                            <label className="form-label">Inspection Type</label>
                            <select
                                className="form-input"
                                value={formData.type}
                                onChange={(e) => setFormData(p => ({ ...p, type: e.target.value }))}
                            >
                                <option>Full Roof Assessment</option>
                                <option>Leak Investigation</option>
                                <option>Storm Damage Inspection</option>
                                <option>Routine Maintenance Check</option>
                                <option>Insurance Claim Support</option>
                            </select>
                        </div>

                        <div className="grid-2">
                            <div className="form-group">
                                <label className="form-label">Preferred Date</label>
                                <div style={{ position: 'relative' }}>
                                    <Calendar size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--slate-500)' }} />
                                    <input
                                        type="date"
                                        className="form-input"
                                        style={{ paddingLeft: 44 }}
                                        required
                                        value={formData.preferred_date}
                                        onChange={(e) => setFormData(p => ({ ...p, preferred_date: e.target.value }))}
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Preferred Time Window</label>
                                <div style={{ position: 'relative' }}>
                                    <Clock size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--slate-500)' }} />
                                    <select
                                        className="form-input"
                                        style={{ paddingLeft: 44 }}
                                        value={formData.preferred_time}
                                        onChange={(e) => setFormData(p => ({ ...p, preferred_time: e.target.value }))}
                                    >
                                        <option>Morning (8 AM - 12 PM)</option>
                                        <option>Afternoon (12 PM - 4 PM)</option>
                                        <option>Evening (4 PM - 6 PM)</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Property Address</label>
                            <div style={{ position: 'relative' }}>
                                <MapPin size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--slate-500)' }} />
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="Enter full address"
                                    style={{ paddingLeft: 44 }}
                                    required
                                    value={formData.address}
                                    onChange={(e) => setFormData(p => ({ ...p, address: e.target.value }))}
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Special Instructions or Notes</label>
                            <div style={{ position: 'relative' }}>
                                <MessageSquare size={18} style={{ position: 'absolute', left: 14, top: 14, color: 'var(--slate-500)' }} />
                                <textarea
                                    className="form-input"
                                    placeholder="e.g., Gate code, specific area of concern..."
                                    style={{ paddingLeft: 44, minHeight: 120 }}
                                    value={formData.description}
                                    onChange={(e) => setFormData(p => ({ ...p, description: e.target.value }))}
                                />
                            </div>
                        </div>

                        <button type="submit" className="btn btn-primary btn-lg" disabled={loading} style={{ width: '100%', justifyContent: 'center' }}>
                            {loading ? <Loader2 className="animate-spin" size={20} /> : (
                                <>Confirm Inspection Request <ArrowRight size={20} /></>
                            )}
                        </button>
                    </form>
                </div>

                <div style={{ display: 'grid', gap: 20 }}>
                    <div className="card" style={{ background: 'rgba(249,115,22,0.05)', borderColor: 'rgba(249,115,22,0.2)' }}>
                        <h3 style={{ marginBottom: 12, color: 'var(--orange-400)' }}>What to Expect?</h3>
                        <ul style={{ listStyle: 'none', display: 'grid', gap: 16 }}>
                            <li style={{ display: 'flex', gap: 12, fontSize: 14 }}>
                                <div style={{ color: 'var(--orange-500)', fontWeight: 'bold' }}>01</div>
                                <div>
                                    <strong style={{ color: 'white', display: 'block', marginBottom: 2 }}>Arrival Window</strong>
                                    Our specialist will arrive within the selected time window.
                                </div>
                            </li>
                            <li style={{ display: 'flex', gap: 12, fontSize: 14 }}>
                                <div style={{ color: 'var(--orange-500)', fontWeight: 'bold' }}>02</div>
                                <div>
                                    <strong style={{ color: 'white', display: 'block', marginBottom: 2 }}>Thorough Assessment</strong>
                                    We use drones and high-res imaging for deep roof inspections.
                                </div>
                            </li>
                            <li style={{ display: 'flex', gap: 12, fontSize: 14 }}>
                                <div style={{ color: 'var(--orange-500)', fontWeight: 'bold' }}>03</div>
                                <div>
                                    <strong style={{ color: 'white', display: 'block', marginBottom: 2 }}>Detailed Report</strong>
                                    You&apos;ll receive a full digital report with photos and recommendations.
                                </div>
                            </li>
                        </ul>
                    </div>

                    <div className="card">
                        <h3 style={{ marginBottom: 16 }}>Need urgent help?</h3>
                        <p style={{ fontSize: 14, marginBottom: 20 }}>For emergency leak repairs or storm damage, call our 24/7 hotline:</p>
                        <a href="tel:1800SNEWROOF" className="btn btn-outline" style={{ width: '100%', justifyContent: 'center' }}>
                            Call (800) SNEW-ROOF
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}

'use client';

import { useState } from 'react';
import { Mail, ArrowLeft, ShieldCheck, Loader2 } from 'lucide-react';
import Link from 'next/link';
import insforge from '@/lib/insforge';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { error: resetError } = await insforge.auth.sendResetPasswordEmail({ email });

            if (resetError) throw resetError;
            setSuccess(true);
        } catch (err) {
            console.error('Error resetting password:', err);
            setError((err as Error).message || 'Failed to send reset email. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <style>{`
                .login-page {
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: radial-gradient(circle at top right, var(--navy-800), var(--navy-950));
                    padding: 20px;
                }
                .login-card {
                    width: 100%;
                    max-width: 440px;
                    background: rgba(10, 22, 40, 0.7);
                    backdrop-filter: blur(20px);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    border-radius: var(--radius-xl);
                    padding: 40px;
                    box-shadow: var(--shadow-lg);
                }
                .login-header {
                    text-align: center;
                    margin-bottom: 32px;
                }
                .login-header h1 {
                    font-size: 24px;
                    margin-bottom: 8px;
                    color: white;
                }
                .login-header p {
                    font-size: 14px;
                    color: var(--slate-400);
                }
                .input-group {
                    margin-bottom: 24px;
                }
                .input-wrapper {
                    position: relative;
                }
                .input-wrapper svg {
                    position: absolute;
                    left: 14px;
                    top: 50%;
                    transform: translateY(-50%);
                    color: var(--slate-600);
                }
                .login-input {
                    padding-left: 44px !important;
                }
                .back-link {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    margin-top: 24px;
                    font-size: 14px;
                    color: var(--slate-400);
                    text-decoration: none;
                    transition: var(--transition);
                }
                .back-link:hover {
                    color: white;
                }
            `}</style>

            <div className="login-card">
                <div className="login-header">
                    <h1>Reset Password</h1>
                    <p>Enter your email to receive a password reset link</p>
                </div>

                {success ? (
                    <div style={{ textAlign: 'center' }}>
                        <div style={{
                            width: 64, height: 64, background: 'rgba(34,197,94,0.1)',
                            color: 'var(--success)', borderRadius: '50%', display: 'flex',
                            alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px'
                        }}>
                            <ShieldCheck size={32} />
                        </div>
                        <h3 style={{ color: 'white', marginBottom: 12 }}>Check your email</h3>
                        <p style={{ color: 'var(--slate-400)', fontSize: 14, marginBottom: 24 }}>
                            We have sent a password recovery link to <strong>{email}</strong>.
                        </p>
                        <Link href="/login" className="btn btn-primary" style={{ width: '100%' }}>
                            Back to Login
                        </Link>
                    </div>
                ) : (
                    <>
                        {error && (
                            <div className="alert alert-error" style={{ marginBottom: 24 }}>
                                <ShieldCheck size={18} />
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            <div className="input-group">
                                <label className="form-label">Email Address</label>
                                <div className="input-wrapper">
                                    <Mail size={18} />
                                    <input
                                        type="email"
                                        className="form-input login-input"
                                        placeholder="name@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <button type="submit" className="btn btn-primary" style={{ width: '100%', height: 48 }} disabled={loading}>
                                {loading ? <Loader2 className="animate-spin" size={20} /> : 'Send Reset Link'}
                            </button>
                        </form>

                        <Link href="/login" className="back-link">
                            <ArrowLeft size={16} /> Back to Login
                        </Link>
                    </>
                )}
            </div>
        </div>
    );
}

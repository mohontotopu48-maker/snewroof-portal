'use client';

import { useState } from 'react';
import { Lock, ShieldCheck, Loader2, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { updatePassword } from '@/app/actions';

export default function ResetPasswordPage() {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            await updatePassword(password);

            setSuccess(true);
            setTimeout(() => {
                router.push('/login');
            }, 3000);
        } catch (err) {
            console.error('Error updating password:', err);
            setError((err as Error).message || 'Failed to update password. Link may be expired.');
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
                    margin-bottom: 20px;
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
            `}</style>

            <div className="login-card">
                <div className="login-header">
                    <h1>Set New Password</h1>
                    <p>Enter your new password below</p>
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
                        <h3 style={{ color: 'white', marginBottom: 12 }}>Password Updated</h3>
                        <p style={{ color: 'var(--slate-400)', fontSize: 14 }}>
                            Your password has been successfully reset. Redirecting to login...
                        </p>
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
                                <label className="form-label">New Password</label>
                                <div className="input-wrapper">
                                    <Lock size={18} />
                                    <input
                                        type="password"
                                        className="form-input login-input"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        minLength={8}
                                    />
                                </div>
                            </div>

                            <div className="input-group">
                                <label className="form-label">Confirm New Password</label>
                                <div className="input-wrapper">
                                    <Lock size={18} />
                                    <input
                                        type="password"
                                        className="form-input login-input"
                                        placeholder="••••••••"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                        minLength={8}
                                    />
                                </div>
                            </div>

                            <button type="submit" className="btn btn-primary" style={{ width: '100%', height: 48, marginTop: 8 }} disabled={loading}>
                                {loading ? <Loader2 className="animate-spin" size={20} /> : (
                                    <>
                                        Update Password <ArrowRight size={18} />
                                    </>
                                )}
                            </button>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
}

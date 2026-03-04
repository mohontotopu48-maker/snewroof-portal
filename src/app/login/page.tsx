'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { Mail, Lock, ShieldCheck, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
    const { signIn } = useAuth();
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const result = await signIn(email, password);
        if (result.error) {
            setError('Invalid email or password. Please try again.');
            setLoading(false);
        } else {
            router.push('/dashboard');
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
                    position: relative;
                    overflow: hidden;
                }
                .login-page::before {
                    content: '';
                    position: absolute;
                    width: 500px; height: 500px;
                    background: var(--orange-500);
                    filter: blur(150px);
                    opacity: 0.1;
                    top: -100px; right: -100px;
                    pointer-events: none;
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
                    animation: slideUp 0.6s cubic-bezier(0.4, 0, 0.2, 1);
                }
                .login-logo {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    margin-bottom: 32px;
                    justify-content: center;
                }
                .logo-icon {
                    width: 44px; height: 44px;
                    background: linear-gradient(135deg, var(--orange-500), var(--orange-400));
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 20px;
                    font-weight: 900;
                    color: white;
                }
                .logo-brand {
                    font-size: 24px;
                    font-weight: 800;
                    letter-spacing: -0.02em;
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
                .login-btn {
                    width: 100%;
                    height: 48px;
                    margin-top: 8px;
                    font-size: 15px;
                }
                .login-footer {
                    margin-top: 24px;
                    text-align: center;
                    font-size: 14px;
                    color: var(--slate-400);
                }
                .login-footer a {
                    color: var(--orange-400);
                    font-weight: 600;
                }
                @keyframes slideUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>

            <div className="login-card">
                <div className="login-logo">
                    <div className="logo-icon">S</div>
                    <span className="logo-brand">Snewroof</span>
                </div>

                <div className="login-header">
                    <h1>Welcome Back</h1>
                    <p>Enter your credentials to access your portal</p>
                </div>

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

                    <div className="input-group">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                            <label className="form-label">Password</label>
                            <Link href="/forgot-password" style={{ fontSize: 12, color: 'var(--slate-500)' }}>Forgot password?</Link>
                        </div>
                        <div className="input-wrapper">
                            <Lock size={18} />
                            <input
                                type="password"
                                className="form-input login-input"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <button type="submit" className="btn btn-primary login-btn" disabled={loading}>
                        {loading ? 'Authenticating...' : (
                            <>
                                Sign In <ArrowRight size={18} />
                            </>
                        )}
                    </button>
                </form>

                <div className="login-footer">
                    Don&apos;t have an account? <Link href="/register">Contact support</Link>
                </div>
            </div>
        </div>
    );
}

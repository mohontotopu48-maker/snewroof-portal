'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { loginUser } from '@/lib/auth-actions';
import { Loader2, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    async function handleSubmit(formData: FormData) {
        setLoading(true);
        setError(null);

        try {
            const result = await loginUser(formData);

            if (result.error) {
                setError(result.error);
            } else if (result.success) {
                router.push('/dashboard');
                // Force a full refresh to ensure all layouts fetch the new cookie
                router.refresh();
            }
        } catch {
            setError('An unexpected error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="login-container">
            <style jsx>{`
                .login-container {
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: radial-gradient(circle at top right, var(--navy-800), var(--navy-950));
                    padding: 24px;
                }
                .login-card {
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    padding: 40px;
                    border-radius: var(--radius-lg);
                    width: 100%;
                    max-width: 420px;
                    backdrop-filter: blur(12px);
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
                }
                .brand-logo {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    margin-bottom: 32px;
                    justify-content: center;
                }
                .logo-box {
                    width: 40px;
                    height: 40px;
                    background: linear-gradient(135deg, var(--orange-400), var(--orange-600));
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 700;
                    font-size: 20px;
                    color: white;
                    box-shadow: 0 4px 12px rgba(249, 115, 22, 0.3);
                }
                .brand-text h1 {
                    font-size: 24px;
                    font-weight: 700;
                    color: white;
                    margin: 0;
                }
                .form-group {
                    margin-bottom: 20px;
                }
                .form-group label {
                    display: block;
                    font-size: 14px;
                    font-weight: 500;
                    color: var(--slate-300);
                    margin-bottom: 8px;
                }
                .input-field {
                    width: 100%;
                    background: rgba(0, 0, 0, 0.2);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    padding: 12px 16px;
                    border-radius: var(--radius-md);
                    color: white;
                    font-size: 15px;
                    transition: all 0.2s ease;
                }
                .input-field:focus {
                    outline: none;
                    border-color: var(--orange-500);
                    background: rgba(255, 255, 255, 0.05);
                }
                .error-message {
                    background: rgba(239, 68, 68, 0.1);
                    color: #ef4444;
                    padding: 12px;
                    border-radius: var(--radius-md);
                    font-size: 14px;
                    margin-bottom: 20px;
                    border: 1px solid rgba(239, 68, 68, 0.2);
                }
                .submit-btn {
                    width: 100%;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    gap: 8px;
                    margin-top: 10px;
                }
                .back-link {
                    display: block;
                    text-align: center;
                    margin-top: 24px;
                    color: var(--slate-400);
                    font-size: 14px;
                    text-decoration: none;
                    transition: color 0.2s ease;
                }
                .back-link:hover {
                    color: white;
                }
            `}</style>

            <div className="login-card">
                <div className="brand-logo">
                    <div className="logo-box">S</div>
                    <div className="brand-text">
                        <h1>Snewroof</h1>
                    </div>
                </div>

                {error && <div className="error-message">{error}</div>}

                <form action={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="email">Email Address</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            className="input-field"
                            placeholder="customer@example.com"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            className="input-field"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary submit-btn"
                        disabled={loading}
                    >
                        {loading ? <Loader2 size={18} className="animate-spin" /> : (
                            <>Sign In <ArrowRight size={18} /></>
                        )}
                    </button>

                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '24px' }}>
                        <Link href="/forgot-password" className="back-link" style={{ marginTop: 0 }}>
                            Forgot Password?
                        </Link>
                        <Link href="/" className="back-link" style={{ marginTop: 0 }}>
                            &larr; Back to Home
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}

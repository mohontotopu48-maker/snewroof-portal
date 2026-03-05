'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { sendPasswordResetAction } from '@/lib/auth-actions';
import { Loader2, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    async function handleSubmit(formData: FormData) {
        setLoading(true);
        setError(null);

        const email = formData.get('email') as string;

        try {
            const result = await sendPasswordResetAction(formData);

            if (result?.error) {
                setError(result.error);
            } else if (result?.success) {
                router.push(`/reset-password?email=${encodeURIComponent(email)}`);
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
                .instruction-text {
                    color: var(--slate-300);
                    font-size: 14px;
                    margin-bottom: 24px;
                    text-align: center;
                    line-height: 1.5;
                }
            `}</style>

            <div className="login-card">
                <div className="brand-logo">
                    <div className="logo-box">S</div>
                    <div className="brand-text">
                        <h1>Snewroof</h1>
                    </div>
                </div>

                <p className="instruction-text">
                    Enter your email address and we&apos;ll send you a 6-digit code to reset your password.
                </p>

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

                    <button
                        type="submit"
                        className="btn btn-primary submit-btn"
                        disabled={loading}
                    >
                        {loading ? <Loader2 size={18} className="animate-spin" /> : (
                            <>Send Reset Code <ArrowRight size={18} /></>
                        )}
                    </button>

                    <Link href="/login" className="back-link">
                        &larr; Back to Login
                    </Link>
                </form>
            </div>
        </div>
    );
}

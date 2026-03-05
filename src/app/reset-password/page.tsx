'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { exchangeResetCodeAction, resetPasswordAction } from '@/lib/auth-actions';
import { Loader2, ArrowRight } from 'lucide-react';
import Link from 'next/link';

function ResetPasswordForm() {
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState<'code' | 'password'>('code');
    const [resetToken, setResetToken] = useState<string | null>(null);
    const router = useRouter();
    const searchParams = useSearchParams();

    // Get email from URL if present
    const [email, setEmail] = useState('');

    useEffect(() => {
        const emailParam = searchParams.get('email');
        if (emailParam) {
            setEmail(emailParam);
        }
    }, [searchParams]);

    async function handleVerifyCode(formData: FormData) {
        setLoading(true);
        setError(null);

        try {
            const code = formData.get('code') as string;
            // Pass both email and code
            const exchangeData = new FormData();
            exchangeData.append('email', email);
            exchangeData.append('code', code);

            const result = await exchangeResetCodeAction(exchangeData);

            if (result?.error) {
                setError(result.error);
            } else if (result?.success && result.token) {
                setResetToken(result.token);
                setStep('password');
            }
        } catch {
            setError('An unexpected error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    }

    async function handleResetPassword(formData: FormData) {
        setLoading(true);
        setError(null);

        try {
            if (!resetToken) {
                setError('Reset token missing. Please try again from the start.');
                return;
            }

            const newPasswordData = new FormData();
            newPasswordData.append('token', resetToken);
            newPasswordData.append('newPassword', formData.get('newPassword') as string);

            const result = await resetPasswordAction(newPasswordData);

            if (result?.error) {
                setError(result.error);
            } else if (result?.success) {
                alert('Password reset successfully! You can now log in.');
                router.push('/login');
            }
        } catch {
            setError('An unexpected error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="login-card">
            <div className="brand-logo">
                <div className="logo-box">S</div>
                <div className="brand-text">
                    <h1>Snewroof</h1>
                </div>
            </div>

            {step === 'code' ? (
                <>
                    <p className="instruction-text">
                        Enter the 6-digit verification code sent to <strong>{email || 'your email'}</strong>.
                    </p>

                    {error && <div className="error-message">{error}</div>}

                    <form action={handleVerifyCode}>
                        <div className="form-group">
                            <label htmlFor="code">Verification Code</label>
                            <input
                                type="text"
                                id="code"
                                name="code"
                                className="input-field"
                                placeholder="123456"
                                maxLength={6}
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary submit-btn"
                            disabled={loading}
                        >
                            {loading ? <Loader2 size={18} className="animate-spin" /> : (
                                <>Verify Code <ArrowRight size={18} /></>
                            )}
                        </button>
                    </form>
                </>
            ) : (
                <>
                    <p className="instruction-text">
                        Authentication successful. Please enter your new password.
                    </p>

                    {error && <div className="error-message">{error}</div>}

                    <form action={handleResetPassword}>
                        <div className="form-group">
                            <label htmlFor="newPassword">New Password</label>
                            <input
                                type="password"
                                id="newPassword"
                                name="newPassword"
                                className="input-field"
                                placeholder="••••••••"
                                required
                                minLength={6}
                            />
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary submit-btn"
                            disabled={loading}
                        >
                            {loading ? <Loader2 size={18} className="animate-spin" /> : (
                                <>Save New Password <ArrowRight size={18} /></>
                            )}
                        </button>
                    </form>
                </>
            )}

            <Link href="/login" className="back-link">
                &larr; Back to Login
            </Link>
        </div>
    );
}

export default function ResetPasswordPage() {
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

            <Suspense fallback={<div className="login-card"><Loader2 className="animate-spin mx-auto text-orange-500" /></div>}>
                <ResetPasswordForm />
            </Suspense>
        </div>
    );
}

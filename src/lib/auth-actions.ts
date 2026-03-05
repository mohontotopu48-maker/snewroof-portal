'use server';

import { cookies } from 'next/headers';
import { insforge } from './insforge';
import { redirect } from 'next/navigation';

export async function loginUser(formData: FormData) {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    if (!email || !password) {
        return { error: 'Email and password are required' };
    }

    try {
        const { data, error } = await insforge.auth.signInWithPassword({
            email,
            password
        });

        if (error) {
            console.error('Login auth error:', error);
            // InsForge returns helpful errors like 'INVALID_CREDENTIALS' we could parse, but a generic one is safer usually:
            return { error: error.message || 'Invalid email or password. Please try again.' };
        }

        if (!data || !data.accessToken) {
            return { error: 'Invalid response from authentication server.' };
        }

        // The SDK automatically handles the cookie via the auth route handlers setup in Next.js typically,
        // but given the app currently manually sets `snewroof_session`, we'll set the official token manually to a cookie 
        // to be compatible with middleware, or rely on the SDK if we fully migrated to Next.js handlers.
        // For now, we store the accessToken in `snewroof_session` so middleware still works (we will update middleware later to just check existence or decode it).

        const cookieStore = await cookies();
        cookieStore.set('snewroof_session', data.accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 60 * 60 * 24 * 7 // 1 week
        });

        return { success: true };
    } catch (error) {
        console.error('Unexpected login error:', error);
        return { error: 'An unexpected error occurred' };
    }
}

export async function logoutUser() {
    await insforge.auth.signOut();
    const cookieStore = await cookies();
    cookieStore.delete('snewroof_session');
    redirect('/login');
}

export async function getUserId() {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('snewroof_session');

    // If we have an access token, we could decode it or call getCurrentSession
    // Since this is a server action, let's try to get it from SDK if client is initialized with token,
    // or just return the token itself if the app relies on it (we'll need to check usage).
    // The previous code returned the user ID directly from the cookie.
    // The Access Token is a JWT. We can decode the payload.
    if (!sessionCookie || !sessionCookie.value) return null;

    try {
        // Base64Url decode the JWT payload (the second part)
        const base64Url = sessionCookie.value.split('.')[1];
        if (!base64Url) return null;
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));

        const payload = JSON.parse(jsonPayload);
        return payload.sub || null; // 'sub' in JWT is usually the user id
    } catch (e) {
        console.error('Error parsing session token', e);
        return null;
    }
}

// ---- Password Reset Flow ----

export async function sendPasswordResetAction(formData: FormData) {
    const email = formData.get('email') as string;
    if (!email) return { error: 'Email is required' };

    try {
        const { error } = await insforge.auth.sendResetPasswordEmail({ email });
        if (error) return { error: error.message };
        return { success: true };
    } catch {
        return { error: 'An unexpected error occurred.' };
    }
}

export async function exchangeResetCodeAction(formData: FormData) {
    const email = formData.get('email') as string;
    const code = formData.get('code') as string;

    if (!email || !code) return { error: 'Email and verification code are required.' };

    try {
        const { data, error } = await insforge.auth.exchangeResetPasswordToken({ email, code });
        if (error) return { error: error.message };
        if (!data || !data.token) return { error: 'Invalid response from server.' };

        return { success: true, token: data.token };
    } catch {
        return { error: 'An unexpected error occurred.' };
    }
}

export async function resetPasswordAction(formData: FormData) {
    const token = formData.get('token') as string;
    const newPassword = formData.get('newPassword') as string;

    if (!token || !newPassword) return { error: 'Token and new password are required.' };

    try {
        const { error } = await insforge.auth.resetPassword({
            otp: token,
            newPassword
        });

        if (error) return { error: error.message };
        return { success: true };
    } catch {
        return { error: 'An unexpected error occurred.' };
    }
}

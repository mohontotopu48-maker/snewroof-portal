'use client';

import React, { createContext, useContext } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import insforge from '@/lib/insforge';

interface User {
    id: string;
    email: string;
    name?: string;
    role?: string;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    signIn: (email: string, password: string) => Promise<{ error: string | null }>;
    signUp: (email: string, password: string, name: string) => Promise<{ error: string | null }>;
    signOut: () => Promise<void>;
    isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const { data: session, status } = useSession();
    const loading = status === 'loading';

    const handleSignIn = async (email: string, password: string) => {
        const result = await signIn('credentials', {
            email,
            password,
            redirect: false
        });
        if (result?.error) {
            return { error: result.error };
        }
        return { error: null };
    };

    const handleSignUp = async (email: string, password: string, name: string) => {
        const { error } = await insforge.auth.signUp({
            email,
            password,
            name
        });
        if (error) {
            return { error: error.message };
        }
        // Auto sign in after sign up
        return handleSignIn(email, password);
    };

    const handleSignOut = async () => {
        await signOut({ redirect: false });
    };

    const user: User | null = session?.user ? ({
        id: (session.user as { id?: string }).id || '',
        email: session.user.email || '',
        name: session.user.name || undefined,
        role: (session.user as { role?: string }).role || 'customer'
    }) : null;

    return (
        <AuthContext.Provider value={{
            user,
            loading,
            signIn: handleSignIn,
            signUp: handleSignUp,
            signOut: handleSignOut,
            isAdmin: user?.role === 'admin' || user?.role === 'contractor',
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
}

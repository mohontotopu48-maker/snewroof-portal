'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import { getProfile, registerUser } from '@/app/actions';

interface Profile {
    id: string;
    fullName: string | null;
    avatarUrl: string | null;
    role: string;
}

interface User {
    id: string;
    email: string;
    name?: string;
    role?: string;
    avatarUrl?: string;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    signIn: (email: string, password: string) => Promise<{ error: string | null }>;
    signUp: (email: string, password: string, name: string) => Promise<{ error: string | null }>;
    signOut: () => Promise<void>;
    isAdmin: boolean;
    refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const { data: session, status } = useSession();
    const [profile, setProfile] = useState<Profile | null>(null);
    const [profileLoading, setProfileLoading] = useState(false);
    const loading = status === 'loading' || profileLoading;

    const fetchProfile = useCallback(async () => {
        if (!session?.user) return;
        setProfileLoading(true);
        try {
            const data = await getProfile();
            if (data) {
                setProfile(data as unknown as Profile);
            }
        } catch (err) {
            console.error('Error fetching profile in AuthContext:', err);
        } finally {
            setProfileLoading(false);
        }
    }, [session?.user]);

    useEffect(() => {
        if (session?.user?.email) {
            fetchProfile();
        } else {
            setProfile(null);
        }
    }, [session?.user?.email, fetchProfile]);

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
        const { error } = await registerUser(email, password, name);
        if (error) {
            return { error };
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
        name: profile?.fullName || session.user.name || undefined,
        role: profile?.role || (session.user as { role?: string }).role || 'customer',
        avatarUrl: profile?.avatarUrl || undefined
    }) : null;

    return (
        <AuthContext.Provider value={{
            user,
            loading,
            signIn: handleSignIn,
            signUp: handleSignUp,
            signOut: handleSignOut,
            isAdmin: user?.role === 'admin' || user?.role === 'contractor',
            refreshProfile: fetchProfile
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

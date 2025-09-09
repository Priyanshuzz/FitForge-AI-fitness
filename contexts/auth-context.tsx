'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { User, Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<{ error?: any }>;
  signUp: (email: string, password: string, userData?: any) => Promise<{ error?: any }>;
  signInWithGoogle: () => Promise<{ error?: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    // Skip auth setup if Supabase is not configured
    if (!supabase || !supabase.auth || typeof supabase.auth.getSession !== 'function') {
      console.info('Running in demo mode - authentication disabled');
      setLoading(false);
      return;
    }

    // Get initial session
    const getSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth!.getSession();
        if (error) {
          console.error('Error getting session:', error);
        } else {
          setSession(session);
          setUser(session?.user ?? null);
        }
      } catch (error) {
        console.error('Error in getSession:', error);
      } finally {
        setLoading(false);
      }
    };

    getSession();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth!.onAuthStateChange(async (event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  const signOut = async () => {
    if (!supabase || !supabase.auth || typeof supabase.auth.signOut !== 'function') {
      console.warn('Supabase not configured - running in demo mode');
      return;
    }
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    if (!supabase || !supabase.auth || typeof supabase.auth.signInWithPassword !== 'function') {
      return { error: new Error('Supabase not configured - running in demo mode') };
    }
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      return { data, error };
    } catch (error) {
      console.error('Error signing in:', error);
      return { error };
    }
  };

  const signUp = async (email: string, password: string, userData?: any) => {
    if (!supabase || !supabase.auth || typeof supabase.auth.signUp !== 'function') {
      return { error: new Error('Supabase not configured - running in demo mode') };
    }
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData,
        },
      });
      return { data, error };
    } catch (error) {
      console.error('Error signing up:', error);
      return { error };
    }
  };

  const signInWithGoogle = async () => {
    if (!supabase || !supabase.auth || typeof supabase.auth.signInWithOAuth !== 'function') {
      return { error: new Error('Supabase not configured - running in demo mode') };
    }
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      return { data, error };
    } catch (error) {
      console.error('Error signing in with Google:', error);
      return { error };
    }
  };

  const value = {
    user,
    session,
    loading,
    signOut,
    signIn,
    signUp,
    signInWithGoogle,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
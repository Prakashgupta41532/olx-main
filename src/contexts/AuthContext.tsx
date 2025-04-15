import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isVerified: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  demoLogin: () => Promise<void>;
  requestVerification: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for changes on auth state
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Check verification status when user changes
  useEffect(() => {
    const checkVerification = async () => {
      if (user) {
        const { data, error } = await supabase
          .from('profiles')
          .select('is_verified')
          .eq('id', user.id)
          .single();

        if (!error && data) {
          setIsVerified(data.is_verified);
        }
      }
    };

    checkVerification();
  }, [user]);

  const value = {
    user,
    loading,
    isVerified,
    signIn: async (email: string, password: string) => {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
    },
    signUp: async (email: string, password: string) => {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;
    },
    signOut: async () => {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    },
    demoLogin: async () => {
      // Create a demo user if it doesn't exist
      const { data: existingUser, error: checkError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', 'demo@shopnearme.co')
        .single();

      if (checkError && checkError.code === 'PGRST116') {
        // User doesn't exist, create one
        const { data: authData, error: signUpError } = await supabase.auth.signUp({
          email: 'demo@shopnearme.co',
          password: 'demo123456'
        });

        if (signUpError) throw signUpError;

        if (authData.user) {
          // Create profile for demo user
          const { error: profileError } = await supabase
            .from('profiles')
            .insert({
              id: authData.user.id,
              email: 'demo@shopnearme.co',
              username: 'demo_user',
              full_name: 'Demo User',
              role: 'user'
            });

          if (profileError) throw profileError;
        }
      }

      // Sign in with demo credentials
      const { error } = await supabase.auth.signInWithPassword({
        email: 'demo@shopnearme.co',
        password: 'demo123456'
      });

      if (error) throw error;
    },
    requestVerification: async () => {
      if (!user) throw new Error('User not authenticated');
      
      const { error } = await supabase
        .from('verification_requests')
        .insert({
          user_id: user.id,
          document_type: 'subscription',
          document_url: 'subscription_payment',
          status: 'pending'
        });

      if (error) throw error;
    }
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
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
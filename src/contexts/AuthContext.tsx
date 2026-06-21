import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  LocalUser,
  localSignIn,
  localSignUp,
  localSignOut,
  localGetSession,
  localUpdateProfile,
} from '../lib/localAuth';
import { Profile } from '../types';

// ─── Context type ─────────────────────────────────────────────────────────────

interface AuthContextType {
  user: LocalUser | null;
  session: LocalUser | null; // kept for API compatibility
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<LocalUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  // Restore session on mount
  useEffect(() => {
    const existing = localGetSession();
    if (existing) {
      setUser(existing);
      setProfile(existing as unknown as Profile);
    }
    setLoading(false);
  }, []);

  async function signIn(email: string, password: string) {
    const { user: u, error } = localSignIn(email, password);
    if (u) {
      setUser(u);
      setProfile(u as unknown as Profile);
    }
    return { error: error ? new Error(error) : null };
  }

  async function signUp(email: string, password: string, fullName: string) {
    const { user: u, error } = localSignUp(email, password, fullName);
    if (u) {
      setUser(u);
      setProfile(u as unknown as Profile);
    }
    return { error: error ? new Error(error) : null };
  }

  async function signOut() {
    localSignOut();
    setUser(null);
    setProfile(null);
  }

  async function refreshProfile() {
    const existing = localGetSession();
    if (existing) {
      setUser(existing);
      setProfile(existing as unknown as Profile);
    }
  }

  async function updateProfile(updates: Partial<Profile>) {
    if (!user) return;
    localUpdateProfile(user.id, updates as Partial<LocalUser>);
    const updated = { ...user, ...updates } as LocalUser;
    setUser(updated);
    setProfile(updated as unknown as Profile);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        session: user,
        profile,
        loading,
        signIn,
        signUp,
        signOut,
        refreshProfile,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

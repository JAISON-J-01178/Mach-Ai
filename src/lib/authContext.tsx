'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { upsertUser } from './supabaseDb';

import { sendAuthAlert } from './notificationEngine';

export interface UserProfile {
  name: string;
  email: string;
  avatar: string;
  isLoggedIn: boolean;
  supabaseUserId?: string; // Supabase UUID — used as FK for chat_threads
}

interface AuthContextType {
  user: UserProfile | null;
  supabaseUserId: string | null;
  loginWithGoogle: (name?: string, email?: string) => void;
  loginWithEmail: (name: string, email: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const SESSION_KEY = 'machi_ai_user_session';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [supabaseUserId, setSupabaseUserId] = useState<string | null>(null);

  // Restore session from localStorage on mount
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem(SESSION_KEY);
      if (savedUser) {
        const parsed: UserProfile = JSON.parse(savedUser);
        setUser(parsed);
        if (parsed.supabaseUserId) {
          setSupabaseUserId(parsed.supabaseUserId);
        } else if (parsed.email) {
          // Re-sync with Supabase if supabaseUserId was missing from old session
          upsertUser(parsed.email, parsed.name).then((id) => {
            if (id) {
              setSupabaseUserId(id);
              const updated = { ...parsed, supabaseUserId: id };
              setUser(updated);
              localStorage.setItem(SESSION_KEY, JSON.stringify(updated));
            }
          });
        }
      }
    } catch {
      // ignore parse errors
    }
  }, []);

  /**
   * Shared login logic: upserts user into Supabase users table,
   * stores supabaseUserId in session, and triggers Email + SMS alert notification.
   */
  const handleLogin = async (
    name: string,
    email: string,
    avatar = '',
    loginMethod: 'Google' | 'Email' = 'Email'
  ) => {
    // Optimistically set user in UI immediately
    const optimistic: UserProfile = { name, email, avatar, isLoggedIn: true };
    setUser(optimistic);
    localStorage.setItem(SESSION_KEY, JSON.stringify(optimistic));

    // Send automated Email & SMS login/signup alert
    sendAuthAlert(email, name, loginMethod);

    // Sync with Supabase and get UUID
    const id = await upsertUser(email, name);
    const finalUser: UserProfile = { ...optimistic, supabaseUserId: id ?? undefined };
    setUser(finalUser);
    setSupabaseUserId(id);
    localStorage.setItem(SESSION_KEY, JSON.stringify(finalUser));
  };

  const loginWithGoogle = (
    customName = 'Machi User',
    customEmail = 'user@gmail.com'
  ) => {
    handleLogin(
      customName,
      customEmail,
      'https://lh3.googleusercontent.com/a/default-user=s96-c',
      'Google'
    );
  };

  const loginWithEmail = (name: string, email: string) => {
    handleLogin(name || 'Machi User', email || 'user@machi.ai', '', 'Email');
  };

  const logout = () => {
    setUser(null);
    setSupabaseUserId(null);
    localStorage.removeItem(SESSION_KEY);
  };

  return (
    <AuthContext.Provider value={{ user, supabaseUserId, loginWithGoogle, loginWithEmail, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

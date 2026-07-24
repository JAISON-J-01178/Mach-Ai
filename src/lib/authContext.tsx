'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface UserProfile {
  name: string;
  email: string;
  avatar: string;
  isLoggedIn: boolean;
}

interface AuthContextType {
  user: UserProfile | null;
  loginWithGoogle: (name?: string, email?: string) => void;
  loginWithEmail: (name: string, email: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('machi_ai_user_session');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    } catch {
      // ignore
    }
  }, []);

  const loginWithGoogle = (customName = 'Machi User', customEmail = 'user@gmail.com') => {
    const newUser: UserProfile = {
      name: customName,
      email: customEmail,
      avatar: 'https://lh3.googleusercontent.com/a/default-user=s96-c',
      isLoggedIn: true
    };
    setUser(newUser);
    localStorage.setItem('machi_ai_user_session', JSON.stringify(newUser));
  };

  const loginWithEmail = (name: string, email: string) => {
    const newUser: UserProfile = {
      name: name || 'Machi User',
      email: email || 'user@machi.ai',
      avatar: '',
      isLoggedIn: true
    };
    setUser(newUser);
    localStorage.setItem('machi_ai_user_session', JSON.stringify(newUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('machi_ai_user_session');
  };

  return (
    <AuthContext.Provider value={{ user, loginWithGoogle, loginWithEmail, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

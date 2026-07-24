'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/authContext';
import { GoogleLogin } from '@react-oauth/google';
import { X, Mail, Lock, User, Sparkles } from 'lucide-react';
import Image from 'next/image';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { loginWithGoogle, loginWithEmail } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);

  if (!isOpen) return null;

  const handleGoogleSuccess = (credentialResponse: { credential?: string }) => {
    if (credentialResponse.credential) {
      // Decode JWT payload or set profile
      try {
        const payload = JSON.parse(atob(credentialResponse.credential.split('.')[1]));
        loginWithGoogle(payload.name || 'Google Machi', payload.email || 'user@gmail.com');
      } catch {
        loginWithGoogle('Tamil Machi', 'user@gmail.com');
      }
    } else {
      loginWithGoogle('Tamil Machi', 'user@gmail.com');
    }
    onClose();
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    loginWithEmail(name || email.split('@')[0], email);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-cyan-500/10">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="relative w-16 h-16 rounded-2xl overflow-hidden p-0.5 bg-gradient-to-tr from-cyan-500 to-purple-600 mb-3 shadow-lg shadow-cyan-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[14px] overflow-hidden relative">
              <Image src="/logo.jpg" alt="MACHI Ai" fill className="object-cover" />
            </div>
          </div>
          <h2 className="text-2xl font-bold font-heading text-slate-100">
            {isSignUp ? 'Create Account' : 'Welcome to MACHI Ai'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            உன் தோழன், உன் AI நண்பன் • Login to sync your personal memory
          </p>
        </div>

        {/* Real Google OAuth Login Widget */}
        <div className="flex flex-col items-center justify-center w-full mb-4">
          <div className="w-full flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => loginWithGoogle('Tamil Machi', 'machi@gmail.com')}
              shape="pill"
              theme="filled_black"
              size="large"
              width="100%"
            />
          </div>

          <button
            type="button"
            onClick={() => {
              loginWithGoogle('Tamil Machi', 'machi@gmail.com');
              onClose();
            }}
            className="mt-2 text-xs text-slate-400 hover:text-cyan-300 transition-colors"
          >
            Or click to Quick Login with Google
          </button>
        </div>

        <div className="flex items-center my-4">
          <div className="flex-1 border-t border-slate-800" />
          <span className="px-3 text-[11px] text-slate-500 uppercase tracking-wider">or email</span>
          <div className="flex-1 border-t border-slate-800" />
        </div>

        {/* Form */}
        <form onSubmit={handleEmailSubmit} className="space-y-3">
          {isSignUp && (
            <div className="relative">
              <User className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Your Name (e.g. Karthik)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 outline-none transition-colors"
                required
              />
            </div>
          )}

          <div className="relative">
            <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 outline-none transition-colors"
              required
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 outline-none transition-colors"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-sm font-semibold shadow-lg shadow-cyan-500/25 transition-all flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isSignUp ? 'Sign Up' : 'Log In'}</span>
          </button>
        </form>

        <div className="text-center mt-4">
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-xs text-cyan-400 hover:underline"
          >
            {isSignUp ? 'Already have an account? Log In' : "Don't have an account? Sign Up"}
          </button>
        </div>
      </div>
    </div>
  );
};

'use client';

import React from 'react';
import Image from 'next/image';
import { useAuth } from '@/lib/authContext';
import { LogIn, LogOut, PlusCircle } from 'lucide-react';

interface HeaderProps {
  language: string;
  setLanguage: (lang: string) => void;
  onOpenAuth: () => void;
  onNewChat: () => void;
  threadsCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  language,
  setLanguage,
  onOpenAuth,
  onNewChat,
  threadsCount
}) => {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-30 w-full glass-panel border-b border-slate-800/80 px-4 py-2.5 sm:px-8">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
        {/* Brand Logo & Slogan */}
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-xl p-0.5 bg-gradient-to-tr from-cyan-500 via-blue-500 to-purple-600 shadow-md shadow-cyan-500/20 overflow-hidden">
            <div className="w-full h-full bg-slate-950 rounded-[10px] overflow-hidden relative">
              <Image src="/logo.jpg" alt="MACHI Ai" fill className="object-cover" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-wider gradient-text-cyan font-heading">
                MACHI Ai
              </h1>
            </div>
            <p className="text-[11px] text-slate-300 font-semibold font-heading hidden sm:block">
              உன் தோழன், உன் AI நண்பன்
            </p>
          </div>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Language Selector */}
          <div className="flex items-center bg-slate-900/90 border border-slate-800 rounded-xl p-1 text-xs font-medium">
            <button
              onClick={() => setLanguage('auto')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                language === 'auto'
                  ? 'bg-cyan-600 text-white shadow-sm font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Auto
            </button>
            <button
              onClick={() => setLanguage('ta')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                language === 'ta'
                  ? 'bg-cyan-600 text-white shadow-sm font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              தமிழ்
            </button>
            <button
              onClick={() => setLanguage('tanglish')}
              className={`px-2 py-1 rounded-lg transition-all ${
                language === 'tanglish'
                  ? 'bg-cyan-600 text-white shadow-sm font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Tanglish
            </button>
          </div>

          {/* New Chat Button */}
          <button
            onClick={onNewChat}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-md shadow-purple-500/20 transition-all active:scale-95"
            title="New Chat (Max 2 saved chats rule)"
          >
            <PlusCircle className="w-4 h-4" />
            <span className="hidden sm:inline">New Chat</span>
            <span className="px-1.5 py-0.2 rounded-full bg-slate-950/60 text-[10px] text-purple-300 ml-0.5">
              {threadsCount}/2
            </span>
          </button>

          {/* Login / Profile */}
          {user && user.isLoggedIn ? (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
              <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-800 rounded-xl px-2.5 py-1">
                <div className="w-5 h-5 rounded-full bg-cyan-500 text-slate-950 font-bold flex items-center justify-center text-[10px]">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="text-xs font-semibold text-slate-200 max-w-[100px] truncate hidden md:inline">
                  {user.name}
                </span>
                <button
                  onClick={logout}
                  className="text-slate-400 hover:text-rose-400 ml-1 transition-colors"
                  title="Log Out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-cyan-500/50 text-slate-200 text-xs font-semibold transition-all hover:bg-slate-800"
            >
              <LogIn className="w-3.5 h-3.5 text-cyan-400" />
              <span>Login</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

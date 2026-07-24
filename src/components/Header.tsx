'use client';

import React from 'react';
import Image from 'next/image';
import { useAuth } from '@/lib/authContext';
import { LogIn, LogOut, PlusCircle, Menu, Download } from 'lucide-react';

interface HeaderProps {
  language: string;
  setLanguage: (lang: string) => void;
  onOpenAuth: () => void;
  onNewChat: () => void;
  onToggleSidebar: () => void;
  onOpenExport: () => void;
  threadsCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  language,
  setLanguage,
  onOpenAuth,
  onNewChat,
  onToggleSidebar,
  onOpenExport,
  threadsCount
}) => {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-30 w-full glass-panel border-b border-slate-800/80 px-3 py-2.5 sm:px-6 sm:py-3">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 sm:gap-4">
        {/* ROW 1: Mobile & Desktop Top Bar (Drawer + Brand + New Chat + Auth) */}
        <div className="flex items-center justify-between gap-2">
          {/* Left: Drawer Menu + Brand Logo */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={onToggleSidebar}
              className="p-1.5 sm:p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-all active:scale-95"
              title="Open Navigation Menu"
            >
              <Menu className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            <div className="flex items-center gap-2">
              <div className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-xl overflow-hidden border border-cyan-500/30 shadow-md">
                <Image src="/logo.jpg" alt="MACHI Ai" fill className="object-cover" />
              </div>
              <div>
                <h1 className="text-base sm:text-lg font-bold tracking-tight text-slate-100 font-heading leading-tight">
                  MACHI Ai
                </h1>
                <p className="text-[9px] sm:text-[10px] text-cyan-300 font-medium font-heading">
                  உன் தோழன், உன் AI நண்பன்
                </p>
              </div>
            </div>
          </div>

          {/* Right Mobile Actions (New Chat + User Profile) */}
          <div className="flex items-center gap-1.5 sm:hidden">
            <button
              onClick={onNewChat}
              className="p-1.5 rounded-xl bg-cyan-600 text-white shadow-sm active:scale-95"
              title="New Chat"
            >
              <PlusCircle className="w-4 h-4" />
            </button>

            {user && user.isLoggedIn ? (
              <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-xl px-2 py-1">
                <div className="w-4 h-4 rounded-full bg-cyan-400 text-slate-950 font-bold flex items-center justify-center text-[9px]">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <button onClick={logout} className="text-slate-400 hover:text-rose-400">
                  <LogOut className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="p-1.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-xs font-semibold"
              >
                <LogIn className="w-4 h-4 text-cyan-400" />
              </button>
            )}
          </div>
        </div>

        {/* ROW 2: Mobile Sub-bar / Desktop Main Controls */}
        <div className="flex items-center justify-between sm:justify-end gap-2 pt-1 sm:pt-0 border-t sm:border-t-0 border-slate-800/60">
          {/* Language Selector */}
          <div className="flex items-center bg-slate-900/90 border border-slate-800 rounded-xl p-0.5 sm:p-1 text-[11px] font-medium">
            <button
              onClick={() => setLanguage('auto')}
              className={`px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg transition-all ${
                language === 'auto'
                  ? 'bg-cyan-600 text-white font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Auto
            </button>
            <button
              onClick={() => setLanguage('ta')}
              className={`px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg transition-all ${
                language === 'ta'
                  ? 'bg-cyan-600 text-white font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              தமிழ்
            </button>
            <button
              onClick={() => setLanguage('tanglish')}
              className={`px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg transition-all ${
                language === 'tanglish'
                  ? 'bg-cyan-600 text-white font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Tanglish
            </button>
          </div>

          {/* Desktop Only: New Chat + Chat Count */}
          <button
            onClick={onNewChat}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-cyan-500/50 text-slate-100 text-xs font-semibold shadow-sm transition-all active:scale-95"
            title="New Chat (Max 2 saved chats)"
          >
            <PlusCircle className="w-4 h-4 text-cyan-400" />
            <span>New Chat</span>
            <span className="px-1.5 py-0.2 rounded-full bg-slate-950 text-[10px] text-slate-400 border border-slate-800">
              {threadsCount}/2
            </span>
          </button>

          {/* Export Button */}
          <button
            onClick={onOpenExport}
            className="p-1.5 sm:p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-cyan-400 hover:border-cyan-500/40 transition-all active:scale-95"
            title="Export Chat & Memory Vault"
          >
            <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>

          {/* Desktop Only: User Profile */}
          <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-slate-800">
            {user && user.isLoggedIn ? (
              <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1">
                <div className="w-5 h-5 rounded-full bg-cyan-400 text-slate-950 font-bold flex items-center justify-center text-[10px]">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="text-xs font-semibold text-slate-200 max-w-[80px] truncate">
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
            ) : (
              <button
                onClick={onOpenAuth}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-cyan-500/50 text-slate-200 text-xs font-semibold transition-all hover:bg-slate-800"
              >
                <LogIn className="w-3.5 h-3.5 text-cyan-400" />
                <span>Login</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

'use client';

import React from 'react';
import Image from 'next/image';
import { useAuth } from '@/lib/authContext';
import { LogIn, LogOut, Menu, Download, Languages } from 'lucide-react';

interface HeaderProps {
  language: string;
  setLanguage: (lang: string) => void;
  onOpenAuth: () => void;
  onToggleSidebar: () => void;
  onOpenExport: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  language,
  setLanguage,
  onOpenAuth,
  onToggleSidebar,
  onOpenExport
}) => {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-30 w-full glass-panel border-b border-slate-800 px-3 py-2.5 sm:px-6">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Left: Sidebar Toggle + Logo */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 hover:text-white hover:border-slate-600 transition-all active:scale-95"
            title="Toggle Thread Sidebar"
          >
            <Menu className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          <div className="flex items-center gap-2">
            <div className="relative w-8 h-8 rounded-xl overflow-hidden border border-slate-700">
              <Image src="/logo.jpg" alt="Machi AI" fill className="object-cover" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-bold text-slate-100 font-heading leading-tight tracking-tight">
                Machi AI
              </h1>
              <p className="text-[10px] text-slate-400 font-medium hidden sm:block">
                English • Tanglish • தமிழ் Assistant
              </p>
            </div>
          </div>
        </div>

        {/* Right: Language Pills + Export + Auth */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Language Selector */}
          <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl p-1 text-xs font-medium">
            <Languages className="w-3.5 h-3.5 text-sky-400 ml-1 mr-1 hidden sm:inline" />
            <button
              onClick={() => setLanguage('auto')}
              className={`px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg transition-all ${
                language === 'auto'
                  ? 'bg-sky-600 text-white font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Auto
            </button>
            <button
              onClick={() => setLanguage('en')}
              className={`px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg transition-all ${
                language === 'en'
                  ? 'bg-sky-600 text-white font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              English
            </button>
            <button
              onClick={() => setLanguage('tanglish')}
              className={`px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg transition-all ${
                language === 'tanglish'
                  ? 'bg-sky-600 text-white font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Tanglish
            </button>
            <button
              onClick={() => setLanguage('ta')}
              className={`px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg transition-all ${
                language === 'ta'
                  ? 'bg-sky-600 text-white font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              தமிழ்
            </button>
          </div>

          {/* Export Button */}
          <button
            onClick={onOpenExport}
            className="p-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 hover:text-sky-400 transition-all active:scale-95"
            title="Export Chat & Memory Vault"
          >
            <Download className="w-4 h-4" />
          </button>

          {/* User Profile / Auth */}
          {user && user.isLoggedIn ? (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
              <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1">
                <div className="w-5 h-5 rounded-full bg-sky-500 text-slate-950 font-bold flex items-center justify-center text-[10px]">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="text-xs font-semibold text-slate-200 max-w-[90px] truncate hidden md:inline">
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
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 hover:border-sky-500/50 text-slate-200 text-xs font-semibold transition-all"
            >
              <LogIn className="w-3.5 h-3.5 text-sky-400" />
              <span className="hidden sm:inline">Sign In</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

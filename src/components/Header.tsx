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
    <header className="sticky top-0 z-30 w-full glass-panel border-b border-slate-800/80 px-4 py-3 sm:px-8">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-3 sm:gap-4">
        {/* Left: Drawer Toggle + Logo */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-all active:scale-95"
            title="Open Conversations Sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2.5">
            <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-xl overflow-hidden border border-slate-700 shadow-md">
              <Image src="/logo.jpg" alt="MACHI Ai" fill className="object-cover" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-100 font-heading">
                MACHI Ai
              </h1>
              <p className="text-[10px] text-slate-400 font-medium hidden md:block">
                உன் தோழன், உன் AI நண்பன்
              </p>
            </div>
          </div>
        </div>

        {/* Right: Language + Export + New Chat + User Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Language Selector */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1 text-xs font-medium">
            <button
              onClick={() => setLanguage('auto')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                language === 'auto'
                  ? 'bg-sky-600 text-white font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Auto
            </button>
            <button
              onClick={() => setLanguage('ta')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                language === 'ta'
                  ? 'bg-sky-600 text-white font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              தமிழ்
            </button>
            <button
              onClick={() => setLanguage('tanglish')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                language === 'tanglish'
                  ? 'bg-sky-600 text-white font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Tanglish
            </button>
          </div>

          {/* 1-Click Export Vault Button */}
          <button
            onClick={onOpenExport}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-sky-400 hover:border-sky-500/40 transition-all active:scale-95"
            title="Export Chat & Memory Vault"
          >
            <Download className="w-4 h-4" />
          </button>

          {/* New Chat Button */}
          <button
            onClick={onNewChat}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-sky-500/50 text-slate-100 text-xs font-semibold shadow-sm transition-all active:scale-95"
            title="New Chat (Max 2 saved chats)"
          >
            <PlusCircle className="w-4 h-4 text-sky-400" />
            <span className="hidden sm:inline">New Chat</span>
            <span className="px-1.5 py-0.2 rounded-full bg-slate-950 text-[10px] text-slate-400 border border-slate-800">
              {threadsCount}/2
            </span>
          </button>

          {/* User Profile */}
          {user && user.isLoggedIn ? (
            <div className="flex items-center gap-2 pl-1 sm:pl-2 border-l border-slate-800">
              <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1">
                <div className="w-5 h-5 rounded-full bg-sky-500 text-slate-950 font-bold flex items-center justify-center text-[10px]">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="text-xs font-semibold text-slate-200 max-w-[80px] truncate hidden lg:inline">
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
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-sky-500/50 text-slate-200 text-xs font-semibold transition-all hover:bg-slate-800"
            >
              <LogIn className="w-3.5 h-3.5 text-sky-400" />
              <span className="hidden sm:inline">Login</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

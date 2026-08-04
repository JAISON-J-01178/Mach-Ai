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
    <header className="sticky top-0 z-30 w-full bg-[#09090b] border-b border-[#27272a] px-3 py-2.5 sm:px-6 flex-shrink-0">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Left: Sidebar Toggle + Logo */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-xl bg-[#18181b] border border-[#27272a] text-[#fafafa] hover:bg-[#27272a] transition-all active:scale-95"
            title="Toggle Sidebar"
          >
            <Menu className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          <div className="flex items-center gap-2.5">
            <div className="relative w-8 h-8 rounded-xl overflow-hidden border border-[#27272a]">
              <Image src="/logo.jpg" alt="Machi AI" fill className="object-cover" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-bold text-[#fafafa] font-heading leading-tight tracking-tight">
                Machi AI
              </h1>
              <p className="text-[10px] text-[#a1a1aa] font-medium hidden sm:block">
                Trilingual AI Assistant
              </p>
            </div>
          </div>
        </div>

        {/* Middle: Language Selector */}
        <div className="flex items-center bg-[#18181b] border border-[#27272a] rounded-xl p-1 text-xs font-medium">
          <Languages className="w-3.5 h-3.5 text-[#a1a1aa] ml-1 mr-1 hidden sm:inline" />
          <button
            onClick={() => setLanguage('auto')}
            className={`px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg transition-all ${
              language === 'auto'
                ? 'bg-[#ffffff] text-[#09090b] font-bold shadow-sm'
                : 'text-[#a1a1aa] hover:text-[#fafafa]'
            }`}
          >
            Auto
          </button>
          <button
            onClick={() => setLanguage('en')}
            className={`px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg transition-all ${
              language === 'en'
                ? 'bg-[#ffffff] text-[#09090b] font-bold shadow-sm'
                : 'text-[#a1a1aa] hover:text-[#fafafa]'
            }`}
          >
            English
          </button>
          <button
            onClick={() => setLanguage('tanglish')}
            className={`px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg transition-all ${
              language === 'tanglish'
                ? 'bg-[#ffffff] text-[#09090b] font-bold shadow-sm'
                : 'text-[#a1a1aa] hover:text-[#fafafa]'
            }`}
          >
            Tanglish
          </button>
          <button
            onClick={() => setLanguage('ta')}
            className={`px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg transition-all ${
              language === 'ta'
                ? 'bg-[#ffffff] text-[#09090b] font-bold shadow-sm'
                : 'text-[#a1a1aa] hover:text-[#fafafa]'
            }`}
          >
            தமிழ்
          </button>
        </div>

        {/* Right: Export + Google Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={onOpenExport}
            className="p-2 rounded-xl bg-[#18181b] border border-[#27272a] text-[#fafafa] hover:bg-[#27272a] transition-all active:scale-95"
            title="Export Chat Transcript"
          >
            <Download className="w-4 h-4" />
          </button>

          {user && user.isLoggedIn ? (
            <div className="flex items-center gap-2 pl-2 border-l border-[#27272a]">
              <div className="flex items-center gap-2 bg-[#18181b] border border-[#27272a] rounded-xl px-2.5 py-1">
                <div className="w-5 h-5 rounded-full bg-[#fafafa] text-[#09090b] font-bold flex items-center justify-center text-[10px]">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="text-xs font-semibold text-[#fafafa] max-w-[90px] truncate hidden md:inline">
                  {user.name}
                </span>
                <button
                  onClick={logout}
                  className="text-[#a1a1aa] hover:text-rose-400 ml-1 transition-colors"
                  title="Log Out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#ffffff] text-[#09090b] font-semibold text-xs transition-all hover:bg-[#e4e4e7] active:scale-95"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign In</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

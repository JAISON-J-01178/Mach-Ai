'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useAuth } from '@/lib/authContext';
import { ChatThread, groupThreadsChronologically } from '@/lib/memoryEngine';
import {
  Plus,
  MessageSquare,
  Trash2,
  LogIn,
  LogOut,
  X,
  Search,
  Calendar,
  Clock,
  Archive
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  threads: ChatThread[];
  activeThreadId: string;
  onSelectThread: (id: string) => void;
  onNewChat: () => void;
  onRequestDeleteThread: (thread: ChatThread) => void;
  onOpenAuth: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  threads,
  activeThreadId,
  onSelectThread,
  onNewChat,
  onRequestDeleteThread,
  onOpenAuth
}) => {
  const { user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredThreads = threads.filter((t) =>
    (t.title || 'New Conversation').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const { today, yesterday, older } = groupThreadsChronologically(filteredThreads);

  const renderGroup = (title: string, icon: React.ReactNode, groupItems: ChatThread[]) => {
    if (groupItems.length === 0) return null;

    return (
      <div className="space-y-1 mb-4">
        <div className="flex items-center gap-1.5 px-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
          {icon}
          <span>{title}</span>
        </div>
        {groupItems.map((t) => {
          const isActive = t.id === activeThreadId;
          return (
            <div
              key={t.id}
              onClick={() => {
                onSelectThread(t.id);
                onClose();
              }}
              className={`group flex items-center justify-between p-2.5 rounded-xl transition-all border cursor-pointer ${
                isActive
                  ? 'bg-slate-800 border-sky-500/50 text-slate-100 font-medium shadow-sm'
                  : 'bg-slate-900/40 border-transparent text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <MessageSquare className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-sky-400' : 'text-slate-500'}`} />
                <span className="text-xs truncate">{t.title || 'New Conversation'}</span>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRequestDeleteThread(t);
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-700/60 transition-colors opacity-80 sm:opacity-0 group-hover:opacity-100"
                title="Delete thread"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <>
      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Drawer */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-40 w-72 bg-slate-900 border-r border-slate-800/80 flex flex-col justify-between p-4 transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Header */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="relative w-8 h-8 rounded-xl overflow-hidden border border-slate-700">
                <Image src="/logo.jpg" alt="Machi AI" fill className="object-cover" />
              </div>
              <h2 className="text-base font-bold text-slate-100 font-heading tracking-tight">
                Machi AI
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 lg:hidden"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* + New Chat */}
          <button
            onClick={() => {
              onNewChat();
              onClose();
            }}
            className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs shadow-md transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>New Chat</span>
          </button>

          {/* Search History */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-500" />
            <input
              type="text"
              placeholder="Search chat history..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950/80 border border-slate-800 focus:border-sky-500 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 outline-none transition-colors placeholder-slate-500"
            />
          </div>
        </div>

        {/* Chronological Threads Feed */}
        <div className="flex-1 overflow-y-auto my-3 pr-1">
          {threads.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-500">
              No conversations yet. Start a new chat!
            </div>
          ) : (
            <>
              {renderGroup('Today', <Clock className="w-3 h-3 text-sky-400" />, today)}
              {renderGroup('Yesterday', <Calendar className="w-3 h-3 text-purple-400" />, yesterday)}
              {renderGroup('Older', <Archive className="w-3 h-3 text-slate-400" />, older)}
            </>
          )}
        </div>

        {/* Footer User Profile */}
        <div className="pt-3 border-t border-slate-800">
          {user && user.isLoggedIn ? (
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-7 h-7 rounded-full bg-sky-500 text-slate-950 font-bold flex items-center justify-center text-xs">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-slate-200 truncate">{user.name}</p>
                  <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
                </div>
              </div>
              <button
                onClick={logout}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 transition-colors"
                title="Log Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                onOpenAuth();
                onClose();
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-sky-500/50 text-slate-200 text-xs font-semibold transition-all"
            >
              <LogIn className="w-4 h-4 text-sky-400" />
              <span>Sign In with Google</span>
            </button>
          )}
        </div>
      </aside>
    </>
  );
};

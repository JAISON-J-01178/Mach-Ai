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
  isOpenMobile: boolean;
  isDesktopOpen: boolean;
  onCloseMobile: () => void;
  threads: ChatThread[];
  activeThreadId: string;
  onSelectThread: (id: string) => void;
  onNewChat: () => void;
  onRequestDeleteThread: (thread: ChatThread) => void;
  onOpenAuth: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpenMobile,
  isDesktopOpen,
  onCloseMobile,
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
        <div className="flex items-center gap-1.5 px-2 text-[11px] font-bold text-[#a1a1aa] uppercase tracking-wider mb-1.5">
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
                onCloseMobile();
              }}
              className={`group flex items-center justify-between p-2.5 rounded-xl transition-all border cursor-pointer ${
                isActive
                  ? 'bg-[#27272a] border-[#3f3f46] text-[#fafafa] font-semibold shadow-sm'
                  : 'bg-[#18181b] border-transparent text-[#a1a1aa] hover:bg-[#27272a]/60 hover:text-[#fafafa]'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <MessageSquare className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-[#fafafa]' : 'text-[#71717a]'}`} />
                <span className="text-xs truncate">{t.title || 'New Conversation'}</span>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRequestDeleteThread(t);
                }}
                className="p-1.5 rounded-lg text-[#71717a] hover:text-rose-400 hover:bg-[#3f3f46] transition-colors opacity-80 sm:opacity-0 group-hover:opacity-100"
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
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Panel */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-40 bg-[#18181b] border-r border-[#27272a] flex flex-col justify-between p-4 transition-all duration-300 ease-in-out flex-shrink-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } ${
          isDesktopOpen ? 'lg:w-64 lg:p-4' : 'lg:w-0 lg:p-0 lg:overflow-hidden lg:border-none'
        }`}
      >
        <div className="flex flex-col gap-3 min-w-[224px]">
          {/* Top Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="relative w-8 h-8 rounded-xl overflow-hidden border border-[#27272a]">
                <Image src="/logo.jpg" alt="Machi AI" fill className="object-cover" />
              </div>
              <h2 className="text-base font-bold text-[#fafafa] font-heading tracking-tight">
                Machi AI
              </h2>
            </div>
            <button
              onClick={onCloseMobile}
              className="p-1.5 rounded-lg text-[#a1a1aa] hover:text-[#fafafa] hover:bg-[#27272a] lg:hidden"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* + New Chat Button (Executive Solid White) */}
          <button
            onClick={() => {
              onNewChat();
              onCloseMobile();
            }}
            className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-[#ffffff] hover:bg-[#e4e4e7] text-[#09090b] font-bold text-xs shadow-md transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>New Chat</span>
          </button>

          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-[#71717a]" />
            <input
              type="text"
              placeholder="Search history..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#09090b] border border-[#27272a] focus:border-[#52525b] rounded-xl pl-9 pr-3 py-1.5 text-xs text-[#fafafa] outline-none transition-colors placeholder-[#71717a]"
            />
          </div>
        </div>

        {/* Chronological Threads List */}
        <div className="flex-1 overflow-y-auto my-3 pr-1 min-w-[224px]">
          {threads.length === 0 ? (
            <div className="text-center py-8 text-xs text-[#71717a]">
              No conversations yet. Start a new chat!
            </div>
          ) : (
            <>
              {renderGroup('Today', <Clock className="w-3 h-3 text-[#fafafa]" />, today)}
              {renderGroup('Yesterday', <Calendar className="w-3 h-3 text-[#a1a1aa]" />, yesterday)}
              {renderGroup('Older', <Archive className="w-3 h-3 text-[#71717a]" />, older)}
            </>
          )}
        </div>

        {/* User Footer Profile */}
        <div className="pt-3 border-t border-[#27272a] min-w-[224px]">
          {user && user.isLoggedIn ? (
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#09090b] border border-[#27272a]">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-7 h-7 rounded-full bg-[#fafafa] text-[#09090b] font-bold flex items-center justify-center text-xs">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-[#fafafa] truncate">{user.name}</p>
                  <p className="text-[10px] text-[#a1a1aa] truncate">{user.email}</p>
                </div>
              </div>
              <button
                onClick={logout}
                className="p-1.5 rounded-lg text-[#a1a1aa] hover:text-rose-400 transition-colors"
                title="Log Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                onOpenAuth();
                onCloseMobile();
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#09090b] border border-[#27272a] hover:bg-[#27272a] text-[#fafafa] text-xs font-semibold transition-all"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In with Google</span>
            </button>
          )}
        </div>
      </aside>
    </>
  );
};

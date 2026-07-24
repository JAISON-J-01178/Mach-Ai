'use client';

import React from 'react';
import Image from 'next/image';
import { useAuth } from '@/lib/authContext';
import { ChatThread } from '@/lib/memoryEngine';
import { X, Plus, MessageSquare, Trash2, LogIn, LogOut, Brain } from 'lucide-react';

interface NavigationSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  threads: ChatThread[];
  activeThreadId: string;
  onSelectThread: (id: string) => void;
  onNewChat: () => void;
  onDeleteThread: (id: string) => void;
  onOpenAuth: () => void;
}

export const NavigationSidebar: React.FC<NavigationSidebarProps> = ({
  isOpen,
  onClose,
  threads,
  activeThreadId,
  onSelectThread,
  onNewChat,
  onDeleteThread,
  onOpenAuth
}) => {
  const { user, logout } = useAuth();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex animate-fadeIn">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
      />

      {/* Drawer */}
      <div className="relative z-10 w-80 max-w-[85vw] h-full bg-slate-950 border-r border-slate-800 flex flex-col p-5 shadow-2xl animate-slideRight">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="relative w-9 h-9 rounded-xl overflow-hidden border border-slate-700">
              <Image src="/logo.jpg" alt="MACHI Ai" fill className="object-cover" />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight text-slate-100 font-heading">
                MACHI Ai
              </h2>
              <p className="text-[10px] text-slate-400 font-medium font-heading">
                உன் தோழன், உன் AI நண்பன்
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* New Chat Button */}
        <div className="py-4">
          <button
            onClick={() => {
              onNewChat();
              onClose();
            }}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-900 border border-slate-700 hover:border-sky-500/50 text-slate-100 text-xs font-semibold shadow-sm transition-all active:scale-95"
          >
            <Plus className="w-4 h-4 text-sky-400" />
            <span>New Conversation (2 Max)</span>
          </button>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto space-y-2 py-2">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider px-1">
            <span>Saved Conversations ({threads.length}/2)</span>
            <Brain className="w-3.5 h-3.5 text-purple-400" />
          </div>

          {threads.length === 0 ? (
            <p className="text-xs text-slate-500 px-1 py-4 text-center">No active chats saved</p>
          ) : (
            threads.map((t, idx) => {
              const isActive = t.id === activeThreadId;
              return (
                <div
                  key={t.id}
                  className={`group flex items-center justify-between p-3 rounded-xl transition-all border cursor-pointer ${
                    isActive
                      ? 'bg-slate-900 border-sky-500/50 text-slate-100 shadow-sm'
                      : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-900/50'
                  }`}
                  onClick={() => {
                    onSelectThread(t.id);
                    onClose();
                  }}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <MessageSquare className="w-4 h-4 text-sky-400 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold truncate font-heading">
                        Chat {idx + 1}: {t.title || 'New Conversation'}
                      </p>
                      <p className="text-[10px] text-slate-500">
                        {t.messages.length} messages
                      </p>
                    </div>
                  </div>

                  {/* Explicit Delete Chat Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm('Delete this conversation?')) {
                        onDeleteThread(t.id);
                      }
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                    title="Delete Conversation"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Footer User Profile */}
        <div className="pt-4 border-t border-slate-800">
          {user && user.isLoggedIn ? (
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-8 h-8 rounded-full bg-sky-500 text-slate-950 font-bold flex items-center justify-center text-xs">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-100 truncate">{user.name}</p>
                  <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
                </div>
              </div>

              <button
                onClick={logout}
                className="p-2 rounded-lg text-slate-400 hover:text-rose-400 transition-colors"
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
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-sky-500/50 text-slate-200 text-xs font-semibold transition-all hover:bg-slate-800"
            >
              <LogIn className="w-4 h-4 text-sky-400" />
              <span>Login with Google</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

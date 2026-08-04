'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import Image from 'next/image';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider, useAuth } from '@/lib/authContext';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { MessageItem, Message } from '@/components/MessageItem';
import { AuthModal } from '@/components/AuthModal';
import { ExportVaultModal } from '@/components/ExportVaultModal';
import { QuickSplash } from '@/components/QuickSplash';
import { DeleteConfirmModal } from '@/components/DeleteConfirmModal';
import { RenameModal } from '@/components/RenameModal';
import {
  getSavedThreads,
  saveThreads,
  getUserMemory,
  saveUserMemory,
  generateSmartThreadTitle,
  renameThread,
  ChatThread
} from '@/lib/memoryEngine';
import { Send, Loader2, RefreshCw, Sparkles, Heart, Code, Globe, Terminal } from 'lucide-react';

function MachiApp() {
  const { user } = useAuth();
  const [showSplash, setShowSplash] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  
  // Dual sidebar state: Mobile drawer vs Desktop collapse
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [showDesktopSidebar, setShowDesktopSidebar] = useState(true);

  const [showExportModal, setShowExportModal] = useState(false);

  // Thread modals state
  const [deletingThread, setDeletingThread] = useState<ChatThread | null>(null);
  const [renamingThread, setRenamingThread] = useState<ChatThread | null>(null);

  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string>('');
  const [input, setInput] = useState('');
  const [language, setLanguage] = useState('auto');
  const [isLoading, setIsLoading] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Cross-device Google User ID sync
  useEffect(() => {
    const saved = getSavedThreads(user?.email);
    if (saved.length > 0) {
      setThreads(saved);
      setActiveThreadId(saved[0].id);
    } else {
      const newId = Date.now().toString();
      const initialThread: ChatThread = {
        id: newId,
        title: 'New Conversation',
        messages: [],
        updatedAt: Date.now()
      };
      const updated = saveThreads([initialThread], user?.email);
      setThreads(updated);
      setActiveThreadId(newId);
    }
  }, [user?.email]);

  // Sync user memory
  useEffect(() => {
    if (user && user.name) {
      const mem = getUserMemory(user.name);
      mem.userName = user.name;
      saveUserMemory(mem);
    }
  }, [user]);

  const activeThread = useMemo(
    () => threads.find((t) => t.id === activeThreadId) || threads[0],
    [threads, activeThreadId]
  );
  
  const messages = useMemo(
    () => (activeThread ? activeThread.messages : []),
    [activeThread]
  );

  // Auto-scroll inside chat container
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleNewChat = () => {
    const newId = Date.now().toString();
    const newThread: ChatThread = {
      id: newId,
      title: `New Chat`,
      messages: [],
      updatedAt: Date.now()
    };

    const updatedThreads = saveThreads([newThread, ...threads], user?.email);
    setThreads(updatedThreads);
    setActiveThreadId(newId);
  };

  const handleConfirmDeleteThread = () => {
    if (!deletingThread) return;
    const targetId = deletingThread.id;
    const remaining = threads.filter((t) => t.id !== targetId);

    if (remaining.length === 0) {
      const newId = Date.now().toString();
      const initialThread: ChatThread = {
        id: newId,
        title: 'New Conversation',
        messages: [],
        updatedAt: Date.now()
      };
      const updated = saveThreads([initialThread], user?.email);
      setThreads(updated);
      setActiveThreadId(newId);
    } else {
      const updated = saveThreads(remaining, user?.email);
      setThreads(updated);
      if (activeThreadId === targetId) {
        setActiveThreadId(updated[0].id);
      }
    }

    setDeletingThread(null);
  };

  const handleSaveRenameThread = (newTitle: string) => {
    if (!renamingThread) return;
    const updated = renameThread(renamingThread.id, newTitle, threads, user?.email);
    setThreads(updated);
    setRenamingThread(null);
  };

  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText || input;
    if (!textToSend.trim() || isLoading || !activeThreadId) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const updatedMessages = [...messages, userMsg];

    // Advanced Auto-Naming with Fallback to 2nd message
    const updatedThreads = threads.map((t) => {
      if (t.id === activeThreadId) {
        const newTitle = generateSmartThreadTitle(updatedMessages, threads, activeThreadId);

        return {
          ...t,
          messages: updatedMessages,
          title: newTitle,
          updatedAt: Date.now()
        };
      }
      return t;
    });

    const saved = saveThreads(updatedThreads, user?.email);
    setThreads(saved);

    if (!customText) {
      setInput('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }

    setIsLoading(true);

    try {
      const memory = getUserMemory(user?.name || '');

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages.map((m) => ({ role: m.role, content: m.content })),
          persona: 'chill',
          language,
          userName: memory.userName || user?.name || ''
        })
      });

      const data = await res.json();

      if (data.reply) {
        const botMsg: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        const finalMessages = [...updatedMessages, botMsg];
        const finalThreads = threads.map((t) => {
          if (t.id === activeThreadId) {
            return {
              ...t,
              messages: finalMessages,
              updatedAt: Date.now()
            };
          }
          return t;
        });

        setThreads(saveThreads(finalThreads, user?.email));
      }
    } catch {
      const fallbackMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Machi AI connection slow ah iruku. Retry in 2 seconds! 🚀',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      const finalMessages = [...updatedMessages, fallbackMsg];
      const finalThreads = threads.map((t) => {
        if (t.id === activeThreadId) {
          return { ...t, messages: finalMessages, updatedAt: Date.now() };
        }
        return t;
      });
      setThreads(saveThreads(finalThreads, user?.email));
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleSidebar = () => {
    if (window.innerWidth < 1024) {
      setShowMobileSidebar(!showMobileSidebar);
    } else {
      setShowDesktopSidebar(!showDesktopSidebar);
    }
  };

  const trilingualPrompts = [
    { icon: Globe, lang: 'English', text: 'Help me draft a professional email response for a client meeting.' },
    { icon: Heart, lang: 'Tanglish', text: 'Machi, life la focus & motivation vara oru simple Tanglish advice thaa da!' },
    { icon: Terminal, lang: 'Pure Tamil', text: 'தமிழ் கலாச்சாரம் மற்றும் கணினி தொழில்நுட்பம் பற்றி விளக்குக.' },
    { icon: Code, lang: 'Coding', text: 'Explain React custom hooks with a code example.' }
  ];

  return (
    <div className="h-[100dvh] max-h-[100dvh] w-screen overflow-hidden flex flex-col justify-between bg-[#09090b] text-[#fafafa] font-sans selection:bg-[#ffffff] selection:text-[#09090b]">
      {/* Quick 1.2s Branded Splash */}
      {showSplash && <QuickSplash onFinish={() => setShowSplash(false)} />}

      {/* Auth Modal */}
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!deletingThread}
        threadTitle={deletingThread?.title || ''}
        onConfirm={handleConfirmDeleteThread}
        onCancel={() => setDeletingThread(null)}
      />

      {/* Rename Thread Modal */}
      <RenameModal
        isOpen={!!renamingThread}
        currentTitle={renamingThread?.title || ''}
        onSave={handleSaveRenameThread}
        onCancel={() => setRenamingThread(null)}
      />

      {/* Export & Memory Vault Modal */}
      <ExportVaultModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        messages={messages}
        userName={user?.name || ''}
      />

      {/* Main Layout Shell */}
      <div className="flex flex-1 h-full min-h-0 overflow-hidden relative">
        {/* Sidebar Navigation */}
        <Sidebar
          isOpenMobile={showMobileSidebar}
          isDesktopOpen={showDesktopSidebar}
          onCloseMobile={() => setShowMobileSidebar(false)}
          threads={threads}
          activeThreadId={activeThreadId}
          onSelectThread={(id) => setActiveThreadId(id)}
          onNewChat={handleNewChat}
          onRequestRenameThread={(t) => setRenamingThread(t)}
          onRequestDeleteThread={(t) => setDeletingThread(t)}
          onOpenAuth={() => setShowAuthModal(true)}
        />

        {/* Main Workspace */}
        <div className="flex-1 flex flex-col h-full min-w-0 bg-[#09090b] relative overflow-hidden justify-between">
          {/* Header Navigation (Pinned Top) */}
          <Header
            language={language}
            setLanguage={setLanguage}
            onOpenAuth={() => setShowAuthModal(true)}
            onToggleSidebar={handleToggleSidebar}
            onOpenExport={() => setShowExportModal(true)}
          />

          {/* Chat Feed Workspace (Scrolls inside center container) */}
          <main className="flex-1 overflow-y-auto px-4 py-4 sm:px-8 max-w-4xl mx-auto w-full min-h-0">
            {/* Empty State */}
            {messages.length === 0 && (
              <div className="my-auto py-12 flex flex-col items-center justify-center text-center">
                <div className="relative w-16 h-16 rounded-2xl overflow-hidden border border-[#27272a] shadow-lg mb-4">
                  <Image src="/logo.jpg" alt="Machi AI" fill className="object-cover" />
                </div>

                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#fafafa] font-heading mb-1">
                  How can Machi AI help you today?
                </h2>
                <p className="text-xs text-[#a1a1aa] max-w-md mb-8">
                  {user?.name ? `Welcome back, ${user.name}. ` : ''}
                  English • Tanglish • தமிழ் AI Assistant
                </p>

                {/* Trilingual Starter Chips */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-2xl text-left">
                  {trilingualPrompts.map((p, idx) => {
                    const Icon = p.icon;
                    return (
                      <button
                        key={idx}
                        onClick={() => handleSendMessage(p.text)}
                        className="p-4 rounded-2xl bg-[#18181b] border border-[#27272a] hover:border-[#52525b] transition-all text-xs font-medium text-[#fafafa] group flex flex-col justify-between"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#fafafa] bg-[#27272a] px-2 py-0.5 rounded-md">
                            {p.lang}
                          </span>
                          <Icon className="w-4 h-4 text-[#a1a1aa] group-hover:text-[#fafafa] transition-colors" />
                        </div>
                        <p className="line-clamp-2 leading-relaxed text-[#a1a1aa] group-hover:text-[#fafafa] transition-colors">
                          {p.text}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Active Messages Feed */}
            {messages.length > 0 && (
              <div className="flex flex-col gap-4 py-2">
                {messages.map((msg) => (
                  <MessageItem
                    key={msg.id}
                    message={msg}
                    onRegenerate={() => {
                      if (messages.length > 1) {
                        const lastUserMsg = [...messages].reverse().find((m) => m.role === 'user');
                        if (lastUserMsg) handleSendMessage(lastUserMsg.content);
                      }
                    }}
                  />
                ))}

                {isLoading && (
                  <div className="flex items-center gap-3 p-4 rounded-2xl bg-[#18181b] border border-[#27272a] max-w-[90%] animate-pulse">
                    <div className="w-7 h-7 rounded-xl bg-[#27272a] flex items-center justify-center text-[#fafafa]">
                      <Loader2 className="w-4 h-4 animate-spin" />
                    </div>
                    <div className="text-xs text-[#fafafa] font-medium flex items-center gap-2">
                      <span>Machi AI is generating response...</span>
                      <Sparkles className="w-3.5 h-3.5 text-[#fafafa] animate-spin" />
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>
            )}
          </main>

          {/* Input Bar (Locked Bottom with Safe Area Padding & Zero Gap) */}
          <div className="p-3 sm:p-4 bg-[#09090b] border-t border-[#27272a] flex-shrink-0 pb-safe m-0">
            <div className="max-w-4xl mx-auto">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-end gap-2 p-2 rounded-2xl bg-[#18181b] border border-[#27272a] transition-all focus-within:border-[#52525b]"
              >
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={handleTextareaChange}
                  onKeyDown={handleKeyDown}
                  rows={1}
                  placeholder="Ask Machi AI..."
                  className="w-full bg-transparent border-none outline-none text-sm text-[#fafafa] placeholder-[#71717a] py-1.5 px-2 font-sans resize-none max-h-40 min-h-[36px] leading-relaxed"
                  disabled={isLoading}
                />

                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className={`p-2.5 rounded-xl flex items-center justify-center transition-all flex-shrink-0 ${
                    input.trim() && !isLoading
                      ? 'bg-[#ffffff] text-[#09090b] shadow-md hover:bg-[#e4e4e7] active:scale-95'
                      : 'bg-[#27272a] text-[#71717a] cursor-not-allowed'
                  }`}
                  title="Send Message"
                >
                  {isLoading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const googleClientId =
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
    '560458778439-b96elns70cmk03r33spt91c2qkjlsc9c.apps.googleusercontent.com';

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <AuthProvider>
        <MachiApp />
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}

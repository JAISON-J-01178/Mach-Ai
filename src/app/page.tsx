'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import Image from 'next/image';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider, useAuth } from '@/lib/authContext';
import { Header } from '@/components/Header';
import { MessageItem, Message } from '@/components/MessageItem';
import { SplashScreen } from '@/components/SplashScreen';
import { ThreeBackground } from '@/components/ThreeBackground';
import { AuthModal } from '@/components/AuthModal';
import { NavigationSidebar } from '@/components/NavigationSidebar';
import { ExportVaultModal } from '@/components/ExportVaultModal';
import { getSavedThreads, saveThreads, getUserMemory, saveUserMemory, ChatThread } from '@/lib/memoryEngine';
import { Send, Loader2, RefreshCw, Sparkles, MessageSquare, Trash2, Heart, Code, Flame } from 'lucide-react';

function MachiApp() {
  const { user } = useAuth();
  const [showSplash, setShowSplash] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);

  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string>('');
  const [input, setInput] = useState('');
  const [language, setLanguage] = useState('auto');
  const [isLoading, setIsLoading] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Load threads on mount
  useEffect(() => {
    const saved = getSavedThreads();
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
      const updated = saveThreads([initialThread]);
      setThreads(updated);
      setActiveThreadId(newId);
    }
  }, []);

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

  // Scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleNewChat = () => {
    const newId = Date.now().toString();
    const newThread: ChatThread = {
      id: newId,
      title: `Chat ${threads.length + 1}`,
      messages: [],
      updatedAt: Date.now()
    };

    const updatedThreads = saveThreads([newThread, ...threads]);
    setThreads(updatedThreads);
    setActiveThreadId(newId);
  };

  const handleDeleteThread = (id: string) => {
    const remaining = threads.filter((t) => t.id !== id);
    if (remaining.length === 0) {
      const newId = Date.now().toString();
      const initialThread: ChatThread = {
        id: newId,
        title: 'New Conversation',
        messages: [],
        updatedAt: Date.now()
      };
      const updated = saveThreads([initialThread]);
      setThreads(updated);
      setActiveThreadId(newId);
    } else {
      const updated = saveThreads(remaining);
      setThreads(updated);
      if (activeThreadId === id) {
        setActiveThreadId(updated[0].id);
      }
    }
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

    const updatedThreads = threads.map((t) => {
      if (t.id === activeThreadId) {
        return {
          ...t,
          messages: updatedMessages,
          title: t.messages.length === 0 ? textToSend.slice(0, 25) : t.title,
          updatedAt: Date.now()
        };
      }
      return t;
    });

    const saved = saveThreads(updatedThreads);
    setThreads(saved);

    if (!customText) setInput('');
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

        setThreads(saveThreads(finalThreads));
      }
    } catch {
      const fallbackMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Machi! Connection chota slow ah iruku. Retry in 2 seconds! 🚀',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      const finalMessages = [...updatedMessages, fallbackMsg];
      const finalThreads = threads.map((t) => {
        if (t.id === activeThreadId) {
          return { ...t, messages: finalMessages, updatedAt: Date.now() };
        }
        return t;
      });
      setThreads(saveThreads(finalThreads));
    } finally {
      setIsLoading(false);
    }
  };

  const samplePrompts = [
    { icon: Heart, text: 'Machi, enakku oru simple Tanglish love advice thaa da!' },
    { icon: Flame, text: 'Machi, trending Vadivelu comedy dialogue sollu!' },
    { icon: Code, text: 'Explain JavaScript Async await in simple Tanglish!' }
  ];

  return (
    <div className="relative flex flex-col min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-sky-500 selection:text-slate-950 overflow-x-hidden">
      {/* Splash Screen */}
      {showSplash && <SplashScreen onFinish={() => setShowSplash(false)} />}

      {/* Ambient Canvas Background */}
      <ThreeBackground />

      {/* Auth Modal */}
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />

      {/* Export & Memory Vault Modal */}
      <ExportVaultModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        messages={messages}
        userName={user?.name || ''}
      />

      {/* Navigation Drawer */}
      <NavigationSidebar
        isOpen={showSidebar}
        onClose={() => setShowSidebar(false)}
        threads={threads}
        activeThreadId={activeThreadId}
        onSelectThread={(id) => setActiveThreadId(id)}
        onNewChat={handleNewChat}
        onDeleteThread={handleDeleteThread}
        onOpenAuth={() => setShowAuthModal(true)}
      />

      {/* MNC Header */}
      <Header
        language={language}
        setLanguage={setLanguage}
        onOpenAuth={() => setShowAuthModal(true)}
        onNewChat={handleNewChat}
        onToggleSidebar={() => setShowSidebar(true)}
        onOpenExport={() => setShowExportModal(true)}
        threadsCount={threads.length}
      />

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 flex flex-col w-full max-w-4xl mx-auto px-4 pt-4 sm:pt-6 mb-28">
        {/* Saved Threads Bar + Delete Chat Action */}
        <div className="flex items-center justify-between gap-2 mb-3 bg-slate-900/60 border border-slate-800/80 rounded-2xl px-3 py-2">
          <div className="flex items-center gap-2 overflow-x-auto min-w-0">
            <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
              <MessageSquare className="w-3.5 h-3.5 text-sky-400" />
              <span className="hidden sm:inline">Active Chats:</span>
            </span>
            {threads.map((t, idx) => (
              <button
                key={t.id}
                onClick={() => setActiveThreadId(t.id)}
                className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all border whitespace-nowrap ${
                  t.id === activeThreadId
                    ? 'bg-sky-600 text-white border-sky-400 shadow-sm'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                Chat {idx + 1}
              </button>
            ))}
          </div>

          {/* Delete Current Chat Button */}
          {activeThreadId && (
            <button
              onClick={() => handleDeleteThread(activeThreadId)}
              className="flex items-center gap-1 text-[11px] font-semibold text-slate-400 hover:text-rose-400 p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
              title="Delete Current Chat"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Delete</span>
            </button>
          )}
        </div>

        {/* MNC Welcome Screen (Shows ONLY when conversation has 0 messages!) */}
        {messages.length === 0 && (
          <div className="my-auto py-8 text-center flex flex-col items-center justify-center animate-fadeIn">
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border border-slate-700 shadow-2xl mb-4">
              <Image src="/logo.jpg" alt="MACHI Ai" fill className="object-cover" />
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight gradient-text-cyan font-heading mb-1">
              MACHI Ai
            </h2>
            <p className="text-sm font-semibold text-slate-300 font-heading mb-6">
              உன் தோழன், உன் AI நண்பன்
            </p>

            {/* Clean Prompt Chips */}
            <div className="w-full max-w-lg space-y-2">
              {samplePrompts.map((p, idx) => {
                const Icon = p.icon;
                return (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(p.text)}
                    className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-200 text-xs font-medium transition-all text-left group"
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-4 h-4 text-sky-400 group-hover:scale-110 transition-transform" />
                      <span>{p.text}</span>
                    </div>
                    <span className="text-[10px] text-slate-500 group-hover:text-slate-300">Ask &rarr;</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Message Feed */}
        {messages.length > 0 && (
          <div className="flex flex-col gap-4 py-2">
            {messages.map((msg) => (
              <MessageItem key={msg.id} message={msg} />
            ))}

            {isLoading && (
              <div className="flex items-center gap-3 p-4 rounded-2xl bg-slate-950 border border-slate-800 max-w-[90%] animate-pulse">
                <div className="w-8 h-8 rounded-xl bg-sky-600/20 flex items-center justify-center text-sky-400">
                  <Loader2 className="w-4 h-4 animate-spin" />
                </div>
                <div className="text-xs text-sky-300 font-medium flex items-center gap-2">
                  <span>MACHI Ai Yosikudhu (Thinking)...</span>
                  <Sparkles className="w-3.5 h-3.5 text-sky-400 animate-spin" />
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
        )}
      </main>

      {/* Bottom Floating Input Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-30 p-3 sm:p-4 glass-panel border-t border-slate-800/80">
        <div className="max-w-4xl mx-auto flex items-center gap-2">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex-1 flex items-center gap-2 px-3 py-1.5 rounded-2xl glass-input transition-all"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enna machi kekkanum? (Type in Tamil, Tanglish or English)..."
              className="w-full bg-transparent border-none outline-none text-sm text-slate-100 placeholder-slate-500 py-1.5 font-sans"
              disabled={isLoading}
            />

            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className={`p-2.5 rounded-xl flex items-center justify-center transition-all ${
                input.trim() && !isLoading
                  ? 'bg-sky-600 hover:bg-sky-500 text-white shadow-md transition-transform active:scale-95'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
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

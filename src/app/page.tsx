'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import Image from 'next/image';
import { AuthProvider, useAuth } from '@/lib/authContext';
import { Header } from '@/components/Header';
import { PersonaSelector } from '@/components/PersonaSelector';
import { QuickPrompts } from '@/components/QuickPrompts';
import { MessageItem, Message } from '@/components/MessageItem';
import { VoiceInput } from '@/components/VoiceInput';
import { SplashScreen } from '@/components/SplashScreen';
import { ThreeBackground } from '@/components/ThreeBackground';
import { Ticker3D } from '@/components/Ticker3D';
import { AuthModal } from '@/components/AuthModal';
import { getSavedThreads, saveThreads, getUserMemory, saveUserMemory, ChatThread } from '@/lib/memoryEngine';
import { Send, Loader2, RefreshCw, MessageSquare, Sparkles } from 'lucide-react';

function MachiApp() {
  const { user } = useAuth();
  const [showSplash, setShowSplash] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string>('');
  const [input, setInput] = useState('');
  const [persona, setPersona] = useState('chill');
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

  // Update current user memory if user changes name
  useEffect(() => {
    if (user && user.name) {
      const mem = getUserMemory(user.name);
      mem.userName = user.name;
      saveUserMemory(mem);
    }
  }, [user]);

  // Current active messages memoized
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

  // Handle New Chat creation (Enforces 2-conversation limit rule)
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
          persona,
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
        content: 'Machi! Connection chota slow ah iruku. Let us try again in 2 seconds! 🚀',
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

  return (
    <div className="relative flex flex-col min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-cyan-500 selection:text-slate-950 overflow-x-hidden">
      {/* Splash Screen */}
      {showSplash && <SplashScreen onFinish={() => setShowSplash(false)} />}

      {/* 3D Particle Canvas Background */}
      <ThreeBackground />

      {/* Auth Modal */}
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />

      {/* Header */}
      <Header
        language={language}
        setLanguage={setLanguage}
        onOpenAuth={() => setShowAuthModal(true)}
        onNewChat={handleNewChat}
        threadsCount={threads.length}
      />

      {/* 3D Infinite Ticker Text */}
      <Ticker3D />

      {/* Main Container */}
      <main className="relative z-10 flex-1 flex flex-col w-full max-w-4xl mx-auto px-4 py-4 mb-28">
        {/* Thread Tabs (Max 2 Saved Chats) */}
        {threads.length > 1 && (
          <div className="flex items-center gap-2 mb-3 overflow-x-auto py-1 px-1">
            <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
              <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />
              <span>Saved Chats (Max 2):</span>
            </span>
            {threads.map((t, idx) => (
              <button
                key={t.id}
                onClick={() => setActiveThreadId(t.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                  t.id === activeThreadId
                    ? 'bg-cyan-600 text-white border-cyan-400 shadow-md shadow-cyan-500/20'
                    : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                Chat {idx + 1}: {t.title.slice(0, 18)}
              </button>
            ))}
          </div>
        )}

        {/* Persona Selector */}
        <PersonaSelector currentPersona={persona} setPersona={setPersona} />

        {/* Welcome State */}
        {messages.length === 0 && (
          <div className="my-auto py-8 text-center flex flex-col items-center justify-center animate-fadeIn">
            <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-3xl p-1 bg-gradient-to-tr from-cyan-500 via-blue-500 to-purple-600 shadow-2xl shadow-cyan-500/30 mb-4 animate-float">
              <div className="w-full h-full bg-slate-950 rounded-[22px] overflow-hidden relative">
                <Image src="/logo.jpg" alt="MACHI Ai" fill className="object-cover" />
              </div>
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-wider gradient-text-cyan font-heading mb-2">
              MACHI Ai
            </h2>
            <p className="text-lg font-bold text-slate-200 font-heading mb-1">
              உன் தோழன், உன் AI நண்பன்
            </p>
            <p className="text-xs text-slate-400 max-w-md mx-auto mb-6">
              {user?.name ? `Welcome back, ${user.name}! ` : ''}
              Smart • Friendly • Always Here for Tamil & English Chat
            </p>

            <QuickPrompts onSelectPrompt={(prompt) => handleSendMessage(prompt)} />
          </div>
        )}

        {/* Messages */}
        {messages.length > 0 && (
          <div className="flex flex-col gap-4 py-2">
            {messages.map((msg) => (
              <MessageItem key={msg.id} message={msg} />
            ))}

            {isLoading && (
              <div className="flex items-center gap-3 p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80 max-w-[90%] animate-pulse">
                <div className="w-8 h-8 rounded-xl bg-cyan-600/30 flex items-center justify-center text-cyan-400">
                  <Loader2 className="w-4 h-4 animate-spin" />
                </div>
                <div className="text-xs text-cyan-300 font-medium flex items-center gap-2">
                  <span>MACHI Ai Yosikudhu (Thinking)...</span>
                  <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-spin" />
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
        )}
      </main>

      {/* Input Bar */}
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

            <VoiceInput
              language={language}
              onTranscript={(transcript) => {
                setInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
              }}
            />

            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className={`p-2.5 rounded-xl flex items-center justify-center transition-all ${
                input.trim() && !isLoading
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/25 hover:opacity-90 active:scale-95'
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
  return (
    <AuthProvider>
      <MachiApp />
    </AuthProvider>
  );
}

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
import { getSavedThreads, saveThreads, getUserMemory, saveUserMemory, ChatThread } from '@/lib/memoryEngine';
import { Send, Loader2, RefreshCw, Sparkles, Heart, Code, Globe, Terminal } from 'lucide-react';

function MachiApp() {
  const { user } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);

  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string>('');
  const [input, setInput] = useState('');
  const [language, setLanguage] = useState('auto');
  const [isLoading, setIsLoading] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Load threads on mount (UNLIMITED storage per User ID)
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

  // Active thread memo
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

  // Auto expand textarea height dynamically
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
    }
  };

  // Keyboard shortcut: Enter sends, Shift+Enter new line
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
      const updated = saveThreads([initialThread], user?.email);
      setThreads(updated);
      setActiveThreadId(newId);
    } else {
      const updated = saveThreads(remaining, user?.email);
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
      setThreads(saveThreads(finalThreads, user?.email));
    } finally {
      setIsLoading(false);
    }
  };

  const trilingualPrompts = [
    { icon: Globe, lang: 'English', text: 'Help me draft a professional email response for a client meeting.' },
    { icon: Heart, lang: 'Tanglish', text: 'Machi, life la focus & motivation vara oru simple Tanglish advice thaa da!' },
    { icon: Terminal, lang: 'Pure Tamil', text: 'தமிழ் கலாச்சாரம் மற்றும் கணினி தொழில்நுட்பம் பற்றி விளக்குக.' },
    { icon: Code, lang: 'Coding', text: 'Explain React custom hooks with a code example.' }
  ];

  return (
    <div className="flex h-screen bg-slate-900 text-slate-100 font-sans selection:bg-sky-500 selection:text-slate-950 overflow-hidden">
      {/* Auth Modal */}
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />

      {/* Export & Memory Vault Modal */}
      <ExportVaultModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        messages={messages}
        userName={user?.name || ''}
      />

      {/* Split-Screen Left Sidebar Navigation */}
      <Sidebar
        isOpen={showSidebar}
        onClose={() => setShowSidebar(false)}
        threads={threads}
        activeThreadId={activeThreadId}
        onSelectThread={(id) => setActiveThreadId(id)}
        onNewChat={handleNewChat}
        onDeleteThread={handleDeleteThread}
        onOpenAuth={() => setShowAuthModal(true)}
      />

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col h-full min-w-0 bg-slate-900 relative">
        {/* Header Navigation */}
        <Header
          language={language}
          setLanguage={setLanguage}
          onOpenAuth={() => setShowAuthModal(true)}
          onToggleSidebar={() => setShowSidebar(!showSidebar)}
          onOpenExport={() => setShowExportModal(true)}
        />

        {/* Chat Feed Workspace */}
        <main className="flex-1 overflow-y-auto px-4 py-4 sm:px-8 max-w-4xl mx-auto w-full">
          {/* Empty State with Trilingual Prompt Starter Chips */}
          {messages.length === 0 && (
            <div className="my-auto py-10 flex flex-col items-center justify-center text-center">
              <div className="relative w-16 h-16 rounded-2xl overflow-hidden border border-slate-700 shadow-lg mb-4">
                <Image src="/logo.jpg" alt="Mach-AI" fill className="object-cover" />
              </div>

              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-100 font-heading mb-1">
                How can Mach-AI help you today?
              </h2>
              <p className="text-xs text-slate-400 max-w-md mb-8">
                {user?.name ? `Welcome back, ${user.name}. ` : ''}
                Supports English, Tanglish, and Tamil conversations smoothly.
              </p>

              {/* Trilingual Starter Chips */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-2xl text-left">
                {trilingualPrompts.map((p, idx) => {
                  const Icon = p.icon;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(p.text)}
                      className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 hover:border-sky-500/50 hover:bg-slate-800 transition-all text-xs font-medium text-slate-200 group flex flex-col justify-between"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded-md">
                          {p.lang}
                        </span>
                        <Icon className="w-4 h-4 text-slate-400 group-hover:text-sky-400 transition-colors" />
                      </div>
                      <p className="line-clamp-2 leading-relaxed">{p.text}</p>
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
                <div className="flex items-center gap-3 p-4 rounded-2xl bg-slate-800/80 border border-slate-700 max-w-[90%] animate-pulse">
                  <div className="w-7 h-7 rounded-xl bg-sky-600/20 flex items-center justify-center text-sky-400">
                    <Loader2 className="w-4 h-4 animate-spin" />
                  </div>
                  <div className="text-xs text-sky-300 font-medium flex items-center gap-2">
                    <span>Mach-AI is generating response...</span>
                    <Sparkles className="w-3.5 h-3.5 text-sky-400 animate-spin" />
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
          )}
        </main>

        {/* Input Bar with Auto-Expanding Textarea */}
        <div className="p-3 sm:p-4 bg-slate-900 border-t border-slate-800">
          <div className="max-w-4xl mx-auto">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-end gap-2 p-2 rounded-2xl glass-input transition-all"
            >
              <textarea
                ref={textareaRef}
                value={input}
                onChange={handleTextareaChange}
                onKeyDown={handleKeyDown}
                rows={1}
                placeholder="Ask Mach-AI (Tamil, Tanglish or English)... Press Enter to send, Shift+Enter for new line"
                className="w-full bg-transparent border-none outline-none text-sm text-slate-100 placeholder-slate-500 py-1.5 px-2 font-sans resize-none max-h-40 min-h-[36px] leading-relaxed"
                disabled={isLoading}
              />

              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className={`p-2.5 rounded-xl flex items-center justify-center transition-all flex-shrink-0 ${
                  input.trim() && !isLoading
                    ? 'bg-sky-600 hover:bg-sky-500 text-white shadow-md active:scale-95'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
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

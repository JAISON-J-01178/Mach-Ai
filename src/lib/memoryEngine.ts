'use client';

import { Message } from '@/components/MessageItem';

export interface ChatThread {
  id: string;
  title: string;
  messages: Message[];
  updatedAt: number;
}

export interface UserMemory {
  userId?: string;
  userName: string;
  preferredLanguage: string;
}

const DEFAULT_THREADS_KEY = 'mach_ai_threads_guest';
const MEMORY_KEY = 'mach_ai_user_memory';

function getStorageKey(userId?: string) {
  if (!userId) return DEFAULT_THREADS_KEY;
  return `mach_ai_threads_${userId}`;
}

// Get all saved threads (UNLIMITED)
export function getSavedThreads(userId?: string): ChatThread[] {
  if (typeof window === 'undefined') return [];
  try {
    const key = getStorageKey(userId);
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const threads: ChatThread[] = JSON.parse(raw);
    return threads.sort((a, b) => b.updatedAt - a.updatedAt);
  } catch {
    return [];
  }
}

// Save threads
export function saveThreads(threads: ChatThread[], userId?: string): ChatThread[] {
  if (typeof window === 'undefined') return threads;

  const sorted = [...threads].sort((a, b) => b.updatedAt - a.updatedAt);
  const key = getStorageKey(userId);

  try {
    localStorage.setItem(key, JSON.stringify(sorted));
  } catch {
    // ignore
  }

  return sorted;
}

// Rename thread
export function renameThread(threadId: string, newTitle: string, threads: ChatThread[], userId?: string): ChatThread[] {
  const updated = threads.map((t) => {
    if (t.id === threadId) {
      return { ...t, title: newTitle.trim(), updatedAt: Date.now() };
    }
    return t;
  });
  return saveThreads(updated, userId);
}

// Smart Auto-Naming Logic for first messages
export function generateSmartThreadTitle(firstMessage: string, existingThreads: ChatThread[]): string {
  const text = firstMessage.trim();
  if (!text) return 'New Conversation';

  const words = text.split(/\s+/);
  let baseTitle = '';

  if (words.length <= 2) {
    // Short 1-2 word messages (e.g. "Hi", "Hello")
    baseTitle = text.slice(0, 20);
  } else {
    // Long queries: extract first 3-4 keywords
    const stopWords = new Set(['help', 'me', 'please', 'write', 'create', 'how', 'to', 'a', 'an', 'the', 'is', 'in', 'for', 'of', 'and', 'or']);
    const filtered = words.filter((w) => !stopWords.has(w.toLowerCase()));
    
    if (filtered.length >= 2) {
      baseTitle = filtered.slice(0, 4).join(' ');
    } else {
      baseTitle = words.slice(0, 4).join(' ');
    }
    baseTitle = baseTitle.charAt(0).toUpperCase() + baseTitle.slice(1);
  }

  // Handle duplicate titles
  const existingTitles = existingThreads.map((t) => (t.title || '').toLowerCase());
  let finalTitle = baseTitle;
  let counter = 2;

  while (existingTitles.includes(finalTitle.toLowerCase())) {
    finalTitle = `${baseTitle} (${counter})`;
    counter++;
  }

  return finalTitle;
}

// Group threads chronologically into Today, Yesterday, and Older
export function groupThreadsChronologically(threads: ChatThread[]) {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const yesterdayStart = todayStart - 86400000;

  const today: ChatThread[] = [];
  const yesterday: ChatThread[] = [];
  const older: ChatThread[] = [];

  threads.forEach((t) => {
    if (t.updatedAt >= todayStart) {
      today.push(t);
    } else if (t.updatedAt >= yesterdayStart) {
      yesterday.push(t);
    } else {
      older.push(t);
    }
  });

  return { today, yesterday, older };
}

// User memory persistence
export function getUserMemory(defaultName = ''): UserMemory {
  if (typeof window === 'undefined') {
    return { userName: defaultName, preferredLanguage: 'auto' };
  }

  try {
    const raw = localStorage.getItem(MEMORY_KEY);
    if (raw) {
      const memory: UserMemory = JSON.parse(raw);
      if (defaultName && (!memory.userName || memory.userName === 'Mach User')) {
        memory.userName = defaultName;
      }
      return memory;
    }
  } catch {
    // ignore
  }

  const initialMemory: UserMemory = {
    userName: defaultName || 'Mach User',
    preferredLanguage: 'auto'
  };

  if (typeof window !== 'undefined') {
    localStorage.setItem(MEMORY_KEY, JSON.stringify(initialMemory));
  }

  return initialMemory;
}

export function saveUserMemory(memory: UserMemory) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(MEMORY_KEY, JSON.stringify(memory));
  } catch {
    // ignore
  }
}

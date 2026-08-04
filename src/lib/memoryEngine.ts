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

// Helper to extract 1-2 key words from text
function extractKeywords(text: string): string {
  const clean = text.trim();
  if (!clean) return 'New Chat';

  const words = clean.split(/\s+/);
  if (words.length <= 2) {
    return clean;
  }

  const stopWords = new Set(['help', 'me', 'please', 'write', 'create', 'how', 'to', 'a', 'an', 'the', 'is', 'in', 'for', 'of', 'and', 'or', 'can', 'you']);
  const filtered = words.filter((w) => !stopWords.has(w.toLowerCase()));

  if (filtered.length >= 2) {
    const result = `${filtered[0]} ${filtered[1]}`;
    return result.charAt(0).toUpperCase() + result.slice(1);
  } else if (filtered.length === 1) {
    return filtered[0].charAt(0).toUpperCase() + filtered[0].slice(1);
  }

  const fallback = `${words[0]} ${words[1]}`;
  return fallback.charAt(0).toUpperCase() + fallback.slice(1);
}

// Advanced Auto-Naming Algorithm with 2nd Message Fallback
export function generateSmartThreadTitle(
  messages: Message[],
  existingThreads: ChatThread[],
  currentThreadId?: string
): string {
  const userMessages = messages.filter((m) => m.role === 'user');
  if (userMessages.length === 0) return 'New Conversation';

  const firstMsg = userMessages[0].content;
  const initialTitle = extractKeywords(firstMsg);

  // Check if initialTitle conflicts with another thread
  const otherThreads = existingThreads.filter((t) => t.id !== currentThreadId);
  const isDuplicate = otherThreads.some(
    (t) => (t.title || '').toLowerCase() === initialTitle.toLowerCase()
  );

  // If initial title is NOT duplicate, return it!
  if (!isDuplicate) {
    return initialTitle;
  }

  // If initial title IS duplicate: Fallback to 2nd user message if available!
  if (userMessages.length >= 2) {
    const secondMsg = userMessages[1].content;
    const secondTitle = extractKeywords(secondMsg);

    // If secondTitle is unique, return it!
    const isSecondDuplicate = otherThreads.some(
      (t) => (t.title || '').toLowerCase() === secondTitle.toLowerCase()
    );

    if (!isSecondDuplicate) {
      return secondTitle;
    }
  }

  // Final fallback if both 1st and 2nd messages match existing titles
  let counter = 2;
  let candidate = `${initialTitle} (${counter})`;
  while (otherThreads.some((t) => (t.title || '').toLowerCase() === candidate.toLowerCase())) {
    counter++;
    candidate = `${initialTitle} (${counter})`;
  }

  return candidate;
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

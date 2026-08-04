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

// Save threads (UNLIMITED - no 2-chat limit!)
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

// Memory persistence (User profile facts)
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

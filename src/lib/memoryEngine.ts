'use client';

import { Message } from '@/components/MessageItem';

export interface ChatThread {
  id: string;
  title: string;
  messages: Message[];
  updatedAt: number;
}

export interface UserMemory {
  userName: string;
  preferredLanguage: string;
  personalNotes: string[];
}

const THREADS_KEY = 'machi_ai_threads';
const MEMORY_KEY = 'machi_ai_user_memory';

// Get all saved threads (max 2)
export function getSavedThreads(): ChatThread[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(THREADS_KEY);
    if (!raw) return [];
    const threads: ChatThread[] = JSON.parse(raw);
    return threads.sort((a, b) => b.updatedAt - a.updatedAt);
  } catch {
    return [];
  }
}

// Save threads enforcing the 2-conversation limit rule
export function saveThreads(threads: ChatThread[]): ChatThread[] {
  if (typeof window === 'undefined') return threads;

  // Sort descending by updatedAt
  const sorted = [...threads].sort((a, b) => b.updatedAt - a.updatedAt);

  // Auto delete older threads if count exceeds 2
  const maxThreads = 2;
  const prunedThreads = sorted.slice(0, maxThreads);

  try {
    localStorage.setItem(THREADS_KEY, JSON.stringify(prunedThreads));
  } catch {
    // ignore
  }

  return prunedThreads;
}

// Memory persistence (Stores user name & details across sessions)
export function getUserMemory(defaultName = ''): UserMemory {
  if (typeof window === 'undefined') {
    return { userName: defaultName, preferredLanguage: 'auto', personalNotes: [] };
  }

  try {
    const raw = localStorage.getItem(MEMORY_KEY);
    if (raw) {
      const memory: UserMemory = JSON.parse(raw);
      if (defaultName && (!memory.userName || memory.userName === 'Machi User')) {
        memory.userName = defaultName;
      }
      return memory;
    }
  } catch {
    // ignore
  }

  const initialMemory: UserMemory = {
    userName: defaultName || 'Machi User',
    preferredLanguage: 'auto',
    personalNotes: []
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

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

/**
 * Extract 1-2 key words from a message for use as a thread title.
 * Rules:
 *   - 1-2 word message → return as-is (e.g. "hi", "hello machi")
 *   - Long message → strip common stop-words, return first 2 significant words
 *     with Title Case applied.
 */
function extractKeywords(text: string): string {
  const clean = text.trim();
  if (!clean) return 'New Chat';

  const words = clean.split(/\s+/);

  // Short message: return exactly as typed (preserves "hi", "hello" lowercase)
  if (words.length <= 2) {
    return clean;
  }

  // Stop-word list for longer messages
  const stopWords = new Set([
    'help', 'me', 'please', 'write', 'create', 'how', 'to', 'a', 'an',
    'the', 'is', 'in', 'for', 'of', 'and', 'or', 'can', 'you', 'do',
    'i', 'my', 'your', 'want', 'need', 'make', 'get', 'give', 'tell',
    'what', 'why', 'when', 'where', 'which', 'with', 'it', 'this', 'that'
  ]);

  const filtered = words.filter((w) => !stopWords.has(w.toLowerCase()));

  if (filtered.length >= 2) {
    const result = `${filtered[0]} ${filtered[1]}`;
    return result.charAt(0).toUpperCase() + result.slice(1);
  }
  if (filtered.length === 1) {
    return filtered[0].charAt(0).toUpperCase() + filtered[0].slice(1);
  }

  // Absolute fallback: first two raw words with Title Case
  const fallback = `${words[0]} ${words[1]}`;
  return fallback.charAt(0).toUpperCase() + fallback.slice(1);
}

/**
 * Auto-naming algorithm for chat threads.
 *
 * Priority order:
 *  1. Keywords from 1st user message  →  use if NOT a duplicate
 *  2. Keywords from 2nd user message  →  use if NOT a duplicate (fallback)
 *  3. Numeric suffix (2), (3) …       →  last resort only
 *
 * A "duplicate" means another thread (excluding current) already has that
 * exact title (case-insensitive).
 */
export function generateSmartThreadTitle(
  messages: Message[],
  existingThreads: ChatThread[],
  currentThreadId?: string
): string {
  const userMessages = messages.filter((m) => m.role === 'user');
  if (userMessages.length === 0) return 'New Conversation';

  // Other threads we might conflict with
  const otherThreads = existingThreads.filter((t) => t.id !== currentThreadId);

  const titleExists = (candidate: string) =>
    otherThreads.some((t) => (t.title || '').toLowerCase() === candidate.toLowerCase());

  // ── Step 1: Try first user message ──────────────────────────────────────
  const firstTitle = extractKeywords(userMessages[0].content);
  if (!titleExists(firstTitle)) return firstTitle;

  // ── Step 2: Fallback → second user message (if available) ───────────────
  if (userMessages.length >= 2) {
    const secondTitle = extractKeywords(userMessages[1].content);
    if (!titleExists(secondTitle)) return secondTitle;
  }

  // ── Step 3: Last resort — numeric suffix ────────────────────────────────
  let counter = 2;
  let candidate = `${firstTitle} (${counter})`;
  while (titleExists(candidate)) {
    counter++;
    candidate = `${firstTitle} (${counter})`;
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

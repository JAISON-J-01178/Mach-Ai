/**
 * supabaseDb.ts
 * All Supabase database operations for Machi AI.
 * Handles users table + chat_threads table (with JSONB messages).
 */

import { supabase } from './supabaseClient';
import { ChatThread } from './memoryEngine';

/* ─────────────────────────────────────────────────────────────────
   TYPES matching Supabase table columns
───────────────────────────────────────────────────────────────── */
export interface SupabaseUser {
  id: string;
  email: string;
  name: string;
  created_at: string;
}

export interface SupabaseThread {
  id: string;
  user_id: string;
  title: string;
  messages: unknown[];
  updated_at: string;
  created_at: string;
}

/* ─────────────────────────────────────────────────────────────────
   USER OPERATIONS
───────────────────────────────────────────────────────────────── */

/**
 * Creates or updates a user record in the `users` table.
 * Returns the Supabase user UUID (used as FK for chat_threads).
 */
export async function upsertUser(
  email: string,
  name: string
): Promise<string | null> {
  try {
    // Try to find existing user first
    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    if (existing?.id) {
      // Update name if changed
      await supabase
        .from('users')
        .update({ name })
        .eq('id', existing.id);
      return existing.id;
    }

    // Insert new user
    const { data: inserted, error } = await supabase
      .from('users')
      .insert({ email, name })
      .select('id')
      .single();

    if (error) {
      console.error('[Supabase] upsertUser error:', error.message);
      return null;
    }

    return inserted?.id ?? null;
  } catch (err) {
    console.error('[Supabase] upsertUser exception:', err);
    return null;
  }
}

/* ─────────────────────────────────────────────────────────────────
   THREAD OPERATIONS
───────────────────────────────────────────────────────────────── */

/**
 * Fetch all chat threads for a user, sorted newest-first.
 */
export async function getThreadsFromSupabase(
  supabaseUserId: string
): Promise<ChatThread[]> {
  try {
    const { data, error } = await supabase
      .from('chat_threads')
      .select('id, title, messages, updated_at')
      .eq('user_id', supabaseUserId)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('[Supabase] getThreads error:', error.message);
      return [];
    }

    // Map DB rows → ChatThread shape
    return (data ?? []).map((row) => ({
      id: row.id,
      title: row.title,
      messages: Array.isArray(row.messages) ? row.messages : [],
      updatedAt: new Date(row.updated_at).getTime()
    }));
  } catch (err) {
    console.error('[Supabase] getThreads exception:', err);
    return [];
  }
}

/**
 * Upsert a single thread (insert if new, update if existing).
 * Uses the thread.id as the primary key (UUID).
 */
export async function upsertThread(
  supabaseUserId: string,
  thread: ChatThread
): Promise<void> {
  try {
    const { error } = await supabase
      .from('chat_threads')
      .upsert(
        {
          id: thread.id,
          user_id: supabaseUserId,
          title: thread.title,
          messages: thread.messages,
          updated_at: new Date(thread.updatedAt).toISOString()
        },
        { onConflict: 'id' }
      );

    if (error) {
      console.error('[Supabase] upsertThread error:', error.message);
    }
  } catch (err) {
    console.error('[Supabase] upsertThread exception:', err);
  }
}

/**
 * Bulk upsert — used when migrating localStorage threads to Supabase
 * on first login.
 */
export async function upsertAllThreads(
  supabaseUserId: string,
  threads: ChatThread[]
): Promise<void> {
  if (threads.length === 0) return;
  try {
    const rows = threads.map((t) => ({
      id: t.id,
      user_id: supabaseUserId,
      title: t.title,
      messages: t.messages,
      updated_at: new Date(t.updatedAt).toISOString()
    }));

    const { error } = await supabase
      .from('chat_threads')
      .upsert(rows, { onConflict: 'id' });

    if (error) {
      console.error('[Supabase] upsertAllThreads error:', error.message);
    }
  } catch (err) {
    console.error('[Supabase] upsertAllThreads exception:', err);
  }
}

/**
 * Delete a single thread by its UUID.
 */
export async function deleteThreadFromSupabase(
  threadId: string
): Promise<void> {
  try {
    const { error } = await supabase
      .from('chat_threads')
      .delete()
      .eq('id', threadId);

    if (error) {
      console.error('[Supabase] deleteThread error:', error.message);
    }
  } catch (err) {
    console.error('[Supabase] deleteThread exception:', err);
  }
}

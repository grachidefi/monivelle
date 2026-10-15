import { useState, useCallback, useEffect, useRef } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import type { Transaction, Settings } from '../types';

// ---------- helpers ----------

function rowToTransaction(row: Record<string, unknown>): Transaction {
  return {
    id: row.id as string,
    title: row.title as string,
    type: row.type as Transaction['type'],
    amount: Number(row.amount),
    category: row.category as Transaction['category'],
    date: (row.date as string).slice(0, 10),
    notes: (row.notes as string | null) ?? undefined,
    createdAt: new Date(row.created_at as string).getTime(),
  };
}

function generateId(): string {
  return `txn_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

// ---------- hook ----------

export function useTransactions(user: User | null) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [settings, setSettings] = useState<Settings>({ currency: 'NGN', name: '' });
  // Start loading=true only if there is a user; no user means nothing to load
  const [loading, setLoading] = useState(!!user);
  const [error, setError] = useState<string | null>(null);

  // Tracks the uid that the last fetch was started for, so stale responses are discarded
  const fetchingForRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (!user) return;

    const uid = user.id;
    fetchingForRef.current = uid;

    const run = async () => {
      // All state updates happen inside the async function — no synchronous setState before await
      setLoading(true);
      setError(null);

      const [txnResult, settingsResult] = await Promise.all([
        supabase
          .from('transactions')
          .select('*')
          .eq('user_id', uid)
          .order('date', { ascending: false })
          .order('created_at', { ascending: false }),
        supabase
          .from('user_settings')
          .select('*')
          .eq('user_id', uid)
          .maybeSingle(),
      ]);

      if (fetchingForRef.current !== uid) return;

      if (txnResult.error) {
        setError(txnResult.error.message);
      } else {
        setTransactions(
          (txnResult.data ?? []).map((r) => rowToTransaction(r as Record<string, unknown>)),
        );
      }
      // Fall back to user_metadata.full_name when user_settings.name is blank
      const metaName = (user.user_metadata?.full_name as string | undefined) ?? '';
      if (!settingsResult.error && settingsResult.data) {
        const row = settingsResult.data as { currency: Settings['currency']; name?: string };
        const name = (row.name ?? '').trim() || metaName;
        setSettings({ currency: row.currency, name });
      } else {
        // No settings row yet — seed from metadata
        setSettings((prev) => ({ ...prev, name: prev.name.trim() || metaName }));
      }
      setLoading(false);
    };

    void run();
  }, [user]);

  // ---------- transaction mutations ----------

  const addTransaction = useCallback(async (data: Omit<Transaction, 'id' | 'createdAt'>) => {
    if (!user) return;
    const id = generateId();
    const row = {
      id,
      user_id: user.id,
      title: data.title,
      type: data.type,
      amount: data.amount,
      category: data.category,
      date: data.date,
      notes: data.notes ?? null,
    };

    const optimistic: Transaction = { ...data, id, createdAt: Date.now() };
    setTransactions((prev) => [optimistic, ...prev]);

    const { error: err } = await supabase.from('transactions').insert(row);
    if (err) {
      setTransactions((prev) => prev.filter((t) => t.id !== id));
      setError(err.message);
    }
  }, [user]);

  const updateTransaction = useCallback(async (id: string, data: Omit<Transaction, 'id' | 'createdAt'>) => {
    if (!user) return;

    setTransactions((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...data } : t)),
    );

    const { error: err } = await supabase
      .from('transactions')
      .update({
        title: data.title,
        type: data.type,
        amount: data.amount,
        category: data.category,
        date: data.date,
        notes: data.notes ?? null,
      })
      .eq('id', id)
      .eq('user_id', user.id);

    if (err) setError(err.message);
  }, [user]);

  const deleteTransaction = useCallback(async (id: string) => {
    if (!user) return;

    setTransactions((prev) => prev.filter((t) => t.id !== id));

    const { error: err } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (err) setError(err.message);
  }, [user]);

  // ---------- settings mutations ----------

  const updateSettings = useCallback(async (s: Partial<Settings>) => {
    if (!user) return;
    const next = { ...settings, ...s };
    setSettings(next);

    await supabase
      .from('user_settings')
      .upsert({ user_id: user.id, currency: next.currency, name: next.name });
  }, [user, settings]);

  return {
    transactions,
    settings,
    loading,
    error,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    updateSettings,
  };
}

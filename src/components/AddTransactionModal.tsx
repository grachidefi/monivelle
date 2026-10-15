import { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import type { Transaction, TransactionType, Category } from '../types';
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES } from '../types';
import { todayISODate } from '../utils/format';

interface AddTransactionModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: Omit<Transaction, 'id' | 'createdAt'>) => void;
  initial?: Transaction | null;
}

// Inner form component is re-keyed so it always mounts fresh
interface FormProps {
  initial?: Transaction | null;
  onClose: () => void;
  onSave: (data: Omit<Transaction, 'id' | 'createdAt'>) => void;
}

function buildInitialForm(initial?: Transaction | null) {
  if (initial) {
    return {
      title: initial.title,
      type: initial.type,
      amount: String(initial.amount),
      category: initial.category as Category | '',
      date: initial.date,
      notes: initial.notes ?? '',
    };
  }
  return {
    title: '',
    type: 'expense' as TransactionType,
    amount: '',
    category: '' as Category | '',
    date: todayISODate(),
    notes: '',
  };
}

function TransactionForm({ initial, onClose, onSave }: FormProps) {
  const [form, setForm] = useState(() => buildInitialForm(initial));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const categories = form.type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  function validate(): boolean {
    const newErrors: Record<string, string> = {};
    if (!form.title.trim()) newErrors.title = 'Title is required';
    const amt = parseFloat(form.amount);
    if (!form.amount || isNaN(amt) || amt <= 0) newErrors.amount = 'Amount must be greater than zero';
    if (!form.category) newErrors.category = 'Please select a category';
    if (!form.date) newErrors.date = 'Date is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleSubmit() {
    if (!validate()) return;
    setSaving(true);
    setTimeout(() => {
      onSave({
        title: form.title.trim(),
        type: form.type,
        amount: parseFloat(form.amount),
        category: form.category as Category,
        date: form.date,
        notes: form.notes.trim() || undefined,
      });
      setSaving(false);
      onClose();
    }, 200);
  }

  function handleTypeChange(t: TransactionType) {
    setForm((prev) => ({ ...prev, type: t, category: '' }));
    setErrors((prev) => ({ ...prev, category: '' }));
  }

  return (
    <div className="px-5 pt-3 pb-6 md:px-6 md:pt-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="display font-bold text-lg" style={{ color: 'var(--ink)' }}>
          {initial ? 'Edit Transaction' : 'Add Transaction'}
        </h2>
        <button
          onClick={onClose}
          className="w-8 h-8 flex items-center justify-center rounded-full transition-colors hover:opacity-70"
          style={{ background: 'var(--surface-muted)' }}
          aria-label="Close"
        >
          <X size={16} style={{ color: 'var(--muted)' }} />
        </button>
      </div>

      {/* Type toggle */}
      <div className="flex gap-2 mb-5 p-1 rounded-2xl" style={{ background: 'var(--surface-muted)' }}>
        {(['expense', 'income'] as TransactionType[]).map((t) => (
          <button
            key={t}
            onClick={() => handleTypeChange(t)}
            className="flex-1 py-2 rounded-xl text-sm font-semibold transition-all capitalize"
            style={{
              background: form.type === t ? (t === 'income' ? 'var(--income)' : 'var(--expense)') : 'transparent',
              color: form.type === t ? '#fff' : 'var(--muted)',
            }}
          >
            {t === 'income' ? 'Income' : 'Expense'}
          </button>
        ))}
      </div>

      {/* Title */}
      <Field label="Title / Description" error={errors.title}>
        <input
          type="text"
          placeholder="e.g. Monthly Salary"
          value={form.title}
          onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
          className="w-full rounded-xl px-4 py-3 text-sm outline-none border transition-colors"
          style={{
            background: 'var(--surface-muted)',
            borderColor: errors.title ? 'var(--danger)' : 'transparent',
            color: 'var(--ink)',
          }}
        />
      </Field>

      {/* Amount */}
      <Field label="Amount" error={errors.amount}>
        <input
          type="number"
          inputMode="decimal"
          placeholder="0.00"
          min="0"
          step="0.01"
          value={form.amount}
          onChange={(e) => setForm((p) => ({ ...p, amount: e.target.value }))}
          className="w-full rounded-xl px-4 py-3 text-sm outline-none border transition-colors"
          style={{
            background: 'var(--surface-muted)',
            borderColor: errors.amount ? 'var(--danger)' : 'transparent',
            color: 'var(--ink)',
          }}
        />
      </Field>

      {/* Category */}
      <Field label="Category" error={errors.category}>
        <select
          value={form.category}
          onChange={(e) => setForm((p) => ({ ...p, category: e.target.value as Category }))}
          className="w-full rounded-xl px-4 py-3 text-sm outline-none border transition-colors appearance-none"
          style={{
            background: 'var(--surface-muted)',
            borderColor: errors.category ? 'var(--danger)' : 'transparent',
            color: form.category ? 'var(--ink)' : 'var(--subtle)',
          }}
        >
          <option value="" disabled>Select category…</option>
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </Field>

      {/* Date */}
      <Field label="Date" error={errors.date}>
        <input
          type="date"
          value={form.date}
          onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))}
          className="w-full rounded-xl px-4 py-3 text-sm outline-none border transition-colors"
          style={{
            background: 'var(--surface-muted)',
            borderColor: errors.date ? 'var(--danger)' : 'transparent',
            color: 'var(--ink)',
          }}
        />
      </Field>

      {/* Notes */}
      <Field label="Notes (optional)">
        <textarea
          placeholder="Any extra details…"
          value={form.notes}
          onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
          rows={2}
          className="w-full rounded-xl px-4 py-3 text-sm outline-none border transition-colors resize-none"
          style={{ background: 'var(--surface-muted)', borderColor: 'transparent', color: 'var(--ink)' }}
        />
      </Field>

      {/* Actions */}
      <div className="flex gap-3 mt-6">
        <button
          onClick={onClose}
          className="flex-1 py-3 rounded-2xl text-sm font-semibold border transition-colors"
          style={{ borderColor: 'var(--border-strong)', color: 'var(--ink-2)', background: 'transparent' }}
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={saving}
          className="flex-1 py-3 rounded-2xl text-sm font-semibold text-white transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2"
          style={{ background: 'var(--accent)' }}
        >
          {saving ? <><Loader2 size={14} className="animate-spin" /> Saving…</> : (initial ? 'Save Changes' : 'Save Transaction')}
        </button>
      </div>
    </div>
  );
}

export function AddTransactionModal({ open, onClose, onSave, initial }: AddTransactionModalProps) {
  // Use a key that changes when the modal opens or the edit target changes to re-mount the form fresh
  const formKey = open ? `form-${initial?.id ?? 'new'}` : 'closed';

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end md:items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <div className="absolute inset-0" style={{ background: 'rgba(44,26,14,0.35)', backdropFilter: 'blur(4px)' }} />
          <motion.div
            className="relative w-full md:max-w-md md:rounded-3xl rounded-t-3xl overflow-hidden"
            style={{ background: 'var(--surface-strong)', maxHeight: '92dvh', overflowY: 'auto' }}
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', stiffness: 340, damping: 36 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Strip */}
            <div className="h-1" style={{ background: 'linear-gradient(90deg, var(--accent), #4caf78)' }} />

            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-1 md:hidden">
              <div className="h-1 w-10 rounded-full" style={{ background: 'var(--border-strong)' }} />
            </div>

            <TransactionForm
              key={formKey}
              initial={initial}
              onClose={onClose}
              onSave={onSave}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--muted)' }}>{label}</label>
      {children}
      {error && <p className="text-xs mt-1" style={{ color: 'var(--danger)' }}>{error}</p>}
    </div>
  );
}

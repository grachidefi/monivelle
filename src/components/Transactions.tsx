import { useState, useMemo } from 'react';
import { Search, Filter, Pencil, Trash2, Plus, X, ChevronDown } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import type { Transaction, Settings, TransactionType } from '../types';
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES } from '../types';
import { formatMoney, formatDate } from '../utils/format';

interface TransactionsProps {
  transactions: Transaction[];
  settings: Settings;
  onAdd: () => void;
  onEdit: (t: Transaction) => void;
  onDelete: (id: string) => void;
}

type SortField = 'date' | 'amount' | 'title';
type SortDir = 'asc' | 'desc';

const ALL_CATEGORIES = [...new Set([...INCOME_CATEGORIES, ...EXPENSE_CATEGORIES])];

export function Transactions({ transactions, settings, onAdd, onEdit, onDelete }: TransactionsProps) {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<TransactionType | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [sortField] = useState<SortField>('date');
  const [sortDir] = useState<SortDir>('desc');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const filtered = useMemo(() => {
    let result = [...transactions];

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((t) =>
        t.title.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q) ||
        (t.notes?.toLowerCase().includes(q) ?? false),
      );
    }

    if (typeFilter !== 'all') {
      result = result.filter((t) => t.type === typeFilter);
    }

    if (categoryFilter !== 'all') {
      result = result.filter((t) => t.category === categoryFilter);
    }

    if (dateFrom) result = result.filter((t) => t.date >= dateFrom);
    if (dateTo) result = result.filter((t) => t.date <= dateTo);

    result.sort((a, b) => {
      let cmp = 0;
      if (sortField === 'date') cmp = a.date.localeCompare(b.date) || (a.createdAt - b.createdAt);
      else if (sortField === 'amount') cmp = a.amount - b.amount;
      else cmp = a.title.localeCompare(b.title);
      return sortDir === 'desc' ? -cmp : cmp;
    });

    return result;
  }, [transactions, search, typeFilter, categoryFilter, dateFrom, dateTo, sortField, sortDir]);

  function clearFilters() {
    setSearch('');
    setTypeFilter('all');
    setCategoryFilter('all');
    setDateFrom('');
    setDateTo('');
  }

  const hasFilters = search || typeFilter !== 'all' || categoryFilter !== 'all' || dateFrom || dateTo;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="display font-bold text-2xl" style={{ color: 'var(--ink)' }}>Transactions</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--muted)' }}>{transactions.length} total record{transactions.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={onAdd}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-semibold text-white transition-all hover:scale-[1.02] active:scale-[0.98]"
          style={{ background: 'var(--accent)' }}
        >
          <Plus size={16} />
          <span className="hidden sm:inline">Add</span>
        </button>
      </div>

      {/* Search & filter bar */}
      <div className="rounded-2xl p-4 space-y-3" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--subtle)' }} />
            <input
              type="text"
              placeholder="Search transactions…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl pl-9 pr-4 py-2.5 text-sm outline-none"
              style={{ background: 'var(--surface-muted)', color: 'var(--ink)' }}
            />
          </div>
          <button
            onClick={() => setShowFilters((v) => !v)}
            className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors"
            style={{ background: showFilters ? 'var(--accent-light)' : 'var(--surface-muted)', color: showFilters ? 'var(--accent)' : 'var(--muted)' }}
          >
            <Filter size={14} />
            <span className="hidden sm:inline">Filters</span>
            <ChevronDown size={12} className={`transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>
          {hasFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 px-3 py-2.5 rounded-xl text-xs font-medium"
              style={{ background: 'var(--expense-light)', color: 'var(--expense)' }}
            >
              <X size={12} /> Clear
            </button>
          )}
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-1">
                <div>
                  <label className="text-xs font-medium block mb-1" style={{ color: 'var(--muted)' }}>Type</label>
                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value as TransactionType | 'all')}
                    className="w-full rounded-xl px-3 py-2 text-xs outline-none appearance-none"
                    style={{ background: 'var(--surface-muted)', color: 'var(--ink)' }}
                  >
                    <option value="all">All types</option>
                    <option value="income">Income</option>
                    <option value="expense">Expense</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium block mb-1" style={{ color: 'var(--muted)' }}>Category</label>
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="w-full rounded-xl px-3 py-2 text-xs outline-none appearance-none"
                    style={{ background: 'var(--surface-muted)', color: 'var(--ink)' }}
                  >
                    <option value="all">All categories</option>
                    {ALL_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium block mb-1" style={{ color: 'var(--muted)' }}>From</label>
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="w-full rounded-xl px-3 py-2 text-xs outline-none"
                    style={{ background: 'var(--surface-muted)', color: 'var(--ink)' }}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium block mb-1" style={{ color: 'var(--muted)' }}>To</label>
                  <input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="w-full rounded-xl px-3 py-2 text-xs outline-none"
                    style={{ background: 'var(--surface-muted)', color: 'var(--ink)' }}
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Table/list */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl p-10 text-center" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <p className="text-sm font-medium" style={{ color: 'var(--ink)' }}>
            {hasFilters ? 'No transactions match your filters.' : 'No transactions yet.'}
          </p>
          {!hasFilters && (
            <button onClick={onAdd} className="mt-3 text-sm font-semibold hover:opacity-70 transition-opacity" style={{ color: 'var(--accent)' }}>
              Add your first transaction
            </button>
          )}
        </div>
      ) : (
        <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          {/* Desktop header */}
          <div className="hidden md:grid grid-cols-[2fr_1fr_1fr_1fr_auto] gap-4 px-5 py-3 text-xs font-semibold uppercase tracking-wider border-b" style={{ color: 'var(--muted)', borderColor: 'var(--border)', letterSpacing: '0.06em' }}>
            <span>Description</span>
            <span>Date</span>
            <span>Category</span>
            <span className="text-right">Amount</span>
            <span></span>
          </div>

          <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
            {filtered.map((t) => (
              <TransactionItem
                key={t.id}
                transaction={t}
                settings={settings}
                onEdit={() => onEdit(t)}
                onDelete={() => setConfirmDeleteId(t.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Confirm delete */}
      <AnimatePresence>
        {confirmDeleteId && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setConfirmDeleteId(null)}
          >
            <div className="absolute inset-0" style={{ background: 'rgba(44,26,14,0.35)', backdropFilter: 'blur(4px)' }} />
            <motion.div
              className="relative rounded-3xl p-6 w-full max-w-sm"
              style={{ background: 'var(--surface-strong)' }}
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="display font-bold text-lg mb-2" style={{ color: 'var(--ink)' }}>Delete Transaction?</h3>
              <p className="text-sm mb-5" style={{ color: 'var(--muted)' }}>This action cannot be undone. All totals and charts will update.</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setConfirmDeleteId(null)}
                  className="flex-1 py-2.5 rounded-2xl text-sm font-semibold border"
                  style={{ borderColor: 'var(--border-strong)', color: 'var(--ink-2)' }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => { onDelete(confirmDeleteId); setConfirmDeleteId(null); }}
                  className="flex-1 py-2.5 rounded-2xl text-sm font-semibold text-white"
                  style={{ background: 'var(--danger)' }}
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function TransactionItem({ transaction: t, settings, onEdit, onDelete }: {
  transaction: Transaction; settings: Settings; onEdit: () => void; onDelete: () => void;
}) {
  const isIncome = t.type === 'income';
  return (
    <div className="grid md:grid-cols-[2fr_1fr_1fr_1fr_auto] grid-cols-1 gap-1 md:gap-4 items-center px-5 py-3.5 hover:bg-opacity-50 transition-colors" style={{ background: 'transparent' }}>
      {/* Description */}
      <div className="flex items-center gap-3">
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold"
          style={{ background: isIncome ? 'var(--income-light)' : 'var(--expense-light)', color: isIncome ? 'var(--income)' : 'var(--expense)' }}
        >
          {isIncome ? '+' : '-'}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium truncate" style={{ color: 'var(--ink)' }}>{t.title}</p>
          {t.notes && <p className="text-xs truncate" style={{ color: 'var(--subtle)' }}>{t.notes}</p>}
          {/* Mobile-only details */}
          <p className="text-xs md:hidden mt-0.5" style={{ color: 'var(--subtle)' }}>{t.category} · {formatDate(t.date)}</p>
        </div>
      </div>

      <p className="hidden md:block text-sm" style={{ color: 'var(--muted)' }}>{formatDate(t.date)}</p>

      <div className="hidden md:flex">
        <span className="text-xs font-medium px-2.5 py-1 rounded-full" style={{
          background: isIncome ? 'var(--income-light)' : 'var(--expense-light)',
          color: isIncome ? 'var(--income)' : 'var(--expense)',
        }}>
          {t.category}
        </span>
      </div>

      <div className="flex md:justify-end items-center gap-2 md:gap-0">
        <p
          className="text-sm font-semibold tabular-nums"
          style={{ color: isIncome ? 'var(--income)' : 'var(--expense)' }}
        >
          {isIncome ? '+' : '-'}{formatMoney(t.amount, settings)}
        </p>
        {/* Mobile-only category badge */}
        <span className="md:hidden text-xs font-medium px-2 py-0.5 rounded-full ml-1" style={{
          background: isIncome ? 'var(--income-light)' : 'var(--expense-light)',
          color: isIncome ? 'var(--income)' : 'var(--expense)',
        }}>
          {t.category}
        </span>
      </div>

      <div className="flex items-center gap-2 md:ml-2">
        <button
          onClick={onEdit}
          className="w-7 h-7 flex items-center justify-center rounded-lg transition-colors hover:opacity-70"
          style={{ background: 'var(--surface-muted)' }}
          aria-label="Edit"
        >
          <Pencil size={13} style={{ color: 'var(--muted)' }} />
        </button>
        <button
          onClick={onDelete}
          className="w-7 h-7 flex items-center justify-center rounded-lg transition-colors hover:opacity-70"
          style={{ background: 'var(--expense-light)' }}
          aria-label="Delete"
        >
          <Trash2 size={13} style={{ color: 'var(--expense)' }} />
        </button>
      </div>
    </div>
  );
}

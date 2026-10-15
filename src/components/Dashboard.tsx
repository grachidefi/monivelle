import { useMemo } from 'react';
import {
  TrendingUp, TrendingDown, Wallet, Calendar, ArrowRight, Plus,
  Smile, Frown, Meh,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import type { Transaction, Settings } from '../types';
import { calcTotals, calcThisMonthExpenses, expensesByCategory, monthlyTrend } from '../utils/stats';
import { formatMoney, formatMoneyCompact, formatDateShort } from '../utils/format';

const CATEGORY_COLORS = [
  '#2c6e49', '#4caf78', '#a8d5b8', '#e07b39', '#f0b27a',
  '#c0392b', '#8e44ad', '#2980b9', '#16a085', '#d4ac0d',
];

interface DashboardProps {
  transactions: Transaction[];
  settings: Settings;
  onAddTransaction: () => void;
  onNavigateTransactions: () => void;
}

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function getFirstName(name: string): string {
  const trimmed = name.trim();
  return trimmed ? trimmed.split(' ')[0] : '';
}

function formatFullDate(): string {
  return new Date().toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });
}

function getHealthIcon(balance: number, income: number) {
  if (income === 0) return { Icon: Meh, color: 'var(--muted)' };
  const ratio = balance / income;
  if (ratio >= 0.3) return { Icon: Smile, color: 'var(--success)' };
  if (ratio >= 0) return { Icon: Meh, color: 'var(--warning)' };
  return { Icon: Frown, color: 'var(--danger)' };
}

function getHealthLabel(balance: number, income: number): string {
  if (income === 0) return 'No income recorded yet';
  const ratio = balance / income;
  if (ratio >= 0.3) return 'Great — you\'re saving well this period';
  if (ratio >= 0.1) return 'Steady — spending is within range';
  if (ratio >= 0) return 'Watch out — spending is high relative to income';
  return 'Overspent — expenses exceed income';
}

export function Dashboard({ transactions, settings, onAddTransaction, onNavigateTransactions }: DashboardProps) {
  const { income, expenses, balance } = useMemo(() => calcTotals(transactions), [transactions]);
  const thisMonth = useMemo(() => calcThisMonthExpenses(transactions), [transactions]);
  const catData = useMemo(() => expensesByCategory(transactions).slice(0, 6), [transactions]);
  const monthly = useMemo(() => monthlyTrend(transactions, 6), [transactions]);
  const recent = useMemo(() => [...transactions].sort((a, b) => b.createdAt - a.createdAt).slice(0, 5), [transactions]);

  const firstName = getFirstName(settings.name);
  const greeting = getGreeting();
  const { Icon: HealthIcon, color: healthColor } = getHealthIcon(balance, income);
  const healthLabel = getHealthLabel(balance, income);

  const isOverspent = balance < 0;
  const savingsRate = income > 0 ? Math.max(0, (balance / income) * 100) : null;

  return (
    <div className="space-y-6">

      {/* Personalised header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium" style={{ color: 'var(--muted)' }}>{formatFullDate()}</p>
          <h1 className="display font-bold text-2xl mt-0.5" style={{ color: 'var(--ink)' }}>
            {greeting}{firstName ? `, ${firstName}` : ''}
          </h1>
          <div className="flex items-center gap-1.5 mt-1">
            <HealthIcon size={14} style={{ color: healthColor }} />
            <p className="text-sm" style={{ color: 'var(--muted)' }}>{healthLabel}</p>
          </div>
        </div>
        <button
          onClick={onAddTransaction}
          className="shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-semibold text-white transition-all hover:scale-[1.02] active:scale-[0.98]"
          style={{ background: 'var(--accent)' }}
        >
          <Plus size={16} />
          <span className="hidden sm:inline">Add Transaction</span>
          <span className="sm:hidden">Add</span>
        </button>
      </div>

      {/* Hero balance card */}
      <div
        className="rounded-3xl p-6 relative overflow-hidden transition-colors duration-300"
        style={{ background: isOverspent ? 'var(--expense)' : 'var(--accent)' }}
      >
        {/* decorative circles */}
        <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full opacity-10" style={{ background: '#fff' }} />
        <div className="absolute -bottom-12 -right-4 w-52 h-52 rounded-full opacity-5" style={{ background: '#fff' }} />

        <p className="text-xs font-semibold uppercase tracking-widest mb-2 opacity-70" style={{ color: '#fff' }}>
          Total Balance
        </p>
        <div className="display font-bold text-4xl tabular-nums leading-none mb-1" style={{ color: '#fff' }}>
          {isOverspent ? `-${formatMoney(Math.abs(balance), settings)}` : formatMoney(balance, settings)}
        </div>
        {isOverspent && (
          <p className="text-xs font-semibold mb-3 opacity-80" style={{ color: '#fff' }}>
            Overspent — expenses exceed income
          </p>
        )}
        {!isOverspent && <div className="mb-3" />}
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-1.5">
            <TrendingUp size={13} style={{ color: 'rgba(255,255,255,0.7)' }} />
            <span className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.8)' }}>
              Income: <span className="font-bold text-white">{formatMoney(income, settings)}</span>
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <TrendingDown size={13} style={{ color: 'rgba(255,255,255,0.7)' }} />
            <span className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.8)' }}>
              Spent: <span className="font-bold text-white">{formatMoney(expenses, settings)}</span>
            </span>
          </div>
          {savingsRate !== null && !isOverspent && (
            <div
              className="ml-auto px-3 py-1 rounded-full text-xs font-semibold"
              style={{ background: 'rgba(255,255,255,0.15)', color: '#fff' }}
            >
              {savingsRate.toFixed(0)}% saved
            </div>
          )}
          {isOverspent && (
            <div
              className="ml-auto px-3 py-1 rounded-full text-xs font-semibold"
              style={{ background: 'rgba(255,255,255,0.15)', color: '#fff' }}
            >
              {formatMoney(Math.abs(balance), settings)} over
            </div>
          )}
        </div>
      </div>

      {/* Summary cards row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <SummaryCard
          label="Total Income"
          value={formatMoney(income, settings)}
          icon={<TrendingUp size={16} />}
          color="var(--income)"
          bg="var(--income-light)"
        />
        <SummaryCard
          label="Total Expenses"
          value={formatMoney(expenses, settings)}
          icon={<TrendingDown size={16} />}
          color="var(--expense)"
          bg="var(--expense-light)"
        />
        <SummaryCard
          label="This Month"
          value={formatMoney(thisMonth, settings)}
          icon={<Calendar size={16} />}
          color="var(--warning)"
          bg="rgba(180, 83, 9, 0.10)"
          sub="Expenses"
        />
        <SummaryCard
          label="Transactions"
          value={String(transactions.length)}
          icon={<Wallet size={16} />}
          color="var(--accent)"
          bg="var(--accent-light)"
          sub="All time"
          plain
        />
      </div>

      {/* Charts row */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="rounded-2xl p-5" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <h2 className="font-semibold text-sm mb-4" style={{ color: 'var(--ink)' }}>Monthly Income vs Expenses</h2>
          {transactions.length === 0 ? (
            <EmptyChart message="Add transactions to see monthly trends" />
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={monthly} barCategoryGap="30%">
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--subtle)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--subtle)' }} axisLine={false} tickLine={false} tickFormatter={(v: number) => formatMoneyCompact(v, settings)} width={60} />
                <Tooltip
                  contentStyle={{ background: 'var(--surface-strong)', border: '1px solid var(--border)', borderRadius: 12, fontSize: 12 }}
                  formatter={(value, name) => [typeof value === 'number' ? formatMoney(value, settings) : value, name === 'income' ? 'Income' : 'Expenses']}
                />
                <Bar dataKey="income" fill="var(--income)" radius={[4, 4, 0, 0]} name="income" />
                <Bar dataKey="expenses" fill="var(--expense)" radius={[4, 4, 0, 0]} name="expenses" />
                <Legend formatter={(value) => value === 'income' ? 'Income' : 'Expenses'} iconType="square" wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="rounded-2xl p-5" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <h2 className="font-semibold text-sm mb-4" style={{ color: 'var(--ink)' }}>Expenses by Category</h2>
          {catData.length === 0 ? (
            <EmptyChart message="Add expense transactions to see category breakdown" />
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={catData} dataKey="amount" nameKey="category" cx="50%" cy="50%" outerRadius={72} innerRadius={32}>
                  {catData.map((_, idx) => (
                    <Cell key={idx} fill={CATEGORY_COLORS[idx % CATEGORY_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: 'var(--surface-strong)', border: '1px solid var(--border)', borderRadius: 12, fontSize: 12 }}
                  formatter={(value) => [typeof value === 'number' ? formatMoney(value, settings) : value, 'Amount']}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Recent transactions */}
      <div className="rounded-2xl p-5" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-sm" style={{ color: 'var(--ink)' }}>Recent Transactions</h2>
          {transactions.length > 0 && (
            <button
              onClick={onNavigateTransactions}
              className="flex items-center gap-1 text-xs font-semibold transition-opacity hover:opacity-70"
              style={{ color: 'var(--accent)' }}
            >
              View all <ArrowRight size={12} />
            </button>
          )}
        </div>
        {recent.length === 0 ? (
          <div className="text-center py-10">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3"
              style={{ background: 'var(--accent-light)' }}
            >
              <Wallet size={22} style={{ color: 'var(--accent)' }} />
            </div>
            <p className="font-semibold text-sm" style={{ color: 'var(--ink)' }}>
              {firstName ? `No transactions yet, ${firstName}.` : 'No transactions yet.'}
            </p>
            <p className="text-sm mt-1 mb-4" style={{ color: 'var(--subtle)' }}>
              Record your first income or expense to get started.
            </p>
            <button
              onClick={onAddTransaction}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-semibold text-white transition-all hover:scale-[1.02]"
              style={{ background: 'var(--accent)' }}
            >
              <Plus size={14} /> Add your first transaction
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {recent.map((t) => (
              <TransactionRow key={t.id} transaction={t} settings={settings} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function SummaryCard({ label, value, icon, color, bg, sub, plain }: {
  label: string; value: string; icon: React.ReactNode; color: string;
  bg: string; sub?: string; plain?: boolean;
}) {
  return (
    <div className="rounded-2xl p-4" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
      <div className="flex items-center gap-2 mb-3">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: bg, color }}>
          {icon}
        </div>
        <span className="text-xs font-medium leading-tight" style={{ color: 'var(--muted)' }}>{label}</span>
      </div>
      <div
        className={`display font-bold tabular-nums leading-tight ${plain ? 'text-2xl' : 'text-lg'}`}
        style={{ color: plain ? color : 'var(--ink)', wordBreak: 'break-all' }}
      >
        {value}
      </div>
      {sub && <div className="text-xs mt-0.5" style={{ color: 'var(--subtle)' }}>{sub}</div>}
    </div>
  );
}

function TransactionRow({ transaction, settings }: { transaction: Transaction; settings: Settings }) {
  const isIncome = transaction.type === 'income';
  return (
    <div className="flex items-center gap-3 py-2.5 px-3 rounded-xl" style={{ background: 'var(--surface-muted)' }}>
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold"
        style={{
          background: isIncome ? 'var(--income-light)' : 'var(--expense-light)',
          color: isIncome ? 'var(--income)' : 'var(--expense)',
        }}
      >
        {isIncome ? '+' : '-'}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate" style={{ color: 'var(--ink)' }}>{transaction.title}</p>
        <p className="text-xs truncate" style={{ color: 'var(--subtle)' }}>
          {transaction.category} · {formatDateShort(transaction.date)}
        </p>
      </div>
      <div
        className="text-sm font-semibold tabular-nums shrink-0"
        style={{ color: isIncome ? 'var(--income)' : 'var(--expense)' }}
      >
        {isIncome ? '+' : '-'}{formatMoney(transaction.amount, settings)}
      </div>
    </div>
  );
}

function EmptyChart({ message }: { message: string }) {
  return (
    <div className="flex items-center justify-center h-[200px] rounded-xl" style={{ background: 'var(--surface-muted)' }}>
      <p className="text-xs text-center px-6" style={{ color: 'var(--subtle)' }}>{message}</p>
    </div>
  );
}

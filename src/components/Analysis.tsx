import { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
  LineChart, Line,
} from 'recharts';
import type { Transaction, Settings } from '../types';
import { calcTotals, expensesByCategory, monthlyTrend } from '../utils/stats';
import { formatMoney, formatMoneyCompact } from '../utils/format';

interface AnalysisProps {
  transactions: Transaction[];
  settings: Settings;
}

const CATEGORY_COLORS = [
  '#2c6e49', '#4caf78', '#a8d5b8', '#e07b39', '#f0b27a',
  '#c0392b', '#8e44ad', '#2980b9', '#16a085', '#d4ac0d',
];

export function Analysis({ transactions, settings }: AnalysisProps) {
  const { income, expenses, balance } = useMemo(() => calcTotals(transactions), [transactions]);
  const catData = useMemo(() => expensesByCategory(transactions), [transactions]);
  const monthly = useMemo(() => monthlyTrend(transactions, 12), [transactions]);

  const totalExpenses = expenses;
  const savingsRate = income > 0 ? ((income - expenses) / income * 100) : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="display font-bold text-2xl" style={{ color: 'var(--ink)' }}>Spending Analysis</h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--muted)' }}>Understand your financial habits</p>
      </div>

      {transactions.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          {/* KPI row */}
          <div className="grid grid-cols-3 gap-3">
            <KpiCard label="Total Income" value={formatMoney(income, settings)} color="var(--income)" />
            <KpiCard label="Total Spent" value={formatMoney(expenses, settings)} color="var(--expense)" />
            <KpiCard
              label="Savings Rate"
              value={`${savingsRate >= 0 ? savingsRate.toFixed(1) : '0.0'}%`}
              color={savingsRate >= 0 ? 'var(--success)' : 'var(--danger)'}
              sub={balance >= 0 ? `Net ${formatMoney(balance, settings)}` : `Deficit ${formatMoney(Math.abs(balance), settings)}`}
            />
          </div>

          {/* Income vs Expenses bar */}
          <div className="rounded-2xl p-5" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <h2 className="font-semibold text-sm mb-4" style={{ color: 'var(--ink)' }}>Income vs Expenses — Monthly (12 months)</h2>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={monthly} barCategoryGap="30%">
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: 'var(--subtle)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: 'var(--subtle)' }} axisLine={false} tickLine={false} tickFormatter={(v: number) => formatMoneyCompact(v, settings)} width={64} />
                <Tooltip
                  contentStyle={{ background: 'var(--surface-strong)', border: '1px solid var(--border)', borderRadius: 12, fontSize: 12 }}
                  formatter={(value, name) => [typeof value === 'number' ? formatMoney(value, settings) : value, name === 'income' ? 'Income' : 'Expenses']}
                />
                <Bar dataKey="income" fill="var(--income)" radius={[4, 4, 0, 0]} name="income" />
                <Bar dataKey="expenses" fill="var(--expense)" radius={[4, 4, 0, 0]} name="expenses" />
                <Legend formatter={(v) => v === 'income' ? 'Income' : 'Expenses'} iconType="square" wrapperStyle={{ fontSize: 11 }} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Expense trend line */}
          <div className="rounded-2xl p-5" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <h2 className="font-semibold text-sm mb-4" style={{ color: 'var(--ink)' }}>Monthly Expense Trend</h2>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={monthly}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: 'var(--subtle)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: 'var(--subtle)' }} axisLine={false} tickLine={false} tickFormatter={(v: number) => formatMoneyCompact(v, settings)} width={64} />
                <Tooltip
                  contentStyle={{ background: 'var(--surface-strong)', border: '1px solid var(--border)', borderRadius: 12, fontSize: 12 }}
                  formatter={(value) => [typeof value === 'number' ? formatMoney(value, settings) : value, 'Expenses']}
                />
                <Line type="monotone" dataKey="expenses" stroke="var(--expense)" strokeWidth={2} dot={{ r: 3, fill: 'var(--expense)' }} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Category breakdown */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* Pie */}
            <div className="rounded-2xl p-5" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
              <h2 className="font-semibold text-sm mb-4" style={{ color: 'var(--ink)' }}>Expenses by Category</h2>
              {catData.length === 0 ? (
                <NoExpenses />
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={catData} dataKey="amount" nameKey="category" cx="50%" cy="50%" outerRadius={80} innerRadius={36}>
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

            {/* Category list */}
            <div className="rounded-2xl p-5" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
              <h2 className="font-semibold text-sm mb-4" style={{ color: 'var(--ink)' }}>Category Breakdown</h2>
              {catData.length === 0 ? (
                <NoExpenses />
              ) : (
                <div className="space-y-3">
                  {catData.map((cat, idx) => {
                    const pct = totalExpenses > 0 ? (cat.amount / totalExpenses * 100) : 0;
                    const color = CATEGORY_COLORS[idx % CATEGORY_COLORS.length];
                    return (
                      <div key={cat.category}>
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
                            <span className="text-xs font-medium" style={{ color: 'var(--ink)' }}>{cat.category}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs" style={{ color: 'var(--subtle)' }}>{pct.toFixed(1)}%</span>
                            <span className="text-xs font-semibold tabular-nums" style={{ color: 'var(--ink)' }}>{formatMoney(cat.amount, settings)}</span>
                          </div>
                        </div>
                        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--surface-muted)' }}>
                          <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function KpiCard({ label, value, color, sub }: { label: string; value: string; color: string; sub?: string }) {
  return (
    <div className="rounded-2xl p-4" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
      <p className="text-xs font-medium mb-1.5" style={{ color: 'var(--muted)' }}>{label}</p>
      <p className="display font-bold text-base tabular-nums leading-tight" style={{ color, wordBreak: 'break-all' }}>{value}</p>
      {sub && <p className="text-xs mt-0.5" style={{ color: 'var(--subtle)' }}>{sub}</p>}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-2xl p-12 text-center" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
      <p className="font-semibold text-sm" style={{ color: 'var(--ink)' }}>No data yet</p>
      <p className="text-sm mt-1" style={{ color: 'var(--subtle)' }}>Add some transactions to see your spending analysis.</p>
    </div>
  );
}

function NoExpenses() {
  return (
    <div className="py-6 text-center">
      <p className="text-sm" style={{ color: 'var(--subtle)' }}>No expense records to analyse.</p>
    </div>
  );
}

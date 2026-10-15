import type { Transaction } from '../types';

export function calcTotals(transactions: Transaction[]) {
  let income = 0;
  let expenses = 0;
  for (const t of transactions) {
    if (t.type === 'income') income += t.amount;
    else expenses += t.amount;
  }
  return { income, expenses, balance: income - expenses };
}

export function calcThisMonthExpenses(transactions: Transaction[]): number {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  return transactions
    .filter((t) => {
      if (t.type !== 'expense') return false;
      const d = new Date(t.date + 'T00:00:00');
      return d.getFullYear() === year && d.getMonth() === month;
    })
    .reduce((sum, t) => sum + t.amount, 0);
}

export interface CategoryStat {
  category: string;
  amount: number;
  count: number;
}

export function expensesByCategory(transactions: Transaction[]): CategoryStat[] {
  const map = new Map<string, { amount: number; count: number }>();
  for (const t of transactions) {
    if (t.type !== 'expense') continue;
    const prev = map.get(t.category) ?? { amount: 0, count: 0 };
    map.set(t.category, { amount: prev.amount + t.amount, count: prev.count + 1 });
  }
  return Array.from(map.entries())
    .map(([category, { amount, count }]) => ({ category, amount, count }))
    .sort((a, b) => b.amount - a.amount);
}

export interface MonthlyData {
  month: string; // "Oct 2026"
  income: number;
  expenses: number;
}

export function monthlyTrend(transactions: Transaction[], months = 6): MonthlyData[] {
  const now = new Date();
  const result: MonthlyData[] = [];
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const year = d.getFullYear();
    const month = d.getMonth();
    const label = d.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });
    let income = 0;
    let expenses = 0;
    for (const t of transactions) {
      const td = new Date(t.date + 'T00:00:00');
      if (td.getFullYear() === year && td.getMonth() === month) {
        if (t.type === 'income') income += t.amount;
        else expenses += t.amount;
      }
    }
    result.push({ month: label, income, expenses });
  }
  return result;
}

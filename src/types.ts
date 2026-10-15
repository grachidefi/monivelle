export type TransactionType = 'income' | 'expense';

export type IncomeCategory =
  | 'Salary'
  | 'Freelance'
  | 'Business'
  | 'Gifts'
  | 'Other';

export type ExpenseCategory =
  | 'Food'
  | 'Transportation'
  | 'Rent'
  | 'Bills'
  | 'Shopping'
  | 'Health'
  | 'Entertainment'
  | 'Data & Internet'
  | 'Other';

export type Category = IncomeCategory | ExpenseCategory;

export const INCOME_CATEGORIES: IncomeCategory[] = [
  'Salary',
  'Freelance',
  'Business',
  'Gifts',
  'Other',
];

export const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  'Food',
  'Transportation',
  'Rent',
  'Bills',
  'Shopping',
  'Health',
  'Entertainment',
  'Data & Internet',
  'Other',
];

export interface Transaction {
  id: string;
  title: string;
  type: TransactionType;
  amount: number;
  category: Category;
  date: string; // ISO date string YYYY-MM-DD
  notes?: string;
  createdAt: number; // timestamp ms
}

export interface Settings {
  currency: 'NGN' | 'USD' | 'GBP';
  name: string;
}

export const CURRENCIES: Record<Settings['currency'], { symbol: string; label: string }> = {
  NGN: { symbol: '₦', label: 'Nigerian Naira (₦)' },
  USD: { symbol: '$', label: 'US Dollar ($)' },
  GBP: { symbol: '£', label: 'British Pound (£)' },
};

export type Page = 'dashboard' | 'transactions' | 'analysis' | 'settings';

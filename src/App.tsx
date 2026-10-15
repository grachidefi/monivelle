import { useState } from 'react';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { Nav } from './components/Nav';

import { Dashboard } from './components/Dashboard';
import { Transactions } from './components/Transactions';
import { Analysis } from './components/Analysis';
import { SettingsPage } from './components/SettingsPage';
import { AddTransactionModal } from './components/AddTransactionModal';
import { AuthScreen } from './components/AuthScreen';
import { useAuth, signOut } from './hooks/useAuth';
import { useTransactions } from './hooks/useTransactions';
import type { Page, Transaction, Settings } from './types';
import type { User } from '@supabase/supabase-js';

export default function App() {
  const { user, loading: authLoading } = useAuth();

  if (authLoading) {
    return (
      <div className="min-h-dvh flex items-center justify-center" style={{ background: 'var(--bg-gradient)' }}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: 'var(--accent)' }}>
            <span className="display text-white font-bold text-xl">M</span>
          </div>
          <Loader2 size={20} className="animate-spin" style={{ color: 'var(--accent)' }} />
        </div>
      </div>
    );
  }

  if (!user) return <AuthScreen />;

  return <MainApp user={user} />;
}

function MainApp({ user }: { user: User }) {
  const [page, setPage] = useState<Page>('dashboard');
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Transaction | null>(null);

  const {
    transactions,
    settings,
    loading: dataLoading,
    error: dataError,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    updateSettings,
  } = useTransactions(user);

  function openAdd() {
    setEditTarget(null);
    setModalOpen(true);
  }

  function openEdit(t: Transaction) {
    setEditTarget(t);
    setModalOpen(true);
  }

  function handleSave(data: Omit<Transaction, 'id' | 'createdAt'>) {
    if (editTarget) {
      void updateTransaction(editTarget.id, data).then(() => toast.success('Transaction updated'));
    } else {
      void addTransaction(data).then(() => toast.success('Transaction saved'));
    }
    setModalOpen(false);
    setEditTarget(null);
  }

  function handleDelete(id: string) {
    void deleteTransaction(id).then(() => toast.success('Transaction deleted'));
  }

  function handleUpdateSettings(s: Partial<Settings>) {
    void updateSettings(s);
  }

  return (
    <div className="min-h-dvh flex flex-col md:flex-row">
      <Nav page={page} onNavigate={setPage} settings={settings} onSignOut={() => { void signOut(); }} />

      <main className="flex-1 px-4 py-6 md:px-8 md:py-8 pb-24 md:pb-8 overflow-auto">
        <div className="max-w-4xl mx-auto">
          {dataError && (
            <div
              className="mb-4 rounded-2xl px-4 py-3 text-sm"
              style={{ background: 'var(--expense-light)', color: 'var(--expense)' }}
            >
              {dataError}
            </div>
          )}

          {dataLoading ? (
            <div className="flex items-center justify-center py-24">
              <Loader2 size={24} className="animate-spin" style={{ color: 'var(--accent)' }} />
            </div>
          ) : (
            <>
              {page === 'dashboard' && (
                <Dashboard
                  transactions={transactions}
                  settings={settings}
                  onAddTransaction={openAdd}
                  onNavigateTransactions={() => setPage('transactions')}
                />
              )}
              {page === 'transactions' && (
                <Transactions
                  transactions={transactions}
                  settings={settings}
                  onAdd={openAdd}
                  onEdit={openEdit}
                  onDelete={handleDelete}
                />
              )}
              {page === 'analysis' && (
                <Analysis transactions={transactions} settings={settings} />
              )}
              {page === 'settings' && (
                <SettingsPage
                  settings={settings}
                  onUpdate={handleUpdateSettings}
                  userEmail={user.email}
                />
              )}
            </>
          )}
        </div>
      </main>

      <AddTransactionModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditTarget(null); }}
        onSave={handleSave}
        initial={editTarget}
      />
    </div>
  );
}

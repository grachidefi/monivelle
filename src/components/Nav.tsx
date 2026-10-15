import { LayoutDashboard, List, BarChart2, Settings, LogOut, type LucideProps } from 'lucide-react';
import type { ForwardRefExoticComponent, RefAttributes } from 'react';
import type { Page, Settings as AppSettings } from '../types';

interface NavProps {
  page: Page;
  onNavigate: (p: Page) => void;
  settings: AppSettings;
  onSignOut: () => void;
}

type LucideIcon = ForwardRefExoticComponent<Omit<LucideProps, 'ref'> & RefAttributes<SVGSVGElement>>;

const NAV_ITEMS: { id: Page; label: string; Icon: LucideIcon }[] = [
  { id: 'dashboard', label: 'Dashboard', Icon: LayoutDashboard },
  { id: 'transactions', label: 'Transactions', Icon: List },
  { id: 'analysis', label: 'Analysis', Icon: BarChart2 },
  { id: 'settings', label: 'Settings', Icon: Settings },
];

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'U';
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function Nav({ page, onNavigate, settings, onSignOut }: NavProps) {
  const initials = getInitials(settings.name);
  const displayName = settings.name.trim() || 'My Account';

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className="hidden md:flex flex-col h-screen w-60 sticky top-0 shrink-0 border-r"
        style={{ background: 'var(--surface-strong)', borderColor: 'var(--border)' }}
      >
        {/* Logo */}
        <div className="px-5 py-5 border-b" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'var(--accent)' }}>
              <span className="display text-white font-bold text-sm">M</span>
            </div>
            <div>
              <div className="display font-bold text-sm leading-tight" style={{ color: 'var(--ink)' }}>Monivelle</div>
              <div className="text-xs" style={{ color: 'var(--muted)' }}>Expense Tracker</div>
            </div>
          </div>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
          {NAV_ITEMS.map(({ id, label, Icon }) => {
            const active = page === id;
            return (
              <button
                key={id}
                onClick={() => onNavigate(id)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all"
                style={{
                  background: active ? 'var(--accent-light)' : 'transparent',
                  color: active ? 'var(--accent)' : 'var(--muted)',
                  fontWeight: active ? 600 : 500,
                }}
              >
                <Icon size={16} />
                {label}
              </button>
            );
          })}
        </nav>

        {/* User avatar strip + logout */}
        <div className="px-4 py-3 border-t flex items-center gap-2" style={{ borderColor: 'var(--border)' }}>
          <button
            onClick={() => onNavigate('settings')}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity flex-1 min-w-0 text-left"
          >
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-sm font-bold"
              style={{ background: 'var(--accent)', color: '#fff' }}
            >
              {initials}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate leading-tight" style={{ color: 'var(--ink)' }}>{displayName}</p>
              <p className="text-xs truncate" style={{ color: 'var(--subtle)' }}>View settings</p>
            </div>
          </button>
          <button
            onClick={onSignOut}
            title="Sign out"
            className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 hover:opacity-80 transition-opacity"
            style={{ background: 'var(--expense-light)', color: 'var(--expense)' }}
          >
            <LogOut size={15} />
          </button>
        </div>
      </aside>

      {/* Mobile bottom bar */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t flex"
        style={{ background: 'var(--surface-strong)', borderColor: 'var(--border)' }}
      >
        {NAV_ITEMS.map(({ id, label, Icon }) => {
          const active = page === id;
          return (
            <button
              key={id}
              onClick={() => onNavigate(id)}
              className="flex-1 flex flex-col items-center gap-1 py-3 text-xs font-medium transition-all"
              style={{ color: active ? 'var(--accent)' : 'var(--subtle)' }}
            >
              {id === 'settings' ? (
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{
                    background: active ? 'var(--accent)' : 'var(--surface-muted)',
                    color: active ? '#fff' : 'var(--muted)',
                    fontSize: 9,
                  }}
                >
                  {initials}
                </div>
              ) : (
                <Icon size={18} />
              )}
              <span style={{ fontWeight: active ? 600 : 400 }}>{label}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
}

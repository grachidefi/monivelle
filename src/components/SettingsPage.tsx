import { useState } from 'react';
import { CheckCircle2, User, Save } from 'lucide-react';
import type { Settings } from '../types';
import { CURRENCIES } from '../types';

interface SettingsPageProps {
  settings: Settings;
  onUpdate: (s: Partial<Settings>) => void;
  userEmail?: string;
}

export function SettingsPage({ settings, onUpdate, userEmail }: SettingsPageProps) {
  const [nameInput, setNameInput] = useState(settings.name);
  const [nameSaved, setNameSaved] = useState(false);

  function handleSaveName() {
    onUpdate({ name: nameInput.trim() });
    setNameSaved(true);
    setTimeout(() => setNameSaved(false), 2000);
  }

  const nameChanged = nameInput.trim() !== settings.name;

  return (
    <div className="space-y-6 max-w-lg">
      <div>
        <h1 className="display font-bold text-2xl" style={{ color: 'var(--ink)' }}>Settings</h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--muted)' }}>Manage your Monivelle preferences</p>
      </div>

      {/* Account info */}
      <div className="rounded-2xl p-5" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
        <h2 className="font-semibold text-sm mb-4" style={{ color: 'var(--ink)' }}>Account</h2>
        <div className="flex items-center gap-4 mb-5">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 text-xl font-bold"
            style={{ background: 'var(--accent)', color: '#fff' }}
          >
            {settings.name.trim()
              ? settings.name.trim().split(/\s+/).filter(Boolean).map((p) => p[0]).slice(0, 2).join('').toUpperCase()
              : 'U'}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-base leading-tight truncate" style={{ color: 'var(--ink)' }}>
              {settings.name.trim() || 'No name set'}
            </p>
            <p className="text-sm truncate mt-0.5" style={{ color: 'var(--muted)' }}>{userEmail}</p>
          </div>
        </div>

        {/* Name edit */}
        <div>
          <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--muted)' }}>
            Display name
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--subtle)' }} />
              <input
                type="text"
                value={nameInput}
                onChange={(e) => { setNameInput(e.target.value); setNameSaved(false); }}
                placeholder="Your full name"
                className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm outline-none"
                style={{ background: 'var(--surface-muted)', color: 'var(--ink)' }}
              />
            </div>
            <button
              onClick={handleSaveName}
              disabled={!nameChanged && !nameSaved}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-40"
              style={{ background: nameSaved ? 'var(--income-light)' : 'var(--accent-light)', color: nameSaved ? 'var(--income)' : 'var(--accent)' }}
            >
              {nameSaved ? <CheckCircle2 size={14} /> : <Save size={14} />}
              {nameSaved ? 'Saved' : 'Save'}
            </button>
          </div>
        </div>

      </div>

      {/* Currency */}
      <div className="rounded-2xl p-5" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
        <h2 className="font-semibold text-sm mb-1" style={{ color: 'var(--ink)' }}>Currency</h2>
        <p className="text-xs mb-4" style={{ color: 'var(--muted)' }}>Choose the currency symbol displayed across the app.</p>
        <div className="space-y-2">
          {(Object.entries(CURRENCIES) as [Settings['currency'], { symbol: string; label: string }][]).map(([key, { symbol, label }]) => {
            const selected = settings.currency === key;
            return (
              <button
                key={key}
                onClick={() => onUpdate({ currency: key })}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all border text-left"
                style={{
                  background: selected ? 'var(--accent-light)' : 'var(--surface-muted)',
                  borderColor: selected ? 'var(--accent-mid)' : 'transparent',
                }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-lg"
                    style={{
                      background: selected ? 'var(--accent)' : 'var(--surface)',
                      color: selected ? '#fff' : 'var(--muted)',
                    }}
                  >
                    {symbol}
                  </div>
                  <span className="text-sm font-medium" style={{ color: 'var(--ink)' }}>{label}</span>
                </div>
                {selected && <CheckCircle2 size={18} style={{ color: 'var(--accent)' }} />}
              </button>
            );
          })}
        </div>
      </div>

      {/* About */}
      <div className="rounded-2xl p-5" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
        <h2 className="font-semibold text-sm mb-1" style={{ color: 'var(--ink)' }}>About Monivelle</h2>
        <p className="text-sm" style={{ color: 'var(--muted)' }}>
          A simple, beginner-friendly personal expense tracker. Record your income and expenses, understand your spending habits, and stay on top of your finances.
        </p>
        <p className="text-xs mt-3" style={{ color: 'var(--subtle)' }}>
          Your data is stored securely in Supabase and syncs across your devices.
        </p>
        <div className="mt-4 flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: 'var(--accent)' }}>
            <span className="display text-white font-bold text-xs">M</span>
          </div>
          <span className="text-xs font-semibold" style={{ color: 'var(--ink)' }}>Monivelle v1.0</span>
        </div>
      </div>
    </div>
  );
}

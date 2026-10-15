import { useState, useEffect, useRef } from 'react';
import { Loader2, Mail, Lock, Eye, EyeOff, ArrowLeft, User, RefreshCw } from 'lucide-react';
import { signIn, signUp, resetPassword, resendConfirmation } from '../hooks/useAuth';

type AuthView = 'login' | 'signup' | 'reset';

export function AuthScreen() {
  const [view, setView] = useState<AuthView>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [signedUpEmail, setSignedUpEmail] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => { if (cooldownRef.current) clearInterval(cooldownRef.current); };
  }, []);

  function startCooldown() {
    setResendCooldown(60);
    cooldownRef.current = setInterval(() => {
      setResendCooldown((s) => {
        if (s <= 1) { clearInterval(cooldownRef.current!); return 0; }
        return s - 1;
      });
    }, 1000);
  }

  async function handleResend() {
    if (!signedUpEmail || resendCooldown > 0) return;
    setResendLoading(true);
    setError(null);
    const { error: err } = await resendConfirmation(signedUpEmail);
    setResendLoading(false);
    if (err) {
      setError(err.message);
    } else {
      setSuccess('Confirmation email resent — check your inbox.');
      startCooldown();
    }
  }

  function resetForm() {
    setName('');
    setEmail('');
    setPassword('');
    setError(null);
    setSuccess(null);
    setSignedUpEmail(null);
    setResendCooldown(0);
    if (cooldownRef.current) clearInterval(cooldownRef.current);
  }

  function switchView(v: AuthView) {
    resetForm();
    setView(v);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (view === 'signup' && !name.trim()) { setError('Please enter your name'); return; }
    if (!email.trim()) { setError('Email is required'); return; }
    if (view !== 'reset' && !password) { setError('Password is required'); return; }
    if (view === 'signup' && password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    if (view === 'login') {
      const { error: err } = await signIn(email.trim(), password);
      if (err) setError(err.message);
    } else if (view === 'signup') {
      const { error: err } = await signUp(email.trim(), password, name.trim());
      if (err) {
        setError(err.message);
      } else {
        setSignedUpEmail(email.trim());
        setSuccess(`Welcome, ${name.trim()}! Check your email to confirm your account, then sign in.`);
        startCooldown();
      }
    } else {
      const { error: err } = await resetPassword(email.trim());
      if (err) setError(err.message);
      else setSuccess('Password reset link sent — check your inbox.');
    }

    setLoading(false);
  }

  const isReset = view === 'reset';
  const isSignup = view === 'signup';

  return (
    <div
      className="min-h-dvh flex items-center justify-center px-4 py-12"
      style={{ background: 'var(--bg-gradient)', backgroundAttachment: 'fixed' }}
    >
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 shadow-sm"
            style={{ background: 'var(--accent)' }}
          >
            <span className="display text-white font-bold text-2xl">M</span>
          </div>
          <h1 className="display font-bold text-2xl" style={{ color: 'var(--ink)' }}>Monivelle</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>Personal Expense Tracker</p>
        </div>

        {/* Card */}
        <div
          className="rounded-3xl p-6"
          style={{ background: 'var(--surface-strong)', border: '1px solid var(--border)' }}
        >
          {isReset && (
            <button
              onClick={() => switchView('login')}
              className="flex items-center gap-1.5 text-xs font-medium mb-4 hover:opacity-70 transition-opacity"
              style={{ color: 'var(--muted)' }}
            >
              <ArrowLeft size={13} /> Back to sign in
            </button>
          )}

          <h2 className="display font-bold text-lg mb-1" style={{ color: 'var(--ink)' }}>
            {isReset ? 'Reset password' : isSignup ? 'Create your account' : 'Welcome back'}
          </h2>
          <p className="text-sm mb-5" style={{ color: 'var(--muted)' }}>
            {isReset
              ? "Enter your email and we'll send a reset link."
              : isSignup
              ? 'Start tracking your income and expenses today.'
              : 'Sign in to continue to Monivelle.'}
          </p>

          <form onSubmit={(e) => { void handleSubmit(e); }} className="space-y-4" noValidate>

            {/* Full name — signup only */}
            {isSignup && (
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--muted)' }}>
                  Full name
                </label>
                <div className="relative">
                  <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--subtle)' }} />
                  <input
                    type="text"
                    autoComplete="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Amaka Obi"
                    className="w-full rounded-xl pl-9 pr-4 py-3 text-sm outline-none transition-all"
                    style={{ background: 'var(--surface-muted)', color: 'var(--ink)' }}
                  />
                </div>
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--muted)' }}>
                Email address
              </label>
              <div className="relative">
                <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--subtle)' }} />
                <input
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-xl pl-9 pr-4 py-3 text-sm outline-none"
                  style={{ background: 'var(--surface-muted)', color: 'var(--ink)' }}
                />
              </div>
            </div>

            {/* Password */}
            {!isReset && (
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--muted)' }}>
                  Password
                </label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--subtle)' }} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    autoComplete={isSignup ? 'new-password' : 'current-password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={isSignup ? 'At least 6 characters' : '••••••••'}
                    className="w-full rounded-xl pl-9 pr-10 py-3 text-sm outline-none"
                    style={{ background: 'var(--surface-muted)', color: 'var(--ink)' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 hover:opacity-70 transition-opacity"
                    tabIndex={-1}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword
                      ? <EyeOff size={14} style={{ color: 'var(--subtle)' }} />
                      : <Eye size={14} style={{ color: 'var(--subtle)' }} />}
                  </button>
                </div>
              </div>
            )}

            {/* Forgot password */}
            {view === 'login' && (
              <div className="text-right -mt-2">
                <button
                  type="button"
                  onClick={() => switchView('reset')}
                  className="text-xs font-medium hover:opacity-70 transition-opacity"
                  style={{ color: 'var(--accent)' }}
                >
                  Forgot password?
                </button>
              </div>
            )}

            {/* Error / success banners */}
            {error && (
              <p className="text-xs rounded-xl px-3 py-2.5" style={{ background: 'var(--expense-light)', color: 'var(--expense)' }}>
                {error}
              </p>
            )}
            {success && (
              <div className="rounded-xl px-3 py-2.5 space-y-2" style={{ background: 'var(--income-light)' }}>
                <p className="text-xs" style={{ color: 'var(--income)' }}>{success}</p>
                {signedUpEmail && (
                  <button
                    type="button"
                    onClick={() => { void handleResend(); }}
                    disabled={resendCooldown > 0 || resendLoading}
                    className="flex items-center gap-1.5 text-xs font-semibold disabled:opacity-50 transition-opacity hover:opacity-70"
                    style={{ color: 'var(--income)' }}
                  >
                    {resendLoading
                      ? <Loader2 size={12} className="animate-spin" />
                      : <RefreshCw size={12} />}
                    {resendCooldown > 0
                      ? `Resend in ${resendCooldown}s`
                      : 'Resend confirmation email'}
                  </button>
                )}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-2xl text-sm font-semibold text-white transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
              style={{ background: 'var(--accent)' }}
            >
              {loading
                ? <><Loader2 size={15} className="animate-spin" /> Please wait…</>
                : isReset ? 'Send reset link'
                : isSignup ? 'Create account'
                : 'Sign in'}
            </button>
          </form>
        </div>

        {/* Switch view */}
        <p className="text-center text-sm mt-5" style={{ color: 'var(--muted)' }}>
          {isSignup ? (
            <>Already have an account?{' '}
              <button onClick={() => switchView('login')} className="font-semibold hover:opacity-70 transition-opacity" style={{ color: 'var(--accent)' }}>Sign in</button>
            </>
          ) : isReset ? null : (
            <>Don&apos;t have an account?{' '}
              <button onClick={() => switchView('signup')} className="font-semibold hover:opacity-70 transition-opacity" style={{ color: 'var(--accent)' }}>Create one</button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}

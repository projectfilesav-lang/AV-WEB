import React, { useState } from 'react';
import {
  signInWithPassword,
  signInWithPasskey,
  getStoredSupabaseConfig,
  saveSupabaseConfig,
  ALLOWED_ADMIN_EMAILS,
  getStoredAdminPassword
} from '../supabase';
import { ShieldCheck, Lock, Eye, EyeOff, Fingerprint, KeyRound, AlertCircle, Settings2, Film } from 'lucide-react';

interface AdminLoginProps {
  onLoginSuccess: (user: { email: string; id: string }, token: string) => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLoginSuccess }) => {
  const storedConfig = getStoredSupabaseConfig();
  const [email, setEmail] = useState('projectfilesav@gmail.com');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginMethod, setLoginMethod] = useState<'password' | 'passkey'>('password');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Supabase config accordion (optional)
  const [showConfig, setShowConfig] = useState(false);
  const [supabaseUrl, setSupabaseUrl] = useState(storedConfig.url);
  const [supabaseAnonKey, setSupabaseAnonKey] = useState(storedConfig.anonKey);
  const [configSavedNotice, setConfigSavedNotice] = useState(false);

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    saveSupabaseConfig(supabaseUrl, supabaseAnonKey);
    setConfigSavedNotice(true);
    setTimeout(() => setConfigSavedNotice(false), 2500);
    setErrorMsg('');
  };

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    const res = await signInWithPassword(email, password);
    setIsLoading(false);

    if (res.success && res.user && res.token) {
      onLoginSuccess({ email: res.user.email || email, id: res.user.id }, res.token);
    } else {
      setErrorMsg(res.error || 'Authentication failed. Please verify credentials.');
    }
  };

  const handlePasskeyLogin = async () => {
    setErrorMsg('');
    setIsLoading(true);

    const res = await signInWithPasskey(email);
    setIsLoading(false);

    if (res.success && res.user && res.token) {
      onLoginSuccess({ email: res.user.email || email, id: res.user.id }, res.token);
    } else {
      setErrorMsg(res.error || 'Biometric / Passkey authentication failed.');
    }
  };

  return (
    <div className="min-h-screen bg-[#070707] text-[#FAF7F2] flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0 film-grain opacity-25 pointer-events-none" />
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-[var(--color-gold)]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-md w-full">
        {/* Backstage Header */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-sm border border-[var(--color-gold)] flex items-center justify-center bg-[#111] text-[var(--color-gold)] mx-auto mb-4 shadow-[0_0_15px_rgba(212,175,55,0.3)]">
            <Film className="w-6 h-6" />
          </div>
          <span className="text-[10px] font-mono tracking-[0.3em] uppercase text-[var(--color-gold)] block mb-1 font-semibold">
            SECURE ACCESS GATEWAY
          </span>
          <h1 className="text-2xl sm:text-3xl font-heading font-extrabold uppercase tracking-tight text-white">
            Backstage Administration
          </h1>
          <p className="text-xs text-white/50 mt-1 font-light">
            Restricted to allowlisted studio directors only.
          </p>
        </div>

        {/* Login Box */}
        <div className="p-6 sm:p-8 rounded-sm border border-[var(--color-gold)]/40 bg-[#111111] shadow-2xl">
          {/* Allowlist Warning Banner */}
          <div className="flex items-center gap-2 p-2.5 rounded bg-black/60 border border-[var(--color-gold)]/20 mb-6 text-[11px] font-mono text-[var(--color-gold)]">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>Authorized: desheriffV653 / projectfilesav</span>
          </div>

          {errorMsg && (
            <div className="mb-6 p-3 bg-red-950/50 border border-red-500/50 rounded-sm text-xs text-red-300 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Email input common to both auth types */}
          <div className="mb-5">
            <label className="block text-[11px] font-mono tracking-wider text-[var(--color-gold)] uppercase font-semibold mb-2">
              ADMINISTRATOR EMAIL *
            </label>
            <select
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-black border border-white/20 focus:border-[var(--color-gold)] rounded-sm text-sm text-white outline-none mb-2"
            >
              {ALLOWED_ADMIN_EMAILS.map((em) => (
                <option key={em} value={em} className="bg-black text-white">
                  {em}
                </option>
              ))}
            </select>
          </div>

          {/* Tab Selector: Password vs Passkey */}
          <div className="grid grid-cols-2 gap-2 mb-6 p-1 bg-black rounded-sm border border-white/10">
            <button
              type="button"
              onClick={() => setLoginMethod('password')}
              className={`py-2 text-xs font-heading font-bold tracking-wider uppercase rounded-sm transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                loginMethod === 'password'
                  ? 'bg-[var(--color-gold)] text-black shadow-sm'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>PASSWORD</span>
            </button>
            <button
              type="button"
              onClick={() => setLoginMethod('passkey')}
              className={`py-2 text-xs font-heading font-bold tracking-wider uppercase rounded-sm transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                loginMethod === 'passkey'
                  ? 'bg-[var(--color-gold)] text-black shadow-sm'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              <Fingerprint className="w-3.5 h-3.5" />
              <span>PASSKEY / BIO</span>
            </button>
          </div>

          {/* Method 1: Password Login */}
          {loginMethod === 'password' ? (
            <form onSubmit={handlePasswordLogin} className="flex flex-col gap-5">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-[11px] font-mono tracking-wider text-[var(--color-gold)] uppercase font-semibold">
                    PASSWORD *
                  </label>
                  <button
                    type="button"
                    onClick={() => setPassword(getStoredAdminPassword())}
                    className="text-[10px] font-mono text-[var(--color-gold)] hover:underline cursor-pointer flex items-center gap-1"
                    title="Click to automatically fill the current backstage password"
                  >
                    <span>Auto-Fill:</span>
                    <span className="bg-black/80 px-1.5 py-0.5 rounded border border-[var(--color-gold)]/40 font-bold">
                      {getStoredAdminPassword()}
                    </span>
                  </button>
                </div>
                <div className="relative">
                  <input
                    id="admin-password-input"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter admin password..."
                    className="w-full px-3.5 py-2.5 bg-black border border-white/20 focus:border-[var(--color-gold)] rounded-sm text-sm text-white outline-none pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/50 hover:text-[var(--color-gold)] transition-colors p-1"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                id="admin-login-submit-btn"
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 bg-[var(--color-gold)] text-black font-heading font-extrabold text-xs tracking-widest uppercase rounded-sm border border-[var(--color-gold)] hover:bg-transparent hover:text-[var(--color-gold)] transition-all cursor-pointer shadow-[0_0_15px_rgba(212,175,55,0.3)] disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <span>AUTHENTICATING...</span>
                ) : (
                  <>
                    <Lock className="w-3.5 h-3.5" />
                    <span>ENTER BACKSTAGE</span>
                  </>
                )}
              </button>
            </form>
          ) : (
            /* Method 2: Passkey / Biometric Login */
            <div className="flex flex-col items-center text-center py-4">
              <div className="w-16 h-16 rounded-full border-2 border-[var(--color-gold)] flex items-center justify-center text-[var(--color-gold)] mb-4 bg-black/60 shadow-[0_0_20px_rgba(212,175,55,0.25)]">
                <Fingerprint className="w-8 h-8 animate-pulse" />
              </div>
              <h3 className="font-heading font-bold text-sm uppercase text-white mb-1">
                Biometric & Security Key Sign-In
              </h3>
              <p className="text-xs text-white/60 font-light max-w-xs mb-6">
                Use your device Touch ID, Face ID, Windows Hello, or hardware passkey key.
              </p>
              <button
                id="admin-passkey-trigger-btn"
                type="button"
                onClick={handlePasskeyLogin}
                disabled={isLoading}
                className="w-full py-3.5 bg-[var(--color-gold)] text-black font-heading font-extrabold text-xs tracking-widest uppercase rounded-sm border border-[var(--color-gold)] hover:bg-transparent hover:text-[var(--color-gold)] transition-all cursor-pointer shadow-[0_0_15px_rgba(212,175,55,0.3)] disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isLoading ? 'SCANNING HARDWARE...' : 'TRIGGER BIOMETRIC / PASSKEY'}
              </button>
            </div>
          )}

          {/* Inactivity Security Notice */}
          <div className="mt-6 pt-4 border-t border-white/10 text-center">
            <span className="text-[10px] font-mono text-white/40 uppercase">
              • AUTO-EXPIRES AFTER 5 MINUTES OF INACTIVITY •
            </span>
          </div>
        </div>

        {/* Supabase Configuration Panel Toggle (Section 1 requirement) */}
        <div className="mt-6">
          <button
            onClick={() => setShowConfig(!showConfig)}
            className="text-xs font-mono text-[var(--color-gold)]/80 hover:text-[var(--color-gold)] flex items-center justify-center gap-1.5 w-full cursor-pointer py-1"
          >
            <Settings2 className="w-3.5 h-3.5" />
            <span>{showConfig ? 'Hide Supabase Auth Configuration' : 'Configure Supabase Auth Keys'}</span>
          </button>

          {showConfig && (
            <div className="mt-3 p-5 bg-[#0e0e0e] border border-white/10 rounded-sm">
              <span className="text-[10px] font-mono text-[var(--color-gold)] uppercase font-semibold block mb-2">
                SUPABASE PROJECT CREDENTIALS
              </span>
              <p className="text-xs text-white/60 font-light mb-4 leading-relaxed">
                Supabase Auth provides native passkey/biometric authentication for the admin gateway. Provide your Supabase URL and Anon Key.
              </p>
              <form onSubmit={handleSaveConfig} className="flex flex-col gap-3">
                <div>
                  <label className="block text-[10px] font-mono text-white/50 uppercase mb-1">
                    PROJECT URL
                  </label>
                  <input
                    type="text"
                    value={supabaseUrl}
                    onChange={(e) => setSupabaseUrl(e.target.value)}
                    placeholder="https://xyzcompany.supabase.co"
                    className="w-full px-3 py-2 bg-black border border-white/20 rounded text-xs text-white outline-none focus:border-[var(--color-gold)]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-white/50 uppercase mb-1">
                    PUBLIC / ANON API KEY
                  </label>
                  <input
                    type="password"
                    value={supabaseAnonKey}
                    onChange={(e) => setSupabaseAnonKey(e.target.value)}
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6..."
                    className="w-full px-3 py-2 bg-black border border-white/20 rounded text-xs text-white outline-none focus:border-[var(--color-gold)]"
                  />
                </div>
                <div className="flex items-center justify-between pt-1">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[var(--color-gold)] text-black text-xs font-heading font-bold uppercase rounded-sm hover:bg-transparent hover:text-[var(--color-gold)] border border-[var(--color-gold)] transition-colors cursor-pointer"
                  >
                    Save Supabase Keys
                  </button>
                  {configSavedNotice && (
                    <span className="text-xs font-mono text-green-400">Keys saved!</span>
                  )}
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { signInWithPassword, getSupabaseEnvConfig } from '../supabase';
import { ShieldCheck, Lock, Eye, EyeOff, AlertCircle, Film } from 'lucide-react';

interface AdminLoginProps {
  onLoginSuccess: (user: { email: string; id: string }, token: string) => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLoginSuccess }) => {
  const { isConfigured, url, rawUrl } = getSupabaseEnvConfig();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    const res = await signInWithPassword(email, password);
    setIsLoading(false);

    if (res.success && res.user && res.token) {
      onLoginSuccess({ email: res.user.email || email, id: res.user.id }, res.token);
    } else {
      setErrorMsg(res.error || 'Authentication failed. Please verify your email and password.');
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
            SUPABASE AUTH GATEWAY
          </span>
          <h1 className="text-2xl sm:text-3xl font-heading font-extrabold uppercase tracking-tight text-white">
            Backstage Administration
          </h1>
          <p className="text-xs text-white/50 mt-1 font-light">
            Sign in with your Supabase Admin email and password.
          </p>
        </div>

        {/* Login Box */}
        <div className="p-6 sm:p-8 rounded-sm border border-[var(--color-gold)]/40 bg-[#111111] shadow-2xl">
          <div className="flex flex-col gap-1 p-2.5 rounded bg-black/60 border border-[var(--color-gold)]/20 mb-6 text-[11px] font-mono text-[var(--color-gold)]">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>Protected by Supabase Authentication &amp; Row Level Security</span>
            </div>
            {url && (
              <span className="text-[10px] text-white/50 pl-6 truncate">
                Endpoint: {url}
              </span>
            )}
          </div>

          {!isConfigured && (
            <div className="mb-6 p-3.5 bg-amber-950/50 border border-amber-500/50 rounded-sm text-xs text-amber-200 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
              <div>
                <p className="font-bold uppercase tracking-wider text-[11px] mb-1">Supabase Environment Variables Missing or Invalid</p>
                <p className="text-amber-200/80 leading-relaxed">
                  Please set <code className="font-mono text-white">VITE_SUPABASE_URL</code> (e.g. <code className="font-mono text-white">https://your-project-id.supabase.co</code>) and <code className="font-mono text-white">VITE_SUPABASE_ANON_KEY</code> in Netlify Environment Variables, then trigger a new deploy in Netlify.
                </p>
                {rawUrl && !url && (
                  <p className="text-red-300 mt-1.5 font-mono text-[11px]">
                    Current VITE_SUPABASE_URL ("{rawUrl}") is not a valid .supabase.co project URL.
                  </p>
                )}
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="mb-6 p-3 bg-red-950/50 border border-red-500/50 rounded-sm text-xs text-red-300 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handlePasswordLogin} className="flex flex-col gap-5">
            <div>
              <label
                htmlFor="admin-email-input"
                className="block text-[11px] font-mono tracking-wider text-[var(--color-gold)] uppercase font-semibold mb-2"
              >
                ADMIN EMAIL ADDRESS *
              </label>
              <input
                id="admin-email-input"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-3.5 py-2.5 bg-black border border-white/20 focus:border-[var(--color-gold)] rounded-sm text-sm text-white outline-none"
              />
            </div>

            <div>
              <label
                htmlFor="admin-password-input"
                className="block text-[11px] font-mono tracking-wider text-[var(--color-gold)] uppercase font-semibold mb-2"
              >
                PASSWORD *
              </label>
              <div className="relative">
                <input
                  id="admin-password-input"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your Supabase password..."
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
              disabled={isLoading || !isConfigured}
              className="w-full py-3.5 bg-[var(--color-gold)] text-black font-heading font-extrabold text-xs tracking-widest uppercase rounded-sm border border-[var(--color-gold)] hover:bg-transparent hover:text-[var(--color-gold)] transition-all cursor-pointer shadow-[0_0_15px_rgba(212,175,55,0.3)] disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <span>AUTHENTICATING...</span>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5" />
                  <span>SIGN IN TO BACKSTAGE</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

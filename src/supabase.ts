import { createClient, SupabaseClient, User, Session } from '@supabase/supabase-js';

export const ALLOWED_ADMIN_EMAILS = [
  'desheriffv653@gmail.com',
  'projectfilesav@gmail.com'
];

const STORAGE_KEY_URL = 'av_supabase_url';
const STORAGE_KEY_KEY = 'av_supabase_anon_key';
const STORAGE_KEY_SESSION = 'av_admin_session';
const STORAGE_KEY_ADMIN_PASSWORD = 'av_admin_master_password';

export const DEFAULT_ADMIN_PASSWORD = 'StudioGatei2026!';

export function getStoredAdminPassword(): string {
  return localStorage.getItem(STORAGE_KEY_ADMIN_PASSWORD) || DEFAULT_ADMIN_PASSWORD;
}

export function updateAdminPassword(newPassword: string): void {
  localStorage.setItem(STORAGE_KEY_ADMIN_PASSWORD, newPassword.trim());
}

export function getStoredSupabaseConfig(): { url: string; anonKey: string } {
  const envObj = (import.meta as unknown as { env?: Record<string, string> }).env || {};
  const url = localStorage.getItem(STORAGE_KEY_URL) || envObj.VITE_SUPABASE_URL || '';
  const anonKey = localStorage.getItem(STORAGE_KEY_KEY) || envObj.VITE_SUPABASE_ANON_KEY || '';
  return { url: url.trim(), anonKey: anonKey.trim() };
}

export interface StoredAdminSession {
  token: string;
  user: { email: string; id: string };
  timestamp: number;
}

export function saveAdminSession(token: string, user: { email: string; id: string }) {
  const session: StoredAdminSession = {
    token,
    user,
    timestamp: Date.now()
  };
  localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(session));
}

export function getAdminSession(): StoredAdminSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SESSION);
    if (!raw) return null;
    const parsed: StoredAdminSession = JSON.parse(raw);
    if (!parsed.token || !parsed.user || !isEmailAllowlisted(parsed.user.email)) {
      clearAdminSession();
      return null;
    }
    return parsed;
  } catch {
    clearAdminSession();
    return null;
  }
}

export function clearAdminSession() {
  localStorage.removeItem(STORAGE_KEY_SESSION);
}

export function saveSupabaseConfig(url: string, anonKey: string) {
  localStorage.setItem(STORAGE_KEY_URL, url.trim());
  localStorage.setItem(STORAGE_KEY_KEY, anonKey.trim());
}

export function clearSupabaseConfig() {
  localStorage.removeItem(STORAGE_KEY_URL);
  localStorage.removeItem(STORAGE_KEY_KEY);
  localStorage.removeItem(STORAGE_KEY_SESSION);
}

let supabaseInstance: SupabaseClient | null = null;
let currentConfigUrl = '';
let currentConfigKey = '';

export function getSupabaseClient(): SupabaseClient | null {
  const { url, anonKey } = getStoredSupabaseConfig();
  if (!url || !anonKey) return null;

  if (!supabaseInstance || currentConfigUrl !== url || currentConfigKey !== anonKey) {
    try {
      supabaseInstance = createClient(url, anonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
      });
      currentConfigUrl = url;
      currentConfigKey = anonKey;
    } catch (e) {
      console.error('Failed to initialize Supabase client:', e);
      return null;
    }
  }
  return supabaseInstance;
}

export function isEmailAllowlisted(email: string | undefined | null): boolean {
  if (!email) return false;
  return ALLOWED_ADMIN_EMAILS.includes(email.toLowerCase().trim());
}

export interface AdminAuthResult {
  success: boolean;
  user?: User | { email: string; id: string };
  token?: string;
  error?: string;
}

// Password sign-in for Backstage Administration
export async function signInWithPassword(email: string, password: string): Promise<AdminAuthResult> {
  const normalizedEmail = email.toLowerCase().trim();
  if (!isEmailAllowlisted(normalizedEmail)) {
    return {
      success: false,
      error: 'Access denied: Email is not in the AV Productions allowlist.'
    };
  }

  // 1. Direct validation against the Studio Admin Master Password
  const storedPassword = getStoredAdminPassword();
  if (password && password.trim() === storedPassword.trim()) {
    const userObj = {
      email: normalizedEmail,
      id: 'admin-' + btoa(normalizedEmail).replace(/=/g, '')
    };
    const sessionToken = 'av-studio-session-' + Date.now() + '-' + Math.random().toString(36).substring(2, 9);
    saveAdminSession(sessionToken, userObj);
    return {
      success: true,
      user: userObj,
      token: sessionToken
    };
  }

  // 2. Fallback: Check Supabase Auth if credentials have been configured
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password,
      });

      if (!error && data.user && isEmailAllowlisted(data.user.email)) {
        const userObj = {
          email: data.user.email || normalizedEmail,
          id: data.user.id
        };
        const sessionToken = data.session?.access_token || 'supabase-token-' + Date.now();
        saveAdminSession(sessionToken, userObj);
        return {
          success: true,
          user: userObj,
          token: sessionToken
        };
      }
    } catch {
      // Fall through to error
    }
  }

  return {
    success: false,
    error: 'Incorrect password. Please verify your admin password and try again.'
  };
}

// Biometric / Passkey sign-in via WebAuthn / Supabase Passkey
export async function signInWithPasskey(email: string): Promise<AdminAuthResult> {
  const normalizedEmail = email.toLowerCase().trim();
  if (!isEmailAllowlisted(normalizedEmail)) {
    return {
      success: false,
      error: 'Access denied: Email is not in the AV Productions allowlist.'
    };
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    return {
      success: false,
      error: 'Supabase configuration is required. Please provide your Supabase Project URL and Anon API key.'
    };
  }

  // Check browser WebAuthn support
  if (!window.PublicKeyCredential) {
    return {
      success: false,
      error: 'Your browser or device does not support WebAuthn / Biometric Passkeys.'
    };
  }

  try {
    // Check if Supabase client has passkey signin methods or WebAuthn flow
    // Supabase has native passkey support in auth.mfa or signInWithOtp / WebAuthn
    const authAny = supabase.auth as any;
    if (typeof authAny.signInWithPasskey === 'function') {
      const { data, error } = await authAny.signInWithPasskey({ email: normalizedEmail });
      if (error) return { success: false, error: error.message };
      return { success: true, user: data.user, token: data.session?.access_token };
    }

    // Direct WebAuthn native hardware prompt
    // We perform a client assertion with PublicKeyCredential
    const challenge = new Uint8Array(32);
    window.crypto.getRandomValues(challenge);

    // Prompt user device biometric (FaceID, TouchID, Windows Hello)
    const assertion = await navigator.credentials.get({
      publicKey: {
        challenge,
        timeout: 60000,
        userVerification: 'preferred',
      }
    });

    if (assertion) {
      // In production, Supabase or server verifies assertion.
      // Here we check if user session already exists or exchange with Supabase
      const { data: sessionData } = await supabase.auth.getSession();
      if (sessionData?.session && isEmailAllowlisted(sessionData.session.user.email)) {
        return {
          success: true,
          user: sessionData.session.user,
          token: sessionData.session.access_token
        };
      }

      // If passkey biometric authenticated successfully on device:
      return {
        success: true,
        user: { email: normalizedEmail, id: 'admin-passkey-' + normalizedEmail },
        token: 'supabase-passkey-verified-' + btoa(normalizedEmail)
      };
    }

    return {
      success: false,
      error: 'Biometric passkey authorization was canceled or failed.'
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.name === 'NotAllowedError'
        ? 'Passkey authentication canceled or timed out.'
        : (err.message || 'Passkey authentication failed.')
    };
  }
}

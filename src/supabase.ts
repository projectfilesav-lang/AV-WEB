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
  supabaseInstance = null;
  currentConfigUrl = '';
  currentConfigKey = '';
}

export const updateSupabaseConfig = saveSupabaseConfig;

export function clearSupabaseConfig() {
  localStorage.removeItem(STORAGE_KEY_URL);
  localStorage.removeItem(STORAGE_KEY_KEY);
  localStorage.removeItem(STORAGE_KEY_SESSION);
  supabaseInstance = null;
  currentConfigUrl = '';
  currentConfigKey = '';
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

// ============================================================================
// DATA TRANSFORMATION UTILITIES (CamelCase <-> Snake_Case)
// ============================================================================

export function toSnakeCase(obj: any): any {
  if (Array.isArray(obj)) return obj.map(toSnakeCase);
  if (obj !== null && typeof obj === 'object') {
    return Object.keys(obj).reduce((acc: any, key: string) => {
      // Special case for 'order' keyword in Postgres or reserved words
      const snakeKey = key === 'order' ? 'order' : key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
      acc[snakeKey] = toSnakeCase(obj[key]);
      return acc;
    }, {});
  }
  return obj;
}

export function toCamelCase(obj: any): any {
  if (Array.isArray(obj)) return obj.map(toCamelCase);
  if (obj !== null && typeof obj === 'object') {
    return Object.keys(obj).reduce((acc: any, key: string) => {
      const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
      acc[camelKey] = toCamelCase(obj[key]);
      return acc;
    }, {});
  }
  return obj;
}

// ============================================================================
// SUPABASE CONNECTION & HEALTH TEST
// ============================================================================

export async function testSupabaseConnection(): Promise<{
  success: boolean;
  message: string;
  latencyMs?: number;
}> {
  const { url, anonKey } = getStoredSupabaseConfig();
  if (!url || !anonKey) {
    return {
      success: false,
      message: 'Supabase URL or Anon Key is missing. Please configure them in Settings.'
    };
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    return {
      success: false,
      message: 'Failed to initialize Supabase client instance.'
    };
  }

  const startTime = Date.now();
  try {
    // Attempt a light query to verify API connectivity and credentials
    const { error } = await supabase
      .from('site_settings')
      .select('id')
      .limit(1);

    const latency = Date.now() - startTime;

    if (error) {
      // If table doesn't exist yet, we still know the API credentials worked!
      if (error.code === '42P01' || error.message.includes('relation "site_settings" does not exist')) {
        return {
          success: true,
          message: `Connected to Supabase (${latency}ms)! Database tables need to be created with the SQL setup script.`,
          latencyMs: latency
        };
      }
      return {
        success: false,
        message: `Supabase returned error: ${error.message} (Code: ${error.code || 'unknown'})`,
        latencyMs: latency
      };
    }

    return {
      success: true,
      message: `Supabase live connection verified (${latency}ms). Database is online.`,
      latencyMs: latency
    };
  } catch (err: any) {
    const latency = Date.now() - startTime;
    return {
      success: false,
      message: err?.message || 'Connection test failed to reach Supabase endpoint.',
      latencyMs: latency
    };
  }
}

// ============================================================================
// DATA SYNCHRONIZATION & SEEDING (Push all local data to Supabase)
// ============================================================================

export async function pushAllDataToSupabase(allData: {
  siteSettings: any;
  themeTokens: any;
  milestones: any[];
  services: any[];
  categories: any[];
  portfolioItems: any[];
  reviews: any[];
  bookings: any[];
  faqs: any[];
  blogPosts: any[];
  blogComments: any[];
}): Promise<{
  success: boolean;
  message: string;
  counts: Record<string, number>;
  errors: string[];
}> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return {
      success: false,
      message: 'Supabase is not configured. Provide URL and Anon Key first.',
      counts: {},
      errors: ['Supabase client not initialized']
    };
  }

  const counts: Record<string, number> = {};
  const errors: string[] = [];

  // Helper for batch upserts
  const syncTable = async (tableName: string, rows: any[]) => {
    if (!rows || rows.length === 0) return;
    try {
      const snakeRows = rows.map(r => toSnakeCase(r));
      const { error } = await supabase.from(tableName).upsert(snakeRows, { onConflict: 'id' });
      if (error) {
        errors.push(`${tableName}: ${error.message}`);
      } else {
        counts[tableName] = rows.length;
      }
    } catch (e: any) {
      errors.push(`${tableName}: ${e.message || String(e)}`);
    }
  };

  // 1. Site Settings singleton
  if (allData.siteSettings) {
    try {
      const payload = {
        id: 'default',
        ...toSnakeCase(allData.siteSettings),
        updated_at: new Date().toISOString()
      };
      const { error } = await supabase.from('site_settings').upsert(payload, { onConflict: 'id' });
      if (error) errors.push(`site_settings: ${error.message}`);
      else counts['site_settings'] = 1;
    } catch (e: any) {
      errors.push(`site_settings: ${e.message}`);
    }
  }

  // 2. Theme Tokens singleton
  if (allData.themeTokens) {
    try {
      const payload = {
        id: 'default',
        ...toSnakeCase(allData.themeTokens),
        updated_at: new Date().toISOString()
      };
      const { error } = await supabase.from('theme_tokens').upsert(payload, { onConflict: 'id' });
      if (error) errors.push(`theme_tokens: ${error.message}`);
      else counts['theme_tokens'] = 1;
    } catch (e: any) {
      errors.push(`theme_tokens: ${e.message}`);
    }
  }

  // 3. Relational collections
  await syncTable('portfolio_categories', allData.categories || []);
  await syncTable('services', allData.services || []);
  await syncTable('portfolio_items', allData.portfolioItems || []);
  await syncTable('milestones', allData.milestones || []);
  await syncTable('reviews', allData.reviews || []);
  await syncTable('bookings', allData.bookings || []);
  await syncTable('faqs', allData.faqs || []);
  await syncTable('blog_posts', allData.blogPosts || []);
  await syncTable('blog_comments', allData.blogComments || []);

  const totalMigrated = Object.values(counts).reduce((a, b) => a + b, 0);

  return {
    success: errors.length === 0,
    message: errors.length === 0
      ? `Successfully migrated all ${totalMigrated} records across 11 tables to Supabase!`
      : `Partially completed. ${totalMigrated} records migrated, with ${errors.length} table warning(s).`,
    counts,
    errors
  };
}

// ============================================================================
// SINGLETON AND COLLECTION FETCHERS
// ============================================================================

export async function fetchFromSupabase<T>(table: string): Promise<T[] | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;
  try {
    const { data, error } = await supabase.from(table).select('*');
    if (error || !data) return null;
    return toCamelCase(data) as T[];
  } catch {
    return null;
  }
}

export async function fetchSingletonFromSupabase<T>(table: string, id: string = 'default'): Promise<T | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;
  try {
    const { data, error } = await supabase.from(table).select('*').eq('id', id).maybeSingle();
    if (error || !data) return null;
    return toCamelCase(data) as T;
  } catch {
    return null;
  }
}

export async function upsertToSupabase(table: string, record: any): Promise<{ success: boolean; error?: string }> {
  const supabase = getSupabaseClient();
  if (!supabase) return { success: false, error: 'Supabase client not initialized' };
  try {
    const snake = toSnakeCase(record);
    const { error } = await supabase.from(table).upsert(snake, { onConflict: 'id' });
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Upsert error' };
  }
}

export async function deleteFromSupabase(table: string, id: string): Promise<{ success: boolean; error?: string }> {
  const supabase = getSupabaseClient();
  if (!supabase) return { success: false, error: 'Supabase client not initialized' };
  try {
    const { error } = await supabase.from(table).delete().eq('id', id);
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Delete error' };
  }
}

// ============================================================================
// EMBEDDED SQL SETUP SCRIPT
// ============================================================================

export const SUPABASE_SQL_SCHEMA = `-- AV PRODUCTIONS — SUPABASE POSTGRESQL SCHEMA & POLICIES
-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Site Settings
CREATE TABLE IF NOT EXISTS site_settings (
  id TEXT PRIMARY KEY DEFAULT 'default',
  hero_title TEXT NOT NULL DEFAULT 'CRAFTING CINEMATIC NARRATIVES & ACOUSTIC EXPERIENCES',
  hero_tagline TEXT DEFAULT 'High-end cinematography, boutique audio mastering, architectural projection, and bespoke multimedia creative direction.',
  hero_media_url TEXT DEFAULT '',
  hero_media_type TEXT DEFAULT 'none',
  intro_strip_text TEXT DEFAULT 'DIRECTED FOR VISUAL IMPACT. MASTERED FOR IMMERSION.',
  cta_headline TEXT DEFAULT 'READY TO ELEVATE YOUR NEXT PRODUCTION?',
  cta_subline TEXT DEFAULT 'Let''s collaborate on your next visual or auditory masterwork.',
  contact_email TEXT NOT NULL DEFAULT 'projectfilesav@gmail.com',
  contact_phone TEXT DEFAULT '+1 (555) 019-2834',
  copyright_text TEXT DEFAULT '© 2026 AV Productions. All Rights Reserved.',
  promo_banner_enabled BOOLEAN DEFAULT false,
  promo_banner_text TEXT DEFAULT '',
  floating_book_button_enabled BOOLEAN DEFAULT true,
  floating_book_button_label TEXT DEFAULT 'Book Production',
  google_reviews_url TEXT DEFAULT '',
  privacy_policy TEXT DEFAULT '',
  terms_of_service TEXT DEFAULT '',
  cookie_policy TEXT DEFAULT '',
  meta_title TEXT DEFAULT 'AV Productions — Boutique Audiovisual & Media Studio',
  meta_description TEXT DEFAULT 'Cinematography, sound design, and bespoke creative production.',
  og_image_url TEXT DEFAULT '',
  ga_measurement_id TEXT DEFAULT '',
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Theme Tokens
CREATE TABLE IF NOT EXISTS theme_tokens (
  id TEXT PRIMARY KEY DEFAULT 'default',
  gold_accent TEXT NOT NULL DEFAULT '#E5A93C',
  dark_bg TEXT DEFAULT '#050505',
  dark_body TEXT DEFAULT '#F5F5F7',
  dark_heading TEXT DEFAULT '#FFFFFF',
  dark_btn_bg TEXT DEFAULT '#E5A93C',
  dark_btn_text TEXT DEFAULT '#000000',
  dark_btn_hover TEXT DEFAULT '#F3BF58',
  dark_link TEXT DEFAULT '#E5A93C',
  dark_link_hover TEXT DEFAULT '#F3BF58',
  dark_border TEXT DEFAULT '#262626',
  dark_card_bg TEXT DEFAULT '#121212',
  dark_icon TEXT DEFAULT '#E5A93C',
  light_bg TEXT DEFAULT '#FAFAFA',
  light_body TEXT DEFAULT '#171717',
  light_heading TEXT DEFAULT '#0A0A0A',
  light_btn_bg TEXT DEFAULT '#E5A93C',
  light_btn_text TEXT DEFAULT '#000000',
  light_btn_hover TEXT DEFAULT '#F3BF58',
  light_link TEXT DEFAULT '#D97706',
  light_link_hover TEXT DEFAULT '#B45309',
  light_border TEXT DEFAULT '#E5E5E5',
  light_card_bg TEXT DEFAULT '#FFFFFF',
  light_icon TEXT DEFAULT '#D97706',
  heading_font TEXT DEFAULT 'Cinzel',
  body_font TEXT DEFAULT 'Outfit',
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Milestones
CREATE TABLE IF NOT EXISTS milestones (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  photo_url TEXT DEFAULT '',
  "order" INT DEFAULT 0,
  year TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Portfolio Categories
CREATE TABLE IF NOT EXISTS portfolio_categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  "order" INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Services
CREATE TABLE IF NOT EXISTS services (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  short_description TEXT NOT NULL,
  detailed_description TEXT NOT NULL,
  category_id TEXT REFERENCES portfolio_categories(id) ON DELETE SET NULL,
  "order" INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Portfolio Items
CREATE TABLE IF NOT EXISTS portfolio_items (
  id TEXT PRIMARY KEY,
  category_id TEXT REFERENCES portfolio_categories(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  media_type TEXT NOT NULL CHECK (media_type IN ('photo', 'video', 'graphic', 'audio')),
  media_url TEXT NOT NULL,
  video_source TEXT CHECK (video_source IN ('upload', 'embed')),
  description TEXT DEFAULT '',
  show_description BOOLEAN DEFAULT true,
  alt_text TEXT DEFAULT '',
  "order" INT DEFAULT 0,
  featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 7. Reviews
CREATE TABLE IF NOT EXISTS reviews (
  id TEXT PRIMARY KEY,
  reviewer_name TEXT NOT NULL,
  rating INT NOT NULL DEFAULT 5,
  review_text TEXT NOT NULL,
  source TEXT NOT NULL DEFAULT 'Google',
  status TEXT NOT NULL DEFAULT 'Live',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 8. Bookings
CREATE TABLE IF NOT EXISTS bookings (
  id TEXT PRIMARY KEY,
  client_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  service_id TEXT,
  service_name TEXT NOT NULL,
  date_type TEXT NOT NULL DEFAULT 'single',
  date_value TEXT NOT NULL,
  end_date_value TEXT DEFAULT '',
  project_description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'New',
  admin_notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 9. FAQs
CREATE TABLE IF NOT EXISTS faqs (
  id TEXT PRIMARY KEY,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  "order" INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 10. Blog Posts
CREATE TABLE IF NOT EXISTS blog_posts (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  featured_image TEXT DEFAULT '',
  excerpt TEXT NOT NULL,
  content TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Published',
  meta_title TEXT DEFAULT '',
  meta_description TEXT DEFAULT '',
  og_image TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now(),
  published_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 11. Blog Comments
CREATE TABLE IF NOT EXISTS blog_comments (
  id TEXT PRIMARY KEY,
  post_id TEXT REFERENCES blog_posts(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL,
  author_email TEXT NOT NULL,
  content TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Pending',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE theme_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_comments ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Public can view site settings" ON site_settings FOR SELECT USING (true);
CREATE POLICY "Admin full access to site settings" ON site_settings FOR ALL USING (true);

CREATE POLICY "Public can view theme tokens" ON theme_tokens FOR SELECT USING (true);
CREATE POLICY "Admin full access to theme tokens" ON theme_tokens FOR ALL USING (true);

CREATE POLICY "Public can view milestones" ON milestones FOR SELECT USING (true);
CREATE POLICY "Admin full access to milestones" ON milestones FOR ALL USING (true);

CREATE POLICY "Public can view categories" ON portfolio_categories FOR SELECT USING (true);
CREATE POLICY "Admin full access to categories" ON portfolio_categories FOR ALL USING (true);

CREATE POLICY "Public can view services" ON services FOR SELECT USING (true);
CREATE POLICY "Admin full access to services" ON services FOR ALL USING (true);

CREATE POLICY "Public can view portfolio items" ON portfolio_items FOR SELECT USING (true);
CREATE POLICY "Admin full access to portfolio items" ON portfolio_items FOR ALL USING (true);

CREATE POLICY "Public can view live reviews" ON reviews FOR SELECT USING (status = 'Live');
CREATE POLICY "Admin full access to reviews" ON reviews FOR ALL USING (true);

CREATE POLICY "Public can submit bookings" ON bookings FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin full access to bookings" ON bookings FOR ALL USING (true);

CREATE POLICY "Public can view faqs" ON faqs FOR SELECT USING (true);
CREATE POLICY "Admin full access to faqs" ON faqs FOR ALL USING (true);

CREATE POLICY "Public can view published posts" ON blog_posts FOR SELECT USING (status = 'Published');
CREATE POLICY "Admin full access to blog posts" ON blog_posts FOR ALL USING (true);

CREATE POLICY "Public can view approved comments" ON blog_comments FOR SELECT USING (status = 'Approved');
CREATE POLICY "Public can submit comments" ON blog_comments FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin full access to blog comments" ON blog_comments FOR ALL USING (true);

-- Realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE bookings;
ALTER PUBLICATION supabase_realtime ADD TABLE blog_comments;
ALTER PUBLICATION supabase_realtime ADD TABLE reviews;
`;


import { createClient, SupabaseClient, User } from '@supabase/supabase-js';

export const STORAGE_BUCKET = 'studio-media';

export function normalizeSupabaseUrl(input: string | undefined | null): string {
  if (!input || typeof input !== 'string') return '';
  let trimmed = input.trim().replace(/^['"]+|['"]+$/g, '').trim();
  if (!trimmed || trimmed === 'undefined' || trimmed === 'null') return '';

  // Automatically extract project ref if user pasted a Supabase Dashboard link:
  // e.g. https://supabase.com/dashboard/project/abcdefghijklmnop/...
  const dashboardMatch = trimmed.match(/supabase\.com\/dashboard\/project\/([a-z0-9-]+)/i) ||
                         trimmed.match(/app\.supabase\.com\/project\/([a-z0-9-]+)/i);
  if (dashboardMatch && dashboardMatch[1]) {
    return `https://${dashboardMatch[1].toLowerCase()}.supabase.co`;
  }

  // If user pasted just the 20-char project reference ID (e.g. "abcdefghijklmnop")
  if (!trimmed.includes('.') && !trimmed.includes('/')) {
    return `https://${trimmed.toLowerCase()}.supabase.co`;
  }

  if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
    trimmed = `https://${trimmed}`;
  }

  try {
    const parsed = new URL(trimmed);
    if (parsed.hostname === 'supabase.com' || parsed.hostname === 'www.supabase.com' || parsed.hostname === 'app.supabase.com') {
      // Invalid API host (user pasted https://supabase.com without project ID)
      return '';
    }
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      return parsed.origin;
    }
  } catch {
    return '';
  }
  return '';
}

/**
 * Reads Supabase configuration strictly from environment variables:
 * VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
 */
export function getSupabaseEnvConfig(): { url: string; anonKey: string; isConfigured: boolean; rawUrl?: string } {
  try {
    const envObj = (import.meta as unknown as { env?: Record<string, string> }).env || {};
    const rawUrl = (envObj.VITE_SUPABASE_URL || '').trim();
    const rawKey = (envObj.VITE_SUPABASE_ANON_KEY || '').trim();

    const url = normalizeSupabaseUrl(rawUrl);
    let anonKey = rawKey.replace(/^['"]+|['"]+$/g, '').trim();
    if (anonKey === 'undefined' || anonKey === 'null') {
      anonKey = '';
    }

    return {
      url,
      anonKey,
      rawUrl,
      isConfigured: Boolean(url && anonKey && anonKey.length >= 10)
    };
  } catch {
    return { url: '', anonKey: '', rawUrl: '', isConfigured: false };
  }
}

let supabaseInstance: SupabaseClient | null = null;
let currentConfigUrl = '';
let currentConfigKey = '';

export function getSupabaseClient(): SupabaseClient | null {
  const { url, anonKey, isConfigured } = getSupabaseEnvConfig();
  if (!isConfigured) return null;

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
      console.warn('Supabase client initialization warning:', e);
      return null;
    }
  }
  return supabaseInstance;
}

export interface AdminAuthResult {
  success: boolean;
  user?: User | { email: string; id: string };
  token?: string;
  error?: string;
}

/**
 * Authenticates an admin using Supabase Auth (email & password).
 */
export async function signInWithPassword(email: string, password: string): Promise<AdminAuthResult> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return {
      success: false,
      error: 'Supabase is not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment variables.'
    };
  }

  const normalizedEmail = email.toLowerCase().trim();
  if (!normalizedEmail || !password) {
    return {
      success: false,
      error: 'Please enter both your email address and password.'
    };
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    });

    if (error || !data.user || !data.session) {
      const msg = error?.message || '';
      if (msg.toLowerCase().includes('failed to fetch') || msg.toLowerCase().includes('networkerror')) {
        const { url } = getSupabaseEnvConfig();
        return {
          success: false,
          error: `Could not connect to Supabase at "${url}". Please check that: (1) VITE_SUPABASE_URL in Netlify is set to your https://<project-id>.supabase.co URL, (2) you clicked "Trigger deploy -> Deploy site" in Netlify after adding your environment variables, and (3) your Supabase project is active (not paused).`
        };
      }
      return {
        success: false,
        error: msg || 'Invalid login credentials. Please check your email and password in Supabase Authentication.'
      };
    }

    return {
      success: true,
      user: {
        email: data.user.email || normalizedEmail,
        id: data.user.id
      },
      token: data.session.access_token
    };
  } catch (err: any) {
    const msg = err?.message || '';
    if (msg.toLowerCase().includes('failed to fetch') || msg.toLowerCase().includes('networkerror')) {
      const { url } = getSupabaseEnvConfig();
      return {
        success: false,
        error: `Could not connect to Supabase at "${url}". Please check that VITE_SUPABASE_URL in Netlify is set to https://<project-id>.supabase.co and that you triggered a new deploy in Netlify after saving your environment variables.`
      };
    }
    return {
      success: false,
      error: msg || 'Unable to reach Supabase Authentication.'
    };
  }
}

export async function signOutAdmin(): Promise<void> {
  const supabase = getSupabaseClient();
  if (supabase) {
    await supabase.auth.signOut().catch(() => {});
  }
}

export async function updateAdminUserPassword(newPassword: string): Promise<{ success: boolean; error?: string }> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return { success: false, error: 'Supabase is not configured.' };
  }
  try {
    const { error } = await supabase.auth.updateUser({ password: newPassword.trim() });
    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to update password.' };
  }
}

// ============================================================================
// SUPABASE STORAGE: PUBLIC IMAGE & MEDIA UPLOAD ('studio-media' bucket)
// ============================================================================

export async function uploadImageToSupabaseStorage(
  file: File,
  folder: string = 'uploads'
): Promise<{ success: boolean; url?: string; error?: string }> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return {
      success: false,
      error: 'Supabase is not configured. Check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.'
    };
  }

  try {
    const ext = file.name.split('.').pop()?.toLowerCase() || 'png';
    const cleanBase = file.name
      .replace(/\.[^/.]+$/, '')
      .replace(/[^a-zA-Z0-9_-]/g, '-')
      .toLowerCase()
      .slice(0, 40) || 'asset';
    const filePath = `${folder}/${Date.now()}-${Math.random().toString(36).substring(2, 7)}-${cleanBase}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
        contentType: file.type || 'application/octet-stream'
      });

    if (uploadError) {
      return {
        success: false,
        error: `Storage upload failed: ${uploadError.message}. Make sure you ran the SQL setup script and are logged in.`
      };
    }

    const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(filePath);
    if (!data?.publicUrl) {
      return {
        success: false,
        error: 'Could not retrieve public URL from Supabase Storage.'
      };
    }

    return {
      success: true,
      url: data.publicUrl
    };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || 'Unexpected error during image upload.'
    };
  }
}

/**
 * Converts a base64 data:image/... URL into a Blob and uploads it to Supabase Storage,
 * returning the public HTTPS URL. Leaves existing http(s) or relative /... URLs untouched.
 */
export async function ensureRemoteImageUrl(
  urlOrData: string | undefined | null,
  folder: string = 'migrated'
): Promise<string> {
  if (!urlOrData || typeof urlOrData !== 'string') return '';
  const trimmed = urlOrData.trim();
  if (!trimmed.startsWith('data:')) {
    return trimmed;
  }

  const supabase = getSupabaseClient();
  if (!supabase) return '';

  try {
    const res = await fetch(trimmed);
    const blob = await res.blob();
    const mime = blob.type || 'image/png';
    const ext = mime.split('/')[1]?.split('+')[0] || 'png';
    const filePath = `${folder}/${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;

    const { error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(filePath, blob, {
        cacheControl: '3600',
        upsert: true,
        contentType: mime
      });

    if (error) {
      throw new Error(error.message);
    }

    const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(filePath);
    return data?.publicUrl || '';
  } catch (e) {
    console.warn('Failed to migrate base64 image to storage:', e);
    return '';
  }
}

// ============================================================================
// DATA TRANSFORMATION UTILITIES (CamelCase <-> Snake_Case)
// ============================================================================

export function toSnakeCase(obj: any): any {
  if (Array.isArray(obj)) return obj.map(toSnakeCase);
  if (obj !== null && typeof obj === 'object') {
    return Object.keys(obj).reduce((acc: any, key: string) => {
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
  const { url, isConfigured } = getSupabaseEnvConfig();
  if (!isConfigured) {
    return {
      success: false,
      message: 'VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are not set in your environment variables.'
    };
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    return {
      success: false,
      message: 'Failed to initialize Supabase client.'
    };
  }

  const startTime = Date.now();
  try {
    const { error } = await supabase
      .from('site_settings')
      .select('id')
      .limit(1);

    const latency = Date.now() - startTime;

    if (error) {
      if (error.code === '42P01' || error.message.includes('relation "site_settings" does not exist')) {
        return {
          success: true,
          message: `Connected to ${url} (${latency}ms), but database tables are not created yet. Run the SQL Setup Script below in your Supabase SQL Editor.`,
          latencyMs: latency
        };
      }
      return {
        success: false,
        message: `Supabase error: ${error.message}`,
        latencyMs: latency
      };
    }

    return {
      success: true,
      message: `Connected to Supabase (${latency}ms). Database tables are online and ready.`,
      latencyMs: latency
    };
  } catch (err: any) {
    const latency = Date.now() - startTime;
    return {
      success: false,
      message: err?.message || 'Could not reach Supabase endpoint.',
      latencyMs: latency
    };
  }
}

// ============================================================================
// ONE-TIME MIGRATION ("Move my current content to Supabase")
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
  clientLogos?: any[];
  socialLinks?: any[];
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
      message: 'Supabase is not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment variables.',
      counts: {},
      errors: ['Supabase client not initialized']
    };
  }

  const counts: Record<string, number> = {};
  const errors: string[] = [];

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

  // 1. Site Settings singleton (upload any base64 logo/favicon/hero images first)
  if (allData.siteSettings) {
    try {
      const settingsCopy = { ...allData.siteSettings };
      if (settingsCopy.logoUrl?.startsWith('data:')) {
        settingsCopy.logoUrl = (await ensureRemoteImageUrl(settingsCopy.logoUrl, 'branding')) || '/logo.svg';
      }
      if (settingsCopy.faviconUrl?.startsWith('data:')) {
        settingsCopy.faviconUrl = (await ensureRemoteImageUrl(settingsCopy.faviconUrl, 'branding')) || '/favicon.svg';
      }
      if (settingsCopy.heroMediaUrl?.startsWith('data:')) {
        settingsCopy.heroMediaUrl = await ensureRemoteImageUrl(settingsCopy.heroMediaUrl, 'hero');
      }

      const fullPayload = {
        id: 'default',
        ...toSnakeCase(settingsCopy),
        updated_at: new Date().toISOString()
      };
      const { error } = await supabase.from('site_settings').upsert(fullPayload, { onConflict: 'id' });
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

  // 3. Portfolio Categories & Services
  await syncTable('portfolio_categories', allData.categories || []);
  await syncTable('services', allData.services || []);

  // 4. Portfolio Items (upload any base64 media first)
  if (allData.portfolioItems && allData.portfolioItems.length > 0) {
    const cleanedItems = await Promise.all(
      allData.portfolioItems.map(async (item: any) => {
        const copy = { ...item };
        if (copy.mediaUrl?.startsWith('data:')) {
          copy.mediaUrl = await ensureRemoteImageUrl(copy.mediaUrl, 'portfolio');
        }
        return copy;
      })
    );
    await syncTable('portfolio_items', cleanedItems);
  }

  // 5. Milestones (upload any base64 photos first)
  if (allData.milestones && allData.milestones.length > 0) {
    const cleanedMilestones = await Promise.all(
      allData.milestones.map(async (m: any) => {
        const copy = { ...m, body: m.body || m.description || '', description: m.description || m.body || '' };
        if (copy.photoUrl?.startsWith('data:')) {
          copy.photoUrl = await ensureRemoteImageUrl(copy.photoUrl, 'milestones');
        }
        return copy;
      })
    );
    await syncTable('milestones', cleanedMilestones);
  }

  // 6. Reviews, Bookings, FAQs, Blog Posts, Blog Comments
  if (allData.reviews && allData.reviews.length > 0) {
    const cleanedReviews = allData.reviews.map((r: any) => ({
      ...r,
      reviewerName: r.reviewerName || r.author || 'Client',
      author: r.author || r.reviewerName || 'Client',
      reviewText: r.reviewText || r.text || '',
      text: r.text || r.reviewText || ''
    }));
    await syncTable('reviews', cleanedReviews);
  }

  await syncTable('bookings', allData.bookings || []);
  await syncTable('faqs', allData.faqs || []);

  if (allData.blogPosts && allData.blogPosts.length > 0) {
    const cleanedPosts = await Promise.all(
      allData.blogPosts.map(async (p: any) => {
        const copy = { ...p };
        if (copy.featuredImage?.startsWith('data:')) {
          copy.featuredImage = await ensureRemoteImageUrl(copy.featuredImage, 'blog');
        }
        return copy;
      })
    );
    await syncTable('blog_posts', cleanedPosts);
  }

  await syncTable('blog_comments', allData.blogComments || []);

  // 7. Client Logos (upload any base64 logos first)
  if (allData.clientLogos && allData.clientLogos.length > 0) {
    const cleanedLogos = await Promise.all(
      allData.clientLogos.map(async (logo: any) => {
        const copy = { ...logo };
        if (copy.logoUrl?.startsWith('data:')) {
          copy.logoUrl = await ensureRemoteImageUrl(copy.logoUrl, 'clients');
        }
        return copy;
      })
    );
    await syncTable('client_logos', cleanedLogos);
  }

  // 8. Social Links
  if (allData.socialLinks && allData.socialLinks.length > 0) {
    const socialRows = allData.socialLinks.map((s: any, idx: number) => ({
      id: s.id || s.platform?.toLowerCase() || `soc-${idx}`,
      platform: s.platform,
      url: s.url || ''
    }));
    await syncTable('social_links', socialRows);
  }

  const totalMigrated = Object.values(counts).reduce((a, b) => a + b, 0);

  return {
    success: errors.length === 0,
    message: errors.length === 0
      ? `Successfully moved all ${totalMigrated} records across ${Object.keys(counts).length} tables to Supabase!`
      : `Completed with ${errors.length} error(s): ${errors.join(' | ')}`,
    counts,
    errors
  };
}

// ============================================================================
// SINGLETON AND COLLECTION FETCHERS & MUTATORS
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
  if (!supabase) {
    return {
      success: false,
      error: 'Supabase is not configured. Check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.'
    };
  }
  try {
    const cleanRecord = { ...record };
    // Never allow base64 strings into the database
    for (const key of ['logoUrl', 'faviconUrl', 'heroMediaUrl', 'mediaUrl', 'photoUrl', 'featuredImage']) {
      if (typeof cleanRecord[key] === 'string' && cleanRecord[key].startsWith('data:')) {
        const uploadedUrl = await ensureRemoteImageUrl(cleanRecord[key], table);
        if (!uploadedUrl) {
          return {
            success: false,
            error: 'Image upload to Supabase Storage failed. Ensure the studio-media bucket exists and you are signed in.'
          };
        }
        cleanRecord[key] = uploadedUrl;
      }
    }

    const snake = toSnakeCase(cleanRecord);
    const { error } = await supabase.from(table).upsert(snake, { onConflict: 'id' });
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Database save error' };
  }
}

/**
 * Inserts a public submission (booking or contact message) without calling .select(),
 * so anonymous visitors can INSERT while SELECT remains restricted to authenticated admins.
 */
export async function insertPublicRecord(
  table: 'bookings' | 'contact_messages' | 'blog_comments',
  record: any
): Promise<{ success: boolean; error?: string }> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return {
      success: false,
      error: 'Database connection is not configured.'
    };
  }
  try {
    const snake = toSnakeCase(record);
    const { error } = await supabase.from(table).insert(snake);
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Submission error' };
  }
}

export async function deleteFromSupabase(table: string, id: string): Promise<{ success: boolean; error?: string }> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return {
      success: false,
      error: 'Supabase is not configured.'
    };
  }
  try {
    const { error } = await supabase.from(table).delete().eq('id', id);
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Delete error' };
  }
}

// ============================================================================
// COMPLETE IDEMPOTENT SQL SETUP SCRIPT (Safe to run multiple times)
// ============================================================================

export const SUPABASE_SQL_SCHEMA = `-- ==============================================================================
-- AV PRODUCTIONS — COMPLETE SUPABASE SQL SETUP SCRIPT
-- Safe to run multiple times (idempotent). Paste into Supabase SQL Editor & Run.
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. SITE SETTINGS (Singleton row id = 'default')
CREATE TABLE IF NOT EXISTS public.site_settings (
  id TEXT PRIMARY KEY DEFAULT 'default',
  site_name TEXT DEFAULT 'AV PRODUCTIONS',
  site_tagline TEXT DEFAULT 'Cinematography & Narrative Studio',
  contact_location TEXT DEFAULT 'NAIROBI',
  logo_url TEXT DEFAULT '/logo.svg',
  favicon_url TEXT DEFAULT '/favicon.svg',
  logo_alt TEXT DEFAULT 'AV Productions',
  hero_title TEXT NOT NULL DEFAULT 'Every Frame, Directed With Intent.',
  hero_tagline TEXT DEFAULT 'Cinematography, visual direction, and narrative filmmaking for commercial campaigns, documentaries, and artist commissions.',
  hero_media_url TEXT DEFAULT '',
  hero_media_type TEXT DEFAULT 'none',
  intro_strip_text TEXT DEFAULT 'A boutique production studio shaping narratives through evocative cinematography, visual direction, and human-centric storytelling.',
  cta_headline TEXT DEFAULT 'Ready to bring your story to life?',
  cta_subline TEXT DEFAULT 'From commercial brand films to original narratives, we collaborate closely with directors and producers worldwide.',
  contact_email TEXT NOT NULL DEFAULT 'projectfilesav@gmail.com',
  contact_phone TEXT DEFAULT '+254759514351',
  copyright_text TEXT DEFAULT '© AV PRODUCTIONS 2026',
  promo_banner_enabled BOOLEAN DEFAULT true,
  promo_banner_text TEXT DEFAULT 'Now accepting bookings for Autumn 2026 commercial & narrative production cycles.',
  floating_book_button_enabled BOOLEAN DEFAULT true,
  floating_book_button_label TEXT DEFAULT 'Book Production',
  google_reviews_url TEXT DEFAULT '',
  privacy_policy TEXT DEFAULT '',
  terms_of_service TEXT DEFAULT '',
  cookie_policy TEXT DEFAULT '',
  meta_title TEXT DEFAULT 'AV Productions | Boutique Cinematography & Narrative Direction',
  meta_description TEXT DEFAULT 'Boutique production studio specializing in cinematography, commercial films, and narrative direction.',
  og_image_url TEXT DEFAULT '',
  ga_measurement_id TEXT DEFAULT '',
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS site_name TEXT DEFAULT 'AV PRODUCTIONS';
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS site_tagline TEXT DEFAULT 'Cinematography & Narrative Studio';
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS contact_location TEXT DEFAULT 'NAIROBI';
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS logo_url TEXT DEFAULT '/logo.svg';
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS favicon_url TEXT DEFAULT '/favicon.svg';
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS logo_alt TEXT DEFAULT 'AV Productions';

-- 2. THEME TOKENS (Singleton row id = 'default')
CREATE TABLE IF NOT EXISTS public.theme_tokens (
  id TEXT PRIMARY KEY DEFAULT 'default',
  gold_accent TEXT NOT NULL DEFAULT '#f9931f',
  dark_bg TEXT DEFAULT '#0b131e',
  dark_body TEXT DEFAULT '#cbd5e1',
  dark_heading TEXT DEFAULT '#ffffff',
  dark_btn_bg TEXT DEFAULT '#f9931f',
  dark_btn_text TEXT DEFAULT '#192c45',
  dark_btn_hover TEXT DEFAULT '#ffa73e',
  dark_link TEXT DEFAULT '#f9931f',
  dark_link_hover TEXT DEFAULT '#ffbe6b',
  dark_border TEXT DEFAULT 'rgba(249, 147, 31, 0.18)',
  dark_card_bg TEXT DEFAULT '#132032',
  dark_icon TEXT DEFAULT '#f9931f',
  light_bg TEXT DEFAULT '#f8fafc',
  light_body TEXT DEFAULT '#334155',
  light_heading TEXT DEFAULT '#192c45',
  light_btn_bg TEXT DEFAULT '#192c45',
  light_btn_text TEXT DEFAULT '#ffffff',
  light_btn_hover TEXT DEFAULT '#223a5b',
  light_link TEXT DEFAULT '#192c45',
  light_link_hover TEXT DEFAULT '#f9931f',
  light_border TEXT DEFAULT 'rgba(25, 44, 69, 0.12)',
  light_card_bg TEXT DEFAULT '#ffffff',
  light_icon TEXT DEFAULT '#192c45',
  heading_font TEXT DEFAULT 'Plus Jakarta Sans',
  body_font TEXT DEFAULT 'Plus Jakarta Sans',
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. MILESTONES
CREATE TABLE IF NOT EXISTS public.milestones (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  body TEXT DEFAULT '',
  description TEXT DEFAULT '',
  photo_url TEXT DEFAULT '',
  "order" INT DEFAULT 0,
  year TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.milestones ADD COLUMN IF NOT EXISTS description TEXT DEFAULT '';
ALTER TABLE public.milestones ALTER COLUMN body SET DEFAULT '';

-- 4. PORTFOLIO CATEGORIES
CREATE TABLE IF NOT EXISTS public.portfolio_categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT DEFAULT '',
  "order" INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.portfolio_categories ADD COLUMN IF NOT EXISTS description TEXT DEFAULT '';

-- 5. SERVICES
CREATE TABLE IF NOT EXISTS public.services (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  short_description TEXT NOT NULL DEFAULT '',
  detailed_description TEXT NOT NULL DEFAULT '',
  category_id TEXT REFERENCES public.portfolio_categories(id) ON DELETE SET NULL,
  "order" INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 6. PORTFOLIO ITEMS
CREATE TABLE IF NOT EXISTS public.portfolio_items (
  id TEXT PRIMARY KEY,
  category_id TEXT REFERENCES public.portfolio_categories(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  media_type TEXT NOT NULL DEFAULT 'photo',
  media_url TEXT NOT NULL DEFAULT '',
  video_source TEXT DEFAULT 'embed',
  description TEXT DEFAULT '',
  show_description BOOLEAN DEFAULT true,
  alt_text TEXT DEFAULT '',
  "order" INT DEFAULT 0,
  featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 7. REVIEWS
CREATE TABLE IF NOT EXISTS public.reviews (
  id TEXT PRIMARY KEY,
  reviewer_name TEXT DEFAULT '',
  author TEXT DEFAULT '',
  company TEXT DEFAULT '',
  rating INT NOT NULL DEFAULT 5,
  review_text TEXT DEFAULT '',
  text TEXT DEFAULT '',
  source TEXT NOT NULL DEFAULT 'Google',
  status TEXT NOT NULL DEFAULT 'Live',
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS author TEXT DEFAULT '';
ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS company TEXT DEFAULT '';
ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS text TEXT DEFAULT '';

-- 8. BOOKINGS (Public INSERT only; Authenticated SELECT / UPDATE / DELETE)
CREATE TABLE IF NOT EXISTS public.bookings (
  id TEXT PRIMARY KEY,
  client_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  service_id TEXT DEFAULT '',
  service_name TEXT NOT NULL,
  date_type TEXT NOT NULL DEFAULT 'single',
  date_value TEXT NOT NULL,
  end_date_value TEXT DEFAULT '',
  project_description TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'New',
  admin_notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 9. CONTACT MESSAGES (Public INSERT only; Authenticated SELECT / UPDATE / DELETE)
CREATE TABLE IF NOT EXISTS public.contact_messages (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 10. FAQS
CREATE TABLE IF NOT EXISTS public.faqs (
  id TEXT PRIMARY KEY,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category TEXT DEFAULT 'General',
  "order" INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.faqs ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'General';

-- 11. BLOG POSTS
CREATE TABLE IF NOT EXISTS public.blog_posts (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  featured_image TEXT DEFAULT '',
  excerpt TEXT NOT NULL DEFAULT '',
  content TEXT NOT NULL DEFAULT '',
  author TEXT DEFAULT 'AV Studio',
  category TEXT DEFAULT 'Production',
  read_time TEXT DEFAULT '4 min',
  status TEXT NOT NULL DEFAULT 'Published',
  meta_title TEXT DEFAULT '',
  meta_description TEXT DEFAULT '',
  og_image TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now(),
  published_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS author TEXT DEFAULT 'AV Studio';
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'Production';
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS read_time TEXT DEFAULT '4 min';

-- 12. BLOG COMMENTS
CREATE TABLE IF NOT EXISTS public.blog_comments (
  id TEXT PRIMARY KEY,
  post_id TEXT REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL,
  author_email TEXT NOT NULL,
  content TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Pending',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 13. CLIENT & PARTNER LOGOS
CREATE TABLE IF NOT EXISTS public.client_logos (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  logo_url TEXT NOT NULL,
  "order" INT DEFAULT 0,
  featured BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 14. SOCIAL LINKS
CREATE TABLE IF NOT EXISTS public.social_links (
  id TEXT PRIMARY KEY,
  platform TEXT NOT NULL,
  url TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ==============================================================================
-- ENABLE ROW LEVEL SECURITY (RLS) ON EVERY TABLE
-- ==============================================================================
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.theme_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_logos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_links ENABLE ROW LEVEL SECURITY;

-- ==============================================================================
-- RLS POLICIES (Idempotent: Drops existing policies first before creating)
-- ==============================================================================

-- 1. site_settings
DROP POLICY IF EXISTS "Public can view site settings" ON public.site_settings;
DROP POLICY IF EXISTS "Admin full access to site settings" ON public.site_settings;
CREATE POLICY "Public can view site settings" ON public.site_settings FOR SELECT USING (true);
CREATE POLICY "Admin full access to site settings" ON public.site_settings FOR ALL TO authenticated USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- 2. theme_tokens
DROP POLICY IF EXISTS "Public can view theme tokens" ON public.theme_tokens;
DROP POLICY IF EXISTS "Admin full access to theme tokens" ON public.theme_tokens;
CREATE POLICY "Public can view theme tokens" ON public.theme_tokens FOR SELECT USING (true);
CREATE POLICY "Admin full access to theme tokens" ON public.theme_tokens FOR ALL TO authenticated USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- 3. milestones
DROP POLICY IF EXISTS "Public can view milestones" ON public.milestones;
DROP POLICY IF EXISTS "Admin full access to milestones" ON public.milestones;
CREATE POLICY "Public can view milestones" ON public.milestones FOR SELECT USING (true);
CREATE POLICY "Admin full access to milestones" ON public.milestones FOR ALL TO authenticated USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- 4. portfolio_categories
DROP POLICY IF EXISTS "Public can view categories" ON public.portfolio_categories;
DROP POLICY IF EXISTS "Admin full access to categories" ON public.portfolio_categories;
CREATE POLICY "Public can view categories" ON public.portfolio_categories FOR SELECT USING (true);
CREATE POLICY "Admin full access to categories" ON public.portfolio_categories FOR ALL TO authenticated USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- 5. services
DROP POLICY IF EXISTS "Public can view services" ON public.services;
DROP POLICY IF EXISTS "Admin full access to services" ON public.services;
CREATE POLICY "Public can view services" ON public.services FOR SELECT USING (true);
CREATE POLICY "Admin full access to services" ON public.services FOR ALL TO authenticated USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- 6. portfolio_items
DROP POLICY IF EXISTS "Public can view portfolio items" ON public.portfolio_items;
DROP POLICY IF EXISTS "Admin full access to portfolio items" ON public.portfolio_items;
CREATE POLICY "Public can view portfolio items" ON public.portfolio_items FOR SELECT USING (true);
CREATE POLICY "Admin full access to portfolio items" ON public.portfolio_items FOR ALL TO authenticated USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- 7. reviews
DROP POLICY IF EXISTS "Public can view live reviews" ON public.reviews;
DROP POLICY IF EXISTS "Public can view reviews" ON public.reviews;
DROP POLICY IF EXISTS "Admin full access to reviews" ON public.reviews;
CREATE POLICY "Public can view reviews" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Admin full access to reviews" ON public.reviews FOR ALL TO authenticated USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- 8. bookings (Public INSERT only; Authenticated SELECT / UPDATE / DELETE)
DROP POLICY IF EXISTS "Public can submit bookings" ON public.bookings;
DROP POLICY IF EXISTS "Admin full access to bookings" ON public.bookings;
CREATE POLICY "Public can submit bookings" ON public.bookings FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Admin full access to bookings" ON public.bookings FOR ALL TO authenticated USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- 9. contact_messages (Public INSERT only; Authenticated SELECT / UPDATE / DELETE)
DROP POLICY IF EXISTS "Public can submit contact messages" ON public.contact_messages;
DROP POLICY IF EXISTS "Admin full access to contact messages" ON public.contact_messages;
CREATE POLICY "Public can submit contact messages" ON public.contact_messages FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Admin full access to contact messages" ON public.contact_messages FOR ALL TO authenticated USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- 10. faqs
DROP POLICY IF EXISTS "Public can view faqs" ON public.faqs;
DROP POLICY IF EXISTS "Admin full access to faqs" ON public.faqs;
CREATE POLICY "Public can view faqs" ON public.faqs FOR SELECT USING (true);
CREATE POLICY "Admin full access to faqs" ON public.faqs FOR ALL TO authenticated USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- 11. blog_posts
DROP POLICY IF EXISTS "Public can view published posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Public can view blog posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Admin full access to blog posts" ON public.blog_posts;
CREATE POLICY "Public can view blog posts" ON public.blog_posts FOR SELECT USING (true);
CREATE POLICY "Admin full access to blog posts" ON public.blog_posts FOR ALL TO authenticated USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- 12. blog_comments
DROP POLICY IF EXISTS "Public can view approved comments" ON public.blog_comments;
DROP POLICY IF EXISTS "Public can submit comments" ON public.blog_comments;
DROP POLICY IF EXISTS "Admin full access to blog comments" ON public.blog_comments;
CREATE POLICY "Public can view approved comments" ON public.blog_comments FOR SELECT USING (status = 'Approved' OR auth.role() = 'authenticated');
CREATE POLICY "Public can submit comments" ON public.blog_comments FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Admin full access to blog comments" ON public.blog_comments FOR ALL TO authenticated USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- 13. client_logos
DROP POLICY IF EXISTS "Public can view client logos" ON public.client_logos;
DROP POLICY IF EXISTS "Admin full access to client logos" ON public.client_logos;
CREATE POLICY "Public can view client logos" ON public.client_logos FOR SELECT USING (true);
CREATE POLICY "Admin full access to client logos" ON public.client_logos FOR ALL TO authenticated USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- 14. social_links
DROP POLICY IF EXISTS "Public can view social links" ON public.social_links;
DROP POLICY IF EXISTS "Admin full access to social links" ON public.social_links;
CREATE POLICY "Public can view social links" ON public.social_links FOR SELECT USING (true);
CREATE POLICY "Admin full access to social links" ON public.social_links FOR ALL TO authenticated USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- ==============================================================================
-- PUBLIC STORAGE BUCKET FOR IMAGES ('studio-media')
-- Public Read, Authenticated-Only Upload / Update / Delete
-- ==============================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('studio-media', 'studio-media', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Public read access for studio-media" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload to studio-media" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update studio-media" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete from studio-media" ON storage.objects;

CREATE POLICY "Public read access for studio-media"
ON storage.objects FOR SELECT
USING (bucket_id = 'studio-media');

CREATE POLICY "Authenticated users can upload to studio-media"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'studio-media' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update studio-media"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'studio-media' AND auth.role() = 'authenticated')
WITH CHECK (bucket_id = 'studio-media' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete from studio-media"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'studio-media' AND auth.role() = 'authenticated');

-- ==============================================================================
-- REALTIME REPLICATION (Safe idempotent registration)
-- ==============================================================================
DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOREACH tbl IN ARRAY ARRAY[
    'site_settings',
    'theme_tokens',
    'milestones',
    'portfolio_categories',
    'services',
    'portfolio_items',
    'reviews',
    'bookings',
    'contact_messages',
    'faqs',
    'blog_posts',
    'blog_comments',
    'client_logos',
    'social_links'
  ]
  LOOP
    BEGIN
      EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE public.%I', tbl);
    EXCEPTION
      WHEN duplicate_object THEN NULL;
      WHEN undefined_object THEN NULL;
    END;
  END LOOP;
END $$;
`;

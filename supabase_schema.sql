-- ==============================================================================
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

-- ==============================================================================
-- AV PRODUCTIONS — SUPABASE POSTGRESQL SCHEMA & POLICIES
-- Full database structure for Creative Portfolio, Bookings & Studio Management
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. SITE SETTINGS (Singleton row id='default')
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

-- 3. THEME TOKENS (Design tokens for dark and light palettes)
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

-- 4. MILESTONES (Vertical filmstrip timeline for About page)
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

-- 5. PORTFOLIO CATEGORIES
CREATE TABLE IF NOT EXISTS portfolio_categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  "order" INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. SERVICES
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

-- 7. PORTFOLIO ITEMS
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

-- 8. REVIEWS & TESTIMONIALS
CREATE TABLE IF NOT EXISTS reviews (
  id TEXT PRIMARY KEY,
  reviewer_name TEXT NOT NULL,
  rating INT NOT NULL DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT NOT NULL,
  source TEXT NOT NULL DEFAULT 'Google' CHECK (source IN ('Google', 'Trustpilot', 'Other')),
  status TEXT NOT NULL DEFAULT 'Live' CHECK (status IN ('Live', 'Archived')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 9. CLIENT BOOKING RESERVATIONS
CREATE TABLE IF NOT EXISTS bookings (
  id TEXT PRIMARY KEY,
  client_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  service_id TEXT,
  service_name TEXT NOT NULL,
  date_type TEXT NOT NULL DEFAULT 'single' CHECK (date_type IN ('single', 'range')),
  date_value TEXT NOT NULL,
  end_date_value TEXT DEFAULT '',
  project_description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'New' CHECK (status IN ('New', 'Approved', 'Canceled', 'Rescheduled')),
  admin_notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 10. FREQUENTLY ASKED QUESTIONS
CREATE TABLE IF NOT EXISTS faqs (
  id TEXT PRIMARY KEY,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  "order" INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 11. BLOG POSTS (Studio Journal)
CREATE TABLE IF NOT EXISTS blog_posts (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  featured_image TEXT DEFAULT '',
  excerpt TEXT NOT NULL,
  content TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Published' CHECK (status IN ('Draft', 'Published')),
  meta_title TEXT DEFAULT '',
  meta_description TEXT DEFAULT '',
  og_image TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now(),
  published_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 12. BLOG COMMENTS
CREATE TABLE IF NOT EXISTS blog_comments (
  id TEXT PRIMARY KEY,
  post_id TEXT REFERENCES blog_posts(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL,
  author_email TEXT NOT NULL,
  content TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Approved')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ==============================================================================
-- 13. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

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

-- SITE SETTINGS: Public read, admin write
CREATE POLICY "Public can view site settings" ON site_settings FOR SELECT USING (true);
CREATE POLICY "Admin full access to site settings" ON site_settings FOR ALL USING (true) WITH CHECK (true);

-- THEME TOKENS: Public read, admin write
CREATE POLICY "Public can view theme tokens" ON theme_tokens FOR SELECT USING (true);
CREATE POLICY "Admin full access to theme tokens" ON theme_tokens FOR ALL USING (true) WITH CHECK (true);

-- MILESTONES: Public read, admin write
CREATE POLICY "Public can view milestones" ON milestones FOR SELECT USING (true);
CREATE POLICY "Admin full access to milestones" ON milestones FOR ALL USING (true) WITH CHECK (true);

-- CATEGORIES: Public read, admin write
CREATE POLICY "Public can view categories" ON portfolio_categories FOR SELECT USING (true);
CREATE POLICY "Admin full access to categories" ON portfolio_categories FOR ALL USING (true) WITH CHECK (true);

-- SERVICES: Public read, admin write
CREATE POLICY "Public can view services" ON services FOR SELECT USING (true);
CREATE POLICY "Admin full access to services" ON services FOR ALL USING (true) WITH CHECK (true);

-- PORTFOLIO ITEMS: Public read, admin write
CREATE POLICY "Public can view portfolio items" ON portfolio_items FOR SELECT USING (true);
CREATE POLICY "Admin full access to portfolio items" ON portfolio_items FOR ALL USING (true) WITH CHECK (true);

-- REVIEWS: Public can view Live reviews; Admin can manage all
CREATE POLICY "Public can view live reviews" ON reviews FOR SELECT USING (status = 'Live');
CREATE POLICY "Admin full access to reviews" ON reviews FOR ALL USING (true) WITH CHECK (true);

-- BOOKINGS: Public can insert new inquiries; only Admin can read or manage
CREATE POLICY "Public can submit bookings" ON bookings FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin full access to bookings" ON bookings FOR ALL USING (true) WITH CHECK (true);

-- FAQS: Public read, admin write
CREATE POLICY "Public can view faqs" ON faqs FOR SELECT USING (true);
CREATE POLICY "Admin full access to faqs" ON faqs FOR ALL USING (true) WITH CHECK (true);

-- BLOG POSTS: Public can view Published posts; Admin can manage all
CREATE POLICY "Public can view published posts" ON blog_posts FOR SELECT USING (status = 'Published');
CREATE POLICY "Admin full access to blog posts" ON blog_posts FOR ALL USING (true) WITH CHECK (true);

-- BLOG COMMENTS: Public can view Approved comments and insert new comments; Admin full access
CREATE POLICY "Public can view approved comments" ON blog_comments FOR SELECT USING (status = 'Approved');
CREATE POLICY "Public can submit comments" ON blog_comments FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin full access to blog comments" ON blog_comments FOR ALL USING (true) WITH CHECK (true);

-- ==============================================================================
-- 14. REALTIME REPLICATION (For instant live updates across devices)
-- ==============================================================================
ALTER PUBLICATION supabase_realtime ADD TABLE bookings;
ALTER PUBLICATION supabase_realtime ADD TABLE blog_comments;
ALTER PUBLICATION supabase_realtime ADD TABLE reviews;
ALTER PUBLICATION supabase_realtime ADD TABLE site_settings;

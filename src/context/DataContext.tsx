import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  SiteSettings,
  ThemeTokens,
  Milestone,
  Service,
  PortfolioCategory,
  PortfolioItem,
  Review,
  Booking,
  FAQ,
  BlogPost,
  BlogComment,
  SocialLink,
  ClientLogo
} from '../types';
import {
  DEFAULT_SITE_SETTINGS,
  DEFAULT_THEME_TOKENS,
  INITIAL_CATEGORIES,
  INITIAL_SERVICES,
  INITIAL_PORTFOLIO_ITEMS,
  INITIAL_MILESTONES,
  INITIAL_REVIEWS,
  INITIAL_FAQS,
  INITIAL_BLOG_POSTS,
  INITIAL_BLOG_COMMENTS,
  INITIAL_SOCIAL_LINKS,
  INITIAL_CLIENT_LOGOS
} from '../initialData';
import {
  getSupabaseClient,
  fetchFromSupabase,
  fetchSingletonFromSupabase,
  upsertToSupabase,
  insertPublicRecord,
  deleteFromSupabase,
  pushAllDataToSupabase,
  toCamelCase
} from '../supabase';

interface DataContextType {
  siteSettings: SiteSettings;
  themeTokens: ThemeTokens;
  milestones: Milestone[];
  services: Service[];
  categories: PortfolioCategory[];
  portfolioItems: PortfolioItem[];
  reviews: Review[];
  bookings: Booking[];
  faqs: FAQ[];
  blogPosts: BlogPost[];
  blogComments: BlogComment[];
  socialLinks: SocialLink[];
  clientLogos: ClientLogo[];
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  isLoading: boolean;
  submitBooking: (data: {
    clientName: string;
    email: string;
    phone: string;
    serviceId: string;
    serviceName: string;
    dateType: 'single' | 'range';
    dateValue: string;
    endDateValue?: string;
    projectDescription: string;
  }) => Promise<{ success: boolean; error?: string }>;
  submitComment: (postId: string, authorName: string, authorEmail: string, content: string) => Promise<{ success: boolean; error?: string }>;
  adminMutate: (
    action: 'create' | 'update' | 'delete',
    collection: string,
    id?: string,
    data?: any,
    token?: string
  ) => Promise<{ success: boolean; error?: string }>;
  syncToGoldGroup: (group: 'core' | 'interactive' | 'structure' | 'typography' | 'all') => Promise<{ success: boolean; error?: string }>;
  updateThemeTokens: (newTokens: Partial<ThemeTokens>) => Promise<{ success: boolean; error?: string }>;
  refreshAdminData: (token?: string) => Promise<void>;
  syncAllToSupabase: () => Promise<{ success: boolean; message: string; counts: Record<string, number>; errors: string[] }>;
  syncFromSupabase: () => Promise<{ success: boolean; message: string }>;
}

const DataContext = createContext<DataContextType | null>(null);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Built-in initial data is used strictly as an in-memory fallback until Supabase loads or if unreachable
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);
  const [themeTokens, setThemeTokens] = useState<ThemeTokens>(DEFAULT_THEME_TOKENS);
  const [milestones, setMilestones] = useState<Milestone[]>(INITIAL_MILESTONES);
  const [services, setServices] = useState<Service[]>(INITIAL_SERVICES);
  const [categories, setCategories] = useState<PortfolioCategory[]>(INITIAL_CATEGORIES);
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>(INITIAL_PORTFOLIO_ITEMS);
  const [reviews, setReviews] = useState<Review[]>(INITIAL_REVIEWS);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [faqs, setFaqs] = useState<FAQ[]>(INITIAL_FAQS);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>(INITIAL_BLOG_POSTS);
  const [blogComments, setBlogComments] = useState<BlogComment[]>(INITIAL_BLOG_COMMENTS);
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>(INITIAL_SOCIAL_LINKS);
  const [clientLogos, setClientLogos] = useState<ClientLogo[]>(INITIAL_CLIENT_LOGOS);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Dynamic Favicon synchronization: updates browser tab icon whenever logo/favicon changes
  useEffect(() => {
    const faviconUrl = siteSettings.faviconUrl || siteSettings.logoUrl || '/favicon.svg';
    const linkTypes = [
      { rel: 'icon', id: 'app-favicon', type: faviconUrl.endsWith('.svg') ? 'image/svg+xml' : 'image/png' },
      { rel: 'apple-touch-icon', id: 'app-apple-icon', type: '' }
    ];
    linkTypes.forEach(({ rel, id, type }) => {
      let link = document.getElementById(id) as HTMLLinkElement | null;
      if (!link) {
        link = document.querySelector(`link[rel='${rel}']`) as HTMLLinkElement | null;
      }
      if (link) {
        link.href = faviconUrl;
        if (type) link.type = type;
      } else {
        const newLink = document.createElement('link');
        newLink.id = id;
        newLink.rel = rel;
        newLink.href = faviconUrl;
        if (type) newLink.type = type;
        document.head.appendChild(newLink);
      }
    });
  }, [siteSettings.faviconUrl, siteSettings.logoUrl]);

  // Apply CSS Variables dynamically based on theme and tokens
  const applyThemeTokens = useCallback((tokens: ThemeTokens, currentTheme: 'dark' | 'light') => {
    const root = document.documentElement;
    root.setAttribute('data-theme', currentTheme);

    root.style.setProperty('--color-gold', tokens.goldAccent);
    root.style.setProperty('--font-heading', `'${tokens.headingFont}', sans-serif`);
    root.style.setProperty('--font-body', `'${tokens.bodyFont}', sans-serif`);

    if (currentTheme === 'dark') {
      root.style.setProperty('--bg-color', tokens.darkBg);
      root.style.setProperty('--text-body', tokens.darkBody);
      root.style.setProperty('--text-heading', tokens.darkHeading);
      root.style.setProperty('--btn-bg', tokens.darkBtnBg);
      root.style.setProperty('--btn-text', tokens.darkBtnText);
      root.style.setProperty('--btn-hover', tokens.darkBtnHover);
      root.style.setProperty('--link-color', tokens.darkLink);
      root.style.setProperty('--link-hover', tokens.darkLinkHover);
      root.style.setProperty('--border-color', tokens.darkBorder);
      root.style.setProperty('--card-bg', tokens.darkCardBg);
      root.style.setProperty('--icon-color', tokens.darkIcon);
    } else {
      root.style.setProperty('--bg-color', tokens.lightBg);
      root.style.setProperty('--text-body', tokens.lightBody);
      root.style.setProperty('--text-heading', tokens.lightHeading);
      root.style.setProperty('--btn-bg', tokens.lightBtnBg);
      root.style.setProperty('--btn-text', tokens.lightBtnText);
      root.style.setProperty('--btn-hover', tokens.lightBtnHover);
      root.style.setProperty('--link-color', tokens.lightLink);
      root.style.setProperty('--link-hover', tokens.lightLinkHover);
      root.style.setProperty('--border-color', tokens.lightBorder);
      root.style.setProperty('--card-bg', tokens.lightCardBg);
      root.style.setProperty('--icon-color', tokens.lightIcon);
    }
  }, []);

  useEffect(() => {
    applyThemeTokens(themeTokens, theme);
  }, [themeTokens, theme, applyThemeTokens]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Update design tokens and save directly to Supabase
  const updateThemeTokens = async (newTokens: Partial<ThemeTokens>): Promise<{ success: boolean; error?: string }> => {
    const updated: ThemeTokens = { ...themeTokens, ...newTokens };
    setThemeTokens(updated);
    return await upsertToSupabase('theme_tokens', {
      id: 'default',
      ...updated,
      updatedAt: new Date().toISOString()
    });
  };

  // Sync to Gold reset controls and save directly to Supabase
  const syncToGoldGroup = async (
    group: 'core' | 'interactive' | 'structure' | 'typography' | 'all'
  ): Promise<{ success: boolean; error?: string }> => {
    const updated = { ...themeTokens };
    const gold = DEFAULT_THEME_TOKENS.goldAccent;

    if (group === 'core' || group === 'all') {
      updated.goldAccent = gold;
      updated.darkBg = DEFAULT_THEME_TOKENS.darkBg;
      updated.darkBody = DEFAULT_THEME_TOKENS.darkBody;
      updated.darkHeading = DEFAULT_THEME_TOKENS.darkHeading;
      updated.lightBg = DEFAULT_THEME_TOKENS.lightBg;
      updated.lightBody = DEFAULT_THEME_TOKENS.lightBody;
      updated.lightHeading = DEFAULT_THEME_TOKENS.lightHeading;
    }

    if (group === 'interactive' || group === 'all') {
      updated.darkBtnBg = gold;
      updated.darkBtnText = DEFAULT_THEME_TOKENS.darkBtnText;
      updated.darkBtnHover = DEFAULT_THEME_TOKENS.darkBtnHover;
      updated.darkLink = gold;
      updated.darkLinkHover = DEFAULT_THEME_TOKENS.darkLinkHover;

      updated.lightBtnBg = gold;
      updated.lightBtnText = DEFAULT_THEME_TOKENS.lightBtnText;
      updated.lightBtnHover = DEFAULT_THEME_TOKENS.lightBtnHover;
      updated.lightLink = DEFAULT_THEME_TOKENS.lightLink;
      updated.lightLinkHover = DEFAULT_THEME_TOKENS.lightLinkHover;
    }

    if (group === 'structure' || group === 'all') {
      updated.darkBorder = DEFAULT_THEME_TOKENS.darkBorder;
      updated.darkCardBg = DEFAULT_THEME_TOKENS.darkCardBg;
      updated.darkIcon = gold;

      updated.lightBorder = DEFAULT_THEME_TOKENS.lightBorder;
      updated.lightCardBg = DEFAULT_THEME_TOKENS.lightCardBg;
      updated.lightIcon = DEFAULT_THEME_TOKENS.lightIcon;
    }

    if (group === 'typography' || group === 'all') {
      updated.headingFont = DEFAULT_THEME_TOKENS.headingFont;
      updated.bodyFont = DEFAULT_THEME_TOKENS.bodyFont;
    }

    setThemeTokens(updated);
    return await upsertToSupabase('theme_tokens', {
      id: 'default',
      ...updated,
      updatedAt: new Date().toISOString()
    });
  };

  // Public Booking Submission -> Saves directly to Supabase (public insert only)
  const submitBooking = async (data: {
    clientName: string;
    email: string;
    phone: string;
    serviceId: string;
    serviceName: string;
    dateType: 'single' | 'range';
    dateValue: string;
    endDateValue?: string;
    projectDescription: string;
  }) => {
    const newBooking: Booking = {
      id: 'book-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      clientName: data.clientName.trim(),
      email: data.email.trim(),
      phone: data.phone.trim(),
      serviceId: data.serviceId || '',
      serviceName: data.serviceName || 'Production Commission',
      dateType: data.dateType || 'single',
      dateValue: data.dateValue,
      endDateValue: data.endDateValue || '',
      projectDescription: data.projectDescription || '',
      status: 'New',
      adminNotes: '',
      createdAt: new Date().toISOString()
    };

    const res = await insertPublicRecord('bookings', newBooking);
    if (!res.success) {
      return { success: false, error: res.error || 'Could not submit reservation to Supabase.' };
    }

    setBookings(prev => [newBooking, ...prev]);
    return { success: true };
  };

  // Public Blog Comment Submission -> Saves directly to Supabase
  const submitComment = async (postId: string, authorName: string, authorEmail: string, content: string) => {
    const newComment: BlogComment = {
      id: 'comm-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      postId,
      authorName,
      authorEmail,
      content,
      status: 'Pending',
      createdAt: new Date().toISOString()
    };

    const res = await insertPublicRecord('blog_comments', newComment);
    if (!res.success) {
      return { success: false, error: res.error || 'Could not submit comment.' };
    }

    setBlogComments(prev => [newComment, ...prev]);
    return { success: true };
  };

  // Direct Supabase Admin Mutation -> Writes immediately to Supabase and returns real save status
  const adminMutate = async (
    action: 'create' | 'update' | 'delete',
    collection: string,
    id?: string,
    data?: any
  ): Promise<{ success: boolean; error?: string }> => {
    const tableMap: Record<string, string> = {
      site_settings: 'site_settings',
      theme_tokens: 'theme_tokens',
      milestones: 'milestones',
      services: 'services',
      portfolio_categories: 'portfolio_categories',
      categories: 'portfolio_categories',
      portfolio_items: 'portfolio_items',
      reviews: 'reviews',
      bookings: 'bookings',
      faqs: 'faqs',
      blog_posts: 'blog_posts',
      blog_comments: 'blog_comments',
      client_logos: 'client_logos',
      social_links: 'social_links'
    };

    const supabaseTable = tableMap[collection];
    if (!supabaseTable) {
      return { success: false, error: `Unknown collection: ${collection}` };
    }

    const recordId =
      supabaseTable === 'site_settings' || supabaseTable === 'theme_tokens'
        ? 'default'
        : id || data?.id || `${collection.slice(0, 4)}-${Date.now()}`;

    // Build merged record for upsert so partial updates (like booking status) include full row data
    let recordToSave: any = null;
    if (action !== 'delete') {
      if (supabaseTable === 'site_settings') {
        recordToSave = { ...siteSettings, ...data, id: 'default', updatedAt: new Date().toISOString() };
      } else if (supabaseTable === 'theme_tokens') {
        recordToSave = { ...themeTokens, ...data, id: 'default', updatedAt: new Date().toISOString() };
      } else if (supabaseTable === 'bookings') {
        const existing = bookings.find(b => b.id === recordId);
        recordToSave = { ...(existing || {}), ...data, id: recordId, updatedAt: new Date().toISOString() };
      } else if (supabaseTable === 'milestones') {
        const existing = milestones.find(m => m.id === recordId);
        const merged = { ...(existing || {}), ...data, id: recordId };
        recordToSave = {
          ...merged,
          body: merged.body || merged.description || '',
          description: merged.description || merged.body || ''
        };
      } else if (supabaseTable === 'reviews') {
        const existing = reviews.find(r => r.id === recordId);
        const merged = { ...(existing || {}), ...data, id: recordId };
        recordToSave = {
          ...merged,
          reviewerName: merged.reviewerName || merged.author || 'Client',
          author: merged.author || merged.reviewerName || 'Client',
          reviewText: merged.reviewText || merged.text || '',
          text: merged.text || merged.reviewText || '',
          source: merged.source || 'Google',
          status: merged.status || 'Live'
        };
      } else if (supabaseTable === 'services') {
        const existing = services.find(s => s.id === recordId);
        recordToSave = { ...(existing || {}), ...data, id: recordId };
      } else if (supabaseTable === 'portfolio_categories') {
        const existing = categories.find(c => c.id === recordId);
        recordToSave = { ...(existing || {}), ...data, id: recordId };
      } else if (supabaseTable === 'portfolio_items') {
        const existing = portfolioItems.find(i => i.id === recordId);
        recordToSave = {
          showDescription: true,
          altText: data?.title || '',
          order: portfolioItems.length + 1,
          ...(existing || {}),
          ...data,
          id: recordId
        };
      } else if (supabaseTable === 'faqs') {
        const existing = faqs.find(f => f.id === recordId);
        recordToSave = { ...(existing || {}), ...data, id: recordId };
      } else if (supabaseTable === 'blog_posts') {
        const existing = blogPosts.find(p => p.id === recordId);
        const slug =
          data?.slug ||
          existing?.slug ||
          (data?.title || 'post').toLowerCase().replace(/[^a-z0-9]+/g, '-');
        recordToSave = {
          status: 'Published',
          featuredImage: '',
          metaTitle: data?.title || '',
          metaDescription: data?.excerpt || '',
          ogImage: '',
          createdAt: existing?.createdAt || new Date().toISOString(),
          ...(existing || {}),
          ...data,
          slug,
          id: recordId
        };
      } else if (supabaseTable === 'blog_comments') {
        const existing = blogComments.find(c => c.id === recordId);
        recordToSave = { ...(existing || {}), ...data, id: recordId };
      } else if (supabaseTable === 'client_logos') {
        const existing = clientLogos.find(c => c.id === recordId);
        recordToSave = { ...(existing || {}), ...data, id: recordId };
      } else if (supabaseTable === 'social_links') {
        recordToSave = { ...data, id: recordId };
      }
    }

    // 1. Write directly to Supabase first
    let dbResult: { success: boolean; error?: string };
    if (action === 'delete') {
      dbResult = await deleteFromSupabase(supabaseTable, recordId);
    } else if (supabaseTable === 'social_links' && Array.isArray(data)) {
      // Batch update social links array
      let firstError: string | undefined;
      for (let i = 0; i < data.length; i++) {
        const item = data[i];
        const sId = item.id || item.platform?.toLowerCase() || `soc-${i}`;
        const r = await upsertToSupabase('social_links', { id: sId, platform: item.platform, url: item.url });
        if (!r.success && !firstError) firstError = r.error;
      }
      dbResult = firstError ? { success: false, error: firstError } : { success: true };
    } else {
      dbResult = await upsertToSupabase(supabaseTable, recordToSave);
    }

    if (!dbResult.success) {
      return dbResult;
    }

    // 2. Update in-memory React state after confirmed Supabase write
    if (supabaseTable === 'site_settings') {
      setSiteSettings(recordToSave);
    } else if (supabaseTable === 'theme_tokens') {
      setThemeTokens(recordToSave);
    } else if (supabaseTable === 'milestones') {
      setMilestones(prev =>
        action === 'delete'
          ? prev.filter(m => m.id !== recordId)
          : prev.some(m => m.id === recordId)
          ? prev.map(m => (m.id === recordId ? recordToSave : m))
          : [...prev, recordToSave]
      );
    } else if (supabaseTable === 'services') {
      setServices(prev =>
        action === 'delete'
          ? prev.filter(s => s.id !== recordId)
          : prev.some(s => s.id === recordId)
          ? prev.map(s => (s.id === recordId ? recordToSave : s))
          : [...prev, recordToSave]
      );
    } else if (supabaseTable === 'portfolio_categories') {
      setCategories(prev =>
        action === 'delete'
          ? prev.filter(c => c.id !== recordId)
          : prev.some(c => c.id === recordId)
          ? prev.map(c => (c.id === recordId ? recordToSave : c))
          : [...prev, recordToSave]
      );
    } else if (supabaseTable === 'portfolio_items') {
      setPortfolioItems(prev =>
        action === 'delete'
          ? prev.filter(i => i.id !== recordId)
          : prev.some(i => i.id === recordId)
          ? prev.map(i => (i.id === recordId ? recordToSave : i))
          : [...prev, recordToSave]
      );
    } else if (supabaseTable === 'reviews') {
      setReviews(prev =>
        action === 'delete'
          ? prev.filter(r => r.id !== recordId)
          : prev.some(r => r.id === recordId)
          ? prev.map(r => (r.id === recordId ? recordToSave : r))
          : [recordToSave, ...prev]
      );
    } else if (supabaseTable === 'bookings') {
      setBookings(prev =>
        action === 'delete'
          ? prev.filter(b => b.id !== recordId)
          : prev.some(b => b.id === recordId)
          ? prev.map(b => (b.id === recordId ? recordToSave : b))
          : [recordToSave, ...prev]
      );
    } else if (supabaseTable === 'faqs') {
      setFaqs(prev =>
        action === 'delete'
          ? prev.filter(f => f.id !== recordId)
          : prev.some(f => f.id === recordId)
          ? prev.map(f => (f.id === recordId ? recordToSave : f))
          : [...prev, recordToSave]
      );
    } else if (supabaseTable === 'blog_posts') {
      setBlogPosts(prev =>
        action === 'delete'
          ? prev.filter(p => p.id !== recordId)
          : prev.some(p => p.id === recordId)
          ? prev.map(p => (p.id === recordId ? recordToSave : p))
          : [recordToSave, ...prev]
      );
    } else if (supabaseTable === 'blog_comments') {
      setBlogComments(prev =>
        action === 'delete'
          ? prev.filter(c => c.id !== recordId)
          : prev.some(c => c.id === recordId)
          ? prev.map(c => (c.id === recordId ? recordToSave : c))
          : [recordToSave, ...prev]
      );
    } else if (supabaseTable === 'social_links') {
      if (Array.isArray(data)) {
        setSocialLinks(data);
      }
    } else if (supabaseTable === 'client_logos') {
      setClientLogos(prev =>
        action === 'delete'
          ? prev.filter(c => c.id !== recordId)
          : prev.some(c => c.id === recordId)
          ? prev.map(c => (c.id === recordId ? recordToSave : c))
          : [...prev, recordToSave]
      );
    }

    return { success: true };
  };

  // Fetch admin-only bookings & comments from Supabase (requires authenticated session)
  const refreshAdminData = useCallback(async () => {
    const supabase = getSupabaseClient();
    if (!supabase) return;
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData?.session) return;

      const [ bookingsRes, commentsRes ] = await Promise.all([
        supabase.from('bookings').select('*').order('created_at', { ascending: false }),
        supabase.from('blog_comments').select('*').order('created_at', { ascending: false })
      ]);

      if (Array.isArray(bookingsRes.data)) {
        setBookings(bookingsRes.data.map(b => toCamelCase(b)) as Booking[]);
      }
      if (Array.isArray(commentsRes.data)) {
        setBlogComments(commentsRes.data.map(c => toCamelCase(c)) as BlogComment[]);
      }
    } catch {
      // Quietly ignore if offline
    }
  }, []);

  // Load all public website content directly from Supabase on every page load
  const syncFromSupabase = useCallback(async (): Promise<{ success: boolean; message: string }> => {
    const supabase = getSupabaseClient();
    if (!supabase) {
      setIsLoading(false);
      return { success: false, message: 'Supabase environment variables are not configured.' };
    }

    try {
      const [
        settings,
        tokens,
        dbMilestones,
        dbServices,
        dbCats,
        dbItems,
        dbReviews,
        dbFaqs,
        dbPosts,
        dbComments,
        dbLogos,
        dbSocials
      ] = await Promise.all([
        fetchSingletonFromSupabase<SiteSettings>('site_settings'),
        fetchSingletonFromSupabase<ThemeTokens>('theme_tokens'),
        fetchFromSupabase<Milestone>('milestones'),
        fetchFromSupabase<Service>('services'),
        fetchFromSupabase<PortfolioCategory>('portfolio_categories'),
        fetchFromSupabase<PortfolioItem>('portfolio_items'),
        fetchFromSupabase<Review>('reviews'),
        fetchFromSupabase<FAQ>('faqs'),
        fetchFromSupabase<BlogPost>('blog_posts'),
        fetchFromSupabase<BlogComment>('blog_comments'),
        fetchFromSupabase<ClientLogo>('client_logos'),
        fetchFromSupabase<SocialLink>('social_links'),
      ]);

      if (settings && settings.heroTitle) {
        setSiteSettings(prev => ({ ...prev, ...settings }));
      }
      if (tokens && tokens.goldAccent) {
        setThemeTokens(prev => ({ ...prev, ...tokens }));
      }
      if (dbMilestones && dbMilestones.length > 0) {
        setMilestones(dbMilestones.sort((a, b) => (a.order || 0) - (b.order || 0)));
      }
      if (dbServices && dbServices.length > 0) {
        setServices(dbServices.sort((a, b) => (a.order || 0) - (b.order || 0)));
      }
      if (dbCats && dbCats.length > 0) {
        setCategories(dbCats.sort((a, b) => (a.order || 0) - (b.order || 0)));
      }
      if (dbItems && dbItems.length > 0) {
        setPortfolioItems(dbItems.sort((a, b) => (a.order || 0) - (b.order || 0)));
      }
      if (dbReviews && dbReviews.length > 0) {
        setReviews(dbReviews);
      }
      if (dbFaqs && dbFaqs.length > 0) {
        setFaqs(dbFaqs.sort((a, b) => (a.order || 0) - (b.order || 0)));
      }
      if (dbPosts && dbPosts.length > 0) {
        setBlogPosts(dbPosts);
      }
      if (dbComments && dbComments.length > 0) {
        setBlogComments(dbComments);
      }
      if (dbLogos && dbLogos.length > 0) {
        setClientLogos(dbLogos.sort((a, b) => (a.order || 0) - (b.order || 0)));
      }
      if (dbSocials && dbSocials.length > 0) {
        setSocialLinks(dbSocials);
      }

      await refreshAdminData();
      setIsLoading(false);
      return { success: true, message: 'Loaded latest content from Supabase.' };
    } catch (err: any) {
      setIsLoading(false);
      return { success: false, message: err?.message || 'Failed to load content from Supabase.' };
    }
  }, [refreshAdminData]);

  // One-time migration: uploads all current in-memory content (and any local images) to Supabase
  const syncAllToSupabase = async () => {
    const res = await pushAllDataToSupabase({
      siteSettings,
      themeTokens,
      milestones,
      services,
      categories,
      portfolioItems,
      reviews,
      bookings,
      faqs,
      blogPosts,
      blogComments,
      clientLogos,
      socialLinks
    });
    if (res.success) {
      await syncFromSupabase();
    }
    return res;
  };

  // Load from Supabase on mount and subscribe to Realtime changes so live site updates automatically
  useEffect(() => {
    syncFromSupabase();

    const supabase = getSupabaseClient();
    let realtimeChannel: any = null;
    if (supabase) {
      realtimeChannel = supabase
        .channel('av-live-content-sync')
        .on('postgres_changes', { event: '*', schema: 'public' }, () => {
          syncFromSupabase();
        })
        .subscribe();
    }

    const handleFocus = () => {
      syncFromSupabase();
    };
    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('focus', handleFocus);
      if (supabase && realtimeChannel) {
        supabase.removeChannel(realtimeChannel);
      }
    };
  }, [syncFromSupabase]);

  return (
    <DataContext.Provider
      value={{
        siteSettings,
        themeTokens,
        milestones,
        services,
        categories,
        portfolioItems,
        reviews,
        bookings,
        faqs,
        blogPosts,
        blogComments,
        socialLinks,
        clientLogos,
        theme,
        toggleTheme,
        isLoading,
        submitBooking,
        submitComment,
        adminMutate,
        syncToGoldGroup,
        updateThemeTokens,
        refreshAdminData,
        syncAllToSupabase,
        syncFromSupabase
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
};

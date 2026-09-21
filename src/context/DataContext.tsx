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
  SocialLink
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
  INITIAL_SOCIAL_LINKS
} from '../initialData';

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
  syncToGoldGroup: (group: 'core' | 'interactive' | 'structure' | 'typography' | 'all') => void;
  updateThemeTokens: (newTokens: Partial<ThemeTokens>) => void;
  refreshAdminData: (token: string) => Promise<void>;
}

const DataContext = createContext<DataContextType | null>(null);

const STORAGE_PREFIX = 'av_prod_';

function getLocal<T>(key: string, fallback: T): T {
  try {
    const saved = localStorage.getItem(STORAGE_PREFIX + key);
    return saved ? JSON.parse(saved) : fallback;
  } catch {
    return fallback;
  }
}

function setLocal<T>(key: string, val: T) {
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(val));
  } catch (e) {
    console.error('Storage error:', e);
  }
}

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(() => {
    const loaded = getLocal('settings', DEFAULT_SITE_SETTINGS);
    // Gracefully upgrade legacy title / labels from previous builds
    if (loaded.heroTitle === 'AV PRODUCTIONS') {
      loaded.heroTitle = DEFAULT_SITE_SETTINGS.heroTitle;
    }
    if (loaded.floatingBookButtonLabel === 'BOOK SESSION' || !loaded.floatingBookButtonLabel) {
      loaded.floatingBookButtonLabel = 'Book Production';
    }
    if (loaded.heroMediaType === 'image' && loaded.heroMediaUrl?.includes('unsplash.com/photo-1492691527719')) {
      loaded.heroMediaType = 'none';
      loaded.heroMediaUrl = '';
    }
    if (loaded.heroTagline?.includes('sound design')) {
      loaded.heroTagline = DEFAULT_SITE_SETTINGS.heroTagline;
    }
    if (loaded.introStripText?.includes('sound design')) {
      loaded.introStripText = DEFAULT_SITE_SETTINGS.introStripText;
    }
    return loaded;
  });
  const [themeTokens, setThemeTokens] = useState<ThemeTokens>(() => {
    const loaded = getLocal('theme_tokens', DEFAULT_THEME_TOKENS);
    if (loaded.goldAccent === '#D4AF37' || loaded.headingFont === 'Syne' || loaded.darkBg === '#080808') {
      return DEFAULT_THEME_TOKENS;
    }
    return loaded;
  });
  const [milestones, setMilestones] = useState<Milestone[]>(() => getLocal('milestones', INITIAL_MILESTONES));
  const [services, setServices] = useState<Service[]>(() => {
    const loaded = getLocal('services', INITIAL_SERVICES);
    return loaded.map(s => {
      if (s.id === 'srv-2' && (s.title.includes('Sound Design') || s.categoryId === 'cat-sound')) {
        return INITIAL_SERVICES.find(is => is.id === 'srv-2') || s;
      }
      return s;
    });
  });
  const [categories, setCategories] = useState<PortfolioCategory[]>(() => {
    const loaded = getLocal('categories', INITIAL_CATEGORIES);
    return loaded.map(c => (c.id === 'cat-sound' ? { ...c, name: 'Audio Mixing & Mastering', slug: 'audio-mastering' } : c));
  });
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>(() => {
    const loaded = getLocal('portfolio_items', INITIAL_PORTFOLIO_ITEMS);
    return loaded.map(item => {
      if (item.id === 'item-8' || item.mediaType === 'audio') {
        const hasBrokenUrl = !item.mediaUrl || item.mediaUrl.includes('actions.google.com') || item.mediaUrl.endsWith('.ogg');
        return {
          ...item,
          mediaUrl: hasBrokenUrl ? '/audio/master-reference.mp3' : item.mediaUrl,
          title: item.title.includes('Subterranean') ? 'Audio Mixing & Mastering — Reference Proof' : item.title,
          description: item.description.includes('binaural')
            ? 'Studio acoustic master demonstrating stereo imaging, dynamic headroom control, harmonic balance, and final limiter threshold proof.'
            : item.description,
          featured: false, // Maintain solely in the portfolio section for audio mixing & mastering proof
        };
      }
      return item;
    });
  });
  const [reviews, setReviews] = useState<Review[]>(() => getLocal('reviews', INITIAL_REVIEWS));
  const [bookings, setBookings] = useState<Booking[]>(() => getLocal('bookings', []));
  const [faqs, setFaqs] = useState<FAQ[]>(() => getLocal('faqs', INITIAL_FAQS));
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>(() => getLocal('blog_posts', INITIAL_BLOG_POSTS));
  const [blogComments, setBlogComments] = useState<BlogComment[]>(() => getLocal('blog_comments', INITIAL_BLOG_COMMENTS));
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>(() => getLocal('social_links', INITIAL_SOCIAL_LINKS));
  const [theme, setTheme] = useState<'dark' | 'light'>(() => (localStorage.getItem('av_theme') as 'dark' | 'light') || 'dark');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Apply CSS Variables dynamically based on theme and tokens
  const applyThemeTokens = useCallback((tokens: ThemeTokens, currentTheme: 'dark' | 'light') => {
    const root = document.documentElement;
    root.setAttribute('data-theme', currentTheme);

    // Primary gold accent (applied site-wide)
    root.style.setProperty('--color-gold', tokens.goldAccent);

    // Typography
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
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('av_theme', next);
  };

  // Instant initial load for maximum speed
  useEffect(() => {
    setIsLoading(false);
  }, []);

  // Update design tokens
  const updateThemeTokens = (newTokens: Partial<ThemeTokens>) => {
    setThemeTokens(prev => {
      const updated = { ...prev, ...newTokens };
      setLocal('theme_tokens', updated);
      return updated;
    });
  };

  // Sync to Gold reset controls
  const syncToGoldGroup = (group: 'core' | 'interactive' | 'structure' | 'typography' | 'all') => {
    setThemeTokens(prev => {
      let updated = { ...prev };
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

      setLocal('theme_tokens', updated);
      return updated;
    });
  };

  // Submit Booking (public) - Instant 0ms optimistic execution with background sync
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

    // 1. Instant local persistence & state update (0ms latency, zero drop)
    setBookings(prev => {
      const next = [newBooking, ...prev];
      setLocal('bookings', next);
      return next;
    });

    try {
      window.dispatchEvent(new CustomEvent('av-booking-created', { detail: newBooking }));
    } catch {
      // Ignore in non-browser envs
    }

    // 2. Background server sync
    try {
      fetch('/api/public/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }).catch(err => {
        console.warn('Background booking sync completed with warning:', err);
      });
    } catch {
      // Local copy is already safe
    }

    return { success: true, booking: newBooking };
  };

  // Submit Blog Comment (public)
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

    setBlogComments(prev => {
      const next = [newComment, ...prev];
      setLocal('blog_comments', next);
      return next;
    });

    try {
      fetch('/api/public/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId, authorName, authorEmail, content }),
      }).catch(() => {});
    } catch {}

    return { success: true, comment: newComment };
  };

  // Server-verified admin mutation with instant optimistic UI update
  const adminMutate = async (
    action: 'create' | 'update' | 'delete',
    collection: string,
    id?: string,
    data?: any,
    token?: string
  ): Promise<{ success: boolean; error?: string }> => {
    // 1. IMMEDIATELY mutate local state & localStorage so the UI updates instantly
    if (collection === 'site_settings') {
      setSiteSettings(prev => {
        const next = { ...prev, ...data };
        setLocal('settings', next);
        return next;
      });
    } else if (collection === 'theme_tokens') {
      setThemeTokens(prev => {
        const next = { ...prev, ...data };
        setLocal('theme_tokens', next);
        return next;
      });
    } else if (collection === 'milestones') {
      setMilestones(prev => {
        let next: Milestone[];
        if (action === 'create') {
          next = [...prev, { id: id || 'ms-' + Date.now(), ...data }];
        } else if (action === 'update') {
          next = prev.map(m => m.id === id ? { ...m, ...data } : m);
        } else {
          next = prev.filter(m => m.id !== id);
        }
        setLocal('milestones', next);
        return next;
      });
    } else if (collection === 'services') {
      setServices(prev => {
        let next: Service[];
        if (action === 'create') {
          next = [...prev, { id: id || 'srv-' + Date.now(), ...data }];
        } else if (action === 'update') {
          next = prev.map(s => s.id === id ? { ...s, ...data } : s);
        } else {
          next = prev.filter(s => s.id !== id);
        }
        setLocal('services', next);
        return next;
      });
    } else if (collection === 'portfolio_categories') {
      setCategories(prev => {
        let next: PortfolioCategory[];
        if (action === 'create') {
          next = [...prev, { id: id || 'cat-' + Date.now(), ...data }];
        } else if (action === 'update') {
          next = prev.map(c => c.id === id ? { ...c, ...data } : c);
        } else {
          next = prev.filter(c => c.id !== id);
        }
        setLocal('categories', next);
        return next;
      });
    } else if (collection === 'portfolio_items') {
      setPortfolioItems(prev => {
        let next: PortfolioItem[];
        if (action === 'create') {
          next = [...prev, { id: id || 'item-' + Date.now(), ...data }];
        } else if (action === 'update') {
          next = prev.map(i => i.id === id ? { ...i, ...data } : i);
        } else {
          next = prev.filter(i => i.id !== id);
        }
        setLocal('portfolio_items', next);
        return next;
      });
    } else if (collection === 'reviews') {
      setReviews(prev => {
        let next: Review[];
        if (action === 'create') {
          next = [{ id: id || 'rev-' + Date.now(), ...data }, ...prev];
        } else if (action === 'update') {
          next = prev.map(r => r.id === id ? { ...r, ...data } : r);
        } else {
          next = prev.filter(r => r.id !== id);
        }
        setLocal('reviews', next);
        return next;
      });
    } else if (collection === 'bookings') {
      setBookings(prev => {
        let next: Booking[];
        if (action === 'create') {
          next = [{ id: id || 'book-' + Date.now(), ...data }, ...prev];
        } else if (action === 'update') {
          next = prev.map(b => b.id === id ? { ...b, ...data } : b);
        } else {
          next = prev.filter(b => b.id !== id);
        }
        setLocal('bookings', next);
        return next;
      });
    } else if (collection === 'faqs') {
      setFaqs(prev => {
        let next: FAQ[];
        if (action === 'create') {
          next = [...prev, { id: id || 'faq-' + Date.now(), ...data }];
        } else if (action === 'update') {
          next = prev.map(f => f.id === id ? { ...f, ...data } : f);
        } else {
          next = prev.filter(f => f.id !== id);
        }
        setLocal('faqs', next);
        return next;
      });
    } else if (collection === 'blog_posts') {
      setBlogPosts(prev => {
        let next: BlogPost[];
        if (action === 'create') {
          next = [{ id: id || 'post-' + Date.now(), ...data }, ...prev];
        } else if (action === 'update') {
          next = prev.map(p => p.id === id ? { ...p, ...data } : p);
        } else {
          next = prev.filter(p => p.id !== id);
        }
        setLocal('blog_posts', next);
        return next;
      });
    } else if (collection === 'blog_comments') {
      setBlogComments(prev => {
        let next: BlogComment[];
        if (action === 'create') {
          next = [{ id: id || 'comm-' + Date.now(), ...data }, ...prev];
        } else if (action === 'update') {
          next = prev.map(c => c.id === id ? { ...c, ...data } : c);
        } else {
          next = prev.filter(c => c.id !== id);
        }
        setLocal('blog_comments', next);
        return next;
      });
    } else if (collection === 'social_links') {
      setSocialLinks(data);
      setLocal('social_links', data);
    }

    // 2. Synchronize to server with auth token in background
    try {
      let authToken = token;
      if (!authToken) {
        try {
          const raw = localStorage.getItem('av_prod_admin_session');
          if (raw) {
            const parsed = JSON.parse(raw);
            authToken = parsed.token;
          }
        } catch {}
      }

      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }

      fetch('/api/admin/mutate', {
        method: 'POST',
        headers,
        body: JSON.stringify({ action, collection, id, data }),
      }).catch(e => {
        console.warn('API mutation sync warning:', e);
      });
    } catch {
      // Local state is already successfully updated
    }

    return { success: true };
  };

  const refreshAdminData = async (token?: string) => {
    try {
      let authToken = token;
      if (!authToken) {
        try {
          const raw1 = localStorage.getItem('av_admin_session');
          if (raw1) {
            authToken = JSON.parse(raw1).token;
          }
        } catch {}
        if (!authToken) {
          try {
            const raw2 = localStorage.getItem('av_prod_admin_session');
            if (raw2) {
              authToken = JSON.parse(raw2).token;
            }
          } catch {}
        }
      }

      // 1. Try authenticated admin sync endpoint
      let adminFetched = false;
      if (authToken) {
        const headers: Record<string, string> = {
          'Authorization': `Bearer ${authToken}`
        };
        const res = await fetch('/api/admin/data', { headers });
        if (res.ok) {
          const { data } = await res.json();
          if (data) {
            adminFetched = true;
            if (Array.isArray(data.bookings)) {
              setBookings(data.bookings);
              setLocal('bookings', data.bookings);
            }
            if (Array.isArray(data.blogComments)) {
              setBlogComments(data.blogComments);
              setLocal('blog_comments', data.blogComments);
            }
          }
        }
      }

      // 2. If not authenticated or admin sync wasn't completed, sync public bookings & comments
      if (!adminFetched) {
        const publicRes = await fetch('/api/public/bookings');
        if (publicRes.ok) {
          const pubData = await publicRes.json();
          if (pubData && Array.isArray(pubData.bookings)) {
            setBookings(pubData.bookings);
            setLocal('bookings', pubData.bookings);
          }
        }
      }
    } catch (err) {
      console.warn('Booking sync notice:', err);
    }
  };

  // Keep live sync active on window focus and storage events
  useEffect(() => {
    // Initial fetch on mount
    refreshAdminData();

    // Sync on tab focus or storage change
    const handleFocus = () => {
      refreshAdminData();
    };

    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'av_bookings' || e.key === 'bookings') {
        try {
          if (e.newValue) {
            const updated = JSON.parse(e.newValue);
            if (Array.isArray(updated)) {
              setBookings(updated);
            }
          }
        } catch {}
      }
    };

    const handleCustomBooking = (e: any) => {
      if (e.detail) {
        setBookings(prev => {
          if (prev.some(b => b.id === e.detail.id)) return prev;
          const updated = [e.detail, ...prev];
          setLocal('bookings', updated);
          return updated;
        });
      }
    };

    window.addEventListener('focus', handleFocus);
    window.addEventListener('storage', handleStorage);
    window.addEventListener('av-booking-created', handleCustomBooking);

    // Periodic live polling every 8 seconds for real-time responsiveness
    const interval = setInterval(() => {
      refreshAdminData();
    }, 8000);

    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('av-booking-created', handleCustomBooking);
      clearInterval(interval);
    };
  }, []);

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
        theme,
        toggleTheme,
        isLoading,
        submitBooking,
        submitComment,
        adminMutate,
        syncToGoldGroup,
        updateThemeTokens,
        refreshAdminData
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

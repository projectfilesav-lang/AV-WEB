/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { DataProvider, useData } from './context/DataContext';
import { FloatingNavbar } from './components/FloatingNavbar';
import { Footer } from './components/Footer';
import { LoadingExperience } from './components/LoadingExperience';
import { PortfolioLightbox } from './components/PortfolioLightbox';
import { CookieBanner } from './components/CookieBanner';
import { FloatingBookButton } from './components/FloatingBookButton';
import { QuickSearchModal } from './components/QuickSearchModal';
import { ScrollProgress } from './components/ScrollProgress';

import { HomePage } from './pages/HomePage';
import { AboutPage } from './pages/AboutPage';
import { ServicesPage } from './pages/ServicesPage';
import { PortfolioPage } from './pages/PortfolioPage';
import { ReviewsPage } from './pages/ReviewsPage';
import { ContactPage } from './pages/ContactPage';
import { BookPage } from './pages/BookPage';
import { BlogPage } from './pages/BlogPage';
import { LegalPage } from './pages/LegalPage';
import { NotFoundPage } from './pages/NotFoundPage';

import { AdminLogin } from './admin/AdminLogin';
import { AdminDashboard } from './admin/AdminDashboard';
import { PortfolioItem } from './types';
import { getAdminSession, clearAdminSession, saveAdminSession } from './supabase';

const checkIsBackstageRoute = (): boolean => {
  const p = window.location.pathname.toLowerCase().replace(/\/+$/, '');
  const h = window.location.hash.toLowerCase().replace(/^#\/?/, '').replace(/\/+$/, '');
  const search = new URLSearchParams(window.location.search);

  return (
    p === '/backstage' ||
    p === '/admin' ||
    h === 'backstage' ||
    h === 'admin' ||
    search.has('admin') ||
    search.has('backstage')
  );
};

const AppContent: React.FC = () => {
  const { siteSettings } = useData();

  // Route state
  const [currentPath, setCurrentPath] = useState<string>(() => {
    return checkIsBackstageRoute() ? '/backstage' : '/';
  });

  // Public active section
  const [activeSection, setActiveSection] = useState<string>('home');
  const [preselectedBookingServiceId, setPreselectedBookingServiceId] = useState<string | undefined>(undefined);
  const [portfolioInitialCategory, setPortfolioInitialCategory] = useState<string | undefined>(undefined);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);

  // Lightbox state
  const [activeLightboxItem, setActiveLightboxItem] = useState<PortfolioItem | null>(null);

  // Admin session state
  const [adminUser, setAdminUser] = useState<{ email: string; id: string } | null>(() => {
    const session = getAdminSession();
    return session ? session.user : null;
  });
  const [adminToken, setAdminToken] = useState<string | null>(() => {
    const session = getAdminSession();
    return session ? session.token : null;
  });

  // Sync route with browser URL & popstate, plus secret admin keyboard shortcut (Ctrl+Shift+A) & search shortcut (Cmd+K / /)
  useEffect(() => {
    const handlePopState = () => {
      if (checkIsBackstageRoute()) {
        setCurrentPath('/backstage');
      } else {
        setCurrentPath('/');
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Global Search shortcut: Cmd + K or Ctrl + K
      if ((e.metaKey || e.ctrlKey) && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        setIsSearchOpen(prev => !prev);
        return;
      }

      // Quick slash shortcut: / (only if not typing in an active input)
      if (e.key === '/' && !isSearchOpen) {
        const activeEl = document.activeElement;
        const isTyping = activeEl && (
          activeEl.tagName === 'INPUT' ||
          activeEl.tagName === 'TEXTAREA' ||
          (activeEl as HTMLElement).isContentEditable
        );
        if (!isTyping) {
          e.preventDefault();
          setIsSearchOpen(true);
          return;
        }
      }

      // Discreet secret shortcut: Ctrl + Shift + A (or Cmd + Shift + A on Mac)
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        window.history.pushState(null, '', '/#backstage');
        setCurrentPath('/backstage');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('hashchange', handlePopState);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('hashchange', handlePopState);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isSearchOpen]);

  const navigateToPublic = (section: string = 'home', filterCategory?: string, preselectedServiceId?: string) => {
    if (currentPath === '/backstage') {
      window.history.pushState(null, '', '/');
      setCurrentPath('/');
    }
    if (preselectedServiceId) {
      setPreselectedBookingServiceId(preselectedServiceId);
    }
    if (filterCategory) {
      setPortfolioInitialCategory(filterCategory);
    }
    setActiveSection(section);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToBackstage = () => {
    window.history.pushState(null, '', '/backstage');
    setCurrentPath('/backstage');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAdminLoginSuccess = (user: { email: string; id: string }, token: string) => {
    saveAdminSession(token, user);
    setAdminUser(user);
    setAdminToken(token);
  };

  const handleAdminLogout = () => {
    clearAdminSession();
    setAdminUser(null);
    setAdminToken(null);
    navigateToPublic('home');
  };

  const handleOpenLightbox = (item: PortfolioItem) => {
    setActiveLightboxItem(item);
  };

  const handleSelectServiceForBooking = (serviceId: string) => {
    setPreselectedBookingServiceId(serviceId);
    setActiveSection('book');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // If in backstage
  if (currentPath === '/backstage') {
    if (adminUser && adminToken) {
      return (
        <AdminDashboard
          user={adminUser}
          token={adminToken}
          onLogout={handleAdminLogout}
          onViewPublicSite={() => navigateToPublic('home')}
        />
      );
    }

    return <AdminLogin onLoginSuccess={handleAdminLoginSuccess} />;
  }

  // Public-facing application
  return (
    <div className="min-h-screen bg-[var(--bg-color)] text-[var(--text-body)] flex flex-col relative transition-colors duration-300">
      {/* Scroll Progress Indicator Bar */}
      <ScrollProgress />

      {/* Top Announcement Banner (Single instance on site) */}
      {siteSettings.promoBannerEnabled && siteSettings.promoBannerText && (
        <aside
          id="site-promo-banner"
          className="w-full bg-[#0d0d0c] border-b border-[var(--border-color)] text-[var(--color-gold)] py-2 px-4 text-center text-xs font-mono tracking-wider flex items-center justify-center gap-2 z-40 transition-colors"
          aria-label="Studio Announcement"
        >
          <span>{siteSettings.promoBannerText}</span>
        </aside>
      )}

      {/* Persistent Top Studio Navigation Bar */}
      <FloatingNavbar
        activeSection={activeSection}
        onNavigate={(sec) => navigateToPublic(sec)}
        onOpenSearch={() => setIsSearchOpen(true)}
        hasPromoBanner={Boolean(siteSettings.promoBannerEnabled && siteSettings.promoBannerText)}
      />

      {/* Main Public Body Container with top padding for sticky header */}
      <main className="flex-1 pt-14 sm:pt-16">
        {activeSection === 'home' && (
          <HomePage
            onNavigate={navigateToPublic}
            onOpenLightbox={handleOpenLightbox}
            onSelectService={handleSelectServiceForBooking}
            onOpenSearch={() => setIsSearchOpen(true)}
          />
        )}

        {activeSection === 'about' && (
          <AboutPage
            onNavigate={navigateToPublic}
            onOpenSearch={() => setIsSearchOpen(true)}
          />
        )}

        {activeSection === 'services' && (
          <ServicesPage
            onNavigate={navigateToPublic}
            onOpenSearch={() => setIsSearchOpen(true)}
          />
        )}

        {activeSection === 'portfolio' && (
          <PortfolioPage
            initialCategoryId={portfolioInitialCategory}
            onNavigate={navigateToPublic}
            onOpenLightbox={handleOpenLightbox}
            onOpenSearch={() => setIsSearchOpen(true)}
          />
        )}

        {activeSection === 'reviews' && (
          <ReviewsPage
            onNavigate={navigateToPublic}
            onOpenSearch={() => setIsSearchOpen(true)}
          />
        )}

        {activeSection === 'contact' && (
          <ContactPage
            onNavigate={navigateToPublic}
            onOpenSearch={() => setIsSearchOpen(true)}
          />
        )}

        {activeSection === 'book' && (
          <BookPage
            preselectedServiceId={preselectedBookingServiceId}
            onNavigate={navigateToPublic}
            onOpenSearch={() => setIsSearchOpen(true)}
          />
        )}

        {activeSection === 'blog' && (
          <BlogPage onNavigate={(sec) => navigateToPublic(sec)} />
        )}

        {activeSection === 'privacy' && (
          <LegalPage type="privacy" onNavigate={(sec) => navigateToPublic(sec)} />
        )}

        {activeSection === 'terms' && (
          <LegalPage type="terms" onNavigate={(sec) => navigateToPublic(sec)} />
        )}

        {activeSection === 'cookies' && (
          <LegalPage type="cookies" onNavigate={(sec) => navigateToPublic(sec)} />
        )}

        {activeSection === 'not-found' && (
          <NotFoundPage onNavigateHome={() => navigateToPublic('home')} />
        )}
      </main>

      {/* Instant Search & Jump Palette (⌘K) */}
      <QuickSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onNavigate={navigateToPublic}
        onOpenLightbox={handleOpenLightbox}
      />

      {/* Lightbox Modal */}
      <PortfolioLightbox
        item={activeLightboxItem}
        onClose={() => setActiveLightboxItem(null)}
      />

      {/* Floating Book Button (Controlled by Site Settings) */}
      <FloatingBookButton
        activeSection={activeSection}
        onBook={() => navigateToPublic('book')}
      />

      {/* Cookie Consent Banner */}
      <CookieBanner onNavigateToCookies={() => navigateToPublic('cookies')} />

      {/* Public Footer */}
      <Footer onNavigate={(sec) => navigateToPublic(sec)} />
    </div>
  );
};

export default function App() {
  return (
    <DataProvider>
      <AppContent />
    </DataProvider>
  );
}

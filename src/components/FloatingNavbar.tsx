import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X, Sun, Moon, Search, Film, Calendar, Phone, Mail, ArrowRight } from 'lucide-react';
import { useData } from '../context/DataContext';

interface NavItem {
  name: string;
  id: string;
  isAction?: boolean;
}

interface FloatingNavbarProps {
  activeSection: string;
  onNavigate: (section: string) => void;
  className?: string;
  hasPromoBanner?: boolean;
  onOpenSearch?: () => void;
}

export const FloatingNavbar: React.FC<FloatingNavbarProps> = ({
  activeSection,
  onNavigate,
  className = '',
  hasPromoBanner = false,
  onOpenSearch,
}) => {
  const { theme, toggleTheme, siteSettings } = useData();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  // Primary navigation links in exact order: HOME, ABOUT, SERVICES, PORTFOLIO, REVIEWS, CONTACT
  const navItems: NavItem[] = [
    { name: 'Home', id: 'home' },
    { name: 'About', id: 'about' },
    { name: 'Services', id: 'services' },
    { name: 'Portfolio', id: 'portfolio' },
    { name: 'Reviews', id: 'reviews' },
    { name: 'Contact', id: 'contact' },
  ];

  const handleSelect = (id: string) => {
    onNavigate(id);
    setMobileMenuOpen(false);
  };

  const topOffset = hasPromoBanner && !isScrolled ? 'top-10 sm:top-10' : 'top-0';

  return (
    <>
      <header
        ref={headerRef}
        id="main-navigation-header"
        className={`fixed ${topOffset} left-0 right-0 z-40 transition-all duration-300 ${
          isScrolled
            ? 'bg-[var(--bg-color)]/90 backdrop-blur-md border-b border-[var(--border-color)] shadow-sm py-2.5'
            : 'bg-[var(--bg-color)]/75 backdrop-blur-sm border-b border-[var(--border-color)]/40 py-3.5'
        } ${className}`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          {/* Studio Brand & Logo */}
          <button
            id="nav-brand-logo"
            onClick={() => handleSelect('home')}
            className="flex items-center gap-2.5 group cursor-pointer text-left focus:outline-none focus:ring-1 focus:ring-[var(--color-gold)] rounded py-1 shrink-0"
            aria-label="AV Productions Home"
          >
            <div className="w-8 h-8 rounded-md bg-[var(--color-gold)]/15 border border-[var(--color-gold)]/30 flex items-center justify-center text-[var(--color-gold)] group-hover:scale-105 transition-transform">
              <Film className="w-4 h-4" />
            </div>
            <div>
              <span className="font-heading font-bold tracking-wider text-sm sm:text-base text-[var(--text-heading)] group-hover:text-[var(--color-gold)] transition-colors block leading-none">
                AV PRODUCTIONS
              </span>
              <span className="text-[9px] tracking-[0.25em] text-[var(--color-gold)] uppercase block mt-1 font-semibold">
                FILM & SOUND STUDIO
              </span>
            </div>
          </button>

          {/* Right Actions: Search, Theme Toggle, Book CTA & Hamburger Menu (Only Menu) */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Search Pill Trigger */}
            <button
              id="nav-search-trigger"
              onClick={onOpenSearch}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-[var(--border-color)] bg-[var(--bg-color)] hover:border-[var(--color-gold)]/60 text-xs text-[var(--text-body)]/70 hover:text-[var(--text-heading)] transition-all cursor-pointer shadow-xs"
              title="Search services, works, rates (⌘K)"
              aria-label="Search the website"
            >
              <Search className="w-3.5 h-3.5 text-[var(--color-gold)] shrink-0" />
              <span className="hidden sm:inline text-[11px] font-medium">Search...</span>
              <kbd className="hidden lg:inline-block px-1 rounded bg-black/5 dark:bg-white/10 text-[9px] font-mono text-[var(--text-body)]/60">
                ⌘K
              </kbd>
            </button>

            {/* Theme Toggle Button */}
            <button
              id="nav-theme-toggle"
              onClick={toggleTheme}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border border-[var(--border-color)] bg-[var(--bg-color)] shadow-xs flex items-center justify-center text-[var(--color-gold)] hover:scale-105 hover:border-[var(--color-gold)]/60 transition-all cursor-pointer focus:outline-none"
              aria-label={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-[var(--color-gold)]" />
              ) : (
                <Moon className="w-4 h-4 text-[var(--color-gold)]" />
              )}
            </button>

            {/* Direct Book CTA: BOOK PRODUCTION */}
            <button
              id="nav-book-cta-btn"
              onClick={() => handleSelect('book')}
              className={`inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-sm bg-[var(--color-gold)] text-[#192c45] hover:brightness-105 transition-all text-xs font-semibold tracking-wider uppercase cursor-pointer shadow-xs whitespace-nowrap ${
                activeSection === 'book' ? 'ring-2 ring-[var(--color-gold)] ring-offset-2' : ''
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Book Production</span>
            </button>

            {/* Hamburger Menu Toggle Button (Sole navigation menu) */}
            <button
              id="main-hamburger-menu-btn"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="px-2.5 sm:px-3 h-8 sm:h-9 rounded-md border border-[var(--border-color)] bg-[var(--bg-color)] flex items-center gap-1.5 text-[var(--text-heading)] hover:text-[var(--color-gold)] hover:border-[var(--color-gold)]/60 transition-all cursor-pointer focus:outline-none shadow-xs group"
              aria-label={mobileMenuOpen ? 'Close navigation' : 'Open navigation'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? (
                <X className="w-4 h-4 text-[var(--color-gold)]" />
              ) : (
                <Menu className="w-4 h-4 text-[var(--color-gold)] group-hover:scale-110 transition-transform" />
              )}
              <span className="hidden sm:inline text-xs font-semibold uppercase tracking-wider">
                {mobileMenuOpen ? 'Close' : 'Menu'}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Unified Hamburger Navigation Drawer (Desktop slide-over & Mobile drawer) */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs"
              aria-hidden="true"
            />

            {/* Slide-out Drawer Panel */}
            <motion.div
              initial={{ opacity: 0, x: '100%' }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              id="unified-nav-drawer"
              className="fixed inset-y-0 right-0 z-50 w-full sm:max-w-md bg-[var(--bg-color)] border-l border-[var(--border-color)] shadow-2xl flex flex-col justify-between p-6 sm:p-8 overflow-y-auto"
            >
              <div className="flex flex-col gap-6">
                {/* Drawer Header with Close Button */}
                <div className="flex items-center justify-between pb-4 border-b border-[var(--border-color)]">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded bg-[var(--color-gold)]/15 border border-[var(--color-gold)]/30 flex items-center justify-center text-[var(--color-gold)]">
                      <Film className="w-3.5 h-3.5" />
                    </div>
                    <span className="font-heading font-bold text-sm tracking-wider text-[var(--text-heading)]">
                      AV PRODUCTIONS
                    </span>
                  </div>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2 rounded-md border border-[var(--border-color)] hover:border-[var(--color-gold)] text-[var(--text-heading)] hover:text-[var(--color-gold)] transition-colors cursor-pointer"
                    aria-label="Close navigation"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Quick Search Trigger */}
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    if (onOpenSearch) onOpenSearch();
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-lg border border-[var(--border-color)] bg-black/5 dark:bg-white/5 text-xs text-[var(--text-body)]/70 hover:border-[var(--color-gold)] transition-colors text-left cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <Search className="w-4 h-4 text-[var(--color-gold)]" />
                    <span>Search services, works, rates...</span>
                  </div>
                  <span className="text-[10px] font-mono text-[var(--color-gold)] uppercase font-semibold">FIND</span>
                </button>

                {/* Navigation Links: HOME, ABOUT, SERVICES, PORTFOLIO, REVIEWS, CONTACT */}
                <nav aria-label="Studio sections" className="flex flex-col divide-y divide-[var(--border-color)]/50">
                  {navItems.map((item) => (
                    <button
                      key={item.id}
                      id={`drawer-nav-${item.id}`}
                      onClick={() => handleSelect(item.id)}
                      className={`py-3.5 text-left text-sm font-semibold tracking-wider uppercase flex items-center justify-between transition-colors cursor-pointer ${
                        activeSection === item.id ? 'text-[var(--color-gold)]' : 'text-[var(--text-heading)] hover:text-[var(--color-gold)]'
                      }`}
                    >
                      <span>{item.name}</span>
                      <ArrowRight className="w-4 h-4 text-[var(--color-gold)]" />
                    </button>
                  ))}
                </nav>

                {/* Direct Booking Button: BOOK PRODUCTION */}
                <button
                  id="drawer-book-btn"
                  onClick={() => handleSelect('book')}
                  className="w-full py-3.5 px-4 rounded-sm bg-[var(--color-gold)] text-[#192c45] font-semibold text-xs tracking-wider uppercase flex items-center justify-center gap-2 hover:brightness-105 transition-all shadow-sm cursor-pointer"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Book Production</span>
                </button>
              </div>

              {/* Bottom Direct Contact Details */}
              <div className="pt-6 mt-6 border-t border-[var(--border-color)] flex flex-col gap-2.5 text-xs text-[var(--text-body)]/80">
                <span className="text-[10px] uppercase tracking-wider text-[var(--color-gold)] font-semibold">
                  Direct Studio Contacts
                </span>
                <a
                  href={`mailto:${siteSettings.contactEmail || 'projectfilesav@gmail.com'}`}
                  className="flex items-center gap-2 hover:text-[var(--color-gold)] transition-colors py-1"
                >
                  <Mail className="w-3.5 h-3.5 text-[var(--color-gold)]" />
                  <span>{siteSettings.contactEmail || 'projectfilesav@gmail.com'}</span>
                </a>
                <a
                  href={`tel:${siteSettings.contactPhone || '+442079460912'}`}
                  className="flex items-center gap-2 hover:text-[var(--color-gold)] transition-colors py-1"
                >
                  <Phone className="w-3.5 h-3.5 text-[var(--color-gold)]" />
                  <span>{siteSettings.contactPhone || '+44 (0) 20 7946 0912'}</span>
                </a>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

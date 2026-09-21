import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { Sun, Moon, Film, Search, Calendar } from 'lucide-react';

interface HeaderProps {
  activeSection: string;
  onNavigate: (section: string) => void;
  onOpenSearch?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ activeSection, onNavigate, onOpenSearch }) => {
  const { siteSettings, theme, toggleTheme } = useData();
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close nav on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Lock body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Consistent labels across navigation, hero, and floating button
  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'about', label: 'About' },
    { id: 'services', label: 'Services' },
    { id: 'portfolio', label: 'Portfolio' },
    { id: 'reviews', label: 'Reviews' },
    { id: 'contact', label: 'Contact' },
    { id: 'book', label: 'Book Production', isSpecial: true },
  ];

  const handleItemClick = (id: string) => {
    setIsOpen(false);
    onNavigate(id);
  };

  return (
    <>
      {/* Sticky Top Header (Note: Single promo banner is located at root in App.tsx) */}
      <header
        id="main-header"
        className={`sticky top-0 z-40 w-full transition-all duration-300 ${
          isScrolled
            ? 'bg-[var(--bg-color)]/95 backdrop-blur-md shadow-md border-b border-[var(--border-color)] py-3.5'
            : 'bg-transparent py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8 flex items-center justify-between gap-1.5 sm:gap-4">
          {/* Logo / Brand */}
          <button
            id="brand-logo-btn"
            onClick={() => onNavigate('home')}
            className="flex items-center gap-1.5 sm:gap-2.5 group cursor-pointer text-left focus:outline-none focus:ring-1 focus:ring-[var(--color-gold)] rounded py-1 shrink min-w-0"
            aria-label="AV Productions Home"
          >
            <div className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center text-[var(--color-gold)] group-hover:scale-105 transition-transform shrink-0">
              <Film className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="font-heading font-semibold tracking-tight sm:tracking-wider text-xs sm:text-base text-[var(--text-heading)] group-hover:text-[var(--color-gold)] transition-colors block leading-none truncate">
                AV PRODUCTIONS
              </span>
              <span className="hidden sm:block text-[9px] tracking-[0.25em] text-[var(--color-gold)] uppercase mt-1 font-semibold">
                STUDIO
              </span>
            </div>
          </button>

          {/* Desktop Navigation Links: HOME, ABOUT, SERVICES, PORTFOLIO, REVIEWS, CONTACT */}
          <nav className="hidden md:flex items-center gap-6 lg:gap-8">
            <button
              onClick={() => onNavigate('home')}
              className={`text-xs font-semibold tracking-wider uppercase transition-colors cursor-pointer ${
                activeSection === 'home' ? 'text-[var(--color-gold)] font-bold' : 'text-[var(--text-heading)]/75 hover:text-[var(--color-gold)]'
              }`}
            >
              Home
            </button>
            <button
              onClick={() => onNavigate('about')}
              className={`text-xs font-semibold tracking-wider uppercase transition-colors cursor-pointer ${
                activeSection === 'about' ? 'text-[var(--color-gold)] font-bold' : 'text-[var(--text-heading)]/75 hover:text-[var(--color-gold)]'
              }`}
            >
              About
            </button>
            <button
              onClick={() => onNavigate('services')}
              className={`text-xs font-semibold tracking-wider uppercase transition-colors cursor-pointer ${
                activeSection === 'services' ? 'text-[var(--color-gold)] font-bold' : 'text-[var(--text-heading)]/75 hover:text-[var(--color-gold)]'
              }`}
            >
              Services
            </button>
            <button
              onClick={() => onNavigate('portfolio')}
              className={`text-xs font-semibold tracking-wider uppercase transition-colors cursor-pointer ${
                activeSection === 'portfolio' ? 'text-[var(--color-gold)] font-bold' : 'text-[var(--text-heading)]/75 hover:text-[var(--color-gold)]'
              }`}
            >
              Portfolio
            </button>
            <button
              onClick={() => onNavigate('reviews')}
              className={`text-xs font-semibold tracking-wider uppercase transition-colors cursor-pointer ${
                activeSection === 'reviews' ? 'text-[var(--color-gold)] font-bold' : 'text-[var(--text-heading)]/75 hover:text-[var(--color-gold)]'
              }`}
            >
              Reviews
            </button>
            <button
              onClick={() => onNavigate('contact')}
              className={`text-xs font-semibold tracking-wider uppercase transition-colors cursor-pointer ${
                activeSection === 'contact' ? 'text-[var(--color-gold)] font-bold' : 'text-[var(--text-heading)]/75 hover:text-[var(--color-gold)]'
              }`}
            >
              Contact
            </button>
          </nav>

          {/* Right Controls: Search, Theme Toggle, Book CTA & Hamburger Menu */}
          <div className="flex items-center gap-1 sm:gap-2.5 shrink-0">
            {/* Search Trigger */}
            {onOpenSearch && (
              <button
                id="header-search-btn"
                onClick={onOpenSearch}
                className="w-8 h-8 sm:w-auto sm:px-3 sm:py-1.5 rounded-full border border-[var(--border-color)] bg-[var(--bg-color)] text-xs text-[var(--text-body)]/70 hover:text-[var(--color-gold)] hover:border-[var(--color-gold)]/60 transition-all cursor-pointer shadow-xs flex items-center justify-center sm:gap-2 shrink-0"
                title="Search (⌘K)"
                aria-label="Search"
              >
                <Search className="w-3.5 h-3.5 text-[var(--color-gold)] shrink-0" />
                <span className="hidden sm:inline text-[11px] font-medium">Search...</span>
              </button>
            )}

            {/* Theme Toggle Button */}
            <button
              id="theme-toggle-btn"
              onClick={toggleTheme}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border border-[var(--border-color)] bg-[var(--bg-color)] shadow-xs flex items-center justify-center text-[var(--color-gold)] hover:scale-105 hover:border-[var(--color-gold)]/60 transition-colors cursor-pointer focus:outline-none shrink-0"
              aria-label={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
            >
              {theme === 'dark' ? (
                <Sun className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[var(--color-gold)]" />
              ) : (
                <Moon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[var(--color-gold)]" />
              )}
            </button>

            {/* Book Action: Compact on mobile, full on desktop */}
            <button
              id="header-desktop-book-btn"
              onClick={() => onNavigate('book')}
              className="inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-4 py-1.5 sm:py-2 text-xs font-sans font-semibold tracking-wider uppercase bg-[var(--color-gold)] text-[#192c45] hover:brightness-105 transition-all rounded-sm cursor-pointer shadow-xs whitespace-nowrap shrink-0"
              title="Book Production"
              aria-label="Book Production"
            >
              <Calendar className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline">Book Production</span>
              <span className="sm:hidden text-[11px] font-bold">Book</span>
            </button>

            {/* Mobile Hamburger Icon (hidden on desktop) */}
            <button
              id="main-nav-toggle-btn"
              onClick={() => setIsOpen(!isOpen)}
              aria-expanded={isOpen}
              aria-label={isOpen ? 'Close navigation menu' : 'Open navigation menu'}
              className="w-8 h-8 sm:w-10 sm:h-10 flex flex-col items-center justify-center gap-[4px] sm:gap-[5px] rounded-md border border-[var(--border-color)] bg-[var(--bg-color)] text-[var(--text-heading)] hover:text-[var(--color-gold)] hover:border-[var(--color-gold)]/60 transition-colors cursor-pointer focus:outline-none md:hidden shrink-0"
            >
              <span
                className={`w-5 h-[2px] bg-current rounded-full transition-all duration-300 origin-center ${
                  isOpen ? 'translate-y-[7px] rotate-45 bg-[var(--color-gold)]' : ''
                }`}
              />
              <span
                className={`w-5 h-[2px] bg-current rounded-full transition-all duration-200 ${
                  isOpen ? 'opacity-0 scale-x-0' : 'opacity-100'
                }`}
              />
              <span
                className={`w-5 h-[2px] bg-current rounded-full transition-all duration-300 origin-center ${
                  isOpen ? '-translate-y-[7px] -rotate-45 bg-[var(--color-gold)]' : ''
                }`}
              />
            </button>
          </div>
        </div>
      </header>

      {/* Navigation Menu Panel (Clean fade/slide reveal with staggered items) */}
      {isOpen && (
        <div
          id="nav-menu-modal"
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-[#080808]/96 backdrop-blur-xl flex flex-col justify-between p-6 sm:p-12 transition-opacity duration-300 animate-in fade-in"
        >
          {/* Header inside open menu */}
          <div className="flex items-center justify-between max-w-5xl w-full mx-auto">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-sm border border-[var(--color-gold)] flex items-center justify-center bg-black">
                <Film className="w-4 h-4 text-[var(--color-gold)]" />
              </div>
              <span className="font-heading tracking-widest text-xs sm:text-sm text-[var(--color-gold)] font-semibold uppercase">
                AV PRODUCTIONS
              </span>
            </div>

            {/* Close trigger: morphing X button */}
            <button
              id="close-menu-btn"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2 py-2 px-3 text-xs font-mono tracking-widest uppercase text-white/70 hover:text-[var(--color-gold)] transition-colors cursor-pointer focus:outline-none focus:ring-1 focus:ring-[var(--color-gold)]"
              aria-label="Close menu"
            >
              <span>CLOSE</span>
              <span className="text-base leading-none text-[var(--color-gold)]">✕</span>
            </button>
          </div>

          {/* Navigation Items with Staggered Fade-in */}
          <nav className="max-w-xl mx-auto w-full py-10 flex flex-col items-center justify-center">
            <ul className="flex flex-col gap-4 sm:gap-5 w-full text-center">
              {navItems.map((item, index) => {
                const isActive = activeSection === item.id;
                return (
                  <li
                    key={item.id}
                    className="w-full animate-nav-item"
                    style={{
                      animationDelay: `${index * 45}ms`,
                      animationFillMode: 'both',
                    }}
                  >
                    {item.isSpecial ? (
                      /* Distinct primary action button for Book Production */
                      <button
                        id={`nav-link-${item.id}`}
                        onClick={() => handleItemClick(item.id)}
                        className="w-full mt-3 py-3.5 px-6 bg-[var(--color-gold)] text-[#192c45] hover:brightness-105 font-semibold text-sm sm:text-base tracking-wide rounded-sm transition-all duration-200 cursor-pointer shadow-xs active:scale-[0.99]"
                      >
                        {item.label}
                      </button>
                    ) : (
                      <button
                        id={`nav-link-${item.id}`}
                        onClick={() => handleItemClick(item.id)}
                        className={`w-full py-2 font-bold text-2xl tracking-tight transition-colors duration-200 cursor-pointer ${
                          isActive
                            ? 'text-[var(--color-gold)]'
                            : 'text-white/85 hover:text-[var(--color-gold)]'
                        }`}
                      >
                        {item.label}
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Footer inside menu */}
          <div className="max-w-5xl w-full mx-auto flex flex-col sm:flex-row items-center justify-between border-t border-[var(--border-color)] pt-6 text-xs text-white/60 gap-3">
            <span className="text-[var(--color-gold)]">
              {siteSettings.contactEmail}
            </span>
            <span className="tracking-wider uppercase">
              {siteSettings.copyrightText}
            </span>
          </div>
        </div>
      )}
    </>
  );
};

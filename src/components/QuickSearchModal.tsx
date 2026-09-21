import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  X,
  ArrowRight,
  Film,
  Headphones,
  Calendar,
  Phone,
  Mail,
  Star,
  Layers,
  Sparkles,
  ExternalLink,
  ChevronRight,
  FileText
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { PortfolioItem, Service } from '../types';

interface SearchResultItem {
  id: string;
  type: 'page' | 'service' | 'portfolio' | 'action';
  title: string;
  subtitle: string;
  badge: string;
  icon: React.ReactNode;
  action: () => void;
  keywords?: string;
}

interface QuickSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (section: string, filterCategory?: string, serviceId?: string) => void;
  onOpenLightbox?: (item: PortfolioItem) => void;
}

export const QuickSearchModal: React.FC<QuickSearchModalProps> = ({
  isOpen,
  onClose,
  onNavigate,
  onOpenLightbox,
}) => {
  const { services, portfolioItems, categories, siteSettings } = useData();
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'services' | 'portfolio' | 'pages'>('all');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  // Build searchable index
  const allResults = useMemo<SearchResultItem[]>(() => {
    const results: SearchResultItem[] = [];

    // 1. Primary Pages & Sections (HOME, ABOUT, SERVICES, PORTFOLIO, REVIEWS, CONTACT, BOOK PRODUCTION)
    results.push(
      {
        id: 'page-home',
        type: 'page',
        title: 'Home',
        subtitle: 'Studio overview, featured showreel, ethos & recent commissions',
        badge: 'Main Page',
        icon: <Film className="w-4 h-4 text-[var(--color-gold)]" />,
        action: () => {
          onNavigate('home');
          onClose();
        },
        keywords: 'home start landing reel showreel intro studio'
      },
      {
        id: 'page-about',
        type: 'page',
        title: 'About AV Productions',
        subtitle: 'Studio ethos, directorial team, technical philosophy & heritage',
        badge: 'About Studio',
        icon: <Sparkles className="w-4 h-4 text-[var(--color-gold)]" />,
        action: () => {
          onNavigate('about');
          onClose();
        },
        keywords: 'about ethos history bio director vision team studio background'
      },
      {
        id: 'page-services',
        type: 'page',
        title: 'Services & Capabilities',
        subtitle: 'Direction, commercial video, audio mastering, color grading',
        badge: 'Capabilities',
        icon: <Layers className="w-4 h-4 text-[var(--color-gold)]" />,
        action: () => {
          onNavigate('services');
          onClose();
        },
        keywords: 'services capabilities production rates packages pricing camera audio video post'
      },
      {
        id: 'page-portfolio',
        type: 'page',
        title: 'Portfolio & Archive',
        subtitle: 'Selected films, commercials, music audio masters, and photography',
        badge: 'Work Archive',
        icon: <Film className="w-4 h-4 text-[var(--color-gold)]" />,
        action: () => {
          onNavigate('portfolio');
          onClose();
        },
        keywords: 'portfolio works projects archive videos commercials audio photography'
      },
      {
        id: 'page-reviews',
        type: 'page',
        title: 'Client Reviews & Accolades',
        subtitle: 'Verified testimonials from commercial brands, directors & artists',
        badge: '5.0 Stars',
        icon: <Star className="w-4 h-4 text-[var(--color-gold)]" />,
        action: () => {
          onNavigate('reviews');
          onClose();
        },
        keywords: 'reviews ratings testimonials feedback google reviews recommendations clients'
      },
      {
        id: 'page-contact',
        type: 'page',
        title: 'Contact Studio Directly',
        subtitle: `${siteSettings.contactEmail || 'projectfilesav@gmail.com'} • ${siteSettings.contactPhone || '+44 (0) 20 7946 0912'}`,
        badge: 'Contact',
        icon: <Mail className="w-4 h-4 text-[var(--color-gold)]" />,
        action: () => {
          onNavigate('contact');
          onClose();
        },
        keywords: 'contact email phone telephone address location talk reach inquiry message'
      },
      {
        id: 'page-book',
        type: 'action',
        title: 'Book Production / Request Quote',
        subtitle: 'Reserve studio dates, select packages, and request production quotes',
        badge: 'Booking & Rates',
        icon: <Calendar className="w-4 h-4 text-[var(--color-gold)]" />,
        action: () => {
          onNavigate('book');
          onClose();
        },
        keywords: 'book booking quote price rate reserve date contact consultation cost estimate'
      }
    );

    // 2. Direct Services
    services.forEach((s) => {
      const cat = categories.find((c) => c.id === s.categoryId);
      results.push({
        id: `service-${s.id}`,
        type: 'service',
        title: s.title,
        subtitle: s.shortDescription || s.detailedDescription || 'Bespoke production service',
        badge: cat?.name || 'Service',
        icon: s.title.toLowerCase().includes('audio') || s.title.toLowerCase().includes('sound')
          ? <Headphones className="w-4 h-4 text-[var(--color-gold)]" />
          : <Film className="w-4 h-4 text-[var(--color-gold)]" />,
        action: () => {
          onNavigate('services', undefined, s.id);
          onClose();
        },
        keywords: `${s.title} ${s.shortDescription} ${s.detailedDescription} ${cat?.name || ''} rate package price`
      });
    });

    // 3. Portfolio Projects & Reference Proofs
    portfolioItems.forEach((p) => {
      const cat = categories.find((c) => c.id === p.categoryId);
      const isAudio = p.mediaType === 'audio' || p.title.toLowerCase().includes('audio');
      results.push({
        id: `portfolio-${p.id}`,
        type: 'portfolio',
        title: p.title,
        subtitle: p.description || `${cat?.name || 'Work'} • ${p.mediaType.toUpperCase()}`,
        badge: isAudio ? 'Audio Master' : (cat?.name || 'Project'),
        icon: isAudio
          ? <Headphones className="w-4 h-4 text-[var(--color-gold)]" />
          : <Film className="w-4 h-4 text-[var(--color-gold)]" />,
        action: () => {
          if (onOpenLightbox) {
            onOpenLightbox(p);
          } else {
            onNavigate('portfolio', p.categoryId);
          }
          onClose();
        },
        keywords: `${p.title} ${p.description || ''} ${cat?.name || ''} ${p.mediaType} work reel reference proof`
      });
    });

    return results;
  }, [services, portfolioItems, categories, siteSettings, onNavigate, onOpenLightbox, onClose]);

  // Filtered results according to query and selected category tab
  const filteredResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    return allResults.filter((item) => {
      // Tab filter
      if (activeFilter === 'services' && item.type !== 'service') return false;
      if (activeFilter === 'portfolio' && item.type !== 'portfolio') return false;
      if (activeFilter === 'pages' && item.type !== 'page' && item.type !== 'action') return false;

      // Query filter
      if (!q) return true;
      const haystack = `${item.title} ${item.subtitle} ${item.badge} ${item.keywords || ''}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [allResults, query, activeFilter]);

  // Reset selected index when results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [filteredResults]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1 < filteredResults.length ? prev + 1 : 0));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 >= 0 ? prev - 1 : filteredResults.length - 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredResults[selectedIndex]) {
          filteredResults[selectedIndex].action();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredResults, selectedIndex, onClose]);

  // Scroll active item into view
  useEffect(() => {
    if (listRef.current) {
      const activeEl = listRef.current.children[selectedIndex] as HTMLElement;
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    }
  }, [selectedIndex]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div
        id="quick-search-modal"
        className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/75 backdrop-blur-md transition-opacity"
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-label="Quick Search and Wayfinding"
      >
        <motion.div
          initial={{ opacity: 0, y: -16, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -16, scale: 0.98 }}
          transition={{ duration: 0.16, ease: 'easeOut' }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-2xl bg-[var(--bg-color)] border border-[var(--border-color)] rounded-xl shadow-[0_24px_64px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col max-h-[80vh]"
        >
          {/* Top Search Input Bar */}
          <div className="p-4 sm:p-5 border-b border-[var(--border-color)] flex items-center gap-3 bg-[var(--bg-color)]">
            <Search className="w-5 h-5 text-[var(--color-gold)] shrink-0" />
            <input
              ref={inputRef}
              id="global-search-input"
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="What are you looking for? (e.g. Commercials, Audio mastering, Rates, Reviews...)"
              className="w-full bg-transparent text-sm sm:text-base text-[var(--text-heading)] placeholder:text-[var(--text-body)]/50 focus:outline-none"
              autoComplete="off"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="text-[var(--text-body)]/60 hover:text-[var(--text-heading)] p-1 text-xs cursor-pointer"
                aria-label="Clear search input"
              >
                Clear
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-md hover:bg-black/5 dark:hover:bg-white/5 text-[var(--text-body)]/70 hover:text-[var(--text-heading)] transition-colors cursor-pointer"
              aria-label="Close search"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Filter Tabs */}
          <div className="px-4 py-2.5 bg-black/[0.02] dark:bg-white/[0.02] border-b border-[var(--border-color)] flex items-center gap-2 overflow-x-auto text-xs">
            <span className="text-[10px] font-semibold text-[var(--text-body)]/50 uppercase tracking-wider mr-1">
              Filter:
            </span>
            {[
              { id: 'all', label: 'All Results' },
              { id: 'services', label: 'Services & Rates' },
              { id: 'portfolio', label: 'Portfolio Works' },
              { id: 'pages', label: 'Pages & Actions' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveFilter(tab.id as any)}
                className={`px-2.5 py-1 rounded-full font-medium transition-colors cursor-pointer whitespace-nowrap ${
                  activeFilter === tab.id
                    ? 'bg-[var(--color-gold)] text-[#192c45] font-semibold'
                    : 'text-[var(--text-body)]/75 hover:text-[var(--text-heading)] hover:bg-black/5 dark:hover:bg-white/5'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Results List */}
          <div
            ref={listRef}
            id="search-results-list"
            className="flex-1 overflow-y-auto p-2 sm:p-3 divide-y divide-[var(--border-color)]/50"
          >
            {filteredResults.length === 0 ? (
              <div className="py-12 px-6 text-center">
                <Search className="w-8 h-8 text-[var(--text-body)]/30 mx-auto mb-3" />
                <p className="text-sm font-semibold text-[var(--text-heading)] mb-1">
                  No matching results found for "{query}"
                </p>
                <p className="text-xs text-[var(--text-body)]/70 mb-4 max-w-sm mx-auto">
                  Try searching for general terms like "rates", "commercial", "audio", "gear", or "contact".
                </p>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <button
                    onClick={() => {
                      onNavigate('services');
                      onClose();
                    }}
                    className="px-3 py-1.5 text-xs bg-[var(--color-gold)]/10 text-[var(--color-gold)] rounded hover:bg-[var(--color-gold)]/20 transition-colors cursor-pointer"
                  >
                    View All Services
                  </button>
                  <button
                    onClick={() => {
                      onNavigate('portfolio');
                      onClose();
                    }}
                    className="px-3 py-1.5 text-xs bg-[var(--color-gold)]/10 text-[var(--color-gold)] rounded hover:bg-[var(--color-gold)]/20 transition-colors cursor-pointer"
                  >
                    Browse Portfolio
                  </button>
                  <button
                    onClick={() => {
                      onNavigate('contact');
                      onClose();
                    }}
                    className="px-3 py-1.5 text-xs bg-[var(--color-gold)]/10 text-[var(--color-gold)] rounded hover:bg-[var(--color-gold)]/20 transition-colors cursor-pointer"
                  >
                    Contact Studio
                  </button>
                </div>
              </div>
            ) : (
              filteredResults.map((item, idx) => {
                const isSelected = idx === selectedIndex;
                return (
                  <div
                    key={item.id}
                    id={`search-item-${item.id}`}
                    onClick={item.action}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`p-3 rounded-lg flex items-center justify-between gap-4 cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-[var(--color-gold)]/15 border-l-2 border-[var(--color-gold)] pl-3.5'
                        : 'hover:bg-black/5 dark:hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-md bg-[var(--color-gold)]/10 flex items-center justify-center shrink-0 mt-0.5">
                        {item.icon}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-sm font-semibold text-[var(--text-heading)] truncate">
                            {item.title}
                          </h4>
                          <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-black/5 dark:bg-white/10 text-[var(--color-gold)] font-mono shrink-0">
                            {item.badge}
                          </span>
                        </div>
                        <p className="text-xs text-[var(--text-body)]/75 truncate mt-0.5">
                          {item.subtitle}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0 text-xs font-semibold text-[var(--color-gold)]">
                      <span className="hidden sm:inline text-[11px] uppercase tracking-wider">
                        {item.type === 'action' ? 'Proceed' : 'Jump to'}
                      </span>
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Modal Footer with Keyboard Shortcuts */}
          <div className="p-3 bg-black/[0.03] dark:bg-white/[0.03] border-t border-[var(--border-color)] flex items-center justify-between text-[11px] text-[var(--text-body)]/60">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded bg-black/10 dark:bg-white/10 text-[10px] font-mono">↑</kbd>
                <kbd className="px-1.5 py-0.5 rounded bg-black/10 dark:bg-white/10 text-[10px] font-mono">↓</kbd>
                <span className="ml-0.5">navigate</span>
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded bg-black/10 dark:bg-white/10 text-[10px] font-mono">↵</kbd>
                <span className="ml-0.5">select</span>
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded bg-black/10 dark:bg-white/10 text-[10px] font-mono">esc</kbd>
                <span className="ml-0.5">close</span>
              </span>
            </div>
            <span className="font-mono text-[10px]">
              {filteredResults.length} result{filteredResults.length !== 1 ? 's' : ''}
            </span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

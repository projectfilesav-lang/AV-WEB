import React from 'react';
import {
  Film,
  Headphones,
  FileText,
  Star,
  Calendar,
  Search,
  ArrowRight,
  Compass
} from 'lucide-react';

interface HomeQuickFinderProps {
  onNavigate: (section: string, filterCategory?: string) => void;
  onOpenSearch: () => void;
}

export const HomeQuickFinder: React.FC<HomeQuickFinderProps> = ({
  onNavigate,
  onOpenSearch,
}) => {
  const pathways = [
    {
      id: 'pathway-video',
      title: 'Commercials & Films',
      category: 'cat-commercial',
      section: 'portfolio',
      description: 'Explore full commercial campaigns, automotive specs, and cinematic reels.',
      icon: <Film className="w-5 h-5 text-[var(--color-gold)]" />,
      cta: 'Watch Works',
      badge: 'Video Archive'
    },
    {
      id: 'pathway-audio',
      title: 'Audio Mixing & Mastering',
      category: 'cat-sound',
      section: 'portfolio',
      description: 'Play high-resolution acoustic references, stereo imaging, and limiter proofs.',
      icon: <Headphones className="w-5 h-5 text-[var(--color-gold)]" />,
      cta: 'Listen Proofs',
      badge: 'Interactive Audio'
    },
    {
      id: 'pathway-services',
      title: 'Production Rates & Scopes',
      section: 'services',
      description: 'Review full-day direction rates, camera packages, and post deliverables.',
      icon: <FileText className="w-5 h-5 text-[var(--color-gold)]" />,
      cta: 'View Services',
      badge: 'Full Capabilities'
    },
    {
      id: 'pathway-reviews',
      title: 'Client Accolades & Reviews',
      section: 'reviews',
      description: 'Read verified 5.0-star testimonials from executive producers and artists.',
      icon: <Star className="w-5 h-5 text-[var(--color-gold)]" />,
      cta: 'Read Reviews',
      badge: '5.0 Verified'
    },
    {
      id: 'pathway-book',
      title: 'Check Dates & Book Studio',
      section: 'book',
      description: 'Lock in production dates, request bespoke quotes, or book a consultation.',
      icon: <Calendar className="w-5 h-5 text-[var(--color-gold)]" />,
      cta: 'Reserve Date',
      badge: 'Direct Booking'
    },
  ];

  return (
    <section
      id="quick-finder-directory"
      className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12"
      aria-label="Direct Pathways Directory"
    >
      {/* Floating Card with all-around deep dark shadow highlight */}
      <div className="relative rounded-2xl bg-[var(--card-bg)] border border-[var(--border-color)] p-6 sm:p-8 sm:pb-9 transition-all duration-300 shadow-[0_24px_50px_-12px_rgba(15,23,42,0.22),0_0_0_1px_rgba(15,23,42,0.06),0_12px_24px_-8px_rgba(15,23,42,0.12)] dark:shadow-[0_28px_70px_-12px_rgba(0,0,0,0.92),0_0_0_1px_rgba(249,147,31,0.2),0_0_40px_-5px_rgba(0,0,0,0.95)]">
        {/* Subtle Ambient Radial Highlight on Dark Mode */}
        <div
          className="absolute -inset-px rounded-2xl pointer-events-none opacity-40 dark:opacity-100 dark:shadow-[inset_0_1px_1px_rgba(249,147,31,0.25)]"
          aria-hidden="true"
        />

        {/* Header with Title and Search Bar */}
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 mb-6 border-b border-[var(--border-color)]">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <Compass className="w-4 h-4 text-[var(--color-gold)]" />
              <span className="text-xs font-semibold tracking-[0.2em] text-[var(--color-gold)] uppercase">
                Direct Pathways
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-[var(--text-heading)] tracking-tight">
              What are you looking for today?
            </h2>
            <p className="text-xs sm:text-sm text-[var(--text-body)]/80 mt-1 font-normal">
              Direct access to our most requested reels, audio master proofs, rates, and bookings.
            </p>
          </div>

          {/* Instant Search Bar Trigger */}
          <button
            id="home-quick-search-trigger"
            onClick={onOpenSearch}
            className="w-full md:w-80 flex items-center justify-between px-4 py-2.5 rounded-lg border border-[var(--border-color)] bg-[var(--bg-color)] hover:border-[var(--color-gold)] text-left transition-all cursor-pointer shadow-xs group"
            aria-label="Open global search"
          >
            <div className="flex items-center gap-2.5 text-xs text-[var(--text-body)]/75 group-hover:text-[var(--text-heading)]">
              <Search className="w-4 h-4 text-[var(--color-gold)] shrink-0" />
              <span className="truncate">Search services, rates, gear, work...</span>
            </div>
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 rounded bg-black/5 dark:bg-white/10 text-[10px] font-mono text-[var(--text-body)]/60">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* 5 Pathways Grid */}
        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4">
          {pathways.map((path) => (
            <button
              key={path.id}
              id={`quick-card-${path.id}`}
              onClick={() => onNavigate(path.section, path.category)}
              className="flex flex-col justify-between p-4 rounded-xl bg-[var(--bg-color)] border border-[var(--border-color)] hover:border-[var(--color-gold)] hover:-translate-y-1 hover:shadow-md transition-all duration-200 text-left group cursor-pointer"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-[var(--color-gold)]/15 border border-[var(--color-gold)]/30 flex items-center justify-center text-[var(--color-gold)] group-hover:scale-105 transition-transform">
                    {path.icon}
                  </div>
                  <span className="text-[9px] uppercase tracking-wider font-semibold text-[var(--color-gold)] px-2 py-0.5 rounded-full bg-[var(--color-gold)]/10">
                    {path.badge}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-[var(--text-heading)] group-hover:text-[var(--color-gold)] transition-colors mb-1.5 leading-snug">
                  {path.title}
                </h3>
                <p className="text-xs text-[var(--text-body)]/80 leading-relaxed font-normal">
                  {path.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-[var(--border-color)]/60 flex items-center justify-between text-xs font-semibold text-[var(--color-gold)]">
                <span>{path.cta}</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

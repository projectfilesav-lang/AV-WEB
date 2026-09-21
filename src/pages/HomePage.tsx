import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { Play, ArrowDown, ArrowUpRight, Volume2, VolumeX, Maximize2, Sparkles } from 'lucide-react';
import { PortfolioItem } from '../types';
import { PortfolioLightbox } from '../components/PortfolioLightbox';
import { HomeQuickFinder } from '../components/HomeQuickFinder';
import { LazyImage } from '../components/LazyImage';

interface HomePageProps {
  onNavigate: (section: string, filterCategory?: string, preselectedServiceId?: string) => void;
  onOpenLightbox?: (item: PortfolioItem) => void;
  onSelectService?: (serviceId: string) => void;
  onOpenSearch?: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate, onOpenLightbox, onSelectService, onOpenSearch }) => {
  const { siteSettings, services, portfolioItems, categories, reviews } = useData();
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0);
  const [activeLightboxItem, setActiveLightboxItem] = useState<PortfolioItem | null>(null);
  const [heroVideoPlaying, setHeroVideoPlaying] = useState(false);

  // Live reviews only for testimonial section
  const liveReviews = reviews.filter(r => r.status === 'Live');

  // Automatic subtle rotation for testimonials
  useEffect(() => {
    if (liveReviews.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentReviewIndex(prev => (prev + 1) % liveReviews.length);
    }, 7000);
    return () => clearInterval(interval);
  }, [liveReviews.length]);

  // Featured pieces - Lead feature + secondary works
  const featuredItems = portfolioItems.filter(i => i.featured).length >= 3
    ? portfolioItems.filter(i => i.featured)
    : portfolioItems;

  const leadItem = featuredItems[0];
  const secondaryItems = featuredItems.slice(1, 4);

  // Teased disciplines
  const teasedServices = services.slice(0, 4);

  return (
    <div className="w-full">
      {/* 1. CINEMATIC HERO */}
      <section
        id="hero"
        className="relative min-h-[76vh] flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 pt-14 sm:pt-18 pb-16 text-center"
      >
        {/* Clean Hero Content */}
        <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center">
          <h1
            id="hero-main-title"
            className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-[var(--text-heading)] leading-[1.08] mb-6 max-w-4xl"
          >
            {siteSettings.heroTitle || 'Every Frame, Directed With Intent.'}
          </h1>

          <p
            id="hero-tagline"
            className="text-base sm:text-lg md:text-xl text-[var(--text-body)]/85 max-w-2xl font-normal leading-relaxed mb-10"
          >
            {siteSettings.heroTagline || 'Cinematography, visual direction, and narrative filmmaking for commercial campaigns, documentaries, and artist commissions.'}
          </p>

          {/* Action Row */}
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-5">
            <button
              id="hero-book-btn"
              onClick={() => onNavigate('book')}
              className="w-full sm:w-auto px-8 py-3.5 bg-[var(--color-gold)] text-[#192c45] font-semibold text-xs sm:text-sm tracking-wider uppercase rounded-sm hover:brightness-105 active:scale-[0.99] transition-all cursor-pointer shadow-xs"
            >
              Book Production
            </button>

            {leadItem && (
              <button
                id="hero-showreel-btn"
                onClick={() => onOpenLightbox ? onOpenLightbox(leadItem) : setActiveLightboxItem(leadItem)}
                className="w-full sm:w-auto px-7 py-3.5 border border-[var(--border-color)] hover:border-[var(--color-gold)] text-[var(--text-heading)] hover:text-[var(--color-gold)] text-xs sm:text-sm font-medium tracking-wider uppercase rounded-sm transition-all flex items-center justify-center gap-2 cursor-pointer group"
              >
                <Play className="w-3.5 h-3.5 text-[var(--color-gold)] fill-current group-hover:scale-105 transition-transform" />
                <span>Watch Reel</span>
              </button>
            )}
          </div>
        </div>
      </section>

      {/* 2. DIRECT PATHWAYS & QUICK FINDER - Instant Wayfinding */}
      <HomeQuickFinder
        onNavigate={onNavigate}
        onOpenSearch={onOpenSearch || (() => {})}
      />

      {/* 3. FEATURED REEL SHOWCASE - Full-width Cinematic Viewport */}
      {leadItem && (
        <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 sm:pb-28">
          <div className="relative group overflow-hidden rounded-sm bg-[#101926] border border-[var(--border-color)] aspect-[16/9] sm:aspect-[2.35/1] max-h-[640px] flex items-center justify-center">
            {leadItem.mediaType === 'video' && leadItem.videoSource === 'embed' && leadItem.mediaUrl.includes('player.vimeo') ? (
              <iframe
                src={leadItem.mediaUrl}
                className="w-full h-full pointer-events-none opacity-85 group-hover:opacity-95 transition-opacity"
                title={leadItem.title}
                loading="lazy"
              />
            ) : (
              <LazyImage
                src={leadItem.mediaUrl || 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=1600&q=80'}
                alt={leadItem.title}
                containerClassName="w-full h-full"
                className="w-full h-full object-cover brightness-85 group-hover:brightness-95 transition-all duration-500"
              />
            )}

            {/* Subtle Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

            {/* Play Button */}
            <button
              onClick={() => setActiveLightboxItem(leadItem)}
              className="absolute inset-0 w-full h-full flex flex-col items-center justify-center cursor-pointer group/overlay z-10"
              aria-label={`Play ${leadItem.title}`}
            >
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[var(--color-gold)] text-[#192c45] flex items-center justify-center pl-1 shadow-lg group-hover/overlay:scale-105 group-hover/overlay:bg-white transition-all duration-300">
                <Play className="w-6 h-6 sm:w-7 sm:h-7 fill-current" />
              </div>
              <span className="mt-4 text-xs tracking-[0.18em] text-white/90 uppercase font-semibold group-hover/overlay:text-[var(--color-gold)] transition-colors">
                Play Featured Commission
              </span>
            </button>

            {/* Bottom Bar */}
            <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-end justify-between pointer-events-none z-10 gap-2">
              <div>
                <span className="text-[11px] font-semibold tracking-wider text-[var(--color-gold)] uppercase block mb-1">
                  Featured Work
                </span>
                <h3 className="text-xl sm:text-2xl md:text-3xl text-white font-bold tracking-tight">
                  {leadItem.title}
                </h3>
              </div>
              <span className="text-xs text-white/75 font-medium">
                Directorial Reel 2026
              </span>
            </div>
          </div>
        </section>
      )}

      {/* 3. STUDIO ETHOS - Clean Editorial Statement */}
      <section id="manifesto" className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 text-center">
        <p className="text-2xl sm:text-3xl md:text-4xl font-normal leading-relaxed text-[var(--text-heading)] mb-8 tracking-tight">
          "{siteSettings.introStripText || 'We approach every commission with singular authorship — crafting natural light, nuanced composition, and spatial sound for stories that endure.'}"
        </p>
        <button
          onClick={() => onNavigate('about')}
          className="text-xs font-semibold tracking-wider uppercase text-[var(--color-gold)] hover:underline transition-all inline-flex items-center gap-2 cursor-pointer py-1"
        >
          <span>Explore our philosophy</span>
          <span className="text-sm">→</span>
        </button>
      </section>

      {/* 4. SELECTED WORKS */}
      <section id="works-preview" className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 border-t border-[var(--border-color)]">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-4">
          <div>
            <p className="text-xs font-semibold tracking-[0.2em] text-[var(--color-gold)] uppercase mb-2">
              Portfolio
            </p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[var(--text-heading)]">
              Selected Projects
            </h2>
          </div>
          <button
            onClick={() => onNavigate('portfolio')}
            className="text-xs font-semibold tracking-wider uppercase text-[var(--text-heading)]/75 hover:text-[var(--color-gold)] transition-colors flex items-center gap-2 self-start cursor-pointer py-1"
          >
            <span>View Full Archive</span>
            <span>→</span>
          </button>
        </div>

        {/* Project Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 sm:gap-12">
          {secondaryItems.map((item, idx) => {
            const category = categories.find(c => c.id === item.categoryId);
            const colSpan = idx === 0 ? 'md:col-span-7' : idx === 1 ? 'md:col-span-5' : 'md:col-span-12';
            const aspect = idx === 2 ? 'aspect-[21/9]' : 'aspect-[16/10]';

            return (
              <div
                key={item.id}
                onClick={() => setActiveLightboxItem(item)}
                className={`${colSpan} group cursor-pointer flex flex-col`}
              >
                {/* Media frame */}
                <div className={`w-full ${aspect} overflow-hidden rounded-sm bg-[#101926] relative mb-4 border border-[var(--border-color)]/60`}>
                  {item.mediaType === 'video' ? (
                    <div className="w-full h-full relative">
                      {item.videoSource === 'embed' && item.mediaUrl.includes('player.vimeo') ? (
                        <iframe
                          src={item.mediaUrl}
                          className="w-full h-full pointer-events-none opacity-85 group-hover:opacity-100 transition-opacity"
                          title={item.title}
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-[#101926] text-[var(--color-gold)]">
                          <Play className="w-10 h-10 opacity-70 group-hover:opacity-100 group-hover:scale-105 transition-all" />
                        </div>
                      )}
                    </div>
                  ) : (
                    <LazyImage
                      src={item.mediaUrl}
                      alt={item.altText || item.title}
                      containerClassName="w-full h-full"
                      className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500 brightness-90 group-hover:brightness-100"
                    />
                  )}

                  {/* Play badge on hover */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="px-4 py-2 bg-[var(--color-gold)] text-[#192c45] text-xs font-semibold tracking-wider uppercase rounded-xs">
                      View Project
                    </span>
                  </div>
                </div>

                {/* Typography */}
                <div className="flex flex-col">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-semibold text-[var(--color-gold)] tracking-wider uppercase text-[11px]">
                      {category ? category.name : 'Commission'}
                    </span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--text-heading)] group-hover:text-[var(--color-gold)] transition-colors">
                    {item.title}
                  </h3>
                  {item.description && (
                    <p className="text-sm text-[var(--text-body)]/80 mt-1.5 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. DISCIPLINES ROSTER - Clean Editorial Rows */}
      <section id="disciplines-roster" className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 border-t border-[var(--border-color)]">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-4">
          <div>
            <p className="text-xs font-semibold tracking-[0.2em] text-[var(--color-gold)] uppercase mb-2">
              Capabilities
            </p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[var(--text-heading)]">
              Studio Services
            </h2>
          </div>
          <button
            onClick={() => onNavigate('services')}
            className="text-xs font-semibold tracking-wider uppercase text-[var(--text-heading)]/75 hover:text-[var(--color-gold)] transition-colors flex items-center gap-2 self-start cursor-pointer py-1"
          >
            <span>View All Services</span>
            <span>→</span>
          </button>
        </div>

        {/* Minimalist Editorial Rows */}
        <div className="divide-y divide-[var(--border-color)]">
          {teasedServices.map((service) => {
            const linkedCat = categories.find(c => c.id === service.categoryId);
            return (
              <div
                key={service.id}
                className="py-10 sm:py-12 flex flex-col lg:flex-row lg:items-start justify-between gap-6 group transition-colors duration-200"
              >
                {/* Left: Title & Category */}
                <div className="lg:w-5/12">
                  <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-heading)] group-hover:text-[var(--color-gold)] transition-colors">
                    {service.title}
                  </h3>
                  {linkedCat && (
                    <span className="inline-block mt-2 text-[11px] font-semibold text-[var(--color-gold)] tracking-wider uppercase">
                      {linkedCat.name}
                    </span>
                  )}
                </div>

                {/* Center: Description */}
                <div className="lg:w-4/12">
                  <p className="text-sm sm:text-base text-[var(--text-body)]/80 leading-relaxed font-normal">
                    {service.shortDescription}
                  </p>
                </div>

                {/* Right: Actions */}
                <div className="lg:w-3/12 flex lg:justify-end items-center gap-4">
                  <button
                    onClick={() => onNavigate('book', undefined, service.id)}
                    className="px-5 py-2.5 bg-[var(--color-gold)] text-[#192c45] hover:brightness-105 text-xs font-semibold tracking-wider uppercase rounded-sm transition-all cursor-pointer whitespace-nowrap shadow-xs"
                  >
                    Commission
                  </button>
                  <button
                    onClick={() => onNavigate('services')}
                    className="text-xs font-medium text-[var(--text-heading)]/75 hover:text-[var(--color-gold)] transition-colors cursor-pointer whitespace-nowrap"
                  >
                    Specs →
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 6. CLIENT ENDORSEMENTS - Striking Editorial Pull-Quote */}
      {liveReviews.length > 0 && (
        <section
          id="testimonials"
          className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32 border-t border-[var(--border-color)] text-center"
        >
          <p className="text-xs font-semibold tracking-[0.2em] text-[var(--color-gold)] uppercase mb-8">
            Endorsements
          </p>

          <div className="min-h-[160px] flex flex-col items-center justify-center">
            <blockquote className="text-2xl sm:text-3xl md:text-4xl font-normal leading-relaxed text-[var(--text-heading)] mb-8 tracking-tight">
              "{liveReviews[currentReviewIndex].reviewText}"
            </blockquote>

            <div className="flex items-center gap-3 text-sm">
              <span className="font-semibold text-[var(--text-heading)] tracking-wide">
                {liveReviews[currentReviewIndex].reviewerName}
              </span>
              <span className="text-[var(--text-body)]/40 font-mono">/</span>
              <span className="text-xs text-[var(--color-gold)] font-medium">
                {liveReviews[currentReviewIndex].source}
              </span>
            </div>
          </div>

          {/* Typographic Pagination Controls (No AI indicator dots) */}
          {liveReviews.length > 1 && (
            <div className="flex items-center justify-center gap-6 mt-10 text-xs font-mono tracking-widest text-[var(--text-body)]/60">
              <button
                onClick={() => setCurrentReviewIndex((prev) => (prev === 0 ? liveReviews.length - 1 : prev - 1))}
                className="hover:text-[var(--color-gold)] transition-colors cursor-pointer uppercase text-[10px] tracking-widest"
                aria-label="Previous quote"
              >
                Prev
              </button>
              <span className="text-[var(--text-heading)] font-semibold">
                0{currentReviewIndex + 1} / 0{liveReviews.length}
              </span>
              <button
                onClick={() => setCurrentReviewIndex((prev) => (prev + 1) % liveReviews.length)}
                className="hover:text-[var(--color-gold)] transition-colors cursor-pointer uppercase text-[10px] tracking-widest"
                aria-label="Next quote"
              >
                Next
              </button>
            </div>
          )}
        </section>
      )}

      {/* 7. CLOSING CALL TO ACTION */}
      <section
        id="home-cta"
        className="w-full py-24 sm:py-32 px-4 sm:px-6 lg:px-8 border-t border-[var(--border-color)] text-center relative overflow-hidden"
      >
        <div className="max-w-3xl mx-auto flex flex-col items-center">
          <p className="text-xs font-semibold tracking-[0.2em] text-[var(--color-gold)] uppercase mb-4">
            Inquiries & Commissions
          </p>
          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[var(--text-heading)] mb-6 leading-tight">
            {siteSettings.ctaHeadline || 'Ready to bring your story to life?'}
          </h2>
          <p className="text-base sm:text-lg text-[var(--text-body)]/80 max-w-xl font-normal mb-10 leading-relaxed">
            {siteSettings.ctaSubline || 'From commercial brand films to original narratives, we collaborate closely with directors and producers worldwide.'}
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <button
              id="cta-book-btn"
              onClick={() => onNavigate('book')}
              className="w-full sm:w-auto px-8 py-3.5 bg-[var(--color-gold)] text-[#192c45] hover:brightness-105 font-semibold text-xs sm:text-sm tracking-wider uppercase rounded-sm shadow-xs transition-all cursor-pointer"
            >
              Book Production
            </button>
            <button
              id="cta-contact-btn"
              onClick={() => onNavigate('contact')}
              className="text-xs sm:text-sm font-semibold tracking-wider uppercase text-[var(--text-heading)]/75 hover:text-[var(--color-gold)] transition-colors flex items-center gap-2 cursor-pointer py-2 px-3"
            >
              <span>Direct Studio Inquiry</span>
              <span>→</span>
            </button>
          </div>
        </div>
      </section>

      {/* Lightbox Modal */}
      {activeLightboxItem && (
        <PortfolioLightbox
          item={activeLightboxItem}
          onClose={() => setActiveLightboxItem(null)}
          onNavigateService={(catId) => onNavigate('services', catId)}
        />
      )}
    </div>
  );
};

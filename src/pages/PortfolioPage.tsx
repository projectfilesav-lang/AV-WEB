import React, { useState, useEffect, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { PortfolioItem } from '../types';
import { Play, Disc, Search, X } from 'lucide-react';
import { PortfolioLightbox } from '../components/PortfolioLightbox';
import { GoldAudioPlayer } from '../components/GoldAudioPlayer';
import { LazyImage } from '../components/LazyImage';

interface PortfolioPageProps {
  initialCategoryId?: string;
  onNavigate: (section: string, filterCategory?: string, serviceId?: string) => void;
  onOpenLightbox?: (item: PortfolioItem) => void;
  onOpenSearch?: () => void;
}

export const PortfolioPage: React.FC<PortfolioPageProps> = ({
  initialCategoryId,
  onNavigate,
  onOpenLightbox,
  onOpenSearch,
}) => {
  const { portfolioItems, categories, services } = useData();
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategoryId || 'all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeLightboxItem, setActiveLightboxItem] = useState<PortfolioItem | null>(null);

  useEffect(() => {
    if (initialCategoryId) {
      setSelectedCategory(initialCategoryId);
    }
  }, [initialCategoryId]);

  // Sort categories by order
  const sortedCategories = useMemo(() => {
    return [...categories].sort((a, b) => a.order - b.order);
  }, [categories]);

  // Filter items by category and search keyword
  const filteredItems = useMemo(() => {
    let items = selectedCategory === 'all'
      ? portfolioItems
      : portfolioItems.filter((item) => item.categoryId === selectedCategory);

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      items = items.filter((item) => {
        return (
          item.title.toLowerCase().includes(q) ||
          (item.description && item.description.toLowerCase().includes(q)) ||
          item.mediaType.toLowerCase().includes(q)
        );
      });
    }

    return [...items].sort((a, b) => a.order - b.order);
  }, [portfolioItems, selectedCategory, searchQuery]);

  const activeCategory = categories.find(c => c.id === activeLightboxItem?.categoryId);

  const handleOpenItem = (item: PortfolioItem) => {
    if (onOpenLightbox) {
      onOpenLightbox(item);
    } else {
      setActiveLightboxItem(item);
    }
  };

  // Link to book page with matching service if found
  const handleBookFromLightbox = () => {
    if (!activeLightboxItem) return;
    const matchingService = services.find(s => s.categoryId === activeLightboxItem.categoryId);
    setActiveLightboxItem(null);
    onNavigate('book', undefined, matchingService ? matchingService.id : undefined);
  };

  const selectedCategoryObj = categories.find(c => c.id === selectedCategory);

  return (
    <div id="portfolio-page" className="w-full py-8 sm:py-14 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Editorial Header */}
      <div className="mb-12 sm:mb-16 max-w-3xl">
        <p className="text-xs font-semibold tracking-[0.2em] text-[var(--color-gold)] uppercase mb-3">
          Portfolio Archive
        </p>
        <h1 className="text-4xl sm:text-6xl font-bold text-[var(--text-heading)] tracking-tight mb-6">
          Selected Works
        </h1>
        <p className="text-base sm:text-lg text-[var(--text-body)]/85 leading-relaxed max-w-2xl font-normal">
          Commercial campaigns, narrative films, documentary features, and acoustic master reference proofs.
        </p>
      </div>

      {/* Refined Category Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-12 pb-4 border-b border-[var(--border-color)]">
        <div className="flex items-center flex-wrap gap-2 sm:gap-3">
          <button
            id="category-pill-all"
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 text-xs font-semibold tracking-wider uppercase transition-all cursor-pointer rounded-xs ${
              selectedCategory === 'all'
                ? 'bg-[var(--color-gold)] text-[#192c45]'
                : 'text-[var(--text-body)]/75 hover:text-[var(--text-heading)]'
            }`}
          >
            All Works ({portfolioItems.length})
          </button>

          {sortedCategories.map((cat) => {
            const count = portfolioItems.filter(i => i.categoryId === cat.id).length;
            const isSelected = selectedCategory === cat.id;

            return (
              <button
                key={cat.id}
                id={`category-pill-${cat.id}`}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 text-xs font-semibold tracking-wider uppercase transition-all cursor-pointer rounded-xs ${
                  isSelected
                    ? 'bg-[var(--color-gold)] text-[#192c45]'
                    : 'text-[var(--text-body)]/75 hover:text-[var(--text-heading)]'
                }`}
              >
                {cat.name} ({count})
              </button>
            );
          })}
        </div>

        {/* In-Page Portfolio Search */}
        <div className="relative w-full md:w-64 shrink-0">
          <Search className="w-3.5 h-3.5 text-[var(--color-gold)] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search works or audio..."
            className="w-full pl-8.5 pr-7 py-1.5 bg-[var(--bg-color)] border border-[var(--border-color)] rounded text-xs text-[var(--text-heading)] placeholder:text-[var(--text-body)]/50 focus:outline-none focus:border-[var(--color-gold)]"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--text-body)]/50 hover:text-[var(--text-heading)]"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Gallery Grid */}
      {filteredItems.length === 0 ? (
        <div className="py-20 text-center">
          <p className="text-sm text-[var(--text-body)]/70 font-normal">
            No projects found in this category.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-12">
          {filteredItems.map((item) => {
            const category = categories.find(c => c.id === item.categoryId);

            return (
              <div
                key={item.id}
                id={`portfolio-item-${item.id}`}
                className="group flex flex-col cursor-pointer"
                onClick={() => handleOpenItem(item)}
              >
                {/* Media Container - Frameless, clean */}
                <div className="aspect-video w-full relative bg-[#101926] rounded-xs overflow-hidden mb-4">
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
                          <Play className="w-9 h-9 opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all" />
                        </div>
                      )}
                    </div>
                  ) : item.mediaType === 'audio' ? (
                    <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-[#101926] text-[var(--color-gold)]">
                      <Disc className="w-10 h-10 mb-2 opacity-70 group-hover:opacity-100 group-hover:rotate-45 transition-all" />
                      <span className="text-[10px] font-semibold tracking-widest uppercase text-[var(--text-body)]/60 text-center">
                        Audio Mixing & Mastering Proof
                      </span>
                    </div>
                  ) : (
                    <LazyImage
                      src={item.mediaUrl}
                      alt={item.altText || item.title}
                      containerClassName="w-full h-full"
                      className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700 filter brightness-90 group-hover:brightness-100"
                    />
                  )}

                  {/* Play pill on hover */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="px-3.5 py-1.5 bg-[var(--color-gold)] text-[#192c45] text-xs font-semibold tracking-wider uppercase rounded-xs shadow-xs">
                      View Work
                    </span>
                  </div>
                </div>

                {/* Card Info Body */}
                <div className="flex flex-col">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-gold)]">
                      {category ? category.name : 'Production'}
                    </span>
                  </div>

                  <h3 className="text-lg sm:text-xl font-bold tracking-tight text-[var(--text-heading)] group-hover:text-[var(--color-gold)] transition-colors">
                    {item.title}
                  </h3>

                  {item.showDescription && item.description && (
                    <p className="text-xs text-[var(--text-body)]/75 font-normal leading-relaxed line-clamp-2 mt-1">
                      {item.description}
                    </p>
                  )}

                  {/* Audio player inline if it's audio */}
                  {item.mediaType === 'audio' && (
                    <div className="mt-3 pt-3 border-t border-[var(--border-color)]/60" onClick={(e) => e.stopPropagation()}>
                      <GoldAudioPlayer src={item.mediaUrl} title={item.title} />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Lightbox Modal */}
      <PortfolioLightbox
        item={activeLightboxItem}
        category={activeCategory}
        onClose={() => setActiveLightboxItem(null)}
        onBookItemService={handleBookFromLightbox}
      />
    </div>
  );
};

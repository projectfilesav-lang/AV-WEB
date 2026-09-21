import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { Service } from '../types';
import { ArrowUpRight, Search, X, CheckCircle } from 'lucide-react';

interface ServicesPageProps {
  onNavigate: (section: string, filterCategory?: string, preselectedServiceId?: string) => void;
  onOpenSearch?: () => void;
  initialServiceId?: string;
}

export const ServicesPage: React.FC<ServicesPageProps> = ({ onNavigate, onOpenSearch, initialServiceId }) => {
  const { services, categories } = useData();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Filter and sort services
  const filteredServices = useMemo(() => {
    return services
      .filter((service) => {
        if (selectedCategory !== 'all' && service.categoryId !== selectedCategory) {
          return false;
        }
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = service.title.toLowerCase().includes(q);
          const matchShort = service.shortDescription.toLowerCase().includes(q);
          const matchDetail = service.detailedDescription.toLowerCase().includes(q);
          return matchTitle || matchShort || matchDetail;
        }
        return true;
      })
      .sort((a, b) => a.order - b.order);
  }, [services, selectedCategory, searchQuery]);

  const handleBookService = (service: Service) => {
    onNavigate('book', undefined, service.id);
  };

  const handleViewRelatedWork = (service: Service) => {
    onNavigate('portfolio', service.categoryId);
  };

  return (
    <div id="services-page" className="w-full py-8 sm:py-14 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
      {/* Editorial Header */}
      <div className="mb-12 sm:mb-16 max-w-3xl">
        <p className="text-xs font-semibold tracking-[0.2em] text-[var(--color-gold)] uppercase mb-3">
          Capabilities & Deliverables
        </p>
        <h1 className="text-4xl sm:text-6xl font-bold text-[var(--text-heading)] tracking-tight mb-6">
          Production Services
        </h1>
        <p className="text-base sm:text-lg text-[var(--text-body)]/85 leading-relaxed max-w-2xl font-normal">
          Bespoke audiovisual production spanning cinematic direction, visual storytelling, acoustic sound engineering, and post-production color science.
        </p>
      </div>

      {/* Quick Category Jump & Filter Bar */}
      <div className="mb-10 p-4 rounded-xl bg-black/[0.02] dark:bg-white/[0.02] border border-[var(--border-color)] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3.5 py-1.5 rounded-sm text-xs font-semibold tracking-wider uppercase transition-all cursor-pointer whitespace-nowrap ${
              selectedCategory === 'all'
                ? 'bg-[var(--color-gold)] text-[#192c45]'
                : 'text-[var(--text-body)]/70 hover:text-[var(--text-heading)] hover:bg-black/5 dark:hover:bg-white/5'
            }`}
          >
            All Services ({services.length})
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-sm text-xs font-semibold tracking-wider uppercase transition-all cursor-pointer whitespace-nowrap ${
                selectedCategory === cat.id
                  ? 'bg-[var(--color-gold)] text-[#192c45]'
                  : 'text-[var(--text-body)]/70 hover:text-[var(--text-heading)] hover:bg-black/5 dark:hover:bg-white/5'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* In-Page Quick Filter Search */}
        <div className="relative w-full md:w-64 shrink-0">
          <Search className="w-3.5 h-3.5 text-[var(--color-gold)] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter services..."
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

      {/* Services Stream */}
      {filteredServices.length === 0 ? (
        <div className="py-16 text-center border border-dashed border-[var(--border-color)] rounded-lg mb-16">
          <p className="text-sm font-semibold text-[var(--text-heading)] mb-2">
            No production services match "{searchQuery}"
          </p>
          <button
            onClick={() => {
              setSelectedCategory('all');
              setSearchQuery('');
            }}
            className="text-xs text-[var(--color-gold)] hover:underline font-semibold uppercase tracking-wider cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="divide-y divide-[var(--border-color)] border-t border-b border-[var(--border-color)] mb-20">
          {filteredServices.map((service) => {
            const linkedCategory = categories.find((c) => c.id === service.categoryId);

            return (
              <div
                key={service.id}
                id={`service-row-${service.id}`}
                className="py-10 sm:py-14 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start group transition-colors"
              >
                {/* Col 1: Category */}
                <div className="lg:col-span-3">
                  {linkedCategory && (
                    <span className="text-xs font-semibold text-[var(--color-gold)] uppercase tracking-wider block">
                      {linkedCategory.name}
                    </span>
                  )}
                </div>

                {/* Col 2: Title & Details */}
                <div className="lg:col-span-6">
                  <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-heading)] group-hover:text-[var(--color-gold)] transition-colors mb-3">
                    {service.title}
                  </h2>
                  <p className="text-base text-[var(--text-heading)]/90 font-medium leading-relaxed mb-3">
                    {service.shortDescription}
                  </p>
                  <p className="text-sm text-[var(--text-body)]/80 leading-relaxed font-normal">
                    {service.detailedDescription}
                  </p>
                </div>

                {/* Col 3: Actions */}
                <div className="lg:col-span-3 flex lg:flex-col lg:items-end gap-3 pt-2">
                  <button
                    id={`book-service-${service.id}`}
                    onClick={() => handleBookService(service)}
                    className="px-6 py-3 bg-[var(--color-gold)] text-[#192c45] hover:brightness-105 text-xs font-semibold tracking-wider uppercase rounded-sm transition-all cursor-pointer shadow-xs whitespace-nowrap"
                  >
                    Book Service
                  </button>

                  <button
                    id={`view-work-${service.id}`}
                    onClick={() => handleViewRelatedWork(service)}
                    className="text-xs font-medium tracking-wider uppercase text-[var(--text-heading)]/75 hover:text-[var(--color-gold)] transition-colors cursor-pointer flex items-center gap-1.5 py-1 whitespace-nowrap"
                  >
                    <span>Related Works</span>
                    <span>→</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Custom Commission Prompt */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 py-8 border border-[var(--border-color)] rounded-xl p-6 sm:p-8 bg-black/[0.02] dark:bg-white/[0.02]">
        <div>
          <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--text-heading)] mb-2">
            Looking for a tailored production package?
          </h3>
          <p className="text-sm text-[var(--text-body)]/80 leading-relaxed max-w-xl font-normal">
            We regularly formulate custom productions combining multi-camera 4K cinematography, narrative direction, spatial sound design, and master delivery.
          </p>
        </div>
        <button
          onClick={() => onNavigate('contact')}
          className="px-6 py-3 border border-[var(--border-color)] hover:border-[var(--color-gold)] text-xs font-semibold tracking-wider uppercase text-[var(--text-heading)] hover:text-[var(--color-gold)] rounded-sm transition-all cursor-pointer whitespace-nowrap"
        >
          Inquire Directly
        </button>
      </div>
    </div>
  );
};


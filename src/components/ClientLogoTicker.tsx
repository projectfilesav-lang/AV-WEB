import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { ClientLogo } from '../types';

interface ClientLogoTickerProps {
  title?: string;
  subtitle?: string;
  className?: string;
}

export const ClientLogoTicker: React.FC<ClientLogoTickerProps> = ({
  title = 'Trusted By Visionary Brands & Commercial Partners',
  subtitle = 'Collaborating with industry-leading studios, broadcast agencies, and innovative enterprises.',
  className = '',
}) => {
  const { clientLogos } = useData();
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  if (!clientLogos || clientLogos.length === 0) {
    return null;
  }

  // Split into two distinct rows for visual balance and dynamic movement
  const midIndex = Math.ceil(clientLogos.length / 2);
  const rawRow1 = clientLogos.slice(0, midIndex);
  const rawRow2 = clientLogos.slice(midIndex);

  // If row 2 is too small or empty, populate it gracefully
  const row1Sources = rawRow1.length > 0 ? rawRow1 : clientLogos;
  const row2Sources = rawRow2.length > 0 ? rawRow2 : [...clientLogos].reverse();

  // Duplicate items for continuous infinite marquee loop
  const row1 = [...row1Sources, ...row1Sources, ...row1Sources, ...row1Sources];
  const row2 = [...row2Sources, ...row2Sources, ...row2Sources, ...row2Sources];

  const handleImageError = (id: string) => {
    setImageErrors(prev => ({ ...prev, [id]: true }));
  };

  const renderLogoCard = (logo: ClientLogo, keySuffix: string | number) => {
    const hasError = imageErrors[logo.id];

    return (
      <div
        key={`${logo.id}-${keySuffix}`}
        className="group flex h-24 w-40 shrink-0 items-center justify-center rounded-[12px] border border-white/[0.08] dark:border-white/[0.08] border-black/[0.08] bg-white/[0.04] dark:bg-white/[0.04] bg-slate-900/[0.03] px-6 transition-all duration-300 hover:border-[var(--color-gold)]/45 hover:bg-white/[0.08] dark:hover:bg-white/[0.08] hover:shadow-lg hover:shadow-[var(--color-gold)]/5 md:h-28 md:w-52 select-none"
        title={logo.name}
      >
        {!hasError && logo.logoUrl ? (
          <img
            alt={logo.name}
            className="max-h-full max-w-full object-contain drop-shadow-[0_2px_10px_rgba(0,0,0,0.45)] transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
            src={logo.logoUrl}
            onError={() => handleImageError(logo.id)}
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-center px-2">
            <span className="text-xs sm:text-sm font-heading font-bold tracking-wider uppercase text-[var(--text-heading)] group-hover:text-[var(--color-gold)] transition-colors">
              {logo.name}
            </span>
            <span className="text-[9px] uppercase tracking-[0.2em] text-[var(--color-gold)]/75 mt-0.5 font-mono">
              Partner
            </span>
          </div>
        )}
      </div>
    );
  };

  return (
    <section
      id="brand-partners-strip"
      className={`w-full py-16 sm:py-24 overflow-hidden border-t border-[var(--border-color)] bg-[var(--bg-color)] relative ${className}`}
      aria-label="Client & Partner Brands"
    >
      {/* Editorial Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-12">
        <p className="text-xs font-semibold tracking-[0.25em] text-[var(--color-gold)] uppercase mb-3">
          Commercial Collaborations
        </p>
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-[var(--text-heading)] mb-4">
          {title}
        </h2>
        {subtitle && (
          <p className="text-sm sm:text-base text-[var(--text-body)]/75 max-w-2xl mx-auto leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>

      {/* Marquee Container with Left & Right Gradient Shadows */}
      <div className="relative w-full overflow-hidden">
        {/* Left Fade Mask */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-16 sm:w-32 bg-gradient-to-r from-[var(--bg-color)] to-transparent z-20" />
        {/* Right Fade Mask */}
        <div className="pointer-events-none absolute inset-y-0 right-0 w-16 sm:w-32 bg-gradient-to-l from-[var(--bg-color)] to-transparent z-20" />

        {/* User-Requested Marquee Structure */}
        <div className="space-y-6">
          {/* Row 1: Scrolling Left */}
          <div className="flex w-fit overflow-hidden">
            <div className="animate-marquee-left flex items-center gap-6 pr-6 md:gap-10 md:pr-10">
              {row1.map((logo, idx) => renderLogoCard(logo, `r1-${idx}`))}
            </div>
          </div>

          {/* Row 2: Scrolling Right */}
          <div className="flex w-fit overflow-hidden">
            <div className="animate-marquee-right flex items-center gap-6 pr-6 md:gap-10 md:pr-10">
              {row2.map((logo, idx) => renderLogoCard(logo, `r2-${idx}`))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

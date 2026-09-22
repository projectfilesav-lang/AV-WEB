import React from 'react';

interface StudioSkeletonLoaderProps {
  variant?: 'single' | 'page' | 'grid' | 'table';
  count?: number;
  label?: string;
  className?: string;
}

export const StudioSkeletonLoader: React.FC<StudioSkeletonLoaderProps> = ({
  variant = 'single',
  count = 3,
  label,
  className = '',
}) => {
  // Base unit matching the user-requested Uiverse.io by sahilxkhadka structure
  const renderUiverseCard = (key: string | number) => (
    <div
      key={key}
      className="animate-pulse flex flex-col items-center gap-4 w-60 p-4 rounded-xl border border-[var(--border-color)]/30 bg-[var(--card-bg)]/40 shadow-xs"
    >
      <div>
        <div className="w-48 h-6 bg-slate-400/40 dark:bg-slate-700/70 rounded-md"></div>
        <div className="w-28 h-4 bg-slate-400/40 dark:bg-slate-700/70 mx-auto mt-3 rounded-md"></div>
      </div>
      <div className="h-7 bg-slate-400/35 dark:bg-slate-700/60 w-full rounded-md"></div>
      <div className="h-7 bg-slate-400/35 dark:bg-slate-700/60 w-full rounded-md"></div>
      <div className="h-7 bg-slate-400/35 dark:bg-slate-700/60 w-full rounded-md"></div>
      <div className="h-7 bg-slate-400/35 dark:bg-slate-700/60 w-1/2 rounded-md self-start"></div>
    </div>
  );

  if (variant === 'page') {
    return (
      <div
        className={`min-h-[50vh] w-full flex flex-col items-center justify-center p-8 transition-opacity duration-300 ${className}`}
        role="status"
        aria-label={label || 'Loading content'}
      >
        <div className="animate-pulse flex flex-col items-center gap-5 w-64 max-w-full">
          <div>
            <div className="w-48 h-6 bg-slate-400/40 dark:bg-slate-700/70 rounded-md"></div>
            <div className="w-28 h-4 bg-slate-400/40 dark:bg-slate-700/70 mx-auto mt-3 rounded-md"></div>
          </div>
          <div className="h-7 bg-slate-400/35 dark:bg-slate-700/60 w-full rounded-md"></div>
          <div className="h-7 bg-slate-400/35 dark:bg-slate-700/60 w-full rounded-md"></div>
          <div className="h-7 bg-slate-400/35 dark:bg-slate-700/60 w-full rounded-md"></div>
          <div className="h-7 bg-slate-400/35 dark:bg-slate-700/60 w-1/2 rounded-md"></div>
        </div>
        {label && (
          <p className="mt-6 text-xs uppercase tracking-[0.2em] text-[var(--color-gold)] font-mono animate-pulse">
            {label}
          </p>
        )}
      </div>
    );
  }

  if (variant === 'grid') {
    return (
      <div
        className={`w-full py-8 flex flex-wrap items-center justify-center gap-6 ${className}`}
        role="status"
      >
        {Array.from({ length: count }).map((_, idx) => renderUiverseCard(idx))}
      </div>
    );
  }

  return (
    <div className={`flex justify-center py-4 ${className}`} role="status">
      {renderUiverseCard('default')}
    </div>
  );
};

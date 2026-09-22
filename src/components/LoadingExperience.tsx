import React from 'react';

interface LoadingExperienceProps {
  label?: string;
  className?: string;
}

/**
 * Global Studio Loader based on Uiverse.io by sahilxkhadka
 * Styled for both dark & light modes with subtle golden brand accents
 */
export const LoadingExperience: React.FC<LoadingExperienceProps> = ({
  label = 'LOADING STUDIO SHOWCASE...',
  className = 'py-16'
}) => {
  return (
    <div className={`flex flex-col items-center justify-center w-full min-h-[300px] ${className}`} role="status">
      {/* From Uiverse.io by sahilxkhadka */}
      <div className="animate-pulse flex flex-col items-center gap-4 w-60">
        <div>
          <div className="w-48 h-6 bg-slate-400/40 dark:bg-slate-700/80 rounded-md"></div>
          <div className="w-28 h-4 bg-slate-400/40 dark:bg-slate-700/80 mx-auto mt-3 rounded-md"></div>
        </div>
        <div className="h-7 bg-slate-400/35 dark:bg-slate-700/60 w-full rounded-md"></div>
        <div className="h-7 bg-slate-400/35 dark:bg-slate-700/60 w-full rounded-md"></div>
        <div className="h-7 bg-slate-400/35 dark:bg-slate-700/60 w-full rounded-md"></div>
        <div className="h-7 bg-slate-400/35 dark:bg-slate-700/60 w-1/2 rounded-md self-start"></div>
      </div>

      {label && (
        <span className="mt-6 text-[11px] tracking-[0.25em] font-semibold text-[var(--color-gold)] uppercase font-mono animate-pulse">
          {label}
        </span>
      )}
    </div>
  );
};

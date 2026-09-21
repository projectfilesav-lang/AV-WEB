import React from 'react';
import { Film, ArrowLeft } from 'lucide-react';

interface NotFoundPageProps {
  onNavigateHome: () => void;
}

export const NotFoundPage: React.FC<NotFoundPageProps> = ({ onNavigateHome }) => {
  return (
    <div
      id="not-found-page"
      className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 py-16 relative overflow-hidden"
    >
      <div className="absolute inset-0 film-grain opacity-25 pointer-events-none" />

      <div className="relative z-10 max-w-lg mx-auto flex flex-col items-center">
        {/* Sprocket emblem */}
        <div className="w-16 h-16 rounded-sm border border-[var(--color-gold)] flex items-center justify-center bg-[var(--card-bg)] text-[var(--color-gold)] mb-6 shadow-[0_0_20px_rgba(212,175,55,0.2)]">
          <Film className="w-8 h-8" />
        </div>

        <span className="text-xs font-mono text-[var(--color-gold)] uppercase tracking-[0.3em] font-semibold mb-2">
          FRAME NOT FOUND // 404
        </span>

        <h1 className="text-4xl sm:text-6xl font-heading font-extrabold uppercase text-[var(--text-heading)] mb-4 leading-tight">
          Uncut Negative
        </h1>

        <p className="text-sm sm:text-base text-[var(--text-body)]/80 font-light max-w-md mb-8 leading-relaxed">
          The take or frame you are searching for does not exist in the active reel or has been moved to the cutting room floor.
        </p>

        <button
          id="not-found-return-home-btn"
          onClick={onNavigateHome}
          className="px-8 py-3.5 border border-[var(--color-gold)] bg-[var(--color-gold)] text-black hover:bg-transparent hover:text-[var(--color-gold)] font-heading font-bold text-xs tracking-widest uppercase rounded-sm transition-all duration-300 cursor-pointer flex items-center gap-2 shadow-[0_0_15px_rgba(212,175,55,0.3)]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>RETURN TO HOME EXPERIENCE</span>
        </button>
      </div>
    </div>
  );
};

import React from 'react';
import { useData } from '../context/DataContext';
import { Calendar } from 'lucide-react';

interface FloatingBookButtonProps {
  onBook: () => void;
  activeSection: string;
}

export const FloatingBookButton: React.FC<FloatingBookButtonProps> = ({ onBook, activeSection }) => {
  const { siteSettings } = useData();

  // If disabled in settings or already on the book page, don't show floating button
  if (!siteSettings.floatingBookButtonEnabled || activeSection === 'book') {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-40 animate-in fade-in zoom-in-90 duration-300">
      <button
        id="floating-book-btn"
        onClick={onBook}
        className="px-5 py-3 bg-[var(--color-gold)] text-[#192c45] rounded-sm font-semibold text-xs tracking-wider uppercase shadow-md hover:brightness-105 active:scale-98 transition-all duration-200 cursor-pointer flex items-center gap-2 group"
        aria-label="Book a production"
      >
        <Calendar className="w-3.5 h-3.5 text-[#192c45]" />
        <span>{siteSettings.floatingBookButtonLabel || 'Book Production'}</span>
      </button>
    </div>
  );
};

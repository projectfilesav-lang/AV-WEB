import React from 'react';
import { ChevronRight, ArrowLeft } from 'lucide-react';

interface PageBreadcrumbProps {
  currentPage: string;
  category?: string;
  onNavigate: (section: string) => void;
  onOpenSearch?: () => void;
}

export const PageBreadcrumb: React.FC<PageBreadcrumbProps> = ({
  currentPage,
  category,
  onNavigate,
}) => {
  return (
    <nav
      id="page-wayfinding-breadcrumb"
      aria-label="Breadcrumb navigation"
      className="w-full pb-4 mb-6 border-b border-[var(--border-color)] flex items-center justify-between text-xs"
    >
      {/* Clean Breadcrumb Trail */}
      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={() => onNavigate('home')}
          className="inline-flex items-center gap-1.5 text-[var(--text-body)]/70 hover:text-[var(--color-gold)] font-medium transition-colors cursor-pointer py-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Home</span>
        </button>

        <ChevronRight className="w-3.5 h-3.5 text-[var(--text-body)]/40 shrink-0" />

        <span className="font-semibold text-[var(--color-gold)] uppercase tracking-wider">
          {currentPage}
        </span>

        {category && (
          <>
            <ChevronRight className="w-3.5 h-3.5 text-[var(--text-body)]/40 shrink-0" />
            <span className="text-[var(--text-body)] font-medium">{category}</span>
          </>
        )}
      </div>
    </nav>
  );
};


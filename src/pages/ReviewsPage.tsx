import React from 'react';
import { useData } from '../context/DataContext';
import { ExternalLink, Quote, Star, ArrowRight } from 'lucide-react';

interface ReviewsPageProps {
  onNavigate?: (section: string) => void;
  onOpenSearch?: () => void;
}

export const ReviewsPage: React.FC<ReviewsPageProps> = ({ onNavigate = () => {}, onOpenSearch }) => {
  const { reviews, siteSettings } = useData();

  // Public displays ONLY reviews with status === 'Live'
  const liveReviews = reviews.filter(r => r.status === 'Live');

  return (
    <div id="reviews-page" className="w-full py-8 sm:py-14 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      {/* Editorial Header */}
      <div className="mb-12 sm:mb-16 max-w-3xl">
        <p className="text-xs font-semibold tracking-[0.2em] text-[var(--color-gold)] uppercase mb-3">
          Reputation & Trust
        </p>
        <h1 className="text-4xl sm:text-6xl font-bold text-[var(--text-heading)] tracking-tight mb-6">
          Client Reviews
        </h1>
        <p className="text-base sm:text-lg text-[var(--text-body)]/85 leading-relaxed max-w-2xl font-normal">
          Reflections from commercial producers, brand partners, and recording artists who have commissioned our studio.
        </p>
      </div>

      {/* Editorial Quotes List */}
      <div className="divide-y divide-[var(--border-color)] border-t border-b border-[var(--border-color)] mb-20">
        {liveReviews.map((review) => (
          <div
            key={review.id}
            id={`review-item-${review.id}`}
            className="py-12 sm:py-16 grid grid-cols-1 md:grid-cols-12 gap-8 items-start"
          >
            {/* Attribution Column */}
            <div className="md:col-span-4">
              <span className="font-bold text-base text-[var(--text-heading)] block mb-1">
                {review.reviewerName}
              </span>
              <span className="text-xs font-semibold text-[var(--color-gold)] uppercase tracking-wider block">
                {review.source}
              </span>
              <span className="text-xs text-[var(--text-body)]/60 mt-1 block">
                Verified Production
              </span>
            </div>

            {/* Quote Column */}
            <div className="md:col-span-8">
              <blockquote className="text-lg sm:text-xl font-normal leading-relaxed text-[var(--text-heading)]">
                "{review.reviewText}"
              </blockquote>
            </div>
          </div>
        ))}
      </div>

      {/* External Review Prompt */}
      {siteSettings.googleReviewsUrl && (
        <div className="flex items-center justify-between py-6 text-xs font-sans">
          <span className="text-[var(--text-body)]/60">
            {liveReviews.length} studio commissions documented
          </span>
          <a
            id="leave-google-review-btn"
            href={siteSettings.googleReviewsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--color-gold)] hover:text-white transition-colors flex items-center gap-1.5 uppercase tracking-wider"
          >
            <span>Google Reviews Profile</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      )}
    </div>
  );
};

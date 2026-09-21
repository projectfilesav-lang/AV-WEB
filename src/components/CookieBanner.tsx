import React, { useState, useEffect } from 'react';
import { ShieldCheck } from 'lucide-react';

interface CookieBannerProps {
  onNavigateToCookies: () => void;
}

export const CookieBanner: React.FC<CookieBannerProps> = ({ onNavigateToCookies }) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('av_cookie_consent');
    if (!consent) {
      setShow(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('av_cookie_consent', 'accepted');
    setShow(false);
  };

  const handleDecline = () => {
    localStorage.setItem('av_cookie_consent', 'essential_only');
    setShow(false);
  };

  if (!show) return null;

  return (
    <div
      id="cookie-consent-banner"
      className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 p-5 rounded-sm border border-[var(--color-gold)]/50 bg-[#0c0c0c]/95 backdrop-blur-md shadow-2xl text-xs text-[var(--text-heading)] animate-in fade-in slide-in-from-bottom-5 duration-300"
    >
      <div className="flex items-start gap-3 mb-3">
        <ShieldCheck className="w-5 h-5 text-[var(--color-gold)] shrink-0 mt-0.5" />
        <div>
          <span className="font-bold tracking-wide text-xs text-[var(--text-heading)] block mb-1">
            Cookie & Privacy Preferences
          </span>
          <p className="text-xs text-[var(--text-body)]/80 font-normal leading-relaxed">
            We use essential cookies to maintain site functionality and enhance your browsing experience.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 pt-2 border-t border-[var(--border-color)]">
        <button
          onClick={onNavigateToCookies}
          className="text-xs font-semibold text-[var(--color-gold)] hover:underline uppercase tracking-wider cursor-pointer"
        >
          View Policy
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDecline}
            className="px-3 py-1.5 border border-[var(--border-color)] text-xs font-medium uppercase rounded-sm text-[var(--text-body)] hover:border-[var(--color-gold)] transition-colors cursor-pointer"
          >
            Essential Only
          </button>
          <button
            onClick={handleAccept}
            className="px-4 py-1.5 bg-[var(--color-gold)] text-[#192c45] font-semibold text-xs tracking-wider uppercase rounded-sm hover:brightness-105 transition-all cursor-pointer shadow-xs"
          >
            Accept All
          </button>
        </div>
      </div>
    </div>
  );
};

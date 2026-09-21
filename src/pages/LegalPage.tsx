import React from 'react';
import { useData } from '../context/DataContext';
import { Shield, ArrowLeft } from 'lucide-react';

interface LegalPageProps {
  type: 'privacy' | 'terms' | 'cookies';
  onNavigate: (section: string) => void;
}

export const LegalPage: React.FC<LegalPageProps> = ({ type, onNavigate }) => {
  const { siteSettings } = useData();

  const config = {
    privacy: {
      title: 'Privacy Policy',
      subtitle: 'Client Privacy & Data Protection',
      content: siteSettings.privacyPolicy,
    },
    terms: {
      title: 'Terms of Service',
      subtitle: 'Production & Licensing Terms',
      content: siteSettings.termsOfService,
    },
    cookies: {
      title: 'Cookie Policy',
      subtitle: 'Browser Preferences & Usage Information',
      content: siteSettings.cookiePolicy,
    },
  }[type];

  return (
    <div id="legal-page" className="w-full py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      <button
        onClick={() => onNavigate('home')}
        className="inline-flex items-center gap-2 text-xs font-semibold text-[var(--color-gold)] hover:underline uppercase tracking-wider mb-8 cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Home</span>
      </button>

      <div className="mb-10 pb-6 border-b border-[var(--border-color)]">
        <div className="flex items-center gap-2 text-xs font-semibold text-[var(--color-gold)] uppercase tracking-widest mb-2">
          <Shield className="w-4 h-4" />
          <span>{config.subtitle}</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-bold text-[var(--text-heading)] tracking-tight mb-4">
          {config.title}
        </h1>
        <p className="text-xs text-[var(--text-body)]/70">
          Last updated: Studio Production Standard
        </p>
      </div>

      <div className="border-t border-[var(--border-color)] pt-8">
        <div className="whitespace-pre-line text-sm sm:text-base text-[var(--text-body)]/90 font-normal leading-relaxed">
          {config.content}
        </div>
      </div>
    </div>
  );
};

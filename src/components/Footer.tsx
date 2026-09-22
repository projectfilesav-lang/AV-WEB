import React from 'react';
import { useData } from '../context/DataContext';
import { Mail, Instagram, Youtube, Linkedin, Twitter, Video } from 'lucide-react';

interface FooterProps {
  onNavigate: (section: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const { siteSettings, socialLinks } = useData();

  const getSocialIcon = (platform: string) => {
    const p = platform.toLowerCase();
    if (p.includes('insta')) return <Instagram className="w-4 h-4" />;
    if (p.includes('vimeo')) return <Video className="w-4 h-4" />;
    if (p.includes('you') || p.includes('tube')) return <Youtube className="w-4 h-4" />;
    if (p.includes('link')) return <Linkedin className="w-4 h-4" />;
    if (p.includes('x') || p.includes('twit')) return <Twitter className="w-4 h-4" />;
    return <Mail className="w-4 h-4" />;
  };

  const activeSocials = socialLinks.filter(s => s.url && s.url.trim().length > 0);

  return (
    <footer id="main-footer" className="w-full border-t border-[var(--border-color)] bg-[var(--bg-color)] py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col gap-14">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
          {/* Brand Col */}
          <div className="md:col-span-5">
            <div className="flex items-center gap-3 mb-4">
              {siteSettings.logoUrl && (
                <img
                  src={siteSettings.logoUrl}
                  alt={siteSettings.logoAlt || 'AV Productions'}
                  className="h-9 w-auto object-contain"
                />
              )}
              <span className="font-bold tracking-tight text-xl text-[var(--text-heading)] block">
                AV Productions
              </span>
            </div>
            <p className="text-sm text-[var(--text-body)]/80 font-normal max-w-sm leading-relaxed mb-6">
              Commercial campaigns, original documentaries, and narrative filmmaking. Crafted with precision and directed with intent.
            </p>
            <span className="text-xs font-medium text-[var(--color-gold)]">
              {siteSettings.contactEmail}
            </span>
          </div>

          {/* Nav Links */}
          <div className="md:col-span-4 flex gap-12 sm:gap-16">
            <div>
              <span className="text-xs font-semibold tracking-wider uppercase text-[var(--text-body)]/60 block mb-4">
                Studio
              </span>
              <ul className="flex flex-col gap-2.5 text-xs font-sans tracking-wide">
                <li>
                  <button onClick={() => onNavigate('home')} className="text-[var(--text-heading)]/80 hover:text-[var(--color-gold)] transition-colors cursor-pointer">
                    Home
                  </button>
                </li>
                <li>
                  <button onClick={() => onNavigate('about')} className="text-[var(--text-heading)]/80 hover:text-[var(--color-gold)] transition-colors cursor-pointer">
                    About & Directors
                  </button>
                </li>
                <li>
                  <button onClick={() => onNavigate('services')} className="text-[var(--text-heading)]/80 hover:text-[var(--color-gold)] transition-colors cursor-pointer">
                    Services
                  </button>
                </li>
                <li>
                  <button onClick={() => onNavigate('portfolio')} className="text-[var(--text-heading)]/80 hover:text-[var(--color-gold)] transition-colors cursor-pointer">
                    Selected Works
                  </button>
                </li>
                <li>
                  <button onClick={() => onNavigate('reviews')} className="text-[var(--text-heading)]/80 hover:text-[var(--color-gold)] transition-colors cursor-pointer">
                    Client Reviews
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <span className="text-xs font-semibold tracking-wider uppercase text-[var(--text-body)]/60 block mb-4">
                Inquiries
              </span>
              <ul className="flex flex-col gap-2.5 text-xs font-sans tracking-wide">
                <li>
                  <button onClick={() => onNavigate('book')} className="text-[var(--color-gold)] font-semibold hover:underline transition-colors cursor-pointer">
                    Book Production
                  </button>
                </li>
                <li>
                  <button onClick={() => onNavigate('contact')} className="text-[var(--text-heading)]/80 hover:text-[var(--color-gold)] transition-colors cursor-pointer">
                    Contact Studio
                  </button>
                </li>
                <li>
                  <button onClick={() => onNavigate('blog')} className="text-[var(--text-heading)]/80 hover:text-[var(--color-gold)] transition-colors cursor-pointer">
                    Journal
                  </button>
                </li>
              </ul>
            </div>
          </div>

          {/* Social Icons Col */}
          <div className="md:col-span-3">
            <span className="text-xs font-semibold tracking-wider uppercase text-[var(--text-body)]/60 block mb-4">
              Connect
            </span>
            <div className="flex items-center gap-2 flex-wrap mb-4">
              {activeSocials.map((link, idx) => (
                <a
                  key={idx}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-sm border border-[var(--border-color)] bg-[var(--card-bg)] text-[var(--text-heading)]/80 hover:text-[var(--color-gold)] hover:border-[var(--color-gold)] transition-colors flex items-center justify-center cursor-pointer"
                  aria-label={link.platform}
                  title={link.platform}
                >
                  {getSocialIcon(link.platform)}
                </a>
              ))}
            </div>
            <p className="text-xs text-[var(--text-body)]/60 font-medium">
              Film & Video Production Studio
            </p>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Legal */}
        <div className="pt-8 border-t border-[var(--border-color)] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[var(--text-body)]/70">
          <div>
            <span>{siteSettings.copyrightText}</span>
          </div>

          <div className="flex items-center gap-6">
            <button
              onClick={() => onNavigate('privacy')}
              className="hover:text-[var(--color-gold)] transition-colors cursor-pointer"
            >
              Privacy Policy
            </button>
            <button
              onClick={() => onNavigate('terms')}
              className="hover:text-[var(--color-gold)] transition-colors cursor-pointer"
            >
              Terms of Service
            </button>
            <button
              onClick={() => onNavigate('cookies')}
              className="hover:text-[var(--color-gold)] transition-colors cursor-pointer"
            >
              Cookie Policy
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

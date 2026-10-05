import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { insertPublicRecord } from '../supabase';
import { CheckCircle, Instagram, Youtube, Linkedin, Twitter, Video, Mail } from 'lucide-react';

interface ContactPageProps {
  onNavigate?: (section: string) => void;
  onOpenSearch?: () => void;
}

export const ContactPage: React.FC<ContactPageProps> = ({ onNavigate = () => {}, onOpenSearch }) => {
  const { siteSettings, socialLinks } = useData();
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      setErrorMsg('Please complete all required fields.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const formBody = new URLSearchParams({
        'form-name': 'studio-contact',
        name: formData.name.trim(),
        email: formData.email.trim(),
        message: formData.message.trim(),
      }).toString();

      // 1. Submit to Netlify Forms via static form POST
      const netlifyPromise = fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formBody,
      });

      // 2. Also record in Supabase contact_messages table (public insert only)
      const supabasePromise = insertPublicRecord('contact_messages', {
        id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        name: formData.name.trim(),
        email: formData.email.trim(),
        message: formData.message.trim(),
        createdAt: new Date().toISOString(),
      });

      await Promise.allSettled([netlifyPromise, supabasePromise]);
      setIsSubmitted(true);
      setFormData({ name: '', email: '', message: '' });
    } catch {
      setErrorMsg('Unable to send message right now. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getSocialIcon = (platform: string) => {
    const p = platform.toLowerCase();
    if (p.includes('insta')) return <Instagram className="w-4 h-4" />;
    if (p.includes('vimeo')) return <Video className="w-4 h-4" />;
    if (p.includes('you') || p.includes('tube')) return <Youtube className="w-4 h-4" />;
    if (p.includes('link')) return <Linkedin className="w-4 h-4" />;
    if (p.includes('x') || p.includes('twit')) return <Twitter className="w-4 h-4" />;
    return <Mail className="w-4 h-4" />;
  };

  const activeSocialLinks = socialLinks.filter(l => l.url && l.url.trim().length > 0);

  return (
    <div id="contact-page" className="w-full py-8 sm:py-14 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      {/* Editorial Header */}
      <div className="mb-12 sm:mb-16 max-w-3xl">
        <p className="text-xs font-semibold tracking-[0.2em] text-[var(--color-gold)] uppercase mb-3">
          Studio Inquiries
        </p>
        <h1 className="text-4xl sm:text-6xl font-bold text-[var(--text-heading)] tracking-tight mb-4">
          Contact Studio
        </h1>
        <p className="text-base sm:text-lg text-[var(--text-body)]/85 leading-relaxed max-w-2xl font-normal">
          For commercial treatments, narrative projects, or artist commissions, connect directly with our production team.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 sm:gap-16 pb-16">
        {/* Left Column: Direct Studio Coordinates */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-10">
          <div className="space-y-8">
            {/* Email */}
            <div>
              <span className="text-xs font-semibold tracking-wider uppercase text-[var(--color-gold)] block mb-1">
                Direct Email
              </span>
              <a
                href={`mailto:${siteSettings.contactEmail}`}
                className="text-lg sm:text-xl font-medium text-[var(--text-heading)] hover:text-[var(--color-gold)] transition-colors break-all"
              >
                {siteSettings.contactEmail}
              </a>
            </div>

            {/* Phone */}
            {siteSettings.contactPhone && (
              <div>
                <span className="text-xs font-semibold tracking-wider uppercase text-[var(--color-gold)] block mb-1">
                  Direct Line
                </span>
                <a
                  href={`tel:${siteSettings.contactPhone}`}
                  className="text-lg sm:text-xl font-medium text-[var(--text-heading)] hover:text-[var(--color-gold)] transition-colors"
                >
                  {siteSettings.contactPhone}
                </a>
              </div>
            )}

            {/* Location */}
            <div>
              <span className="text-xs font-semibold tracking-wider uppercase text-[var(--color-gold)] block mb-1">
                Bases of Operation
              </span>
              <p className="text-base text-[var(--text-body)]/80 font-normal leading-relaxed">
                Available for worldwide on-location directing, cinematography, and post-production supervision.
              </p>
            </div>
          </div>

          {/* Social Links */}
          {activeSocialLinks.length > 0 && (
            <div className="pt-6 border-t border-[var(--border-color)]">
              <span className="text-xs font-semibold tracking-wider uppercase text-[var(--text-body)]/70 block mb-3">
                Connect & Social
              </span>
              <div className="flex items-center gap-4">
                {activeSocialLinks.map((link, idx) => (
                  <a
                    key={idx}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[var(--text-heading)]/75 hover:text-[var(--color-gold)] transition-colors cursor-pointer"
                    aria-label={`AV Productions on ${link.platform}`}
                    title={link.platform}
                  >
                    {getSocialIcon(link.platform)}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Clean Inquiry Form */}
        <div className="lg:col-span-7">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-heading)] mb-2">
              Send an Inquiry
            </h2>
            <p className="text-sm text-[var(--text-body)]/75 font-normal mb-8">
              We respond to all verified creative and commercial inquiries within 24 hours.
            </p>

            {isSubmitted ? (
              <div className="py-10 text-center border-y border-[var(--border-color)]">
                <CheckCircle className="w-10 h-10 text-[var(--color-gold)] mx-auto mb-4" />
                <h3 className="text-2xl font-bold tracking-tight text-[var(--text-heading)] mb-2">
                  Inquiry Dispatched
                </h3>
                <p className="text-base text-[var(--text-body)]/80 font-normal max-w-sm mx-auto mb-6">
                  Thank you for reaching out. The studio team has received your note and will reply shortly.
                </p>
                <button
                  onClick={() => setIsSubmitted(false)}
                  className="text-xs font-semibold tracking-wider uppercase text-[var(--color-gold)] hover:underline transition-colors cursor-pointer"
                >
                  ← Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {errorMsg && (
                  <div className="p-3 bg-red-950/40 border border-red-800/40 rounded-xs text-xs text-red-300">
                    {errorMsg}
                  </div>
                )}

                <div>
                  <label htmlFor="contact-name" className="block text-xs font-semibold tracking-wider uppercase text-[var(--color-gold)] mb-2">
                    Name / Company
                  </label>
                  <input
                    id="contact-name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Full Name or Organization"
                    className="w-full px-4 py-3 bg-[var(--bg-color)] border border-[var(--border-color)] focus:border-[var(--color-gold)] rounded-xs text-sm text-[var(--text-heading)] outline-none"
                  />
                </div>

                <div>
                  <label htmlFor="contact-email" className="block text-xs font-semibold tracking-wider uppercase text-[var(--color-gold)] mb-2">
                    Email Address
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="email@company.com"
                    className="w-full px-4 py-3 bg-[var(--bg-color)] border border-[var(--border-color)] focus:border-[var(--color-gold)] rounded-xs text-sm text-[var(--text-heading)] outline-none"
                  />
                </div>

                <div>
                  <label htmlFor="contact-message" className="block text-xs font-semibold tracking-wider uppercase text-[var(--color-gold)] mb-2">
                    Project Scope & Timing
                  </label>
                  <textarea
                    id="contact-message"
                    rows={5}
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Briefly describe your concept, schedule requirements, or production scope..."
                    className="w-full px-4 py-3 bg-[var(--bg-color)] border border-[var(--border-color)] focus:border-[var(--color-gold)] rounded-xs text-sm text-[var(--text-heading)] outline-none resize-y"
                  />
                </div>

                <button
                  id="contact-submit-btn"
                  type="submit"
                  disabled={isSubmitting}
                  className="px-8 py-3.5 bg-[var(--color-gold)] text-[#192c45] font-semibold text-xs tracking-wider uppercase rounded-sm hover:brightness-105 transition-all cursor-pointer disabled:opacity-50 shadow-xs"
                >
                  {isSubmitting ? 'Sending...' : 'Send Inquiry'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

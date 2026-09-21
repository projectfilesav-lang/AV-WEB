import React, { useEffect } from 'react';
import { PortfolioItem, PortfolioCategory } from '../types';
import { X, Calendar } from 'lucide-react';
import { GoldAudioPlayer } from './GoldAudioPlayer';
import { LazyImage } from './LazyImage';

interface PortfolioLightboxProps {
  item: PortfolioItem | null;
  category?: PortfolioCategory;
  onClose: () => void;
  onBookItemService?: () => void;
}

export const PortfolioLightbox: React.FC<PortfolioLightboxProps> = ({
  item,
  category,
  onClose,
  onBookItemService
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!item) return null;

  return (
    <div
      id="portfolio-lightbox-modal"
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 lg:p-10 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative max-w-5xl w-full max-h-[92vh] bg-[#101926] border border-white/10 rounded-sm shadow-2xl overflow-y-auto flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-white/10 bg-[#0d141e]">
          <div className="flex items-center gap-3">
            <span className="text-[10px] sm:text-xs font-semibold text-[var(--color-gold)] uppercase tracking-wider">
              {category ? category.name : 'Production Showcase'}
            </span>
            <span className="text-white/20 font-mono">/</span>
            <span className="text-[10px] sm:text-xs font-medium text-white/60 uppercase">
              {item.mediaType}
            </span>
          </div>

          <button
            id="lightbox-close-btn"
            onClick={onClose}
            className="p-1.5 text-white/60 hover:text-white transition-colors cursor-pointer rounded-sm"
            aria-label="Close lightbox"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Media Container */}
        <div className="w-full bg-black flex items-center justify-center min-h-[300px] max-h-[560px] relative overflow-hidden">
          {item.mediaType === 'video' ? (
            item.videoSource === 'embed' ? (
              <div className="w-full aspect-video">
                <iframe
                  src={item.mediaUrl}
                  title={item.title}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : item.mediaUrl ? (
              <video
                src={item.mediaUrl}
                controls
                autoPlay
                className="w-full max-h-[560px] object-contain"
                onError={(e) => {
                  console.warn('Video source load notice', e);
                }}
              />
            ) : (
              <div className="p-8 text-center text-white/60">Video source unavailable</div>
            )
          ) : item.mediaType === 'audio' ? (
            <div className="p-6 sm:p-12 w-full max-w-2xl">
              <div className="text-center mb-6">
                <span className="text-xs font-semibold tracking-widest uppercase text-[var(--color-gold)] block mb-1">
                  Audio Mixing & Mastering Proof
                </span>
                <p className="text-xs text-white/60 font-normal">
                  24-bit / 48 kHz Acoustic Reference • Stereo Dynamic Headroom
                </p>
              </div>
              <GoldAudioPlayer
                src={item.mediaUrl}
                title={item.title}
                showWaveform={true}
              />
            </div>
          ) : (
            <LazyImage
              src={item.mediaUrl}
              alt={item.altText || item.title}
              containerClassName="max-h-[560px] w-auto mx-auto flex items-center justify-center"
              className="max-h-[560px] w-auto object-contain mx-auto"
            />
          )}
        </div>

        {/* Metadata Details */}
        <div className="p-6 sm:p-8 flex flex-col md:flex-row justify-between gap-6 bg-[#101926]">
          <div className="md:w-2/3">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-3">
              {item.title}
            </h2>
            {item.description && (
              <p className="text-sm sm:text-base text-white/80 font-normal leading-relaxed">
                {item.description}
              </p>
            )}
          </div>

          <div className="md:w-1/3 flex flex-col justify-between items-start md:items-end gap-4">
            {onBookItemService && (
              <button
                onClick={onBookItemService}
                className="w-full md:w-auto px-6 py-3 bg-[var(--color-gold)] text-[#192c45] hover:brightness-105 font-semibold text-xs tracking-wider uppercase rounded-sm transition-all cursor-pointer flex items-center justify-center gap-2 shadow-xs"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Book Similar Production</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

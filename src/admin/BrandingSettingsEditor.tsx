import React, { useState, useRef } from 'react';
import { SiteSettings } from '../types';
import { Upload, Image as ImageIcon, Check, RefreshCw, Eye, Sparkles, Globe, Shield } from 'lucide-react';

interface BrandingSettingsEditorProps {
  siteSettings: SiteSettings;
  onSave: (updatedSettings: SiteSettings) => Promise<void>;
  showToast: (msg: string) => void;
}

export const BrandingSettingsEditor: React.FC<BrandingSettingsEditorProps> = ({
  siteSettings,
  onSave,
  showToast
}) => {
  const [logoUrl, setLogoUrl] = useState(siteSettings.logoUrl || '/logo.svg');
  const [faviconUrl, setFaviconUrl] = useState(siteSettings.faviconUrl || '/favicon.svg');
  const [logoAlt, setLogoAlt] = useState(siteSettings.logoAlt || 'AV Productions');
  const [autoSyncFavicon, setAutoSyncFavicon] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [dragOverLogo, setDragOverLogo] = useState(false);
  const [dragOverFavicon, setDragOverFavicon] = useState(false);

  const logoFileInputRef = useRef<HTMLInputElement>(null);
  const faviconFileInputRef = useRef<HTMLInputElement>(null);

  // File to base64 DataURL converter
  const processImageFile = (file: File, isLogo: boolean) => {
    if (!file.type.startsWith('image/')) {
      showToast('Please upload a valid image file (SVG, PNG, JPG, WebP)');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        if (isLogo) {
          setLogoUrl(result);
          if (autoSyncFavicon) {
            setFaviconUrl(result);
          }
          showToast(autoSyncFavicon ? 'Logo uploaded & synced as favicon!' : 'Logo uploaded!');
        } else {
          setFaviconUrl(result);
          showToast('Favicon uploaded!');
        }
      }
    };
    reader.readAsDataURL(file);
  };

  const handleLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file, true);
    }
  };

  const handleFaviconFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file, false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updated: SiteSettings = {
        ...siteSettings,
        logoUrl: logoUrl.trim(),
        faviconUrl: faviconUrl.trim() || logoUrl.trim(),
        logoAlt: logoAlt.trim() || 'AV Productions',
      };
      await onSave(updated);
      showToast('Brand logo & browser favicon updated successfully!');
    } catch {
      showToast('Failed to save branding settings.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetToDefault = () => {
    setLogoUrl('/logo.svg');
    setFaviconUrl('/favicon.svg');
    setLogoAlt('AV Productions');
    showToast('Reset to default studio logo and favicon.');
  };

  return (
    <div className="max-w-4xl space-y-6 text-xs">
      {/* Title & Overview Banner */}
      <div className="p-5 rounded-lg border border-[var(--color-gold)]/30 bg-[#141414] space-y-2">
        <div className="flex items-center gap-2 text-[var(--color-gold)]">
          <Sparkles className="w-4 h-4" />
          <h2 className="font-bold uppercase tracking-wider text-sm text-white">
            Studio Brand Identity & Favicon
          </h2>
        </div>
        <p className="text-white/70 leading-relaxed text-xs">
          Upload and manage the official AV Productions emblem across your site. When you upload or change your logo, it automatically synchronizes as the browser tab favicon, keeping your branding consistent across all client devices.
        </p>
      </div>

      {/* Live Previews */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Header Navigation Mockup */}
        <div className="p-4 rounded-lg border border-white/10 bg-[#111111] space-y-3">
          <span className="text-[10px] font-mono tracking-widest text-white/50 uppercase block">
            Live Header Logo Preview
          </span>
          <div className="bg-[#0b0b0a] border border-white/10 rounded-md p-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt={logoAlt}
                  className="h-8 w-auto max-w-[130px] object-contain drop-shadow"
                />
              ) : (
                <div className="w-8 h-8 rounded bg-[var(--color-gold)]/20 border border-[var(--color-gold)]/40 flex items-center justify-center text-[var(--color-gold)] font-bold">
                  AV
                </div>
              )}
              <div>
                <span className="font-bold text-xs text-white tracking-wider block">
                  AV PRODUCTIONS
                </span>
                <span className="text-[8px] font-mono text-[var(--color-gold)] tracking-widest uppercase">
                  FILM & SOUND STUDIO
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-white/5 text-[9px] text-white/40 font-mono">
                DESKTOP
              </span>
            </div>
          </div>
        </div>

        {/* Browser Tab Simulation */}
        <div className="p-4 rounded-lg border border-white/10 bg-[#111111] space-y-3">
          <span className="text-[10px] font-mono tracking-widest text-white/50 uppercase block">
            Browser Tab & Favicon Simulation
          </span>
          <div className="bg-[#1e1e1e] border border-white/15 rounded-md overflow-hidden">
            <div className="bg-[#2d2d2d] px-3 py-1.5 flex items-center gap-2 border-b border-white/5">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500/80 inline-block" />
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80 inline-block" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block" />
              </div>
              <div className="ml-2 bg-[#1e1e1e] px-2.5 py-1 rounded-t flex items-center gap-2 text-[10px] text-white/90 max-w-[220px] truncate border-t border-x border-white/10">
                <img
                  src={faviconUrl || logoUrl}
                  alt="Favicon"
                  className="w-3.5 h-3.5 object-contain shrink-0"
                />
                <span className="truncate font-sans font-medium text-[10px]">
                  AV Productions | Film & Sound
                </span>
              </div>
            </div>
            <div className="p-2.5 text-center text-white/40 text-[10px] font-mono bg-[#141414]">
              Browser tab icon dynamically synchronized via DOM &lt;link rel="icon"&gt;
            </div>
          </div>
        </div>
      </div>

      {/* Main Upload Form */}
      <div className="p-6 rounded-lg border border-white/10 bg-[#141414] space-y-6">
        <h3 className="font-bold uppercase text-xs text-white pb-3 border-b border-white/10">
          Upload & Configure Branding
        </h3>

        {/* Logo Upload Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2">
              <ImageIcon className="w-3.5 h-3.5 text-[var(--color-gold)]" />
              <span>Studio Primary Logo *</span>
            </label>
            <span className="text-[10px] font-mono text-white/50">
              Recommended: Transparent SVG or PNG (min 200×200px)
            </span>
          </div>

          {/* Drag & Drop Upload Zone */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOverLogo(true);
            }}
            onDragLeave={() => setDragOverLogo(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOverLogo(false);
              const file = e.dataTransfer.files?.[0];
              if (file) processImageFile(file, true);
            }}
            onClick={() => logoFileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all ${
              dragOverLogo
                ? 'border-[var(--color-gold)] bg-[var(--color-gold)]/10'
                : 'border-white/20 hover:border-[var(--color-gold)]/60 bg-black/40 hover:bg-black/60'
            }`}
          >
            <input
              ref={logoFileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleLogoFileChange}
            />
            <div className="flex flex-col items-center justify-center gap-2">
              <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[var(--color-gold)]">
                <Upload className="w-5 h-5" />
              </div>
              <p className="text-white text-xs font-semibold">
                Click to browse file or drag and drop logo here
              </p>
              <p className="text-white/40 text-[11px] font-mono">
                SVG, PNG, JPG, or WebP up to 5MB
              </p>
            </div>
          </div>

          {/* Logo URL Manual Input */}
          <div className="pt-2">
            <label className="block text-[11px] font-mono text-white/60 mb-1">
              OR DIRECT LOGO URL / FILE PATH:
            </label>
            <input
              type="text"
              value={logoUrl}
              onChange={(e) => {
                const val = e.target.value;
                setLogoUrl(val);
                if (autoSyncFavicon) setFaviconUrl(val);
              }}
              placeholder="e.g. /logo.svg or https://..."
              className="w-full px-3 py-2 bg-black border border-white/20 focus:border-[var(--color-gold)] rounded text-xs text-white outline-none font-mono"
            />
          </div>
        </div>

        {/* Auto Sync Toggle */}
        <div className="p-4 rounded-md bg-black/60 border border-white/10 flex items-center justify-between">
          <div className="space-y-0.5 pr-4">
            <div className="flex items-center gap-2">
              <Globe className="w-3.5 h-3.5 text-[var(--color-gold)]" />
              <span className="font-bold text-white text-xs uppercase tracking-wider">
                Auto-sync Logo as Favicon
              </span>
            </div>
            <p className="text-white/60 text-[11px]">
              Automatically updates the browser tab icon whenever you change or upload your primary logo.
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer shrink-0">
            <input
              type="checkbox"
              checked={autoSyncFavicon}
              onChange={(e) => {
                const checked = e.target.checked;
                setAutoSyncFavicon(checked);
                if (checked) setFaviconUrl(logoUrl);
              }}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-neutral-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[var(--color-gold)]"></div>
          </label>
        </div>

        {/* Dedicated Favicon Section (Visible if user wants customized favicon) */}
        {!autoSyncFavicon && (
          <div className="space-y-3 pt-3 border-t border-white/10">
            <div className="flex items-center justify-between">
              <label className="text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2">
                <Globe className="w-3.5 h-3.5 text-[var(--color-gold)]" />
                <span>Custom Browser Favicon (Optional)</span>
              </label>
              <span className="text-[10px] font-mono text-white/50">
                Recommended: 32×32 or 64×64 SVG/PNG
              </span>
            </div>

            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOverFavicon(true);
              }}
              onDragLeave={() => setDragOverFavicon(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOverFavicon(false);
                const file = e.dataTransfer.files?.[0];
                if (file) processImageFile(file, false);
              }}
              onClick={() => faviconFileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-all ${
                dragOverFavicon
                  ? 'border-[var(--color-gold)] bg-[var(--color-gold)]/10'
                  : 'border-white/20 hover:border-[var(--color-gold)]/60 bg-black/40'
              }`}
            >
              <input
                ref={faviconFileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFaviconFileChange}
              />
              <div className="flex items-center justify-center gap-3">
                <Upload className="w-4 h-4 text-[var(--color-gold)]" />
                <span className="text-white/80 text-xs">
                  Click to upload dedicated Favicon file
                </span>
              </div>
            </div>

            <input
              type="text"
              value={faviconUrl}
              onChange={(e) => setFaviconUrl(e.target.value)}
              placeholder="e.g. /favicon.svg or https://..."
              className="w-full px-3 py-2 bg-black border border-white/20 focus:border-[var(--color-gold)] rounded text-xs text-white outline-none font-mono"
            />
          </div>
        )}

        {/* Logo Alt Text */}
        <div>
          <label className="block text-[11px] font-mono text-white/60 mb-1">
            IMAGE ACCESSIBILITY ALT TEXT
          </label>
          <input
            type="text"
            value={logoAlt}
            onChange={(e) => setLogoAlt(e.target.value)}
            placeholder="e.g. AV Productions Film & Sound Studio"
            className="w-full px-3 py-2 bg-black border border-white/20 focus:border-[var(--color-gold)] rounded text-xs text-white outline-none"
          />
        </div>

        {/* Action Controls */}
        <div className="pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleResetToDefault}
            className="px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/15 rounded text-white/70 text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset to Default Logo</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="px-6 py-2.5 bg-[var(--color-gold)] text-black font-extrabold text-xs uppercase tracking-wider rounded flex items-center gap-2 cursor-pointer hover:brightness-110 transition-all shadow-md disabled:opacity-50"
          >
            {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            <span>{isSaving ? 'Applying...' : 'Save & Apply Brand Changes'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useRef } from 'react';
import { ClientLogo } from '../types';
import { INITIAL_CLIENT_LOGOS } from '../initialData';
import { uploadImageToSupabaseStorage } from '../supabase';
import { Plus, Trash2, Edit2, Check, X, Upload, Sparkles, RefreshCw, Eye } from 'lucide-react';

interface ClientLogosManagerProps {
  clientLogos: ClientLogo[];
  adminMutate: (
    action: 'create' | 'update' | 'delete',
    collection: string,
    id: string,
    payload: any,
    token?: string | null
  ) => Promise<{ success: boolean; error?: string }>;
  token: string | null;
  showToast: (msg: string) => void;
}

export const ClientLogosManager: React.FC<ClientLogosManagerProps> = ({
  clientLogos,
  adminMutate,
  token,
  showToast
}) => {
  const [editingLogo, setEditingLogo] = useState<Partial<ClientLogo> | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleOpenNew = () => {
    setEditingLogo({
      id: `client-${Date.now()}`,
      name: '',
      logoUrl: '',
      order: clientLogos.length + 1
    });
  };

  const processFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      showToast('Error: Please upload a valid image file (SVG, PNG, JPG, WebP)');
      return;
    }

    setIsUploading(true);
    showToast('Uploading partner logo to Supabase Storage...');
    const res = await uploadImageToSupabaseStorage(file, 'clients');
    setIsUploading(false);

    if (!res.success || !res.url) {
      showToast(`Upload failed: ${res.error || 'Could not upload logo'}`);
      return;
    }

    setEditingLogo(prev => ({
      ...prev,
      logoUrl: res.url,
      name: prev?.name || file.name.replace(/\.[^/.]+$/, '').toUpperCase()
    }));
    showToast('Logo uploaded to Supabase Storage!');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLogo?.name || !editingLogo?.logoUrl) {
      showToast('Please provide a partner name and logo image.');
      return;
    }

    setIsSaving(true);
    try {
      const id = editingLogo.id || `client-${Date.now()}`;
      const existing = clientLogos.find(c => c.id === id);
      const action = existing ? 'update' : 'create';

      const res = await adminMutate(action, 'client_logos', id, editingLogo, token);
      if (res.success) {
        showToast('Saved to live site');
        setEditingLogo(null);
      } else {
        showToast(`Save failed: ${res.error || 'Could not save to Supabase'}`);
      }
    } catch (err: any) {
      showToast(`Save failed: ${err?.message || 'Unexpected error'}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Remove "${name}" from client logo showcase?`)) return;

    try {
      const res = await adminMutate('delete', 'client_logos', id, null, token);
      if (res.success) {
        showToast('Saved to live site');
      } else {
        showToast(`Delete failed: ${res.error || 'Could not delete from Supabase'}`);
      }
    } catch (err: any) {
      showToast(`Delete failed: ${err?.message || 'Unexpected error'}`);
    }
  };

  const handleRestoreDefaults = async () => {
    if (!window.confirm('Restore default curated studio partner logos? This will save the default marquee list to Supabase.')) return;

    try {
      let failedError = '';
      for (const logo of INITIAL_CLIENT_LOGOS) {
        const res = await adminMutate('create', 'client_logos', logo.id, logo, token);
        if (!res.success && !failedError) failedError = res.error || 'Failed to save default logo';
      }
      if (failedError) {
        showToast(`Restore failed: ${failedError}`);
      } else {
        showToast('Saved to live site');
      }
    } catch (err: any) {
      showToast(`Restore failed: ${err?.message || 'Unexpected error'}`);
    }
  };

  return (
    <div className="space-y-6 text-xs">
      {/* Overview & Quick Actions */}
      <div className="p-5 rounded-lg border border-[var(--color-gold)]/30 bg-[#141414] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[var(--color-gold)] mb-1">
            <Sparkles className="w-4 h-4" />
            <h2 className="font-bold uppercase tracking-wider text-sm text-white">
              Brand & Client Partners Showcase ({clientLogos.length})
            </h2>
          </div>
          <p className="text-white/70 max-w-2xl text-xs">
            Manage the animated logo marquee featured on your homepage. Upload the logos of companies, production houses, and commercial brands you've collaborated with.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleRestoreDefaults}
            className="px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/15 rounded text-white/80 font-bold uppercase tracking-wider text-[11px] flex items-center gap-1.5 cursor-pointer transition-colors"
            title="Reload initial set of 12 luxury & studio brands"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>

          <button
            type="button"
            onClick={handleOpenNew}
            className="px-4 py-2 bg-[var(--color-gold)] text-black font-extrabold uppercase tracking-wider text-[11px] rounded flex items-center gap-1.5 cursor-pointer hover:brightness-110 transition-all shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>Add Brand Partner</span>
          </button>
        </div>
      </div>

      {/* Live Animated Preview Strip (Inside Admin) */}
      <div className="p-4 rounded-lg border border-white/10 bg-[#0e0e0e] space-y-3 overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono tracking-widest text-[var(--color-gold)] uppercase flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5" />
            <span>Live Animated Marquee Preview (Homepage View)</span>
          </span>
          <span className="text-[10px] font-mono text-white/40">
            Infinite 2-Row Opposite Motion Loop
          </span>
        </div>

        <div className="relative w-full overflow-hidden py-3 border-y border-white/5">
          <div className="pointer-events-none absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-[#0e0e0e] to-transparent z-10" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-[#0e0e0e] to-transparent z-10" />

          {/* Marquee Row preview */}
          <div className="flex w-fit overflow-hidden">
            <div className="animate-marquee-left flex items-center gap-4">
              {[...clientLogos, ...clientLogos].map((c, i) => (
                <div
                  key={`preview-${c.id}-${i}`}
                  className="flex h-14 w-28 shrink-0 items-center justify-center rounded-[8px] border border-white/10 bg-white/[0.04] px-3"
                >
                  {c.logoUrl ? (
                    <img
                      src={c.logoUrl}
                      alt={c.name}
                      className="max-h-8 max-w-full object-contain"
                    />
                  ) : (
                    <span className="text-[9px] font-bold text-white uppercase truncate">
                      {c.name}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Grid of Client Logos */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {clientLogos.map((client, index) => (
          <div
            key={client.id}
            className="group relative bg-[#141414] border border-white/10 hover:border-[var(--color-gold)]/50 rounded-lg p-3 flex flex-col items-center justify-between text-center transition-all hover:bg-white/[0.03]"
          >
            {/* Top order pill */}
            <div className="w-full flex items-center justify-between text-[10px] text-white/40 font-mono mb-2">
              <span>#{index + 1}</span>
              <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                <button
                  type="button"
                  onClick={() => setEditingLogo(client)}
                  className="text-white/60 hover:text-[var(--color-gold)] p-1 cursor-pointer"
                  title="Edit Partner"
                >
                  <Edit2 className="w-3 h-3" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(client.id, client.name)}
                  className="text-white/60 hover:text-red-400 p-1 cursor-pointer"
                  title="Delete Partner"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Logo Preview */}
            <div className="w-full h-20 flex items-center justify-center p-2 rounded bg-black/50 border border-white/5 my-1">
              {client.logoUrl ? (
                <img
                  src={client.logoUrl}
                  alt={client.name}
                  className="max-h-full max-w-full object-contain transition-transform group-hover:scale-105"
                />
              ) : (
                <span className="text-white/30 text-[10px] font-mono">No Logo</span>
              )}
            </div>

            {/* Brand Title */}
            <span className="font-bold text-[11px] text-white truncate max-w-full mt-2 block">
              {client.name}
            </span>
          </div>
        ))}
      </div>

      {/* Modal / Drawer for Adding / Editing Client Logo */}
      {editingLogo && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleSave}
            className="bg-[#141414] border border-[var(--color-gold)]/60 rounded-lg max-w-md w-full p-6 space-y-4 shadow-2xl text-xs"
          >
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="font-bold text-sm uppercase text-[var(--color-gold)]">
                {clientLogos.some(c => c.id === editingLogo.id) ? 'Edit Brand Partner' : 'New Brand Partner'}
              </h3>
              <button
                type="button"
                onClick={() => setEditingLogo(null)}
                className="text-white/50 hover:text-white p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Dropzone for Uploading Logo */}
            <div>
              <label className="block text-white/70 font-bold mb-1.5 uppercase tracking-wider text-[11px]">
                PARTNER LOGO IMAGE *
              </label>
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOver(false);
                  const file = e.dataTransfer.files?.[0];
                  if (file) processFile(file);
                }}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-lg p-5 text-center cursor-pointer transition-all ${
                  dragOver
                    ? 'border-[var(--color-gold)] bg-[var(--color-gold)]/10'
                    : 'border-white/20 hover:border-[var(--color-gold)]/60 bg-black/40'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) processFile(file);
                  }}
                />

                {editingLogo.logoUrl ? (
                  <div className="flex flex-col items-center gap-2">
                    <img
                      src={editingLogo.logoUrl}
                      alt="Logo preview"
                      className="h-14 max-w-full object-contain mx-auto"
                    />
                    <span className="text-[10px] text-[var(--color-gold)] underline">
                      Click to change image
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center gap-1.5">
                    <Upload className="w-5 h-5 text-[var(--color-gold)]" />
                    <span className="text-white text-xs font-semibold">
                      Click to upload logo file
                    </span>
                    <span className="text-white/40 text-[10px] font-mono">
                      SVG, PNG, or JPG (transparent recommended)
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Direct URL input */}
            <div>
              <label className="block text-white/60 mb-1 font-mono text-[10px]">
                OR IMAGE URL / PATH:
              </label>
              <input
                type="text"
                value={editingLogo.logoUrl || ''}
                onChange={(e) => setEditingLogo({ ...editingLogo, logoUrl: e.target.value })}
                placeholder="e.g. /clients/nike.svg or https://..."
                className="w-full px-3 py-2 bg-black border border-white/20 focus:border-[var(--color-gold)] rounded text-white font-mono text-xs outline-none"
              />
            </div>

            {/* Name */}
            <div>
              <label className="block text-white/70 font-bold mb-1 uppercase tracking-wider text-[11px]">
                BRAND / COMPANY NAME *
              </label>
              <input
                type="text"
                required
                value={editingLogo.name || ''}
                onChange={(e) => setEditingLogo({ ...editingLogo, name: e.target.value })}
                placeholder="e.g. Red Bull Media House"
                className="w-full px-3 py-2 bg-black border border-white/20 focus:border-[var(--color-gold)] rounded text-white text-xs outline-none"
              />
            </div>

            {/* Order */}
            <div>
              <label className="block text-white/70 font-bold mb-1 uppercase tracking-wider text-[11px]">
                DISPLAY SEQUENCE ORDER
              </label>
              <input
                type="number"
                value={editingLogo.order || 1}
                onChange={(e) => setEditingLogo({ ...editingLogo, order: parseInt(e.target.value) || 1 })}
                className="w-full px-3 py-2 bg-black border border-white/20 focus:border-[var(--color-gold)] rounded text-white text-xs outline-none"
              />
            </div>

            {/* Submit & Cancel */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => setEditingLogo(null)}
                className="px-3 py-2 bg-white/5 hover:bg-white/10 rounded text-white text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving || isUploading}
                className="px-4 py-2 bg-[var(--color-gold)] text-black font-extrabold uppercase tracking-wider rounded text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isSaving || isUploading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                <span>{isUploading ? 'Uploading...' : isSaving ? 'Saving...' : 'Save Brand Partner'}</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

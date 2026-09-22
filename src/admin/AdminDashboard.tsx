import React, { useState, useEffect, useRef } from 'react';
import { useData } from '../context/DataContext';
import {
  PortfolioItem,
  PortfolioCategory,
  Service,
  Milestone,
  BlogPost,
  Review,
  Booking,
  FAQ,
  ThemeTokens,
  SiteSettings
} from '../types';
import {
  Film,
  Calendar,
  Briefcase,
  FileText,
  Settings,
  LogOut,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  ExternalLink,
  Eye,
  EyeOff,
  ShieldCheck,
  Save,
  CheckCircle2,
  KeyRound,
  ShieldAlert,
  Search,
  MessageSquare,
  Copy,
  ChevronRight,
  Filter,
  Sparkles,
  RefreshCw,
  Database,
  CloudUpload,
  CloudDownload,
  Zap,
  Server,
  Megaphone
} from 'lucide-react';
import {
  getStoredAdminPassword,
  updateAdminPassword,
  getStoredSupabaseConfig,
  updateSupabaseConfig,
  clearSupabaseConfig,
  testSupabaseConnection,
  normalizeSupabaseUrl,
  SUPABASE_SQL_SCHEMA
} from '../supabase';

interface AdminDashboardProps {
  user: { email: string; id: string };
  token: string;
  onLogout: () => void;
  onViewPublicSite: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  user,
  token,
  onLogout,
  onViewPublicSite
}) => {
  const {
    siteSettings,
    themeTokens,
    milestones,
    services,
    categories,
    portfolioItems,
    reviews,
    bookings,
    faqs,
    blogPosts,
    blogComments,
    socialLinks,
    adminMutate,
    updateThemeTokens,
    refreshAdminData,
    syncAllToSupabase,
    syncFromSupabase
  } = useData();

  // Navigation tabs (Decluttered into 4 clean primary modules)
  const [activeTab, setActiveTab] = useState<'bookings' | 'portfolio' | 'content' | 'settings'>('bookings');

  // Sub-tabs
  const [portfolioSubTab, setPortfolioSubTab] = useState<'items' | 'categories' | 'services' | 'milestones'>('items');
  const [contentSubTab, setContentSubTab] = useState<'articles' | 'reviews' | 'faqs' | 'banner'>('articles');
  const [settingsSubTab, setSettingsSubTab] = useState<'security' | 'profile' | 'banner' | 'appearance' | 'database'>('security');

  // Supabase Configuration & Migration states
  const [supabaseUrlInput, setSupabaseUrlInput] = useState(() => getStoredSupabaseConfig().url);
  const [supabaseKeyInput, setSupabaseKeyInput] = useState(() => getStoredSupabaseConfig().anonKey);
  const [showSupabaseKey, setShowSupabaseKey] = useState(false);
  const [supabaseTesting, setSupabaseTesting] = useState(false);
  const [supabaseTestResult, setSupabaseTestResult] = useState<{ success: boolean; message: string; latencyMs?: number } | null>(null);
  const [supabaseMigrating, setSupabaseMigrating] = useState(false);
  const [supabaseMigrationResult, setSupabaseMigrationResult] = useState<{ success: boolean; message: string; counts?: Record<string, number>; errors?: string[] } | null>(null);
  const [supabaseSyncing, setSupabaseSyncing] = useState(false);
  const [supabaseSyncResult, setSupabaseSyncResult] = useState<{ success: boolean; message: string } | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);
  const [showSqlViewer, setShowSqlViewer] = useState(false);

  // Filter & Search states
  const [bookingFilter, setBookingFilter] = useState<'All' | 'New' | 'Approved' | 'Rescheduled' | 'Canceled'>('All');
  const [bookingSearch, setBookingSearch] = useState('');
  const [portfolioSearch, setPortfolioSearch] = useState('');
  const [portfolioCategoryFilter, setPortfolioCategoryFilter] = useState<string>('All');

  // Modal / Drawer state for editing
  const [editingItem, setEditingItem] = useState<Partial<PortfolioItem> | null>(null);
  const [editingCategory, setEditingCategory] = useState<Partial<PortfolioCategory> | null>(null);
  const [editingService, setEditingService] = useState<Partial<Service> | null>(null);
  const [editingMilestone, setEditingMilestone] = useState<Partial<Milestone> | null>(null);
  const [editingArticle, setEditingArticle] = useState<Partial<BlogPost> | null>(null);
  const [editingReview, setEditingReview] = useState<Partial<Review> | null>(null);
  const [editingFaq, setEditingFaq] = useState<Partial<FAQ> | null>(null);
  const [selectedBookingNotes, setSelectedBookingNotes] = useState<Booking | null>(null);
  const [bookingNotesDraft, setBookingNotesDraft] = useState('');

  // Password management
  const [currentPasswordInput, setCurrentPasswordInput] = useState('');
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [confirmPasswordInput, setConfirmPasswordInput] = useState('');
  const [passwordStatusMsg, setPasswordStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [generatedPasswordCopyToast, setGeneratedPasswordCopyToast] = useState(false);

  // Toast notifications
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Studio Settings form state
  const [studioProfile, setStudioProfile] = useState<SiteSettings>(siteSettings);
  useEffect(() => {
    setStudioProfile(siteSettings);
  }, [siteSettings]);

  const [isRefreshingBookings, setIsRefreshingBookings] = useState(false);
  const handleManualRefreshBookings = async () => {
    setIsRefreshingBookings(true);
    await refreshAdminData(token);
    setTimeout(() => {
      setIsRefreshingBookings(false);
      showToast('Live bookings synchronized successfully.');
    }, 400);
  };

  // Initial sync & periodic background refresh
  useEffect(() => {
    refreshAdminData(token);
  }, [token, refreshAdminData]);

  // Handle password update
  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordStatusMsg(null);
    const existing = getStoredAdminPassword();
    if (currentPasswordInput.trim() !== existing.trim()) {
      setPasswordStatusMsg({ type: 'error', text: 'Current password does not match.' });
      return;
    }
    if (newPasswordInput.trim().length < 6) {
      setPasswordStatusMsg({ type: 'error', text: 'New password must be at least 6 characters long.' });
      return;
    }
    if (newPasswordInput.trim() !== confirmPasswordInput.trim()) {
      setPasswordStatusMsg({ type: 'error', text: 'New password and confirmation do not match.' });
      return;
    }
    updateAdminPassword(newPasswordInput.trim());
    setPasswordStatusMsg({
      type: 'success',
      text: `Password updated to "${newPasswordInput.trim()}". Please record this password for your next login.`
    });
    setCurrentPasswordInput('');
    setNewPasswordInput('');
    setConfirmPasswordInput('');
    showToast('Admin password updated successfully.');
  };

  // Auto-generate strong password
  const handleAutoGeneratePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%&*';
    let pass = 'AV-';
    for (let i = 0; i < 10; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewPasswordInput(pass);
    setConfirmPasswordInput(pass);
    try {
      navigator.clipboard.writeText(pass);
      setGeneratedPasswordCopyToast(true);
      setTimeout(() => setGeneratedPasswordCopyToast(false), 2500);
    } catch {}
    showToast('Strong password generated and copied to clipboard.');
  };

  // Delete helpers (instant 0ms deletion with immediate UI response)
  const handleDeletePortfolioItem = async (id: string, title: string) => {
    if (window.confirm(`Delete "${title}"?`)) {
      await adminMutate('delete', 'portfolio_items', id, undefined, token);
      showToast(`"${title}" deleted successfully.`);
    }
  };

  const handleDeleteBooking = async (id: string, clientName: string) => {
    if (window.confirm(`Delete reservation for "${clientName}"?`)) {
      await adminMutate('delete', 'bookings', id, undefined, token);
      showToast(`Reservation for ${clientName} deleted.`);
    }
  };

  const handleDeleteCategory = async (id: string, name: string) => {
    if (window.confirm(`Delete category "${name}"?`)) {
      await adminMutate('delete', 'portfolio_categories', id, undefined, token);
      showToast(`Category "${name}" deleted.`);
    }
  };

  const handleDeleteService = async (id: string, title: string) => {
    if (window.confirm(`Delete service "${title}"?`)) {
      await adminMutate('delete', 'services', id, undefined, token);
      showToast(`Service "${title}" deleted.`);
    }
  };

  const handleDeleteMilestone = async (id: string, title: string) => {
    if (window.confirm(`Delete milestone "${title}"?`)) {
      await adminMutate('delete', 'milestones', id, undefined, token);
      showToast(`Milestone deleted.`);
    }
  };

  const handleDeleteArticle = async (id: string, title: string) => {
    if (window.confirm(`Delete article "${title}"?`)) {
      await adminMutate('delete', 'blog_posts', id, undefined, token);
      showToast(`Article deleted.`);
    }
  };

  const handleDeleteReview = async (id: string, author: string) => {
    if (window.confirm(`Delete review from "${author}"?`)) {
      await adminMutate('delete', 'reviews', id, undefined, token);
      showToast(`Review deleted.`);
    }
  };

  const handleDeleteFaq = async (id: string) => {
    if (window.confirm('Delete this FAQ entry?')) {
      await adminMutate('delete', 'faqs', id, undefined, token);
      showToast('FAQ entry deleted.');
    }
  };

  // Filtered Bookings
  const filteredBookings = bookings.filter((b) => {
    const matchesFilter = bookingFilter === 'All' || b.status === bookingFilter;
    const matchesSearch =
      !bookingSearch.trim() ||
      b.clientName.toLowerCase().includes(bookingSearch.toLowerCase()) ||
      b.email.toLowerCase().includes(bookingSearch.toLowerCase()) ||
      b.serviceName.toLowerCase().includes(bookingSearch.toLowerCase()) ||
      (b.projectDescription || '').toLowerCase().includes(bookingSearch.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const newBookingsCount = bookings.filter((b) => b.status === 'New').length;

  // Filtered Portfolio items
  const filteredPortfolioItems = portfolioItems.filter((item) => {
    const matchesCategory = portfolioCategoryFilter === 'All' || item.categoryId === portfolioCategoryFilter;
    const matchesSearch =
      !portfolioSearch.trim() ||
      item.title.toLowerCase().includes(portfolioSearch.toLowerCase()) ||
      (item.description || '').toLowerCase().includes(portfolioSearch.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Save Advertisement & Announcement Banner handler
  const [isSavingBanner, setIsSavingBanner] = useState(false);
  const handleSaveBanner = async () => {
    setIsSavingBanner(true);
    try {
      await adminMutate('update', 'site_settings', 'active', studioProfile, token);
      showToast('Announcement & advertisement banner saved and published successfully.');
    } catch {
      showToast('Error saving banner. Please try again.');
    } finally {
      setIsSavingBanner(false);
    }
  };

  const renderAdvertisementBannerEditor = () => (
    <div className="max-w-3xl p-6 rounded-lg border border-white/10 bg-[#141414] space-y-6 text-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded bg-black border border-[var(--color-gold)]/40 flex items-center justify-center text-[var(--color-gold)] shrink-0 shadow-sm">
            <Megaphone className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold uppercase text-sm text-white flex items-center gap-2">
              Top Advertisement & Announcement Banner
            </h2>
            <p className="text-white/60 text-xs mt-0.5">
              Displays a high-impact announcement bar at the very top of all website pages for promotions or notices.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
              studioProfile.promoBannerEnabled
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                : 'bg-white/10 text-white/50 border border-white/15'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                studioProfile.promoBannerEnabled ? 'bg-emerald-400 animate-pulse' : 'bg-white/40'
              }`}
            />
            {studioProfile.promoBannerEnabled ? 'Active on Website' : 'Disabled / Hidden'}
          </span>
        </div>
      </div>

      {/* Visibility Toggle */}
      <div className="flex items-center justify-between p-4 rounded-lg bg-black/60 border border-white/10">
        <div>
          <label className="font-bold text-white text-xs block">
            SHOW BANNER ON WEBSITE
          </label>
          <p className="text-white/50 text-[11px] mt-0.5">
            When turned ON, this banner appears above the navigation header on both desktop and mobile devices.
          </p>
        </div>
        <button
          type="button"
          onClick={() =>
            setStudioProfile(prev => ({
              ...prev,
              promoBannerEnabled: !prev.promoBannerEnabled
            }))
          }
          className={`relative inline-flex h-6 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
            studioProfile.promoBannerEnabled ? 'bg-[var(--color-gold)]' : 'bg-white/20'
          }`}
          role="switch"
          aria-checked={studioProfile.promoBannerEnabled}
        >
          <span
            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-black shadow-md ring-0 transition duration-200 ease-in-out ${
              studioProfile.promoBannerEnabled ? 'translate-x-6' : 'translate-x-0'
            }`}
          />
        </button>
      </div>

      {/* Live Banner Preview */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-white/60 font-semibold tracking-wider text-[11px] uppercase">
            LIVE PREVIEW (HOW VISITORS SEE IT ON SITE)
          </label>
          <span className="text-[10px] text-[var(--color-gold)] font-mono">
            {studioProfile.promoBannerEnabled ? '● Currently Live on Site' : '○ Currently Inactive'}
          </span>
        </div>
        <div
          className={`w-full p-3 rounded border text-center text-xs font-mono tracking-wider transition-all flex items-center justify-center gap-2 ${
            studioProfile.promoBannerEnabled
              ? 'bg-[#0d0d0c] border-[var(--color-gold)]/50 text-[var(--color-gold)] shadow-md'
              : 'bg-black/40 border-dashed border-white/20 text-white/40'
          }`}
        >
          <Megaphone className="w-3.5 h-3.5 shrink-0 opacity-75" />
          <span className="truncate">
            {studioProfile.promoBannerText || 'Enter announcement message below...'}
          </span>
        </div>
      </div>

      {/* Banner Message Input */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="block text-white/80 font-bold tracking-wider uppercase text-[11px]">
            ANNOUNCEMENT / ADVERTISEMENT MESSAGE
          </label>
          <span className="text-white/40 text-[10px] font-mono">
            {(studioProfile.promoBannerText || '').length} characters (recommended: 30 - 100)
          </span>
        </div>
        <textarea
          rows={3}
          value={studioProfile.promoBannerText || ''}
          onChange={(e) =>
            setStudioProfile(prev => ({
              ...prev,
              promoBannerText: e.target.value
            }))
          }
          placeholder="e.g., Now accepting bookings for Autumn 2026 commercial & narrative production cycles."
          className="w-full px-3 py-2.5 bg-black border border-white/20 rounded text-white text-xs focus:border-[var(--color-gold)] focus:outline-none leading-relaxed"
        />
      </div>

      {/* One-Click Presets */}
      <div className="space-y-2">
        <label className="block text-white/50 text-[10px] uppercase tracking-wider font-semibold">
          QUICK TEMPLATES & INSPIRATION (CLICK TO LOAD)
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() =>
              setStudioProfile(prev => ({
                ...prev,
                promoBannerEnabled: true,
                promoBannerText: 'Now accepting bookings for Autumn 2026 commercial & narrative production cycles.'
              }))
            }
            className="text-left p-2.5 rounded bg-black/40 hover:bg-black/80 border border-white/10 hover:border-[var(--color-gold)]/50 text-white/80 text-[11px] transition-colors cursor-pointer group"
          >
            <span className="font-bold text-[var(--color-gold)] block text-[10px] uppercase">
              Booking Season Open
            </span>
            <span className="text-white/60 group-hover:text-white line-clamp-1">
              Now accepting bookings for Autumn 2026 commercial & narrative production cycles.
            </span>
          </button>

          <button
            type="button"
            onClick={() =>
              setStudioProfile(prev => ({
                ...prev,
                promoBannerEnabled: true,
                promoBannerText: 'Special limited-time offer: 15% discount on multi-day 4K commercial and narrative shoots.'
              }))
            }
            className="text-left p-2.5 rounded bg-black/40 hover:bg-black/80 border border-white/10 hover:border-[var(--color-gold)]/50 text-white/80 text-[11px] transition-colors cursor-pointer group"
          >
            <span className="font-bold text-[var(--color-gold)] block text-[10px] uppercase">
              Special Promo / Discount
            </span>
            <span className="text-white/60 group-hover:text-white line-clamp-1">
              Special limited-time offer: 15% discount on multi-day 4K commercial shoots.
            </span>
          </button>

          <button
            type="button"
            onClick={() =>
              setStudioProfile(prev => ({
                ...prev,
                promoBannerEnabled: true,
                promoBannerText: 'New cinema gear in inventory: ARRI Alexa 35 & Cooke Anamorphic /i lenses ready for hire.'
              }))
            }
            className="text-left p-2.5 rounded bg-black/40 hover:bg-black/80 border border-white/10 hover:border-[var(--color-gold)]/50 text-white/80 text-[11px] transition-colors cursor-pointer group"
          >
            <span className="font-bold text-[var(--color-gold)] block text-[10px] uppercase">
              Cinema Gear Upgrade
            </span>
            <span className="text-white/60 group-hover:text-white line-clamp-1">
              New cinema gear in inventory: ARRI Alexa 35 & Cooke Anamorphic /i lenses.
            </span>
          </button>

          <button
            type="button"
            onClick={() =>
              setStudioProfile(prev => ({
                ...prev,
                promoBannerEnabled: true,
                promoBannerText: 'Film & Sound stages fully booked this weekend for private premiere screening.'
              }))
            }
            className="text-left p-2.5 rounded bg-black/40 hover:bg-black/80 border border-white/10 hover:border-[var(--color-gold)]/50 text-white/80 text-[11px] transition-colors cursor-pointer group"
          >
            <span className="font-bold text-[var(--color-gold)] block text-[10px] uppercase">
              Studio Schedule Notice
            </span>
            <span className="text-white/60 group-hover:text-white line-clamp-1">
              Film & Sound stages fully booked this weekend for private premiere screening.
            </span>
          </button>
        </div>
      </div>

      {/* Save Action */}
      <div className="pt-4 border-t border-white/10 flex items-center justify-between">
        <button
          type="button"
          disabled={isSavingBanner}
          onClick={handleSaveBanner}
          className="px-5 py-2.5 bg-[var(--color-gold)] text-black font-bold text-xs uppercase tracking-wider rounded flex items-center gap-2 cursor-pointer hover:brightness-105 transition-all shadow-xs disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{isSavingBanner ? 'Saving...' : 'Save & Publish Banner'}</span>
        </button>

        {studioProfile.promoBannerEnabled && (
          <button
            type="button"
            onClick={async () => {
              const updated = { ...studioProfile, promoBannerEnabled: false };
              setStudioProfile(updated);
              await adminMutate('update', 'site_settings', 'active', updated, token);
              showToast('Announcement banner disabled and hidden from website.');
            }}
            className="px-3 py-2 text-white/50 hover:text-rose-400 text-xs transition-colors cursor-pointer"
          >
            Disable & Hide Banner
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#ededed] flex flex-col font-sans">
      {/* Toast Banner */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 px-4 py-3 bg-[var(--color-gold)] text-black font-semibold text-xs uppercase tracking-wider rounded shadow-2xl flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Clean, Decluttered Header */}
      <header className="sticky top-0 z-40 bg-[#111111] border-b border-white/10 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded border border-[var(--color-gold)] bg-black flex items-center justify-center text-[var(--color-gold)] shadow-sm">
            <Film className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold tracking-wider text-sm text-white uppercase leading-none">
                AV BACKSTAGE
              </span>
              <span className="px-1.5 py-0.5 rounded bg-[var(--color-gold)]/15 border border-[var(--color-gold)]/30 text-[10px] font-mono text-[var(--color-gold)] uppercase font-semibold">
                Studio Portal
              </span>
            </div>
            <span className="text-[11px] text-white/50 block mt-0.5 font-mono">
              {user.email}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            id="admin-view-site-btn"
            onClick={onViewPublicSite}
            className="px-3.5 py-1.5 border border-white/20 hover:border-[var(--color-gold)] hover:text-[var(--color-gold)] rounded text-xs font-semibold uppercase tracking-wider text-white/90 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <span>Live Site</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
          <button
            id="admin-logout-btn"
            onClick={onLogout}
            className="px-3.5 py-1.5 bg-red-950/40 border border-red-800/60 hover:bg-red-900/60 text-red-200 rounded text-xs font-semibold uppercase tracking-wider transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </header>

      {/* Primary Navigation Tabs */}
      <div className="bg-[#0e0e0e] border-b border-white/10 px-4 sm:px-8">
        <div className="flex items-center gap-2 overflow-x-auto py-2.5 scrollbar-none">
          <button
            id="tab-btn-bookings"
            onClick={() => setActiveTab('bookings')}
            className={`px-4 py-2 rounded text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
              activeTab === 'bookings'
                ? 'bg-[var(--color-gold)] text-black shadow-md font-extrabold'
                : 'text-white/70 hover:text-white hover:bg-white/5'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Bookings & Inquiries</span>
            {newBookingsCount > 0 && (
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
                activeTab === 'bookings' ? 'bg-black text-[var(--color-gold)]' : 'bg-[var(--color-gold)] text-black'
              }`}>
                {newBookingsCount}
              </span>
            )}
          </button>

          <button
            id="tab-btn-portfolio"
            onClick={() => setActiveTab('portfolio')}
            className={`px-4 py-2 rounded text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
              activeTab === 'portfolio'
                ? 'bg-[var(--color-gold)] text-black shadow-md font-extrabold'
                : 'text-white/70 hover:text-white hover:bg-white/5'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span>Portfolio & Works</span>
            <span className="text-[10px] font-mono opacity-80">({portfolioItems.length})</span>
          </button>

          <button
            id="tab-btn-content"
            onClick={() => setActiveTab('content')}
            className={`px-4 py-2 rounded text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
              activeTab === 'content'
                ? 'bg-[var(--color-gold)] text-black shadow-md font-extrabold'
                : 'text-white/70 hover:text-white hover:bg-white/5'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Journal & Reviews</span>
          </button>

          <button
            id="tab-btn-settings"
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2 rounded text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
              activeTab === 'settings'
                ? 'bg-[var(--color-gold)] text-black shadow-md font-extrabold'
                : 'text-white/70 hover:text-white hover:bg-white/5'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Settings & Security</span>
          </button>
        </div>
      </div>

      {/* Main Content Workspace */}
      <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
        {/* =========================================================================
            TAB 1: BOOKINGS & INQUIRIES
           ========================================================================= */}
        {activeTab === 'bookings' && (
          <div className="space-y-6">
            {/* Header & Stats Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/10">
              <div>
                <h1 className="text-2xl font-bold uppercase text-white tracking-tight">
                  Client Reservations
                </h1>
                <p className="text-xs text-white/60 mt-0.5">
                  Review production dates, approve reservations, manage briefs, and view client contact details.
                </p>
              </div>

              {/* Quick Status Badges */}
              <div className="flex items-center gap-2 flex-wrap text-xs">
                <div className="px-2.5 py-1.5 rounded bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-1.5 text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span className="font-semibold uppercase tracking-wider text-[10px]">Live Sync</span>
                </div>
                <div className="px-3 py-1.5 rounded bg-[#141414] border border-white/10 flex items-center gap-2">
                  <span className="text-white/50">Total:</span>
                  <strong className="font-mono text-white">{bookings.length}</strong>
                </div>
                <div className="px-3 py-1.5 rounded bg-[var(--color-gold)]/10 border border-[var(--color-gold)]/30 flex items-center gap-2">
                  <span className="text-[var(--color-gold)]">New:</span>
                  <strong className="font-mono text-[var(--color-gold)] font-bold">{newBookingsCount}</strong>
                </div>
                <button
                  type="button"
                  onClick={handleManualRefreshBookings}
                  disabled={isRefreshingBookings}
                  className="px-3 py-1.5 rounded bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white/80 hover:text-white flex items-center gap-1.5 transition-all text-xs cursor-pointer active:scale-95 disabled:opacity-50"
                  title="Force synchronize live reservations from server"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isRefreshingBookings ? 'animate-spin text-[var(--color-gold)]' : ''}`} />
                  <span>{isRefreshingBookings ? 'Syncing...' : 'Sync Now'}</span>
                </button>
              </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
              {/* Filter Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto p-1 bg-[#141414] rounded border border-white/10">
                {(['All', 'New', 'Approved', 'Rescheduled', 'Canceled'] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setBookingFilter(filter)}
                    className={`px-3 py-1 rounded text-xs uppercase font-semibold transition-all cursor-pointer ${
                      bookingFilter === filter
                        ? 'bg-[var(--color-gold)] text-black font-bold'
                        : 'text-white/60 hover:text-white'
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>

              {/* Search */}
              <div className="relative max-w-xs w-full">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                <input
                  type="text"
                  placeholder="Search client, email, service..."
                  value={bookingSearch}
                  onChange={(e) => setBookingSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-[#141414] border border-white/15 focus:border-[var(--color-gold)] rounded text-xs text-white placeholder-white/40 outline-none"
                />
              </div>
            </div>

            {/* Bookings Table / List */}
            {filteredBookings.length === 0 ? (
              <div className="p-12 text-center border border-white/10 rounded-lg bg-[#111] text-white/50">
                <Calendar className="w-8 h-8 mx-auto mb-3 opacity-30 text-[var(--color-gold)]" />
                <p className="text-sm font-medium text-white/80">No reservations match this filter.</p>
                <p className="text-xs mt-1 text-white/50">
                  New reservations submitted through the booking form appear here automatically.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredBookings.map((b) => (
                  <div
                    key={b.id}
                    className="p-5 rounded-lg border border-white/10 bg-[#141414] hover:border-white/20 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                  >
                    {/* Client & Booking Info */}
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="font-bold text-white text-base">{b.clientName}</span>
                        <span
                          className={`px-2.5 py-0.5 rounded text-[10px] font-mono uppercase font-bold ${
                            b.status === 'New'
                              ? 'bg-[var(--color-gold)]/20 text-[var(--color-gold)] border border-[var(--color-gold)]/40'
                              : b.status === 'Approved'
                              ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/40'
                              : b.status === 'Rescheduled'
                              ? 'bg-blue-950/60 text-blue-300 border border-blue-500/40'
                              : 'bg-red-950/60 text-red-300 border border-red-500/40'
                          }`}
                        >
                          {b.status}
                        </span>
                        <span className="text-[11px] font-mono text-white/40">
                          {new Date(b.createdAt).toLocaleDateString()} at {new Date(b.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      <div className="flex items-center gap-4 text-xs text-white/70 flex-wrap">
                        <div>
                          <strong className="text-white/40 uppercase font-mono text-[10px] mr-1.5">Service:</strong>
                          <span className="text-[var(--color-gold)] font-medium">{b.serviceName}</span>
                        </div>
                        <div>
                          <strong className="text-white/40 uppercase font-mono text-[10px] mr-1.5">Date:</strong>
                          <span className="text-white font-medium">
                            {b.dateValue} {b.endDateValue ? `to ${b.endDateValue}` : ''}
                          </span>
                        </div>
                        <div>
                          <strong className="text-white/40 uppercase font-mono text-[10px] mr-1.5">Contact:</strong>
                          <a href={`mailto:${b.email}`} className="text-white hover:underline mr-2">{b.email}</a>
                          <a href={`tel:${b.phone}`} className="text-white/60 hover:underline">{b.phone}</a>
                        </div>
                      </div>

                      {b.projectDescription && (
                        <p className="text-xs text-white/80 bg-black/40 p-2.5 rounded border border-white/5 italic line-clamp-2 mt-1">
                          "{b.projectDescription}"
                        </p>
                      )}

                      {b.adminNotes && (
                        <div className="text-xs text-[var(--color-gold)]/90 bg-[var(--color-gold)]/5 p-2 rounded border border-[var(--color-gold)]/20 mt-1 flex items-start gap-1.5">
                          <MessageSquare className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                          <span><strong>Internal Note:</strong> {b.adminNotes}</span>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 shrink-0 self-end lg:self-center">
                      {b.status !== 'Approved' && (
                        <button
                          onClick={async () => {
                            await adminMutate('update', 'bookings', b.id, { status: 'Approved' }, token);
                            showToast(`Reservation for ${b.clientName} approved.`);
                          }}
                          className="px-3 py-1.5 bg-emerald-950/50 hover:bg-emerald-900/60 border border-emerald-500/50 text-emerald-300 rounded text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer"
                        >
                          Approve
                        </button>
                      )}

                      {b.status !== 'Rescheduled' && (
                        <button
                          onClick={async () => {
                            await adminMutate('update', 'bookings', b.id, { status: 'Rescheduled' }, token);
                            showToast(`Reservation for ${b.clientName} marked rescheduled.`);
                          }}
                          className="px-3 py-1.5 bg-blue-950/50 hover:bg-blue-900/60 border border-blue-500/50 text-blue-300 rounded text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer"
                        >
                          Reschedule
                        </button>
                      )}

                      {b.status !== 'Canceled' && (
                        <button
                          onClick={async () => {
                            await adminMutate('update', 'bookings', b.id, { status: 'Canceled' }, token);
                            showToast(`Reservation for ${b.clientName} canceled.`);
                          }}
                          className="px-3 py-1.5 bg-red-950/40 hover:bg-red-900/50 border border-red-800/60 text-red-300 rounded text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer"
                        >
                          Cancel
                        </button>
                      )}

                      <button
                        onClick={() => {
                          setSelectedBookingNotes(b);
                          setBookingNotesDraft(b.adminNotes || '');
                        }}
                        className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/20 text-white rounded text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer"
                      >
                        Notes
                      </button>

                      <button
                        onClick={() => handleDeleteBooking(b.id, b.clientName)}
                        className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-950/30 rounded transition-colors cursor-pointer"
                        title="Delete reservation"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* =========================================================================
            TAB 2: PORTFOLIO & WORKS
           ========================================================================= */}
        {activeTab === 'portfolio' && (
          <div className="space-y-6">
            {/* Header & Subtabs */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/10">
              <div className="flex items-center gap-2 overflow-x-auto">
                <button
                  onClick={() => setPortfolioSubTab('items')}
                  className={`px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                    portfolioSubTab === 'items'
                      ? 'bg-[var(--color-gold)] text-black'
                      : 'text-white/60 hover:text-white bg-[#141414]'
                  }`}
                >
                  Portfolio Works ({portfolioItems.length})
                </button>
                <button
                  onClick={() => setPortfolioSubTab('categories')}
                  className={`px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                    portfolioSubTab === 'categories'
                      ? 'bg-[var(--color-gold)] text-black'
                      : 'text-white/60 hover:text-white bg-[#141414]'
                  }`}
                >
                  Categories ({categories.length})
                </button>
                <button
                  onClick={() => setPortfolioSubTab('services')}
                  className={`px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                    portfolioSubTab === 'services'
                      ? 'bg-[var(--color-gold)] text-black'
                      : 'text-white/60 hover:text-white bg-[#141414]'
                  }`}
                >
                  Services ({services.length})
                </button>
                <button
                  onClick={() => setPortfolioSubTab('milestones')}
                  className={`px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                    portfolioSubTab === 'milestones'
                      ? 'bg-[var(--color-gold)] text-black'
                      : 'text-white/60 hover:text-white bg-[#141414]'
                  }`}
                >
                  Milestones ({milestones.length})
                </button>
              </div>

              {/* Action Button */}
              {portfolioSubTab === 'items' && (
                <button
                  onClick={() =>
                    setEditingItem({
                      title: '',
                      categoryId: categories[0]?.id || '',
                      mediaType: 'photo',
                      mediaUrl: '',
                      description: '',
                      featured: false,
                      order: portfolioItems.length + 1
                    })
                  }
                  className="px-4 py-2 bg-[var(--color-gold)] text-black text-xs font-bold uppercase tracking-wider rounded flex items-center gap-1.5 cursor-pointer shadow-md self-start sm:self-auto"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Work Item</span>
                </button>
              )}

              {portfolioSubTab === 'categories' && (
                <button
                  onClick={() => setEditingCategory({ name: '', slug: '', description: '' })}
                  className="px-4 py-2 bg-[var(--color-gold)] text-black text-xs font-bold uppercase tracking-wider rounded flex items-center gap-1.5 cursor-pointer shadow-md self-start sm:self-auto"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Category</span>
                </button>
              )}

              {portfolioSubTab === 'services' && (
                <button
                  onClick={() =>
                    setEditingService({
                      title: '',
                      shortDescription: '',
                      detailedDescription: '',
                      categoryId: categories[0]?.id || '',
                      order: services.length + 1
                    })
                  }
                  className="px-4 py-2 bg-[var(--color-gold)] text-black text-xs font-bold uppercase tracking-wider rounded flex items-center gap-1.5 cursor-pointer shadow-md self-start sm:self-auto"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Service</span>
                </button>
              )}

              {portfolioSubTab === 'milestones' && (
                <button
                  onClick={() =>
                    setEditingMilestone({
                      year: new Date().getFullYear().toString(),
                      title: '',
                      description: '',
                      order: milestones.length + 1
                    })
                  }
                  className="px-4 py-2 bg-[var(--color-gold)] text-black text-xs font-bold uppercase tracking-wider rounded flex items-center gap-1.5 cursor-pointer shadow-md self-start sm:self-auto"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Milestone</span>
                </button>
              )}
            </div>

            {/* 2.A: Portfolio Items Grid */}
            {portfolioSubTab === 'items' && (
              <div className="space-y-4">
                {/* Search & Category Filter */}
                <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
                  <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
                    <button
                      onClick={() => setPortfolioCategoryFilter('All')}
                      className={`px-3 py-1 rounded text-xs uppercase font-semibold transition-colors cursor-pointer shrink-0 ${
                        portfolioCategoryFilter === 'All'
                          ? 'bg-white/20 text-white font-bold'
                          : 'text-white/60 hover:text-white bg-[#141414]'
                      }`}
                    >
                      All ({portfolioItems.length})
                    </button>
                    {categories.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => setPortfolioCategoryFilter(c.id)}
                        className={`px-3 py-1 rounded text-xs uppercase font-semibold transition-colors cursor-pointer shrink-0 ${
                          portfolioCategoryFilter === c.id
                            ? 'bg-white/20 text-white font-bold'
                            : 'text-white/60 hover:text-white bg-[#141414]'
                        }`}
                      >
                        {c.name}
                      </button>
                    ))}
                  </div>

                  <div className="relative max-w-xs w-full">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                    <input
                      type="text"
                      placeholder="Search works..."
                      value={portfolioSearch}
                      onChange={(e) => setPortfolioSearch(e.target.value)}
                      className="w-full pl-9 pr-3 py-1.5 bg-[#141414] border border-white/15 focus:border-[var(--color-gold)] rounded text-xs text-white placeholder-white/40 outline-none"
                    />
                  </div>
                </div>

                {/* Items Grid */}
                {filteredPortfolioItems.length === 0 ? (
                  <div className="p-12 text-center border border-white/10 rounded-lg bg-[#111] text-white/50">
                    <p className="text-sm font-medium text-white/80">No portfolio items found.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredPortfolioItems.map((item) => {
                      const cat = categories.find((c) => c.id === item.categoryId);
                      return (
                        <div
                          key={item.id}
                          className="rounded-lg border border-white/10 bg-[#141414] overflow-hidden hover:border-white/20 transition-all flex flex-col justify-between"
                        >
                          <div>
                            {/* Media preview thumbnail */}
                            <div className="relative aspect-video bg-black/60 overflow-hidden flex items-center justify-center">
                              {item.mediaType === 'photo' && item.mediaUrl ? (
                                <img
                                  src={item.mediaUrl}
                                  alt={item.title}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    (e.target as HTMLElement).style.display = 'none';
                                  }}
                                />
                              ) : (
                                <div className="text-white/40 flex flex-col items-center gap-1">
                                  <Film className="w-6 h-6 text-[var(--color-gold)] opacity-70" />
                                  <span className="text-[10px] uppercase font-mono tracking-wider">{item.mediaType}</span>
                                </div>
                              )}
                              <span className="absolute top-2 right-2 px-2 py-0.5 rounded bg-black/80 text-[10px] font-mono text-[var(--color-gold)] uppercase font-semibold border border-white/10">
                                {item.mediaType}
                              </span>
                              {item.featured && (
                                <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-[var(--color-gold)] text-black text-[10px] font-bold uppercase">
                                  Featured
                                </span>
                              )}
                            </div>

                            {/* Info */}
                            <div className="p-4 space-y-1">
                              <span className="text-[10px] font-mono text-[var(--color-gold)] uppercase tracking-wider block">
                                {cat?.name || 'General'}
                              </span>
                              <h3 className="font-bold text-white text-sm line-clamp-1">{item.title}</h3>
                              {item.description && (
                                <p className="text-xs text-white/60 line-clamp-2 leading-relaxed">{item.description}</p>
                              )}
                            </div>
                          </div>

                          {/* Card Footer Actions */}
                          <div className="p-3 border-t border-white/10 bg-black/30 flex items-center justify-between">
                            <span className="text-[10px] font-mono text-white/40">Order: #{item.order}</span>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => setEditingItem(item)}
                                className="px-2.5 py-1 text-xs text-[var(--color-gold)] hover:bg-[var(--color-gold)]/10 rounded transition-colors flex items-center gap-1 cursor-pointer font-medium"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                                <span>Edit</span>
                              </button>
                              <button
                                onClick={() => handleDeletePortfolioItem(item.id, item.title)}
                                className="px-2.5 py-1 text-xs text-red-400 hover:bg-red-950/30 rounded transition-colors flex items-center gap-1 cursor-pointer font-medium"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Delete</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* 2.B: Categories */}
            {portfolioSubTab === 'categories' && (
              <div className="space-y-3">
                {categories.map((c) => (
                  <div
                    key={c.id}
                    className="p-4 rounded-lg border border-white/10 bg-[#141414] flex items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">{c.name}</span>
                        <span className="text-xs font-mono text-[var(--color-gold)]">/{c.slug}</span>
                      </div>
                      {c.description && <p className="text-xs text-white/60 mt-0.5">{c.description}</p>}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setEditingCategory(c)}
                        className="px-2.5 py-1 text-xs text-[var(--color-gold)] hover:bg-[var(--color-gold)]/10 rounded transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" /> Edit
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(c.id, c.name)}
                        className="px-2.5 py-1 text-xs text-red-400 hover:bg-red-950/30 rounded transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 2.C: Services */}
            {portfolioSubTab === 'services' && (
              <div className="space-y-3">
                {services.map((s) => (
                  <div
                    key={s.id}
                    className="p-4 rounded-lg border border-white/10 bg-[#141414] flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">{s.title}</span>
                        <span className="text-[10px] font-mono text-[var(--color-gold)] px-2 py-0.5 rounded bg-black/60 border border-white/10">
                          Order #{s.order}
                        </span>
                      </div>
                      <p className="text-xs text-white/70">{s.shortDescription}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                      <button
                        onClick={() => setEditingService(s)}
                        className="px-2.5 py-1 text-xs text-[var(--color-gold)] hover:bg-[var(--color-gold)]/10 rounded transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" /> Edit
                      </button>
                      <button
                        onClick={() => handleDeleteService(s.id, s.title)}
                        className="px-2.5 py-1 text-xs text-red-400 hover:bg-red-950/30 rounded transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 2.D: Milestones */}
            {portfolioSubTab === 'milestones' && (
              <div className="space-y-3">
                {milestones.map((m) => (
                  <div
                    key={m.id}
                    className="p-4 rounded-lg border border-white/10 bg-[#141414] flex items-center justify-between gap-4"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-[var(--color-gold)] font-bold">{m.year}</span>
                        <span className="font-bold text-white text-sm">{m.title}</span>
                      </div>
                      <p className="text-xs text-white/60">{m.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setEditingMilestone(m)}
                        className="px-2.5 py-1 text-xs text-[var(--color-gold)] hover:bg-[var(--color-gold)]/10 rounded transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" /> Edit
                      </button>
                      <button
                        onClick={() => handleDeleteMilestone(m.id, m.title)}
                        className="px-2.5 py-1 text-xs text-red-400 hover:bg-red-950/30 rounded transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* =========================================================================
            TAB 3: JOURNAL & REVIEWS
           ========================================================================= */}
        {activeTab === 'content' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/10">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setContentSubTab('articles')}
                  className={`px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                    contentSubTab === 'articles'
                      ? 'bg-[var(--color-gold)] text-black'
                      : 'text-white/60 hover:text-white bg-[#141414]'
                  }`}
                >
                  Articles ({blogPosts.length})
                </button>
                <button
                  onClick={() => setContentSubTab('reviews')}
                  className={`px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                    contentSubTab === 'reviews'
                      ? 'bg-[var(--color-gold)] text-black'
                      : 'text-white/60 hover:text-white bg-[#141414]'
                  }`}
                >
                  Reviews ({reviews.length})
                </button>
                <button
                  onClick={() => setContentSubTab('faqs')}
                  className={`px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                    contentSubTab === 'faqs'
                      ? 'bg-[var(--color-gold)] text-black'
                      : 'text-white/60 hover:text-white bg-[#141414]'
                  }`}
                >
                  FAQs ({faqs.length})
                </button>
                <button
                  onClick={() => setContentSubTab('banner')}
                  className={`px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1.5 ${
                    contentSubTab === 'banner'
                      ? 'bg-[var(--color-gold)] text-black'
                      : 'text-white/60 hover:text-white bg-[#141414]'
                  }`}
                >
                  <Megaphone className="w-3.5 h-3.5" />
                  <span>Advertisement Banner</span>
                  {studioProfile.promoBannerEnabled && (
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  )}
                </button>
              </div>

              {contentSubTab === 'articles' && (
                <button
                  onClick={() =>
                    setEditingArticle({
                      title: '',
                      slug: '',
                      excerpt: '',
                      content: '',
                      author: 'AV Studio',
                      category: 'Production',
                      readTime: '4 min'
                    })
                  }
                  className="px-4 py-2 bg-[var(--color-gold)] text-black text-xs font-bold uppercase tracking-wider rounded flex items-center gap-1.5 cursor-pointer shadow-md self-start sm:self-auto"
                >
                  <Plus className="w-4 h-4" />
                  <span>Write Article</span>
                </button>
              )}

              {contentSubTab === 'reviews' && (
                <button
                  onClick={() =>
                    setEditingReview({
                      author: '',
                      company: '',
                      rating: 5,
                      text: ''
                    })
                  }
                  className="px-4 py-2 bg-[var(--color-gold)] text-black text-xs font-bold uppercase tracking-wider rounded flex items-center gap-1.5 cursor-pointer shadow-md self-start sm:self-auto"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Review</span>
                </button>
              )}

              {contentSubTab === 'faqs' && (
                <button
                  onClick={() =>
                    setEditingFaq({
                      question: '',
                      answer: '',
                      category: 'General',
                      order: faqs.length + 1
                    })
                  }
                  className="px-4 py-2 bg-[var(--color-gold)] text-black text-xs font-bold uppercase tracking-wider rounded flex items-center gap-1.5 cursor-pointer shadow-md self-start sm:self-auto"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add FAQ</span>
                </button>
              )}
            </div>

            {/* Articles */}
            {contentSubTab === 'articles' && (
              <div className="space-y-3">
                {blogPosts.map((post) => (
                  <div
                    key={post.id}
                    className="p-4 rounded-lg border border-white/10 bg-[#141414] flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">{post.title}</span>
                        <span className="text-[10px] font-mono text-[var(--color-gold)] px-2 py-0.5 rounded bg-black/60 border border-white/10">
                          {post.category}
                        </span>
                      </div>
                      <p className="text-xs text-white/60 line-clamp-1">{post.excerpt}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                      <button
                        onClick={() => setEditingArticle(post)}
                        className="px-2.5 py-1 text-xs text-[var(--color-gold)] hover:bg-[var(--color-gold)]/10 rounded transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" /> Edit
                      </button>
                      <button
                        onClick={() => handleDeleteArticle(post.id, post.title)}
                        className="px-2.5 py-1 text-xs text-red-400 hover:bg-red-950/30 rounded transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Reviews */}
            {contentSubTab === 'reviews' && (
              <div className="space-y-3">
                {reviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="p-4 rounded-lg border border-white/10 bg-[#141414] flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">{rev.author}</span>
                        {rev.company && <span className="text-xs text-white/50">({rev.company})</span>}
                        <span className="text-xs text-[var(--color-gold)]">★ {rev.rating}/5</span>
                      </div>
                      <p className="text-xs text-white/70 italic">"{rev.text}"</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                      <button
                        onClick={() => setEditingReview(rev)}
                        className="px-2.5 py-1 text-xs text-[var(--color-gold)] hover:bg-[var(--color-gold)]/10 rounded transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" /> Edit
                      </button>
                      <button
                        onClick={() => handleDeleteReview(rev.id, rev.author)}
                        className="px-2.5 py-1 text-xs text-red-400 hover:bg-red-950/30 rounded transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* FAQs */}
            {contentSubTab === 'faqs' && (
              <div className="space-y-3">
                {faqs.map((faq) => (
                  <div
                    key={faq.id}
                    className="p-4 rounded-lg border border-white/10 bg-[#141414] flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">{faq.question}</span>
                        <span className="text-[10px] font-mono text-[var(--color-gold)] px-2 py-0.5 rounded bg-black/60 border border-white/10">
                          {faq.category}
                        </span>
                      </div>
                      <p className="text-xs text-white/60 line-clamp-1">{faq.answer}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                      <button
                        onClick={() => setEditingFaq(faq)}
                        className="px-2.5 py-1 text-xs text-[var(--color-gold)] hover:bg-[var(--color-gold)]/10 rounded transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" /> Edit
                      </button>
                      <button
                        onClick={() => handleDeleteFaq(faq.id)}
                        className="px-2.5 py-1 text-xs text-red-400 hover:bg-red-950/30 rounded transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Advertisement & Announcement Banner */}
            {contentSubTab === 'banner' && renderAdvertisementBannerEditor()}
          </div>
        )}

        {/* =========================================================================
            TAB 4: SETTINGS & SECURITY
           ========================================================================= */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <div className="flex items-center gap-2 pb-2 border-b border-white/10">
              <button
                onClick={() => setSettingsSubTab('security')}
                className={`px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                  settingsSubTab === 'security'
                    ? 'bg-[var(--color-gold)] text-black'
                    : 'text-white/60 hover:text-white bg-[#141414]'
                }`}
              >
                Password & Security
              </button>
              <button
                onClick={() => setSettingsSubTab('profile')}
                className={`px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                  settingsSubTab === 'profile'
                    ? 'bg-[var(--color-gold)] text-black'
                    : 'text-white/60 hover:text-white bg-[#141414]'
                }`}
              >
                Studio Profile
              </button>
              <button
                onClick={() => setSettingsSubTab('banner')}
                className={`px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1.5 ${
                  settingsSubTab === 'banner'
                    ? 'bg-[var(--color-gold)] text-black'
                    : 'text-white/60 hover:text-white bg-[#141414]'
                }`}
              >
                <Megaphone className="w-3.5 h-3.5" />
                <span>Advertisement Banner</span>
                {studioProfile.promoBannerEnabled && (
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                )}
              </button>
              <button
                onClick={() => setSettingsSubTab('appearance')}
                className={`px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                  settingsSubTab === 'appearance'
                    ? 'bg-[var(--color-gold)] text-black'
                    : 'text-white/60 hover:text-white bg-[#141414]'
                }`}
              >
                Branding & Accent
              </button>
              <button
                onClick={() => setSettingsSubTab('database')}
                className={`px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1.5 ${
                  settingsSubTab === 'database'
                    ? 'bg-[var(--color-gold)] text-black'
                    : 'text-white/60 hover:text-white bg-[#141414]'
                }`}
              >
                <Database className="w-3.5 h-3.5" />
                <span>Supabase Cloud DB</span>
              </button>
            </div>

            {/* 4.A: Password & Security */}
            {settingsSubTab === 'security' && (
              <div className="max-w-2xl space-y-6">
                {/* Active Session Card */}
                <div className="p-4 rounded-lg border border-[var(--color-gold)]/40 bg-[#141414] flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded bg-black border border-[var(--color-gold)]/50 flex items-center justify-center text-[var(--color-gold)] shrink-0">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold uppercase text-xs text-white tracking-wider">
                      Backstage Access Protected
                    </h3>
                    <p className="text-xs text-white/60 mt-0.5">
                      Current master password is active. Change it at any time to your preferred custom password.
                    </p>
                  </div>
                </div>

                {/* Password Change Form */}
                <div className="p-6 rounded-lg border border-white/10 bg-[#141414] space-y-5">
                  <div className="flex items-center justify-between pb-3 border-b border-white/10">
                    <div className="flex items-center gap-2">
                      <KeyRound className="w-4 h-4 text-[var(--color-gold)]" />
                      <h2 className="font-bold uppercase text-sm text-white">Change Backstage Password</h2>
                    </div>
                    <button
                      type="button"
                      onClick={handleAutoGeneratePassword}
                      className="px-2.5 py-1 bg-[var(--color-gold)]/15 border border-[var(--color-gold)]/40 hover:bg-[var(--color-gold)]/25 text-[var(--color-gold)] rounded text-[11px] font-mono flex items-center gap-1.5 cursor-pointer"
                      title="Generate high-entropy secure password"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Auto-Generate Password</span>
                    </button>
                  </div>

                  {passwordStatusMsg && (
                    <div
                      className={`p-3 rounded text-xs flex items-start gap-2 border ${
                        passwordStatusMsg.type === 'success'
                          ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300'
                          : 'bg-red-950/40 border-red-500/50 text-red-300'
                      }`}
                    >
                      {passwordStatusMsg.type === 'success' ? (
                        <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
                      ) : (
                        <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
                      )}
                      <span>{passwordStatusMsg.text}</span>
                    </div>
                  )}

                  <form onSubmit={handleUpdatePassword} className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-[11px] font-mono text-[var(--color-gold)] uppercase font-semibold">
                          Current Password *
                        </label>
                        <button
                          type="button"
                          onClick={() => setCurrentPasswordInput(getStoredAdminPassword())}
                          className="text-[10px] font-mono text-white/50 hover:text-[var(--color-gold)] underline cursor-pointer"
                        >
                          Auto-fill current ({getStoredAdminPassword()})
                        </button>
                      </div>
                      <div className="relative">
                        <input
                          type={showCurrentPass ? 'text' : 'password'}
                          required
                          value={currentPasswordInput}
                          onChange={(e) => setCurrentPasswordInput(e.target.value)}
                          placeholder="Enter current password..."
                          className="w-full px-3 py-2 bg-black border border-white/20 focus:border-[var(--color-gold)] rounded text-xs text-white outline-none pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPass(!showCurrentPass)}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/50 hover:text-[var(--color-gold)] p-1 cursor-pointer"
                        >
                          {showCurrentPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-mono text-[var(--color-gold)] uppercase font-semibold mb-1">
                          New Preferred Password *
                        </label>
                        <div className="relative">
                          <input
                            type={showNewPass ? 'text' : 'password'}
                            required
                            value={newPasswordInput}
                            onChange={(e) => setNewPasswordInput(e.target.value)}
                            placeholder="Min 6 chars..."
                            className="w-full px-3 py-2 bg-black border border-white/20 focus:border-[var(--color-gold)] rounded text-xs text-white outline-none pr-10"
                          />
                          <button
                            type="button"
                            onClick={() => setShowNewPass(!showNewPass)}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/50 hover:text-[var(--color-gold)] p-1 cursor-pointer"
                          >
                            {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-mono text-[var(--color-gold)] uppercase font-semibold mb-1">
                          Confirm New Password *
                        </label>
                        <input
                          type={showNewPass ? 'text' : 'password'}
                          required
                          value={confirmPasswordInput}
                          onChange={(e) => setConfirmPasswordInput(e.target.value)}
                          placeholder="Re-enter new password..."
                          className="w-full px-3 py-2 bg-black border border-white/20 focus:border-[var(--color-gold)] rounded text-xs text-white outline-none"
                        />
                      </div>
                    </div>

                    <div className="pt-2">
                      <button
                        type="submit"
                        className="px-5 py-2.5 bg-[var(--color-gold)] text-black font-bold text-xs uppercase tracking-wider rounded flex items-center gap-2 cursor-pointer shadow hover:opacity-90"
                      >
                        <Save className="w-4 h-4" />
                        <span>Save New Preferred Password</span>
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* 4.B: Studio Profile */}
            {settingsSubTab === 'profile' && (
              <div className="max-w-2xl p-6 rounded-lg border border-white/10 bg-[#141414] space-y-4 text-xs">
                <h2 className="font-bold uppercase text-sm text-white pb-2 border-b border-white/10">
                  Studio Brand & Contact Details
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white/60 mb-1">STUDIO NAME</label>
                    <input
                      type="text"
                      value={studioProfile.siteName}
                      onChange={(e) => setStudioProfile({ ...studioProfile, siteName: e.target.value })}
                      className="w-full px-3 py-2 bg-black border border-white/20 rounded text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-white/60 mb-1">TAGLINE / SLOGAN</label>
                    <input
                      type="text"
                      value={studioProfile.siteTagline}
                      onChange={(e) => setStudioProfile({ ...studioProfile, siteTagline: e.target.value })}
                      className="w-full px-3 py-2 bg-black border border-white/20 rounded text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-white/60 mb-1">CONTACT EMAIL</label>
                    <input
                      type="email"
                      value={studioProfile.contactEmail}
                      onChange={(e) => setStudioProfile({ ...studioProfile, contactEmail: e.target.value })}
                      className="w-full px-3 py-2 bg-black border border-white/20 rounded text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-white/60 mb-1">CONTACT PHONE</label>
                    <input
                      type="text"
                      value={studioProfile.contactPhone}
                      onChange={(e) => setStudioProfile({ ...studioProfile, contactPhone: e.target.value })}
                      className="w-full px-3 py-2 bg-black border border-white/20 rounded text-white"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-white/60 mb-1">OFFICE / STUDIO LOCATION</label>
                    <input
                      type="text"
                      value={studioProfile.contactLocation}
                      onChange={(e) => setStudioProfile({ ...studioProfile, contactLocation: e.target.value })}
                      className="w-full px-3 py-2 bg-black border border-white/20 rounded text-white"
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-white/10">
                  <button
                    onClick={async () => {
                      await adminMutate('update', 'site_settings', 'active', studioProfile, token);
                      showToast('Studio profile saved successfully.');
                    }}
                    className="px-5 py-2.5 bg-[var(--color-gold)] text-black font-bold text-xs uppercase tracking-wider rounded flex items-center gap-2 cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Studio Profile</span>
                  </button>
                </div>
              </div>
            )}

            {/* 4.C: Advertisement & Announcement Banner */}
            {settingsSubTab === 'banner' && renderAdvertisementBannerEditor()}

            {/* 4.D: Branding & Accent */}
            {settingsSubTab === 'appearance' && (
              <div className="max-w-2xl p-6 rounded-lg border border-white/10 bg-[#141414] space-y-4 text-xs">
                <h2 className="font-bold uppercase text-sm text-white pb-2 border-b border-white/10">
                  Studio Visual Theme
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-white/60 mb-2">GOLD ACCENT BRAND COLOR</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={themeTokens.goldAccent}
                        onChange={(e) => updateThemeTokens({ goldAccent: e.target.value })}
                        className="w-10 h-10 rounded border border-white/20 cursor-pointer bg-black"
                      />
                      <input
                        type="text"
                        value={themeTokens.goldAccent}
                        onChange={(e) => updateThemeTokens({ goldAccent: e.target.value })}
                        className="w-32 px-3 py-2 bg-black border border-white/20 rounded text-white font-mono text-xs"
                      />
                      <button
                        onClick={() => updateThemeTokens({ goldAccent: '#d4af37' })}
                        className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/15 rounded text-white/70 text-xs"
                      >
                        Reset to Gold (#d4af37)
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-white/60 mb-1">HEADING TYPOGRAPHY</label>
                      <select
                        value={themeTokens.headingFont}
                        onChange={(e) => updateThemeTokens({ headingFont: e.target.value })}
                        className="w-full px-3 py-2 bg-black border border-white/20 rounded text-white"
                      >
                        <option value="Syne">Syne (Architectural / Modernist)</option>
                        <option value="Cinzel">Cinzel (Cinematic / Classic)</option>
                        <option value="Montserrat">Montserrat (Geometric / Bold)</option>
                        <option value="Playfair Display">Playfair Display (Editorial / Luxury)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-white/60 mb-1">BODY TYPOGRAPHY</label>
                      <select
                        value={themeTokens.bodyFont}
                        onChange={(e) => updateThemeTokens({ bodyFont: e.target.value })}
                        className="w-full px-3 py-2 bg-black border border-white/20 rounded text-white"
                      >
                        <option value="Plus Jakarta Sans">Plus Jakarta Sans (Crisp UI)</option>
                        <option value="Inter">Inter</option>
                        <option value="Outfit">Outfit</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-white/10">
                  <button
                    onClick={() => showToast('Visual branding preferences saved.')}
                    className="px-5 py-2.5 bg-[var(--color-gold)] text-black font-bold text-xs uppercase tracking-wider rounded flex items-center gap-2 cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Theme Settings</span>
                  </button>
                </div>
              </div>
            )}

            {/* 4.D: Supabase Cloud Database & Storage */}
            {settingsSubTab === 'database' && (
              <div className="max-w-4xl space-y-6">
                {/* Connection Status Card */}
                <div className="p-4 rounded-lg border border-[var(--color-gold)]/40 bg-[#141414] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded bg-black border border-[var(--color-gold)]/50 flex items-center justify-center text-[var(--color-gold)] shrink-0">
                      <Database className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold uppercase text-xs text-white tracking-wider">
                          Supabase PostgreSQL Database
                        </h3>
                        {supabaseUrlInput ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-950/60 border border-emerald-500/40 text-emerald-400">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            Configured
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono bg-amber-950/60 border border-amber-500/40 text-amber-400">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                            Unconfigured
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-white/60 mt-0.5">
                        {supabaseUrlInput
                          ? `Connected project: ${supabaseUrlInput}`
                          : 'All data is currently stored in local browser cache and memory. Connect Supabase for multi-device sync & persistent cloud storage.'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <a
                      href="https://supabase.com/dashboard"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded border border-white/20 bg-black hover:border-[var(--color-gold)]/50 text-white/80 hover:text-white text-xs font-mono flex items-center gap-1.5 transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Supabase Dashboard</span>
                    </a>
                  </div>
                </div>

                {/* Test Result / Status Banner */}
                {supabaseTestResult && (
                  <div
                    className={`p-3.5 rounded text-xs flex items-start gap-2.5 border ${
                      supabaseTestResult.success
                        ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300'
                        : 'bg-red-950/40 border-red-500/50 text-red-300'
                    }`}
                  >
                    {supabaseTestResult.success ? (
                      <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
                    ) : (
                      <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
                    )}
                    <div>
                      <p className="font-semibold">{supabaseTestResult.message}</p>
                      {supabaseTestResult.latencyMs !== undefined && (
                        <p className="text-[11px] opacity-80 font-mono mt-0.5">
                          Round-trip response latency: {supabaseTestResult.latencyMs}ms
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* API Credentials Configuration */}
                <div className="p-6 rounded-lg border border-white/10 bg-[#141414] space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-white/10">
                    <div className="flex items-center gap-2">
                      <KeyRound className="w-4 h-4 text-[var(--color-gold)]" />
                      <h2 className="font-bold uppercase text-sm text-white">Project API Credentials</h2>
                    </div>
                    <span className="text-[11px] font-mono text-white/40">From Project Settings &gt; API</span>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-[11px] font-mono text-[var(--color-gold)] uppercase font-semibold mb-1">
                        Supabase Project URL *
                      </label>
                      <input
                        type="url"
                        placeholder="https://your-project-id.supabase.co"
                        value={supabaseUrlInput}
                        onChange={(e) => setSupabaseUrlInput(e.target.value)}
                        className="w-full px-3.5 py-2 bg-black border border-white/20 focus:border-[var(--color-gold)] rounded text-xs text-white font-mono placeholder:text-white/30 outline-none"
                      />
                      <p className="text-[11px] text-white/40 mt-1">
                        The REST and PostgreSQL API endpoint of your Supabase instance.
                      </p>
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono text-[var(--color-gold)] uppercase font-semibold mb-1">
                        Supabase Public / Anon API Key *
                      </label>
                      <div className="relative">
                        <input
                          type={showSupabaseKey ? 'text' : 'password'}
                          placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                          value={supabaseKeyInput}
                          onChange={(e) => setSupabaseKeyInput(e.target.value)}
                          className="w-full px-3.5 py-2 bg-black border border-white/20 focus:border-[var(--color-gold)] rounded text-xs text-white font-mono placeholder:text-white/30 outline-none pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowSupabaseKey(!showSupabaseKey)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white cursor-pointer"
                        >
                          {showSupabaseKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      <p className="text-[11px] text-white/40 mt-1">
                        The public anonymous key (safe for browser client-side RLS enforcement).
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          const normalized = normalizeSupabaseUrl(supabaseUrlInput);
                          if (supabaseUrlInput && !normalized) {
                            showToast('Please enter a valid URL (e.g. https://your-id.supabase.co)');
                            return;
                          }
                          if (normalized) {
                            setSupabaseUrlInput(normalized);
                          }
                          updateSupabaseConfig(normalized || supabaseUrlInput, supabaseKeyInput);
                          showToast('Supabase credentials saved.');
                        }}
                        className="px-4 py-2 bg-[var(--color-gold)] hover:bg-[var(--color-gold-hover)] text-black font-bold text-xs uppercase tracking-wider rounded flex items-center gap-1.5 cursor-pointer transition-colors"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>Save Credentials</span>
                      </button>

                      <button
                        type="button"
                        disabled={supabaseTesting || !supabaseUrlInput || !supabaseKeyInput}
                        onClick={async () => {
                          setSupabaseTesting(true);
                          setSupabaseTestResult(null);
                          try {
                            const normalized = normalizeSupabaseUrl(supabaseUrlInput) || supabaseUrlInput;
                            if (normalized && normalized !== supabaseUrlInput) {
                              setSupabaseUrlInput(normalized);
                            }
                            updateSupabaseConfig(normalized, supabaseKeyInput);
                            const res = await testSupabaseConnection(normalized, supabaseKeyInput);
                            setSupabaseTestResult(res);
                          } catch (err: any) {
                            setSupabaseTestResult({ success: false, message: err?.message || 'Connection failed' });
                          } finally {
                            setSupabaseTesting(false);
                          }
                        }}
                        className="px-4 py-2 bg-white/10 hover:bg-white/15 text-white border border-white/20 font-bold text-xs uppercase tracking-wider rounded flex items-center gap-1.5 cursor-pointer transition-colors disabled:opacity-50"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${supabaseTesting ? 'animate-spin' : ''}`} />
                        <span>{supabaseTesting ? 'Testing Ping...' : 'Test Connection'}</span>
                      </button>

                      {(supabaseUrlInput || supabaseKeyInput) && (
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm('Clear Supabase configuration and revert to local storage?')) {
                              clearSupabaseConfig();
                              setSupabaseUrlInput('');
                              setSupabaseKeyInput('');
                              setSupabaseTestResult(null);
                              showToast('Supabase configuration cleared.');
                            }
                          }}
                          className="px-3 py-2 text-red-400 hover:text-red-300 text-xs font-mono cursor-pointer ml-auto"
                        >
                          Clear Config
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Cloud Migration & Synchronization Tool */}
                <div className="p-6 rounded-lg border border-[var(--color-gold)]/30 bg-[#141414] space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-white/10">
                    <div className="flex items-center gap-2">
                      <CloudUpload className="w-4 h-4 text-[var(--color-gold)]" />
                      <h2 className="font-bold uppercase text-sm text-white">Full Cloud Migration (Firebase &gt; Supabase)</h2>
                    </div>
                    <span className="text-[11px] font-mono text-[var(--color-gold)] font-bold">11 Tables Ready</span>
                  </div>

                  <p className="text-xs text-white/70 leading-relaxed">
                    Instantly migrate all existing studio content into your connected Supabase PostgreSQL database. This populates all tables: Site Settings, Theme Tokens, Milestones, Portfolio Categories, Services, Portfolio Items, Reviews, Bookings, FAQs, Blog Posts, and Comments.
                  </p>

                  {supabaseMigrationResult && (
                    <div
                      className={`p-4 rounded text-xs space-y-2 border ${
                        supabaseMigrationResult.success
                          ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300'
                          : 'bg-amber-950/40 border-amber-500/50 text-amber-300'
                      }`}
                    >
                      <div className="flex items-center gap-2 font-bold">
                        <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                        <span>{supabaseMigrationResult.message}</span>
                      </div>
                      {supabaseMigrationResult.counts && (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-white/10 font-mono text-[11px]">
                          {Object.entries(supabaseMigrationResult.counts).map(([tbl, count]) => (
                            <div key={tbl} className="bg-black/40 px-2 py-1 rounded">
                              <span className="text-white/50">{tbl}:</span> <span className="font-bold text-white">{count}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {supabaseSyncResult && (
                    <div className="p-3.5 rounded text-xs bg-emerald-950/40 border border-emerald-500/50 text-emerald-300 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                      <span>{supabaseSyncResult.message}</span>
                    </div>
                  )}

                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <button
                      type="button"
                      disabled={supabaseMigrating || !supabaseUrlInput || !supabaseKeyInput}
                      onClick={async () => {
                        if (!confirm('This will upload all current studio data and overwrite matching IDs in Supabase. Proceed?')) return;
                        setSupabaseMigrating(true);
                        setSupabaseMigrationResult(null);
                        try {
                          updateSupabaseConfig(supabaseUrlInput, supabaseKeyInput);
                          const res = await syncAllToSupabase();
                          setSupabaseMigrationResult(res);
                          showToast('Data migration to Supabase completed.');
                        } catch (err: any) {
                          setSupabaseMigrationResult({
                            success: false,
                            message: err?.message || 'Migration error',
                            errors: [err?.message || 'Unknown error']
                          });
                        } finally {
                          setSupabaseMigrating(false);
                        }
                      }}
                      className="px-5 py-2.5 bg-[var(--color-gold)] hover:bg-[var(--color-gold-hover)] text-black font-bold text-xs uppercase tracking-wider rounded flex items-center gap-2 cursor-pointer transition-colors disabled:opacity-50"
                    >
                      <CloudUpload className={`w-4 h-4 ${supabaseMigrating ? 'animate-bounce' : ''}`} />
                      <span>{supabaseMigrating ? 'Migrating Records...' : 'Push All Studio Data to Supabase'}</span>
                    </button>

                    <button
                      type="button"
                      disabled={supabaseSyncing || !supabaseUrlInput || !supabaseKeyInput}
                      onClick={async () => {
                        if (!confirm('Pull latest data from Supabase into your local browser workspace?')) return;
                        setSupabaseSyncing(true);
                        setSupabaseSyncResult(null);
                        try {
                          updateSupabaseConfig(supabaseUrlInput, supabaseKeyInput);
                          const res = await syncFromSupabase();
                          setSupabaseSyncResult(res);
                          showToast('Data synced from Supabase.');
                        } catch (err: any) {
                          setSupabaseSyncResult({ success: false, message: err?.message || 'Sync error' });
                        } finally {
                          setSupabaseSyncing(false);
                        }
                      }}
                      className="px-4 py-2.5 bg-black hover:bg-neutral-900 text-white border border-white/20 font-bold text-xs uppercase tracking-wider rounded flex items-center gap-2 cursor-pointer transition-colors disabled:opacity-50"
                    >
                      <CloudDownload className={`w-4 h-4 ${supabaseSyncing ? 'animate-spin' : ''}`} />
                      <span>{supabaseSyncing ? 'Pulling...' : 'Pull Latest from Supabase'}</span>
                    </button>
                  </div>
                </div>

                {/* SQL Schema & Setup Guide */}
                <div className="p-6 rounded-lg border border-white/10 bg-[#141414] space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-white/10">
                    <div className="flex items-center gap-2">
                      <Server className="w-4 h-4 text-[var(--color-gold)]" />
                      <h2 className="font-bold uppercase text-sm text-white">Database SQL Schema & Policies</h2>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
                          setCopiedSql(true);
                          setTimeout(() => setCopiedSql(false), 3000);
                          showToast('SQL setup script copied to clipboard.');
                        }}
                        className="px-3 py-1 bg-[var(--color-gold)]/15 border border-[var(--color-gold)]/40 hover:bg-[var(--color-gold)]/25 text-[var(--color-gold)] rounded text-[11px] font-mono flex items-center gap-1.5 cursor-pointer transition-colors"
                      >
                        {copiedSql ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedSql ? 'Copied Script!' : 'Copy SQL Script'}</span>
                      </button>
                    </div>
                  </div>

                  <div className="bg-black/50 p-4 rounded border border-white/5 space-y-2 text-xs text-white/70">
                    <p className="font-bold text-white uppercase text-[11px] tracking-wider">Quick Setup Instructions:</p>
                    <ol className="list-decimal list-inside space-y-1 text-white/70 font-mono text-[11px]">
                      <li>Open your Supabase Project dashboard: <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer" className="text-[var(--color-gold)] underline">supabase.com/dashboard</a></li>
                      <li>Navigate to the <strong>SQL Editor</strong> tab on the left sidebar.</li>
                      <li>Click <strong>Copy SQL Script</strong> above, paste it into the editor, and click <strong>Run</strong>.</li>
                      <li>All 11 tables, RLS security policies, and realtime publications will be created instantly!</li>
                    </ol>
                  </div>

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => setShowSqlViewer(!showSqlViewer)}
                      className="text-xs font-mono text-[var(--color-gold)] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <ChevronRight className={`w-3.5 h-3.5 transition-transform ${showSqlViewer ? 'rotate-90' : ''}`} />
                      <span>{showSqlViewer ? 'Hide SQL Script Viewer' : 'View Full SQL Schema Script'}</span>
                    </button>

                    {showSqlViewer && (
                      <pre className="mt-3 p-4 bg-black border border-white/10 rounded font-mono text-[11px] text-white/80 overflow-x-auto max-h-96 leading-relaxed select-all">
                        {SUPABASE_SQL_SCHEMA}
                      </pre>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* =========================================================================
          MODALS / DRAWERS FOR COMPACT EDITING (Keeps workspace clean and decluttered)
         ========================================================================= */}

      {/* 1. Add / Edit Portfolio Item Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#141414] border border-[var(--color-gold)]/60 rounded-lg max-w-lg w-full p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="font-bold text-sm uppercase text-[var(--color-gold)]">
                {editingItem.id ? 'Edit Portfolio Item' : 'New Portfolio Item'}
              </h3>
              <button
                onClick={() => setEditingItem(null)}
                className="text-white/50 hover:text-white p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-white/60 mb-1">TITLE *</label>
                <input
                  type="text"
                  value={editingItem.title || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                  placeholder="e.g. Lumina Fashion Film"
                  className="w-full px-3 py-2 bg-black border border-white/20 rounded text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-white/60 mb-1">CATEGORY *</label>
                  <select
                    value={editingItem.categoryId || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, categoryId: e.target.value })}
                    className="w-full px-3 py-2 bg-black border border-white/20 rounded text-white"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-white/60 mb-1">MEDIA TYPE</label>
                  <select
                    value={editingItem.mediaType || 'photo'}
                    onChange={(e) => setEditingItem({ ...editingItem, mediaType: e.target.value as any })}
                    className="w-full px-3 py-2 bg-black border border-white/20 rounded text-white"
                  >
                    <option value="photo">Photo</option>
                    <option value="video">Video</option>
                    <option value="audio">Audio</option>
                    <option value="graphic">Graphic</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-white/60 mb-1">MEDIA URL / EMBED *</label>
                <input
                  type="text"
                  value={editingItem.mediaUrl || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, mediaUrl: e.target.value })}
                  placeholder="https://... (Image URL, YouTube, Vimeo, or Audio MP3)"
                  className="w-full px-3 py-2 bg-black border border-white/20 rounded text-white"
                />
              </div>

              <div>
                <label className="block text-white/60 mb-1">DESCRIPTION</label>
                <textarea
                  rows={3}
                  value={editingItem.description || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                  placeholder="Brief synopsis or technical details..."
                  className="w-full px-3 py-2 bg-black border border-white/20 rounded text-white"
                />
              </div>

              <div className="flex items-center gap-4 pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingItem.featured ?? false}
                    onChange={(e) => setEditingItem({ ...editingItem, featured: e.target.checked })}
                    className="accent-[var(--color-gold)] w-4 h-4"
                  />
                  <span>Feature on Homepage</span>
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
              <button
                onClick={() => setEditingItem(null)}
                className="px-4 py-2 border border-white/20 rounded text-white hover:bg-white/5 cursor-pointer uppercase text-xs"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (!editingItem.title?.trim()) {
                    alert('Please enter a title.');
                    return;
                  }
                  const isNew = !editingItem.id;
                  const action = isNew ? 'create' : 'update';
                  const id = editingItem.id;
                  await adminMutate(action, 'portfolio_items', id, editingItem, token);
                  showToast('Portfolio item saved.');
                  setEditingItem(null);
                }}
                className="px-5 py-2 bg-[var(--color-gold)] text-black font-bold rounded cursor-pointer uppercase text-xs"
              >
                Save Item
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Add / Edit Category Modal */}
      {editingCategory && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#141414] border border-[var(--color-gold)]/60 rounded-lg max-w-md w-full p-6 space-y-4 shadow-2xl text-xs">
            <h3 className="font-bold text-sm uppercase text-[var(--color-gold)]">
              {editingCategory.id ? 'Edit Category' : 'New Category'}
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-white/60 mb-1">CATEGORY NAME *</label>
                <input
                  type="text"
                  value={editingCategory.name || ''}
                  onChange={(e) =>
                    setEditingCategory({
                      ...editingCategory,
                      name: e.target.value,
                      slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-')
                    })
                  }
                  className="w-full px-3 py-2 bg-black border border-white/20 rounded text-white"
                />
              </div>
              <div>
                <label className="block text-white/60 mb-1">URL SLUG</label>
                <input
                  type="text"
                  value={editingCategory.slug || ''}
                  onChange={(e) => setEditingCategory({ ...editingCategory, slug: e.target.value })}
                  className="w-full px-3 py-2 bg-black border border-white/20 rounded text-white font-mono"
                />
              </div>
              <div>
                <label className="block text-white/60 mb-1">SHORT DESCRIPTION</label>
                <input
                  type="text"
                  value={editingCategory.description || ''}
                  onChange={(e) => setEditingCategory({ ...editingCategory, description: e.target.value })}
                  className="w-full px-3 py-2 bg-black border border-white/20 rounded text-white"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
              <button
                onClick={() => setEditingCategory(null)}
                className="px-4 py-2 border border-white/20 rounded text-white hover:bg-white/5 cursor-pointer uppercase text-xs"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (!editingCategory.name) return;
                  const isNew = !editingCategory.id;
                  await adminMutate(
                    isNew ? 'create' : 'update',
                    'portfolio_categories',
                    editingCategory.id,
                    editingCategory,
                    token
                  );
                  showToast('Category saved.');
                  setEditingCategory(null);
                }}
                className="px-5 py-2 bg-[var(--color-gold)] text-black font-bold rounded cursor-pointer uppercase text-xs"
              >
                Save Category
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Add / Edit Service Modal */}
      {editingService && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#141414] border border-[var(--color-gold)]/60 rounded-lg max-w-lg w-full p-6 space-y-4 shadow-2xl text-xs">
            <h3 className="font-bold text-sm uppercase text-[var(--color-gold)]">
              {editingService.id ? 'Edit Service' : 'New Service'}
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-white/60 mb-1">SERVICE TITLE *</label>
                <input
                  type="text"
                  value={editingService.title || ''}
                  onChange={(e) => setEditingService({ ...editingService, title: e.target.value })}
                  className="w-full px-3 py-2 bg-black border border-white/20 rounded text-white"
                />
              </div>
              <div>
                <label className="block text-white/60 mb-1">SHORT SUMMARY</label>
                <input
                  type="text"
                  value={editingService.shortDescription || ''}
                  onChange={(e) => setEditingService({ ...editingService, shortDescription: e.target.value })}
                  className="w-full px-3 py-2 bg-black border border-white/20 rounded text-white"
                />
              </div>
              <div>
                <label className="block text-white/60 mb-1">DETAILED SPECIFICATIONS</label>
                <textarea
                  rows={4}
                  value={editingService.detailedDescription || ''}
                  onChange={(e) => setEditingService({ ...editingService, detailedDescription: e.target.value })}
                  className="w-full px-3 py-2 bg-black border border-white/20 rounded text-white"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
              <button
                onClick={() => setEditingService(null)}
                className="px-4 py-2 border border-white/20 rounded text-white hover:bg-white/5 cursor-pointer uppercase text-xs"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (!editingService.title) return;
                  const isNew = !editingService.id;
                  await adminMutate(isNew ? 'create' : 'update', 'services', editingService.id, editingService, token);
                  showToast('Service saved.');
                  setEditingService(null);
                }}
                className="px-5 py-2 bg-[var(--color-gold)] text-black font-bold rounded cursor-pointer uppercase text-xs"
              >
                Save Service
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Add / Edit Milestone Modal */}
      {editingMilestone && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#141414] border border-[var(--color-gold)]/60 rounded-lg max-w-md w-full p-6 space-y-4 shadow-2xl text-xs">
            <h3 className="font-bold text-sm uppercase text-[var(--color-gold)]">
              {editingMilestone.id ? 'Edit Milestone' : 'New Milestone'}
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-white/60 mb-1">YEAR *</label>
                <input
                  type="text"
                  value={editingMilestone.year || ''}
                  onChange={(e) => setEditingMilestone({ ...editingMilestone, year: e.target.value })}
                  placeholder="e.g. 2024"
                  className="w-full px-3 py-2 bg-black border border-white/20 rounded text-white font-mono"
                />
              </div>
              <div>
                <label className="block text-white/60 mb-1">TITLE *</label>
                <input
                  type="text"
                  value={editingMilestone.title || ''}
                  onChange={(e) => setEditingMilestone({ ...editingMilestone, title: e.target.value })}
                  className="w-full px-3 py-2 bg-black border border-white/20 rounded text-white"
                />
              </div>
              <div>
                <label className="block text-white/60 mb-1">DESCRIPTION</label>
                <textarea
                  rows={3}
                  value={editingMilestone.description || ''}
                  onChange={(e) => setEditingMilestone({ ...editingMilestone, description: e.target.value })}
                  className="w-full px-3 py-2 bg-black border border-white/20 rounded text-white"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
              <button
                onClick={() => setEditingMilestone(null)}
                className="px-4 py-2 border border-white/20 rounded text-white hover:bg-white/5 cursor-pointer uppercase text-xs"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (!editingMilestone.title) return;
                  const isNew = !editingMilestone.id;
                  await adminMutate(
                    isNew ? 'create' : 'update',
                    'milestones',
                    editingMilestone.id,
                    editingMilestone,
                    token
                  );
                  showToast('Milestone saved.');
                  setEditingMilestone(null);
                }}
                className="px-5 py-2 bg-[var(--color-gold)] text-black font-bold rounded cursor-pointer uppercase text-xs"
              >
                Save Milestone
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Add / Edit Article Modal */}
      {editingArticle && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#141414] border border-[var(--color-gold)]/60 rounded-lg max-w-lg w-full p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto text-xs">
            <h3 className="font-bold text-sm uppercase text-[var(--color-gold)]">
              {editingArticle.id ? 'Edit Article' : 'New Article'}
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-white/60 mb-1">ARTICLE TITLE *</label>
                <input
                  type="text"
                  value={editingArticle.title || ''}
                  onChange={(e) => setEditingArticle({ ...editingArticle, title: e.target.value })}
                  className="w-full px-3 py-2 bg-black border border-white/20 rounded text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-white/60 mb-1">CATEGORY</label>
                  <input
                    type="text"
                    value={editingArticle.category || 'Production'}
                    onChange={(e) => setEditingArticle({ ...editingArticle, category: e.target.value })}
                    className="w-full px-3 py-2 bg-black border border-white/20 rounded text-white"
                  />
                </div>
                <div>
                  <label className="block text-white/60 mb-1">READ TIME</label>
                  <input
                    type="text"
                    value={editingArticle.readTime || '4 min'}
                    onChange={(e) => setEditingArticle({ ...editingArticle, readTime: e.target.value })}
                    className="w-full px-3 py-2 bg-black border border-white/20 rounded text-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-white/60 mb-1">EXCERPT</label>
                <textarea
                  rows={2}
                  value={editingArticle.excerpt || ''}
                  onChange={(e) => setEditingArticle({ ...editingArticle, excerpt: e.target.value })}
                  className="w-full px-3 py-2 bg-black border border-white/20 rounded text-white"
                />
              </div>
              <div>
                <label className="block text-white/60 mb-1">FULL ARTICLE BODY (MARKDOWN)</label>
                <textarea
                  rows={6}
                  value={editingArticle.content || ''}
                  onChange={(e) => setEditingArticle({ ...editingArticle, content: e.target.value })}
                  className="w-full px-3 py-2 bg-black border border-white/20 rounded text-white font-mono text-[11px]"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
              <button
                onClick={() => setEditingArticle(null)}
                className="px-4 py-2 border border-white/20 rounded text-white hover:bg-white/5 cursor-pointer uppercase text-xs"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (!editingArticle.title) return;
                  const isNew = !editingArticle.id;
                  await adminMutate(
                    isNew ? 'create' : 'update',
                    'blog_posts',
                    editingArticle.id,
                    editingArticle,
                    token
                  );
                  showToast('Article saved.');
                  setEditingArticle(null);
                }}
                className="px-5 py-2 bg-[var(--color-gold)] text-black font-bold rounded cursor-pointer uppercase text-xs"
              >
                Save Article
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. Add / Edit Review Modal */}
      {editingReview && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#141414] border border-[var(--color-gold)]/60 rounded-lg max-w-md w-full p-6 space-y-4 shadow-2xl text-xs">
            <h3 className="font-bold text-sm uppercase text-[var(--color-gold)]">
              {editingReview.id ? 'Edit Review' : 'New Review'}
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-white/60 mb-1">CLIENT NAME *</label>
                <input
                  type="text"
                  value={editingReview.author || ''}
                  onChange={(e) => setEditingReview({ ...editingReview, author: e.target.value })}
                  className="w-full px-3 py-2 bg-black border border-white/20 rounded text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-white/60 mb-1">COMPANY / ROLE</label>
                  <input
                    type="text"
                    value={editingReview.company || ''}
                    onChange={(e) => setEditingReview({ ...editingReview, company: e.target.value })}
                    className="w-full px-3 py-2 bg-black border border-white/20 rounded text-white"
                  />
                </div>
                <div>
                  <label className="block text-white/60 mb-1">RATING (1-5)</label>
                  <input
                    type="number"
                    min={1}
                    max={5}
                    value={editingReview.rating || 5}
                    onChange={(e) => setEditingReview({ ...editingReview, rating: parseInt(e.target.value) || 5 })}
                    className="w-full px-3 py-2 bg-black border border-white/20 rounded text-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-white/60 mb-1">TESTIMONIAL TEXT</label>
                <textarea
                  rows={3}
                  value={editingReview.text || ''}
                  onChange={(e) => setEditingReview({ ...editingReview, text: e.target.value })}
                  className="w-full px-3 py-2 bg-black border border-white/20 rounded text-white"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
              <button
                onClick={() => setEditingReview(null)}
                className="px-4 py-2 border border-white/20 rounded text-white hover:bg-white/5 cursor-pointer uppercase text-xs"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (!editingReview.author) return;
                  const isNew = !editingReview.id;
                  await adminMutate(isNew ? 'create' : 'update', 'reviews', editingReview.id, editingReview, token);
                  showToast('Review saved.');
                  setEditingReview(null);
                }}
                className="px-5 py-2 bg-[var(--color-gold)] text-black font-bold rounded cursor-pointer uppercase text-xs"
              >
                Save Review
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. Add / Edit FAQ Modal */}
      {editingFaq && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#141414] border border-[var(--color-gold)]/60 rounded-lg max-w-md w-full p-6 space-y-4 shadow-2xl text-xs">
            <h3 className="font-bold text-sm uppercase text-[var(--color-gold)]">
              {editingFaq.id ? 'Edit FAQ' : 'New FAQ'}
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-white/60 mb-1">QUESTION *</label>
                <input
                  type="text"
                  value={editingFaq.question || ''}
                  onChange={(e) => setEditingFaq({ ...editingFaq, question: e.target.value })}
                  className="w-full px-3 py-2 bg-black border border-white/20 rounded text-white"
                />
              </div>
              <div>
                <label className="block text-white/60 mb-1">CATEGORY</label>
                <input
                  type="text"
                  value={editingFaq.category || 'General'}
                  onChange={(e) => setEditingFaq({ ...editingFaq, category: e.target.value })}
                  className="w-full px-3 py-2 bg-black border border-white/20 rounded text-white"
                />
              </div>
              <div>
                <label className="block text-white/60 mb-1">ANSWER</label>
                <textarea
                  rows={3}
                  value={editingFaq.answer || ''}
                  onChange={(e) => setEditingFaq({ ...editingFaq, answer: e.target.value })}
                  className="w-full px-3 py-2 bg-black border border-white/20 rounded text-white"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
              <button
                onClick={() => setEditingFaq(null)}
                className="px-4 py-2 border border-white/20 rounded text-white hover:bg-white/5 cursor-pointer uppercase text-xs"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (!editingFaq.question) return;
                  const isNew = !editingFaq.id;
                  await adminMutate(isNew ? 'create' : 'update', 'faqs', editingFaq.id, editingFaq, token);
                  showToast('FAQ saved.');
                  setEditingFaq(null);
                }}
                className="px-5 py-2 bg-[var(--color-gold)] text-black font-bold rounded cursor-pointer uppercase text-xs"
              >
                Save FAQ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 8. Booking Internal Notes Drawer / Modal */}
      {selectedBookingNotes && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#141414] border border-[var(--color-gold)]/60 rounded-lg max-w-md w-full p-6 space-y-4 shadow-2xl text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="font-bold text-sm uppercase text-white">
                Internal Production Notes: <span className="text-[var(--color-gold)]">{selectedBookingNotes.clientName}</span>
              </h3>
              <button onClick={() => setSelectedBookingNotes(null)} className="text-white/50 hover:text-white p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="bg-black/40 p-3 rounded border border-white/10 space-y-1 text-white/70">
                <div><strong>Service:</strong> {selectedBookingNotes.serviceName}</div>
                <div><strong>Requested Date:</strong> {selectedBookingNotes.dateValue} {selectedBookingNotes.endDateValue ? `to ${selectedBookingNotes.endDateValue}` : ''}</div>
                <div><strong>Client Email:</strong> {selectedBookingNotes.email}</div>
                <div><strong>Client Phone:</strong> {selectedBookingNotes.phone}</div>
                {selectedBookingNotes.projectDescription && (
                  <div className="pt-1 text-white/90 italic">
                    <strong>Creative Brief:</strong> "{selectedBookingNotes.projectDescription}"
                  </div>
                )}
              </div>

              <div>
                <label className="block text-white/60 mb-1 font-semibold uppercase text-[10px]">
                  INTERNAL STUDIO LOG / CREATIVE TREATMENT NOTES
                </label>
                <textarea
                  rows={5}
                  value={bookingNotesDraft}
                  onChange={(e) => setBookingNotesDraft(e.target.value)}
                  placeholder="Notes on gear packages, call sheets, deposit status, or location permits..."
                  className="w-full px-3 py-2 bg-black border border-white/20 focus:border-[var(--color-gold)] rounded text-white"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
              <button
                onClick={() => setSelectedBookingNotes(null)}
                className="px-4 py-2 border border-white/20 rounded text-white hover:bg-white/5 cursor-pointer uppercase text-xs"
              >
                Close
              </button>
              <button
                onClick={async () => {
                  await adminMutate(
                    'update',
                    'bookings',
                    selectedBookingNotes.id,
                    { adminNotes: bookingNotesDraft },
                    token
                  );
                  showToast('Production notes saved.');
                  setSelectedBookingNotes(null);
                }}
                className="px-5 py-2 bg-[var(--color-gold)] text-black font-bold rounded cursor-pointer uppercase text-xs"
              >
                Save Notes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

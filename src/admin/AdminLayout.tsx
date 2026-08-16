import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Package, Tags, Layers, Image as ImageIcon,
  Home, Info, Award, Star, Phone, MessageSquareQuote,
  Settings, LogOut, ExternalLink, Menu, X, HelpCircle,
  Search as SearchIcon, Users, Shield,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { getPendingQuotesCount } from '../services/quoteService';
import toast from 'react-hot-toast';
import { ADMIN_BASE_PATH } from './adminConstants';

import DashboardOverview    from './views/DashboardOverview';
import ProductManager       from './views/ProductManager';
import CategoriesManager    from './views/CategoriesManager';
import GradeComparisonManager from './views/GradeComparisonManager';
import GalleryManager       from './views/GalleryManager';
import HomepageManager      from './views/HomepageManager';
import AboutManager         from './views/AboutManager';
import OriginManager        from './views/OriginManager';
import CertificationsManager from './views/CertificationsManager';
import TestimonialsManager  from './views/TestimonialsManager';
import ContactInfoManager   from './views/ContactInfoManager';
import QuoteRequestsManager from './views/QuoteRequestsManager';
import FAQManager           from './views/FAQManager';
import SEOManager           from './views/SEOManager';
import UsersManager         from './views/UsersManager';
import SettingsManager      from './views/SettingsManager';

const ROLE_COLORS: Record<string, string> = {
  owner:  'bg-amber-950/60 text-amber-300 border-amber-500/40',
  admin:  'bg-blue-950/60 text-blue-300 border-blue-500/40',
  editor: 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40',
};

const NAV_ITEMS = [
  { id: 'dashboard',      label: 'Dashboard',          icon: LayoutDashboard,     roles: ['owner','admin','editor'] },
  { id: 'products',       label: 'Products',           icon: Package,             roles: ['owner','admin','editor'] },
  { id: 'categories',     label: 'Categories',         icon: Tags,                roles: ['owner','admin','editor'] },
  { id: 'gradeComparison',label: 'Grade Comparison',   icon: Layers,              roles: ['owner','admin','editor'] },
  { id: 'homepage',       label: 'Homepage',           icon: Home,                roles: ['owner','admin','editor'] },
  { id: 'about',          label: 'About Page',         icon: Info,                roles: ['owner','admin','editor'] },
  { id: 'origin',          label: 'Our Origin',         icon: OriginIcon,          roles: ['owner','admin','editor'] },
  { id: 'gallery',        label: 'Gallery',            icon: ImageIcon,           roles: ['owner','admin','editor'] },
  { id: 'certifications', label: 'Certifications',     icon: Award,               roles: ['owner','admin','editor'] },
  { id: 'testimonials',   label: 'Testimonials',       icon: Star,                roles: ['owner','admin','editor'] },
  { id: 'contact',        label: 'Contact',            icon: Phone,               roles: ['owner','admin','editor'] },
  { id: 'quotes',         label: 'Quote Requests',     icon: MessageSquareQuote,  roles: ['owner','admin','editor'] },
  { id: 'faq',            label: 'FAQ',                icon: HelpCircle,          roles: ['owner','admin','editor'] },
  { id: 'seo',            label: 'SEO',                icon: SearchIcon,          roles: ['owner','admin']          },
  { id: 'users',          label: 'Users',              icon: Users,               roles: ['owner']                  },
  { id: 'settings',       label: 'Settings',           icon: Settings,            roles: ['owner','admin']          },
];

// Custom leaf icon for Our Origin page
function OriginIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21c-4-4-8-7.5-8-12a8 8 0 0116 0c0 4.5-4 8-8 12z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 13V7m-3 3l3-3 3 3" />
    </svg>
  );
}

export default function AdminLayout() {
  const { user, role, signOut } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab]             = useState('dashboard');
  const [isMobileMenuOpen, setMobileMenuOpen]   = useState(false);
  const [pendingQuotesCount, setPendingQuotesCount] = useState(0);
  const [hasUnreadAlert, setHasUnreadAlert]    = useState(false);

  useEffect(() => {
    // Initial fetch of pending quotes count
    getPendingQuotesCount().then((count) => {
      setPendingQuotesCount(count);
      if (count > 0) {
        setHasUnreadAlert(true);
      }
    }).catch(() => {});

    // Realtime listener on quote_requests table
    const channel = supabase
      .channel('admin-quotes-alert')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'quote_requests' },
        (payload) => {
          getPendingQuotesCount().then((count) => {
            setPendingQuotesCount(count);
            if (payload.eventType === 'INSERT') {
              setHasUnreadAlert(true);
            } else if (count === 0) {
              setHasUnreadAlert(false);
            }
          }).catch(() => {});
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const visibleNav = NAV_ITEMS.filter((item) => !role || item.roles.includes(role));

  const handleLogout = async () => {
    await signOut();
    toast.success('Signed out successfully.');
    navigate(`${ADMIN_BASE_PATH}/login`);
  };

  const handleSelectTab = (id: string) => {
    setActiveTab(id);
    setMobileMenuOpen(false);
    if (id === 'quotes') {
      setHasUnreadAlert(false);
    }
  };

  const renderView = () => {
    switch (activeTab) {
      case 'dashboard':      return <DashboardOverview onNavigateTab={setActiveTab} />;
      case 'products':       return <ProductManager />;
      case 'categories':     return <CategoriesManager />;
      case 'gradeComparison':return <GradeComparisonManager />;
      case 'gallery':        return <GalleryManager />;
      case 'homepage':       return <HomepageManager />;
      case 'about':          return <AboutManager />;
      case 'origin':         return <OriginManager />;
      case 'certifications': return <CertificationsManager />;
      case 'testimonials':   return <TestimonialsManager />;
      case 'contact':        return <ContactInfoManager />;
      case 'quotes':         return <QuoteRequestsManager />;
      case 'faq':            return <FAQManager />;
      case 'seo':            return <SEOManager />;
      case 'users':          return <UsersManager />;
      case 'settings':       return <SettingsManager />;
      default:               return <DashboardOverview onNavigateTab={setActiveTab} />;
    }
  };

  const showRedDot = pendingQuotesCount > 0 && hasUnreadAlert;

  return (
    <div className="min-h-screen bg-[#071309] text-[#FAF8F5] flex flex-col md:flex-row relative font-sans">
      {/* Mobile Top Bar */}
      <div className="md:hidden bg-[#0D2012] border-b border-[#C5A046]/30 px-4 py-3 flex justify-between items-center z-40 sticky top-0 shadow-lg">
        <div className="flex items-center gap-2">
          <img src="/images/cardanova-emblem.png" alt="Cardanova" className="h-7 w-auto object-contain" />
          <span className="text-xs font-medium text-[#C5A046] capitalize truncate max-w-[150px]">
            {NAV_ITEMS.find((n) => n.id === activeTab)?.label ?? 'CMS'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {role && (
            <span className={`text-[9px] px-2 py-0.5 rounded-full border font-semibold uppercase ${ROLE_COLORS[role] ?? ''}`}>
              {role}
            </span>
          )}
          <button
            onClick={() => setMobileMenuOpen((o) => !o)}
            className="relative text-[#C5A046] p-2 rounded-xl bg-[#071309] border border-[#C5A046]/30 active:scale-95 transition-all"
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            {showRedDot && (
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500 border border-[#071309]"></span>
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/75 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed md:sticky top-0 left-0 h-screen z-50 w-64
          bg-[#0D2012]/95 border-r border-[#C5A046]/20
          backdrop-blur-xl flex flex-col justify-between
          transition-transform duration-300 overflow-y-auto
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        <div className="p-5">
          {/* Logo */}
          <div className="hidden md:flex items-center gap-3 mb-6 pb-4 border-b border-[#C5A046]/15">
            <img src="/images/cardanova-emblem.png" alt="Cardanova" className="h-9 w-auto" />
            <img src="/images/cardanova-wordmark-light.png" alt="Cardanova Spices" className="h-7 w-auto" />
          </div>

          {/* User badge */}
          <div className="mb-5 p-3 bg-[#071309]/60 rounded-xl border border-[#C5A046]/15 space-y-1">
            <p className="text-[11px] text-gray-400 truncate">{user?.email ?? 'Admin'}</p>
            {role && (
              <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full border font-semibold uppercase tracking-wider ${ROLE_COLORS[role] ?? ''}`}>
                <Shield className="w-3 h-3" />
                {role}
              </span>
            )}
          </div>

          {/* Navigation */}
          <nav className="space-y-0.5">
            {visibleNav.map(({ id, label, icon: Icon }) => {
              const isActive = activeTab === id;
              const isQuoteItem = id === 'quotes';
              const hasPending = isQuoteItem && showRedDot;
              return (
                <button
                  key={id}
                  id={`admin-nav-${id}`}
                  onClick={() => handleSelectTab(id)}
                  className={`
                    w-full flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium uppercase tracking-wider transition-all cursor-pointer relative
                    ${isActive
                      ? 'bg-gradient-to-r from-[#C5A046] to-[#DFBF6C] text-[#071309] shadow-lg font-semibold'
                      : 'text-gray-300 hover:bg-[#C5A046]/10 hover:text-white'
                    }
                  `}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#071309]' : 'text-[#C5A046]'}`} />
                    <span className="truncate">{label}</span>
                  </div>
                  {hasPending && (
                    <span className="flex items-center gap-1 shrink-0">
                      <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                      </span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${isActive ? 'bg-[#071309] text-red-400' : 'bg-red-950/80 text-red-300 border border-red-500/40'}`}>
                        {pendingQuotesCount}
                      </span>
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer actions */}
        <div className="p-5 border-t border-[#C5A046]/15 space-y-2.5">
          <Link
            to="/"
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-[#071309] border border-[#C5A046]/30 text-xs text-[#C5A046] hover:text-white transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>View Public Site</span>
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-red-950/40 border border-red-500/30 text-xs text-red-300 hover:bg-red-900/60 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-3 sm:p-6 md:p-8 lg:p-10 max-w-7xl w-full mx-auto overflow-x-hidden">
        {renderView()}
      </main>
    </div>
  );
}

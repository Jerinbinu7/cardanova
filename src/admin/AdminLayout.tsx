import { useState } from 'react';
import {
  LayoutDashboard,
  Package,
  Image as ImageIcon,
  Home,
  Info,
  MapPin,
  Award,
  Star,
  Phone,
  MessageSquareQuote,
  Settings,
  LogOut,
  ExternalLink,
  Menu,
  X,
  ShieldCheck,
} from 'lucide-react';
import DashboardOverview from './views/DashboardOverview';
import ProductManager from './views/ProductManager';
import GalleryManager from './views/GalleryManager';
import HomepageManager from './views/HomepageManager';
import AboutManager from './views/AboutManager';
import FarmToExportManager from './views/FarmToExportManager';
import CertificationsManager from './views/CertificationsManager';
import TestimonialsManager from './views/TestimonialsManager';
import ContactInfoManager from './views/ContactInfoManager';
import QuoteRequestsManager from './views/QuoteRequestsManager';
import SettingsManager from './views/SettingsManager';

interface AdminLayoutProps {
  onLogout: () => void;
  onReturnToSite: () => void;
}

export default function AdminLayout({ onLogout, onReturnToSite }: AdminLayoutProps) {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'gallery', label: 'Gallery', icon: ImageIcon },
    { id: 'homepage', label: 'Homepage Content', icon: Home },
    { id: 'about', label: 'About Page', icon: Info },
    { id: 'farmToExport', label: 'Farm to Export', icon: MapPin },
    { id: 'certifications', label: 'Certifications', icon: Award },
    { id: 'testimonials', label: 'Testimonials', icon: Star },
    { id: 'contact', label: 'Contact Information', icon: Phone },
    { id: 'quotes', label: 'Quote Requests', icon: MessageSquareQuote },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleSelectTab = (id: string) => {
    setActiveTab(id);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#071309] text-[#FAF8F5] flex flex-col md:flex-row relative font-sans">
      {/* Mobile Top Nav */}
      <div className="md:hidden bg-[#0D2012] border-b border-[#C5A046]/30 px-4 py-3 flex justify-between items-center z-40">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-[#C5A046]" />
          <span className="font-light tracking-widest uppercase text-xs text-[#FAF8F5]">Cardanova Admin</span>
        </div>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="text-[#C5A046] p-1.5 rounded-lg border border-[#C5A046]/30"
        >
          {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed md:sticky top-0 left-0 bottom-0 z-50 w-64 bg-[#0D2012]/95 border-r border-[#C5A046]/20 backdrop-blur-xl flex flex-col justify-between transition-transform duration-300 ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        } h-screen overflow-y-auto`}
      >
        <div className="p-6">
          {/* Brand Logo */}
          <div className="flex items-center gap-3 mb-8">
            <div className="h-10 w-10 rounded-xl bg-[#C5A046]/10 border border-[#C5A046]/40 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-[#C5A046]" />
            </div>
            <div>
              <h2 className="font-light text-sm tracking-[0.2em] text-[#FAF8F5] uppercase">
                Cardanova
              </h2>
              <p className="text-[9px] uppercase tracking-widest text-[#C5A046]">Enterprise Admin</p>
            </div>
          </div>

          {/* Nav Items */}
          <nav className="space-y-1">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelectTab(item.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium uppercase tracking-wider transition-all cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-[#C5A046] to-[#DFBF6C] text-[#071309] shadow-lg font-semibold'
                      : 'text-gray-300 hover:bg-[#C5A046]/10 hover:text-white'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#071309]' : 'text-[#C5A046]'}`} />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-[#C5A046]/15 space-y-3">
          <button
            onClick={onReturnToSite}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-[#071309] border border-[#C5A046]/30 text-xs text-[#C5A046] hover:text-white transition-colors cursor-pointer"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Public Website View</span>
          </button>

          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-red-950/40 border border-red-500/30 text-xs text-red-300 hover:bg-red-900/60 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-10 max-w-7xl mx-auto overflow-y-auto">
        {activeTab === 'dashboard' && <DashboardOverview onNavigateTab={setActiveTab} />}
        {activeTab === 'products' && <ProductManager />}
        {activeTab === 'gallery' && <GalleryManager />}
        {activeTab === 'homepage' && <HomepageManager />}
        {activeTab === 'about' && <AboutManager />}
        {activeTab === 'farmToExport' && <FarmToExportManager />}
        {activeTab === 'certifications' && <CertificationsManager />}
        {activeTab === 'testimonials' && <TestimonialsManager />}
        {activeTab === 'contact' && <ContactInfoManager />}
        {activeTab === 'quotes' && <QuoteRequestsManager />}
        {activeTab === 'settings' && <SettingsManager />}
      </main>
    </div>
  );
}

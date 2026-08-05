import React, { useEffect, useState } from 'react';
import { Save } from 'lucide-react';
import toast from 'react-hot-toast';
import { getSiteSettings, updateSiteSettings, uploadLogo, uploadFavicon } from '../../services/settingsService';
import type { SiteSettingsRow } from '../../types/database';
import FileUpload from '../components/FileUpload';
import { SkeletonText } from '../components/Skeleton';

export default function SettingsManager() {
  const [settings, setSettings] = useState<Partial<SiteSettingsRow>>({});
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [logoProgress, setLogoProgress] = useState(0);
  const [faviconProgress, setFaviconProgress] = useState(0);

  useEffect(() => {
    getSiteSettings().then((d) => { if (d) setSettings(d); }).finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try { await updateSiteSettings(settings); toast.success('Settings saved!'); }
    catch (e: any) { toast.error(e.message); }
    finally { setSaving(false); }
  };

  const handleLogoUpload = async (files: File[]) => {
    setLogoProgress(10);
    try {
      const url = await uploadLogo(files[0], (p) => setLogoProgress(p));
      setSettings((s) => ({ ...s, logo_url: url }));
      await updateSiteSettings({ logo_url: url });
      toast.success('Logo uploaded!');
    } catch (e: any) { toast.error(e.message); }
    finally { setTimeout(() => setLogoProgress(0), 1500); }
  };

  const handleFaviconUpload = async (files: File[]) => {
    setFaviconProgress(10);
    try {
      const url = await uploadFavicon(files[0], (p) => setFaviconProgress(p));
      setSettings((s) => ({ ...s, favicon_url: url }));
      await updateSiteSettings({ favicon_url: url });
      toast.success('Favicon uploaded!');
    } catch (e: any) { toast.error(e.message); }
    finally { setTimeout(() => setFaviconProgress(0), 1500); }
  };

  if (loading) return <SkeletonText lines={10} />;

  const field = (label: string, key: keyof SiteSettingsRow, placeholder = '', type = 'text') => (
    <div>
      <label className="block text-xs text-[#C5A046] uppercase tracking-wider mb-1.5">{label}</label>
      <input type={type} value={(settings[key] as string) ?? ''} onChange={(e) => setSettings((s) => ({ ...s, [key]: e.target.value }))} placeholder={placeholder}
        className="w-full bg-[#071309] border border-[#C5A046]/30 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#C5A046] transition-all" />
    </div>
  );

  const sectionClass = "bg-[#0D2012]/80 p-6 rounded-2xl border border-[#C5A046]/20 shadow-xl space-y-4";

  return (
    <div className="space-y-6">
      <div className="bg-[#0D2012]/80 p-6 rounded-2xl border border-[#C5A046]/30 shadow-xl">
        <h2 className="text-xl font-light text-[#FAF8F5]">Site Settings</h2>
        <p className="text-xs text-gray-400 mt-1">Configure company identity, branding, and legal information</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div className={sectionClass}>
          <h3 className="text-sm uppercase tracking-wider text-[#C5A046] font-medium border-b border-[#C5A046]/20 pb-2">Company Identity</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {field('Company Name', 'company_name', 'Cardanova Spices LLP')}
            {field('Tagline', 'tagline', "Exporting Nature's Finest")}
            {field('Copyright Text', 'copyright_text')}
            {field('Default Currency', 'default_currency', 'USD')}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {field('Inquiry Email', 'inquiry_email', 'trade@cardanovaspices.com', 'email')}
            {field('WhatsApp Number', 'whatsapp_number', '+91 9876543210')}
          </div>
        </div>

        <div className={sectionClass}>
          <h3 className="text-sm uppercase tracking-wider text-[#C5A046] font-medium border-b border-[#C5A046]/20 pb-2">Legal & Compliance</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {field('Business Reg. Number', 'business_reg_number')}
            {field('GST Number', 'gst_number')}
            {field('Export License', 'export_license')}
          </div>
        </div>

        <div className={sectionClass}>
          <h3 className="text-sm uppercase tracking-wider text-[#C5A046] font-medium border-b border-[#C5A046]/20 pb-2">Branding</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FileUpload label="Company Logo" currentUrl={settings.logo_url} accept="image" onFiles={handleLogoUpload} progress={logoProgress} onRemove={() => setSettings((s) => ({ ...s, logo_url: null }))} />
            <FileUpload label="Favicon" currentUrl={settings.favicon_url} accept="image" onFiles={handleFaviconUpload} progress={faviconProgress} onRemove={() => setSettings((s) => ({ ...s, favicon_url: null }))} />
          </div>
        </div>

        <div className="flex justify-end">
          <button type="submit" disabled={saving} className="flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-[#C5A046] to-[#DFBF6C] text-[#071309] font-medium text-xs uppercase tracking-widest hover:brightness-110 cursor-pointer shadow-xl disabled:opacity-60">
            <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  );
}

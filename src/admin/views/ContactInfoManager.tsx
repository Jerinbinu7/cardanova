import React, { useEffect, useState } from 'react';
import { Save } from 'lucide-react';
import toast from 'react-hot-toast';
import { getContactInfo, updateContactInfo } from '../../services/contactService';
import type { ContactInfoRow } from '../../types/database';
import { SkeletonText } from '../components/Skeleton';

export default function ContactInfoManager() {
  const [data, setData]       = useState<Partial<ContactInfoRow>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);

  useEffect(() => {
    getContactInfo().then((d) => { if (d) setData(d); }).finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try { await updateContactInfo(data); toast.success('Contact info saved!'); }
    catch (e: any) { toast.error(e.message); }
    finally { setSaving(false); }
  };

  if (loading) return <SkeletonText lines={10} />;

  const field = (label: string, key: keyof ContactInfoRow, placeholder = '', type = 'text') => (
    <div>
      <label className="block text-xs text-[#C5A046] uppercase tracking-wider mb-1.5">{label}</label>
      <input type={type} value={(data[key] as string) ?? ''} onChange={(e) => setData((d) => ({ ...d, [key]: e.target.value }))} placeholder={placeholder}
        className="w-full bg-[#071309] border border-[#C5A046]/30 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#C5A046] transition-all" />
    </div>
  );

  const sectionClass = "bg-[#0D2012]/80 p-6 rounded-2xl border border-[#C5A046]/20 shadow-xl space-y-4";

  return (
    <div className="space-y-6">
      <div className="bg-[#0D2012]/80 p-6 rounded-2xl border border-[#C5A046]/30 shadow-xl">
        <h2 className="text-xl font-light text-[#FAF8F5]">Contact Information</h2>
        <p className="text-xs text-gray-400 mt-1">Edit all contact details shown on the website</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div className={sectionClass}>
          <h3 className="text-sm uppercase tracking-wider text-[#C5A046] font-medium border-b border-[#C5A046]/20 pb-2">Communication</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {field('Phone', 'phone', '+91 9876543210')}
            {field('WhatsApp Number', 'whatsapp', '+91 9876543210')}
            {field('Contact Email', 'email', 'trade@cardanovaspices.com', 'email')}
            {field('Inquiry Email', 'inquiry_email', 'trade@cardanovaspices.com', 'email')}
          </div>
        </div>

        <div className={sectionClass}>
          <h3 className="text-sm uppercase tracking-wider text-[#C5A046] font-medium border-b border-[#C5A046]/20 pb-2">Location</h3>
          <div>
            <label className="block text-xs text-[#C5A046] uppercase tracking-wider mb-1.5">Full Address</label>
            <textarea rows={3} value={data.address ?? ''} onChange={(e) => setData((d) => ({ ...d, address: e.target.value }))} placeholder="Cardanova Spices LLP, Vandanmedu, Idukki..."
              className="w-full bg-[#071309] border border-[#C5A046]/30 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#C5A046] resize-none" />
          </div>
          {field('Business Hours', 'business_hours', 'Mon–Sat: 9:00 AM – 6:00 PM IST')}
          {field('Google Maps URL', 'google_maps_url', 'https://maps.google.com/...')}
          <div>
            <label className="block text-xs text-[#C5A046] uppercase tracking-wider mb-1.5">Google Maps Embed URL (iframe src)</label>
            <textarea rows={2} value={data.google_maps_embed ?? ''} onChange={(e) => setData((d) => ({ ...d, google_maps_embed: e.target.value }))} placeholder="https://www.google.com/maps/embed?pb=..."
              className="w-full bg-[#071309] border border-[#C5A046]/30 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#C5A046] resize-none" />
          </div>
        </div>

        <div className={sectionClass}>
          <h3 className="text-sm uppercase tracking-wider text-[#C5A046] font-medium border-b border-[#C5A046]/20 pb-2">Social Media</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {field('Instagram URL', 'instagram_url', 'https://instagram.com/...')}
            {field('LinkedIn URL', 'linkedin_url', 'https://linkedin.com/...')}
            {field('Twitter / X URL', 'twitter_url', 'https://twitter.com/...')}
            {field('Facebook URL', 'facebook_url', 'https://facebook.com/...')}
            {field('YouTube URL', 'youtube_url', 'https://youtube.com/...')}
          </div>
        </div>

        <div className="flex justify-end">
          <button type="submit" disabled={saving} className="flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-[#C5A046] to-[#DFBF6C] text-[#071309] font-medium text-xs uppercase tracking-widest hover:brightness-110 cursor-pointer shadow-xl disabled:opacity-60">
            <Save className="w-4 h-4" /> {saving ? 'Saving…' : 'Save Contact Info'}
          </button>
        </div>
      </form>
    </div>
  );
}

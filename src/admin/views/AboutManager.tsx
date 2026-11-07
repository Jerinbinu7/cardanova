import React, { useEffect, useState } from 'react';
import { Save } from 'lucide-react';
import toast from 'react-hot-toast';
import { getAboutContent, updateAboutContent } from '../../services/aboutService';
import { getGalleryItems, createGalleryItem, deleteGalleryItem, uploadGalleryImage } from '../../services/galleryService';
import type { AboutContentRow } from '../../types/database';
import FileUpload from '../components/FileUpload';
import { SkeletonText } from '../components/Skeleton';

export default function AboutManager() {
  const [content, setContent]           = useState<Partial<AboutContentRow>>({});
  const [heroBg, setHeroBg]             = useState('/images/about-hero.jpg');
  const [beginningImg, setBeginningImg] = useState('/images/cardamom-hero-1.jpg');
  const [loading, setLoading]           = useState(true);
  const [saving, setSaving]             = useState(false);
  const [uploadingHero, setUploadingHero]           = useState(0);
  const [uploadingBeginning, setUploadingBeginning] = useState(0);

  useEffect(() => {
    Promise.all([
      getAboutContent(),
      getGalleryItems('about_hero'),
      getGalleryItems('about_beginning'),
    ]).then(([d, heroItems, beginningItems]) => {
      if (d) {
        setContent(d);
        if (d.history && d.history.startsWith('http')) setHeroBg(d.history);
      }
      if (heroItems?.length && heroItems[0].image_url) setHeroBg(heroItems[0].image_url);
      if (beginningItems?.length && beginningItems[0].image_url) setBeginningImg(beginningItems[0].image_url);
    }).finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateAboutContent(content);
      toast.success('About page saved!');
    } catch (err: any) {
      toast.error(err.message ?? 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleHeroUpload = async (files: File[]) => {
    if (!files.length) return;
    setUploadingHero(10);
    try {
      const url = await uploadGalleryImage('about', files[0], (p) => setUploadingHero(p));
      const existing = await getGalleryItems('about_hero');
      for (const item of (existing ?? [])) await deleteGalleryItem(item);
      await createGalleryItem({ title: '[about_hero] Hero Background', image_url: url, folder: 'about', display_order: 0 });
      setHeroBg(url);
      setContent((c) => ({ ...c, history: url }));
      toast.success('Hero image updated!');
    } catch (err: any) {
      toast.error(err.message ?? 'Upload failed');
    } finally {
      setTimeout(() => setUploadingHero(0), 1200);
    }
  };

  const handleHeroRemove = async () => {
    try {
      const existing = await getGalleryItems('about_hero');
      for (const item of (existing ?? [])) await deleteGalleryItem(item);
      setHeroBg('/images/about-hero.jpg');
      setContent((c) => ({ ...c, history: '' }));
      toast.success('Hero image reset to default');
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleBeginningUpload = async (files: File[]) => {
    if (!files.length) return;
    setUploadingBeginning(10);
    try {
      const url = await uploadGalleryImage('about', files[0], (p) => setUploadingBeginning(p));
      const existing = await getGalleryItems('about_beginning');
      for (const item of (existing ?? [])) await deleteGalleryItem(item);
      await createGalleryItem({ title: '[about_beginning] Born in Idukki', image_url: url, folder: 'about', display_order: 0 });
      setBeginningImg(url);
      toast.success('"The Beginning" image updated!');
    } catch (err: any) {
      toast.error(err.message ?? 'Upload failed');
    } finally {
      setTimeout(() => setUploadingBeginning(0), 1200);
    }
  };

  const handleBeginningRemove = async () => {
    try {
      const existing = await getGalleryItems('about_beginning');
      for (const item of (existing ?? [])) await deleteGalleryItem(item);
      setBeginningImg('/images/cardamom-hero-1.jpg');
      toast.success('Image reset to default');
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  if (loading) return <SkeletonText lines={10} />;

  const inputCls = 'w-full bg-[#071309] border border-[#C5A046]/30 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#C5A046] transition-all';
  const labelCls = 'block text-xs text-[#C5A046] uppercase tracking-wider mb-1.5';
  const cardCls  = 'bg-[#0D2012]/80 p-5 rounded-2xl border border-[#C5A046]/20 space-y-4';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#0D2012]/80 p-6 rounded-2xl border border-[#C5A046]/30 shadow-xl">
        <h2 className="text-xl font-light text-[#FAF8F5]">About Page</h2>
        <p className="text-xs text-gray-400 mt-1">
          Edit the company story, vision, and images shown on the About tab of the website.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-5">

        {/* Company Story */}
        <div className={cardCls}>
          <div>
            <h3 className="text-sm font-medium text-[#C5A046]">Company Story</h3>
            <p className="text-xs text-gray-400 mt-0.5">
              Main narrative shown in the "Born in the Hills of Idukki" section.
            </p>
          </div>
          <label className={labelCls}>Story Text</label>
          <textarea
            rows={6}
            value={content.company_story ?? ''}
            onChange={(e) => setContent((c) => ({ ...c, company_story: e.target.value }))}
            className={`${inputCls} resize-none`}
            placeholder="Cardanova was founded by two passionate entrepreneurs who grew up surrounded by the rich spice heritage of Idukki, Kerala…"
          />
        </div>

        {/* Vision */}
        <div className={cardCls}>
          <div>
            <h3 className="text-sm font-medium text-[#C5A046]">Vision Statement</h3>
            <p className="text-xs text-gray-400 mt-0.5">
              Displayed below the company story on the About page.
            </p>
          </div>
          <label className={labelCls}>Vision</label>
          <textarea
            rows={3}
            value={content.vision ?? ''}
            onChange={(e) => setContent((c) => ({ ...c, vision: e.target.value }))}
            className={`${inputCls} resize-none`}
            placeholder="Our vision is to become one of India's most trusted spice exporters…"
          />
        </div>

        {/* Hero Background Image */}
        <div className={cardCls}>
          <div>
            <h3 className="text-sm font-medium text-[#C5A046]">Hero Background Image</h3>
            <p className="text-xs text-gray-400 mt-0.5">
              Full-screen parallax banner at the top of the About page.
            </p>
          </div>
          <FileUpload
            label="Hero Background"
            currentUrl={heroBg}
            accept="image"
            defaultAspect="16:9"
            onFiles={handleHeroUpload}
            onRemove={handleHeroRemove}
            progress={uploadingHero}
          />
        </div>

        {/* The Beginning Image */}
        <div className={cardCls}>
          <div>
            <h3 className="text-sm font-medium text-[#C5A046]">"The Beginning" Section Image</h3>
            <p className="text-xs text-gray-400 mt-0.5">
              Cardamom estate photo shown alongside the story in the "Born in the Hills of Idukki" section.
            </p>
          </div>
          <FileUpload
            label="The Beginning Image"
            currentUrl={beginningImg}
            accept="image"
            defaultAspect="4:3"
            onFiles={handleBeginningUpload}
            onRemove={handleBeginningRemove}
            progress={uploadingBeginning}
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-[#C5A046] to-[#DFBF6C] text-[#071309] font-medium text-xs uppercase tracking-widest hover:brightness-110 cursor-pointer shadow-xl disabled:opacity-60"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving…' : 'Save About Page'}
          </button>
        </div>
      </form>
    </div>
  );
}

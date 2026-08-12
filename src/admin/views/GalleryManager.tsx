import { useEffect, useState, useRef } from 'react';
import { Trash2, MoveLeft, MoveRight, Copy, Check, Image as ImageIcon, Layers, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { getGalleryItems, createGalleryItem, deleteGalleryItem, uploadGalleryImage, reorderGalleryItems } from '../../services/galleryService';
import type { GalleryItemRow, GalleryFolder } from '../../types/database';
import FileUpload from '../components/FileUpload';
import ConfirmDialog from '../components/ConfirmDialog';
import { SkeletonCard } from '../components/Skeleton';
import ImageCropperModal from '../components/ImageCropperModal';

interface SubsectionConfig {
  id: string;
  label: string;
  aspect: '3:4' | '1:1' | '4:3' | '16:9' | 'free';
  hint: string;
}

interface PageSectionConfig {
  id: string;
  label: string;
  description: string;
  subsections: SubsectionConfig[];
}

const PAGE_SECTIONS: PageSectionConfig[] = [
  {
    id: 'home',
    label: '🏠 Home',
    description: 'Manage main homepage slideshow banners, features & key highlights',
    subsections: [
      { id: 'homepage_hero', label: 'Hero Slideshow Banners', aspect: '16:9', hint: 'Displayed in top full-screen background slideshow' },
      { id: 'homepage_why_us', label: 'Why Choose Us Showcase', aspect: '4:3', hint: 'Single-origin estate & key highlights' },
    ],
  },
  {
    id: 'products',
    label: '📦 Products',
    description: 'Manage catalogue hero header, green cardamom grade cards & packaging photos',
    subsections: [
      { id: 'products_hero', label: 'Top Hero Header', aspect: '16:9', hint: 'Catalogue top header background' },
      { id: 'products', label: 'Grade Cards (8.5mm, 8.0mm, 7.5mm)', aspect: '1:1', hint: '8.5mm, 8.0mm, 7.5mm pod showcase photos' },
      { id: 'packaging', label: 'Export Packaging (Foil & Jute)', aspect: '4:3', hint: 'Vacuum foil, master cartons & jute bags' },
    ],
  },
  {
    id: 'about',
    label: 'ℹ️ About',
    description: 'Manage top hero header & co-founders photos',
    subsections: [
      { id: 'about_hero', label: 'Top Hero Header', aspect: '16:9', hint: 'Misty cardamom plantation hero background' },
      { id: 'about_founders', label: 'Co-Founders & Leadership', aspect: '3:4', hint: 'Portrait photos of company founders (Akhilkumar K A & Amal Babu)' },
    ],
  },
  {
    id: 'origin',
    label: '🌿 Our Origin',
    description: 'Manage 6 sections of Our Origin (Cultivation, Hand Harvesting, Curing, Grading, Packaging, Global Export & Hero)',
    subsections: [
      { id: 'origin_step_1', label: '1. Cultivation', aspect: '4:3', hint: 'Grown in Idukki high ranges at 1,100m elevation' },
      { id: 'origin_step_2', label: '2. Hand Harvesting', aspect: '4:3', hint: 'Individually hand-picked at peak essential oil maturity' },
      { id: 'origin_step_3', label: '3. Curing & Drying', aspect: '4:3', hint: 'Temperature-controlled flue curing chambers (40-55°C)' },
      { id: 'origin_step_4', label: '4. Grading & Sorting', aspect: '4:3', hint: 'Multi-stage mechanical sieving & optical pod sorting' },
      { id: 'origin_step_5', label: '5. Vacuum Packaging', aspect: '4:3', hint: 'Multi-layer foil vacuum packing line' },
      { id: 'origin_step_6', label: '6. Global Export', aspect: '4:3', hint: 'Shipped to 30+ countries via Cochin port' },
      { id: 'origin_hero', label: 'Top Hero Header', aspect: '16:9', hint: 'Misty Idukki highland estate hero background' },
    ],
  },
];

const DEFAULT_SUBSECTION_PHOTOS: Record<string, Partial<GalleryItemRow>[]> = {
  about_founders: [
    {
      id: 'default-founder-1',
      title: 'Akhilkumar K A — Co-Founder',
      image_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=800&auto=format&fit=crop',
      folder: 'factory',
      display_order: 0,
    },
    {
      id: 'default-founder-2',
      title: 'Amal Babu — Co-Founder',
      image_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=800&auto=format&fit=crop',
      folder: 'factory',
      display_order: 1,
    },
  ],
  homepage_hero: [
    {
      id: 'default-hero-1',
      title: 'Slide 1: Premium Green Cardamom Pods',
      image_url: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?q=80&w=2070&auto=format&fit=crop',
      folder: 'homepage_hero',
      display_order: 0,
    },
    {
      id: 'default-hero-2',
      title: 'Slide 2: Handpicked by Local Farmers',
      image_url: 'https://images.unsplash.com/photo-1599940824399-b87987ceb72a?q=80&w=2070&auto=format&fit=crop',
      folder: 'homepage_hero',
      display_order: 1,
    },
    {
      id: 'default-hero-3',
      title: 'Slide 3: Vacuum Sealed Export Packaging',
      image_url: 'https://images.unsplash.com/photo-1509358211563-393f60f64c67?q=80&w=2070&auto=format&fit=crop',
      folder: 'homepage_hero',
      display_order: 2,
    },
  ],
  about_hero: [
    {
      id: 'default-about-hero',
      title: 'Misty Cardamom Plantation Hills — Idukki',
      image_url: 'https://images.unsplash.com/photo-1511497584788-876760111969?q=80&w=2070&auto=format&fit=crop',
      folder: 'factory',
      display_order: 0,
    },
  ],
  factory: [
    {
      id: 'default-factory-1',
      title: 'Flue-Curing & Dehydration Chambers',
      image_url: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=800&auto=format&fit=crop',
      folder: 'factory',
      display_order: 0,
    },
    {
      id: 'default-factory-2',
      title: 'Optical & Sieve Grading Line',
      image_url: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?q=80&w=800&auto=format&fit=crop',
      folder: 'factory',
      display_order: 1,
    },
  ],
  warehouse: [
    {
      id: 'default-wh-1',
      title: 'Palletized Vacuum Foil Bags Storage',
      image_url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=800&auto=format&fit=crop',
      folder: 'warehouse',
      display_order: 0,
    },
    {
      id: 'default-wh-2',
      title: 'Climate Controlled Storage Facility',
      image_url: 'https://images.unsplash.com/photo-1553413077-190dd305871c?q=80&w=800&auto=format&fit=crop',
      folder: 'warehouse',
      display_order: 1,
    },
  ],
  origin_hero: [
    {
      id: 'default-origin-hero',
      title: 'Idukki Highland Estates Background',
      image_url: 'https://images.unsplash.com/photo-1511497584788-876760111969?q=80&w=2070&auto=format&fit=crop',
      folder: 'factory',
      display_order: 0,
    },
  ],
  origin_step_1: [
    {
      id: 'default-step-1',
      title: 'Step 1: Cultivation — Grown in Idukki high ranges at 1,100m elevation',
      image_url: 'https://images.unsplash.com/photo-1511497584788-876760111969?q=80&w=1400&auto=format&fit=crop',
      folder: 'factory',
      display_order: 0,
    },
  ],
  origin_step_2: [
    {
      id: 'default-step-2',
      title: 'Step 2: Hand Harvesting — Handpicked at peak essential oil maturity',
      image_url: 'https://images.unsplash.com/photo-1529693662653-9d480530a697?q=80&w=1400&auto=format&fit=crop',
      folder: 'factory',
      display_order: 0,
    },
  ],
  origin_step_3: [
    {
      id: 'default-step-3',
      title: 'Step 3: Curing & Drying — Flue-cured for colour retention (40–55°C)',
      image_url: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?q=80&w=1400&auto=format&fit=crop',
      folder: 'factory',
      display_order: 0,
    },
  ],
  origin_step_4: [
    {
      id: 'default-step-4',
      title: 'Step 4: Grading & Sorting — Precision optical & mechanical sieving',
      image_url: 'https://images.unsplash.com/photo-1599940824399-b87987ceb72a?q=80&w=1400&auto=format&fit=crop',
      folder: 'factory',
      display_order: 0,
    },
  ],
  origin_step_5: [
    {
      id: 'default-step-5',
      title: 'Step 5: Vacuum Packaging — Aroma-locked in multi-layer foil',
      image_url: 'https://images.unsplash.com/photo-1509358211563-393f60f64c67?q=80&w=1400&auto=format&fit=crop',
      folder: 'packaging',
      display_order: 0,
    },
  ],
  origin_step_6: [
    {
      id: 'default-step-6',
      title: 'Step 6: Global Export — Container shipments to 30+ countries via Cochin port',
      image_url: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?q=80&w=1400&auto=format&fit=crop',
      folder: 'events',
      display_order: 0,
    },
  ],
  products_hero: [
    {
      id: 'default-products-hero',
      title: 'Export Trade Catalogue Header',
      image_url: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?q=80&w=2070&auto=format&fit=crop',
      folder: 'products',
      display_order: 0,
    },
  ],
  products: [
    {
      id: 'default-prod-1',
      title: '8.5mm Extra Bold (Deep Natural Emerald Green)',
      image_url: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?q=80&w=1200&auto=format&fit=crop',
      folder: 'products',
      display_order: 0,
    },
    {
      id: 'default-prod-2',
      title: '8.0mm Premium Bold (Vibrant Forest Green)',
      image_url: 'https://images.unsplash.com/photo-1509358211563-393f60f64c67?q=80&w=1200&auto=format&fit=crop',
      folder: 'products',
      display_order: 1,
    },
    {
      id: 'default-prod-3',
      title: '7.5mm Export Grade (Rich Emerald Green)',
      image_url: 'https://images.unsplash.com/photo-1599940824399-b87987ceb72a?q=80&w=1200&auto=format&fit=crop',
      folder: 'products',
      display_order: 2,
    },
    {
      id: 'default-prod-4',
      title: '7.0mm Commercial Grade (Medium Light Green)',
      image_url: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?q=80&w=1200&auto=format&fit=crop',
      folder: 'products',
      display_order: 3,
    },
    {
      id: 'default-prod-5',
      title: 'AGEB / LGB Blend (Assorted 6.5–8.0mm)',
      image_url: 'https://images.unsplash.com/photo-1509358211563-393f60f64c67?q=80&w=1200&auto=format&fit=crop',
      folder: 'products',
      display_order: 4,
    },
    {
      id: 'default-prod-6',
      title: 'Extraction Grade (Pods, Seeds & Husks)',
      image_url: 'https://images.unsplash.com/photo-1599940824399-b87987ceb72a?q=80&w=1200&auto=format&fit=crop',
      folder: 'products',
      display_order: 5,
    },
  ],
  packaging: [
    {
      id: 'default-pkg-1',
      title: '5kg Multi-Layer Vacuum Aluminium Foil Packs',
      image_url: 'https://images.unsplash.com/photo-1509358211563-393f60f64c67?q=80&w=800&auto=format&fit=crop',
      folder: 'packaging',
      display_order: 0,
    },
    {
      id: 'default-pkg-2',
      title: '25kg Jute Master Bags with Inner PE Liner',
      image_url: 'https://images.unsplash.com/photo-1599940824399-b87987ceb72a?q=80&w=800&auto=format&fit=crop',
      folder: 'packaging',
      display_order: 1,
    },
  ],
};

const DB_FOLDER_MAP: Record<string, GalleryFolder> = {
  homepage_hero: 'homepage_hero',
  homepage_why_us: 'events',
  about_hero: 'factory',
  about_founders: 'factory',
  factory: 'factory',
  warehouse: 'warehouse',
  origin_hero: 'factory',
  origin_step_1: 'factory',
  origin_step_2: 'factory',
  origin_step_3: 'factory',
  origin_step_4: 'factory',
  origin_step_5: 'packaging',
  origin_step_6: 'events',
  products_hero: 'products',
  products: 'products',
  packaging: 'packaging',
  certificates: 'certificates',
  events: 'events',
};

export default function GalleryManager() {
  const [activePageId, setActivePageId] = useState<string>('home');
  const [activeSubsectionId, setActiveSubsectionId] = useState<string>('homepage_hero');
  const [selectedFounderIdx, setSelectedFounderIdx] = useState<number>(0);
  const [items, setItems] = useState<GalleryItemRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<GalleryItemRow | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [newTitle, setNewTitle] = useState('');
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  const currentPage = PAGE_SECTIONS.find((p) => p.id === activePageId) ?? PAGE_SECTIONS[0];
  const currentSubsection = currentPage.subsections.find((s) => s.id === activeSubsectionId) ?? currentPage.subsections[0];

  const load = async (folderId: string) => {
    setLoading(true);
    try {
      if (folderId === 'about_founders') {
        const { getAboutContent } = await import('../../services/aboutService');
        const aboutData = await getAboutContent();
        const baseFounders = (aboutData?.founders && aboutData.founders.length >= 2)
          ? aboutData.founders
          : [
              { name: 'Akhilkumar K A', position: 'Co-Founder', photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=800&auto=format&fit=crop' },
              { name: 'Amal Babu', position: 'Co-Founder', photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=800&auto=format&fit=crop' },
            ];

        const founderItems = baseFounders.map((f, idx) => {
          const founderName = f.name?.trim() ? f.name : (idx === 0 ? 'Akhilkumar K A' : idx === 1 ? 'Amal Babu' : `Founder ${idx + 1}`);
          const defaultPhoto = idx === 0 
            ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=800&auto=format&fit=crop'
            : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=800&auto=format&fit=crop';
          return {
            id: `founder-${idx}`,
            title: `${founderName} (${f.position || 'Co-Founder'})`,
            image_url: f.photo !== undefined ? f.photo : defaultPhoto,
            folder: 'factory' as GalleryFolder,
            display_order: idx,
            created_at: new Date().toISOString(),
          };
        });
        setItems(founderItems as any);
      } else if (folderId === 'products') {
        const { getProducts } = await import('../../services/productsService');
        const dbProducts = await getProducts(false);
        if (dbProducts && dbProducts.length > 0) {
          const productItems = dbProducts.map((p, idx) => ({
            id: `prod-db-${p.id}`,
            title: `${p.name} (${p.category?.name || 'Green Cardamom'})`,
            image_url: p.main_image_url || p.images?.[0]?.url || (DEFAULT_SUBSECTION_PHOTOS.products[idx % DEFAULT_SUBSECTION_PHOTOS.products.length]?.image_url ?? ''),
            folder: 'products' as GalleryFolder,
            display_order: idx,
            created_at: p.created_at || new Date().toISOString(),
          }));
          setItems(productItems as any);
        } else {
          const defaults = (DEFAULT_SUBSECTION_PHOTOS.products ?? []).map((d) => ({
            id: d.id ?? `def-${Math.random()}`,
            title: d.title ?? 'Website Photo',
            image_url: d.image_url ?? '',
            folder: 'products' as GalleryFolder,
            display_order: d.display_order ?? 0,
            created_at: new Date().toISOString(),
          }));
          setItems(defaults as any);
        }
      } else {
        const dbFolder = DB_FOLDER_MAP[folderId] || 'factory';
        const rawDbItems = await getGalleryItems(dbFolder);
        
        let filtered = rawDbItems.filter((item) => {
          if (!item.image_url) return false;
          if (folderId.startsWith('origin_step_')) {
            const stepNum = folderId.replace('origin_step_', '');
            return item.title?.includes(`[${folderId}]`) || item.title?.toLowerCase().includes(`step ${stepNum}`);
          }
          if (folderId.endsWith('_hero')) {
            return item.title?.includes(`[${folderId}]`) || item.title?.toLowerCase().includes('hero');
          }
          if (folderId === 'homepage_why_us') {
            return item.title?.includes('[homepage_why_us]') || item.title?.toLowerCase().includes('why us') || item.title?.toLowerCase().includes('feature');
          }
          if (folderId === 'factory') {
            return !item.title?.startsWith('[origin_step_') && !item.title?.startsWith('[about_hero]') && !item.title?.startsWith('[origin_hero]') && !item.title?.toLowerCase().includes('step ') && !item.title?.toLowerCase().includes('hero');
          }
          if (folderId === 'events') {
            return !item.title?.startsWith('[origin_step_');
          }
          if (folderId === 'packaging') {
            return !item.title?.startsWith('[origin_step_');
          }
          return true;
        });

        const uniqueItems = filtered.filter((item, index, self) =>
          item.image_url && index === self.findIndex((t) => t.image_url === item.image_url)
        );

        if (uniqueItems.length > 0) {
          setItems(uniqueItems);
        } else {
          const defaults = (DEFAULT_SUBSECTION_PHOTOS[folderId] ?? []).map((d) => ({
            id: d.id ?? `def-${Math.random()}`,
            title: d.title ?? 'Website Photo',
            image_url: d.image_url ?? '',
            folder: dbFolder,
            display_order: d.display_order ?? 0,
            created_at: new Date().toISOString(),
          }));
          setItems(defaults as any);
        }
      }
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const firstSub = currentPage.subsections[0];
    if (!currentPage.subsections.some((s) => s.id === activeSubsectionId)) {
      setActiveSubsectionId(firstSub.id);
      load(firstSub.id);
    } else {
      load(activeSubsectionId);
    }
  }, [activePageId]);

  const handleSubsectionSelect = (subId: string) => {
    setActiveSubsectionId(subId);
    load(subId);
  };

  const handleUpload = async (files: File[]) => {
    const titleToUse = newTitle.trim() || `${currentSubsection.label} Image`;
    setUploadProgress(10);
    try {
      if (currentSubsection.id === 'about_founders') {
        const { uploadAboutImage, getAboutContent, updateAboutContent } = await import('../../services/aboutService');
        const url = await uploadAboutImage('founders', files[0], (p) => setUploadProgress(p));
        const aboutData = await getAboutContent();
        
        const defaultFounders = [
          { name: 'Akhilkumar K A', position: 'Co-Founder', photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=800&auto=format&fit=crop', intro: '', quote: '', linkedin: '', facebook: '', email: '' },
          { name: 'Amal Babu', position: 'Co-Founder', photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=800&auto=format&fit=crop', intro: '', quote: '', linkedin: '', facebook: '', email: '' },
        ];

        const existingList = (aboutData?.founders && aboutData.founders.length >= 2)
          ? aboutData.founders
          : defaultFounders;

        const targetIdx = selectedFounderIdx;
        const updatedFounders = existingList.map((f, idx) => {
          const founderName = f.name?.trim() ? f.name : (idx === 0 ? 'Akhilkumar K A' : idx === 1 ? 'Amal Babu' : `Founder ${idx + 1}`);
          if (idx === targetIdx) {
            return {
              ...f,
              name: founderName,
              position: f.position || 'Co-Founder',
              photo: url,
            };
          }
          return {
            ...f,
            name: founderName,
          };
        });

        await updateAboutContent({ ...(aboutData ?? {}), founders: updatedFounders });
        const updatedName = updatedFounders[targetIdx].name;
        toast.success(`Photo updated for ${updatedName}!`);
        setNewTitle('');
        load('about_founders');
        return;
      }

      const dbFolder = DB_FOLDER_MAP[currentSubsection.id] || 'factory';
      const taggedTitle = `[${currentSubsection.id}] ${titleToUse}`;
      for (const file of files) {
        const url = await uploadGalleryImage(dbFolder, file, (p) => setUploadProgress(p));
        await createGalleryItem({
          title: taggedTitle,
          folder: dbFolder,
          image_url: url,
          display_order: items.length,
        });
      }
      toast.success('Image uploaded successfully!');
      setNewTitle('');
      load(currentSubsection.id);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setTimeout(() => setUploadProgress(0), 1200);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      const isNonUuid =
        deleteTarget.id.startsWith('founder-') ||
        deleteTarget.id.startsWith('default-') ||
        deleteTarget.id.startsWith('def-') ||
        !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(deleteTarget.id);

      if (isNonUuid) {
        if (currentSubsection.id === 'about_founders') {
          const founderIdx = parseInt(deleteTarget.id.replace('founder-', ''), 10);
          if (!isNaN(founderIdx)) {
            const { getAboutContent, updateAboutContent } = await import('../../services/aboutService');
            const aboutData = await getAboutContent();
            if (aboutData?.founders) {
              const updated = [...aboutData.founders];
              if (updated[founderIdx]) {
                updated[founderIdx] = { ...updated[founderIdx], photo: '' };
                await updateAboutContent({ ...aboutData, founders: updated });
              }
            }
          }
        } else if (deleteTarget.id.startsWith('prod-db-')) {
          const productId = deleteTarget.id.replace('prod-db-', '');
          const { updateProduct } = await import('../../services/productsService');
          await updateProduct(productId, { main_image_url: '' });
          toast.success('Product photo removed.');
          load('products');
          return;
        }
        setItems((prev) => prev.filter((i) => i.id !== deleteTarget.id));
        toast.success('Image removed from card.');
      } else {
        if (currentSubsection.id === 'homepage_hero') {
          const { getHomepageContent, updateHomepageContent } = await import('../../services/homepageService');
          const data = await getHomepageContent();
          if (data?.hero_bg_image_url === deleteTarget.image_url) {
            await updateHomepageContent({ ...data, hero_bg_image_url: '' });
          }
        }
        const matchingDuplicates = items.filter((i) => i.image_url === deleteTarget.image_url);
        for (const dup of matchingDuplicates) {
          if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(dup.id)) {
            await deleteGalleryItem(dup);
          }
        }
        toast.success('Image deleted.');
        load(currentSubsection.id);
      }
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setDeleteTarget(null);
    }
  };

  const [replacingIdx, setReplacingIdx] = useState<number | null>(null);
  const [cropModalFile, setCropModalFile] = useState<File | null>(null);
  const cardFileInputRef = useRef<HTMLInputElement>(null);

  const triggerCardReplace = (idx: number) => {
    setReplacingIdx(idx);
    if (cardFileInputRef.current) {
      cardFileInputRef.current.value = '';
      cardFileInputRef.current.click();
    }
  };

  const handleCardFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCropModalFile(e.target.files[0]);
    }
  };

  const handleCropComplete = async (croppedBlob: Blob) => {
    if (replacingIdx === null) return;
    const targetItem = items[replacingIdx];
    setCropModalFile(null);
    setUploadProgress(20);

    try {
      const fileToUpload = new File([croppedBlob], `replaced-${Date.now()}.jpg`, { type: 'image/jpeg' });

      if (currentSubsection.id === 'about_founders') {
        const { uploadAboutImage, getAboutContent, updateAboutContent } = await import('../../services/aboutService');
        const url = await uploadAboutImage('founders', fileToUpload, (p) => setUploadProgress(p));
        const aboutData = await getAboutContent();
        
        const defaultFounders = [
          { name: 'Akhilkumar K A', position: 'Co-Founder', photo: '', intro: '', quote: '', linkedin: '', facebook: '', email: '' },
          { name: 'Amal Babu', position: 'Co-Founder', photo: '', intro: '', quote: '', linkedin: '', facebook: '', email: '' },
        ];

        const existingList = (aboutData?.founders && aboutData.founders.length >= 2)
          ? aboutData.founders
          : defaultFounders;

        const updatedFounders = existingList.map((f, idx) => {
          const founderName = f.name?.trim() ? f.name : (idx === 0 ? 'Akhilkumar K A' : idx === 1 ? 'Amal Babu' : `Founder ${idx + 1}`);
          if (idx === replacingIdx) {
            return {
              ...f,
              name: founderName,
              position: f.position || 'Co-Founder',
              photo: url,
            };
          }
          return {
            ...f,
            name: founderName,
          };
        });

        await updateAboutContent({ ...(aboutData ?? {}), founders: updatedFounders });
        const updatedName = updatedFounders[replacingIdx].name;
        toast.success(`Photo replaced for ${updatedName}!`);
        load('about_founders');
        return;
      } else if (currentSubsection.id === 'products' && targetItem.id.startsWith('prod-db-')) {
        const productId = targetItem.id.replace('prod-db-', '');
        const { uploadProductImage, updateProduct } = await import('../../services/productsService');
        const fileToUpload = new File([croppedBlob], `prod-${productId}-${Date.now()}.jpg`, { type: 'image/jpeg' });
        const imgRow = await uploadProductImage(productId, fileToUpload, (p) => setUploadProgress(p));
        await updateProduct(productId, { main_image_url: imgRow.url });
        toast.success(`Product photo replaced for ${targetItem.title}!`);
        load('products');
        return;
      } else {
        const dbFolder = DB_FOLDER_MAP[currentSubsection.id] || 'factory';
        const url = await uploadGalleryImage(dbFolder, fileToUpload, (p) => setUploadProgress(p));
        const isRealUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(targetItem.id);

        if (isRealUuid) {
          const { updateGalleryItem } = await import('../../services/galleryService');
          await updateGalleryItem(targetItem.id, {
            image_url: url,
            title: targetItem.title.includes(`[${currentSubsection.id}]`) ? targetItem.title : `[${currentSubsection.id}] ${targetItem.title}`,
          });
        } else {
          await createGalleryItem({
            title: targetItem.title.includes(`[${currentSubsection.id}]`) ? targetItem.title : `[${currentSubsection.id}] ${targetItem.title || currentSubsection.label}`,
            folder: dbFolder,
            image_url: url,
            display_order: replacingIdx,
          });
        }

        toast.success('Image replaced successfully!');
        load(currentSubsection.id);
      }
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setReplacingIdx(null);
      setTimeout(() => setUploadProgress(0), 1200);
    }
  };

  const handleMove = async (index: number, direction: 'left' | 'right') => {
    const newItems = [...items];
    const targetIndex = direction === 'left' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newItems.length) return;

    const temp = newItems[index];
    newItems[index] = newItems[targetIndex];
    newItems[targetIndex] = temp;

    const updated = newItems.map((item, i) => ({ ...item, display_order: i }));
    setItems(updated);

    const hasDefault = updated.some((i) => i.id.startsWith('default-') || i.id.startsWith('def-'));
    if (!hasDefault) {
      try {
        await reorderGalleryItems(updated.map((i) => ({ id: i.id, display_order: i.display_order })));
        toast.success('Reordered successfully.');
      } catch (e: any) {
        toast.error('Failed to reorder.');
        load(currentSubsection.id);
      }
    }
  };

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    toast.success('Image URL copied to clipboard!');
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#0D2012]/80 p-6 rounded-2xl border border-[#C5A046]/30 shadow-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-[#C5A046]">
            <Layers className="w-5 h-5" />
            <h2 className="text-xl font-light text-[#FAF8F5]">Structured Media & Gallery Hub</h2>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Organized by website page & section — upload, crop, order, and copy image links for every part of your website.
          </p>
        </div>
      </div>

      {/* ── 1. MAIN PAGE TABS ─────────────────────────────────── */}
      <div className="flex border-b border-[#C5A046]/20 overflow-x-auto gap-1">
        {PAGE_SECTIONS.map((page) => (
          <button
            key={page.id}
            type="button"
            onClick={() => setActivePageId(page.id)}
            className={`px-5 py-3 text-xs uppercase tracking-wider shrink-0 transition-all font-medium cursor-pointer rounded-t-xl ${
              activePageId === page.id
                ? 'bg-[#0D2012] text-[#C5A046] border-t-2 border-x border-[#C5A046]/40 shadow-lg'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            {page.label}
          </button>
        ))}
      </div>

      {/* ── 2. SUBSECTION SUB-TABS ────────────────────────────── */}
      <div className="bg-[#0D2012]/80 p-5 rounded-2xl border border-[#C5A046]/30 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[#C5A046]/20 pb-4">
          <div>
            <span className="text-xs text-[#C5A046] uppercase tracking-wider font-semibold block">
              {currentPage.label}
            </span>
            <p className="text-xs text-stone-300 font-light mt-0.5">{currentPage.description}</p>
          </div>
        </div>

        {/* Sub-section Pill Selectors */}
        <div className="flex flex-wrap gap-2">
          {currentPage.subsections.map((sub) => (
            <button
              key={sub.id}
              type="button"
              onClick={() => handleSubsectionSelect(sub.id)}
              className={`px-4 py-2.5 rounded-xl text-xs font-medium transition-all flex items-center gap-2 cursor-pointer ${
                activeSubsectionId === sub.id
                  ? 'bg-gradient-to-r from-[#C5A046] to-[#DFBF6C] text-[#071309] font-bold shadow-md'
                  : 'bg-[#071309] text-stone-300 border border-[#C5A046]/30 hover:border-[#C5A046]'
              }`}
            >
              <span>{sub.label}</span>
              <span
                className={`px-2 py-0.5 rounded-md text-[10px] uppercase tracking-wider ${
                  activeSubsectionId === sub.id
                    ? 'bg-[#071309]/30 text-[#071309]'
                    : 'bg-[#C5A046]/20 text-[#C5A046]'
                }`}
              >
                {sub.aspect} Ratio
              </span>
            </button>
          ))}
        </div>

        {/* Sub-section Hint Banner */}
        <div className="bg-[#071309] p-4 rounded-xl border border-[#C5A046]/20 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-stone-300">
            <ImageIcon className="w-4 h-4 text-[#C5A046]" />
            <span>
              <strong className="text-[#C5A046] font-medium">{currentSubsection.label}:</strong>{' '}
              {currentSubsection.hint}
            </span>
          </div>
          <span className="text-[10px] text-stone-400 font-mono bg-[#0D2012] px-2 py-1 rounded border border-[#C5A046]/30">
            Recommended: {currentSubsection.aspect}
          </span>
        </div>
      </div>

      {/* ── 3. UPLOAD ZONE FOR THIS SUBSECTION ───────────────── */}
      <div className="bg-[#0D2012]/80 p-5 rounded-2xl border border-[#C5A046]/20 space-y-4">
        <h4 className="text-xs uppercase tracking-wider text-[#C5A046] font-medium">
          Upload New Image to {currentSubsection.label}
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div className="md:col-span-1">
            {currentSubsection.id === 'about_founders' ? (
              <div>
                <label className="block text-xs text-[#C5A046] font-medium mb-1">
                  Select Founder to Update Photo
                </label>
                <select
                  value={selectedFounderIdx}
                  onChange={(e) => setSelectedFounderIdx(Number(e.target.value))}
                  className="w-full bg-[#071309] border border-[#C5A046]/40 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#C5A046] cursor-pointer"
                >
                  {items.map((fItem, idx) => (
                    <option key={fItem.id} value={idx}>
                      Founder {idx + 1}: {fItem.title}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div>
                <label className="block text-xs text-stone-400 mb-1">Image Title / Description (Optional)</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder={`e.g. ${currentSubsection.label}`}
                  className="w-full bg-[#071309] border border-[#C5A046]/30 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#C5A046]"
                />
              </div>
            )}
          </div>
          <div className="md:col-span-2">
            <FileUpload
              label={`Upload & Crop (${currentSubsection.aspect} ratio)`}
              accept="image"
              defaultAspect={currentSubsection.aspect}
              onFiles={handleUpload}
              progress={uploadProgress}
            />
          </div>
        </div>
      </div>

      {/* ── 4. EXISTING IMAGES GRID ───────────────────────────── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-light text-[#FAF8F5]">
            Photos in <span className="text-[#C5A046] font-medium">{currentSubsection.label}</span> ({items.length})
          </h3>
          <span className="text-xs text-gray-500 font-light">Drag or use arrow buttons to reorder</span>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-12 bg-[#0D2012]/40 rounded-2xl border border-dashed border-[#C5A046]/30 text-gray-400">
            <ImageIcon className="w-10 h-10 mx-auto text-[#C5A046]/40 mb-2" />
            <p className="text-sm">No images in {currentSubsection.label} yet.</p>
            <p className="text-xs text-gray-500 mt-1">Upload photos using the box above with the cropper tool.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {items.map((item, idx) => (
              <div
                key={item.id}
                className="group relative bg-[#0D2012]/80 rounded-2xl border border-[#C5A046]/20 overflow-hidden shadow-lg hover:border-[#C5A046]/50 transition-all flex flex-col justify-between"
              >
                {/* Image Container */}
                <div className="relative aspect-[4/3] overflow-hidden bg-[#071309]">
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-[#071309] text-stone-500">
                      <span className="text-3xl">👤</span>
                      <span className="text-[11px] mt-1 font-mono text-stone-400">Photo Removed</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#071309] via-transparent to-transparent opacity-80" />

                  {/* Top Action Overlay */}
                  <div className="absolute top-2 right-2 flex items-center gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={() => triggerCardReplace(idx)}
                      className="p-1.5 rounded-lg bg-[#071309]/80 text-[#C5A046] hover:bg-[#C5A046] hover:text-[#071309] transition-all"
                      title="Replace Photo"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCopyUrl(item.image_url)}
                      className="p-1.5 rounded-lg bg-[#071309]/80 text-[#C5A046] hover:bg-[#C5A046] hover:text-[#071309] transition-all"
                      title="Copy Image URL"
                    >
                      {copiedUrl === item.image_url ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(item)}
                      className="p-1.5 rounded-lg bg-red-950/80 text-red-400 hover:bg-red-600 hover:text-white transition-all"
                      title="Delete Image"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Reorder Buttons */}
                  <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-[#071309]/80 backdrop-blur-md rounded-lg p-1 border border-[#C5A046]/30">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => handleMove(idx, 'left')}
                      className="p-1 text-[#C5A046] hover:text-white disabled:opacity-30 disabled:hover:text-[#C5A046]"
                      title="Move Left"
                    >
                      <MoveLeft className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-[10px] text-gray-300 font-mono px-1">#{idx + 1}</span>
                    <button
                      type="button"
                      disabled={idx === items.length - 1}
                      onClick={() => handleMove(idx, 'right')}
                      className="p-1 text-[#C5A046] hover:text-white disabled:opacity-30 disabled:hover:text-[#C5A046]"
                      title="Move Right"
                    >
                      <MoveRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Footer details */}
                <div className="p-3 space-y-2">
                  <div>
                    <h5 className="text-xs text-white font-medium truncate">{item.title}</h5>
                    <p className="text-[10px] text-gray-400 truncate mt-0.5 font-mono">{item.image_url || 'No Image Set'}</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => triggerCardReplace(idx)}
                    className="w-full py-1.5 rounded-lg bg-[#C5A046]/10 border border-[#C5A046]/40 text-[#C5A046] hover:bg-[#C5A046] hover:text-[#071309] text-[11px] font-medium transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <RefreshCw className="w-3 h-3" /> Replace Photo
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Hidden File Input for Direct Card Replacement */}
      <input
        ref={cardFileInputRef}
        type="file"
        accept="image/*"
        onChange={handleCardFileSelected}
        className="hidden"
      />

      {/* Card Replacement Cropper Modal */}
      {cropModalFile && (
        <ImageCropperModal
          isOpen={!!cropModalFile}
          imageFile={cropModalFile}
          defaultAspect={currentSubsection.aspect}
          onClose={() => setCropModalFile(null)}
          onCropComplete={handleCropComplete}
        />
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Delete Image"
        message={`Are you sure you want to delete "${deleteTarget?.title}"?`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

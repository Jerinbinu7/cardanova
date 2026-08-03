import { useEffect, useState } from 'react';
import { cmsService } from '../../services/cmsService';
import { Package, Image as ImageIcon, MessageSquareQuote, Award, ArrowUpRight } from 'lucide-react';

interface DashboardOverviewProps {
  onNavigateTab: (tab: string) => void;
}

export default function DashboardOverview({ onNavigateTab }: DashboardOverviewProps) {
  const [productCount, setProductCount] = useState(0);
  const [galleryCount, setGalleryCount] = useState(0);
  const [quoteCount, setQuoteCount] = useState(0);
  const [certCount, setCertCount] = useState(0);
  const [recentQuotes, setRecentQuotes] = useState<any[]>([]);

  useEffect(() => {
    async function loadStats() {
      const [prods, gallery, quotes, certs] = await Promise.all([
        cmsService.getProducts(),
        cmsService.getGallery(),
        cmsService.getQuotes(),
        cmsService.getCertifications(),
      ]);
      setProductCount(prods.length);
      setGalleryCount(gallery.length);
      setQuoteCount(quotes.length);
      setCertCount(certs.length);
      setRecentQuotes(quotes.slice(0, 5));
    }
    loadStats();
  }, []);

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-[#0D2012] via-[#142C1B] to-[#0D2012] p-6 rounded-2xl border border-[#C5A046]/30 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-xl">
        <div>
          <h2 className="text-xl font-light tracking-wide text-[#FAF8F5]">
            Welcome to <span className="text-[#C5A046] font-normal">Cardanova CMS Dashboard</span>
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Manage your spice catalog, export quotes, certifications, and homepage content.
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#C5A046]/10 border border-[#C5A046]/40 text-xs text-[#C5A046]">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Status: Active & Secure</span>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div
          onClick={() => onNavigateTab('products')}
          className="bg-[#0D2012]/80 border border-[#C5A046]/20 hover:border-[#C5A046]/50 rounded-2xl p-5 cursor-pointer transition-all hover:-translate-y-1 shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div className="p-3 bg-[#C5A046]/10 rounded-xl border border-[#C5A046]/30">
              <Package className="w-6 h-6 text-[#C5A046]" />
            </div>
            <ArrowUpRight className="w-4 h-4 text-gray-400" />
          </div>
          <p className="text-3xl font-light text-[#FAF8F5] mt-4">{productCount}</p>
          <p className="text-xs uppercase tracking-wider text-gray-400 mt-1">Active Products</p>
        </div>

        <div
          onClick={() => onNavigateTab('quotes')}
          className="bg-[#0D2012]/80 border border-[#C5A046]/20 hover:border-[#C5A046]/50 rounded-2xl p-5 cursor-pointer transition-all hover:-translate-y-1 shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div className="p-3 bg-[#C5A046]/10 rounded-xl border border-[#C5A046]/30">
              <MessageSquareQuote className="w-6 h-6 text-[#C5A046]" />
            </div>
            <ArrowUpRight className="w-4 h-4 text-gray-400" />
          </div>
          <p className="text-3xl font-light text-[#FAF8F5] mt-4">{quoteCount}</p>
          <p className="text-xs uppercase tracking-wider text-gray-400 mt-1">B2B Quote Requests</p>
        </div>

        <div
          onClick={() => onNavigateTab('gallery')}
          className="bg-[#0D2012]/80 border border-[#C5A046]/20 hover:border-[#C5A046]/50 rounded-2xl p-5 cursor-pointer transition-all hover:-translate-y-1 shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div className="p-3 bg-[#C5A046]/10 rounded-xl border border-[#C5A046]/30">
              <ImageIcon className="w-6 h-6 text-[#C5A046]" />
            </div>
            <ArrowUpRight className="w-4 h-4 text-gray-400" />
          </div>
          <p className="text-3xl font-light text-[#FAF8F5] mt-4">{galleryCount}</p>
          <p className="text-xs uppercase tracking-wider text-gray-400 mt-1">Gallery Assets</p>
        </div>

        <div
          onClick={() => onNavigateTab('certifications')}
          className="bg-[#0D2012]/80 border border-[#C5A046]/20 hover:border-[#C5A046]/50 rounded-2xl p-5 cursor-pointer transition-all hover:-translate-y-1 shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div className="p-3 bg-[#C5A046]/10 rounded-xl border border-[#C5A046]/30">
              <Award className="w-6 h-6 text-[#C5A046]" />
            </div>
            <ArrowUpRight className="w-4 h-4 text-gray-400" />
          </div>
          <p className="text-3xl font-light text-[#FAF8F5] mt-4">{certCount}</p>
          <p className="text-xs uppercase tracking-wider text-gray-400 mt-1">Certifications</p>
        </div>
      </div>

      {/* Recent Quote Requests Section */}
      <div className="bg-[#0D2012]/80 border border-[#C5A046]/20 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-light text-[#FAF8F5]">Recent B2B Trade Inquiries</h3>
            <p className="text-xs text-gray-400">Latest international quote requests submitted via website</p>
          </div>
          <button
            onClick={() => onNavigateTab('quotes')}
            className="text-xs text-[#C5A046] hover:underline uppercase tracking-wider"
          >
            View All Quotes &rarr;
          </button>
        </div>

        {recentQuotes.length === 0 ? (
          <p className="text-sm text-gray-400 italic">No quote requests recorded yet.</p>
        ) : (
          <div className="divide-y divide-[#C5A046]/10">
            {recentQuotes.map((q) => (
              <div key={q.id} className="py-3 flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-[#FAF8F5] font-medium">{q.fullName} <span className="text-gray-400 font-normal">({q.companyName || 'N/A'})</span></p>
                  <p className="text-xs text-gray-400">{q.country} · {q.selectedProducts} · {q.quantityKg}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold tracking-wider uppercase ${
                    q.status === 'pending'
                      ? 'bg-amber-950/80 text-amber-300 border border-amber-500/30'
                      : q.status === 'contacted'
                      ? 'bg-blue-950/80 text-blue-300 border border-blue-500/30'
                      : 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/30'
                  }`}>
                    {q.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

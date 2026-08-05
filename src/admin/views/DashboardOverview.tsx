import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Package, Image as ImageIcon, MessageSquareQuote, Award, Star, HelpCircle, ArrowUpRight, Wifi, WifiOff } from 'lucide-react';

interface DashboardOverviewProps {
  onNavigateTab: (tab: string) => void;
}

interface Stats {
  products: number;
  gallery: number;
  quotes: number;
  certifications: number;
  testimonials: number;
  faqs: number;
}

export default function DashboardOverview({ onNavigateTab }: DashboardOverviewProps) {
  const [stats, setStats]           = useState<Stats>({ products: 0, gallery: 0, quotes: 0, certifications: 0, testimonials: 0, faqs: 0 });
  const [recentQuotes, setRecentQuotes] = useState<any[]>([]);
  const [loading, setLoading]       = useState(true);
  const [connected, setConnected]   = useState<boolean | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [p, g, q, c, t, f] = await Promise.all([
          supabase.from('products').select('id', { count: 'exact', head: true }),
          supabase.from('gallery_items').select('id', { count: 'exact', head: true }),
          supabase.from('quote_requests').select('id', { count: 'exact', head: true }),
          supabase.from('certifications').select('id', { count: 'exact', head: true }),
          supabase.from('testimonials').select('id', { count: 'exact', head: true }),
          supabase.from('faqs').select('id', { count: 'exact', head: true }),
        ]);
        setStats({
          products: p.count ?? 0,
          gallery: g.count ?? 0,
          quotes: q.count ?? 0,
          certifications: c.count ?? 0,
          testimonials: t.count ?? 0,
          faqs: f.count ?? 0,
        });

        const { data: recent } = await supabase
          .from('quote_requests')
          .select('*')
          .order('submitted_at', { ascending: false })
          .limit(5);
        setRecentQuotes(recent ?? []);
        setConnected(true);
      } catch {
        setConnected(false);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const metricCards = [
    { id: 'products',       label: 'Active Products',    value: stats.products,      icon: Package,            color: 'from-[#C5A046]/20 to-[#DFBF6C]/10' },
    { id: 'quotes',         label: 'Quote Requests',     value: stats.quotes,        icon: MessageSquareQuote, color: 'from-blue-500/20 to-blue-500/5' },
    { id: 'gallery',        label: 'Gallery Assets',     value: stats.gallery,       icon: ImageIcon,          color: 'from-purple-500/20 to-purple-500/5' },
    { id: 'certifications', label: 'Certifications',     value: stats.certifications, icon: Award,             color: 'from-emerald-500/20 to-emerald-500/5' },
    { id: 'testimonials',   label: 'Testimonials',       value: stats.testimonials,  icon: Star,               color: 'from-rose-500/20 to-rose-500/5' },
    { id: 'faq',            label: 'FAQs',               value: stats.faqs,          icon: HelpCircle,         color: 'from-cyan-500/20 to-cyan-500/5' },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome banner */}
      <div className="bg-gradient-to-r from-[#0D2012] via-[#142C1B] to-[#0D2012] p-6 rounded-2xl border border-[#C5A046]/30 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-xl">
        <div>
          <h2 className="text-xl font-light tracking-wide text-[#FAF8F5]">
            Welcome to <span className="text-[#C5A046] font-normal">Cardanova CMS</span>
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Manage your spice catalog, export quotes, certifications, and all website content.
          </p>
        </div>
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs ${connected === false ? 'bg-red-950/60 border-red-500/40 text-red-300' : 'bg-[#C5A046]/10 border-[#C5A046]/40 text-[#C5A046]'}`}>
          {connected === false
            ? <><WifiOff className="w-3.5 h-3.5" /> <span>Supabase disconnected</span></>
            : <><Wifi className="w-3.5 h-3.5" /><span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /><span>Supabase Connected</span></>
          }
        </div>
      </div>

      {/* Metrics grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {metricCards.map(({ id, label, value, icon: Icon, color }) => (
          <div
            key={id}
            onClick={() => onNavigateTab(id)}
            className={`bg-gradient-to-br ${color} border border-[#C5A046]/20 hover:border-[#C5A046]/50 rounded-2xl p-4 cursor-pointer transition-all hover:-translate-y-1 shadow-lg`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-[#C5A046]/10 rounded-xl border border-[#C5A046]/20">
                <Icon className="w-4 h-4 text-[#C5A046]" />
              </div>
              <ArrowUpRight className="w-3.5 h-3.5 text-gray-500" />
            </div>
            <p className="text-2xl font-light text-[#FAF8F5]">
              {loading ? <span className="inline-block w-8 h-7 bg-white/5 rounded animate-pulse" /> : value}
            </p>
            <p className="text-[11px] uppercase tracking-wider text-gray-400 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Recent Quotes */}
      <div className="bg-[#0D2012]/80 border border-[#C5A046]/20 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-base font-light text-[#FAF8F5]">Recent B2B Inquiries</h3>
            <p className="text-xs text-gray-400">Latest international quote requests</p>
          </div>
          <button onClick={() => onNavigateTab('quotes')} className="text-xs text-[#C5A046] hover:underline uppercase tracking-wider">
            View All →
          </button>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1,2,3].map((i) => (
              <div key={i} className="h-10 bg-white/5 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : recentQuotes.length === 0 ? (
          <p className="text-sm text-gray-400 italic text-center py-8">No quote requests yet.</p>
        ) : (
          <div className="divide-y divide-[#C5A046]/10">
            {recentQuotes.map((q) => (
              <div key={q.id} className="py-3 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-sm text-[#FAF8F5] font-medium truncate">
                    {q.full_name} <span className="text-gray-400 font-normal">({q.company_name || 'N/A'})</span>
                  </p>
                  <p className="text-xs text-gray-400 truncate">{q.country} · {q.selected_products} · {q.quantity_kg}</p>
                </div>
                <span className={`shrink-0 px-2.5 py-1 rounded-full text-[10px] font-semibold tracking-wider uppercase ${
                  q.status === 'pending'   ? 'bg-amber-950/80 text-amber-300 border border-amber-500/30'   :
                  q.status === 'contacted' ? 'bg-blue-950/80 text-blue-300 border border-blue-500/30'     :
                                             'bg-emerald-950/80 text-emerald-300 border border-emerald-500/30'
                }`}>
                  {q.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

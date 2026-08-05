import { useEffect, useState } from 'react';
import { XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { getQuoteRequests, updateQuoteStatus, deleteQuoteRequest } from '../../services/quoteService';
import type { QuoteRequestRow, QuoteStatus } from '../../types/database';
import ConfirmDialog from '../components/ConfirmDialog';
import { SkeletonRow } from '../components/Skeleton';

const STATUS_CONFIG: Record<QuoteStatus, { label: string; class: string }> = {
  pending:   { label: 'Pending',   class: 'bg-amber-950/80 text-amber-300 border-amber-500/30' },
  contacted: { label: 'Contacted', class: 'bg-blue-950/80 text-blue-300 border-blue-500/30' },
  closed:    { label: 'Closed',    class: 'bg-emerald-950/80 text-emerald-300 border-emerald-500/30' },
};

export default function QuoteRequestsManager() {
  const [quotes, setQuotes]       = useState<QuoteRequestRow[]>([]);
  const [count, setCount]         = useState(0);
  const [loading, setLoading]     = useState(true);
  const [filter, setFilter]       = useState<QuoteStatus | undefined>(undefined);
  const [page, setPage]           = useState(1);
  const [selected, setSelected]   = useState<QuoteRequestRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<QuoteRequestRow | null>(null);
  const PAGE_SIZE = 15;

  const load = async () => {
    setLoading(true);
    try {
      const { data, count: c } = await getQuoteRequests({ status: filter, page, pageSize: PAGE_SIZE });
      setQuotes(data); setCount(c);
    } catch (e: any) { toast.error(e.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [filter, page]);

  const handleStatusChange = async (id: string, status: QuoteStatus) => {
    try { await updateQuoteStatus(id, status); toast.success(`Marked as ${status}.`); load(); }
    catch (e: any) { toast.error(e.message); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try { await deleteQuoteRequest(deleteTarget.id); toast.success('Quote deleted.'); load(); }
    catch (e: any) { toast.error(e.message); }
    finally { setDeleteTarget(null); }
  };

  const totalPages = Math.ceil(count / PAGE_SIZE);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#0D2012]/80 p-6 rounded-2xl border border-[#C5A046]/30 shadow-xl">
        <div>
          <h2 className="text-xl font-light text-[#FAF8F5]">B2B Quote Requests <span className="ml-2 text-sm text-gray-400">({count})</span></h2>
          <p className="text-xs text-gray-400 mt-1">Manage international trade inquiries</p>
        </div>
        {/* Status Filter */}
        <div className="flex gap-2 flex-wrap">
          {([undefined, 'pending', 'contacted', 'closed'] as (QuoteStatus | undefined)[]).map((s) => (
            <button key={String(s)} onClick={() => { setFilter(s); setPage(1); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium uppercase tracking-wider transition-all ${
                filter === s ? 'bg-[#C5A046] text-[#071309]' : 'bg-[#071309] border border-[#C5A046]/30 text-gray-300 hover:border-[#C5A046]/60'
              }`}>
              {s ?? 'All'}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-[#0D2012]/80 border border-[#C5A046]/20 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-[#FAF8F5]">
            <thead className="bg-[#071309]/80 text-[#C5A046] uppercase text-[11px] tracking-wider border-b border-[#C5A046]/20">
              <tr>
                <th className="p-4">Contact</th>
                <th className="p-4 hidden md:table-cell">Products & Qty</th>
                <th className="p-4 hidden lg:table-cell">Date</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#C5A046]/10">
              {loading ? Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} cols={5} />)
                : quotes.length === 0
                  ? <tr><td colSpan={5} className="text-center py-12 text-gray-400">No quote requests found.</td></tr>
                  : quotes.map((q) => (
                    <tr key={q.id} className="hover:bg-[#C5A046]/5 cursor-pointer" onClick={() => setSelected(q)}>
                      <td className="p-4">
                        <p className="font-medium text-[#FAF8F5]">{q.full_name}</p>
                        <p className="text-xs text-gray-400">{q.company_name} · {q.country}</p>
                        <p className="text-xs text-[#C5A046]/70">{q.email}</p>
                      </td>
                      <td className="p-4 hidden md:table-cell">
                        <p className="text-xs text-gray-300">{q.selected_products}</p>
                        {q.quantity_kg && <p className="text-xs text-gray-400">{q.quantity_kg} kg</p>}
                      </td>
                      <td className="p-4 hidden lg:table-cell text-xs text-gray-400">
                        {new Date(q.submitted_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' })}
                      </td>
                      <td className="p-4" onClick={(e) => e.stopPropagation()}>
                        <select value={q.status} onChange={(e) => handleStatusChange(q.id, e.target.value as QuoteStatus)}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-semibold tracking-wider uppercase border cursor-pointer bg-transparent ${STATUS_CONFIG[q.status].class}`}>
                          {(['pending', 'contacted', 'closed'] as QuoteStatus[]).map((s) => (
                            <option key={s} value={s} className="bg-[#0D2012] text-white">{STATUS_CONFIG[s].label}</option>
                          ))}
                        </select>
                      </td>
                      <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <button onClick={() => setDeleteTarget(q)} className="p-2 rounded-lg bg-red-950/40 text-red-400 hover:bg-red-900/60">
                          <XCircle className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
              }
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-[#C5A046]/10">
            <p className="text-xs text-gray-400">Page {page} of {totalPages}</p>
            <div className="flex gap-2">
              <button disabled={page === 1} onClick={() => setPage((p) => p - 1)} className="px-3 py-1.5 text-xs rounded-lg bg-[#071309] border border-[#C5A046]/30 text-gray-300 disabled:opacity-40">Prev</button>
              <button disabled={page === totalPages} onClick={() => setPage((p) => p + 1)} className="px-3 py-1.5 text-xs rounded-lg bg-[#071309] border border-[#C5A046]/30 text-gray-300 disabled:opacity-40">Next</button>
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="bg-[#0D2012] border border-[#C5A046]/40 rounded-2xl w-full max-w-lg shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center p-6 border-b border-[#C5A046]/20">
              <h3 className="text-lg font-light text-[#FAF8F5]">Inquiry Detail</h3>
              <button onClick={() => setSelected(null)}><XCircle className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                {[
                  ['Name', selected.full_name], ['Company', selected.company_name], ['Country', selected.country],
                  ['Email', selected.email], ['Phone', selected.phone], ['Products', selected.selected_products],
                  ['Quantity', selected.quantity_kg ? `${selected.quantity_kg} kg` : '—'], ['Submitted', new Date(selected.submitted_at).toLocaleString('en-IN')],
                ].map(([label, value]) => (
                  <div key={label}>
                    <p className="text-xs text-gray-400 uppercase tracking-wider">{label}</p>
                    <p className="text-[#FAF8F5] font-medium mt-0.5">{value || '—'}</p>
                  </div>
                ))}
              </div>
              {selected.message && (
                <div className="p-3 bg-[#071309]/60 border border-[#C5A046]/20 rounded-xl">
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Message</p>
                  <p className="text-sm text-gray-300">{selected.message}</p>
                </div>
              )}
              <div className="flex gap-3 pt-2">
                <a href={`mailto:${selected.email}`} className="flex-1 py-2.5 rounded-xl text-center text-xs text-[#071309] font-medium bg-gradient-to-r from-[#C5A046] to-[#DFBF6C] hover:brightness-110">
                  Reply via Email
                </a>
                {selected.phone && (
                  <a href={`https://wa.me/${selected.phone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer"
                    className="flex-1 py-2.5 rounded-xl text-center text-xs text-emerald-300 font-medium bg-emerald-950/60 border border-emerald-500/30 hover:bg-emerald-900/80">
                    WhatsApp
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog isOpen={!!deleteTarget} title="Delete Quote Request" message={`Permanently delete inquiry from "${deleteTarget?.full_name}"?`} onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} />
    </div>
  );
}

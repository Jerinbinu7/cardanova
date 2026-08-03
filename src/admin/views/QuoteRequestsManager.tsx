import { useEffect, useState } from 'react';
import { cmsService } from '../../services/cmsService';
import { QuoteRequestData } from '../../services/mockSanityStore';
import { Search, Eye, Mail, Phone, X } from 'lucide-react';

export default function QuoteRequestsManager() {
  const [quotes, setQuotes] = useState<QuoteRequestData[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedQuote, setSelectedQuote] = useState<QuoteRequestData | null>(null);

  useEffect(() => {
    loadQuotes();
  }, []);

  const loadQuotes = async () => {
    const data = await cmsService.getQuotes();
    setQuotes(data);
  };

  const handleStatusChange = async (id: string, newStatus: 'pending' | 'contacted' | 'closed') => {
    await cmsService.updateQuoteStatus(id, newStatus);
    if (selectedQuote && selectedQuote.id === id) {
      setSelectedQuote({ ...selectedQuote, status: newStatus });
    }
    loadQuotes();
  };

  const filteredQuotes = quotes.filter((q) => {
    const matchesStatus = filterStatus === 'all' || q.status === filterStatus;
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      q.fullName.toLowerCase().includes(searchLower) ||
      q.companyName.toLowerCase().includes(searchLower) ||
      q.country.toLowerCase().includes(searchLower) ||
      q.email.toLowerCase().includes(searchLower);
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-[#0D2012]/80 p-6 rounded-2xl border border-[#C5A046]/30 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-light text-[#FAF8F5]">B2B Quote Requests Manager</h2>
          <p className="text-xs text-gray-400 mt-1">Review, track, and process international trade & bulk export inquiries</p>
        </div>

        {/* Search & Filter Controls */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 sm:flex-initial">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search importer name, company, email..."
              className="bg-[#071309] border border-[#C5A046]/30 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-gray-500 w-full sm:w-64"
            />
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-[#071309] border border-[#C5A046]/30 rounded-xl px-3 py-2 text-xs text-white"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending 🟡</option>
            <option value="contacted">Contacted 🔵</option>
            <option value="closed">Closed 🟢</option>
          </select>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-[#0D2012]/80 border border-[#C5A046]/20 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-[#FAF8F5]">
            <thead className="bg-[#071309]/80 text-[#C5A046] uppercase text-[11px] tracking-wider border-b border-[#C5A046]/20">
              <tr>
                <th className="p-4">Customer & Company</th>
                <th className="p-4">Country</th>
                <th className="p-4">Products & Quantity</th>
                <th className="p-4">Date</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#C5A046]/10 text-xs">
              {filteredQuotes.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-400 italic">
                    No quote requests match your filter.
                  </td>
                </tr>
              ) : (
                filteredQuotes.map((q) => (
                  <tr key={q.id} className="hover:bg-[#C5A046]/5 transition-colors">
                    <td className="p-4">
                      <p className="font-medium text-sm text-[#FAF8F5]">{q.fullName}</p>
                      <p className="text-gray-400 text-[11px]">{q.companyName || 'Individual / Private'}</p>
                      <p className="text-gray-500 text-[10px]">{q.email}</p>
                    </td>
                    <td className="p-4 text-gray-300 font-medium">{q.country}</td>
                    <td className="p-4">
                      <p className="text-gray-200 font-medium">{q.selectedProducts}</p>
                      <p className="text-[#C5A046] text-[11px]">{q.quantityKg}</p>
                    </td>
                    <td className="p-4 text-gray-400">
                      {new Date(q.submittedAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="p-4">
                      <select
                        value={q.status}
                        onChange={(e) => handleStatusChange(q.id, e.target.value as any)}
                        className={`text-xs px-2.5 py-1 rounded-full border cursor-pointer font-semibold uppercase tracking-wider ${
                          q.status === 'pending'
                            ? 'bg-amber-950/80 text-amber-300 border-amber-500/40'
                            : q.status === 'contacted'
                            ? 'bg-blue-950/80 text-blue-300 border-blue-500/40'
                            : 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40'
                        }`}
                      >
                        <option value="pending">Pending 🟡</option>
                        <option value="contacted">Contacted 🔵</option>
                        <option value="closed">Closed 🟢</option>
                      </select>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => setSelectedQuote(q)}
                        className="px-3 py-1.5 rounded-lg bg-[#C5A046]/10 text-[#C5A046] hover:bg-[#C5A046]/20 transition-colors inline-flex items-center gap-1.5 text-xs"
                      >
                        <Eye className="w-3.5 h-3.5" /> View Specs
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail View Modal */}
      {selectedQuote && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0D2012] border border-[#C5A046]/40 rounded-2xl max-w-xl w-full p-6 text-[#FAF8F5] shadow-2xl space-y-5 relative">
            <div className="flex justify-between items-start border-b border-[#C5A046]/20 pb-4">
              <div>
                <h3 className="text-lg font-light text-[#FAF8F5]">{selectedQuote.fullName}</h3>
                <p className="text-xs text-[#C5A046]">{selectedQuote.companyName} · {selectedQuote.country}</p>
              </div>
              <button onClick={() => setSelectedQuote(null)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-[#071309] p-3 rounded-xl border border-[#C5A046]/20">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-[#C5A046]" />
                  <a href={`mailto:${selectedQuote.email}`} className="text-gray-300 hover:underline">{selectedQuote.email}</a>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-[#C5A046]" />
                  <a href={`tel:${selectedQuote.phone}`} className="text-gray-300 hover:underline">{selectedQuote.phone}</a>
                </div>
              </div>

              <div>
                <p className="text-[11px] text-[#C5A046] uppercase font-semibold">Requested Grade & Target Volume</p>
                <p className="text-sm font-medium text-white mt-1">{selectedQuote.selectedProducts}</p>
                <p className="text-xs text-[#C5A046] mt-0.5">Quantity: {selectedQuote.quantityKg}</p>
              </div>

              <div>
                <p className="text-[11px] text-[#C5A046] uppercase font-semibold">Trade Message & Notes</p>
                <p className="text-xs text-gray-300 bg-[#071309] p-3 rounded-xl border border-[#C5A046]/20 mt-1">
                  {selectedQuote.message || 'No additional trade instructions provided.'}
                </p>
              </div>

              <div className="pt-3 border-t border-[#C5A046]/20 flex items-center justify-between">
                <span className="text-[11px] text-gray-500">Submitted: {new Date(selectedQuote.submittedAt).toLocaleString()}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">Update Status:</span>
                  <select
                    value={selectedQuote.status}
                    onChange={(e) => handleStatusChange(selectedQuote.id, e.target.value as any)}
                    className="bg-[#071309] border border-[#C5A046]/40 rounded-lg px-2.5 py-1 text-xs text-white"
                  >
                    <option value="pending">Pending 🟡</option>
                    <option value="contacted">Contacted 🔵</option>
                    <option value="closed">Closed 🟢</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

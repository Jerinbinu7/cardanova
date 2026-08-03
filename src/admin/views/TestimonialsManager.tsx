import React, { useEffect, useState } from 'react';
import { cmsService } from '../../services/cmsService';
import { TestimonialData } from '../../services/mockSanityStore';
import { Star, Plus, Trash2 } from 'lucide-react';

export default function TestimonialsManager() {
  const [items, setItems] = useState<TestimonialData[]>([]);
  const [clientName, setClientName] = useState('');
  const [company, setCompany] = useState('');
  const [country, setCountry] = useState('');
  const [quote, setQuote] = useState('');

  useEffect(() => {
    loadTestimonials();
  }, []);

  const loadTestimonials = async () => {
    const data = await cmsService.getTestimonials();
    setItems(data);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName || !quote) return;

    await cmsService.saveTestimonial({
      id: '',
      clientName,
      company,
      country,
      quote,
      rating: 5,
      isFeatured: true,
    });

    setClientName('');
    setCompany('');
    setCountry('');
    setQuote('');
    loadTestimonials();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this client testimonial?')) {
      await cmsService.deleteTestimonial(id);
      loadTestimonials();
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-[#0D2012]/80 p-6 rounded-2xl border border-[#C5A046]/30 shadow-xl">
        <h2 className="text-xl font-light text-[#FAF8F5]">Client Testimonials CMS</h2>
        <p className="text-xs text-gray-400 mt-1">Manage global importer reviews and trade recommendations</p>
      </div>

      <div className="bg-[#0D2012]/80 p-6 rounded-2xl border border-[#C5A046]/20 shadow-xl space-y-4">
        <h3 className="text-sm uppercase tracking-wider text-[#C5A046] font-medium flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Importer Testimonial
        </h3>

        <form onSubmit={handleAdd} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-gray-300 mb-1">Client Name</label>
              <input
                type="text"
                required
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="e.g. Tariq Al-Mansoor"
                className="w-full bg-[#071309] border border-[#C5A046]/30 rounded-xl p-2.5 text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-300 mb-1">Company / Importer</label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="e.g. Al-Mansoor Traders"
                className="w-full bg-[#071309] border border-[#C5A046]/30 rounded-xl p-2.5 text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-300 mb-1">Country</label>
              <input
                type="text"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                placeholder="e.g. Saudi Arabia"
                className="w-full bg-[#071309] border border-[#C5A046]/30 rounded-xl p-2.5 text-xs text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-300 mb-1">Quote Text</label>
            <textarea
              rows={2}
              required
              value={quote}
              onChange={(e) => setQuote(e.target.value)}
              placeholder="e.g. Cleanest cardamom pods received in 15 years..."
              className="w-full bg-[#071309] border border-[#C5A046]/30 rounded-xl p-2.5 text-xs text-white"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 bg-gradient-to-r from-[#C5A046] to-[#DFBF6C] text-[#071309] font-medium text-xs rounded-xl uppercase tracking-wider cursor-pointer"
            >
              Add Testimonial
            </button>
          </div>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map((t) => (
          <div key={t.id} className="bg-[#0D2012]/80 border border-[#C5A046]/20 p-5 rounded-2xl space-y-3 shadow-lg">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-[#FAF8F5]">{t.clientName}</p>
                <p className="text-xs text-[#C5A046]">{t.company} · {t.country}</p>
              </div>
              <button
                onClick={() => handleDelete(t.id)}
                className="p-1.5 rounded-lg bg-red-950/40 text-red-400 hover:bg-red-900/60"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <div className="flex gap-1 text-amber-400">
              {Array.from({ length: t.rating }).map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
              ))}
            </div>
            <p className="text-xs text-gray-300 italic">"{t.quote}"</p>
          </div>
        ))}
      </div>
    </div>
  );
}

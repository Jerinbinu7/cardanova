import { useEffect, useState } from 'react';
import { cmsService } from '../../services/cmsService';
import { CertificationData } from '../../services/mockSanityStore';
import { Plus, Trash2, ShieldCheck } from 'lucide-react';

export default function CertificationsManager() {
  const [certs, setCerts] = useState<CertificationData[]>([]);
  const [name, setName] = useState('');
  const [issuingBody, setIssuingBody] = useState('');
  const [description, setDescription] = useState('');
  const [validUntil, setValidUntil] = useState('');

  useEffect(() => {
    loadCerts();
  }, []);

  const loadCerts = async () => {
    const data = await cmsService.getCertifications();
    setCerts(data);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    await cmsService.saveCertification({
      id: '',
      name,
      issuingBody,
      description,
      logo: '🏅',
      validUntil,
      isVerified: true,
    });

    setName('');
    setIssuingBody('');
    setDescription('');
    setValidUntil('');
    loadCerts();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this certification record?')) {
      await cmsService.deleteCertification(id);
      loadCerts();
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-[#0D2012]/80 p-6 rounded-2xl border border-[#C5A046]/30 shadow-xl">
        <h2 className="text-xl font-light text-[#FAF8F5]">Certifications CMS</h2>
        <p className="text-xs text-gray-400 mt-1">Manage ISO, FSSAI, Spices Board of India, and Organic export accreditations</p>
      </div>

      <div className="bg-[#0D2012]/80 p-6 rounded-2xl border border-[#C5A046]/20 shadow-xl space-y-4">
        <h3 className="text-sm uppercase tracking-wider text-[#C5A046] font-medium flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add New Accreditation / License
        </h3>

        <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-300 mb-1">Certification Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. ISO 22000:2018 Food Safety"
              className="w-full bg-[#071309] border border-[#C5A046]/30 rounded-xl p-2.5 text-xs text-white"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-300 mb-1">Issuing Authority</label>
            <input
              type="text"
              value={issuingBody}
              onChange={(e) => setIssuingBody(e.target.value)}
              placeholder="e.g. TÜV SÜD / Spices Board"
              className="w-full bg-[#071309] border border-[#C5A046]/30 rounded-xl p-2.5 text-xs text-white"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-300 mb-1">Description / License Ref</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. CRES License for spice export"
              className="w-full bg-[#071309] border border-[#C5A046]/30 rounded-xl p-2.5 text-xs text-white"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-300 mb-1">Validity / License No.</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={validUntil}
                onChange={(e) => setValidUntil(e.target.value)}
                placeholder="e.g. Lic No: 11324007000189"
                className="w-full bg-[#071309] border border-[#C5A046]/30 rounded-xl p-2.5 text-xs text-white"
              />
              <button
                type="submit"
                className="px-5 py-2.5 bg-gradient-to-r from-[#C5A046] to-[#DFBF6C] text-[#071309] font-medium text-xs rounded-xl uppercase tracking-wider cursor-pointer shrink-0"
              >
                Add Record
              </button>
            </div>
          </div>
        </form>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {certs.map((c) => (
          <div key={c.id} className="bg-[#0D2012]/80 border border-[#C5A046]/20 p-5 rounded-2xl flex items-start justify-between gap-4 shadow-lg">
            <div className="flex items-start gap-3">
              <div className="p-3 bg-[#C5A046]/10 rounded-xl border border-[#C5A046]/30 text-xl">
                {c.logo || '🏅'}
              </div>
              <div>
                <h4 className="text-sm font-medium text-[#FAF8F5] flex items-center gap-1.5">
                  {c.name}
                  {c.isVerified && <ShieldCheck className="w-4 h-4 text-emerald-400" />}
                </h4>
                <p className="text-xs text-[#C5A046] mt-0.5">{c.issuingBody}</p>
                <p className="text-xs text-gray-400 mt-1">{c.description}</p>
                {c.validUntil && <p className="text-[10px] text-gray-500 mt-2">{c.validUntil}</p>}
              </div>
            </div>

            <button
              onClick={() => handleDelete(c.id)}
              className="p-2 rounded-lg bg-red-950/40 text-red-400 hover:bg-red-900/60"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

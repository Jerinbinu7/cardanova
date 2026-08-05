import React, { useEffect, useState } from 'react';
import { cmsService } from '../../services/cmsService';
import { GradeComparisonRow } from '../../services/mockSanityStore';
import { Plus, Edit2, Trash2, X, MoveUp, MoveDown } from 'lucide-react';

export default function GradeComparisonManager() {
  const [rows, setRows] = useState<GradeComparisonRow[]>([]);
  const [editingRow, setEditingRow] = useState<Partial<GradeComparisonRow> | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadRows();
  }, []);

  const loadRows = async () => {
    setIsLoading(true);
    const data = await cmsService.getGradeComparison();
    setRows(data);
    setIsLoading(false);
  };

  const handleOpenCreate = () => {
    setEditingRow({
      id: '',
      grade: '8.5mm',
      gradeName: 'Extra Bold',
      podSize: '8.5 mm+',
      color: 'Deep Natural Emerald Green',
      applications: 'Luxury Retail, High-End Gourmet, Export',
      moq: '500 kg',
      availability: 'In Stock',
      displayOrder: rows.length + 1,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (row: GradeComparisonRow) => {
    setEditingRow({ ...row });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this grade comparison entry?')) {
      await cmsService.deleteGradeComparisonRow(id);
      loadRows();
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRow?.grade || !editingRow?.podSize) return;

    await cmsService.saveGradeComparisonRow(editingRow as GradeComparisonRow);
    setIsModalOpen(false);
    loadRows();
  };

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    const newRows = [...rows];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newRows.length) return;

    const temp = newRows[index];
    newRows[index] = newRows[targetIndex];
    newRows[targetIndex] = temp;

    // re-assign display orders
    const updated = newRows.map((r, i) => ({ ...r, displayOrder: i + 1 }));
    setRows(updated);
    await cmsService.saveGradeComparison(updated);
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#0D2012]/80 p-6 rounded-2xl border border-[#C5A046]/30 shadow-xl">
        <div>
          <h2 className="text-xl font-light text-[#FAF8F5]">Grade Comparison Matrix CMS</h2>
          <p className="text-xs text-gray-400 mt-1">Manage technical grade comparison matrix rows displayed on the Products page</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#C5A046] to-[#DFBF6C] text-[#071309] font-medium text-xs uppercase tracking-wider hover:brightness-110 transition-all cursor-pointer shadow-lg"
        >
          <Plus className="w-4 h-4" />
          Add Grade Row
        </button>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="text-center py-12 text-gray-400 text-sm">Loading grade comparison matrix...</div>
      ) : (
        <div className="bg-[#0D2012]/80 border border-[#C5A046]/20 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-[#FAF8F5]">
              <thead className="bg-[#071309]/80 text-[#C5A046] uppercase text-[11px] tracking-wider border-b border-[#C5A046]/20">
                <tr>
                  <th className="p-4 w-12">#</th>
                  <th className="p-4">Grade & Name</th>
                  <th className="p-4">Pod Size</th>
                  <th className="p-4">Color Profile</th>
                  <th className="p-4">Applications</th>
                  <th className="p-4">MOQ</th>
                  <th className="p-4">Availability</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#C5A046]/10">
                {rows.map((r, i) => (
                  <tr key={r.id} className="hover:bg-[#C5A046]/5 transition-colors">
                    <td className="p-4 text-xs text-gray-500 font-mono">{i + 1}</td>
                    <td className="p-4">
                      <p className="font-medium text-sm text-[#FAF8F5]">{r.grade}</p>
                      <p className="text-xs text-gray-400">{r.gradeName}</p>
                    </td>
                    <td className="p-4 text-xs text-[#C5A046] font-medium">{r.podSize}</td>
                    <td className="p-4 text-xs text-gray-300">{r.color}</td>
                    <td className="p-4 text-xs text-gray-400 max-w-[200px] truncate">{r.applications}</td>
                    <td className="p-4 text-xs text-gray-200">{r.moq}</td>
                    <td className="p-4 text-xs text-emerald-400">{r.availability}</td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleMove(i, 'up')}
                          disabled={i === 0}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-white disabled:opacity-30"
                        >
                          <MoveUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleMove(i, 'down')}
                          disabled={i === rows.length - 1}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-white disabled:opacity-30"
                        >
                          <MoveDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(r)}
                          className="p-2 rounded-lg bg-[#C5A046]/10 text-[#C5A046] hover:bg-[#C5A046]/20 transition-colors ml-1"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(r.id)}
                          className="p-2 rounded-lg bg-red-950/40 text-red-400 hover:bg-red-900/60 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit / Create Modal */}
      {isModalOpen && editingRow && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#0D2012] border border-[#C5A046]/40 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 text-[#FAF8F5] shadow-2xl relative space-y-6">
            <div className="flex justify-between items-center border-b border-[#C5A046]/20 pb-4">
              <h3 className="text-lg font-light text-[#FAF8F5]">
                {editingRow.id ? 'Edit Comparison Row' : 'Add Grade Comparison Row'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-[#C5A046] uppercase mb-1">Grade Identifier (e.g. 8.5mm)</label>
                  <input
                    type="text"
                    required
                    value={editingRow.grade || ''}
                    onChange={(e) => setEditingRow({ ...editingRow, grade: e.target.value })}
                    className="w-full bg-[#071309] border border-[#C5A046]/30 rounded-xl p-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#C5A046] uppercase mb-1">Grade Name (e.g. Extra Bold)</label>
                  <input
                    type="text"
                    required
                    value={editingRow.gradeName || ''}
                    onChange={(e) => setEditingRow({ ...editingRow, gradeName: e.target.value })}
                    className="w-full bg-[#071309] border border-[#C5A046]/30 rounded-xl p-2.5 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-[#C5A046] uppercase mb-1">Pod Size Specification</label>
                  <input
                    type="text"
                    required
                    value={editingRow.podSize || ''}
                    onChange={(e) => setEditingRow({ ...editingRow, podSize: e.target.value })}
                    className="w-full bg-[#071309] border border-[#C5A046]/30 rounded-xl p-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#C5A046] uppercase mb-1">Color Profile</label>
                  <input
                    type="text"
                    value={editingRow.color || ''}
                    onChange={(e) => setEditingRow({ ...editingRow, color: e.target.value })}
                    className="w-full bg-[#071309] border border-[#C5A046]/30 rounded-xl p-2.5 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-[#C5A046] uppercase mb-1">Target Market Applications</label>
                <input
                  type="text"
                  value={editingRow.applications || ''}
                  onChange={(e) => setEditingRow({ ...editingRow, applications: e.target.value })}
                  className="w-full bg-[#071309] border border-[#C5A046]/30 rounded-xl p-2.5 text-white"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-[#C5A046] uppercase mb-1">Minimum Order Quantity (MOQ)</label>
                  <input
                    type="text"
                    value={editingRow.moq || ''}
                    onChange={(e) => setEditingRow({ ...editingRow, moq: e.target.value })}
                    className="w-full bg-[#071309] border border-[#C5A046]/30 rounded-xl p-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#C5A046] uppercase mb-1">Availability Status</label>
                  <input
                    type="text"
                    value={editingRow.availability || ''}
                    onChange={(e) => setEditingRow({ ...editingRow, availability: e.target.value })}
                    className="w-full bg-[#071309] border border-[#C5A046]/30 rounded-xl p-2.5 text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[#C5A046]/20">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-gray-600 text-xs text-gray-300 hover:bg-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#C5A046] to-[#DFBF6C] text-[#071309] font-medium text-xs uppercase tracking-wider"
                >
                  Save Row
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

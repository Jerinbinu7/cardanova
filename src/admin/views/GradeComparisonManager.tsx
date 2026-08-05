import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, X, MoveUp, MoveDown } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  getGradeComparison,
  createGradeComparisonRow,
  updateGradeComparisonRow,
  deleteGradeComparisonRow,
  reorderGradeComparison,
} from '../../services/gradeComparisonService';
import type { GradeComparisonRow } from '../../types/database';
import ConfirmDialog from '../components/ConfirmDialog';
import { SkeletonCard } from '../components/Skeleton';

type EditRow = Omit<GradeComparisonRow, 'id' | 'created_at' | 'updated_at'> & { id?: number };

const EMPTY_ROW: EditRow = {
  grade: '',
  grade_name: '',
  pod_size: '',
  color: '',
  applications: '',
  moq: '',
  availability: 'In Stock',
  display_order: 0,
};

const inputClass = 'w-full bg-[#071309] border border-[#C5A046]/30 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#C5A046] transition-all';

export default function GradeComparisonManager() {
  const [rows, setRows]               = useState<GradeComparisonRow[]>([]);
  const [editing, setEditing]         = useState<EditRow | null>(null);
  const [isModal, setIsModal]         = useState(false);
  const [saving, setSaving]           = useState(false);
  const [loading, setLoading]         = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<GradeComparisonRow | null>(null);

  const load = async () => {
    setLoading(true);
    try { setRows(await getGradeComparison()); }
    catch (e: any) { toast.error(e.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditing({ ...EMPTY_ROW, display_order: rows.length + 1 });
    setIsModal(true);
  };

  const openEdit = (row: GradeComparisonRow) => {
    setEditing({ ...row });
    setIsModal(true);
  };

  const closeModal = () => { setIsModal(false); setEditing(null); };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing?.grade || !editing?.pod_size) return;
    setSaving(true);
    try {
      const payload = {
        grade: editing.grade,
        grade_name: editing.grade_name,
        pod_size: editing.pod_size,
        color: editing.color ?? null,
        applications: editing.applications ?? null,
        moq: editing.moq ?? null,
        availability: editing.availability,
        display_order: editing.display_order,
      };
      if (editing.id) {
        await updateGradeComparisonRow(editing.id, payload);
        toast.success('Grade row updated!');
      } else {
        await createGradeComparisonRow(payload);
        toast.success('Grade row created!');
      }
      closeModal();
      load();
    } catch (e: any) { toast.error(e.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteGradeComparisonRow(deleteTarget.id);
      toast.success('Grade row deleted.');
      load();
    } catch (e: any) { toast.error(e.message); }
    finally { setDeleteTarget(null); }
  };

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    const newRows = [...rows];
    const swapIdx = direction === 'up' ? index - 1 : index + 1;
    if (swapIdx < 0 || swapIdx >= newRows.length) return;
    [newRows[index], newRows[swapIdx]] = [newRows[swapIdx], newRows[index]];
    setRows(newRows);
    try { await reorderGradeComparison(newRows); }
    catch (e: any) { toast.error(e.message); load(); }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center bg-[#0D2012]/80 p-4 sm:p-6 rounded-2xl border border-[#C5A046]/30 shadow-xl">
        <div>
          <h2 className="text-xl font-light text-[#FAF8F5]">Grade Comparison Table</h2>
          <p className="text-xs text-gray-400 mt-1">Manage the grade-by-grade comparison matrix displayed on the products page</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#C5A046] to-[#DFBF6C] text-[#071309] font-medium text-xs uppercase tracking-wider hover:brightness-110 shadow-lg shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Add Row
        </button>
      </div>

      {/* Table */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[1,2,3,4].map((i) => <SkeletonCard key={i} />)}
        </div>
      ) : rows.length === 0 ? (
        <div className="text-center py-16 text-gray-400 text-sm">
          No grade comparison rows yet. Click "Add Row" to get started.
        </div>
      ) : (
        <div className="bg-[#0D2012]/80 border border-[#C5A046]/20 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[#C5A046]/20">
                  {['#', 'Grade', 'Pod Size', 'Color', 'Applications', 'MOQ', 'Availability', 'Actions'].map((h) => (
                    <th key={h} className="px-4 py-3 text-[10px] text-[#C5A046] uppercase tracking-wider font-normal whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#C5A046]/10">
                {rows.map((r, i) => (
                  <tr key={r.id} className="hover:bg-[#C5A046]/5 transition-colors">
                    <td className="px-4 py-3 text-xs text-gray-500 font-mono">{i + 1}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-sm text-[#FAF8F5]">{r.grade}</p>
                      <p className="text-xs text-gray-400">{r.grade_name}</p>
                    </td>
                    <td className="px-4 py-3 text-xs text-[#C5A046] font-medium whitespace-nowrap">{r.pod_size}</td>
                    <td className="px-4 py-3 text-xs text-gray-300">{r.color}</td>
                    <td className="px-4 py-3 text-xs text-gray-400 max-w-[180px] truncate">{r.applications}</td>
                    <td className="px-4 py-3 text-xs text-gray-200 whitespace-nowrap">{r.moq}</td>
                    <td className="px-4 py-3 text-xs text-emerald-400 whitespace-nowrap">{r.availability}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => handleMove(i, 'up')} disabled={i === 0}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-white disabled:opacity-30 transition-colors">
                          <MoveUp className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => handleMove(i, 'down')} disabled={i === rows.length - 1}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-white disabled:opacity-30 transition-colors">
                          <MoveDown className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => openEdit(r)}
                          className="p-2 rounded-lg bg-[#C5A046]/10 text-[#C5A046] hover:bg-[#C5A046]/20 transition-colors ml-1 cursor-pointer">
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => setDeleteTarget(r)}
                          className="p-2 rounded-lg bg-red-950/40 text-red-400 hover:bg-red-900/60 transition-colors cursor-pointer">
                          <Trash2 className="w-3.5 h-3.5" />
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
      {isModal && editing && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
          <div className="bg-[#0D2012] border border-[#C5A046]/40 rounded-2xl w-full max-w-2xl my-4 shadow-2xl overflow-hidden">
            <div className="flex justify-between items-center p-4 sm:p-6 border-b border-[#C5A046]/20">
              <h3 className="text-base sm:text-lg font-light text-[#FAF8F5]">
                {editing.id ? 'Edit Grade Row' : 'Add Grade Row'}
              </h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-4 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-[#C5A046] uppercase tracking-wider mb-1.5">Grade Identifier *</label>
                  <input required placeholder="e.g. 8.5mm" value={editing.grade ?? ''} onChange={(e) => setEditing((p) => p ? { ...p, grade: e.target.value } : p)} className={inputClass} />
                </div>
                <div>
                  <label className="block text-xs text-[#C5A046] uppercase tracking-wider mb-1.5">Grade Name *</label>
                  <input required placeholder="e.g. Extra Bold" value={editing.grade_name ?? ''} onChange={(e) => setEditing((p) => p ? { ...p, grade_name: e.target.value } : p)} className={inputClass} />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-[#C5A046] uppercase tracking-wider mb-1.5">Pod Size *</label>
                  <input required placeholder="e.g. 8.5 mm+" value={editing.pod_size ?? ''} onChange={(e) => setEditing((p) => p ? { ...p, pod_size: e.target.value } : p)} className={inputClass} />
                </div>
                <div>
                  <label className="block text-xs text-[#C5A046] uppercase tracking-wider mb-1.5">Color Profile</label>
                  <input placeholder="e.g. Deep Emerald Green" value={editing.color ?? ''} onChange={(e) => setEditing((p) => p ? { ...p, color: e.target.value } : p)} className={inputClass} />
                </div>
              </div>
              <div>
                <label className="block text-xs text-[#C5A046] uppercase tracking-wider mb-1.5">Market Applications</label>
                <input placeholder="e.g. Luxury Retail, Export, Gourmet" value={editing.applications ?? ''} onChange={(e) => setEditing((p) => p ? { ...p, applications: e.target.value } : p)} className={inputClass} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-[#C5A046] uppercase tracking-wider mb-1.5">Minimum Order (MOQ)</label>
                  <input placeholder="e.g. 500 kg" value={editing.moq ?? ''} onChange={(e) => setEditing((p) => p ? { ...p, moq: e.target.value } : p)} className={inputClass} />
                </div>
                <div>
                  <label className="block text-xs text-[#C5A046] uppercase tracking-wider mb-1.5">Availability</label>
                  <select value={editing.availability ?? 'In Stock'} onChange={(e) => setEditing((p) => p ? { ...p, availability: e.target.value } : p)} className={inputClass}>
                    <option>In Stock</option>
                    <option>Year-Round</option>
                    <option>Seasonal</option>
                    <option>Contract Basis</option>
                    <option>On Request</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={closeModal} className="px-5 py-2.5 rounded-xl border border-gray-600 text-xs text-gray-300 hover:bg-gray-800 cursor-pointer">Cancel</button>
                <button type="submit" disabled={saving} className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#C5A046] to-[#DFBF6C] text-[#071309] font-medium text-xs uppercase tracking-wider disabled:opacity-60 cursor-pointer">
                  {saving ? 'Saving…' : 'Save Row'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Delete Grade Row"
        message={`Delete "${deleteTarget?.grade} ${deleteTarget?.grade_name}" from the comparison table?`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

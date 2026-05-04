import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Edit, Trash2, ToggleLeft, ToggleRight, Loader2, X, Save, Tag } from 'lucide-react';
import { toast } from 'sonner';
import api from '../lib/api';

interface Skill {
  _id: string;
  name: string;
  slug: string;
  category?: { _id: string; name: string } | null;
  is_active: boolean;
  sort_order: number;
}

interface Category {
  _id: string;
  name: string;
}

const emptyForm = { name: '', category: '', sort_order: 0 };

export function Skills() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [search, setSearch] = useState('');

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [skillRes, catRes] = await Promise.all([api.get('/cms/skills'), api.get('/cms/categories')]);
      if (skillRes.data.success) setSkills(skillRes.data.skills || skillRes.data.data || []);
      if (catRes.data.success) setCategories(catRes.data.categories || catRes.data.data || []);
    } catch {
      toast.error('Failed to load skills');
    } finally {
      setLoading(false);
    }
  };

  const openAdd = () => { setEditingId(null); setForm(emptyForm); setShowForm(true); };
  const openEdit = (skill: Skill) => {
    setEditingId(skill._id);
    setForm({ name: skill.name, category: skill.category?._id || '', sort_order: skill.sort_order });
    setShowForm(true);
  };
  const closeForm = () => { setShowForm(false); setEditingId(null); };

  const handleSubmit = async () => {
    if (!form.name.trim()) { toast.error('Skill name is required'); return; }
    try {
      setSaving(true);
      const payload = { name: form.name.trim(), category: form.category || null, sort_order: Number(form.sort_order) };
      if (editingId) {
        const res = await api.put(`/cms/skills/${editingId}`, payload);
        toast.success(res.data.message || 'Skill updated');
      } else {
        const res = await api.post('/cms/skills', payload);
        toast.success(res.data.message || 'Skill created');
      }
      closeForm();
      fetchAll();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save skill');
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (skill: Skill) => {
    try {
      const res = await api.patch(`/cms/skills/${skill._id}/toggle`);
      toast.success(res.data.message);
      setSkills(prev => prev.map(s => s._id === skill._id ? { ...s, is_active: !s.is_active } : s));
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to toggle skill');
    }
  };

  const handleDelete = async (skill: Skill) => {
    if (!window.confirm(`Delete skill "${skill.name}"?`)) return;
    try {
      const res = await api.delete(`/cms/skills/${skill._id}`);
      toast.success(res.data.message);
      setSkills(prev => prev.filter(s => s._id !== skill._id));
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete skill');
    }
  };

  const filtered = skills.filter(s => s.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="max-w-[1300px] mx-auto space-y-8 pb-16 px-6">
      {/* Header - Professional Alignment */}
      <div className="flex items-center justify-between border-b border-gray-100 dark:border-[#262626] pb-6 mt-4">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold text-[#044071] dark:text-white mb-1">Skills Taxonomy</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm font-medium italic opacity-70">"Strategic configuration of logical competencies for projects and gigs."</p>
        </div>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          onClick={openAdd}
          className="bg-[#F24C20] hover:bg-orange-600 text-white px-8 py-3.5 rounded-xl font-bold flex items-center gap-2 shadow-xl shadow-orange-500/20 text-xs uppercase tracking-widest transition-all">
          <Plus className="w-5 h-5" /> Add Competency
        </motion.button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Form Panel - Bento Style */}
        <AnimatePresence>
          {showForm && (
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              className="lg:col-span-4 bg-white dark:bg-[#1a1a1a] rounded-[2rem] p-8 border border-gray-100 dark:border-[#262626] shadow-2xl shadow-[#044071]/5 sticky top-24">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="font-bold text-[#044071] dark:text-white text-lg tracking-tight">{editingId ? 'Edit Competency' : 'New Competency'}</h3>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Logic Configuration</p>
                </div>
                <button onClick={closeForm} className="p-2 hover:bg-gray-50 dark:hover:bg-[#262626] rounded-full transition-colors"><X className="w-5 h-5 text-gray-400" /></button>
              </div>
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Competency Name</label>
                  <input type="text" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. React.js Architecture"
                    className="w-full px-5 py-4 rounded-2xl border border-gray-100 dark:border-[#262626] bg-gray-50/50 dark:bg-[#262626] focus:bg-white dark:focus:bg-[#1a1a1a] focus:ring-2 focus:ring-[#F24C20]/20 transition-all outline-none font-bold text-gray-900 dark:text-white" />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Parent Category</label>
                  <div className="relative">
                    <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                      className="w-full px-5 py-4 rounded-2xl border border-gray-100 dark:border-[#262626] bg-gray-50/50 dark:bg-[#262626] focus:bg-white dark:focus:bg-[#1a1a1a] focus:ring-2 focus:ring-[#F24C20]/20 transition-all outline-none font-bold text-gray-900 dark:text-white appearance-none cursor-pointer">
                      <option value="">Uncategorized Logic</option>
                      {categories.map(cat => <option key={cat._id} value={cat._id}>{cat.name}</option>)}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 pointer-events-none" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Sequence Order</label>
                  <input type="number" value={form.sort_order} onChange={e => setForm(p => ({ ...p, sort_order: Number(e.target.value) }))} min={0}
                    className="w-full px-5 py-4 rounded-2xl border border-gray-100 dark:border-[#262626] bg-gray-50/50 dark:bg-[#262626] focus:bg-white dark:focus:bg-[#1a1a1a] focus:ring-2 focus:ring-[#F24C20]/20 transition-all outline-none font-bold text-gray-900 dark:text-white" />
                </div>
                <div className="flex gap-4 pt-4">
                  <button onClick={closeForm} className="flex-1 px-6 py-4 rounded-xl font-bold text-gray-400 hover:text-gray-600 transition-all text-xs uppercase tracking-widest">Abort</button>
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleSubmit} disabled={saving}
                    className="flex-[2] bg-[#044071] hover:bg-[#0a5ea3] text-white px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-2 disabled:opacity-60 shadow-xl shadow-[#044071]/10">
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} {editingId ? 'Update' : 'Deploy'}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Table - High Density Bento */}
        <div className={showForm ? 'lg:col-span-8' : 'lg:col-span-12'}>
          <div className="bg-white dark:bg-[#1a1a1a] rounded-[2rem] border border-gray-100 dark:border-[#262626] overflow-hidden shadow-sm">
            <div className="p-4 border-b border-gray-50 dark:border-[#262626]">
              <div className="relative">
                <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Filter competencies by semantic name..."
                  className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-transparent bg-gray-50/50 dark:bg-[#262626] focus:bg-white dark:focus:bg-[#1a1a1a] focus:ring-2 focus:ring-[#F24C20]/20 transition-all outline-none text-sm font-medium" />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50/50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-[#262626]">
                  <tr>
                    <th className="px-8 py-5 text-[11px] font-bold uppercase tracking-wider text-gray-500">Asset Identity</th>
                    <th className="px-8 py-5 text-[11px] font-bold uppercase tracking-wider text-gray-500">Logical Parent</th>
                    <th className="px-8 py-5 text-[11px] font-bold uppercase tracking-wider text-gray-500">Status</th>
                    <th className="px-8 py-5 text-[11px] font-bold uppercase tracking-wider text-gray-500 text-center">Protocol</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-[#262626]">
                  {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        <td className="px-8 py-6"><div className="h-4 bg-gray-100 dark:bg-[#262626] rounded w-32" /></td>
                        <td className="px-8 py-6"><div className="h-4 bg-gray-100 dark:bg-[#262626] rounded w-24" /></td>
                        <td className="px-8 py-6"><div className="h-4 bg-gray-100 dark:bg-[#262626] rounded w-16" /></td>
                        <td className="px-8 py-6"><div className="h-8 bg-gray-100 dark:bg-[#262626] rounded w-20 mx-auto" /></td>
                      </tr>
                    ))
                  ) : filtered.length === 0 ? (
                    <tr><td colSpan={4} className="px-8 py-20 text-center">
                      <AlertCircle className="w-12 h-12 text-gray-100 mx-auto mb-3" />
                      <p className="text-gray-400 font-semibold tracking-tight">No semantic matches found in taxonomy.</p>
                    </td></tr>
                  ) : filtered.map((skill, i) => (
                    <motion.tr key={skill._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.02 }}
                      className="hover:bg-gray-50/30 dark:hover:bg-white/5 transition-all">
                      <td className="px-8 py-6">
                        <div className="flex flex-col">
                          <span className="font-bold text-gray-800 dark:text-gray-200 tracking-tight leading-tight">{skill.name}</span>
                          <span className="text-[10px] text-[#F24C20] font-black uppercase tracking-widest mt-1 opacity-70 italic">{skill.slug}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        {skill.category ? 
                          <span className="px-3 py-1 bg-[#044071]/5 text-[#044071] dark:text-blue-400 rounded-lg text-[10px] font-black uppercase tracking-widest">
                            {skill.category.name}
                          </span> : 
                          <span className="text-gray-300 italic text-xs">Unclassified</span>
                        }
                      </td>
                      <td className="px-8 py-6">
                        <span className={`text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full ${skill.is_active ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                          {skill.is_active ? 'Active' : 'Staged'}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center justify-center gap-1">
                          <button onClick={() => openEdit(skill)} className="p-2.5 text-[#044071] hover:bg-blue-50 rounded-xl transition-colors" title="Edit Competency">
                            <Plus className="w-4 h-4 rotate-45 scale-90" />
                          </button>
                          <button onClick={() => handleToggle(skill)} className="p-2.5 transition-colors" title="Toggle Protocol">
                            {skill.is_active ? <ToggleRight className="w-7 h-7 text-green-500" /> : <ToggleLeft className="w-7 h-7 text-gray-300" />}
                          </button>
                          <button onClick={() => handleDelete(skill)} className="p-2.5 text-red-400 hover:bg-red-50 rounded-xl transition-colors" title="Decommission">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-6 bg-gray-50/50 dark:bg-gray-900/50 border-t border-gray-50 dark:border-[#262626] flex justify-between items-center">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Inventory Management System v1.0</span>
              <span className="text-[10px] font-black text-[#F24C20] uppercase tracking-widest bg-orange-50 px-3 py-1 rounded-full">
                {filtered.length} of {skills.length} Assets Identified
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

  );
}

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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-1">Skills Management</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage skills available for projects and gigs</p>
        </div>
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          onClick={openAdd}
          className="bg-[#F24C20] hover:bg-[#d43a12] text-white px-5 py-3 rounded-xl font-medium flex items-center gap-2">
          <Plus className="w-5 h-5" /> Add Skill
        </motion.button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Panel */}
        <AnimatePresence>
          {showForm && (
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 h-fit">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg">{editingId ? 'Edit Skill' : 'Add New Skill'}</h3>
                <button onClick={closeForm} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"><X className="w-4 h-4" /></button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Skill Name *</label>
                  <input type="text" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. React.js"
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-[#F24C20] text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Category</label>
                  <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-[#F24C20] text-sm">
                    <option value="">No Category</option>
                    {categories.map(cat => <option key={cat._id} value={cat._id}>{cat.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Sort Order</label>
                  <input type="number" value={form.sort_order} onChange={e => setForm(p => ({ ...p, sort_order: Number(e.target.value) }))} min={0}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-[#F24C20] text-sm" />
                </div>
                <div className="flex gap-2">
                  <button onClick={closeForm} className="flex-1 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">Cancel</button>
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={handleSubmit} disabled={saving}
                    className="flex-1 bg-[#F24C20] hover:bg-[#d43a12] text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-60">
                    {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : <><Save className="w-4 h-4" /> {editingId ? 'Update' : 'Create'}</>}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Table */}
        <div className={showForm ? 'lg:col-span-2' : 'lg:col-span-3'}>
          {/* Search */}
          <div className="mb-4">
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search skills..."
              className="w-full max-w-sm px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-[#F24C20] text-sm" />
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900/50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Skill Name</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Category</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Status</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {loading ? (
                  <tr><td colSpan={4} className="px-6 py-12 text-center">
                    <Loader2 className="w-7 h-7 text-[#F24C20] animate-spin mx-auto mb-2" />
                    <p className="text-gray-500 text-sm">Loading skills...</p>
                  </td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={4} className="px-6 py-12 text-center">
                    <Tag className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">{search ? 'No skills match your search.' : 'No skills yet. Click "Add Skill" to create the first one.'}</p>
                  </td></tr>
                ) : filtered.map((skill, i) => (
                  <motion.tr key={skill._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                    whileHover={{ backgroundColor: 'rgba(59,130,246,0.04)' }}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Tag className="w-4 h-4 text-[#F24C20]" />
                        <div>
                          <div className="font-medium">{skill.name}</div>
                          <div className="text-xs text-gray-400 font-mono">{skill.slug}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {skill.category ? <span className="px-2 py-0.5 bg-purple-50 dark:bg-purple-900/20 text-purple-600 rounded-md text-xs">{skill.category.name}</span> : <span className="text-gray-400">—</span>}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${skill.is_active ? 'bg-green-100 dark:bg-green-900/20 text-green-700' : 'bg-gray-100 dark:bg-gray-700 text-gray-600'}`}>
                        {skill.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => openEdit(skill)} className="p-2 hover:bg-blue-100 dark:hover:bg-blue-900/20 rounded-lg" title="Edit">
                          <Edit className="w-4 h-4 text-blue-600" />
                        </motion.button>
                        <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => handleToggle(skill)} className="p-2 hover:bg-green-100 dark:hover:bg-green-900/20 rounded-lg" title="Toggle">
                          {skill.is_active ? <ToggleRight className="w-4 h-4 text-green-600" /> : <ToggleLeft className="w-4 h-4 text-gray-500" />}
                        </motion.button>
                        <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => handleDelete(skill)} className="p-2 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg" title="Delete">
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </motion.button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-500 mt-2 text-right">{filtered.length} of {skills.length} skills</p>
        </div>
      </div>
    </div>
  );
}

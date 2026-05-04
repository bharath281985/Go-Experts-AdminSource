import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Edit, Trash2, ToggleLeft, ToggleRight, Loader2, X, Save, FolderTree } from 'lucide-react';
import { toast } from 'sonner';
import { Breadcrumb } from './Breadcrumb';
import api from '../lib/api';

interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  image?: string;
  parent?: { _id: string; name: string } | null;
  is_active: boolean;
  sort_order: number;
}

const emptyForm = { name: '', description: '', icon: '📁', image: '', parent: '', sort_order: 0 };

export function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => { fetchCategories(); }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await api.get('/cms/categories');
      if (res.data.success) setCategories(res.data.categories || res.data.data || []);
    } catch {
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const openAdd = () => { 
    setEditingId(null); 
    setForm(emptyForm); 
    setImageFile(null);
    setImagePreview(null);
    setShowForm(true); 
  };
  const openEdit = (cat: Category) => {
    setEditingId(cat._id);
    setForm({ 
      name: cat.name, 
      description: cat.description || '', 
      icon: cat.icon || '📁', 
      image: cat.image || '',
      parent: cat.parent?._id || '', 
      sort_order: cat.sort_order 
    });
    setImagePreview(cat.image || null);
    setShowForm(true);
  };
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const closeForm = () => { setShowForm(false); setEditingId(null); setForm(emptyForm); setImageFile(null); setImagePreview(null); };

  const handleSubmit = async () => {
    if (!form.name.trim()) { toast.error('Category name is required'); return; }
    try {
      setSaving(true);
      const data = new FormData();
      data.append('name', form.name.trim());
      data.append('description', form.description);
      data.append('icon', form.icon);
      data.append('parent', form.parent || '');
      data.append('sort_order', String(form.sort_order));
      if (imageFile) {
        data.append('image', imageFile);
      }

      if (editingId) {
        const res = await api.put(`/cms/categories/${editingId}`, data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success(res.data.message || 'Category updated');
      } else {
        const res = await api.post('/cms/categories', data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success(res.data.message || 'Category created');
      }
      closeForm();
      fetchCategories();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save category');
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (cat: Category) => {
    try {
      const res = await api.patch(`/cms/categories/${cat._id}/toggle`);
      toast.success(res.data.message);
      setCategories(prev => prev.map(c => c._id === cat._id ? { ...c, is_active: !c.is_active } : c));
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to toggle category');
    }
  };

  const handleDelete = async (cat: Category) => {
    if (!window.confirm(`Delete category "${cat.name}"? This cannot be undone.`)) return;
    try {
      const res = await api.delete(`/cms/categories/${cat._id}`);
      toast.success(res.data.message);
      setCategories(prev => prev.filter(c => c._id !== cat._id));
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete category');
    }
  };

  const topLevelCats = categories.filter(c => !c.parent);

  return (
    <div className="max-w-[1300px] mx-auto space-y-8 pb-16 px-6">
      {/* Header - Professional Alignment */}
      <div className="mt-4">
        <Breadcrumb items={[{ label: 'Site Management', path: 'pages' }, { label: 'Categories' }]} />
      </div>

      <div className="flex items-center justify-between border-b border-gray-100 dark:border-[#262626] pb-6">
        <div>
          <h1 className="text-2xl font-semibold text-[#044071] dark:text-white mb-1">Categories Management</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Manage project and gig categories across the marketplace database.</p>
        </div>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          onClick={openAdd}
          className="bg-[#F24C20] hover:bg-[#d43a12] text-white px-6 py-2.5 rounded-xl font-semibold flex items-center gap-2 shadow-lg shadow-[#F24C20]/10">
          <Plus className="w-5 h-5" /> Add Category
        </motion.button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Panel - Normalized Inline */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white dark:bg-[#1a1a1a] rounded-[1.5rem] border border-[#F24C20]/20 p-10 shadow-2xl relative overflow-hidden h-fit"
            >
              <div className="absolute top-0 left-0 w-1.5 h-full bg-[#F24C20]" />
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-lg font-bold text-[#044071] dark:text-white">{editingId ? 'Edit Category' : 'New Category Asset'}</h3>
                  <p className="text-xs text-gray-500 mt-1">Configure name, parent, and visual identity.</p>
                </div>
                <button onClick={closeForm} className="p-2 hover:bg-gray-100 dark:hover:bg-[#262626] rounded-full transition-colors"><X className="w-5 h-5 text-gray-400" /></button>
              </div>
              <div className="space-y-6">
                {/* Image Section - Refined */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-2 ml-1">Identity Asset</label>
                  <div 
                    onClick={() => document.getElementById('categoryImageInput')?.click()}
                    className="relative h-24 rounded-2xl border-2 border-dashed border-gray-100 dark:border-gray-800 hover:border-[#F24C20]/20 bg-gray-50/50 dark:bg-gray-900/50 flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden"
                  >
                    {imagePreview ? (
                      <img 
                        src={imagePreview.startsWith('data:') ? imagePreview : `${import.meta.env.VITE_API_URL}/${imagePreview}`} 
                        alt="Preview" 
                        className="w-full h-full object-contain p-2" 
                      />
                    ) : (
                      <>
                        <Plus className="w-5 h-5 text-gray-300 mb-1" />
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center px-4">Upload Asset</span>
                      </>
                    )}
                    <input id="categoryImageInput" type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-2 ml-1">Category Label *</label>
                  <input type="text" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Design & Creative"
                    className="w-full px-4 py-3 rounded-xl border border-gray-100 dark:border-[#262626] bg-gray-50/50 dark:bg-[#262626] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#F24C20]/20 transition-all text-sm font-medium" />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-2 ml-1">Hierarchy Parent</label>
                  <select value={form.parent} onChange={e => setForm(p => ({ ...p, parent: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl border border-gray-100 dark:border-[#262626] bg-gray-50/50 dark:bg-[#262626] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#F24C20]/20 transition-all text-sm font-medium">
                    <option value="">None (Top Level)</option>
                    {topLevelCats.filter(c => c._id !== editingId).map(cat => (
                      <option key={cat._id} value={cat._id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-2 ml-1">Strategic Description</label>
                  <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Short strategic description..."
                    className="w-full px-4 py-3 rounded-xl border border-gray-100 dark:border-[#262626] bg-gray-50/50 dark:bg-[#262626] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#F24C20]/20 transition-all text-sm font-medium resize-none" rows={3} />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-2 ml-1">Display Sequence</label>
                  <input type="number" value={form.sort_order} onChange={e => setForm(p => ({ ...p, sort_order: Number(e.target.value) }))} min={0}
                    className="w-full px-4 py-3 rounded-xl border border-gray-100 dark:border-[#262626] bg-gray-50/50 dark:bg-[#262626] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#F24C20]/20 transition-all text-sm font-medium" />
                </div>
                <div className="flex gap-4 pt-4 border-t border-gray-50">
                  <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} onClick={handleSubmit} disabled={saving}
                    className="flex-1 bg-[#F24C20] hover:bg-[#d43a12] text-white px-6 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-60 shadow-lg shadow-[#F24C20]/10 transition-all">
                    {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
                    {editingId ? 'Commit Update' : 'Authorize Asset'}
                  </motion.button>
                  <button onClick={closeForm} className="px-8 py-3.5 rounded-xl border border-gray-100 text-gray-400 font-bold hover:bg-gray-50 transition-all">
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Table - Crisp alignment */}
        <div className={showForm ? 'lg:col-span-2' : 'lg:col-span-3'}>
          <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl border border-gray-100 dark:border-[#262626] overflow-hidden shadow-sm">
            <table className="w-full">
              <thead className="bg-gray-50/50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-[#262626]">
                <tr>
                  <th className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-gray-500">Asset</th>
                  <th className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-gray-500">Name</th>
                  <th className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-gray-500 text-center">Status</th>
                  <th className="px-6 py-4 text-center text-[11px] font-bold uppercase tracking-wider text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-[#262626]">
                {loading ? (
                  <tr><td colSpan={4} className="px-6 py-20 text-center">
                    <Loader2 className="w-7 h-7 text-[#F24C20] animate-spin mx-auto mb-2 opacity-30" />
                    <p className="text-gray-400 text-sm font-semibold tracking-tight">Syncing Categories...</p>
                  </td></tr>
                ) : categories.length === 0 ? (
                  <tr><td colSpan={4} className="px-6 py-20 text-center">
                    <FolderTree className="w-12 h-12 text-gray-100 mx-auto mb-3" />
                    <p className="text-gray-400 font-semibold tracking-tight">No Categories Found</p>
                  </td></tr>
                ) : categories.map((cat, i) => (
                  <motion.tr key={cat._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                    className="hover:bg-gray-50/30 transition-all">
                    <td className="px-6 py-5">
                      <div className="w-12 h-12 rounded-xl bg-gray-50 dark:bg-gray-900 flex items-center justify-center overflow-hidden border border-gray-100">
                        {cat.image ? (
                          <img src={`${import.meta.env.VITE_API_URL}/${cat.image}`} alt={cat.name} className="w-full h-full object-contain p-2" />
                        ) : (
                          <span className="text-xl">{cat.icon || '📁'}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="font-bold text-gray-800 dark:text-gray-100 tracking-tight leading-tight">{cat.name}</div>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-[10px] text-gray-400 font-mono font-black uppercase tracking-tighter">slug: {cat.slug}</span>
                        {cat.parent && <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 bg-blue-50 text-blue-500 rounded-md">Sub: {cat.parent.name}</span>}
                      </div>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${cat.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
                        {cat.is_active ? 'Public' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center justify-center gap-1">
                        <motion.button whileHover={{ scale: 1.1 }} onClick={() => openEdit(cat)} className="p-2.5 text-[#044071] hover:bg-blue-50 rounded-xl transition-colors">
                          <Edit className="w-4 h-4" />
                        </motion.button>
                        <motion.button whileHover={{ scale: 1.1 }} onClick={() => handleToggle(cat)} className="p-2.5 text-green-600 hover:bg-green-50 rounded-xl transition-colors">
                          {cat.is_active ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5 opacity-40" />}
                        </motion.button>
                        <motion.button whileHover={{ scale: 1.1 }} onClick={() => handleDelete(cat)} className="p-2.5 text-red-500 hover:bg-red-50 rounded-xl transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </motion.button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

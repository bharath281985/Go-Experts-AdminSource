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
    <div className="space-y-6">
      <Breadcrumb items={[{ label: 'Site Management', path: 'pages' }, { label: 'Categories' }]} />
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-1">Categories Management</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage project and gig categories from the database</p>
        </div>
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          onClick={openAdd}
          className="bg-[#F24C20] hover:bg-[#d43a12] text-white px-5 py-3 rounded-xl font-medium flex items-center gap-2">
          <Plus className="w-5 h-5" /> Add Category
        </motion.button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Panel */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 h-fit"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg">{editingId ? 'Edit Category' : 'Add New Category'}</h3>
                <button onClick={closeForm} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"><X className="w-4 h-4" /></button>
              </div>
              <div className="space-y-4">
                {/* Image Section */}
                <div>
                  <label className="block text-sm font-medium mb-2">Category Image</label>
                  <div 
                    onClick={() => document.getElementById('categoryImageInput')?.click()}
                    className="relative h-24 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-[#F24C20] bg-gray-50 dark:bg-gray-900/50 flex flex-col items-center justify-center cursor-pointer transition-all"
                  >
                    {imagePreview ? (
                      <img 
                        src={imagePreview.startsWith('data:') ? imagePreview : `${import.meta.env.VITE_API_URL}/${imagePreview}`} 
                        alt="Preview" 
                        className="w-full h-full object-contain rounded-lg p-1" 
                      />
                    ) : (
                      <>
                        <Plus className="w-6 h-6 text-gray-400 mb-1" />
                        <span className="text-xs text-gray-500 text-center px-2">Upload category image (PNG/JPG)</span>
                      </>
                    )}
                    <input 
                      id="categoryImageInput"
                      type="file" 
                      accept="image/*" 
                      onChange={handleImageChange} 
                      className="hidden" 
                    />
                  </div>
                  {imagePreview && (
                    <button 
                      type="button" 
                      onClick={(e) => { e.stopPropagation(); setImageFile(null); setImagePreview(null); }}
                      className="mt-2 text-xs text-red-500 hover:underline flex items-center gap-1"
                    >
                      <X className="w-3 h-3" /> Remove image
                    </button>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Name *</label>
                  <input type="text" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Web Development"
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-[#F24C20] text-sm" />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Parent Category</label>
                  <select value={form.parent} onChange={e => setForm(p => ({ ...p, parent: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-[#F24C20] text-sm">
                    <option value="">None (Top Level)</option>
                    {topLevelCats.filter(c => c._id !== editingId).map(cat => (
                      <option key={cat._id} value={cat._id}>{cat.icon} {cat.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Short description..."
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-[#F24C20] text-sm resize-none" rows={3} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Sort Order</label>
                  <input type="number" value={form.sort_order} onChange={e => setForm(p => ({ ...p, sort_order: Number(e.target.value) }))} min={0}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-[#F24C20] text-sm" />
                </div>
                <div className="flex gap-2">
                  <button onClick={closeForm} className="flex-1 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    Cancel
                  </button>
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={handleSubmit} disabled={saving}
                    className="flex-1 bg-[#F24C20] hover:bg-[#d43a12] text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-60 transition-colors">
                    {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : <><Save className="w-4 h-4" /> {editingId ? 'Update' : 'Create'}</>}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Table */}
        <div className={showForm ? 'lg:col-span-2' : 'lg:col-span-3'}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900/50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Image/Icon</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Name</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Parent</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Description</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Status</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {loading ? (
                  <tr><td colSpan={6} className="px-6 py-12 text-center">
                    <Loader2 className="w-7 h-7 text-[#F24C20] animate-spin mx-auto mb-2" />
                    <p className="text-gray-500 text-sm">Loading categories...</p>
                  </td></tr>
                ) : categories.length === 0 ? (
                  <tr><td colSpan={6} className="px-6 py-12 text-center">
                    <FolderTree className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No categories yet. Click "Add Category" to create the first one.</p>
                  </td></tr>
                ) : categories.map((cat, i) => (
                  <motion.tr key={cat._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                    whileHover={{ backgroundColor: 'rgba(59,130,246,0.04)' }}>
                    <td className="px-6 py-4">
                      {cat.image ? (
                        <img src={`${import.meta.env.VITE_API_URL}/${cat.image}`} alt={cat.name} className="w-10 h-10 object-contain rounded bg-gray-50 dark:bg-gray-900" />
                      ) : (
                        <span className="text-2xl">{cat.icon || '📁'}</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium">{cat.name}</div>
                      <div className="text-xs text-gray-400 font-mono">{cat.slug}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {cat.parent ? <span className="px-2 py-0.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-md text-xs">{cat.parent.name}</span> : <span className="text-gray-400">—</span>}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400 max-w-xs truncate">{cat.description || '—'}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${cat.is_active ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400' : 'bg-gray-100 dark:bg-gray-700 text-gray-600'}`}>
                        {cat.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => openEdit(cat)} className="p-2 hover:bg-blue-100 dark:hover:bg-blue-900/20 rounded-lg" title="Edit">
                          <Edit className="w-4 h-4 text-blue-600" />
                        </motion.button>
                        <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => handleToggle(cat)} className="p-2 hover:bg-green-100 dark:hover:bg-green-900/20 rounded-lg" title="Toggle Status">
                          {cat.is_active ? <ToggleRight className="w-4 h-4 text-green-600" /> : <ToggleLeft className="w-4 h-4 text-gray-500" />}
                        </motion.button>
                        <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => handleDelete(cat)} className="p-2 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg" title="Delete">
                          <Trash2 className="w-4 h-4 text-red-600" />
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

import React, { useState, useEffect } from 'react';
import { 
  Grid3x3, 
  Plus, 
  X, 
  Pencil, 
  Trash2, 
  CheckCircle, 
  AlertCircle 
} from 'lucide-react';
import api from '../lib/api';
import { toast } from 'sonner';

export function StartupCategories() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<any>(null);
  const [formData, setFormData] = useState({ name: '', description: '', status: 'active' });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await api.get('/startup-categories');
      if (res.data.success) {
        setCategories(res.data.data);
      }
    } catch (error) {
      toast.error('Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (category: any = null) => {
    if (category) {
      setCurrentCategory(category);
      setFormData({ name: category.name, description: category.description || '', status: category.status });
    } else {
      setCurrentCategory(null);
      setFormData({ name: '', description: '', status: 'active' });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (currentCategory) {
        await api.put(`/admin/startup-categories/${currentCategory._id}`, formData);
        toast.success('Category updated successfully');
      } else {
        await api.post('/admin/startup-categories', formData);
        toast.success('Category created successfully');
      }
      setShowModal(false);
      fetchCategories();
    } catch (error) {
      toast.error('Failed to save category');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await api.delete(`/admin/startup-categories/${id}`);
        toast.success('Category deleted successfully');
        fetchCategories();
      } catch (error) {
        toast.error('Failed to delete category');
      }
    }
  };

  const handleToggleStatus = async (cat: any) => {
    try {
      const newStatus = cat.status === 'active' ? 'inactive' : 'active';
      await api.put(`/admin/startup-categories/${cat._id}`, {
        name: cat.name,
        description: cat.description,
        status: newStatus
      });
      toast.success(`Category marked as ${newStatus}`);
      fetchCategories();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  return (
    <div className="max-w-[1300px] mx-auto space-y-8 pb-16 px-6">
      {/* Header - Professional Alignment */}
      <div className="flex items-center justify-between border-b border-gray-100 dark:border-[#262626] pb-6 mt-4">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold text-[#044071] dark:text-white mb-1">Idea Categories</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Manage classification taxonomies for startup concepts and ideas.</p>
        </div>
        <motion.button 
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          onClick={() => handleOpenModal()}
          className="bg-[#F24C20] hover:bg-[#d43a12] text-white px-6 py-2.5 rounded-xl font-semibold flex items-center gap-2 flex-shrink-0 shadow-lg shadow-[#F24C20]/10"
        >
          <Plus className="w-5 h-5" /> Add Category
        </motion.button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {loading ? (
            [1,2,3].map(i => <div key={i} className="h-48 rounded-[2rem] bg-gray-50/50 animate-pulse border border-gray-100" />)
        ) : categories.map((cat, idx) => (
          <motion.div 
            key={cat._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
            className="bg-white dark:bg-[#1a1a1a] p-8 rounded-[2rem] border border-gray-100 dark:border-[#262626] shadow-sm hover:shadow-xl hover:border-[#F24C20]/10 transition-all group relative overflow-hidden"
          >
            <div className="flex items-start justify-between mb-6">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#F24C20] to-orange-500 flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
                <Grid3x3 className="w-7 h-7" />
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                <button onClick={() => handleOpenModal(cat)} className="p-2.5 hover:bg-blue-50 text-[#044071] rounded-xl transition-colors"><Pencil className="w-4 h-4" /></button>
                <button onClick={() => handleDelete(cat._id)} className="p-2.5 hover:bg-red-50 text-red-500 rounded-xl transition-colors"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white leading-tight mb-2 truncate">{cat.name}</h3>
            <p className="text-sm text-gray-500 line-clamp-3 mb-8 font-medium italic">
                "{cat.description || 'No strategic description available for this category asset.'}"
            </p>
             <div className="flex items-center justify-between mt-auto pt-6 border-t border-gray-50 dark:border-[#262626]">
               <button 
                 onClick={() => handleToggleStatus(cat)}
                 className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                    cat.status === 'active' 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-gray-100 text-gray-400'
                 }`}
               >
                 {cat.status}
               </button>
               <div className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">
                  {new Date(cat.createdAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
               </div>
             </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#044071]/20 backdrop-blur-md p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white dark:bg-[#1a1a1a] w-full max-w-lg rounded-[2.5rem] p-12 relative shadow-2xl border border-white/20"
            >
              <button onClick={() => setShowModal(false)} className="absolute top-8 right-8 p-2 text-gray-300 hover:text-gray-500 transition-colors"><X className="w-6 h-6" /></button>
              <div className="mb-10">
                <h2 className="text-2xl font-bold text-[#044071] dark:text-white mb-2">{currentCategory ? 'Edit Taxonomy' : 'New Idea Taxonomy'}</h2>
                <p className="text-sm text-gray-400">Define the classification parameters for startup concepts.</p>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="block text-[11px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-2 ml-1">Category Label *</label>
                  <input type="text" value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-5 py-3.5 rounded-xl bg-gray-50 dark:bg-[#262626] border-none outline-none focus:ring-2 focus:ring-[#F24C20]/20 transition-all font-medium"
                    required placeholder="e.g. Fintech Solutions" />
                </div>
                <div className="space-y-2">
                  <label className="block text-[11px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-2 ml-1">Strategic Description</label>
                  <textarea value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full px-5 py-3.5 rounded-xl bg-gray-50 dark:bg-[#262626] border-none outline-none focus:ring-2 focus:ring-[#F24C20]/20 resize-none font-medium h-32"
                    placeholder="Provide a detailed taxonomic description..." />
                </div>
                <div className="space-y-2">
                  <label className="block text-[11px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-2 ml-1">Asset Status</label>
                  <select value={formData.status}
                     onChange={(e) => setFormData({...formData, status: e.target.value})}
                     className="w-full px-5 py-3.5 rounded-xl bg-gray-50 dark:bg-[#262626] border-none outline-none focus:ring-2 focus:ring-[#F24C20]/20 font-bold"
                  >
                     <option value="active">Active Placement</option>
                     <option value="inactive">Hidden Asset</option>
                  </select>
                </div>

                <div className="pt-8 flex gap-4">
                  <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-4 text-sm font-black uppercase tracking-widest text-gray-400 hover:text-gray-600 transition-colors">Cancel</button>
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" 
                    className="flex-1 py-4 bg-[#F24C20] text-white rounded-2xl font-bold shadow-xl shadow-[#F24C20]/20 transition-all">
                    {currentCategory ? 'Commit Update' : 'Authorize Asset'}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

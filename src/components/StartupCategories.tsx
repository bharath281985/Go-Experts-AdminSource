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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Grid3x3 className="w-6 h-6 text-[#F24C20]" />
            Idea Categories
          </h1>
          <p className="text-gray-500">Manage classification for startup concepts</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="px-6 py-2 bg-[#F24C20] text-white rounded-xl font-bold hover:scale-105 transition-all shadow-lg shadow-[#F24C20]/20 flex items-center gap-2"
        >
          <Plus className="w-5 h-5" /> Add Category
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
            [1,2,3].map(i => <div key={i} className="h-40 rounded-xl bg-gray-50 animate-pulse" />)
        ) : categories.map(cat => (
          <div key={cat._id} className="bg-white dark:bg-[#1a1a1a] p-6 rounded-2xl border border-gray-100 dark:border-[#262626] group">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-[#F24C20]/10 flex items-center justify-center text-[#F24C20]">
                <Grid3x3 className="w-6 h-6" />
              </div>
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => handleOpenModal(cat)} className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Pencil className="w-4 h-4" /></button>
                <button onClick={() => handleDelete(cat._id)} className="p-2 bg-red-50 text-red-600 rounded-lg"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
            <h3 className="text-lg font-bold mb-1">{cat.name}</h3>
            <p className="text-sm text-gray-500 line-clamp-2 mb-4">{cat.description || 'No description available'}</p>
            <div className="flex items-center justify-between mt-auto">
               <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${cat.status === 'active' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                 {cat.status}
               </span>
               <div className="text-xs text-gray-400">Created: {new Date(cat.createdAt).toLocaleDateString()}</div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#1a1a1a] w-full max-w-md rounded-[32px] p-8 relative">
            <button onClick={() => setShowModal(false)} className="absolute top-6 right-6 p-2 text-gray-400 hover:text-black dark:hover:text-white"><X className="w-6 h-6" /></button>
            <h2 className="text-2xl font-bold mb-6">{currentCategory ? 'Update Category' : 'New Idea Category'}</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold">Category Name</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-[#262626] border-none outline-none focus:ring-1 focus:ring-[#F24C20]"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold">Description</label>
                <textarea 
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-[#262626] border-none outline-none focus:ring-1 focus:ring-[#F24C20] resize-none"
                  rows={4}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold">Status</label>
                <select 
                   value={formData.status}
                   onChange={(e) => setFormData({...formData, status: e.target.value})}
                   className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-[#262626] border-none outline-none focus:ring-1 focus:ring-[#F24C20]"
                >
                   <option value="active">Active</option>
                   <option value="inactive">Inactive</option>
                </select>
              </div>

              <div className="pt-4 flex gap-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3 text-sm font-bold text-gray-500">Cancel</button>
                <button type="submit" className="flex-1 py-3 bg-[#F24C20] text-white rounded-xl font-bold shadow-lg shadow-[#F24C20]/20">Save Category</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

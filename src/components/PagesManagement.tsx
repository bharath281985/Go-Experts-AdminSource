import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Edit, Trash2, Eye, FileText, CheckCircle, X, Search } from 'lucide-react';
import api from '../lib/api';
import { toast } from 'sonner';
// @ts-ignore
import { CKEditor } from '@ckeditor/ckeditor5-react';
// @ts-ignore
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

interface StaticPage {
  _id: string;
  title: string;
  slug: string;
  content: string;
  meta_title: string;
  meta_description: string;
  status: 'published' | 'draft';
  updatedAt: string;
  // Extra fields
  vision?: string;
  vision_icon?: string;
  mission?: string;
  mission_icon?: string;
  mission_points?: string[];
  differentiators?: { label: string; description: string; icon?: string }[];
  responsibilities?: string;
  image1?: string;
  image2?: string;
}

export function PagesManagement() {
  const [pages, setPages] = useState<StaticPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPage, setEditingPage] = useState<StaticPage | null>(null);
  const [form, setForm] = useState<Partial<StaticPage>>({ 
    title: '', slug: '', content: '', meta_title: '', meta_description: '', status: 'published',
    vision: '', vision_icon: 'Target', mission: '', mission_icon: 'Sparkles',
    mission_points: [], differentiators: [], responsibilities: '', image1: '', image2: ''
  });
  const [image1File, setImage1File] = useState<File | null>(null);
  const [image2File, setImage2File] = useState<File | null>(null);
  const [previews, setPreviews] = useState({ image1: '', image2: '' });
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');

  const fetchPages = async () => {
    try {
      setLoading(true);
      const res = await api.get('/cms/pages');
      setPages(res.data.pages || []);
    } catch {
      toast.error('Failed to load pages');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPages(); }, []);

  const resetForm = () => {
    setForm({ 
      title: '', slug: '', content: '', meta_title: '', meta_description: '', status: 'published',
      vision: '', vision_icon: 'Target', mission: '', mission_icon: 'Sparkles',
      mission_points: [], differentiators: [], responsibilities: '', image1: '', image2: ''
    });
    setImage1File(null);
    setImage2File(null);
    setPreviews({ image1: '', image2: '' });
    setEditingPage(null);
    setShowForm(false);
  };

  const handleEdit = (page: StaticPage) => {
    setEditingPage(page);
    setForm({ 
      title: page.title, slug: page.slug, content: page.content, 
      meta_title: page.meta_title, meta_description: page.meta_description, status: page.status,
      vision: page.vision || '',
      vision_icon: page.vision_icon || 'Target',
      mission: page.mission || '',
      mission_icon: page.mission_icon || 'Sparkles',
      mission_points: page.mission_points || [],
      differentiators: page.differentiators || [],
      responsibilities: page.responsibilities || '',
      image1: page.image1 || '',
      image2: page.image2 || ''
    });
    setPreviews({ image1: page.image1 || '', image2: page.image2 || '' });
    setShowForm(true);
  };

  // Auto-generate slug from title
  const handleTitleChange = (title: string) => {
    setForm(prev => ({
      ...prev,
      title,
      slug: prev.slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
    }));
  };

  const handleSubmit = async () => {
    if (!form.title?.trim() || !form.slug?.trim()) {
      toast.error('Title and slug are required');
      return;
    }
    setSaving(true);
    try {
      const data = new FormData();
      Object.keys(form).forEach(key => {
        const val = (form as any)[key];
        if (val !== undefined && key !== 'image1' && key !== 'image2') {
          if (Array.isArray(val) || (typeof val === 'object' && val !== null)) {
            data.append(key, JSON.stringify(val));
          } else {
            data.append(key, val);
          }
        }
      });
      if (image1File) data.append('image1', image1File);
      if (image2File) data.append('image2', image2File);

      if (editingPage) {
        await api.put(`/cms/pages/${editingPage._id}`, data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Page updated!');
      } else {
        await api.post('/cms/pages', data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Page created!');
      }
      fetchPages();
      resetForm();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to save page');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this page?')) return;
    try {
      await api.delete(`/cms/pages/${id}`);
      toast.success('Page deleted');
      fetchPages();
    } catch {
      toast.error('Failed to delete page');
    }
  };

  const filtered = pages.filter(p =>
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.slug.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#044071] dark:text-white mb-1">Pages Management</h1>
          <p className="text-gray-500 dark:text-gray-400">Manage static pages like About, Terms, Privacy</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          onClick={() => { resetForm(); setShowForm(true); }}
          className="bg-[#F24C20] hover:bg-[#d43a12] text-white px-6 py-3 rounded-xl font-medium flex items-center gap-2"
        >
          <Plus className="w-5 h-5" /> Add Page
        </motion.button>
      </div>

      {/* Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white dark:bg-[#1a1a1a] rounded-2xl border border-[#F24C20]/30 p-6"
          >
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100 dark:border-[#262626]">
              <div>
                <h2 className="text-xl font-bold text-[#044071] dark:text-white">{editingPage ? 'Edit Page' : 'Create New Page'}</h2>
                <p className="text-sm text-gray-500">Fill in the details below to {(editingPage ? 'update the' : 'create a new')} static page.</p>
              </div>
              <button onClick={resetForm} className="p-2 hover:bg-gray-100 dark:hover:bg-[#262626] rounded-full transition-colors">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={e => handleTitleChange(e.target.value)}
                  placeholder="e.g. About Us"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-[#262626] bg-gray-50 dark:bg-[#262626] focus:outline-none focus:ring-2 focus:ring-[#F24C20]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Slug *</label>
                <input
                  type="text"
                  value={form.slug}
                  onChange={e => setForm({ ...form, slug: e.target.value })}
                  placeholder="e.g. about"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-[#262626] bg-gray-50 dark:bg-[#262626] focus:outline-none focus:ring-2 focus:ring-[#F24C20]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Meta Title</label>
                <input
                  type="text"
                  value={form.meta_title}
                  onChange={e => setForm({ ...form, meta_title: e.target.value })}
                  placeholder="e.g. About Us | Go Experts"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-[#262626] bg-gray-50 dark:bg-[#262626] focus:outline-none focus:ring-2 focus:ring-[#F24C20]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Status</label>
                <select
                  value={form.status}
                  onChange={e => setForm({ ...form, status: e.target.value as any })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-[#262626] bg-gray-50 dark:bg-[#262626] focus:outline-none focus:ring-2 focus:ring-[#F24C20]"
                >
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                </select>
              </div>

              {/* About Us Specific Fields */}
              {(form.slug?.toLowerCase().trim() === 'about-us' || form.slug?.toLowerCase().trim() === 'about' || form.slug?.toLowerCase().trim() === 'aboutus') && (
                <div className="col-span-2 space-y-4 p-4 rounded-2xl bg-gray-50 dark:bg-[#262626]/50 border border-[#F24C20]/20">
                  <h3 className="text-sm font-bold text-[#F24C20] uppercase tracking-wider">About Us Structured Content</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Vision Icon (Lucide Name)</label>
                      <input 
                        value={form.vision_icon}
                        onChange={e => setForm({ ...form, vision_icon: e.target.value })}
                        className="w-full px-4 py-2 text-sm rounded-lg border border-gray-200 dark:border-[#262626]"
                        placeholder="e.g. Target, Eye, Rocket"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Mission Icon (Lucide Name)</label>
                      <input 
                        value={form.mission_icon}
                        onChange={e => setForm({ ...form, mission_icon: e.target.value })}
                        className="w-full px-4 py-2 text-sm rounded-lg border border-gray-200 dark:border-[#262626]"
                        placeholder="e.g. Sparkles, Zap, Heart"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1 text-[#044071] dark:text-gray-300">Our Vision</label>
                    <textarea 
                      value={form.vision}
                      onChange={e => setForm({ ...form, vision: e.target.value })}
                      placeholder="e.g. To create a commission-free freelancing environment where talent and opportunity meet directly."
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-[#262626] bg-white dark:bg-[#262626] focus:outline-none focus:ring-2 focus:ring-[#F24C20] min-h-[80px]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1 text-[#044071] dark:text-gray-300">Our Mission</label>
                    <textarea 
                      value={form.mission}
                      onChange={e => setForm({ ...form, mission: e.target.value })}
                      placeholder="e.g. To empower freelancers with full control over their earnings and help clients hire talent without hidden fees."
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-[#262626] bg-white dark:bg-[#262626] focus:outline-none focus:ring-2 focus:ring-[#F24C20] min-h-[80px]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 flex justify-between items-center text-[#044071] dark:text-gray-300">
                      <span>Mission Points (Bullet List)</span>
                      <button 
                        type="button"
                        onClick={() => setForm({ ...form, mission_points: [...(form.mission_points || []), ''] })}
                        className="text-[#F24C20] text-xs font-bold hover:bg-[#F24C20]/5 px-2 py-1 rounded"
                      >
                        + Add Point
                      </button>
                    </label>
                    <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2 scrollbar-thin">
                      {form.mission_points?.map((point, idx) => (
                        <div key={idx} className="flex gap-2 group">
                          <div className="flex-1 relative">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-[#F24C20]" />
                            <input 
                              value={point}
                              onChange={e => {
                                const newPoints = [...(form.mission_points || [])];
                                newPoints[idx] = e.target.value;
                                setForm({ ...form, mission_points: newPoints });
                              }}
                              className="w-full pl-7 pr-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-[#262626] focus:ring-1 focus:ring-[#F24C20]"
                              placeholder="e.g. 100% Commission Free Model"
                            />
                          </div>
                          <button 
                            type="button"
                            onClick={() => setForm({ ...form, mission_points: form.mission_points?.filter((_, i) => i !== idx) })}
                            className="p-2 text-red-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 flex justify-between items-center text-[#044071] dark:text-gray-300">
                      <span>Key Differentiators</span>
                      <button 
                        type="button"
                        onClick={() => setForm({ ...form, differentiators: [...(form.differentiators || []), { label: '', description: '', icon: 'ShieldCheck' }] })}
                        className="text-[#F24C20] text-xs font-bold hover:bg-[#F24C20]/5 px-2 py-1 rounded"
                      >
                        + Add Dynamic Row
                      </button>
                    </label>
                    <div className="bg-white dark:bg-[#1a1a1a] border border-gray-100 dark:border-[#262626] rounded-xl overflow-hidden shadow-sm">
                      <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50 dark:bg-[#262626] border-b border-gray-100 dark:border-[#262626]">
                          <tr>
                            <th className="px-3 py-2 text-[10px] items-center uppercase font-bold text-gray-500 w-24">Icon Name</th>
                            <th className="px-3 py-2 text-[10px] items-center uppercase font-bold text-gray-500 w-40">Label</th>
                            <th className="px-3 py-2 text-[10px] items-center uppercase font-bold text-gray-500">Description</th>
                            <th className="px-3 py-2 text-[10px] items-center uppercase font-bold text-gray-500 w-10 text-center"></th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-[#262626]">
                          {form.differentiators?.length === 0 ? (
                            <tr>
                              <td colSpan={4} className="px-4 py-8 text-center text-gray-400 text-xs italic">No differentiators added yet.</td>
                            </tr>
                          ) : form.differentiators?.map((diff, idx) => (
                            <tr key={idx} className="group hover:bg-gray-50/50 dark:hover:bg-[#262626]/30 transition-colors">
                              <td className="px-2 py-2">
                                <input 
                                  value={diff.icon}
                                  onChange={e => {
                                    const newDiffs = [...(form.differentiators || [])];
                                    newDiffs[idx].icon = e.target.value;
                                    setForm({ ...form, differentiators: newDiffs });
                                  }}
                                  className="w-full px-2 py-1.5 text-xs rounded border border-gray-200 dark:border-[#333] bg-transparent focus:ring-1 focus:ring-[#F24C20] outline-none"
                                  placeholder="ShieldCheck"
                                />
                              </td>
                              <td className="px-2 py-2">
                                <input 
                                  value={diff.label}
                                  onChange={e => {
                                    const newDiffs = [...(form.differentiators || [])];
                                    newDiffs[idx].label = e.target.value;
                                    setForm({ ...form, differentiators: newDiffs });
                                  }}
                                  className="w-full px-2 py-1.5 text-xs font-semibold rounded border border-gray-200 dark:border-[#333] bg-transparent focus:ring-1 focus:ring-[#F24C20] outline-none"
                                  placeholder="e.g. Zero Fees"
                                />
                              </td>
                              <td className="px-2 py-2">
                                <textarea 
                                  value={diff.description}
                                  onChange={e => {
                                    const newDiffs = [...(form.differentiators || [])];
                                    newDiffs[idx].description = e.target.value;
                                    setForm({ ...form, differentiators: newDiffs });
                                  }}
                                  className="w-full px-2 py-1.5 text-xs rounded border border-gray-200 dark:border-[#333] bg-transparent focus:ring-1 focus:ring-[#F24C20] outline-none min-h-[40px] resize-none"
                                  placeholder="Brief description..."
                                />
                              </td>
                              <td className="px-2 py-2 text-center">
                                <button 
                                  type="button"
                                  onClick={() => setForm({ ...form, differentiators: form.differentiators?.filter((_, i) => i !== idx) })}
                                  className="p-1.5 text-red-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="relative group">
                      <label className="block text-sm font-medium mb-1 text-[#044071]">About Image 1</label>
                      <div className="relative h-32 w-full rounded-2xl border-2 border-dashed border-gray-200 dark:border-[#333] hover:border-[#F24C20]/30 transition-all overflow-hidden bg-gray-50/50 flex flex-col items-center justify-center p-2">
                        {previews.image1 ? (
                          <>
                            <img src={previews.image1.startsWith('blob:') ? previews.image1 : `${import.meta.env.VITE_API_URL}${previews.image1}`} className="absolute inset-0 w-full h-full object-cover opacity-80" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <span className="text-white text-[10px] font-bold">Change Image</span>
                            </div>
                          </>
                        ) : (
                          <div className="text-center">
                            <Plus className="w-5 h-5 text-gray-400 mx-auto mb-1" />
                            <span className="text-[10px] text-gray-500">Upload Hero Image</span>
                          </div>
                        )}
                        <input 
                          type="file" 
                          onChange={e => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setImage1File(file);
                              setPreviews(p => ({ ...p, image1: URL.createObjectURL(file) }));
                            }
                          }}
                          className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                      </div>
                    </div>
                    <div className="relative group">
                      <label className="block text-sm font-medium mb-1 text-[#044071]">About Image 2</label>
                      <div className="relative h-32 w-full rounded-2xl border-2 border-dashed border-gray-200 dark:border-[#333] hover:border-[#F24C20]/30 transition-all overflow-hidden bg-gray-50/50 flex flex-col items-center justify-center p-2">
                        {previews.image2 ? (
                          <>
                            <img src={previews.image2.startsWith('blob:') ? previews.image2 : `${import.meta.env.VITE_API_URL}${previews.image2}`} className="absolute inset-0 w-full h-full object-cover opacity-80" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <span className="text-white text-[10px] font-bold">Change Image</span>
                            </div>
                          </>
                        ) : (
                          <div className="text-center">
                            <Plus className="w-5 h-5 text-gray-400 mx-auto mb-1" />
                            <span className="text-[10px] text-gray-500">Upload Side Image</span>
                          </div>
                        )}
                        <input 
                          type="file" 
                          onChange={e => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setImage2File(file);
                              setPreviews(p => ({ ...p, image2: URL.createObjectURL(file) }));
                            }
                          }}
                          className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1 text-[#044071] dark:text-gray-300">Our Promise (Footer CTA Text)</label>
                    <textarea 
                      value={form.responsibilities}
                      onChange={e => setForm({ ...form, responsibilities: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-[#262626] bg-white dark:bg-[#262626] focus:outline-none focus:ring-2 focus:ring-[#F24C20] min-h-[80px]"
                      placeholder="e.g. We’re not just a platform—we’re a community where talent meets opportunity without barriers."
                    />
                  </div>
                </div>
              )}

              <div className="col-span-2">
                <label className="block text-sm font-medium mb-1">Meta Description (SEO)</label>
                <textarea
                  value={form.meta_description}
                  onChange={e => setForm({ ...form, meta_description: e.target.value })}
                  placeholder="Enter a brief description for search engines (150-160 characters)..."
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-[#262626] bg-gray-50 dark:bg-[#262626] focus:outline-none focus:ring-2 focus:ring-[#F24C20] min-h-[80px]"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium mb-1">Main Page Content (Top Hero Area)</label>
                <div className="ck-editor-container min-h-[350px]">
                  <CKEditor
                    editor={ClassicEditor}
                    data={form.content || ''}
                    onChange={(_event: any, editor: any) => {
                      const data = editor.getData();
                      setForm({ ...form, content: data });
                    }}
                    config={{
                      placeholder: 'Start writing your page content here...',
                      toolbar: [
                        'heading', '|', 
                        'bold', 'italic', 'link', 'bulletedList', 'numberedList', 'blockQuote', '|',
                        'undo', 'redo'
                      ]
                    }}
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <motion.button
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={handleSubmit}
                disabled={saving}
                className="flex items-center gap-2 bg-[#F24C20] hover:bg-[#d43a12] disabled:opacity-60 text-white px-6 py-2.5 rounded-xl font-medium"
              >
                <CheckCircle className="w-4 h-4" />
                {saving ? 'Saving...' : editingPage ? 'Update Page' : 'Create Page'}
              </motion.button>
              <button onClick={resetForm} className="px-6 py-2.5 rounded-xl border border-gray-300 dark:border-[#262626] hover:bg-gray-50 dark:hover:bg-[#262626]">Cancel</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search pages..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-[#262626] bg-white dark:bg-[#1a1a1a] focus:outline-none focus:ring-2 focus:ring-[#F24C20]"
        />
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center py-16 text-gray-400">Loading pages...</div>
      ) : (
        <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl border border-gray-200 dark:border-[#262626] overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-[#262626]">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold">#</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Page Name</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Slug / URL</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Last Updated</th>
                <th className="px-6 py-4 text-center text-sm font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-[#262626]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-400">
                    <FileText className="w-10 h-10 mx-auto mb-2 opacity-30" />
                    No pages yet. Click "Add Page" to create one.
                  </td>
                </tr>
              ) : filtered.map((page, index) => (
                <motion.tr
                  key={page._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.04 }}
                  className="hover:bg-gray-50 dark:hover:bg-[#262626] transition-colors"
                >
                  <td className="px-6 py-4 text-sm text-gray-500">{index + 1}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-gray-400" />
                      <span className="font-medium">{page.title}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 font-mono">/{page.slug}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${page.status === 'published' ? 'bg-green-100 dark:bg-green-900/20 text-green-700' : 'bg-gray-100 dark:bg-gray-700 text-gray-500'}`}>
                      {page.status === 'published' ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{new Date(page.updatedAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <motion.a
                        href={`http://localhost:5175/${page.slug}`}
                        target="_blank"
                        whileHover={{ scale: 1.1 }}
                        className="p-2 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg"
                      >
                        <Eye className="w-4 h-4 text-green-600" />
                      </motion.a>
                      <motion.button whileHover={{ scale: 1.1 }} onClick={() => handleEdit(page)} className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg">
                        <Edit className="w-4 h-4 text-[#044071]" />
                      </motion.button>
                      <motion.button whileHover={{ scale: 1.1 }} onClick={() => handleDelete(page._id)} className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg">
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </motion.button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

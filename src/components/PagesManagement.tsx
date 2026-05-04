import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Edit, Trash2, Eye, FileText, CheckCircle, X, Search } from 'lucide-react';
import api from '../lib/api';
import { toast } from 'sonner';
import { AdminRichTextEditor } from './common/AdminRichTextEditor';

interface StaticPage {
  _id: string;
  title: string;
  slug: string;
  content: string;
  meta_title: string;
  meta_description: string;
  status: 'published' | 'draft';
  updatedAt: string;
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
  const publishedCount = pages.filter(p => p.status === 'published').length;
  const draftCount = pages.filter(p => p.status === 'draft').length;
  const isAboutPage = form.slug?.toLowerCase().trim() === 'about-us' || form.slug?.toLowerCase().trim() === 'about' || form.slug?.toLowerCase().trim() === 'aboutus';
  const inputClass = "w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-[#262626] bg-gray-50 dark:bg-[#262626] focus:outline-none focus:ring-2 focus:ring-[#F24C20]";
  const textareaClass = `${inputClass} min-h-[80px]`;

  return (
    <div className="max-w-[1300px] mx-auto space-y-8 pb-16 px-6">
      {/* Header - Professional Alignment */}
      <div className="flex items-center justify-between border-b border-gray-100 dark:border-[#262626] pb-6 mt-4">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold text-[#044071] dark:text-white mb-1">Pages Management</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Create, edit, and publish static website pages.</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => { resetForm(); setShowForm(true); }}
          className="bg-[#F24C20] hover:bg-[#d43a12] text-white px-6 py-2.5 rounded-xl font-semibold flex items-center gap-2 flex-shrink-0 shadow-lg shadow-[#F24C20]/10"
        >
          <Plus className="w-5 h-5" />
          Add Page
        </motion.button>
      </div>

      {/* Stats - Compact Bento Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Total Pages', value: pages.length, color: 'text-[#044071]', icon: <FileText className="w-5 h-5" />, bg: 'bg-[#044071]/5' },
          { label: 'Published', value: publishedCount, color: 'text-green-600', icon: <CheckCircle className="w-5 h-5" />, bg: 'bg-green-50' },
          { label: 'Drafts', value: draftCount, color: 'text-[#F24C20]', icon: <Edit className="w-5 h-5" />, bg: 'bg-[#F24C20]/5' },
        ].map(s => (
          <div key={s.label} className="bg-white dark:bg-[#1a1a1a] rounded-2xl border border-gray-100 dark:border-[#262626] p-6 flex items-center gap-5 hover:shadow-md transition-all">
             <div className={`p-4 rounded-xl ${s.bg} ${s.color}`}>
                {s.icon}
            </div>
            <div>
              <div className={`text-2xl font-bold text-gray-900 dark:text-white leading-none mb-1`}>{s.value}</div>
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Form Interface */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white dark:bg-[#1a1a1a] rounded-[1.5rem] border border-[#F24C20]/20 p-10 shadow-2xl relative overflow-hidden"
          >
             <div className="absolute top-0 left-0 w-1.5 h-full bg-[#F24C20]" />
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-xl font-bold text-[#044071] dark:text-white">
                  {editingPage ? 'Edit Page Details' : 'Create New Page'}
                </h2>
                <p className="text-xs text-gray-500 mt-1">Configure your static content and SEO metadata below.</p>
              </div>
              <button onClick={resetForm} className="p-2 hover:bg-gray-100 dark:hover:bg-[#262626] rounded-full transition-colors">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-2 ml-1">Page Title *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={e => handleTitleChange(e.target.value)}
                  placeholder="e.g. About Us"
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-2 ml-1">Page Slug *</label>
                <input
                  type="text"
                  value={form.slug}
                  onChange={e => setForm({ ...form, slug: e.target.value })}
                  placeholder="e.g. about"
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-2 ml-1">Meta Title (SEO)</label>
                <input
                  type="text"
                  value={form.meta_title}
                  onChange={e => setForm({ ...form, meta_title: e.target.value })}
                  placeholder="e.g. About Us | Go Experts"
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-2 ml-1">Publishing Status</label>
                <select
                  value={form.status}
                  onChange={e => setForm({ ...form, status: e.target.value as any })}
                  className={inputClass}
                >
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                </select>
              </div>

              {isAboutPage && (
                <div className="md:col-span-2 space-y-6 p-8 rounded-2xl bg-gray-50 dark:bg-[#262626]/30 border border-gray-100 dark:border-[#333]">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-1.5 h-6 bg-[#F24C20] rounded-full" />
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">Structured Content (About Us)</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-[0.1em] text-gray-500 mb-1.5 ml-1">Vision Icon (Lucide)</label>
                      <input
                        value={form.vision_icon}
                        onChange={e => setForm({ ...form, vision_icon: e.target.value })}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-[0.1em] text-gray-500 mb-1.5 ml-1">Mission Icon (Lucide)</label>
                      <input
                        value={form.mission_icon}
                        onChange={e => setForm({ ...form, mission_icon: e.target.value })}
                        className={inputClass}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-[0.1em] text-gray-500 mb-1.5 ml-1">Our Vision Statement</label>
                      <textarea
                        value={form.vision}
                        onChange={e => setForm({ ...form, vision: e.target.value })}
                        className={textareaClass}
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-[0.1em] text-gray-500 mb-1.5 ml-1">Our Mission Statement</label>
                      <textarea
                        value={form.mission}
                        onChange={e => setForm({ ...form, mission: e.target.value })}
                        className={textareaClass}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-[0.1em] text-gray-500 mb-3 ml-1 flex justify-between items-center">
                      <span>Mission Highlights (Bullets)</span>
                      <button
                        type="button"
                        onClick={() => setForm({ ...form, mission_points: [...(form.mission_points || []), ''] })}
                        className="text-[#F24C20] text-[10px] font-black uppercase hover:underline"
                      >
                        + Add Point
                      </button>
                    </label>
                    <div className="space-y-3 max-h-[220px] overflow-y-auto pr-2">
                      {form.mission_points?.map((point, idx) => (
                        <div key={idx} className="flex gap-2">
                          <input
                            value={point}
                            onChange={e => {
                              const newPoints = [...(form.mission_points || [])];
                              newPoints[idx] = e.target.value;
                              setForm({ ...form, mission_points: newPoints });
                            }}
                            className="flex-1 px-4 py-2 text-sm rounded-lg border border-gray-200 dark:border-[#333] focus:ring-2 focus:ring-[#F24C20]/10 outline-none"
                            placeholder="e.g. 100% Transparency"
                          />
                          <button
                            type="button"
                            onClick={() => setForm({ ...form, mission_points: form.mission_points?.filter((_, i) => i !== idx) })}
                            className="p-2 text-red-400 hover:bg-red-50 rounded-lg"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-[0.1em] text-gray-500 mb-3 ml-1 flex justify-between items-center">
                      <span>Core Differentiators</span>
                      <button
                        type="button"
                        onClick={() => setForm({ ...form, differentiators: [...(form.differentiators || []), { label: '', description: '', icon: 'ShieldCheck' }] })}
                        className="text-[#F24C20] text-[10px] font-black uppercase hover:underline"
                      >
                        + Add Dynamic Row
                      </button>
                    </label>
                    <div className="bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#333] rounded-xl overflow-hidden shadow-sm">
                      <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50 dark:bg-[#262626]">
                          <tr>
                            <th className="px-4 py-3 text-[10px] uppercase font-bold text-gray-400 w-32">Icon</th>
                            <th className="px-4 py-3 text-[10px] uppercase font-bold text-gray-400 w-48">Label</th>
                            <th className="px-4 py-3 text-[10px] uppercase font-bold text-gray-400">Description</th>
                            <th className="px-4 py-3 text-[10px] uppercase font-bold text-gray-400 w-12"></th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-[#333]">
                          {form.differentiators?.map((diff, idx) => (
                            <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                              <td className="p-2"><input value={diff.icon} onChange={e => { const nd = [...(form.differentiators || [])]; nd[idx].icon = e.target.value; setForm({ ...form, differentiators: nd }); }} className="w-full px-2 py-1.5 text-xs rounded border border-gray-100 dark:border-[#444] bg-transparent outline-none" /></td>
                              <td className="p-2"><input value={diff.label} onChange={e => { const nd = [...(form.differentiators || [])]; nd[idx].label = e.target.value; setForm({ ...form, differentiators: nd }); }} className="w-full px-2 py-1.5 text-xs font-semibold rounded border border-gray-100 dark:border-[#444] bg-transparent outline-none" /></td>
                              <td className="p-2"><textarea value={diff.description} onChange={e => { const nd = [...(form.differentiators || [])]; nd[idx].description = e.target.value; setForm({ ...form, differentiators: nd }); }} className="w-full px-2 py-1.5 text-xs rounded border border-gray-100 dark:border-[#444] bg-transparent outline-none resize-none h-10" /></td>
                              <td className="p-2 text-center"><button onClick={() => setForm({ ...form, differentiators: form.differentiators?.filter((_, i) => i !== idx) })} className="p-2 text-red-400 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    {['image1', 'image2'].map((key, i) => (
                      <div key={key}>
                        <label className="block text-[11px] font-bold uppercase tracking-[0.1em] text-gray-500 mb-2">Display Asset {i+1}</label>
                        <div className="relative h-28 rounded-xl border-2 border-dashed border-gray-200 dark:border-[#444] hover:border-[#F24C20]/20 transition-all flex flex-col items-center justify-center bg-white dark:bg-[#1a1a1a] cursor-pointer overflow-hidden group">
                           {(previews as any)[key] ? (
                            <img src={(previews as any)[key].startsWith('blob:') ? (previews as any)[key] : `${import.meta.env.VITE_API_URL}${(previews as any)[key]}`} className="absolute inset-0 w-full h-full object-cover opacity-60" />
                           ) : (
                            <Plus className="w-5 h-5 text-gray-300" />
                           )}
                           <input type="file" onChange={e => {
                             const file = e.target.files?.[0];
                             if (file) {
                               if (key === 'image1') { setImage1File(file); setPreviews(p => ({...p, image1: URL.createObjectURL(file)})); }
                               else { setImage2File(file); setPreviews(p => ({...p, image2: URL.createObjectURL(file)})); }
                             }
                           }} className="absolute inset-0 opacity-0 cursor-pointer" />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-[0.1em] text-gray-500 mb-1.5 ml-1">Commitment Footer</label>
                    <textarea value={form.responsibilities} onChange={e => setForm({ ...form, responsibilities: e.target.value })} className={textareaClass} placeholder="e.g. Our promise to you..." />
                  </div>
                </div>
              )}

              <div className="md:col-span-2">
                <label className="block text-[11px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-2 ml-1">Meta Description (SEO)</label>
                <textarea
                  value={form.meta_description}
                  onChange={e => setForm({ ...form, meta_description: e.target.value })}
                  placeholder="Enter SEO meta description..."
                  className={textareaClass}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-[11px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-2 ml-1">Primary Body Content</label>
                <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-[#333]">
                  <AdminRichTextEditor
                    value={form.content || ''}
                    onChange={(content) => setForm({ ...form, content })}
                    minHeight={300}
                    toolbarPreset="full"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-4 mt-8 pt-6 border-t border-gray-50 dark:border-[#262626]">
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={handleSubmit}
                disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 bg-[#F24C20] hover:bg-[#d43a12] disabled:opacity-60 text-white px-8 py-3.5 rounded-xl font-bold shadow-lg shadow-[#F24C20]/10"
              >
                {saving ? 'Processing...' : <><CheckCircle className="w-5 h-5" /> {editingPage ? 'Update Page' : 'Publish Page'}</>}
              </motion.button>
              <button
                onClick={resetForm}
                className="px-10 py-3.5 rounded-xl border border-gray-200 dark:border-[#262626] hover:bg-gray-50 dark:hover:bg-gray-800 font-bold text-gray-500 transition-all"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search & List */}
      <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl border border-gray-100 dark:border-[#262626] p-4 shadow-sm">
        <div className="flex items-center justify-between gap-4 mb-4">
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest ml-1">Page Inventory</h2>
        </div>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Filter by title or slug..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl border-none bg-gray-50/50 dark:bg-[#0a0a0a] focus:bg-white dark:focus:bg-[#0a0a0a] focus:outline-none focus:ring-2 focus:ring-[#F24C20]/10 transition-all text-sm font-medium"
          />
        </div>
      </div>

      {/* Table - Neat Alignment */}
      {loading ? (
        <div className="text-center py-20 text-gray-400 font-medium">Loading Page Data...</div>
      ) : (
        <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl border border-gray-100 dark:border-[#262626] overflow-x-auto shadow-sm">
          <table className="w-full" style={{ minWidth: 900 }}>
            <thead className="bg-gray-50/50 dark:bg-[#262626] border-b border-gray-100 dark:border-[#262626]">
              <tr>
                <th className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-gray-500">ID</th>
                <th className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-gray-500">Page Identity</th>
                <th className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-gray-500">Routing</th>
                <th className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-gray-500 text-center">Status</th>
                <th className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-gray-500 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-[#262626]">
              {filtered.map((page, index) => (
                <tr key={page._id} className="hover:bg-gray-50/50 dark:hover:bg-[#262626]/30 transition-colors">
                  <td className="px-6 py-4 text-xs font-mono text-gray-400">{index + 1}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gray-50 dark:bg-[#222] rounded-lg">
                        <FileText className="w-4 h-4 text-gray-400" />
                      </div>
                      <span className="font-semibold text-gray-700 dark:text-gray-200">{page.title}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 font-medium italic opacity-70">/{page.slug}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${page.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {page.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-1">
                      <motion.a href={`http://localhost:5175/${page.slug}`} target="_blank" whileHover={{ scale: 1.1 }} className="p-2 text-green-600 hover:bg-green-50 rounded-lg"><Eye className="w-4 h-4" /></motion.a>
                      <motion.button whileHover={{ scale: 1.1 }} onClick={() => handleEdit(page)} className="p-2 text-[#044071] hover:bg-blue-50 rounded-lg"><Edit className="w-4 h-4" /></motion.button>
                      <motion.button whileHover={{ scale: 1.1 }} onClick={() => handleDelete(page._id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></motion.button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Edit, Trash2, ToggleLeft, ToggleRight, Search, MessageSquare, CheckCircle, Star, User } from 'lucide-react';
import api from '../lib/api';
import { toast } from 'sonner';

interface Testimonial {
    _id: string;
    name: string;
    role: string;
    rating: number;
    text: string;
    avatar: string;
    sort_order: number;
    is_active: boolean;
}

export function TestimonialsManagement() {
    const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingItem, setEditingItem] = useState<Testimonial | null>(null);
    const [form, setForm] = useState({ name: '', role: '', rating: 5, text: '', avatar: '', sort_order: 0 });
    const [saving, setSaving] = useState(false);

    const fetchTestimonials = async () => {
        try {
            setLoading(true);
            const res = await api.get('/cms/testimonials');
            setTestimonials(res.data.testimonials || []);
        } catch {
            toast.error('Failed to load testimonials');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchTestimonials(); }, []);

    const resetForm = () => {
        setForm({ name: '', role: '', rating: 5, text: '', avatar: '', sort_order: 0 });
        setEditingItem(null);
        setShowForm(false);
    };

    const handleEdit = (item: Testimonial) => {
        setEditingItem(item);
        setForm({ name: item.name, role: item.role, rating: item.rating, text: item.text, avatar: item.avatar, sort_order: item.sort_order });
        setShowForm(true);
    };

    const handleSubmit = async () => {
        if (!form.name.trim() || !form.text.trim()) {
            toast.error('Name and text are required');
            return;
        }
        setSaving(true);
        try {
            if (editingItem) {
                await api.put(`/cms/testimonials/${editingItem._id}`, form);
                toast.success('Testimonial updated!');
            } else {
                await api.post('/cms/testimonials', form);
                toast.success('Testimonial created!');
            }
            fetchTestimonials();
            resetForm();
        } catch (err: any) {
            toast.error(err?.response?.data?.message || 'Failed to save testimonial');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this testimonial?')) return;
        try {
            await api.delete(`/cms/testimonials/${id}`);
            toast.success('Testimonial deleted');
            fetchTestimonials();
        } catch {
            toast.error('Failed to delete testimonial');
        }
    };

    const handleToggle = async (id: string) => {
        try {
            await api.patch(`/cms/testimonials/${id}/toggle`);
            fetchTestimonials();
        } catch {
            toast.error('Failed to toggle status');
        }
    };

    const filtered = testimonials.filter(t =>
        t.name.toLowerCase().includes(search.toLowerCase()) ||
        t.role.toLowerCase().includes(search.toLowerCase()) ||
        t.text.toLowerCase().includes(search.toLowerCase())
    );
    const activeCount = testimonials.filter(t => t.is_active).length;
    const averageRating = (testimonials.reduce((acc, t) => acc + t.rating, 0) / (testimonials.length || 1)).toFixed(1);
    const inputClass = "w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-[#262626] bg-gray-50 dark:bg-[#262626] focus:ring-2 focus:ring-[#F24C20] outline-none";

    return (
    <div className="max-w-[1300px] mx-auto space-y-8 pb-16 px-6">
      {/* Header - Professional Alignment */}
      <div className="flex items-center justify-between border-b border-gray-100 dark:border-[#262626] pb-6 mt-4">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold text-[#044071] dark:text-white mb-1">Testimonials Management</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Curate customer trust stories and social proof for the platform.</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          onClick={() => { resetForm(); setShowForm(true); }}
          className="bg-[#F24C20] hover:bg-[#d43a12] text-white px-6 py-2.5 rounded-xl font-semibold flex items-center gap-2 flex-shrink-0 shadow-lg shadow-[#F24C20]/10"
        >
          <Plus className="w-5 h-5" /> Add Testimonial
        </motion.button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Total Stories', value: testimonials.length, color: 'text-[#044071]', icon: <MessageSquare className="w-5 h-5" />, bg: 'bg-[#044071]/5' },
          { label: 'Published', value: activeCount, color: 'text-green-600', icon: <CheckCircle className="w-5 h-5" />, bg: 'bg-green-50' },
          { label: 'Average Rating', value: averageRating, color: 'text-yellow-600', icon: <Star className="w-5 h-5" />, bg: 'bg-yellow-50' },
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

      {/* Inline Form - Normalized */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white dark:bg-[#1a1a1a] rounded-2xl border border-[#F24C20]/20 p-10 shadow-2xl relative overflow-hidden h-fit"
          >
            <div className="absolute top-0 left-0 w-1.5 h-full bg-[#F24C20]" />
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-lg font-semibold text-[#044071] dark:text-white">{editingItem ? 'Edit Testimonial Content' : 'New Testimonial Asset'}</h3>
                <p className="text-xs text-gray-500 mt-1">Capture authentic user experiences and display ratings.</p>
              </div>
              <button onClick={resetForm} className="p-2 hover:bg-gray-100 dark:hover:bg-[#262626] rounded-full transition-colors">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-5">
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-400 mb-2 ml-1">Customer Name *</label>
                  <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. Jessica Martinez" className={inputClass} />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-400 mb-2 ml-1">Enterprise Role / Company *</label>
                  <input type="text" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}
                    placeholder="e.g. CEO, TechStart" className={inputClass} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-400 mb-2 ml-1">Rating (1-5)</label>
                    <input type="number" min="1" max="5" value={form.rating}
                      onChange={e => setForm({ ...form, rating: Number(e.target.value) })} className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-400 mb-2 ml-1">Display Order</label>
                    <input type="number" value={form.sort_order}
                      onChange={e => setForm({ ...form, sort_order: Number(e.target.value) })} className={inputClass} />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-400 mb-2 ml-1">Identity Avatar (URL or Emoji)</label>
                  <input type="text" value={form.avatar} onChange={e => setForm({ ...form, avatar: e.target.value })}
                    placeholder="e.g. 👩‍💼 or /path/to/img.png" className={inputClass} />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-400 mb-2 ml-1">Testimonial Manuscript *</label>
                <textarea rows={10} value={form.text} onChange={e => setForm({ ...form, text: e.target.value })}
                  placeholder="Insert the client testimonial text here..." className={`${inputClass} resize-none h-[calc(100%-2.5rem)]`} />
              </div>
            </div>
            <div className="flex gap-4 mt-8 pt-6 border-t border-gray-50 dark:border-[#262626]">
              <motion.button
                whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                onClick={handleSubmit} disabled={saving}
                className="flex-1 bg-[#F24C20] text-white py-3.5 rounded-xl font-semibold shadow-lg shadow-[#F24C20]/10 flex items-center justify-center gap-2 transition-all"
              >
                {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
                {editingItem ? 'Commit Update' : 'Authorize Asset'}
              </motion.button>
              <button onClick={resetForm} className="px-10 py-3.5 rounded-xl border border-gray-200 dark:border-[#262626] hover:bg-gray-50 dark:hover:bg-gray-800 font-semibold text-gray-500 transition-all">Cancel</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl border border-gray-100 dark:border-[#262626] p-4 shadow-sm">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
          <input type="text" placeholder="Search by name, role or story content..." value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-transparent bg-gray-50/50 dark:bg-[#262626] focus:bg-white dark:focus:bg-[#1a1a1a] focus:ring-2 focus:ring-[#F24C20]/20 transition-all outline-none text-sm font-semibold" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-20 flex flex-col items-center justify-center space-y-3 opacity-50">
             <div className="w-6 h-6 border-2 border-[#F24C20]/20 border-t-[#F24C20] rounded-full animate-spin" />
             <p className="text-sm font-semibold tracking-tight text-gray-400">Syncing Testimonials...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="col-span-full py-20 text-center bg-gray-50/30 rounded-2xl border border-dashed border-gray-100">
            <MessageSquare className="w-12 h-12 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-400 font-semibold tracking-tight">No records found matching your criteria.</p>
          </div>
        ) : (
          filtered.map((item, idx) => (
            <motion.div
              key={item._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
              className={`p-8 rounded-2xl bg-white dark:bg-[#1a1a1a] border border-gray-100 dark:border-[#262626] shadow-sm hover:shadow-xl hover:border-[#F24C20]/10 transition-all group relative overflow-hidden ${!item.is_active && 'opacity-60 grayscale'}`}
            >
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#044071] to-[#0a5ea3] flex items-center justify-center text-2xl shadow-inner text-white flex-shrink-0">
                    {item.avatar.length < 5 ? item.avatar : <User className="w-7 h-7" />}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-gray-900 dark:text-white leading-tight mb-0.5 truncate">{item.name}</h3>
                    <p className="text-[11px] font-semibold text-[#F24C20] uppercase tracking-widest">{item.role}</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-1 mb-5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-3 h-3 ${i < item.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`} />
                ))}
              </div>

              <div className="relative">
                 <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed font-medium italic">
                    "{item.text}"
                 </p>
              </div>
              
              <div className="mt-8 pt-6 border-t border-gray-50 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-all duration-300">
                  <div className="flex gap-1">
                      <button onClick={() => handleToggle(item._id)} className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest ${item.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'}`}>
                          {item.is_active ? 'Public' : 'Hidden'}
                      </button>
                  </div>
                  <div className="flex gap-1">
                      <button onClick={() => handleEdit(item)} className="p-2.5 hover:bg-[#044071]/10 rounded-xl text-[#044071] transition-colors"><Edit className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(item._id)} className="p-2.5 hover:bg-red-50 rounded-xl text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                  </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
    );
}

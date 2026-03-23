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

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-[#044071] dark:text-white mb-1">Testimonials</h1>
                    <p className="text-gray-500 dark:text-gray-400">Manage customer trust stories shown on the homepage</p>
                </div>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => { resetForm(); setShowForm(true); }}
                    className="bg-[#F24C20] hover:bg-[#d43a12] text-white px-6 py-3 rounded-xl font-medium flex items-center gap-2"
                >
                    <Plus className="w-5 h-5" />
                    Add Testimonial
                </motion.button>
            </div>

            <div className="grid grid-cols-3 gap-4">
                {[
                    { label: 'Total Stories', value: testimonials.length, color: 'text-[#044071]' },
                    { label: 'Active', value: testimonials.filter(t => t.is_active).length, color: 'text-green-600' },
                    { label: 'Avg Rating', value: (testimonials.reduce((acc, t) => acc + t.rating, 0) / (testimonials.length || 1)).toFixed(1), color: 'text-yellow-500' },
                ].map(s => (
                    <div key={s.label} className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-gray-200 dark:border-[#262626] p-4">
                        <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{s.label}</div>
                    </div>
                ))}
            </div>

            <AnimatePresence>
                {showForm && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-white dark:bg-[#1a1a1a] rounded-2xl border border-[#F24C20]/30 p-6 shadow-xl"
                    >
                        <h2 className="text-lg font-bold mb-4 text-[#044071] dark:text-white">
                            {editingItem ? 'Update Testimonial' : 'New Testimonial'}
                        </h2>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Customer Name *</label>
                                    <input
                                        type="text"
                                        value={form.name}
                                        onChange={e => setForm({ ...form, name: e.target.value })}
                                        placeholder="e.g. Jessica Martinez"
                                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-[#262626] bg-gray-50 dark:bg-[#262626] focus:ring-2 focus:ring-[#F24C20] outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Company / Role *</label>
                                    <input
                                        type="text"
                                        value={form.role}
                                        onChange={e => setForm({ ...form, role: e.target.value })}
                                        placeholder="e.g. CEO, TechStart"
                                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-[#262626] bg-gray-50 dark:bg-[#262626] focus:ring-2 focus:ring-[#F24C20] outline-none"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Rating (1-5)</label>
                                        <input
                                            type="number" min="1" max="5"
                                            value={form.rating}
                                            onChange={e => setForm({ ...form, rating: Number(e.target.value) })}
                                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-[#262626] bg-gray-50 dark:bg-[#262626] focus:ring-2 focus:ring-[#F24C20] outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Sort Order</label>
                                        <input
                                            type="number"
                                            value={form.sort_order}
                                            onChange={e => setForm({ ...form, sort_order: Number(e.target.value) })}
                                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-[#262626] bg-gray-50 dark:bg-[#262626] focus:ring-2 focus:ring-[#F24C20] outline-none"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Avatar (Emoji or URL)</label>
                                    <input
                                        type="text"
                                        value={form.avatar}
                                        onChange={e => setForm({ ...form, avatar: e.target.value })}
                                        placeholder="e.g. 👩‍💼 or /path/to/img.png"
                                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-[#262626] bg-gray-50 dark:bg-[#262626] focus:ring-2 focus:ring-[#F24C20] outline-none"
                                    />
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Testimonial Text *</label>
                                    <textarea
                                        rows={8}
                                        value={form.text}
                                        onChange={e => setForm({ ...form, text: e.target.value })}
                                        placeholder="What did they say?"
                                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-[#262626] bg-gray-50 dark:bg-[#262626] focus:ring-2 focus:ring-[#F24C20] outline-none resize-none"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-3 mt-6">
                            <motion.button
                                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                                onClick={handleSubmit}
                                disabled={saving}
                                className="flex items-center gap-2 bg-[#F24C20] hover:bg-[#d43a12] disabled:opacity-60 text-white px-8 py-3 rounded-xl font-bold"
                            >
                                {saving ? 'Saving...' : <><CheckCircle className="w-5 h-5" /> {editingItem ? 'Update Story' : 'Publish Story'}</>}
                            </motion.button>
                            <button onClick={resetForm} className="px-8 py-3 rounded-xl border border-gray-300 dark:border-[#262626] hover:bg-gray-50 dark:hover:bg-[#262626] transition-colors font-medium">
                                Cancel
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                    type="text"
                    placeholder="Search by name, role or content..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-[#262626] bg-white dark:bg-[#1a1a1a] focus:ring-2 focus:ring-[#F24C20] outline-none"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    <div className="col-span-full text-center py-20 text-gray-500">Loading stories...</div>
                ) : filtered.length === 0 ? (
                    <div className="col-span-full text-center py-20">
                        <MessageSquare className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                        <p className="text-gray-500">No testimonials found.</p>
                    </div>
                ) : (
                    filtered.map((item, idx) => (
                        <motion.div
                            key={item._id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: idx * 0.05 }}
                            className={`p-6 rounded-2xl bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#262626] relative overflow-hidden group ${!item.is_active && 'opacity-60 grayscale'}`}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#F24C20] to-orange-500 flex items-center justify-center text-xl shadow-lg text-white">
                                        {item.avatar.length < 5 ? item.avatar : <User className="w-6 h-6" />}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900 dark:text-white leading-none mb-1">{item.name}</h3>
                                        <p className="text-xs text-gray-500">{item.role}</p>
                                    </div>
                                </div>
                                <div className="flex gap-1">
                                    <button onClick={() => handleEdit(item)} className="p-1.5 hover:bg-gray-100 dark:hover:bg-[#262626] rounded-lg transition-colors">
                                        <Edit className="w-4 h-4 text-[#044071]" />
                                    </button>
                                    <button onClick={() => handleToggle(item._id)} className="p-1.5 hover:bg-gray-100 dark:hover:bg-[#262626] rounded-lg transition-colors">
                                        {item.is_active ? <ToggleRight className="w-5 h-5 text-green-500" /> : <ToggleLeft className="w-5 h-5 text-gray-400" />}
                                    </button>
                                    <button onClick={() => handleDelete(item._id)} className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                                        <Trash2 className="w-4 h-4 text-red-500" />
                                    </button>
                                </div>
                            </div>

                            <div className="flex gap-1 mb-3">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} className={`w-3.5 h-3.5 ${i < item.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                                ))}
                            </div>

                            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-4 leading-relaxed italic group-hover:line-clamp-none transition-all">
                                "{item.text}"
                            </p>
                        </motion.div>
                    ))
                )}
            </div>
        </div>
    );
}

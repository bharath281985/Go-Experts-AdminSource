import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Edit, Trash2, ToggleLeft, ToggleRight, Loader2, X, Save, Image, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import api from '../lib/api';

interface Banner {
    _id: string;
    title: string;
    subtitle?: string;
    image_url?: string;
    link_url?: string;
    link_text?: string;
    position: string;
    is_active: boolean;
    sort_order: number;
    target_audience: string;
    start_date?: string;
    end_date?: string;
}

const emptyForm = {
    title: '', subtitle: '', image_url: '', link_url: '', link_text: 'Learn More',
    position: 'hero', sort_order: 0, target_audience: 'all', start_date: '', end_date: ''
};

const POSITIONS = ['hero', 'sidebar', 'footer', 'popup', 'category'];
const AUDIENCES = ['all', 'freelancer', 'client'];
const POSITION_COLORS: Record<string, string> = {
    hero: 'bg-blue-100 text-blue-700', sidebar: 'bg-purple-100 text-purple-700',
    footer: 'bg-gray-100 text-gray-700', popup: 'bg-orange-100 text-orange-700', category: 'bg-green-100 text-green-700'
};

export function BannersManagement() {
    const [banners, setBanners] = useState<Banner[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [form, setForm] = useState(emptyForm);

    useEffect(() => { fetchBanners(); }, []);

    const fetchBanners = async () => {
        try {
            setLoading(true);
            const res = await api.get('/cms/banners');
            if (res.data.success) setBanners(res.data.banners);
        } catch { toast.error('Failed to load banners'); }
        finally { setLoading(false); }
    };

    const openAdd = () => { setEditingId(null); setForm(emptyForm); setShowForm(true); };
    const openEdit = (b: Banner) => {
        setEditingId(b._id);
        setForm({
            title: b.title, subtitle: b.subtitle || '', image_url: b.image_url || '',
            link_url: b.link_url || '', link_text: b.link_text || 'Learn More',
            position: b.position, sort_order: b.sort_order, target_audience: b.target_audience,
            start_date: b.start_date ? b.start_date.split('T')[0] : '',
            end_date: b.end_date ? b.end_date.split('T')[0] : ''
        });
        setShowForm(true);
    };
    const closeForm = () => { setShowForm(false); setEditingId(null); };

    const handleSubmit = async () => {
        if (!form.title.trim()) { toast.error('Banner title is required'); return; }
        try {
            setSaving(true);
            const payload = { ...form, sort_order: Number(form.sort_order), start_date: form.start_date || null, end_date: form.end_date || null };
            if (editingId) {
                const res = await api.put(`/cms/banners/${editingId}`, payload);
                toast.success(res.data.message);
            } else {
                const res = await api.post('/cms/banners', payload);
                toast.success(res.data.message);
            }
            closeForm(); fetchBanners();
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to save banner');
        } finally { setSaving(false); }
    };

    const handleToggle = async (b: Banner) => {
        try {
            const res = await api.patch(`/cms/banners/${b._id}/toggle`);
            toast.success(res.data.message);
            setBanners(prev => prev.map(x => x._id === b._id ? { ...x, is_active: !x.is_active } : x));
        } catch (err: any) { toast.error(err.response?.data?.message || 'Failed to toggle'); }
    };

    const handleDelete = async (b: Banner) => {
        if (!window.confirm(`Delete banner "${b.title}"?`)) return;
        try {
            const res = await api.delete(`/cms/banners/${b._id}`);
            toast.success(res.data.message);
            setBanners(prev => prev.filter(x => x._id !== b._id));
        } catch (err: any) { toast.error(err.response?.data?.message || 'Failed to delete'); }
    };

    const inputCls = "w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-[#F24C20] text-sm";

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold mb-1">Banners Management</h1>
                    <p className="text-gray-600 dark:text-gray-400">Manage hero, sidebar, and promotional banners</p>
                </div>
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={openAdd}
                    className="bg-[#F24C20] hover:bg-[#d43a12] text-white px-5 py-3 rounded-xl font-medium flex items-center gap-2">
                    <Plus className="w-5 h-5" /> Add Banner
                </motion.button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Form */}
                <AnimatePresence>
                    {showForm && (
                        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                            className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 h-fit">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-bold text-lg">{editingId ? 'Edit Banner' : 'Add New Banner'}</h3>
                                <button onClick={closeForm} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"><X className="w-4 h-4" /></button>
                            </div>
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Title *</label>
                                    <input className={inputCls} value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="Banner headline" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Subtitle</label>
                                    <input className={inputCls} value={form.subtitle} onChange={e => setForm(p => ({ ...p, subtitle: e.target.value }))} placeholder="Supporting text" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Image URL</label>
                                    <input className={inputCls} value={form.image_url} onChange={e => setForm(p => ({ ...p, image_url: e.target.value }))} placeholder="https://..." />
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Link URL</label>
                                        <input className={inputCls} value={form.link_url} onChange={e => setForm(p => ({ ...p, link_url: e.target.value }))} placeholder="/gigs" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Link Text</label>
                                        <input className={inputCls} value={form.link_text} onChange={e => setForm(p => ({ ...p, link_text: e.target.value }))} />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Position</label>
                                        <select className={inputCls} value={form.position} onChange={e => setForm(p => ({ ...p, position: e.target.value }))}>
                                            {POSITIONS.map(pos => <option key={pos} value={pos}>{pos.charAt(0).toUpperCase() + pos.slice(1)}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Audience</label>
                                        <select className={inputCls} value={form.target_audience} onChange={e => setForm(p => ({ ...p, target_audience: e.target.value }))}>
                                            {AUDIENCES.map(a => <option key={a} value={a}>{a.charAt(0).toUpperCase() + a.slice(1)}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Start Date</label>
                                        <input className={inputCls} type="date" value={form.start_date} onChange={e => setForm(p => ({ ...p, start_date: e.target.value }))} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">End Date</label>
                                        <input className={inputCls} type="date" value={form.end_date} onChange={e => setForm(p => ({ ...p, end_date: e.target.value }))} />
                                    </div>
                                </div>
                                <div className="flex gap-2 pt-1">
                                    <button onClick={closeForm} className="flex-1 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700">Cancel</button>
                                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={handleSubmit} disabled={saving}
                                        className="flex-1 bg-[#F24C20] text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-60">
                                        {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : <><Save className="w-4 h-4" /> {editingId ? 'Update' : 'Create'}</>}
                                    </motion.button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* List */}
                <div className={showForm ? 'lg:col-span-2' : 'lg:col-span-3'}>
                    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-gray-50 dark:bg-gray-900/50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-sm font-semibold">Banner</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold">Position</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold">Audience</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold">Status</th>
                                    <th className="px-6 py-4 text-center text-sm font-semibold">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {loading ? (
                                    <tr><td colSpan={5} className="px-6 py-12 text-center">
                                        <Loader2 className="w-7 h-7 text-[#F24C20] animate-spin mx-auto mb-2" />
                                        <p className="text-gray-500 text-sm">Loading banners...</p>
                                    </td></tr>
                                ) : banners.length === 0 ? (
                                    <tr><td colSpan={5} className="px-6 py-12 text-center">
                                        <Image className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                                        <p className="text-gray-500">No banners yet. Click "Add Banner" to create the first one.</p>
                                    </td></tr>
                                ) : banners.map((b, i) => (
                                    <motion.tr key={b._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                                        whileHover={{ backgroundColor: 'rgba(59,130,246,0.04)' }}>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                {b.image_url ? (
                                                    <img src={b.image_url} alt="" className="w-12 h-8 rounded-lg object-cover bg-gray-100" onError={e => (e.currentTarget.style.display = 'none')} />
                                                ) : (
                                                    <div className="w-12 h-8 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center"><Image className="w-4 h-4 text-gray-400" /></div>
                                                )}
                                                <div>
                                                    <div className="font-medium text-sm">{b.title}</div>
                                                    {b.subtitle && <div className="text-xs text-gray-400 truncate max-w-xs">{b.subtitle}</div>}
                                                    {b.link_url && <a href={b.link_url} target="_blank" rel="noreferrer" className="text-xs text-blue-500 flex items-center gap-0.5 hover:underline"><ExternalLink className="w-3 h-3" />{b.link_text}</a>}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${POSITION_COLORS[b.position] || 'bg-gray-100 text-gray-700'}`}>
                                                {b.position}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400 capitalize">{b.target_audience}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${b.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                                {b.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-center gap-2">
                                                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => openEdit(b)} className="p-2 hover:bg-blue-100 dark:hover:bg-blue-900/20 rounded-lg" title="Edit">
                                                    <Edit className="w-4 h-4 text-blue-600" />
                                                </motion.button>
                                                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => handleToggle(b)} className="p-2 hover:bg-green-100 dark:hover:bg-green-900/20 rounded-lg" title="Toggle">
                                                    {b.is_active ? <ToggleRight className="w-4 h-4 text-green-600" /> : <ToggleLeft className="w-4 h-4 text-gray-500" />}
                                                </motion.button>
                                                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => handleDelete(b)} className="p-2 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg" title="Delete">
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

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
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Edit, Trash2, ToggleLeft, ToggleRight, Loader2, X, Image, ExternalLink, CheckCircle } from 'lucide-react';
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

    const activeCount = banners.filter(b => b.is_active).length;
    const inputCls = "w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-[#262626] bg-gray-50 dark:bg-[#262626] focus:outline-none focus:ring-2 focus:ring-[#F24C20] text-sm";

    return (
    <div className="max-w-[1300px] mx-auto space-y-8 pb-16 px-6">
      {/* Header - Professional Alignment */}
      <div className="flex items-center justify-between border-b border-gray-100 dark:border-[#262626] pb-6 mt-4">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold text-[#044071] dark:text-white mb-1">Banners Management</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Control site-wide promotional and hero banner deployments.</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={openAdd}
          className="bg-[#F24C20] hover:bg-[#d43a12] text-white px-6 py-2.5 rounded-xl font-semibold flex items-center gap-2 flex-shrink-0 shadow-lg shadow-[#F24C20]/10"
        >
          <Plus className="w-5 h-5" /> Add Banner
        </motion.button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Total Banners', value: banners.length, color: 'text-[#044071]', icon: <Image className="w-5 h-5" />, bg: 'bg-[#044071]/5' },
          { label: 'Live Assets', value: activeCount, color: 'text-green-600', icon: <CheckCircle className="w-5 h-5" />, bg: 'bg-green-50' },
          { label: 'Active Placements', value: new Set(banners.map(b => b.position)).size, color: 'text-[#F24C20]', icon: <ExternalLink className="w-5 h-5" />, bg: 'bg-[#F24C20]/5' },
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form - Normalized Inline */}
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
                  <h3 className="text-lg font-bold text-[#044071] dark:text-white">{editingId ? 'Edit Banner Identity' : 'New Banner Asset'}</h3>
                  <p className="text-xs text-gray-500 mt-1">Configure placement, audience, and scheduling.</p>
                </div>
                <button onClick={closeForm} className="p-2 hover:bg-gray-100 dark:hover:bg-[#262626] rounded-full transition-colors">
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>
              <div className="space-y-5">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-2 ml-1">Asset Headline *</label>
                  <input className={inputCls} value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="Banner headline" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-2 ml-1">Supporting Subtext</label>
                  <input className={inputCls} value={form.subtitle} onChange={e => setForm(p => ({ ...p, subtitle: e.target.value }))} placeholder="Secondary description" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-2 ml-1">Remote Image Path</label>
                  <input className={inputCls} value={form.image_url} onChange={e => setForm(p => ({ ...p, image_url: e.target.value }))} placeholder="https://cdn.example.com/banner.jpg" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-2 ml-1">Redirect URL</label>
                    <input className={inputCls} value={form.link_url} onChange={e => setForm(p => ({ ...p, link_url: e.target.value }))} placeholder="/gigs" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-2 ml-1">Button CTA</label>
                    <input className={inputCls} value={form.link_text} onChange={e => setForm(p => ({ ...p, link_text: e.target.value }))} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-2 ml-1">Zone Position</label>
                    <select className={inputCls} value={form.position} onChange={e => setForm(p => ({ ...p, position: e.target.value }))}>
                      {POSITIONS.map(pos => <option key={pos} value={pos}>{pos.charAt(0).toUpperCase() + pos.slice(1)} Placement</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-2 ml-1">Audience Segment</label>
                    <select className={inputCls} value={form.target_audience} onChange={e => setForm(p => ({ ...p, target_audience: e.target.value }))}>
                      {AUDIENCES.map(a => <option key={a} value={a}>{a.charAt(0).toUpperCase() + a.slice(1)} Users</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-2 ml-1">Start Deployment</label>
                    <input className={inputCls} type="date" value={form.start_date} onChange={e => setForm(p => ({ ...p, start_date: e.target.value }))} />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-2 ml-1">End Deployment</label>
                    <input className={inputCls} type="date" value={form.end_date} onChange={e => setForm(p => ({ ...p, end_date: e.target.value }))} />
                  </div>
                </div>
                <div className="flex gap-4 pt-4 mt-2">
                  <motion.button
                    whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                    onClick={handleSubmit} disabled={saving}
                    className="flex-1 bg-[#F24C20] text-white py-3.5 rounded-xl font-bold shadow-lg shadow-[#F24C20]/10 flex items-center justify-center gap-2"
                  >
                    {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
                    {editingId ? 'Commit Update' : 'Publish Asset'}
                  </motion.button>
                  <button onClick={closeForm} className="px-8 py-3.5 rounded-xl border border-gray-200 dark:border-gray-800 font-bold text-gray-500 hover:bg-gray-50 transition-all">Cancel</button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Banner Table - Crisp Alignment */}
        <div className={showForm ? 'lg:col-span-2' : 'lg:col-span-3'}>
          <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl border border-gray-100 dark:border-[#262626] overflow-x-auto shadow-sm">
            <table className="w-full" style={{ minWidth: 820 }}>
              <thead className="bg-gray-50/50 dark:bg-[#262626] border-b border-gray-100 dark:border-[#262626]">
                <tr>
                  <th className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-gray-500">Asset Identity</th>
                  <th className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-gray-500">Zone</th>
                  <th className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-gray-500">Audience</th>
                  <th className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-gray-500 text-center">Status</th>
                  <th className="px-6 py-4 text-center text-[11px] font-bold uppercase tracking-wider text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-[#262626]">
                {loading ? (
                  <tr><td colSpan={5} className="px-6 py-20 text-center">
                    <Loader2 className="w-7 h-7 text-[#F24C20] animate-spin mx-auto mb-2 opacity-50" />
                    <p className="text-gray-400 text-sm font-medium tracking-tight">Syncing Banners...</p>
                  </td></tr>
                ) : banners.length === 0 ? (
                  <tr><td colSpan={5} className="px-6 py-20 text-center">
                    <Image className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                    <p className="text-gray-400 font-semibold tracking-tight">No Banners Found</p>
                  </td></tr>
                ) : banners.map((b, i) => (
                  <motion.tr key={b._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                    className="hover:bg-gray-50/50 dark:hover:bg-[#262626]/30 transition-all">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div className="relative group flex-shrink-0">
                          {b.image_url ? (
                            <img src={b.image_url} alt="" className="w-14 h-10 rounded-lg object-cover bg-gray-100 shadow-sm border border-gray-100" />
                          ) : (
                            <div className="w-14 h-10 rounded-lg bg-gray-50 dark:bg-gray-800 flex items-center justify-center"><Image className="w-4 h-4 text-gray-300" /></div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-gray-800 dark:text-gray-200 tracking-tight truncate">{b.title}</div>
                          {b.link_url && <div className="text-[10px] text-blue-500 font-mono mt-0.5 truncate max-w-[200px]">{b.link_url}</div>}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${POSITION_COLORS[b.position] || 'bg-gray-100 text-gray-700'}`}>
                        {b.position}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-[11px] font-bold text-gray-500 uppercase tracking-widest">{b.target_audience}</td>
                    <td className="px-6 py-5 text-center">
                      <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${b.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
                        {b.is_active ? 'Active' : 'Offline'}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center justify-center gap-1">
                        <motion.button whileHover={{ scale: 1.1 }} onClick={() => openEdit(b)} className="p-2 text-[#044071] hover:bg-blue-50 rounded-lg transition-colors">
                          <Edit className="w-4 h-4" />
                        </motion.button>
                        <motion.button whileHover={{ scale: 1.1 }} onClick={() => handleToggle(b)} className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                          {b.is_active ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5 opacity-40" />}
                        </motion.button>
                        <motion.button whileHover={{ scale: 1.1 }} onClick={() => handleDelete(b)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
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

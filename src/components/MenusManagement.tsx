import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, GripVertical, CheckCircle, ChevronDown, X, Search } from 'lucide-react';
import { Breadcrumb } from './Breadcrumb';
import api from '../lib/api';
import { toast } from 'sonner';

interface MenusManagementProps {
  onNavigate: (page: string) => void;
}

interface MenuItem {
  _id: string;
  label: string;
  url: string;
  location: 'header' | 'footer' | 'user';
  parent: null | { _id: string; label: string } | string;
  order: number;
  is_active: boolean;
  open_in_new_tab: boolean;
}

const LOCATIONS = [
  { id: 'header', name: 'Header Menu', description: 'Main navigation' },
  { id: 'footer', name: 'Footer Menu', description: 'Footer links' },
  { id: 'user', name: 'User Dashboard', description: 'Logged-in user menu' },
];

export function MenusManagement({ onNavigate }: MenusManagementProps) {
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLocation, setSelectedLocation] = useState<'header' | 'footer' | 'user'>('header');
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [form, setForm] = useState({ label: '', url: '', location: 'header', parent: '', order: 0, open_in_new_tab: false });
  const [saving, setSaving] = useState(false);

  const fetchMenus = async () => {
    try {
      setLoading(true);
      const res = await api.get('/cms/menus');
      setMenus(res.data.menus || []);
    } catch {
      toast.error('Failed to load menus');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMenus(); }, []);

  const resetForm = () => {
    setForm({ label: '', url: '', location: selectedLocation, parent: '', order: 0, open_in_new_tab: false });
    setEditingItem(null);
    setShowForm(false);
  };

  const handleEdit = (item: MenuItem) => {
    setEditingItem(item);
    setForm({
      label: item.label,
      url: item.url,
      location: item.location,
      parent: item.parent && typeof item.parent === 'object' ? (item.parent as any)._id : '',
      order: item.order,
      open_in_new_tab: item.open_in_new_tab,
    });
    setShowForm(true);
  };

  const handleSubmit = async () => {
    if (!form.label.trim() || !form.url.trim()) {
      toast.error('Label and URL are required');
      return;
    }
    setSaving(true);
    try {
      const payload = { ...form, location: selectedLocation, parent: form.parent || null };
      if (editingItem) {
        await api.put(`/cms/menus/${editingItem._id}`, payload);
        toast.success('Menu item updated!');
      } else {
        await api.post('/cms/menus', payload);
        toast.success('Menu item created!');
      }
      fetchMenus();
      resetForm();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to save menu item');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this menu item? Sub-items will also be deleted.')) return;
    try {
      await api.delete(`/cms/menus/${id}`);
      toast.success('Menu item deleted');
      fetchMenus();
    } catch {
      toast.error('Failed to delete');
    }
  };

  const handleToggle = async (id: string) => {
    try {
      await api.patch(`/cms/menus/${id}/toggle`);
      fetchMenus();
    } catch {
      toast.error('Failed to toggle');
    }
  };

  const getSubItems = (parentId: string) => menus.filter(m => {
    const p = m.parent;
    return p && (typeof p === 'string' ? p === parentId : (p as any)._id === parentId);
  });

  const topLevelItems = menus.filter(m => m.location === selectedLocation && !m.parent);
  const currentItems = menus.filter(m => m.location === selectedLocation && !m.parent);
  const inputClass = "w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-[#262626] bg-gray-50 dark:bg-[#262626] focus:outline-none focus:ring-2 focus:ring-[#F24C20]/20 transition-all";

  return (
    <div className="max-w-[1300px] mx-auto space-y-8 pb-16 px-6">
      {/* Breadcrumb & Header - Professional Alignment */}
      <div className="mt-4">
        <Breadcrumb
          items={[{ label: 'Content & Site', path: 'pages' }, { label: 'Menus' }]}
          onNavigate={onNavigate}
        />
      </div>

      <div className="flex items-center justify-between border-b border-gray-100 dark:border-[#262626] pb-6">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold text-[#044071] dark:text-white mb-1">Menus Management</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Organize header, footer, and dashboard navigation systems.</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          onClick={() => { setForm({ ...form, location: selectedLocation }); setShowForm(!showForm); }}
          className="bg-[#F24C20] hover:bg-[#d43a12] text-white px-6 py-2.5 rounded-xl font-semibold flex items-center gap-2 flex-shrink-0 shadow-lg shadow-[#F24C20]/10"
        >
          <Plus className="w-5 h-5" /> Add Menu Item
        </motion.button>
      </div>

      {/* Inline Form - Normalized */}
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
                <h2 className="text-lg font-bold text-[#044071] dark:text-white">{editingItem ? 'Edit Menu Identity' : 'New Menu Asset'}</h2>
                <p className="text-xs text-gray-500 mt-1">Configure your navigation item's label and routing path.</p>
              </div>
              <button onClick={resetForm} className="p-2 hover:bg-gray-100 dark:hover:bg-[#262626] rounded-full transition-colors">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-2 ml-1">Menu Label *</label>
                <input type="text" value={form.label} onChange={e => setForm({ ...form, label: e.target.value })}
                  placeholder="e.g. Services"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-2 ml-1">Target URL *</label>
                <input type="text" value={form.url} onChange={e => setForm({ ...form, url: e.target.value })}
                  placeholder="/services"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-2 ml-1">Hierarchy Parent (Optional)</label>
                <select value={form.parent} onChange={e => setForm({ ...form, parent: e.target.value })}
                  className={inputClass}
                >
                  <option value="">None (Top Level)</option>
                  {topLevelItems.map(item => (
                    <option key={item._id} value={item._id}>{item.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-2 ml-1">Sequence Order</label>
                <input type="number" value={form.order} onChange={e => setForm({ ...form, order: Number(e.target.value) })}
                  className={inputClass}
                />
              </div>
              <div className="flex items-center gap-3 md:col-span-2 py-2">
                <input type="checkbox" id="newTab" checked={form.open_in_new_tab}
                  onChange={e => setForm({ ...form, open_in_new_tab: e.target.checked })}
                  className="w-5 h-5 rounded border-gray-300 text-[#F24C20] focus:ring-[#F24C20]/20 cursor-pointer"
                />
                <label htmlFor="newTab" className="text-sm font-semibold text-gray-600 dark:text-gray-400 cursor-pointer">Open link in a new browser tab</label>
              </div>
            </div>
            <div className="flex gap-4 mt-8 pt-6 border-t border-gray-50 dark:border-[#262626]">
              <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                onClick={handleSubmit}
                disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 bg-[#F24C20] hover:bg-[#d43a12] disabled:opacity-60 text-white px-8 py-3.5 rounded-xl font-bold shadow-lg shadow-[#F24C20]/10 transition-all"
              >
                {saving ? 'Processing...' : <><CheckCircle className="w-5 h-5" /> {editingItem ? 'Commit Update' : 'Authorize Item'}</>}
              </motion.button>
              <button onClick={resetForm} className="px-10 py-3.5 rounded-xl border border-gray-200 dark:border-[#262626] hover:bg-gray-50 dark:hover:bg-gray-800 font-bold text-gray-500 transition-all">Cancel</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Location Tabs - Crisp & Professional */}
        <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl p-4 border border-gray-100 dark:border-[#262626] shadow-sm h-fit">
          <h2 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-4 ml-2 mt-2">Menu Zones</h2>
          <div className="space-y-2">
            {LOCATIONS.map(loc => {
              const count = menus.filter(m => m.location === loc.id).length;
              return (
                <button
                  key={loc.id}
                  onClick={() => setSelectedLocation(loc.id as any)}
                  className={`w-full text-left p-4 rounded-xl transition-all duration-300 ${selectedLocation === loc.id ? 'bg-[#044071] text-white shadow-lg' : 'bg-gray-50/50 dark:bg-[#262626] hover:bg-gray-100 dark:hover:bg-[#1a1a1a] text-gray-600 dark:text-gray-300'}`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-sm tracking-tight">{loc.name}</span>
                    <span className={`text-[10px] font-black px-2 py-1 rounded-md ${selectedLocation === loc.id ? 'bg-white/20' : 'bg-gray-200/50 dark:bg-[#1a1a1a]'}`}>{count}</span>
                  </div>
                  <p className={`text-[11px] ${selectedLocation === loc.id ? 'text-white/70' : 'text-gray-400 font-medium'}`}>{loc.description}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Menu Items List - Neatly Arranged */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl p-6 border border-gray-100 dark:border-[#262626] shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold text-[#044071] dark:text-white">
                  {LOCATIONS.find(l => l.id === selectedLocation)?.name} Structure
                </h2>
                <p className="text-xs text-gray-500 mt-1 font-medium">Drag-and-drop hierarchy for site-wide navigation.</p>
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="w-6 h-6 border-2 border-[#F24C20]/20 border-t-[#F24C20] rounded-full animate-spin" />
              </div>
            ) : menus.filter(m => m.location === selectedLocation && !m.parent).length === 0 ? (
              <div className="text-center py-20 bg-gray-50/30 rounded-2xl border border-dashed border-gray-100">
                <p className="text-sm font-semibold text-gray-400">This menu zone is currently empty.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {menus.filter(m => m.location === selectedLocation && !m.parent).sort((a, b) => a.order - b.order).map((item, index) => {
                  const subItems = getSubItems(item._id);
                  return (
                    <div key={item._id} className="space-y-2">
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`flex items-center gap-4 p-4 rounded-2xl border transition-all duration-300 ${item.is_active ? 'bg-white dark:bg-[#262626] border-gray-100 dark:border-[#333]' : 'bg-gray-50 dark:bg-[#1a1a1a] opacity-50 border-transparent'} hover:border-[#F24C20]/20 group shadow-sm`}
                      >
                        <GripVertical className="w-5 h-5 text-gray-300 cursor-move" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-gray-800 dark:text-gray-100 tracking-tight">{item.label}</span>
                            {subItems.length > 0 && (
                              <span className="text-[10px] bg-[#F24C20] text-white px-2 py-0.5 rounded-full font-black uppercase tracking-tighter">{subItems.length} Sub</span>
                            )}
                          </div>
                          <span className="text-[11px] text-gray-400 font-mono font-medium truncate block">{item.url}</span>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                          <button onClick={() => handleToggle(item._id)} className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest ${item.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>
                            {item.is_active ? 'Public' : 'Hidden'}
                          </button>
                          <button onClick={() => handleEdit(item)} className="p-2 hover:bg-[#044071]/10 rounded-xl transition-colors">
                            <Edit className="w-4 h-4 text-[#044071]" />
                          </button>
                          <button onClick={() => handleDelete(item._id)} className="p-2 hover:bg-red-50 rounded-xl transition-colors">
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </button>
                        </div>
                      </motion.div>
                      
                      {/* Sub-menu Refinement */}
                      {subItems.length > 0 && (
                        <div className="ml-10 space-y-2 border-l-2 border-gray-50 pl-4 py-1">
                          {subItems.sort((a, b) => a.order - b.order).map(sub => (
                            <div key={sub._id} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50/50 dark:bg-[#1a1a1a] border border-transparent hover:border-[#F24C20]/10 hover:bg-white transition-all group">
                              <ChevronDown className="w-4 h-4 text-gray-300 -rotate-90" />
                              <div className="flex-1">
                                <span className="font-semibold text-sm text-gray-700 dark:text-gray-200">{sub.label}</span>
                                <p className="text-[10px] text-gray-400 font-mono">{sub.url}</p>
                              </div>
                              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => handleEdit(sub)} className="p-1.5 hover:bg-blue-50 rounded-lg text-[#044071]"><Edit className="w-3.5 h-3.5" /></button>
                                <button onClick={() => handleDelete(sub._id)} className="p-1.5 hover:bg-red-50 rounded-lg text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

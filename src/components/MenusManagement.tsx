import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, GripVertical, CheckCircle, ChevronDown, X } from 'lucide-react';
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

  const currentItems = menus.filter(m => m.location === selectedLocation && !m.parent);
  const getSubItems = (parentId: string) => menus.filter(m => {
    const p = m.parent;
    return p && (typeof p === 'string' ? p === parentId : (p as any)._id === parentId);
  });

  const topLevelItems = menus.filter(m => m.location === selectedLocation && !m.parent);

  return (
    <div>
      <Breadcrumb
        items={[{ label: 'Content & Site', path: 'pages' }, { label: 'Menus' }]}
        onNavigate={onNavigate}
      />

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-[#044071] dark:text-white mb-2">Menu Management</h1>
          <p className="text-gray-600 dark:text-gray-400">Organize and manage site navigation menus</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          onClick={() => { setForm({ ...form, location: selectedLocation }); setShowForm(!showForm); }}
          className="bg-[#F24C20] hover:bg-[#d43a12] text-white px-6 py-3 rounded-xl font-medium flex items-center gap-2"
        >
          <Plus className="w-5 h-5" /> Add Menu Item
        </motion.button>
      </div>

      {/* Inline Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white dark:bg-[#1a1a1a] rounded-2xl border border-[#F24C20]/30 p-6 mb-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">{editingItem ? 'Edit Item' : 'New Menu Item'}</h2>
              <button onClick={resetForm}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Label *</label>
                <input type="text" value={form.label} onChange={e => setForm({ ...form, label: e.target.value })}
                  placeholder="e.g. About Us"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-[#262626] bg-gray-50 dark:bg-[#262626] focus:outline-none focus:ring-2 focus:ring-[#F24C20]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">URL *</label>
                <input type="text" value={form.url} onChange={e => setForm({ ...form, url: e.target.value })}
                  placeholder="/about"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-[#262626] bg-gray-50 dark:bg-[#262626] focus:outline-none focus:ring-2 focus:ring-[#F24C20]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Parent Item (optional)</label>
                <select value={form.parent} onChange={e => setForm({ ...form, parent: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-[#262626] bg-gray-50 dark:bg-[#262626] focus:outline-none focus:ring-2 focus:ring-[#F24C20]"
                >
                  <option value="">None (Top Level)</option>
                  {topLevelItems.map(item => (
                    <option key={item._id} value={item._id}>{item.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Sort Order</label>
                <input type="number" value={form.order} onChange={e => setForm({ ...form, order: Number(e.target.value) })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-[#262626] bg-gray-50 dark:bg-[#262626] focus:outline-none focus:ring-2 focus:ring-[#F24C20]"
                />
              </div>
              <div className="flex items-center gap-2 col-span-2">
                <input type="checkbox" id="newTab" checked={form.open_in_new_tab}
                  onChange={e => setForm({ ...form, open_in_new_tab: e.target.checked })}
                  className="w-4 h-4 rounded text-[#F24C20]"
                />
                <label htmlFor="newTab" className="text-sm">Open in new tab</label>
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={handleSubmit}
                disabled={saving}
                className="flex items-center gap-2 bg-[#F24C20] hover:bg-[#d43a12] disabled:opacity-60 text-white px-6 py-2.5 rounded-xl font-medium"
              >
                <CheckCircle className="w-4 h-4" />
                {saving ? 'Saving...' : editingItem ? 'Update Item' : 'Add Item'}
              </motion.button>
              <button onClick={resetForm} className="px-6 py-2.5 rounded-xl border border-gray-300 dark:border-[#262626] hover:bg-gray-50 dark:hover:bg-[#262626]">Cancel</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Location Tabs */}
        <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl p-6 border border-gray-200 dark:border-[#262626]">
          <h2 className="text-lg font-bold text-[#044071] dark:text-white mb-4">Menu Locations</h2>
          <div className="space-y-2">
            {LOCATIONS.map(loc => {
              const count = menus.filter(m => m.location === loc.id).length;
              return (
                <button
                  key={loc.id}
                  onClick={() => setSelectedLocation(loc.id as any)}
                  className={`w-full text-left p-4 rounded-xl transition-colors ${selectedLocation === loc.id ? 'bg-[#F24C20] text-white' : 'bg-gray-50 dark:bg-[#262626] hover:bg-gray-100 dark:hover:bg-[#1a1a1a]'}`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold">{loc.name}</span>
                    <span className={`text-xs px-2 py-1 rounded-full ${selectedLocation === loc.id ? 'bg-white/20' : 'bg-gray-200 dark:bg-[#1a1a1a]'}`}>{count} items</span>
                  </div>
                  <p className={`text-sm ${selectedLocation === loc.id ? 'text-white/80' : 'text-gray-500'}`}>{loc.description}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Menu Items */}
        <div className="lg:col-span-2 bg-white dark:bg-[#1a1a1a] rounded-2xl p-6 border border-gray-200 dark:border-[#262626]">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-[#044071] dark:text-white">
                {LOCATIONS.find(l => l.id === selectedLocation)?.name}
              </h2>
              <p className="text-sm text-gray-500">Click to edit • Toggle to show/hide</p>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-8 text-gray-400">Loading...</div>
          ) : currentItems.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p>No menu items yet. Click "Add Menu Item" to create one.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {currentItems.sort((a, b) => a.order - b.order).map((item, index) => {
                const subItems = getSubItems(item._id);
                return (
                  <div key={item._id}>
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`flex items-center gap-3 p-4 rounded-xl ${item.is_active ? 'bg-gray-50 dark:bg-[#262626]' : 'bg-gray-50/50 dark:bg-[#1a1a1a] opacity-60'} hover:bg-gray-100 dark:hover:bg-[#262626] transition-colors group`}
                    >
                      <GripVertical className="w-5 h-5 text-gray-400 cursor-move" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{item.label}</span>
                          {subItems.length > 0 && (
                            <span className="text-xs bg-[#F24C20] text-white px-2 py-0.5 rounded-full">{subItems.length} sub</span>
                          )}
                          {!item.is_active && <span className="text-xs bg-gray-200 dark:bg-gray-700 text-gray-500 px-2 py-0.5 rounded-full">Hidden</span>}
                          {item.open_in_new_tab && <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">New Tab</span>}
                        </div>
                        <span className="text-sm text-gray-500 font-mono">{item.url}</span>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleToggle(item._id)} className={`p-2 rounded-lg text-xs font-medium px-3 ${item.is_active ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}>
                          {item.is_active ? 'Shown' : 'Hidden'}
                        </button>
                        <button onClick={() => handleEdit(item)} className="p-2 hover:bg-[#F24C20]/10 rounded-lg">
                          <Edit className="w-4 h-4 text-[#044071]" />
                        </button>
                        <button onClick={() => handleDelete(item._id)} className="p-2 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg">
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </button>
                      </div>
                    </motion.div>
                    {subItems.length > 0 && (
                      <div className="ml-8 mt-1 space-y-1">
                        {subItems.sort((a, b) => a.order - b.order).map(sub => (
                          <div key={sub._id} className="flex items-center gap-3 p-3 rounded-lg bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#262626] hover:border-[#F24C20] transition-colors group">
                            <ChevronDown className="w-4 h-4 text-gray-400 -rotate-90" />
                            <div className="flex-1">
                              <span className="font-medium text-sm">{sub.label}</span>
                              <p className="text-xs text-gray-500 font-mono">{sub.url}</p>
                            </div>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => handleEdit(sub)} className="p-1.5 hover:bg-[#F24C20]/10 rounded"><Edit className="w-3.5 h-3.5 text-[#044071]" /></button>
                              <button onClick={() => handleDelete(sub._id)} className="p-1.5 hover:bg-red-100 rounded"><Trash2 className="w-3.5 h-3.5 text-red-500" /></button>
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
  );
}

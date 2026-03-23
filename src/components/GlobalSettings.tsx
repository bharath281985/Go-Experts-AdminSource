import { motion } from 'motion/react';
import { useState, useEffect } from 'react';
import { Save, Globe, Mail, Shield, Loader2, Coins, Link, Search, Trash2, BarChart3 } from 'lucide-react';
import { useSiteSettings } from '../context/SiteSettingsContext';
import { toast } from 'sonner';
import { Breadcrumb } from './Breadcrumb';
import api from '../lib/api';

interface GlobalSettingsProps {
  onNavigate: (page: string) => void;
}

type Settings = {
  site_name: string;
  site_tagline: string;
  site_logo: string;
  contact_email: string;
  contact_phone: string;
  contact_address: string;
  meta_title: string;
  meta_description: string;
  meta_keywords: string;
  social_facebook: string;
  social_twitter: string;
  social_linkedin: string;
  social_instagram: string;
  social_github: string;
  social_youtube: string;
  footer_copyright: string;
  commission_rate: number;
  currency: string;
  timezone: string;
  maintenance_mode: boolean;
  points_per_rupee: number;
  points_signup_bonus: number;
  home_stats: { label: string; value: number; suffix: string; icon: string }[];
  trust_badges: string[];
};

const defaultSettings: Settings = {
  site_name: 'Go Experts', site_tagline: '', site_logo: '',
  contact_email: '', contact_phone: '', contact_address: '',
  meta_title: '', meta_description: '', meta_keywords: '',
  social_facebook: '', social_twitter: '', social_linkedin: '', social_instagram: '',
  social_github: '', social_youtube: '',
  footer_copyright: '© 2026 Go Experts. All rights reserved.',
  commission_rate: 10, currency: 'INR', timezone: 'Asia/Kolkata',
  maintenance_mode: false, points_per_rupee: 1, points_signup_bonus: 100,
  home_stats: [],
  trust_badges: [],
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">{label}</label>
      {children}
    </div>
  );
}

const inputCls = "w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-[#262626] bg-transparent focus:outline-none focus:ring-2 focus:ring-[#F24C20] text-sm";
const selectCls = inputCls;

export function GlobalSettings({ onNavigate }: GlobalSettingsProps) {
  const { settings: currentSettings, refreshSettings } = useSiteSettings();
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchSettings(); }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await api.get('/cms/settings');
      if (res.data.success) setSettings({ ...defaultSettings, ...res.data.settings });
    } catch {
      toast.error('Failed to load site settings');
    } finally {
      setLoading(false);
    }
  };

  const set = (key: keyof Settings, val: any) => setSettings(p => ({ ...p, [key]: val }));

  const handleSave = async () => {
    try {
      setSaving(true);
      const res = await api.put('/cms/settings', settings);
      if (res.data.success) {
        toast.success('Site settings saved successfully!');
        setSettings({ ...defaultSettings, ...res.data.settings });
        refreshSettings();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const SectionTitle = ({ icon: Icon, title, color = '#F24C20' }: any) => (
    <div className="flex items-center gap-3 mb-5 pb-3 border-b border-gray-100 dark:border-gray-700">
      <div className="p-2.5 rounded-xl" style={{ backgroundColor: `${color}18` }}>
        <Icon className="w-5 h-5" style={{ color }} />
      </div>
      <h2 className="text-lg font-bold text-gray-900 dark:text-white">{title}</h2>
    </div>
  );

  const Toggle = ({ field, label }: { field: keyof Settings; label: string }) => (
    <div className="flex items-center justify-between py-2.5">
      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
      <button
        onClick={() => set(field, !settings[field])}
        className={`relative w-11 h-6 rounded-full transition-colors ${settings[field] ? 'bg-[#F24C20]' : 'bg-gray-300 dark:bg-gray-600'}`}
      >
        <motion.div animate={{ x: settings[field] ? 22 : 2 }} className="absolute top-1 w-4 h-4 bg-white rounded-full shadow" />
      </button>
    </div>
  );

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-64">
      <Loader2 className="w-8 h-8 text-[#F24C20] animate-spin mb-3" />
      <p className="text-gray-500">Loading site settings...</p>
    </div>
  );

  return (
    <div>
      <Breadcrumb items={[{ label: 'Site Management', path: 'pages' }, { label: 'Global Settings' }]} onNavigate={onNavigate} />

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">Global Settings</h1>
          <p className="text-gray-500 text-sm">All changes are saved to the database</p>
        </div>
        <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} onClick={handleSave} disabled={saving}
          className="bg-[#F24C20] hover:bg-[#d43a12] text-white px-6 py-3 rounded-xl font-medium flex items-center gap-2 disabled:opacity-60">
          {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : <><Save className="w-5 h-5" /> Save Changes</>}
        </motion.button>
      </div>

      <div className="space-y-6">
        {/* Row 1: Branding + Platform Config */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* General / Brand */}
          <div className="lg:col-span-2 bg-white dark:bg-[#1a1a1a] rounded-2xl p-6 border border-gray-200 dark:border-[#262626]">
            <SectionTitle icon={Globe} title="Branding & Contact" />
            <div className="grid grid-cols-2 gap-4">
              <Field label="Site Name">
                <input className={inputCls} value={settings.site_name} onChange={e => set('site_name', e.target.value)} />
              </Field>
              <Field label="Tagline">
                <input className={inputCls} value={settings.site_tagline} onChange={e => set('site_tagline', e.target.value)} placeholder="Find the best freelancers" />
              </Field>
              <Field label="Site Logo Path (e.g. /logo.png)">
                <input className={inputCls} value={settings.site_logo} onChange={e => set('site_logo', e.target.value)} />
              </Field>
              <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-[#262626] rounded-xl border border-gray-100 dark:border-[#333]">
                <div className="text-xs text-gray-500 mb-1 block w-full">Logo Preview:</div>
                {settings.site_logo ? (
                  <img src={settings.site_logo.startsWith('http') ? settings.site_logo : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${settings.site_logo}`} alt="Preview" className="h-8 w-auto brightness-0 invert" />
                ) : (
                  <span className="text-xs text-gray-400 italic">No logo set</span>
                )}
              </div>
              <Field label="Contact Email">
                <input className={inputCls} type="email" value={settings.contact_email} onChange={e => set('contact_email', e.target.value)} />
              </Field>
              <Field label="Contact Phone">
                <input className={inputCls} value={settings.contact_phone} onChange={e => set('contact_phone', e.target.value)} />
              </Field>
              <div className="col-span-2">
                <Field label="Contact Address">
                  <input className={inputCls} value={settings.contact_address} onChange={e => set('contact_address', e.target.value)} />
                </Field>
              </div>
            </div>
          </div>

          {/* Platform Config */}
          <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl p-6 border border-gray-200 dark:border-[#262626]">
            <SectionTitle icon={Shield} title="Platform" color="#044071" />
            <div className="space-y-4">
              <Field label="Currency">
                <select className={selectCls} value={settings.currency} onChange={e => set('currency', e.target.value)}>
                  <option>INR</option><option>USD</option><option>EUR</option><option>GBP</option>
                </select>
              </Field>
              <Field label="Timezone">
                <select className={selectCls} value={settings.timezone} onChange={e => set('timezone', e.target.value)}>
                  <option>Asia/Kolkata</option><option>America/New_York</option><option>Europe/London</option><option>Asia/Dubai</option>
                </select>
              </Field>
              <Field label="Commission Rate (%)">
                <input className={inputCls} type="number" min={0} max={100} value={settings.commission_rate} onChange={e => set('commission_rate', Number(e.target.value))} />
              </Field>
              <Toggle field="maintenance_mode" label="Maintenance Mode" />
            </div>
          </div>
        </div>

        {/* Row 2: SEO + Points + Social */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* SEO */}
          <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl p-6 border border-gray-200 dark:border-[#262626]">
            <SectionTitle icon={Search} title="SEO" color="#7c3aed" />
            <div className="space-y-4">
              <Field label="Meta Title">
                <input className={inputCls} value={settings.meta_title} onChange={e => set('meta_title', e.target.value)} placeholder="Go Experts – Freelancer Platform" />
              </Field>
              <Field label="Meta Description">
                <textarea className={inputCls + ' resize-none'} rows={3} value={settings.meta_description} onChange={e => set('meta_description', e.target.value)} placeholder="Short description for search engines..." />
              </Field>
              <Field label="Meta Keywords">
                <input className={inputCls} value={settings.meta_keywords} onChange={e => set('meta_keywords', e.target.value)} placeholder="freelance, hire, experts" />
              </Field>
            </div>
          </div>

          {/* Points System */}
          <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl p-6 border border-gray-200 dark:border-[#262626]">
            <SectionTitle icon={Coins} title="Points System" color="#d97706" />
            <div className="space-y-4">
              <Field label="Points per ₹1 Spent">
                <input className={inputCls} type="number" min={0} value={settings.points_per_rupee} onChange={e => set('points_per_rupee', Number(e.target.value))} />
              </Field>
              <Field label="Signup Bonus Points">
                <input className={inputCls} type="number" min={0} value={settings.points_signup_bonus} onChange={e => set('points_signup_bonus', Number(e.target.value))} />
              </Field>
              <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
                <p className="text-xs text-amber-700 dark:text-amber-400">New users will receive <strong>{settings.points_signup_bonus}</strong> bonus points on signup. Every ₹1 spent earns <strong>{settings.points_per_rupee}</strong> point(s).</p>
              </div>
            </div>
          </div>

          {/* Social Links */}
          <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl p-6 border border-gray-200 dark:border-[#262626]">
            <SectionTitle icon={Link} title="Social Links" color="#0ea5e9" />
            <div className="space-y-4">
              <Field label="Facebook URL">
                <input className={inputCls} type="url" value={settings.social_facebook} onChange={e => set('social_facebook', e.target.value)} placeholder="https://facebook.com/..." />
              </Field>
              <Field label="Twitter / X URL">
                <input className={inputCls} type="url" value={settings.social_twitter} onChange={e => set('social_twitter', e.target.value)} placeholder="https://twitter.com/..." />
              </Field>
              <Field label="LinkedIn URL">
                <input className={inputCls} type="url" value={settings.social_linkedin} onChange={e => set('social_linkedin', e.target.value)} placeholder="https://linkedin.com/..." />
              </Field>
              <Field label="Instagram URL">
                <input className={inputCls} type="url" value={settings.social_instagram} onChange={e => set('social_instagram', e.target.value)} placeholder="https://instagram.com/..." />
              </Field>
              <Field label="GitHub URL">
                <input className={inputCls} type="url" value={settings.social_github} onChange={e => set('social_github', e.target.value)} placeholder="https://github.com/..." />
              </Field>
              <Field label="YouTube URL">
                <input className={inputCls} type="url" value={settings.social_youtube} onChange={e => set('social_youtube', e.target.value)} placeholder="https://youtube.com/..." />
              </Field>
              <Field label="Footer Copyright Text">
                <input className={inputCls} value={settings.footer_copyright} onChange={e => set('footer_copyright', e.target.value)} />
              </Field>
            </div>
          </div>
        </div>

        {/* Row 3: Homepage Specifics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Homepage Stats */}
          <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl p-6 border border-gray-200 dark:border-[#262626]">
            <SectionTitle icon={BarChart3} title="Homepage Stats" color="#10b981" />
            <div className="space-y-4">
              <div className="grid grid-cols-4 gap-2 text-xs font-bold text-gray-500 mb-1">
                <div className="col-span-1">Label</div>
                <div>Value</div>
                <div>Suffix</div>
                <div className="text-right">Action</div>
              </div>
              {settings.home_stats.map((stat, idx) => (
                <div key={idx} className="grid grid-cols-4 gap-2 items-center">
                  <input className={inputCls} value={stat.label} onChange={e => {
                    const newStats = [...settings.home_stats];
                    newStats[idx].label = e.target.value;
                    set('home_stats', newStats);
                  }} placeholder="Label" />
                  <input className={inputCls} type="number" value={stat.value} onChange={e => {
                    const newStats = [...settings.home_stats];
                    newStats[idx].value = Number(e.target.value);
                    set('home_stats', newStats);
                  }} placeholder="Value" />
                  <input className={inputCls} value={stat.suffix} onChange={e => {
                    const newStats = [...settings.home_stats];
                    newStats[idx].suffix = e.target.value;
                    set('home_stats', newStats);
                  }} placeholder="+" />
                  <div className="flex justify-end">
                    <button onClick={() => {
                       const newStats = settings.home_stats.filter((_, i) => i !== idx);
                       set('home_stats', newStats);
                    }} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
              <button 
                onClick={() => set('home_stats', [...settings.home_stats, { label: '', value: 0, suffix: '+', icon: 'CheckIcon' }])}
                className="w-full py-2 border-2 border-dashed border-gray-200 dark:border-[#262626] rounded-xl text-sm text-gray-500 hover:border-[#F24C20] hover:text-[#F24C20] transition-all"
              >
                + Add Stat Counter
              </button>
            </div>
          </div>

          {/* Trust Badges */}
          <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl p-6 border border-gray-200 dark:border-[#262626]">
            <SectionTitle icon={Shield} title="Trust Badges (Partners)" color="#6366f1" />
            <div className="space-y-3">
              <div className="flex gap-2">
                <input 
                  id="new-badge"
                  className={inputCls} 
                  placeholder="Partner Name (e.g. Forbes)" 
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      const val = (e.target as HTMLInputElement).value;
                      if (val) {
                        set('trust_badges', [...settings.trust_badges, val]);
                        (e.target as HTMLInputElement).value = '';
                      }
                    }
                  }}
                />
                <button 
                  onClick={() => {
                    const input = document.getElementById('new-badge') as HTMLInputElement;
                    if (input.value) {
                      set('trust_badges', [...settings.trust_badges, input.value]);
                      input.value = '';
                    }
                  }}
                  className="bg-[#F24C20] text-white px-4 py-2 rounded-xl text-sm font-bold"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2 pt-2">
                {settings.trust_badges.map((badge, idx) => (
                  <div key={idx} className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-[#262626] rounded-full text-sm">
                    <span>{badge}</span>
                    <button onClick={() => set('trust_badges', settings.trust_badges.filter((_, i) => i !== idx))}>
                      <Trash2 className="w-3.5 h-3.5 text-red-500" />
                    </button>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-400">These will appear in the "Trusted By" section on the homepage.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

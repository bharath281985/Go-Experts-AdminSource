import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft,
  Crown,
  Calendar,
  IndianRupee,
  ListCheck,
  Save,
  Users,
  Loader2,
  Eye,
  Plus,
  Minus,
  Star,
  Rocket,
  Shield,
  Briefcase,
  LayoutDashboard,
  MessageCircle,
  Database,
  Type
} from 'lucide-react';
import { toast } from 'sonner';
import api from '../lib/api';

interface EditSubscriptionPlanProps {
  planId: string;
  onBack: () => void;
}

const inputCls = "w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-[#262626] bg-gray-50/50 dark:bg-[#262626]/50 focus:bg-white dark:focus:bg-[#262626] focus:outline-none focus:ring-4 focus:ring-[#F24C20]/10 focus:border-[#F24C20] text-sm transition-all text-gray-900 dark:text-white placeholder:text-gray-400";
const selectCls = "w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-[#262626] bg-gray-50/50 dark:bg-[#262626]/50 focus:bg-white dark:focus:bg-[#262626] focus:outline-none focus:ring-4 focus:ring-[#F24C20]/10 focus:border-[#F24C20] text-sm transition-all text-gray-900 dark:text-white cursor-pointer";

function Field({ label, icon: Icon, children }: { label: string; icon?: any; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <label className="flex items-center gap-2 text-[11px] font-black text-gray-400 uppercase tracking-widest ml-0.5">
        {Icon && <Icon className="w-3.5 h-3.5 text-[#F24C20]" />}
        {label}
      </label>
      {children}
    </div>
  );
}

export function EditSubscriptionPlan({ planId, onBack }: EditSubscriptionPlanProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [plan, setPlan] = useState<any>(null);
  const [features, setFeatures] = useState<string[]>(['']);
  const [isPaid, setIsPaid] = useState(true);

  useEffect(() => {
    fetchPlanDetails();
  }, [planId]);

  const fetchPlanDetails = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/subscription-plans/${planId}`);
      if (res.data.success) {
        const p = res.data.data;
        setPlan(p);
        setFeatures(p.features && p.features.length > 0 ? p.features : ['']);
        setIsPaid(p.price > 0);
      }
    } catch (err: any) {
      toast.error('Failed to fetch plan details');
      onBack();
    } finally {
      setLoading(false);
    }
  };

  const addFeature = () => setFeatures([...features, '']);
  const removeFeature = (index: number) => {
    if (features.length > 1) {
      setFeatures(features.filter((_, i) => i !== index));
    }
  };
  const updateFeature = (index: number, val: string) => {
    const newFeatures = [...features];
    newFeatures[index] = val;
    setFeatures(newFeatures);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    const formData = new FormData(e.currentTarget);
    const data: any = {
      name: formData.get('name'),
      price: isPaid ? Number(formData.get('price')) : 0,
      duration_days: Number(formData.get('duration_days')),
      project_post_limit: Number(formData.get('project_post_limit')),
      task_post_limit: Number(formData.get('task_post_limit')),
      chat_limit: Number(formData.get('chat_limit')),
      database_access_limit: Number(formData.get('database_access_limit')),
      project_visit_limit: Number(formData.get('project_visit_limit')),
      portfolio_visit_limit: Number(formData.get('portfolio_visit_limit')),
      interest_click_limit: Number(formData.get('interest_click_limit')),
      billing_cycle: formData.get('billing_cycle'),
      target_role: formData.get('target_role'),
      badge: formData.get('badge'),
      cta: formData.get('cta'),
      description: formData.get('description'),
      featured: formData.get('featured') === 'on',
      group: formData.get('group'),
      icon: formData.get('icon'),
      color_theme: formData.get('color_theme'),
      features: features.filter(f => f.trim())
    };

    try {
      const res = await api.put(`/subscription-plans/${planId}`, data);
      if (res.data.success) {
        toast.success('Subscription plan updated successfully');
        onBack();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update subscription plan');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-[#F24C20] mb-4" />
        <p className="text-gray-500 font-medium">Loading plan data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={onBack}
            className="p-2.5 bg-white dark:bg-[#1a1a1a] border border-gray-100 dark:border-[#262626] rounded-xl shadow-sm">
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </motion.button>
          <div>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight italic uppercase">Edit {plan?.name}</h1>
            <p className="text-gray-500 text-sm font-medium">Update the parameters for this subscription tier</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-[#1a1a1a] rounded-[32px] border border-gray-200 dark:border-[#262626] overflow-hidden shadow-sm">
            
            <form onSubmit={handleSubmit} className="p-8 space-y-8">
              {/* Row 1: Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Field label="Plan Name" icon={Type}>
                  <input name="name" required defaultValue={plan?.name} placeholder="e.g. Pro Client" className={inputCls} />
                </Field>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <Field label="Plan Type">
                        <div className="flex bg-gray-50 dark:bg-black/20 p-1 rounded-xl border border-gray-100 dark:border-[#262626]">
                            <button type="button" onClick={() => setIsPaid(false)} className={`flex-1 py-2 text-xs font-black uppercase tracking-widest rounded-lg transition-all ${!isPaid ? 'bg-white dark:bg-[#262626] text-[#F24C20] shadow-sm' : 'text-gray-400'}`}>Free</button>
                            <button type="button" onClick={() => setIsPaid(true)} className={`flex-1 py-2 text-xs font-black uppercase tracking-widest rounded-lg transition-all ${isPaid ? 'bg-[#F24C20] text-white shadow-lg shadow-[#F24C20]/20' : 'text-gray-400'}`}>Paid</button>
                        </div>
                    </Field>
                  </div>
                  <div className="flex-1">
                    <Field label="Icon Name" icon={Star}>
                      <input name="icon" defaultValue={plan?.icon || 'Star'} className={inputCls} />
                    </Field>
                  </div>
                </div>
              </div>

              {/* Row 2: Roles & Groups */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <Field label="Target Role" icon={Users}>
                   <select name="target_role" defaultValue={plan?.target_role} className={selectCls}>
                      <option value="client">Client</option>
                      <option value="freelancer">Freelancer</option>
                      <option value="investor">Investor</option>
                      <option value="startup_creator">Startup Creator</option>
                      <option value="both">Both (Combo)</option>
                   </select>
                 </Field>
                 <Field label="Category Group" icon={Rocket}>
                    <select name="group" defaultValue={plan?.group} className={selectCls}>
                       <option>Freelancer Plans</option>
                       <option>Client Plans</option>
                       <option>Start-Up Idea Creator Plans</option>
                       <option>Investor Plans</option>
                       <option>Combo Plan</option>
                    </select>
                 </Field>
              </div>

              {/* Row 3: Limits & Pricing */}
              <div className="p-6 bg-gray-50/50 dark:bg-[#111] rounded-[24px] border border-gray-100 dark:border-[#262626] space-y-6">
                 <div className="flex items-center gap-3 pb-4 border-b border-gray-100 dark:border-[#262626]">
                    <div className="p-2 bg-[#F24C20]/10 rounded-lg"><IndianRupee className="w-4 h-4 text-[#F24C20]" /></div>
                    <h3 className="font-black text-xs uppercase tracking-[0.2em] text-gray-500">Pricing & Core Limits</h3>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Field label="Price (₹)">
                        <input name="price" type="number" disabled={!isPaid} required={isPaid} defaultValue={plan?.price} className={inputCls + ( !isPaid ? ' opacity-50' : '')} />
                    </Field>
                    <Field label="Validity (Days)">
                        <input name="duration_days" type="number" defaultValue={plan?.duration_days} className={inputCls} />
                    </Field>
                    <Field label="Billing Cycle">
                        <select name="billing_cycle" defaultValue={plan?.billing_cycle} className={selectCls}>
                            <option value="yearly">Yearly</option>
                            <option value="monthly">Monthly</option>
                            <option value="one-time">One-time</option>
                        </select>
                    </Field>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
                    <Field label="Project Posts" icon={Briefcase}>
                       <input name="project_post_limit" type="number" defaultValue={plan?.project_post_limit} className={inputCls} />
                       <p className="text-[10px] text-gray-400 mt-1 italic">Large high-value job milestones.</p>
                    </Field>
                    <Field label="Task Posts" icon={LayoutDashboard}>
                       <input name="task_post_limit" type="number" defaultValue={plan?.task_post_limit} className={inputCls} />
                       <p className="text-[10px] text-gray-400 mt-1 italic">Short-term/Fast gigs.</p>
                    </Field>
                    <Field label="Chat Allowed" icon={MessageCircle}>
                       <input name="chat_limit" type="number" defaultValue={plan?.chat_limit} className={inputCls} />
                    </Field>
                 </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <Field label="DB Access Hits" icon={Database}>
                        <input name="database_access_limit" type="number" defaultValue={plan?.database_access_limit} className={inputCls} />
                        <p className="text-[10px] text-gray-400 mt-1 italic">Limits for searching/viewing verified experts from the library.</p>
                     </Field>
                     <Field label="Interest Clicks" icon={Rocket}>
                        <input name="interest_click_limit" type="number" defaultValue={plan?.interest_click_limit} className={inputCls} />
                     </Field>
                  </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <Field label="Badge (e.g. Popular, Gold)" icon={Crown}>
                    <input name="badge" defaultValue={plan?.badge} placeholder="Gold Badge" className={inputCls} />
                 </Field>
                 <Field label="Theme Color" icon={Star}>
                    <select name="color_theme" defaultValue={plan?.color_theme || 'orange'} className={selectCls}>
                       <option value="orange">Standard Orange</option>
                       <option value="green">Basic Green</option>
                       <option value="blue">Pro Blue</option>
                       <option value="gold">Premium Gold</option>
                    </select>
                 </Field>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <Field label="Button Text (CTA)">
                    <input name="cta" defaultValue={plan?.cta} className={inputCls} />
                 </Field>
                 <Field label="Description (Small Line)">
                    <input name="description" defaultValue={plan?.description} placeholder="Everything you need to hire at scale." className={inputCls} />
                 </Field>
              </div>

              {/* Row 5: Dynamic Features */}
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2">
                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Available Features (Marketing List)</label>
                    <button type="button" onClick={addFeature} className="text-[#F24C20] hover:bg-[#F24C20]/10 px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5">
                        <Plus className="w-3.5 h-3.5" /> Add Row
                    </button>
                </div>
                <div className="grid grid-cols-1 gap-3">
                    <AnimatePresence mode="popLayout">
                        {features.map((feature, idx) => (
                           <motion.div key={idx} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="flex gap-2">
                              <input value={feature} onChange={(e) => updateFeature(idx, e.target.value)} placeholder="e.g. Priority Support" className={inputCls} />
                              <button type="button" onClick={() => removeFeature(idx)} className="p-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl border border-gray-100 dark:border-[#262626]">
                                <Minus className="w-4 h-4" />
                              </button>
                              {idx === features.length - 1 && (
                                <button type="button" onClick={addFeature} className="p-3 text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-xl border border-emerald-500/10">
                                    <Plus className="w-4 h-4" />
                                </button>
                              )}
                           </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
              </div>

              <div className="flex items-center gap-4 p-5 bg-[#F24C20]/5 rounded-2xl border border-[#F24C20]/10">
                <input type="checkbox" name="featured" id="feat" defaultChecked={plan?.featured} className="w-6 h-6 accent-[#F24C20] rounded-lg cursor-pointer" />
                <div>
                   <label htmlFor="feat" className="block text-sm font-black text-gray-900 dark:text-white cursor-pointer select-none italic uppercase">Feature Plan (Orange Glow)</label>
                   <p className="text-xs text-gray-500">Highlighted as the "Recommended" choice on the website</p>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                 <button type="button" onClick={onBack} className="flex-1 py-4 bg-gray-50 dark:bg-[#1a1a1a] border border-gray-100 dark:border-[#262626] rounded-2xl font-bold hover:bg-gray-100 transition-all">Cancel</button>
                 <button type="submit" disabled={saving} className="flex-[2] py-4 bg-[#F24C20] text-white rounded-2xl font-black uppercase tracking-widest hover:bg-[#d4431b] transition-all shadow-xl shadow-[#F24C20]/20 flex items-center justify-center gap-2 disabled:opacity-50">
                    {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />} Save Changes
                 </button>
              </div>
            </form>
          </motion.div>
        </div>

        {/* Info Column */}
        <div className="space-y-6">
           <div className="bg-[#044071] rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110" />
              <h3 className="text-xl font-black italic uppercase tracking-tighter mb-6 relative">Sync Details</h3>
              <p className="text-blue-100/70 text-sm leading-relaxed mb-6">Editing this plan will update it for all future subscribers. Existing users will keep their current benefits until renewal.</p>
              <div className="space-y-4">
                 <div className="flex items-center gap-3 p-3 bg-white/5 rounded-2xl border border-white/10">
                    <Eye className="w-4 h-4 text-orange-400" />
                    <span className="text-xs font-bold uppercase tracking-widest">Real-time update enabled</span>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}

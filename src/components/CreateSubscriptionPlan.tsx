import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft,
  Crown,
  Calendar,
  IndianRupee,
  ListCheck,
  Save,
  Users,
  Eye,
  Star,
  Rocket,
  Shield,
  Plus,
  Minus,
  Briefcase,
  LayoutDashboard,
  MessageCircle,
  Database,
  Type
} from 'lucide-react';
import { toast } from 'sonner';
import api from '../lib/api';

interface CreateSubscriptionPlanProps {
  onBack: () => void;
  onNavigate: (page: string) => void;
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

function MultiSelectDropdown({ options, selected, onChange, placeholder, maxSelections }: { options: { value: string, label: string }[], selected: string[], onChange: (val: string[]) => void, placeholder: string, maxSelections?: number }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggle = (val: string) => {
    if (selected.includes(val)) {
      if (selected.length > 1) onChange(selected.filter(v => v !== val));
    } else {
      const next = maxSelections === 1 ? [val] : [...selected, val];
      onChange(next);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-[#262626] bg-gray-50/50 dark:bg-[#262626]/50 focus-within:ring-4 focus-within:ring-[#F24C20]/10 focus-within:border-[#F24C20] cursor-pointer flex justify-between items-center text-sm text-gray-900 dark:text-white transition-all shadow-sm"
      >
        <span className="truncate pr-4 font-medium">
          {selected.length > 0
            ? selected.map(s => options.find(o => o.value === s)?.label).join(', ')
            : placeholder}
        </span>
        <svg className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-50 w-full mt-2 bg-white dark:bg-[#262626] border border-gray-200 dark:border-[#333] rounded-xl shadow-2xl max-h-60 overflow-y-auto"
          >
            {options.map(opt => (
              <div
                key={opt.value}
                onClick={() => toggle(opt.value)}
                className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-[#333] cursor-pointer transition-colors border-b border-gray-100 dark:border-[#333]/50 last:border-0"
              >
                <div className={`w-5 h-5 rounded border shadow-sm ${selected.includes(opt.value) ? 'bg-[#F24C20] border-[#F24C20] flex items-center justify-center' : 'border-gray-300 dark:border-gray-500 bg-white dark:bg-[#1a1a1a]'}`}>
                  {selected.includes(opt.value) && <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                </div>
                <span className="text-sm font-semibold text-gray-900 dark:text-white">{opt.label}</span>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function CreateSubscriptionPlan({ onBack, onNavigate }: CreateSubscriptionPlanProps) {
  const [features, setFeatures] = useState<string[]>(['']);
  const [isPaid, setIsPaid] = useState(true);
  const [targetRoles, setTargetRoles] = useState<string[]>(['client']);
  const [categoryGroups, setCategoryGroups] = useState<string[]>(['Client Plans']);

  const isFreelancer = targetRoles.includes('freelancer');
  const isClient = targetRoles.includes('client');
  const isInvestor = targetRoles.includes('investor');
  const isStartup = targetRoles.includes('startup_creator');
  const isCombo = false;

  const showProjects = isFreelancer || isClient || isCombo;
  const projectLabel = isCombo ? "Projects (Post/Apply)" : isFreelancer ? "Project Applications" : "Project Posts";
  const projectDesc = isFreelancer ? "How many opportunities they can apply to in this cycle." : "How many projects they can post in this cycle.";

  const showTasks = isFreelancer || isClient || isCombo;
  const taskLabel = isCombo ? "Tasks / Gig Access" : isFreelancer ? "Gig / Task Slots" : "Task Posts";
  const taskDesc = isFreelancer ? "How many task or gig slots they can actively use." : "How many tasks they can post in this cycle.";

  const showChat = isFreelancer || isClient || isInvestor || isStartup || isCombo;
  const chatLabel = isCombo ? "Direct Communication" : isInvestor ? "Founder Conversations" : isStartup ? "Investor Conversations" : isFreelancer ? "Client Conversations" : "Freelancer Conversations";
  const chatDesc = "Unique people they can directly contact in this cycle.";

  const showDb = isClient || isInvestor || isCombo;
  const dbLabel = "Discovery Library Access";
  const dbDesc = "How many times they can access the searchable people/startup library in this cycle.";

  const showProjectVisits = isFreelancer || isCombo;
  const projectVisitLabel = "Project Detail Unlocks";
  const projectVisitDesc = "How many project detail pages they can unlock/view in this cycle.";

  const showPortfolioVisits = isClient || isCombo;
  const portfolioLabel = "Freelancer Profile Unlocks";
  const portfolioDesc = "How many freelancer profiles/portfolios they can unlock in this cycle.";

  const showPostIdeas = isFreelancer || isClient || isStartup || isCombo;
  const postIdeaLabel = isCombo ? "Startup Idea Submissions" : "Startup Idea Submissions";
  const postIdeaDesc = "How many startup ideas they can publish in this cycle.";

  const showExploreIdeas = isFreelancer || isClient || isInvestor || isStartup || isCombo;
  const exploreIdeaLabel = isInvestor ? "Startup Idea Unlocks" : "Startup Idea Unlocks";
  const exploreIdeaDesc = "How many startup ideas they can unlock/explore in this cycle.";

  const parameterTitle = isCombo
    ? 'Combo Access Parameters'
    : isFreelancer
      ? 'Freelancer Plan Parameters'
      : isClient
        ? 'Client Plan Parameters'
        : isInvestor
          ? 'Investor Plan Parameters'
          : isStartup
            ? 'Startup Creator Plan Parameters'
            : 'Plan Parameters';

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
      startup_idea_post_limit: Number(formData.get('startup_idea_post_limit')),
      startup_idea_explore_limit: Number(formData.get('startup_idea_explore_limit')),
      billing_cycle: formData.get('billing_cycle'),
      target_role: targetRoles,
      badge: formData.get('badge'),
      cta: formData.get('cta'),
      description: formData.get('description'),
      featured: formData.get('featured') === 'on',
      group: categoryGroups,
      icon: formData.get('icon'),
      color_theme: formData.get('color_theme'),
      features: features.filter(f => f.trim())
    };

    try {
      const res = await api.post('/subscription-plans', data);
      if (res.data.success) {
        toast.success('Subscription plan created successfully');
        onBack();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create subscription plan');
    }
  };

  return (
    <div className="space-y-6">
      <style>{`
        .dark select option {
          background-color: #1a1a1a;
          color: white;
        }
      `}</style>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={onBack}
            className="p-2.5 bg-white dark:bg-[#1a1a1a] border border-gray-100 dark:border-[#262626] rounded-xl shadow-sm">
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </motion.button>
          <div>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight italic uppercase">Create Subscription Plan</h1>
            <p className="text-gray-500 text-sm font-medium">Design a new premium tier for your growing ecosystem</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-[#1a1a1a] rounded-[32px] border border-gray-200 dark:border-[#262626] overflow-hidden shadow-sm">

            <form onSubmit={handleSubmit} className="p-8 space-y-8">
              {/* Row 1: Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Field label="Plan Name" icon={Type}>
                  <input name="name" required placeholder="e.g. Pro Client" className={inputCls} />
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
                      <input name="icon" defaultValue="Star" className={inputCls} />
                    </Field>
                  </div>
                </div>
              </div>

              {/* Row 2: Roles & Groups */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Field label="Target Role(s)" icon={Users}>
                  <MultiSelectDropdown
                    selected={targetRoles}
                    onChange={setTargetRoles}
                    placeholder="Select one role..."
                    maxSelections={1}
                    options={[
                      { value: 'client', label: 'Client' },
                      { value: 'freelancer', label: 'Freelancer' },
                      { value: 'investor', label: 'Investor' },
                      { value: 'startup_creator', label: 'Startup Creator' }
                    ]}
                  />
                </Field>
                <Field label="Category Group(s)" icon={Rocket}>
                  <MultiSelectDropdown
                    selected={categoryGroups}
                    onChange={setCategoryGroups}
                    placeholder="Select one group..."
                    maxSelections={1}
                    options={[
                      { value: 'Free Trial Plan', label: 'Free Trial Plan' },
                      { value: 'Freelancer Plans', label: 'Freelancer Plans' },
                      { value: 'Client Plans', label: 'Client Plans' },
                      { value: 'Start-Up Idea Creator Plans', label: 'Start-Up Idea Creator Plans' },
                      { value: 'Investor Plans', label: 'Investor Plans' }
                    ]}
                  />
                </Field>
              </div>

              {/* Row 3: Limits & Pricing (Dynamic based on role terminology) */}
              <div className="p-6 bg-gray-50/50 dark:bg-[#111] rounded-[24px] border border-gray-100 dark:border-[#262626] space-y-6">
                <div className="flex items-center gap-3 pb-4 border-b border-gray-100 dark:border-[#262626]">
                  <div className="p-2 bg-[#F24C20]/10 rounded-lg"><IndianRupee className="w-4 h-4 text-[#F24C20]" /></div>
                  <h3 className="font-black text-xs uppercase tracking-[0.2em] text-gray-500">
                    {parameterTitle}
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Field label="Price (₹)*">
                    <input name="price" type="number" disabled={!isPaid} required={isPaid} defaultValue={0} placeholder="e.g. 999" className={inputCls + (!isPaid ? ' opacity-50' : '')} />
                    <p className="text-[10px] text-gray-400 mt-1 italic">Enter the plan amount in INR.</p>
                  </Field>
                  <Field label="Validity (Days)*">
                    <input name="duration_days" type="number" defaultValue={365} placeholder="e.g. 365" className={inputCls} required />
                    <p className="text-[10px] text-gray-400 mt-1 italic">Days until renewal (e.g. 365 for 1 year).</p>
                  </Field>
                  <Field label="Billing Cycle*">
                    <select name="billing_cycle" className={selectCls} required>
                      <option value="yearly">Yearly (Standard)</option>
                      <option value="monthly">Monthly (Recurring)</option>
                      <option value="one-time">One-time (Fixed)</option>
                    </select>
                  </Field>
                </div>

                {/* Dynamically Labeled Fields based on user requirements */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
                  {showProjects && (
                    <Field label={projectLabel + "*"} icon={Briefcase}>
                      <input name="project_post_limit" type="number" defaultValue={36} placeholder="e.g. 36 (0=unlimited)" className={inputCls} required />
                      <p className="text-[10px] text-gray-400 mt-1 italic">{projectDesc}</p>
                    </Field>
                  )}
                  {showTasks && (
                    <Field label={taskLabel + "*"} icon={LayoutDashboard}>
                      <input name="task_post_limit" type="number" defaultValue={36} placeholder="e.g. 10" className={inputCls} required />
                      <p className="text-[10px] text-gray-400 mt-1 italic">{taskDesc}</p>
                    </Field>
                  )}
                  {showChat && (
                    <Field label={chatLabel + "*"} icon={MessageCircle}>
                      <input name="chat_limit" type="number" defaultValue={10} placeholder="e.g. 50" className={inputCls} required />
                      <p className="text-[10px] text-gray-400 mt-1 italic">{chatDesc}</p>
                    </Field>
                  )}
                  {showDb && (
                    <Field label={dbLabel} icon={Database}>
                      <input name="database_access_limit" type="number" defaultValue={50} placeholder="e.g. 99 (0=No Access)" className={inputCls} />
                      <p className="text-[10px] text-gray-400 mt-1 italic">{dbDesc}</p>
                    </Field>
                  )}
                  {showProjectVisits && (
                    <Field label={projectVisitLabel} icon={Eye}>
                      <input name="project_visit_limit" type="number" defaultValue={99} placeholder="e.g. 15 (Project detail unlocks)" className={inputCls} />
                      <p className="text-[10px] text-gray-400 mt-1 italic">{projectVisitDesc}</p>
                    </Field>
                  )}
                  {showPortfolioVisits && (
                    <Field label={portfolioLabel} icon={Eye}>
                      <input name="portfolio_visit_limit" type="number" defaultValue={0} placeholder="e.g. 15 (Freelancer profile unlocks)" className={inputCls} />
                      <p className="text-[10px] text-gray-400 mt-1 italic">{portfolioDesc}</p>
                    </Field>
                  )}
                  {showPostIdeas && (
                    <Field label={postIdeaLabel + "*"} icon={Rocket}>
                      <input name="startup_idea_post_limit" type="number" defaultValue={0} placeholder="0 = Unlimited" className={inputCls} required />
                      <p className="text-[10px] text-gray-400 mt-1 italic">{postIdeaDesc}</p>
                    </Field>
                  )}
                  {showExploreIdeas && (
                    <Field label={exploreIdeaLabel + "*"} icon={Eye}>
                      <input name="startup_idea_explore_limit" type="number" defaultValue={0} placeholder="0 = Unlimited" className={inputCls} required />
                      <p className="text-[10px] text-gray-400 mt-1 italic">{exploreIdeaDesc}</p>
                    </Field>
                  )}
                </div>

                {/* Hidden Fields for clean Payload */}
                {!showProjects && <input type="hidden" name="project_post_limit" value={0} />}
                {!showTasks && <input type="hidden" name="task_post_limit" value={0} />}
                {!showChat && <input type="hidden" name="chat_limit" value={0} />}
                {!showDb && <input type="hidden" name="database_access_limit" value={0} />}
                {!showProjectVisits && <input type="hidden" name="project_visit_limit" value={0} />}
                {!showPortfolioVisits && <input type="hidden" name="portfolio_visit_limit" value={0} />}
                {!showPostIdeas && <input type="hidden" name="startup_idea_post_limit" value={0} />}
                {!showExploreIdeas && <input type="hidden" name="startup_idea_explore_limit" value={0} />}
              </div>

              {/* Row 4: UX & Badge (Recommended for Marketing) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Field label="Badge / Label (Optional)" icon={Crown}>
                  <input name="badge" placeholder="e.g. Best Seller / Popular" className={inputCls} />
                  <p className="text-[10px] text-gray-400 mt-1 italic">Text shown in the corner banner.</p>
                </Field>
                <Field label="Theme Color" icon={Star}>
                  <select name="color_theme" defaultValue="orange" className={selectCls}>
                    <option value="orange">Orange (Startup/Basic)</option>
                    <option value="green">Green (Free Trial)</option>
                    <option value="blue">Blue (Pro / Business)</option>
                    <option value="gold">Gold (Elite / Platinum)</option>
                  </select>
                </Field>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Field label="Button Text (CTA)*">
                  <input name="cta" defaultValue="Choose Plan" placeholder="e.g. Upgrade Now" className={inputCls} required />
                </Field>
                <Field label="Tagline / Short Line">
                  <input name="description" placeholder="e.g. Hire the top 1% talent at scale." className={inputCls} />
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
                      <motion.div key={idx} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="flex gap-2">
                        <input
                          value={feature}
                          onChange={(e) => updateFeature(idx, e.target.value)}
                          placeholder="e.g. Priority Support"
                          className={inputCls}
                        />
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

              {/* Featured Toggle */}
              <div className="flex items-center gap-4 p-5 bg-orange-500/5 rounded-2xl border border-orange-500/10">
                <input type="checkbox" name="featured" id="feat" className="w-6 h-6 accent-[#F24C20] rounded-lg cursor-pointer" />
                <div>
                  <label htmlFor="feat" className="block text-sm font-black text-gray-900 dark:text-white cursor-pointer select-none italic uppercase">Feature Plan (Orange Glow)</label>
                  <p className="text-xs text-gray-500">Highlighted as the "Recommended" choice on the website</p>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button type="button" onClick={onBack} className="flex-1 py-4 bg-gray-50 dark:bg-[#1a1a1a] border border-gray-100 dark:border-[#262626] rounded-2xl font-bold hover:bg-gray-100 transition-all">Cancel</button>
                <button type="submit" className="flex-[2] py-4 bg-[#F24C20] text-white rounded-2xl font-black uppercase tracking-widest hover:bg-[#d4431b] transition-all shadow-xl shadow-[#F24C20]/20 flex items-center justify-center gap-2">
                  <Save className="w-5 h-5" /> Save & Publish Plan
                </button>
              </div>
            </form>
          </motion.div>
        </div>

        {/* Info Column */}
        <div className="space-y-6">
          <div className="bg-[#044071] rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110" />
            <h3 className="text-xl font-black italic uppercase tracking-tighter mb-6 relative">Setup Guidance</h3>
            <div className="space-y-6 relative">
              <div className="flex gap-3">
                <div className="p-2 bg-white/10 rounded-xl h-fit"><Briefcase className="w-4 h-4 text-orange-400" /></div>
                <div>
                  <p className="font-bold text-sm">Projects vs Tasks</p>
                  <p className="text-xs text-blue-100/70 mt-1">High-value projects usually have larger budgets, while tasks are short-term gigs.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="p-2 bg-white/10 rounded-xl h-fit"><MessageCircle className="w-4 h-4 text-orange-400" /></div>
                <div>
                  <p className="font-bold text-sm">Chat Limit</p>
                  <p className="text-xs text-blue-100/70 mt-1">Controls how many unique freelancers a client can chat with in this plan period.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="p-2 bg-white/10 rounded-xl h-fit"><Database className="w-4 h-4 text-orange-400" /></div>
                <div>
                  <p className="font-bold text-sm">Database Hits</p>
                  <p className="text-xs text-blue-100/70 mt-1">Limits for searching and browsing verified freelancers from your library.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-[#1a1a1a] rounded-[32px] border border-gray-100 dark:border-[#262626] p-8">
            <h3 className="font-black italic uppercase tracking-tighter text-lg mb-4">Badge Preview</h3>
            <p className="text-sm text-gray-500 mb-6 leading-relaxed">Badges create trust. We recommend using 1-2 words like <span className="text-[#F24C20] font-bold">Gold Edition</span> or <span className="text-emerald-500 font-bold">Best Value</span>.</p>
            <div className="p-1.5 rounded-full border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-black/20 flex gap-2">
              <div className="px-5 py-2 rounded-full font-black text-[10px] uppercase tracking-widest bg-orange-500 text-white shadow-orange-500/20">Preview</div>
              <div className="flex-1 flex items-center text-[10px] font-bold text-gray-400 px-2 uppercase tracking-widest">Active System</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

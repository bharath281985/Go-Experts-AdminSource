import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
    Plus,
    Trash2,
    ArrowRight,
    X,
    Database,
    ChevronDown,
    List,
    Settings2,
    ToggleRight,
    ToggleLeft,
    MousePointerClick,
    ListChecks,
    Type,
    UserPlus,
    CheckCircle2,
    CircleDashed,
    AlertCircle
} from 'lucide-react';

import { toast } from 'sonner';
import api from '../lib/api';

/* ================= TYPES ================= */

interface StepOption {
    value: string;
    label: string;
    icon?: string;
    subtitle?: string;
    emoji?: string;
}

interface RegistrationStep {
    _id: string;
    order: number;
    label: string;
    title: string;
    description: string;
    type: 'single-selection' | 'multi-selection' | 'input' | 'otp-verification' | 'account-creation' | 'subscription-plan';
    module: 'onboarding' | 'project_finder' | 'talent_finder';
    field: string;
    options: StepOption[];
    isActive: boolean;
    applicableRoles: string[];
}

/* ================= PAGE ================= */

export const RegistrationSteps = () => {
    const [steps, setSteps] = useState<RegistrationStep[]>([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [currentStep, setCurrentStep] = useState<Partial<RegistrationStep> | null>(null);

    const [activeModule, setActiveModule] = useState<'onboarding' | 'project_finder' | 'talent_finder'>('onboarding');
    const [activeRoleTab, setActiveRoleTab] = useState<'all' | 'freelancer' | 'client' | 'investor' | 'startup_creator'>('all');
    const [stats, setStats] = useState({ onboarding: 0, project_finder: 0, talent_finder: 0, freelancer: 0, client: 0, investor: 0, startup_creator: 0 });
    
    const fetchSteps = async () => {
        try {
            setLoading(true);
            const res = await api.get('/cms/registration-steps/admin');
            const allSteps: RegistrationStep[] = res.data.data;
            
            const onboardingSteps = allSteps.filter(s => (s.module || 'onboarding') === 'onboarding');
            
            setStats({
                onboarding: onboardingSteps.length,
                project_finder: allSteps.filter(s => s.module === 'project_finder').length,
                talent_finder: allSteps.filter(s => s.module === 'talent_finder').length,
                freelancer: onboardingSteps.filter(s => !s.applicableRoles?.length || s.applicableRoles.includes('freelancer')).length,
                client: onboardingSteps.filter(s => !s.applicableRoles?.length || s.applicableRoles.includes('client')).length,
                investor: onboardingSteps.filter(s => !s.applicableRoles?.length || s.applicableRoles.includes('investor')).length,
                startup_creator: onboardingSteps.filter(s => !s.applicableRoles?.length || s.applicableRoles.includes('startup_creator')).length
            });

            let filtered = allSteps.filter(s => (s.module || 'onboarding') === activeModule);
            
            if (activeModule === 'onboarding' && activeRoleTab !== 'all') {
                filtered = filtered.filter(s => !s.applicableRoles?.length || s.applicableRoles.includes(activeRoleTab));
            }

            setSteps(filtered.sort((a, b) => a.order - b.order));
        } catch {
            toast.error('Failed to fetch steps');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSteps();
    }, [activeModule, activeRoleTab]);

    const toggleStatus = async (id: string, active: boolean) => {
        await api.patch(`/cms/registration-steps/${id}/toggle`);
        toast.success(active ? 'Deactivated' : 'Activated');
        fetchSteps();
    };

    const removeStep = async (id: string) => {
        if (!confirm('Delete this step?')) return;
        await api.delete(`/cms/registration-steps/${id}`);
        toast.success('Deleted');
        fetchSteps();
    };

    const saveStep = async () => {
        if (!currentStep?.label || !currentStep?.title || !currentStep?.field) {
            toast.error('Missing required fields');
            return;
        }

        if (currentStep._id) {
            await api.put(`/cms/registration-steps/${currentStep._id}`, currentStep);
        } else {
            const order = steps.length ? Math.max(...steps.map(s => s.order)) + 1 : 1;
            await api.post('/cms/registration-steps', { ...currentStep, order });
        }

        toast.success('Saved');
        setIsEditing(false);
        fetchSteps();
    };

    const resetSteps = async () => {
        if (!confirm(`This will delete ALL ${activeModule.replace('_', ' ')} steps and restore default seed data. Continue?`)) return;
        try {
            setLoading(true);
            await api.post('/cms/registration-steps/reset', { module: activeModule });
            toast.success('Flow reset to defaults');
            fetchSteps();
        } catch {
            toast.error('Failed to reset steps');
            setLoading(false);
        }
    };

    return (
        <div className="max-w-[1300px] mx-auto space-y-8 pb-16 px-6">
            {/* ================= HERO ================= */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative overflow-hidden rounded-[2rem] p-10 text-white mt-4 border border-white/10 shadow-2xl"
                style={{
                    background: 'linear-gradient(135deg, #044071 0%, #032b4d 100%)'
                }}
            >
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#F24C20]/20 rounded-full blur-[120px] -mr-64 -mt-64" />
                
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                    <div className="flex gap-6 items-center min-w-0">
                        <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-xl flex items-center justify-center border border-white/20 shadow-inner">
                            <Settings2 className="w-8 h-8" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-semibold text-white mb-1">Dynamic Logic Flows</h1>
                            <p className="text-white/60 text-sm font-medium italic">
                                "{
                                    activeModule === 'onboarding' ? `Strategic Onboarding Protocol: ${activeRoleTab.replace('_', ' ').toUpperCase()}` : 
                                    activeModule === 'project_finder' ? 'Predictive Project Search Logic' : 
                                    'Talent Discovery Algorithm'
                                }"
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-3 flex-shrink-0">
                        <button
                            onClick={resetSteps}
                            className="bg-white/5 hover:bg-white/10 text-white/80 px-6 py-3 rounded-xl font-bold flex items-center gap-2 border border-white/10 transition-all text-xs uppercase tracking-widest"
                        >
                            <CircleDashed className="w-4 h-4" /> Reset Flow
                        </button>
                        <button
                            onClick={() => {
                                const nextOrder = steps.length ? Math.max(...steps.map(s => s.order)) + 1 : 1;
                                setCurrentStep({
                                    label: '',
                                    title: '',
                                    description: '',
                                    field: '',
                                    type: 'single-selection',
                                    module: activeModule,
                                    options: [],
                                    isActive: true,
                                    applicableRoles: activeRoleTab !== 'all' ? [activeRoleTab] : [],
                                    order: nextOrder
                                });
                                setIsEditing(true);
                            }}
                            className="bg-[#F24C20] hover:bg-orange-600 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 shadow-xl shadow-orange-500/20 transition-all text-xs uppercase tracking-widest"
                        >
                            <Plus className="w-4 h-4" /> Authorize Step
                        </button>
                    </div>
                </div>

                <div className="relative z-10 mt-12 flex flex-col gap-6">
                    <div className="flex flex-wrap gap-3 p-1.5 bg-black/20 rounded-[1.5rem] w-fit border border-white/5 backdrop-blur-md">
                        {[
                            { id: 'onboarding', label: 'Onboarding Flow', count: stats.onboarding, icon: UserPlus },
                            { id: 'project_finder', label: 'Project Finder', count: stats.project_finder, icon: Database },
                            { id: 'talent_finder', label: 'Talent Finder', count: stats.talent_finder, icon: Database }
                        ].map(tab => {
                            const Icon = tab.icon;
                            const isSelected = activeModule === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => {
                                        setActiveModule(tab.id as any);
                                        if (tab.id !== 'onboarding') setActiveRoleTab('all');
                                    }}
                                    className={`flex items-center gap-3 px-6 py-3 rounded-xl font-bold transition-all text-[11px] uppercase tracking-widest ${
                                        isSelected 
                                        ? 'bg-white text-[#044071] shadow-xl' 
                                        : 'text-white/50 hover:text-white'
                                    }`}
                                >
                                    <Icon className="w-4 h-4" />
                                    {tab.label}
                                    <span className={`px-2 py-0.5 rounded-full text-[9px] ${isSelected ? 'bg-[#044071]/10 text-[#044071]' : 'bg-white/10 text-white'}`}>
                                        {tab.count}
                                    </span>
                                </button>
                            );
                        })}
                    </div>

                    <AnimatePresence>
                        {activeModule === 'onboarding' && (
                            <motion.div 
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="flex flex-wrap gap-2 p-1 bg-white/5 rounded-xl backdrop-blur-md w-fit border border-white/5"
                            >
                                {[
                                    { id: 'all', label: 'Systemwide', count: stats.onboarding },
                                    { id: 'freelancer', label: 'Freelancer', count: stats.freelancer },
                                    { id: 'client', label: 'Client', count: stats.client },
                                    { id: 'investor', label: 'Investor', count: stats.investor },
                                    { id: 'startup_creator', label: 'Creator', count: stats.startup_creator }
                                ].map(sub => (
                                    <button
                                        key={sub.id}
                                        onClick={() => setActiveRoleTab(sub.id as any)}
                                        className={`px-5 py-2 rounded-lg text-[9px] font-black tracking-[0.2em] transition-all uppercase ${
                                            activeRoleTab === sub.id 
                                            ? 'bg-white text-[#F24C20]' 
                                            : 'text-white/40 hover:text-white'
                                        }`}
                                    >
                                        {sub.label} ({sub.count})
                                    </button>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>

            {/* ================= GRID ================= */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[1,2,3].map(i => <div key={i} className="h-64 rounded-[2rem] bg-gray-50/50 animate-pulse border border-gray-100" />)}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <AnimatePresence mode="popLayout">
                        {steps.map((step, i) => {
                            const typeIcons: Record<string, any> = {
                                'single-selection': MousePointerClick,
                                'multi-selection': ListChecks,
                                'input': Type,
                                'otp-verification': CircleDashed,
                                'account-creation': UserPlus,
                                'subscription-plan': Database
                            };
                            const TypeIcon = typeIcons[step.type] || CheckCircle2;

                            return (
                                <motion.div
                                    key={step._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ delay: i * 0.05 }}
                                    className="group relative bg-white dark:bg-[#1a1a1a] rounded-[2rem] p-8 border border-gray-100 dark:border-[#262626] shadow-sm hover:shadow-2xl hover:border-[#F24C20]/10 transition-all duration-500 overflow-hidden"
                                >
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-gray-50/50 dark:bg-white/5 rounded-bl-[2rem] flex items-center justify-center text-gray-200 group-hover:text-[#F24C20]/20 transition-colors">
                                        <TypeIcon className="w-10 h-10" />
                                    </div>

                                    <div className="flex justify-between items-start mb-8">
                                        <div className="w-12 h-12 rounded-xl bg-gray-50 dark:bg-[#262626] flex items-center justify-center text-lg font-black text-gray-300 group-hover:bg-[#044071] group-hover:text-white transition-all shadow-inner">
                                            {step.order < 10 ? `0${step.order}` : step.order}
                                        </div>
                                        <span
                                            className={`text-[9px] font-black px-3 py-1 rounded-full tracking-[0.2em] border ${step.isActive
                                                ? 'bg-green-50 text-green-600 border-green-100'
                                                : 'bg-gray-50 text-gray-400 border-gray-100'
                                                }`}
                                        >
                                            {step.isActive ? 'OPERATIONAL' : 'STAGED'}
                                        </span>
                                    </div>

                                    <div className="space-y-3 relative z-10">
                                        <div className="text-[11px] text-[#F24C20] font-black uppercase tracking-[0.2em] ml-1">
                                            {step.label || 'System Step'}
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-900 dark:text-white leading-tight">
                                            {step.title}
                                        </h3>
                                        <p className="text-sm text-gray-500 line-clamp-2 font-medium italic opacity-70">
                                            "{step.description || 'No taxonomic description available.'}"
                                        </p>
                                    </div>

                                    <div className="mt-8 flex flex-wrap gap-2">
                                        <div className="px-3 py-1.5 rounded-lg bg-gray-50/80 dark:bg-white/5 border border-gray-100 dark:border-white/5 flex items-center gap-2">
                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                                Type: {step.type.replace('-', ' ')}
                                            </span>
                                        </div>
                                        {step.options?.length > 0 && (
                                            <div className="px-3 py-1.5 rounded-lg bg-[#044071]/5 border border-[#044071]/10">
                                                <span className="text-[10px] font-black text-[#044071] uppercase tracking-widest">
                                                    {step.options.length} Assets
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex justify-between items-center mt-10 pt-6 border-t border-gray-50 dark:border-white/5">
                                        <button
                                            onClick={() => {
                                                setCurrentStep(step);
                                                setIsEditing(true);
                                            }}
                                            className="text-[#044071] dark:text-blue-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all hover:gap-3"
                                        >
                                            Edit Logic <ArrowRight className="w-3.5 h-3.5" />
                                        </button>

                                        <div className="flex gap-2 items-center">
                                            <button
                                                onClick={() => toggleStatus(step._id, step.isActive)}
                                                className={`transition-all duration-300 ${step.isActive ? 'text-green-500' : 'text-gray-200'}`}
                                            >
                                                {step.isActive ? (
                                                    <ToggleRight className="w-8 h-8" />
                                                ) : (
                                                    <ToggleLeft className="w-8 h-8" />
                                                )}
                                            </button>
                                            <button
                                                onClick={() => removeStep(step._id)}
                                                className="p-2 text-gray-200 hover:text-red-500 transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                        {steps.length === 0 && (
                            <div className="col-span-full py-20 text-center">
                                <AlertCircle className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                                <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">No logical steps configured for this flow.</p>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            )}

            <EditModal
                open={isEditing}
                onClose={() => setIsEditing(false)}
                step={currentStep}
                setStep={setCurrentStep}
                onSave={saveStep}
            />
        </div>
    );
};

/* ================= MODAL ================= */

function EditModal({ open, onClose, step, setStep, onSave }: any) {
    if (!open) return null;

    return createPortal(
        <AnimatePresence>
            <motion.div
                className="fixed inset-0 bg-[#044071]/10 backdrop-blur-md flex items-center justify-center p-4 z-[100]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    className="bg-white dark:bg-[#1a1a1a] rounded-[2.5rem] w-full max-w-4xl shadow-2xl overflow-hidden border border-white/20 flex flex-col max-h-[90vh]"
                >
                    <div className="px-10 py-8 border-b border-gray-50 dark:border-[#262626] bg-gray-50/30 dark:bg-[#262626]/50 flex justify-between items-center">
                        <div className="flex items-center gap-5">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#044071] to-[#0a5ea3] flex items-center justify-center text-white shadow-inner">
                                <Settings2 className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-[#044071] dark:text-white">Logic Configuration</h2>
                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mt-1">Configure Strategic Journey Step</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-3 bg-white dark:bg-[#262626] border border-gray-100 dark:border-[#333] hover:bg-gray-50 rounded-full transition-all text-gray-400"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    <div className="p-10 overflow-y-auto space-y-10 custom-scrollbar">
                        <section className="space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-6 bg-[#F24C20] rounded-full" />
                                <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">General Attributes</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Logic Module</label>
                                    <select
                                        value={step?.module || 'onboarding'}
                                        onChange={e => setStep({ ...step, module: e.target.value })}
                                        className="w-full bg-gray-50/50 dark:bg-[#222] border border-gray-100 dark:border-white/5 rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-[#F24C20]/20 outline-none transition-all"
                                    >
                                        <option value="onboarding">User Onboarding Flow</option>
                                        <option value="project_finder">Project Finder Filter</option>
                                        <option value="talent_finder">Talent Finder Flow</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Internal Reference</label>
                                    <input
                                        placeholder="e.g. Account Type Identification"
                                        value={step?.label || ''}
                                        onChange={e => setStep({ ...step, label: e.target.value })}
                                        className="w-full bg-gray-50/50 dark:bg-[#222] border border-gray-100 dark:border-white/5 rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-[#F24C20]/20 outline-none transition-all"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Public Strategic Title</label>
                                <input
                                    placeholder="e.g. What brings you to Go Experts today?"
                                    value={step?.title || ''}
                                    onChange={e => setStep({ ...step, title: e.target.value })}
                                    className="w-full bg-gray-50/50 dark:bg-[#222] border border-gray-100 dark:border-white/5 rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-[#F24C20]/20 outline-none transition-all"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Contextual Description</label>
                                <textarea
                                    placeholder="Provide more clarity for the end-user..."
                                    value={step?.description || ''}
                                    onChange={e => setStep({ ...step, description: e.target.value })}
                                    rows={3}
                                    className="w-full bg-gray-50/50 dark:bg-[#222] border border-gray-100 dark:border-white/5 rounded-2xl p-4 text-sm font-medium focus:ring-2 focus:ring-[#F24C20]/20 outline-none transition-all resize-none"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Database Field Key</label>
                                    <input
                                        placeholder="e.g. user_intent_id"
                                        value={step?.field || ''}
                                        onChange={e => setStep({ ...step, field: e.target.value })}
                                        className="w-full bg-gray-50/50 dark:bg-[#222] border border-gray-100 dark:border-white/5 rounded-2xl p-4 text-sm font-mono font-bold text-[#F24C20] focus:ring-2 focus:ring-[#F24C20]/20 outline-none transition-all"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Input Archetype</label>
                                    <select
                                        value={step?.type}
                                        onChange={e => setStep({ ...step, type: e.target.value })}
                                        className="w-full bg-gray-50/50 dark:bg-[#222] border border-gray-100 dark:border-white/5 rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-[#F24C20]/20 outline-none transition-all cursor-pointer"
                                    >
                                        <option value="single-selection">Single Selection List</option>
                                        <option value="multi-selection">Multiple Selection List</option>
                                        <option value="input">Text Input Field</option>
                                        <option value="otp-verification">OTP Verification</option>
                                        <option value="account-creation">Account Creation Form</option>
                                        <option value="subscription-plan">Subscription Matrix</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-4 pt-6 border-t border-gray-50">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Role Permissibility</label>
                                <div className="flex flex-wrap gap-2">
                                    {['freelancer', 'client', 'investor', 'startup_creator'].map(role => {
                                        const isSelected = step?.applicableRoles?.includes(role);
                                        return (
                                            <button
                                                key={role} type="button"
                                                onClick={() => {
                                                    const currentRoles = step?.applicableRoles || [];
                                                    const nextRoles = isSelected 
                                                        ? currentRoles.filter((r: string) => r !== role)
                                                        : [...currentRoles, role];
                                                    setStep({ ...step, applicableRoles: nextRoles });
                                                }}
                                                className={`px-5 py-2.5 rounded-xl text-[10px] font-black tracking-widest transition-all uppercase border ${
                                                    isSelected 
                                                    ? 'bg-[#F24C20] text-white border-[#F24C20] shadow-lg shadow-orange-500/20' 
                                                    : 'bg-white text-gray-400 border-gray-100 hover:border-[#F24C20] hover:text-[#F24C20]'
                                                }`}
                                            >
                                                {role.replace('_', ' ')}
                                            </button>
                                        );
                                    })}
                                </div>
                                <p className="text-[10px] text-gray-400 italic">Universal step if no specific roles are targeted.</p>
                            </div>
                        </section>

                        {(step?.type === 'single-selection' || step?.type === 'multi-selection') && (
                            <section className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 h-6 bg-[#044071] rounded-full" />
                                        <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">Selectable Assets</h3>
                                    </div>
                                    <button
                                        onClick={() => setStep({ ...step, options: [...(step.options || []), { label: '', value: '', icon: '', subtitle: '' }] })}
                                        className="text-[#F24C20] text-[10px] font-black tracking-widest flex items-center gap-2 hover:bg-orange-50 px-6 py-3 rounded-xl border border-orange-100 transition-all uppercase"
                                    >
                                        <Plus className="w-4 h-4" /> Add Logic Option
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <AnimatePresence>
                                        {step.options?.map((opt: any, idx: number) => (
                                            <motion.div
                                                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                                                key={idx} className="bg-gray-50/50 border border-gray-100 dark:border-white/5 rounded-[2rem] p-8 relative group"
                                            >
                                                <div className="space-y-5">
                                                    <div className="space-y-1.5">
                                                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Asset Label</label>
                                                        <input
                                                            placeholder="e.g. Enterprise Solution"
                                                            value={opt.label || ''}
                                                            onChange={(e) => {
                                                                const newOptions = [...(step.options || [])];
                                                                newOptions[idx] = { ...newOptions[idx], label: e.target.value };
                                                                if (!newOptions[idx].value) newOptions[idx].value = e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
                                                                setStep({ ...step, options: newOptions });
                                                            }}
                                                            className="w-full bg-white border border-gray-100 rounded-xl p-3 text-sm font-bold focus:ring-2 focus:ring-[#F24C20]/20 outline-none transition-all"
                                                        />
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div className="space-y-1.5">
                                                            <label className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Value Key</label>
                                                            <input
                                                                placeholder="enterprise"
                                                                value={opt.value || ''}
                                                                onChange={(e) => {
                                                                    const newOptions = [...(step.options || [])];
                                                                    newOptions[idx] = { ...newOptions[idx], value: e.target.value };
                                                                    setStep({ ...step, options: newOptions });
                                                                }}
                                                                className="w-full bg-white border border-gray-100 rounded-xl p-3 text-[11px] font-mono font-bold text-gray-500"
                                                            />
                                                        </div>
                                                        <div className="space-y-1.5">
                                                            <label className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Icon Name</label>
                                                            <input
                                                                placeholder="Globe"
                                                                value={opt.icon || ''}
                                                                onChange={(e) => {
                                                                    const newOptions = [...(step.options || [])];
                                                                    newOptions[idx] = { ...newOptions[idx], icon: e.target.value };
                                                                    setStep({ ...step, options: newOptions });
                                                                }}
                                                                className="w-full bg-white border border-gray-100 rounded-xl p-3 text-sm font-bold"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="space-y-1.5">
                                                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Subtext Description</label>
                                                        <input
                                                            placeholder="Scalable architecture for teams..."
                                                            value={opt.subtitle || ''}
                                                            onChange={(e) => {
                                                                    const newOptions = [...(step.options || [])];
                                                                    newOptions[idx] = { ...newOptions[idx], subtitle: e.target.value };
                                                                    setStep({ ...step, options: newOptions });
                                                                }}
                                                            className="w-full bg-white border border-gray-100 rounded-xl p-3 text-xs font-medium italic text-gray-500"
                                                        />
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => {
                                                        const newOptions = step.options.filter((_: any, i: number) => i !== idx);
                                                        setStep({ ...step, options: newOptions });
                                                    }}
                                                    className="absolute -top-3 -right-3 w-10 h-10 bg-white border border-red-50 text-red-200 hover:text-red-500 hover:border-red-100 rounded-full flex items-center justify-center transition-all shadow-lg shadow-red-500/5 active:scale-95"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                </div>
                            </section>
                        )}
                    </div>

                    <div className="px-10 py-8 border-t border-gray-50 dark:border-[#262626] bg-gray-50/30 dark:bg-[#262626]/50 flex justify-end gap-4">
                        <button
                            onClick={onClose}
                            className="px-8 py-4 rounded-2xl font-black text-[10px] text-gray-400 uppercase tracking-widest hover:text-gray-600 transition-colors"
                        >
                            Abort Configuration
                        </button>
                        <button
                            onClick={onSave}
                            className="bg-[#F24C20] hover:bg-orange-600 text-white px-12 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-orange-500/20 active:scale-95 transition-all flex items-center gap-3"
                        >
                            <CheckCircle2 className="w-5 h-5" /> Deploy Logic
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>,
        document.body
    );
}

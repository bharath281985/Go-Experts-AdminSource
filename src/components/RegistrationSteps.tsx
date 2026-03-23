import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
    Plus,
    Eye,
    EyeOff,
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
    CircleDashed
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
    type: 'single-selection' | 'multi-selection' | 'input' | 'otp-verification' | 'account-creation';
    field: string;
    options: StepOption[];
    isActive: boolean;
}

/* ================= PAGE ================= */

export const RegistrationSteps = () => {
    const [steps, setSteps] = useState<RegistrationStep[]>([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [currentStep, setCurrentStep] = useState<Partial<RegistrationStep> | null>(null);

    const fetchSteps = async () => {
        try {
            const res = await api.get('/cms/registration-steps/admin');
            setSteps(res.data.data);
        } catch {
            toast.error('Failed to fetch steps');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSteps();
    }, []);

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
        if (!confirm('This will delete all current steps and restore default dummy registration data. Continue?')) return;
        try {
            setLoading(true);
            await api.post('/cms/registration-steps/reset');
            toast.success('Onboarding flow reset to defaults');
            fetchSteps();
        } catch {
            toast.error('Failed to reset steps');
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8">
            {/* ================= HERO ================= */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative overflow-hidden rounded-2xl p-8 text-white"
                style={{
                    background: 'linear-gradient(135deg, #F24C20 0%, #d43a12 50%, #044071 100%)'
                }}
            >
                <div className="absolute inset-0 opacity-20">
                    <motion.div
                        animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
                        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                        className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl"
                    />
                </div>

                <div className="relative z-10 flex justify-between items-center">
                    <div className="flex gap-4 items-center">
                        <div className="p-4 rounded-xl bg-white/20">
                            <Settings2 />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold">Onboarding Flow</h1>
                            <p className="text-white/80 text-sm">
                                Orchestrate the user registration journey
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <button
                            onClick={resetSteps}
                            className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 border border-white/20 transition-all active:scale-95"
                        >
                            <CircleDashed className="w-5 h-5" /> Reset to Defaults
                        </button>
                        <button
                            onClick={() => {
                                setCurrentStep({
                                    label: '',
                                    title: '',
                                    description: '',
                                    field: '',
                                    type: 'single-selection',
                                    options: [],
                                    isActive: true
                                });
                                setIsEditing(true);
                            }}
                            className="bg-white text-[#F24C20] px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg hover:shadow-white/20 transition-all active:scale-95"
                        >
                            <Plus /> Add Logic Step
                        </button>
                    </div>
                </div>
            </motion.div>

            {/* ================= GRID ================= */}
            {loading ? (
                <div className="h-40 flex items-center justify-center">Loading...</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <AnimatePresence>
                        {steps.map((step, i) => {
                            const TypeIcon = {
                                'single-selection': MousePointerClick,
                                'multi-selection': ListChecks,
                                'input': Type,
                                'otp-verification': CircleDashed,
                                'account-creation': UserPlus
                            }[step.type] || CheckCircle2;

                            return (
                                <motion.div
                                    key={step._id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    className="group relative bg-white dark:bg-[#1a1a1a] rounded-3xl p-6 border border-gray-100 dark:border-[#262626] shadow-sm hover:shadow-xl hover:shadow-[#F24C20]/5 transition-all duration-300"
                                >
                                    {/* Header: Order & Status */}
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-2xl bg-gray-50 dark:bg-white/5 flex items-center justify-center text-sm font-bold text-gray-400 group-hover:bg-[#F24C20] group-hover:text-white transition-colors duration-300">
                                                {step.order}
                                            </div>
                                            <div className="p-2 rounded-xl bg-gray-50 dark:bg-white/5 text-gray-400">
                                                <TypeIcon className="w-4 h-4" />
                                            </div>
                                        </div>
                                        <span
                                            className={`text-[10px] font-bold px-3 py-1 rounded-full tracking-wider ${step.isActive
                                                ? 'bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400'
                                                : 'bg-gray-100 text-gray-400 dark:bg-white/5 dark:text-gray-500'
                                                }`}
                                        >
                                            {step.isActive ? 'ACTIVE' : 'DRAFT'}
                                        </span>
                                    </div>

                                    {/* Content */}
                                    <div className="space-y-1">
                                        <p className="text-[10px] text-[#F24C20] font-black uppercase tracking-widest opacity-80">
                                            {step.label}
                                        </p>
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">
                                            {step.title}
                                        </h3>
                                        {step.description && (
                                            <p className="text-sm text-gray-500 line-clamp-2 mt-2 font-medium">
                                                {step.description}
                                            </p>
                                        )}
                                    </div>

                                    {/* Type Badge */}
                                    <div className="mt-4 flex items-center gap-2">
                                        <div className="px-3 py-1.5 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 flex items-center gap-2">
                                            <span className="text-[10px] font-bold text-gray-500 uppercase">
                                                {step.type.replace('-', ' ')}
                                            </span>
                                        </div>
                                        {step.options?.length > 0 && (
                                            <div className="px-3 py-1.5 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                                                <span className="text-[10px] font-bold text-gray-500">
                                                    {step.options.length} OPTIONS
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Footer Actions */}
                                    <div className="flex justify-between items-center mt-8 pt-5 border-t border-gray-50 dark:border-white/5">
                                        <button
                                            onClick={() => {
                                                setCurrentStep(step);
                                                setIsEditing(true);
                                            }}
                                            className="text-gray-400 hover:text-[#F24C20] text-xs font-bold flex items-center gap-2 transition-colors uppercase tracking-wider"
                                        >
                                            Edit Logic <ArrowRight className="w-3.5 h-3.5" />
                                        </button>

                                        <div className="flex gap-4 items-center">
                                            <button
                                                onClick={() => toggleStatus(step._id, step.isActive)}
                                                className={`transition-all duration-300 ${step.isActive ? 'text-green-500 hover:scale-110' : 'text-gray-300 hover:text-gray-500'}`}
                                            >
                                                {step.isActive ? (
                                                    <ToggleRight className="w-7 h-7" />
                                                ) : (
                                                    <ToggleLeft className="w-7 h-7" />
                                                )}
                                            </button>
                                            <button
                                                onClick={() => removeStep(step._id)}
                                                className="text-gray-300 hover:text-red-500 transition-colors"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
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
}

/* ================= MODAL ================= */

function EditModal({ open, onClose, step, setStep, onSave }: any) {
    if (!open) return null;

    return createPortal(
        <AnimatePresence>
            <motion.div
                className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 sm:p-6 backdrop-blur-xl"
                style={{ zIndex: 999999 }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
            >
                <motion.div
                    initial={{ scale: 0.95, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 20 }}
                    className="bg-white dark:bg-[#121212] rounded-[2.5rem] w-full max-w-md shadow-2xl relative flex flex-col h-[85vh] overflow-hidden border border-gray-200/50 dark:border-white/10"
                    style={{ zIndex: 1000000 }}
                >
                    {/* Header */}
                    <div className="flex justify-between items-center px-8 py-5 border-b border-gray-100 dark:border-white/5 bg-white dark:bg-[#1a1a1a] flex-shrink-0">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-2xl bg-[#F24C20]/10 flex items-center justify-center text-[#F24C20]">
                                <Settings2 className="w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-gray-900 dark:text-white leading-none mb-1">Logic Configuration</h2>
                                <p className="text-[11px] text-gray-500 font-medium">Fine-tune this step's behavior</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/10 rounded-xl transition-all text-gray-400 hover:text-gray-900 dark:hover:text-white"
                            title="Close"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Scrollable Body */}
                    <div className="px-8 py-8 overflow-y-auto min-h-0 space-y-10 flex-1 bg-gray-50/30 dark:bg-[#121212] custom-scrollbar">
                        {/* GENERAL CONFIGURATION */}
                        <section>
                            <div className="flex items-center gap-3 mb-5">
                                <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center">
                                    <ListChecks className="w-4 h-4 text-blue-500" />
                                </div>
                                <h3 className="text-[13px] font-bold text-gray-900 dark:text-white uppercase tracking-widest opacity-80">General Attributes</h3>
                            </div>

                            <div className="bg-white dark:bg-[#1a1a1a] border border-gray-200/60 dark:border-white/5 rounded-3xl p-6 space-y-6 shadow-sm">
                                <div className="flex flex-col gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest ml-1">Internal Reference</label>
                                        <input
                                            placeholder="e.g. Account Type"
                                            value={step?.label || ''}
                                            onChange={e => setStep({ ...step, label: e.target.value })}
                                            className="w-full bg-gray-50 dark:bg-[#222] border border-gray-200 dark:border-white/5 rounded-2xl p-4 text-sm focus:outline-none focus:border-[#F24C20] focus:ring-2 focus:ring-[#F24C20]/20 transition-all font-semibold text-gray-900 dark:text-white"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest ml-1">Public Question Title</label>
                                        <input
                                            placeholder="e.g. What brings you here?"
                                            value={step?.title || ''}
                                            onChange={e => setStep({ ...step, title: e.target.value })}
                                            className="w-full bg-gray-50 dark:bg-[#222] border border-gray-200 dark:border-white/5 rounded-2xl p-4 text-sm focus:outline-none focus:border-[#F24C20] focus:ring-2 focus:ring-[#F24C20]/20 transition-all font-semibold text-gray-900 dark:text-white"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest ml-1">Description (Optional)</label>
                                    <textarea
                                        placeholder="Add more context for the user..."
                                        value={step?.description || ''}
                                        onChange={e => setStep({ ...step, description: e.target.value })}
                                        rows={2}
                                        className="w-full bg-gray-50 dark:bg-[#222] border border-gray-200 dark:border-white/5 rounded-2xl p-4 text-sm focus:outline-none focus:border-[#F24C20] focus:ring-2 focus:ring-[#F24C20]/20 transition-all resize-none font-medium text-gray-900 dark:text-white"
                                    />
                                </div>

                                <div className="flex flex-col gap-6 pt-6 border-t border-gray-100 dark:border-white/5">
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest ml-1">Database Field Key</label>
                                        <div className="relative group">
                                            <Database className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#F24C20] w-4 h-4 transition-colors" />
                                            <input
                                                placeholder="e.g. account_type"
                                                value={step?.field || ''}
                                                onChange={e => setStep({ ...step, field: e.target.value })}
                                                className="w-full bg-gray-50 dark:bg-[#222] border border-gray-200 dark:border-white/5 rounded-2xl py-4 pl-12 pr-4 text-sm font-mono focus:outline-none focus:border-[#F24C20] focus:ring-2 focus:ring-[#F24C20]/20 transition-all text-gray-900 dark:text-white"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest ml-1">Input Type</label>
                                        <div className="relative">
                                            <select
                                                value={step?.type}
                                                onChange={e => setStep({ ...step, type: e.target.value })}
                                                className="w-full bg-gray-50 dark:bg-[#222] border border-gray-200 dark:border-white/5 rounded-2xl p-4 text-sm focus:outline-none focus:border-[#F24C20] focus:ring-2 focus:ring-[#F24C20]/20 transition-all appearance-none cursor-pointer font-semibold text-gray-900 dark:text-white"
                                            >
                                                <option value="single-selection">Single Selection List</option>
                                                <option value="multi-selection">Multiple Selection List</option>
                                                <option value="input">Text Input Field</option>
                                                <option value="otp-verification">OTP Verification</option>
                                                <option value="account-creation">Account Creation Form</option>
                                            </select>
                                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* SELECTION OPTIONS */}
                        {(step?.type === 'single-selection' || step?.type === 'multi-selection') && (
                            <section>
                                <div className="flex items-center justify-between mb-5">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-xl bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center">
                                            <List className="w-4 h-4 text-[#F24C20]" />
                                        </div>
                                        <h3 className="text-[13px] font-bold text-gray-900 dark:text-white uppercase tracking-widest opacity-80">Selectable Choices</h3>
                                    </div>
                                    <button
                                        onClick={() => setStep({ ...step, options: [...(step.options || []), { label: '', value: '', icon: '', subtitle: '' }] })}
                                        className="text-[#F24C20] text-xs font-bold flex items-center gap-2 hover:bg-[#F24C20] hover:text-white px-5 py-2.5 rounded-xl bg-[#F24C20]/10 border border-[#F24C20]/20 hover:border-[#F24C20] transition-all active:scale-95"
                                    >
                                        <Plus className="w-4 h-4" /> ADD CHOICE
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    <AnimatePresence>
                                        {step.options?.map((opt: any, idx: number) => (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                exit={{ opacity: 0, height: 0 }}
                                                key={idx}
                                                className="bg-white dark:bg-[#1a1a1a] border border-gray-200/60 dark:border-white/5 rounded-3xl p-6 relative group overflow-hidden shadow-sm"
                                            >
                                                <div className="flex flex-col gap-5 relative z-10 pr-12">
                                                    <div className="space-y-1.5 relative">
                                                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest pl-1">Display Label</label>
                                                        <input
                                                            placeholder="e.g. Design & Creative"
                                                            value={opt.label || ''}
                                                            onChange={(e) => {
                                                                const newOptions = [...(step.options || [])];
                                                                newOptions[idx] = { ...newOptions[idx], label: e.target.value };
                                                                if (!newOptions[idx].value) newOptions[idx].value = e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
                                                                setStep({ ...step, options: newOptions });
                                                            }}
                                                            className="w-full bg-gray-50 focus:bg-white dark:bg-[#222] border border-gray-200 dark:border-white/5 rounded-xl p-3 text-sm focus:border-[#F24C20] focus:ring-2 focus:ring-[#F24C20]/20 outline-none transition-all font-semibold text-gray-900 dark:text-white"
                                                        />
                                                    </div>
                                                    <div className="space-y-1.5 relative">
                                                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest pl-1">Internal Value ID</label>
                                                        <input
                                                            placeholder="e.g. design"
                                                            value={opt.value || ''}
                                                            onChange={(e) => {
                                                                const newOptions = [...(step.options || [])];
                                                                newOptions[idx] = { ...newOptions[idx], value: e.target.value };
                                                                setStep({ ...step, options: newOptions });
                                                            }}
                                                            className="w-full bg-gray-50 focus:bg-white dark:bg-[#222] border border-gray-200 dark:border-white/5 rounded-xl p-3 text-sm font-mono text-gray-600 dark:text-gray-400 focus:border-[#F24C20] focus:ring-2 focus:ring-[#F24C20]/20 outline-none transition-all"
                                                        />
                                                    </div>

                                                    <div className="space-y-1.5 relative">
                                                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest pl-1 flex items-center gap-1.5">
                                                            <Settings2 className="w-3 h-3" /> Icon Name
                                                        </label>
                                                        <input
                                                            placeholder="e.g. Briefcase"
                                                            value={opt.icon || ''}
                                                            onChange={(e) => {
                                                                const newOptions = [...(step.options || [])];
                                                                newOptions[idx] = { ...newOptions[idx], icon: e.target.value };
                                                                setStep({ ...step, options: newOptions });
                                                            }}
                                                            className="w-full bg-gray-50 focus:bg-white dark:bg-[#222] border border-gray-200 dark:border-white/5 rounded-xl p-3 text-sm focus:border-[#F24C20] focus:ring-2 focus:ring-[#F24C20]/20 outline-none transition-all text-gray-900 dark:text-white"
                                                        />
                                                    </div>
                                                    <div className="space-y-1.5 relative">
                                                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest pl-1">Description Hint</label>
                                                        <input
                                                            placeholder="Short subtext..."
                                                            value={opt.subtitle || ''}
                                                            onChange={(e) => {
                                                                const newOptions = [...(step.options || [])];
                                                                newOptions[idx] = { ...newOptions[idx], subtitle: e.target.value };
                                                                setStep({ ...step, options: newOptions });
                                                            }}
                                                            className="w-full bg-gray-50 focus:bg-white dark:bg-[#222] border border-gray-200 dark:border-white/5 rounded-xl p-3 text-sm focus:border-[#F24C20] focus:ring-2 focus:ring-[#F24C20]/20 outline-none transition-all text-gray-900 dark:text-white"
                                                        />
                                                    </div>
                                                </div>

                                                {/* Delete Button overlaid */}
                                                <div className="absolute top-3 right-3 z-20">
                                                    <button
                                                        onClick={() => {
                                                            const newOptions = step.options.filter((_: any, i: number) => i !== idx);
                                                            setStep({ ...step, options: newOptions });
                                                        }}
                                                        className="w-10 h-10 bg-white dark:bg-[#222] border border-gray-200 dark:border-white/10 text-gray-400 hover:text-red-500 hover:border-red-200 hover:bg-red-50 rounded-2xl flex items-center justify-center transition-all shadow-sm active:scale-95"
                                                        title="Remove choice"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>

                                    {(!step.options || step.options?.length === 0) && (
                                        <div className="text-center py-12 border-2 border-dashed border-gray-200 dark:border-white/10 rounded-3xl bg-white dark:bg-[#1a1a1a]">
                                            <div className="bg-gray-50 dark:bg-[#222] w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-gray-100 dark:border-white/5">
                                                <List className="w-6 h-6 text-gray-400" />
                                            </div>
                                            <h4 className="text-sm font-bold text-gray-900 dark:text-white">Empty Choices</h4>
                                            <p className="text-sm text-gray-500 mt-1 max-w-[250px] mx-auto">Add selectable options for the user to pick from in this step.</p>
                                        </div>
                                    )}
                                </div>
                            </section>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="px-8 py-5 border-t border-gray-100 dark:border-white/5 bg-white dark:bg-[#1a1a1a] flex justify-end gap-3 rounded-b-[2.5rem] flex-shrink-0 flex-grow-0">
                        <button
                            onClick={onClose}
                            className="flex-1 px-6 py-3.5 rounded-2xl text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#222] font-bold transition-colors text-xs border border-transparent hover:border-gray-200 dark:hover:border-white/5"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={onSave}
                            className="flex-[2] bg-[#F24C20] hover:bg-[#d43a12] text-white px-8 py-3.5 rounded-2xl font-bold shadow-lg shadow-[#F24C20]/25 active:scale-95 transition-all text-xs flex items-center justify-center gap-2"
                        >
                            <CheckCircle2 className="w-4 h-4" /> Save Changes
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>,
        document.body
    );
}


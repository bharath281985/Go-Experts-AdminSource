import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Edit, Trash2, ChevronDown, ChevronUp, ToggleLeft, ToggleRight, Search, MessageCircle, CheckCircle } from 'lucide-react';
import api from '../lib/api';
import { toast } from 'sonner';
import { AdminRichTextEditor } from './common/AdminRichTextEditor';

interface FAQ {
    _id: string;
    question: string;
    answer: string;
    category: string;
    sort_order: number;
    is_active: boolean;
}

const CATEGORIES = ['General', 'Payments', 'Freelancers', 'Clients', 'Account', 'Projects', 'Gigs'];

export function FAQsManagement() {
    const [faqs, setFaqs] = useState<FAQ[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [editingFAQ, setEditingFAQ] = useState<FAQ | null>(null);
    const [form, setForm] = useState({ question: '', answer: '', category: 'General', sort_order: 0 });
    const [saving, setSaving] = useState(false);

    const fetchFAQs = async () => {
        try {
            setLoading(true);
            const res = await api.get('/cms/faqs');
            setFaqs(res.data.faqs || []);
        } catch {
            toast.error('Failed to load FAQs');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchFAQs(); }, []);

    const resetForm = () => {
        setForm({ question: '', answer: '', category: 'General', sort_order: 0 });
        setEditingFAQ(null);
        setShowForm(false);
    };

    const handleEdit = (faq: FAQ) => {
        setEditingFAQ(faq);
        setForm({ question: faq.question, answer: faq.answer, category: faq.category, sort_order: faq.sort_order });
        setShowForm(true);
    };

    const handleSubmit = async () => {
        if (!form.question.trim() || !form.answer.trim()) {
            toast.error('Question and answer are required');
            return;
        }
        setSaving(true);
        try {
            if (editingFAQ) {
                await api.put(`/cms/faqs/${editingFAQ._id}`, form);
                toast.success('FAQ updated!');
            } else {
                await api.post('/cms/faqs', form);
                toast.success('FAQ created!');
            }
            fetchFAQs();
            resetForm();
        } catch (err: any) {
            toast.error(err?.response?.data?.message || 'Failed to save FAQ');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this FAQ?')) return;
        try {
            await api.delete(`/cms/faqs/${id}`);
            toast.success('FAQ deleted');
            fetchFAQs();
        } catch {
            toast.error('Failed to delete FAQ');
        }
    };

    const handleToggle = async (id: string) => {
        try {
            await api.patch(`/cms/faqs/${id}/toggle`);
            fetchFAQs();
        } catch {
            toast.error('Failed to toggle FAQ');
        }
    };

    const filtered = faqs.filter(f =>
        f.question.toLowerCase().includes(search.toLowerCase()) ||
        f.category.toLowerCase().includes(search.toLowerCase())
    );
    const activeCount = faqs.filter(f => f.is_active).length;
    const categoryCount = [...new Set(faqs.map(f => f.category))].length;
    const inputClass = "w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-[#262626] bg-gray-50 dark:bg-[#262626] focus:outline-none focus:ring-2 focus:ring-[#F24C20]";

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                    <h1 className="text-3xl font-bold text-[#044071] dark:text-white mb-1">FAQ Management</h1>
                    <p className="text-gray-500 dark:text-gray-400">Manage the questions, categories, and answers shown on the website.</p>
                </div>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => { resetForm(); setShowForm(true); }}
                    className="bg-[#F24C20] hover:bg-[#d43a12] text-white px-5 py-3 rounded-xl font-medium flex items-center gap-2 flex-shrink-0"
                >
                    <Plus className="w-5 h-5" />
                    Add FAQ
                </motion.button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                    { label: 'Total FAQs', value: faqs.length, color: 'text-[#044071]' },
                    { label: 'Active', value: activeCount, color: 'text-green-600' },
                    { label: 'Categories', value: categoryCount, color: 'text-[#F24C20]' },
                ].map(s => (
                    <div key={s.label} className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-gray-200 dark:border-[#262626] p-4">
                        <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{s.label}</div>
                    </div>
                ))}
            </div>

            {/* Inline Form */}
            <AnimatePresence>
                {showForm && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-white dark:bg-[#1a1a1a] rounded-2xl border border-[#F24C20]/30 p-6"
                    >
                        <h2 className="text-lg font-bold mb-4 text-[#044071] dark:text-white">
                            {editingFAQ ? 'Edit FAQ' : 'New FAQ'}
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Question *</label>
                                <input
                                    type="text"
                                    value={form.question}
                                    onChange={e => setForm({ ...form, question: e.target.value })}
                                    placeholder="e.g. How do I get paid?"
                                    className={inputClass}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1 italic">Answer *</label>
                                <AdminRichTextEditor
                                    value={form.answer}
                                    onChange={(answer) => setForm({ ...form, answer })}
                                    placeholder="Detailed answer goes here..."
                                    minHeight={220}
                                    toolbarPreset="full"
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Category</label>
                                    <select
                                        value={form.category}
                                        onChange={e => setForm({ ...form, category: e.target.value })}
                                        className={inputClass}
                                    >
                                        {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Sort Order</label>
                                    <input
                                        type="number"
                                        value={form.sort_order}
                                        onChange={e => setForm({ ...form, sort_order: Number(e.target.value) })}
                                        className={inputClass}
                                    />
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <motion.button
                                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                                    onClick={handleSubmit}
                                    disabled={saving}
                                    className="flex items-center gap-2 bg-[#F24C20] hover:bg-[#d43a12] disabled:opacity-60 text-white px-6 py-2.5 rounded-xl font-medium"
                                >
                                    {saving ? 'Saving...' : <><CheckCircle className="w-4 h-4" /> {editingFAQ ? 'Update FAQ' : 'Create FAQ'}</>}
                                </motion.button>
                                <button onClick={resetForm} className="px-6 py-2.5 rounded-xl border border-gray-300 dark:border-[#262626] hover:bg-gray-50 dark:hover:bg-[#262626] transition-colors">
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Search */}
            <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl border border-gray-200 dark:border-[#262626] p-4">
                <div className="flex items-center justify-between gap-4 mb-3">
                    <div>
                        <h2 className="text-lg font-bold text-[#044071] dark:text-white">FAQ Library</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{filtered.length} of {faqs.length} items shown</p>
                    </div>
                </div>
                ))}
            </div>

            {/* Control Strip */}
            <div className="flex flex-row gap-4 items-center bg-white dark:bg-[#1a1a1a] p-3 rounded-2xl border border-gray-100 dark:border-[#262626] shadow-sm">
                <div className="relative flex-1 group">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#F24C20] transition-colors" />
                    <input
                        type="text"
                        placeholder="Search across questions and categories..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full pl-12 pr-6 py-3 rounded-xl border-none bg-gray-50/50 dark:bg-[#0a0a0a] focus:bg-white dark:focus:bg-[#0a0a0a] focus:outline-none focus:ring-2 focus:ring-[#F24C20]/10 transition-all text-sm font-medium"
                    />
                </div>
                <div className="w-[240px]">
                    <select 
                        className="w-full px-6 py-3 rounded-xl border-none bg-gray-50/50 dark:bg-[#0a0a0a] text-[11px] font-bold uppercase tracking-widest text-gray-500 focus:outline-none cursor-pointer hover:bg-gray-100 dark:hover:bg-[#262626] transition-all appearance-none text-center"
                        onChange={(e) => setSearch(e.target.value === 'Filter by Category' ? '' : e.target.value)}
                    >
                        <option>Filter by Category</option>
                        {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                    </select>
                </div>
            </div>

            {/* Edit/Create Form Interface */}
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
                            <h2 className="text-xl font-bold text-[#044071] dark:text-white flex items-center gap-3">
                                {editingFAQ ? <Edit className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                                {editingFAQ ? 'Edit FAQ Content' : 'Add New FAQ Entry'}
                            </h2>
                            <button onClick={resetForm} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-all">
                                <X className="w-5 h-5 text-gray-400" />
                            </button>
                        </div>
                        <div className="space-y-6">
                            <div>
                                <label className="block text-[11px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-2 ml-1">The Question *</label>
                                <input
                                    type="text"
                                    value={form.question}
                                    onChange={e => setForm({ ...form, question: e.target.value })}
                                    placeholder="e.g. How do I update my profile?"
                                    className="w-full px-6 py-3.5 rounded-xl border border-gray-200 dark:border-[#262626] bg-gray-50 dark:bg-[#262626] focus:outline-none focus:ring-2 focus:ring-[#F24C20]/20 transition-all font-semibold text-lg"
                                />
                            </div>
                            <div>
                                <label className="block text-[11px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-2 ml-1">Detailed Answer *</label>
                                <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-[#262626]">
                                    <AdminRichTextEditor
                                        value={form.answer}
                                        onChange={(answer) => setForm({ ...form, answer })}
                                        placeholder="Provide a clear, detailed answer..."
                                        minHeight={250}
                                        toolbarPreset="full"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-[11px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-2 ml-1">Category</label>
                                    <select
                                        value={form.category}
                                        onChange={e => setForm({ ...form, category: e.target.value })}
                                        className="w-full px-6 py-3.5 rounded-xl border border-gray-200 dark:border-[#262626] bg-gray-50 dark:bg-[#262626] focus:outline-none focus:ring-2 focus:ring-[#F24C20]/20 font-semibold"
                                    >
                                        {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-2 ml-1">Sort Order</label>
                                    <input
                                        type="number"
                                        value={form.sort_order}
                                        onChange={e => setForm({ ...form, sort_order: Number(e.target.value) })}
                                        className="w-full px-6 py-3.5 rounded-xl border border-gray-200 dark:border-[#262626] bg-gray-50 dark:bg-[#262626] focus:outline-none focus:ring-2 focus:ring-[#F24C20]/20 font-semibold"
                                    />
                                </div>
                            </div>
                            <div className="flex gap-4 pt-4 border-t border-gray-50 dark:border-[#262626]">
                                <motion.button
                                    whileHover={{ scale: 1.01 }}
                                    whileTap={{ scale: 0.99 }}
                                    onClick={handleSubmit}
                                    disabled={saving}
                                    className="flex-1 flex items-center justify-center gap-2 bg-[#F24C20] hover:bg-[#d43a12] disabled:opacity-60 text-white px-8 py-4 rounded-xl font-bold shadow-lg shadow-[#F24C20]/10 transition-all"
                                >
                                    {saving ? 'Saving...' : <><CheckCircle className="w-5 h-5" /> {editingFAQ ? 'Update FAQ' : 'Publish FAQ'}</>}
                                </motion.button>
                                <button
                                    onClick={resetForm}
                                    className="px-8 py-4 rounded-xl border border-gray-200 dark:border-[#262626] hover:bg-gray-50 dark:hover:bg-gray-800 font-bold text-gray-500 transition-all"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* List View */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <div className="w-8 h-8 border-4 border-[#F24C20]/20 border-t-[#F24C20] rounded-full animate-spin" />
                    <p className="text-gray-400 font-medium text-sm">Loading FAQs...</p>
                </div>
            ) : filtered.length === 0 ? (
                <div className="text-center py-24 bg-gray-50/50 dark:bg-[#1a1a1a]/50 rounded-[1.5rem] border-2 border-dashed border-gray-100 dark:border-[#262626]">
                    <MessageCircle className="w-10 h-10 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 font-medium">No results found.</p>
                </div>
            ) : (
                <div className="flex flex-col gap-4">
                    {filtered.map((faq, index) => (
                        <motion.div
                            key={faq._id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className={`group bg-white dark:bg-[#1a1a1a] rounded-[1.25rem] border transition-all duration-300 ${
                                expandedId === faq._id 
                                ? 'border-[#F24C20]/30 shadow-xl ring-4 ring-[#F24C20]/5' 
                                : 'border-gray-100 dark:border-[#262626] hover:border-gray-300 dark:hover:border-[#333]'
                            } ${!faq.is_active && 'opacity-60'} overflow-hidden shadow-sm`}
                        >
                            <div
                                className="flex items-center gap-6 p-6 cursor-pointer"
                                onClick={() => setExpandedId(expandedId === faq._id ? null : faq._id)}
                            >
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className="text-[10px] uppercase tracking-wider px-3 py-1 rounded-full bg-[#F24C20]/10 text-[#F24C20] font-bold border border-[#F24C20]/10">
                                            {faq.category}
                                        </span>
                                        <span className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">
                                            Order: {faq.sort_order}
                                        </span>
                                    </div>
                                    <p className="font-semibold text-gray-900 dark:text-white text-lg group-hover:text-[#F24C20] transition-colors leading-tight">
                                        {faq.question}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                                    <button
                                        onClick={() => handleToggle(faq._id)}
                                        className="p-2 hover:bg-gray-100 dark:hover:bg-[#262626] rounded-xl transition-colors"
                                    >
                                        {faq.is_active
                                            ? <ToggleRight className="w-6 h-6 text-green-500" />
                                            : <ToggleLeft className="w-6 h-6 text-gray-300" />}
                                    </button>
                                    <button onClick={() => handleEdit(faq)} className="p-2 hover:bg-[#044071]/10 rounded-xl transition-colors">
                                        <Edit className="w-5 h-5 text-[#044071]" />
                                    </button>
                                    <button onClick={() => handleDelete(faq._id)} className="p-2 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-colors">
                                        <Trash2 className="w-5 h-5 text-red-500" />
                                    </button>
                                    <div className="ml-2 pl-4 border-l border-gray-100 dark:border-[#262626]">
                                        <motion.div animate={{ rotate: expandedId === faq._id ? 180 : 0 }}>
                                            <ChevronDown className={`w-5 h-5 ${expandedId === faq._id ? 'text-[#F24C20]' : 'text-gray-300'}`} />
                                        </motion.div>
                                    </div>
                                </div>
                            </div>
                            <AnimatePresence>
                                {expandedId === faq._id && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="px-6 pb-6"
                                    >
                                        <div className="pt-6 border-t border-gray-50 dark:border-[#262626]">
                                            <div
                                                className="prose max-w-none prose-sm leading-relaxed text-gray-600 dark:prose-invert dark:text-gray-400 font-medium"
                                                dangerouslySetInnerHTML={{ __html: faq.answer }}
                                            />
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}

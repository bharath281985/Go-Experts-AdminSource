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
    const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

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
        try {
            await api.delete(`/cms/faqs/${id}`);
            toast.success('FAQ deleted');
            fetchFAQs();
            setDeleteTargetId(null);
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

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-[#044071] dark:text-white mb-1">FAQ Management</h1>
                    <p className="text-gray-500 dark:text-gray-400">Manage frequently asked questions shown on the website</p>
                </div>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => { resetForm(); setShowForm(true); }}
                    className="bg-[#F24C20] hover:bg-[#d43a12] text-white px-6 py-3 rounded-xl font-medium flex items-center gap-2"
                >
                    <Plus className="w-5 h-5" />
                    Add FAQ
                </motion.button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
                {[
                    { label: 'Total FAQs', value: faqs.length, color: 'text-[#044071]' },
                    { label: 'Active', value: faqs.filter(f => f.is_active).length, color: 'text-green-600' },
                    { label: 'Categories', value: [...new Set(faqs.map(f => f.category))].length, color: 'text-[#F24C20]' },
                ].map(s => (
                    <div key={s.label} className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-gray-200 dark:border-[#262626] p-4">
                        <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{s.label}</div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                {/* Create/Edit Panel */}
                <div className={`${showForm ? 'xl:col-span-5' : 'xl:col-span-12'}`}>
                    <AnimatePresence mode="wait">
                        {showForm ? (
                            <motion.div
                                key="form-open"
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -8 }}
                                className="bg-white dark:bg-[#1a1a1a] rounded-2xl border border-[#F24C20]/30 p-6"
                            >
                                <h2 className="text-xl font-bold mb-4 text-[#044071] dark:text-white">
                                    {editingFAQ ? 'Edit FAQ' : 'Create New FAQ'}
                                </h2>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Question *</label>
                                        <input
                                            type="text"
                                            value={form.question}
                                            onChange={e => setForm({ ...form, question: e.target.value })}
                                            placeholder="e.g. How do I get paid?"
                                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-[#262626] bg-gray-50 dark:bg-[#262626] focus:outline-none focus:ring-2 focus:ring-[#F24C20]"
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
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Category</label>
                                            <select
                                                value={form.category}
                                                onChange={e => setForm({ ...form, category: e.target.value })}
                                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-[#262626] bg-gray-50 dark:bg-[#262626] focus:outline-none focus:ring-2 focus:ring-[#F24C20]"
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
                                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-[#262626] bg-gray-50 dark:bg-[#262626] focus:outline-none focus:ring-2 focus:ring-[#F24C20]"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex gap-3">
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
                        ) : (
                            <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl border border-gray-200 dark:border-[#262626] p-6 flex items-center justify-between">
                                <div>
                                    <h2 className="text-xl font-bold text-[#044071] dark:text-white">Create New FAQ</h2>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Add answers that users can quickly understand.</p>
                                </div>
                                <button
                                    onClick={() => { resetForm(); setShowForm(true); }}
                                    className="bg-[#F24C20] hover:bg-[#d43a12] text-white px-5 py-2.5 rounded-xl font-medium"
                                >
                                    Add FAQ
                                </button>
                            </div>
                        )}
                    </AnimatePresence>
                </div>

                {/* List Panel */}
                <div className={`${showForm ? 'xl:col-span-7' : 'xl:col-span-12'} space-y-4`}>
                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                        <input
                            type="text"
                            placeholder="Search FAQs..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full pl-14 pr-4 py-3 rounded-xl border border-gray-200 dark:border-[#262626] bg-white dark:bg-[#1a1a1a] focus:outline-none focus:ring-2 focus:ring-[#F24C20]"
                        />
                    </div>

                    {/* FAQ List */}
                    {loading ? (
                        <div className="text-center py-16 text-gray-400">Loading FAQs...</div>
                    ) : filtered.length === 0 ? (
                        <div className="text-center py-16 bg-white dark:bg-[#1a1a1a] rounded-2xl border border-gray-200 dark:border-[#262626]">
                            <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500">{search ? 'No FAQs match your search.' : 'No FAQs yet. Click "Add FAQ" to create the first one.'}</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {filtered.map((faq, index) => (
                                <motion.div
                                    key={faq._id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.04 }}
                                    className={`bg-white dark:bg-[#1a1a1a] rounded-2xl border ${faq.is_active ? 'border-gray-200 dark:border-[#262626]' : 'border-gray-100 dark:border-[#1a1a1a] opacity-60'} overflow-hidden`}
                                >
                                    <div
                                        className="flex items-center gap-4 p-5 cursor-pointer hover:bg-gray-50 dark:hover:bg-[#262626] transition-colors"
                                        onClick={() => setExpandedId(expandedId === faq._id ? null : faq._id)}
                                    >
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-xs px-2 py-0.5 rounded-full bg-[#F24C20]/10 text-[#F24C20] font-medium">{faq.category}</span>
                                                {!faq.is_active && <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500">Inactive</span>}
                                            </div>
                                            <p className="font-semibold text-gray-900 dark:text-white">{faq.question}</p>
                                        </div>
                                        <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                                            <button onClick={() => handleToggle(faq._id)} className="p-2 hover:bg-gray-100 dark:hover:bg-[#262626] rounded-lg transition-colors">
                                                {faq.is_active
                                                    ? <ToggleRight className="w-5 h-5 text-green-500" />
                                                    : <ToggleLeft className="w-5 h-5 text-gray-400" />}
                                            </button>
                                            <button onClick={() => handleEdit(faq)} className="p-2 hover:bg-[#F24C20]/10 rounded-lg transition-colors">
                                                <Edit className="w-4 h-4 text-[#044071]" />
                                            </button>
                                            <button onClick={() => setDeleteTargetId(faq._id)} className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                                                <Trash2 className="w-4 h-4 text-red-500" />
                                            </button>
                                            {expandedId === faq._id ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                                        </div>
                                    </div>
                                    <AnimatePresence>
                                        {expandedId === faq._id && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                className="px-5 pb-5 border-t border-gray-100 dark:border-[#262626]"
                                            >
                                                <div
                                                className="prose max-w-none pt-4 leading-relaxed text-gray-600 dark:prose-invert dark:text-gray-400"
                                                dangerouslySetInnerHTML={{ __html: faq.answer }}
                                                />
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Delete Confirm Modal */}
            {deleteTargetId && (
                <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="w-full max-w-md rounded-2xl border border-gray-200 dark:border-[#262626] bg-white dark:bg-[#1a1a1a] p-6">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Delete FAQ</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Are you sure you want to delete this FAQ?</p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setDeleteTargetId(null)}
                                className="flex-1 py-2.5 rounded-xl border border-gray-300 dark:border-[#262626] text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#262626] transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleDelete(deleteTargetId)}
                                className="flex-1 py-2.5 rounded-xl bg-red-600 text-white hover:bg-red-700 transition-colors"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

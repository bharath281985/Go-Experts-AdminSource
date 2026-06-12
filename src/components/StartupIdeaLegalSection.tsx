import React, { useState, useEffect } from 'react';
import { Save, AlertCircle, Loader2, Info, Plus, Trash2, Edit, ChevronDown, ToggleLeft, ToggleRight, MessageCircle, Search, HelpCircle } from 'lucide-react';
import api from '../lib/api';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';
import { AdminRichTextEditor } from './common/AdminRichTextEditor';

interface FAQ {
  _id: string;
  question: string;
  answer: string;
  sort_order: number;
  is_active: boolean;
}

interface PageData {
  _id?: string;
  title: string;
  content: string;
  slug: string;
}

interface StartupIdeaLegalSectionProps {
  type: 'faq' | 'terms' | 'privacy';
}

export const StartupIdeaLegalSection: React.FC<StartupIdeaLegalSectionProps> = ({ type }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // For Terms & Privacy
  const [pageData, setPageData] = useState<PageData | null>(null);

  // For FAQ
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [search, setSearch] = useState('');
  const [showFaqForm, setShowFaqForm] = useState(false);
  const [editingFaq, setEditingFaq] = useState<FAQ | null>(null);
  const [faqForm, setFaqForm] = useState({ question: '', answer: '', sort_order: 0 });
  const [expandedFaqId, setExpandedFaqId] = useState<string | null>(null);
  const [deleteFaqId, setDeleteFaqId] = useState<string | null>(null);

  const title = type === 'faq'
    ? 'Startup Ideas FAQ'
    : type === 'terms'
      ? 'Startup Ideas Terms & Conditions'
      : 'Startup Ideas Privacy Policy';

  const fetchData = async () => {
    try {
      setLoading(true);
      if (type === 'faq') {
        const response = await api.get('/cms/startup/faqs/admin');
        setFaqs(response.data.faqs || []);
      } else {
        const response = await api.get(`/cms/startup/${type}`);
        setPageData(response.data.data);
      }
    } catch (error: any) {
      toast.error(`Failed to load ${type} data`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Reset FAQ state when switching types
    setShowFaqForm(false);
    setEditingFaq(null);
    setFaqForm({ question: '', answer: '', sort_order: 0 });
    setSearch('');
  }, [type]);

  // --- Terms & Privacy Handlers ---
  const handleSavePage = async () => {
    if (!pageData) return;
    try {
      setSaving(true);
      await api.put(`/cms/startup/${type}`, { content: pageData.content });
      toast.success(`${title} saved successfully`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  // --- FAQ Handlers ---
  const handleSubmitFaq = async () => {
    if (!faqForm.question.trim() || !faqForm.answer.trim()) {
      toast.error('Question and answer are required');
      return;
    }
    setSaving(true);
    try {
      if (editingFaq) {
        await api.put(`/cms/startup/faqs/${editingFaq._id}`, faqForm);
        toast.success('FAQ updated!');
      } else {
        await api.post('/cms/startup/faqs', faqForm);
        toast.success('FAQ created!');
      }
      fetchData();
      setShowFaqForm(false);
      setEditingFaq(null);
      setFaqForm({ question: '', answer: '', sort_order: 0 });
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to save FAQ');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteFaq = async (id: string) => {
    try {
      await api.delete(`/cms/startup/faqs/${id}`);
      toast.success('FAQ deleted');
      setDeleteFaqId(null);
      fetchData();
    } catch {
      toast.error('Failed to delete FAQ');
    }
  };

  const handleToggleFaq = async (id: string) => {
    try {
      await api.patch(`/cms/startup/faqs/${id}/toggle`);
      fetchData();
    } catch {
      toast.error('Failed to toggle FAQ');
    }
  };

  const handleEditFaq = (faq: FAQ) => {
    setEditingFaq(faq);
    setFaqForm({ question: faq.question, answer: faq.answer, sort_order: faq.sort_order });
    setShowFaqForm(true);
  };

  const filteredFaqs = faqs.filter(f =>
    f.question.toLowerCase().includes(search.toLowerCase()) ||
    f.answer.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-10 h-10 animate-spin text-[#F24C20] mb-4" />
        <p className="text-gray-400">Loading {type} management...</p>
      </div>
    );
  }

  // --- RENDERING FAQ VIEW ---

  // --- RENDERING FAQ VIEW ---
  if (type === 'faq') {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between rounded-2xl border border-[#262626] bg-[#111111] p-6 shadow-lg">
          <div className="flex items-center gap-4">
            <div className="rounded-xl border border-[#F24C20]/20 bg-[#F24C20]/10 p-3">
              <HelpCircle className="w-8 h-8 text-[#F24C20]" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">{title}</h2>
              <p className="text-sm text-slate-400">Manage Q&A for the Startup Ideas ecosystem.</p>
            </div>
          </div>
          {!showFaqForm && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowFaqForm(true)}
              className="flex items-center gap-2 bg-[#F24C20] hover:bg-[#E23C10] text-white px-6 py-3 rounded-xl font-bold transition-all shadow-md"
            >
              <Plus className="w-5 h-5" />
              Add FAQ
            </motion.button>
          )}
        </div>

        {/* Add/Edit Form */}
        <AnimatePresence>
          {showFaqForm && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="rounded-2xl border border-[#262626] bg-[#111111] p-6 shadow-lg"
            >
              <div className="flex items-center justify-between border-b border-[#262626] pb-4 mb-6">
                <h3 className="text-xl font-bold text-white">{editingFaq ? 'Edit FAQ' : 'Create New FAQ'}</h3>
                <button
                  onClick={() => { setShowFaqForm(false); setEditingFaq(null); }}
                  className="text-slate-400 transition-colors hover:text-white text-xl"
                >
                  ×
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-4">
                  <div>
                    <label className="mb-2 block text-sm font-bold uppercase tracking-wider text-slate-400">Question *</label>
                    <input
                      type="text"
                      value={faqForm.question}
                      onChange={e => setFaqForm({ ...faqForm, question: e.target.value })}
                      className="w-full rounded-xl border border-[#303030] bg-[#181818] px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#F24C20]"
                      placeholder="e.g. How does the startup credit system work?"
                    />
                  </div>
                  <div className="prose-editor startup-legal-editor">
                    <label className="mb-2 block text-sm font-bold uppercase tracking-wider text-slate-400">Answer *</label>
                    <AdminRichTextEditor
                      value={faqForm.answer}
                      onChange={(answer) => setFaqForm({ ...faqForm, answer })}
                      placeholder="Enter the detailed answer here..."
                      minHeight={200}
                      toolbarPreset="full"
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="mb-2 block text-sm font-bold uppercase tracking-wider text-slate-400">Sort Order</label>
                    <input
                      type="number"
                      value={faqForm.sort_order}
                      onChange={e => setFaqForm({ ...faqForm, sort_order: parseInt(e.target.value) || 0 })}
                      className="w-full rounded-xl border border-[#303030] bg-[#181818] px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#F24C20]"
                    />
                    <p className="mt-2 text-xs text-slate-500">Determines display sequence on the website.</p>
                  </div>
                  <div className="pt-4 space-y-3">
                    <button
                      onClick={handleSubmitFaq}
                      disabled={saving}
                      className="w-full bg-[#F24C20] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#E23C10] disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                    >
                      {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                      {saving ? 'Saving...' : editingFaq ? 'Update' : 'Publish'}
                    </button>
                    <button
                      onClick={() => { setShowFaqForm(false); setEditingFaq(null); }}
                      className="w-full rounded-xl border border-[#303030] px-6 py-3 font-bold text-slate-300 transition-all hover:bg-[#181818] hover:text-white"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Search Bar */}
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-8 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 pointer-events-none" />
          <input
            type="text"
            placeholder="Search through FAQs..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full rounded-xl border border-[#262626] bg-[#111111] py-3 pl-11 pr-4 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#F24C20] focus:border-transparent"
          />
        </div>

        {/* FAQ Table */}
        <div className="rounded-xl border border-[#262626] bg-[#111111] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#0a0a0a] border-b border-[#262626]">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider w-24">
                    Sort Order
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Question
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-slate-400 uppercase tracking-wider w-28">
                    Status
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-slate-400 uppercase tracking-wider w-36">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#262626]">
                {filteredFaqs.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-16 h-16 rounded-full bg-[#181818] flex items-center justify-center">
                          <MessageCircle className="w-8 h-8 text-slate-600" />
                        </div>
                        <h3 className="text-lg font-bold text-white">
                          {search ? 'No matches found' : 'No FAQs yet'}
                        </h3>
                        <p className="text-sm text-slate-400">
                          {search
                            ? `We couldn't find any FAQ matching "${search}"`
                            : 'Click "Add FAQ" to create your first FAQ'}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredFaqs.map((faq) => (
                    <React.Fragment key={faq._id}>
                      <tr
                        className="hover:bg-[#1a1a1a] transition-colors cursor-pointer"
                        onClick={() => setExpandedFaqId(expandedFaqId === faq._id ? null : faq._id)}
                      >
                        <td className="px-6 py-4 align-middle">
                          <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-[#181818] border border-[#303030] text-white font-bold">
                            {faq.sort_order}
                          </div>
                        </td>
                        <td className="px-6 py-4 align-middle">
                          <div className="max-w-lg">
                            <p className="text-white font-medium line-clamp-2">{faq.question}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center align-middle">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${faq.is_active
                            ? 'bg-emerald-500/10 text-emerald-400'
                            : 'bg-slate-500/10 text-slate-400'
                            }`}>
                            {faq.is_active ? 'Published' : 'Hidden'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right align-middle">
                          <div className="flex items-center justify-end gap-2" onClick={e => e.stopPropagation()}>
                            <button
                              onClick={() => handleToggleFaq(faq._id)}
                              title={faq.is_active ? 'Hide from website' : 'Publish to website'}
                              className={`p-2 rounded-lg transition-all ${faq.is_active
                                ? 'text-emerald-400 hover:bg-emerald-500/10'
                                : 'text-slate-500 hover:bg-[#1d1d1d]'
                                }`}
                            >
                              {faq.is_active ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                            </button>
                            <button
                              onClick={() => handleEditFaq(faq)}
                              className="p-2 rounded-lg text-slate-500 hover:text-[#F24C20] hover:bg-[#F24C20]/10 transition-all"
                            >
                              <Edit className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => setDeleteFaqId(faq._id)}
                              className="p-2 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                            <ChevronDown className={`w-5 h-5 text-slate-500 transition-transform duration-200 ${expandedFaqId === faq._id ? 'rotate-180' : ''}`} />
                          </div>
                        </td>
                      </tr>
                      <AnimatePresence>
                        {expandedFaqId === faq._id && (
                          <tr>
                            <td colSpan={4} className="px-6 py-0 bg-[#0a0a0a]">
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="overflow-hidden"
                              >
                                <div className="p-6 border-t border-[#262626]">
                                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Answer:</h4>
                                  <div
                                    className="prose prose-invert max-w-none"
                                    dangerouslySetInnerHTML={{ __html: faq.answer }}
                                  />
                                </div>
                              </motion.div>
                            </td>
                          </tr>
                        )}
                      </AnimatePresence>
                    </React.Fragment>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          {filteredFaqs.length > 0 && (
            <div className="px-6 py-3 border-t border-[#262626] bg-[#0a0a0a]">
              <p className="text-xs text-slate-500">
                Showing {filteredFaqs.length} of {faqs.length} FAQs
              </p>
            </div>
          )}
        </div>

        <AnimatePresence>
          {deleteFaqId && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 px-4"
            >
              <motion.div
                initial={{ opacity: 0, y: 16, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.98 }}
                className="w-full max-w-md rounded-2xl border border-[#2c2c2c] bg-[#111111] p-6 shadow-2xl"
              >
                <h3 className="text-xl font-bold text-white">Delete FAQ</h3>
                <p className="mt-2 text-sm text-slate-400">
                  Are you sure you want to delete this FAQ? This action cannot be undone.
                </p>
                <div className="mt-6 flex items-center justify-end gap-3">
                  <button
                    onClick={() => setDeleteFaqId(null)}
                    className="rounded-xl border border-[#303030] px-5 py-2.5 font-semibold text-slate-300 transition-all hover:bg-[#1a1a1a] hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleDeleteFaq(deleteFaqId)}
                    className="rounded-xl bg-red-600 px-5 py-2.5 font-semibold text-white transition-all hover:bg-red-500"
                  >
                    Delete
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <style dangerouslySetInnerHTML={{ __html: editorStyles }} />
      </div>
    );
  }

  // --- RENDERING TERMS/PRIVACY VIEW ---
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-1">
          <div className="p-3 rounded-2xl border border-[#F24C20]/20 bg-[#F24C20]/10 flex-shrink-0">
            <AlertCircle className="w-8 h-8 text-[#F24C20]" />
          </div>
          <div className="min-w-0">
            <h2 className="text-3xl font-black text-white mb-1">{title}</h2>
            <p className="text-sm text-slate-400">Manage the specific documentation for the innovation ecosystem.</p>
          </div>
        </div>
        <button
          onClick={handleSavePage}
          disabled={saving}
          className="flex items-center gap-3 bg-[#F24C20] hover:bg-[#E23C10] disabled:opacity-50 text-white px-8 py-4 rounded-2xl font-black transition-all shadow-lg shadow-orange-500/20 flex-shrink-0 whitespace-nowrap"
        >
          {saving ? <Loader2 className="w-6 h-6 animate-spin" /> : <Save className="w-6 h-6" />}
          {saving ? 'Saving...' : 'Save Document'}
        </button>
      </div>

      <div className="rounded-[2rem] border border-[#262626] bg-[#111111] p-8 shadow-[0_24px_80px_rgba(0,0,0,0.35)]">
        <div className="mb-8 flex items-start gap-4 rounded-2xl border border-[#1d3b53] bg-[#0f1c29] p-6">
          <Info className="w-6 h-6 shrink-0 text-[#59b7ff] mt-1" />
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-[#8fd1ff] text-base mb-2">Content & Legal Guidelines</h4>
            <p className="text-sm leading-6 text-slate-300">
              Drafting the {type} is critical for user trust. Ensure all clauses are clear, up-to-date, and visually formatted for readability. This content is specifically gated for the Startup Ideas marketplace.
            </p>
          </div>
        </div>

        <div className="prose-editor startup-legal-editor">
          <AdminRichTextEditor
            value={pageData?.content || ''}
            onChange={(content) => {
              setPageData(prev => (prev ? { ...prev, content } : null));
            }}
            placeholder={`Start drafting the ${title} here...`}
            minHeight={600}
            toolbarPreset="full"
          />
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: editorStyles }} />
    </div>
  );
};

const editorStyles = `
  .startup-legal-editor .admin-rich-text-editor {
    border-radius: 1.5rem !important;
    border: 1px solid #262626 !important;
    background: linear-gradient(180deg, #141414 0%, #101010 100%) !important;
    box-shadow: 0 24px 70px rgba(0, 0, 0, 0.35) !important;
    overflow: hidden !important;
  }
  .startup-legal-editor .ck.ck-editor {
    background: #111111 !important;
    border-radius: 1.5rem !important;
  }
  .startup-legal-editor .ck.ck-toolbar {
    background: #181818 !important;
    border: 0 !important;
    border-bottom: 1px solid #1a1a1a !important;
    border-top-left-radius: 1.5rem !important;
    border-top-right-radius: 1.5rem !important;
    padding: 0.875rem 1.25rem !important;
    gap: 0.5rem !important;
  }
  .startup-legal-editor .ck.ck-editor__main {
    background: #111111 !important;
    border: 0 !important;
  }
  .startup-legal-editor .ck.ck-button,
  .startup-legal-editor .ck.ck-toolbar .ck.ck-toolbar__separator {
    color: #cbd5e1 !important;
    border: 0 !important;
  }
  .startup-legal-editor .ck.ck-toolbar__separator {
    background: transparent !important;
    border: 0 !important;
    width: 0 !important;
  }
  .startup-legal-editor .ck.ck-button:hover {
    background-color: #242424 !important;
  }
  .startup-legal-editor .ck.ck-button.ck-on {
    background-color: rgba(242, 76, 32, 0.18) !important;
    color: #ffffff !important;
  }
  .startup-legal-editor .ck-editor__main .ck-content,
  .startup-legal-editor .admin-rich-text-editor .ck.ck-content {
    display: block !important;
    width: 100% !important;
    background: #111111 !important;
    color: #f8fafc !important;
    border: 0 !important;
    border-bottom-left-radius: 1.5rem !important;
    border-bottom-right-radius: 1.5rem !important;
    min-height: 600px;
    padding: 3rem !important;
    font-size: 1.05rem !important;
    line-height: 1.75 !important;
    letter-spacing: 0.3px !important;
  }
  .startup-legal-editor .ck.ck-placeholder::before {
    color: #64748b !important;
    padding-left: 0.25rem !important;
  }
  .startup-legal-editor .ck.ck-editor__editable.ck-focused:not(.ck-editor__nested-editable) {
    box-shadow: inset 0 0 0 1px rgba(242, 76, 32, 0.35) !important;
  }
  .prose-editor ul, .prose-editor ol {
    padding-left: 2rem;
    margin-bottom: 1.25rem;
    margin-top: 1rem;
  }
  .prose-editor ul { list-style-type: disc; }
  .prose-editor ol { list-style-type: decimal; }
  .prose-editor li {
    margin-bottom: 0.5rem;
    line-height: 1.75;
  }
  .prose-editor h1, .prose-editor h2, .prose-editor h3, .prose-editor h4, .prose-editor h5, .prose-editor h6 {
    margin-top: 1.5rem;
    margin-bottom: 0.875rem;
    line-height: 1.5;
    font-weight: 600;
  }
  .prose-editor p {
    margin-bottom: 1rem;
    line-height: 1.75;
  }
  
  /* Textarea scrollbar */
  textarea::-webkit-scrollbar {
    width: 8px;
  }
  textarea::-webkit-scrollbar-track {
    background: #f9fafb;
  }
  textarea::-webkit-scrollbar-thumb {
    background: #e5e7eb;
    border-radius: 10px;
  }
  textarea::-webkit-scrollbar-thumb:hover {
    background: #d1d5db;
  }
`;

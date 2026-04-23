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
    if (!confirm('Delete this FAQ?')) return;
    try {
      await api.delete(`/cms/startup/faqs/${id}`);
      toast.success('FAQ deleted');
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
  if (type === 'faq') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between rounded-[2rem] border border-[#262626] bg-[#111111] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.28)]">
          <div className="flex items-center gap-4">
            <div className="rounded-2xl border border-[#F24C20]/20 bg-[#F24C20]/10 p-3">
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
              className="flex items-center gap-2 bg-[#F24C20] hover:bg-[#E23C10] text-white px-6 py-3 rounded-xl font-bold transition-all shadow-md shadow-orange-500/10"
            >
              <Plus className="w-5 h-5" />
              Add FAQ
            </motion.button>
          )}
        </div>

        <AnimatePresence>
          {showFaqForm && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="rounded-[2rem] border border-[#262626] bg-[#111111] p-8 shadow-[0_24px_80px_rgba(0,0,0,0.3)]"
            >
              <div className="flex items-center justify-between border-b border-[#262626] pb-4">
                <h3 className="text-xl font-black text-white">{editingFaq ? 'Edit FAQ' : 'Create New FAQ'}</h3>
                <button onClick={() => { setShowFaqForm(false); setEditingFaq(null); }} className="text-slate-400 transition-colors hover:text-white">
                  Close
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="md:col-span-3 space-y-4">
                  <div>
                    <label className="mb-2 block text-sm font-bold uppercase tracking-wider text-slate-400">Question *</label>
                    <input
                      type="text"
                      value={faqForm.question}
                      onChange={e => setFaqForm({ ...faqForm, question: e.target.value })}
                      className="w-full rounded-2xl border border-[#303030] bg-[#181818] px-5 py-3.5 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#F24C20]"
                      placeholder="e.g. How does the startup credit system work?"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-bold uppercase tracking-wider text-slate-400">Answer *</label>
                    <AdminRichTextEditor
                      value={faqForm.answer}
                      onChange={(answer) => setFaqForm({ ...faqForm, answer })}
                      placeholder="Enter the detailed answer here..."
                      minHeight={220}
                      toolbarPreset="compact"
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
                      className="w-full rounded-2xl border border-[#303030] bg-[#181818] px-5 py-3.5 text-white focus:outline-none focus:ring-2 focus:ring-[#F24C20]"
                    />
                    <p className="mt-2 text-[10px] text-slate-500">Determines display sequence on the website.</p>
                  </div>
                  <div className="pt-4 space-y-3">
                    <button
                      onClick={handleSubmitFaq}
                      disabled={saving}
                      className="w-full bg-[#F24C20] text-white px-6 py-4 rounded-2xl font-black hover:bg-[#E23C10] disabled:opacity-50 transition-all flex items-center justify-center gap-3 shadow-lg shadow-orange-500/20"
                    >
                      {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                      {saving ? 'Saving...' : editingFaq ? 'Update' : 'Publish'}
                    </button>
                    <button
                      onClick={() => { setShowFaqForm(false); setEditingFaq(null); }}
                      className="w-full rounded-2xl border border-[#303030] px-6 py-4 font-bold text-slate-300 transition-all hover:bg-[#181818] hover:text-white"
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
        <div className="relative group">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-6 transition-colors group-focus-within:text-[#F24C20]">
            <Search className="h-5 w-5 text-slate-500" />
          </div>
          <input
            type="text"
            placeholder="Search through FAQs..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full rounded-2xl border border-[#262626] bg-[#111111] py-4 pl-14 pr-6 text-base text-white placeholder:text-slate-500 shadow-[0_16px_50px_rgba(0,0,0,0.22)] transition-all focus:border-[#F24C20]/40 focus:outline-none focus:ring-4 focus:ring-[#F24C20]/10"
          />
        </div>

        <div className="space-y-4">
          {filteredFaqs.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }}
              className="rounded-[2rem] border border-dashed border-[#2f2f2f] bg-[#111111] py-24 text-center"
            >
              <div className="mx-auto mb-6 w-fit rounded-full bg-[#181818] p-6">
                <MessageCircle className="h-12 w-12 text-slate-600" />
              </div>
              <h3 className="mb-2 text-xl font-bold text-white">{search ? 'No matches found' : 'Everything is empty'}</h3>
              <p className="mx-auto max-w-xs text-slate-400">
                {search ? `We couldn't find any FAQ covering "${search}"` : 'Start building your knowledge base by clicking Add FAQ'}
              </p>
            </motion.div>
          ) : (
            filteredFaqs.map((faq, index) => (
              <motion.div 
                key={faq._id} 
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`overflow-hidden rounded-[2rem] border bg-[#111111] transition-all duration-300 ${expandedFaqId === faq._id ? 'border-[#F24C20]/30 shadow-[0_24px_80px_rgba(242,76,32,0.08)]' : 'border-[#262626] shadow-[0_18px_60px_rgba(0,0,0,0.22)] hover:border-[#F24C20]/20'}`}
              >
                <div 
                  className="flex items-center gap-6 p-5 cursor-pointer"
                  onClick={() => setExpandedFaqId(expandedFaqId === faq._id ? null : faq._id)}
                >
                  <div className="flex h-14 w-14 flex-col items-center justify-center rounded-2xl border border-[#303030] bg-[#181818] transition-colors">
                    <span className="text-[10px] font-bold uppercase text-slate-500">Order</span>
                    <span className="text-lg font-bold text-white">{faq.sort_order}</span>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="truncate-2-lines text-lg font-bold leading-snug text-white">{faq.question}</h3>
                    <div className="flex items-center gap-3 mt-2">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${faq.is_active ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                        {faq.is_active ? 'Published' : 'Hidden'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                    <button 
                      onClick={() => handleToggleFaq(faq._id)} 
                      title={faq.is_active ? 'Hide from website' : 'Publish to website'}
                      className={`rounded-xl p-2.5 transition-all ${faq.is_active ? 'text-emerald-400 hover:bg-emerald-500/10' : 'text-slate-500 hover:bg-[#1d1d1d]'}`}
                    >
                      {faq.is_active ? <ToggleRight className="w-6 h-6" /> : <ToggleLeft className="w-6 h-6" />}
                    </button>
                    <button 
                      onClick={() => handleEditFaq(faq)} 
                      className="rounded-xl p-2.5 text-slate-500 transition-all hover:bg-[#F24C20]/10 hover:text-[#F24C20]"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => handleDeleteFaq(faq._id)} 
                      className="rounded-xl p-2.5 text-slate-500 transition-all hover:bg-red-500/10 hover:text-red-400"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                    <div className={`p-1 text-slate-600 transition-transform duration-300 ${expandedFaqId === faq._id ? 'rotate-180 text-white' : ''}`}>
                      <ChevronDown className="w-5 h-5" />
                    </div>
                  </div>
                </div>
                
                <AnimatePresence>
                  {expandedFaqId === faq._id && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-[#262626] bg-[#0d0d0d] px-6 pb-8 pt-2"
                    >
                      <div className="rounded-2xl border border-[#262626] bg-[#161616] p-6">
                        <label className="mb-3 block text-[10px] font-black uppercase text-slate-500">Answer</label>
                        <div
                          className="prose max-w-none font-medium text-slate-200 prose-headings:text-white prose-p:text-slate-300 prose-strong:text-white prose-li:text-slate-300"
                          dangerouslySetInnerHTML={{ __html: faq.answer }}
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))
          )}
        </div>

        <style dangerouslySetInnerHTML={{ __html: editorStyles }} />
      </div>
    );
  }

  // --- RENDERING TERMS/PRIVACY VIEW ---
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl border border-[#F24C20]/20 bg-[#F24C20]/10">
            <AlertCircle className="w-8 h-8 text-[#F24C20]" />
          </div>
          <div>
            <h2 className="text-3xl font-black text-white">{title}</h2>
            <p className="text-sm text-slate-400">Manage the specific documentation for the innovation ecosystem.</p>
          </div>
        </div>
        <button
          onClick={handleSavePage}
          disabled={saving}
          className="flex items-center gap-3 bg-[#F24C20] hover:bg-[#E23C10] disabled:opacity-50 text-white px-8 py-4 rounded-2xl font-black transition-all shadow-lg shadow-orange-500/20"
        >
          {saving ? <Loader2 className="w-6 h-6 animate-spin" /> : <Save className="w-6 h-6" />}
          {saving ? 'Saving...' : 'Save Document'}
        </button>
      </div>

      <div className="rounded-[2rem] border border-[#262626] bg-[#111111] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.35)]">
        <div className="mb-6 flex items-start gap-4 rounded-2xl border border-[#1d3b53] bg-[#0f1c29] p-5">
          <Info className="mt-0.5 h-6 w-6 shrink-0 text-[#59b7ff]" />
          <div>
            <h4 className="font-bold text-[#8fd1ff]">Content & Legal Guidelines</h4>
            <p className="mt-1 text-sm leading-7 text-slate-300">
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
    border-radius: 1.75rem !important;
    border: 1px solid #262626 !important;
    background: linear-gradient(180deg, #141414 0%, #101010 100%) !important;
    box-shadow: 0 24px 70px rgba(0, 0, 0, 0.35) !important;
    overflow: hidden !important;
  }
  .startup-legal-editor .ck.ck-editor {
    background: #111111 !important;
    border-radius: 1.75rem !important;
  }
  .startup-legal-editor .ck.ck-toolbar {
    background: #181818 !important;
    border: 0 !important;
    border-bottom: 1px solid #2c2c2c !important;
    border-top-left-radius: 1.75rem !important;
    border-top-right-radius: 1.75rem !important;
    padding: 0.75rem 1rem !important;
  }
  .startup-legal-editor .ck.ck-editor__main {
    background: #111111 !important;
  }
  .startup-legal-editor .ck.ck-button,
  .startup-legal-editor .ck.ck-toolbar .ck.ck-toolbar__separator {
    color: #cbd5e1 !important;
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
    border-bottom-left-radius: 1.75rem !important;
    border-bottom-right-radius: 1.75rem !important;
    min-height: 600px;
    padding: 2.5rem 3rem !important;
    font-size: 1.05rem !important;
    line-height: 1.9 !important;
  }
  .startup-legal-editor .ck.ck-placeholder::before {
    color: #64748b !important;
  }
  .startup-legal-editor .ck.ck-editor__editable.ck-focused:not(.ck-editor__nested-editable) {
    box-shadow: inset 0 0 0 1px rgba(242, 76, 32, 0.35) !important;
  }
  .prose-editor ul, .prose-editor ol {
      padding-left: 1.5rem;
      margin-bottom: 1rem;
  }
  .prose-editor ul { list-style-type: disc; }
  .prose-editor ol { list-style-type: decimal; }
  
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

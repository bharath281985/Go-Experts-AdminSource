import React, { useState, useEffect } from 'react';
// @ts-ignore
import { CKEditor } from '@ckeditor/ckeditor5-react';
// @ts-ignore
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { Save, AlertCircle, CheckCircle2, Loader2, Info, Plus, Trash2, Edit, ChevronDown, ChevronUp, ToggleLeft, ToggleRight, MessageCircle, Search, HelpCircle } from 'lucide-react';
import api from '../lib/api';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';

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
        <div className="flex items-center justify-between bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-orange-50 rounded-2xl">
              <HelpCircle className="w-8 h-8 text-[#F24C20]" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
              <p className="text-gray-500 text-sm">Manage Q&A for the Startup Ideas ecosystem.</p>
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
              className="bg-white border border-gray-200 rounded-3xl p-8 space-y-6 shadow-xl"
            >
              <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <h3 className="text-xl font-black text-gray-900">{editingFaq ? 'Edit FAQ' : 'Create New FAQ'}</h3>
                <button onClick={() => { setShowFaqForm(false); setEditingFaq(null); }} className="text-gray-400 hover:text-gray-900 transition-colors">
                  Close
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="md:col-span-3 space-y-4">
                  <div>
                    <label className="block text-sm font-bold mb-2 text-gray-500 uppercase tracking-wider">Question *</label>
                    <input
                      type="text"
                      value={faqForm.question}
                      onChange={e => setFaqForm({ ...faqForm, question: e.target.value })}
                      className="w-full px-5 py-3.5 rounded-2xl border border-gray-200 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#F24C20] transition-all"
                      placeholder="e.g. How does the startup credit system work?"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-2 text-gray-400 uppercase tracking-wider">Answer (Plain Text) *</label>
                    <textarea
                      value={faqForm.answer}
                      onChange={e => setFaqForm({ ...faqForm, answer: e.target.value })}
                      className="w-full px-5 py-4 rounded-2xl border border-gray-200 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#F24C20] transition-all min-height-[200px]"
                      placeholder="Enter the detailed answer here..."
                      rows={6}
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold mb-2 text-gray-500 uppercase tracking-wider">Sort Order</label>
                    <input
                      type="number"
                      value={faqForm.sort_order}
                      onChange={e => setFaqForm({ ...faqForm, sort_order: parseInt(e.target.value) || 0 })}
                      className="w-full px-5 py-3.5 rounded-2xl border border-gray-200 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#F24C20]"
                    />
                    <p className="text-[10px] text-gray-400 mt-2">Determines display sequence on the website.</p>
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
                      className="w-full text-gray-500 hover:text-gray-900 px-6 py-4 rounded-2xl border border-gray-200 font-bold transition-all hover:bg-gray-50"
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
          <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none transition-colors group-focus-within:text-[#F24C20]">
            <Search className="w-5 h-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search through FAQs..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-14 pr-6 py-4 rounded-2xl border border-gray-100 bg-white text-gray-900 focus:outline-none focus:ring-4 focus:ring-[#F24C20]/5 focus:border-[#F24C20]/30 transition-all text-base placeholder:text-gray-400 shadow-sm"
          />
        </div>

        <div className="space-y-4">
          {filteredFaqs.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }}
              className="text-center py-24 bg-white rounded-[3rem] border border-gray-200 border-dashed"
            >
              <div className="p-6 bg-gray-50 rounded-full w-fit mx-auto mb-6">
                <MessageCircle className="w-12 h-12 text-gray-300" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{search ? 'No matches found' : 'Everything is empty'}</h3>
              <p className="text-gray-500 max-w-xs mx-auto">
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
                className={`bg-white border ${expandedFaqId === faq._id ? 'border-[#F24C20]/30' : 'border-gray-100'} rounded-[2rem] overflow-hidden hover:border-[#F24C20]/20 transition-all duration-300 shadow-sm`}
              >
                <div 
                  className="flex items-center gap-6 p-5 cursor-pointer"
                  onClick={() => setExpandedFaqId(expandedFaqId === faq._id ? null : faq._id)}
                >
                  <div className="flex flex-col items-center justify-center w-14 h-14 bg-gray-50 rounded-2xl border border-gray-100 group-hover:bg-white transition-colors">
                    <span className="text-[10px] uppercase font-bold text-gray-400">Order</span>
                    <span className="text-lg font-bold text-gray-900">{faq.sort_order}</span>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 text-lg leading-snug truncate-2-lines">{faq.question}</h3>
                    <div className="flex items-center gap-3 mt-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${faq.is_active ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                        {faq.is_active ? 'Published' : 'Hidden'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                    <button 
                      onClick={() => handleToggleFaq(faq._id)} 
                      title={faq.is_active ? 'Hide from website' : 'Publish to website'}
                      className={`p-2.5 rounded-xl transition-all ${faq.is_active ? 'text-green-600 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-100'}`}
                    >
                      {faq.is_active ? <ToggleRight className="w-6 h-6" /> : <ToggleLeft className="w-6 h-6" />}
                    </button>
                    <button 
                      onClick={() => handleEditFaq(faq)} 
                      className="p-2.5 text-gray-400 hover:text-[#F24C20] hover:bg-orange-50 rounded-xl transition-all"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => handleDeleteFaq(faq._id)} 
                      className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                    <div className={`p-1 text-gray-300 transition-transform duration-300 ${expandedFaqId === faq._id ? 'rotate-180 text-gray-900' : ''}`}>
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
                      className="px-6 pb-8 pt-2 border-t border-gray-100 bg-gray-50/30"
                    >
                      <div className="p-6 bg-gray-50 rounded-2xl border border-gray-200/50">
                        <label className="text-[10px] font-black uppercase text-gray-400 mb-3 block">Answer</label>
                        <p className="text-gray-600 leading-relaxed whitespace-pre-wrap font-medium">
                          {faq.answer}
                        </p>
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
          <div className="p-3 bg-blue-500/10 rounded-2xl">
            <AlertCircle className="w-8 h-8 text-blue-400" />
          </div>
          <div>
            <h2 className="text-3xl font-black text-gray-900">{title}</h2>
            <p className="text-gray-500 text-sm">Manage the specific documentation for the innovation ecosystem.</p>
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

      <div className="bg-white border border-gray-200 rounded-[2.5rem] p-10">
        <div className="flex items-start gap-4 p-5 bg-blue-50 border border-blue-100 rounded-2xl mb-10">
          <Info className="w-6 h-6 text-blue-500 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-blue-600">Content & Legal Guidelines</h4>
            <p className="text-sm text-gray-500 mt-1">
              Drafting the {type} is critical for user trust. Ensure all clauses are clear, up-to-date, and visually formatted for readability. This content is specifically gated for the Startup Ideas marketplace.
            </p>
          </div>
        </div>

        <div className="prose-editor light-editor">
          <CKEditor
            editor={ClassicEditor}
            data={pageData?.content || ''}
            config={{
              placeholder: `Start drafting the ${title} here...`,
              toolbar: [
                'heading', '|', 'bold', 'italic', 'link', 'bulletedList', 'numberedList', 'blockQuote', '|', 'undo', 'redo'
              ]
            }}
            onChange={(_event: any, editor: any) => {
              const data = editor.getData();
              setPageData(prev => prev ? { ...prev, content: data } : null);
            }}
          />
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: editorStyles }} />
    </div>
  );
};

const editorStyles = `
  .light-editor .ck-editor__main .ck-content {
    background-color: #f9fafb !important;
    color: #111827 !important;
    border-bottom-left-radius: 2rem !important;
    border-bottom-right-radius: 2rem !important;
    min-height: 600px;
    border: 1px solid #e5e7eb !important;
    padding: 3rem !important;
    font-size: 1.1rem !important;
    line-height: 1.8 !important;
  }
  .light-editor .ck-toolbar {
    background-color: #ffffff !important;
    border: 1px solid #e5e7eb !important;
    border-top-left-radius: 2rem !important;
    border-top-right-radius: 2rem !important;
    padding: 0.5rem 1rem !important;
  }
  .light-editor .ck-button {
    color: #4b5563 !important;
  }
  .light-editor .ck-button:hover {
    background-color: #f3f4f6 !important;
  }
  .light-editor .ck-button.ck-on {
    background-color: #F24C20 !important;
    color: white !important;
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

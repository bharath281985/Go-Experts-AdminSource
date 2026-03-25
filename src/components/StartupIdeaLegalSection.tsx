import React, { useState, useEffect } from 'react';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { Save, AlertCircle, CheckCircle2, Loader2, Info } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

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
  const [pageData, setPageData] = useState<PageData | null>(null);

  const slug = `startup-ideas-${type}`;
  const title = type === 'faq' 
    ? 'Startup Ideas FAQ' 
    : type === 'terms' 
      ? 'Startup Ideas Terms & Conditions' 
      : 'Startup Ideas Privacy Policy';

  const fetchPage = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/pages`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const page = response.data.pages?.find((p: any) => p.slug === slug);
      if (page) {
        setPageData(page);
      } else {
        // Prepare initial state if page doesn't exist
        setPageData({
          title,
          slug,
          content: ''
        });
      }
    } catch (error: any) {
      toast.error('Failed to load page content');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPage();
  }, [type]);

  const handleSave = async () => {
    if (!pageData) return;
    
    try {
      setSaving(true);
      const token = localStorage.getItem('token');
      
      if (pageData._id) {
        // Update
        await axios.put(`${import.meta.env.VITE_API_URL}/api/admin/pages/${pageData._id}`, pageData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        // Create
        const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/admin/pages`, pageData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setPageData(response.data.page);
      }
      
      toast.success(`${title} saved successfully`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-10 h-10 animate-spin text-[#F24C20] mb-4" />
        <p className="text-gray-400">Loading editor...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-white">{title}</h2>
          <p className="text-gray-400 text-sm mt-1">Manage the specific {type} documentation for the innovation ecosystem.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-[#F24C20] hover:bg-[#E23C10] disabled:opacity-50 text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-orange-500/20"
        >
          {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div className="bg-[#1a1a1a] border border-[#262626] rounded-3xl p-8">
        <div className="flex items-start gap-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-2xl mb-8">
          <Info className="w-6 h-6 text-blue-400 shrink-0" />
          <div>
            <h4 className="font-bold text-blue-400">Content Guidelines</h4>
            <p className="text-sm text-gray-400 mt-1">
              Use the editor below to draft your {type}. This content is specifically gated for the Startup Ideas marketplace and will be presented to users during the submission and unlocking process.
            </p>
          </div>
        </div>

        <div className="prose-editor dark-editor">
          <CKEditor
            editor={ClassicEditor}
            data={pageData?.content || ''}
            config={{
              placeholder: `Draft your ${title} here...`,
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

      <style dangerouslySetInnerHTML={{ __html: `
        .dark-editor .ck-editor__main .ck-content {
          background-color: #0a0a0a !important;
          color: #f5f5f5 !important;
          border-bottom-left-radius: 1.5rem !important;
          border-bottom-right-radius: 1.5rem !important;
          min-height: 500px;
          border: 1px solid #262626 !important;
          padding: 2rem !important;
        }
        .dark-editor .ck-toolbar {
          background-color: #1a1a1a !important;
          border: 1px solid #262626 !important;
          border-top-left-radius: 1.5rem !important;
          border-top-right-radius: 1.5rem !important;
        }
        .dark-editor .ck-button {
          color: #9ca3af !important;
        }
        .dark-editor .ck-button:hover {
          background-color: #262626 !important;
        }
        .dark-editor .ck-button.ck-on {
          background-color: #F24C20 !important;
          color: white !important;
        }
      `}} />
    </div>
  );
};

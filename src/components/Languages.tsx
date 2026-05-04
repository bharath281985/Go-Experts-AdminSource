import { motion } from 'motion/react';
import { useState } from 'react';
import { Plus, Edit, Trash2, Globe, CheckCircle } from 'lucide-react';
import { Breadcrumb } from './Breadcrumb';

interface LanguagesProps {
  onNavigate: (page: string) => void;
}

export function Languages({ onNavigate }: LanguagesProps) {
  const [showForm, setShowForm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const languages = [
    { id: 1, name: 'English', code: 'en', level: 'Native', users: 2145, status: 'active' },
    { id: 2, name: 'Hindi', code: 'hi', level: 'Fluent', users: 1834, status: 'active' },
    { id: 3, name: 'Spanish', code: 'es', level: 'Professional', users: 892, status: 'active' },
    { id: 4, name: 'French', code: 'fr', level: 'Professional', users: 654, status: 'active' },
    { id: 5, name: 'German', code: 'de', level: 'Professional', users: 543, status: 'active' },
    { id: 6, name: 'Arabic', code: 'ar', level: 'Conversational', users: 432, status: 'active' },
    { id: 7, name: 'Chinese', code: 'zh', level: 'Professional', users: 387, status: 'active' },
    { id: 8, name: 'Japanese', code: 'ja', level: 'Conversational', users: 276, status: 'active' },
    { id: 9, name: 'Portuguese', code: 'pt', level: 'Professional', users: 234, status: 'active' },
    { id: 10, name: 'Russian', code: 'ru', level: 'Conversational', users: 198, status: 'active' },
  ];

  const handleCreate = () => {
    setShowSuccess(true);
    setShowForm(false);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  return (
    <div className="max-w-[1300px] mx-auto space-y-8 pb-16 px-6">
      <div className="mt-4">
        <Breadcrumb 
          items={[{ label: 'Taxonomies', path: 'categories' }, { label: 'Languages' }]} 
          onNavigate={onNavigate}
        />
      </div>

      {/* Header - Professional Alignment */}
      <div className="flex items-center justify-between border-b border-gray-100 dark:border-[#262626] pb-6 mt-4">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold text-[#044071] dark:text-white mb-1">Global Languages</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm font-medium italic opacity-70">"Strategic configuration of linguistic options for the global talent marketplace."</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowForm(!showForm)}
          className="bg-[#F24C20] hover:bg-orange-600 text-white px-8 py-3.5 rounded-xl font-bold flex items-center gap-2 shadow-xl shadow-orange-500/20 text-xs uppercase tracking-widest transition-all"
        >
          <Plus className="w-5 h-5" />
          Enroll Language
        </motion.button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Form and Search Section */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white dark:bg-[#1a1a1a] rounded-[2rem] border border-gray-100 dark:border-[#262626] p-4 shadow-sm">
             <div className="relative">
                <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                <input
                  type="text"
                  placeholder="Filter linguistic assets..."
                  className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-transparent bg-gray-50/50 dark:bg-[#262626] focus:bg-white dark:focus:bg-[#1a1a1a] focus:ring-2 focus:ring-[#F24C20]/20 transition-all outline-none text-sm font-medium"
                />
              </div>
          </div>

          <AnimatePresence>
            {showForm && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="bg-white dark:bg-[#1a1a1a] rounded-[2rem] p-8 border border-gray-100 dark:border-[#262626] shadow-2xl shadow-[#044071]/5"
              >
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="font-bold text-[#044071] dark:text-white text-lg tracking-tight">New Language</h3>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Linguistic Asset</p>
                  </div>
                  <button onClick={() => setShowForm(false)} className="p-2 hover:bg-gray-50 dark:hover:bg-[#262626] rounded-full transition-colors"><X className="w-5 h-5 text-gray-400" /></button>
                </div>
                
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Linguistic Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Italian (Standard)"
                      className="w-full px-5 py-4 rounded-2xl border border-gray-100 dark:border-[#262626] bg-gray-50/50 dark:bg-[#262626] focus:bg-white dark:focus:bg-[#1a1a1a] focus:ring-2 focus:ring-[#F24C20]/20 transition-all outline-none font-bold text-gray-900 dark:text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">ISO Code</label>
                    <input
                      type="text"
                      placeholder="e.g. it"
                      className="w-full px-5 py-4 rounded-2xl border border-gray-100 dark:border-[#262626] bg-gray-50/50 dark:bg-[#262626] focus:bg-white dark:focus:bg-[#1a1a1a] focus:ring-2 focus:ring-[#F24C20]/20 transition-all outline-none font-mono font-bold text-[#F24C20]"
                    />
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleCreate}
                    className="w-full bg-[#044071] hover:bg-[#0a5ea3] text-white px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-2 shadow-xl shadow-[#044071]/10"
                  >
                    Authorize Language
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {showSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-green-50 border border-green-100 rounded-2xl p-5 flex items-center gap-4"
            >
              <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center text-green-600">
                <CheckCircle className="w-5 h-5" />
              </div>
              <div>
                <p className="text-green-800 font-bold text-sm">Language Enrolled</p>
                <p className="text-green-600/70 text-[10px] font-bold uppercase tracking-widest">Protocol Success</p>
              </div>
            </motion.div>
          )}
        </div>

        {/* Assets Grid */}
        <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          {languages.map((language, index) => (
            <motion.div
              key={language.id}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}
              className="bg-white dark:bg-[#1a1a1a] rounded-[2.5rem] p-8 border border-gray-100 dark:border-[#262626] group hover:shadow-2xl hover:border-[#F24C20]/10 transition-all duration-500 overflow-hidden relative"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-gray-50/50 dark:bg-white/5 rounded-bl-[2.5rem] flex items-center justify-center text-gray-200 group-hover:text-[#F24C20]/10 transition-colors">
                <span className="text-3xl font-black uppercase">{language.code}</span>
              </div>

              <div className="flex items-start justify-between mb-6 relative z-10">
                <div className="p-4 rounded-2xl bg-[#044071]/5 text-[#044071] group-hover:bg-[#F24C20] group-hover:text-white transition-all duration-500">
                  <Globe className="w-6 h-6" />
                </div>
                <span className="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.2em] bg-green-50 text-green-600 border border-green-100">
                  {language.status}
                </span>
              </div>

              <div className="relative z-10">
                <h3 className="text-xl font-bold text-[#044071] dark:text-white mb-1 group-hover:text-[#F24C20] transition-colors">{language.name}</h3>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest opacity-70 italic mb-6">ISO Identity: {language.code}</p>

                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="p-4 bg-gray-50/50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-[#262626]">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Proficiency</p>
                    <p className="text-sm font-bold text-gray-700 dark:text-gray-300">{language.level}</p>
                  </div>
                  <div className="p-4 bg-gray-50/50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-[#262626]">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Market Users</p>
                    <p className="text-sm font-bold text-[#F24C20]">{language.users.toLocaleString()}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button className="flex-1 bg-gray-50 dark:bg-[#262626] hover:bg-[#044071] hover:text-white text-gray-600 dark:text-gray-300 px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all">
                    <Edit className="w-3.5 h-3.5" />
                    Configure
                  </button>
                  <button className="p-3 rounded-xl border border-gray-100 dark:border-[#262626] text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

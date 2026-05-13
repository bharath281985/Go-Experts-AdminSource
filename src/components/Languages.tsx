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
    <div>
      <Breadcrumb 
        items={[{ label: 'Taxonomies', path: 'categories' }, { label: 'Languages' }]} 
        onNavigate={onNavigate}
      />

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-[#044071] dark:text-white mb-2">Languages</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage language options for freelancers</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowForm(!showForm)}
          className="bg-[#F24C20] hover:bg-[#d43a12] text-white px-6 py-3 rounded-xl font-medium flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Language
        </motion.button>
      </div>

      {showSuccess && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 mb-6 flex items-center gap-3"
        >
          <CheckCircle className="w-5 h-5 text-green-600" />
          <span className="text-green-800 dark:text-green-200 font-medium">Language added successfully!</span>
        </motion.div>
      )}

      {showForm && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-white dark:bg-[#1a1a1a] rounded-2xl p-6 border border-gray-200 dark:border-[#262626] mb-6"
        >
          <h3 className="font-bold mb-4 text-[#044071] dark:text-white">Add New Language</h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-2">Language Name</label>
              <input
                type="text"
                placeholder="e.g., Italian"
                className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-[#262626] bg-transparent focus:outline-none focus:ring-2 focus:ring-[#F24C20]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Language Code</label>
              <input
                type="text"
                placeholder="e.g., it"
                className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-[#262626] bg-transparent focus:outline-none focus:ring-2 focus:ring-[#F24C20]"
              />
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleCreate}
            className="w-full bg-[#F24C20] hover:bg-[#d43a12] text-white px-4 py-2 rounded-lg font-medium"
          >
            Create Language
          </motion.button>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {languages.map((language, index) => (
          <motion.div
            key={language.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ y: -4 }}
            className="bg-white dark:bg-[#1a1a1a] rounded-2xl p-6 border border-gray-200 dark:border-[#262626]"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 rounded-xl" style={{ backgroundColor: 'rgba(242, 76, 32, 0.1)' }}>
                <Globe className="w-6 h-6 text-[#F24C20]" />
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400">
                {language.status}
              </span>
            </div>

            <h3 className="text-xl font-bold text-[#044071] dark:text-white mb-2">{language.name}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Code: {language.code}</p>

            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Proficiency Level:</span>
                <span className="font-medium">{language.level}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Users:</span>
                <span className="font-bold text-[#F24C20]">{language.users.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex-1 bg-[#044071] hover:bg-[#033559] text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2"
              >
                <Edit className="w-4 h-4" />
                Edit
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-4 py-2 rounded-lg border border-red-600 text-red-600 hover:bg-red-600 hover:text-white transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </motion.button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

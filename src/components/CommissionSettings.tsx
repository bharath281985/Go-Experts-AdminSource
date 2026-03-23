import { motion } from 'motion/react';
import { Save, Percent } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner@2.0.3';

export function CommissionSettings() {
  const [platformCommission, setPlatformCommission] = useState(15);
  const [projectCommission, setProjectCommission] = useState(12);
  const [gigCommission, setGigCommission] = useState(18);

  const handleSave = () => {
    toast.success('Commission settings saved successfully!');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Commission Settings</h1>
        <p className="text-gray-600 dark:text-gray-400">Configure platform commission rates</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200 dark:border-gray-700"
      >
        <div className="space-y-8">
          <div>
            <label className="block text-sm font-semibold mb-4">Platform Default Commission</label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="0"
                max="30"
                value={platformCommission}
                onChange={(e) => setPlatformCommission(Number(e.target.value))}
                className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex items-center gap-2 bg-blue-100 dark:bg-blue-900/20 px-4 py-2 rounded-lg min-w-[100px]">
                <Percent className="w-5 h-5 text-blue-600" />
                <span className="text-xl font-bold text-blue-600">{platformCommission}%</span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-4">Project Commission</label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="0"
                max="30"
                value={projectCommission}
                onChange={(e) => setProjectCommission(Number(e.target.value))}
                className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex items-center gap-2 bg-green-100 dark:bg-green-900/20 px-4 py-2 rounded-lg min-w-[100px]">
                <Percent className="w-5 h-5 text-green-600" />
                <span className="text-xl font-bold text-green-600">{projectCommission}%</span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-4">Gig Commission</label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="0"
                max="30"
                value={gigCommission}
                onChange={(e) => setGigCommission(Number(e.target.value))}
                className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex items-center gap-2 bg-purple-100 dark:bg-purple-900/20 px-4 py-2 rounded-lg min-w-[100px]">
                <Percent className="w-5 h-5 text-purple-600" />
                <span className="text-xl font-bold text-purple-600">{gigCommission}%</span>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSave}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-medium flex items-center gap-2"
            >
              <Save className="w-5 h-5" />
              Save Settings
            </motion.button>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-blue-50 dark:bg-blue-900/10 rounded-2xl p-6 border border-blue-200 dark:border-blue-800"
      >
        <h3 className="font-bold mb-2">Commission Calculation Preview</h3>
        <div className="space-y-2 text-sm">
          <p>• Project worth ₹10,000 → Platform earns ₹{(10000 * projectCommission / 100).toLocaleString()}</p>
          <p>• Gig worth ₹5,000 → Platform earns ₹{(5000 * gigCommission / 100).toLocaleString()}</p>
        </div>
      </motion.div>
    </div>
  );
}

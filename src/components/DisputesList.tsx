import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { AlertCircle, Eye, Scale, Loader2 } from 'lucide-react';
import api from '../lib/api';
import { toast } from 'sonner';

interface DisputesListProps {
  onSelectDispute: (disputeId: string) => void;
}

export function DisputesList({ onSelectDispute }: DisputesListProps) {
  const [disputes, setDisputes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    fetchDisputes();
  }, []);

  const fetchDisputes = async () => {
    try {
      setLoading(true);
      setLoadError('');
      const response = await api.get('/admin/disputes');
      if (response.data.success) {
        setDisputes(Array.isArray(response.data.disputes) ? response.data.disputes : []);
      } else {
        setDisputes([]);
        setLoadError(response.data?.message || 'Could not load disputes right now.');
      }
    } catch (error) {
      console.error('Error fetching disputes:', error);
      setDisputes([]);
      setLoadError('Failed to fetch disputes');
      toast.error('Failed to fetch disputes');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Disputes Management</h1>
        <p className="text-gray-600 dark:text-gray-400">Review and resolve disputes between buyers and sellers</p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-20 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
            <Loader2 className="w-10 h-10 text-[#F24C20] animate-spin mb-4" />
            <p className="text-gray-500">Loading disputes...</p>
          </div>
        ) : loadError ? (
          <div className="flex flex-col items-center justify-center p-20 bg-white dark:bg-gray-800 rounded-2xl border border-red-200 dark:border-red-900/30 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Unable to load disputes</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">{loadError}</p>
            <button
              onClick={fetchDisputes}
              className="bg-[#F24C20] hover:bg-[#d94317] text-white px-5 py-2.5 rounded-xl font-medium"
            >
              Retry
            </button>
          </div>
        ) : disputes.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-20 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 text-center">
            <AlertCircle className="w-12 h-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">No disputes found</h3>
            <p className="text-gray-500">All conflicts are currently settled.</p>
          </div>
        ) : (
          disputes.map((dispute, index) => (
            <motion.div
              key={dispute?._id || dispute?.id || `dispute-${index}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.01 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 cursor-pointer"
              onClick={() => {
                const disputeId = dispute?._id || dispute?.id;
                if (disputeId) {
                  onSelectDispute(disputeId);
                }
              }}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="font-mono text-sm text-gray-600 dark:text-gray-400">
                      #{String(dispute?._id || dispute?.id || 'N/A').slice(-6)}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${dispute.status === 'resolved'
                        ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                        : dispute.status === 'under_review'
                          ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
                          : 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400'
                      }`}>
                      {(dispute.status || 'open').replace('_', ' ').toUpperCase()}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${dispute.priority === 'high'
                        ? 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400'
                        : dispute.priority === 'medium'
                          ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-400'
                      }`}>
                      {(dispute.priority || 'medium').toUpperCase()} PRIORITY
                    </span>
                  </div>

                  <h3 className="font-bold text-lg mb-2">{dispute?.title || 'Untitled dispute'}</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">{dispute?.description || 'No dispute description provided.'}</p>

                  <div className="flex flex-wrap items-center gap-4 text-sm mt-4">
                    <div className="flex flex-col">
                      <span className="text-xs text-gray-500 uppercase tracking-wider">Buyer</span>
                      <span className="font-medium text-gray-900 dark:text-white">{dispute.buyer?.full_name || 'Anonymous'}</span>
                    </div>
                    <div className="h-8 w-px bg-gray-200 dark:bg-gray-700 hidden sm:block"></div>
                    <div className="flex flex-col">
                      <span className="text-xs text-gray-500 uppercase tracking-wider">Seller</span>
                      <span className="font-medium text-gray-900 dark:text-white">{dispute.seller?.full_name || 'Anonymous'}</span>
                    </div>
                    <div className="h-8 w-px bg-gray-200 dark:bg-gray-700 hidden sm:block"></div>
                    <div className="flex flex-col">
                      <span className="text-xs text-gray-500 uppercase tracking-wider">Created</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {dispute?.created_at ? new Date(dispute.created_at).toLocaleDateString() : 'Unknown'}
                      </span>
                    </div>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    const disputeId = dispute?._id || dispute?.id;
                    if (disputeId) {
                      onSelectDispute(disputeId);
                    }
                  }}
                  className="ml-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 h-fit"
                >
                  <Eye className="w-4 h-4" />
                  Review
                </motion.button>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Search, Eye, CheckCircle, Pause, Star, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import api from '../lib/api';

export function GigsList() {
  const [gigs, setGigs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'live' | 'paused' | 'closed'>('all');

  useEffect(() => {
    fetchGigs();
  }, []);

  const fetchGigs = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/gigs');
      if (response.data.success) {
        setGigs(response.data.gigs);
      }
    } catch (error) {
      console.error('Error fetching gigs:', error);
      toast.error('Failed to fetch gigs');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      const response = await api.put(`/admin/gigs/${id}/status`, { status: newStatus });
      if (response.data.success) {
        toast.success(`Gig status updated to ${newStatus}`);
        setGigs(gigs.map(gig => gig._id === id ? { ...gig, status: newStatus } : gig));
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update status');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this gig?')) return;
    try {
      const response = await api.delete(`/admin/gigs/${id}`);
      if (response.data.success) {
        toast.success('Gig deleted successfully');
        setGigs(gigs.filter(gig => gig._id !== id));
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete gig');
    }
  };

  const filteredGigs = gigs.filter(gig => {
    const matchesSearch = (gig.title || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || (gig.status || 'pending') === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Gigs Management</h1>
        <p className="text-gray-600 dark:text-gray-400">Manage all gig listings and approvals</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search gigs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="live">Live</option>
              <option value="paused">Paused</option>
              <option value="closed">Closed</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden min-h-[400px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-20">
            <Loader2 className="w-10 h-10 text-[#F24C20] animate-spin mb-4" />
            <p className="text-gray-500">Loading gigs...</p>
          </div>
        ) : filteredGigs.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-20">
            <p className="text-gray-500">No gigs found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
            {filteredGigs.map((gig, index) => (
              <motion.div
                key={gig._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -4 }}
                className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm flex flex-col"
              >
                {gig.thumbnail ? (
                  <img
                    src={gig.thumbnail.startsWith('http') ? gig.thumbnail : `${import.meta.env.VITE_API_URL}${gig.thumbnail}`}
                    alt={gig.title}
                    className="w-full h-48 object-cover"
                  />
                ) : (
                  <div className="w-full h-48 bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                    <Eye className="w-12 h-12 text-gray-400" />
                  </div>
                )}
                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex items-center justify-between mb-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${gig.status === 'live'
                      ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                      : gig.status === 'pending'
                        ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-400'
                      }`}>
                      {(gig.status || 'Pending').toUpperCase()}
                    </span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">{gig.category}</span>
                  </div>

                  <h3 className="font-bold text-lg mb-2 line-clamp-2 text-[#044071] dark:text-white">{gig.title}</h3>

                  <div className="mb-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{gig.description}</p>
                  </div>

                  <div className="flex items-center justify-between mb-4 mt-auto">
                    <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      {gig.rating || 'N/A'}
                    </span>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Investment</p>
                      <span className="text-lg font-bold text-[#F24C20]">₹{(gig.investment_required || 0).toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {gig.status === 'pending' && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleUpdateStatus(gig._id, 'live')}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-1"
                      >
                        <CheckCircle className="w-3 h-3" />
                        Approve
                      </motion.button>
                    )}
                    {gig.status === 'live' && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleUpdateStatus(gig._id, 'paused')}
                        className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white py-2 rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-1"
                      >
                        <Pause className="w-3 h-3" />
                        Pause
                      </motion.button>
                    )}
                    {gig.status === 'paused' && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleUpdateStatus(gig._id, 'live')}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-1"
                      >
                        <CheckCircle className="w-3 h-3" />
                        Resume
                      </motion.button>
                    )}
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => window.open(`http://localhost:5175/gigs/${gig._id}`, '_blank')}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-1"
                    >
                      <Eye className="w-3 h-3" />
                      View
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleUpdateStatus(gig._id, 'closed')}
                      className="flex-1 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 py-2 rounded-lg text-xs font-medium transition-colors"
                    >
                      Close
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleDelete(gig._id)}
                      className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

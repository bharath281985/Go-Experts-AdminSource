import { motion } from 'motion/react';
import { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle, X, Download, Clock, DollarSign, MessageSquare, AlertTriangle, Loader2, Package } from 'lucide-react';
import { Breadcrumb } from './Breadcrumb';
import { toast } from 'sonner';
import api from '../lib/api';

interface GigOrderDetailsProps {
  orderId: string;
  onBack: () => void;
  onNavigate: (page: string) => void;
}

export function GigOrderDetails({ orderId, onBack, onNavigate }: GigOrderDetailsProps) {
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [actionType, setActionType] = useState<'completed' | 'cancelled' | 'refunded' | null>(null);

  useEffect(() => {
    fetchOrderDetails();
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/admin/gig-orders/${orderId}`);
      if (response.data.success) {
        setOrder(response.data.order);
      }
    } catch (error) {
      console.error('Error fetching order details:', error);
      toast.error('Failed to fetch order details');
      onBack();
    } finally {
      setLoading(false);
    }
  };

  const handleAction = (type: typeof actionType) => {
    setActionType(type);
    setShowConfirmDialog(true);
  };

  const confirmAction = async () => {
    if (!actionType) return;
    try {
      const response = await api.put(`/admin/gig-orders/${orderId}/status`, { status: actionType });
      if (response.data.success) {
        toast.success(`Order marked as ${actionType}`);
        setOrder({ ...order, status: actionType });
        setShowConfirmDialog(false);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update order');
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400',
      in_progress: 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400',
      delivered: 'bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400',
      completed: 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400',
      cancelled: 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400',
      refunded: 'bg-gray-100 dark:bg-gray-900/20 text-gray-700 dark:text-gray-400'
    };
    return styles[status as keyof typeof styles] || styles.pending;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 min-h-[400px]">
        <Loader2 className="w-10 h-10 text-[#F24C20] animate-spin mb-4" />
        <p className="text-gray-500">Loading order details...</p>
      </div>
    );
  }

  if (!order) return null;

  return (
    <div>
      <Breadcrumb
        items={[{ label: 'Gigs', path: 'gigs' }, { label: 'Gig Orders', path: 'gig-orders' }, { label: `Order #${orderId.slice(-8).toUpperCase()}` }]}
        onNavigate={onNavigate}
      />

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onBack}
            className="p-2 hover:bg-gray-100 dark:hover:bg-[#262626] rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </motion.button>
          <div>
            <h1 className="text-3xl font-bold text-[#044071] dark:text-white">Order #{orderId.slice(-8).toUpperCase()}</h1>
            <p className="text-gray-600 dark:text-gray-400">Gig order details and management</p>
          </div>
        </div>
        <span className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusBadge(order.status)}`}>
          {order.status.replace('_', ' ').toUpperCase()}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Gig Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-[#1a1a1a] rounded-2xl p-6 border border-gray-200 dark:border-[#262626]"
          >
            <div className="flex gap-4">
              {order.gig_id?.thumbnail ? (
                <img
                  src={order.gig_id.thumbnail.startsWith('http') ? order.gig_id.thumbnail : `${import.meta.env.VITE_API_URL}${order.gig_id.thumbnail}`}
                  alt={order.gig_id.title}
                  className="w-32 h-32 rounded-xl object-cover"
                />
              ) : (
                <div className="w-32 h-32 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                  <Package className="w-10 h-10 text-gray-400" />
                </div>
              )}
              <div className="flex-1">
                <h2 className="text-xl font-bold text-[#044071] dark:text-white mb-2">{order.gig_id?.title}</h2>
                <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                  <span>Order ID: #{order._id}</span>
                  <span>•</span>
                  <span>Ordered: {new Date(order.createdAt).toLocaleDateString()}</span>
                  <span>•</span>
                  <span>Status: {order.status}</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Buyer & Seller Details */}
          <div className="grid grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white dark:bg-[#1a1a1a] rounded-2xl p-6 border border-gray-200 dark:border-[#262626]"
            >
              <h3 className="font-bold text-[#044071] dark:text-white mb-4">Buyer Details</h3>
              <div className="flex items-center gap-3 mb-4">
                <img src={order.buyer_id.profile_image || `https://ui-avatars.com/api/?name=${order.buyer_id.full_name}`} alt={order.buyer_id.full_name} className="w-16 h-16 rounded-full" />
                <div>
                  <h4 className="font-semibold">{order.buyer_id.full_name}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{order.buyer_id.email}</p>
                </div>
              </div>
              <div className="text-sm">
                <p className="text-gray-600 dark:text-gray-400">Member since: {new Date(order.buyer_id.created_at).toLocaleDateString()}</p>
              </div>
              <button className="mt-4 w-full px-4 py-2 rounded-lg border border-[#044071] text-[#044071] dark:text-white hover:bg-[#044071] hover:text-white transition-colors text-sm font-medium">
                View Profile
              </button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white dark:bg-[#1a1a1a] rounded-2xl p-6 border border-gray-200 dark:border-[#262626]"
            >
              <h3 className="font-bold text-[#044071] dark:text-white mb-4">Seller Details</h3>
              <div className="flex items-center gap-3 mb-4">
                <img src={order.seller_id.profile_image || `https://ui-avatars.com/api/?name=${order.seller_id.full_name}`} alt={order.seller_id.full_name} className="w-16 h-16 rounded-full" />
                <div>
                  <h4 className="font-semibold">{order.seller_id.full_name}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{order.seller_id.email}</p>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Rating:</span>
                  <span className="font-semibold text-[#F24C20]">⭐ {order.seller_id.rating || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Completed Orders:</span>
                  <span className="font-semibold">{order.seller_id.completed_orders || 0}</span>
                </div>
              </div>
              <button className="mt-4 w-full px-4 py-2 rounded-lg border border-[#044071] text-[#044071] dark:text-white hover:bg-[#044071] hover:text-white transition-colors text-sm font-medium">
                View Profile
              </button>
            </motion.div>
          </div>

          {/* Requirements */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-[#1a1a1a] rounded-2xl p-6 border border-gray-200 dark:border-[#262626]"
          >
            <h3 className="font-bold text-[#044071] dark:text-white mb-4">Order Requirements</h3>
            <p className="text-gray-700 dark:text-gray-300">{order.requirements || 'No specific requirements provided.'}</p>
          </motion.div>

          {/* Files Uploaded */}
          {order.files && order.files.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white dark:bg-[#1a1a1a] rounded-2xl p-6 border border-gray-200 dark:border-[#262626]"
            >
              <h3 className="font-bold text-[#044071] dark:text-white mb-4">Uploaded Files</h3>
              <div className="space-y-3">
                {order.files.map((file: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-[#262626]">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-[#F24C20]/10">
                        <Download className="w-5 h-5 text-[#F24C20]" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{file.name}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">{file.size}</p>
                      </div>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-4 py-2 rounded-lg bg-[#044071] hover:bg-[#033559] text-white text-sm font-medium"
                      onClick={() => window.open(file.url, '_blank')}
                    >
                      Download
                    </motion.button>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Pricing Breakdown */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white dark:bg-[#1a1a1a] rounded-2xl p-6 border border-gray-200 dark:border-[#262626]"
          >
            <div className="flex items-center gap-2 mb-4">
              <DollarSign className="w-5 h-5 text-[#F24C20]" />
              <h3 className="font-bold text-[#044071] dark:text-white">Pricing Breakdown</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Gig Price</span>
                <span className="font-semibold">₹{order.price.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Service Fee</span>
                <span className="font-semibold">₹{order.service_fee.toLocaleString()}</span>
              </div>
              <div className="pt-3 border-t border-gray-200 dark:border-[#262626] flex items-center justify-between">
                <span className="font-bold text-[#044071] dark:text-white">Total Amount</span>
                <span className="text-xl font-bold text-[#F24C20]">₹{order.total_amount.toLocaleString()}</span>
              </div>
            </div>
          </motion.div>

          {/* Order Status Timeline (Simplified) */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-[#1a1a1a] rounded-2xl p-6 border border-gray-200 dark:border-[#262626]"
          >
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-5 h-5 text-[#F24C20]" />
              <h3 className="font-bold text-[#044071] dark:text-white">Order Status</h3>
            </div>
            <div className="text-center py-4">
              <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-3 ${order.status === 'completed' ? 'bg-green-100 text-green-600' : 'bg-[#F24C20]/10 text-[#F24C20]'
                }`}>
                <Package className="w-10 h-10" />
              </div>
              <p className="text-lg font-bold capitalize">{order.status.replace('_', ' ')}</p>
              <p className="text-xs text-gray-500 mt-2">Last Updated: {new Date(order.updatedAt).toLocaleDateString()}</p>
            </div>
          </motion.div>

          {/* Admin Actions */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-[#1a1a1a] rounded-2xl p-6 border border-gray-200 dark:border-[#262626]"
          >
            <h3 className="font-bold text-[#044071] dark:text-white mb-4">Admin Actions</h3>
            <div className="space-y-3">
              {(order.status === 'delivered' || order.status === 'in_progress') && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleAction('completed')}
                  className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-xl font-medium flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-5 h-5" />
                  Mark Completed
                </motion.button>
              )}
              {order.status !== 'cancelled' && order.status !== 'refunded' && order.status !== 'completed' && (
                <>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleAction('refunded')}
                    className="w-full bg-[#044071] hover:bg-[#033559] text-white px-4 py-3 rounded-xl font-medium flex items-center justify-center gap-2"
                  >
                    <DollarSign className="w-5 h-5" />
                    Issue Refund
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleAction('cancelled')}
                    className="w-full border-2 border-red-600 text-red-600 hover:bg-red-600 hover:text-white px-4 py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors"
                  >
                    <X className="w-5 h-5" />
                    Cancel Order
                  </motion.button>
                </>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-[#1a1a1a] rounded-2xl p-6 max-w-md w-full border border-gray-200 dark:border-[#262626]"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-full bg-yellow-100 dark:bg-yellow-900/20">
                <AlertTriangle className="w-6 h-6 text-yellow-600" />
              </div>
              <h3 className="text-xl font-bold text-[#044071] dark:text-white">Confirm Action</h3>
            </div>
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              Are you sure you want to {actionType} this order? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={confirmAction}
                className="flex-1 bg-[#F24C20] hover:bg-[#d43a12] text-white px-4 py-3 rounded-xl font-medium"
              >
                Confirm
              </button>
              <button
                onClick={() => setShowConfirmDialog(false)}
                className="flex-1 border border-gray-300 dark:border-[#262626] hover:bg-gray-50 dark:hover:bg-[#262626] px-4 py-3 rounded-xl font-medium"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}


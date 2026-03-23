import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Package, User, DollarSign, Clock, CheckCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import api from '../lib/api';

interface GigOrdersProps {
  onSelectOrder?: (orderId: string) => void;
}

export function GigOrders({ onSelectOrder }: GigOrdersProps) {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/gig-orders');
      if (response.data.success) {
        setOrders(response.data.orders);
      }
    } catch (error) {
      console.error('Error fetching gig orders:', error);
      toast.error('Failed to fetch gig orders');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      const response = await api.put(`/admin/gig-orders/${id}/status`, { status: newStatus });
      if (response.data.success) {
        toast.success(`Order marked as ${newStatus}`);
        setOrders(orders.map(order => order._id === id ? { ...order, status: newStatus } : order));
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update order');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 min-h-[400px]">
        <Loader2 className="w-10 h-10 text-[#F24C20] animate-spin mb-4" />
        <p className="text-gray-500">Loading gig orders...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Gig Orders</h1>
        <p className="text-gray-600 dark:text-gray-400">Monitor and manage all gig orders</p>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-20 text-center border border-gray-200 dark:border-gray-700">
          <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No gig orders found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {orders.map((order, index) => (
            <motion.div
              key={order._id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-sm font-mono text-gray-600 dark:text-gray-400">#{order._id.slice(-8).toUpperCase()}</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${order.status === 'completed'
                        ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                        : order.status === 'in_progress'
                          ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
                          : order.status === 'delivered'
                            ? 'bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400'
                            : order.status === 'cancelled' || order.status === 'refunded'
                              ? 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400'
                              : 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400'
                      }`}>
                      {order.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>

                  <h3 className="font-bold text-lg mb-4">{order.gig_id?.title || 'Unknown Gig'}</h3>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Buyer</p>
                        <p className="font-medium text-sm">{order.buyer_id?.full_name}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Seller</p>
                        <p className="font-medium text-sm">{order.seller_id?.full_name}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Total Price</p>
                        <p className="font-medium text-sm">₹{order.total_amount.toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Order Date</p>
                        <p className="font-medium text-sm">{new Date(order.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2 ml-4">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-[#F24C20] hover:bg-[#d43a12] text-white px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap"
                    onClick={() => onSelectOrder?.(order._id)}
                  >
                    View Details
                  </motion.button>
                  {order.status === 'delivered' && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleUpdateStatus(order._id, 'completed')}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Complete
                    </motion.button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
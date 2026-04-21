import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle, X, Eye, Wallet, Calendar, CreditCard, DollarSign, TrendingUp, Settings, Loader2, PlusCircle } from 'lucide-react';
import api from '../lib/api';
import { toast } from 'sonner';

export function WithdrawRequests() {
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<any | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [actionType, setActionType] = useState<'approved' | 'rejected'>('approved');
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [adjustAmount, setAdjustAmount] = useState('');
  const [adjustDescription, setAdjustDescription] = useState('');
  const [adjustingUser, setAdjustingUser] = useState<any>(null);
  const [isAdjusting, setIsAdjusting] = useState(false);

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  const fetchWithdrawals = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/withdrawals');
      if (response.data.success) {
        setWithdrawals(response.data.withdrawals);
      }
    } catch (error) {
      console.error('Error fetching withdrawals:', error);
      toast.error('Failed to fetch withdrawal requests');
    } finally {
      setLoading(false);
    }
  };

  const handleActionClick = (requestId: string, type: 'approved' | 'rejected') => {
    setSelectedRequestId(requestId);
    setActionType(type);
    setShowConfirmModal(true);
  };

  const confirmAction = async () => {
    if (!selectedRequestId) return;
    try {
      const response = await api.put(`/admin/withdrawals/${selectedRequestId}`, {
        status: actionType,
        admin_note: actionType === 'approved' ? 'Processed by admin' : 'Rejected by admin'
      });
      if (response.data.success) {
        toast.success(`Withdrawal ${actionType} successfully`);
        fetchWithdrawals();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Action failed');
    } finally {
      setShowConfirmModal(false);
      setSelectedRequestId(null);
    }
  };

  const handleAdjustBalance = async () => {
    if (!adjustingUser || !adjustAmount) return;
    try {
      setIsAdjusting(true);
      const response = await api.put(`/admin/users/${adjustingUser._id}/wallet`, {
        amount: Number(adjustAmount),
        description: adjustDescription || `Referral bonus / Adjustment by admin`
      });
      if (response.data.success) {
        toast.success(`Balance updated successfully!`);
        setShowAdjustModal(false);
        setAdjustAmount('');
        setAdjustDescription('');
        fetchWithdrawals(); // Refresh to see updated wallet balance in table
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Adjustment failed');
    } finally {
      setIsAdjusting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2 text-[#044071] dark:text-white">
            Withdraw Requests
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Review and process credit-based withdrawal requests from live data
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Pending Requests', value: withdrawals.filter(w => w.status === 'pending').length, icon: Wallet, color: 'bg-yellow-500' },
          { label: 'Total Approved', value: withdrawals.filter(w => w.status === 'approved').length, icon: CheckCircle, color: 'bg-green-500' },
          { label: 'Rejected', value: withdrawals.filter(w => w.status === 'rejected').length, icon: X, color: 'bg-red-500' },
          { label: 'Total Volume', value: `₹${withdrawals.reduce((acc, curr) => acc + (curr.amount || 0), 0).toLocaleString()}`, icon: DollarSign, color: 'bg-[#044071]' }
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white dark:bg-[#1a1a1a] p-6 rounded-xl border border-gray-200 dark:border-[#262626]"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</p>
                <p className="text-2xl font-bold mt-1">{stat.value}</p>
              </div>
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Withdraw Requests Table */}
      <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl border border-gray-200 dark:border-[#262626] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-[#0a0a0a]">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold">User</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Wallet Balance</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Requested Amount</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Method</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Date</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Status</th>
                <th className="px-6 py-4 text-center text-sm font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-[#262626]">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <Loader2 className="w-10 h-10 text-[#F24C20] animate-spin mx-auto mb-2" />
                    <p className="text-gray-500">Loading requests...</p>
                  </td>
                </tr>
              ) : withdrawals.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    No withdrawal requests found.
                  </td>
                </tr>
              ) : (
                withdrawals.map((request, index) => (
                  <motion.tr
                    key={request._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="hover:bg-gray-50 dark:hover:bg-[#262626]/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="font-medium">{request.user?.full_name || 'Deleted User'}</div>
                      <div className="text-xs text-gray-500">{request.user?.email}</div>
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-500">
                      ₹{request.user?.wallet_balance?.toLocaleString() || 0}
                    </td>
                    <td className="px-6 py-4 font-bold text-[#F24C20]">
                      ₹{request.amount?.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium uppercase">{request.payment_method}</td>
                    <td className="px-6 py-4 text-sm">
                      {new Date(request.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${request.status === 'approved'
                          ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                          : request.status === 'pending'
                            ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400'
                            : 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400'
                        }`}>
                        {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        {request.status === 'pending' && (
                          <>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleActionClick(request._id, 'approved')}
                              className="p-2 hover:bg-green-100 dark:hover:bg-green-900/20 rounded-lg"
                              title="Approve"
                            >
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleActionClick(request._id, 'rejected')}
                              className="p-2 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg"
                              title="Reject"
                            >
                              <X className="w-4 h-4 text-red-600" />
                            </motion.button>
                          </>
                        )}
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => {
                            setSelectedWithdrawal(request);
                            setShowDetailsModal(true);
                          }}
                          className="p-2 hover:bg-blue-100 dark:hover:bg-blue-900/20 rounded-lg"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4 text-blue-600" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => {
                            setAdjustingUser(request.user);
                            setShowAdjustModal(true);
                          }}
                          className="p-2 hover:bg-orange-100 dark:hover:bg-orange-900/20 rounded-lg"
                          title="Add Bonus / Adjust Balance"
                        >
                          <PlusCircle className="w-4 h-4 text-orange-600" />
                        </motion.button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirmModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
            onClick={() => setShowConfirmModal(false)}
          >
            <motion.div
              initial={{ scale: 0.96, opacity: 0, y: 16 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.96, opacity: 0, y: 16 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-[#1a1a1a] rounded-2xl p-6 max-w-md w-full border border-gray-200 dark:border-[#262626]"
            >
              <h3 className="text-xl font-bold mb-4 text-[#044071] dark:text-white">
                Confirm {actionType === 'approved' ? 'Approval' : 'Rejection'}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Are you sure you want to {actionType.slice(0, -1)} this withdrawal request?
              </p>
              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowConfirmModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-200 dark:border-[#262626] rounded-lg hover:bg-gray-50 dark:hover:bg-[#262626] transition-colors"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={confirmAction}
                  className={`flex-1 px-4 py-2 text-white rounded-lg transition-colors ${actionType === 'approved'
                      ? 'bg-green-600 hover:bg-green-700'
                      : 'bg-red-600 hover:bg-red-700'
                    }`}
                >
                  Confirm
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Details Modal */}
      <AnimatePresence>
        {showDetailsModal && selectedWithdrawal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowDetailsModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-4xl overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-2xl dark:border-[#262626] dark:bg-[#161616]"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-[#044071] dark:text-white">Payment Details</h3>
                <button onClick={() => setShowDetailsModal(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-[#262626] rounded-full">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-[#0a0a0a] rounded-xl border border-gray-200 dark:border-[#262626]">
                   <div>
                      <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Method</p>
                      <p className="font-bold text-lg">{selectedWithdrawal.payment_method}</p>
                   </div>
                   <div>
                      <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Amount</p>
                      <p className="font-black text-lg text-[#F24C20]">₹{selectedWithdrawal.amount?.toLocaleString()}</p>
                   </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-sm font-black uppercase tracking-widest text-[#F24C20]">Transfer Information</h4>
                  {selectedWithdrawal.payment_details ? (
                    <div className="grid grid-cols-1 gap-4">
                      {selectedWithdrawal.payment_method === 'Bank Transfer' ? (
                        <>
                          <DetailItem label="Account Holder" value={selectedWithdrawal.payment_details.account_holder_name} />
                          <DetailItem label="Account Number" value={selectedWithdrawal.payment_details.account_number} />
                          <DetailItem label="IFSC Code" value={selectedWithdrawal.payment_details.ifsc_code} />
                          <DetailItem label="Bank Name" value={selectedWithdrawal.payment_details.bank_name} />
                        </>
                      ) : (
                        <DetailItem label="UPI ID" value={selectedWithdrawal.payment_details.upi_id} />
                      )}
                    </div>
                  ) : (
                    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm font-medium">
                      Error: Payment details missing for this legacy request.
                    </div>
                  )}
                </div>

                <div className="pt-6 border-t border-gray-100 dark:border-[#262626]">
                   <p className="text-[10px] text-gray-500 mb-4">Verification Step: Please transfer the amount manually using your banking portal before marking this request as "Approved".</p>
                   {selectedWithdrawal.status === 'pending' && (
                     <div className="flex gap-3">
                        <button 
                          onClick={() => { setShowDetailsModal(false); handleActionClick(selectedWithdrawal._id, 'approved'); }}
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl transition-all"
                        >
                          Mark as Paid
                        </button>
                        <button 
                          onClick={() => { setShowDetailsModal(false); handleActionClick(selectedWithdrawal._id, 'rejected'); }}
                          className="px-6 border border-red-500 text-red-500 font-bold py-3 rounded-xl hover:bg-red-500/5 transition-all"
                        >
                          Reject
                        </button>
                     </div>
                   )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <AdjustModal
        show={showAdjustModal}
        user={adjustingUser}
        onClose={() => setShowAdjustModal(false)}
        onSave={handleAdjustBalance}
        amount={adjustAmount}
        setAmount={setAdjustAmount}
        description={adjustDescription}
        setDescription={setAdjustDescription}
        loading={isAdjusting}
      />
    </div>
  );
}

function AdjustModal({ show, user, onClose, onSave, amount, setAmount, description, setDescription, loading }: any) {
  if (!show || !user) return null;
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white dark:bg-[#1a1a1a] rounded-2xl p-6 max-w-md w-full border border-gray-200 dark:border-[#262626]"
        >
          <h3 className="text-xl font-bold mb-4 text-[#044071] dark:text-white">
            Adjust Balance for {user.full_name}
          </h3>
          <p className="text-sm text-gray-500 mb-4">Current Balance: ₹{user.wallet_balance?.toLocaleString() || 0}</p>
          
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium mb-1">Amount (₹)</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="e.g. 500 or -500"
                className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-[#262626] bg-transparent outline-none focus:ring-2 focus:ring-[#F24C20]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Reason for adjustment"
                className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-[#262626] bg-transparent outline-none focus:ring-2 focus:ring-[#F24C20]"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-200 dark:border-[#262626] rounded-lg hover:bg-gray-50 dark:hover:bg-[#262626] transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              onClick={onSave}
              disabled={loading || !amount}
              className="flex-1 px-4 py-2 bg-[#F24C20] hover:bg-[#d43a12] text-white rounded-lg transition-colors font-medium disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Save Changes'}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-[#262626] last:border-0">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-sm font-bold truncate ml-4">{value || 'N/A'}</span>
    </div>
  );
}

import { motion } from 'motion/react';
import { useState } from 'react';
import { CreditCard, Plus, Edit, Trash2, CheckCircle, DollarSign } from 'lucide-react';
import { Breadcrumb } from './Breadcrumb';

interface PaymentMethodsProps {
  onNavigate: (page: string) => void;
}

export function PaymentMethods({ onNavigate }: PaymentMethodsProps) {
  const [showForm, setShowForm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const paymentMethods = [
    { 
      id: 1, 
      name: 'PayPal', 
      type: 'E-Wallet', 
      fee: '2.9% + $0.30', 
      minWithdraw: '$10',
      processingTime: '1-2 business days',
      status: 'active',
      users: 1543
    },
    { 
      id: 2, 
      name: 'Stripe', 
      type: 'Payment Gateway', 
      fee: '2.9% + $0.30', 
      minWithdraw: '$20',
      processingTime: '2-5 business days',
      status: 'active',
      users: 1876
    },
    { 
      id: 3, 
      name: 'Bank Transfer', 
      type: 'Direct Transfer', 
      fee: '$5 flat', 
      minWithdraw: '$50',
      processingTime: '3-7 business days',
      status: 'active',
      users: 2134
    },
    { 
      id: 4, 
      name: 'Razorpay', 
      type: 'Payment Gateway', 
      fee: '2% + ₹2', 
      minWithdraw: '₹500',
      processingTime: '1-3 business days',
      status: 'active',
      users: 1245
    },
    { 
      id: 5, 
      name: 'Payoneer', 
      type: 'E-Wallet', 
      fee: '$3 flat', 
      minWithdraw: '$20',
      processingTime: '1-2 business days',
      status: 'active',
      users: 876
    },
    { 
      id: 6, 
      name: 'Wise (TransferWise)', 
      type: 'International Transfer', 
      fee: '0.5% + $1', 
      minWithdraw: '$30',
      processingTime: '1-2 business days',
      status: 'active',
      users: 543
    },
  ];

  const handleCreate = () => {
    setShowSuccess(true);
    setShowForm(false);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  return (
    <div>
      <Breadcrumb 
        items={[{ label: 'Transactions & Wallet', path: 'payments' }, { label: 'Payment Methods' }]} 
        onNavigate={onNavigate}
      />

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-[#044071] dark:text-white mb-2">Payment Methods</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage available withdrawal and payment options</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowForm(!showForm)}
          className="bg-[#F24C20] hover:bg-[#d43a12] text-white px-6 py-3 rounded-xl font-medium flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Payment Method
        </motion.button>
      </div>

      {showSuccess && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 mb-6 flex items-center gap-3"
        >
          <CheckCircle className="w-5 h-5 text-green-600" />
          <span className="text-green-800 dark:text-green-200 font-medium">Payment method added successfully!</span>
        </motion.div>
      )}

      {showForm && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-white dark:bg-[#1a1a1a] rounded-2xl p-6 border border-gray-200 dark:border-[#262626] mb-6"
        >
          <h3 className="font-bold mb-4 text-[#044071] dark:text-white">Add New Payment Method</h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-2">Method Name</label>
              <input
                type="text"
                placeholder="e.g., Skrill"
                className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-[#262626] bg-transparent focus:outline-none focus:ring-2 focus:ring-[#F24C20]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Type</label>
              <select className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-[#262626] bg-transparent focus:outline-none focus:ring-2 focus:ring-[#F24C20]">
                <option>E-Wallet</option>
                <option>Payment Gateway</option>
                <option>Direct Transfer</option>
                <option>Cryptocurrency</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Transaction Fee</label>
              <input
                type="text"
                placeholder="e.g., 2.5% + $0.25"
                className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-[#262626] bg-transparent focus:outline-none focus:ring-2 focus:ring-[#F24C20]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Minimum Withdrawal</label>
              <input
                type="text"
                placeholder="e.g., $25"
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
            Create Payment Method
          </motion.button>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {paymentMethods.map((method, index) => (
          <motion.div
            key={method.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ y: -4 }}
            className="bg-white dark:bg-[#1a1a1a] rounded-2xl p-6 border border-gray-200 dark:border-[#262626]"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl" style={{ backgroundColor: 'rgba(242, 76, 32, 0.1)' }}>
                  <CreditCard className="w-6 h-6 text-[#F24C20]" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#044071] dark:text-white">{method.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{method.type}</p>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400">
                {method.status}
              </span>
            </div>

            <div className="space-y-3 mb-4 bg-gray-50 dark:bg-[#262626] rounded-xl p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Transaction Fee:</span>
                <span className="font-semibold text-[#F24C20]">{method.fee}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Min Withdrawal:</span>
                <span className="font-semibold">{method.minWithdraw}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Processing Time:</span>
                <span className="font-semibold">{method.processingTime}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Active Users:</span>
                <span className="font-bold text-[#044071] dark:text-white">{method.users.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex-1 bg-[#044071] hover:bg-[#033559] text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2"
              >
                <Edit className="w-4 h-4" />
                Configure
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-4 py-2 rounded-lg border border-gray-300 dark:border-[#262626] hover:bg-gray-50 dark:hover:bg-[#262626] transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </motion.button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Statistics Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-6"
      >
        {[
          { label: 'Total Methods', value: '6', icon: CreditCard, color: '#F24C20' },
          { label: 'Active Users', value: '8,217', icon: DollarSign, color: '#044071' },
          { label: 'This Month Transactions', value: '₹5.2M', icon: DollarSign, color: '#10b981' },
          { label: 'Avg Processing Time', value: '2.3 days', icon: CreditCard, color: '#f59e0b' },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 + index * 0.1 }}
            className="bg-white dark:bg-[#1a1a1a] rounded-2xl p-6 border border-gray-200 dark:border-[#262626]"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg" style={{ backgroundColor: `${stat.color}20` }}>
                <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</span>
            </div>
            <p className="text-2xl font-bold text-[#044071] dark:text-white">{stat.value}</p>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}

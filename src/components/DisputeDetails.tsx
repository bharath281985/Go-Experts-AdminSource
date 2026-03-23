import { motion } from 'motion/react';
import { ArrowLeft, CheckCircle, X, Lock, DollarSign, MessageSquare } from 'lucide-react';
import { disputes } from '../lib/dummyData';

interface DisputeDetailsProps {
  disputeId: string;
  onBack: () => void;
}

export function DisputeDetails({ disputeId, onBack }: DisputeDetailsProps) {
  const dispute = disputes.find(d => d.id === disputeId);

  if (!dispute) {
    return <div>Dispute not found</div>;
  }

  return (
    <div className="space-y-6">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        Back to Disputes
      </button>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200 dark:border-gray-700"
      >
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <h1 className="text-2xl font-bold">{dispute.title}</h1>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                dispute.status === 'resolved'
                  ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                  : dispute.status === 'under_review'
                  ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
                  : 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400'
              }`}>
                {dispute.status.replace('_', ' ').toUpperCase()}
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                dispute.priority === 'high'
                  ? 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400'
                  : dispute.priority === 'medium'
                  ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-400'
              }`}>
                {dispute.priority.toUpperCase()} PRIORITY
              </span>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-4">{dispute.description}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Order Reference: <span className="font-medium">{dispute.orderReference}</span> • 
              Created: <span className="font-medium">{new Date(dispute.createdDate).toLocaleDateString()}</span>
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-8">
          <div className="bg-blue-50 dark:bg-blue-900/10 rounded-xl p-6">
            <h3 className="font-bold mb-2">Buyer</h3>
            <p className="text-lg font-semibold mb-1">{dispute.buyer}</p>
            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">View Profile →</button>
          </div>
          <div className="bg-purple-50 dark:bg-purple-900/10 rounded-xl p-6">
            <h3 className="font-bold mb-2">Seller</h3>
            <p className="text-lg font-semibold mb-1">{dispute.seller}</p>
            <button className="text-sm text-purple-600 hover:text-purple-700 font-medium">View Profile →</button>
          </div>
        </div>

        <div className="mb-8">
          <h3 className="font-bold text-lg mb-4">Dispute Timeline</h3>
          <div className="space-y-4">
            {[
              { time: '2 hours ago', event: 'Buyer opened dispute', actor: dispute.buyer },
              { time: '1 hour ago', event: 'Admin marked as under review', actor: 'Admin' },
              { time: '30 mins ago', event: 'Seller responded with evidence', actor: dispute.seller }
            ].map((entry, index) => (
              <div key={index} className="flex items-start gap-4 pb-4 border-b border-gray-200 dark:border-gray-700 last:border-0">
                <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <p className="font-medium mb-1">{entry.event}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    by {entry.actor} • {entry.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-6 mb-6">
          <h3 className="font-bold mb-4">Admin Decision Panel</h3>
          <textarea
            className="w-full h-32 p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none mb-4"
            placeholder="Enter your decision notes and reason..."
          />
          <div className="flex gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-medium flex items-center gap-2"
            >
              <DollarSign className="w-5 h-5" />
              Refund Buyer
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium flex items-center gap-2"
            >
              <CheckCircle className="w-5 h-5" />
              Release to Seller
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-xl font-medium flex items-center gap-2"
            >
              <Lock className="w-5 h-5" />
              Freeze Payment
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 px-6 py-3 rounded-xl font-medium flex items-center gap-2"
            >
              <X className="w-5 h-5" />
              Close Dispute
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

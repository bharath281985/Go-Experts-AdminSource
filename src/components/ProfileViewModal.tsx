import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Eye, CreditCard, AlertTriangle, X, CheckCircle } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface ProfileViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  profileName: string;
  creditCost: number;
  userCredits: number;
  onConfirm: () => void;
}

export function ProfileViewModal({
  isOpen,
  onClose,
  profileName,
  creditCost,
  userCredits,
  onConfirm
}: ProfileViewModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const hasInsufficientCredits = userCredits < creditCost;

  const handleConfirm = async () => {
    if (hasInsufficientCredits) {
      toast.error('Insufficient credits. Please upgrade your subscription.');
      return;
    }

    setIsProcessing(true);
    
    // Simulate credit deduction
    setTimeout(() => {
      onConfirm();
      setIsProcessing(false);
      onClose();
      
      toast.success(
        <div className="flex items-center gap-2">
          <CheckCircle className="w-4 h-4" />
          <span>{creditCost} credits deducted successfully</span>
        </div>
      );
    }, 1000);
  };

  const handleUpgrade = () => {
    onClose();
    toast.info('Redirecting to subscription upgrade...');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-[#1a1a1a] rounded-2xl p-6 max-w-md w-full border border-gray-200 dark:border-[#262626] relative overflow-hidden"
          >
            {/* Background Decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#F24C20]/5 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-[#044071]/5 rounded-full blur-2xl" />

            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 hover:bg-gray-100 dark:hover:bg-[#262626] rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Content */}
            <div className="relative">
              {/* Icon */}
              <div className="flex justify-center mb-4">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
                  hasInsufficientCredits 
                    ? 'bg-red-100 dark:bg-red-900/20' 
                    : 'bg-[#F24C20]/10'
                }`}>
                  {hasInsufficientCredits ? (
                    <AlertTriangle className="w-8 h-8 text-red-600" />
                  ) : (
                    <Eye className="w-8 h-8 text-[#F24C20]" />
                  )}
                </div>
              </div>

              {/* Title */}
              <h3 className="text-2xl font-bold text-center text-[#044071] dark:text-white mb-2">
                {hasInsufficientCredits ? 'Insufficient Credits' : 'View Profile'}
              </h3>

              {/* Description */}
              <p className="text-center text-gray-600 dark:text-gray-400 mb-6">
                {hasInsufficientCredits ? (
                  <>
                    You don't have enough credits to view this profile. 
                    Upgrade your subscription to continue.
                  </>
                ) : (
                  <>
                    Viewing <span className="font-semibold text-[#044071] dark:text-white">{profileName}'s</span> profile 
                    will deduct credits from your account.
                  </>
                )}
              </p>

              {/* Credit Info Card */}
              <div className={`p-4 rounded-xl mb-6 ${
                hasInsufficientCredits
                  ? 'bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30'
                  : 'bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-[#262626]'
              }`}>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Credit Cost</span>
                    <div className="flex items-center gap-2">
                      <CreditCard className={`w-4 h-4 ${
                        hasInsufficientCredits ? 'text-red-600' : 'text-[#F24C20]'
                      }`} />
                      <span className={`font-bold ${
                        hasInsufficientCredits 
                          ? 'text-red-600' 
                          : 'text-[#F24C20]'
                      }`}>
                        {creditCost.toLocaleString()} credits
                      </span>
                    </div>
                  </div>

                  <div className="h-px bg-gray-200 dark:bg-[#262626]" />

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Your Balance</span>
                    <div className="flex items-center gap-2">
                      <span className={`font-bold ${
                        hasInsufficientCredits 
                          ? 'text-red-600' 
                          : 'text-gray-900 dark:text-white'
                      }`}>
                        {userCredits.toLocaleString()} credits
                      </span>
                    </div>
                  </div>

                  {!hasInsufficientCredits && (
                    <>
                      <div className="h-px bg-gray-200 dark:bg-[#262626]" />

                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">
                          Remaining Balance
                        </span>
                        <span className="font-bold text-green-600">
                          {(userCredits - creditCost).toLocaleString()} credits
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                {hasInsufficientCredits ? (
                  <>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={onClose}
                      className="flex-1 px-4 py-3 border border-gray-200 dark:border-[#262626] rounded-xl hover:bg-gray-50 dark:hover:bg-[#262626] transition-colors font-medium"
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleUpgrade}
                      className="flex-1 px-4 py-3 bg-[#F24C20] hover:bg-[#d43d15] text-white rounded-xl transition-colors font-medium"
                    >
                      Upgrade Plan
                    </motion.button>
                  </>
                ) : (
                  <>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={onClose}
                      disabled={isProcessing}
                      className="flex-1 px-4 py-3 border border-gray-200 dark:border-[#262626] rounded-xl hover:bg-gray-50 dark:hover:bg-[#262626] transition-colors font-medium disabled:opacity-50"
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleConfirm}
                      disabled={isProcessing}
                      className="flex-1 px-4 py-3 bg-[#044071] hover:bg-[#033050] text-white rounded-xl transition-colors font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {isProcessing ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4" />
                          Confirm & View
                        </>
                      )}
                    </motion.button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

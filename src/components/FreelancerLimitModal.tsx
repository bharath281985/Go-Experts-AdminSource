import { motion, AnimatePresence } from 'motion/react';
import { AlertCircle, X, Crown, CheckCircle, ArrowUpRight } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface FreelancerLimitModalProps {
  isOpen: boolean;
  onClose: () => void;
  limitType: 'projects' | 'hires';
  currentCount: number;
  maxLimit: number;
}

export function FreelancerLimitModal({
  isOpen,
  onClose,
  limitType,
  currentCount,
  maxLimit
}: FreelancerLimitModalProps) {
  const handleUpgrade = () => {
    onClose();
    toast.info('Redirecting to subscription upgrade...');
  };

  const title = limitType === 'projects' ? 'Project Application Limit Reached' : 'Hiring Limit Reached';
  const description = limitType === 'projects' 
    ? `You've applied to ${currentCount} out of ${maxLimit} projects allowed on your free plan.`
    : `You've hired ${currentCount} out of ${maxLimit} freelancers allowed on your free plan.`;

  const benefits = [
    'Unlimited project applications',
    'Unlimited freelancer hires',
    '36,500 credits included',
    'Priority profile visibility',
    'Premium support & analytics',
    'Advanced filtering options'
  ];

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
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-[#1a1a1a] rounded-2xl max-w-md w-full border border-gray-200 dark:border-[#262626] relative overflow-hidden"
          >
            {/* Decorative Background */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#F24C20]/10 to-transparent rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-[#044071]/10 to-transparent rounded-full blur-2xl" />

            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 p-2 hover:bg-gray-100 dark:hover:bg-[#262626] rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Content */}
            <div className="relative p-6">
              {/* Icon */}
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900/20 rounded-2xl flex items-center justify-center">
                  <AlertCircle className="w-8 h-8 text-yellow-600" />
                </div>
              </div>

              {/* Title & Description */}
              <h3 className="text-2xl font-bold text-center text-[#044071] dark:text-white mb-2">
                {title}
              </h3>
              <p className="text-center text-gray-600 dark:text-gray-400 mb-6">
                {description}
              </p>

              {/* Progress Bar */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Usage
                  </span>
                  <span className="text-sm font-bold text-[#F24C20]">
                    {currentCount}/{maxLimit}
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-[#262626] rounded-full h-2.5">
                  <div
                    className="bg-gradient-to-r from-[#F24C20] to-[#d43d15] h-2.5 rounded-full"
                    style={{ width: `${(currentCount / maxLimit) * 100}%` }}
                  />
                </div>
              </div>

              {/* Upgrade CTA */}
              <div className="bg-gradient-to-br from-[#044071] to-[#033050] rounded-xl p-6 mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <Crown className="w-6 h-6 text-yellow-400" />
                  <h4 className="text-lg font-bold text-white">
                    Upgrade to Premium
                  </h4>
                </div>
                <p className="text-white/80 text-sm mb-4">
                  Get unlimited access and unlock all premium features
                </p>

                {/* Benefits List */}
                <div className="space-y-2 mb-4">
                  {benefits.map((benefit, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                      <span className="text-sm text-white/90">{benefit}</span>
                    </div>
                  ))}
                </div>

                {/* Price */}
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 mb-4">
                  <div className="flex items-baseline justify-center gap-2">
                    <span className="text-3xl font-bold text-white">₹36,500</span>
                    <span className="text-white/70">/year</span>
                  </div>
                  <p className="text-center text-xs text-white/60 mt-1">
                    Includes 36,500 credits
                  </p>
                </div>

                {/* Upgrade Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleUpgrade}
                  className="w-full py-3 bg-[#F24C20] hover:bg-[#d43d15] text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors"
                >
                  Upgrade Now
                  <ArrowUpRight className="w-4 h-4" />
                </motion.button>
              </div>

              {/* Cancel Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onClose}
                className="w-full py-3 border border-gray-200 dark:border-[#262626] rounded-xl hover:bg-gray-50 dark:hover:bg-[#262626] transition-colors font-medium"
              >
                Maybe Later
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

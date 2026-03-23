import { useState } from 'react';
import { motion } from 'motion/react';
import {
  Crown,
  CreditCard,
  Calendar,
  TrendingDown,
  Eye,
  Clock,
  AlertCircle,
  ArrowUpRight,
  CheckCircle,
  Zap
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface SubscriptionInfo {
  planName: string;
  daysRemaining: number;
  creditsRemaining: number;
  planType: 'free' | 'premium';
  expiryDate: string;
}

interface CreditUsage {
  spentToday: number;
  profileViews: number;
  expiredToday: number;
  totalRemaining: number;
}

export function UserDashboard() {
  const [subscription] = useState<SubscriptionInfo>({
    planName: '90 Days Free Trial',
    daysRemaining: 45,
    creditsRemaining: 850,
    planType: 'free',
    expiryDate: '2024-03-15'
  });

  const [creditUsage] = useState<CreditUsage>({
    spentToday: 730,
    profileViews: 2,
    expiredToday: 1,
    totalRemaining: 850
  });

  const handleUpgrade = () => {
    toast.success('Redirecting to upgrade page...');
  };

  const showLowCreditWarning = subscription.creditsRemaining < 1000;
  const showRenewalReminder = subscription.daysRemaining < 30;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-[#044071] dark:text-white mb-2">
            My Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your subscription and credits
          </p>
        </div>

        {/* Alerts */}
        {(showLowCreditWarning || showRenewalReminder) && (
          <div className="space-y-3">
            {showLowCreditWarning && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-900/30 rounded-xl p-4 flex items-start gap-3"
              >
                <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-semibold text-yellow-900 dark:text-yellow-300">
                    Low Credit Balance
                  </h4>
                  <p className="text-sm text-yellow-800 dark:text-yellow-400 mt-1">
                    You have only {subscription.creditsRemaining} credits remaining. 
                    Upgrade to continue using premium features.
                  </p>
                </div>
                <button
                  onClick={handleUpgrade}
                  className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  Upgrade Now
                </button>
              </motion.div>
            )}

            {showRenewalReminder && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-900/30 rounded-xl p-4 flex items-start gap-3"
              >
                <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-semibold text-blue-900 dark:text-blue-300">
                    Subscription Expiring Soon
                  </h4>
                  <p className="text-sm text-blue-800 dark:text-blue-400 mt-1">
                    Your plan expires in {subscription.daysRemaining} days. Renew now to avoid interruption.
                  </p>
                </div>
                <button
                  onClick={handleUpgrade}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  Renew Plan
                </button>
              </motion.div>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Subscription Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-[#1a1a1a] rounded-2xl border border-gray-200 dark:border-[#262626] overflow-hidden"
          >
            {/* Card Header with Gradient */}
            <div className={`p-6 relative ${
              subscription.planType === 'premium' 
                ? 'bg-gradient-to-br from-[#F24C20] to-[#d43d15]' 
                : 'bg-gradient-to-br from-[#044071] to-[#033050]'
            }`}>
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    {subscription.planType === 'premium' ? (
                      <Crown className="w-6 h-6 text-white" />
                    ) : (
                      <Zap className="w-6 h-6 text-white" />
                    )}
                    <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-medium text-white">
                      {subscription.planType === 'premium' ? 'Premium' : 'Free Trial'}
                    </span>
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-1">
                    {subscription.planName}
                  </h2>
                  <p className="text-white/80 text-sm">
                    Active subscription plan
                  </p>
                </div>
              </div>

              {/* Decorative Elements */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl" />
              <div className="absolute bottom-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-2xl" />
            </div>

            {/* Card Content */}
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 dark:bg-[#0a0a0a] rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-4 h-4 text-[#044071] dark:text-[#5BA3D0]" />
                    <span className="text-xs text-gray-600 dark:text-gray-400">Days Remaining</span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold text-[#044071] dark:text-white">
                      {subscription.daysRemaining}
                    </span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">days</span>
                  </div>
                  <div className="mt-2 w-full bg-gray-200 dark:bg-[#262626] rounded-full h-1.5">
                    <div
                      className="bg-[#044071] dark:bg-[#5BA3D0] h-1.5 rounded-full"
                      style={{ width: `${(subscription.daysRemaining / 90) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-[#0a0a0a] rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CreditCard className="w-4 h-4 text-[#F24C20]" />
                    <span className="text-xs text-gray-600 dark:text-gray-400">Credits Left</span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold text-[#F24C20]">
                      {subscription.creditsRemaining.toLocaleString()}
                    </span>
                  </div>
                  <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                    Expiry: {new Date(subscription.expiryDate).toLocaleDateString()}
                  </div>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleUpgrade}
                className="w-full py-3 bg-[#F24C20] hover:bg-[#d43d15] text-white rounded-xl font-medium flex items-center justify-center gap-2 transition-colors"
              >
                {subscription.planType === 'free' ? 'Upgrade to Premium' : 'Manage Subscription'}
                <ArrowUpRight className="w-4 h-4" />
              </motion.button>
            </div>
          </motion.div>

          {/* Credit Usage Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-[#1a1a1a] rounded-2xl border border-gray-200 dark:border-[#262626] overflow-hidden"
          >
            <div className="p-6 border-b border-gray-200 dark:border-[#262626]">
              <div className="flex items-center gap-2">
                <TrendingDown className="w-5 h-5 text-[#F24C20]" />
                <h3 className="text-xl font-bold text-[#044071] dark:text-white">
                  Credit Usage
                </h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Track your daily credit consumption
              </p>
            </div>

            <div className="p-6 space-y-4">
              {/* Credits Spent Today */}
              <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-100 dark:border-red-900/30">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center">
                    <TrendingDown className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Credits Spent Today</div>
                    <div className="text-xs text-gray-500 dark:text-gray-500 mt-0.5">
                      Total debited from account
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-red-600">
                    {creditUsage.spentToday}
                  </div>
                  <div className="text-xs text-red-600/70">credits</div>
                </div>
              </div>

              {/* Profile Views */}
              <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-900/30">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                    <Eye className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Profile Views Cost</div>
                    <div className="text-xs text-gray-500 dark:text-gray-500 mt-0.5">
                      365 credits per view
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-600">
                    {creditUsage.profileViews}
                  </div>
                  <div className="text-xs text-blue-600/70">views today</div>
                </div>
              </div>

              {/* Credits Expired */}
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-[#0a0a0a] rounded-xl border border-gray-200 dark:border-[#262626]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-100 dark:bg-[#262626] rounded-lg flex items-center justify-center">
                    <Clock className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Credits Expired</div>
                    <div className="text-xs text-gray-500 dark:text-gray-500 mt-0.5">
                      Daily automatic expiry
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-600">
                    {creditUsage.expiredToday}
                  </div>
                  <div className="text-xs text-gray-500">credit/day</div>
                </div>
              </div>

              {/* Remaining Credits */}
              <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/10 rounded-xl border border-green-100 dark:border-green-900/30">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Total Remaining</div>
                    <div className="text-xs text-gray-500 dark:text-gray-500 mt-0.5">
                      Available for use
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-600">
                    {creditUsage.totalRemaining}
                  </div>
                  <div className="text-xs text-green-600/70">credits</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Info Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-[#1a1a1a] rounded-2xl border border-gray-200 dark:border-[#262626] p-6"
        >
          <h3 className="text-lg font-bold text-[#044071] dark:text-white mb-4">
            How Credits Work
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-[#F24C20]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <Eye className="w-4 h-4 text-[#F24C20]" />
              </div>
              <div>
                <h4 className="font-semibold mb-1">Profile Viewing</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Each profile view costs 365 credits. View responsibly to manage your balance.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-[#044071]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <Clock className="w-4 h-4 text-[#044071]" />
              </div>
              <div>
                <h4 className="font-semibold mb-1">Daily Expiry</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  1 credit automatically expires per day for all users to maintain system balance.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-green-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <ArrowUpRight className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <h4 className="font-semibold mb-1">Upgrade Benefits</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Premium plans offer more credits and unlimited access to premium features.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

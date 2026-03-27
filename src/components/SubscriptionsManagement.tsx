import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CreditCard, 
  Crown, 
  Edit2, 
  Plus, 
  Power, 
  Eye, 
  Users, 
  Calendar,
  IndianRupee,
  TrendingUp,
  AlertCircle,
  X,
  Trash2,
  Loader2,
  ListCheck,
  Briefcase,
  Rocket,
  Building2,
  Layers
} from 'lucide-react';
import { toast } from 'sonner';
import api from '../lib/api';

interface SubscriptionPlan {
  _id: string;
  name: string;
  duration_days: number;
  price: number;
  points_granted: number;
  project_post_limit: number;
  project_visit_limit: number;
  portfolio_visit_limit: number;
  interest_click_limit: number;
  features: string[];
  status: 'enabled' | 'disabled';
  billing_cycle: 'monthly' | 'yearly' | 'one-time';
  group: string;
  target_role: string;
}

interface SubscriptionsManagementProps {
  onNavigate: (page: string) => void;
  onEditPlan: (id: string) => void;
}

const GROUPS = [
  { id: 'Freelancer Plans', label: 'Freelancer', icon: Briefcase },
  { id: 'Client Plans', label: 'Client', icon: Building2 },
  { id: 'Start-Up Idea Creator Plans', label: 'Startup Creator', icon: Rocket },
  { id: 'Investor Plans', label: 'Investor', icon: Users },
  { id: 'Combo Plan', label: 'Combo / All Access', icon: Layers },
];

export function SubscriptionsManagement({ onNavigate, onEditPlan }: SubscriptionsManagementProps) {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(GROUPS[0].id);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const res = await api.get('/subscription-plans/admin');
      if (res.data.success) {
        setPlans(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching plans:', err);
      toast.error('Failed to load subscription plans');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (plan: SubscriptionPlan) => {
    try {
      const newStatus = plan.status === 'enabled' ? 'disabled' : 'enabled';
      const res = await api.put(`/subscription-plans/${plan._id}`, { status: newStatus });
      if (res.data.success) {
        toast.success(`Plan ${newStatus} successfully`);
        fetchPlans();
      }
    } catch (err) {
      toast.error('Failed to update plan status');
    }
  };

  const handleDeletePlan = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this plan?')) return;
    try {
      const res = await api.delete(`/subscription-plans/${id}`);
      if (res.data.success) {
        toast.success('Plan deleted successfully');
        fetchPlans();
      }
    } catch (err) {
      toast.error('Failed to delete plan');
    }
  };

  const filteredPlans = plans.filter(plan => plan.group === activeTab);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2 text-[#044071] dark:text-white">
            Subscriptions Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage subscription plans, credits, and access rules
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onNavigate('create-subscription-plan')}
          className="flex items-center gap-2 px-4 py-2 bg-[#F24C20] text-white rounded-lg hover:bg-[#d43d15] transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create New Plan
        </motion.button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 p-1 bg-gray-100 dark:bg-[#1a1a1a] rounded-xl overflow-x-auto no-scrollbar">
        {GROUPS.map((group) => {
          const Icon = group.icon;
          const isActive = activeTab === group.id;
          const count = plans.filter(p => p.group === group.id).length;

          return (
            <button
              key={group.id}
              onClick={() => setActiveTab(group.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-white dark:bg-[#262626] text-[#F24C20] shadow-sm'
                  : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-[#F24C20]' : ''}`} />
              {group.label}
              <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                isActive ? 'bg-[#F24C20]/10 text-[#F24C20]' : 'bg-gray-200 dark:bg-[#333] text-gray-400'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Stats Overview for Active Tab */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: `${GROUPS.find(g => g.id === activeTab)?.label} Subscribers`, value: '---', icon: Users, color: 'bg-blue-500' },
          { label: 'Active Plans', value: filteredPlans.filter(p => p.status === 'enabled').length.toString(), icon: Crown, color: 'bg-[#F24C20]' },
          { label: 'Category Revenue', value: '---', icon: IndianRupee, color: 'bg-green-500' },
          { label: 'Category Clicks', value: '---', icon: TrendingUp, color: 'bg-[#044071]' }
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

      {/* Subscription Plans Table */}
      <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl border border-gray-200 dark:border-[#262626] overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-[#262626] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-[#F24C20]" />
            <h2 className="text-xl font-bold text-[#044071] dark:text-white">
              {GROUPS.find(g => g.id === activeTab)?.label} Plans
            </h2>
          </div>
          <span className="text-sm text-gray-500">
            Showing {filteredPlans.length} plans
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-[#0a0a0a]">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold">Plan Name</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Duration</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Price</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Point/Visits</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Billing</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Status</th>
                <th className="px-6 py-4 text-center text-sm font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-[#262626]">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#F24C20]" />
                    <p className="mt-2 text-gray-500">Loading plans...</p>
                  </td>
                </tr>
              ) : filteredPlans.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center">
                    <AlertCircle className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                    <p className="text-gray-500">No plans found in this category.</p>
                    <button 
                      onClick={() => onNavigate('create-subscription-plan')}
                      className="mt-4 text-[#F24C20] font-semibold hover:underline"
                    >
                      Create the first plan
                    </button>
                  </td>
                </tr>
              ) : filteredPlans.map((plan, index) => (
                <motion.tr
                  key={plan._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="hover:bg-gray-50 dark:hover:bg-[#262626]/50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 ${plan.price === 0 ? 'bg-blue-100 dark:bg-blue-900/20' : 'bg-[#F24C20]/10'} rounded-lg flex items-center justify-center`}>
                        {plan.price === 0 ? <AlertCircle className="w-5 h-5 text-blue-600" /> : <Crown className="w-5 h-5 text-[#F24C20]" />}
                      </div>
                      <div>
                        <div className="font-semibold">{plan.name}</div>
                        <div className="text-xs text-gray-500 uppercase tracking-wider">{plan.billing_cycle}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span>{plan.duration_days} days</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <IndianRupee className="w-4 h-4 text-gray-400" />
                      <span className="font-semibold">
                        {plan.price === 0 ? 'Free' : `₹${plan.price.toLocaleString()}`}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="text-sm">
                        <div className="font-medium text-[#F24C20]">{plan.points_granted} Points</div>
                        <div className="text-[10px] text-gray-500">{plan.project_visit_limit} P / {plan.portfolio_visit_limit} F visits</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 uppercase text-xs font-bold text-gray-500">
                    {plan.billing_cycle}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      plan.status === 'enabled'
                        ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                        : 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400'
                    }`}>
                      {plan.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          onEditPlan(plan._id);
                        }}
                        className="p-2 hover:bg-blue-100 dark:hover:bg-blue-900/20 rounded-lg text-blue-600"
                        title="Edit Plan"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleToggleStatus(plan)}
                        className={`p-2 rounded-lg ${plan.status === 'enabled' ? 'hover:bg-yellow-100 text-yellow-600' : 'hover:bg-green-100 text-green-600'}`}
                        title={plan.status === 'enabled' ? 'Disable' : 'Enable'}
                      >
                        <Power className="w-4 h-4" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleDeletePlan(plan._id)}
                        className="p-2 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg text-red-600"
                        title="Delete Plan"
                      >
                        <Trash2 className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Plan Details Cards (Informational) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredPlans.map((plan, index) => (
          <motion.div
            key={plan._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white dark:bg-[#1a1a1a] rounded-2xl border border-gray-200 dark:border-[#262626] overflow-hidden"
          >
            <div className={`p-6 ${plan.price === 0 ? 'bg-blue-50 dark:bg-blue-900/10' : 'bg-[#F24C20]/5'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-[#044071] dark:text-white">
                    {plan.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {plan.duration_days} days access
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-[#F24C20]">
                    {plan.price === 0 ? 'Free' : `₹${plan.price.toLocaleString()}`}
                  </div>
                  <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mt-1">
                    {plan.billing_cycle}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6">
              <h4 className="font-semibold mb-3 text-[#044071] dark:text-white flex items-center gap-2">
                <ListCheck className="w-4 h-4" /> Features & Limits:
              </h4>
              <ul className="space-y-2">
                {plan.features?.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <div className="w-5 h-5 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0">
                      <span className="text-green-600 dark:text-green-400 text-xs">✓</span>
                    </div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {feature}
                    </span>
                  </li>
                ))}
                {plan.target_role === 'client' || plan.target_role === 'both' ? (
                  <li className="flex items-start gap-2 text-blue-600 dark:text-blue-400">
                    <div className="w-5 h-5 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0">
                        <span className="text-xs">✓</span>
                    </div>
                    <p className="text-sm font-medium">{plan.project_post_limit} Project Posts</p>
                  </li>
                ) : null}
                <li className="flex items-start gap-2 text-blue-600 dark:text-blue-400">
                   <div className="w-5 h-5 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0">
                      <span className="text-xs">✓</span>
                   </div>
                   <p className="text-sm font-medium">{plan.project_visit_limit} Detail Visits</p>
                </li>
              </ul>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

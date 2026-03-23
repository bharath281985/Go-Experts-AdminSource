import React from 'react';
import { motion } from 'motion/react';
import { 
  ArrowLeft,
  Crown,
  Calendar,
  IndianRupee,
  ListCheck,
  Save,
  Users
} from 'lucide-react';
import { toast } from 'sonner';
import api from '../lib/api';

interface CreateSubscriptionPlanProps {
  onBack: () => void;
  onNavigate: (page: string) => void;
}

export function CreateSubscriptionPlan({ onBack, onNavigate }: CreateSubscriptionPlanProps) {
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data: any = {
      name: formData.get('name'),
      price: Number(formData.get('price')),
      duration_days: Number(formData.get('duration_days')),
      points_granted: Number(formData.get('points_granted')),
      project_post_limit: Number(formData.get('project_post_limit')),
      project_visit_limit: Number(formData.get('project_visit_limit')),
      portfolio_visit_limit: Number(formData.get('portfolio_visit_limit')),
      interest_click_limit: Number(formData.get('interest_click_limit')),
      billing_cycle: formData.get('billing_cycle'),
      target_role: formData.get('target_role'),
      features: (formData.get('features') as string).split('\n').filter(f => f.trim())
    };

    try {
      const res = await api.post('/subscription-plans', data);
      if (res.data.success) {
        toast.success('Subscription plan created successfully');
        onBack();
      }
    } catch (err: any) {
      console.error('Error creating plan:', err);
      toast.error(err.response?.data?.message || 'Failed to create subscription plan');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onBack}
            className="p-2 hover:bg-gray-100 dark:hover:bg-[#262626] rounded-full transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-gray-600 dark:text-gray-400" />
          </motion.button>
          <div>
            <h1 className="text-3xl font-bold text-[#044071] dark:text-white">
              Create Subscription Plan
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Set up a new premium tiers for your users
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Column */}
        <div className="lg:col-span-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-[#1a1a1a] rounded-3xl border border-gray-200 dark:border-[#262626] overflow-hidden shadow-sm"
          >
            <div className="p-6 border-b border-gray-100 dark:border-[#262626] bg-gray-50/50 dark:bg-[#0a0a0a]/50">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Crown className="w-5 h-5 text-[#F24C20]" />
                Plan Configuration
              </h2>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                   <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                     <Calendar className="w-4 h-4 text-[#F24C20]" /> Billing Cycle
                   </label>
                   <select 
                     name="billing_cycle" 
                     defaultValue="monthly"
                     className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-[#262626] bg-transparent outline-none focus:border-[#F24C20] focus:ring-1 focus:ring-[#F24C20] transition-all"
                   >
                     <option value="one-time">One-time</option>
                     <option value="monthly">Monthly</option>
                     <option value="yearly">Yearly</option>
                   </select>
                </div>
                <div>
                   <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                     <Users className="w-4 h-4 text-[#F24C20]" /> Target Role
                   </label>
                   <select 
                     name="target_role" 
                     defaultValue="client"
                     className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-[#262626] bg-transparent outline-none focus:border-[#F24C20] focus:ring-1 focus:ring-[#F24C20] transition-all"
                   >
                     <option value="client">Clients Only</option>
                     <option value="freelancer">Freelancers Only</option>
                     <option value="both">All Users (Both)</option>
                   </select>
                </div>
                <div>
                   <label className="block text-sm font-medium mb-2">Plan Name</label>
                   <input 
                     name="name" 
                     placeholder="e.g., Premium Pro"
                     required 
                     className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-[#262626] bg-transparent outline-none focus:border-[#F24C20] focus:ring-1 focus:ring-[#F24C20] transition-all" 
                   />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                    <IndianRupee className="w-4 h-4 text-[#F24C20]" /> Price (₹)
                  </label>
                  <input 
                    type="number" 
                    name="price" 
                    placeholder="0 for Free Trial"
                    required 
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-[#262626] bg-transparent outline-none focus:border-[#F24C20] focus:ring-1 focus:ring-[#F24C20]" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[#F24C20]" /> Duration (Days)
                  </label>
                  <input 
                    type="number" 
                    name="duration_days" 
                    placeholder="e.g., 30"
                    required 
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-[#262626] bg-transparent outline-none focus:border-[#F24C20] focus:ring-1 focus:ring-[#F24C20]" 
                  />
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-[#0a0a0a] p-4 rounded-2xl space-y-4 border border-gray-100 dark:border-[#262626]">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                  <ListCheck className="w-4 h-4" /> Credits & Limits
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium mb-1">Points Granted</label>
                    <input 
                      type="number" 
                      name="points_granted" 
                      required 
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-[#262626] bg-white dark:bg-[#1a1a1a] outline-none focus:border-[#F24C20]" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">Project Posts</label>
                    <input 
                      type="number" 
                      name="project_post_limit" 
                      required 
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-[#262626] bg-white dark:bg-[#1a1a1a] outline-none focus:border-[#F24C20]" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">Interest Clicks</label>
                    <input 
                      type="number" 
                      name="interest_click_limit" 
                      required 
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-[#262626] bg-white dark:bg-[#1a1a1a] outline-none focus:border-[#F24C20]" 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium mb-1">Project Visit Limit</label>
                    <input 
                      type="number" 
                      name="project_visit_limit" 
                      required 
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-[#262626] bg-white dark:bg-[#1a1a1a] outline-none focus:border-[#F24C20]" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">Portfolio Visit Limit</label>
                    <input 
                      type="number" 
                      name="portfolio_visit_limit" 
                      required 
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-[#262626] bg-white dark:bg-[#1a1a1a] outline-none focus:border-[#F24C20]" 
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Features List (One Per Line)</label>
                <textarea 
                  name="features" 
                  rows={6}
                  placeholder="Unlimited Chat&#10;Verified Badge&#10;Priority Support"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-[#262626] bg-transparent outline-none focus:border-[#F24C20] resize-none"
                />
              </div>

              <div className="flex gap-4 pt-4 border-t border-gray-100 dark:border-[#262626]">
                <button 
                  type="button"
                  onClick={onBack}
                  className="flex-1 py-4 rounded-xl border border-gray-200 dark:border-[#262626] font-semibold hover:bg-gray-50 dark:hover:bg-[#262626] transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-4 rounded-xl bg-[#F24C20] text-white font-bold hover:bg-[#d9431b] transition-all shadow-lg shadow-[#F24C20]/20 flex items-center justify-center gap-2"
                >
                  <Save className="w-5 h-5" />
                  Save & Publish Plan
                </button>
              </div>
            </form>
          </motion.div>
        </div>

        {/* Info Column */}
        <div className="space-y-6">
          <div className="bg-[#044071] rounded-3xl p-6 text-white shadow-xl">
             <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
               <AlertCircle className="w-5 h-5 text-[#F24C20]" />
               Quick Tips
             </h3>
             <ul className="space-y-4 text-blue-100">
                <li className="text-sm">
                  <strong>Free Tiers:</strong> Set price to 0 to create a Free Trial or Starter plan.
                </li>
                <li className="text-sm">
                  <strong>Duration:</strong> Common durations are 30 days (Monthly), 365 days (Yearly).
                </li>
                <li className="text-sm">
                  <strong>Limits:</strong> Be generous with visits but restrictive with project posts to encourage upgrades.
                </li>
                <li className="text-sm">
                  <strong>Engagement:</strong> Interest clicks are high-value actions for freelancers.
                </li>
             </ul>
          </div>

          <div className="bg-white dark:bg-[#1a1a1a] rounded-3xl p-6 border border-gray-200 dark:border-[#262626]">
            <h3 className="text-lg font-bold mb-4">Preview Guide</h3>
            <p className="text-sm text-gray-500 mb-4">
              Once published, this plan will be visible to all users on the "Premium Plans" page of the main website.
            </p>
            <div className="flex items-center gap-2 text-[#F24C20] font-semibold text-sm">
              <Eye className="w-4 h-4" /> Live Preview System Enabled
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Re-using some icons
import { AlertCircle, Eye } from 'lucide-react';

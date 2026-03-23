import { useState } from 'react';
import { motion } from 'motion/react';
import { Eye, Briefcase, UserPlus, Crown, CreditCard, TrendingUp } from 'lucide-react';
import { ProfileViewModal } from './ProfileViewModal';
import { FreelancerLimitModal } from './FreelancerLimitModal';
import { UserDashboard } from './UserDashboard';
import { toast } from 'sonner@2.0.3';

interface FreelancerProfile {
  id: string;
  name: string;
  title: string;
  avatar: string;
  rating: number;
  hourlyRate: number;
}

interface UserState {
  planType: 'free' | 'premium';
  credits: number;
  projectApplications: number;
  hiresCount: number;
}

export function WebsiteDemo() {
  const [showDashboard, setShowDashboard] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [limitType, setLimitType] = useState<'projects' | 'hires'>('projects');
  const [selectedProfile, setSelectedProfile] = useState<FreelancerProfile | null>(null);

  const [userState, setUserState] = useState<UserState>({
    planType: 'free',
    credits: 1250,
    projectApplications: 2, // User has applied to 2 projects already
    hiresCount: 1 // User has hired 1 freelancer
  });

  const freelancers: FreelancerProfile[] = [
    {
      id: '1',
      name: 'Sarah Chen',
      title: 'Senior UI/UX Designer',
      avatar: 'https://i.pravatar.cc/150?img=1',
      rating: 4.9,
      hourlyRate: 85
    },
    {
      id: '2',
      name: 'Michael Rodriguez',
      title: 'Full Stack Developer',
      avatar: 'https://i.pravatar.cc/150?img=12',
      rating: 4.8,
      hourlyRate: 120
    },
    {
      id: '3',
      name: 'Emma Thompson',
      title: 'Content Strategist',
      avatar: 'https://i.pravatar.cc/150?img=5',
      rating: 5.0,
      hourlyRate: 65
    }
  ];

  const handleViewProfile = (freelancer: FreelancerProfile) => {
    setSelectedProfile(freelancer);
    setShowProfileModal(true);
  };

  const handleConfirmView = () => {
    if (selectedProfile) {
      // Deduct credits
      setUserState(prev => ({
        ...prev,
        credits: prev.credits - 365
      }));
      
      // Show success animation
      toast.success(`You can now view ${selectedProfile.name}'s full profile`);
    }
  };

  const handleApplyToProject = () => {
    if (userState.planType === 'free' && userState.projectApplications >= 3) {
      setLimitType('projects');
      setShowLimitModal(true);
      return;
    }

    setUserState(prev => ({
      ...prev,
      projectApplications: prev.projectApplications + 1
    }));
    toast.success('Application submitted successfully!');
  };

  const handleHireFreelancer = (name: string) => {
    if (userState.planType === 'free' && userState.hiresCount >= 3) {
      setLimitType('hires');
      setShowLimitModal(true);
      return;
    }

    setUserState(prev => ({
      ...prev,
      hiresCount: prev.hiresCount + 1
    }));
    toast.success(`${name} hired successfully!`);
  };

  if (showDashboard) {
    return (
      <div>
        <div className="p-4 bg-white dark:bg-[#1a1a1a] border-b border-gray-200 dark:border-[#262626] flex items-center justify-between">
          <button
            onClick={() => setShowDashboard(false)}
            className="px-4 py-2 text-[#044071] dark:text-white hover:bg-gray-100 dark:hover:bg-[#262626] rounded-lg transition-colors"
          >
            ← Back to Demo
          </button>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1 bg-[#F24C20]/10 rounded-lg">
              <CreditCard className="w-4 h-4 text-[#F24C20]" />
              <span className="text-sm font-semibold">{userState.credits} credits</span>
            </div>
            <div className={`px-3 py-1 rounded-lg ${
              userState.planType === 'premium' 
                ? 'bg-gradient-to-r from-[#F24C20] to-[#d43d15] text-white' 
                : 'bg-gray-200 dark:bg-[#262626] text-gray-700 dark:text-gray-300'
            }`}>
              {userState.planType === 'premium' ? '👑 Premium' : '⚡ Free Trial'}
            </div>
          </div>
        </div>
        <UserDashboard />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl border border-gray-200 dark:border-[#262626] p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-[#044071] dark:text-white mb-2">
                Go Experts Website Demo
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Experience the subscription & credit-based system
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowDashboard(true)}
              className="px-6 py-3 bg-[#044071] hover:bg-[#033050] text-white rounded-xl font-medium flex items-center gap-2"
            >
              <TrendingUp className="w-4 h-4" />
              View Dashboard
            </motion.button>
          </div>

          {/* User Status */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gray-50 dark:bg-[#0a0a0a] rounded-xl p-4">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Plan Type</div>
              <div className="flex items-center gap-2">
                {userState.planType === 'premium' ? (
                  <Crown className="w-5 h-5 text-[#F24C20]" />
                ) : (
                  <span className="text-xl">⚡</span>
                )}
                <span className="font-bold">
                  {userState.planType === 'premium' ? 'Premium' : 'Free Trial'}
                </span>
              </div>
            </div>
            
            <div className="bg-gray-50 dark:bg-[#0a0a0a] rounded-xl p-4">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Available Credits</div>
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-[#F24C20]" />
                <span className="font-bold">{userState.credits}</span>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-[#0a0a0a] rounded-xl p-4">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Project Applications</div>
              <div className="flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-[#044071]" />
                <span className="font-bold">{userState.projectApplications}/3</span>
                {userState.projectApplications >= 3 && (
                  <span className="text-xs text-red-600 ml-1">(Limit reached)</span>
                )}
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-[#0a0a0a] rounded-xl p-4">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Freelancers Hired</div>
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-green-600" />
                <span className="font-bold">{userState.hiresCount}/3</span>
                {userState.hiresCount >= 3 && (
                  <span className="text-xs text-red-600 ml-1">(Limit reached)</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Demo Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Freelancer Profiles */}
          <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl border border-gray-200 dark:border-[#262626] p-6">
            <h2 className="text-xl font-bold text-[#044071] dark:text-white mb-4">
              Browse Freelancers
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Click to view profile (costs 365 credits)
            </p>

            <div className="space-y-3">
              {freelancers.map((freelancer, index) => (
                <motion.div
                  key={freelancer.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-4 border border-gray-200 dark:border-[#262626] rounded-xl hover:border-[#F24C20] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={freelancer.avatar}
                      alt={freelancer.name}
                      className="w-12 h-12 rounded-full"
                    />
                    <div>
                      <div className="font-semibold">{freelancer.name}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {freelancer.title}
                      </div>
                      <div className="flex items-center gap-2 text-xs mt-1">
                        <span className="text-yellow-600">★ {freelancer.rating}</span>
                        <span className="text-gray-400">•</span>
                        <span className="text-green-600">${freelancer.hourlyRate}/hr</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleViewProfile(freelancer)}
                      className="px-4 py-2 bg-[#044071] hover:bg-[#033050] text-white rounded-lg text-sm font-medium flex items-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      View
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleHireFreelancer(freelancer.name)}
                      className="px-4 py-2 bg-[#F24C20] hover:bg-[#d43d15] text-white rounded-lg text-sm font-medium"
                    >
                      Hire
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Project Application */}
          <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl border border-gray-200 dark:border-[#262626] p-6">
            <h2 className="text-xl font-bold text-[#044071] dark:text-white mb-4">
              Apply to Projects
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Free plan allows 3 applications
            </p>

            <div className="space-y-3">
              {['E-commerce Website Development', 'Mobile App UI/UX Design', 'Content Writing & SEO'].map((project, index) => (
                <motion.div
                  key={project}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-4 border border-gray-200 dark:border-[#262626] rounded-xl"
                >
                  <h3 className="font-semibold mb-2">{project}</h3>
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Budget: $500-$1000
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleApplyToProject}
                      disabled={userState.planType === 'free' && userState.projectApplications >= 3}
                      className={`px-4 py-2 rounded-lg text-sm font-medium ${
                        userState.planType === 'free' && userState.projectApplications >= 3
                          ? 'bg-gray-200 dark:bg-[#262626] text-gray-500 cursor-not-allowed'
                          : 'bg-[#F24C20] hover:bg-[#d43d15] text-white'
                      }`}
                    >
                      {userState.planType === 'free' && userState.projectApplications >= 3 ? 'Upgrade to Apply' : 'Apply Now'}
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {selectedProfile && (
        <ProfileViewModal
          isOpen={showProfileModal}
          onClose={() => {
            setShowProfileModal(false);
            setSelectedProfile(null);
          }}
          profileName={selectedProfile.name}
          creditCost={365}
          userCredits={userState.credits}
          onConfirm={handleConfirmView}
        />
      )}

      <FreelancerLimitModal
        isOpen={showLimitModal}
        onClose={() => setShowLimitModal(false)}
        limitType={limitType}
        currentCount={limitType === 'projects' ? userState.projectApplications : userState.hiresCount}
        maxLimit={3}
      />
    </div>
  );
}

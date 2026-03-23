import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Star, TrendingUp, DollarSign, ShoppingBag, AlertCircle, CheckCircle, Ban, Mail, Shield, Loader2 } from 'lucide-react';
import api from '../lib/api';

interface UserProfileProps {
  userId: string;
  onBack: () => void;
}

export function UserProfile({ userId, onBack }: UserProfileProps) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        // Fallback: Fetch all users and find (since we might not have a single user endpoint yet)
        // Check if we have a direct endpoint first?
        // Let's rely on list for now to be safe, or direct if I add it.
        // I will add the direct endpoint in the next step.
        const response = await api.get(`/admin/users/${userId}`);
        if (response.data.success) {
          setUser(response.data.user);
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [userId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-[#F24C20] animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <div>User not found</div>;
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        Back to Users
      </button>

      {/* Profile Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200 dark:border-gray-700"
      >
        <div className="flex items-start gap-6">
          <img
            src={user.profile_image ? (user.profile_image.startsWith('http') ? user.profile_image : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${user.profile_image}`) : `https://ui-avatars.com/api/?name=${encodeURIComponent(user.full_name || 'U')}&background=random`}
            alt={user.full_name}
            className="w-24 h-24 rounded-2xl object-cover"
          />
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl font-bold">{user.full_name}</h1>
                  {user.is_email_verified && (
                    <span className="flex items-center gap-1 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 px-3 py-1 rounded-full text-sm">
                      <CheckCircle className="w-4 h-4" />
                      Verified
                    </span>
                  )}
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${!user.is_suspended
                      ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                      : 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400'
                      }`}
                  >
                    {!user.is_suspended ? 'Active' : 'Suspended'}
                  </span>
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-1">{user.email}</p>
                <p className="text-gray-600 dark:text-gray-400 mb-4">{user.location}</p>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                    <span className="font-semibold">{user.rating || '0.0'}</span>
                    <span className="text-gray-600 dark:text-gray-400 text-sm">Rating</span>
                  </div>
                  <div className="h-4 w-px bg-gray-300 dark:bg-gray-600"></div>
                  <div>
                    <span className="font-semibold">{user.total_orders || 0}</span>
                    <span className="text-gray-600 dark:text-gray-400 text-sm ml-1">Orders</span>
                  </div>
                  <div className="h-4 w-px bg-gray-300 dark:bg-gray-600"></div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400 text-sm">Member since </span>
                    <span className="font-semibold">{new Date(user.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium flex items-center gap-2"
          >
            <Mail className="w-4 h-4" />
            Send Message
          </motion.button>
          {!user.is_email_verified && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium flex items-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              Verify User
            </motion.button>
          )}
          {!user.is_suspended ? (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-medium flex items-center gap-2"
            >
              <Ban className="w-4 h-4" />
              Suspend User
            </motion.button>
          ) : (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium flex items-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              Activate User
            </motion.button>
          )}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 px-6 py-2 rounded-lg font-medium flex items-center gap-2"
          >
            <Shield className="w-4 h-4" />
            Reset Password
          </motion.button>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-900/20">
              <ShoppingBag className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Total Orders</p>
              <p className="text-2xl font-bold">{user.total_orders || 0}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-green-100 dark:bg-green-900/20">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Points Balance
              </p>
              <p className="text-2xl font-bold">
                {user.total_points || 0}
              </p>
            </div>
          </div>
        </motion.div>

      </div>

      {/* Details Sections */}
      <div>
      {/* Skills & Categories */}
      {( (user.skills && user.skills.length > 0) || (user.categories && user.categories.length > 0) ) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700"
        >
          <h3 className="text-lg font-bold mb-4">Skills</h3>
          <div className="flex flex-wrap gap-2">
            {(user.skills && user.skills.length > 0 ? user.skills : user.categories).map((item: any, index: number) => (
              <span
                key={index}
                className="bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 px-3 py-1 rounded-full text-sm font-medium"
              >
                {typeof item === 'object' ? item.name : item}
              </span>
            ))}
          </div>
        </motion.div>
      )}

      </div>
    </div>
  );
}

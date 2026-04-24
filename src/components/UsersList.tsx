import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import {
  Search,
  Filter,
  MoreVertical,
  Eye,
  CheckCircle,
  Ban,
  Mail,
  Trash2,
  ChevronLeft,
  ChevronRight,
  User,
  Loader2,
  Database,
  UserCheck,
  ShieldAlert,
  X,
  PlusCircle,
  Pencil,
  Key,
  Phone
} from 'lucide-react';
import api from '../lib/api';
import { KYCReviewModal } from './KYCReviewModal';
import { EditUserModal } from './EditUserModal';

interface UsersListProps {
  onSelectUser: (userId: string) => void;
  onVerifyUser?: (userId: string) => void;
  onAddUser?: () => void;
  viewType?: 'all' | 'verification' | 'suspended';
}

type UserFilterStatus =
  | 'all'
  | 'new'
  | 'active'
  | 'kyc_not_verified'
  | 'suspended'
  | 'blocked'
  | 'deleted'
  | 'paid';

type UserFilterRole = 'all' | 'freelancer' | 'client' | 'startup_creator' | 'investor';

export function UsersList({ onSelectUser, onVerifyUser, onAddUser, viewType = 'all' }: UsersListProps) {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<UserFilterStatus>(
    viewType === 'suspended' ? 'suspended' : viewType === 'verification' ? 'kyc_not_verified' : 'all'
  );
  const [filterRole, setFilterRole] = useState<UserFilterRole>('all');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [summaryCounts, setSummaryCounts] = useState({
    all: 0,
    new: 0,
    active: 0,
    kyc_not_verified: 0,
    suspended: 0,
    blocked: 0,
    deleted: 0,
    paid: 0
  });
  const [confirmAction, setConfirmAction] = useState<null | {
    title: string;
    message: string;
    confirmLabel: string;
    confirmTone?: 'red' | 'orange' | 'blue';
    onConfirm: () => Promise<void> | void;
  }>(null);
  const [textAction, setTextAction] = useState<null | {
    title: string;
    message: string;
    confirmLabel: string;
    placeholder: string;
    initialValue?: string;
    onConfirm: (value: string) => Promise<void> | void;
  }>(null);
  const [textActionValue, setTextActionValue] = useState('');
  const [walletAction, setWalletAction] = useState<null | {
    userId: string;
    userName: string;
    currentBalance: number;
  }>(null);
  const [walletAmount, setWalletAmount] = useState('');
  const [walletType, setWalletType] = useState<'credit' | 'deduct'>('credit');
  const [walletSubmitting, setWalletSubmitting] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);

  const itemsPerPage = 30;

  useEffect(() => {
    fetchUsers();
  }, [currentPage, filterStatus, filterRole]);

  useEffect(() => {
    setFilterRole('all');
    setSearchQuery('');
    setCurrentPage(1);
    setSelectedUsers([]);
  }, [viewType]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setCurrentPage(1);
      fetchUsers(1, searchQuery);
    }, 350);

    return () => window.clearTimeout(timeout);
  }, [searchQuery]);

  const fetchUsers = async (pageOverride?: number, searchOverride?: string) => {
    try {
      setLoading(true);
      const response = await api.get('/admin/users', {
        params: {
          page: pageOverride ?? currentPage,
          limit: itemsPerPage,
          search: (searchOverride ?? searchQuery).trim(),
          status: filterStatus,
          role: filterRole
        }
      });

      if (response.data.success) {
        setUsers(response.data.users);
        setTotalUsers(response.data.total || 0);
        setTotalPages(response.data.totalPages || 1);
        setSummaryCounts(response.data.summary || {
          all: 0,
          new: 0,
          active: 0,
          kyc_not_verified: 0,
          suspended: 0,
          blocked: 0,
          deleted: 0,
          paid: 0
        });
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyUser = async (userId: string) => {
    try {
      const response = await api.put(`/admin/users/${userId}/verify`);
      if (response.data.success) {
        toast.success('KYC verified successfully');
        fetchUsers();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to verify user');
    }
  };

  const handleOpenKYC = (user: any) => {
    onVerifyUser?.(user._id);
  };

  const handleSuspendUser = async (userId: string, currentlySuspended: boolean) => {
    try {
      const response = await api.put(`/admin/users/${userId}/suspend`);
      if (response.data.success) {
        toast.success(currentlySuspended ? 'User activated successfully' : 'User suspended successfully');
        fetchUsers();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update user status');
    }
  };

  const submitRejectUser = async (userId: string, reason: string) => {
    try {
      const response = await api.put(`/admin/users/${userId}/reject`, { reason });
      if (response.data.success) {
        toast.success('Profile rejection email sent');
        fetchUsers();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to reject user profile');
    }
  };

  const handleRemindComplete = async (userId: string) => {
    try {
      const response = await api.post(`/admin/users/${userId}/remind-complete`);
      if (response.data.success) {
        toast.success('Profile completion reminder email sent');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to send reminder');
    }
  };

  const submitSendEmail = async (userId: string, userName: string, message: string) => {
    try {
      const response = await api.post(`/admin/users/${userId}/send-email`, {
        subject: 'Message from Admin',
        message
      });
      if (response.data.success) {
        toast.success(`Email sent to ${userName}`);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to send email');
    }
  };

  const submitDeleteUser = async (userId: string) => {
    try {
      const response = await api.delete(`/admin/users/${userId}`);
      if (response.data.success) {
        toast.success('User deleted successfully');
        fetchUsers();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete user');
    }
  };

  const handleUserUpdated = (updatedUser: any) => {
    setUsers(prev => prev.map(u => u._id === updatedUser._id ? updatedUser : u));
  };

  const getUserAvatar = (user: any) => {
    const profileImage = user?.profile_image;
    if (!profileImage) {
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.full_name || 'U')}&background=random`;
    }

    if (profileImage.startsWith('http')) {
      return profileImage;
    }

    const baseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/+$/, '');
    const cleanPath = String(profileImage).replace(/^\/+/, '').replace(/\\/g, '/');
    return `${baseUrl}/${cleanPath}`;
  };

  const getUserPrimaryRole = (user: any): Exclude<UserFilterRole, 'all'> | 'unknown' => {
    if (user.roles?.includes('startup_creator')) return 'startup_creator';
    if (user.roles?.includes('investor')) return 'investor';
    if (user.roles?.includes('freelancer')) return 'freelancer';
    if (user.roles?.includes('client')) return 'client';
    return 'unknown';
  };

  const getUserDerivedState = (user: any) => {
    const isSuspended = Boolean(user.is_suspended);
    const isBlocked = Boolean(user.is_blocked || user.blocked || user.status === 'blocked');
    const isDeleted = Boolean(user.is_deleted || user.deleted_at || user.status === 'deleted');
    const isEmailVerified = Boolean(user.is_email_verified);
    const isKycVerified = user.kyc_status === 'fully_verified' || Boolean(user.kyc_details?.is_verified);
    const isKycNotVerified = !isKycVerified;
    const isPaidUser = Boolean(
      user.subscription_details?.plan_type === 'premium' ||
      user.subscription_details?.plan_name ||
      user.active_subscription ||
      user.is_paid_user ||
      user.total_paid_amount > 0
    );
    const createdAt = new Date(user.created_at || user.createdAt || 0);
    const daysSinceCreated = Number.isNaN(createdAt.getTime())
      ? Number.MAX_SAFE_INTEGER
      : Math.floor((Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24));
    const isNewUser = daysSinceCreated <= 7;
    const isActive = !isSuspended && !isBlocked && !isDeleted && isEmailVerified;

    return {
      isSuspended,
      isBlocked,
      isDeleted,
      isEmailVerified,
      isKycVerified,
      isKycNotVerified,
      isPaidUser,
      isNewUser,
      isActive
    };
  };

  const getActionVisibility = (user: any, currentFilter: UserFilterStatus) => {
    const state = getUserDerivedState(user);
    const hasKycSubmission = Boolean(user.kyc_details?.pancard || user.kyc_details?.pan_card || user.kyc_details?.aadhar_card || user.kyc_status === 'pending');
    const canQuickVerify = hasKycSubmission && !state.isKycVerified;

    const baseActions = {
      view: true,
      email: currentFilter !== 'deleted',
      reviewKyc: false,
      quickVerify: false,
      suspendToggle: false,
      reject: false,
      remind: false,
      delete: currentFilter === 'all' || currentFilter === 'deleted'
    };

    switch (currentFilter) {
      case 'new':
        return {
          ...baseActions,
          email: true,
          remind: true
        };
      case 'active':
        return {
          ...baseActions,
          suspendToggle: true
        };
      case 'kyc_not_verified':
        return {
          ...baseActions,
          reviewKyc: hasKycSubmission,
          quickVerify: canQuickVerify,
          reject: hasKycSubmission,
          remind: true
        };
      case 'suspended':
        return {
          ...baseActions,
          suspendToggle: true
        };
      case 'blocked':
        return {
          ...baseActions,
          suspendToggle: true
        };
      case 'deleted':
        return {
          ...baseActions,
          email: false,
          reviewKyc: false,
          quickVerify: false,
          suspendToggle: false,
          reject: false,
          remind: false,
          delete: false
        };
      case 'paid':
        return {
          ...baseActions,
          suspendToggle: true
        };
      case 'all':
      default:
        return {
          ...baseActions,
          reviewKyc: hasKycSubmission,
          quickVerify: canQuickVerify,
          suspendToggle: !state.isDeleted && !state.isBlocked,
          reject: hasKycSubmission && !state.isDeleted,
          remind: !state.isDeleted,
          delete: true
        };
    }
  };

  const submitWalletCredit = async () => {
    if (!walletAction) return;

    const baseAmount = Number(walletAmount);
    if (!Number.isFinite(baseAmount) || baseAmount <= 0) {
      toast.error('Enter a valid wallet amount');
      return;
    }

    const finalAmount = walletType === 'credit' ? baseAmount : -baseAmount;

    try {
      setWalletSubmitting(true);
      const response = await api.put(`/admin/users/${walletAction.userId}/wallet`, {
        amount: finalAmount,
        type: walletType === 'credit' ? 'bonus' : 'withdrawal',
        description: `Wallet ${walletType === 'credit' ? 'credited' : 'deducted'} by admin`
      });

      if (response.data.success) {
        toast.success(response.data.message || 'Wallet balance updated');
        setUsers(prev =>
          prev.map(user =>
            user._id === walletAction.userId
              ? { ...user, wallet_balance: response.data.balance }
              : user
          )
        );
        setWalletAction(null);
        setWalletAmount('');
        setWalletType('credit');
        fetchUsers();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update wallet');
    } finally {
      setWalletSubmitting(false);
    }
  };

  const startIndex = totalUsers === 0 ? 0 : (currentPage - 1) * itemsPerPage;
  const paginatedUsers = users;

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers(prev =>
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  const handleBulkAction = async (action: 'delete' | 'verify' | 'suspend' | 'activate' | 'seed_profile') => {
    try {
      setLoading(true);
      const response = await api.post('/admin/users/bulk', {
        userIds: selectedUsers,
        action
      });

      if (response.data.success) {
        toast.success(response.data.message);
        setSelectedUsers([]);
        fetchUsers();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Bulk action failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">

      <EditUserModal
        userId={editingUserId}
        onClose={() => setEditingUserId(null)}
        onUserUpdated={handleUserUpdated}
      />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Users Management</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage all users, verify identities, and monitor activities
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-[#F24C20] hover:bg-[#d43a12] text-white px-6 py-3 rounded-xl font-medium flex items-center gap-2"
          onClick={onAddUser}
        >
          <User className="w-5 h-5" />
          Add New User
        </motion.button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <select
              value={filterStatus}
              onChange={(e) => {
                setCurrentPage(1);
                setFilterStatus(e.target.value as any);
              }}
              style={{ backgroundColor: '#000000', color: '#ffffff', colorScheme: 'dark' }}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-black text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all" className="bg-black text-white">All Status</option>
              <option value="new" className="bg-black text-white">New Users</option>
              <option value="active" className="bg-black text-white">Active Users</option>
              <option value="kyc_not_verified" className="bg-black text-white">KYC Not Verified</option>
              <option value="suspended" className="bg-black text-white">Suspended</option>
              <option value="blocked" className="bg-black text-white">Blocked</option>
              <option value="deleted" className="bg-black text-white">Deleted</option>
              <option value="paid" className="bg-black text-white">Subscription / Paid Users</option>
            </select>
          </div>

          <div>
            <select
              value={filterRole}
              onChange={(e) => {
                setCurrentPage(1);
                setFilterRole(e.target.value as any);
              }}
              style={{ backgroundColor: '#000000', color: '#ffffff', colorScheme: 'dark' }}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-black text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all" className="bg-black text-white">All Roles</option>
              <option value="client" className="bg-black text-white">Client</option>
              <option value="freelancer" className="bg-black text-white">Freelancer</option>
              <option value="investor" className="bg-black text-white">Investor</option>
              <option value="startup_creator" className="bg-black text-white">Startup Idea Creator</option>
            </select>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mt-4">
          <button
            onClick={() => {
              setCurrentPage(1);
              setFilterStatus('all');
            }}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${filterStatus === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
          >
            All Users ({summaryCounts.all})
          </button>
          <button
            onClick={() => {
              setCurrentPage(1);
              setFilterStatus('new');
            }}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${filterStatus === 'new'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
          >
            New Users ({summaryCounts.new})
          </button>
          <button
            onClick={() => {
              setCurrentPage(1);
              setFilterStatus('active');
            }}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${filterStatus === 'active'
              ? 'bg-green-600 text-white'
              : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
          >
            Active Users ({summaryCounts.active})
          </button>
          <button
            onClick={() => {
              setCurrentPage(1);
              setFilterStatus('kyc_not_verified');
            }}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${filterStatus === 'kyc_not_verified'
              ? 'bg-yellow-500 text-black'
              : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
          >
            KYC Not Verified ({summaryCounts.kyc_not_verified})
          </button>
          <button
            onClick={() => {
              setCurrentPage(1);
              setFilterStatus('suspended');
            }}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${filterStatus === 'suspended'
              ? 'bg-red-600 text-white'
              : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
          >
            Suspended Users ({summaryCounts.suspended})
          </button>
          <button
            onClick={() => {
              setCurrentPage(1);
              setFilterStatus('blocked');
            }}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${filterStatus === 'blocked'
              ? 'bg-yellow-500 text-black'
              : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
          >
            Blocked Users ({summaryCounts.blocked})
          </button>
          <button
            onClick={() => {
              setCurrentPage(1);
              setFilterStatus('deleted');
            }}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${filterStatus === 'deleted'
              ? 'bg-red-600 text-white'
              : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
          >
            Deleted Users ({summaryCounts.deleted})
          </button>
          <button
            onClick={() => {
              setCurrentPage(1);
              setFilterStatus('paid');
            }}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${filterStatus === 'paid'
              ? 'bg-yellow-500 text-black'
              : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
          >
            Subscription / Paid Users ({summaryCounts.paid})
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900/50 sticky top-0">
              <tr>
                <th className="px-6 py-4 text-left">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedUsers(paginatedUsers.map(u => u._id));
                      } else {
                        setSelectedUsers([]);
                      }
                    }}
                  />
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">User</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Role</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Email Varification</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">KYC Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Joined</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 dark:text-white">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {loading ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center">
                    <Loader2 className="w-8 h-8 text-[#F24C20] animate-spin mx-auto mb-2" />
                    <p className="text-gray-500">Loading users...</p>
                  </td>
                </tr>
              ) : paginatedUsers.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center">
                    <p className="text-gray-500">No users found</p>
                  </td>
                </tr>
              ) : (paginatedUsers.map((user, index) => {
                const role = getUserPrimaryRole(user);
                const avatar = getUserAvatar(user);

                return (
                  <motion.tr
                    key={user._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ backgroundColor: 'rgba(59, 130, 246, 0.05)' }}
                    className="cursor-pointer"
                  >
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user._id)}
                        onChange={() => toggleUserSelection(user._id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={avatar}
                          alt={user.full_name}
                          className="w-10 h-10 rounded-full object-cover"
                          onError={(event) => {
                            event.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.full_name || 'U')}&background=random`;
                          }}
                        />
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">{user.full_name}</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">{user.email}</div>
                          <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                            <Phone className="w-3 h-3" />
                            {user.whatsapp_number ? `${user.whatsapp_country_code || ''} ${user.whatsapp_number}` : user.phone_number || 'No phone'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${role === 'freelancer'
                          ? 'bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400'
                          : role === 'client'
                            ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
                            : role === 'investor'
                              ? 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400'
                              : 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                          }`}
                      >
                        {role === 'investor' ? 'Investor' :
                          role === 'startup_creator' ? 'Startup Idea Creator' :
                            role === 'unknown' ? 'Unknown' :
                              role.charAt(0).toUpperCase() + role.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {user.is_email_verified ? (
                        <div className="flex items-center gap-1 text-green-600">
                          <CheckCircle className="w-4 h-4" />
                          <span className="text-xs font-medium">Verified</span>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-500 dark:text-gray-400">Not Verified</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {getUserDerivedState(user).isKycVerified ? (
                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 w-fit">
                          <ShieldAlert className="w-3.5 h-3.5" />
                          <span className="text-[10px] font-bold uppercase tracking-wider">Verified</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 text-red-500 w-fit">
                          <X className="w-3.5 h-3.5" />
                          <span className="text-[10px] font-bold uppercase tracking-wider">Not Verified</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {new Date(user.created_at || user.createdAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-3">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => {
                            setWalletAction({
                              userId: user._id,
                              userName: user.full_name,
                              currentBalance: Number(user.wallet_balance ?? user.wallet?.balance ?? 0)
                            });
                            setWalletAmount('');
                            setWalletType('credit');
                          }}
                          className="p-2 hover:bg-emerald-100 dark:hover:bg-emerald-900/20 rounded-lg transition-colors"
                          title="Add Wallet Balance"
                        >
                          <PlusCircle className="w-4 h-4 text-emerald-600" />
                        </motion.button>
                        {getActionVisibility(user, filterStatus).view && (
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => onSelectUser(user._id)}
                            className="p-2 hover:bg-blue-100 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                            title="View Profile"
                          >
                            <Eye className="w-4 h-4 text-blue-600" />
                          </motion.button>
                        )}
                        {getActionVisibility(user, filterStatus).reviewKyc && (
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleOpenKYC(user)}
                            className={`p-2 rounded-lg transition-colors ${user.kyc_details?.pancard || user.kyc_details?.pan_card ? 'bg-orange-500/10 hover:bg-orange-500/20 text-orange-600' : 'hover:bg-gray-100'}`}
                            title="Review KYC Documents"
                          >
                            <ShieldAlert className="w-4 h-4" />
                          </motion.button>
                        )}
                        {getActionVisibility(user, filterStatus).quickVerify && (
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleVerifyUser(user._id)}
                            className="p-2 hover:bg-green-100 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                            title="Quick KYC Verify"
                          >
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          </motion.button>
                        )}
                        {getActionVisibility(user, filterStatus).email && (
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => {
                              setTextAction({
                                title: `Send message to ${user.full_name}`,
                                message: 'Write the email message you want to send to this user.',
                                confirmLabel: 'Send Message',
                                placeholder: 'Type your message here...',
                                onConfirm: (value) => submitSendEmail(user._id, user.full_name, value)
                              });
                              setTextActionValue('');
                            }}
                            className="p-2 hover:bg-orange-100 dark:hover:bg-orange-900/20 rounded-lg transition-colors"
                            title="Send Message"
                          >
                            <Mail className="w-4 h-4 text-orange-600" />
                          </motion.button>
                        )}
                        {getActionVisibility(user, filterStatus).suspendToggle && (
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleSuspendUser(user._id, user.is_suspended)}
                            className={`p-2 rounded-lg transition-colors ${user.is_suspended
                              ? 'hover:bg-green-100 dark:hover:bg-green-900/20'
                              : 'hover:bg-red-100 dark:hover:bg-red-900/20'
                              }`}
                            title={user.is_suspended ? 'Activate User' : 'Suspend User'}
                          >
                            {user.is_suspended ? (
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            ) : (
                              <Ban className="w-4 h-4 text-red-600" />
                            )}
                          </motion.button>
                        )}
                        {getActionVisibility(user, filterStatus).reject && (
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => {
                              setTextAction({
                                title: `Reject ${user.full_name}`,
                                message: 'Enter the reason that should be sent with the rejection email.',
                                confirmLabel: 'Reject User',
                                placeholder: 'Enter rejection reason...',
                                onConfirm: (value) => submitRejectUser(user._id, value)
                              });
                              setTextActionValue('');
                            }}
                            className="p-2 hover:bg-orange-100 dark:hover:bg-orange-900/20 rounded-lg transition-colors text-orange-600"
                            title="Reject Profile"
                          >
                            <Ban className="w-4 h-4" />
                          </motion.button>
                        )}
                        {getActionVisibility(user, filterStatus).remind && (
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleRemindComplete(user._id)}
                            className="p-2 hover:bg-yellow-100 dark:hover:bg-yellow-900/20 rounded-lg transition-colors text-yellow-600"
                            title="Remind to Complete Profile"
                          >
                            <Loader2 className="w-4 h-4" />
                          </motion.button>
                        )}
                        {getActionVisibility(user, filterStatus).delete && (
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setConfirmAction({
                              title: 'Delete User',
                              message: `Are you sure you want to delete "${user.full_name}"? This cannot be undone.`,
                              confirmLabel: 'Delete User',
                              confirmTone: 'red',
                              onConfirm: () => submitDeleteUser(user._id)
                            })}
                            className="p-2 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                            title="Delete User"
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </motion.button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                );
              }))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {totalUsers === 0
              ? 'Showing 0 users'
              : `Showing ${startIndex + 1} to ${Math.min(startIndex + users.length, totalUsers)} of ${totalUsers} users`}
          </div>
          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-5 h-5" />
            </motion.button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <motion.button
                key={page}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setCurrentPage(page)}
                className={`w-10 h-10 rounded-lg font-medium transition-colors ${currentPage === page
                  ? 'bg-blue-600 text-white'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
              >
                {page}
              </motion.button>
            ))}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-5 h-5" />
            </motion.button>
          </div>
        </div>
      </div>


      <AnimatePresence>
        {selectedUsers.length > 0 && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-[#1a1a1a] text-white px-8 py-4 rounded-3xl shadow-2xl border border-white/10 flex items-center gap-8 backdrop-blur-xl"
          >
            <div className="flex items-center gap-3 pr-8 border-r border-white/10">
              <div className="w-10 h-10 rounded-2xl bg-[#F24C20] flex items-center justify-center font-bold">
                {selectedUsers.length}
              </div>
              <div>
                <div className="text-sm font-bold">Users Selected</div>
                <div className="text-[10px] text-white/50 uppercase tracking-widest">Bulk Actions Ready</div>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => handleBulkAction('verify')}
                className="flex items-center gap-2 px-4 py-2 hover:bg-white/5 rounded-xl transition-all text-sm font-medium"
              >
                <UserCheck className="w-4 h-4 text-green-400" /> Verify
              </button>
              <button
                onClick={() => handleBulkAction('suspend')}
                className="flex items-center gap-2 px-4 py-2 hover:bg-white/5 rounded-xl transition-all text-sm font-medium"
              >
                <Ban className="w-4 h-4 text-orange-400" /> Suspend
              </button>
              <button
                onClick={() => handleBulkAction('activate')}
                className="flex items-center gap-2 px-4 py-2 hover:bg-white/5 rounded-xl transition-all text-sm font-medium"
              >
                <CheckCircle className="w-4 h-4 text-blue-400" /> Activate
              </button>
              <button
                onClick={() => handleBulkAction('seed_profile')}
                className="flex items-center gap-2 px-4 py-2 hover:bg-white/5 rounded-xl transition-all text-sm font-medium"
              >
                <Database className="w-4 h-4 text-purple-400" /> Seed Profiles
              </button>
              <button
                onClick={() => setConfirmAction({
                  title: 'Delete Selected Users',
                  message: `Are you sure you want to delete ${selectedUsers.length} selected users? This cannot be undone.`,
                  confirmLabel: 'Delete Selected',
                  confirmTone: 'red',
                  onConfirm: () => handleBulkAction('delete')
                })}
                className="flex items-center gap-2 px-4 py-2 hover:bg-red-500/10 text-red-400 rounded-xl transition-all text-sm font-medium"
              >
                <Trash2 className="w-4 h-4" /> Delete
              </button>
            </div>

            <button
              onClick={() => setSelectedUsers([])}
              className="ml-4 p-2 hover:bg-white/5 rounded-lg transition-all"
            >
              <X className="w-5 h-5 opacity-50 hover:opacity-100" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Global Modals Portal */}
      {typeof document !== 'undefined' && createPortal(
        <>
          <AnimatePresence>
            {confirmAction && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100000] bg-black/60 backdrop-blur-md flex items-center justify-center p-4"
                style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh' }}
              >
                <motion.div
                  initial={{ scale: 0.96, opacity: 0, y: 16 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.96, opacity: 0, y: 16 }}
                  className="w-full max-w-md rounded-2xl border border-white/10 bg-[#1a2232] p-6 shadow-2xl"
                >
                  <h3 className="text-lg font-bold text-white">{confirmAction.title}</h3>
                  <p className="mt-2 text-sm text-gray-300">{confirmAction.message}</p>
                  <div className="mt-6 flex justify-end gap-3">
                    <button
                      onClick={() => setConfirmAction(null)}
                      className="px-4 py-2 rounded-xl border border-white/10 text-gray-300 hover:bg-white/5"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={async () => {
                        await confirmAction.onConfirm();
                        setConfirmAction(null);
                      }}
                      className={`px-4 py-2 rounded-xl font-medium text-white ${confirmAction.confirmTone === 'red'
                        ? 'bg-red-600 hover:bg-red-500'
                        : confirmAction.confirmTone === 'orange'
                          ? 'bg-orange-600 hover:bg-orange-500'
                          : 'bg-blue-600 hover:bg-blue-500'
                        }`}
                    >
                      {confirmAction.confirmLabel}
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {walletAction && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100000] bg-black/60 backdrop-blur-md flex items-center justify-center p-4"
                style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh' }}
              >
                <motion.div
                  initial={{ scale: 0.96, opacity: 0, y: 16 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.96, opacity: 0, y: 16 }}
                  className=" max-w-[320px] rounded-2xl border border-white/10 bg-dark p-6 shadow-2xl"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-white">Adjust Wallet Balance</h3>
                    <button
                      onClick={() => {
                        setWalletAction(null);
                        setWalletAmount('');
                        setWalletType('credit');
                      }}
                      className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5 text-gray-500" />
                    </button>
                  </div>

                  <p className="mb-4 text-sm text-gray-400">
                    Update balance for <span className="text-white font-medium">{walletAction.userName}</span>
                  </p>

                  <div className="mb-5 p-3 rounded-xl bg-black/40 border border-white/5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500 uppercase font-bold tracking-wider">Current Balance</span>
                      <span className="text-xl font-bold text-emerald-500">₹{walletAction.currentBalance.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-500">Transaction Type</label>
                      <div className="flex p-1 bg-black/40 rounded-xl border border-white/5">
                        <button
                          onClick={() => setWalletType('credit')}
                          className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${walletType === 'credit' ? 'bg-emerald-500 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                        >
                          Credit (+)
                        </button>
                        <button
                          onClick={() => setWalletType('deduct')}
                          className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${walletType === 'deduct' ? 'bg-red-500 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                        >
                          Deduct (-)
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-500">Amount (₹)</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500/70 font-bold">₹</span>
                        <input
                          type="number"
                          min="1"
                          value={walletAmount}
                          onChange={(e) => setWalletAmount(e.target.value)}
                          placeholder="Enter amount..."
                          className="w-full rounded-xl border border-white/10 bg-black/40 pl-8 pr-4 py-3 text-lg font-bold text-emerald-500 outline-none focus:border-emerald-500 placeholder:text-white/60"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex gap-3">
                    <button
                      onClick={() => {
                        setWalletAction(null);
                        setWalletAmount('');
                        setWalletType('credit');
                      }}
                      className="flex-1 px-4 py-2.5 rounded-xl border border-white/10 text-gray-300 hover:bg-white/5 text-sm font-medium transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={submitWalletCredit}
                      disabled={walletSubmitting}
                      className={`flex-1 rounded-xl px-4 py-2.5 font-bold text-white transition-all disabled:opacity-50 ${walletType === 'credit' ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-900/20 shadow-lg' : 'bg-red-600 hover:bg-red-500 shadow-red-900/20 shadow-lg'}`}
                    >
                      {walletSubmitting ? <Loader2 className="h-5 w-5 animate-spin mx-auto" /> : `${walletType === 'credit' ? 'Add' : 'Deduct'} Amount`}
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {textAction && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100000] bg-black/60 backdrop-blur-md flex items-center justify-center p-4"
                style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh' }}
              >
                <motion.div
                  initial={{ scale: 0.96, opacity: 0, y: 16 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.96, opacity: 0, y: 16 }}
                  className=" max-w-lg rounded-2xl border border-white/10 bg-[#1a2232] p-6 shadow-2xl"
                >
                  <h3 className="text-lg font-bold text-white">{textAction.title}</h3>
                  <p className="mt-2 text-sm text-gray-300">{textAction.message}</p>
                  <textarea
                    value={textActionValue}
                    onChange={(e) => setTextActionValue(e.target.value)}
                    placeholder={textAction.placeholder}
                    rows={5}
                    className="mt-4 w-full rounded-xl border border-white/10 bg-[#0f1725] px-4 py-3 text-sm text-white outline-none focus:border-[#F24C20]"
                  />
                  <div className="mt-6 flex justify-end gap-3">
                    <button
                      onClick={() => {
                        setTextAction(null);
                        setTextActionValue('');
                      }}
                      className="px-4 py-2 rounded-xl border border-white/10 text-gray-300 hover:bg-white/5"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={async () => {
                        if (!textActionValue.trim()) {
                          toast.error('Please enter a message');
                          return;
                        }
                        await textAction.onConfirm(textActionValue.trim());
                        setTextAction(null);
                        setTextActionValue('');
                      }}
                      className="px-4 py-2 rounded-xl bg-[#F24C20] hover:bg-[#d43a12] font-medium text-white"
                    >
                      {textAction.confirmLabel}
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </>,
        document.body
      )}
    </div>
  );
}
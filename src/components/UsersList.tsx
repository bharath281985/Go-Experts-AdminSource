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
    setFilterStatus(viewType === 'suspended' ? 'suspended' : viewType === 'verification' ? 'kyc_not_verified' : 'all');
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
        if (!currentlySuspended) {
          setFilterStatus('suspended');
          setCurrentPage(1);
        }
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
        toast.success('User rejected. Profile view is no longer shown.');
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
        toast.success('User permanently deleted');
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
    const isBlocked = Boolean(user.is_suspended || user.is_blocked || user.blocked || user.status === 'blocked' || user.kyc_status === 'rejected');
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
    const isRejected = user.kyc_status === 'rejected';

    const baseActions = {
      view: !isRejected,
      email: currentFilter !== 'deleted' && !isRejected,
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
          reviewKyc: !isRejected,
          quickVerify: canQuickVerify,
          reject: !isRejected,
          remind: !isRejected
        };
      case 'suspended':
        return {
          ...baseActions,
          suspendToggle: true
        };
      case 'blocked':
        return {
          ...baseActions,
          view: true,
          suspendToggle: true,
          delete: true
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
          reviewKyc: !isRejected && (hasKycSubmission || state.isKycNotVerified),
          quickVerify: canQuickVerify,
          suspendToggle: !state.isDeleted && !state.isBlocked,
          reject: !isRejected && hasKycSubmission && !state.isDeleted,
          remind: !isRejected && !state.isDeleted,
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

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-gray-100 dark:border-[#262626] pb-8">
        <div>
          <h1 className="text-2xl font-semibold text-[#044071] dark:text-white mb-2 tracking-tight">Ecosystem Entity Directory</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm font-medium italic opacity-70">
            "Authorized oversight of global user profiles, identity protocols, and interaction telemetry."
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          className="bg-[#F24C20] hover:bg-[#d43a12] text-white px-8 py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] flex items-center gap-3 shadow-xl shadow-orange-500/20 transition-all"
          onClick={onAddUser}
        >
          <PlusCircle className="w-4 h-4" />
          Initialize New Entity
        </motion.button>
      </div>

      <div className="bg-white dark:bg-[#1a1a1a] rounded-[2.5rem] p-8 border border-gray-100 dark:border-[#262626] shadow-sm space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="md:col-span-2">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-300 group-focus-within:text-[#F24C20] transition-colors" />
              <input
                type="text"
                placeholder="Search semantic identities (Name, ID, Email)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-50 dark:border-[#262626] bg-gray-50/50 dark:bg-black/20 focus:bg-white dark:focus:bg-black/40 focus:ring-4 focus:ring-[#F24C20]/5 transition-all outline-none text-sm font-medium"
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
              className="w-full px-4 py-4 rounded-2xl border border-gray-50 dark:border-[#262626] bg-gray-50/50 dark:bg-black/20 text-sm font-bold text-gray-600 dark:text-gray-300 focus:ring-4 focus:ring-[#F24C20]/5 outline-none cursor-pointer"
            >
              <option value="all">Protocol Status: All</option>
              <option value="new">New Entrants (7d)</option>
              <option value="active">Operational Assets</option>
              <option value="kyc_not_verified">Pending Verification</option>
              <option value="suspended">Suspended Nodes</option>
              <option value="blocked">Deauthorized</option>
              <option value="deleted">Purged Entities</option>
              <option value="paid">Premium Protocols</option>
            </select>
          </div>

          <div>
            <select
              value={filterRole}
              onChange={(e) => {
                setCurrentPage(1);
                setFilterRole(e.target.value as any);
              }}
              className="w-full px-4 py-4 rounded-2xl border border-gray-50 dark:border-[#262626] bg-gray-50/50 dark:bg-black/20 text-sm font-bold text-gray-600 dark:text-gray-300 focus:ring-4 focus:ring-[#F24C20]/5 outline-none cursor-pointer"
            >
              <option value="all">Ecosystem Role: All</option>
              <option value="client">Primary Client</option>
              <option value="freelancer">Active Specialist</option>
              <option value="investor">Capital Source</option>
              <option value="startup_creator">Concept Architect</option>
            </select>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          {[
            { id: 'all', label: 'Global Registry', count: summaryCounts.all, color: 'text-indigo-600 bg-indigo-50 border-indigo-100' },
            { id: 'new', label: 'Recent Deployment', count: summaryCounts.new, color: 'text-blue-600 bg-blue-50 border-blue-100' },
            { id: 'active', label: 'Operational', count: summaryCounts.active, color: 'text-emerald-600 bg-emerald-50 border-emerald-100' },
            { id: 'kyc_not_verified', label: 'KYC Pending', count: summaryCounts.kyc_not_verified, color: 'text-amber-600 bg-amber-50 border-amber-100' },
            { id: 'blocked', label: 'Restricted', count: summaryCounts.blocked, color: 'text-orange-600 bg-orange-50 border-orange-100' },
            { id: 'deleted', label: 'Terminated', count: summaryCounts.deleted, color: 'text-red-600 bg-red-50 border-red-100' },
            { id: 'paid', label: 'Premium Tier', count: summaryCounts.paid, color: 'text-[#F24C20] bg-orange-50 border-orange-100' }
          ].map((chip) => (
            <button
              key={chip.id}
              onClick={() => {
                setCurrentPage(1);
                setFilterStatus(chip.id as any);
              }}
              className={`flex items-center gap-2.5 px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border ${
                filterStatus === chip.id 
                ? 'bg-[#F24C20] text-white border-[#F24C20] shadow-lg shadow-orange-500/20 scale-105' 
                : `${chip.color} hover:shadow-md opacity-80 hover:opacity-100`
              }`}
            >
              {chip.label}
              <span className={`px-2 py-0.5 rounded-full text-[9px] ${filterStatus === chip.id ? 'bg-white/20' : 'bg-black/5'}`}>
                {chip.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-[#1a1a1a] rounded-[2.5rem] border border-gray-100 dark:border-[#262626] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50/50 dark:bg-black/20 border-b border-gray-50 dark:border-[#262626]">
              <tr>
                <th className="px-8 py-5 text-left">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded-lg border-gray-200 text-[#F24C20] focus:ring-[#F24C20]/20"
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedUsers(paginatedUsers.map(u => u._id));
                      } else {
                        setSelectedUsers([]);
                      }
                    }}
                  />
                </th>
                <th className="px-8 py-5 text-left text-[11px] font-black uppercase tracking-widest text-gray-400">Entity Identity</th>
                <th className="px-8 py-5 text-left text-[11px] font-black uppercase tracking-widest text-gray-400">Ecosystem Role</th>
                <th className="px-8 py-5 text-left text-[11px] font-black uppercase tracking-widest text-gray-400">Mail Protocol</th>
                <th className="px-8 py-5 text-left text-[11px] font-black uppercase tracking-widest text-gray-400">KYC Clearance</th>
                <th className="px-8 py-5 text-left text-[11px] font-black uppercase tracking-widest text-gray-400">Initialization</th>
                <th className="px-8 py-5 text-center text-[11px] font-black uppercase tracking-widest text-gray-400">Command Center</th>
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
                      ) : user.kyc_status === 'rejected' ? (
                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/10 text-orange-500 w-fit">
                          <Ban className="w-3.5 h-3.5" />
                          <span className="text-[10px] font-bold uppercase tracking-wider">Rejected</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleOpenKYC(user)}
                          className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 text-red-500 w-fit hover:bg-red-500/20 transition-colors"
                          title="Open verification details"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span className="text-[10px] font-bold uppercase tracking-wider">Not Verified</span>
                        </button>
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
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => setEditingUserId(user._id)}
                          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                          title="Edit User"
                        >
                          <Pencil className="w-4 h-4 text-slate-500" />
                        </motion.button>
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
                            title={user.is_suspended ? 'Restore Access' : 'Blocked User'}
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
                title="Mark selected users as Blocked"
              >
                <Ban className="w-4 h-4 text-orange-400" /> Blocked User
              </button>
              <button
                onClick={() => handleBulkAction('activate')}
                className="flex items-center gap-2 px-4 py-2 hover:bg-white/5 rounded-xl transition-all text-sm font-medium"
                title="Restore access for selected users"
              >
                <CheckCircle className="w-4 h-4 text-blue-400" /> Restore Access
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
                className="fixed inset-0 z-[100000] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md"
                style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh' }}
              >
                <motion.div
                  initial={{ scale: 0.96, opacity: 0, y: 16 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.96, opacity: 0, y: 16 }}
                  className="w-full max-w-md rounded-3xl border border-[#27272a] bg-[#09090b] p-8 shadow-2xl"
                >
                  <h3 className="text-xl font-bold text-white">{confirmAction.title}</h3>
                  <p className="mt-3 text-sm text-gray-400 leading-relaxed">{confirmAction.message}</p>
                  <div className="mt-8 flex justify-end gap-3">
                    <button
                      onClick={() => setConfirmAction(null)}
                      className="px-6 py-3 rounded-xl border border-[#27272a] text-gray-400 font-semibold hover:bg-[#18181b] hover:text-white transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={async () => {
                        await confirmAction.onConfirm();
                        setConfirmAction(null);
                      }}
                      className={`px-6 py-3 rounded-xl font-bold text-white transition-all shadow-lg ${confirmAction.confirmTone === 'red'
                        ? 'bg-red-600 hover:bg-red-500 shadow-red-900/20'
                        : confirmAction.confirmTone === 'orange'
                          ? 'bg-orange-600 hover:bg-orange-500 shadow-orange-900/20'
                          : 'bg-blue-600 hover:bg-blue-500 shadow-blue-900/20'
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
                className="fixed inset-0 z-[100000] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md"
                style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh' }}
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0, y: 20 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.9, opacity: 0, y: 20 }}
                  className="relative w-full max-w-md overflow-hidden rounded-[2.5rem] border border-[#27272a] bg-[#09090b] p-8 shadow-[0_20px_80px_rgba(0,0,0,0.6)]"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[#F24C20]/10 to-transparent" />

                  <div className="relative">
                    <div className="mb-8 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F24C20]/15 text-[#F24C20] ring-1 ring-[#F24C20]/20">
                          <PlusCircle className="h-6 w-6" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold tracking-tight text-white">Adjust Balance</h3>
                          <p className="text-sm font-semibold text-gray-500">{walletAction.userName}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setWalletAction(null);
                          setWalletAmount('');
                          setWalletType('credit');
                        }}
                        className="group flex h-10 w-10 items-center justify-center rounded-xl border border-[#27272a] bg-[#18181b] text-gray-400 transition-all hover:bg-[#27272a] hover:text-white"
                      >
                        <X className="h-5 w-5 transition-transform group-hover:rotate-90" />
                      </button>
                    </div>

                    <div className="mb-8 rounded-3xl bg-white/[0.03] p-6 border border-white/10">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Current Balance</p>
                          <p className="mt-1 text-3xl font-bold text-white">₹{walletAction.currentBalance.toLocaleString()}</p>
                        </div>
                        <div className="h-10 w-10 rounded-2xl bg-emerald-500/10 p-2 text-emerald-500 border border-emerald-500/20">
                          <Database className="h-full w-full" />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <label className="mb-3 block text-[11px] font-black uppercase tracking-widest text-gray-500">Transaction Type</label>
                        <div className="grid grid-cols-2 gap-2 rounded-2xl bg-black p-1.5 border border-[#27272a]">
                          <button
                            onClick={() => setWalletType('credit')}
                            className={`flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold transition-all duration-300 ${walletType === 'credit' ? 'bg-[#F24C20] text-white shadow-lg shadow-[#F24C20]/30' : 'text-gray-500 hover:text-gray-300 hover:bg-[#18181b]'}`}
                          >
                            <PlusCircle className="h-4 w-4" />
                            Credit
                          </button>
                          <button
                            onClick={() => setWalletType('deduct')}
                            className={`flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold transition-all duration-300 ${walletType === 'deduct' ? 'bg-red-600 text-white shadow-lg shadow-red-900/30' : 'text-gray-500 hover:text-gray-300 hover:bg-[#18181b]'}`}
                          >
                            <Ban className="h-4 w-4" />
                            Deduct
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="mb-3 block text-[11px] font-black uppercase tracking-widest text-gray-500">Amount to {walletType === 'credit' ? 'Add' : 'Remove'}</label>
                        <div className="group relative">
                          <input
                            type="number"
                            min="1"
                            value={walletAmount}
                            onChange={(e) => setWalletAmount(e.target.value)}
                            placeholder="0.00"
                            style={{ scrollbarWidth: 'none' }}
                            className="h-16 w-full rounded-2xl border border-[#27272a] bg-black px-6 text-xl font-bold text-white transition-all placeholder:text-gray-700 focus:bg-[#18181b] focus:border-[#F24C20] outline-none"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="mt-10 flex gap-3">
                      <button
                        onClick={() => {
                          setWalletAction(null);
                          setWalletAmount('');
                          setWalletType('credit');
                        }}
                        className="flex-1 rounded-2xl border border-[#27272a] bg-[#18181b] py-4 text-sm font-bold text-gray-400 transition-all hover:bg-[#27272a] hover:text-white"
                      >
                        Discard
                      </button>
                      <button
                        onClick={submitWalletCredit}
                        disabled={walletSubmitting || !walletAmount}
                        className={`flex-[1.5] flex items-center justify-center gap-2 rounded-2xl py-4 text-sm font-bold text-white transition-all duration-300 disabled:opacity-30 ${walletType === 'credit' ? 'bg-[#F24C20] hover:bg-[#ff5d33] shadow-lg shadow-[#F24C20]/40' : 'bg-red-600 hover:bg-red-500 shadow-lg shadow-red-900/40'}`}
                      >
                        {walletSubmitting ? (
                          <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                          <>
                            {walletType === 'credit' ? 'Add Credits' : 'Deduct Credits'}
                          </>
                        )}
                      </button>
                    </div>
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
                className="fixed inset-0 z-[100000] bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
                style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh' }}
              >
                <motion.div
                  initial={{ scale: 0.96, opacity: 0, y: 16 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.96, opacity: 0, y: 16 }}
                  className="w-full max-w-lg rounded-3xl border border-[#27272a] bg-[#09090b] p-8 shadow-2xl"
                >
                  <h3 className="text-xl font-bold text-white">{textAction.title}</h3>
                  <p className="mt-3 text-sm text-gray-400 leading-relaxed">{textAction.message}</p>
                  <textarea
                    value={textActionValue}
                    onChange={(e) => setTextActionValue(e.target.value)}
                    placeholder={textAction.placeholder}
                    rows={5}
                    className="mt-6 w-full rounded-2xl border border-[#27272a] bg-black px-6 py-4 text-sm text-white outline-none focus:border-[#F24C20] focus:bg-[#18181b] transition-all resize-none"
                  />
                  <div className="mt-8 flex justify-end gap-3">
                    <button
                      onClick={() => {
                        setTextAction(null);
                        setTextActionValue('');
                      }}
                      className="px-6 py-3 rounded-xl border border-[#27272a] text-gray-400 font-semibold hover:bg-[#18181b] hover:text-white transition-all"
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
                      className="px-6 py-3 rounded-xl bg-[#F24C20] hover:bg-[#d43a12] font-bold text-white shadow-lg shadow-[#F24C20]/20 transition-all"
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

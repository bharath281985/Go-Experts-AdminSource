import { useState, useEffect } from 'react';
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
  Pencil,
  ChevronLeft,
  ChevronRight,
  User,
  Loader2,
  Database,
  UserCheck,
  ShieldAlert,
  X
} from 'lucide-react';
import api from '../lib/api';
import { EditUserModal } from './EditUserModal';
import { KYCReviewModal } from './KYCReviewModal';

interface UsersListProps {
  onSelectUser: (userId: string) => void;
  onAddUser?: () => void;
  viewType?: 'all' | 'verification' | 'suspended';
}

export function UsersList({ onSelectUser, onAddUser, viewType = 'all' }: UsersListProps) {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'suspended' | 'pending'>(
    viewType === 'suspended' ? 'suspended' : viewType === 'verification' ? 'pending' : 'all'
  );
  const [filterRole, setFilterRole] = useState<'all' | 'client' | 'freelancer' | 'both'>('all');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [kycModalOpen, setKycModalOpen] = useState(false);
  const [selectedUserForKYC, setSelectedUserForKYC] = useState<any>(null);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/users');
      if (response.data.success) {
        setUsers(response.data.users);
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
    setSelectedUserForKYC(user);
    setKycModalOpen(true);
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

  const handleRejectUser = async (userId: string) => {
    const reason = window.prompt('Please enter the reason for rejection:');
    if (reason === null) return; // Cancelled
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

  const handleSendEmail = async (userId: string, userName: string) => {
    const message = window.prompt(`Send an email to ${userName}:`);
    if (!message) return;
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

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!window.confirm(`Are you sure you want to delete "${userName}"? This cannot be undone.`)) return;
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

  const filteredUsers = users.filter(user => {
    const name = user.full_name || '';
    const email = user.email || '';
    const matchesSearch = name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email.toLowerCase().includes(searchQuery.toLowerCase());

    const isSuspended = user.is_suspended || false;
    const isVerified = user.is_email_verified || false;

    // Filter by Status: All, Active (not suspended & verified), Suspended, Pending (unverified)
    const matchesStatus = filterStatus === 'all' ||
      (filterStatus === 'suspended' && isSuspended) ||
      (filterStatus === 'active' && !isSuspended && isVerified) ||
      (filterStatus === 'pending' && !isVerified);

    const isFreelancer = user.roles?.includes('freelancer');
    const isClient = user.roles?.includes('client');
    const roleKey = isFreelancer && isClient ? 'both' : isFreelancer ? 'freelancer' : 'client';
    const matchesRole = filterRole === 'all' || roleKey === filterRole;

    return matchesSearch && matchesStatus && matchesRole;
  });

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + itemsPerPage);

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers(prev =>
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  const handleBulkAction = async (action: 'delete' | 'verify' | 'suspend' | 'activate' | 'seed_profile') => {
    if (action === 'delete') {
      if (!window.confirm(`Are you sure you want to delete ${selectedUsers.length} users? This cannot be undone.`)) return;
    }

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
      {/* Edit User Modal */}
      <EditUserModal
        userId={editingUserId}
        onClose={() => setEditingUserId(null)}
        onUserUpdated={handleUserUpdated}
      />
      {/* Header */}
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

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
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

          {/* Status Filter */}
          <div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>

          {/* Role Filter */}
          <div>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value as any)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Roles</option>
              <option value="client">Client</option>
              <option value="freelancer">Freelancer</option>
              <option value="both">Both</option>
            </select>
          </div>
        </div>

        {/* Quick Filter Chips */}
        <div className="flex flex-wrap gap-2 mt-4">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${filterStatus === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
          >
            All Users ({users.length})
          </button>
          <button
            onClick={() => setFilterStatus('active')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${filterStatus === 'active'
              ? 'bg-green-600 text-white'
              : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
          >
            Active ({users.filter(u => !u.is_suspended && u.is_email_verified).length})
          </button>
          <button
            onClick={() => setFilterStatus('suspended')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${filterStatus === 'suspended'
              ? 'bg-red-600 text-white'
              : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
          >
            Suspended ({users.filter(u => u.is_suspended).length})
          </button>
          <button
            onClick={() => setFilterStatus('pending')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${filterStatus === 'pending'
              ? 'bg-orange-600 text-white'
              : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
          >
            Pending Verification ({users.filter(u => !u.is_email_verified).length})
          </button>
        </div>
      </div>

      {/* Table */}
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
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Password</th>
                {/* <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Rating</th> */}
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Orders</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Status</th>
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
                const role = user.roles?.includes('freelancer') && user.roles?.includes('client') ? 'both' :
                  user.roles?.includes('freelancer') ? 'freelancer' : 'client';
                const status = user.is_suspended ? 'suspended' : user.is_email_verified ? 'active' : 'pending';
                const avatar = user.profile_image ? (user.profile_image.startsWith('http') ? user.profile_image : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${user.profile_image}`) : `https://ui-avatars.com/api/?name=${encodeURIComponent(user.full_name || 'U')}&background=random`;

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
                        />
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">{user.full_name}</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${role === 'freelancer'
                          ? 'bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400'
                          : role === 'client'
                            ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
                            : 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                          }`}
                      >
                        {role === 'both' ? 'Freelancer & Client' : role.charAt(0).toUpperCase() + role.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded select-all">
                        {user.show_password || '••••••'}
                      </span>
                    </td>
                    {/* <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <span className="text-yellow-500">★</span>
                        <span className="font-medium">{user.rating || '0.0'}</span>
                      </div>
                    </td> */}
                    <td className="px-6 py-4">
                      <span className="font-medium">{user.total_orders || 0}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${status === 'active'
                          ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                          : status === 'suspended'
                            ? 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400'
                            : 'bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400'
                          }`}
                      >
                        {status === 'pending' ? 'Pending' : status.charAt(0).toUpperCase() + status.slice(1)}
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
                       {user.kyc_details?.is_verified ? (
                         <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 text-blue-500 w-fit">
                            <ShieldAlert className="w-3.5 h-3.5" />
                            <span className="text-[10px] font-bold uppercase tracking-wider">KYC Verified</span>
                         </div>
                       ) : user.kyc_details?.pancard ? (
                         <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/10 text-orange-500 w-fit animate-pulse">
                            <Database className="w-3.5 h-3.5" />
                            <span className="text-[10px] font-bold uppercase tracking-wider">Review Required</span>
                         </div>
                       ) : (
                         <span className="text-[10px] text-gray-400 italic">No Docs</span>
                       )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => onSelectUser(user._id)}
                          className="p-2 hover:bg-blue-100 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                          title="View Profile"
                        >
                          <Eye className="w-4 h-4 text-blue-600" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleOpenKYC(user)}
                          className={`p-2 rounded-lg transition-colors ${user.kyc_details?.pancard ? 'bg-orange-500/10 hover:bg-orange-500/20 text-orange-600' : 'hover:bg-gray-100'}`}
                          title="Review KYC Documents"
                        >
                          <ShieldAlert className="w-4 h-4" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => setEditingUserId(user._id)}
                          className="p-2 hover:bg-indigo-100 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
                          title="Edit User"
                        >
                          <Pencil className="w-4 h-4 text-indigo-600" />
                        </motion.button>
                        {!user.kyc_details?.is_verified && (
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
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleSendEmail(user._id, user.full_name)}
                          className="p-2 hover:bg-orange-100 dark:hover:bg-orange-900/20 rounded-lg transition-colors"
                          title="Send Message"
                        >
                          <Mail className="w-4 h-4 text-orange-600" />
                        </motion.button>
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
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleRejectUser(user._id)}
                          className="p-2 hover:bg-orange-100 dark:hover:bg-orange-900/20 rounded-lg transition-colors text-orange-600"
                          title="Reject Profile"
                        >
                          <Ban className="w-4 h-4" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleRemindComplete(user._id)}
                          className="p-2 hover:bg-yellow-100 dark:hover:bg-yellow-900/20 rounded-lg transition-colors text-yellow-600"
                          title="Remind to Complete Profile"
                        >
                          <Loader2 className="w-4 h-4" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleDeleteUser(user._id, user.full_name)}
                          className="p-2 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          title="Delete User"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </motion.button>
                      </div>
                    </td>
                  </motion.tr>
                );
              }))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredUsers.length)} of {filteredUsers.length} users
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

      {/* Bulk Action Bar */}
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
                onClick={() => handleBulkAction('delete')}
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
      {/* KYC Review Modal */}
      <KYCReviewModal
        isOpen={kycModalOpen}
        onClose={() => setKycModalOpen(false)}
        user={selectedUserForKYC}
        onVerify={handleVerifyUser}
        onReject={handleRejectUser}
      />
    </div>
  );
}
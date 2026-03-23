import { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { Save, Upload, Shield, Loader2, Eye, EyeOff, Mail } from 'lucide-react';
import { toast } from 'sonner';
import api from '../lib/api';

export function AdminProfile() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone_number: '',
    profile_image: ''
  });

  /* passwordData state removed as we now use email reset link */

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await api.get('/auth/me');
      if (response.data.success) {
        const { full_name, email, phone_number, profile_image } = response.data.user;
        setFormData({
          full_name: full_name || '',
          email: email || '',
          phone_number: phone_number || '',
          profile_image: profile_image || ''
        });
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      toast.error('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const response = await api.put('/auth/update-profile', formData);
      if (response.data.success) {
        toast.success('Profile updated successfully!');
        const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
        localStorage.setItem('user', JSON.stringify({ ...storedUser, ...response.data.user }));
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const data = new FormData();
    data.append('profile', file);

    try {
      setSaving(true);
      const response = await api.put('/auth/update-profile', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (response.data.success) {
        setFormData(prev => ({ ...prev, profile_image: response.data.user.profile_image }));
        toast.success('Profile photo updated!');
        const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
        localStorage.setItem('user', JSON.stringify({ ...storedUser, profile_image: response.data.user.profile_image }));
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to upload photo');
    } finally {
      setSaving(false);
    }
  };

  const handleSendResetLink = async () => {
    try {
      setSaving(true);
      const response = await api.post('/auth/forgot-password', { email: formData.email });
      if (response.data.success) {
        toast.success('Security link sent to your email!');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to send reset link');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-[#F24C20] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Admin Profile Settings</h1>
        <p className="text-gray-600 dark:text-gray-400">Manage your admin account settings</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200 dark:border-gray-700"
      >
        <div className="flex items-start gap-8 mb-8">
          <div className="relative group">
            <img
              src={formData.profile_image ? (formData.profile_image.startsWith('http') ? formData.profile_image : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${formData.profile_image}`) : "https://i.pravatar.cc/150?img=50"}
              alt="Admin"
              className="w-24 h-24 rounded-2xl object-cover border-2 border-gray-100 dark:border-gray-700"
            />
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 bg-[#F24C20] hover:bg-[#d43a12] text-white p-2 rounded-lg shadow-lg"
            >
              <Upload className="w-4 h-4" />
            </motion.button>
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handlePhotoChange} />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold mb-2">{formData.full_name || 'Admin User'}</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">{formData.email}</p>
            <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg px-4 py-2 w-fit">
              <Shield className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-900 dark:text-blue-100">Super Admin</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleUpdateProfile} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">Full Name</label>
              <input
                type="text"
                value={formData.full_name}
                onChange={e => setFormData({ ...formData, full_name: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-[#F24C20] transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Email Address</label>
              <input
                type="email"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-[#F24C20] transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Phone Number</label>
              <input
                type="tel"
                value={formData.phone_number}
                onChange={e => setFormData({ ...formData, phone_number: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-[#F24C20] transition-all"
              />
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={saving}
            className="bg-[#044071] hover:bg-[#033056] text-white px-8 py-3 rounded-xl font-medium flex items-center gap-2 disabled:opacity-60 transition-all"
          >
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            Save Profile
          </motion.button>
        </form>

        <div className="border-t border-gray-200 dark:border-gray-700 my-10 pt-10">
          <h3 className="text-xl font-bold mb-6">Security Settings</h3>
          <div className="bg-gray-50 dark:bg-gray-900/50 p-6 rounded-2xl border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-xl bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center">
                <Shield className="w-6 h-6 text-[#F24C20]" />
              </div>
              <div>
                <h4 className="font-bold">Change Password</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">For your security, password changes must be verified via email.</p>
              </div>
            </div>
            
            <p className="text-sm mb-6 text-gray-500">
              Clicking the button below will send a secure password reset link to <strong>{formData.email}</strong>. 
              You will need to click that link to set a new password.
            </p>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSendResetLink}
              disabled={saving}
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-[#F24C20] text-gray-900 dark:text-white px-8 py-3 rounded-xl font-medium flex items-center gap-2 disabled:opacity-60 transition-all shadow-sm"
            >
              {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Mail className="w-5 h-5 text-[#F24C20]" />}
              Send Reset Link to Email
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

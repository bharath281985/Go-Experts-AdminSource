import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
    X, User, Mail, Phone, MapPin, FileText,
    Shield, Coins, AlertTriangle, Loader2, CheckCircle, Save
} from 'lucide-react';
import { toast } from 'sonner';
import api from '../lib/api';

interface EditUserModalProps {
    userId: string | null;
    onClose: () => void;
    onUserUpdated: (updatedUser: any) => void;
}

type RoleOption = 'client' | 'freelancer' | 'both';

export function EditUserModal({ userId, onClose, onUserUpdated }: EditUserModalProps) {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [user, setUser] = useState<any>(null);

    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [location, setLocation] = useState('');
    const [bio, setBio] = useState('');
    const [roleOption, setRoleOption] = useState<RoleOption>('freelancer');
    const [totalPoints, setTotalPoints] = useState(0);
    const [isVerified, setIsVerified] = useState(false);
    const [isSuspended, setIsSuspended] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (!userId) return;
        fetchUser(userId);
    }, [userId]);

    const fetchUser = async (id: string) => {
        try {
            setLoading(true);
            const response = await api.get(`/admin/users/${id}`);
            if (response.data.success) {
                const u = response.data.user;
                setUser(u);
                setFullName(u.full_name || '');
                setEmail(u.email || '');
                setPhone(u.phone_number || '');
                setLocation(u.location || '');
                setBio(u.bio || '');
                setTotalPoints(u.total_points ?? 0);
                setIsVerified(u.is_email_verified ?? false);
                setIsSuspended(u.is_suspended ?? false);
                const isFreelancer = u.roles?.includes('freelancer');
                const isClient = u.roles?.includes('client');
                setRoleOption(isFreelancer && isClient ? 'both' : isFreelancer ? 'freelancer' : 'client');
            }
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to load user');
            onClose();
        } finally {
            setLoading(false);
        }
    };

    const validate = () => {
        const newErrors: Record<string, string> = {};
        if (!fullName.trim()) newErrors.fullName = 'Full name is required';
        if (!email.trim()) newErrors.email = 'Email is required';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = 'Invalid email format';
        if (totalPoints < 0) newErrors.totalPoints = 'Points cannot be negative';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const getRolesArray = (option: RoleOption): string[] => {
        if (option === 'both') return ['client', 'freelancer'];
        return [option];
    };

    const handleSave = async () => {
        if (!validate()) {
            toast.error('Please fix the errors before saving');
            return;
        }
        try {
            setSaving(true);
            const payload = {
                full_name: fullName.trim(),
                email: email.trim().toLowerCase(),
                phone_number: phone,
                location,
                bio,
                roles: getRolesArray(roleOption),
                total_points: Number(totalPoints),
                is_email_verified: isVerified,
                is_suspended: isSuspended,
            };
            const response = await api.put(`/admin/users/${userId}`, payload);
            if (response.data.success) {
                toast.success('User updated successfully!');
                onUserUpdated(response.data.user);
                onClose();
            }
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to update user');
        } finally {
            setSaving(false);
        }
    };

    const originalRoles = user ? [...(user.roles || [])].sort().join(',') : '';
    const currentRoles = getRolesArray(roleOption).sort().join(',');
    const roleChanged = !!user && originalRoles !== currentRoles;

    if (!userId) return null;

    return (
        <AnimatePresence>
            {userId && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        key="backdrop"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9998, backdropFilter: 'blur(2px)' }}
                    />

                    {/* Slide-in panel */}
                    <motion.div
                        key="panel"
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 30, stiffness: 320 }}
                        style={{
                            position: 'fixed',
                            top: 0,
                            right: 0,
                            height: '100vh',
                            width: '480px',
                            maxWidth: '95vw',
                            background: 'white',
                            boxShadow: '-8px 0 32px rgba(0,0,0,0.18)',
                            zIndex: 9999,
                            display: 'flex',
                            flexDirection: 'column',
                        }}
                        className="dark:bg-gray-900"
                    >
                        {/* Header */}
                        <div style={{ padding: '20px 24px', borderBottom: '1px solid #e5e7eb', flexShrink: 0 }} className="dark:border-gray-700">
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <div>
                                    <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }} className="text-gray-900 dark:text-white">Edit User</h2>
                                    <p style={{ fontSize: '13px', color: '#6b7280', margin: '2px 0 0' }}>Update user details, role & access</p>
                                </div>
                                <button
                                    onClick={onClose}
                                    style={{ padding: '8px', borderRadius: '8px', border: 'none', cursor: 'pointer', background: 'transparent' }}
                                    className="hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                >
                                    <X size={18} className="text-gray-500" />
                                </button>
                            </div>
                        </div>

                        {/* Body — scrollable */}
                        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
                            {loading ? (
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '200px', gap: '12px' }}>
                                    <Loader2 size={28} className="text-[#F24C20] animate-spin" />
                                    <p className="text-gray-500" style={{ fontSize: '14px' }}>Loading user data...</p>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

                                    {/* ── Basic Information ── */}
                                    <section>
                                        <p style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#9ca3af', marginBottom: '12px' }}>
                                            Basic Information
                                        </p>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                            {/* Full Name */}
                                            <div>
                                                <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '6px' }} className="text-gray-700 dark:text-gray-300">
                                                    Full Name <span style={{ color: '#ef4444' }}>*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    value={fullName}
                                                    onChange={(e) => { setFullName(e.target.value); setErrors(p => ({ ...p, fullName: '' })); }}
                                                    placeholder="John Doe"
                                                    style={{
                                                        width: '100%',
                                                        padding: '10px 14px',
                                                        borderRadius: '10px',
                                                        border: errors.fullName ? '1.5px solid #ef4444' : '1.5px solid #e5e7eb',
                                                        fontSize: '14px',
                                                        outline: 'none',
                                                        background: 'transparent',
                                                        boxSizing: 'border-box',
                                                    }}
                                                    className="dark:border-gray-700 focus:border-[#F24C20] dark:text-white"
                                                />
                                                {errors.fullName && <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>{errors.fullName}</p>}
                                            </div>

                                            {/* Email */}
                                            <div>
                                                <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '6px' }} className="text-gray-700 dark:text-gray-300">
                                                    Email Address <span style={{ color: '#ef4444' }}>*</span>
                                                </label>
                                                <input
                                                    type="email"
                                                    value={email}
                                                    onChange={(e) => { setEmail(e.target.value); setErrors(p => ({ ...p, email: '' })); }}
                                                    placeholder="user@example.com"
                                                    style={{
                                                        width: '100%',
                                                        padding: '10px 14px',
                                                        borderRadius: '10px',
                                                        border: errors.email ? '1.5px solid #ef4444' : '1.5px solid #e5e7eb',
                                                        fontSize: '14px',
                                                        outline: 'none',
                                                        background: 'transparent',
                                                        boxSizing: 'border-box',
                                                    }}
                                                    className="dark:border-gray-700 focus:border-[#F24C20] dark:text-white"
                                                />
                                                {errors.email && <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>{errors.email}</p>}
                                            </div>

                                            {/* Phone */}
                                            <div>
                                                <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '6px' }} className="text-gray-700 dark:text-gray-300">
                                                    Phone Number
                                                </label>
                                                <input
                                                    type="text"
                                                    value={phone}
                                                    onChange={(e) => setPhone(e.target.value)}
                                                    placeholder="+91 98765 43210"
                                                    style={{
                                                        width: '100%',
                                                        padding: '10px 14px',
                                                        borderRadius: '10px',
                                                        border: '1.5px solid #e5e7eb',
                                                        fontSize: '14px',
                                                        outline: 'none',
                                                        background: 'transparent',
                                                        boxSizing: 'border-box',
                                                    }}
                                                    className="dark:border-gray-700 focus:border-[#F24C20] dark:text-white"
                                                />
                                            </div>

                                            {/* Location */}
                                            <div>
                                                <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '6px' }} className="text-gray-700 dark:text-gray-300">
                                                    Location
                                                </label>
                                                <input
                                                    type="text"
                                                    value={location}
                                                    onChange={(e) => setLocation(e.target.value)}
                                                    placeholder="Mumbai, India"
                                                    style={{
                                                        width: '100%',
                                                        padding: '10px 14px',
                                                        borderRadius: '10px',
                                                        border: '1.5px solid #e5e7eb',
                                                        fontSize: '14px',
                                                        outline: 'none',
                                                        background: 'transparent',
                                                        boxSizing: 'border-box',
                                                    }}
                                                    className="dark:border-gray-700 focus:border-[#F24C20] dark:text-white"
                                                />
                                            </div>

                                            {/* Bio */}
                                            <div>
                                                <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '6px' }} className="text-gray-700 dark:text-gray-300">
                                                    Bio
                                                </label>
                                                <textarea
                                                    value={bio}
                                                    onChange={(e) => setBio(e.target.value)}
                                                    rows={3}
                                                    placeholder="Short bio..."
                                                    style={{
                                                        width: '100%',
                                                        padding: '10px 14px',
                                                        borderRadius: '10px',
                                                        border: '1.5px solid #e5e7eb',
                                                        fontSize: '14px',
                                                        outline: 'none',
                                                        background: 'transparent',
                                                        resize: 'none',
                                                        boxSizing: 'border-box',
                                                    }}
                                                    className="dark:border-gray-700 focus:border-[#F24C20] dark:text-white"
                                                />
                                            </div>
                                        </div>
                                    </section>

                                    {/* ── Role Assignment ── */}
                                    <section>
                                        <p style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#9ca3af', marginBottom: '12px' }}>
                                            Role Assignment
                                        </p>
                                        <div style={{ display: 'flex', gap: '10px' }}>
                                            {(['client', 'freelancer', 'both'] as RoleOption[]).map((r) => (
                                                <button
                                                    key={r}
                                                    onClick={() => setRoleOption(r)}
                                                    style={{
                                                        flex: 1,
                                                        padding: '10px 8px',
                                                        borderRadius: '10px',
                                                        border: roleOption === r ? '2px solid #F24C20' : '2px solid #e5e7eb',
                                                        background: roleOption === r ? 'rgba(242,76,32,0.08)' : 'transparent',
                                                        color: roleOption === r ? '#F24C20' : '#6b7280',
                                                        fontWeight: 600,
                                                        fontSize: '13px',
                                                        cursor: 'pointer',
                                                        transition: 'all 0.15s',
                                                    }}
                                                >
                                                    {r === 'both' ? 'Both' : r.charAt(0).toUpperCase() + r.slice(1)}
                                                </button>
                                            ))}
                                        </div>
                                        {roleChanged && (
                                            <div style={{
                                                display: 'flex',
                                                alignItems: 'flex-start',
                                                gap: '8px',
                                                marginTop: '10px',
                                                padding: '10px 12px',
                                                background: '#fffbeb',
                                                border: '1px solid #fde68a',
                                                borderRadius: '10px',
                                            }}>
                                                <AlertTriangle size={14} style={{ color: '#d97706', marginTop: '1px', flexShrink: 0 }} />
                                                <p style={{ fontSize: '12px', color: '#92400e', margin: 0 }}>
                                                    Changing the role affects what this user can post or bid on. Make sure this is intentional.
                                                </p>
                                            </div>
                                        )}
                                    </section>

                                    {/* ── Points & Access ── */}
                                    <section>
                                        <p style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#9ca3af', marginBottom: '12px' }}>
                                            Points & Access
                                        </p>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                            {/* Points */}
                                            <div>
                                                <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '6px' }} className="text-gray-700 dark:text-gray-300">
                                                    Total Points
                                                </label>
                                                <input
                                                    type="number"
                                                    value={totalPoints}
                                                    onChange={(e) => { setTotalPoints(Number(e.target.value)); setErrors(p => ({ ...p, totalPoints: '' })); }}
                                                    min={0}
                                                    style={{
                                                        width: '100%',
                                                        padding: '10px 14px',
                                                        borderRadius: '10px',
                                                        border: errors.totalPoints ? '1.5px solid #ef4444' : '1.5px solid #e5e7eb',
                                                        fontSize: '14px',
                                                        outline: 'none',
                                                        background: 'transparent',
                                                        boxSizing: 'border-box',
                                                    }}
                                                    className="dark:border-gray-700 focus:border-[#F24C20] dark:text-white"
                                                />
                                                {errors.totalPoints && <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>{errors.totalPoints}</p>}
                                            </div>

                                            {/* Toggles */}
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                                {/* Verified */}
                                                <div style={{
                                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                                    padding: '12px 14px', borderRadius: '10px',
                                                    border: '1.5px solid #e5e7eb',
                                                }} className="dark:border-gray-700">
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        <CheckCircle size={15} style={{ color: '#22c55e' }} />
                                                        <span style={{ fontSize: '13px', fontWeight: 500 }} className="text-gray-700 dark:text-gray-300">Verified</span>
                                                    </div>
                                                    <button
                                                        onClick={() => setIsVerified(!isVerified)}
                                                        style={{
                                                            position: 'relative', width: '38px', height: '22px',
                                                            borderRadius: '99px', border: 'none', cursor: 'pointer',
                                                            background: isVerified ? '#22c55e' : '#d1d5db',
                                                            transition: 'background 0.2s',
                                                            padding: 0,
                                                        }}
                                                    >
                                                        <span style={{
                                                            position: 'absolute', top: '3px',
                                                            left: isVerified ? '18px' : '3px',
                                                            width: '16px', height: '16px',
                                                            borderRadius: '50%', background: 'white',
                                                            boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                                                            transition: 'left 0.2s',
                                                        }} />
                                                    </button>
                                                </div>

                                                {/* Suspended */}
                                                <div style={{
                                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                                    padding: '12px 14px', borderRadius: '10px',
                                                    border: '1.5px solid #e5e7eb',
                                                }} className="dark:border-gray-700">
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        <Shield size={15} style={{ color: '#ef4444' }} />
                                                        <span style={{ fontSize: '13px', fontWeight: 500 }} className="text-gray-700 dark:text-gray-300">Suspended</span>
                                                    </div>
                                                    <button
                                                        onClick={() => setIsSuspended(!isSuspended)}
                                                        style={{
                                                            position: 'relative', width: '38px', height: '22px',
                                                            borderRadius: '99px', border: 'none', cursor: 'pointer',
                                                            background: isSuspended ? '#ef4444' : '#d1d5db',
                                                            transition: 'background 0.2s',
                                                            padding: 0,
                                                        }}
                                                    >
                                                        <span style={{
                                                            position: 'absolute', top: '3px',
                                                            left: isSuspended ? '18px' : '3px',
                                                            width: '16px', height: '16px',
                                                            borderRadius: '50%', background: 'white',
                                                            boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                                                            transition: 'left 0.2s',
                                                        }} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </section>

                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        {!loading && (
                            <div style={{
                                padding: '16px 24px',
                                borderTop: '1px solid #e5e7eb',
                                display: 'flex',
                                gap: '10px',
                                flexShrink: 0,
                                background: 'inherit',
                            }} className="dark:border-gray-700">
                                <button
                                    onClick={onClose}
                                    style={{
                                        flex: 1, padding: '11px', borderRadius: '10px',
                                        border: '1.5px solid #e5e7eb', background: 'transparent',
                                        fontSize: '14px', fontWeight: 500, cursor: 'pointer',
                                    }}
                                    className="dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                >
                                    Cancel
                                </button>
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.97 }}
                                    onClick={handleSave}
                                    disabled={saving}
                                    style={{
                                        flex: 1, padding: '11px', borderRadius: '10px',
                                        border: 'none', background: '#F24C20',
                                        color: 'white', fontSize: '14px', fontWeight: 600,
                                        cursor: saving ? 'not-allowed' : 'pointer',
                                        opacity: saving ? 0.7 : 1,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                                    }}
                                >
                                    {saving
                                        ? <><Loader2 size={15} className="animate-spin" /> Saving...</>
                                        : <><Save size={15} /> Save Changes</>}
                                </motion.button>
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

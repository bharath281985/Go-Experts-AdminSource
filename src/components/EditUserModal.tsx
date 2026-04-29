import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
    X, User, Mail, Phone, MapPin, FileText,
    Shield, Coins, AlertTriangle, Loader2, CheckCircle, Save, Key
} from 'lucide-react';
import { toast } from 'sonner';
import api from '../lib/api';

interface EditUserModalProps {
    userId: string | null;
    onClose: () => void;
    onUserUpdated: (updatedUser: any) => void;
}

type RoleOption = 'client' | 'freelancer' | 'investor' | 'startup_creator' | 'both';

export function EditUserModal({ userId, onClose, onUserUpdated }: EditUserModalProps) {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [user, setUser] = useState<any>(null);

    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [location, setLocation] = useState('');
    const [bio, setBio] = useState('');
    const [slug, setSlug] = useState('');
    const [metaTitle, setMetaTitle] = useState('');
    const [metaKeywords, setMetaKeywords] = useState('');
    const [metaDescription, setMetaDescription] = useState('');
    const [roleOption, setRoleOption] = useState<RoleOption>('freelancer');
    const [whatsappCountryCode, setWhatsappCountryCode] = useState('+91');
    const [whatsappNumber, setWhatsappNumber] = useState('');
    const [businessCountryCode, setBusinessCountryCode] = useState('+91');
    const [businessNumber, setBusinessNumber] = useState('');
    const [isVerified, setIsVerified] = useState(false);
    const [isSuspended, setIsSuspended] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const [plans, setPlans] = useState<any[]>([]);
    const [selectedPlanId, setSelectedPlanId] = useState('');

    useEffect(() => {
        if (!userId) return;
        fetchUser(userId);
        fetchPlans();
    }, [userId]);

    const fetchPlans = async () => {
        try {
            const res = await api.get('/subscription-plans/admin');
            if (res.data.success) {
                setPlans(res.data.data);
            }
        } catch (err) {
            console.error('Error fetching plans:', err);
        }
    };

    const fetchUser = async (id: string) => {
        try {
            setLoading(true);
            const response = await api.get(`/admin/users/${id}`);
            if (response.data.success) {
                const u = response.data.user;
                setUser(u);
                setFullName(u.full_name || '');
                setEmail(u.email || '');
                setWhatsappCountryCode(u.whatsapp_country_code || '+91');
                setWhatsappNumber(u.whatsapp_number || '');
                setBusinessCountryCode(u.business_or_alternative_country_code || '+91');
                setBusinessNumber(u.business_or_alternative_number || '');
                setLocation(u.location || '');
                setBio(u.bio || '');
                setSlug(u.slug || u.username || '');
                setMetaTitle(u.meta_title || '');
                setMetaKeywords(u.meta_keywords || '');
                setMetaDescription(u.meta_description || '');
                setIsVerified(u.is_email_verified ?? false);
                setIsSuspended(u.is_suspended ?? false);
                setSelectedPlanId(u.subscription_details?.plan_id || u.active_subscription?._id || u.subscription_plan || '');
                const isFreelancer = u.roles?.includes('freelancer');
                const isClient = u.roles?.includes('client');
                const isInvestor = u.roles?.includes('investor');
                const isStartupCreator = u.roles?.includes('startup_creator');
                setRoleOption(isFreelancer && isClient ? 'both' : isFreelancer ? 'freelancer' : isInvestor ? 'investor' : isStartupCreator ? 'startup_creator' : 'client');
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
                whatsapp_country_code: whatsappCountryCode,
                whatsapp_number: whatsappNumber,
                business_or_alternative_country_code: businessCountryCode,
                business_or_alternative_number: businessNumber,
                location,
                bio,
                roles: getRolesArray(roleOption),
                is_email_verified: isVerified,
                is_suspended: isSuspended,
                slug,
                meta_title: metaTitle,
                meta_keywords: metaKeywords,
                meta_description: metaDescription,
                subscription_plan_id: selectedPlanId
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

    const handleResetPassword = async () => {
        if (!userId || !window.confirm('Send a password reset email to this user?')) return;
        try {
            const response = await api.post(`/admin/users/${userId}/reset-password`);
            if (response.data.success) {
                toast.success('Password reset email sent successfully');
            }
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to send reset email');
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
                            width: '520px',
                            maxWidth: '95vw',
                            background: '#09090b', // Deep black/zinc
                            boxShadow: '-10px 0 50px rgba(0,0,0,0.5)',
                            zIndex: 9999,
                            display: 'flex',
                            flexDirection: 'column',
                            color: '#f4f4f5',
                        }}
                        className="edit-user-panel"
                    >
                        {/* Header */}
                        <div style={{ padding: '24px', borderBottom: '1px solid #27272a', flexShrink: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <div>
                                    <h2 style={{ fontSize: '20px', fontWeight: 700, margin: 0, color: '#ffffff' }}>Edit User Profile</h2>
                                    <p style={{ fontSize: '13px', color: '#a1a1aa', margin: '4px 0 0' }}>Update profile, contact, role, SEO, and account access</p>
                                </div>
                                <button
                                    onClick={onClose}
                                    style={{ 
                                        padding: '10px', 
                                        borderRadius: '12px', 
                                        border: '1px solid #27272a', 
                                        cursor: 'pointer', 
                                        background: '#18181b',
                                        color: '#a1a1aa',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        transition: 'all 0.2s'
                                    }}
                                    onMouseOver={(e) => { e.currentTarget.style.background = '#27272a'; e.currentTarget.style.color = '#ffffff'; }}
                                    onMouseOut={(e) => { e.currentTarget.style.background = '#18181b'; e.currentTarget.style.color = '#a1a1aa'; }}
                                >
                                    <X size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Body — scrollable */}
                        <div style={{ flex: 1, overflowY: 'auto', padding: '24px', scrollbarWidth: 'thin' }}>
                            {loading ? (
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '16px' }}>
                                    <Loader2 size={32} className="text-[#F24C20] animate-spin" />
                                    <p style={{ color: '#a1a1aa', fontSize: '14px' }}>Fetching user data...</p>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>

                                    {/* ── Basic Information ── */}
                                    <section>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                                            <div style={{ width: '3px', height: '16px', background: '#F24C20', borderRadius: '4px' }} />
                                            <p style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#71717a' }}>
                                                Profile Details
                                            </p>
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                            {/* Full Name */}
                                            <div>
                                                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px', color: '#d4d4d8' }}>
                                                    User Name <span style={{ color: '#ef4444' }}>*</span>
                                                </label>
                                                <div style={{ position: 'relative' }}>
                                                    <User size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#52525b' }} />
                                                    <input
                                                        type="text"
                                                        value={fullName}
                                                        onChange={(e) => { setFullName(e.target.value); setErrors(p => ({ ...p, fullName: '' })); }}
                                                        placeholder="John Doe"
                                                        style={{
                                                            width: '100%',
                                                            padding: '12px 14px 12px 40px',
                                                            borderRadius: '12px',
                                                            border: errors.fullName ? '1.5px solid #ef4444' : '1.5px solid #27272a',
                                                            fontSize: '14px',
                                                            outline: 'none',
                                                            background: '#18181b',
                                                            color: '#ffffff',
                                                            boxSizing: 'border-box',
                                                            transition: 'border-color 0.2s'
                                                        }}
                                                        onFocus={(e) => e.target.style.borderColor = '#F24C20'}
                                                        onBlur={(e) => e.target.style.borderColor = errors.fullName ? '#ef4444' : '#27272a'}
                                                    />
                                                </div>
                                                {errors.fullName && <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '6px' }}>{errors.fullName}</p>}
                                            </div>

                                            {/* Email */}
                                            <div>
                                                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px', color: '#d4d4d8' }}>
                                                    Login Email <span style={{ color: '#ef4444' }}>*</span>
                                                </label>
                                                <div style={{ position: 'relative' }}>
                                                    <Mail size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#52525b' }} />
                                                    <input
                                                        type="email"
                                                        value={email}
                                                        onChange={(e) => { setEmail(e.target.value); setErrors(p => ({ ...p, email: '' })); }}
                                                        placeholder="user@example.com"
                                                        style={{
                                                            width: '100%',
                                                            padding: '12px 14px 12px 40px',
                                                            borderRadius: '12px',
                                                            border: errors.email ? '1.5px solid #ef4444' : '1.5px solid #27272a',
                                                            fontSize: '14px',
                                                            outline: 'none',
                                                            background: '#18181b',
                                                            color: '#ffffff',
                                                            boxSizing: 'border-box',
                                                            transition: 'border-color 0.2s'
                                                        }}
                                                        onFocus={(e) => e.target.style.borderColor = '#F24C20'}
                                                        onBlur={(e) => e.target.style.borderColor = errors.email ? '#ef4444' : '#27272a'}
                                                    />
                                                </div>
                                                {errors.email && <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '6px' }}>{errors.email}</p>}
                                                <button
                                                    type="button"
                                                    onClick={handleResetPassword}
                                                    style={{
                                                        marginTop: '10px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '6px',
                                                        fontSize: '12px',
                                                        color: '#F24C20',
                                                        background: 'transparent',
                                                        border: 'none',
                                                        cursor: 'pointer',
                                                        padding: '4px 8px',
                                                        borderRadius: '6px',
                                                        fontWeight: 600,
                                                        transition: 'background 0.2s'
                                                    }}
                                                    onMouseOver={(e) => e.currentTarget.style.background = 'rgba(242, 76, 32, 0.1)'}
                                                    onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                                                >
                                                    <Key size={14} /> Send Reset Password Link
                                                </button>
                                            </div>


                                             {/* WhatsApp Number */}
                                             <div style={{ display: 'flex', gap: '12px' }}>
                                                 <div style={{ width: '90px' }}>
                                                     <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px', color: '#d4d4d8' }}>Code</label>
                                                     <input
                                                         type="text"
                                                         value={whatsappCountryCode}
                                                         onChange={(e) => setWhatsappCountryCode(e.target.value)}
                                                         placeholder="+91"
                                                         style={{
                                                             width: '100%',
                                                             padding: '12px 14px',
                                                             borderRadius: '12px',
                                                             border: '1.5px solid #27272a',
                                                             fontSize: '14px',
                                                             outline: 'none',
                                                             background: '#18181b',
                                                             color: '#ffffff',
                                                             boxSizing: 'border-box'
                                                         }}
                                                         onFocus={(e) => e.target.style.borderColor = '#F24C20'}
                                                         onBlur={(e) => e.target.style.borderColor = '#27272a'}
                                                     />
                                                 </div>
                                                 <div style={{ flex: 1 }}>
                                                     <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px', color: '#d4d4d8' }}>WhatsApp Mobile</label>
                                                     <div style={{ position: 'relative' }}>
                                                         <Phone size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#52525b' }} />
                                                         <input
                                                             type="text"
                                                             value={whatsappNumber}
                                                             onChange={(e) => setWhatsappNumber(e.target.value)}
                                                             placeholder="9876543210"
                                                             style={{
                                                                 width: '100%',
                                                                 padding: '12px 14px 12px 40px',
                                                                 borderRadius: '12px',
                                                                 border: '1.5px solid #27272a',
                                                                 fontSize: '14px',
                                                                 outline: 'none',
                                                                 background: '#18181b',
                                                                 color: '#ffffff',
                                                                 boxSizing: 'border-box'
                                                             }}
                                                             onFocus={(e) => e.target.style.borderColor = '#F24C20'}
                                                             onBlur={(e) => e.target.style.borderColor = '#27272a'}
                                                         />
                                                     </div>
                                                 </div>
                                             </div>

                                             {/* Business / Alternative Number */}
                                             <div style={{ display: 'flex', gap: '12px' }}>
                                                 <div style={{ width: '90px' }}>
                                                     <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px', color: '#d4d4d8' }}>Code</label>
                                                     <input
                                                         type="text"
                                                         value={businessCountryCode}
                                                         onChange={(e) => setBusinessCountryCode(e.target.value)}
                                                         placeholder="+91"
                                                         style={{
                                                             width: '100%',
                                                             padding: '12px 14px',
                                                             borderRadius: '12px',
                                                             border: '1.5px solid #27272a',
                                                             fontSize: '14px',
                                                             outline: 'none',
                                                             background: '#18181b',
                                                             color: '#ffffff',
                                                             boxSizing: 'border-box'
                                                         }}
                                                         onFocus={(e) => e.target.style.borderColor = '#F24C20'}
                                                         onBlur={(e) => e.target.style.borderColor = '#27272a'}
                                                     />
                                                 </div>
                                                 <div style={{ flex: 1 }}>
                                                     <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px', color: '#d4d4d8' }}>Alternate Mobile</label>
                                                     <div style={{ position: 'relative' }}>
                                                         <Phone size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#52525b' }} />
                                                         <input
                                                             type="text"
                                                             value={businessNumber}
                                                             onChange={(e) => setBusinessNumber(e.target.value)}
                                                             placeholder="9876543210"
                                                             style={{
                                                                 width: '100%',
                                                                 padding: '12px 14px 12px 40px',
                                                                 borderRadius: '12px',
                                                                 border: '1.5px solid #27272a',
                                                                 fontSize: '14px',
                                                                 outline: 'none',
                                                                 background: '#18181b',
                                                                 color: '#ffffff',
                                                                 boxSizing: 'border-box'
                                                             }}
                                                             onFocus={(e) => e.target.style.borderColor = '#F24C20'}
                                                             onBlur={(e) => e.target.style.borderColor = '#27272a'}
                                                         />
                                                     </div>
                                                 </div>
                                             </div>

                                            {/* Location */}
                                            <div>
                                                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px', color: '#d4d4d8' }}>Location</label>
                                                <div style={{ position: 'relative' }}>
                                                    <MapPin size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#52525b' }} />
                                                    <input
                                                        type="text"
                                                        value={location}
                                                        onChange={(e) => setLocation(e.target.value)}
                                                        placeholder="Mumbai, India"
                                                        style={{
                                                            width: '100%',
                                                            padding: '12px 14px 12px 40px',
                                                            borderRadius: '12px',
                                                            border: '1.5px solid #27272a',
                                                            fontSize: '14px',
                                                            outline: 'none',
                                                            background: '#18181b',
                                                            color: '#ffffff',
                                                            boxSizing: 'border-box'
                                                        }}
                                                        onFocus={(e) => e.target.style.borderColor = '#F24C20'}
                                                        onBlur={(e) => e.target.style.borderColor = '#27272a'}
                                                    />
                                                </div>
                                            </div>

                                            {/* Bio */}
                                            <div>
                                                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px', color: '#d4d4d8' }}>Short Profile Note</label>
                                                <div style={{ position: 'relative' }}>
                                                    <FileText size={16} style={{ position: 'absolute', left: '14px', top: '14px', color: '#52525b' }} />
                                                    <textarea
                                                        value={bio}
                                                        onChange={(e) => setBio(e.target.value)}
                                                        rows={3}
                                                        placeholder="Short bio..."
                                                        style={{
                                                            width: '100%',
                                                            padding: '12px 14px 12px 40px',
                                                            borderRadius: '12px',
                                                            border: '1.5px solid #27272a',
                                                            fontSize: '14px',
                                                            outline: 'none',
                                                            background: '#18181b',
                                                            color: '#ffffff',
                                                            resize: 'none',
                                                            boxSizing: 'border-box'
                                                        }}
                                                        onFocus={(e) => e.target.style.borderColor = '#F24C20'}
                                                        onBlur={(e) => e.target.style.borderColor = '#27272a'}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </section>

                                    {/* ── Role Assignment ── */}
                                    <section>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                                            <div style={{ width: '3px', height: '16px', background: '#F24C20', borderRadius: '4px' }} />
                                            <p style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#71717a' }}>
                                                User Role
                                            </p>
                                        </div>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '10px' }}>
                                            {(['client', 'freelancer', 'investor', 'startup_creator', 'both'] as RoleOption[]).map((r) => (
                                                <button
                                                    key={r}
                                                    onClick={() => setRoleOption(r)}
                                                    style={{
                                                        padding: '12px 8px',
                                                        borderRadius: '12px',
                                                        border: roleOption === r ? '2px solid #F24C20' : '1.5px solid #27272a',
                                                        background: roleOption === r ? 'rgba(242,76,32,0.1)' : '#18181b',
                                                        color: roleOption === r ? '#ffffff' : '#a1a1aa',
                                                        fontWeight: 600,
                                                        fontSize: '12px',
                                                        cursor: 'pointer',
                                                        transition: 'all 0.2s',
                                                    }}
                                                    onMouseOver={(e) => { if (roleOption !== r) e.currentTarget.style.borderColor = '#3f3f46'; }}
                                                    onMouseOut={(e) => { if (roleOption !== r) e.currentTarget.style.borderColor = '#27272a'; }}
                                                >
                                                    {r === 'startup_creator' ? 'Startup' : r === 'both' ? 'Both' : r.charAt(0).toUpperCase() + r.slice(1)}
                                                </button>
                                            ))}
                                        </div>
                                        {roleChanged && (
                                            <div style={{
                                                display: 'flex',
                                                alignItems: 'flex-start',
                                                gap: '10px',
                                                marginTop: '14px',
                                                padding: '12px',
                                                background: 'rgba(217, 119, 6, 0.1)',
                                                border: '1px solid rgba(217, 119, 6, 0.3)',
                                                borderRadius: '12px',
                                            }}>
                                                <AlertTriangle size={16} style={{ color: '#fbbf24', marginTop: '1px', flexShrink: 0 }} />
                                                <p style={{ fontSize: '12px', color: '#fcd34d', margin: 0, lineHeight: 1.5 }}>
                                                    Changing the role affects what this user can access. Confirm before saving.
                                                </p>
                                            </div>
                                        )}
                                    </section>

                                    <section>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                                            <div style={{ width: '3px', height: '16px', background: '#F24C20', borderRadius: '4px' }} />
                                            <p style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#71717a' }}>
                                                Public Link & SEO
                                            </p>
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px', color: '#d4d4d8' }}>Profile URL Slug (Admin Only)</label>
                                                <div style={{ display: 'flex', alignItems: 'stretch', width: '100%', borderRadius: '12px', border: '1.5px solid #27272a', overflow: 'hidden', background: '#18181b', boxSizing: 'border-box' }}>
                                                    <div style={{ padding: '12px 10px', background: '#27272a', color: '#a1a1aa', fontSize: '13px', borderRight: '1px solid #3f3f46', display: 'flex', alignItems: 'center' }}>
                                                        go-experts.com/{roleOption === 'startup_creator' ? 'startup' : roleOption}/
                                                    </div>
                                                    <input type="text" value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="username" style={{ flex: 1, padding: '12px 14px', border: 'none', fontSize: '14px', outline: 'none', background: 'transparent', color: '#ffffff', minWidth: 0 }} />
                                                </div>
                                                <p style={{ color: '#71717a', fontSize: '12px', marginTop: '6px' }}>Format: domain / role / slug</p>
                                            </div>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px', color: '#d4d4d8' }}>Meta Title</label>
                                                <input type="text" value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)} placeholder="Hire user name on Go Experts" style={{ width: '100%', padding: '12px 14px', borderRadius: '12px', border: '1.5px solid #27272a', fontSize: '14px', outline: 'none', background: '#18181b', color: '#ffffff', boxSizing: 'border-box' }} onFocus={(e) => e.target.style.borderColor = '#F24C20'} onBlur={(e) => e.target.style.borderColor = '#27272a'} />
                                            </div>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px', color: '#d4d4d8' }}>Meta Keywords</label>
                                                <div 
                                                    style={{ 
                                                        width: '100%', 
                                                        minHeight: '45px',
                                                        padding: '6px 10px', 
                                                        borderRadius: '12px', 
                                                        border: '1.5px solid #27272a', 
                                                        background: '#18181b',
                                                        display: 'flex',
                                                        flexWrap: 'wrap',
                                                        gap: '8px',
                                                        alignItems: 'center',
                                                        boxSizing: 'border-box',
                                                        transition: 'border-color 0.2s',
                                                        cursor: 'text'
                                                    }}
                                                    onClick={() => document.getElementById('keyword-input')?.focus()}
                                                    onFocusCapture={(e) => e.currentTarget.style.borderColor = '#F24C20'}
                                                    onBlurCapture={(e) => e.currentTarget.style.borderColor = '#27272a'}
                                                >
                                                    {metaKeywords.split(',').filter(k => k.trim()).map((kw, i) => (
                                                        <div 
                                                            key={i}
                                                            style={{
                                                                background: '#27272a',
                                                                color: '#e4e4e7',
                                                                padding: '4px 10px',
                                                                borderRadius: '8px',
                                                                fontSize: '12px',
                                                                fontWeight: 600,
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: '6px',
                                                                border: '1px solid #3f3f46'
                                                            }}
                                                        >
                                                            {kw.trim()}
                                                            <X 
                                                                size={12} 
                                                                style={{ cursor: 'pointer', color: '#a1a1aa' }} 
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    const kws = metaKeywords.split(',').filter(k => k.trim());
                                                                    kws.splice(i, 1);
                                                                    setMetaKeywords(kws.join(','));
                                                                }}
                                                            />
                                                        </div>
                                                    ))}
                                                    <input 
                                                        id="keyword-input"
                                                        type="text" 
                                                        placeholder={!metaKeywords.trim() ? "Type keywords separated by commas or press Enter" : ""}
                                                        style={{ 
                                                            flex: 1,
                                                            minWidth: '120px',
                                                            background: 'transparent',
                                                            border: 'none',
                                                            outline: 'none',
                                                            color: '#ffffff',
                                                            fontSize: '13px',
                                                            padding: '4px 0'
                                                        }}
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter' || e.key === ',') {
                                                                e.preventDefault();
                                                                const val = e.currentTarget.value.trim();
                                                                if (val) {
                                                                    const kws = metaKeywords.split(',').map(k => k.trim()).filter(Boolean);
                                                                    if (!kws.includes(val)) {
                                                                        setMetaKeywords(metaKeywords ? `${metaKeywords},${val}` : val);
                                                                    }
                                                                    e.currentTarget.value = '';
                                                                }
                                                            } else if (e.key === 'Backspace' && !e.currentTarget.value && metaKeywords) {
                                                                const kws = metaKeywords.split(',').filter(k => k.trim());
                                                                kws.pop();
                                                                setMetaKeywords(kws.join(','));
                                                            }
                                                        }}
                                                    />
                                                </div>
                                                <p style={{ color: '#71717a', fontSize: '12px', marginTop: '6px' }}>Type comma to separate or press Enter to add keywords</p>
                                            </div>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px', color: '#d4d4d8' }}>Meta Description</label>
                                                <textarea value={metaDescription} onChange={(e) => setMetaDescription(e.target.value)} rows={3} placeholder="Short search description for this profile..." style={{ width: '100%', padding: '12px 14px', borderRadius: '12px', border: '1.5px solid #27272a', fontSize: '14px', outline: 'none', background: '#18181b', color: '#ffffff', resize: 'none', boxSizing: 'border-box' }} onFocus={(e) => e.target.style.borderColor = '#F24C20'} onBlur={(e) => e.target.style.borderColor = '#27272a'} />
                                            </div>
                                        </div>
                                    </section>

                                    {/* ── Account Access ── */}
                                    <section>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                                            <div style={{ width: '3px', height: '16px', background: '#F24C20', borderRadius: '4px' }} />
                                            <p style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#71717a' }}>
                                                Account Access
                                            </p>
                                        </div>
                                        <div style={{ background: '#18181b', border: '1.5px solid #27272a', borderRadius: '16px', padding: '20px' }}>
                                            {/* Toggles */}
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                                {/* Verified */}
                                                <div style={{
                                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                                    padding: '14px', borderRadius: '12px',
                                                    border: '1.5px solid #27272a',
                                                    background: '#18181b'
                                                }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                        <CheckCircle size={16} style={{ color: '#22c55e' }} />
                                                        <span style={{ fontSize: '13px', fontWeight: 600, color: '#e4e4e7' }}>Verified</span>
                                                    </div>
                                                    <button
                                                        onClick={() => setIsVerified(!isVerified)}
                                                        style={{
                                                            position: 'relative', width: '40px', height: '22px',
                                                            borderRadius: '99px', border: 'none', cursor: 'pointer',
                                                            background: isVerified ? '#22c55e' : '#3f3f46',
                                                            transition: 'background 0.3s',
                                                            padding: 0,
                                                        }}
                                                    >
                                                        <span style={{
                                                            position: 'absolute', top: '3px',
                                                            left: isVerified ? '21px' : '3px',
                                                            width: '16px', height: '16px',
                                                            borderRadius: '50%', background: 'white',
                                                            boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
                                                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                                        }} />
                                                    </button>
                                                </div>

                                                {/* Suspended */}
                                                <div style={{
                                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                                    padding: '14px', borderRadius: '12px',
                                                    border: '1.5px solid #27272a',
                                                    background: '#18181b'
                                                }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                        <Shield size={16} style={{ color: '#ef4444' }} />
                                                        <span style={{ fontSize: '13px', fontWeight: 600, color: '#e4e4e7' }}>Suspended</span>
                                                    </div>
                                                    <button
                                                        onClick={() => setIsSuspended(!isSuspended)}
                                                        style={{
                                                            position: 'relative', width: '40px', height: '22px',
                                                            borderRadius: '99px', border: 'none', cursor: 'pointer',
                                                            background: isSuspended ? '#ef4444' : '#3f3f46',
                                                            transition: 'background 0.3s',
                                                            padding: 0,
                                                        }}
                                                    >
                                                        <span style={{
                                                            position: 'absolute', top: '3px',
                                                            left: isSuspended ? '21px' : '3px',
                                                            width: '16px', height: '16px',
                                                            borderRadius: '50%', background: 'white',
                                                            boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
                                                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                                        }} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </section>

                                    {/* ── Subscription Management ── */}
                                    <section>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                                            <div style={{ width: '3px', height: '16px', background: '#F24C20', borderRadius: '4px' }} />
                                            <p style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#71717a' }}>
                                                Subscription Protocol
                                            </p>
                                        </div>
                                        <div style={{ background: '#18181b', border: '1.5px solid #27272a', borderRadius: '16px', padding: '20px' }}>
                                            <div style={{ marginBottom: '20px' }}>
                                                <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>
                                                    Current Plan Allocation
                                                </label>
                                                <div style={{ 
                                                    background: '#09090b', 
                                                    padding: '12px 16px', 
                                                    borderRadius: '12px', 
                                                    border: '1px solid #27272a',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'space-between'
                                                }}>
                                                    <span style={{ fontSize: '14px', fontWeight: 700, color: '#F24C20' }}>
                                                        {plans.find(p => p._id === selectedPlanId)?.name || 
                                                         user?.subscription_details?.plan_name || 
                                                         (user?.subscription_details?.plan_type === 'trial' || user?.is_trial_active ? 'FREE_TRIAL_ACTIVE' : 'NO_ACTIVE_PLAN')}
                                                    </span>
                                                    <span style={{ fontSize: '10px', color: '#52525b', fontWeight: 800 }}>
                                                        ID: {selectedPlanId.slice(-8).toUpperCase() || 'NULL'}
                                                    </span>
                                                </div>
                                            </div>

                                            <div>
                                                <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>
                                                    Reassign Subscription
                                                </label>
                                                <select
                                                    value={selectedPlanId}
                                                    onChange={(e) => setSelectedPlanId(e.target.value)}
                                                    style={{
                                                        width: '100%',
                                                        padding: '12px 14px',
                                                        borderRadius: '12px',
                                                        border: '1.5px solid #27272a',
                                                        fontSize: '14px',
                                                        fontWeight: 600,
                                                        outline: 'none',
                                                        background: '#09090b',
                                                        color: '#ffffff',
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    <option value="">NO_PLAN (Free Tier)</option>
                                                    {plans
                                                        .filter(plan => {
                                                            const targetRoles = Array.isArray(plan.target_role) ? plan.target_role : [plan.target_role];
                                                            if (roleOption === 'both') {
                                                                return targetRoles.some(r => r === 'client' || r === 'freelancer' || r === 'both');
                                                            }
                                                            return targetRoles.includes(roleOption) || targetRoles.includes('both');
                                                        })
                                                        .map(plan => (
                                                            <option key={plan._id} value={plan._id}>
                                                                {plan.name} (₹{plan.price})
                                                            </option>
                                                        ))}
                                                </select>
                                                <p style={{ color: '#52525b', fontSize: '11px', marginTop: '10px', fontStyle: 'italic' }}>
                                                    * Overriding the plan will immediately update user access limits and points.
                                                </p>
                                            </div>
                                        </div>
                                    </section>

                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        {!loading && (
                            <div style={{
                                padding: '20px 24px',
                                borderTop: '1px solid #27272a',
                                display: 'flex',
                                gap: '12px',
                                flexShrink: 0,
                                background: '#09090b',
                            }}>
                                <button
                                    onClick={onClose}
                                    style={{
                                        flex: 1, padding: '12px', borderRadius: '12px',
                                        border: '1px solid #27272a', background: 'transparent',
                                        color: '#ffffff', fontSize: '14px', fontWeight: 600, cursor: 'pointer',
                                        transition: 'background 0.2s'
                                    }}
                                    onMouseOver={(e) => e.currentTarget.style.background = '#18181b'}
                                    onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                                >
                                    Cancel
                                </button>
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={handleSave}
                                    disabled={saving}
                                    style={{
                                        flex: 1.5, padding: '12px', borderRadius: '12px',
                                        border: 'none', background: '#F24C20',
                                        color: 'white', fontSize: '14px', fontWeight: 700,
                                        cursor: saving ? 'not-allowed' : 'pointer',
                                        opacity: saving ? 0.7 : 1,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                        boxShadow: '0 4px 12px rgba(242, 76, 32, 0.3)'
                                    }}
                                >
                                    {saving
                                        ? <><Loader2 size={16} className="animate-spin" /> Saving...</>
                                        : <><Save size={16} /> Save Changes</>}
                                </motion.button>
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

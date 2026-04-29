import { motion } from 'motion/react';
import { useState } from 'react';
import { Save, X, Upload, CheckCircle, AlertCircle } from 'lucide-react';
import { Breadcrumb } from './Breadcrumb';
import api from '../lib/api';
import { toast } from 'sonner';

interface AddUserProps {
  onNavigate: (page: string) => void;
  onBack: () => void;
}


const commonLocations = [
  'Mumbai, Maharashtra', 'Delhi, NCR', 'Bangalore, Karnataka', 'Hyderabad, Telangana',
  'Ahmedabad, Gujarat', 'Chennai, Tamil Nadu', 'Kolkata, West Bengal', 'Surat, Gujarat',
  'Pune, Maharashtra', 'Jaipur, Rajasthan', 'Lucknow, Uttar Pradesh', 'Kanpur, Uttar Pradesh',
  'Nagpur, Maharashtra', 'Indore, Madhya Pradesh', 'Thane, Maharashtra', 'Bhopal, Madhya Pradesh',
  'Visakhapatnam, Andhra Pradesh', 'Pimpri-Chinchwad, Maharashtra', 'Patna, Bihar', 'Vadodara, Gujarat',
  'Ghaziabad, Uttar Pradesh', 'Ludhiana, Punjab', 'Agra, Uttar Pradesh', 'Nashik, Maharashtra',
  'Faridabad, Haryana', 'Meerut, Uttar Pradesh', 'Rajkot, Gujarat', 'Kalyan-Dombivli, Maharashtra',
  'Vasai-Virar, Maharashtra', 'Varanasi, Uttar Pradesh', 'Srinagar, Jammu and Kashmir', 'Aurangabad, Maharashtra',
  'Dhanbad, Jharkhand', 'Amritsar, Punjab', 'Navi Mumbai, Maharashtra', 'Allahabad, Uttar Pradesh',
  'Ranchi, Jharkhand', 'Howrah, West Bengal', 'Jabalpur, Madhya Pradesh', 'Gwalior, Madhya Pradesh',
  'Vijayawada, Andhra Pradesh', 'Jodhpur, Rajasthan', 'Madurai, Tamil Nadu', 'Raipur, Chhattisgarh',
  'Kota, Rajasthan', 'Guwahati, Assam', 'Chandigarh, Punjab/Haryana', 'Solapur, Maharashtra',
  'Hubballi-Dharwad, Karnataka', 'Bareilly, Uttar Pradesh', 'Moradabad, Uttar Pradesh', 'Mysore, Karnataka',
  'Gurgaon, Haryana', 'Aligarh, Uttar Pradesh', 'Jalandhar, Punjab', 'Tiruchirappalli, Tamil Nadu',
  'Bhubaneswar, Odisha', 'Salem, Tamil Nadu', 'Mira-Bhayandar, Maharashtra', 'Warangal, Telangana',
  'Thiruvananthapuram, Kerala', 'Bhiwandi, Maharashtra', 'Saharanpur, Uttar Pradesh', 'Guntur, Andhra Pradesh',
  'Amravati, Maharashtra', 'Bikaner, Rajasthan', 'Noida, Uttar Pradesh', 'Jamshedpur, Jharkhand',
  'Bhilai, Chhattisgarh', 'Cuttack, Odisha', 'Firozabad, Uttar Pradesh', 'Kochi, Kerala',
  'Bhavnagar, Gujarat', 'Dehradun, Uttarakhand', 'Durgapur, West Bengal', 'Asansol, West Bengal',
  'Nanded, Maharashtra', 'Kolhapur, Maharashtra', 'Ajmer, Rajasthan', 'Gulbarga, Karnataka',
  'Jamnagar, Gujarat', 'Ujjain, Madhya Pradesh', 'Loni, Uttar Pradesh', 'Siliguri, West Bengal',
  'Jhansi, Uttar Pradesh', 'Ulhasnagar, Maharashtra', 'Nellore, Andhra Pradesh', 'Jammu, Jammu and Kashmir',
  'Sangli-Miraj & Kupwad, Maharashtra', 'Belgaum, Karnataka', 'Mangalore, Karnataka', 'Ambattur, Tamil Nadu',
  'Tirunelveli, Tamil Nadu', 'Malegaon, Maharashtra', 'Gaya, Bihar', 'Jalgaon, Maharashtra',
  'Udaipur, Rajasthan', 'Maheshtala, West Bengal'
];

export function AddUser({ onNavigate, onBack }: AddUserProps) {
  const [showSuccess, setShowSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: 'freelancer',
    location: '',
    country: '',
    skills: [] as string[],
    hourlyRate: '',
    verified: true, // Default to true for admin creation
    status: 'active',
    password: '',
    confirmPassword: '',
    slug: '',
    metaTitle: '',
    metaKeywords: '',
    metaDescription: '',
  });

  const availableSkills = [
    'Web Development', 'Mobile Development', 'UI/UX Design', 'Graphic Design',
    'Content Writing', 'SEO', 'Digital Marketing', 'Video Editing',
    'Data Science', 'Machine Learning', 'DevOps', 'Cloud Architecture'
  ];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLocationChange = (value: string) => {
    setFormData(prev => ({ ...prev, location: value }));
    if (value.trim().length > 1) {
      const filtered = commonLocations.filter(loc =>
        loc.toLowerCase().includes(value.toLowerCase())
      ).slice(0, 5);
      setSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const toggleSkill = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill]
    }));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    if (!formData.phone.trim()) newErrors.phone = 'Phone is required';
    if (!formData.password) newErrors.password = 'Password is required';
    if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    if ((formData.role === 'freelancer' || formData.role === 'both') && formData.skills.length === 0) {
      newErrors.skills = 'Select at least one skill for freelancer';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      try {
        const response = await api.post('/admin/users', formData);
        if (response.data.success) {
          setShowSuccess(true);
          setTimeout(() => {
            onBack();
          }, 2000);
        }
      } catch (error: any) {
        console.error('Error creating user:', error);
        alert(error.response?.data?.message || 'Error creating user');
      }
    }
  };

  return (
    <div>
      <Breadcrumb
        items={[{ label: 'Users & Verification', path: 'users' }, { label: 'Add New User' }]}
        onNavigate={onNavigate}
      />

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-black text-white mb-2 uppercase tracking-tighter italic">Add New Identity</h1>
          <p className="text-gray-500 font-medium uppercase tracking-widest text-[10px]">Deploying a new user account to the platform architecture</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onBack}
          className="px-6 py-3 rounded-2xl font-bold flex items-center gap-2 border border-[#27272a] bg-[#18181b] hover:bg-[#27272a] text-gray-400 hover:text-white transition-all"
        >
          <X className="w-5 h-5" />
          Cancel
        </motion.button>
      </div>

      {showSuccess && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-6 mb-8 flex items-center gap-4"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-white">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-emerald-500 font-black uppercase italic tracking-tighter">Identity Created</p>
            <p className="text-[10px] text-emerald-600/70 font-bold uppercase tracking-widest mt-0.5">Redirecting to system registry...</p>
          </div>
        </motion.div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Image Section */}
          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-black rounded-[2.5rem] p-8 border border-[#27272a] shadow-xl"
            >
              <div className="flex items-center gap-3 mb-8">
                <Upload className="w-5 h-5 text-[#F24C20]" />
                <h3 className="text-xs font-black text-white uppercase tracking-[0.2em]">Profile Vision</h3>
              </div>

              <div className="flex flex-col items-center">
                <div className="relative w-40 h-40 mb-6">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#F24C20] to-[#F24C20]/20 animate-pulse blur-2xl opacity-20" />
                  {profileImage ? (
                    <img src={profileImage} alt="Profile" className="relative w-full h-full rounded-full object-cover border-2 border-[#27272a]" />
                  ) : (
                    <div className="relative w-full h-full rounded-full bg-[#09090b] border-2 border-dashed border-[#27272a] flex flex-col items-center justify-center gap-2 group hover:border-[#F24C20]/50 transition-all">
                      <Upload className="w-8 h-8 text-gray-600 group-hover:text-[#F24C20]" />
                    </div>
                  )}
                  <label className="absolute bottom-2 right-2 bg-[#F24C20] hover:bg-[#d43a12] text-white p-3 rounded-2xl cursor-pointer transition-all shadow-xl shadow-[#F24C20]/20 hover:scale-110">
                    <Upload className="w-5 h-5" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                </div>
                <p className="text-[10px] text-gray-500 text-center font-bold uppercase tracking-widest leading-relaxed">
                  Identity Visualization Upload
                  <br />
                  <span className="text-gray-700">Supported: JPG, PNG, GIF (5MB MAX)</span>
                </p>
              </div>

              {/* Quick Toggles */}
              <div className="mt-10 space-y-4">
                <div className="p-6 rounded-3xl bg-[#09090b] border border-[#27272a]">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Verified Access</label>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, verified: !formData.verified })}
                      className={`relative w-14 h-7 rounded-full transition-all ${formData.verified ? 'bg-emerald-500 shadow-lg shadow-emerald-500/20' : 'bg-gray-800'
                        }`}
                    >
                      <motion.div
                        animate={{ x: formData.verified ? 30 : 4 }}
                        className="absolute top-1.5 w-4 h-4 bg-white rounded-full shadow-sm"
                      />
                    </button>
                  </div>
                  <p className="text-[9px] text-gray-600 font-bold uppercase tracking-widest">Bypass manual verification</p>
                </div>

                <div className="p-6 rounded-3xl bg-[#09090b] border border-[#27272a]">
                  <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4">Initial System Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-[#27272a] bg-black text-sm font-bold text-white focus:outline-none focus:border-[#F24C20] transition-all"
                  >
                    <option value="active">ACTIVE_PROTOCOL</option>
                    <option value="suspended">SUSPENDED_ACCESS</option>
                    <option value="blocked">BLOCKED_NODE</option>
                  </select>
                </div>
              </div>
            </motion.div>

            {/* SEO Section (Left Column) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-black rounded-[2.5rem] p-8 border border-[#27272a] shadow-xl"
            >
              <div className="flex items-center gap-3 mb-8">
                <CheckCircle className="w-5 h-5 text-purple-500" />
                <h3 className="text-xs font-black text-white uppercase tracking-[0.2em]">SEO Specification</h3>
              </div>
              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-2">Profile Slug</label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-[#27272a] bg-[#09090b] text-white text-xs font-bold focus:outline-none focus:border-[#F24C20] transition-all"
                    placeholder="e.g. john-doe-expert"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-2">Meta Title</label>
                  <input
                    type="text"
                    value={formData.metaTitle}
                    onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-[#27272a] bg-[#09090b] text-white text-xs font-bold focus:outline-none focus:border-[#F24C20] transition-all"
                    placeholder="Hire John Doe on Go Experts"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-2">Meta Keywords</label>
                  <div 
                    className="w-full min-h-[45px] p-2 rounded-xl border border-[#27272a] bg-[#09090b] flex flex-wrap gap-2 items-center cursor-text transition-all focus-within:border-[#F24C20]"
                    onClick={() => document.getElementById('meta-kw-input')?.focus()}
                  >
                    {formData.metaKeywords.split(',').filter(Boolean).map((kw, i) => (
                      <div key={i} className="bg-[#18181b] border border-[#27272a] text-[10px] font-bold text-gray-300 px-2 py-1 rounded-lg flex items-center gap-2">
                        {kw}
                        <X 
                          size={10} 
                          className="cursor-pointer hover:text-white" 
                          onClick={(e) => {
                            e.stopPropagation();
                            const kws = formData.metaKeywords.split(',').filter(Boolean);
                            kws.splice(i, 1);
                            setFormData({ ...formData, metaKeywords: kws.join(',') });
                          }}
                        />
                      </div>
                    ))}
                    <input 
                      id="meta-kw-input"
                      type="text" 
                      className="flex-1 min-w-[80px] bg-transparent border-none outline-none text-white text-xs font-bold"
                      placeholder={!formData.metaKeywords ? "Type and press Enter..." : ""}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ',') {
                          e.preventDefault();
                          const val = e.currentTarget.value.trim();
                          if (val) {
                            const kws = formData.metaKeywords.split(',').filter(Boolean);
                            if (!kws.includes(val)) {
                              setFormData({ ...formData, metaKeywords: formData.metaKeywords ? `${formData.metaKeywords},${val}` : val });
                            }
                            e.currentTarget.value = '';
                          }
                        } else if (e.key === 'Backspace' && !e.currentTarget.value && formData.metaKeywords) {
                          const kws = formData.metaKeywords.split(',').filter(Boolean);
                          kws.pop();
                          setFormData({ ...formData, metaKeywords: kws.join(',') });
                        }
                      }}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-2">Meta Description</label>
                  <textarea
                    value={formData.metaDescription}
                    onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl border border-[#27272a] bg-[#09090b] text-white text-xs font-bold focus:outline-none focus:border-[#F24C20] transition-all resize-none"
                    placeholder="Short description for search engines..."
                  />
                </div>
              </div>
            </motion.div>
          </div>

          {/* Main Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2 bg-black rounded-[2.5rem] p-8 border border-[#27272a] shadow-xl h-fit"
          >
            <div className="flex items-center gap-3 mb-10">
               <AlertCircle className="w-5 h-5 text-[#F24C20]" />
               <h3 className="text-xs font-black text-white uppercase tracking-[0.2em]">Deployment Specifications</h3>
            </div>

            <div className="space-y-8">
              {/* Name Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-3">
                    Identity Prefix <span className="text-[#F24C20]">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className={`w-full px-6 py-4 rounded-2xl border ${errors.firstName ? 'border-red-500 bg-red-500/5' : 'border-[#27272a] bg-[#09090b]'
                      } text-white font-bold placeholder:text-gray-700 focus:outline-none focus:border-[#F24C20] transition-all`}
                    placeholder="First Name"
                  />
                  {errors.firstName && (
                    <p className="text-red-500 text-[9px] font-black uppercase tracking-widest mt-2 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {errors.firstName}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-3">
                    Identity Suffix <span className="text-[#F24C20]">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className={`w-full px-6 py-4 rounded-2xl border ${errors.lastName ? 'border-red-500 bg-red-500/5' : 'border-[#27272a] bg-[#09090b]'
                      } text-white font-bold placeholder:text-gray-700 focus:outline-none focus:border-[#F24C20] transition-all`}
                    placeholder="Last Name"
                  />
                  {errors.lastName && (
                    <p className="text-red-500 text-[9px] font-black uppercase tracking-widest mt-2 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {errors.lastName}
                    </p>
                  )}
                </div>
              </div>

              {/* Email & Phone */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-3">
                    Communication Port <span className="text-[#F24C20]">*</span>
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className={`w-full px-6 py-4 rounded-2xl border ${errors.email ? 'border-red-500 bg-red-500/5' : 'border-[#27272a] bg-[#09090b]'
                      } text-white font-bold placeholder:text-gray-700 focus:outline-none focus:border-[#F24C20] transition-all`}
                    placeholder="admin@experts.com"
                  />
                  {errors.email && (
                    <p className="text-red-500 text-[9px] font-black uppercase tracking-widest mt-2 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {errors.email}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-3">
                    Secure Line <span className="text-[#F24C20]">*</span>
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className={`w-full px-6 py-4 rounded-2xl border ${errors.phone ? 'border-red-500 bg-red-500/5' : 'border-[#27272a] bg-[#09090b]'
                      } text-white font-bold placeholder:text-gray-700 focus:outline-none focus:border-[#F24C20] transition-all`}
                    placeholder="+91 00000 00000"
                  />
                  {errors.phone && (
                    <p className="text-red-500 text-[9px] font-black uppercase tracking-widest mt-2 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {errors.phone}
                    </p>
                  )}
                </div>
              </div>

              {/* Role */}
              <div>
                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-3">
                  System Architecture Role <span className="text-[#F24C20]">*</span>
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-6 py-4 rounded-2xl border border-[#27272a] bg-[#09090b] text-white font-bold focus:outline-none focus:border-[#F24C20] transition-all"
                >
                  <option value="client">CLIENT_PORTAL</option>
                  <option value="freelancer">FREELANCE_ENGINEER</option>
                  <option value="both">HYBRID_SYSTEM</option>
                  <option value="admin">ROOT_ADMIN</option>
                </select>
              </div>

              {/* Location */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="relative">
                  <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-3">Geographic Node</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => handleLocationChange(e.target.value)}
                    onFocus={() => formData.location.length > 1 && suggestions.length > 0 && setShowSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                    className="w-full px-6 py-4 rounded-2xl border border-[#27272a] bg-[#09090b] text-white font-bold placeholder:text-gray-700 focus:outline-none focus:border-[#F24C20] transition-all"
                    placeholder="e.g. Mumbai, India"
                  />
                  {showSuggestions && (
                    <div className="absolute z-50 w-full mt-2 bg-[#09090b] border border-[#27272a] rounded-2xl shadow-2xl overflow-hidden backdrop-blur-xl">
                      {suggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => {
                            setFormData(prev => ({ ...prev, location: suggestion }));
                            setShowSuggestions(false);
                          }}
                          className="w-full px-6 py-3 text-left hover:bg-[#18181b] text-white text-xs font-bold transition-colors border-b border-[#27272a] last:border-0"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-3">Country Code</label>
                  <select
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    className="w-full px-6 py-4 rounded-2xl border border-[#27272a] bg-[#09090b] text-white font-bold focus:outline-none focus:border-[#F24C20] transition-all"
                  >
                    <option value="">SELECT_REGION</option>
                    <option value="IN">INDIA</option>
                    <option value="US">UNITED_STATES</option>
                    <option value="UK">UNITED_KINGDOM</option>
                    <option value="AE">UAE</option>
                  </select>
                </div>
              </div>

              {/* Skills (for Freelancers) */}
              {(formData.role === 'freelancer' || formData.role === 'both') && (
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-4">
                    Technical Capabilities <span className="text-[#F24C20]">*</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {availableSkills.map((skill) => (
                      <button
                        key={skill}
                        type="button"
                        onClick={() => toggleSkill(skill)}
                        className={`px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border ${formData.skills.includes(skill)
                          ? 'bg-[#F24C20] border-[#F24C20] text-white shadow-lg shadow-[#F24C20]/20'
                          : 'bg-[#09090b] border-[#27272a] text-gray-500 hover:border-gray-600 hover:text-gray-300'
                          }`}
                      >
                        {skill}
                      </button>
                    ))}
                  </div>
                  {errors.skills && (
                    <p className="text-red-500 text-[9px] font-black uppercase tracking-widest mt-3 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {errors.skills}
                    </p>
                  )}
                </div>
              )}

              {/* Password Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-3">
                    Access Key <span className="text-[#F24C20]">*</span>
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className={`w-full px-6 py-4 rounded-2xl border ${errors.password ? 'border-red-500 bg-red-500/5' : 'border-[#27272a] bg-[#09090b]'
                      } text-white font-bold placeholder:text-gray-700 focus:outline-none focus:border-[#F24C20] transition-all`}
                    placeholder="••••••••"
                  />
                  {errors.password && (
                    <p className="text-red-500 text-[9px] font-black uppercase tracking-widest mt-2 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {errors.password}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-3">
                    Verify Key <span className="text-[#F24C20]">*</span>
                  </label>
                  <input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className={`w-full px-6 py-4 rounded-2xl border ${errors.confirmPassword ? 'border-red-500 bg-red-500/5' : 'border-[#27272a] bg-[#09090b]'
                      } text-white font-bold placeholder:text-gray-700 focus:outline-none focus:border-[#F24C20] transition-all`}
                    placeholder="••••••••"
                  />
                  {errors.confirmPassword && (
                    <p className="text-red-500 text-[9px] font-black uppercase tracking-widest mt-2 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {errors.confirmPassword}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 mt-12">
              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-[2] bg-[#F24C20] hover:bg-[#d43a12] text-white px-8 py-5 rounded-[2rem] font-black uppercase tracking-[0.2em] text-xs transition-all shadow-xl shadow-[#F24C20]/20 flex items-center justify-center gap-3"
              >
                <Save className="w-5 h-5" />
                Initialize Deployment
              </motion.button>
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onBack}
                className="flex-1 px-8 py-5 rounded-[2rem] font-black uppercase tracking-[0.2em] text-xs border border-[#27272a] bg-[#18181b] text-gray-500 hover:text-white hover:bg-[#27272a] transition-all"
              >
                Abort
              </motion.button>
            </div>
          </motion.div>
        </div>
      </form>
    </div>
  );
}



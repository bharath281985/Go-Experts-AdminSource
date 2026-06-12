import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft, ShoppingBag, CheckCircle, Ban, Mail, Loader2, Globe,
  Linkedin, Twitter, Facebook, Instagram, Github, ExternalLink,
  FileText, Link2, X, Rocket, ShieldCheck, Eye, Crown, Zap,
  MapPin, Phone, Calendar, Star, Briefcase, GraduationCap,
  Award, Clock, Shield, CreditCard, Wallet, User, Download,
  ShieldAlert, Building2, Users, Heart
} from 'lucide-react';
import api from '../lib/api';

interface UserProfileProps {
  userId: string;
  onBack: () => void;
}

const verifiedKycStatuses = ['basic_verified', 'fully_verified', 'premium_verified'];

export function UserProfile({ userId, onBack }: UserProfileProps) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [previewDocument, setPreviewDocument] = useState<{ url: string; title: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'portfolio' | 'documents'>('overview');

  useEffect(() => {
    const fetchUser = async () => {
      try {
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
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <Loader2 className="w-8 h-8 text-[#F24C20] animate-spin" />
        <p className="text-sm text-zinc-500">Loading user profile...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-zinc-400">User not found</p>
        <button onClick={onBack} className="mt-4 text-[#F24C20] hover:underline">Go back</button>
      </div>
    );
  }

  const getFullUrl = (path: string) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    const baseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/+$/, '');
    const cleanPath = String(path).replace(/^\/+/, '').replace(/\\/g, '/');
    return `${baseUrl}/${cleanPath}`;
  };

  const isPdfDocument = (url: string) => url?.toLowerCase().includes('.pdf');
  const isImageFile = (url: string) => /\.(jpg|jpeg|png|webp|gif|avif)$/i.test(url);

  const profileImage = user.profile_image
    ? getFullUrl(user.profile_image)
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(user.full_name || 'U')}&background=F24C20&color=fff&bold=true&size=200`;

  const primaryRole = user.roles?.includes('startup_creator')
    ? 'Startup Creator'
    : user.roles?.includes('investor')
      ? 'Investor'
      : user.roles?.includes('freelancer')
        ? 'Freelancer'
        : user.roles?.includes('client')
          ? 'Client'
          : 'User';

  const kycDetails = user.profile?.kyc_details || user.kyc_details || {};
  const isKycVerified = verifiedKycStatuses.includes(String(user.kyc_status || '').toLowerCase()) || Boolean(kycDetails.is_verified);
  const rating = Number(user.review_score || user.rating || 0).toFixed(1);

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-black to-zinc-950 p-6">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Back Button */}
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-900/50 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all duration-200 text-sm w-fit"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Users
        </button>

        {/* Profile Header - Image and Details Side by Side */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-zinc-900/30 backdrop-blur-sm rounded-2xl border border-zinc-800 overflow-hidden"
        >
          <div className="flex flex-col lg:flex-row gap-6 p-6">
            {/* Avatar Section - Fixed 200x200 */}
            <div className="lg:w-[200px] flex-shrink-0">
              <div className="relative">
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[#F24C20] to-purple-500 opacity-75 blur-lg" />
                <img
                  src={profileImage}
                  alt={user.full_name}
                  className="relative w-[200px] h-[200px] rounded-2xl object-cover border-4 border-zinc-900 bg-zinc-800"
                  style={{ width: '200px', height: '200px', objectFit: 'cover' }}
                />
              </div>
            </div>

            {/* User Details Section */}
            <div className="flex-1 space-y-4">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-3xl font-black text-white tracking-tight">{user.full_name}</h1>
                  {user.role_title && (
                    <span className="text-[#F24C20] font-bold text-lg">{user.role_title}</span>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  {user.is_email_verified && (
                    <span className="flex items-center gap-1 text-[10px] font-bold bg-emerald-500/10 text-emerald-500 px-2 py-1 rounded border border-emerald-500/20 uppercase tracking-wider">
                      <CheckCircle className="w-3 h-3" />
                      Email Verified
                    </span>
                  )}
                  <span className={`text-[10px] font-bold px-2 py-1 rounded border uppercase tracking-wider ${!user.is_suspended
                    ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                    : 'bg-red-500/10 text-red-500 border-red-500/20'
                    }`}>
                    {!user.is_suspended ? 'Active' : 'Suspended'}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-1 rounded border uppercase tracking-wider ${isKycVerified
                    ? 'bg-blue-500/10 text-blue-500 border-blue-500/20'
                    : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                    }`}>
                    {isKycVerified ? 'KYC Verified' : 'KYC Pending'}
                  </span>
                </div>
              </div>

              {/* Contact Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="flex items-center gap-2 text-sm text-zinc-400">
                  <Mail className="w-4 h-4 text-zinc-500" />
                  <span className="truncate">{user.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-zinc-400">
                  <MapPin className="w-4 h-4 text-zinc-500" />
                  <span>{user.location || 'Location not set'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-zinc-400">
                  <Briefcase className="w-4 h-4 text-zinc-500" />
                  <span>{primaryRole}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-zinc-400">
                  <Calendar className="w-4 h-4 text-zinc-500" />
                  <span>Joined: {new Date(user.created_at || user.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Rating Box */}
              <div className="flex flex-wrap gap-3 pt-2">
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800">
                  <Star className="w-4 h-4 text-amber-500" />
                  <span className="text-white font-bold">{rating}</span>
                  <span className="text-zinc-500 text-xs">({user.review_count || 0} reviews)</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800">
                  <Award className="w-4 h-4 text-blue-500" />
                  <span className="text-white font-bold">₹{user.hourly_rate || 0}</span>
                  <span className="text-zinc-500 text-xs">/service</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Action Buttons Bar */}
        <div className="flex flex-wrap gap-3">
          <button
            onClick={async () => {
              try {
                const response = await api.put(`/admin/users/${userId}/suspend`);
                if (response.data.success) {
                  const res = await api.get(`/admin/users/${userId}`);
                  setUser(res.data.user);
                }
              } catch (err: any) {
                console.error('Operation failed:', err);
              }
            }}
            className={`flex-1 min-w-[140px] px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all duration-200 flex items-center justify-center gap-2 border shadow-xl ${!user.is_suspended
              ? 'bg-amber-500 text-white border-amber-600 hover:bg-amber-600'
              : 'bg-emerald-500 text-white border-emerald-600 hover:bg-emerald-600'
              }`}
          >
            <Ban className="w-4 h-4" />
            {!user.is_suspended ? 'Block User' : 'Restore User'}
          </button>

          <button
            onClick={async () => {
              const isSoftDeleted = Boolean(user.is_deleted || user.deleted_at || user.status === 'deleted');
              const confirmMessage = isSoftDeleted
                ? 'PERMANENT DELETE: Are you absolutely sure? This cannot be undone.'
                : 'Soft delete this user? The user can be restored later.';
              if (!window.confirm(confirmMessage)) return;
              try {
                const response = await api.delete(`/admin/users/${userId}`, {
                  params: (user.is_deleted || user.deleted_at || user.status === 'deleted') ? { permanent: true } : {}
                });
                if (response.data.success) {
                  onBack();
                }
              } catch (err: any) {
                console.error('Deletion failed:', err);
              }
            }}
            className="flex-1 min-w-[140px] px-4 py-3 bg-zinc-950 text-red-500 hover:bg-red-600 hover:text-white border border-red-900 rounded-xl font-bold text-xs uppercase tracking-widest transition-all duration-200 flex items-center justify-center gap-2 shadow-xl"
          >
            <X className="w-4 h-4" />
            {(user.is_deleted || user.deleted_at || user.status === 'deleted') ? 'Delete Permanently' : 'Soft Delete User'}
          </button>
        </div>

        {/* Tabs Navigation */}
        <div className="flex gap-2 border-b border-zinc-800">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-6 py-3 text-sm font-medium transition-all relative ${activeTab === 'overview'
              ? 'text-[#F24C20]'
              : 'text-zinc-400 hover:text-white'
              }`}
          >
            Overview
            {activeTab === 'overview' && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#F24C20]"
              />
            )}
          </button>
          <button
            onClick={() => setActiveTab('portfolio')}
            className={`px-6 py-3 text-sm font-medium transition-all relative ${activeTab === 'portfolio'
              ? 'text-[#F24C20]'
              : 'text-zinc-400 hover:text-white'
              }`}
          >
            Portfolio ({user.portfolio?.length || 0})
            {activeTab === 'portfolio' && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#F24C20]"
              />
            )}
          </button>
          <button
            onClick={() => setActiveTab('documents')}
            className={`px-6 py-3 text-sm font-medium transition-all relative ${activeTab === 'documents'
              ? 'text-[#F24C20]'
              : 'text-zinc-400 hover:text-white'
              }`}
          >
            Documents
            {activeTab === 'documents' && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#F24C20]"
              />
            )}
          </button>
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {/* Bio Section */}
              <div className="bg-zinc-900/30 rounded-2xl border border-zinc-800 p-6">
                <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2 mb-4">
                  <FileText className="w-4 h-4 text-[#F24C20]" />
                  About
                </h3>
                <p className="text-zinc-300 leading-relaxed text-sm">
                  {user.bio || 'No bio provided.'}
                </p>
              </div>

              {/* Two Column Info Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Personal Information */}
                <div className="bg-zinc-900/30 rounded-2xl border border-zinc-800 p-6">
                  <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                    <User className="w-4 h-4 text-blue-500" />
                    Personal Information
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between py-2 border-b border-zinc-800">
                      <span className="text-zinc-500 text-sm">Role</span>
                      <span className="text-white text-sm font-medium">{primaryRole}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-zinc-800">
                      <span className="text-zinc-500 text-sm">Location</span>
                      <span className="text-white text-sm">{user.location || '—'}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-zinc-800">
                      <span className="text-zinc-500 text-sm">WhatsApp</span>
                      <span className="text-white text-sm">
                        {`${user.whatsapp_country_code || ''} ${user.whatsapp_number || ''}`.trim() || '—'}
                      </span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-zinc-800">
                      <span className="text-zinc-500 text-sm">Alternative Number</span>
                      <span className="text-white text-sm">
                        {(user.business_or_alternative_number)
                          ? `${user.business_or_alternative_country_code || ''} ${user.business_or_alternative_number || ''}`.trim()
                          : '—'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Categories & Specialization */}
                <div className="bg-zinc-900/30 rounded-2xl border border-zinc-800 p-6">
                  <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-500" />
                    Categories & Expertise
                  </h3>
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-2">
                      {user.categories?.length ? user.categories.map((c: any, i: number) => (
                        <span key={i} className="px-3 py-1.5 text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg font-medium">
                          {typeof c === 'object' ? c.name : c}
                        </span>
                      )) : <span className="text-zinc-600 text-sm italic">No categories selected</span>}
                    </div>
                  </div>
                </div>
              </div>

              {/* SEO Metadata */}
              <div className="bg-zinc-900/30 rounded-2xl border border-zinc-800 p-6">
                <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-blue-500" />
                  SEO & Metadata
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-zinc-500 uppercase mb-1 block">Meta Title</label>
                    <p className="text-sm text-white font-medium">{user.meta_title || '—'}</p>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-zinc-500 uppercase mb-1 block">Meta Keywords</label>
                    <p className="text-sm text-zinc-400">{user.meta_keywords || '—'}</p>
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase mb-1 block">Meta Description</label>
                    <p className="text-sm text-zinc-400 leading-relaxed">{user.meta_description || '—'}</p>
                  </div>
                </div>
              </div>

              {/* Social Links */}
              {user.social_links && Object.values(user.social_links).some(Boolean) && (
                <div className="bg-zinc-900/30 rounded-2xl border border-zinc-800 p-6">
                  <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                    <Globe className="w-4 h-4 text-blue-500" />
                    Social Links
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {user.social_links.linkedin && (
                      <a href={user.social_links.linkedin} target="_blank" rel="noopener noreferrer"
                        className="p-2.5 rounded-lg bg-zinc-800 hover:bg-[#F24C20] transition-all">
                        <Linkedin className="w-4 h-4" />
                      </a>
                    )}
                    {user.social_links.twitter && (
                      <a href={user.social_links.twitter} target="_blank" rel="noopener noreferrer"
                        className="p-2.5 rounded-lg bg-zinc-800 hover:bg-[#F24C20] transition-all">
                        <Twitter className="w-4 h-4" />
                      </a>
                    )}
                    {user.social_links.github && (
                      <a href={user.social_links.github} target="_blank" rel="noopener noreferrer"
                        className="p-2.5 rounded-lg bg-zinc-800 hover:bg-[#F24C20] transition-all">
                        <Github className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'portfolio' && (
            <motion.div
              key="portfolio"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-zinc-900/30 rounded-2xl border border-zinc-800 p-6"
            >
              <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-[#F24C20]" />
                Portfolio Projects
              </h3>
              {user.portfolio?.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {user.portfolio.map((project: any, idx: number) => (
                    <div key={idx} className="bg-zinc-800/30 rounded-xl overflow-hidden border border-zinc-800 hover:border-[#F24C20]/30 transition-all">
                      {project.image && (
                        <img
                          src={getFullUrl(project.image)}
                          alt={project.title}
                          className="w-full h-48 object-cover"
                        />
                      )}
                      <div className="p-4">
                        <h4 className="text-white font-medium mb-1">{project.title}</h4>
                        <p className="text-zinc-500 text-xs line-clamp-2 mb-3">{project.description}</p>
                        {project.links?.length > 0 && (
                          <div className="flex gap-2">
                            {project.links.map((link: string, lIdx: number) => (
                              <a key={lIdx} href={getFullUrl(link)} target="_blank" rel="noopener noreferrer"
                                className="text-[#F24C20] text-xs hover:underline">
                                View Project →
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-zinc-500 text-center py-8">No portfolio items available</p>
              )}
            </motion.div>
          )}

          {activeTab === 'documents' && (
            <motion.div
              key="documents"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-zinc-900/30 rounded-2xl border border-zinc-800 p-6"
            >
              <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                KYC & Documents
              </h3>
              <div className="space-y-3">
                <DocumentItem
                  label="Aadhaar Card"
                  exists={!!kycDetails.aadhar_card}
                  onClick={() => kycDetails.aadhar_card && setPreviewDocument({
                    url: getFullUrl(kycDetails.aadhar_card),
                    title: 'Aadhaar Card'
                  })}
                />
                <DocumentItem
                  label="PAN Card"
                  exists={!!kycDetails.pan_card}
                  onClick={() => kycDetails.pan_card && setPreviewDocument({
                    url: getFullUrl(kycDetails.pan_card),
                    title: 'PAN Card'
                  })}
                />
                <DocumentItem
                  label="Experience Letter"
                  exists={!!user.documents?.experience_letter}
                  onClick={() => user.documents?.experience_letter && setPreviewDocument({
                    url: getFullUrl(user.documents.experience_letter),
                    title: 'Experience Letter'
                  })}
                />
                {user.documents?.educational?.length > 0 && (
                  <div className="pt-3">
                    <p className="text-zinc-500 text-xs mb-2">Educational Documents</p>
                    <div className="flex gap-2">
                      {user.documents.educational.map((doc: string, idx: number) => (
                        <button
                          key={idx}
                          onClick={() => setPreviewDocument({
                            url: getFullUrl(doc),
                            title: `Educational Document ${idx + 1}`
                          })}
                          className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition-all"
                        >
                          <FileText className="w-4 h-4 text-zinc-400" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Document Preview Modal */}
      <AnimatePresence>
        {previewDocument && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setPreviewDocument(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-4xl max-h-[85vh] bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden flex flex-col shadow-2xl"
            >
              <div className="flex items-center justify-between p-4 border-b border-zinc-800 bg-zinc-900">
                <h3 className="font-medium text-white">{previewDocument.title}</h3>
                <div className="flex gap-2">
                  <a
                    href={previewDocument.url}
                    download
                    className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-all"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                  <button
                    onClick={() => setPreviewDocument(null)}
                    className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-all"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="flex-1 bg-black p-4 overflow-auto flex items-center justify-center min-h-[400px]">
                {isPdfDocument(previewDocument.url) ? (
                  <iframe
                    src={`${previewDocument.url}#toolbar=0`}
                    className="w-full h-full border-0 rounded-lg"
                    title="PDF Preview"
                  />
                ) : isImageFile(previewDocument.url) ? (
                  <img
                    src={previewDocument.url}
                    alt={previewDocument.title}
                    className="max-w-full max-h-full object-contain rounded-lg"
                  />
                ) : (
                  <div className="text-center text-zinc-500">
                    <FileText className="w-12 h-12 mx-auto mb-2" />
                    <p>Preview not available</p>
                    <a href={previewDocument.url} download className="text-[#F24C20] hover:underline mt-2 inline-block">
                      Download file
                    </a>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Helper Components
function DocumentItem({ label, exists, onClick }: { label: string; exists: boolean; onClick: () => void }) {
  return (
    <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-800/30 border border-zinc-800">
      <div className="flex items-center gap-3">
        <FileText className={`w-4 h-4 ${exists ? 'text-emerald-500' : 'text-zinc-600'}`} />
        <span className="text-sm text-zinc-300">{label}</span>
      </div>
      {exists ? (
        <button onClick={onClick} className="p-1.5 rounded-lg bg-zinc-800 hover:bg-[#F24C20] text-zinc-400 hover:text-white transition-all">
          <Eye className="w-3.5 h-3.5" />
        </button>
      ) : (
        <span className="text-xs text-zinc-600">Not uploaded</span>
      )}
    </div>
  );
}

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, ShoppingBag, CheckCircle, Ban, Mail, Loader2, Globe, Linkedin, Twitter, Facebook, Instagram, Github, ExternalLink, FileText, Link2, X } from 'lucide-react';
import api from '../lib/api';

interface UserProfileProps {
  userId: string;
  onBack: () => void;
}

export function UserProfile({ userId, onBack }: UserProfileProps) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [previewDocument, setPreviewDocument] = useState<{ url: string; title: string } | null>(null);

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
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-[#F24C20] animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <div>User not found</div>;
  }

  const getFullUrl = (path: string) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    const baseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/+$/, '');
    const cleanPath = String(path).replace(/^\/+/, '').replace(/\\/g, '/');
    return `${baseUrl}/${cleanPath}`;
  };

  const isPdfDocument = (url: string) => url.toLowerCase().includes('.pdf');

  const profileImage = user.profile_image
    ? getFullUrl(user.profile_image)
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(user.full_name || 'U')}&background=random`;

  const primaryRole = user.roles?.includes('startup_creator')
    ? 'Startup Idea Creator'
    : user.roles?.includes('investor')
      ? 'Investor'
      : user.roles?.includes('freelancer')
        ? 'Freelancer'
        : user.roles?.includes('client')
          ? 'Client'
          : 'User';

  const isKycVerified = user.kyc_status === 'fully_verified' || user.kyc_details?.is_verified;
  const joinedDate = new Date(user.created_at || user.createdAt || Date.now()).toLocaleDateString();
  const rating = Number(user.review_score || user.rating || 0).toFixed(1);

  const detailCards = [
    { label: 'Role', value: primaryRole },
    { label: 'Location', value: user.location || 'Not Added' },
    { label: 'WhatsApp', value: `${user.whatsapp_country_code || ''} ${user.whatsapp_number || ''}`.trim() || 'Not Added' },
    {
      label: 'Business / Alternative',
      value: (user.business_or_alternative_number)
        ? `${user.business_or_alternative_country_code || ''} ${user.business_or_alternative_number || ''}`.trim()
        : `${user.whatsapp_country_code || ''} ${user.whatsapp_number || ''}`.trim() || 'Not Added'
    },
    { label: 'KYC Status', value: isKycVerified ? 'Verified' : 'Not Verified' },
  ];

  const statCards = [
    { label: 'Completed Projects', value: user.completed_projects || 0, icon: ShoppingBag, tone: 'bg-blue-100 dark:bg-blue-900/20 text-blue-600' },
    { label: 'Happy Customers', value: user.happy_customers || 0, icon: CheckCircle, tone: 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600' }
  ];

  const renderTags = (items: any[] = []) => {
    if (!items.length) return <p className="text-sm text-gray-500 dark:text-gray-400">Not Added</p>;
    return (
      <div className="flex flex-wrap gap-2">
        {items.map((item: any, index: number) => (
          <span
            key={`${typeof item === 'object' ? item._id || item.name : item}-${index}`}
            className="bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 px-3 py-1 rounded-full text-sm font-medium"
          >
            {typeof item === 'object' ? item.name : item}
          </span>
        ))}
      </div>
    );
  };

  const socialIcons: { [key: string]: any } = {
    facebook: Facebook,
    twitter: Twitter,
    linkedin: Linkedin,
    instagram: Instagram,
    github: Github,
    behance: Globe,
    dribbble: Globe,
    youtube: Globe
  };

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
            src={profileImage}
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
                <p className="text-blue-600 dark:text-blue-400 font-medium mb-1">{user.role_title || primaryRole}</p>
                <p className="text-gray-600 dark:text-gray-400 mb-4">{user.location || 'Location not added'}</p>
                <div className="flex items-center gap-4">
                  <div>
                    <span className="font-semibold">{rating}</span>
                    <span className="text-gray-600 dark:text-gray-400 text-sm ml-1">Rating</span>
                  </div>
                  <div className="h-4 w-px bg-gray-300 dark:bg-gray-600"></div>
                  <div>
                    <span className="font-semibold">{user.review_count || 0}</span>
                    <span className="text-gray-600 dark:text-gray-400 text-sm ml-1">Reviews</span>
                  </div>
                  <div className="h-4 w-px bg-gray-300 dark:bg-gray-600"></div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400 text-sm">Member since </span>
                    <span className="font-semibold">{joinedDate}</span>
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
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + (index * 0.05) }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${card.tone}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">{card.label}</p>
                  <p className="text-2xl font-bold">{card.value}</p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Profile Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700"
        >
          <h3 className="text-lg font-bold mb-4">Profile Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {detailCards.map((item) => (
              <div key={item.label} className="rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                <p className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">{item.label}</p>
                <p className={`font-medium ${item.label === 'KYC Status' ? (isKycVerified ? 'text-emerald-500' : 'text-red-500') : ''}`}>{item.value}</p>
              </div>
            ))}
          </div>

          <h3 className="text-lg font-bold mt-8 mb-4">Social Connections</h3>
          <div className="flex flex-wrap gap-4">
            {Object.entries(user.social_links || {}).map(([platform, value]) => {
              if (!value) return null;
              const Icon = socialIcons[platform] || Link2;
              return (
                <a
                  key={platform}
                  href={String(value).startsWith('http') ? String(value) : `https://${value}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-3 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-[#F24C20] transition-colors"
                >
                  <Icon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <span className="text-sm font-medium capitalize">{platform}</span>
                  <ExternalLink className="w-3 h-3 text-gray-400" />
                </a>
              );
            })}
            {(!user.social_links || Object.values(user.social_links).every(v => !v)) && (
              <p className="text-sm text-gray-500">No social links added</p>
            )}
          </div>
        </motion.div>

        {/* Skills & Categories */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700"
        >
          <h3 className="text-lg font-bold mb-4">Skills</h3>
          {renderTags(user.skills)}
          <h3 className="text-lg font-bold mt-6 mb-4">Categories</h3>
          {renderTags(user.categories)}
          <h3 className="text-lg font-bold mt-6 mb-4">Languages</h3>
          {renderTags(user.languages)}
          <h3 className="text-lg font-bold mt-6 mb-4">Service Price</h3>
          <p className="text-2xl font-bold text-[#F24C20]">₹ {user.hourly_rate || 0}</p>
          <p className="text-xs text-gray-500 uppercase tracking-widest mt-1">Starting Price</p>
        </motion.div>

        {/* Experience */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700"
        >
          <h3 className="text-lg font-bold mb-4">Work Experience</h3>
          {user.experience_details?.length ? (
            <div className="space-y-4">
              {user.experience_details.map((item: any, index: number) => (
                <div key={`${item.title || 'experience'}-${index}`} className="border-l-2 border-blue-500 pl-4 py-1">
                  <p className="font-semibold">{item.title || 'Untitled Role'}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{item.company || 'Company not added'}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{item.year_range || 'Timeline not added'}</p>
                  {item.description && <p className="text-sm mt-2 text-gray-600 dark:text-gray-300">{item.description}</p>}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400">No experience details added</p>
          )}
        </motion.div>

        {/* Education & Documents */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700"
        >
          <h3 className="text-lg font-bold mb-4">Education & Documents</h3>
          {user.education_details?.length ? (
            <div className="space-y-4 mb-6">
              {user.education_details.map((item: any, index: number) => (
                <div key={`${item.title || 'education'}-${index}`} className="border-l-2 border-emerald-500 pl-4 py-1">
                  <p className="font-semibold">{item.title || 'Untitled Education'}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{item.institution || 'Institution not added'}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{item.year_range || 'Timeline not added'}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">No education details added</p>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4">
              <p className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">Aadhar & PAN (KYC)</p>
              <div className="flex gap-2">
                {user.kyc_details?.aadhar_card && (
                  <button onClick={() => setPreviewDocument({ url: getFullUrl(user.kyc_details.aadhar_card), title: 'Aadhar Card' })} className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded hover:bg-gray-200">Aadhar</button>
                )}
                {user.kyc_details?.pan_card && (
                  <button onClick={() => setPreviewDocument({ url: getFullUrl(user.kyc_details.pan_card), title: 'PAN Card' })} className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded hover:bg-gray-200">PAN</button>
                )}
                {!user.kyc_details?.aadhar_card && !user.kyc_details?.pan_card && <span className="text-xs text-gray-500">None</span>}
              </div>
            </div>
            <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4">
              <p className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">Professional Proof</p>
              {user.documents?.experience_letter ? (
                <button onClick={() => setPreviewDocument({ url: getFullUrl(user.documents.experience_letter), title: 'Experience Letter' })} className="flex items-center gap-2 text-xs text-blue-600 hover:underline">
                  <FileText className="w-4 h-4" /> View Experience Letter
                </button>
              ) : <span className="text-xs text-gray-500">Not Uploaded</span>}
            </div>
          </div>

          <div className="mt-4 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <p className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">Academic Docs</p>
            <div className="flex flex-wrap gap-2">
              {user.documents?.educational?.map((doc: string, idx: number) => (
                <button key={idx} onClick={() => setPreviewDocument({ url: getFullUrl(doc), title: `Academic Doc #${idx + 1}` })} className="flex items-center gap-1 text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded hover:bg-gray-200">
                  <FileText className="w-3 h-3" /> Doc #{idx + 1}
                </button>
              )) || <span className="text-xs text-gray-500">None</span>}
            </div>
          </div>
        </motion.div>

        {/* Bio - Full Width */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="xl:col-span-2 bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700"
        >
          <h3 className="text-lg font-bold mb-4">About / Bio</h3>
          <p className="text-gray-600 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
            {user.bio || 'No bio added by the user.'}
          </p>
        </motion.div>

        {/* Portfolio - Full Width */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
          className="xl:col-span-2 bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700"
        >
          <h3 className="text-lg font-bold mb-6">Professional Portfolio</h3>
          {user.portfolio?.length ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {user.portfolio.map((project: any, index: number) => (
                <div key={index} className="flex flex-col gap-4 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/30">
                  <div className="flex flex-col md:flex-row gap-4">
                    {project.image && (
                      <img
                        src={getFullUrl(project.image)}
                        alt={project.title}
                        className="w-full md:w-32 h-32 rounded-xl object-cover border border-gray-200 dark:border-gray-600 cursor-pointer"
                        onClick={() => setPreviewDocument({ url: getFullUrl(project.image), title: project.title })}
                      />
                    )}
                    <div className="flex-1">
                      <h4 className="font-bold text-lg mb-1">{project.title || 'Untitled Project'}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-3">{project.description}</p>
                      <div className="flex flex-wrap gap-2">
                        {project.links?.map((link: string, lIdx: number) => (
                          <a key={lIdx} href={link.startsWith('http') ? link : `https://${link}`} target="_blank" className="text-xs flex items-center gap-1 text-blue-600 hover:underline">
                            <ExternalLink className="w-3 h-3" /> Link #{lIdx + 1}
                          </a>
                        ))}
                      </div>
                    </div>
                  </div>
                  {project.images?.length > 0 && (
                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 mt-2">
                      {project.images.map((img: string, imgIdx: number) => (
                        <div key={imgIdx} onClick={() => setPreviewDocument({ url: getFullUrl(img), title: project.title })} className="aspect-square rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 cursor-pointer">
                          <img src={getFullUrl(img)} alt="" className="w-full h-full object-cover hover:scale-110 transition-transform" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No portfolio projects added yet.</p>
          )}
        </motion.div>
      </div>

      {/* Document Preview Modal */}
      <AnimatePresence>
        {previewDocument && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-8">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setPreviewDocument(null)}
              className="absolute inset-0 bg-black/90 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative  max-w-5xl max-h-full bg-white dark:bg-gray-900 rounded-3xl overflow-hidden shadow-2xl flex flex-col"
            >
              {/* Modal Header */}
              <div className="p-4 md:p-6 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between bg-white dark:bg-gray-900">
                <h3 className="text-lg font-bold truncate pr-4">{previewDocument.title}</h3>
                <div className="flex items-center gap-2">
                  <a
                    href={previewDocument.url}
                    download
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors text-gray-600 dark:text-gray-400"
                    title="Download"
                  >
                    <ExternalLink className="w-5 h-5" />
                  </a>
                  <button
                    onClick={() => setPreviewDocument(null)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-gray-100 dark:bg-gray-950 min-h-[300px]">
                {isPdfDocument(previewDocument.url) ? (
                  <iframe
                    src={`${previewDocument.url}#toolbar=0`}
                    className="w-full h-[70vh] border-none rounded-xl"
                    title="PDF Preview"
                  />
                ) : (
                  <img
                    src={previewDocument.url}
                    alt={previewDocument.title}
                    className="max-w-full max-h-[75vh] object-contain rounded-lg shadow-lg"
                  />
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

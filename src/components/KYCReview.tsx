import { motion, AnimatePresence } from 'motion/react';
import {
  ChevronLeft, FileText, CheckCircle, Ban, Loader2, ExternalLink,
  ShieldCheck, User, Briefcase, Landmark, Rocket, ShieldAlert,
  Fingerprint, Database, Globe, Scale, Cpu, Zap, Activity, Eye, X, Download
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import api from '../lib/api';

interface KYCReviewPageProps {
  userId: string;
  onBack: () => void;
}

const getFileUrl = (path: string) => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  const baseUrl = import.meta.env.VITE_API_URL || 'https://backendapis.goexperts.in';
  return `${baseUrl}${path.startsWith('/') ? '' : '/'}${path}`;
};

const isImage = (url: string) => /\.(jpg|jpeg|png|webp|gif|avif)$/i.test(url);
const isPdf = (url: string) => url.toLowerCase().includes('.pdf');
const verifiedKycStatuses = ['basic_verified', 'fully_verified', 'premium_verified'];

export function KYCReviewPage({ userId, onBack }: KYCReviewPageProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [previewDoc, setPreviewDoc] = useState<{ url: string; title: string } | null>(null);

  useEffect(() => {
    fetchUser(userId);
  }, [userId]);

  const fetchUser = async (id: string) => {
    try {
      setLoading(true);
      const response = await api.get(`/admin/users/${id}`);
      if (response.data.success) {
        setUser(response.data.user);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to load user');
      onBack();
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (action: 'verify' | 'reject') => {
    setIsProcessing(true);
    try {
      if (action === 'verify') {
        const response = await api.put(`/admin/users/${userId}/verify`);
        if (response.data.success) toast.success('KYC verified successfully');
      } else {
        const reason = window.prompt('Please enter the reason for rejection:');
        if (reason === null) return;
        const response = await api.put(`/admin/users/${userId}/reject`, { reason });
        if (response.data.success) toast.success('Profile rejection email sent');
      }
      fetchUser(userId);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Action failed');
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-8 h-8 text-[#F24C20] animate-spin" />
        <p className="text-gray-400 text-sm font-medium">Loading user data...</p>
      </div>
    );
  }

  if (!user) return null;

  const kyc = user.kyc || {};
  const role = kyc.role ||
    (user.roles?.includes('investor') ? 'investor' :
      user.roles?.includes('freelancer') ? 'freelancer' :
        user.roles?.includes('client') ? 'client' : 'startup_creator');

  const kycDetails = user.profile?.kyc_details || user.kyc_details || {};
  const isVerified = verifiedKycStatuses.includes(String(user.kyc_status || '').toLowerCase()) || Boolean(kycDetails.is_verified);

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-black to-zinc-950 p-6">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between bg-zinc-900/50 backdrop-blur-sm rounded-2xl p-4 border border-zinc-800">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-all duration-200"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-lg font-bold text-white">KYC Review</h1>
              <p className="text-xs text-zinc-500">
                {user.full_name} • {userId.slice(-8).toUpperCase()}
              </p>
            </div>
          </div>
          <div className={`px-3 py-1.5 rounded-lg text-xs font-medium ${isVerified
            ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
            : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
            }`}>
            {isVerified ? 'Verified' : 'Pending Review'}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Main Content - 2 columns */}
          <div className="lg:col-span-2 space-y-6">




            {/* User Information */}
            <div className="bg-zinc-900/30 rounded-2xl border border-zinc-800 p-6">
              <div className="flex items-center gap-2 mb-6">
                <User className="w-4 h-4 text-blue-500" />
                <h3 className="text-sm font-semibold text-white">User Information</h3>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <InfoRow label="Full Name" value={user.full_name} />
                <InfoRow label="Email" value={user.email} />
                <InfoRow label="Phone" value={user.phone} />
                <InfoRow label="Role" value={role?.replace('_', ' ')} highlight />
              </div>
            </div>

            {/* Identity Documents */}
            <div className="bg-zinc-900/30 rounded-2xl border border-zinc-800 p-6">
              <div className="flex items-center gap-2 mb-6">
                <Fingerprint className="w-4 h-4 text-[#F24C20]" />
                <h3 className="text-sm font-semibold text-white">Identity Documents</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <DocumentCard
                  title="PAN Card"
                  label="Tax Identification"
                  path={kyc.id_proof?.pan_card || kycDetails.pan_card || kycDetails.pancard}
                  onPreview={(url) => setPreviewDoc({ url, title: 'PAN Card' })}
                />
                <DocumentCard
                  title="Aadhaar Card"
                  label="National ID"
                  path={kyc.id_proof?.aadhar_card || kycDetails.aadhar_card}
                  onPreview={(url) => setPreviewDoc({ url, title: 'Aadhaar Card' })}
                />
                <DocumentCard
                  title="Educational Documents"
                  label="Academic Records"
                  isArray
                  count={user.documents?.educational?.length || 0}
                  onPreview={(url) => setPreviewDoc({ url, title: 'Educational Document' })}
                />
                <DocumentCard
                  title="Experience Letter"
                  label="Professional Reference"
                  path={user.documents?.experience_letter}
                  onPreview={(url) => setPreviewDoc({ url, title: 'Experience Letter' })}
                />
              </div>
            </div>

            {/* Compliance Status */}
            <div className="bg-zinc-900/30 rounded-2xl border border-zinc-800 p-6">
              <div className="flex items-center gap-2 mb-6">
                <ShieldCheck className="w-4 h-4 text-purple-500" />
                <h3 className="text-sm font-semibold text-white">Compliance Status</h3>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <StatusNode label="NDA Signed" active={kyc.compliance?.nda_accepted} />
                <StatusNode label="Fraud Declaration" active={kyc.compliance?.fraud_declaration} />
                <StatusNode label="IP Declaration" active={kyc.compliance?.ip_declaration} />
              </div>
            </div>


          </div>

          {/* Sidebar - 1 column */}
          <div className="space-y-6">

            {/* Venture/Business Details */}
            {(kyc.startup_details?.startup_name || kyc.business_verification?.cin_number || kyc.financial_investor?.investor_type) && (
              <div className="bg-zinc-900/30 rounded-2xl border border-zinc-800 p-6">
                <div className="flex items-center gap-2 mb-6">
                  <Briefcase className="w-4 h-4 text-emerald-500" />
                  <h3 className="text-sm font-semibold text-white">Business Details</h3>
                </div>
                <div className="space-y-3">
                  {kyc.startup_details?.startup_name && <InfoRow label="Entity Name" value={kyc.startup_details.startup_name} />}
                  {kyc.business_verification?.cin_number && <InfoRow label="CIN Number" value={kyc.business_verification.cin_number} />}
                  {kyc.financial_investor?.investor_type && <InfoRow label="Investor Type" value={kyc.financial_investor.investor_type} />}
                </div>
              </div>
            )}

            {/* Additional Documents */}
            {(kyc.financial_investor?.bank_details?.cancelled_cheque ||
              kyc.startup_details?.pitch_deck ||
              kyc.financial_investor?.linkedin_profile ||
              kyc.business_verification?.inc_certificate) && (
                <div className="bg-zinc-900/30 rounded-2xl border border-zinc-800 p-6">
                  <div className="flex items-center gap-2 mb-6">
                    <FileText className="w-4 h-4 text-cyan-500" />
                    <h3 className="text-sm font-semibold text-white">Additional Documents</h3>
                  </div>
                  <div className="space-y-3">
                    {kyc.financial_investor?.bank_details?.cancelled_cheque && (
                      <DocumentCard
                        compact
                        title="Cancelled Cheque"
                        path={kyc.financial_investor.bank_details.cancelled_cheque}
                        onPreview={(url) => setPreviewDoc({ url, title: 'Cancelled Cheque' })}
                      />
                    )}
                    {kyc.startup_details?.pitch_deck && (
                      <DocumentCard
                        compact
                        title="Pitch Deck"
                        path={kyc.startup_details.pitch_deck}
                        onPreview={(url) => setPreviewDoc({ url, title: 'Pitch Deck' })}
                      />
                    )}
                    {kyc.financial_investor?.linkedin_profile && (
                      <DocumentCard
                        compact
                        title="LinkedIn Profile"
                        path={kyc.financial_investor.linkedin_profile}
                        onPreview={(url) => setPreviewDoc({ url, title: 'LinkedIn Profile' })}
                      />
                    )}
                    {kyc.business_verification?.inc_certificate && (
                      <DocumentCard
                        compact
                        title="Incorporation Certificate"
                        path={kyc.business_verification.inc_certificate}
                        onPreview={(url) => setPreviewDoc({ url, title: 'Incorporation Certificate' })}
                      />
                    )}
                  </div>
                </div>
              )}

            {/* Action Buttons */}
            <div className="bg-zinc-900/30 rounded-2xl border border-zinc-800 p-6 space-y-3">
              <button
                onClick={() => handleAction('verify')}
                disabled={isProcessing || isVerified}
                className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/20"
              >
                {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                Approve KYC
              </button>

              <button
                onClick={async () => {
                  setIsProcessing(true);
                  try {
                    const response = await api.put(`/admin/users/${userId}/suspend`);
                    if (response.data.success) {
                      toast.success(user.is_suspended ? 'Account Activated' : 'Account Blocked');
                      fetchUser(userId);
                    }
                  } catch (err: any) {
                    toast.error(err.response?.data?.message || 'Operation failed');
                  } finally {
                    setIsProcessing(false);
                  }
                }}
                disabled={isProcessing}
                title={!user.is_suspended ? "Restrict user access to the platform" : "Restore user access to the platform"}
                className={`w-full py-3 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 border ${
                  !user.is_suspended 
                  ? 'bg-amber-500/10 border-amber-500/20 text-amber-500 hover:bg-amber-500 hover:text-white' 
                  : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500 hover:bg-emerald-500 hover:text-white'
                }`}
              >
                <Ban className="w-4 h-4" />
                {!user.is_suspended ? 'Blocked User' : 'Restore Access'}
              </button>

              <button
                onClick={() => handleAction('reject')}
                disabled={isProcessing}
                className="w-full bg-red-500/10 hover:bg-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed text-red-500 py-3 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 border border-red-500/20"
              >
                <ShieldAlert className="w-4 h-4" />
                Reject KYC
              </button>

              <div className="pt-4 mt-4 border-t border-zinc-800">
                <button
                  onClick={async () => {
                    if (!window.confirm('PERMANENT DELETE: Are you absolutely sure? This user will be removed from the database.')) return;
                    setIsProcessing(true);
                    try {
                      const response = await api.delete(`/admin/users/${userId}`);
                      if (response.data.success) {
                        toast.success('User Permanently Deleted');
                        onBack();
                      }
                    } catch (err: any) {
                      toast.error(err.response?.data?.message || 'Deletion failed');
                    } finally {
                      setIsProcessing(false);
                    }
                  }}
                  disabled={isProcessing}
                  className="w-full bg-black hover:bg-zinc-950 text-red-800 hover:text-red-600 py-2 rounded-lg text-xs font-bold transition-all border border-red-900/30 flex items-center justify-center gap-2"
                >
                  <X className="w-3.5 h-3.5" />
                  Delete Permanently
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Document Preview Modal */}
        <AnimatePresence>
          {previewDoc && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setPreviewDoc(null)}
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative  max-w-5xl h-[85vh] bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden flex flex-col shadow-2xl"
              >
                <div className="flex items-center justify-between p-4 border-b border-zinc-800 bg-zinc-900">
                  <h3 className="font-medium text-white">{previewDoc.title}</h3>
                  <div className="flex gap-2">
                    <a
                      href={previewDoc.url}
                      download
                      className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-all"
                    >
                      <Download className="w-4 h-4" />
                    </a>
                    <button
                      onClick={() => setPreviewDoc(null)}
                      className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-all"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="flex-1 bg-black p-4 overflow-auto flex items-center justify-center">
                  {isPdf(previewDoc.url) ? (
                    <iframe
                      src={`${previewDoc.url}#toolbar=0`}
                      className="w-full h-full border-0 rounded-lg"
                      title="PDF Preview"
                    />
                  ) : (
                    <img
                      src={previewDoc.url}
                      alt="Document Preview"
                      className="max-w-full max-h-full object-contain rounded-lg"
                    />
                  )}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// Helper Components
function DocumentCard({ title, label, path, onPreview, isArray = false, count = 0, compact = false }: any) {
  const hasDoc = isArray ? count > 0 : !!path;
  const url = hasDoc && !isArray ? getFileUrl(path) : '';

  return (
    <div className={`p-4 rounded-xl border transition-all ${hasDoc
      ? 'bg-zinc-800/30 border-zinc-700 hover:border-[#F24C20]/50 cursor-pointer'
      : 'bg-zinc-800/10 border-zinc-800 opacity-50'
      }`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-zinc-400">{title}</span>
        {hasDoc && <div className="w-2 h-2 rounded-full bg-emerald-500" />}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${hasDoc ? 'bg-zinc-800' : 'bg-zinc-800/30'
            }`}>
            {hasDoc && !isArray && isImage(url) ? (
              <img src={url} className="w-full h-full rounded-lg object-cover" alt="Thumbnail" />
            ) : (
              <FileText className={`w-5 h-5 ${hasDoc ? 'text-[#F24C20]' : 'text-zinc-700'}`} />
            )}
          </div>
          <div>
            <p className="text-sm font-medium text-white">
              {hasDoc ? (isArray ? `${count} Document(s)` : 'Available') : 'Not Available'}
            </p>
            {!compact && label && (
              <p className="text-xs text-zinc-500">{label}</p>
            )}
          </div>
        </div>
        {hasDoc && (
          <button
            onClick={() => onPreview(url)}
            className="p-2 rounded-lg bg-zinc-800 hover:bg-[#F24C20] text-zinc-400 hover:text-white transition-all"
          >
            <Eye className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}

function StatusNode({ label, active }: { label: string; active: boolean }) {
  return (
    <div className={`p-3 rounded-xl text-center border transition-all ${active
      ? 'bg-emerald-500/10 border-emerald-500/20'
      : 'bg-red-500/5 border-red-500/10'
      }`}>
      <p className={`text-xs font-medium ${active ? 'text-emerald-500' : 'text-red-500/50'}`}>
        {label}
      </p>
      <p className={`text-sm font-semibold mt-1 ${active ? 'text-emerald-500' : 'text-red-500/50'}`}>
        {active ? 'Signed' : 'Pending'}
      </p>
    </div>
  );
}

function InfoRow({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex justify-between items-center p-3 rounded-lg bg-zinc-800/20 border border-zinc-800">
      <span className="text-xs text-zinc-500">{label}</span>
      <span className={`text-sm font-medium ${highlight ? 'text-[#F24C20]' : 'text-white'}`}>
        {value || '—'}
      </span>
    </div>
  );
}

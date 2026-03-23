import { motion, AnimatePresence } from 'motion/react';
import { X, FileText, CheckCircle, Ban, Loader2, ExternalLink, ShieldCheck, User, Briefcase } from 'lucide-react';
import { useState } from 'react';

interface KYCReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  onVerify: (userId: string) => Promise<void>;
  onReject: (userId: string) => Promise<void>;
}

export function KYCReviewModal({ isOpen, onClose, user, onVerify, onReject }: KYCReviewModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  if (!user) return null;

  const handleAction = async (action: 'verify' | 'reject') => {
    setIsProcessing(true);
    try {
      if (action === 'verify') {
        await onVerify(user._id);
      } else {
        await onReject(user._id);
      }
      onClose();
    } finally {
      setIsProcessing(false);
    }
  };

  const getFileUrl = (path: string) => {
    if (!path) return '';
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    return `${baseUrl}${path.startsWith('/') ? '' : '/'}${path}`;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-white dark:bg-[#1a1a1a] rounded-[2.5rem] w-full max-w-2xl max-h-[90vh] overflow-hidden border border-gray-200 dark:border-white/10 shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="p-8 border-b border-gray-100 dark:border-white/5 flex items-center justify-between bg-gray-50/50 dark:bg-white/[0.02]">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[#F24C20]/10 flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6 text-[#F24C20]" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#044071] dark:text-white">KYC Document Review</h3>
                  <p className="text-sm text-gray-500">Review identity & professional documents for {user.full_name}</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-gray-200 dark:hover:bg-white/10 rounded-xl transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-8 space-y-8">
              {/* Identity Section */}
              <section>
                <div className="flex items-center gap-2 mb-4 text-[#F24C20]">
                   <User className="w-5 h-5" />
                   <h4 className="font-bold uppercase tracking-wider text-xs">Identity Verification</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <DocumentCard 
                    title="PAN Card" 
                    path={user.kyc_details?.pancard} 
                    onView={() => window.open(getFileUrl(user.kyc_details?.pancard), '_blank')} 
                  />
                  <DocumentCard 
                    title="Aadhar Card" 
                    path={user.kyc_details?.aadhar_card} 
                    onView={() => window.open(getFileUrl(user.kyc_details?.aadhar_card), '_blank')} 
                  />
                </div>
              </section>

              {/* Professional Section */}
              <section>
                <div className="flex items-center gap-2 mb-4 text-[#044071] dark:text-blue-400">
                   <Briefcase className="w-5 h-5" />
                   <h4 className="font-bold uppercase tracking-wider text-xs">Professional Documentation</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <DocumentCard 
                    title="Educational Documents" 
                    isArray 
                    count={user.documents?.educational?.length || 0}
                    path={user.documents?.educational?.[0]} 
                    onView={() => user.documents?.educational?.forEach((doc: string) => window.open(getFileUrl(doc), '_blank'))} 
                  />
                  <DocumentCard 
                    title="Experience Letter" 
                    path={user.documents?.experience_letter} 
                    onView={() => window.open(getFileUrl(user.documents?.experience_letter), '_blank')} 
                  />
                </div>
              </section>

              {/* Status Warning */}
              {user.kyc_details?.is_verified ? (
                <div className="p-4 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <p className="text-sm text-green-600 font-medium">This user is already KYC verified.</p>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center gap-3 text-orange-600 text-sm">
                   <ShieldCheck className="w-5 h-5" />
                   Please ensure all documents match the user's registered name: <span className="font-bold">{user.full_name}</span>
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div className="p-8 border-t border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/[0.02] flex gap-4">
              <button
                onClick={() => handleAction('reject')}
                disabled={isProcessing}
                className="flex-1 px-6 py-4 rounded-2xl border border-red-200 dark:border-red-900/30 text-red-600 font-bold hover:bg-red-50 dark:hover:bg-red-900/10 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Ban className="w-5 h-5" />
                Reject Profile
              </button>
              <button
                onClick={() => handleAction('verify')}
                disabled={isProcessing || user.kyc_details?.is_verified}
                className="flex-1 px-6 py-4 rounded-2xl bg-[#044071] text-white font-bold hover:bg-[#05518f] transition-all shadow-xl shadow-[#044071]/20 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
                Approve {user.kyc_details?.is_verified ? 'Account' : 'KYC'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function DocumentCard({ title, path, onView, isArray = false, count = 0 }: any) {
  const hasDoc = isArray ? count > 0 : !!path;

  return (
    <div className={`p-4 rounded-2xl border ${hasDoc ? 'bg-white dark:bg-white/[0.03] border-gray-100 dark:border-white/10 shadow-sm' : 'bg-gray-50 dark:bg-white/[0.01] border-gray-100 dark:border-white/[0.05] opacity-60'}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{title}</span>
        {hasDoc ? (
          <span className="px-2 py-0.5 rounded-full bg-green-500/10 text-green-500 text-[10px] font-bold">Uploaded</span>
        ) : (
          <span className="px-2 py-0.5 rounded-full bg-gray-200 dark:bg-white/10 text-gray-500 text-[10px] font-bold">Missing</span>
        )}
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${hasDoc ? 'bg-[#F24C20]/10 text-[#F24C20]' : 'bg-gray-200 dark:bg-white/5 text-gray-400'}`}>
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-bold truncate max-w-[120px]">{isArray ? `${count} Documents` : hasDoc ? 'document.pdf' : 'No File'}</p>
            <p className="text-[10px] text-gray-500">{hasDoc ? 'Click to review' : 'User hasn\'t uploaded yet'}</p>
          </div>
        </div>
        {hasDoc && (
          <button 
            onClick={onView}
            className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg text-[#044071] dark:text-blue-400 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}

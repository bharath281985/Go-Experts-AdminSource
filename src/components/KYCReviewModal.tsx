import { motion, AnimatePresence } from 'motion/react';
import { X, FileText, CheckCircle, Ban, Loader2, ExternalLink, ShieldCheck, User, Briefcase, Landmark, Rocket, ShieldAlert } from 'lucide-react';
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

  const kyc = user.kyc || {};
  const isLegacy = !user.kyc;
  const role = kyc.role || (user.roles?.includes('investor') ? 'investor' : 'startup_creator');

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
    if (path.startsWith('http')) return path;
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
                  <h3 className="text-xl font-bold text-[#044071] dark:text-white uppercase tracking-tighter italic">Review Command</h3>
                  <p className="text-sm text-gray-500 font-bold uppercase tracking-widest text-[10px]">Verifying {role?.replace('_', ' ')}: {user.full_name}</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-gray-200 dark:hover:bg-white/10 rounded-xl transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
              
              {/* --- SECTION 1: IDENTITY & ID --- */}
              <section>
                <div className="flex items-center gap-2 mb-6 text-[#F24C20]">
                   <User className="w-5 h-5" />
                   <h4 className="font-black uppercase tracking-[0.2em] text-[10px]">Government Identity</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <DocumentCard 
                    title="PAN Card" 
                    path={kyc.id_proof?.pan_card || user.kyc_details?.pancard} 
                    onView={() => window.open(getFileUrl(kyc.id_proof?.pan_card || user.kyc_details?.pancard), '_blank')} 
                  />
                  <DocumentCard 
                    title="Aadhaar / ID Card" 
                    path={kyc.id_proof?.aadhar_card || user.kyc_details?.aadhar_card} 
                    onView={() => window.open(getFileUrl(kyc.id_proof?.aadhar_card || user.kyc_details?.aadhar_card), '_blank')} 
                  />
                   <DocumentCard 
                    title="Address Proof" 
                    path={kyc.address_proof?.document_url} 
                    onView={() => window.open(getFileUrl(kyc.address_proof?.document_url), '_blank')} 
                  />
                   <DocumentCard 
                    title="Passport / DL" 
                    path={kyc.id_proof?.passport || kyc.id_proof?.driving_license} 
                    onView={() => window.open(getFileUrl(kyc.id_proof?.passport || kyc.id_proof?.driving_license), '_blank')} 
                  />
                </div>
              </section>

              {/* --- SECTION 2: ROLE SPECIFIC DATA --- */}
              {role === 'investor' ? (
                <section>
                  <div className="flex items-center gap-2 mb-6 text-blue-500">
                    <Landmark className="w-5 h-5" />
                    <h4 className="font-black uppercase tracking-[0.2em] text-[10px]">Investor Financials</h4>
                  </div>
                  <div className="bg-gray-50 dark:bg-white/[0.02] p-6 rounded-[2rem] border border-gray-100 dark:border-white/5 space-y-4 mb-4">
                    <div className="flex justify-between items-center border-b border-gray-100 dark:border-white/5 pb-2">
                        <span className="text-[10px] font-bold text-gray-500 uppercase">Investor Type</span>
                        <span className="text-sm font-black text-[#044071] dark:text-blue-400 uppercase">{kyc.financial_investor?.investor_type?.replace('_', ' ')}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-gray-100 dark:border-white/5 pb-2">
                        <span className="text-[10px] font-bold text-gray-500 uppercase">Ticket Size</span>
                        <span className="text-sm font-black text-[#044071] dark:text-blue-400">{kyc.financial_investor?.ticket_size_range}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-gray-500 uppercase">Bank Acc</span>
                        <span className="text-sm font-black text-[#044071] dark:text-blue-400">{kyc.financial_investor?.bank_details?.account_number}</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <DocumentCard 
                      title="Cancelled Cheque" 
                      path={kyc.financial_investor?.bank_details?.cancelled_cheque} 
                      onView={() => window.open(getFileUrl(kyc.financial_investor?.bank_details?.cancelled_cheque), '_blank')} 
                    />
                     <DocumentCard 
                      title="Portfolio / LinkedIn" 
                      path={kyc.financial_investor?.linkedin_profile} 
                      onView={() => window.open(kyc.financial_investor?.linkedin_profile, '_blank')} 
                    />
                  </div>
                </section>
              ) : (
                <section>
                   <div className="flex items-center gap-2 mb-6 text-emerald-500">
                    <Rocket className="w-5 h-5" />
                    <h4 className="font-black uppercase tracking-[0.2em] text-[10px]">Startup Infrastructure</h4>
                  </div>
                  <div className="bg-gray-50 dark:bg-white/[0.02] p-6 rounded-[2rem] border border-gray-100 dark:border-white/5 space-y-4 mb-4">
                    <div className="flex justify-between items-center border-b border-gray-100 dark:border-white/5 pb-2">
                        <span className="text-[10px] font-bold text-gray-500 uppercase">Entity Name</span>
                        <span className="text-sm font-black text-emerald-500 uppercase">{kyc.startup_details?.startup_name}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-gray-500 uppercase">CIN Number</span>
                        <span className="text-sm font-black text-emerald-500">{kyc.business_verification?.cin_number}</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <DocumentCard 
                      title="Pitch Deck" 
                      path={kyc.startup_details?.pitch_deck} 
                      onView={() => window.open(getFileUrl(kyc.startup_details?.pitch_deck), '_blank')} 
                    />
                     <DocumentCard 
                      title="Inc. Certificate" 
                      path={kyc.business_verification?.inc_certificate} 
                      onView={() => window.open(getFileUrl(kyc.business_verification?.inc_certificate), '_blank')} 
                    />
                  </div>
                </section>
              )}

              {/* --- SECTION 3: COMPLIANCE --- */}
              <section>
                <div className="flex items-center gap-2 mb-6 text-purple-500">
                    <ShieldAlert className="w-5 h-5" />
                    <h4 className="font-black uppercase tracking-[0.2em] text-[10px]">Compliance & Declarations</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    <StatusChip label="NDA" active={kyc.compliance?.nda_accepted} />
                    <StatusChip label="Anti-Fraud" active={kyc.compliance?.fraud_declaration} />
                    <StatusChip label="IP Decl." active={kyc.compliance?.ip_declaration} />
                </div>
              </section>

              {/* Status Warning */}
              {user.kyc_status === 'fully_verified' ? (
                <div className="p-6 rounded-[2rem] bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-white">
                    <CheckCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm text-emerald-500 font-black uppercase italic tracking-tighter">Already Verified</p>
                    <p className="text-[10px] text-emerald-600/70 font-bold uppercase tracking-widest mt-0.5">Account has passed architecture review.</p>
                  </div>
                </div>
              ) : (
                <div className="p-6 rounded-[2rem] bg-orange-500/10 border border-orange-500/20 flex items-center gap-4 text-orange-600">
                   <ShieldAlert className="w-10 h-10" />
                   <div>
                     <p className="text-[10px] font-black uppercase tracking-[0.1em]">Verification Notice</p>
                     <p className="text-xs font-bold leading-relaxed mt-1 italic">Compare documents with user: <span className="bg-orange-500 text-white px-2 py-0.5 rounded ml-1 not-italic">{user.full_name}</span></p>
                   </div>
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div className="p-8 border-t border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/[0.02] flex gap-4">
              <button
                onClick={() => handleAction('reject')}
                disabled={isProcessing}
                className="flex-1 px-6 py-4 rounded-2xl border-2 border-red-500/10 text-red-500 font-black text-xs uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Ban className="w-5 h-5" />
                Reject
              </button>
              <button
                onClick={() => handleAction('verify')}
                disabled={isProcessing || user.kyc_status === 'fully_verified'}
                className="flex-1 px-6 py-4 rounded-2xl bg-[#F24C20] text-white font-black text-xs uppercase tracking-[0.2em] hover:bg-[#d43a12] transition-all shadow-xl shadow-[#F24C20]/20 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShieldCheck className="w-5 h-5" />}
                Approve Verified Status
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function StatusChip({ label, active }: { label: string, active: boolean }) {
    return (
        <div className={`px-4 py-2 rounded-xl border text-[9px] font-black uppercase tracking-widest text-center transition-all ${
            active ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500' : 'bg-red-500/5 border-red-500/10 text-red-500/40'
        }`}>
            {label}: {active ? 'YES' : 'NO'}
        </div>
    );
}

function DocumentCard({ title, path, onView, isArray = false, count = 0 }: any) {
  const hasDoc = isArray ? count > 0 : !!path;

  return (
    <div className={`p-4 rounded-[1.5rem] border-2 transition-all group ${
        hasDoc ? 'bg-white dark:bg-white/[0.03] border-gray-100 dark:border-white/5 shadow-sm hover:border-[#F24C20]/30' : 
        'bg-gray-50 dark:bg-white/[0.01] border-dashed border-gray-200 dark:border-white/[0.05] opacity-60'
    }`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{title}</span>
        {hasDoc && (
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        )}
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
              hasDoc ? 'bg-[#F24C20]/10 text-[#F24C20] group-hover:scale-110' : 'bg-gray-200 dark:bg-white/5 text-gray-400'
          }`}>
            <FileText className="w-5 h-5" />
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-black truncate max-w-[100px] uppercase tracking-tighter">
                {isArray ? `${count} DOCS` : hasDoc ? 'ENCRYPTED_FILE' : 'MISSING'}
            </p>
            <p className="text-[9px] font-bold text-gray-500 uppercase">
                {hasDoc ? 'SECURE_REVIEW' : 'NOT_UPLOADED'}
            </p>
          </div>
        </div>
        {hasDoc && (
          <button 
            onClick={onView}
            className="p-2 hover:bg-[#F24C20] hover:text-white rounded-xl text-neutral-400 transition-all"
          >
            <ExternalLink className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}

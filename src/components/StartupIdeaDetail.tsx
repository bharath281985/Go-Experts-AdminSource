import React, { useMemo, useState, useEffect } from "react";
import { 
  ArrowLeft, 
  Rocket, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  ShieldCheck, 
  FileText, 
  TrendingUp, 
  Users, 
  Target, 
  CheckCircle, 
  XCircle,
  Download,
  Eye,
  DollarSign,
  AlertCircle,
  Clock
} from 'lucide-react';
import api from '../lib/api';
import { toast } from 'sonner';

const statusOptions = [
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
];

const statusStyles: any = {
  pending: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  approved: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  rejected: "bg-red-500/15 text-red-300 border-red-500/30"
};

interface Props {
  ideaId: string;
  onBack: () => void;
}

export function StartupIdeaDetail({ ideaId, onBack }: Props) {
  const [idea, setIdea] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [internalNote, setInternalNote] = useState("");
  const [status, setStatus] = useState("pending");

  useEffect(() => {
    fetchIdeaDetails();
  }, [ideaId]);

  const fetchIdeaDetails = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/admin/startup-ideas/${ideaId}`);
      if (res.data.success) {
        setIdea(res.data.data);
        setStatus(res.data.data.status);
        setInternalNote(res.data.data.internalNotes || "");
      }
    } catch (error) {
      toast.error('Failed to fetch idea details');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (nextStatus?: string) => {
    try {
      setSubmitting(true);
      const payload: any = { internalNotes: internalNote };
      if (nextStatus) payload.status = nextStatus;
      
      const res = await api.put(`/admin/startup-ideas/${ideaId}/status`, payload);
      if (res.data.success) {
        toast.success(`Information updated successfully`);
        if (nextStatus) setStatus(nextStatus);
        setIdea(res.data.data);
      }
    } catch (error) {
      toast.error('Failed to update information');
    } finally {
      setSubmitting(false);
    }
  };

  const badgeClass = useMemo(
    () => statusStyles[status] || "bg-slate-500/15 text-slate-300 border-slate-500/30",
    [status]
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] space-y-4">
        <div className="w-12 h-12 border-4 border-[#F24C20] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-500 font-medium animate-pulse">Reviewing Concept Analytics...</p>
      </div>
    );
  }

  if (!idea) return <div className="text-center py-20 text-white">Idea not found</div>;

  return (
    <div className="max-w-[1300px] mx-auto space-y-10 pb-20 px-6">
      {/* Top Navigation & Status Bar */}
      <div className="mt-6">
          <button 
              onClick={onBack}
              className="flex items-center gap-3 text-slate-400 hover:text-white transition-all group mb-8 px-4 py-2 rounded-xl hover:bg-white/5 w-fit"
          >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span className="text-[11px] font-black uppercase tracking-widest">Return to Concept Registry</span>
          </button>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-gradient-to-br from-[#0b0d14] to-[#161b22] p-10 shadow-2xl"
          >
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#F24C20]/10 rounded-full blur-[100px] -mr-32 -mt-32" />
            
            <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-10">
                <div className="max-w-3xl">
                    <div className="inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-orange-400 mb-6">
                        <Rocket className="w-3.5 h-3.5" /> Concept Verification Protocol
                    </div>
                    <h1 className="text-3xl md:text-4xl font-semibold text-white tracking-tight leading-tight">{idea.title}</h1>
                    <p className="mt-4 text-slate-400 text-sm leading-relaxed font-medium italic opacity-80">
                        "{idea.shortDescription}"
                    </p>
                </div>

                <div className="flex flex-col items-start lg:items-end gap-4 min-w-[200px]">
                    <div className={`px-6 py-2.5 rounded-xl border text-[10px] font-black uppercase tracking-[0.2em] shadow-lg ${badgeClass}`}>
                        {status}
                    </div>
                    <div className="flex flex-col lg:items-end opacity-60">
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">ID: {idea._id.slice(-12).toUpperCase()}</span>
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Submitted {new Date(idea.createdAt).toLocaleDateString(undefined, { dateStyle: 'long' })}</span>
                    </div>
                </div>
            </div>
          </motion.div>
      </div>

      <div className="grid gap-10 xl:grid-cols-12">
          {/* Main Intelligence Grid */}
          <div className="xl:col-span-8 space-y-10">
            <InfoCard title="Executive Identity Matrix" icon={<User className="w-4 h-4" />}>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Founder Principal" value={idea.creator?.full_name} icon={<User className="w-3.5 h-3.5" />} />
                <Field label="Communication Channel" value={idea.creator?.email} icon={<Mail className="w-3.5 h-3.5" />} />
                <Field label="Secure Line" value={idea.creator?.phone_number} icon={<Phone className="w-3.5 h-3.5" />} />
                <Field label="Geographic Locus" value={idea.creator?.location || "Global Jurisdiction"} icon={<MapPin className="w-3.5 h-3.5" />} />
                <Field label="Authorized Roles" value={idea.creator?.roles?.join(' & ')} icon={<ShieldCheck className="w-3.5 h-3.5" />} />
                <Field label="Industry Vertical" value={idea.category} icon={<Target className="w-3.5 h-3.5" />} />
              </div>
            </InfoCard>

            <InfoCard title="Strategic Vision Abstract" icon={<Eye className="w-4 h-4" />}>
                <div className="rounded-[2rem] border border-white/5 bg-white/[0.02] p-8">
                    <div className="text-[10px] uppercase tracking-[0.2em] text-[#F24C20] font-black mb-6 opacity-80">Detailed Conceptual Vision</div>
                    <div className="text-base leading-9 text-slate-300 whitespace-pre-wrap font-medium">{idea.detailedDescription}</div>
                </div>
            </InfoCard>

            <div className="grid md:grid-cols-2 gap-8">
                <InfoCard title="Identified Friction" icon={<AlertCircle className="w-4 h-4 text-red-400" />}>
                    <div className="text-sm leading-8 text-slate-400 font-medium italic">"{idea.problem}"</div>
                </InfoCard>
                <InfoCard title="Linguistic Solution" icon={<CheckCircle className="w-4 h-4 text-emerald-400" />}>
                    <div className="text-sm leading-8 text-slate-400 font-medium italic">"{idea.solution}"</div>
                </InfoCard>
            </div>

            <InfoCard title="Market & Competitive Landscape" icon={<TrendingUp className="w-4 h-4" />}>
              <div className="space-y-8">
                <Field label="Unique Value Proposition (UVP)" value={idea.uniqueness} className="bg-gradient-to-r from-[#F24C20]/5 to-transparent border-l-4 border-l-[#F24C20]" />
                <div className="grid sm:grid-cols-2 gap-6">
                    <Field label="Target Demographic" value={idea.targetAudience} />
                    <Field label="Total Addressable Market (TAM)" value={idea.marketSize} />
                </div>
                <Field label="Competitive Intelligence Analysis" value={idea.competitorAnalysis} />
              </div>
            </InfoCard>

            <InfoCard title="Capital Allocation & Trajectory" icon={<DollarSign className="w-4 h-4" />}>
              <div className="space-y-8">
                <div className="grid md:grid-cols-2 gap-8">
                    <div className="p-8 rounded-[2.5rem] bg-[#F24C20]/10 border border-[#F24C20]/20 flex flex-col justify-center">
                        <div className="text-[10px] font-black uppercase tracking-[0.2em] text-[#F24C20] mb-3">Funding Target</div>
                        <div className="text-4xl font-semibold text-white tracking-tighter">{idea.fundingAmount || "$0 (Bootstrapped)"}</div>
                    </div>
                    <Field label="Deployment Strategy" value={idea.useOfFunds} />
                </div>
                <div className="rounded-[2rem] border border-white/5 bg-white/[0.02] p-8">
                    <div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400 mb-4">Strategic Milestones</div>
                    <div className="text-sm leading-8 text-slate-300 font-medium">{idea.milestones}</div>
                </div>
              </div>
            </InfoCard>
          </div>

          {/* Action & Metadata Sidebar */}
          <div className="xl:col-span-4 space-y-10">
            <InfoCard title="Protocol Control" icon={<ShieldCheck className="w-4 h-4" />}>
              <div className="space-y-6">
                <div>
                  <span className="mb-3 block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 text-center">Status Deployment</span>
                  <div className="relative">
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className="w-full rounded-2xl border border-white/10 bg-[#161b22] px-6 py-4 text-sm font-bold text-white outline-none focus:border-[#F24C20] transition-all appearance-none cursor-pointer"
                    >
                      {statusOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label.toUpperCase()}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    onClick={() => handleUpdate("approved")}
                    disabled={submitting}
                    className="w-full rounded-2xl bg-emerald-600 px-6 py-4 text-[11px] font-black uppercase tracking-[0.2em] text-white transition hover:bg-emerald-500 shadow-xl shadow-emerald-500/20 disabled:opacity-50"
                  >
                    Authorize Concept
                  </motion.button>
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    onClick={() => handleUpdate("rejected")}
                    disabled={submitting}
                    className="w-full rounded-2xl bg-red-600/10 border border-red-600/30 px-6 py-4 text-[11px] font-black uppercase tracking-[0.2em] text-red-500 transition hover:bg-red-600 hover:text-white disabled:opacity-50"
                  >
                    Reject concept
                  </motion.button>
                </div>
              </div>
            </InfoCard>

            <InfoCard title="Intelligence Findings" icon={<FileText className="w-4 h-4" />}>
              <textarea
                rows={5}
                value={internalNote}
                onChange={(e) => setInternalNote(e.target.value)}
                placeholder="Compose internal review findings here..."
                className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-5 text-sm font-medium text-white outline-none transition placeholder:text-slate-600 focus:border-[#F24C20] leading-relaxed resize-none"
              />
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={() => handleUpdate()}
                disabled={submitting}
                className="mt-4 w-full rounded-2xl bg-[#044071] px-6 py-4 text-[11px] font-black uppercase tracking-[0.2em] text-white transition hover:bg-[#0a5ea3] shadow-xl shadow-[#044071]/20 disabled:opacity-50"
              >
                {submitting ? "Syncing..." : "Commit Findings"}
              </motion.button>
            </InfoCard>

            <InfoCard title="Compliance Registry" icon={<ShieldCheck className="w-4 h-4" />}>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-5 rounded-2xl bg-white/[0.02] border border-white/5">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-500/10 rounded-xl">
                            <ShieldCheck className="w-4 h-4 text-blue-500" />
                        </div>
                        <span className="text-[11px] font-black uppercase tracking-widest text-slate-400">NDA Required</span>
                    </div>
                    <span className={`text-[11px] font-black uppercase tracking-[0.2em] ${idea.ndaRequired === 'Yes' ? 'text-emerald-400' : 'text-slate-500'}`}>
                        {idea.ndaRequired || "NO"}
                    </span>
                </div>

                {idea.signedNDA ? (
                    <div className="group border border-emerald-500/20 bg-emerald-500/5 rounded-[2rem] p-6 text-center">
                        <div className="w-14 h-14 bg-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <FileText className="w-7 h-7 text-emerald-500" />
                        </div>
                        <div className="text-[11px] font-black text-emerald-400 uppercase tracking-widest mb-6">Legal Verification Verified</div>
                        <a 
                            href={`${api.defaults.baseURL?.replace('/api', '')}${idea.signedNDA}`}
                            target="_blank" rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2 w-full py-4 bg-white text-black rounded-xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-[#F24C20] hover:text-white transition-all shadow-xl shadow-black/20"
                        >
                            <Download className="w-4 h-4" /> Inspect Protocol
                        </a>
                    </div>
                ) : (
                    <div className="p-10 rounded-[2rem] bg-white/[0.02] border border-dashed border-white/10 text-center">
                        <AlertCircle className="w-10 h-10 text-slate-600 mx-auto mb-4" />
                        <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Document Missing</div>
                    </div>
                )}
              </div>
            </InfoCard>

            <InfoCard title="Ecosystem Impact" icon={<TrendingUp className="w-4 h-4" />}>
                <div className="grid grid-cols-2 gap-4">
                    <div className="p-6 rounded-[2rem] border border-white/5 bg-white/[0.02] text-center">
                        <Eye className="w-5 h-5 text-blue-400 mx-auto mb-3" />
                        <div className="text-3xl font-semibold text-white tracking-tighter">{idea.views || 0}</div>
                        <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-1">Ecosystem Views</div>
                    </div>
                    <div className="p-6 rounded-[2rem] border border-white/5 bg-white/[0.02] text-center">
                        <Users className="w-5 h-5 text-purple-400 mx-auto mb-3" />
                        <div className="text-3xl font-semibold text-white tracking-tighter">{idea.contacts?.length || 0}</div>
                        <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-1">Direct Inquiries</div>
                    </div>
                </div>
            </InfoCard>
          </div>
      </div>
    </div>
  );
}

function InfoCard({ title, children, className = "" }: any) {
  return (
    <div className={`rounded-[32px] border border-white/10 bg-[#0b0d14] p-6 shadow-2xl shadow-black/30 ${className}`}>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-1.5 h-5 bg-[#F24C20] rounded-full" />
        <h3 className="text-sm font-black text-white uppercase tracking-widest">{title}</h3>
      </div>
      <div>{children}</div>
    </div>
  );
}

function Field({ label, value, icon, className = "" }: any) {
  return (
    <div className={`rounded-2xl border border-white/10 bg-white/5 p-4 transition-all hover:bg-white/[0.07] ${className}`}>
      <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-[#F24C20] font-bold mb-2">
        {icon} {label}
      </div>
      <div className="text-sm leading-6 text-slate-200 font-medium">{value || "-"}</div>
    </div>
  );
}

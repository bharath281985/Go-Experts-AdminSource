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
    <div className="min-h-screen bg-[#05060a] text-white -mt-6 -mx-6 p-6 lg:p-10">
      <div className="mx-auto max-w-7xl">
        {/* Top Navigation */}
        <div className="mb-8">
            <button 
                onClick={onBack}
                className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors group mb-6"
            >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                Back to Dashboard
            </button>

            <div className="flex flex-col gap-5 rounded-[32px] border border-white/10 bg-gradient-to-r from-[#F24C20]/10 via-white/[0.03] to-blue-500/10 p-8 shadow-2xl shadow-black/20 lg:flex-row lg:items-center lg:justify-between">
            <div>
                <div className="inline-flex items-center rounded-full border border-orange-500/30 bg-orange-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-orange-300">
                Admin Panel • Idea Verification
                </div>
                <h1 className="mt-4 text-3xl font-bold sm:text-4xl tracking-tight">{idea.title}</h1>
                <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300 sm:text-base">
                Reviewing the complete startup concept submission, verifying legal compliance, and assessing market visibility.
                </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col lg:items-end">
                <div className={`inline-flex items-center rounded-full border px-4 py-2 text-sm font-bold uppercase tracking-widest ${badgeClass}`}>
                    {status}
                </div>
                <div className="text-xs font-mono text-slate-500">REF-ID: {idea._id.slice(-8).toUpperCase()}</div>
                <div className="text-xs text-slate-400">Submitted: {new Date(idea.createdAt).toLocaleDateString()}</div>
            </div>
            </div>
        </div>

        <div className="grid gap-8 xl:grid-cols-[1.7fr,0.95fr]">
          <div className="space-y-8">
            <InfoCard title="Founder & Location Info">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <Field label="Founder Name" value={idea.creator?.full_name} icon={<User className="w-3.5 h-3.5" />} />
                <Field label="Email Address" value={idea.creator?.email} icon={<Mail className="w-3.5 h-3.5" />} />
                <Field label="Contact Phone" value={idea.creator?.phone_number} icon={<Phone className="w-3.5 h-3.5" />} />
                <Field label="Target Location" value={idea.creator?.location || "Global"} icon={<MapPin className="w-3.5 h-3.5" />} />
                <Field label="User Profile" value={idea.creator?.roles?.join(' & ')} icon={<Users className="w-3.5 h-3.5" />} />
                <Field label="Category" value={idea.category} icon={<Rocket className="w-3.5 h-3.5" />} />
              </div>
            </InfoCard>

            <InfoCard title="Concept Abstract">
                <div className="space-y-6">
                    <Field label="Executive Summary" value={idea.shortDescription} />
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                        <div className="text-xs uppercase tracking-widest text-[#F24C20] font-bold mb-3">Detailed Vision</div>
                        <div className="text-sm leading-8 text-slate-200 whitespace-pre-wrap">{idea.detailedDescription}</div>
                    </div>
                </div>
            </InfoCard>

            <InfoCard title="Problem & Solution Matrix">
              <div className="grid gap-6">
                <div className="grid md:grid-cols-2 gap-4">
                    <Field label="Identified Problem" value={idea.problem} className="border-red-500/20 bg-red-500/5" />
                    <Field label="Proposed Solution" value={idea.solution} className="border-emerald-500/20 bg-emerald-500/5" />
                </div>
                <Field label="Product Uniqueness (USP)" value={idea.uniqueness} />
                <div className="grid md:grid-cols-2 gap-4">
                    <Field label="Target Audience" value={idea.targetAudience} />
                    <Field label="Market Opportunity" value={idea.marketSize} />
                </div>
                <Field label="Competitor Analysis" value={idea.competitorAnalysis} />
              </div>
            </InfoCard>

            <InfoCard title="Business Execution & Funding">
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                    <div className="p-6 rounded-[24px] bg-gradient-to-br from-blue-600/20 to-blue-900/20 border border-blue-500/30">
                        <div className="text-xs font-bold uppercase tracking-wider text-blue-400 mb-2">Funding Goal</div>
                        <div className="text-3xl font-black text-white">{idea.fundingAmount || "No Funding Sought"}</div>
                    </div>
                    <Field label="Primary Use of Funds" value={idea.useOfFunds} />
                </div>
                <Field label="Upcoming Milestones" value={idea.milestones} />
              </div>
            </InfoCard>
          </div>

          <div className="space-y-8">
            <InfoCard title="Decisive Action Panel">
              <div className="space-y-6">
                <div>
                  <span className="mb-3 block text-sm font-bold text-slate-300 uppercase tracking-wider">Update Current Status</span>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-[#0d1117] px-4 py-4 text-white outline-none focus:border-[#F24C20] transition-colors appearance-none cursor-pointer"
                  >
                    {statusOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleUpdate("approved")}
                    disabled={submitting}
                    className="rounded-2xl bg-emerald-600 px-4 py-4 text-sm font-bold text-white transition hover:bg-emerald-500 shadow-lg shadow-emerald-500/20 disabled:opacity-50"
                  >
                    Approve Live
                  </button>
                  <button
                    onClick={() => handleUpdate("rejected")}
                    disabled={submitting}
                    className="rounded-2xl bg-red-600 px-4 py-4 text-sm font-bold text-white transition hover:bg-red-500 shadow-lg shadow-red-500/20 disabled:opacity-50"
                  >
                    Reject Idea
                  </button>
                  <button
                    onClick={() => handleUpdate("pending")}
                    disabled={submitting}
                    className="col-span-2 rounded-2xl border border-amber-500/30 bg-amber-500/5 px-4 py-4 text-sm font-bold text-amber-300 transition hover:bg-amber-500/10"
                  >
                    Return to Pending
                  </button>
                </div>
              </div>
            </InfoCard>

            <InfoCard title="Internal Review Notes">
              <textarea
                rows={6}
                value={internalNote}
                onChange={(e) => setInternalNote(e.target.value)}
                placeholder="Compose internal review findings here..."
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-white outline-none transition placeholder:text-slate-600 focus:border-[#F24C20] leading-relaxed"
              />
              <button
                onClick={() => handleUpdate()}
                disabled={submitting}
                className="mt-4 w-full rounded-2xl bg-[#F24C20] px-5 py-4 text-sm font-bold text-white transition hover:bg-orange-600 shadow-lg shadow-[#F24C20]/20 disabled:opacity-50"
              >
                {submitting ? "Synchronizing..." : "Save Internal Findings"}
              </button>
            </InfoCard>

            <InfoCard title="Legal Compliance">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-500/10 rounded-lg">
                            <ShieldCheck className="w-5 h-5 text-blue-500" />
                        </div>
                        <span className="text-sm font-bold">NDA Mandatory</span>
                    </div>
                    <span className={`text-sm font-black uppercase ${idea.ndaRequired === 'Yes' ? 'text-emerald-400' : 'text-slate-500'}`}>
                        {idea.ndaRequired}
                    </span>
                </div>

                {idea.signedNDA ? (
                    <div className="group border border-emerald-500/20 bg-emerald-500/5 rounded-2xl p-5">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 bg-emerald-500/20 rounded-xl">
                                <FileText className="w-6 h-6 text-emerald-500" />
                            </div>
                            <div>
                                <div className="text-sm font-bold">Signed NDA Document</div>
                                <div className="text-[10px] text-emerald-400 font-bold tracking-tighter uppercase">Legal Verification Present</div>
                            </div>
                        </div>
                        <a 
                            href={`${api.defaults.baseURL?.replace('/api', '')}${idea.signedNDA}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2 w-full py-3 bg-white text-black rounded-xl font-bold text-xs hover:bg-[#F24C20] hover:text-white transition-all shadow-xl shadow-black/20"
                        >
                            <Download className="w-4 h-4" />
                            Inspect Signed PDF
                        </a>
                    </div>
                ) : (
                    <div className="p-6 rounded-2xl bg-white/5 border border-dashed border-white/10 text-center">
                        <AlertCircle className="w-8 h-8 text-slate-500 mx-auto mb-3" />
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">No Signed Document Provided</div>
                        <p className="text-[10px] text-slate-500 mt-2">The creator has not yet uploaded the required legal paperwork.</p>
                    </div>
                )}
              </div>
            </InfoCard>

            <InfoCard title="Impact Analytics">
                <div className="grid grid-cols-2 gap-4">
                    <div className="p-5 rounded-2xl border border-white/10 bg-white/5 text-center">
                        <Eye className="w-5 h-5 text-blue-400 mx-auto mb-2" />
                        <div className="text-2xl font-black">{idea.views || 0}</div>
                        <div className="text-[10px] font-bold text-slate-500 uppercase">Ecosystem Views</div>
                    </div>
                    <div className="p-5 rounded-2xl border border-white/10 bg-white/5 text-center">
                        <TrendingUp className="w-5 h-5 text-purple-400 mx-auto mb-2" />
                        <div className="text-2xl font-black">{idea.contacts?.length || 0}</div>
                        <div className="text-[10px] font-bold text-slate-500 uppercase">Investor Inquiries</div>
                    </div>
                </div>
            </InfoCard>

            {idea.tags && idea.tags.length > 0 && (
                <InfoCard title="Concept Tags">
                    <div className="flex flex-wrap gap-2">
                        {idea.tags.map((tag: string) => (
                        <span key={tag} className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                            {tag}
                        </span>
                        ))}
                    </div>
                </InfoCard>
            )}
          </div>
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

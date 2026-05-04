import { useState, useEffect } from 'react';
import axios from 'axios';
import { Briefcase, Calendar, User, Search, Filter } from 'lucide-react';
import { toast } from 'sonner';

export function InvestorMeetingsManagement() {
  const [meetings, setMeetings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const apiUrl = import.meta.env.VITE_API_URL || 'https://backendapis.goexperts.in';

  useEffect(() => {
    fetchMeetings();
  }, []);

  const fetchMeetings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await axios.get(`${apiUrl}/api/admin/meetings`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setMeetings(res.data.data);
      }
    } catch (error) {
      toast.error('Failed to fetch meetings');
    } finally {
      setLoading(false);
    }
  };

  const filteredMeetings = meetings.filter(m => 
    m.investor?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.founder?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.startup_idea?.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-[1300px] mx-auto space-y-8 pb-16 px-6">
      {/* Header - Professional Alignment */}
      <div className="flex items-center justify-between border-b border-gray-100 dark:border-[#262626] pb-6 mt-4">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold text-[#044071] dark:text-white mb-1">Investor Meetings</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm font-medium italic opacity-70">"Strategic coordination of capital engagements and concept discovery sessions."</p>
        </div>
      </div>

      <div className="bg-white dark:bg-[#1a1a1a] rounded-[2rem] border border-gray-100 dark:border-[#262626] overflow-hidden shadow-sm">
        <div className="p-4 border-b border-gray-50 dark:border-[#262626]">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
            <input
              type="text"
              placeholder="Filter engagements by investor, founder or concept..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-transparent bg-gray-50/50 dark:bg-[#262626] focus:bg-white dark:focus:bg-[#1a1a1a] focus:ring-2 focus:ring-[#F24C20]/20 transition-all outline-none text-sm font-medium"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-[#262626]">
              <tr>
                <th className="px-8 py-5 text-[11px] font-bold uppercase tracking-wider text-gray-500">Investor Entity</th>
                <th className="px-8 py-5 text-[11px] font-bold uppercase tracking-wider text-gray-500">Founder Lead</th>
                <th className="px-8 py-5 text-[11px] font-bold uppercase tracking-wider text-gray-500">Target Concept</th>
                <th className="px-8 py-5 text-[11px] font-bold uppercase tracking-wider text-gray-500 text-center">Temporal Locus</th>
                <th className="px-8 py-5 text-[11px] font-bold uppercase tracking-wider text-gray-500 text-center">Modality</th>
                <th className="px-8 py-5 text-[11px] font-bold uppercase tracking-wider text-gray-500 text-center">Protocol Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-[#262626]">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-8 py-6"><div className="h-4 bg-gray-100 dark:bg-[#262626] rounded w-32" /></td>
                    <td className="px-8 py-6"><div className="h-4 bg-gray-100 dark:bg-[#262626] rounded w-32" /></td>
                    <td className="px-8 py-6"><div className="h-4 bg-gray-100 dark:bg-[#262626] rounded w-48" /></td>
                    <td className="px-8 py-6"><div className="h-4 bg-gray-100 dark:bg-[#262626] rounded w-24 mx-auto" /></td>
                    <td className="px-8 py-6"><div className="h-4 bg-gray-100 dark:bg-[#262626] rounded w-16 mx-auto" /></td>
                    <td className="px-8 py-6"><div className="h-4 bg-gray-100 dark:bg-[#262626] rounded w-20 mx-auto" /></td>
                  </tr>
                ))
              ) : filteredMeetings.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center">
                      <Calendar className="w-12 h-12 text-gray-100 mb-3" />
                      <p className="text-gray-400 font-semibold tracking-tight">No semantic matches found in registry.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredMeetings.map((m) => (
                  <tr key={m._id} className="hover:bg-gray-50/30 dark:hover:bg-white/5 transition-all">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center border border-blue-100/50">
                          <User className="w-4 h-4 text-blue-600" />
                        </div>
                        <span className="text-sm font-bold text-gray-800 dark:text-gray-200 tracking-tight">{m.investor?.full_name}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center border border-orange-100/50">
                          <User className="w-4 h-4 text-[#F24C20]" />
                        </div>
                        <span className="text-sm font-bold text-gray-800 dark:text-gray-200 tracking-tight">{m.founder?.full_name}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-gray-800 dark:text-gray-200 tracking-tight line-clamp-1">{m.startup_idea?.title}</span>
                        <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-0.5 opacity-70">Concept Asset</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <div className="flex flex-col items-center">
                        <span className="text-sm font-bold text-[#044071] dark:text-blue-400 tracking-tight">
                          {new Date(m.meeting_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </span>
                        <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-0.5">
                          {new Date(m.meeting_date).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <span className="inline-block px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-lg bg-purple-50 text-purple-600 border border-purple-100">
                        {m.mode}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <span className={`inline-block px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] rounded-full border ${
                        m.status === 'scheduled' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                        m.status === 'completed' ? 'bg-green-50 text-green-600 border-green-100' :
                        'bg-red-50 text-red-600 border-red-100'
                      }`}>
                        {m.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="p-6 bg-gray-50/50 dark:bg-gray-900/50 border-t border-gray-50 dark:border-[#262626] flex justify-between items-center">
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Protocol Registry System v1.0</span>
          <span className="text-[10px] font-black text-[#F24C20] uppercase tracking-widest bg-orange-50 px-3 py-1 rounded-full">
            {filteredMeetings.length} of {meetings.length} Sessions Logged
          </span>
        </div>
      </div>
    </div>
  );
}

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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-3xl font-bold dark:text-white mb-1">Investor Meetings</h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm">Manage and track all scheduled meetings between investors and founders.</p>
        </div>
      </div>

      <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl border border-gray-200 dark:border-[#262626] p-6 space-y-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by investor, founder or idea..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-[#262626] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F24C20] dark:text-white text-gray-900 placeholder:text-gray-500"
          />
        </div>

        <div className="overflow-x-auto -mx-6 px-6">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-200 dark:border-[#262626] bg-gray-50 dark:bg-[#0a0a0a]">
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-gray-300 whitespace-nowrap">Investor</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-gray-300 whitespace-nowrap">Founder</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-gray-300 whitespace-nowrap">Idea</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 dark:text-gray-300 whitespace-nowrap">Date & Time</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 dark:text-gray-300 whitespace-nowrap">Mode</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 dark:text-gray-300 whitespace-nowrap">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-[#262626]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">Loading...</td>
                </tr>
              ) : filteredMeetings.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">No meetings found</td>
                </tr>
              ) : (
                filteredMeetings.map((m) => (
                  <tr key={m._id} className="hover:bg-gray-50 dark:hover:bg-[#262626]/50 transition-colors">
                    <td className="px-6 py-4 align-middle">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                          <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <span className="text-sm font-medium dark:text-gray-200 text-gray-900">{m.investor?.full_name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 align-middle">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center flex-shrink-0">
                          <User className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                        </div>
                        <span className="text-sm font-medium dark:text-gray-200 text-gray-900">{m.founder?.full_name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 align-middle">
                      <span className="text-sm dark:text-gray-400 text-gray-700 line-clamp-2">{m.startup_idea?.title}</span>
                    </td>
                    <td className="px-6 py-4 align-middle text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-2 text-sm dark:text-gray-400 text-gray-700">
                        <Calendar className="w-4 h-4 flex-shrink-0" />
                        {new Date(m.meeting_date).toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 align-middle text-center">
                      <span className="inline-block px-3 py-1 text-xs font-medium rounded-full bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 whitespace-nowrap border border-purple-200 dark:border-purple-900/30">
                        {m.mode}
                      </span>
                    </td>
                    <td className="px-6 py-4 align-middle text-center">
                      <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full whitespace-nowrap border ${
                        m.status === 'scheduled' ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-900/30' :
                        m.status === 'completed' ? 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/30' :
                        'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-900/30'
                      }`}>
                        {m.status?.charAt(0).toUpperCase() + m.status?.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold dark:text-white">Investor Meetings</h2>
          <p className="text-gray-500 dark:text-gray-400">Manage and track all scheduled meetings between investors and founders.</p>
        </div>
      </div>

      <div className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-gray-200 dark:border-[#262626] p-4">
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by investor, founder or idea..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-[#262626] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F24C20] dark:text-white"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-200 dark:border-[#262626]">
                <th className="px-4 py-3 text-sm font-semibold dark:text-gray-300">Investor</th>
                <th className="px-4 py-3 text-sm font-semibold dark:text-gray-300">Founder</th>
                <th className="px-4 py-3 text-sm font-semibold dark:text-gray-300">Idea</th>
                <th className="px-4 py-3 text-sm font-semibold dark:text-gray-300">Date & Time</th>
                <th className="px-4 py-3 text-sm font-semibold dark:text-gray-300">Mode</th>
                <th className="px-4 py-3 text-sm font-semibold dark:text-gray-300">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-[#262626]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">Loading...</td>
                </tr>
              ) : filteredMeetings.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">No meetings found</td>
                </tr>
              ) : (
                filteredMeetings.map((m) => (
                  <tr key={m._id} className="hover:bg-gray-50 dark:hover:bg-[#262626] transition-colors">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                          <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <span className="text-sm font-medium dark:text-gray-200">{m.investor?.full_name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                          <User className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                        </div>
                        <span className="text-sm font-medium dark:text-gray-200">{m.founder?.full_name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm dark:text-gray-400">{m.startup_idea?.title}</span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2 text-sm dark:text-gray-400">
                        <Calendar className="w-4 h-4" />
                        {new Date(m.meeting_date).toLocaleString()}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="px-2 py-1 text-xs rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-[#262626]">
                        {m.mode}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                        m.status === 'scheduled' ? 'bg-blue-100 text-blue-700' :
                        m.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                        'bg-red-100 text-red-700'
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
      </div>
    </div>
  );
}

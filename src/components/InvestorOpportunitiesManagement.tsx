import { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Rocket, User, Calendar, Star, MoreVertical } from 'lucide-react';
import { toast } from 'sonner';

export function InvestorOpportunitiesManagement() {
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const apiUrl = import.meta.env.VITE_API_URL || 'https://backendapis.goexperts.in';

  useEffect(() => {
    fetchOpportunities();
  }, []);

  const fetchOpportunities = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await axios.get(`${apiUrl}/api/admin/opportunities`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setOpportunities(res.data.data);
      }
    } catch (error) {
      toast.error('Failed to fetch opportunities tracking');
    } finally {
      setLoading(false);
    }
  };

  const filtered = opportunities.filter(op => 
    op.investor?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    op.startup_idea?.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-3xl font-bold dark:text-white mb-1">Investor Interest & Pipeline</h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm">Track how investors are interacting with startup ideas and their pipeline status.</p>
        </div>
      </div>

      <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl border border-gray-200 dark:border-[#262626] p-6 space-y-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by investor or startup idea..."
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
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-gray-300 whitespace-nowrap">Idea</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-gray-300 whitespace-nowrap">Status</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 dark:text-gray-300 whitespace-nowrap">Priority</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 dark:text-gray-300 whitespace-nowrap">Last Viewed</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 dark:text-gray-300 whitespace-nowrap">Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-[#262626]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">Loading...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">No data found</td>
                </tr>
              ) : (
                filtered.map((op) => (
                  <tr key={op._id} className="hover:bg-gray-50 dark:hover:bg-[#262626]/50 transition-colors">
                    <td className="px-6 py-4 align-middle">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center flex-shrink-0">
                          <User className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <span className="text-sm font-medium dark:text-gray-200 text-gray-900">{op.investor?.full_name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 align-middle">
                      <div className="flex items-center gap-2">
                        <Rocket className="w-4 h-4 text-[#F24C20] flex-shrink-0" />
                        <span className="text-sm dark:text-gray-400 text-gray-700 line-clamp-2">{op.startup_idea?.title}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 align-middle">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap border ${
                        op.status === 'interested' ? 'bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-900/30' :
                        op.status === 'shortlisted' ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-900/30' :
                        'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700'
                      }`}>
                        {op.status?.charAt(0).toUpperCase() + op.status?.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 align-middle text-center">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap border ${
                        op.priority === 'High' ? 'border-red-200 dark:border-red-900/30 text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/20' :
                        op.priority === 'Medium' ? 'border-blue-200 dark:border-blue-900/30 text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20' :
                        'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800'
                      }`}>
                        {op.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4 align-middle text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-2 text-xs text-gray-600 dark:text-gray-500">
                        <Calendar className="w-4 h-4 flex-shrink-0" />
                        {new Date(op.last_viewed).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 align-middle text-center">
                      <div className="flex items-center justify-center font-bold text-sm">
                        <span className={`${op.score ? 'text-[#F24C20]' : 'text-gray-500'}`}>{op.score || "-"}</span>
                      </div>
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

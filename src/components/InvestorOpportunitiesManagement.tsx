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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold dark:text-white">Investor Interest & Pipeline</h2>
          <p className="text-gray-500 dark:text-gray-400">Track how investors are interacting with startup ideas and their pipeline status.</p>
        </div>
      </div>

      <div className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-gray-200 dark:border-[#262626] p-4">
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by investor or startup idea..."
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
                <th className="px-4 py-3 text-sm font-semibold dark:text-gray-300">Idea</th>
                <th className="px-4 py-3 text-sm font-semibold dark:text-gray-300">Status</th>
                <th className="px-4 py-3 text-sm font-semibold dark:text-gray-300">Priority</th>
                <th className="px-4 py-3 text-sm font-semibold dark:text-gray-300">Last Viewed</th>
                <th className="px-4 py-3 text-sm font-semibold dark:text-gray-300">Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-[#262626]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">Loading...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">No data found</td>
                </tr>
              ) : (
                filtered.map((op) => (
                  <tr key={op._id} className="hover:bg-gray-50 dark:hover:bg-[#262626] transition-colors">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-medium dark:text-gray-200">{op.investor?.full_name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                         <Rocket className="w-4 h-4 text-[#F24C20]" />
                         <span className="text-sm dark:text-gray-400">{op.startup_idea?.title}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm font-medium">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        op.status === 'interested' ? 'bg-orange-100 text-orange-700' :
                        op.status === 'shortlisted' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                         {op.status}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${
                        op.priority === 'High' ? 'border-red-500 text-red-500 bg-red-50' :
                        op.priority === 'Medium' ? 'border-blue-500 text-blue-500 bg-blue-50' :
                        'border-gray-500 text-gray-500 bg-gray-50'
                      }`}>
                         {op.priority}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-500">
                        <Calendar className="w-4 h-4" />
                        {new Date(op.last_viewed).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1 font-bold text-orange-500">
                        {op.score || "-"}
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

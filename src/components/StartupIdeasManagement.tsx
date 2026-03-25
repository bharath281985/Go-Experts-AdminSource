import React, { useState, useEffect } from 'react';
import { 
  Rocket, 
  Search, 
  Filter, 
  CheckCircle, 
  XCircle, 
  Eye, 
  TrendingUp, 
  Users, 
  DollarSign,
  AlertCircle,
  MoreVertical,
  ArrowUpRight,
  FileText
} from 'lucide-react';
import api from '../lib/api'; // Assuming lib/api.ts exists or just use fetch
import { toast } from 'sonner';

interface Props {
  onSelectIdea: (id: string) => void;
}

export function StartupIdeasManagement({ onSelectIdea }: Props) {
  const [ideas, setIdeas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchIdeas();
  }, []);

  const fetchIdeas = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/startup-ideas');
      if (res.data.success) {
        setIdeas(res.data.data);
      }
    } catch (error) {
      toast.error('Failed to fetch startup ideas');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      const res = await api.put(`/admin/startup-ideas/${id}/status`, { status });
      if (res.data.success) {
        toast.success(`Idea ${status} successfully`);
        fetchIdeas();
      }
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const filteredIdeas = ideas.filter(idea => {
    const matchesFilter = filter === 'all' || idea.status === filter;
    const matchesSearch = idea.title.toLowerCase().includes(search.toLowerCase()) || 
                         idea.creator?.full_name?.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const stats = {
    total: ideas.length,
    pending: ideas.filter(i => i.status === 'pending').length,
    approved: ideas.filter(i => i.status === 'approved').length,
    totalViews: ideas.reduce((acc, i) => acc + (i.views || 0), 0)
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Rocket className="w-6 h-6 text-[#F24C20]" />
            Startup Ideas Management
          </h1>
          <p className="text-gray-500">Review and manage submitted business concepts</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title="Total Submissions" value={stats.total} icon={<Rocket className="w-5 h-5" />} color="blue" />
        <StatCard title="Pending Review" value={stats.pending} icon={<AlertCircle className="w-5 h-5" />} color="amber" />
        <StatCard title="Live Ideas" value={stats.approved} icon={<CheckCircle className="w-5 h-5" />} color="green" />
        <StatCard title="Total Ecosystem Views" value={stats.totalViews} icon={<TrendingUp className="w-5 h-5" />} color="purple" />
      </div>

      {/* Filters & Search */}
      <div className="bg-white dark:bg-[#1a1a1a] p-4 rounded-xl border border-gray-100 dark:border-[#262626] flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search ideas or creators..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-[#262626] rounded-lg border-none outline-none focus:ring-1 focus:ring-[#F24C20]"
          />
        </div>
        <div className="flex gap-2">
          {['all', 'pending', 'approved', 'rejected'].map(f => (
            <button 
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${filter === f ? 'bg-[#F24C20] text-white' : 'bg-gray-50 dark:bg-[#262626] text-gray-500 hover:bg-gray-100'}`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Ideas Table */}
      <div className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-gray-100 dark:border-[#262626] overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 dark:bg-[#262626] text-xs uppercase text-gray-500">
            <tr>
              <th className="px-6 py-4">Idea Detail</th>
              <th className="px-6 py-4">Creator</th>
              <th className="px-6 py-4">Category</th>
              <th className="px-6 py-4">Documents</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Engagement</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-[#262626]">
            {loading ? (
              [1,2,3].map(i => <tr key={i}><td colSpan={6} className="px-6 py-4 text-center animate-pulse text-gray-400">Loading ideas...</td></tr>)
            ) : filteredIdeas.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-20 text-center text-gray-500">No ideas found matching your criteria</td></tr>
            ) : filteredIdeas.map(idea => (
              <tr key={idea._id} className="hover:bg-gray-50 dark:hover:bg-[#262626]/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-bold">{idea.title}</div>
                  {/* <div className="text-xs text-gray-500 truncate max-w-[200px]">{idea.shortDescription}</div> */}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-[#F24C20]/10 flex items-center justify-center text-[#F24C20] text-xs font-bold">
                      {idea.creator?.full_name?.charAt(0)}
                    </div>
                    <div>
                      <div className="text-sm font-medium">{idea.creator?.full_name}</div>
                      <div className="text-xs text-gray-400">{idea.creator?.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-[10px] font-bold rounded uppercase">
                    {idea.category}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {idea.signedNDA ? (
                    <a 
                      href={`${api.defaults.baseURL?.replace('/api', '')}${idea.signedNDA}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-blue-500 hover:text-blue-600 font-medium text-xs group"
                    >
                      <FileText className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                      View Signed NDA
                    </a>
                  ) : idea.ndaRequired === 'Yes' ? (
                    <span className="text-[10px] text-amber-500 font-bold bg-amber-50 px-2 py-1 rounded">AWAITING NDA</span>
                  ) : (
                    <span className="text-[10px] text-gray-400 font-bold bg-gray-50 px-2 py-1 rounded">NO NDA</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                    idea.status === 'approved' ? 'bg-green-50 text-green-600' :
                    idea.status === 'pending' ? 'bg-amber-50 text-amber-600' :
                    'bg-red-50 text-red-600'
                  }`}>
                    {idea.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="text-xs space-y-1">
                    <div className="flex items-center gap-1"><Eye className="w-3 h-3" /> {idea.views || 0} views</div>
                    <div className="flex items-center gap-1"><Users className="w-3 h-3" /> {idea.contacts?.length || 0} contacts</div>
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    {idea.status === 'pending' && (
                      <>
                        <button 
                          onClick={() => handleUpdateStatus(idea._id, 'approved')}
                          className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
                          title="Approve Idea"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleUpdateStatus(idea._id, 'rejected')}
                          className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                          title="Reject Idea"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      </>
                    )}
                    <button 
                      onClick={() => onSelectIdea(idea._id)}
                      className="p-2 bg-gray-50 dark:bg-[#262626] rounded-lg hover:bg-gray-100 transition-colors"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color }: any) {
  const colors: any = {
    blue: 'bg-blue-50 text-blue-600',
    amber: 'bg-amber-50 text-amber-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600'
  };
  return (
    <div className="bg-white dark:bg-[#1a1a1a] p-5 rounded-xl border border-gray-100 dark:border-[#262626] flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colors[color]}`}>
        {icon}
      </div>
      <div>
        <div className="text-xs text-gray-500 font-medium">{title}</div>
        <div className="text-xl font-bold">{value}</div>
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Search, Eye, CheckCircle, X, AlertTriangle, ChevronLeft, ChevronRight, Loader2, Star } from 'lucide-react';
import api from '../lib/api';

interface ProjectsListProps {
  onSelectProject: (projectId: string) => void;
}

export function ProjectsList({ onSelectProject }: ProjectsListProps) {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'in_queue' | 'approved' | 'rejected' | 'flagged'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/projects');
      if (response.data.success) {
        setProjects(response.data.projects);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFeatured = async (projectId: string) => {
    try {
      const response = await api.put(`/admin/projects/${projectId}/featured`);
      if (response.data.success) {
        setProjects(prev => prev.map(p =>
          p._id === projectId ? { ...p, is_featured: !p.is_featured } : p
        ));
      }
    } catch (error) {
      console.error('Error toggling featured status:', error);
    }
  };

  const handleUpdateStatus = async (projectId: string, status: string) => {
    try {
      const response = await api.put(`/admin/projects/${projectId}/status`, { status });
      if (response.data.success) {
        setProjects(prev => prev.map(p =>
          p._id === projectId ? { ...p, status: status } : p
        ));
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const filteredProjects = projects.filter(project => {
    const matchesSearch = (project.title || '').toLowerCase().includes(searchQuery.toLowerCase());
    const isApproved = project.status === 'approved' || project.status === 'live';
    const isRejected = project.status === 'rejected';
    const isFlagged = project.status === 'flagged';
    const isPending = !project.status || project.status === 'in_queue' || project.status === 'pending';

    const matchesStatus = filterStatus === 'all' ||
      (filterStatus === 'approved' && isApproved) ||
      (filterStatus === 'rejected' && isRejected) ||
      (filterStatus === 'flagged' && isFlagged) ||
      (filterStatus === 'in_queue' && isPending);

    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredProjects.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProjects = filteredProjects.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="max-w-[1300px] mx-auto space-y-10 pb-20 px-6">
      {/* Dynamic Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-gray-100 dark:border-[#262626] pb-8">
        <div>
          <h1 className="text-2xl font-semibold text-[#044071] dark:text-white mb-2 tracking-tight">Marketplace Objectives Registry</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm font-medium italic opacity-70">
            "Strategic oversight of active capital deployment and professional service requests."
          </p>
        </div>
      </div>

      {/* Intelligence Filters */}
      <div className="bg-white dark:bg-[#1a1a1a] rounded-[2.5rem] p-8 border border-gray-100 dark:border-[#262626] shadow-sm space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-300 group-focus-within:text-[#F24C20] transition-colors" />
              <input
                type="text"
                placeholder="Search semantic objectives..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-50 dark:border-[#262626] bg-gray-50/50 dark:bg-black/20 focus:bg-white dark:focus:bg-black/40 focus:ring-4 focus:ring-[#F24C20]/5 transition-all outline-none text-sm font-medium"
              />
            </div>
          </div>

          <div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="w-full px-4 py-4 rounded-2xl border border-gray-50 dark:border-[#262626] bg-gray-50/50 dark:bg-black/20 text-sm font-bold text-gray-600 dark:text-gray-300 focus:ring-4 focus:ring-[#F24C20]/5 outline-none cursor-pointer"
            >
              <option value="all">Protocol Status: All</option>
              <option value="in_queue">Awaiting Approval</option>
              <option value="approved">Operational (Live)</option>
              <option value="rejected">Deauthorized</option>
              <option value="flagged">Critical Audit</option>
            </select>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          {[
            { id: 'all', label: 'Global Inventory', count: projects.length, color: 'text-indigo-600 bg-indigo-50 border-indigo-100' },
            { id: 'in_queue', label: 'Queue Staging', count: projects.filter(p => !p.status || p.status === 'in_queue' || p.status === 'pending').length, color: 'text-amber-600 bg-amber-50 border-amber-100' },
            { id: 'approved', label: 'Authorized Live', count: projects.filter(p => p.status === 'approved' || p.status === 'live').length, color: 'text-emerald-600 bg-emerald-50 border-emerald-100' },
            { id: 'rejected', label: 'Restricted', count: projects.filter(p => p.status === 'rejected').length, color: 'text-red-600 bg-red-50 border-red-100' },
            { id: 'flagged', label: 'Flagged Audit', count: projects.filter(p => p.status === 'flagged').length, color: 'text-orange-600 bg-orange-50 border-orange-100' }
          ].map((chip) => (
            <button
              key={chip.id}
              onClick={() => setFilterStatus(chip.id as any)}
              className={`flex items-center gap-2.5 px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border ${
                filterStatus === chip.id 
                ? 'bg-[#044071] text-white border-[#044071] shadow-lg shadow-blue-500/20 scale-105' 
                : `${chip.color} hover:shadow-md opacity-80 hover:opacity-100`
              }`}
            >
              {chip.label}
              <span className={`px-2 py-0.5 rounded-full text-[9px] ${filterStatus === chip.id ? 'bg-white/20' : 'bg-black/5'}`}>
                {chip.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Projects Intelligence Matrix */}
      <div className="bg-white dark:bg-[#1a1a1a] rounded-[2.5rem] border border-gray-100 dark:border-[#262626] overflow-hidden shadow-sm min-h-[500px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-32">
            <Loader2 className="w-10 h-10 text-[#F24C20] animate-spin mb-6" />
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Synchronizing Live Telemetry...</p>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-32 text-center opacity-50">
            <AlertTriangle className="w-12 h-12 text-gray-300 mb-4" />
            <p className="text-sm font-medium text-gray-500 italic">No objectives localized within specified parameters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50/50 dark:bg-black/20 border-b border-gray-50 dark:border-[#262626]">
                <tr>
                  <th className="px-8 py-5 text-left text-[11px] font-black uppercase tracking-widest text-gray-400">Objective Entity</th>
                  <th className="px-8 py-5 text-left text-[11px] font-black uppercase tracking-widest text-gray-400">Capital Estimate</th>
                  <th className="px-8 py-5 text-left text-[11px] font-black uppercase tracking-widest text-gray-400">Preference</th>
                  <th className="px-8 py-5 text-left text-[11px] font-black uppercase tracking-widest text-gray-400">Protocol Status</th>
                  <th className="px-8 py-5 text-left text-[11px] font-black uppercase tracking-widest text-gray-400">Timestamp</th>
                  <th className="px-8 py-5 text-center text-[11px] font-black uppercase tracking-widest text-gray-400">Operations</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-[#262626]">
                {paginatedProjects.map((project: any, index: number) => (
                  <motion.tr
                    key={project._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="group hover:bg-gray-50/50 dark:hover:bg-black/10 transition-all cursor-pointer"
                    onClick={() => onSelectProject(project._id)}
                  >
                    <td className="px-8 py-6">
                      <div className="max-w-xs">
                        <div className="font-semibold text-[#044071] dark:text-white mb-1 leading-tight group-hover:text-[#F24C20] transition-colors">{project.title}</div>
                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 opacity-70">ID: {project._id.slice(-8)} • {project.client_id?.full_name || 'Anonymous'}</div>
                        <div className="flex flex-wrap gap-1.5">
                          {(project.skills || []).slice(0, 3).map((skill: string, i: number) => (
                            <span key={i} className="bg-gray-100 dark:bg-[#262626] text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-tighter">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="text-sm font-semibold text-[#044071] dark:text-white">
                        ₹{(project.budget_min || 0).toLocaleString()} <span className="mx-1 text-gray-300">→</span> ₹{(project.budget_max || 0).toLocaleString()}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${project.work_preference === 'fixed'
                        ? 'bg-purple-50 text-purple-600 border border-purple-100'
                        : 'bg-blue-50 text-blue-600 border border-blue-100'
                        }`}>
                        {project.work_preference || 'Fixed'}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${project.status === 'approved' || project.status === 'live'
                        ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                        : project.status === 'rejected'
                          ? 'bg-red-50 text-red-600 border border-red-100'
                          : 'bg-amber-50 text-amber-600 border border-amber-100'
                        }`}>
                        {project.status === 'live' ? 'Approved' : (project.status || 'In Queue')}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                      {new Date(project.created_at || project.createdDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center justify-center gap-3">
                        <motion.button
                          whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                          onClick={(e) => { e.stopPropagation(); handleToggleFeatured(project._id); }}
                          className={`p-2.5 rounded-xl transition-all ${project.is_featured ? 'bg-yellow-400 text-white shadow-lg shadow-yellow-400/20' : 'bg-gray-100 dark:bg-[#262626] text-gray-400 hover:text-yellow-500'}`}
                        >
                          <Star className={`w-3.5 h-3.5 ${project.is_featured ? 'fill-current' : ''}`} />
                        </motion.button>
                        
                        <div className="w-px h-6 bg-gray-100 dark:bg-[#262626]" />

                        {!(project.status === 'live' || project.status === 'approved') && (
                          <motion.button
                            whileHover={{ scale: 1.1, backgroundColor: '#10b981', color: '#fff' }} whileTap={{ scale: 0.9 }}
                            onClick={(e) => { e.stopPropagation(); handleUpdateStatus(project._id, 'live'); }}
                            className="p-2.5 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 rounded-xl transition-all"
                            title="Authorize Objective"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                          </motion.button>
                        )}

                        {project.status !== 'rejected' && (
                          <motion.button
                            whileHover={{ scale: 1.1, backgroundColor: '#ef4444', color: '#fff' }} whileTap={{ scale: 0.9 }}
                            onClick={(e) => { e.stopPropagation(); handleUpdateStatus(project._id, 'rejected'); }}
                            className="p-2.5 bg-red-50 dark:bg-red-950/20 text-red-600 rounded-xl transition-all"
                            title="Deauthorize Objective"
                          >
                            <X className="w-3.5 h-3.5" />
                          </motion.button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Intelligence Pagination */}
        {filteredProjects.length > itemsPerPage && (
          <div className="flex items-center justify-between px-8 py-6 border-t border-gray-50 dark:border-[#262626] bg-gray-50/30 dark:bg-black/10">
            <div className="text-[10px] font-black uppercase tracking-widest text-gray-400">
              Telemetry Span: {startIndex + 1} - {Math.min(startIndex + itemsPerPage, filteredProjects.length)} of {filteredProjects.length}
            </div>
            <div className="flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="p-3 rounded-xl border border-gray-100 dark:border-[#262626] bg-white dark:bg-black text-[#044071] dark:text-white disabled:opacity-30 shadow-sm"
              >
                <ChevronLeft className="w-4 h-4" />
              </motion.button>
              <div className="px-4 py-2 bg-white dark:bg-black border border-gray-100 dark:border-[#262626] rounded-xl text-[10px] font-black">
                {currentPage} / {totalPages}
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="p-3 rounded-xl border border-gray-100 dark:border-[#262626] bg-white dark:bg-black text-[#044071] dark:text-white disabled:opacity-30 shadow-sm"
              >
                <ChevronRight className="w-4 h-4" />
              </motion.button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
  );
}

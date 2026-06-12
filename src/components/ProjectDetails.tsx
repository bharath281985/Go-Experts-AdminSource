import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, CheckCircle, X, AlertTriangle, FileText, DollarSign, MapPin, Calendar, User, Loader2 } from 'lucide-react';
import api from '../lib/api';

interface ProjectDetailsProps {
  projectId: string;
  onBack: () => void;
}

export function ProjectDetails({ projectId, onBack }: ProjectDetailsProps) {
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjectDetails();
  }, [projectId]);

  const fetchProjectDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/admin/projects`); // Since we don't have a single GET by ID, we filter from list or check if backend has one
      // If backend has GET /api/admin/projects/:id, use it.
      // For now, let's try to fetch all and find, OR assume GET /api/admin/projects/:id exists (I'll check adminRoutes)
      const res = await api.get(`/admin/projects`);
      if (res.data.success) {
        const found = res.data.projects.find((p: any) => p._id === projectId);
        setProject(found);
      }
    } catch (error) {
      console.error('Error fetching project details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (status: string) => {
    try {
      const response = await api.put(`/admin/projects/${projectId}/status`, { status });
      if (response.data.success) {
        setProject({ ...project, status });
        // Optionally go back after some delay or show success
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20">
        <Loader2 className="w-10 h-10 text-[#F24C20] animate-spin mb-4" />
        <p className="text-gray-500">Loading project details...</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="space-y-6">
        <button onClick={onBack} className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
          <ArrowLeft className="w-5 h-5" /> Back to Projects
        </button>
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200 dark:border-gray-700 text-center">
          Project not found
        </div>
      </div>
    );
  }

  const isApproved = project.status === 'approved' || project.status === 'live';
  const isRejected = project.status === 'rejected';
  const isPending = !project.status || project.status === 'in_queue' || project.status === 'pending';

  return (
    <div className="space-y-6">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        Back to Projects
      </button>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200 dark:border-gray-700"
      >
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4">
              <h1 className="text-2xl font-bold">{project.title}</h1>
              <span className={`px-3 py-1 rounded-full text-sm font-bold ${isApproved
                ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                : project.status === 'flagged'
                  ? 'bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400'
                  : isPending
                    ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400'
                    : 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400'
                }`}>
                {project.status === 'flagged' ? 'Flagged for Review' : isPending ? 'Pending Review' : isApproved ? 'Approved & Live' : 'Rejected'}
              </span>
            </div>

            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-6 mb-8 border border-gray-100 dark:border-gray-700">
              <h3 className="text-sm font-semibold mb-3 text-gray-500 uppercase tracking-wider">Description</h3>
              <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">{project.description}</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
              <div className="flex items-center gap-3">
                
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Budget Range</p>
                  <p className="font-bold">₹{project.budget_min?.toLocaleString()} - ₹{project.budget_max?.toLocaleString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                  <User className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Posted By</p>
                  <p className="font-bold truncate max-w-[150px]">{project.client_id?.full_name || 'Client Name'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                  <MapPin className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Location</p>
                  <p className="font-bold">{project.location || 'Remote'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                  <Calendar className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Submission Date</p>
                  <p className="font-bold">{new Date(project.created_at || project.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-sm font-semibold mb-3 text-gray-500 uppercase tracking-wider">Required Skills</h3>
              <div className="flex flex-wrap gap-2">
                {(project.skills || []).map((skill: string, index: number) => (
                  <span
                    key={index}
                    className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-4 py-1.5 rounded-lg text-sm font-medium border border-gray-200 dark:border-gray-600"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 pt-8 border-t border-gray-200 dark:border-gray-700">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleUpdateStatus('live')}
            className={`px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition-all ${isApproved
              ? 'bg-green-100 text-green-700 opacity-50 cursor-not-allowed'
              : 'bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-600/20'
              }`}
            disabled={isApproved}
          >
            <CheckCircle className="w-5 h-5" />
            {isApproved ? 'Already Approved' : 'Approve Project'}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleUpdateStatus('rejected')}
            className={`px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition-all ${isRejected
              ? 'bg-red-100 text-red-700 opacity-50 cursor-not-allowed'
              : 'bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/20'
              }`}
            disabled={isRejected}
          >
            <X className="w-5 h-5" />
            {isRejected ? 'Already Rejected' : 'Reject Project'}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleUpdateStatus('flagged')}
            className={`px-8 py-3 rounded-xl font-medium flex items-center gap-2 transition-all ${project.status === 'flagged'
              ? 'bg-orange-100 text-orange-700 opacity-50 cursor-not-allowed'
              : 'border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400'
              }`}
            disabled={project.status === 'flagged'}
          >
            <AlertTriangle className="w-5 h-5" />
            {project.status === 'flagged' ? 'Already Flagged' : 'Flag for Review'}
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}

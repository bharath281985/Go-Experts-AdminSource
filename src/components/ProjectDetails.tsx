import { motion } from 'motion/react';
import { ArrowLeft, CheckCircle, X, AlertTriangle, FileText, DollarSign, MapPin, Calendar, User } from 'lucide-react';
import { projects } from '../lib/dummyData';

interface ProjectDetailsProps {
  projectId: string;
  onBack: () => void;
}

export function ProjectDetails({ projectId, onBack }: ProjectDetailsProps) {
  const project = projects.find(p => p.id === projectId);

  if (!project) {
    return <div>Project not found</div>;
  }

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
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                project.status === 'approved'
                  ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                  : project.status === 'in_queue'
                  ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400'
                  : 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400'
              }`}>
                {project.status === 'in_queue' ? 'In Queue' : project.status === 'approved' ? 'Approved' : 'Rejected'}
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                project.spamProbability === 'low'
                  ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                  : project.spamProbability === 'medium'
                  ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400'
                  : 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400'
              }`}>
                Spam Risk: {project.spamProbability}
              </span>
            </div>

            <p className="text-gray-600 dark:text-gray-400 mb-6">{project.description}</p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Budget</p>
                  <p className="font-semibold">{project.budget.currency}{project.budget.min.toLocaleString()} - {project.budget.currency}{project.budget.max.toLocaleString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Posted By</p>
                  <p className="font-semibold">{project.author}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Location</p>
                  <p className="font-semibold">{project.location}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Posted</p>
                  <p className="font-semibold">{new Date(project.createdDate).toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-sm font-semibold mb-2">Required Skills</h3>
              <div className="flex flex-wrap gap-2">
                {project.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 px-3 py-1 rounded-full text-sm"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-900/10 rounded-lg p-4">
              <FileText className="w-5 h-5 text-blue-600" />
              <div>
                <p className="font-semibold text-blue-900 dark:text-blue-100">{project.proposalsCount} Proposals Received</p>
                <p className="text-sm text-blue-700 dark:text-blue-300">Average bid: {project.budget.currency}{((project.budget.min + project.budget.max) / 2).toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
          {project.status === 'in_queue' && (
            <>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-medium flex items-center gap-2"
              >
                <CheckCircle className="w-5 h-5" />
                Approve Project
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-medium flex items-center gap-2"
              >
                <X className="w-5 h-5" />
                Reject Project
              </motion.button>
            </>
          )}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 px-6 py-3 rounded-xl font-medium flex items-center gap-2"
          >
            <AlertTriangle className="w-5 h-5" />
            Flag Project
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}

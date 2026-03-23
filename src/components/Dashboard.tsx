import { motion } from 'motion/react';
import { useEffect, useState } from 'react';
import {
  Users,
  Briefcase,
  FolderKanban,
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle,
  Clock,
  Activity
} from 'lucide-react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { revenueData, ordersData, activityFeed } from '../lib/dummyData';

interface KPICardProps {
  title: string;
  value: number;
  prefix?: string;
  suffix?: string;
  change: number;
  icon: React.ReactNode;
  color: string;
  delay: number;
  sparklineData?: number[];
}

function AnimatedCounter({ value, duration = 2000 }: { value: number; duration?: number }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = value;
    const increment = end / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [value, duration]);

  return <span>{count.toLocaleString()}</span>;
}

function KPICard({ title, value, prefix = '', suffix = '', change, icon, color, delay, sparklineData }: KPICardProps) {
  const isPositive = change >= 0;
  const bgColor = color === 'primary' ? 'rgba(242, 76, 32, 0.1)' : 'rgba(4, 64, 113, 0.1)';
  const iconColor = color === 'primary' ? '#F24C20' : '#044071';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      whileHover={{ y: -4, boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
      className="bg-white dark:bg-[#1a1a1a] rounded-2xl p-6 border border-gray-200 dark:border-[#262626]"
    >
      <div className="flex items-start justify-between mb-4">
        <div style={{ backgroundColor: bgColor }} className="p-3 rounded-xl">
          <div style={{ color: iconColor }}>{icon}</div>
        </div>
        <div className={`flex items-center gap-1 text-sm font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
          {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
          {Math.abs(change)}%
        </div>
      </div>
      <h3 className="text-gray-600 dark:text-gray-400 text-sm mb-2">{title}</h3>
      <div className="text-3xl font-bold mb-4 text-[#044071] dark:text-white">
        {prefix}
        <AnimatedCounter value={value} />
        {suffix}
      </div>
      {sparklineData && (
        <div className="h-12">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={sparklineData.map((val, i) => ({ value: val }))}>
              <defs>
                <linearGradient id={`gradient-${color}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={iconColor} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={iconColor} stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey="value" stroke={iconColor} fill={`url(#gradient-${color})`} strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </motion.div>
  );
}

import api from '../lib/api';

export function Dashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeSellers: 0,
    totalProjects: 0,
    totalGigs: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/admin/stats');
        if (response.data.success) {
          setStats(response.data.stats);
        }
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="space-y-6">
      {/* Hero Panel with Mesh Background */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl p-8 text-white"
        style={{
          background: 'linear-gradient(135deg, #F24C20 0%, #d43a12 50%, #044071 100%)'
        }}
      >
        {/* Animated Mesh Background */}
        <div className="absolute inset-0 opacity-20">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 90, 0],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              scale: [1.2, 1, 1.2],
              rotate: [90, 0, 90],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute bottom-0 right-0 w-96 h-96 bg-[#044071] rounded-full blur-3xl"
          />
        </div>

        <div className="relative z-10 flex items-start justify-between">
          <div>
            <motion.h1
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-3xl font-bold mb-2"
            >
              Welcome back, {JSON.parse(localStorage.getItem('user') || '{}').full_name || 'Admin'} 👋
            </motion.h1>
            <motion.p
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-white/90 mb-4"
            >
              Here's what's happening with your platform today
            </motion.p>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.4, type: "spring" }}
              className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 w-fit"
            >
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm font-medium">Platform Status: Stable</span>
            </motion.div>
          </div>
          <motion.div
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-right"
          >
            <p className="text-white/80 text-sm mb-1">Today's Date</p>
            <p className="text-xl font-semibold">{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
          </motion.div>
        </div>

        <div className="absolute -right-10 top-10 opacity-20">
          <motion.div
            animate={{ y: [0, -20, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="w-32 h-32 bg-white rounded-2xl blur-sm"
          />
        </div>
        <div className="absolute -left-10 bottom-10 opacity-20">
          <motion.div
            animate={{ y: [0, 20, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
            className="w-24 h-24 bg-white rounded-2xl blur-sm"
          />
        </div>
      </motion.div>

      {/* Live KPI Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Total Users"
          value={stats.totalUsers}
          change={12.5}
          icon={<Users className="w-6 h-6" />}
          color="primary"
          delay={0.1}
          sparklineData={[2100, 2200, 2350, 2500, 2650, 2750, stats.totalUsers]}
        />
        <KPICard
          title="Active Sellers"
          value={stats.activeSellers}
          change={8.3}
          icon={<Briefcase className="w-6 h-6" />}
          color="secondary"
          delay={0.2}
          sparklineData={[380, 400, 420, 435, 448, 452, stats.activeSellers]}
        />
        <KPICard
          title="Total Projects"
          value={stats.totalProjects}
          change={15.7}
          icon={<FolderKanban className="w-6 h-6" />}
          color="primary"
          delay={0.3}
          sparklineData={[890, 950, 1020, 1100, 1180, 1210, stats.totalProjects]}
        />
        <KPICard
          title="Total Gigs"
          value={stats.totalGigs}
          change={18.2}
          icon={<DollarSign className="w-6 h-6" />}
          color="primary"
          delay={0.4}
          sparklineData={[32000, 38000, 42000, 46000, 50000, 52000, stats.totalGigs]}
        />
      </div>

      {/* Additional KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          whileHover={{ scale: 1.02 }}
          className="bg-white dark:bg-[#1a1a1a] rounded-2xl p-6 border border-gray-200 dark:border-[#262626] cursor-pointer"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl" style={{ backgroundColor: 'rgba(242, 76, 32, 0.1)' }}>
              <Activity className="w-6 h-6 text-[#F24C20]" />
            </div>
            <span className="text-xs px-3 py-1 rounded-full" style={{ backgroundColor: 'rgba(242, 76, 32, 0.1)', color: '#F24C20' }}>Today</span>
          </div>
          <h3 className="text-gray-600 dark:text-gray-400 text-sm mb-2">New Users Today</h3>
          <div className="text-3xl font-bold mb-2 text-[#044071] dark:text-white">
            <AnimatedCounter value={23} />
          </div>
          <button className="text-sm text-[#F24C20] hover:text-[#d43a12] font-medium">View Details →</button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6 }}
          whileHover={{ scale: 1.02 }}
          className="bg-white dark:bg-[#1a1a1a] rounded-2xl p-6 border border-gray-200 dark:border-[#262626] cursor-pointer"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-yellow-100 dark:bg-yellow-900/20">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <span className="text-xs bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 px-3 py-1 rounded-full">Pending</span>
          </div>
          <h3 className="text-gray-600 dark:text-gray-400 text-sm mb-2">Pending Approvals</h3>
          <div className="text-3xl font-bold mb-2 text-[#044071] dark:text-white">
            <AnimatedCounter value={17} />
          </div>
          <button className="text-sm text-[#F24C20] hover:text-[#d43a12] font-medium">Review Now →</button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.7 }}
          whileHover={{ scale: 1.02 }}
          className="bg-white dark:bg-[#1a1a1a] rounded-2xl p-6 border border-gray-200 dark:border-[#262626] cursor-pointer"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-red-100 dark:bg-red-900/20">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            <span className="text-xs bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 px-3 py-1 rounded-full">Urgent</span>
          </div>
          <h3 className="text-gray-600 dark:text-gray-400 text-sm mb-2">Open Disputes</h3>
          <div className="text-3xl font-bold mb-2 text-[#044071] dark:text-white">
            <AnimatedCounter value={8} />
          </div>
          <button className="text-sm text-[#F24C20] hover:text-[#d43a12] font-medium">Resolve →</button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8 }}
          whileHover={{ scale: 1.02 }}
          className="bg-white dark:bg-[#1a1a1a] rounded-2xl p-6 border border-gray-200 dark:border-[#262626] cursor-pointer"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl" style={{ backgroundColor: 'rgba(4, 64, 113, 0.1)' }}>
              <DollarSign className="w-6 h-6 text-[#044071]" />
            </div>
            <span className="text-xs px-3 py-1 rounded-full" style={{ backgroundColor: 'rgba(4, 64, 113, 0.1)', color: '#044071' }}>This Month</span>
          </div>
          <h3 className="text-gray-600 dark:text-gray-400 text-sm mb-2">Platform Commission</h3>
          <div className="text-3xl font-bold mb-2 text-[#044071] dark:text-white">
            ₹<AnimatedCounter value={8250} />
          </div>
          <button className="text-sm text-[#F24C20] hover:text-[#d43a12] font-medium">View Report →</button>
        </motion.div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.9 }}
          className="bg-white dark:bg-[#1a1a1a] rounded-2xl p-6 border border-gray-200 dark:border-[#262626]"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-[#044071] dark:text-white mb-1">Revenue Trend</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Monthly revenue overview</p>
            </div>
            <select className="px-3 py-2 rounded-lg border border-gray-200 dark:border-[#262626] bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-[#F24C20]">
              <option>Last 7 Months</option>
              <option>Last 12 Months</option>
              <option>This Year</option>
            </select>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F24C20" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#F24C20" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                }}
              />
              <Area type="monotone" dataKey="revenue" stroke="#F24C20" fillOpacity={1} fill="url(#colorRevenue)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Projects vs Gigs Growth */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1.0 }}
          className="bg-white dark:bg-[#1a1a1a] rounded-2xl p-6 border border-gray-200 dark:border-[#262626]"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-[#044071] dark:text-white mb-1">Projects vs Gigs Growth</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Comparison by revenue</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                }}
              />
              <Legend />
              <Bar dataKey="projects" fill="#F24C20" radius={[8, 8, 0, 0]} />
              <Bar dataKey="gigs" fill="#044071" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Orders Chart and Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Orders Completed vs Cancelled */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1 }}
          className="lg:col-span-2 bg-white dark:bg-[#1a1a1a] rounded-2xl p-6 border border-gray-200 dark:border-[#262626]"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-[#044071] dark:text-white mb-1">Orders Completed vs Cancelled</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Performance metrics</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={ordersData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                }}
              />
              <Legend />
              <Line type="monotone" dataKey="completed" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="cancelled" stroke="#ef4444" strokeWidth={3} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Live Activity Feed */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          className="bg-white dark:bg-[#1a1a1a] rounded-2xl p-6 border border-gray-200 dark:border-[#262626]"
        >
          <h3 className="text-lg font-bold text-[#044071] dark:text-white mb-4">Live Activity Feed</h3>
          <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
            {activityFeed.map((activity, index) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.3 + index * 0.1 }}
                className="pb-4 border-b border-gray-100 dark:border-[#262626] last:border-0"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg" style={{ backgroundColor: 'rgba(242, 76, 32, 0.1)' }}>
                    <Activity className="w-4 h-4 text-[#F24C20]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium mb-1">{activity.user}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">{activity.time}</p>
                    <button className="text-xs text-[#F24C20] hover:text-[#d43a12] font-medium">
                      {activity.action} →
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Quick Actions Panel */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.4 }}
        className="bg-gradient-to-br from-[#fef2ee] to-white dark:from-[#1a1a1a] dark:to-[#1a1a1a] rounded-2xl p-6 border border-gray-200 dark:border-[#262626]"
      >
        <h3 className="text-lg font-bold text-[#044071] dark:text-white mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {[
            { label: 'Approve Projects', primary: true },
            { label: 'Approve Gigs', primary: true },
            { label: 'Verify Users', primary: false },
            { label: 'Review Withdraws', primary: false },
            { label: 'Resolve Disputes', primary: true },
            { label: 'Post Banner', primary: false },
            { label: 'Create Category', primary: false }
          ].map((action, index) => (
            <motion.button
              key={action.label}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className={`${action.primary
                ? 'bg-[#F24C20] hover:bg-[#d43a12] text-white'
                : 'bg-white dark:bg-[#262626] hover:bg-gray-50 dark:hover:bg-[#1a1a1a] border border-[#044071] text-[#044071] dark:text-white'
                } rounded-xl p-4 text-sm font-medium transition-colors`}
            >
              {action.label}
            </motion.button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

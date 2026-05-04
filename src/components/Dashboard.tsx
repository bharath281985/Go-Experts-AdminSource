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
  const iconColor = color === 'primary' ? '#F24C20' : '#044071';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      className="bg-white dark:bg-[#1a1a1a] rounded-[2rem] p-8 border border-gray-100 dark:border-[#262626] group hover:shadow-2xl hover:border-[#F24C20]/10 transition-all duration-500 overflow-hidden relative"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-gray-50/50 dark:bg-white/5 rounded-bl-[2.5rem] -mr-16 -mt-16 group-hover:bg-[#F24C20]/10 transition-colors" />
      
      <div className="flex items-start justify-between mb-8 relative z-10">
        <div className="p-4 rounded-2xl bg-[#044071]/5 text-[#044071] group-hover:bg-[#F24C20] group-hover:text-white transition-all duration-500 shadow-sm shadow-[#044071]/5">
          {icon}
        </div>
        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${isPositive ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-red-50 text-red-600 border border-red-100'}`}>
          {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {Math.abs(change)}%
        </div>
      </div>

      <div className="relative z-10">
        <h3 className="text-gray-500 dark:text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] mb-2 opacity-70">{title}</h3>
        <div className="text-3xl font-semibold text-[#044071] dark:text-white tracking-tighter mb-6">
          {prefix}<AnimatedCounter value={value} />{suffix}
        </div>
        
        {sparklineData && (
          <div className="h-14 -mx-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sparklineData.map((val, i) => ({ value: val }))}>
                <defs>
                  <linearGradient id={`gradient-${color}-${title.replace(/\s+/g, '')}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={iconColor} stopOpacity={0.2} />
                    <stop offset="95%" stopColor={iconColor} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="value" stroke={iconColor} fill={`url(#gradient-${color}-${title.replace(/\s+/g, '')})`} strokeWidth={2.5} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </motion.div>
  );
}

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
    <div className="max-w-[1300px] mx-auto space-y-10 pb-20 px-6">
      {/* Hero Analytics Panel */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-gradient-to-br from-[#0b0d14] to-[#161b22] p-12 shadow-2xl"
      >
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#F24C20]/10 rounded-full blur-[120px] -mr-40 -mt-40" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#044071]/10 rounded-full blur-[100px] -ml-32 -mb-32" />

        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-orange-400 mb-6">
              <Activity className="w-3.5 h-3.5" /> Intelligence Network Active
            </div>
            <h1 className="text-3xl md:text-4xl font-semibold text-white tracking-tight leading-tight mb-4">
              Authorized Ecosystem Access: <span className="text-[#F24C20]">{JSON.parse(localStorage.getItem('user') || '{}').full_name || 'Administrator'}</span>
            </h1>
            <p className="text-slate-400 text-sm leading-relaxed font-medium italic opacity-70">
              "Visualizing global operational telemetry and real-time capital flow across the marketplace grid."
            </p>
          </div>
          <div className="flex flex-col items-end gap-2 bg-white/5 backdrop-blur-md p-6 rounded-3xl border border-white/5">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Telemetry Origin</span>
            <span className="text-sm font-semibold text-white leading-tight">
              {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
            </span>
            <div className="flex items-center gap-2 mt-3 text-[9px] font-black text-emerald-400 uppercase tracking-widest">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              Protocol Synchronized
            </div>
          </div>
        </div>
      </motion.div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <KPICard
          title="Global Entity Count"
          value={stats.totalUsers}
          change={12.5}
          icon={<Users className="w-6 h-6" />}
          color="primary"
          delay={0.1}
          sparklineData={[2100, 2200, 2350, 2500, 2650, 2750, stats.totalUsers]}
        />
        <KPICard
          title="Professional Hubs"
          value={stats.activeSellers}
          change={8.3}
          icon={<Briefcase className="w-6 h-6" />}
          color="secondary"
          delay={0.2}
          sparklineData={[380, 400, 420, 435, 448, 452, stats.activeSellers]}
        />
        <KPICard
          title="Market Objectives"
          value={stats.totalProjects}
          change={15.7}
          icon={<FolderKanban className="w-6 h-6" />}
          color="primary"
          delay={0.3}
          sparklineData={[890, 950, 1020, 1100, 1180, 1210, stats.totalProjects]}
        />
        <KPICard
          title="Liquidity Units"
          value={stats.totalGigs}
          change={18.2}
          icon={<DollarSign className="w-6 h-6" />}
          color="primary"
          delay={0.4}
          sparklineData={[32000, 38000, 42000, 46000, 50000, 52000, stats.totalGigs]}
        />
      </div>

      {/* Secondary Intelligence Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {[
          { label: 'New Entities Today', val: 23, icon: <Activity className="w-5 h-5" />, status: 'ACTIVE', color: 'text-emerald-500', bg: 'bg-emerald-500/5', border: 'border-emerald-500/10' },
          { label: 'Staged Verifications', val: 17, icon: <Clock className="w-5 h-5" />, status: 'PENDING', color: 'text-amber-500', bg: 'bg-amber-500/5', border: 'border-amber-500/10' },
          { label: 'Active Friction Logs', val: 8, icon: <AlertCircle className="w-5 h-5" />, status: 'CRITICAL', color: 'text-red-500', bg: 'bg-red-500/5', border: 'border-red-500/10' },
          { label: 'Market Commission', val: 8250, icon: <DollarSign className="w-5 h-5" />, prefix: '₹', status: 'SYNCHRONIZED', color: 'text-blue-500', bg: 'bg-blue-500/5', border: 'border-blue-500/10' }
        ].map((item, i) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 + (i * 0.1) }}
            className="bg-white dark:bg-[#1a1a1a] rounded-[2rem] p-8 border border-gray-100 dark:border-[#262626] relative overflow-hidden"
          >
             <div className="flex items-center justify-between mb-6">
                <div className={`p-4 rounded-2xl ${item.bg} ${item.color}`}>
                  {item.icon}
                </div>
                <span className={`text-[10px] font-black uppercase tracking-widest ${item.color}`}>{item.status}</span>
             </div>
             <h4 className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] mb-2 opacity-70">{item.label}</h4>
             <div className="text-2xl font-semibold text-[#044071] dark:text-white tracking-tighter">
                {item.prefix}<AnimatedCounter value={item.val} />
             </div>
          </motion.div>
        ))}
      </div>

      {/* Detailed Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <motion.div
          initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.8 }}
          className="bg-white dark:bg-[#1a1a1a] rounded-[2.5rem] p-10 border border-gray-100 dark:border-[#262626] shadow-sm"
        >
          <div className="flex items-center justify-between mb-10">
            <div>
              <h3 className="text-lg font-semibold text-[#044071] dark:text-white tracking-tight">Revenue Dynamics</h3>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1 opacity-70">Capital Flow Analysis</p>
            </div>
          </div>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F24C20" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#F24C20" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={10} fontWeight={800} axisLine={false} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} fontWeight={800} axisLine={false} tickLine={false} tickFormatter={(val) => `₹${val}`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#fff', border: 'none', borderRadius: '1.5rem', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', padding: '1rem' }}
                  itemStyle={{ fontSize: '12px', fontWeight: 'bold', color: '#F24C20' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#F24C20" strokeWidth={4} fill="url(#colorRevenue)" dot={{ r: 6, fill: '#fff', stroke: '#F24C20', strokeWidth: 3 }} activeDot={{ r: 8, strokeWidth: 0 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.9 }}
          className="bg-white dark:bg-[#1a1a1a] rounded-[2.5rem] p-10 border border-gray-100 dark:border-[#262626] shadow-sm"
        >
          <div className="flex items-center justify-between mb-10">
            <div>
              <h3 className="text-lg font-semibold text-[#044071] dark:text-white tracking-tight">Ecosystem Composition</h3>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1 opacity-70">Category Growth Mapping</p>
            </div>
          </div>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={10} fontWeight={800} axisLine={false} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} fontWeight={800} axisLine={false} tickLine={false} />
                <Tooltip
                  cursor={{ fill: 'rgba(242, 76, 32, 0.05)' }}
                  contentStyle={{ backgroundColor: '#fff', border: 'none', borderRadius: '1.5rem', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', padding: '1rem' }}
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '2rem', fontSize: '10px', fontWeight: 'black', textTransform: 'uppercase', letterSpacing: '0.1em' }} />
                <Bar dataKey="projects" fill="#F24C20" radius={[12, 12, 0, 0]} barSize={20} />
                <Bar dataKey="gigs" fill="#044071" radius={[12, 12, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Strategic Actions Panel */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.1 }}
        className="bg-white dark:bg-[#1a1a1a] rounded-[3rem] p-12 border border-gray-100 dark:border-[#262626] shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-gray-50 dark:bg-white/5 rounded-bl-[5rem] -mr-32 -mt-32" />
        
        <div className="relative z-10">
          <div className="mb-10">
            <h3 className="text-xl font-semibold text-[#044071] dark:text-white tracking-tight">Operational Command Center</h3>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1 opacity-70">Execute Strategic System Protocols</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {[
              { label: 'Authorize Projects', icon: <FolderKanban className="w-4 h-4" />, accent: true },
              { label: 'Verify Entity IDs', icon: <Users className="w-4 h-4" />, accent: true },
              { label: 'Liquidity Ops', icon: <DollarSign className="w-4 h-4" />, accent: false },
              { label: 'Audit Telemetry', icon: <Activity className="w-4 h-4" />, accent: false },
              { label: 'Friction Resolve', icon: <AlertCircle className="w-4 h-4" />, accent: true },
              { label: 'Banners Deploy', icon: <Image className="w-4 h-4" />, accent: false },
              { label: 'Taxonomy Init', icon: <Tags className="w-4 h-4" />, accent: false }
            ].map((action, i) => (
              <motion.button
                key={action.label}
                whileHover={{ scale: 1.05, y: -4 }} whileTap={{ scale: 0.95 }}
                className={`flex flex-col items-center gap-4 p-6 rounded-[2rem] transition-all duration-300 border ${
                  action.accent 
                  ? 'bg-[#F24C20] border-[#F24C20] text-white shadow-xl shadow-orange-500/20' 
                  : 'bg-gray-50/50 dark:bg-[#262626] border-gray-100 dark:border-white/5 text-[#044071] dark:text-gray-300 hover:bg-white'
                }`}
              >
                <div className={`p-3 rounded-xl ${action.accent ? 'bg-white/20' : 'bg-[#044071]/5'}`}>
                  {action.icon}
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-center leading-tight">{action.label}</span>
              </motion.button>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
  );
}

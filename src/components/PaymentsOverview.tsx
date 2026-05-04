import { motion } from 'motion/react';
import { DollarSign, TrendingUp, Percent, RotateCcw } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { revenueData } from '../lib/dummyData';

export function PaymentsOverview() {
  return (
    <div className="max-w-[1300px] mx-auto space-y-10 pb-20 px-6">
      {/* Dynamic Financial Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-gray-100 dark:border-[#262626] pb-8">
        <div>
          <h1 className="text-2xl font-semibold text-[#044071] dark:text-white mb-2 tracking-tight">Financial Operations Telemetry</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm font-medium italic opacity-70">
            "Authorized oversight of global capital flow, commission protocols, and liquidity cycles."
          </p>
        </div>
      </div>

      {/* Financial KPI Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {[
          { label: 'Global Revenue', value: 55000, prefix: '₹', change: '+18.2%', icon: <DollarSign className="w-5 h-5" />, color: 'blue' },
          { label: 'Ecosystem Commission', value: 8250, prefix: '₹', change: '+12.4%', icon: <Percent className="w-5 h-5" />, color: 'green' },
          { label: 'Liquidity Staging', value: 20500, prefix: '₹', change: '-5.2%', icon: <TrendingUp className="w-5 h-5" />, color: 'orange' },
          { label: 'Protocol Reversals', value: 1200, prefix: '₹', change: '+2.1%', icon: <RotateCcw className="w-5 h-5" />, color: 'red' }
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white dark:bg-[#1a1a1a] rounded-[2rem] p-8 border border-gray-100 dark:border-[#262626] group hover:shadow-2xl hover:border-[#F24C20]/10 transition-all duration-500 overflow-hidden relative"
          >
            <div className="flex items-center justify-between mb-8 relative z-10">
              <div className="p-4 rounded-2xl bg-[#044071]/5 text-[#044071] group-hover:bg-[#F24C20] group-hover:text-white transition-all duration-500">
                {stat.icon}
              </div>
              <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${stat.change.startsWith('+') ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-red-50 text-red-600 border border-red-100'}`}>
                {stat.change}
              </div>
            </div>
            <h3 className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] mb-2 opacity-70">{stat.label}</h3>
            <p className="text-2xl font-semibold text-[#044071] dark:text-white tracking-tighter">
              {stat.prefix}{stat.value.toLocaleString()}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Advanced Revenue Dynamics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white dark:bg-[#1a1a1a] rounded-[2.5rem] p-10 border border-gray-100 dark:border-[#262626] shadow-sm"
      >
        <div className="flex items-center justify-between mb-10">
          <div>
            <h3 className="text-lg font-semibold text-[#044071] dark:text-white tracking-tight">Capital Velocity Index</h3>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1 opacity-70">Last 7 Months Performance Analytics</p>
          </div>
        </div>
        <div className="h-[400px]">
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
              <Area 
                type="monotone" 
                dataKey="revenue" 
                stroke="#F24C20" 
                strokeWidth={4} 
                fill="url(#colorRevenue)" 
                dot={{ r: 6, fill: '#fff', stroke: '#F24C20', strokeWidth: 3 }} 
                activeDot={{ r: 8, strokeWidth: 0 }} 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    </div>
  );
}

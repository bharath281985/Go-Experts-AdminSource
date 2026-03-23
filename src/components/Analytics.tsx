import { motion } from 'motion/react';
import { Download, Filter, TrendingUp, Users, Briefcase, DollarSign } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export function Analytics() {
  const userGrowthData = [
    { month: 'Jul', users: 1890 },
    { month: 'Aug', users: 2100 },
    { month: 'Sep', users: 2350 },
    { month: 'Oct', users: 2500 },
    { month: 'Nov', users: 2650 },
    { month: 'Dec', users: 2750 },
    { month: 'Jan', users: 2847 }
  ];

  const categoryData = [
    { name: 'Web Development', value: 450 },
    { name: 'Mobile Dev', value: 280 },
    { name: 'Design', value: 320 },
    { name: 'Marketing', value: 184 }
  ];

  const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Reports & Analytics</h1>
          <p className="text-gray-600 dark:text-gray-400">Comprehensive platform analytics and insights</p>
        </div>
        <div className="flex gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 px-6 py-3 rounded-xl font-medium flex items-center gap-2"
          >
            <Filter className="w-5 h-5" />
            Filter
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium flex items-center gap-2"
          >
            <Download className="w-5 h-5" />
            Export Report
          </motion.button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Revenue', value: '₹8.5M', change: '+23.5%', icon: DollarSign, color: 'blue' },
          { label: 'Active Users', value: '2,847', change: '+12.3%', icon: Users, color: 'green' },
          { label: 'Total Projects', value: '1,234', change: '+18.7%', icon: Briefcase, color: 'purple' },
          { label: 'Conversion Rate', value: '12.4%', change: '+2.8%', icon: TrendingUp, color: 'orange' }
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl bg-${stat.color}-100 dark:bg-${stat.color}-900/20`}>
                <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
              </div>
              <span className="text-sm font-medium text-green-600">{stat.change}</span>
            </div>
            <h3 className="text-gray-600 dark:text-gray-400 text-sm mb-2">{stat.label}</h3>
            <p className="text-2xl font-bold">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700"
        >
          <h3 className="text-lg font-bold mb-6">User Growth</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={userGrowthData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip />
              <Line type="monotone" dataKey="users" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700"
        >
          <h3 className="text-lg font-bold mb-6">Top Categories</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry) => entry.name}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Top Sellers Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700"
      >
        <h3 className="text-lg font-bold mb-6">Top Performing Sellers</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900/50">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold">Rank</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Seller</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Orders</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Revenue</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Rating</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {[
                { name: 'Sarah Johnson', orders: 127, revenue: 45600, rating: 4.8 },
                { name: 'Emma Rodriguez', orders: 89, revenue: 34200, rating: 4.9 },
                { name: 'James Wilson', orders: 98, revenue: 29800, rating: 4.7 }
              ].map((seller, index) => (
                <tr key={index}>
                  <td className="px-6 py-4">
                    <span className="text-lg font-bold text-blue-600">#{index + 1}</span>
                  </td>
                  <td className="px-6 py-4 font-medium">{seller.name}</td>
                  <td className="px-6 py-4">{seller.orders}</td>
                  <td className="px-6 py-4 font-semibold">₹{seller.revenue.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1">
                      <span className="text-yellow-500">★</span>
                      <span className="font-medium">{seller.rating}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}

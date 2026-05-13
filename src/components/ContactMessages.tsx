import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Mail, 
  Trash2, 
  Search, 
  Calendar, 
  User, 
  Phone, 
  MessageSquare, 
  CheckCircle,
  Eye,
  X,
  AlertCircle
} from 'lucide-react';
import api from '../lib/api';
import { toast } from 'sonner';

interface ContactMessage {
  _id: string;
  name: string;
  email: string;
  phoneNumber?: string;
  subject: string;
  message: string;
  createdAt: string;
}

export function ContactMessages() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/contact-messages');
      if (res.data.success) {
        setMessages(res.data.messages);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to fetch messages');
    } finally {
      setLoading(false);
    }
  };

  const deleteMessage = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this message?')) return;
    try {
      const res = await api.delete(`/admin/contact-messages/${id}`);
      if (res.data.success) {
        toast.success('Message deleted');
        setMessages(prev => prev.filter(m => m._id !== id));
        if (selectedMessage?._id === id) setSelectedMessage(null);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete message');
    }
  };

  const filteredMessages = messages.filter(m => 
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.subject.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Contact Inquiries</h1>
          <p className="text-gray-500 text-sm">Review and respond to user messages from the frontend.</p>
        </div>
        
        <div className="relative max-w-sm w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, email or subject..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 dark:border-[#262626] bg-white dark:bg-[#1a1a1a] focus:outline-none focus:ring-2 focus:ring-[#F24C20]"
          />
        </div>
      </div>

      <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl border border-gray-200 dark:border-[#262626] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-100 dark:border-[#262626] bg-gray-50/50 dark:bg-[#262626]/50">
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Sender</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Subject</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Date</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-[#262626]">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4"><div className="h-4 bg-gray-100 dark:bg-[#262626] rounded w-32" /></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-100 dark:bg-[#262626] rounded w-48" /></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-100 dark:bg-[#262626] rounded w-24" /></td>
                    <td className="px-6 py-4"><div className="h-8 bg-gray-100 dark:bg-[#262626] rounded w-20 ml-auto" /></td>
                  </tr>
                ))
              ) : filteredMessages.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500 italic">
                    No inquiries found.
                  </td>
                </tr>
              ) : (
                filteredMessages.map((msg) => (
                  <tr key={msg._id} className="hover:bg-gray-50 dark:hover:bg-[#262626]/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-medium">{msg.name}</span>
                        <span className="text-xs text-gray-500">{msg.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600 dark:text-gray-400 line-clamp-1">
                        {msg.subject}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(msg.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedMessage(msg)}
                          className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/10 rounded-lg transition-colors"
                          title="View Message"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteMessage(msg._id)}
                          className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Message View Modal */}
      <AnimatePresence>
        {selectedMessage && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white dark:bg-[#1a1a1a] rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl border border-gray-200 dark:border-[#262626]"
            >
              <div className="p-6 border-b border-gray-100 dark:border-[#262626] flex items-center justify-between bg-gray-50/50 dark:bg-[#262626]/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#F24C20]/10 flex items-center justify-center text-[#F24C20]">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold">Message Details</h3>
                    <p className="text-xs text-gray-500">ID: {selectedMessage._id}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedMessage(null)}
                  className="p-2 hover:bg-gray-200 dark:hover:bg-[#262626] rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-8 space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">From</label>
                    <div className="flex items-center gap-2 font-medium">
                      <User className="w-4 h-4 text-gray-400" />
                      {selectedMessage.name}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Email</label>
                    <div className="flex items-center gap-2 font-medium">
                      <Mail className="w-4 h-4 text-gray-400" />
                      {selectedMessage.email}
                    </div>
                  </div>
                  {selectedMessage.phoneNumber && (
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Phone</label>
                      <div className="flex items-center gap-2 font-medium">
                        <Phone className="w-4 h-4 text-gray-400" />
                        {selectedMessage.phoneNumber}
                      </div>
                    </div>
                  )}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Date Sent</label>
                    <div className="flex items-center gap-2 font-medium">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      {new Date(selectedMessage.createdAt).toLocaleString()}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Subject</label>
                  <div className="p-4 bg-gray-50 dark:bg-[#262626] rounded-xl font-bold text-[#044071] dark:text-blue-400">
                    {selectedMessage.subject}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Message Body</label>
                  <div className="p-6 bg-gray-50 dark:bg-[#262626] rounded-2xl whitespace-pre-wrap leading-relaxed text-gray-700 dark:text-gray-300 min-h-[150px]">
                    {selectedMessage.message}
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-gray-100 dark:border-[#262626] bg-gray-50/50 dark:bg-[#262626]/50 flex justify-end gap-3">
                <button
                  onClick={() => setSelectedMessage(null)}
                  className="px-6 py-2.5 rounded-xl font-bold bg-gray-200 hover:bg-gray-300 dark:bg-[#262626] dark:hover:bg-[#333] transition-all"
                >
                  Close
                </button>
                <a
                  href={`mailto:${selectedMessage.email}?subject=Re: ${selectedMessage.subject}`}
                  className="px-6 py-2.5 rounded-xl font-bold bg-[#F24C20] text-white hover:bg-orange-600 transition-all flex items-center gap-2 shadow-lg shadow-[#F24C20]/20"
                >
                  <MessageSquare className="w-4 h-4" />
                  Reply via Email
                </a>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

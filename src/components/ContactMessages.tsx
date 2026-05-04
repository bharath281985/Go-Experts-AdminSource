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
    <div className="max-w-[1300px] mx-auto space-y-8 pb-16 px-6">
      {/* Header - Professional Alignment */}
      <div className="flex items-center justify-between border-b border-gray-100 dark:border-[#262626] pb-6 mt-4">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold text-[#044071] dark:text-white mb-1">Contact Inquiries</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Review and manage communication assets from the public marketplace.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Total Inquiries', value: messages.length, color: 'text-[#044071]', icon: <Mail className="w-5 h-5" />, bg: 'bg-[#044071]/5' },
          { label: 'Active View', value: filteredMessages.length, color: 'text-green-600', icon: <CheckCircle className="w-5 h-5" />, bg: 'bg-green-50' },
          { label: 'Strategic Phone', value: messages.filter(m => m.phoneNumber).length, color: 'text-[#F24C20]', icon: <Phone className="w-5 h-5" />, bg: 'bg-[#F24C20]/5' },
        ].map(s => (
          <div key={s.label} className="bg-white dark:bg-[#1a1a1a] rounded-2xl border border-gray-100 dark:border-[#262626] p-6 flex items-center gap-5 hover:shadow-md transition-all">
             <div className={`p-4 rounded-xl ${s.bg} ${s.color}`}>
                {s.icon}
            </div>
            <div>
              <div className={`text-2xl font-bold text-gray-900 dark:text-white leading-none mb-1`}>{s.value}</div>
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl border border-gray-100 dark:border-[#262626] p-4 shadow-sm">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
          <input
            type="text"
            placeholder="Search by name, email or subject taxonomy..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-transparent bg-gray-50/50 dark:bg-[#262626] focus:bg-white dark:focus:bg-[#1a1a1a] focus:ring-2 focus:ring-[#F24C20]/20 transition-all outline-none text-sm font-medium"
          />
        </div>
      </div>

      <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl border border-gray-100 dark:border-[#262626] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left" style={{ minWidth: 760 }}>
            <thead className="bg-gray-50/50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-[#262626]">
              <tr>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-gray-500">Sender Identity</th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-gray-500">Message Subject</th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-gray-500">Timestamp</th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-gray-500 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-[#262626]">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-5"><div className="h-4 bg-gray-100 dark:bg-[#262626] rounded w-32" /></td>
                    <td className="px-6 py-5"><div className="h-4 bg-gray-100 dark:bg-[#262626] rounded w-48" /></td>
                    <td className="px-6 py-5"><div className="h-4 bg-gray-100 dark:bg-[#262626] rounded w-24" /></td>
                    <td className="px-6 py-5"><div className="h-8 bg-gray-100 dark:bg-[#262626] rounded w-20 mx-auto" /></td>
                  </tr>
                ))
              ) : filteredMessages.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-20 text-center">
                    <AlertCircle className="w-12 h-12 text-gray-100 mx-auto mb-3" />
                    <p className="text-gray-400 font-semibold tracking-tight">No inquiries currently recorded.</p>
                  </td>
                </tr>
              ) : (
                filteredMessages.map((msg, i) => (
                  <motion.tr key={msg._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                    className="hover:bg-gray-50/30 transition-all">
                    <td className="px-6 py-5">
                      <div className="flex flex-col">
                        <span className="font-bold text-gray-800 dark:text-gray-200 tracking-tight leading-tight">{msg.name}</span>
                        <span className="text-[10px] text-[#F24C20] font-black uppercase tracking-widest mt-1 opacity-70">{msg.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400 line-clamp-1">
                        {msg.subject}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                      {new Date(msg.createdAt).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => setSelectedMessage(msg)}
                          className="p-2.5 text-[#044071] hover:bg-blue-50 rounded-xl transition-colors"
                          title="View Message"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteMessage(msg._id)}
                          className="p-2.5 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Message View Modal - Professional Reader */}
      <AnimatePresence>
        {selectedMessage && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#044071]/10 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white dark:bg-[#1a1a1a] rounded-[2.5rem] w-full max-w-3xl max-h-[90vh] overflow-hidden shadow-2xl border border-white/20"
            >
              <div className="p-10 border-b border-gray-50 dark:border-[#262626] flex items-center justify-between bg-gray-50/30 dark:bg-[#262626]/50">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#044071] to-[#0a5ea3] flex items-center justify-center text-white shadow-inner">
                    <Mail className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-[#044071] dark:text-white">Inquiry Details</h3>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mt-1">Ref: {selectedMessage._id.slice(-8)}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedMessage(null)}
                  className="p-3 hover:bg-gray-200 dark:hover:bg-[#262626] rounded-full transition-colors"
                >
                  <X className="w-6 h-6 text-gray-400" />
                </button>
              </div>

              <div className="p-10 space-y-8 overflow-y-auto max-h-[calc(90vh-200px)]">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-1">Sender</label>
                    <div className="flex items-center gap-3 font-bold text-gray-800 dark:text-gray-200 bg-gray-50/50 p-4 rounded-xl">
                      <User className="w-4 h-4 text-[#F24C20]" />
                      {selectedMessage.name}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-1">Communication Channel</label>
                    <div className="flex items-center gap-3 font-bold text-gray-800 dark:text-gray-200 bg-gray-50/50 p-4 rounded-xl">
                      <Mail className="w-4 h-4 text-[#F24C20]" />
                      {selectedMessage.email}
                    </div>
                  </div>
                  {selectedMessage.phoneNumber && (
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-1">Direct Line</label>
                      <div className="flex items-center gap-3 font-bold text-gray-800 dark:text-gray-200 bg-gray-50/50 p-4 rounded-xl">
                        <Phone className="w-4 h-4 text-[#F24C20]" />
                        {selectedMessage.phoneNumber}
                      </div>
                    </div>
                  )}
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-1">Strategic Timestamp</label>
                    <div className="flex items-center gap-3 font-bold text-gray-800 dark:text-gray-200 bg-gray-50/50 p-4 rounded-xl">
                      <Calendar className="w-4 h-4 text-[#F24C20]" />
                      {new Date(selectedMessage.createdAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-1">Inquiry Subject</label>
                  <div className="p-5 bg-[#044071]/5 border border-[#044071]/10 rounded-2xl font-bold text-[#044071] dark:text-blue-400 text-lg">
                    {selectedMessage.subject}
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-1">Manuscript Body</label>
                  <div className="p-8 bg-gray-50/50 dark:bg-[#262626] rounded-[2rem] whitespace-pre-wrap leading-relaxed text-gray-600 dark:text-gray-300 font-medium italic min-h-[200px]">
                    "{selectedMessage.message}"
                  </div>
                </div>
              </div>

              <div className="p-8 border-t border-gray-50 dark:border-[#262626] bg-gray-50/30 dark:bg-[#262626]/50 flex justify-end gap-4">
                <button
                  onClick={() => setSelectedMessage(null)}
                  className="px-8 py-3.5 rounded-xl font-bold text-gray-400 hover:text-gray-600 transition-all uppercase tracking-widest text-[10px]"
                >
                  Close Reader
                </button>
                <a
                  href={`mailto:${selectedMessage.email}?subject=Re: ${selectedMessage.subject}`}
                  className="px-10 py-3.5 rounded-xl font-bold bg-[#F24C20] text-white hover:bg-orange-600 transition-all flex items-center gap-3 shadow-xl shadow-[#F24C20]/20"
                >
                  <MessageSquare className="w-5 h-5" />
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

import { useState } from 'react';
import logoFallback from '../assets/logo.png';
import { useSiteSettings } from '../context/SiteSettingsContext';
import { motion, AnimatePresence } from 'motion/react';
import {
  LayoutDashboard,
  Users,
  FolderKanban,
  Briefcase,
  Rocket,
  Lightbulb,
  Wallet,
  Scale,
  FileText,
  Tags,
  BarChart3,
  Settings,
  LogOut,
  Search,
  Bell,
  Moon,
  Sun,
  Menu,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  AlertCircle,
  ShoppingBag,
  DollarSign,
  Percent,
  RotateCcw,
  FileCheck,
  Grid3x3,
  MessageSquare,
  Home,
  Image,
  Mail,
  Crown
} from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  currentPage: string;
  onNavigate: (page: string) => void;
  onLogout: () => void;
  adminUser?: { full_name?: string; email?: string; roles?: string[] } | null;
  notificationCount: number;
  onClearNotifications: () => void;
}

interface MenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  submenu?: { id: string; label: string; icon: React.ReactNode }[];
}

export function AdminLayout({ 
  children, 
  darkMode, 
  onToggleDarkMode, 
  currentPage, 
  onNavigate, 
  onLogout, 
  adminUser,
  notificationCount,
  onClearNotifications
}: AdminLayoutProps) {
  const { settings } = useSiteSettings();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [expandedMenus, setExpandedMenus] = useState<string[]>(['users', 'projects', 'gigs', 'transactions', 'subscriptions', 'disputes', 'content', 'taxonomies', 'startup-ideas']);
  const [showAdminCard, setShowAdminCard] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const logoUrl = settings.site_logo ? (settings.site_logo.startsWith('http') ? settings.site_logo : `${apiUrl}${settings.site_logo}`) : logoFallback;

  const menuItems: MenuItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard className="w-5 h-5" />
    },
    {
      id: 'users',
      label: 'User Management ',
      icon: <Users className="w-5 h-5" />,
      submenu: [
        { id: 'users', label: 'Users/Customers', icon: <Users className="w-4 h-4" /> }
      ]
    },
    {
      id: 'projects',
      label: 'Projects',
      icon: <FolderKanban className="w-5 h-5" />,
      submenu: [
        { id: 'projects', label: 'Project Listings', icon: <ClipboardList className="w-4 h-4" /> },
        { id: 'proposals', label: 'Proposals Overview', icon: <FileText className="w-4 h-4" /> }
      ]
    },
    {
      id: 'startup-ideas',
      label: 'Startup Ideas',
      icon: <Rocket className="w-5 h-5" />,
      submenu: [
        { id: 'startup-ideas', label: 'Manage Ideas', icon: <Lightbulb className="w-4 h-4" /> },
        { id: 'startup-categories', label: 'Idea Categories', icon: <Grid3x3 className="w-4 h-4" /> },
        { id: 'startup-ideas-faq', label: 'Startup Ideas FAQ', icon: <MessageSquare className="w-4 h-4" /> },
        { id: 'startup-ideas-terms', label: 'Terms & Conditions', icon: <Scale className="w-4 h-4" /> },
        { id: 'startup-ideas-privacy', label: 'Privacy Policy', icon: <FileCheck className="w-4 h-4" /> },
        { id: 'investor-meetings', label: 'Investor Meetings', icon: <Briefcase className="w-4 h-4" /> },
        { id: 'investor-opportunities', label: 'Opportunities Tracking', icon: <ClipboardList className="w-4 h-4" /> }
      ]
    },
    {
      id: 'subscriptions',
      label: 'Subscriptions',
      icon: <Crown className="w-5 h-5" />,
      submenu: [
        { id: 'subscriptions', label: 'Plans & Management', icon: <Crown className="w-4 h-4" /> },
      ]
    },
    {
      id: 'transactions',
      label: 'Transactions',
      icon: <Wallet className="w-5 h-5" />,
      submenu: [
        { id: 'withdraw-requests', label: 'Withdrawal Requests', icon: <Wallet className="w-4 h-4" /> },
      ]
    },
    {
      id: 'disputes',
      label: 'Disputes',
      icon: <Scale className="w-5 h-5" />,
      submenu: [
        { id: 'disputes', label: 'Active Disputes', icon: <AlertCircle className="w-4 h-4" /> },
        { id: 'resolved-disputes', label: 'Resolved Cases', icon: <FileCheck className="w-4 h-4" /> }
      ]
    },
    {
      id: 'content',
      label: 'Content (CMS)',
      icon: <FileText className="w-5 h-5" />,
      submenu: [
        { id: 'pages', label: 'Pages Management', icon: <FileText className="w-4 h-4" /> },
        { id: 'contact-messages', label: 'Contact Inquiries', icon: <Mail className="w-4 h-4" /> },
        { id: 'menus', label: 'Menus Management', icon: <Menu className="w-4 h-4" /> },
        { id: 'banners', label: 'Banners & Hero', icon: <Image className="w-4 h-4" /> },
        { id: 'faqs', label: 'FAQs Management', icon: <MessageSquare className="w-4 h-4" /> },
        { id: 'testimonials', label: 'Testimonials', icon: <MessageSquare className="w-4 h-4" /> },
        { id: 'registration-steps', label: 'Registration Steps', icon: <ClipboardList className="w-4 h-4" /> }
      ]
    },
    {
      id: 'taxonomies',
      label: 'Taxonomies',
      icon: <Tags className="w-5 h-5" />,
      submenu: [
        { id: 'categories', label: 'Categories', icon: <Grid3x3 className="w-4 h-4" /> },
        { id: 'skills', label: 'Skills & Tags', icon: <Tags className="w-4 h-4" /> },
        { id: 'languages', label: 'Languages', icon: <MessageSquare className="w-4 h-4" /> }
      ]
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: <BarChart3 className="w-5 h-5" />,
      submenu: [
        { id: 'analytics', label: 'Analytics Dashboard', icon: <BarChart3 className="w-4 h-4" /> },
      ]
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: <Settings className="w-5 h-5" />,
      submenu: [
        { id: 'global-settings', label: 'Global Branding', icon: <Home className="w-4 h-4" /> },
        { id: 'email-settings', label: 'Email Templates', icon: <Mail className="w-4 h-4" /> },
        { id: 'admin-profile', label: 'Admin Security', icon: <Settings className="w-4 h-4" /> }
      ]
    }
  ];

  const toggleMenu = (id: string) => {
    setExpandedMenus(prev =>
      prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
    );
  };

  return (
    <div className={`h-screen flex flex-col ${darkMode ? 'dark bg-[#0a0a0a]' : 'bg-[#f8fafc]'} overflow-hidden font-sans`}>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed top-0 left-0 right-0 z-[100000] ${
          darkMode 
          ? 'bg-[#1a1a1a]/80 border-[#262626]' 
          : 'bg-white/80 border-gray-200'
        } backdrop-blur-2xl border-b shadow-[0_4px_30px_rgba(0,0,0,0.03)] transition-all duration-500`}
        style={{ zIndex: 100000 }}
      >
        <div className="flex items-center justify-between px-8 h-16 max-w-[1920px] mx-auto">
          <div className="flex items-center gap-6">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2.5 hover:bg-gray-100 dark:hover:bg-[#262626] rounded-xl transition-all duration-300 group"
            >
              <Menu className="w-5 h-5 text-gray-500 group-hover:text-[#F24C20] transition-colors" />
            </button>
            <div className="flex items-center gap-3">
              <div className="p-1.5 bg-[#F24C20]/5 rounded-xl border border-[#F24C20]/10">
                <img src={logoUrl} alt="Go Experts" className="h-7 w-auto" />
              </div>
            </div>
          </div>

          <div className="hidden lg:flex flex-1 max-w-2xl mx-12">
            <div className="relative w-full group">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#F24C20] transition-colors" />
              <input
                type="text"
                placeholder="Intelligence Search: Concepts, Entities, Transactions..."
                className={`w-full pl-12 pr-4 py-2.5 rounded-2xl text-sm font-medium ${
                  darkMode
                  ? 'bg-[#262626]/50 border-[#262626] text-white placeholder:text-gray-600'
                  : 'bg-gray-50 border-gray-100 text-gray-900 placeholder:text-gray-400'
                  } border focus:outline-none focus:ring-4 focus:ring-[#F24C20]/5 focus:border-[#F24C20]/30 transition-all`}
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={onToggleDarkMode}
              className="p-2.5 hover:bg-gray-100 dark:hover:bg-[#262626] rounded-xl transition-all border border-transparent hover:border-gray-200 dark:hover:border-[#333]"
            >
              {darkMode ? <Sun className="w-5 h-5 text-orange-400" /> : <Moon className="w-5 h-5 text-[#044071]" />}
            </motion.button>

            <div className="relative">
              <motion.button 
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={() => setShowNotifications(!showNotifications)}
                className={`relative p-2.5 hover:bg-gray-100 dark:hover:bg-[#262626] rounded-xl transition-all border border-transparent ${
                  showNotifications ? 'bg-gray-100 dark:bg-[#262626] border-gray-200 dark:border-[#333]' : ''
                }`}
              >
                <Bell className="w-5 h-5 text-gray-500" />
                {notificationCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }} animate={{ scale: 1 }}
                    className="absolute top-2 right-2 w-2.5 h-2.5 bg-[#F24C20] border-2 border-white dark:border-[#1a1a1a] rounded-full shadow-sm shadow-orange-500/50"
                  />
                )}
              </motion.button>
            </div>

            <div
              className="relative flex items-center gap-3 pl-4 border-l border-gray-100 dark:border-[#262626] cursor-pointer group"
              onMouseEnter={() => setShowAdminCard(true)}
              onMouseLeave={() => setShowAdminCard(false)}
            >
              <div className="flex flex-col items-end text-right">
                <span className="hidden sm:block text-[11px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">
                  Security Ops
                </span>
                <span className="hidden sm:block text-sm font-semibold truncate max-w-[120px] text-[#044071] dark:text-white">
                  {adminUser?.full_name?.split(' ')[0] || 'Admin'}
                </span>
              </div>
              <div className="relative">
                <img
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${adminUser?.full_name || 'Admin'}`}
                  alt="Admin"
                  className="w-10 h-10 rounded-2xl border-2 border-[#F24C20]/20 p-0.5 group-hover:border-[#F24C20]/50 transition-all duration-300"
                />
                <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-white dark:border-[#1a1a1a] rounded-full" />
              </div>

              <AnimatePresence>
                {showAdminCard && (
                  <motion.div
                    initial={{ opacity: 0, y: 12, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 12, scale: 0.95 }}
                    className={`absolute top-full right-0 mt-4 w-72 ${
                      darkMode ? 'bg-[#1a1a1a]/95 border-[#333]' : 'bg-white/95 border-gray-100'
                    } backdrop-blur-2xl border rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.2)] z-[100001] p-6`}
                  >
                    <div className="flex items-center gap-4 mb-6">
                      <img
                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${adminUser?.full_name || 'Admin'}`}
                        alt="Admin"
                        className="w-16 h-16 rounded-[1.5rem] border-2 border-[#F24C20]/20"
                      />
                      <div className="min-w-0">
                        <p className="font-bold text-base truncate text-[#044071] dark:text-white leading-tight">{adminUser?.full_name || 'Administrator'}</p>
                        <p className="text-gray-500 text-xs truncate mt-1">{adminUser?.email || ''}</p>
                        <div className="inline-flex mt-2.5 px-3 py-1 bg-orange-50 dark:bg-orange-500/10 text-[#F24C20] text-[9px] font-black rounded-full uppercase tracking-widest border border-orange-100 dark:border-orange-500/20">Authorized Ops</div>
                      </div>
                    </div>
                    <div className="space-y-1 pt-4 border-t border-gray-50 dark:border-[#333]">
                      <button
                        onClick={onLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-2xl text-xs font-black uppercase tracking-widest transition-all"
                      >
                        <LogOut className="w-4 h-4" />
                        Terminate Session
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {showNotifications && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className={`${
              darkMode ? 'bg-[#1a1a1a]/95 border-[#333]' : 'bg-white/95 border-gray-100'
            } backdrop-blur-2xl border rounded-[2.5rem] shadow-[0_20px_60px_rgba(0,0,0,0.25)] overflow-hidden`}
            style={{
              position: 'fixed',
              top: '80px',
              right: '32px',
              width: '440px',
              zIndex: 2147483647
            }}
          >
            <div className="p-6 border-b border-gray-50 dark:border-[#333] flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-[#044071] dark:text-white">Active Notifications</h3>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Ecosystem Telemetry</p>
              </div>
              <button
                onClick={() => {
                  onClearNotifications();
                  setShowNotifications(false);
                }}
                className="px-4 py-2 text-[10px] uppercase tracking-widest font-black text-[#F24C20] hover:bg-orange-50 dark:hover:bg-orange-500/10 rounded-xl transition-all"
              >
                Clear Protocol
              </button>
            </div>
            <div className="max-h-[500px] overflow-y-auto scrollbar-hide">
              {notificationCount === 0 ? (
                <div className="p-12 text-center">
                  <div className="w-16 h-16 bg-gray-50 dark:bg-white/5 rounded-[2rem] flex items-center justify-center mx-auto mb-4">
                    <Bell className="w-8 h-8 text-gray-300 opacity-50" />
                  </div>
                  <p className="text-gray-400 text-[11px] font-black uppercase tracking-widest">Protocol Signal Clear</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-50 dark:divide-[#333]">
                  <div className="p-6 hover:bg-gray-50/50 dark:hover:bg-white/5 cursor-pointer transition-all">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center border border-blue-100 dark:border-blue-500/20">
                        <Users className="w-5 h-5 text-blue-500" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-[#044071] dark:text-white leading-tight">New Entity Deployment</p>
                        <p className="text-xs text-gray-500 mt-1">A new professional entity has successfully initialized on the grid.</p>
                        <p className="text-[9px] font-black text-[#F24C20] uppercase tracking-widest mt-3 opacity-70">Timestamp: 04:22 UTC</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-6 hover:bg-gray-50/50 dark:hover:bg-white/5 cursor-pointer transition-all">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-green-50 dark:bg-green-500/10 flex items-center justify-center border border-green-100 dark:border-green-500/20">
                        <DollarSign className="w-5 h-5 text-green-500" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-[#044071] dark:text-white leading-tight">Capital Sync Success</p>
                        <p className="text-xs text-gray-500 mt-1">Premium protocol subscription authorized for entity identity #4922.</p>
                        <p className="text-[9px] font-black text-[#F24C20] uppercase tracking-widest mt-3 opacity-70">Timestamp: 03:15 UTC</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ type: 'spring', damping: 25, stiffness: 120 }}
            className={`fixed left-0 top-16 bottom-0 w-72 ${
              darkMode ? 'bg-[#1a1a1a]/95 border-[#262626]' : 'bg-white/95 border-gray-100'
            } backdrop-blur-2xl border-r overflow-y-auto z-40 scrollbar-hide select-none pt-4 shadow-[10px_0_40px_rgba(0,0,0,0.02)]`}
          >
            <nav className="p-6 space-y-2">
              <div className="mb-6 px-3">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Core Ecosystem</p>
              </div>
              
              {menuItems.map(item => (
                <div key={item.id} className="relative">
                  {item.submenu ? (
                    <>
                      <button
                        onClick={() => toggleMenu(item.id)}
                        className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all duration-300 group ${
                          currentPage === item.id || item.submenu.some(s => s.id === currentPage)
                          ? 'bg-[#F24C20] text-white shadow-lg shadow-orange-500/25'
                          : darkMode
                            ? 'hover:bg-white/5 text-gray-400'
                            : 'hover:bg-gray-100/80 text-gray-600'
                          }`}
                      >
                        <div className="flex items-center gap-3.5">
                          <div className={`p-1.5 rounded-lg transition-colors ${
                            currentPage === item.id || item.submenu.some(s => s.id === currentPage) ? 'bg-white/20' : 'bg-gray-500/5 group-hover:bg-[#F24C20]/10'
                          }`}>
                            {item.icon}
                          </div>
                          <span className="text-[13px] font-semibold tracking-tight">{item.label}</span>
                        </div>
                        <ChevronRight className={`w-4 h-4 transition-transform duration-300 ${expandedMenus.includes(item.id) ? 'rotate-90' : ''}`} />
                      </button>
                      <AnimatePresence>
                        {expandedMenus.includes(item.id) && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="ml-6 mt-2 space-y-1.5 border-l-2 border-gray-100 dark:border-[#262626] pl-4"
                          >
                            {item.submenu.map(subItem => (
                              <button
                                key={subItem.id}
                                onClick={() => onNavigate(subItem.id)}
                                className={`w-full flex items-center gap-3.5 px-4 py-2.5 rounded-xl text-[13px] font-medium transition-all group ${
                                  currentPage === subItem.id
                                  ? 'text-[#F24C20] bg-[#F24C20]/5'
                                  : darkMode
                                    ? 'text-gray-500 hover:text-white hover:bg-white/5'
                                    : 'text-gray-500 hover:text-[#044071] hover:bg-gray-100'
                                  }`}
                              >
                                <div className={`w-1.5 h-1.5 rounded-full transition-all ${currentPage === subItem.id ? 'bg-[#F24C20] scale-125' : 'bg-gray-300 dark:bg-gray-700 group-hover:bg-[#F24C20]'}`} />
                                <span className="tracking-tight">{subItem.label}</span>
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </>
                  ) : (
                    <button
                      onClick={() => onNavigate(item.id)}
                      className={`w-full flex items-center gap-3.5 px-4 py-3.5 rounded-2xl transition-all duration-300 group ${
                        currentPage === item.id
                        ? 'bg-[#F24C20] text-white shadow-lg shadow-orange-500/25'
                        : darkMode
                          ? 'hover:bg-white/5 text-gray-400'
                          : 'hover:bg-gray-100/80 text-gray-600'
                        }`}
                    >
                      <div className={`p-1.5 rounded-lg transition-colors ${
                        currentPage === item.id ? 'bg-white/20' : 'bg-gray-500/5 group-hover:bg-[#F24C20]/10'
                      }`}>
                        {item.icon}
                      </div>
                      <span className="text-[13px] font-semibold tracking-tight">{item.label}</span>
                    </button>
                  )}
                </div>
              ))}

              <div className="pt-8 px-3">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Protocol Control</p>
              </div>

              <button
                onClick={onLogout}
                className={`w-full flex items-center gap-3.5 px-4 py-4 rounded-2xl transition-all group border-2 border-transparent ${
                  darkMode
                  ? 'hover:bg-red-500/5 hover:border-red-500/20 text-red-400/80'
                  : 'hover:bg-red-50 hover:border-red-100 text-red-500'
                }`}
              >
                <div className="p-1.5 bg-red-500/10 rounded-lg group-hover:bg-red-500 text-red-500 group-hover:text-white transition-all">
                  <LogOut className="w-4 h-4" />
                </div>
                <span className="text-[11px] font-black uppercase tracking-widest">Terminate Ops</span>
              </button>
            </nav>
          </motion.aside>
        )}
      </AnimatePresence>

      <div className="flex-1 flex overflow-hidden">
        <main className={`flex-1 pt-16 transition-all duration-500 ${sidebarOpen ? 'ml-72' : 'ml-0'} overflow-y-auto h-full scrollbar-hide`}>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="p-8 lg:p-12 min-h-full"
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}

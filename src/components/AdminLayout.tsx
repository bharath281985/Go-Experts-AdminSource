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
    <div className={`h-screen flex flex-col ${darkMode ? 'dark bg-[#0a0a0a]' : 'bg-white'} overflow-hidden`}>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed top-0 left-0 right-0 z-[100000] ${darkMode ? 'bg-[#1a1a1a]/80 border-[#262626]' : 'bg-white/80'
          } backdrop-blur-xl border-b shadow-sm`}
        style={{ zIndex: 100000 }}
      >
        <div className="flex items-center justify-between px-6 h-16">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-[#262626] rounded-lg transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <img src={logoUrl} alt="Go Experts" className="h-8 w-auto" />
            </div>
          </div>

          <div className="hidden md:flex flex-1 max-w-xl mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search users, projects, gigs..."
                className={`w-full pl-10 pr-4 py-2 rounded-lg ${darkMode
                  ? 'bg-[#262626] border-[#262626] text-white'
                  : 'bg-gray-50 border-gray-200'
                  } border focus:outline-none focus:ring-2 focus:ring-[#F24C20]`}
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onToggleDarkMode}
              className="p-2 hover:bg-gray-100 dark:hover:bg-[#262626] rounded-lg transition-colors"
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            <div className="relative">
              <button 
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  if (!showNotifications && notificationCount > 0) {
                    // We can clear on open or have a button inside
                  }
                }}
                className={`relative p-2 hover:bg-gray-100 dark:hover:bg-[#262626] rounded-lg transition-colors ${showNotifications ? 'bg-gray-100 dark:bg-[#262626]' : ''}`}
              >
                <Bell className="w-5 h-5" />
                {notificationCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-[#F24C20] text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-[#1a1a1a]"
                  >
                    {notificationCount}
                  </motion.span>
                )}
              </button>

            </div>

            <div
              className="relative flex items-center gap-2 pl-3 border-l dark:border-[#262626] cursor-pointer"
              onMouseEnter={() => setShowAdminCard(true)}
              onMouseLeave={() => setShowAdminCard(false)}
            >
              <img
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${adminUser?.full_name || 'Admin'}`}
                alt="Admin"
                className="w-8 h-8 rounded-full border-2 border-[#F24C20]/40"
              />
              <span className="hidden sm:block text-sm font-medium truncate max-w-[120px]">
                {adminUser?.full_name || 'Admin'}
              </span>

              <AnimatePresence>
                {showAdminCard && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full right-4 mt-4 w-64 bg-[#1a1a1a] border border-[#333] rounded-2xl shadow-2xl z-[100001] p-4"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <img
                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${adminUser?.full_name || 'Admin'}`}
                        alt="Admin"
                        className="w-12 h-12 rounded-full border-2 border-[#F24C20]/40"
                      />
                      <div className="min-w-0">
                        <p className="text-white font-bold text-sm truncate">{adminUser?.full_name || 'Administrator'}</p>
                        <p className="text-gray-400 text-xs truncate">{adminUser?.email || ''}</p>
                        <span className="inline-block mt-1 px-2 py-0.5 bg-[#F24C20]/10 text-[#F24C20] text-[10px] font-bold rounded-full uppercase tracking-wider">Admin</span>
                      </div>
                    </div>
                    <div className="border-t border-[#333] pt-3">
                      <button
                        onClick={onLogout}
                        className="w-full flex items-center gap-2 px-3 py-2 text-red-400 hover:bg-red-900/20 rounded-xl text-sm font-medium transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
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
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="bg-[#1a1a1a] border border-[#333] rounded-2xl shadow-2xl overflow-hidden"
            style={{
              position: 'fixed',
              top: '80px',
              right: '24px',
              width: '420px',
              zIndex: 2147483647
            }}
          >
            <div className="p-4 border-b border-[#333] flex items-center justify-between gap-4">
              <h3 className="text-white font-bold text-sm whitespace-nowrap">Notifications</h3>
              <button
                onClick={() => {
                  onClearNotifications();
                  setShowNotifications(false);
                }}
                className="text-[10px] uppercase tracking-wider font-bold text-[#F24C20] hover:text-[#ff6b4a] transition-colors whitespace-nowrap"
              >
                Clear All
              </button>
            </div>
            <div className="max-h-[400px] overflow-y-auto">
              {notificationCount === 0 ? (
                <div className="p-8 text-center">
                  <Bell className="w-8 h-8 text-gray-600 mx-auto mb-2 opacity-20" />
                  <p className="text-gray-500 text-xs">No new notifications</p>
                </div>
              ) : (
                <div className="divide-y divide-[#333]">
                  <div className="p-4 hover:bg-[#262626] cursor-pointer transition-colors">
                    <p className="text-white text-xs font-medium mb-1">New User Registered</p>
                    <p className="text-gray-400 text-[10px]">A new freelancer just joined the platform.</p>
                    <p className="text-gray-600 text-[9px] mt-2">Just now</p>
                  </div>
                  <div className="p-4 hover:bg-[#262626] cursor-pointer transition-colors">
                    <p className="text-white text-xs font-medium mb-1">Payment Received</p>
                    <p className="text-gray-400 text-[10px]">Premium subscription purchased by John Doe.</p>
                    <p className="text-gray-600 text-[9px] mt-2">5 mins ago</p>
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
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: 'spring', damping: 20 }}
            className={`fixed left-0 top-16 bottom-0 w-64 ${darkMode ? 'bg-[#1a1a1a] border-[#262626]' : 'bg-white border-gray-200'
              } border-r overflow-y-auto z-40 scrollbar-hide select-none`}
          >
            <nav className="p-4 space-y-1">
              {menuItems.map(item => (
                <div key={item.id}>
                  {item.submenu ? (
                    <>
                      <button
                        onClick={() => toggleMenu(item.id)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${currentPage === item.id || item.submenu.some(s => s.id === currentPage)
                          ? 'bg-[#F24C20] text-white'
                          : darkMode
                            ? 'hover:bg-[#262626] text-gray-300'
                            : 'hover:bg-gray-100 text-gray-700'
                          }`}
                      >
                        <div className="flex items-center gap-3">
                          {item.icon}
                          <span className="text-sm font-medium">{item.label}</span>
                        </div>
                        {expandedMenus.includes(item.id) ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                      </button>
                      <AnimatePresence>
                        {expandedMenus.includes(item.id) && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="ml-4 mt-1 space-y-1"
                          >
                            {item.submenu.map(subItem => (
                              <button
                                key={subItem.id}
                                onClick={() => onNavigate(subItem.id)}
                                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${currentPage === subItem.id
                                  ? 'bg-[#F24C20] text-white'
                                  : darkMode
                                    ? 'hover:bg-[#262626] text-gray-400'
                                    : 'hover:bg-gray-100 text-gray-600'
                                  }`}
                              >
                                {subItem.icon}
                                <span>{subItem.label}</span>
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </>
                  ) : (
                    <button
                      onClick={() => onNavigate(item.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${currentPage === item.id
                        ? 'bg-[#F24C20] text-white'
                        : darkMode
                          ? 'hover:bg-[#262626] text-gray-300'
                          : 'hover:bg-gray-100 text-gray-700'
                        }`}
                    >
                      {item.icon}
                      <span className="text-sm font-medium">{item.label}</span>
                    </button>
                  )}
                </div>
              ))}

              <button
                onClick={onLogout}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg mt-4 transition-colors ${
                  darkMode
                  ? 'hover:bg-red-900/20 text-red-400'
                  : 'hover:bg-red-50 text-red-600'
                }`}
              >
                <LogOut className="w-5 h-5" />
                <span className="text-sm font-medium">Logout</span>
              </button>
            </nav>
          </motion.aside>
        )}
      </AnimatePresence>

      <div className="flex-1 flex overflow-hidden">
        <main className={`flex-1 pt-16 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-0'} overflow-y-auto h-full`}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="p-6"
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}

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
  UserCheck,
  UserX,
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
}

interface MenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  submenu?: { id: string; label: string; icon: React.ReactNode }[];
}

export function AdminLayout({ children, darkMode, onToggleDarkMode, currentPage, onNavigate }: AdminLayoutProps) {
  const { settings } = useSiteSettings();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [expandedMenus, setExpandedMenus] = useState<string[]>(['users', 'projects', 'gigs', 'transactions', 'subscriptions', 'disputes', 'content', 'taxonomies']);
  const [notificationCount] = useState(5);

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
        { id: 'users', label: 'Users/Customers', icon: <Users className="w-4 h-4" /> },
      ]
    },
    {
      id: 'projects',
      label: 'Projects',
      icon: <FolderKanban className="w-5 h-5" />,
      submenu: [
        { id: 'projects', label: 'Project Listings', icon: <ClipboardList className="w-4 h-4" /> },
        { id: 'pending-approvals', label: 'Pending Approvals', icon: <AlertCircle className="w-4 h-4" /> },
        { id: 'proposals', label: 'Proposals Overview', icon: <FileText className="w-4 h-4" /> }
      ]
    },
    // {
    //   id: 'gigs',
    //   label: 'Gigs',
    //   icon: <Briefcase className="w-5 h-5" />,
    //   submenu: [
    //     { id: 'gigs', label: 'Gig Listings', icon: <ShoppingBag className="w-4 h-4" /> },
    //     { id: 'gig-orders', label: 'Gig Orders', icon: <ClipboardList className="w-4 h-4" /> },
    //     { id: 'gig-approvals', label: 'Gig Approvals', icon: <FileCheck className="w-4 h-4" /> }
    //   ]
    // },
    {
      id: 'startup-ideas',
      label: 'Startup Ideas',
      icon: <Rocket className="w-5 h-5" />,
      submenu: [
        { id: 'startup-ideas', label: 'Manage Ideas', icon: <Lightbulb className="w-4 h-4" /> },
        { id: 'startup-categories', label: 'Idea Categories', icon: <Grid3x3 className="w-4 h-4" /> },
        { id: 'startup-ideas-faq', label: 'Startup Ideas FAQ', icon: <MessageSquare className="w-4 h-4" /> },
        { id: 'startup-ideas-terms', label: 'Terms & Conditions', icon: <Scale className="w-4 h-4" /> },
        { id: 'startup-ideas-privacy', label: 'Privacy Policy', icon: <FileCheck className="w-4 h-4" /> }
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
    /* {
      id: 'transactions',
      label: 'Transactions',
      icon: <Wallet className="w-5 h-5" />,
      submenu: [
        { id: 'payments', label: 'Payments Overview', icon: <DollarSign className="w-4 h-4" /> },
        { id: 'withdraw-requests', label: 'Withdrawal Requests', icon: <Wallet className="w-4 h-4" /> },
        { id: 'commission', label: 'Commission Settings', icon: <Percent className="w-4 h-4" /> },
        { id: 'refunds', label: 'Refunds/Chargebacks', icon: <RotateCcw className="w-4 h-4" /> },
        { id: 'payment-methods', label: 'Payment Gateways', icon: <Grid3x3 className="w-4 h-4" /> }
      ]
    }, */
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
    <div className={`min-h-screen ${darkMode ? 'dark bg-[#0a0a0a]' : 'bg-white'}`}>
      {/* Glassmorphic Header */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed top-0 left-0 right-0 z-50 ${darkMode ? 'bg-[#1a1a1a]/80 border-[#262626]' : 'bg-white/80'
          } backdrop-blur-xl border-b shadow-sm`}
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
              {/* <h1 className="text-xl font-bold text-[#044071] dark:text-white">GoExperts</h1> */}
            </div>
          </div>

          {/* Search Bar */}
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

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={onToggleDarkMode}
              className="p-2 hover:bg-gray-100 dark:hover:bg-[#262626] rounded-lg transition-colors"
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            <button className="relative p-2 hover:bg-gray-100 dark:hover:bg-[#262626] rounded-lg transition-colors">
              <Bell className="w-5 h-5" />
              {notificationCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-1 right-1 w-2 h-2 bg-[#F24C20] rounded-full"
                />
              )}
            </button>

            <div className="flex items-center gap-2 pl-3 border-l dark:border-[#262626]">
              <img
                src="https://api.dicebear.com/7.x/avataaars/svg?seed=Admin"
                alt="Admin"
                className="w-8 h-8 rounded-full"
              />
              <span className="hidden sm:block text-sm font-medium">Admin</span>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: 'spring', damping: 20 }}
            className={`fixed left-0 top-16 bottom-0 w-64 ${darkMode ? 'bg-[#1a1a1a] border-[#262626]' : 'bg-white border-gray-200'
              } border-r overflow-y-auto z-40`}
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
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg mt-4 transition-colors ${darkMode
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

      {/* Main Content */}
      <main className={`pt-16 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-0'}`}>
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
  );
}

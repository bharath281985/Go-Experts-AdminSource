import React, { useState, useEffect } from 'react';
import { Toaster } from 'sonner';
import { AdminLayout } from './components/AdminLayout';
import { Dashboard } from './components/Dashboard';
import { UsersList } from './components/UsersList';
import { AddUser } from './components/AddUser';
import { UserProfile } from './components/UserProfile';
import { ProjectsList } from './components/ProjectsList';
import { ProjectDetails } from './components/ProjectDetails';
import { GigsList } from './components/GigsList';
import { GigOrders } from './components/GigOrders';
import { GigOrderDetails } from './components/GigOrderDetails';
import { PaymentsOverview } from './components/PaymentsOverview';
import { WithdrawRequests } from './components/WithdrawRequests';
import { CommissionSettings } from './components/CommissionSettings';
import { PaymentMethods } from './components/PaymentMethods';
import { DisputesList } from './components/DisputesList';
import { DisputeDetails } from './components/DisputeDetails';
import { PagesManagement } from './components/PagesManagement';
import { ContactMessages } from './components/ContactMessages';
import { MenusManagement } from './components/MenusManagement';
import { GlobalSettings } from './components/GlobalSettings';
import { EmailSettings } from './components/EmailSettings';
import { Categories } from './components/Categories';
import { Skills } from './components/Skills';
import { Languages } from './components/Languages';
import { Analytics } from './components/Analytics';
import { AdminProfile } from './components/AdminProfile';
import { SubscriptionsManagement } from './components/SubscriptionsManagement';
import { WebsiteDemo } from './components/WebsiteDemo';
import { LoginPage } from './components/LoginPage';
import { RegistrationSteps } from './components/RegistrationSteps';
import { BannersManagement } from './components/BannersManagement';
import { FAQsManagement } from './components/FAQsManagement';
import { TestimonialsManagement } from './components/TestimonialsManagement';
import { CreateSubscriptionPlan } from './components/CreateSubscriptionPlan';
import { EditSubscriptionPlan } from './components/EditSubscriptionPlan';
import { ResetPassword } from './components/ResetPassword';
import { StartupIdeasManagement } from './components/StartupIdeasManagement';
import { StartupCategories } from './components/StartupCategories';
import { StartupIdeaDetail } from './components/StartupIdeaDetail';
import { StartupIdeaLegalSection } from './components/StartupIdeaLegalSection';



export default function App() {
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    // Check for token and user in URL (for cross-origin redirection from Website)
    const params = new URLSearchParams(window.location.search);
    const urlToken = params.get('token');
    const urlUser = params.get('user');

    if (urlToken && urlUser) {
      localStorage.setItem('token', urlToken);
      localStorage.setItem('user', decodeURIComponent(urlUser));
      // Clear the query parameters from the URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    const checkAuth = () => {
      const path = window.location.pathname;
      if (path.startsWith('/reset-password/')) {
        const token = path.split('/').pop() || null;
        setResetToken(token);
        setCurrentPage('reset-password');
        setIsAuthorized(false); // Force unauthorized view to show ResetPassword if on that path
        return;
      }

      const userStr = localStorage.getItem('user');
      const token = localStorage.getItem('token');

      if (userStr && token) {
        try {
          const user = JSON.parse(userStr);
          if (user.roles?.includes('admin')) {
            setIsAuthorized(true);
          } else {
            setIsAuthorized(false);
          }
        } catch (e) {
          setIsAuthorized(false);
        }
      } else {
        setIsAuthorized(false);
      }
    };

    checkAuth();
  }, []);

  const handleLoginSuccess = (token: string, user: any) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    setIsAuthorized(true);
  };

  // URL Mapping Configuration
  const PAGE_URLS: Record<string, string> = {
    'dashboard': '/',
    'users': '/users',
    'verification': '/verification',
    'suspended': '/suspended-users',
    'projects': '/projects',
    'pending-approvals': '/pending-approvals',
    'proposals': '/proposals',
    'gigs': '/gigs',
    'gig-orders': '/gig-orders',
    'gig-approvals': '/gig-approvals',
    'subscriptions': '/subscriptions',
    'create-subscription-plan': '/subscriptions/create',
    'edit-subscription-plan': '/subscriptions/edit',
    'payments': '/payments',
    'withdraw-requests': '/withdraw-requests',
    'commission': '/commission-settings',
    'refunds': '/refunds',
    'payment-methods': '/payment-methods',
    'disputes': '/disputes',
    'resolved-disputes': '/resolved-disputes',
    'pages': '/pages',
    'contact-messages': '/contact-messages',
    'menus': '/menus',
    'banners': '/banners',
    'faqs': '/faqs',
    'testimonials': '/testimonials',
    'global-settings': '/global-settings',
    'email-settings': '/email-settings',
    'registration-steps': '/registrationflow', // Specific user request
    'categories': '/categories',
    'skills': '/skills',
    'tags': '/tags',
    'languages': '/languages',
    'analytics': '/analytics',
    'website-demo': '/website-demo',
    'admin-profile': '/admin-profile',
    'startup-ideas': '/startup-ideas',
    'startup-categories': '/startup-categories',
    'startup-ideas-faq': '/startup-ideas/faq',
    'startup-ideas-terms': '/startup-ideas/terms',
    'startup-ideas-privacy': '/startup-ideas/privacy'
  };

  const getPageFromUrl = () => {
    const path = window.location.pathname;
    if (path.startsWith('/reset-password/')) {
      return 'reset-password';
    }
    // Find key where value matches path
    const page = Object.keys(PAGE_URLS).find(key => PAGE_URLS[key] === path);
    return page || 'dashboard';
  };

  const [darkMode, setDarkMode] = useState(true);
  const [currentPage, setCurrentPage] = useState(getPageFromUrl());
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [selectedSubscriptionId, setSelectedSubscriptionId] = useState<string | null>(null);
  const [selectedDisputeId, setSelectedDisputeId] = useState<string | null>(null);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [selectedStartupIdeaId, setSelectedStartupIdeaId] = useState<string | null>(null);
  const [showAddUser, setShowAddUser] = useState(false);
  const [resetToken, setResetToken] = useState<string | null>(() => {
    const path = window.location.pathname;
    return path.startsWith('/reset-password/') ? path.split('/').pop() || null : null;
  });

  // Handle browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPage(getPageFromUrl());
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
    setSelectedUserId(null);
    setSelectedProjectId(null);
    setSelectedSubscriptionId(null);
    setSelectedDisputeId(null);
    setSelectedOrderId(null);
    setSelectedStartupIdeaId(null);
    setShowAddUser(false);

    // Update URL
    const url = PAGE_URLS[page] || '/';
    window.history.pushState({ page }, '', url);
  };

  const renderPage = () => {
    // Add User Page
    if (showAddUser) {
      return <AddUser onNavigate={handleNavigate} onBack={() => setShowAddUser(false)} />;
    }

    // Detail Pages
    if (selectedUserId) {
      return <UserProfile userId={selectedUserId} onBack={() => setSelectedUserId(null)} />;
    }

    if (selectedProjectId) {
      return <ProjectDetails projectId={selectedProjectId} onBack={() => setSelectedProjectId(null)} />;
    }

    if (selectedDisputeId) {
      return <DisputeDetails disputeId={selectedDisputeId} onBack={() => setSelectedDisputeId(null)} />;
    }

    if (selectedSubscriptionId) {
      return <EditSubscriptionPlan planId={selectedSubscriptionId} onBack={() => setSelectedSubscriptionId(null)} />;
    }

    if (selectedOrderId) {
      return <GigOrderDetails orderId={selectedOrderId} onBack={() => setSelectedOrderId(null)} onNavigate={handleNavigate} />;
    }

    if (selectedStartupIdeaId) {
      return <StartupIdeaDetail ideaId={selectedStartupIdeaId} onBack={() => setSelectedStartupIdeaId(null)} />;
    }

    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;

      // Users & Verification
      case 'users':
        return <UsersList onSelectUser={setSelectedUserId} onAddUser={() => setShowAddUser(true)} />;
      case 'verification':
        return <UsersList viewType="verification" onSelectUser={setSelectedUserId} onAddUser={() => setShowAddUser(true)} />;
      case 'suspended':
        return <UsersList viewType="suspended" onSelectUser={setSelectedUserId} onAddUser={() => setShowAddUser(true)} />;

      // Projects
      case 'projects':
        return <ProjectsList onSelectProject={setSelectedProjectId} />;
      case 'pending-approvals':
        return <ProjectsList onSelectProject={setSelectedProjectId} />;
      case 'proposals':
        return <ProjectsList onSelectProject={setSelectedProjectId} />;

      // Gigs
      case 'gigs':
        return <GigsList />;
      case 'gig-orders':
        return <GigOrders onSelectOrder={setSelectedOrderId} />;
      case 'gig-approvals':
        return <GigsList />;

      // Startup Ideas
      case 'startup-ideas':
        return <StartupIdeasManagement onSelectIdea={setSelectedStartupIdeaId} />;
      case 'startup-categories':
        return <StartupCategories />;
      case 'startup-ideas-faq':
        return <StartupIdeaLegalSection type="faq" />;
      case 'startup-ideas-terms':
        return <StartupIdeaLegalSection type="terms" />;
      case 'startup-ideas-privacy':
        return <StartupIdeaLegalSection type="privacy" />;

      // Subscriptions
      case 'subscriptions':
        return <SubscriptionsManagement onNavigate={handleNavigate} onEditPlan={(id) => setSelectedSubscriptionId(id)} />;
      case 'create-subscription-plan':
        return <CreateSubscriptionPlan onBack={() => handleNavigate('subscriptions')} onNavigate={handleNavigate} />;

      // Transactions & Wallet
      case 'payments':
        return <PaymentsOverview />;
      case 'withdraw-requests':
        return <WithdrawRequests />;
      case 'commission':
        return <CommissionSettings />;
      case 'refunds':
        return <PaymentsOverview />;
      case 'payment-methods':
        return <PaymentMethods onNavigate={handleNavigate} />;

      // Disputes
      case 'disputes':
        return <DisputesList onSelectDispute={setSelectedDisputeId} />;
      case 'resolved-disputes':
        return <DisputesList onSelectDispute={setSelectedDisputeId} />;

      // Content & Site
      case 'pages':
        return <PagesManagement />;
      case 'contact-messages':
        return <ContactMessages />;
      case 'menus':
        return <MenusManagement onNavigate={handleNavigate} />;
      case 'banners':
        return <BannersManagement />;
      case 'faqs':
        return <FAQsManagement />;
      case 'testimonials':
        return <TestimonialsManagement />;
      case 'global-settings':
        return <GlobalSettings onNavigate={handleNavigate} />;
      case 'email-settings':
        return <EmailSettings onNavigate={handleNavigate} />;
      case 'registration-steps':
        return <RegistrationSteps />;


      // Taxonomies
      case 'categories':
        return <Categories />;
      case 'skills':
        return <Skills />;
      case 'tags':
        return <Skills />;
      case 'languages':
        return <Languages onNavigate={handleNavigate} />;

      // Reports & Analytics
      case 'analytics':
        return <Analytics />;

      // Website Demo
      case 'website-demo':
        return <WebsiteDemo />;

      // Admin Profile
      case 'admin-profile':
        return <AdminProfile />;

      default:
        return <Dashboard />;
    }
  };

  // Handle Dark Mode
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  return (
    <div>
      <Toaster position="top-right" richColors />

      {isAuthorized === null ? (
        <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-white">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F24C20] mx-auto mb-4"></div>
            <p className="text-gray-400">Verifying Admin Session...</p>
          </div>
        </div>
      ) : isAuthorized === false ? (
        currentPage === 'reset-password' && resetToken ? (
          <ResetPassword
            token={resetToken}
            onResetSuccess={() => {
              setResetToken(null);
              setCurrentPage('dashboard');
              window.history.replaceState({}, '', '/');
            }}
          />
        ) : (
          <LoginPage onLoginSuccess={handleLoginSuccess} />
        )
      ) : (
        <AdminLayout
          darkMode={darkMode}
          onToggleDarkMode={() => setDarkMode(!darkMode)}
          currentPage={currentPage}
          onNavigate={handleNavigate}
        >
          {renderPage()}
        </AdminLayout>
      )}
    </div>
  );
}
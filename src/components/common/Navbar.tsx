import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  LogOut, 
  Settings, 
  CreditCard, 
  PenTool,
  Home,
  FileText,
  Layout,
  TrendingUp,
  Search,
  Users,
  BarChart3,
  ChevronDown,
  ChevronRight,
  Plus,
  BookOpen,
  Target,
  Crown,
  Bell,
  HelpCircle,
  ExternalLink,
  Menu,
  X
} from 'lucide-react';
import { RootState } from '../../store';
import { logout } from '../../store/authSlice';
import NotificationBell from './NotificationBell';
import { PaymentDashboard } from '../payments/PaymentDashboard';

interface NavbarProps {}

export const Navbar: React.FC<NavbarProps> = () => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showPaymentDashboard, setShowPaymentDashboard] = useState(false);
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isMobileMenuOpen) {
        const target = event.target as Element;
        if (!target.closest('.mobile-menu-container')) {
          setIsMobileMenuOpen(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobileMenuOpen]);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
    setIsMobileMenuOpen(false);
  };

  const profileMenuItems = [
    { label: 'Profile Settings', icon: Settings, path: '/app/profile' },
    { label: 'Payment History', icon: CreditCard, onClick: () => setShowPaymentDashboard(true) },
  ];

  if (user?.is_admin) {
    profileMenuItems.push({ label: 'Admin Dashboard', icon: User, path: '/admin' });
  }

  // Navigation structure
  const navigationItems = [
    {
      label: 'Dashboard',
      path: '/app/dashboard',
      icon: Home,
      description: 'Overview and analytics'
    },
    {
      label: 'Templates',
      icon: Layout,
      path: '/app/templates',
      description: 'Professional resume templates'
    },
    {
      label: 'Cover Letters',
      icon: BookOpen,
      path: '/app/cover-letters',
      description: 'Create compelling cover letters'
    },
    {
      label: 'Market Insights',
      icon: TrendingUp,
      path: '/app/market-insights',
      description: 'Industry trends and skills'
    },
    {
      label: 'Job Search',
      icon: Target,
      path: '/app/real-jobs',
      description: 'Find real job opportunities'
    },
    {
      label: 'Payments',
      icon: CreditCard,
      path: '/app/payments',
      description: 'Payment history and receipts'
    },
    {
      label: 'Profile',
      icon: User,
      path: '/app/profile',
      description: 'Manage your profile and settings'
    }
  ];

  const adminItems = [
    {
      label: 'Admin Dashboard',
      icon: BarChart3,
      path: '/admin',
      description: 'System overview and analytics'
    },
    {
      label: 'User Management',
      icon: Users,
      path: '/admin/users',
      description: 'Manage user accounts'
    },
    {
      label: 'Templates',
      icon: Layout,
      path: '/admin/templates',
      description: 'Template management'
    },
    {
      label: 'Market Data',
      icon: TrendingUp,
      path: '/admin/market-data',
      description: 'Skill demand analytics'
    }
  ];

  const handleDropdownToggle = (label: string) => {
    setActiveDropdown(activeDropdown === label ? null : label);
  };

  const closeAllDropdowns = () => {
    setActiveDropdown(null);
    setIsProfileOpen(false);
  };

  const isActiveRoute = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled 
        ? 'bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-lg' 
        : 'bg-white border-b border-gray-200'
    }`}>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3" onClick={closeAllDropdowns}>
            <div className="relative">
              <PenTool className="h-8 w-8 text-blue-600" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-orange-400 to-pink-500 rounded-full animate-pulse"></div>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                ProWrite
              </span>
              <span className="text-xs text-gray-500 -mt-1 hidden sm:block">AI Resume Builder</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          {isAuthenticated && (
            <div className="hidden xl:flex items-center space-x-1">
              {navigationItems.map((item) => (
                <div key={item.label} className="relative">
                  {item.items ? (
                    // Dropdown menu
                    <div className="relative">
                      <button
                        onClick={() => handleDropdownToggle(item.label)}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                          activeDropdown === item.label
                            ? 'text-blue-600 bg-blue-50 border border-blue-200'
                            : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                        }`}
                      >
                        <item.icon className="h-4 w-4" />
                        <span>{item.label}</span>
                        <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${
                          activeDropdown === item.label ? 'rotate-180' : ''
                        }`} />
                      </button>

                      <AnimatePresence>
                        {activeDropdown === item.label && (
                          <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            transition={{ duration: 0.15 }}
                            className="absolute top-full left-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-200 py-3 z-50"
                          >
                            {item.items?.map((subItem) => (
                              <Link
                                key={subItem.path}
                                to={subItem.path}
                                onClick={closeAllDropdowns}
                                className="flex items-center space-x-3 px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all duration-200 group"
                              >
                                <div className="p-2 rounded-lg bg-gray-100 group-hover:bg-blue-100 transition-colors">
                                  <subItem.icon className="h-4 w-4" />
                                </div>
                                <div className="flex-1">
                                  <div className="font-medium">{subItem.label}</div>
                                  <div className="text-xs text-gray-500">{subItem.description}</div>
                                </div>
                                <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
                              </Link>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ) : (
                    // Single link
                    <Link
                      to={item.path!}
                      onClick={closeAllDropdowns}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                        isActiveRoute(item.path!)
                          ? 'text-blue-600 bg-blue-50 border border-blue-200'
                          : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                      }`}
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </Link>
                  )}
                </div>
              ))}

              {/* Admin Section */}
              {user?.is_admin && (
                <div className="relative ml-4 pl-4 border-l border-gray-200">
                  <button
                    onClick={() => handleDropdownToggle('admin')}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                      activeDropdown === 'admin'
                        ? 'text-amber-600 bg-amber-50 border border-amber-200'
                        : 'text-gray-700 hover:text-amber-600 hover:bg-amber-50'
                    }`}
                  >
                    <Crown className="h-4 w-4" />
                    <span>Admin</span>
                    <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${
                      activeDropdown === 'admin' ? 'rotate-180' : ''
                    }`} />
                  </button>

                  <AnimatePresence>
                    {activeDropdown === 'admin' && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute top-full right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-200 py-3 z-50"
                      >
                        {adminItems.map((adminItem) => (
                          <Link
                            key={adminItem.path}
                            to={adminItem.path}
                            onClick={closeAllDropdowns}
                            className="flex items-center space-x-3 px-4 py-3 text-sm text-gray-700 hover:bg-amber-50 hover:text-amber-600 transition-all duration-200 group"
                          >
                            <div className="p-2 rounded-lg bg-gray-100 group-hover:bg-amber-100 transition-colors">
                              <adminItem.icon className="h-4 w-4" />
                            </div>
                            <div className="flex-1">
                              <div className="font-medium">{adminItem.label}</div>
                              <div className="text-xs text-gray-500">{adminItem.description}</div>
                            </div>
                            <ExternalLink className="h-4 w-4 text-gray-400 group-hover:text-amber-500 transition-colors" />
                          </Link>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>
          )}

          {/* Right side */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {isAuthenticated ? (
              <>
                {/* Desktop Quick Actions */}
                <div className="hidden lg:flex items-center space-x-2">
                  <NotificationBell 
                    userId={user?.id || 0}
                    className="relative"
                    showCount={true}
                    maxNotifications={10}
                    autoMarkAsRead={false}
                    onNotificationClick={(notification) => {
                      console.log('Notification clicked:', notification);
                    }}
                  />
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                  >
                    <HelpCircle className="h-5 w-5 text-gray-600" />
                  </motion.button>
                </div>

                {/* Mobile Menu Button */}
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="xl:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                >
                  {isMobileMenuOpen ? (
                    <X className="h-6 w-6 text-gray-600" />
                  ) : (
                    <Menu className="h-6 w-6 text-gray-600" />
                  )}
                </button>
                
                {/* Profile Menu */}
                <div className="relative">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                  >
                    <div className="relative">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-medium">
                          {user?.firstName?.[0]?.toUpperCase()}
                        </span>
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                    </div>
                    <span className="hidden sm:block text-sm font-medium text-gray-700">
                      {user?.firstName}
                    </span>
                  </motion.button>

                  {/* Profile Dropdown */}
                  <AnimatePresence>
                    {isProfileOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-200 py-3 z-50"
                      >
                        {/* User Info */}
                        <div className="px-4 py-3 border-b border-gray-100">
                          <div className="font-medium text-gray-900">{user?.firstName} {user?.lastName}</div>
                          <div className="text-sm text-gray-500">{user?.email}</div>
                          {user?.is_admin && (
                            <div className="inline-flex items-center mt-2 px-2 py-1 bg-amber-100 text-amber-800 text-xs font-medium rounded-full">
                              <Crown className="h-3 w-3 mr-1" />
                              Admin
                            </div>
                          )}
                        </div>

                        {/* Menu Items */}
                        {profileMenuItems.map((item) => (
                          item.onClick ? (
                            <button
                              key={item.label}
                              onClick={() => {
                                item.onClick?.();
                                setIsProfileOpen(false);
                              }}
                              className="flex items-center space-x-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200 w-full text-left"
                            >
                              <item.icon className="h-4 w-4" />
                              <span>{item.label}</span>
                            </button>
                          ) : (
                            <Link
                              key={item.label}
                              to={item.path}
                              onClick={() => setIsProfileOpen(false)}
                              className="flex items-center space-x-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                            >
                              <item.icon className="h-4 w-4" />
                              <span>{item.label}</span>
                            </Link>
                          )
                        ))}
                        
                        <div className="border-t border-gray-100 my-2"></div>
                        
                        <button
                          onClick={() => {
                            setIsProfileOpen(false);
                            handleLogout();
                          }}
                          className="w-full flex items-center space-x-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200"
                        >
                          <LogOut className="h-4 w-4" />
                          <span>Sign Out</span>
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-2 sm:space-x-4">
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-blue-600 transition-colors duration-200 font-medium text-sm sm:text-base"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 text-sm sm:text-base shadow-lg hover:shadow-xl"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && isAuthenticated && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="xl:hidden mobile-menu-container"
            >
              <div className="py-4 border-t border-gray-200 bg-white">
                {/* Mobile Quick Actions */}
                <div className="px-4 pb-4 border-b border-gray-100">
                  <div className="flex items-center space-x-2 mb-4">
                    <NotificationBell 
                      userId={user?.id || 0}
                      className="relative"
                      showCount={true}
                      maxNotifications={10}
                      autoMarkAsRead={false}
                      onNotificationClick={(notification) => {
                        console.log('Notification clicked:', notification);
                      }}
                    />
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                    >
                      <HelpCircle className="h-5 w-5 text-gray-600" />
                    </motion.button>
                  </div>
                </div>

                {/* Mobile Navigation Items */}
                <div className="px-4 py-2">
                  {navigationItems.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path!}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 mb-1 ${
                        isActiveRoute(item.path!)
                          ? 'text-blue-600 bg-blue-50 border border-blue-200'
                          : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                      }`}
                    >
                      <item.icon className="h-5 w-5" />
                      <div className="flex-1">
                        <div className="font-medium">{item.label}</div>
                        <div className="text-xs text-gray-500">{item.description}</div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-gray-400" />
                    </Link>
                  ))}
                </div>

                {/* Mobile Admin Section */}
                {user?.is_admin && (
                  <div className="px-4 py-2 border-t border-gray-100">
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-4">
                      Admin
                    </div>
                    {adminItems.map((adminItem) => (
                      <Link
                        key={adminItem.path}
                        to={adminItem.path}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-700 hover:text-amber-600 hover:bg-amber-50 transition-all duration-200 mb-1"
                      >
                        <adminItem.icon className="h-5 w-5" />
                        <div className="flex-1">
                          <div className="font-medium">{adminItem.label}</div>
                          <div className="text-xs text-gray-500">{adminItem.description}</div>
                        </div>
                        <ExternalLink className="h-4 w-4 text-gray-400" />
                      </Link>
                    ))}
                  </div>
                )}

                {/* Mobile Logout */}
                <div className="px-4 py-2 border-t border-gray-100">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                  >
                    <LogOut className="h-5 w-5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Payment Dashboard Modal */}
      <PaymentDashboard
        isOpen={showPaymentDashboard}
        onClose={() => setShowPaymentDashboard(false)}
      />
    </nav>
  );
};
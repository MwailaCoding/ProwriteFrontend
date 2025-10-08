import React from 'react';
import { NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import {
  Home,
  FileText,
  Layout,
  TrendingUp,
  CreditCard,
  Users,
  BarChart3,
  Settings,
  Search,
  X
} from 'lucide-react';
import { RootState } from '../../store';

const sidebarVariants = {
  hidden: { x: -264 },
  visible: { x: 0, transition: { type: 'spring', damping: 20 } }
};

interface SidebarProps {
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onClose }) => {
  const { user } = useSelector((state: RootState) => state.auth);

  const userNavItems = [
    { path: '/app/dashboard', icon: Home, label: 'Dashboard' },
    
    { path: '/app/resumes', icon: FileText, label: 'My Resumes' },
    { path: '/app/cover-letters', icon: FileText, label: 'Cover Letters' },
    { path: '/app/templates', icon: Layout, label: 'Templates' },
    { path: '/app/market-insights', icon: TrendingUp, label: 'Market Insights' },
    { path: '/app/real-jobs', icon: Search, label: 'Real Job Search' },
    { path: '/app/billing', icon: CreditCard, label: 'Billing' },
    { path: '/app/payments', icon: CreditCard, label: 'Payment History' },
  ];

  const adminNavItems = [
    { path: '/admin', icon: BarChart3, label: 'Admin Dashboard' },
    { path: '/admin/users', icon: Users, label: 'User Management' },
    { path: '/admin/templates', icon: Layout, label: 'Templates' },
    { path: '/admin/market-data', icon: TrendingUp, label: 'Market Data' },
  ];

  const navItems = user?.isAdmin ? [...userNavItems, ...adminNavItems] : userNavItems;

  return (
    <motion.aside
      variants={sidebarVariants}
      initial="hidden"
      animate="visible"
      className="h-full w-64 bg-white border-r border-gray-200 overflow-y-auto z-30"
    >
      {/* Mobile Close Button */}
      {onClose && (
        <div className="lg:hidden flex justify-end p-4 border-b border-gray-200">
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
          >
            <X className="h-5 w-5 text-gray-600" />
          </button>
        </div>
      )}
      
      <nav className="p-4 space-y-1">
        {user?.isAdmin && (
          <div className="mb-6">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-3">
              User Section
            </h3>
            {userNavItems.map((item) => (
              <NavItem key={item.path} {...item} onClose={onClose} />
            ))}
          </div>
        )}

        {user?.isAdmin && (
          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-3">
              Admin Section
            </h3>
            {adminNavItems.map((item) => (
              <NavItem key={item.path} {...item} onClose={onClose} />
            ))}
          </div>
        )}

        {!user?.isAdmin && navItems.map((item) => (
          <NavItem key={item.path} {...item} onClose={onClose} />
        ))}
      </nav>
    </motion.aside>
  );
};

interface NavItemProps {
  path: string;
  icon: React.ElementType;
  label: string;
  onClose?: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ path, icon: Icon, label, onClose }) => {
  return (
    <NavLink
      to={path}
      onClick={onClose}
      className={({ isActive }) =>
        `flex items-center space-x-3 px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
          isActive
            ? 'bg-sunset-50 text-sunset-700 border-r-2 border-sunset-700'
            : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
        }`
      }
    >
      <Icon className="h-5 w-5 flex-shrink-0" />
      <span className="truncate">{label}</span>
    </NavLink>
  );
};
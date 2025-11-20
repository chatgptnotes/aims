import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Bell,
  Search,
  LogOut,
  Home,
  Building2,
  FileSpreadsheet,
  CreditCard,
  PieChart,
  Monitor,
  Cog,
  UserCheck,
  Activity,
  TrendingUp,
  Menu,
  X
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import ThemeToggle from './ThemeToggle';
import ProfileModal from './ProfileModal';

const DashboardLayout = ({ children, title = 'Dashboard' }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
  };

  // Define navigation items based on user role
  const getNavigationItems = () => {
    if (user?.role === 'super_admin') {
      return [
        { id: 'dashboard', label: 'Dashboard', icon: Home, path: '/admin' },
        { id: 'clinics', label: 'Clinic Management', icon: Building2, path: '/admin/clinics' },
        { id: 'reports', label: 'Patient Reports', icon: FileSpreadsheet, path: '/admin/reports' },
        { id: 'payments', label: 'Payment History', icon: CreditCard, path: '/admin/payments' },
        { id: 'analytics', label: 'Analytics', icon: PieChart, path: '/admin/analytics' },
        { id: 'alerts', label: 'Alerts & Monitoring', icon: Monitor, path: '/admin/alerts' },
        { id: 'settings', label: 'System Settings', icon: Cog, path: '/admin/settings' }
      ];
    } else if (user?.role === 'clinic_admin') {
      return [
        { id: 'overview', label: 'Dashboard', icon: Home, path: '/clinic' },
        { id: 'patients', label: 'Patient Management', icon: UserCheck, path: '/clinic/patients' },
        { id: 'reports', label: 'Reports & Files', icon: FileSpreadsheet, path: '/clinic/reports' },
        { id: 'subscription', label: 'Subscription', icon: CreditCard, path: '/clinic/subscription' },
        { id: 'usage', label: 'Usage Tracking', icon: TrendingUp, path: '/clinic/usage' }
      ];
    } else {
      return [
        { id: 'dashboard', label: 'Dashboard', icon: Home, path: '/dashboard' },
        { id: 'profile', label: 'Profile', icon: UserCheck, path: '/dashboard/profile' },
        { id: 'activity', label: 'Activity', icon: Activity, path: '/dashboard/activity' },
        { id: 'notifications', label: 'Notifications', icon: Bell, path: '/dashboard/notifications' },
        { id: 'settings', label: 'Settings', icon: Cog, path: '/dashboard/settings' }
      ];
    }
  };

  const navigationItems = getNavigationItems();

  const isActive = (path) => {
    try {
      return location.pathname === path;
    } catch (error) {
      console.warn('Error checking active path:', error);
      return false;
    }
  };

  const getProfileInitial = () => {
    try {
      if (user?.role === 'super_admin' && user?.clinicName) {
        return user.clinicName.charAt(0).toUpperCase();
      }
      if (user?.role === 'clinic_admin' && user?.clinicName) {
        return user.clinicName.charAt(0).toUpperCase();
      }
      if (user?.role === 'super_admin' && user?.name) {
        return user.name.charAt(0).toUpperCase();
      }
      if (user?.name && typeof user.name === 'string' && user.name.length > 0) {
        return user.name.charAt(0).toUpperCase();
      }
      return 'U';
    } catch (error) {
      console.error('Error getting profile initial:', error, user);
      return 'U';
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header with Navigation */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        {/* Top Bar */}
        <div className="flex items-center justify-between h-16 px-4 lg:px-6">
          {/* Left: Logo + Title */}
          <div className="flex items-center space-x-4">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

            {/* Logo */}
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              </div>
              <span className="text-white dark:text-white font-bold text-base hidden sm:block text-gray-900">NeuroSense360</span>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-1 ml-4">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);

                return (
                  <Link
                    key={item.id}
                    to={item.path}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      active
                        ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-200'
                    }`}
                    title={item.label}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="hidden xl:block">{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right: Search, Theme, Notifications, Profile, Logout */}
          <div className="flex items-center space-x-2">
            {/* Search Bar */}
            <div className="hidden md:flex relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400 dark:text-gray-500" />
              </div>
              <input
                type="text"
                placeholder="Search..."
                className="block w-48 xl:w-72 pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm placeholder-gray-400 dark:placeholder-gray-500 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent bg-gray-50 dark:bg-gray-700"
              />
            </div>

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Notifications */}
            <button className="relative p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 block h-2 w-2 bg-red-500 rounded-full ring-2 ring-white dark:ring-gray-800"></span>
            </button>

            {/* User Avatar */}
            <button
              onClick={() => setIsProfileModalOpen(true)}
              className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt="Profile"
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  getProfileInitial()
                )}
              </div>
              <div className="hidden xl:block text-left">
                <p className="text-sm font-medium text-gray-900 dark:text-white">{user?.name || 'User'}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email}</p>
              </div>
            </button>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="p-2 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title="Logout"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <nav className="px-4 py-2 space-y-1">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);

                return (
                  <Link
                    key={item.id}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      active
                        ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-900">
        <div className="p-6 lg:p-8 max-w-[1600px] mx-auto">
          {children}
        </div>
      </main>

      {/* Profile Modal */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />
    </div>
  );
};

export default DashboardLayout;